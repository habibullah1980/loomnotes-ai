"use server";

import { getLoomTranscript } from "@/lib/loom/transcript";
import { parseLoomUrl } from "@/lib/loom/url";

export interface FetchLoomTranscriptResult {
  success: boolean;
  transcript?: string;
  error?: string;
  videoId?: string;
  title?: string;
}

/**
 * Server Action: Validates Loom URL and retrieves its transcript via the server-side service.
 * Isolated from Gemini processing and Supabase storage.
 */
export async function fetchLoomTranscriptAction(
  loomUrl: string
): Promise<FetchLoomTranscriptResult> {
  const trimmed = (loomUrl || "").trim();

  if (!trimmed) {
    return {
      success: false,
      error: "Please provide a Loom video URL.",
    };
  }

  // Pre-validate URL structure
  const parseCheck = parseLoomUrl(trimmed);
  if (!parseCheck.isValid) {
    return {
      success: false,
      error: parseCheck.error || "Invalid Loom URL. Expected format: https://www.loom.com/share/VIDEO_ID",
    };
  }

  // Retrieve transcript via isolated server-side service
  const result = await getLoomTranscript(trimmed);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      videoId: result.videoId,
    };
  }

  return {
    success: true,
    transcript: result.transcript,
    videoId: result.videoId,
    title: result.title,
  };
}
