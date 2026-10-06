import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminMetrics } from "@/lib/admin/admin-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "User Management - Super Admin - LoomNotes AI",
  description: "View, filter, manage, suspend, and edit user profiles and roles.",
};

export default async function AdminUsersPage() {
  // Strict Server Guard: Requires 'users.view' permission
  const authContext = await requirePermission("users.view");

  const metrics = await getAdminMetrics();
  const displayName = authContext.profile?.full_name || authContext.user.email?.split("@")[0] || "Admin";

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 text-xs font-bold">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  User Directory
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {metrics.users.length} Total Users
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                User Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Inspect profiles, manage permissions, suspend accounts, and review marketing opt-ins.
              </p>
            </div>
          </div>
        </div>

        {/* User Table */}
        <AdminUserTable
          users={metrics.users}
          currentUserRole={authContext.role}
        />
      </div>
    </AdminLayoutShell>
  );
}
