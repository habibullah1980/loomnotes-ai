/**
 * Loom URL Parser and Validator
 * Validates Loom video share/embed URLs and normalizes Loom video IDs.
 */

export interface LoomUrlParseResult {
  isValid: boolean;
  videoId?: string;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validates and extracts the video ID from a Loom URL.
 * Supports:
 * - https://www.loom.com/share/{videoId}
 * - https://loom.com/share/{videoId}
 * - https://www.loom.com/embed/{videoId}
 * - https://loom.com/embed/{videoId}
 * - URLs with query strings (e.g., ?sid=..., ?t=...)
 */
export function parseLoomUrl(url: string | null | undefined): LoomUrlParseResult {
  if (!url || typeof url !== "string" || !url.trim()) {
    return {
      isValid: false,
      error: "URL cannot be empty.",
    };
  }

  const trimmed = url.trim();

  let parsed: URL;
  try {
    // Add protocol if user pasted domain directly without protocol
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format: Please enter a well-formed web address.",
    };
  }

  // Check hostname - must be loom.com or a subdomain like www.loom.com, app.loom.com
  const hostname = parsed.hostname.toLowerCase();
  const isLoomHost =
    hostname === "loom.com" ||
    hostname === "www.loom.com" ||
    hostname === "app.loom.com" ||
    hostname.endsWith(".loom.com");

  if (!isLoomHost) {
    return {
      isValid: false,
      error: `Not a Loom URL: Host "${hostname}" is not recognized as a Loom domain. Please provide a URL from loom.com.`,
    };
  }

  // Parse path to locate video ID
  // Standard paths: /share/:id or /embed/:id or /v/:id
  const pathname = parsed.pathname;
  const pathParts = pathname.split("/").filter(Boolean);

  if (pathParts.length < 2) {
    return {
      isValid: false,
      error: "Invalid Loom URL structure: Expected format is https://www.loom.com/share/VIDEO_ID.",
    };
  }

  const routeType = pathParts[0].toLowerCase();
  const rawId = pathParts[1];

  const validRoutes = ["share", "embed", "v"];
  if (!validRoutes.includes(routeType)) {
    return {
      isValid: false,
      error: `Unsupported Loom URL path "/${routeType}". Expected a video share URL like https://www.loom.com/share/VIDEO_ID.`,
    };
  }

  if (!rawId || rawId.trim().length === 0) {
    return {
      isValid: false,
      error: "Loom video ID is missing from the URL path.",
    };
  }

  // Normalize ID: Remove any query parameter remnants or trailing hyphens
  const cleanId = rawId.trim().toLowerCase();

  // Basic sanity check on ID characters: Alphanumeric and hyphens/underscores
  if (!/^[a-z0-9_-]{6,64}$/i.test(cleanId)) {
    return {
      isValid: false,
      error: "Invalid Loom video ID format. Video ID must be alphanumeric.",
    };
  }

  return {
    isValid: true,
    videoId: cleanId,
    normalizedUrl: `https://www.loom.com/share/${cleanId}`,
  };
}

/**
 * Quick boolean check if a string represents a valid Loom URL.
 */
export function isValidLoomUrl(url: string | null | undefined): boolean {
  return parseLoomUrl(url).isValid;
}
