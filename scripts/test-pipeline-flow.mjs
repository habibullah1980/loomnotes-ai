import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
  console.error("Missing environment configuration");
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseAnonKey);
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const TEST_TRANSCRIPT = `Sarah (Product Lead): Hey everyone, let's finalize the action items for LoomNotes AI.
Michael (Backend Eng): I have hooked up the Gemini structured outputs. The prompt returns clean JSON summaries, takeaways, and tasks.
Sarah: Excellent. Michael, please deploy the new migration to Supabase by 2026-10-15.
Alex (Frontend Eng): I will test the action item checkboxes on the meeting detail page.
Sarah: Perfect. Let's aim to have the full workflow tested by tomorrow.`;

async function runStep5CTest() {
  console.log("🧪 Running Step 5C End-to-End Pipeline Verification...\n");

  // 1. Authenticate user with password (Respecting RLS)
  console.log("1️⃣ Authenticating Super Admin with Supabase...");
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: "habibullah1980@gmail.com",
    password: "habib8963",
  });

  if (authError || !authData.user) {
    console.error("❌ Authentication failed:", authError?.message);
    process.exit(1);
  }

  const user = authData.user;
  console.log(`   ✅ Authenticated as: ${user.email} (ID: ${user.id})`);

  // 2. Call Gemini for Strict Structured Notes
  console.log("\n2️⃣ Sending Transcript to Google Gemini for Structured JSON...");
  const prompt = `Meeting Title: "Product Roadmap Sync"\n\nTranscript:\n"""\n${TEST_TRANSCRIPT}\n"""\n\nAnalyze this transcript and produce the required JSON format containing:\n- summary (string)\n- key_takeaways (array of strings)\n- action_items (array of objects with task, assignee, and due_date in YYYY-MM-DD format or null)`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      summary: { type: "STRING" },
      key_takeaways: {
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
    },
    required: ["summary", "key_takeaways", "action_items"],
  };

  const startTime = Date.now();
  const aiResponse = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const duration = Date.now() - startTime;
  console.log(`   ✅ Gemini generated structured response in ${duration}ms:`);

  const notes = JSON.parse(aiResponse.text);
  console.log(`   • Summary: "${notes.summary}"`);
  console.log(`   • Key Takeaways: ${notes.key_takeaways.length} extracted`);
  console.log(`   • Action Items: ${notes.action_items.length} extracted`);
  notes.action_items.forEach((a, i) => {
    console.log(`     [${i + 1}] Task: "${a.task}" | Assignee: ${a.assignee ?? "none"} | Due: ${a.due_date ?? "none"}`);
  });

  // 3. Insert into Supabase meetings table (Authenticated Client under RLS)
  console.log("\n3️⃣ Persisting Meeting to Supabase under RLS...");
  const meetingPayload = {
    user_id: user.id,
    title: "Product Roadmap Sync",
    transcript: TEST_TRANSCRIPT,
    summary: notes.summary,
  };

  const { data: meeting, error: meetingError } = await client
    .from("meetings")
    .insert(meetingPayload)
    .select("id, title, summary, created_at")
    .single();

  if (meetingError) {
    console.error("❌ Failed to insert meeting:", meetingError.message);
    process.exit(1);
  }

  console.log(`   ✅ Meeting record created: ID ${meeting.id}`);

  // 4. Insert Action Items into action_items table
  console.log("\n4️⃣ Inserting Action Items into Supabase...");
  const actionItemsPayload = notes.action_items.map((item) => ({
    meeting_id: meeting.id,
    task: item.task,
    assignee: item.assignee,
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(item.due_date) ? item.due_date : null,
    completed: false,
  }));

  const { data: insertedActions, error: actionError } = await client
    .from("action_items")
    .insert(actionItemsPayload)
    .select("id, task, assignee, due_date, completed");

  if (actionError) {
    console.error("❌ Failed to insert action items:", actionError.message);
    process.exit(1);
  }

  console.log(`   ✅ ${insertedActions.length} action item(s) inserted successfully!`);

  // 5. Insert Key Takeaways into key_takeaways table
  console.log("\n5️⃣ Inserting Key Takeaways into Supabase...");
  const takeawaysPayload = notes.key_takeaways.map((content) => ({
    meeting_id: meeting.id,
    content,
  }));

  const { data: insertedTakeaways, error: takeawayError } = await client
    .from("key_takeaways")
    .insert(takeawaysPayload)
    .select("id, content");

  if (takeawayError) {
    console.error("❌ Failed to insert key takeaways:", takeawayError.message);
    process.exit(1);
  }

  console.log(`   ✅ ${insertedTakeaways.length} key takeaway(s) inserted successfully!`);

  // 6. Test Interactive Action Item Toggle (Completion state)
  console.log("\n6️⃣ Testing Action Item Toggle Checkbox...");
  const firstAction = insertedActions[0];
  const { data: updatedAction, error: updateError } = await client
    .from("action_items")
    .update({ completed: true })
    .eq("id", firstAction.id)
    .select("id, completed")
    .single();

  if (updateError) {
    console.error("❌ Failed to toggle action item:", updateError.message);
    process.exit(1);
  }

  console.log(`   ✅ Action item ${updatedAction.id} marked completed: ${updatedAction.completed}`);

  // 7. Verify Retrieval of Full Meeting Hierarchy
  console.log("\n7️⃣ Verifying Meeting Detail Page Query Hierarchy...");
  const { data: retrievedMeeting, error: readError } = await client
    .from("meetings")
    .select("*, action_items(*), key_takeaways(*)")
    .eq("id", meeting.id)
    .single();

  if (readError) {
    console.error("❌ Failed to read meeting hierarchy:", readError.message);
    process.exit(1);
  }

  console.log(`   ✅ Retrieved Meeting: "${retrievedMeeting.title}"`);
  console.log(`   • Summary length: ${retrievedMeeting.summary.length} characters`);
  console.log(`   • Action items attached: ${retrievedMeeting.action_items.length}`);
  console.log(`   • Key takeaways attached: ${retrievedMeeting.key_takeaways.length}`);

  console.log("\n✨ Step 5C End-to-End Pipeline Verification COMPLETE & PASSED!\n");
}

runStep5CTest();
