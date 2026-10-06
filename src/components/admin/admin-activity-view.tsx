"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  LogIn,
  LogOut,
  UserPlus,
  Video,
  Sparkles,
  CheckSquare,
  Globe,
  Laptop,
  Smartphone,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityFeedItem } from "@/lib/admin/activity-service";

interface AdminActivityViewProps {
  initialItems: ActivityFeedItem[];
}

export function AdminActivityView({ initialItems }: AdminActivityViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const filteredItems = useMemo(() => {
    let result = [...initialItems];

    // Filter by Event Type
    if (typeFilter !== "all") {
      result = result.filter((item) => {
        if (typeFilter === "login") return item.eventType === "login";
        if (typeFilter === "signup") return item.eventType === "signup";
        if (typeFilter === "logout") return item.eventType === "logout";
        if (typeFilter === "meetings") return item.eventType === "meeting_created";
        if (typeFilter === "ai")
          return item.eventType === "ai_generation_completed" || item.eventType === "ai_generation_started";
        if (typeFilter === "loom")
          return item.eventType === "loom_transcript_requested" || item.eventType === "loom_transcript_completed";
        if (typeFilter === "action_items") return item.eventType === "action_item_completed";
        return item.eventType === typeFilter;
      });
    }

    // Filter by Date
    const now = new Date();
    if (dateFilter === "today") {
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
      result = result.filter((item) => item.createdAt >= todayStart);
    } else if (dateFilter === "7d") {
      const d = new Date(Date.now() - 7 * 86400000).toISOString();
      result = result.filter((item) => item.createdAt >= d);
    } else if (dateFilter === "30d") {
      const d = new Date(Date.now() - 30 * 86400000).toISOString();
      result = result.filter((item) => item.createdAt >= d);
    } else if (dateFilter === "custom" && customStartDate && customEndDate) {
      result = result.filter(
        (item) => item.createdAt >= customStartDate && item.createdAt <= customEndDate + "T23:59:59Z"
      );
    }

    // Search Filter (Name, Email, Activity)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.userName.toLowerCase().includes(q) ||
          item.userEmail.toLowerCase().includes(q) ||
          item.displayTitle.toLowerCase().includes(q) ||
          item.eventType.toLowerCase().includes(q) ||
          item.sessionId.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialItems, typeFilter, dateFilter, customStartDate, customEndDate, searchQuery]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "signup":
        return <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
      case "meeting_created":
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "ai_generation_completed":
      case "ai_generation_started":
        return <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "loom_transcript_requested":
      case "loom_transcript_completed":
        return <Video className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
      case "action_item_completed":
        return <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "login":
        return <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">Sign In</Badge>;
      case "signup":
        return <Badge className="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">Sign Up</Badge>;
      case "logout":
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">Sign Out</Badge>;
      case "meeting_created":
        return <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">Meeting Created</Badge>;
      case "ai_generation_completed":
        return <Badge className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">AI Notes</Badge>;
      case "loom_transcript_requested":
      case "loom_transcript_completed":
        return <Badge className="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">Loom Video</Badge>;
      case "action_item_completed":
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Action Item</Badge>;
      default:
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">{eventType.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, activity, or session ID..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Date:
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Sub-row */}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-500 dark:text-slate-400">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {/* Activity Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Type:
          </span>
          {[
            { id: "all", label: "All Activity" },
            { id: "login", label: "Logins" },
            { id: "signup", label: "Signups" },
            { id: "meetings", label: "Meetings" },
            { id: "ai", label: "AI Generations" },
            { id: "loom", label: "Loom Requests" },
            { id: "action_items", label: "Action Items" },
            { id: "logout", label: "Logout" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === tab.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table Feed */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Activity</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Device &amp; OS</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Session ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Activity className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No activity recorded yet.</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                        Activity will appear automatically as users interact with LoomNotes AI.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        {item.userId ? (
                          <Link
                            href={`/admin/users/${item.userId}`}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {item.userName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-white">{item.userName}</span>
                        )}
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{item.userEmail}</span>
                      </div>
                    </td>

                    {/* Activity Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getEventIcon(item.eventType)}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">
                          {item.displayTitle}
                        </span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">{getEventBadge(item.eventType)}</td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>

                    {/* Device & OS */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-medium flex items-center gap-1">
                          {item.deviceCategory === "Mobile" ? (
                            <Smartphone className="h-3 w-3 text-slate-400" />
                          ) : (
                            <Laptop className="h-3 w-3 text-slate-400" />
                          )}
                          {item.deviceCategory} • {item.browser}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.os}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-400" />
                        {item.city ? `${item.city}, ` : ""}
                        {item.country || "United States"}
                      </span>
                    </td>

                    {/* Session ID */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] select-all">
                        {item.sessionId}
                      </span>
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
