import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ActionItemsHub, HubActionItem } from "@/components/meetings/action-items-hub";
import { ChevronRight, Plus } from "lucide-react";

export const metadata = {
  title: "Action Items - LoomNotes AI",
  description: "Manage, track, and complete actionable tasks across all your meetings.",
};

export default async function ActionItemsPage() {
  const { user, profile, role } = await requireUser();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const usage = await getMonthlyUsage(supabase, user.id);

  // Fetch all user's meetings with action items
  const { data: meetings } = await supabase
    .from("meetings")
    .select(`
      id,
      title,
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

  const allItems: HubActionItem[] = (meetings || []).flatMap((m) =>
    (m.action_items || []).map((item) => ({
      id: item.id,
      meetingId: m.id,
      meetingTitle: m.title,
      task: item.task,
      assignee: item.assignee,
      due_date: item.due_date,
      completed: item.completed,
      created_at: item.created_at || m.created_at,
    }))
  );

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        fullName: profile?.full_name || user.email?.split("@")[0] || "User",
        role: role,
      }}
      usage={usage}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb & Header */}
        <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Action Items</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Action Items
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized tracker for all assigned tasks and commitments across meetings.
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Meeting</span>
            </Link>
          </div>
        </div>

        {/* Interactive Hub */}
        <ActionItemsHub initialItems={allItems} />
      </div>
    </DashboardShell>
  );
}
