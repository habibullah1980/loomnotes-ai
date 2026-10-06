import Link from "next/link";
import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminMetrics } from "@/lib/admin/admin-service";
import { getAdminAnalyticsChartsData } from "@/lib/admin/admin-charts-service";
import { getRecentlyActiveUsersSummary } from "@/lib/admin/activity-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { Badge } from "@/components/ui/badge";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import {
  ShieldCheck,
  Users,
  Activity,
  Calendar,
  Globe,
  Laptop,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Super Admin Console - LoomNotes AI",
  description: "Global platform administration, user activity feed, and interactive growth analytics.",
};

export default async function AdminDashboardPage() {
  // Strict Server-Side Guard: Requires administrative permission
  const authContext = await requirePermission("users.view");

  // Parallel server-only data fetching for metrics, charts, and real activity
  const [metrics, chartsData, activitySummary] = await Promise.all([
    getAdminMetrics(),
    getAdminAnalyticsChartsData(),
    getRecentlyActiveUsersSummary(),
  ]);

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
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 text-xs font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Super Admin Platform
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {metrics.currentMonth}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Platform Control &amp; Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Full-control administrative console: inspect live user activity, monitor AI note generations, configure permissions, and manage accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/activity"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3.5 py-2 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Live Activity Stream</span>
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3.5 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                <span>User Directory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6. ACTIVE USERS COHORTS (3 Cards) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Active Users Recency
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:border-teal-500/40 transition-colors shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Today
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Activity className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {activitySummary.activeTodayCount}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Actions in the last 24h</p>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500/40 transition-colors shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active This Week
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activitySummary.activeThisWeekCount}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active in past 7 days</p>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-500/40 transition-colors shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active This Month
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {activitySummary.activeThisMonthCount}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active in past 30 days</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6. RECENTLY ACTIVE USERS TABLE (Latest 10) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recently Active Users (Latest 10)
            </h2>
            <Link
              href="/admin/activity"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All Activity</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Last Activity</th>
                    <th className="py-3 px-4 font-semibold">Activity Action</th>
                    <th className="py-3 px-4 font-semibold">Device</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activitySummary.recentlyActiveUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        No activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    activitySummary.recentlyActiveUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/users/${user.userId}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {user.userName}
                            </Link>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{user.userEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(user.lastActivityTime).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {user.lastActivityTitle}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Laptop className="h-3 w-3 text-slate-400" />
                            {user.device}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-slate-400" />
                            {user.location}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 1. DEDICATED ANALYTICS OVERVIEW SECTION (All 8 Charts + Date Filter) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Analytics Overview
            </h2>
          </div>
          <AdminAnalyticsCharts initialData={chartsData} />
        </div>

        {/* USER DIRECTORY TABLE */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              User Directory ({metrics.users.length})
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <AdminUserTable
            users={metrics.users}
            currentUserRole={authContext.role}
          />
        </div>
      </div>
    </AdminLayoutShell>
  );
}
