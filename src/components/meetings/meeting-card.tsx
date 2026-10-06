import Link from "next/link";
import { Calendar, CheckCircle2, ListTodo, ArrowRight, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MeetingCardData {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  action_items?: {
    id: string;
    completed: boolean;
  }[];
}

interface MeetingCardProps {
  meeting: MeetingCardData;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const totalTasks = meeting.action_items?.length ?? 0;
  const completedTasks = meeting.action_items?.filter((a) => a.completed).length ?? 0;
  const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

  const formattedDate = new Date(meeting.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/dashboard/meetings/${meeting.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-all hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-xs"
    >
      <div className="space-y-3">
        {/* Top Meta Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>

          {totalTasks > 0 ? (
            <Badge
              variant={allCompleted ? "success" : "secondary"}
              className="text-[11px] font-medium"
            >
              {allCompleted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All Done ({totalTasks})
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ListTodo className="h-3 w-3" />
                  {completedTasks} / {totalTasks} Tasks
                </span>
              )}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
              0 Tasks
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {meeting.title}
        </h3>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {meeting.summary || "Click to view full notes, takeaways, and action items."}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Video className="h-3.5 w-3.5" />
          <span>View Notes &amp; Tasks</span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
