"use client";

import { useState, useTransition } from "react";
import { Download, CheckCircle2, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminExportUsersCSVAction } from "@/app/actions/admin";

interface MarketingSubscriber {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  consentDate: string | null;
  signupDate: string;
  isSubscribed: boolean;
}

interface AdminMarketingViewProps {
  subscribers: MarketingSubscriber[];
  optInCount: number;
  totalCount: number;
}

export function AdminMarketingView({ subscribers, optInCount, totalCount }: AdminMarketingViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConsent, setFilterConsent] = useState<"all" | "subscribed" | "opted_out">("all");
  const [isPending, startTransition] = useTransition();

  const percentage = totalCount > 0 ? Math.round((optInCount / totalCount) * 100) : 0;

  const filtered = subscribers.filter((s) => {
    if (filterConsent === "subscribed" && !s.isSubscribed) return false;
    if (filterConsent === "opted_out" && s.isSubscribed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.company && s.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExport = () => {
    startTransition(async () => {
      const res = await adminExportUsersCSVAction({ marketingOnly: true });
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `loomnotes_marketing_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Opt-In Rate</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{percentage}%</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{optInCount} of {totalCount} users consented</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Subscribers</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{optInCount}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Valid marketing contacts</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Opted Out</span>
          <div className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-1">{totalCount - optInCount}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Unsubscribed / no consent</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterConsent}
            onChange={(e) => setFilterConsent(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-none"
          >
            <option value="all">All ({subscribers.length})</option>
            <option value="subscribed">Subscribed Only ({optInCount})</option>
            <option value="opted_out">Opted Out ({totalCount - optInCount})</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Subscribers</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Company &amp; Phone</th>
                <th className="py-3 px-4 font-semibold">Consent Status</th>
                <th className="py-3 px-4 font-semibold">Consent Date</th>
                <th className="py-3 px-4 font-semibold">Signup Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No marketing subscriber records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{s.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      <div>{s.company || <span className="text-slate-400 dark:text-slate-500 italic">No company</span>}</div>
                      <div className="text-slate-400 dark:text-slate-500">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {s.isSubscribed ? (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Subscribed
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                          <XCircle className="h-3 w-3 mr-1" /> Opted Out
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {s.consentDate ? new Date(s.consentDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(s.signupDate).toLocaleDateString()}
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
