import "server-only";
import { parseLoomUrl } from "./url";

export interface LoomTranscriptResponse {
  success: boolean;
  transcript?: string;
  error?: string;
  videoId?: string;
  title?: string;
}

const LOOM_GRAPHQL_ENDPOINT = "https://www.loom.com/graphql";

const FETCH_TRANSCRIPT_QUERY = `
query FetchVideoTranscript($videoId: ID!, $password: String) {
  fetchVideoTranscript(videoId: $videoId, password: $password) {
    __typename
    ... on VideoTranscriptDetails {
      video_id
      source_url
      captions_source_url
    }
    ... on InvalidRequestWarning {
      message
    }
    ... on GenericError {
      message
    }
  }
}
`.trim();

/**
 * Parses and cleans a WebVTT (.vtt) captions stream into readable meeting transcript text.
 * Strips WEBVTT headers, cue markers, timestamp lines (00:00.000 --> 00:04.000), and HTML tags.
 */
export function cleanWebVTT(vttContent: string): string {
  if (!vttContent || typeof vttContent !== "string") return "";

  const lines = vttContent.replace(/\r\n/g, "\n").split("\n");
  const textLines: string[] = [];
  let lastLine = "";

  for (let line of lines) {
    line = line.trim();

    if (!line) continue;
    if (line.startsWith("WEBVTT") || line.startsWith("NOTE") || line.startsWith("STYLE")) continue;
    if (/^\d+$/.test(line)) continue; // Numerical cue identifier
    if (/-->/.test(line)) continue; // Timestamp range line

    // Strip inline formatting tags (e.g., <v Speaker>, <c.color>)
    const clean = line.replace(/<[^>]+>/g, "").trim();
    if (!clean) continue;

    // Deduplicate rolling captions
    if (clean !== lastLine) {
      textLines.push(clean);
      lastLine = clean;
    }
  }

  return textLines.join(" ").trim();
}

/**
 * Parses and cleans Loom JSON transcript data into continuous text.
 */
export function cleanLoomJson(jsonContent: unknown): string {
  if (!jsonContent) return "";

  let parsed = jsonContent;
  if (typeof jsonContent === "string") {
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      return jsonContent.trim();
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          return (rec.text || rec.content || rec.phrase || "") as string;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.phrases)) {
      return obj.phrases.map((p) => p?.text || p?.phrase || "").filter(Boolean).join(" ").trim();
    }
    if (Array.isArray(obj.segments)) {
      return obj.segments.map((s) => s?.text || s?.content || "").filter(Boolean).join(" ").trim();
    }
    if (Array.isArray(obj.words)) {
      return obj.words.map((w) => w?.text || w?.word || "").filter(Boolean).join(" ").trim();
    }
    if (typeof obj.transcript === "string") {
      return obj.transcript.trim();
    }
  }

  return "";
}

/**
 * Primary Server-Side Service:
 * Retrieves the transcript for a publicly accessible Loom video URL.
 *
 * Requirements:
 * - Pure HTTP / GraphQL communication (no browser automation).
 * - Does not bypass authentication or private video restrictions.
 * - Server-side execution only.
 *
 * @param loomUrl - The public Loom video URL (e.g., https://www.loom.com/share/VIDEO_ID)
 */
export async function getLoomTranscript(loomUrl: string): Promise<LoomTranscriptResponse> {
  const urlValidation = parseLoomUrl(loomUrl);

  if (!urlValidation.isValid || !urlValidation.videoId) {
    return {
      success: false,
      error: urlValidation.error || "The provided URL is not a valid Loom video address.",
    };
  }

  const videoId = urlValidation.videoId;

  try {
    // 1. Query Loom's public GraphQL endpoint for transcript metadata
    const response = await fetch(LOOM_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "apollographql-client-name": "loom-web",
        "User-Agent": "LoomNotes-AI/1.0 (+https://loomnotes.ai)",
      },
      body: JSON.stringify({
        operationName: "FetchVideoTranscript",
        variables: {
          videoId,
          password: null,
        },
        query: FETCH_TRANSCRIPT_QUERY,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Loom API returned HTTP status ${response.status} (${response.statusText}).`,
        videoId,
      };
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      return {
        success: false,
        error: `Loom GraphQL error: ${json.errors[0].message || "Query failed"}`,
        videoId,
      };
    }

    const transcriptDetails = json.data?.fetchVideoTranscript;

    if (!transcriptDetails) {
      return {
        success: false,
        error: "No transcript data returned by Loom for this video ID.",
        videoId,
      };
    }

    // 2. Handle Loom response types
    if (transcriptDetails.__typename === "InvalidRequestWarning" || transcriptDetails.__typename === "GenericError") {
      const msg = transcriptDetails.message || "Video not found or access restricted.";
      return {
        success: false,
        error: `Unable to access Loom transcript: ${msg}`,
        videoId,
      };
    }

    if (transcriptDetails.__typename === "VideoTranscriptDetails") {
      const vttUrl = transcriptDetails.captions_source_url;
      const jsonUrl = transcriptDetails.source_url;

      // Priority 1: Fetch WebVTT captions if available
      if (vttUrl && typeof vttUrl === "string") {
        try {
          const vttRes = await fetch(vttUrl);
          if (vttRes.ok) {
            const vttText = await vttRes.text();
            const cleanTranscript = cleanWebVTT(vttText);
            if (cleanTranscript.length > 0) {
              return {
                success: true,
                transcript: cleanTranscript,
                videoId,
              };
            }
          }
        } catch (vttErr: unknown) {
          console.warn("Notice: Failed fetching WebVTT captions, trying JSON source:", vttErr);
        }
      }

      // Priority 2: Fetch JSON transcript if WebVTT is unavailable
      if (jsonUrl && typeof jsonUrl === "string") {
        try {
          const jsonRes = await fetch(jsonUrl);
          if (jsonRes.ok) {
            const rawJson = await jsonRes.json();
            const cleanTranscript = cleanLoomJson(rawJson);
            if (cleanTranscript.length > 0) {
              return {
                success: true,
                transcript: cleanTranscript,
                videoId,
              };
            }
          }
        } catch (jsonErr: unknown) {
          console.warn("Notice: Failed fetching JSON transcript source:", jsonErr);
        }
      }

      return {
        success: false,
        error: "Transcript files (WebVTT or JSON) were not reachable or contain no text for this video.",
        videoId,
      };
    }

    return {
      success: false,
      error: `Unexpected transcript response type from Loom: ${transcriptDetails.__typename}`,
      videoId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    return {
      success: false,
      error: `Failed to connect to Loom transcript service: ${message}`,
      videoId,
    };
  }
}
