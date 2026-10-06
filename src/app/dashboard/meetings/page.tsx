import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MeetingHistoryList } from "@/components/meetings/meeting-history-list";
import { ChevronRight, Video, AlertCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Meeting History - LoomNotes AI",
  description: "Browse and search all your AI-analyzed Loom meeting notes and action items.",
};

export default async function MeetingHistoryPage() {
  const { user, profile, role } = await requireUser();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];

  // Fetch usage
  const usage = await getMonthlyUsage(supabase, user.id);

  // Fetch all user's meetings with related action items
  const { data: meetings, error: meetingsError } = supabase
    ? await supabase
        .from("meetings")
        .select(`
          id,
          title,
          summary,
          created_at,
          action_items (
            id,
            completed
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        fullName: displayName,
        role: role,
      }}
      usage={usage}
    >
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
          <span className="font-semibold text-slate-900 dark:text-white">
            Meeting History
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Meeting History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Browse, search, and manage all your AI-analyzed Loom recordings and extracted tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {meetingsError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Failed to Load Meetings</h4>
            <p className="text-xs mt-1">{meetingsError.message}</p>
          </div>
        </div>
      ) : (
        /* Meeting History List */
        <MeetingHistoryList initialMeetings={meetings ?? []} />
      )}
    </DashboardShell>
  );
}
