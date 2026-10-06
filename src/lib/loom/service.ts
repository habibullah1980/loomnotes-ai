import "server-only";
import { parseLoomUrl } from "./url";

export type LoomTranscriptResult =
  | {
      success: true;
      transcript: string;
      videoId: string;
      title?: string;
    }
  | {
      success: false;
      error: string;
      videoId?: string;
    };

/**
 * Interface for pluggable Loom transcript retrieval.
 * Implementations can be swapped (Mock adapter, Loom Developer API, Webhook processor)
 * without touching UI or AI pipeline code.
 */
export interface LoomTranscriptProvider {
  readonly name: string;
  readonly isMock: boolean;
  fetchTranscript(videoId: string, normalizedUrl: string): Promise<LoomTranscriptResult>;
}

/**
 * -----------------------------------------------------------------------------
 * MOCK / TEST ADAPTER (Clearly Marked)
 * -----------------------------------------------------------------------------
 * Since official public unauthenticated Loom API keys / transcript scraping
 * are not available and browser scraping is prohibited by project policy,
 * this adapter provides realistic test transcripts for valid Loom video IDs.
 */
export class MockLoomTranscriptAdapter implements LoomTranscriptProvider {
  readonly name = "MockLoomTranscriptAdapter (Development / Test)";
  readonly isMock = true;

  async fetchTranscript(videoId: string, _normalizedUrl: string): Promise<LoomTranscriptResult> {
    // Simulate network delay to verify frontend loading state
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Support simulated error cases for testing error UI
    if (videoId.includes("error") || videoId === "00000000000000000000000000000000") {
      return {
        success: false,
        error: "Transcript not available: This Loom video is private, restricted, or captions have not finished processing.",
        videoId,
      };
    }

    // Default realistic mock meeting transcript
    const sampleMockTranscript = `Speaker 1 (David - Lead Designer): Welcome everyone. In this Loom recording, I'm walking through the new design system update and the sprint deliverables.

Speaker 2 (Elena - Product Manager): Thanks David. Regarding the roadmap, we agreed today that the mobile responsive view is our highest priority for this cycle.

Speaker 1: Exactly. Elena, can you finalize the user feedback review by 2026-10-18?

Speaker 2: Yes, I will take care of the user feedback review and sync with customer success. Also, should we deprecate the legacy navigation drawer this week or wait for v2?

Speaker 1: Let's table that decision until we get metrics from analytics on current drawer usage.

Speaker 2: Sounds good. Let's make sure David shares the revised Figma assets with frontend today.`;

    return {
      success: true,
      transcript: sampleMockTranscript,
      videoId,
      title: "Design System & Sprint Deliverables Walkthrough",
    };
  }
}

// Active provider instance (Swappable for future real API integration)
let currentProvider: LoomTranscriptProvider = new MockLoomTranscriptAdapter();

/**
 * Configure or swap the active transcript provider (e.g. for testing or production API)
 */
export function setLoomTranscriptProvider(provider: LoomTranscriptProvider) {
  currentProvider = provider;
}

export function getActiveProviderInfo() {
  return {
    name: currentProvider.name,
    isMock: currentProvider.isMock,
  };
}

/**
 * Primary Server-Side Service:
 * Validates a Loom URL and retrieves its transcript using the configured provider.
 *
 * @param loomUrl - The raw Loom URL string provided by the user.
 * @returns LoomTranscriptResult with { success: true, transcript } or { success: false, error }
 */
export async function getLoomTranscript(loomUrl: string): Promise<LoomTranscriptResult> {
  const parseResult = parseLoomUrl(loomUrl);

  if (!parseResult.isValid || !parseResult.videoId) {
    return {
      success: false,
      error: parseResult.error || "The provided URL is not a valid Loom video address.",
    };
  }

  try {
    return await currentProvider.fetchTranscript(
      parseResult.videoId,
      parseResult.normalizedUrl!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error occurred while fetching transcript.";
    return {
      success: false,
      error: `Failed to retrieve Loom transcript: ${message}`,
      videoId: parseResult.videoId,
    };
  }
}
