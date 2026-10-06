import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

async function run() {
  console.log("=== Testing Step 6: Meeting History & RLS Security ===");

  // 1. Test unauthenticated access (Should return empty or error due to RLS)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: anonMeetings, error: anonError } = await anonClient
    .from("meetings")
    .select("id, title");

  console.log("1. Anonymous query results (RLS check):", {
    count: anonMeetings?.length ?? 0,
    hasData: (anonMeetings?.length ?? 0) > 0,
  });

  if ((anonMeetings?.length ?? 0) > 0) {
    console.error("FAIL: Anonymous client was able to read meetings! RLS violation.");
    return;
  }
  console.log("PASS: Anonymous client cannot read meetings under RLS.");

  // 2. Authenticate as habibullah1980
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
    email: "habibullah1980@gmail.com",
    password: "habib8963",
  });

  if (authError || !authData.user) {
    console.error("FAIL: Could not authenticate user:", authError?.message);
    return;
  }
  console.log("PASS: Authenticated as user:", authData.user.email, "(ID:", authData.user.id, ")");

  // 3. Query meetings with action_items(id, completed) exactly as done in /dashboard/meetings
  const { data: userMeetings, error: queryError } = await userClient
    .from("meetings")
    .select(`
      id,
      title,
      summary,
      created_at,
      action_items (
        id,
        completed
      )
    `)
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (queryError) {
    console.error("FAIL: Error fetching user meetings:", queryError.message);
    return;
  }

  console.log(`PASS: Fetched ${userMeetings.length} meetings for user.`);
  if (userMeetings.length > 0) {
    const m = userMeetings[0];
    const totalTasks = m.action_items?.length ?? 0;
    const completedTasks = m.action_items?.filter((t) => t.completed).length ?? 0;
    console.log("Sample Meeting Card Data:", {
      id: m.id,
      title: m.title,
      created_at: m.created_at,
      total_action_items: totalTasks,
      completed_action_items: completedTasks,
    });
  }

  console.log("=== All Meeting History tests passed successfully! ===");
}

run();
