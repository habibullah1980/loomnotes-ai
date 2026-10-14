/**
 * LoomNotesAI Grounded Knowledge Base & Documentation Source
 * Strictly verified against actual LoomNotesAI product features and policies.
 */

export interface KnowledgeArticle {
  id: string;
  topic: string;
  keywords: string[];
  title: string;
  summary: string;
  steps?: string[];
  link?: { label: string; url: string };
  category: "pdf_tools" | "video_compressor" | "nda_signing" | "account" | "ai_chat" | "pricing" | "privacy" | "support";
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "merge-pdf",
    topic: "Merge PDFs",
    keywords: ["merge", "combine", "join", "multiple pdfs", "merge pdf"],
    title: "How to Merge Multiple PDFs into One Document",
    summary:
      "LoomNotesAI allows you to combine multiple PDF files into a single, organized document in seconds. Files are merged in your specified order with page numbers preserved.",
    steps: [
      "Navigate to the PDF Tools section or workspace.",
      "Upload the PDF files you want to combine (drag & drop supported).",
      "Arrange the documents in your preferred sequence.",
      "Click 'Merge PDFs' to generate your merged file and download it instantly.",
    ],
    link: { label: "Go to Workspace", url: "/dashboard" },
    category: "pdf_tools",
  },
  {
    id: "split-pdf",
    topic: "Split PDFs",
    keywords: ["split", "extract pages", "separate", "split pdf"],
    title: "How to Split or Extract Pages from a PDF",
    summary:
      "Extract specific page ranges or split each page into individual PDF files with zero loss of document formatting or text fidelity.",
    steps: [
      "Select your source PDF file.",
      "Choose your split mode: 'Extract Range' (e.g. pages 2-5) or 'Split All Pages'.",
      "Click 'Process Split' and download the individual pages or combined ZIP archive.",
    ],
    link: { label: "Go to Workspace", url: "/dashboard" },
    category: "pdf_tools",
  },
  {
    id: "compress-pdf",
    topic: "Compress PDF",
    keywords: ["compress", "reduce size", "smaller pdf", "file size", "optimize"],
    title: "How to Compress and Optimize PDF Files",
    summary:
      "Reduce PDF file size by up to 85% while maintaining sharp typography and crisp image resolution for email attachments and web upload.",
    steps: [
      "Upload your PDF document.",
      "Select your compression level: 'Recommended' (best balance of quality & size) or 'Extreme' (maximum reduction).",
      "Click 'Compress' to download the optimized PDF.",
    ],
    link: { label: "Go to Workspace", url: "/dashboard" },
    category: "pdf_tools",
  },
  {
    id: "convert-pdf",
    topic: "Convert PDF",
    keywords: ["convert", "pdf to word", "pdf to excel", "pdf to image", "jpg to pdf", "png to pdf", "docx"],
    title: "How to Convert PDFs to Other Formats (and Vice Versa)",
    summary:
      "Convert documents between PDF and popular formats including Word (.docx), Excel (.xlsx), JPG, and PNG with accurate table, layout, and font preservation.",
    steps: [
      "Select the conversion format you need (e.g., PDF to Word or Image to PDF).",
      "Upload your source file.",
      "Review the conversion preview and click 'Convert'.",
      "Download your converted editable file.",
    ],
    link: { label: "Go to Workspace", url: "/dashboard" },
    category: "pdf_tools",
  },
  {
    id: "edit-protect-pdf",
    topic: "Edit & Protect PDFs",
    keywords: ["edit", "protect", "password", "encrypt", "watermark", "annotate"],
    title: "How to Edit, Annotate, and Password-Protect PDFs",
    summary:
      "Add notes, text annotations, watermarks, or apply military-grade 256-bit AES encryption passwords to protect confidential reports.",
    steps: [
      "Upload the document you wish to edit or encrypt.",
      "To protect: enter an encryption password and confirm.",
      "To annotate: use the inline text, highlight, or watermark tools.",
      "Save and download your secured file.",
    ],
    link: { label: "Go to Workspace", url: "/dashboard" },
    category: "pdf_tools",
  },
  {
    id: "video-compressor",
    topic: "Video Compressor",
    keywords: ["video", "video compressor", "compress video", "mp4", "webm", "mov", "shrink video"],
    title: "How to Use the LoomNotesAI Video Compressor",
    summary:
      "Shrink large MP4, WebM, and MOV video recordings so they can be easily emailed, sent on Slack, or shared asynchronously with clients.",
    steps: [
      "Upload your video recording or provide a video share URL.",
      "Choose target file size or resolution preset (720p, 1080p, or custom percentage).",
      "View the live compression progress bar.",
      "Download the compressed video without watermarks.",
    ],
    link: { label: "Go to Video Workspace", url: "/dashboard/new" },
    category: "video_compressor",
  },
  {
    id: "nda-signing",
    topic: "NDA Upload, Generation & Signing",
    keywords: ["nda", "sign", "e-sign", "signature", "non-disclosure", "agreement", "contract"],
    title: "How to Upload, Generate, and Sign NDAs Electronically",
    summary:
      "LoomNotesAI provides seamless electronic signature workflows for non-disclosure agreements and freelance contracts. You can generate standard mutual NDAs or upload existing agreements.",
    steps: [
      "Navigate to your workspace client or documents dashboard.",
      "Choose 'Generate NDA' for a standard mutual agreement, or 'Upload Document' for your custom NDA.",
      "Add signatory fields: Signature, Full Name, Title, and Date.",
      "Draw, type, or upload your electronic signature.",
      "Download the finalized signed PDF complete with digital timestamp audit trail.",
    ],
    link: { label: "Open Client Workspace", url: "/clients" },
    category: "nda_signing",
  },
  {
    id: "account-registration",
    topic: "Account Registration & Verification",
    keywords: ["register", "signup", "verify", "email verification", "create account", "login", "password reset"],
    title: "How to Register and Verify Your LoomNotesAI Account",
    summary:
      "Signing up takes under 60 seconds with no credit card required during early access. We provide secure email & password registration and Google OAuth sign-in.",
    steps: [
      "Visit /signup and enter your name, work email, and a secure password (minimum 6 characters).",
      "Check your inbox for the verification email confirmation link.",
      "Click the verification link to activate full workspace access.",
      "If you ever lose access, use /forgot-password to receive a secure one-time reset link.",
    ],
    link: { label: "Create Free Account", url: "/signup" },
    category: "account",
  },
  {
    id: "ai-document-chat",
    topic: "AI Document & Meeting Intelligence",
    keywords: ["ai chat", "ai document", "gemini", "transcript", "meeting notes", "summarize", "clauses"],
    title: "How to Use AI Document Chat & Meeting Summaries",
    summary:
      "Powered by Google Gemini AI, LoomNotesAI extracts executive summaries, key decisions, concrete action items, and answers natural-language questions about uploaded documents and meeting transcripts.",
    steps: [
      "In the dashboard, open 'New Meeting' or select an existing document.",
      "Paste your meeting transcript or document text.",
      "Click 'Analyze with Gemini AI' to generate structured insights in under 5 seconds.",
      "Track assigned action items and export takeaways to your team.",
    ],
    link: { label: "New AI Analysis", url: "/dashboard/new" },
    category: "ai_chat",
  },
  {
    id: "pricing-plans",
    topic: "Free vs Pro & Business Plans",
    keywords: ["pricing", "cost", "free vs pro", "plans", "subscription", "business", "limits"],
    title: "LoomNotesAI Plans & Pricing Tiers",
    summary:
      "LoomNotesAI offers an unrestricted Early Access Free Tier, with premium Pro and Business tiers available for high-volume consultants and agencies.",
    steps: [
      "Early Access Free Tier ($0/mo): Unlimited AI meeting generations, standard PDF conversions, up to 25MB file size, and community support.",
      "Pro Plan ($15/mo): Priority GPU processing, up to 500MB file size, unlimited e-signatures, batch tools, and dedicated email support.",
      "Business Plan ($39/mo): Multi-user team workspace, centralized billing, audit logs, and custom branding.",
    ],
    link: { label: "View Pricing Section", url: "/#pricing" },
    category: "pricing",
  },
  {
    id: "billing-cancellation",
    topic: "Subscription Management & Cancellation",
    keywords: ["billing", "cancel", "refund", "subscription", "invoices", "payment method", "stripe", "paypal"],
    title: "Subscription Management, Billing & Cancellation Policies",
    summary:
      "You maintain complete control over your subscription. Upgrade, downgrade, or cancel at any time from your Account Settings with zero penalties.",
    steps: [
      "Visit /settings and open the 'Billing & Invoices' tab.",
      "View your current billing period, download past PDF invoices, or update payment cards.",
      "To cancel: click 'Cancel Subscription'. Your access continues until the current billing period expires.",
      "Refund policy: We offer a 7-day money-back guarantee for first-time purchases by contacting support@loomnotes.ai.",
    ],
    link: { label: "Manage Settings", url: "/settings" },
    category: "pricing",
  },
  {
    id: "privacy-security",
    topic: "Privacy, File Retention & Data Security",
    keywords: ["privacy", "security", "gdpr", "retention", "tls", "encryption", "rls", "is my data safe"],
    title: "Privacy, File Processing & Data Security Standards",
    summary:
      "Your documents are private to you. LoomNotesAI uses TLS 1.3 encryption in transit, encrypted storage at rest, and strict PostgreSQL Row Level Security (RLS) to ensure cross-user data isolation.",
    steps: [
      "Private by Default: We never use your private documents, NDAs, or transcripts to train public AI models.",
      "Data Retention: Uploaded processing files are automatically cleared after conversion unless saved to your personal workspace.",
      "Complete Deletion: You can permanently delete any document, meeting, or client file at any time.",
    ],
    link: { label: "Read Privacy Policy", url: "/privacy" },
    category: "privacy",
  },
  {
    id: "contact-support",
    topic: "Contact Customer Support",
    keywords: ["support", "help", "contact", "email support", "human", "talk to human", "ticket", "issue"],
    title: "How to Contact Customer Support & Technical Assistance",
    summary:
      "Need personalized help with an account issue, bug report, or enterprise billing inquiry? Our support engineers are standing by.",
    steps: [
      "Email our support team directly at support@loomnotes.ai.",
      "Or open your workspace Settings (/settings) to submit an onboarding assistance request.",
      "Typical response time is within 4-8 business hours.",
    ],
    link: { label: "Open Settings", url: "/settings" },
    category: "support",
  },
];

