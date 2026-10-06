import "server-only";
import { getGeminiClient } from "./client";
import { geminiConfig } from "./config";

export interface ExtractedActionItem {
  task: string;
  assignee: string | null;
  due_date: string | null;
}

export interface StructuredMeetingNotes {
  summary: string;
  key_takeaways: string[];
  key_decisions: string[];
  action_items: ExtractedActionItem[];
  follow_up_questions: string[];
}

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

/**
 * Validates and sanitizes the parsed JSON into StructuredMeetingNotes.
 */
export function validateAndSanitizeNotes(raw: unknown): StructuredMeetingNotes {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid AI response: Expected an object.");
  }

  const obj = raw as Record<string, unknown>;

  // Validate summary
  const summary =
    typeof obj.summary === "string" && obj.summary.trim()
      ? obj.summary.trim()
      : "No executive summary could be generated for this transcript.";

  // Validate key takeaways
  let key_takeaways: string[] = [];
  if (Array.isArray(obj.key_takeaways)) {
    key_takeaways = obj.key_takeaways
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  // Validate key decisions
  let key_decisions: string[] = [];
  if (Array.isArray(obj.key_decisions)) {
    key_decisions = obj.key_decisions
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  // Validate action items
  let action_items: ExtractedActionItem[] = [];
  if (Array.isArray(obj.action_items)) {
    action_items = obj.action_items
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const itemObj = item as Record<string, unknown>;
        const task =
          typeof itemObj.task === "string" ? itemObj.task.trim() : "";

        let assignee: string | null = null;
        if (
          typeof itemObj.assignee === "string" &&
          itemObj.assignee.trim() &&
          itemObj.assignee.toLowerCase() !== "null"
        ) {
          assignee = itemObj.assignee.trim();
        }

        let due_date: string | null = null;
        if (
          typeof itemObj.due_date === "string" &&
          itemObj.due_date.trim() &&
          itemObj.due_date.toLowerCase() !== "null"
        ) {
          const trimmedDate = itemObj.due_date.trim();
          // Ensure valid YYYY-MM-DD format for PostgreSQL date column
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
            due_date = trimmedDate;
          }
        }

        return { task, assignee, due_date };
      })
      .filter((item) => item.task.length > 0);
  }

  // Validate follow up questions
  let follow_up_questions: string[] = [];
  if (Array.isArray(obj.follow_up_questions)) {
    follow_up_questions = obj.follow_up_questions
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  return {
    summary,
    key_takeaways,
    key_decisions,
    action_items,
    follow_up_questions,
  };
}

/**
 * Analyzes a transcript with Google Gemini and returns validated structured notes.
 */
export async function analyzeTranscriptWithGemini(
  title: string,
  transcript: string
): Promise<StructuredMeetingNotes> {
  const ai = getGeminiClient();

  const userPrompt = `
Meeting Title: "${title}"

Transcript:
"""
${transcript}
"""

Analyze this transcript and produce the required structured JSON format:
{
  "summary": "concise meeting summary",
  "key_takeaways": ["takeaway 1", "takeaway 2"],
  "key_decisions": ["decision 1", "decision 2"],
  "action_items": [
    {
      "task": "specific task description",
      "assignee": "assignee name or null",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "follow_up_questions": ["question 1", "question 2"]
}
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

  const modelsToTry = [geminiConfig.model, "gemini-3.8-flash", "gemini-3.5-flash"];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const responseText = response.text?.trim() ?? "";
      if (!responseText) {
        throw new Error("Received an empty response from Gemini.");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Fallback: extract JSON between braces
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse Gemini response as valid JSON.");
        }
      }

      return validateAndSanitizeNotes(parsed);
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("503") && !message.includes("UNAVAILABLE")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Failed to generate meeting notes with Gemini.");
}
