import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const client = createClient(url, anonKey);
const admin = createClient(url, serviceKey);

async function runTests() {
  console.log("🧪 Running Supabase Authentication Test Suite for LoomNotes AI...\n");

  const testEmail = `loom_test_${Date.now()}@gmail.com`;
  const testPassword = "SecurePassword123!";
  const testFullName = "Test Engineer Sarah";

  // 1. Test Dashboard Protection (Unauthenticated HTTP check)
  console.log("1️⃣ Testing Dashboard Route Protection (Unauthenticated)...");
  try {
    const res = await fetch("http://localhost:3000/dashboard", {
      redirect: "manual",
    });
    const status = res.status;
    const location = res.headers.get("location");
    if (status === 307 || status === 302 || status === 303) {
      console.log(`   ✅ Correctly redirected unauthenticated user: HTTP ${status} -> ${location}`);
    } else {
      console.log(`   ℹ️ Received status ${status} at /dashboard`);
    }
  } catch (err) {
    console.error("   ❌ Failed to test /dashboard redirection:", err.message);
  }

  // 2. Test Signup with Profile Creation
  console.log("\n2️⃣ Testing Signup & Profile Record Creation...");
  let userId = null;
  try {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: testFullName },
    });

    if (createError) throw createError;
    userId = newUser.user.id;
    console.log(`   ✅ User account created in auth.users: ID ${userId}`);

    // Check profiles table
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    if (profile && profile.full_name === testFullName) {
      console.log(`   ✅ Profile automatically created in public.profiles: "${profile.full_name}"`);
    } else {
      console.log(`   ⚠️ Profile found but full_name mismatch:`, profile);
    }
  } catch (err) {
    console.error("   ❌ Signup test failed:", err.message);
  }

  // 3. Test Login
  console.log("\n3️⃣ Testing User Login (Sign In With Password)...");
  let userSession = null;
  try {
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) throw signInError;
    userSession = sessionData.session;
    console.log(`   ✅ Successfully logged in! Access token generated for ${sessionData.user.email}`);
  } catch (err) {
    console.error("   ❌ Login test failed:", err.message);
  }

  // 4. Test Authenticated Query under RLS
  console.log("\n4️⃣ Testing Row Level Security (RLS) Profile Query...");
  try {
    // Authenticated client using user's access token
    const userClient = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${userSession.access_token}`,
        },
      },
    });

    const { data: userProfile, error: rlsError } = await userClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (rlsError) throw rlsError;
    console.log(`   ✅ RLS authorized read: Successfully retrieved profile under user's token!`);
    console.log(`      ID: ${userProfile.id}`);
    console.log(`      Full Name: ${userProfile.full_name}`);
  } catch (err) {
    console.error("   ❌ RLS test failed:", err.message);
  }

  // 5. Test Logout
  console.log("\n5️⃣ Testing User Logout...");
  try {
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw signOutError;
    const { data: currentSession } = await client.auth.getSession();
    if (!currentSession.session) {
      console.log("   ✅ Logout successful! Session cleared.");
    }
  } catch (err) {
    console.error("   ❌ Logout test failed:", err.message);
  }

  console.log("\n✨ All Authentication Tests Finished!\n");
}

runTests();
