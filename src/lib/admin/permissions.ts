export type AdminRole = "super_admin" | "admin" | "support" | "analyst" | "user";

export type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "users.suspend"
  | "users.export"
  | "meetings.view"
  | "meetings.delete"
  | "analytics.view"
  | "marketing.view"
  | "marketing.export"
  | "settings.manage"
  | "admins.manage";

export interface RoleDefinition {
  role: AdminRole;
  name: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  super_admin: {
    role: "super_admin",
    name: "Super Administrator",
    description: "Unrestricted control over the entire platform, roles, permissions, and settings.",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "users.suspend",
      "users.export",
      "meetings.view",
      "meetings.delete",
      "analytics.view",
      "marketing.view",
      "marketing.export",
      "settings.manage",
      "admins.manage",
    ],
  },
  admin: {
    role: "admin",
    name: "Administrator",
    description: "Operational management of users, meetings, analytics, and marketing.",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.suspend",
      "users.export",
      "meetings.view",
      "analytics.view",
      "marketing.view",
      "marketing.export",
      "settings.manage",
    ],
  },
  support: {
    role: "support",
    name: "Customer Support",
    description: "User assistance and profile view/edit permissions with meeting access.",
    permissions: ["users.view", "users.edit", "meetings.view"],
  },
  analyst: {
    role: "analyst",
    name: "Data Analyst",
    description: "Read-only analytics and marketing performance intelligence.",
    permissions: ["analytics.view", "marketing.view", "users.view"],
  },
  user: {
    role: "user",
    name: "Standard User",
    description: "Standard workspace user.",
    permissions: [],
  },
};

export const ALL_PERMISSIONS: { id: Permission; label: string; category: string; description: string }[] = [
  { id: "users.view", label: "View Users", category: "Users", description: "View the user directory and individual profiles." },
  { id: "users.create", label: "Create Users", category: "Users", description: "Provision new user accounts from the admin console." },
  { id: "users.edit", label: "Edit Users", category: "Users", description: "Update user profile details and company info." },
  { id: "users.suspend", label: "Suspend Users", category: "Users", description: "Temporarily suspend or reactivate user accounts." },
  { id: "users.delete", label: "Delete Users", category: "Users", description: "Permanently delete user accounts and associated data." },
  { id: "users.export", label: "Export Users", category: "Users", description: "Download user records as CSV." },
  { id: "meetings.view", label: "View Meetings", category: "Meetings", description: "Inspect meeting notes and transcript processing." },
  { id: "meetings.delete", label: "Delete Meetings", category: "Meetings", description: "Permanently remove meeting records." },
  { id: "analytics.view", label: "View Analytics", category: "Analytics", description: "Access growth, retention, and usage analytics." },
  { id: "marketing.view", label: "View Marketing", category: "Marketing", description: "View marketing opt-in records and attribution." },
  { id: "marketing.export", label: "Export Marketing", category: "Marketing", description: "Export consented marketing contact lists." },
  { id: "settings.manage", label: "Manage Settings", category: "System", description: "Configure system-wide parameters and integrations." },
  { id: "admins.manage", label: "Manage Admins & Roles", category: "System", description: "Grant or revoke admin roles and permissions." },
];

/**
 * Checks whether a given role and optional custom permissions satisfy a required permission.
 */
export function checkPermission(
  role: string | null | undefined,
  customPermissions: string[] | null | undefined,
  requiredPermission: Permission
): boolean {
  if (!role) return false;

  // Super Admin has universal access
  if (role === "super_admin") return true;

  // Check role default permissions
  const roleDef = ROLE_DEFINITIONS[role as AdminRole];
  if (roleDef && roleDef.permissions.includes(requiredPermission)) {
    return true;
  }

  // Check custom granted permissions
  if (customPermissions && Array.isArray(customPermissions)) {
    if (customPermissions.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Computes the full effective permission set for a role + custom permissions array.
 */
export function getEffectivePermissions(
  role: string | null | undefined,
  customPermissions: string[] | null | undefined
): Permission[] {
  if (!role) return [];
  if (role === "super_admin") {
    return ROLE_DEFINITIONS.super_admin.permissions;
  }

  const roleDef = ROLE_DEFINITIONS[role as AdminRole];
  const base = roleDef ? roleDef.permissions : [];
  const custom = (customPermissions || []).filter((p): p is Permission =>
    ALL_PERMISSIONS.some((item) => item.id === p)
  );

  return Array.from(new Set([...base, ...custom]));
}
