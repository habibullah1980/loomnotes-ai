import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionItemRow } from "@/components/meetings/action-item-row";
import {
  Video,
  ListTodo,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Dashboard - LoomNotes AI",
  description: "Manage your Loom meeting summaries, action items, and knowledge repository.",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { user, profile, role } = await requireUser();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Fetch monthly usage under RLS
  const usage = await getMonthlyUsage(supabase, user.id);

  // Fetch user's meetings with action items
  const { data: meetings, error: meetingsError } = await supabase
    .from("meetings")
    .select(`
      id,
      title,
      summary,
      created_at,
      action_items (
        id,
        task,
        assignee,
        due_date,
        completed,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 1. Calculate Stats
  const totalMeetings = meetings?.length ?? 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString("en-US", { month: "long" });

  const meetingsThisMonth =
    meetings?.filter((m) => {
      const d = new Date(m.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length ?? 0;

  // Flatten all action items across user's meetings
  const allActionItems = (meetings || []).flatMap((m) =>
    (m.action_items || []).map((item) => ({
      ...item,
      meetingId: m.id,
      meetingTitle: m.title,
    }))
  );

  const openActionItems = allActionItems
    .filter((a) => !a.completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
    });

  const completedActionItems = allActionItems.filter((a) => a.completed);

  const openActionCount = openActionItems.length;
  const completedActionCount = completedActionItems.length;
  const totalActionCount = openActionCount + completedActionCount;
  const completionRate =
    totalActionCount > 0 ? Math.round((completedActionCount / totalActionCount) * 100) : 0;

  const recentMeetings = (meetings || []).slice(0, 5);
  const latestOpenActions = openActionItems.slice(0, 5);

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        fullName: displayName,
        role: role,
      }}
      usage={usage}
    >
      {/* Error Alert if query failed */}
      {meetingsError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs sm:text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Unable to load dashboard data</span>
            <p className="mt-0.5 text-xs">{meetingsError.message}</p>
          </div>
        </div>
      )}

      {/* 1. Overview Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here&apos;s what&apos;s happening with your meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {usage.isSuperAdmin ? (
            <Badge variant="teal" className="text-xs">
              Super Admin • Unlimited
            </Badge>
          ) : (
            <Badge variant={usage.isLimitReached ? "destructive" : "secondary"} className="text-xs">
              {usage.used} / {usage.limit} Free Meetings Used
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Stats (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Meetings */}
        <Card className="hover:border-blue-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Meetings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Video className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalMeetings}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {totalMeetings === 1 ? "1 analyzed recording" : `${totalMeetings} analyzed recordings`}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Meetings This Month */}
        <Card className="hover:border-teal-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              This Month
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {meetingsThisMonth}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recorded in {currentMonthName}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Open Action Items */}
        <Card className="hover:border-amber-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Tasks
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {openActionCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {openActionCount === 1 ? "1 task pending" : `${openActionCount} tasks pending`}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Completed Action Items */}
        <Card className="hover:border-emerald-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedActionCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {totalActionCount > 0 ? `${completionRate}% completion rate` : "No tasks logged yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3 & 4. Main Grid: Recent Meetings & Latest Open Action Items */}
      {totalMeetings > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Columns: Recent Meetings List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                  <span>Recent Meetings</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing your {Math.min(5, totalMeetings)} most recent {totalMeetings === 1 ? "session" : "sessions"}
                </p>
              </div>

              <Link
                href="/dashboard/meetings"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View all meetings ({totalMeetings})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* List / Table of Recent Meetings */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] divide-y divide-slate-100 dark:divide-slate-800/60 shadow-2xs overflow-hidden">
              {recentMeetings.map((meeting) => {
                const totalTasks = meeting.action_items?.length ?? 0;
                const completedTasks = meeting.action_items?.filter((a) => a.completed).length ?? 0;
                const formattedDate = new Date(meeting.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="block p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {meeting.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {meeting.summary || "Click to view full structured meeting notes and action items."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{formattedDate}</span>
                        <Badge
                          variant={totalTasks > 0 && completedTasks === totalTasks ? "success" : "secondary"}
                          className="text-[11px]"
                        >
                          {totalTasks > 0 ? `${completedTasks}/${totalTasks} Tasks` : "0 Tasks"}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right 1 Column: Action Items Task Panel */}
          <div id="action-items" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  <span>Action Items</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open tasks across your meetings
                </p>
              </div>
              <Badge variant={openActionCount === 0 ? "success" : "secondary"} className="text-xs">
                {openActionCount} Open
              </Badge>
            </div>

            {latestOpenActions.length > 0 ? (
              <div className="space-y-2.5">
                {latestOpenActions.map((item) => (
                  <ActionItemRow
                    key={item.id}
                    item={item}
                    meetingId={item.meetingId}
                    meetingTitle={item.meetingTitle}
                  />
                ))}
                {openActionCount > 5 && (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1">
                    + {openActionCount - 5} more pending tasks in meeting detail pages
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 text-center space-y-2 shadow-2xs">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  All tasks completed
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No pending action items right now. Create a new meeting to generate structured tasks.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5. Clean Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center bg-white dark:bg-[#0c1220] space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <FileText className="h-6 w-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create your first meeting note
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste any public Loom video URL or transcript. Google Gemini will extract an executive summary, key takeaways, decisions, and action items in seconds.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              <span>Create your first meeting</span>
            </Link>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
