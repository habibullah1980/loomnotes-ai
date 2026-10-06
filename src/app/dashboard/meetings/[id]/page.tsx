import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionItemRow } from "@/components/meetings/action-item-row";
import { DeleteMeetingButton } from "@/components/meetings/delete-meeting-button";
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ListTodo,
  Lightbulb,
  FileText,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MeetingPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { title: "Meeting Details - LoomNotes AI" };

  const { data: meeting } = await supabase
    .from("meetings")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: meeting ? `${meeting.title} - LoomNotes AI` : "Meeting Notes",
  };
}

export default async function MeetingDetailPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const { user, profile, role } = await requireUser();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login");
  }

  // Fetch meeting (RLS guarantees users can only access their own meetings)
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (meetingError || !meeting) {
    notFound();
  }

  // Fetch related action items
  const { data: actionItems } = await supabase
    .from("action_items")
    .select("*")
    .eq("meeting_id", id)
    .order("created_at", { ascending: true });

  // Fetch related key takeaways
  const { data: keyTakeaways } = await supabase
    .from("key_takeaways")
    .select("*")
    .eq("meeting_id", id)
    .order("created_at", { ascending: true });

  // Fetch related key decisions
  const { data: keyDecisions } = await supabase
    .from("key_decisions")
    .select("*")
    .eq("meeting_id", id)
    .order("created_at", { ascending: true });

  // Fetch related follow up questions
  const { data: followUpQuestions } = await supabase
    .from("follow_up_questions")
    .select("*")
    .eq("meeting_id", id)
    .order("created_at", { ascending: true });

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];

  const usage = await getMonthlyUsage(supabase, user.id);

  const totalActions = actionItems?.length ?? 0;
  const completedActions = actionItems?.filter((a) => a.completed).length ?? 0;

  const formattedDate = new Date(meeting.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        fullName: displayName,
        role: role,
      }}
      usage={usage}
    >
      {/* Top Breadcrumb & Actions Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/dashboard/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Meetings</span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            {formattedDate}
          </span>
          {meeting.loom_url && (
            <a
              href={meeting.loom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <span>View Loom</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <DeleteMeetingButton meetingId={meeting.id} meetingTitle={meeting.title} />
        </div>
      </div>

      {/* Meeting Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium border border-blue-200 dark:border-blue-900">
          <Sparkles className="h-3 w-3" />
          <span>AI Structured Notes</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {meeting.title}
        </h1>
      </div>

      {/* Section 1: Summary */}
      <Card className="border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-white to-blue-50/20 dark:from-[#0c1220] dark:to-blue-950/20 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>1. Executive Summary</span>
          </CardTitle>
          <Badge variant="default">Google Gemini</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line">
            {meeting.summary || "No executive summary available."}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 (Key Takeaways) & Section 3 (Key Decisions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Section 2: Key Takeaways */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>2. Key Takeaways</span>
            </CardTitle>
            <Badge variant="warning">
              {keyTakeaways?.length ?? 0} {keyTakeaways?.length === 1 ? "Takeaway" : "Takeaways"}
            </Badge>
          </CardHeader>
          <CardContent>
            {keyTakeaways && keyTakeaways.length > 0 ? (
              <ul className="space-y-2.5">
                {keyTakeaways.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 border border-amber-200 dark:border-amber-800">
                      {index + 1}
                    </span>
                    <span>{item.content}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                No specific takeaways were extracted from this transcript.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Key Decisions */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>3. Key Decisions</span>
            </CardTitle>
            <Badge variant="teal">
              {keyDecisions?.length ?? 0} {keyDecisions?.length === 1 ? "Decision" : "Decisions"}
            </Badge>
          </CardHeader>
          <CardContent>
            {keyDecisions && keyDecisions.length > 0 ? (
              <ul className="space-y-2.5">
                {keyDecisions.map((decision, index) => (
                  <li
                    key={decision.id}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/50 text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-0.5 border border-teal-200 dark:border-teal-800">
                      {index + 1}
                    </span>
                    <span>{decision.content}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                No explicit decisions were recorded in this transcript.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Action Items */}
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>4. Action Items</span>
          </CardTitle>
          <Badge variant={completedActions === totalActions && totalActions > 0 ? "success" : "secondary"}>
            {completedActions} of {totalActions} Completed
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {actionItems && actionItems.length > 0 ? (
            actionItems.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                meetingId={meeting.id}
              />
            ))
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              No action items extracted for this meeting.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Follow-up Questions */}
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <HelpCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>5. Follow-up Questions &amp; Open Topics</span>
          </CardTitle>
          <Badge variant="secondary">
            {followUpQuestions?.length ?? 0} {followUpQuestions?.length === 1 ? "Question" : "Questions"}
          </Badge>
        </CardHeader>
        <CardContent>
          {followUpQuestions && followUpQuestions.length > 0 ? (
            <ul className="space-y-2">
              {followUpQuestions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="text-slate-400 dark:text-slate-500 font-bold">•</span>
                  <span>{q.content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              No unresolved questions or follow-up topics identified in this transcript.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Original Transcript Reference */}
      {meeting.transcript && (
        <details className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-5 shadow-2xs">
          <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              Original Transcript Reference
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {meeting.transcript}
          </div>
        </details>
      )}
    </DashboardShell>
  );
}
