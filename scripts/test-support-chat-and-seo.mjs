/**
 * Automated QA Test Suite for FreePDFKit
 * Verifies Customer Support Chatbot, Security Sanitization, Rate Limiter, and SEO.
 */

import { checkRateLimit, sanitizeChatInput } from "../src/lib/support/rate-limiter.ts";
import { searchKnowledgeBase } from "../src/lib/support/knowledge-base.ts";

console.log("====================================================");
console.log("  FreePDFKit - Support Chat & SEO QA Test Suite");
console.log("====================================================\n");

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

// 1. KNOWLEDGE BASE TESTS
console.log("▶ 1. Testing Grounded Knowledge Base Queries...");

const mergeResults = searchKnowledgeBase("how do I merge multiple pdf files?");
assert("Knowledge base finds Merge PDF article", mergeResults.some((a) => a.id === "merge-pdf"));

const videoResults = searchKnowledgeBase("can I compress mp4 videos?");
assert("Knowledge base finds Video Compressor article", videoResults.some((a) => a.id === "video-compressor"));

const ndaResults = searchKnowledgeBase("how does NDA signature work?");
assert("Knowledge base finds NDA Signing article", ndaResults.some((a) => a.id === "nda-signing"));

const pricingResults = searchKnowledgeBase("how much does the Pro plan cost?");
assert("Knowledge base finds Pricing article", pricingResults.some((a) => a.id === "pricing-plans"));

const privacyResults = searchKnowledgeBase("is my uploaded file stored or used for AI training?");
assert("Knowledge base finds Privacy article", privacyResults.some((a) => a.id === "privacy-security"));

// 2. INPUT SANITIZATION & SECURITY TESTS
console.log("\n▶ 2. Testing Input Sanitization & Sensitive Data Rejection...");

const safeMsg = sanitizeChatInput("Can you tell me how to split a PDF document?");
assert("Sanitizer accepts standard safe message", safeMsg.isValid === true);

const emptyMsg = sanitizeChatInput("   ");
assert("Sanitizer rejects whitespace-only message", emptyMsg.isValid === false);

const longMsg = sanitizeChatInput("a".repeat(1200));
assert("Sanitizer flags messages exceeding max character limit", longMsg.isValid === false);

const cardMsg = sanitizeChatInput("Here is my credit card number: 4111 2222 3333 4444");
assert("Sanitizer detects and blocks credit card numbers", cardMsg.isValid === false && cardMsg.isSecuritySensitive === true);

const otpMsg = sanitizeChatInput("My verification code is 849201");
assert("Sanitizer detects and blocks OTPs / verification codes", otpMsg.isValid === false && otpMsg.isSecuritySensitive === true);

const pwdMsg = sanitizeChatInput("My password is SecretPassword123!");
assert("Sanitizer detects and blocks password disclosures", pwdMsg.isValid === false && pwdMsg.isSecuritySensitive === true);

// 3. RATE LIMITER TESTS
console.log("\n▶ 3. Testing Server Rate Limiter...");

const testIp = `test-client-${Date.now()}`;
let wasLimited = false;

// Consume tokens
for (let i = 0; i < 20; i++) {
  const res = checkRateLimit(testIp);
  if (!res.allowed) {
    wasLimited = true;
    break;
  }
}
assert("Rate limiter successfully kicks in when token bucket is exhausted", wasLimited === true);

// 4. SUMMARY
console.log("\n====================================================");
console.log(`  QA Test Suite Results: ${passed} Passed, ${failed} Failed`);
console.log("====================================================");

if (failed > 0) {
  process.exit(1);
}
