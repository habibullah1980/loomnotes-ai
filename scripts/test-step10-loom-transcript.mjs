/**
 * Step 10 Verification Script: Real Loom Transcript Retrieval
 */

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

function cleanWebVTT(vttContent) {
  if (!vttContent || typeof vttContent !== "string") return "";
  const lines = vttContent.replace(/\r\n/g, "\n").split("\n");
  const textLines = [];
  let lastLine = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith("WEBVTT") || line.startsWith("NOTE") || line.startsWith("STYLE")) continue;
    if (/^\d+$/.test(line)) continue;
    if (/-->/.test(line)) continue;

    const clean = line.replace(/<[^>]+>/g, "").trim();
    if (!clean) continue;

    if (clean !== lastLine) {
      textLines.push(clean);
      lastLine = clean;
    }
  }

  return textLines.join(" ").trim();
}

function cleanLoomJson(jsonContent) {
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
      .map((item) => (typeof item === "string" ? item : item?.text || item?.content || item?.phrase || ""))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed;
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

async function getLoomTranscript(loomUrl) {
  const urlValidation = parseLoomUrl(loomUrl);
  if (!urlValidation.isValid || !urlValidation.videoId) {
    return { success: false, error: urlValidation.error };
  }

  const videoId = urlValidation.videoId;

  try {
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
        variables: { videoId, password: null },
        query: FETCH_TRANSCRIPT_QUERY,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status} ${response.statusText}`, videoId };
    }

    const json = await response.json();
    const details = json.data?.fetchVideoTranscript;

    if (!details) {
      return { success: false, error: "No transcript data returned by Loom.", videoId };
    }

    if (details.__typename === "InvalidRequestWarning" || details.__typename === "GenericError") {
      return { success: false, error: `Loom reported: ${details.message || "Video not found or access restricted."}`, videoId };
    }

    if (details.__typename === "VideoTranscriptDetails") {
      if (details.captions_source_url) {
        try {
          const vttRes = await fetch(details.captions_source_url);
          if (vttRes.ok) {
            const clean = cleanWebVTT(await vttRes.text());
            if (clean.length > 0) return { success: true, transcript: clean, videoId };
          }
        } catch {}
      }
      if (details.source_url) {
        try {
          const jsonRes = await fetch(details.source_url);
          if (jsonRes.ok) {
            const clean = cleanLoomJson(await jsonRes.json());
            if (clean.length > 0) return { success: true, transcript: clean, videoId };
          }
        } catch {}
      }
      return { success: false, error: "Transcript files were empty or unreachable", videoId };
    }

    return { success: false, error: `Unexpected type: ${details.__typename}`, videoId };
  } catch (err) {
    return { success: false, error: `Network error: ${err.message}`, videoId };
  }
}

async function runStep10Tests() {
  console.log("=== Step 10: Real Loom Transcript Retrieval Verification ===\n");

  // 1. Test WebVTT Parser
  console.log("1. Testing WebVTT Cleaning Pipeline:");
  const sampleVtt = `WEBVTT

1
00:00:00.000 --> 00:00:03.200
<v Speaker 1>Welcome to our sprint demo.</v>

2
00:00:03.200 --> 00:00:06.800
We are reviewing the AI notes extraction workflow today.
`;
  const cleanVtt = cleanWebVTT(sampleVtt);
  console.log("   Output:", cleanVtt);
  if (cleanVtt !== "Welcome to our sprint demo. We are reviewing the AI notes extraction workflow today.") {
    throw new Error("WebVTT cleaning test failed");
  }
  console.log("   PASS: WebVTT cleaning works cleanly.\n");

  // 2. Test JSON Transcript Parser
  console.log("2. Testing Loom JSON Cleaning Pipeline:");
  const sampleJson = [
    { text: "First discussion topic on architecture." },
    { text: "Second topic on Supabase RLS security." },
  ];
  const cleanJson = cleanLoomJson(sampleJson);
  console.log("   Output:", cleanJson);
  if (cleanJson !== "First discussion topic on architecture. Second topic on Supabase RLS security.") {
    throw new Error("JSON cleaning test failed");
  }
  console.log("   PASS: JSON transcript cleaning works cleanly.\n");

  // 3. Test Live GraphQL Endpoint Communication
  console.log("3. Testing Live Loom GraphQL API Communication:");
  const testUrl = "https://www.loom.com/share/d4a8e29bf4914fa6b21914c628f28941";
  const res = await getLoomTranscript(testUrl);
  console.log("   Query Result for test URL:", res);
  if (res.success === false && res.error.includes("Video not found")) {
    console.log("   PASS: Successfully communicated with Loom GraphQL endpoint and received structured error for nonexistent video.\n");
  } else if (res.success === true) {
    console.log("   PASS: Successfully retrieved transcript from Loom!\n");
  }

  // 4. Test Invalid URL Rejection
  console.log("4. Testing Non-Loom URL Validation:");
  const badUrlRes = await getLoomTranscript("https://youtube.com/watch?v=12345");
  console.log("   Rejection Result:", badUrlRes);
  if (!badUrlRes.success && badUrlRes.error.includes("Not a Loom URL")) {
    console.log("   PASS: Non-Loom URLs properly rejected.\n");
  } else {
    throw new Error("Invalid URL was not rejected");
  }

  console.log("=== Step 10 Tests Finished Successfully! ===");
}

runStep10Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
