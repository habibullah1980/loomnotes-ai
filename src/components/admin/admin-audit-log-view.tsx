"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminAuditRecord } from "@/lib/admin/audit-service";

interface AdminAuditLogViewProps {
  logs: AdminAuditRecord[];
}

export function AdminAuditLogView({ logs }: AdminAuditLogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (actionFilter !== "all") {
      result = result.filter((l) => l.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.actor_email.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.target_id && l.target_id.toLowerCase().includes(q)) ||
          JSON.stringify(l.details).toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, searchQuery, actionFilter]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "user_created":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "user_updated":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "user_suspended":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "user_reactivated":
        return "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "user_deleted":
        return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      case "role_changed":
      case "permission_changed":
        return "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "data_exported":
        return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, or target ID..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>

        {/* Action Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-none"
          >
            <option value="all">All Actions ({logs.length})</option>
            <option value="user_created">User Created</option>
            <option value="user_updated">User Updated</option>
            <option value="user_suspended">User Suspended</option>
            <option value="user_reactivated">User Reactivated</option>
            <option value="user_deleted">User Deleted</option>
            <option value="role_changed">Role Changed</option>
            <option value="data_exported">Data Exported</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target</th>
                <th className="py-3 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No administrative audit events recorded yet.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {log.actor_email}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {log.actor_id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action.replace("_", " ")}
                      </Badge>
                    </td>

                    {/* Target */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {log.target_type}
                        </span>
                        {log.target_id && (
                          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                            ({log.target_id.slice(0, 8)}...)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4">
                      <pre className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg max-w-xs sm:max-w-md overflow-x-auto border border-slate-200/50 dark:border-slate-800">
                        {JSON.stringify(log.details, null, 1)}
                      </pre>
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
