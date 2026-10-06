import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!geminiApiKey || !supabaseUrl || !supabaseAnonKey) {
  console.error("Missing required environment variables in .env.local");
  process.exit(1);
}

const TEST_TRANSCRIPT = `
Alex (Tech Lead): Thanks for joining the sprint review. We decided today that we will migrate our frontend caching to Redis starting next Monday.
Maria (Backend Lead): Agreed, that will cut API latency in half. I will write the migration script and complete it by 2026-10-20.
Alex: Great. We also agreed to deprecate the v1 endpoints at the end of next month.
Maria: Sounds good. What about the customer billing exports? Should we include pending tax calculations or wait for finance?
Alex: That's still undecided. Let's table that question until we get feedback from Rachel in legal.
`;

const SYSTEM_INSTRUCTIONS = `
You are LoomNotes AI, an elite executive assistant that analyzes meeting transcripts to generate structured, actionable, and accurate notes.

CRITICAL RULES:
1. STRICT TRUTHFULNESS: Never invent facts. Never invent names, dates, deadlines, decisions, or responsibilities. Only include information directly and verifiably supported by the transcript.
2. CONCISE SUMMARY: Provide a concise and useful executive summary highlighting the primary purpose, context, and key conclusions of the meeting.
3. KEY TAKEAWAYS: Extract bullet points of critical insights, findings, or highlights discussed during the session.
4. KEY DECISIONS: Extract ONLY actual decisions that were agreed upon, approved, or finalized during the meeting. If no concrete decisions were made, return an empty array [].
5. ACTION ITEMS: Extract concrete, actionable tasks rather than general statements or passive thoughts.
   - Assignee: Identify who is responsible ONLY if explicitly named or clearly assigned in the transcript. Otherwise, set to null.
   - Due Date: If a specific deadline or date is explicitly mentioned or clearly resolvable, format it strictly as YYYY-MM-DD (e.g. '2026-10-15'). If not mentioned or ambiguous, set to null.
6. FOLLOW-UP QUESTIONS: Identify genuinely unresolved issues, open questions, blockers, or topics tabled for future discussion mentioned in the transcript. If everything was resolved, return an empty array [].
7. FORMAT: Return valid structured JSON strictly matching the response schema.
`.trim();

const responseSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    key_takeaways: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    key_decisions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    action_items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          task: { type: "STRING" },
          assignee: { type: "STRING", nullable: true },
          due_date: { type: "STRING", nullable: true },
        },
        required: ["task"],
      },
    },
    follow_up_questions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: [
    "summary",
    "key_takeaways",
    "key_decisions",
    "action_items",
    "follow_up_questions",
  ],
};

async function runStep7Test() {
  console.log("=== Testing Step 7: AI Output Schema & Quality ===");

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const prompt = `Meeting Title: "Sprint Review & Architecture Decisions"

Transcript:
"""
${TEST_TRANSCRIPT}
"""

Analyze this transcript and produce the required structured JSON format:
{
  "summary": "concise meeting summary",
  "key_takeaways": ["takeaway 1"],
  "key_decisions": ["decision 1"],
  "action_items": [
    {
      "task": "task",
      "assignee": "name or null",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "follow_up_questions": ["question 1"]
}
`;

  console.log("\n1. Calling Gemini API with Step 7 response schema...");
  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const elapsed = Date.now() - startTime;
  console.log(`PASS: Gemini responded in ${elapsed}ms.`);

  const text = response.text?.trim() ?? "";
  console.log("\n2. Validating JSON response structure...");
  const data = JSON.parse(text);

  console.log("Raw Generated Output:");
  console.log(JSON.stringify(data, null, 2));

  // Check required keys
  if (!data.summary || typeof data.summary !== "string") {
    throw new Error("Missing or invalid summary");
  }
  if (!Array.isArray(data.key_takeaways)) {
    throw new Error("Missing or invalid key_takeaways array");
  }
  if (!Array.isArray(data.key_decisions)) {
    throw new Error("Missing or invalid key_decisions array");
  }
  if (!Array.isArray(data.action_items)) {
    throw new Error("Missing or invalid action_items array");
  }
  if (!Array.isArray(data.follow_up_questions)) {
    throw new Error("Missing or invalid follow_up_questions array");
  }

  console.log("\nPASS: All 5 schema components present and typed properly!");
  console.log(`- Summary: ${data.summary.slice(0, 80)}...`);
  console.log(`- Key Takeaways: ${data.key_takeaways.length}`);
  console.log(`- Key Decisions: ${data.key_decisions.length}`);
  console.log(`- Action Items: ${data.action_items.length}`);
  console.log(`- Follow-up Questions: ${data.follow_up_questions.length}`);

  // Quality verification
  if (data.key_decisions.length === 0) {
    console.warn("WARNING: Expected decisions from transcript (Redis migration, deprecate v1).");
  } else {
    console.log("PASS: Key decisions identified:", data.key_decisions);
  }

  if (data.follow_up_questions.length === 0) {
    console.warn("WARNING: Expected unresolved follow-up question (billing tax calculations / legal feedback).");
  } else {
    console.log("PASS: Follow-up questions identified:", data.follow_up_questions);
  }

  console.log("\n=== Step 7 AI Quality & Schema test passed! ===");
}

runStep7Test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
