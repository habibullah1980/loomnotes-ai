"use client";

import { useState } from "react";
import { ActionItemRow } from "@/components/meetings/action-item-row";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

export interface HubActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  task: string;
  assignee: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

interface ActionItemsHubProps {
  initialItems: HubActionItem[];
}

export function ActionItemsHub({ initialItems }: ActionItemsHubProps) {
  const [items] = useState<HubActionItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter items
  const filtered = items.filter((item) => {
    if (statusFilter === "pending" && item.completed) return false;
    if (statusFilter === "completed" && !item.completed) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTask = item.task.toLowerCase().includes(q);
      const matchAssignee = item.assignee?.toLowerCase().includes(q);
      const matchMeeting = item.meetingTitle.toLowerCase().includes(q);
      return matchTask || matchAssignee || matchMeeting;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open Tasks</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Tasks</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task, assignee, or meeting..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["all", "pending", "completed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === filter
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {filter === "all" ? `All (${totalCount})` : filter === "pending" ? `Open (${pendingCount})` : `Completed (${completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Action Items List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 shadow-xs">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <ActionItemRow
                  item={{
                    id: item.id,
                    task: item.task,
                    assignee: item.assignee,
                    due_date: item.due_date,
                    completed: item.completed,
                  }}
                  meetingId={item.meetingId}
                  meetingTitle={item.meetingTitle}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
              <ListTodo className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {search ? "No matching action items found" : "No action items in this filter"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search
                  ? "Try searching for a different keyword or clearing your search term."
                  : "Action items extracted from your AI meeting analyses will appear here."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
