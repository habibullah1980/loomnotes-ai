"use server";

import { testGeminiConnection, type GeminiTestResult } from "@/lib/gemini";

export async function runGeminiConnectionTest(
  prompt?: string
): Promise<{ success: boolean; data?: GeminiTestResult; error?: string }> {
  try {
    const result = await testGeminiConnection(prompt);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to connect to Gemini API";
    return { success: false, error: message };
  }
}
