/**
 * FreePDFKit Support Chatbot - Rate Limiter & Security Input Sanitizer
 * Protects server resources, prevents abuse, and enforces privacy standards.
 */

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory token bucket rate limiter (keyed by IP or session ID)
const buckets = new Map<string, RateBucket>();
const MAX_TOKENS = 15; // Max 15 messages in burst
const REFILL_RATE_PER_SEC = 0.25; // 1 token every 4 seconds (~15/minute)
const MAX_MESSAGE_LENGTH = 1000;

export interface SanitizedInput {
  isValid: boolean;
  sanitizedText: string;
  rejectionReason?: string;
  isSecuritySensitive?: boolean;
}

/**
 * Checks and decrements rate limit for an identifier.
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(identifier, bucket);
  } else {
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + elapsedSeconds * REFILL_RATE_PER_SEC);
    bucket.lastRefill = now;
  }

  // Periodic cleanup of stale buckets (older than 10 minutes)
  if (buckets.size > 2000) {
    for (const [key, b] of buckets.entries()) {
      if (now - b.lastRefill > 600000) buckets.delete(key);
    }
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const waitTime = Math.ceil((1 - bucket.tokens) / REFILL_RATE_PER_SEC);
  return { allowed: false, retryAfterSeconds: waitTime };
}

/**
 * Sanitizes user input and detects sensitive data (passwords, card numbers, OTPs).
 */
export function sanitizeChatInput(rawInput: string): SanitizedInput {
  if (!rawInput || typeof rawInput !== "string") {
    return { isValid: false, sanitizedText: "", rejectionReason: "Message cannot be empty." };
  }

  const trimmed = rawInput.trim();

  if (trimmed.length === 0) {
    return { isValid: false, sanitizedText: "", rejectionReason: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      sanitizedText: trimmed.slice(0, MAX_MESSAGE_LENGTH),
      rejectionReason: `Message exceeds the ${MAX_MESSAGE_LENGTH} character limit.`,
    };
  }

  // Detect sensitive PII / financial credentials
  const creditCardPattern = /\b(?:\d{4}[ -]?){3}\d{4}\b/;
  const otpPattern = /\b(?:otp|one-time password|verification code)\s*(?:is|:)?\s*\d{4,8}\b/i;
  const passwordSharingPattern = /\b(?:my password is|here is my password|password:)\s*[^\s]+/i;

  if (creditCardPattern.test(trimmed) || otpPattern.test(trimmed) || passwordSharingPattern.test(trimmed)) {
    return {
      isValid: false,
      sanitizedText: "",
      isSecuritySensitive: true,
      rejectionReason:
        "For your security, please never share passwords, verification codes, or credit card numbers in the support chat.",
    };
  }

  // Basic HTML entity encoding to prevent XSS in rendering
  const sanitized = trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return { isValid: true, sanitizedText: sanitized };
}
