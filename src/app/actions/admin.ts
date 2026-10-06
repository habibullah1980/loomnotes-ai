"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requirePermission, requireSuperAdmin } from "@/lib/auth/guards";
import { getAdminPrivilegedClient } from "@/lib/admin/admin-service";
import { logAdminAudit } from "@/lib/admin/audit-service";
import { AdminRole, Permission, ALL_PERMISSIONS } from "@/lib/admin/permissions";

export interface AdminActionResult {
  success?: boolean;
  error?: string;
  data?: any;
}

/**
 * 1. CREATE USER (Admin action)
 * Requires permission 'users.create'
 */
export async function adminCreateUserAction(
  _prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    const authContext = await requirePermission("users.create");
    const adminClient = getAdminPrivilegedClient();

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();
    const fullName = (formData.get("fullName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const company = (formData.get("company") as string)?.trim() || null;
    const role = ((formData.get("role") as string)?.trim() as AdminRole) || "user";
    const marketingConsent = formData.get("marketingConsent") === "on";

    if (!email || !email.includes("@")) {
      return { error: "A valid email address is required." };
    }

    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }

    if (!fullName) {
      return { error: "Full name is required." };
    }

    // Only super_admin can create admin or super_admin accounts
    if (role !== "user" && !authContext.isSuperAdmin) {
      return { error: "Only Super Administrators can create privileged administrative accounts." };
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_number: phone,
        company_name: company,
        role,
        marketing_consent: marketingConsent,
        marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
      },
    });

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create user." };
    }

    const userId = authData.user.id;

    // Upsert into public.profiles
    await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone_number: phone,
      company_name: company,
      role,
      status: "active",
      custom_permissions: [],
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    });

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: "user_created",
      targetId: userId,
      targetType: "user",
      details: { email, fullName, role, company },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return { success: true, data: { userId } };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred while creating user." };
  }
}

/**
 * 2. UPDATE USER PROFILE (Admin action)
 * Requires permission 'users.edit'
 */
export async function adminUpdateUserAction(
  userId: string,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    const authContext = await requirePermission("users.edit");
    const adminClient = getAdminPrivilegedClient();

    const fullName = (formData.get("fullName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const company = (formData.get("company") as string)?.trim() || null;
    const marketingConsent = formData.get("marketingConsent") === "on";

    if (!fullName) {
      return { error: "Full name cannot be empty." };
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phone,
        company_name: company,
        marketing_consent: marketingConsent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Sync metadata
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        phone_number: phone,
        company_name: company,
        marketing_consent: marketingConsent,
      },
    });

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: "user_updated",
      targetId: userId,
      targetType: "user",
      details: { fullName, phone, company, marketingConsent },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update user profile." };
  }
}

/**
 * 3. TOGGLE USER STATUS (Suspend / Reactivate)
 * Requires permission 'users.suspend'
 */
export async function adminToggleUserStatusAction(
  userId: string,
  newStatus: "active" | "suspended"
): Promise<AdminActionResult> {
  try {
    const authContext = await requirePermission("users.suspend");
    const adminClient = getAdminPrivilegedClient();

    // Prevent self-suspension
    if (userId === authContext.user.id) {
      return { error: "You cannot suspend your own administrative account." };
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: newStatus === "suspended" ? "user_suspended" : "user_reactivated",
      targetId: userId,
      targetType: "user",
      details: { newStatus },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update account status." };
  }
}

/**
 * 4. DELETE USER (Permanent Removal)
 * Requires Super Admin & 'users.delete'
 */
export async function adminDeleteUserAction(userId: string): Promise<AdminActionResult> {
  try {
    const authContext = await requireSuperAdmin();
    const adminClient = getAdminPrivilegedClient();

    // Prevent self-deletion
    if (userId === authContext.user.id) {
      return { error: "You cannot delete your own Super Administrator account." };
    }

    // Fetch target user email for audit log before deletion
    const { data: targetUser } = await adminClient.auth.admin.getUserById(userId);
    const targetEmail = targetUser?.user?.email || "unknown";

    // Delete user from Supabase Auth (cascades profiles, meetings, etc.)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: "user_deleted",
      targetId: userId,
      targetType: "user",
      details: { email: targetEmail },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete user." };
  }
}

/**
 * 5. UPDATE USER ROLE & PERMISSIONS
 * Strictly requires Super Admin
 */
export async function adminUpdateUserRoleAction(
  userId: string,
  newRole: AdminRole,
  customPermissions: string[] = []
): Promise<AdminActionResult> {
  try {
    const authContext = await requireSuperAdmin();
    const adminClient = getAdminPrivilegedClient();

    // Prevent self-demotion from super_admin
    if (userId === authContext.user.id && newRole !== "super_admin") {
      return { error: "You cannot demote yourself from the Super Administrator role." };
    }

    // Validate permissions array
    const validPerms = customPermissions.filter((p) =>
      ALL_PERMISSIONS.some((def) => def.id === p)
    );

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        role: newRole,
        custom_permissions: validPerms,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Sync auth metadata
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: newRole,
      },
    });

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: "role_changed",
      targetId: userId,
      targetType: "user",
      details: { newRole, customPermissions: validPerms },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath("/admin/roles");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update role and permissions." };
  }
}

/**
 * 6. EXPORT USERS CSV
 * Requires 'users.export' or 'marketing.export'
 * Excludes passwords, tokens, and secret identifiers.
 */
export async function adminExportUsersCSVAction(options?: {
  marketingOnly?: boolean;
}): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const perm: Permission = options?.marketingOnly ? "marketing.export" : "users.export";
    const authContext = await requirePermission(perm);
    const adminClient = getAdminPrivilegedClient();

    const [authRes, profilesRes] = await Promise.all([
      adminClient.auth.admin.listUsers(),
      adminClient.from("profiles").select("*"),
    ]);

    const authUsers = authRes.data?.users || [];
    const profiles = profilesRes.data || [];
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    let filteredUsers = authUsers;
    if (options?.marketingOnly) {
      filteredUsers = filteredUsers.filter((u) => {
        const p = profileMap.get(u.id);
        return p?.marketing_consent || Boolean(u.user_metadata?.marketing_consent);
      });
    }

    // CSV Headers
    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Phone Number",
      "Company",
      "Role",
      "Status",
      "Marketing Consent",
      "Marketing Consent Date",
      "Signup Date",
      "Last Sign In",
    ];

    const rows = filteredUsers.map((u) => {
      const p = profileMap.get(u.id);
      const name = p?.full_name || u.user_metadata?.full_name || "User";
      const phone = p?.phone_number || u.user_metadata?.phone_number || "";
      const company = p?.company_name || u.user_metadata?.company_name || "";
      const role = p?.role || u.user_metadata?.role || "user";
      const status = p?.status || "active";
      const consent = p?.marketing_consent ?? Boolean(u.user_metadata?.marketing_consent);
      const consentDate = p?.marketing_consent_at || u.user_metadata?.marketing_consent_at || "";

      return [
        `"${u.id}"`,
        `"${name.replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        `"${company.replace(/"/g, '""')}"`,
        `"${role}"`,
        `"${status}"`,
        `"${consent ? "Yes" : "No"}"`,
        `"${consentDate}"`,
        `"${u.created_at}"`,
        `"${u.last_sign_in_at || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Record audit log
    await logAdminAudit({
      actorId: authContext.user.id,
      actorEmail: authContext.user.email || "",
      action: "data_exported",
      targetType: "user",
      details: {
        exportedRecordsCount: rows.length,
        marketingOnly: Boolean(options?.marketingOnly),
      },
    });

    return { success: true, csv: csvContent };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to export CSV." };
  }
}
