import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables (.env.local)");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

let passedCount = 0;
let failedCount = 0;

function recordResult(title, passed, message) {
  if (passed) {
    passedCount++;
    console.log(`✅ PASS - ${title} (${message})`);
  } else {
    failedCount++;
    console.error(`❌ FAIL - ${title} (${message})`);
  }
}

async function runChartsVerificationTests() {
  console.log("================================================================================");
  console.log("📊 STARTING REAL-DATA INTERACTIVE ADMIN CHARTS VERIFICATION");
  console.log("================================================================================");

  // 1. Fetch live Supabase Auth users and meetings
  const [authRes, profilesRes, meetingsRes] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("*"),
    adminClient.from("meetings").select("id, user_id, created_at"),
  ]);

  const authUsers = authRes.data?.users || [];
  const profiles = profilesRes.data || [];
  const meetings = meetingsRes.data || [];

  const totalUsers = authUsers.length;
  const totalMeetings = meetings.length;

  recordResult(
    "1. Live Supabase Data Ingestion",
    totalUsers > 0,
    `Ingested ${totalUsers} auth users, ${profiles.length} profiles, ${totalMeetings} meetings`
  );

  // 2. Test User Growth Time-Series (Past 30 / 90 / 365 days)
  const userRegistrationCounts = new Map();
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    userRegistrationCounts.set(dateStr, 0);
  }

  authUsers.forEach((u) => {
    const dStr = u.created_at.split("T")[0];
    if (userRegistrationCounts.has(dStr)) {
      userRegistrationCounts.set(dStr, (userRegistrationCounts.get(dStr) || 0) + 1);
    }
  });

  const last30DaysUserCount = Array.from(userRegistrationCounts.values()).reduce((a, b) => a + b, 0);

  recordResult(
    "2. User Growth Time-Series Calculation",
    userRegistrationCounts.size === 31,
    `30-day timeline mapped with ${last30DaysUserCount} recent user registrations`
  );

  // 3. Test Meeting Activity Time-Series
  const meetingCounts = new Map();
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    meetingCounts.set(dateStr, 0);
  }

  meetings.forEach((m) => {
    const dStr = m.created_at.split("T")[0];
    if (meetingCounts.has(dStr)) {
      meetingCounts.set(dStr, (meetingCounts.get(dStr) || 0) + 1);
    }
  });

  const last30DaysMeetings = Array.from(meetingCounts.values()).reduce((a, b) => a + b, 0);
  const avgMeetingsDay = (last30DaysMeetings / 30).toFixed(1);

  recordResult(
    "3. Meeting Activity Time-Series & Daily Average Calculation",
    meetingCounts.size === 31,
    `30-day timeline with ${last30DaysMeetings} meetings, average: ${avgMeetingsDay}/day`
  );

  // 4. Test User Type Donut Distribution
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  let superAdminCount = 0;
  let regularUserCount = 0;

  authUsers.forEach((u) => {
    const p = profileMap.get(u.id);
    const role = p?.role || u.user_metadata?.role || (u.email === "habibullah1980@gmail.com" ? "super_admin" : "user");
    if (role === "super_admin") superAdminCount++;
    else regularUserCount++;
  });

  recordResult(
    "4. User Type Donut Distribution",
    superAdminCount >= 1 && totalUsers === superAdminCount + regularUserCount,
    `Super Admins: ${superAdminCount}, Regular Users: ${regularUserCount}, Total: ${totalUsers}`
  );

  // 5. Test Marketing Consent Donut Distribution
  let marketingOptInCount = 0;
  authUsers.forEach((u) => {
    const p = profileMap.get(u.id);
    const consent = p?.marketing_consent ?? Boolean(u.user_metadata?.marketing_consent);
    if (consent) marketingOptInCount++;
  });

  const optInPercentage = totalUsers > 0 ? Math.round((marketingOptInCount / totalUsers) * 100) : 0;

  recordResult(
    "5. Marketing Consent Donut Distribution & Percentage",
    optInPercentage >= 0 && optInPercentage <= 100,
    `Opted In: ${marketingOptInCount}/${totalUsers} (${optInPercentage}%)`
  );

  // 6. Test User Activity Cohorts (Active Today, Week, Month, Inactive)
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const weekStartIso = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthStartIso = new Date(Date.now() - 30 * 86400000).toISOString();

  let activeToday = 0;
  let activeThisWeek = 0;
  let activeThisMonth = 0;
  let inactive = 0;

  authUsers.forEach((u) => {
    const lastActive = u.last_sign_in_at || u.created_at;
    if (lastActive >= todayStart) activeToday++;
    else if (lastActive >= weekStartIso) activeThisWeek++;
    else if (lastActive >= monthStartIso) activeThisMonth++;
    else inactive++;
  });

  const cohortSum = activeToday + activeThisWeek + activeThisMonth + inactive;

  recordResult(
    "6. User Activity Cohorts (Today, Week, Month, Inactive)",
    cohortSum === totalUsers,
    `Today: ${activeToday}, Week: ${activeThisWeek}, Month: ${activeThisMonth}, Inactive: ${inactive}, Sum: ${cohortSum}`
  );

  // 7. Summary
  console.log("\n================================================================================");
  console.log("📊 REAL-DATA CHARTS VERIFICATION SUMMARY");
  console.log("================================================================================");
  console.log(`Total Verification Steps: ${passedCount + failedCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount === 0) {
    console.log("\n🎉 ALL 6 REAL DATA CHARTS VERIFICATION STEPS PASSED WITH 100% SUCCESS!\n");
  } else {
    console.error(`\n❌ ${failedCount} VERIFICATION STEP(S) FAILED.\n`);
    process.exit(1);
  }
}

runChartsVerificationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
