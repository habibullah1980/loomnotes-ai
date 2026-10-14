import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeChatInput } from "@/lib/support/rate-limiter";
import {
  searchKnowledgeBase,
  buildGroundedKnowledgeContext,
  KnowledgeArticle,
} from "@/lib/support/knowledge-base";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  // 1. Identify client for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const { allowed, retryAfterSeconds } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Rate limit reached. Please wait ${retryAfterSeconds} seconds before sending another message.`,
        retryAfter: retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  // 2. Parse request body safely
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  // 3. Sanitize input
  const inputCheck = sanitizeChatInput(body.message);
  if (!inputCheck.isValid) {
    return NextResponse.json(
      {
        reply: inputCheck.rejectionReason || "Invalid message format.",
        status: inputCheck.isSecuritySensitive ? "security_warning" : "error",
      },
      { status: 200 }
    );
  }

  const userQuery = inputCheck.sanitizedText;
  const matchedArticles = searchKnowledgeBase(userQuery);

  // Suggested follow-ups based on match or general topics
  const defaultFollowUps = [
    "How do I merge or split PDFs?",
    "How to use the video compressor?",
    "How does NDA signing work?",
    "What are the Free vs Pro plan limits?",
    "How do I contact customer support?",
  ];

  const suggestedFollowUps = matchedArticles.length > 0
    ? matchedArticles.slice(0, 3).map((a) => a.title)
    : defaultFollowUps.slice(0, 3);

  // 4. Check for Google Gemini API key
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    // If credentials missing: show configuration status and return grounded knowledge article
    const bestMatch = matchedArticles[0];
    const replyText = formatFallbackResponse(userQuery, bestMatch, true);

    return NextResponse.json({
      reply: replyText,
      suggestedFollowUps,
      toolLink: bestMatch?.link?.url || "/dashboard",
      status: "config_notice",
    });
  }

  // 5. Query Google Gemini with strict grounding
  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const knowledgeContext = buildGroundedKnowledgeContext();

    const systemInstruction = `
You are the FreePDFKit Customer Support Assistant. Your job is to help users navigate FreePDFKit (also known as pdfkitfree), its PDF tools, video compressor, NDA signing, AI document chat, accounts, and pricing.

CRITICAL OPERATIONAL RULES:
1. STRICT GROUNDING: Answer questions based ONLY on the approved FreePDFKit Knowledge Base below. Do NOT invent features, prices, file size limits, or refund timelines.
2. HONEST LIMITATIONS: If a feature is not supported or not mentioned in the documentation, state this honestly. Never pretend a feature exists.
3. HELPFUL NAVIGATION: Provide clickable Markdown links to relevant routes:
   - Dashboard & Workspace: [Workspace](/dashboard)
   - New Meeting & AI Analysis: [New Analysis](/dashboard/new)
   - Client & NDA Dossier: [Clients](/clients)
   - Account Settings & Billing: [Settings](/settings)
   - Signup: [Sign Up](/signup)
   - Login: [Log In](/login)
   - Pricing: [Pricing](/pricing)
   - Privacy Policy: [Privacy Policy](/privacy)
   - Terms of Service: [Terms of Service](/terms)
4. NO SENSITIVE DATA: Never ask for or store passwords, OTPs, verification codes, or credit card details.
5. NO UNAUTHORIZED ACTIONS: You cannot directly modify user account tiers, execute refunds, or sign legal documents yourself. Explain how the user can perform these actions in their dashboard or contact support@pdfkitfree.com.
6. CONCISE & EMPATHETIC: Keep responses friendly, clear, and structured with bullet points.

APPROVED FREEPDFKIT KNOWLEDGE BASE:
${knowledgeContext}
`.trim();

    // Prepare message history
    const conversationHistory = (body.history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const fullPrompt = conversationHistory
      ? `${conversationHistory}\nUser: ${userQuery}\nAssistant:`
      : `User Question: ${userQuery}\nAssistant:`;

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\n${fullPrompt}` }],
        },
      ],
    });

    const reply = response.text?.trim() || "";

    if (!reply) {
      throw new Error("Empty response from AI provider.");
    }

    return NextResponse.json({
      reply,
      suggestedFollowUps,
      toolLink: matchedArticles[0]?.link?.url || "/dashboard",
      status: "ai",
    });
  } catch (error: any) {
    console.error("Gemini Support Chat Error, falling back to Knowledge Engine:", error?.message);

    // Graceful fallback to verified Knowledge Engine
    const bestMatch = matchedArticles[0];
    const replyText = formatFallbackResponse(userQuery, bestMatch, false);

    return NextResponse.json({
      reply: replyText,
      suggestedFollowUps,
      toolLink: bestMatch?.link?.url || "/dashboard",
      status: "knowledge_fallback",
    });
  }
}

/**
 * Generates a helpful deterministic response when AI is offline or key is unconfigured.
 */
function formatFallbackResponse(
  query: string,
  article?: KnowledgeArticle,
  isMissingKey: boolean = false
): string {
  const prefix = isMissingKey
    ? "*(Note: FreePDFKit AI is operating in Knowledge Mode — Server API Key not configured)*\n\n"
    : "";

  if (article) {
    let text = `${prefix}### ${article.title}\n\n${article.summary}\n\n`;
    if (article.steps && article.steps.length > 0) {
      text += "**Quick Steps:**\n";
      article.steps.forEach((step, idx) => {
        text += `${idx + 1}. ${step}\n`;
      });
      text += "\n";
    }
    if (article.link) {
      text += `👉 [${article.link.label}](${article.link.url})\n\n`;
    }
    text += "Need further assistance? Email our support team directly at **support@pdfkitfree.com**.";
    return text;
  }

  return `${prefix}Thank you for contacting FreePDFKit Support! We can help you with:
- **PDF Tools**: Merge, Split, Compress, Convert, Edit, and Protect PDFs
- **Video Compressor**: Compress large MP4 and WebM videos
- **NDA Signing**: Generate, upload, and e-sign mutual NDAs
- **Account & Verification**: Free signup, login, and password reset
- **Pricing & Plans**: Early Access Free Tier ($0), Pro ($15/mo), and Business ($39/mo)

You can explore your [Workspace](/dashboard) or contact human support at **support@pdfkitfree.com**.`;
}
