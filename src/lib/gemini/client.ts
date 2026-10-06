import "server-only";
import { GoogleGenAI } from "@google/genai";
import { geminiConfig } from "./config";

let aiClient: GoogleGenAI | null = null;

/**
 * Returns a server-side Google GenAI client instance.
 * Guaranteed to execute only on the server (Server Components, Server Actions, Route Handlers).
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiConfig.isConfigured) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in .env.local"
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: geminiConfig.apiKey,
    });
  }

  return aiClient;
}

export interface GeminiTestResult {
  success: boolean;
  model: string;
  prompt: string;
  response: string;
  timestamp: string;
}

/**
 * Server-side test function that sends a small test prompt to Gemini
 * and returns the generated response.
 */
export async function testGeminiConnection(
  prompt = "Hello Gemini! Confirm you are connected to LoomNotes AI in one short sentence."
): Promise<GeminiTestResult> {
  const ai = getGeminiClient();

  // Models supported by Google AI Studio
  const modelsToTry = [geminiConfig.model, "gemini-3.8-flash", "gemini-3.5-flash"];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return {
        success: true,
        model,
        prompt,
        response: result.text?.trim() ?? "",
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("503") && !message.includes("UNAVAILABLE")) {
        throw err;
      }
    }
  }

  throw lastError;
}
