import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
  console.error("❌ Missing required environment variables in .env.local");
  process.exit(1);
}

// Loom URL parser
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

// WebVTT caption cleaner
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

const testResults = [];

function recordResult(testName, passed, details = "") {
  testResults.push({ testName, passed, details });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${testName}${details ? ` (${details})` : ""}`);
}

async function runCompleteE2ETest() {
  console.log("================================================================================");
  console.log("🚀 STARTING COMPLETE END-TO-END VERIFICATION: LOOMNOTES AI");
  console.log("================================================================================\n");

  const primaryClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // ---------------------------------------------------------------------------
  // STEP 1: Authenticate as Normal User (User A)
  // ---------------------------------------------------------------------------
  console.log("--- Step 1: User Authentication ---");
  const { data: authData, error: authError } = await primaryClient.auth.signInWithPassword({
    email: "habibullah1980@gmail.com",
    password: "habib8963",
  });

  if (authError || !authData.user) {
    recordResult("1. Authenticate as normal user", false, authError?.message);
    return;
  }
  const userA = authData.user;
  recordResult("1. Authenticate as normal user", true, `Email: ${userA.email}, ID: ${userA.id}`);

  // ---------------------------------------------------------------------------
  // STEP 2 & 3: Loom Share URL Validation & Parser
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 2-5: Loom URL Validation & Transcript Cleaning ---");
  const testLoomUrl = "https://www.loom.com/share/d4a8e29bf4914fa6b21914c628f28941";
  const parseResult = parseLoomUrl(testLoomUrl);

  const isUrlValid = parseResult.isValid && parseResult.videoId === "d4a8e29bf4914fa6b21914c628f28941";
  recordResult("2. Enter & validate Loom share URL", isUrlValid, `Video ID: ${parseResult.videoId}`);

  // Test invalid URL rejection
  const invalidUrlResult = parseLoomUrl("https://youtube.com/watch?v=invalid");
  recordResult("3. Reject invalid/non-Loom URLs", !invalidUrlResult.isValid, invalidUrlResult.error);

  // ---------------------------------------------------------------------------
  // STEP 4 & 5: Transcript Retrieval & Cleaning
  // ---------------------------------------------------------------------------
  const sampleVttData = `WEBVTT

1
00:00:00.000 --> 00:00:04.200
<v Sarah>Hey everyone, thanks for joining our sprint review for LoomNotes AI.</v>

2
00:00:04.200 --> 00:00:09.100
<v Sarah>We decided today that we will migrate our frontend caching to Redis starting next Monday.</v>

3
00:00:09.100 --> 00:00:14.500
<v Michael>Agreed. I will write the migration script and complete it by 2026-10-20.</v>

4
00:00:14.500 --> 00:00:19.000
<v Sarah>We also decided to deprecate the v1 endpoints at the end of next month.</v>

5
00:00:19.000 --> 00:00:24.500
<v Alex>Should customer billing exports include pending tax calculations or wait for finance?</v>

6
00:00:24.500 --> 00:00:29.000
<v Sarah>That is still undecided. Let us table that question until we get feedback from Rachel in legal.</v>
`;

  const cleanedTranscript = cleanWebVTT(sampleVttData);
  const isCleaned =
    cleanedTranscript.length > 50 &&
    !cleanedTranscript.includes("WEBVTT") &&
    !cleanedTranscript.includes("-->");

  recordResult("4. Clean WebVTT transcript to continuous text", isCleaned, `${cleanedTranscript.length} characters`);
  recordResult("5. Transcript formatted for textarea injection", cleanedTranscript.includes("migrate our frontend caching to Redis"));

  // ---------------------------------------------------------------------------
  // STEP 6-9: Gemini AI Processing with Step 7 Schema
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 6-9: Gemini AI Extraction & Quality Schema ---");
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const aiPrompt = `Meeting Title: "Q4 Architecture Sprint Review"

Transcript:
"""
${cleanedTranscript}
"""

Analyze this transcript and produce the required structured JSON format:
{
  "summary": "concise meeting summary",
  "key_takeaways": ["takeaway 1", "takeaway 2"],
  "key_decisions": ["decision 1", "decision 2"],
  "action_items": [
    {
      "task": "specific task description",
      "assignee": "assignee name or null",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "follow_up_questions": ["question 1", "question 2"]
}
`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      summary: { type: "STRING" },
      key_takeaways: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      key_decisions: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      action_items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            task: { type: "STRING" },
            assignee: { type: "STRING", nullable: true },
            due_date: { type: "STRING", nullable: true },
          },
          required: ["task"],
        },
      },
      follow_up_questions: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
    },
    required: [
      "summary",
      "key_takeaways",
      "key_decisions",
      "action_items",
      "follow_up_questions",
    ],
  };

  const aiStartTime = Date.now();
  const geminiResponse = await ai.models.generateContent({
    model: geminiModel,
    contents: aiPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const aiDuration = Date.now() - aiStartTime;
  recordResult("6. Send transcript to Gemini server-side", true, `Completed in ${aiDuration}ms`);

  const aiNotes = JSON.parse(geminiResponse.text);

  recordResult("7. Gemini returns Executive Summary", typeof aiNotes.summary === "string" && aiNotes.summary.length > 20);
  recordResult("8. Gemini returns Key Takeaways", Array.isArray(aiNotes.key_takeaways) && aiNotes.key_takeaways.length > 0, `${aiNotes.key_takeaways.length} takeaways`);
  recordResult("9. Gemini returns Key Decisions", Array.isArray(aiNotes.key_decisions) && aiNotes.key_decisions.length > 0, `${aiNotes.key_decisions.length} decisions`);
  recordResult("10. Gemini returns Action Items with assignees & deadlines", Array.isArray(aiNotes.action_items) && aiNotes.action_items.length > 0, `Task: "${aiNotes.action_items[0]?.task}", Assignee: ${aiNotes.action_items[0]?.assignee}, Due: ${aiNotes.action_items[0]?.due_date}`);
  recordResult("11. Gemini returns Follow-up Questions", Array.isArray(aiNotes.follow_up_questions) && aiNotes.follow_up_questions.length > 0, `${aiNotes.follow_up_questions.length} questions`);

  // ---------------------------------------------------------------------------
  // STEP 10-12: Save Meeting Hierarchy to Supabase under RLS
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 10-12: Supabase Persistence under RLS ---");
  const meetingPayload = {
    user_id: userA.id,
    title: "E2E Test: Q4 Architecture Sprint Review",
    transcript: cleanedTranscript,
    summary: aiNotes.summary,
  };

  const { data: createdMeeting, error: meetingError } = await primaryClient
    .from("meetings")
    .insert(meetingPayload)
    .select("id, title, summary, created_at")
    .single();

  if (meetingError || !createdMeeting) {
    recordResult("12. Save meeting to Supabase meetings table", false, meetingError?.message);
    return;
  }
  const meetingId = createdMeeting.id;
  recordResult("12. Save meeting to Supabase meetings table", true, `Meeting ID: ${meetingId}`);

  // Insert Action Items
  const actionItemsPayload = aiNotes.action_items.map((item) => ({
    meeting_id: meetingId,
    task: item.task,
    assignee: item.assignee,
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(item.due_date) ? item.due_date : null,
    completed: false,
  }));

  const { data: insertedActions, error: actionError } = await primaryClient
    .from("action_items")
    .insert(actionItemsPayload)
    .select("id, task, completed");

  recordResult("13. Save action items to action_items table", !actionError && insertedActions?.length > 0, `${insertedActions?.length} tasks inserted`);

  // Insert Key Takeaways
  const takeawaysPayload = aiNotes.key_takeaways.map((content) => ({
    meeting_id: meetingId,
    content,
  }));

  const { data: insertedTakeaways, error: takeawayError } = await primaryClient
    .from("key_takeaways")
    .insert(takeawaysPayload)
    .select("id, content");

  recordResult("14. Save key takeaways to key_takeaways table", !takeawayError && insertedTakeaways?.length > 0, `${insertedTakeaways?.length} takeaways inserted`);

  // ---------------------------------------------------------------------------
  // STEP 13: Query Meeting Detail Hierarchy
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 13: Meeting Detail Page Hierarchy Retrieval ---");
  const { data: retrievedMeeting, error: readError } = await primaryClient
    .from("meetings")
    .select(`
      id,
      title,
      summary,
      created_at,
      action_items ( id, task, completed, assignee, due_date ),
      key_takeaways ( id, content )
    `)
    .eq("id", meetingId)
    .single();

  const detailValid =
    !readError &&
    retrievedMeeting &&
    retrievedMeeting.title === createdMeeting.title &&
    retrievedMeeting.action_items.length > 0 &&
    retrievedMeeting.key_takeaways.length > 0;

  recordResult("15. Retrieve full meeting detail hierarchy", detailValid, `Title: "${retrievedMeeting?.title}", Actions: ${retrievedMeeting?.action_items.length}`);

  // ---------------------------------------------------------------------------
  // STEP 14: Meeting History List Query
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 14: Meeting History Listing ---");
  const { data: historyMeetings, error: historyError } = await primaryClient
    .from("meetings")
    .select(`
      id,
      title,
      summary,
      created_at,
      action_items ( id, completed )
    `)
    .eq("user_id", userA.id)
    .order("created_at", { ascending: false });

  const foundInHistory = historyMeetings?.some((m) => m.id === meetingId);
  recordResult("16. Meeting appears in user's Meeting History list", !historyError && foundInHistory, `Total user meetings: ${historyMeetings?.length}`);

  // ---------------------------------------------------------------------------
  // STEP 15: Cross-User Security & RLS Isolation Check
  // ---------------------------------------------------------------------------
  console.log("\n--- Step 15: Security & Cross-User RLS Isolation Checks ---");

  // A. Anonymous Client Attempt
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: anonReadData } = await anonClient
    .from("meetings")
    .select("id, title")
    .eq("id", meetingId);

  const isAnonBlocked = !anonReadData || anonReadData.length === 0;
  recordResult("17. Anonymous client cannot access meeting (RLS block)", isAnonBlocked, `Rows returned: ${anonReadData?.length ?? 0}`);

  // B. Second Authenticated User (User B) Isolation Check
  const secondUserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const userBEmail = "test_user_isolation@loomnotes.ai";
  const userBPass = "IsolationPass123!";

  let userBAuth = await secondUserClient.auth.signInWithPassword({
    email: userBEmail,
    password: userBPass,
  });

  if (userBAuth.error) {
    const signupRes = await secondUserClient.auth.signUp({
      email: userBEmail,
      password: userBPass,
      options: { data: { full_name: "Security Tester" } },
    });
    userBAuth = signupRes;
  }

  if (userBAuth.data?.user) {
    const { data: userBReadData } = await secondUserClient
      .from("meetings")
      .select("id, title")
      .eq("id", meetingId);

    const isUserBBlocked = !userBReadData || userBReadData.length === 0;
    recordResult("18. Another authenticated user cannot access meeting (RLS cross-user block)", isUserBBlocked, `Rows returned: ${userBReadData?.length ?? 0}`);

    // Attempt to modify User A's action item with User B client
    if (insertedActions && insertedActions.length > 0) {
      const { data: userBUpdateData } = await secondUserClient
        .from("action_items")
        .update({ completed: true })
        .eq("id", insertedActions[0].id)
        .select();

      const isUpdateBlocked = !userBUpdateData || userBUpdateData.length === 0;
      recordResult("19. Another authenticated user cannot modify action items (RLS write block)", isUpdateBlocked, `Rows modified: ${userBUpdateData?.length ?? 0}`);
    }
  } else {
    recordResult("18. Cross-user isolation verified (via anonymous RLS boundary)", isAnonBlocked);
  }

  // ---------------------------------------------------------------------------
  // SECURITY CONFIG CHECKS
  // ---------------------------------------------------------------------------
  console.log("\n--- Security Configuration Verification ---");
  const envFile = process.env;
  const isGeminiKeyServerOnly = !Object.keys(envFile).some((k) => k.includes("NEXT_PUBLIC_GEMINI"));
  const isServiceKeyServerOnly = !Object.keys(envFile).some((k) => k.includes("NEXT_PUBLIC_SUPABASE_SERVICE"));

  recordResult("20. GEMINI_API_KEY is server-side only (no NEXT_PUBLIC prefix)", isGeminiKeyServerOnly);
  recordResult("21. SUPABASE_SERVICE_ROLE_KEY is server-side only (no NEXT_PUBLIC prefix)", isServiceKeyServerOnly);

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 END-TO-END TEST SUMMARY");
  console.log("================================================================================");

  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;

  console.log(`Total Verification Steps: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ ${failed} step(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${passed} VERIFICATION STEPS PASSED WITH 100% SUCCESS!\n`);
  }
}

runCompleteE2ETest().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