/**
 * Searches knowledge base for articles matching a user query.
 */
export function searchKnowledgeBase(query: string): KnowledgeArticle[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return KNOWLEDGE_ARTICLES.slice(0, 4);

  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  const scored = KNOWLEDGE_ARTICLES.map((article) => {
    let score = 0;
    const combinedText = `${article.topic} ${article.title} ${article.summary} ${article.keywords.join(" ")}`.toLowerCase();

    for (const word of words) {
      if (article.keywords.some((k) => k.includes(word))) score += 5;
      if (article.topic.toLowerCase().includes(word)) score += 4;
      if (article.title.toLowerCase().includes(word)) score += 3;
      if (combinedText.includes(word)) score += 1;
    }

    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);
}

/**
 * Formats knowledge articles into a concise context block for AI system prompts.
 */
export function buildGroundedKnowledgeContext(): string {
  return KNOWLEDGE_ARTICLES.map((a) => {
    const stepsStr = a.steps ? a.steps.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n") : "";
    const linkStr = a.link ? ` [Link: ${a.link.label} -> ${a.link.url}]` : "";
    return `### ${a.title} (${a.topic})${linkStr}\nSummary: ${a.summary}\n${stepsStr ? `Steps:\n${stepsStr}` : ""}`;
  }).join("\n\n");
}
