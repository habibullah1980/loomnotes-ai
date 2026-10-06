import { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getAdminMetrics } from "@/lib/admin/admin-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminRolesView } from "@/components/admin/admin-roles-view";
import { Badge } from "@/components/ui/badge";
import { KeyRound, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Roles & Permissions - Super Admin - LoomNotes AI",
  description: "Configure role-based access control, assign admin roles, and manage granular permissions.",
};

export default async function AdminRolesPage() {
  // Strict Server Guard: Strictly requires Super Admin
  const authContext = await requireSuperAdmin();

  const metrics = await getAdminMetrics();
  // Filter privileged administrative accounts or accounts with custom permissions
  const adminUsers = metrics.users.filter(
    (u) => u.role !== "user" || u.customPermissions?.length > 0
  );

  const displayName =
    authContext.profile?.full_name || authContext.user.email?.split("@")[0] || "Super Admin";

  return (
    <AdminLayoutShell
      user={{
        email: authContext.user.email || "",
        fullName: displayName,
        role: authContext.role,
        permissions: authContext.permissions,
      }}
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900 text-xs font-bold">
                <KeyRound className="h-3.5 w-3.5 mr-1" />
                Access Control &amp; RBAC
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                Super Admin Protected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Roles &amp; Permission Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review platform permission matrices, assign administrative roles, and customize individual account capabilities.
            </p>
          </div>
        </div>

        {/* Roles & Matrix View */}
        <AdminRolesView adminUsers={adminUsers.length > 0 ? adminUsers : metrics.users.slice(0, 5)} />
      </div>
    </AdminLayoutShell>
  );
}
