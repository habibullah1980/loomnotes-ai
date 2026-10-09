
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Fail closed if the profile lookup fails.
  if (profileError) {
    throw new Error("Unable to verify user profile.");
  }

  // The database profile is the authority for roles.
  // Missing profiles never receive administrative privileges.
  const role: AdminRole = profile?.role
    ? (profile.role as AdminRole)
    : "user";

  const status = (profile?.status as "active" | "suspended") || "active";

  if (status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }

  const customPermissions =
    (profile?.custom_permissions as string[]) || [];

  const isSuperAdmin = role === "super_admin";
  const permissions = getEffectivePermissions(role, customPermissions);

  const hasPerm = (permission: Permission) =>
    checkPermission(role, customPermissions, permission);

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

export async function requireSuperAdmin(): Promise<AuthenticatedContext> {
  const authContext = await requireUser();

  if (!authContext.isSuperAdmin) {
    redirect("/dashboard");
  }

  return authContext;
}

export async function requirePermission(
  permission: Permission
): Promise<AuthenticatedContext> {
  const authContext = await requireUser();

  if (!authContext.hasPermission(permission)) {
    if (authContext.permissions.length > 0) {
      redirect("/admin?error=unauthorized_action");
    }

    redirect("/dashboard");
  }

  return authContext;
}
