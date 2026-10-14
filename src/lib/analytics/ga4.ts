/**
 * LoomNotesAI Google Analytics 4 (GA4) Privacy-Safe Tracker
 *
 * Strict Privacy Commitments:
 * - NO Personal Identifiable Information (PII): No names, emails, phone numbers, passwords.
 * - NO Document Content or Signatures.
 * - Deduplication of repeated events.
 * - Respects cookie consent status.
 * - Dev vs Production separation.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type GAEventName =
  | "page_view"
  | "tool_selected"
  | "tool_process_completed"
  | "tool_process_failed"
  | "video_compression_completed"
  | "video_compression_failed"
  | "signup_completed"
  | "email_verification_completed"
  | "nda_generated"
  | "nda_signing_completed"
  | "pricing_page_viewed"
  | "checkout_initiated"
  | "subscription_purchased"
  | "support_chat_opened"
  | "support_chat_message_sent"
  | "support_help_topic_selected";

// In-memory deduplication set to avoid firing identical events in rapid succession
const recentEvents = new Map<string, number>();
const DEDUP_WINDOW_MS = 2000;

export function getConsentStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = localStorage.getItem("loomnotesai_analytics_consent") || localStorage.getItem("freepdfkit_analytics_consent");
    return val === "granted";
  } catch {
    return false;
  }
}

export function setConsentStatus(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("loomnotesai_analytics_consent", granted ? "granted" : "denied");
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Strips any potential PII (emails, query params with emails, tokens) from string values.
 */
function sanitizeEventParam(val: any): any {
  if (typeof val === "string") {
    // Remove email addresses
    let sanitized = val.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, "[REDACTED_EMAIL]");
    // Remove potential tokens / hex hashes
    sanitized = sanitized.replace(/\b[a-f0-9]{32,64}\b/gi, "[REDACTED_HASH]");
    return sanitized;
  }
  if (typeof val === "number" || typeof val === "boolean") {
    return val;
  }
  return undefined;
}

/**
 * Tracks an analytics event to GA4 in a privacy-compliant manner.
 */
export function trackEvent(eventName: GAEventName, params: Record<string, any> = {}): void {
  if (typeof window === "undefined") return;

  // Deduplication check
  const eventSignature = `${eventName}:${JSON.stringify(params)}`;
  const now = Date.now();
  const lastFired = recentEvents.get(eventSignature);
  if (lastFired && now - lastFired < DEDUP_WINDOW_MS) {
    return; // Duplicate event ignored
  }
  recentEvents.set(eventSignature, now);

  // Clean parameters of any accidental PII
  const cleanParams: Record<string, any> = {};
  for (const [key, val] of Object.entries(params)) {
    // Whitelist approved, safe parameter names
    if (
      [
        "tool_name",
        "format",
        "file_count",
        "file_size_bracket",
        "status",
        "source",
        "topic",
        "topic_length",
        "plan_type",
        "currency",
        "error_category",
        "duration_seconds",
      ].includes(key)
    ) {
      cleanParams[key] = sanitizeEventParam(val);
    }
  }

  const isProduction = process.env.NODE_ENV === "production";
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!isProduction) {
    // Development mode logging for verification without spamming analytics servers
    console.log(`[GA4 Dev Tracker] Event: ${eventName}`, cleanParams);
  }

  // Check consent and gtag presence
  if (getConsentStatus() && window.gtag && measurementId) {
    window.gtag("event", eventName, cleanParams);
  }
}
