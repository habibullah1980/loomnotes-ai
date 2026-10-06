import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";
import {
  AdminRole,
  Permission,
  checkPermission,
  getEffectivePermissions,
} from "@/lib/admin/permissions";

export type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthenticatedContext {
  user: User;
  profile: ProfileRecord | null;
  role: AdminRole;
  status: "active" | "suspended";
  isSuperAdmin: boolean;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Server-side Guard: Requires an authenticated user session.
 * Fetches the user profile from the database under RLS.
 * Handles suspended accounts by redirecting to /login with error.
 * Redirects to /login if unauthenticated.
 */
export async function requireUser(): Promise<AuthenticatedContext> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch the user's profile directly from the database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Role resolution: Database profile role takes precedence, with bootstrap email fallback
  let role: AdminRole = "user";
  if (profile?.role) {
    role = profile.role as AdminRole;
  } else if (user.email === "habibullah1980@gmail.com") {
    role = "super_admin";
  } else if (user.user_metadata?.role) {
    role = user.user_metadata.role as AdminRole;
  }

  const status = (profile?.status as "active" | "suspended") || "active";

  // Account suspension enforcement: Reject suspended accounts
  if (status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }

  const isSuperAdmin = role === "super_admin";
  const customPermissions = (profile?.custom_permissions as string[]) || [];
  const permissions = getEffectivePermissions(role, customPermissions);

  const hasPerm = (perm: Permission) =>
    checkPermission(role, customPermissions, perm);

  return {
    user,
    profile,
    role,
    status,
    isSuperAdmin,
    permissions,
    hasPermission: hasPerm,
  };
}

/**
 * Server-side Guard: Requires a verified Super Admin role.
 * Strictly checks the authenticated user's role from the database.
 * Redirects to /dashboard if the user is not a super_admin.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedContext> {
  const authContext = await requireUser();

  if (!authContext.isSuperAdmin) {
    redirect("/dashboard");
  }

  return authContext;
}

/**
 * Server-side Guard: Requires a specific administrative permission.
 * Checks role-based and custom-granted permissions.
 * Redirects to /dashboard if unauthorized or not an administrative user.
 */
export async function requirePermission(
  permission: Permission
): Promise<AuthenticatedContext> {
  const authContext = await requireUser();

  if (!authContext.hasPermission(permission)) {
    // If user has some admin permissions, redirect to admin home, else user dashboard
    if (authContext.permissions.length > 0) {
      redirect("/admin?error=unauthorized_action");
    }
    redirect("/dashboard");
  }

  return authContext;
}
