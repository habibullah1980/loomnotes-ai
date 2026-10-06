"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleActionItemAction } from "@/app/actions/meetings";
import { User, Calendar, Check, Loader2, Video } from "lucide-react";

interface ActionItemProps {
  item: {
    id: string;
    task: string;
    assignee: string | null;
    due_date: string | null;
    completed: boolean;
  };
  meetingId: string;
  meetingTitle?: string;
}

export function ActionItemRow({ item, meetingId, meetingTitle }: ActionItemProps) {
  const [completed, setCompleted] = useState(item.completed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !completed;
    setCompleted(nextState);

    startTransition(async () => {
      const res = await toggleActionItemAction(item.id, nextState, meetingId);
      if (res?.error) {
        // Rollback on error
        setCompleted(!nextState);
      }
    });
  };

  return (
    <div
      onClick={handleToggle}
      className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all cursor-pointer ${
        completed
          ? "border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-70"
          : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-2xs"
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        disabled={isPending}
        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          completed
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-blue-500"
        }`}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
        ) : completed ? (
          <Check className="h-3 w-3 stroke-[3]" />
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <p
          className={`text-xs sm:text-sm leading-relaxed transition-colors ${
            completed
              ? "line-through text-slate-400 dark:text-slate-500"
              : "text-slate-900 dark:text-slate-100 font-medium"
          }`}
        >
          {item.task}
        </p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {meetingTitle && (
            <Link
              href={`/dashboard/meetings/${meetingId}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <Video className="h-3 w-3 text-blue-500" />
              <span className="truncate max-w-[180px]">{meetingTitle}</span>
            </Link>
          )}
          {item.assignee && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
              <User className="h-3 w-3 text-slate-400" />
              <span>{item.assignee}</span>
            </span>
          )}
          {item.due_date && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
              <Calendar className="h-3 w-3 text-amber-500" />
              <span>Due {item.due_date}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
