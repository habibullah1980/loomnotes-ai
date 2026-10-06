import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NewMeetingForm } from "@/components/meetings/new-meeting-form";
import { ChevronRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "New Meeting - LoomNotes AI",
  description: "Create a new meeting and generate AI notes from your Loom video transcript.",
};

export default async function NewMeetingPage() {
  const { user, profile, role } = await requireUser();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];

  // Fetch user's monthly usage under RLS
  const usage = await getMonthlyUsage(supabase, user.id);

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
            New Meeting
          </span>
        </nav>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Meeting Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Extract executive summaries, key takeaways, and action items with Google Gemini.
          </p>
        </div>
      </div>

      {/* Meeting Form */}
      <div className="max-w-4xl">
        <NewMeetingForm usage={usage} />
      </div>
    </DashboardShell>
  );
}
