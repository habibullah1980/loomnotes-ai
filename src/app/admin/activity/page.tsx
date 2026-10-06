import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getActivityFeed } from "@/lib/admin/activity-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminActivityView } from "@/components/admin/admin-activity-view";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "User Activity Stream - Super Admin - LoomNotes AI",
  description: "Real-time user event stream, logins, AI meeting notes, Loom requests, and device analytics.",
};

export default async function AdminActivityPage() {
  // Strict Server Guard: Requires admin permission
  const authContext = await requirePermission("users.view");

  const { items, total } = await getActivityFeed({ limit: 200 });
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
              <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900 text-xs font-bold">
                <Activity className="h-3.5 w-3.5 mr-1" />
                Live Event Stream
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {total} Total Actions Recorded
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Activity Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inspect real-time user events, sign-ins, AI meeting note generations, Loom processing, and action-item completions.
            </p>
          </div>
        </div>

        {/* Real Activity Stream Component */}
        <AdminActivityView initialItems={items} />
      </div>
    </AdminLayoutShell>
  );
}
