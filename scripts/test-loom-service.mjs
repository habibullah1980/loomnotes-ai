/**
 * Step 8 Verification Script: Loom URL Processing & Transcript Service
 */

// 1. Loom URL Parser Logic Check
function parseLoomUrl(url) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { isValid: false, error: "URL cannot be empty." };
  }

  const trimmed = url.trim();
  let parsed;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return { isValid: false, error: "Invalid URL format: Please enter a well-formed web address." };
  }

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

  const pathParts = parsed.pathname.split("/").filter(Boolean);
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
    return { isValid: false, error: "Loom video ID is missing from the URL path." };
  }

  const cleanId = rawId.trim().toLowerCase();
  if (!/^[a-z0-9_-]{6,64}$/i.test(cleanId)) {
    return { isValid: false, error: "Invalid Loom video ID format. Video ID must be alphanumeric." };
  }

  return {
    isValid: true,
    videoId: cleanId,
    normalizedUrl: `https://www.loom.com/share/${cleanId}`,
  };
}

// 2. Mock Transcript Service
class MockLoomTranscriptAdapter {
  name = "MockLoomTranscriptAdapter (Development / Test)";
  isMock = true;

  async fetchTranscript(videoId) {
    if (videoId.includes("error") || videoId === "00000000000000000000000000000000") {
      return {
        success: false,
        error: "Transcript not available: This Loom video is private, restricted, or captions have not finished processing.",
        videoId,
      };
    }

    return {
      success: true,
      transcript: "Speaker 1 (David - Lead Designer): Welcome everyone. In this Loom recording, I am walking through the new design system update...\nSpeaker 2 (Elena - PM): Thanks David. Regarding the roadmap, we agreed today that mobile responsive view is our highest priority.",
      videoId,
      title: "Design System & Sprint Deliverables Walkthrough",
    };
  }
}

async function runTests() {
  console.log("=== Testing Step 8: Loom URL Processing & Transcript Service ===\n");

  // Test 1: Valid Loom URLs
  console.log("1. Testing Valid Loom URLs:");
  const validCases = [
    { input: "https://www.loom.com/share/d4a8e29bf4914fa6b21914c628f28941", expectedId: "d4a8e29bf4914fa6b21914c628f28941" },
    { input: "https://loom.com/share/abc123456?sid=98765&sharedAppSource=personal_library", expectedId: "abc123456" },
    { input: "https://www.loom.com/embed/fedcba9876543210/", expectedId: "fedcba9876543210" },
    { input: "loom.com/share/1234567890abcdef", expectedId: "1234567890abcdef" },
  ];

  for (const tc of validCases) {
    const res = parseLoomUrl(tc.input);
    if (!res.isValid || res.videoId !== tc.expectedId) {
      console.error(`FAILED for "${tc.input}":`, res);
      process.exit(1);
    }
    console.log(`   PASS: "${tc.input}" -> ID: ${res.videoId} (${res.normalizedUrl})`);
  }

  // Test 2: Invalid / Non-Loom URLs
  console.log("\n2. Testing Invalid / Non-Loom URLs (Expected Rejections):");
  const invalidCases = [
    "https://youtube.com/watch?v=12345",
    "https://vimeo.com/12345678",
    "https://loom.com/pricing",
    "https://www.loom.com/",
    "not-a-valid-url-at-all",
    "",
  ];

  for (const inv of invalidCases) {
    const res = parseLoomUrl(inv);
    if (res.isValid) {
      console.error(`FAILED: Expected rejection for "${inv}"`);
      process.exit(1);
    }
    console.log(`   PASS: Rejected "${inv || "(empty)"}": "${res.error}"`);
  }

  // Test 3: Mock Transcript Service
  console.log("\n3. Testing Mock Transcript Service Interface:");
  const adapter = new MockLoomTranscriptAdapter();
  const res = await adapter.fetchTranscript("d4a8e29bf4914fa6b21914c628f28941");
  if (!res.success || !res.transcript) {
    console.error("FAILED to retrieve transcript");
    process.exit(1);
  }
  console.log(`   PASS: Retrieved mock transcript for video ${res.videoId}`);
  console.log(`   • Title: "${res.title}"`);
  console.log(`   • Content: "${res.transcript.slice(0, 100)}..."`);

  // Test 4: Error handling for restricted video
  console.log("\n4. Testing Service Error Simulation:");
  const errRes = await adapter.fetchTranscript("error-restricted-video");
  if (errRes.success) {
    console.error("FAILED: Expected error simulation");
    process.exit(1);
  }
  console.log(`   PASS: Gracefully returned error: "${errRes.error}"`);

  console.log("\n=== Step 8 Verification Complete: All tests passed! ===");
}

runTests();
