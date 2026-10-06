"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Video, Search, ExternalLink } from "lucide-react";

interface MeetingRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  summary: string | null;
  createdAt: string;
  actionItemsCount: number;
}

interface AdminMeetingsViewProps {
  meetings: MeetingRecord[];
}

export function AdminMeetingsView({ meetings }: AdminMeetingsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const q = searchQuery.toLowerCase().trim();
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.userName.toLowerCase().includes(q) ||
        m.userEmail.toLowerCase().includes(q) ||
        (m.summary && m.summary.toLowerCase().includes(q))
    );
  }, [meetings, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by meeting title, owner name, or email..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
        />
      </div>

      {/* Meetings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Meeting Title</th>
                <th className="py-3 px-4 font-semibold">Workspace Owner</th>
                <th className="py-3 px-4 font-semibold">Summary Preview</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No meeting notes recorded in the workspace yet.
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{m.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/users/${m.userId}`}
                          className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {m.userName}
                        </Link>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{m.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {m.summary || "No summary preview available."}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/meetings/${m.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
