import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAnalyticsChartsData } from "@/lib/admin/admin-charts-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Analytics - Super Admin - LoomNotes AI",
  description: "Privacy-conscious product metrics, DAU/MAU, conversion rates, and usage intelligence.",
};

export default async function AdminAnalyticsPage() {
  // Strict Server Guard: Requires 'analytics.view' permission
  const authContext = await requirePermission("analytics.view");

  const chartsData = await getAdminAnalyticsChartsData();
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
              <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 text-xs font-bold">
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Product Intelligence
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                Privacy-Conscious Real Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Analytics &amp; Growth
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive real-time metrics: user registrations, meeting generations, role breakdown, marketing opt-ins, and cohort activity.
            </p>
          </div>
        </div>

        {/* Interactive Charts Component */}
        <AdminAnalyticsCharts initialData={chartsData} />
      </div>
    </AdminLayoutShell>
  );
}
