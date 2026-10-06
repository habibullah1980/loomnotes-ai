import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required Supabase configuration in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const TARGET_EMAIL = "habibullah1980@gmail.com";

async function grantSuperAdmin() {
  console.log(`🔍 Looking up user for email: ${TARGET_EMAIL}...`);

  // 1. Fetch user by email from Supabase Auth
  const { data: usersList, error: listError } = await adminClient.auth.admin.listUsers();

  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const targetUser = usersList.users.find(
    (u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase()
  );

  if (!targetUser) {
    console.error(`❌ User with email "${TARGET_EMAIL}" not found in Supabase Auth.`);
    process.exit(1);
  }

  const userId = targetUser.id;
  console.log(`✅ Found user: ID ${userId}`);

  // 2. Update user metadata in Supabase Auth
  const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...targetUser.user_metadata,
      role: "super_admin",
      plan: "pro",
      full_name: targetUser.user_metadata?.full_name || "Habibullah",
    },
    app_metadata: {
      ...targetUser.app_metadata,
      role: "super_admin",
    },
  });

  if (updateAuthError) {
    console.error("Failed to update user auth metadata:", updateAuthError.message);
    process.exit(1);
  }
  console.log("✅ Updated auth user_metadata and app_metadata to 'super_admin'.");

  // 3. Upsert role and plan into public.profiles table
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: userId,
    full_name: targetUser.user_metadata?.full_name || "Habibullah",
    role: "super_admin",
    plan: "pro",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.warn("Notice when updating profiles table:", profileError.message);
  } else {
    console.log("✅ Updated public.profiles record with role='super_admin' and plan='pro'.");
  }

  // 4. Verify access status
  const { data: verifiedUser } = await adminClient.auth.admin.getUserById(userId);
  const role = verifiedUser?.user?.user_metadata?.role;

  console.log("\n================================================================================");
  console.log(`🎉 SUCCESS: ${TARGET_EMAIL} is now a SUPER ADMIN!`);
  console.log("================================================================================");
  console.log(`- Email: ${TARGET_EMAIL}`);
  console.log(`- User ID: ${userId}`);
  console.log(`- Role: ${role}`);
  console.log(`- Plan: Unlimited / Pro`);
  console.log(`- Admin Console Route: http://localhost:3000/admin`);
}

grantSuperAdmin().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
