"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Plus, FileText, Sparkles, X } from "lucide-react";
import { MeetingCard, type MeetingCardData } from "./meeting-card";

interface MeetingHistoryListProps {
  initialMeetings: MeetingCardData[];
}

export function MeetingHistoryList({ initialMeetings }: MeetingHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter and sort meetings
  const filteredMeetings = useMemo(() => {
    let result = [...initialMeetings];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.summary && m.summary.toLowerCase().includes(q))
      );
    }

    // Sort by created date
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [initialMeetings, searchQuery, sortOrder]);

  // Overall empty state (No meetings in database)
  if (initialMeetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-white dark:bg-[#0c1220] space-y-4 transition-colors">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
          <FileText className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No meetings found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            You haven&apos;t analyzed any meetings yet. Paste a transcript from your Loom recording to extract structured notes with Gemini AI.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create your first meeting</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls Bar: Search, Sort, and New Meeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by title or keywords..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sort Selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs dark:bg-slate-900"
              >
                <option value="newest" className="dark:bg-slate-900 dark:text-slate-100">Newest first</option>
                <option value="oldest" className="dark:bg-slate-900 dark:text-slate-100">Oldest first</option>
              </select>
            </div>
          </div>

          {/* New Meeting CTA */}
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Meeting</span>
          </Link>
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
        <span>
          Showing <strong>{filteredMeetings.length}</strong> of {initialMeetings.length} meetings
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Search No-Results State */}
      {filteredMeetings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-8 text-center space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            No meetings found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or clear the filter.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Meeting Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
}
