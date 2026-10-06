import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAuditLogs } from "@/lib/admin/audit-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminAuditLogView } from "@/components/admin/admin-audit-log-view";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Audit Log - Super Admin - LoomNotes AI",
  description: "Complete immutable audit trail of administrative events and actions.",
};

export default async function AdminAuditLogPage() {
  // Strict Server Guard: Requires 'analytics.view' or admin privileges
  const authContext = await requirePermission("analytics.view");

  const { logs, total } = await getAdminAuditLogs({ limit: 100 });
  const displayName =
    authContext.profile?.full_name || authContext.user.email?.split("@")[0] || "Admin";

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
              <Badge className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900 text-xs font-bold">
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Immutable Audit Trail
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {total} Total Records
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Administrative Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Track who performed administrative actions, modified user roles, suspended accounts, or exported data.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <AdminAuditLogView logs={logs} />
      </div>
    </AdminLayoutShell>
  );
}
