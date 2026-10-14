"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClientFollow } from "@/context/clientfollow-context";

export default function ClientsDirectoryView() {
  const { clients, searchQuery, setSearchQuery, deleteClient } = useClientFollow();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [healthFilter, setHealthFilter] = useState<string>("");
  const [cadenceFilter, setCadenceFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filteredClients = clients
    .filter((client) => {
      if (activeTab === "Active Retainers") return client.engagementType === "Monthly Retainer";
      if (activeTab === "Fixed Project") return client.engagementType === "Fixed Project";
      if (activeTab === "Leads & Pitches") return client.status === "lead";
      if (activeTab === "Past / Inactive") return client.status === "completed" || client.status === "paused";
      return true;
    })
    .filter((client) => {
      if (!healthFilter) return true;
      if (healthFilter === "good") return client.healthScore >= 90;
      if (healthFilter === "attention") return client.healthScore >= 75 && client.healthScore < 90;
      if (healthFilter === "inactive") return client.healthScore < 75;
      return true;
    })
    .filter((client) => {
      if (!cadenceFilter) return true;
      if (cadenceFilter === "weekly") return client.cadenceDays <= 7;
      if (cadenceFilter === "biweekly") return client.cadenceDays > 7 && client.cadenceDays <= 14;
      if (cadenceFilter === "monthly") return client.cadenceDays > 14;
      return true;
    })
    .filter((client) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(q) ||
        client.company.toLowerCase().includes(q) ||
        client.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  const exportCSV = () => {
    const csvRows = [
      ["Name", "Company", "Title", "Email", "Phone", "Monthly Value", "Total Revenue", "Health"],
      ...clients.map((c) => [
        c.name,
        c.company,
        c.title,
        c.email,
        c.phone,
        c.monthlyValue,
        c.totalRevenue,
        `${c.healthScore}%`,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clientfollow_clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Stat Mosaic & Atmospheric Accent */}
      <div className="relative w-full mb-8 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#dae2fd]/60">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold bg-[#eaedff] px-2.5 py-1 rounded-full">
                CRM Core
              </span>
              <span className="text-xs text-[#434655] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#006242]"></span>
                Sync updated 4m ago
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">Clients Directory</h1>
              <span className="text-base text-[#434655] font-medium">({clients.length} active clients)</span>
            </div>
            <p className="text-sm text-[#434655] mt-1">
              Manage client relationships, contract milestones, and communication cadence across your independent practice.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportCSV}
              type="button"
              className="flex items-center gap-2 bg-white text-[#131b2e] hover:bg-[#f2f3ff] px-4 py-2.5 rounded-lg shadow-2xs text-sm font-semibold border border-slate-200 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-[#434655] leading-none">ios_share</span>
              <span>Export CSV</span>
            </button>
            <Link
              href="/clients/new"
              className="flex items-center gap-2 bg-[#2563eb] text-white hover:bg-[#004ac6] px-5 py-2.5 rounded-lg text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg leading-none">add</span>
              <span>+ Add New Client</span>
            </Link>
          </div>
        </div>

        {/* Quick Vital Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#434655] font-semibold">Monthly Retainer Yield</span>
              <span className="p-2 bg-[#f2f3ff] rounded-lg text-[#004ac6]">
                <span className="material-symbols-outlined text-lg leading-none">payments</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#131b2e] tracking-tight tabular-nums">$38,200</span>
              <span className="text-[11px] text-[#006242] font-bold bg-[#bdffdb] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs leading-none">trending_up</span> +14.2%
              </span>
            </div>
            <div className="mt-2 w-full bg-[#e2e7ff] h-1 rounded-full overflow-hidden">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#434655] font-semibold">Cadence Adherence</span>
              <span className="p-2 bg-[#f2f3ff] rounded-lg text-[#006a61]">
                <span className="material-symbols-outlined text-lg leading-none">verified</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#131b2e] tracking-tight">92.4%</span>
              <span className="text-[11px] text-[#006a61] font-bold">26 / 28 on track</span>
            </div>
            <div className="mt-2 w-full bg-[#e2e7ff] h-1 rounded-full overflow-hidden">
              <div className="bg-[#006a61] h-full rounded-full" style={{ width: "92%" }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#434655] font-semibold">Follow-ups Due Today</span>
              <span className="p-2 bg-[#f2f3ff] rounded-lg text-[#004ac6]">
                <span className="material-symbols-outlined text-lg leading-none">notifications_active</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#131b2e] tracking-tight">4 Actions</span>
              <span className="text-[11px] text-[#ba1a1a] font-bold bg-[#ffdad6] px-2 py-0.5 rounded-full">
                2 Overdue
              </span>
            </div>
            <div className="mt-2 w-full bg-[#e2e7ff] h-1 rounded-full overflow-hidden">
              <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#434655] font-semibold">Pipeline Conversion</span>
              <span className="p-2 bg-[#f2f3ff] rounded-lg text-[#434655]">
                <span className="material-symbols-outlined text-lg leading-none">filter_alt</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#131b2e] tracking-tight">7 Leads</span>
              <span className="text-[11px] text-[#434655] font-semibold">$54k pipeline</span>
            </div>
            <div className="mt-2 w-full bg-[#e2e7ff] h-1 rounded-full overflow-hidden">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls Deck */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs mb-6 flex flex-col gap-4">
        {/* Search Bar & Direct Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#434655] text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by client name, company, or tag..."
              className="w-full h-11 pl-11 pr-4 bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#737686] text-sm rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb] border border-transparent focus:border-[#2563eb] transition-all"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative w-full sm:w-auto">
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none h-11 pl-3.5 pr-9 bg-[#f2f3ff] text-[#131b2e] text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
              >
                <option value="">Health Status: All</option>
                <option value="good">Good (&gt;90%)</option>
                <option value="attention">Needs Attention (75-90%)</option>
                <option value="inactive">Inactive / At Risk (&lt;75%)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434655] text-lg pointer-events-none">
                unfold_more
              </span>
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none h-11 pl-3.5 pr-9 bg-[#f2f3ff] text-[#131b2e] text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
              >
                <option value="">Cadence: All Schedules</option>
                <option value="weekly">Weekly Sync (&lt;=7d)</option>
                <option value="biweekly">Bi-weekly Check-in (14d)</option>
                <option value="monthly">Monthly Review (30d)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#434655] text-lg pointer-events-none">
                unfold_more
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-[#f2f3ff] rounded-lg shrink-0 border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-sm transition-all cursor-pointer ${
                  viewMode === "table" ? "bg-white text-[#2563eb] shadow-2xs font-bold" : "text-[#434655] hover:text-[#131b2e]"
                }`}
                title="Table View"
                type="button"
              >
                <span className="material-symbols-outlined text-lg leading-none">format_list_bulleted</span>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-md text-sm transition-all cursor-pointer ${
                  viewMode === "card" ? "bg-white text-[#2563eb] shadow-2xs font-bold" : "text-[#434655] hover:text-[#131b2e]"
                }`}
                title="Card View"
                type="button"
              >
                <span className="material-symbols-outlined text-lg leading-none">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          {["All", "Active Retainers", "Fixed Project", "Leads & Pitches", "Past / Inactive"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#e2e7ff] text-[#004ac6] font-bold"
                    : "text-[#434655] hover:text-[#131b2e] hover:bg-[#f2f3ff]"
                }`}
                type="button"
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering: Table or Card Grid */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-[#f2f3ff] text-[#434655] text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 pl-6 pr-4 font-bold">Client &amp; Company</th>
                  <th className="py-3.5 px-4 font-bold">Engagement &amp; Yield</th>
                  <th className="py-3.5 px-4 font-bold">Health Status</th>
                  <th className="py-3.5 px-4 font-bold">Last Contacted</th>
                  <th className="py-3.5 px-4 font-bold">Next Follow-up</th>
                  <th className="py-3.5 pr-6 pl-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-[#131b2e]">
                {filteredClients.map((client) => {
                  return (
                    <tr key={client.id} className="hover:bg-[#faf8ff] transition-colors group">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.avatarUrl}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/clients/${client.id}`}
                              className="font-bold text-[#131b2e] hover:text-[#2563eb] transition-colors truncate"
                            >
                              {client.name}
                            </Link>
                            <span className="text-xs text-[#434655] truncate">{client.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex flex-col gap-0.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#004ac6] text-xs font-semibold w-fit">
                            {client.engagementType}
                          </span>
                          <span className="text-xs text-[#434655] font-mono font-medium ml-1">
                            {client.monthlyValue}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#bdffdb] text-[#006242] text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#007d55]"></span>
                          {client.healthScore}% Healthy
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-xs text-[#131b2e]">{client.lastTouch}</span>
                        <span className="block text-xs text-[#434655]">Direct correspondence</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f2f3ff] text-xs font-semibold border border-slate-200">
                          <span className="material-symbols-outlined text-sm text-[#2563eb]">calendar_clock</span>
                          <span className="text-[#131b2e]">{client.nextFollowUpDate}</span>
                          <span className="text-[#434655]">· {client.nextFollowUpType}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`mailto:${client.email}`}
                            className="p-2 text-[#434655] hover:text-[#2563eb] hover:bg-[#eaedff] rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <span className="material-symbols-outlined text-base leading-none">mail</span>
                          </a>
                          <Link
                            href={`/clients/${client.id}`}
                            className="p-2 text-[#434655] hover:text-[#2563eb] hover:bg-[#eaedff] rounded-lg transition-colors"
                            title="View Dossier"
                          >
                            <span className="material-symbols-outlined text-base leading-none">visibility</span>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Delete client ${client.name}?`)) {
                                deleteClient(client.id);
                              }
                            }}
                            type="button"
                            className="p-2 text-[#434655] hover:text-[#ba1a1a] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Client"
                          >
                            <span className="material-symbols-outlined text-base leading-none">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-bold text-base text-[#131b2e] hover:text-[#2563eb] transition-colors"
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-[#434655]">{client.company}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#bdffdb] text-[#006242] text-[11px] font-bold">
                    {client.healthScore}%
                  </span>
                </div>

                <div className="space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between text-[#434655]">
                    <span>Engagement:</span>
                    <span className="font-bold text-[#131b2e]">{client.engagementType}</span>
                  </div>
                  <div className="flex justify-between text-[#434655]">
                    <span>Monthly Retainer:</span>
                    <span className="font-bold text-[#006242] font-mono">{client.monthlyValue}</span>
                  </div>
                  <div className="flex justify-between text-[#434655]">
                    <span>Next Touch:</span>
                    <span className="font-semibold text-[#2563eb]">{client.nextFollowUpDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#434655] text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`mailto:${client.email}`}
                  className="text-xs text-[#2563eb] font-bold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span>{client.email}</span>
                </a>
                <Link
                  href={`/clients/${client.id}`}
                  className="px-3 py-1.5 bg-[#eaedff] text-[#004ac6] hover:bg-[#2563eb] hover:text-white rounded-lg text-xs font-bold transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
