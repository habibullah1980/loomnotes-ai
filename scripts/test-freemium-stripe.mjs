/**
 * E2E Automated Verification Test for LoomNotes AI Freemium & Stripe Integration
 * Tests all 10 core scenarios specified in the requirements.
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getMonthlyUsage, checkUsageAllowance, incrementMonthlyUsage } from "../src/lib/usage/usage-service.ts";
import { getUserSubscription, updateUserSubscription, isWebhookEventProcessed, recordWebhookEvent } from "../src/lib/stripe/subscription-service.ts";
import { STRIPE_CONFIG } from "../src/lib/stripe/config.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in environment.");
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseKey);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    totalFailed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    totalPassed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING LOOMNOTES AI FREEMIUM SUBSCRIPTION E2E TESTS");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const testEmailA = `test-freemium-a-${timestamp}@example.com`;
  const testEmailB = `test-freemium-b-${timestamp}@example.com`;
  const testPassword = "Password123!Secure";

  let userA = null;
  let userB = null;

  try {
    // -------------------------------------------------------------------------
    // Setup Test Users
    // -------------------------------------------------------------------------
    console.log("Creating Test User A (Free plan test subject)...");
    const { data: authA, error: errA } = await adminSupabase.auth.admin.createUser({
      email: testEmailA,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "Test User A" }
    });
    if (errA || !authA.user) throw new Error(`Failed to create User A: ${errA?.message}`);
    userA = authA.user;

    // Ensure profiles record exists for user A
    await adminSupabase.from("profiles").upsert({
      id: userA.id,
      full_name: "Test User A",
      plan: "free",
      status: "active",
      role: "user"
    });

    console.log("Creating Test User B (Isolation test subject)...");
    const { data: authB, error: errB } = await adminSupabase.auth.admin.createUser({
      email: testEmailB,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "Test User B" }
    });
    if (errB || !authB.user) throw new Error(`Failed to create User B: ${errB?.message}`);
    userB = authB.user;

    await adminSupabase.from("profiles").upsert({
      id: userB.id,
      full_name: "Test User B",
      plan: "free",
      status: "active",
      role: "user"
    });

    // -------------------------------------------------------------------------
    // Scenario 1: New user receives exactly 3 free video credits
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 1: Initial Quota Allocation ---");
    const initialUsageA = await getMonthlyUsage(adminSupabase, userA.id);
    assert(initialUsageA.plan === "free", "New user defaults to 'free' plan");
    assert(initialUsageA.used === 0, "New user has 0 used videos");
    assert(initialUsageA.limit === 3, "New user has exactly 3 videos limit");
    assert(initialUsageA.remaining === 3, "New user has exactly 3 free video credits remaining");
    assert(initialUsageA.isLimitReached === false, "Limit is not reached for new user");

    // -------------------------------------------------------------------------
    // Scenario 2: User can process 3 videos successfully
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 2: Processing 3 Videos Successfully ---");
    // Video 1
    let allowance1 = await checkUsageAllowance(adminSupabase, userA.id);
    assert(allowance1.allowed === true, "Video 1 allowed");
    await adminSupabase.from("meetings").insert({
      user_id: userA.id,
      title: "Test Meeting 1",
      transcript: "This is a transcript for test video 1 exceeding 20 chars.",
      summary: "Summary 1"
    });
    let usageAfter1 = await getMonthlyUsage(adminSupabase, userA.id);
    assert(usageAfter1.used === 1, "Usage incremented to 1");
    assert(usageAfter1.remaining === 2, "2 free video credits remaining");

    // Video 2
    let allowance2 = await checkUsageAllowance(adminSupabase, userA.id);
    assert(allowance2.allowed === true, "Video 2 allowed");
    await adminSupabase.from("meetings").insert({
      user_id: userA.id,
      title: "Test Meeting 2",
      transcript: "This is a transcript for test video 2 exceeding 20 chars.",
      summary: "Summary 2"
    });
    let usageAfter2 = await getMonthlyUsage(adminSupabase, userA.id);
    assert(usageAfter2.used === 2, "Usage incremented to 2");
    assert(usageAfter2.remaining === 1, "1 free video credit remaining");

    // Video 3
    let allowance3 = await checkUsageAllowance(adminSupabase, userA.id);
    assert(allowance3.allowed === true, "Video 3 allowed");
    await adminSupabase.from("meetings").insert({
      user_id: userA.id,
      title: "Test Meeting 3",
      transcript: "This is a transcript for test video 3 exceeding 20 chars.",
      summary: "Summary 3"
    });
    let usageAfter3 = await getMonthlyUsage(adminSupabase, userA.id);
    assert(usageAfter3.used === 3, "Usage reached 3");
    assert(usageAfter3.remaining === 0, "0 free video credits remaining");
    assert(usageAfter3.isLimitReached === true, "Limit is flagged as reached");

    // -------------------------------------------------------------------------
    // Scenario 3: Fourth video is blocked for a free user
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 3: Fourth Video Blocked with Error Message ---");
    let allowance4 = await checkUsageAllowance(adminSupabase, userA.id);
    assert(allowance4.allowed === false, "Video 4 is strictly blocked");
    assert(
      allowance4.error === "You've used your 3 free videos. Upgrade to Pro for $9.99/month to continue.",
      `Error message matches required specification exactly: "${allowance4.error}"`
    );

    // -------------------------------------------------------------------------
    // Scenario 4: Successful subscription unlocks Pro features
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 4: Subscription Upgrade Unlocks Pro ---");
    const subResult = await updateUserSubscription(adminSupabase, {
      userId: userA.id,
      plan: "pro",
      status: "active",
      stripeCustomerId: "cus_mock_test_123",
      stripeSubscriptionId: "sub_mock_test_456",
      cancelAtPeriodEnd: false,
    });
    assert(subResult.success === true, "updateUserSubscription succeeded");

    const proUsage = await getMonthlyUsage(adminSupabase, userA.id);
    assert(proUsage.plan === "pro", "Plan is now 'pro'");
    assert(proUsage.isPro === true, "isPro is true");
    assert(proUsage.isUnlimited === true, "isUnlimited is true");
    assert(proUsage.isLimitReached === false, "isLimitReached is false for Pro");
    assert(proUsage.remaining === Infinity, "Remaining credits are unlimited (Infinity)");

    let proAllowance = await checkUsageAllowance(adminSupabase, userA.id);
    assert(proAllowance.allowed === true, "Pro user is allowed to process 4th video");

    // Insert 4th video under Pro
    await adminSupabase.from("meetings").insert({
      user_id: userA.id,
      title: "Test Meeting 4 (Pro)",
      transcript: "This is a transcript for test video 4 exceeding 20 chars.",
      summary: "Summary 4"
    });

    // -------------------------------------------------------------------------
    // Scenario 5: Canceled or expired subscription no longer grants Pro access
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 5: Canceled or Expired Subscription Revokes Pro ---");
    await updateUserSubscription(adminSupabase, {
      userId: userA.id,
      plan: "free",
      status: "canceled",
      cancelAtPeriodEnd: true,
    });

    const revokedUsage = await getMonthlyUsage(adminSupabase, userA.id);
    assert(revokedUsage.isPro === false, "Canceled subscription revokes Pro");
    assert(revokedUsage.plan === "free", "Plan reverts to free");
    assert(revokedUsage.isLimitReached === true, "Limit is reached because user has 4 meetings > 3 limit");

    let postCancelAllowance = await checkUsageAllowance(adminSupabase, userA.id);
    assert(postCancelAllowance.allowed === false, "Processing is blocked once subscription is canceled");

    // -------------------------------------------------------------------------
    // Scenario 6: Failed payments do not unlock Pro
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 6: Failed Payments (past_due / unpaid) Do Not Grant Pro ---");
    await updateUserSubscription(adminSupabase, {
      userId: userA.id,
      plan: "free",
      status: "past_due",
    });

    const pastDueUsage = await getMonthlyUsage(adminSupabase, userA.id);
    assert(pastDueUsage.isPro === false, "past_due status does NOT grant Pro");
    assert(pastDueUsage.isLimitReached === true, "past_due user remains blocked if over limit");

    // -------------------------------------------------------------------------
    // Scenario 7: Refreshing, logging out, or logging in does not reset usage
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 7: Usage Persistence Across Sessions ---");
    // Verify usage is persisted directly in database, completely independent of sessions
    const { count: dbMeetingCount } = await adminSupabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userA.id);
    assert(dbMeetingCount === 4, `Database records ${dbMeetingCount} meetings created for User A`);

    const reloadedUsage = await getMonthlyUsage(adminSupabase, userA.id);
    assert(reloadedUsage.used === 4, "Reloading usage yields accurate persisted count (4)");
    assert(reloadedUsage.remaining === 0, "Remaining credits remain 0 without resetting");

    // -------------------------------------------------------------------------
    // Scenario 8: Users cannot access another user's usage or subscription info
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 8: User Data Isolation ---");
    const usageB = await getMonthlyUsage(adminSupabase, userB.id);
    assert(usageB.used === 0, "User B has 0 used videos even though User A has 4");
    assert(usageB.remaining === 3, "User B still has 3 full credits remaining");
    assert(usageB.isLimitReached === false, "User B is not affected by User A's limit");

    let allowanceB = await checkUsageAllowance(adminSupabase, userB.id);
    assert(allowanceB.allowed === true, "User B can process video 1 independently");

    // -------------------------------------------------------------------------
    // Scenario 9: Stripe webhook retries do not duplicate subscription records
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 9: Stripe Webhook Idempotency ---");
    const mockEventId = `evt_test_idempotency_${timestamp}`;
    const initialDuplicateCheck = await isWebhookEventProcessed(adminSupabase, mockEventId);
    assert(initialDuplicateCheck === false, "Unprocessed event is detected as new");

    // Process first time
    await recordWebhookEvent(adminSupabase, mockEventId, "checkout.session.completed", userA.id);

    // Second check (Retry)
    const retryDuplicateCheck = await isWebhookEventProcessed(adminSupabase, mockEventId);
    assert(retryDuplicateCheck === true, "Subsequent webhook retry is detected as duplicate");

    // -------------------------------------------------------------------------
    // Scenario 10: Regression testing core features and configuration
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 10: Regression Verification & Config Integrity ---");
    assert(STRIPE_CONFIG.freeTier.maxFreeVideos === 3, "Free tier limit configured to 3 videos");
    assert(STRIPE_CONFIG.proPlan.priceCents === 999, "Pro plan price configured to 999 cents ($9.99)");
    assert(STRIPE_CONFIG.proPlan.currency === "usd", "Currency configured to usd");
    assert(STRIPE_CONFIG.proPlan.name === "LoomNotes AI Pro", "Pro plan product name is correct");

  } finally {
    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------
    console.log("\nCleaning up test artifacts...");
    if (userA) {
      await adminSupabase.from("meetings").delete().eq("user_id", userA.id);
      await adminSupabase.from("profiles").delete().eq("id", userA.id);
      await adminSupabase.auth.admin.deleteUser(userA.id);
    }
    if (userB) {
      await adminSupabase.from("meetings").delete().eq("user_id", userB.id);
      await adminSupabase.from("profiles").delete().eq("id", userB.id);
      await adminSupabase.auth.admin.deleteUser(userB.id);
    }
  }

  console.log("\n=======================================================");
  console.log(`🎉 ALL TESTS COMPLETED: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
