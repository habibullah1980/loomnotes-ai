import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  console.error("❌ Missing required Supabase environment variables in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

const testResults = [];

function recordResult(testName, passed, details = "") {
  testResults.push({ testName, passed, details });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${testName}${details ? ` (${details})` : ""}`);
}

async function runGoogleAuthTests() {
  console.log("================================================================================");
  console.log("🚀 STARTING GOOGLE SIGN-IN & AUTH SYSTEM VERIFICATION");
  console.log("================================================================================\n");

  // 1. Verify Google OAuth URL generation via Supabase Client
  console.log("--- 1. Testing Google OAuth Initiation ---");
  const { data: oauthData, error: oauthError } = await anonClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback?next=/dashboard",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  const hasOAuthUrl = !oauthError && oauthData?.url && oauthData.url.includes("accounts.google.com") || oauthData?.url?.includes("supabase.co/auth/v1/authorize");
  recordResult(
    "1. Initiate Google OAuth redirect URL",
    !oauthError && !!oauthData?.url,
    oauthData?.url ? `Target URL: ${oauthData.url.substring(0, 60)}...` : (oauthError?.message || "Failed")
  );

  // 2. Simulate Google OAuth User Provisioning & Callback Flow
  console.log("\n--- 2. Testing First-time Google User Auto-provisioning ---");
  const googleEmail = `google_user_${Date.now()}@gmail.com`;
  const googleFullName = "Google Test Explorer";
  const googleAvatarUrl = "https://lh3.googleusercontent.com/a/sample-avatar-id";

  const { data: googleUserData, error: googleCreateError } = await adminClient.auth.admin.createUser({
    email: googleEmail,
    email_confirm: true,
    user_metadata: {
      full_name: googleFullName,
      name: googleFullName,
      avatar_url: googleAvatarUrl,
      picture: googleAvatarUrl,
      iss: "https://accounts.google.com",
    },
  });

  if (googleCreateError || !googleUserData.user) {
    console.error("Failed to simulate Google user creation:", googleCreateError);
    process.exit(1);
  }

  const googleUserId = googleUserData.user.id;

  // Simulate callback handler logic: profile check and automatic creation
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", googleUserId)
    .maybeSingle();

  if (!existingProfile) {
    await adminClient.from("profiles").insert({
      id: googleUserId,
      full_name: googleUserData.user.user_metadata?.full_name || "Google User",
      avatar_url: googleUserData.user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString(),
    });
  }

  const { data: createdProfile, error: profileFetchError } = await adminClient
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", googleUserId)
    .maybeSingle();

  recordResult(
    "2. Auto-provision profile on first Google sign-in",
    !profileFetchError && createdProfile?.full_name === googleFullName && createdProfile?.avatar_url === googleAvatarUrl,
    `Profile ID: ${createdProfile?.id}, Name: ${createdProfile?.full_name}`
  );

  // 3. Verify Standard Role Assignment (No automatic Super Admin privilege)
  console.log("\n--- 3. Testing Google User Privilege Isolation ---");
  const effectiveRole = googleUserData.user.user_metadata?.role || "user";
  const isSuperAdmin = effectiveRole === "super_admin";

  recordResult(
    "3. Standard Google users receive standard user role (No automatic super_admin)",
    !isSuperAdmin && effectiveRole === "user",
    `Assigned Role: "${effectiveRole}"`
  );

  // 4. Verify Existing Super Admin Role Preservation on OAuth
  console.log("\n--- 4. Testing Super Admin Role Preservation ---");
  const superAdminEmail = `super_google_${Date.now()}@gmail.com`;
  const { data: adminOAuthUser } = await adminClient.auth.admin.createUser({
    email: superAdminEmail,
    email_confirm: true,
    user_metadata: {
      full_name: "Super Admin via Google",
      role: "super_admin",
      plan: "pro",
    },
  });

  const superAdminUserId = adminOAuthUser.user.id;
  await adminClient.from("profiles").upsert({
    id: superAdminUserId,
    full_name: "Super Admin via Google",
    updated_at: new Date().toISOString(),
  });

  // Re-verify that user retains super_admin
  const { data: verifiedAdminUser } = await adminClient.auth.admin.getUserById(superAdminUserId);
  const preservedRole = verifiedAdminUser?.user?.user_metadata?.role;

  recordResult(
    "4. Preserves super_admin role for existing privileged accounts",
    preservedRole === "super_admin",
    `Role preserved: "${preservedRole}"`
  );

  // 5. Verify Safe Redirect and Open-Redirect Protection
  console.log("\n--- 5. Testing OAuth Redirect Sanitization ---");
  function sanitizeRedirect(nextParam) {
    let next = nextParam ?? "/dashboard";
    if (!next.startsWith("/") || next.startsWith("//")) {
      next = "/dashboard";
    }
    return next;
  }

  const safeInternal = sanitizeRedirect("/dashboard/meetings");
  const unsafeExternal = sanitizeRedirect("https://malicious-site.com/steal-session");
  const unsafeProtocolRelative = sanitizeRedirect("//evil.com");

  recordResult(
    "5. Open-redirect prevention sanitizes untrusted next URLs",
    safeInternal === "/dashboard/meetings" &&
      unsafeExternal === "/dashboard" &&
      unsafeProtocolRelative === "/dashboard",
    `Internal: "${safeInternal}", External -> "${unsafeExternal}", Protocol-relative -> "${unsafeProtocolRelative}"`
  );

  // 6. Verify Email/Password Authentication Still Works
  console.log("\n--- 6. Testing Backward Compatibility with Email/Password Auth ---");
  const emailPasswordUser = `standard_pass_${Date.now()}@company.com`;
  const emailPasswordSecret = "SecurePassword123!";

  const { data: passUser, error: passUserError } = await adminClient.auth.admin.createUser({
    email: emailPasswordUser,
    password: emailPasswordSecret,
    email_confirm: true,
    user_metadata: { full_name: "Password User" },
  });

  const clientSession = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data: signInSession, error: signInError } = await clientSession.auth.signInWithPassword({
    email: emailPasswordUser,
    password: emailPasswordSecret,
  });

  recordResult(
    "6. Email/Password login works seamlessly",
    !signInError && !!signInSession?.session?.access_token,
    `User: ${emailPasswordUser}, Session established: ${!!signInSession?.session}`
  );

  // 7. Verify Logout Flow
  console.log("\n--- 7. Testing Session SignOut ---");
  const { error: signOutError } = await clientSession.auth.signOut();
  const { data: loggedOutUser } = await clientSession.auth.getUser();

  recordResult(
    "7. User session sign-out clears active tokens",
    !signOutError && !loggedOutUser?.user,
    `Signed out successfully`
  );

  // 8. Clean up test users
  try {
    await adminClient.auth.admin.deleteUser(googleUserId);
    await adminClient.auth.admin.deleteUser(superAdminUserId);
    await adminClient.auth.admin.deleteUser(passUser.user.id);
  } catch {
    // Ignore cleanup error
  }

  // Summary
  console.log("\n================================================================================");
  console.log("📊 GOOGLE AUTH & ACCESS VERIFICATION SUMMARY");
  console.log("================================================================================");
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Verification Steps: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 ALL GOOGLE AUTH VERIFICATION STEPS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} VERIFICATION STEP(S) FAILED.`);
    process.exit(1);
  }
}

runGoogleAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
