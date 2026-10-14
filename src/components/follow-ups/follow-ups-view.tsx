"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClientFollow } from "@/context/clientfollow-context";

export default function FollowUpsView() {
  const { followUps, toggleFollowUpComplete, deleteFollowUp } = useClientFollow();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [channelFilter, setChannelFilter] = useState<string>("All Channels");
  const [priorityFilter, setPriorityFilter] = useState<string>("All Priorities");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "Hi [Client],\n\nFollowing up on our recent milestone deliverables. Let me know if you have any questions or need adjustments before we proceed.\n\nBest,\nSarah"
  );

  const filteredFollowUps = followUps.filter((item) => {
    if (activeTab === "Overdue") return item.urgency === "overdue" && !item.completed;
    if (activeTab === "Due Today") return item.urgency === "due_today" && !item.completed;
    if (activeTab === "This Week") return item.urgency === "upcoming" && !item.completed;
    if (activeTab === "Completed") return item.completed;
    return true;
  }).filter((item) => {
    if (channelFilter !== "All Channels") {
      if (channelFilter === "Email" && item.recommendedChannel !== "email") return false;
      if (channelFilter === "Phone" && item.recommendedChannel !== "call") return false;
    }
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.clientName.toLowerCase().includes(q) ||
      item.clientCompany.toLowerCase().includes(q)
    );
  });

  const overdueItems = filteredFollowUps.filter((f) => f.urgency === "overdue" && !f.completed);
  const dueTodayItems = filteredFollowUps.filter((f) => f.urgency === "due_today" && !f.completed);
  const upcomingItems = filteredFollowUps.filter((f) => f.urgency === "upcoming" && !f.completed);
  const completedItems = filteredFollowUps.filter((f) => f.completed);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Headline & Action Ribbon */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#eaedff] text-[#004ac6]">
              <span className="material-symbols-outlined text-base leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                cycle
              </span>
            </span>
            <span className="text-xs uppercase tracking-wider text-[#004ac6] font-extrabold">
              Cadence Control Hub
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#c3c6d7]"></span>
            <span className="text-xs text-[#434655] font-medium">Auto-sync with Gmail &amp; Calendar</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">Follow-ups &amp; Cadences</h1>
          <p className="text-sm text-[#434655] max-w-2xl">
            Stay top-of-mind with prospects and retain active freelance clients with zero dropped balls.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => alert("Follow-ups exported as CSV.")}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-[#f2f3ff] text-[#131b2e] border border-slate-200 shadow-2xs font-semibold text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#434655]">file_download</span>
            <span>Export</span>
          </button>
          <Link
            href="/clients/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#004ac6] shadow-xs font-bold text-xs"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>+ New Follow-up</span>
          </Link>
        </div>
      </section>

      {/* Metrics Glance Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#434655] font-bold">Unresolved Pipeline</span>
            <span className="text-2xl font-extrabold text-[#131b2e] mt-1 tabular-nums">$38,200</span>
            <span className="text-[11px] text-[#006242] mt-0.5 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-xs">trending_up</span> 4 high-value deals active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#2563eb]">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#ba1a1a] font-bold">Overdue Invoices</span>
            <span className="text-2xl font-extrabold text-[#ba1a1a] mt-1 tabular-nums">$8,500</span>
            <span className="text-[11px] text-[#ba1a1a] mt-0.5 flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-xs">warning</span> Action required now
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-2xl">hourglass_bottom</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#434655] font-bold">Response Rate (30d)</span>
            <span className="text-2xl font-extrabold text-[#131b2e] mt-1">91.4%</span>
            <span className="text-[11px] text-[#006a61] mt-0.5 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-xs">bolt</span> ~3.2 hours median reply
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#86f2e4]/30 flex items-center justify-center text-[#006a61]">
            <span className="material-symbols-outlined text-2xl">reply_all</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#434655] font-bold">Scheduled This Week</span>
            <span className="text-2xl font-extrabold text-[#131b2e] mt-1">{followUps.length} Tasks</span>
            <span className="text-[11px] text-[#434655] mt-0.5">Across 8 active clients</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>
      </section>

      {/* Filter & Status Segment Strip */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 mb-6 flex flex-col gap-4">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "All", label: "All Follow-ups", count: followUps.length },
            { id: "Overdue", label: "Overdue", count: overdueItems.length, color: "text-[#ba1a1a]" },
            { id: "Due Today", label: "Due Today", count: dueTodayItems.length, color: "text-[#006a61]" },
            { id: "This Week", label: "This Week", count: upcomingItems.length },
            { id: "Completed", label: "Completed / Logged", count: completedItems.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#2563eb] text-white"
                    : "bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-[#434655]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-base pointer-events-none">
              filter_alt
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by client, deal keyword, or tag..."
              className="w-full h-9 pl-9 pr-3 bg-[#f2f3ff] rounded-lg text-xs text-[#131b2e] border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#f2f3ff] text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
            >
              <option>All Channels</option>
              <option>Email</option>
              <option>Phone</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#f2f3ff] text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
            >
              <option>All Priorities</option>
              <option>High Priority</option>
              <option>Normal</option>
            </select>
          </div>
        </div>
      </section>

      {/* 2-Column Split: Cadence Management Stack & Side Templates Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Task Sequence (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* OVERDUE SECTION */}
          {overdueItems.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#ffdad6] text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#131b2e]">Overdue Follow-ups</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">
                    Action Needed Now ({overdueItems.length})
                  </span>
                </div>
              </div>

              {overdueItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white border border-red-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleFollowUpComplete(item.id)}
                      className="mt-1 w-5 h-5 rounded accent-[#2563eb] cursor-pointer"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/clients/${item.clientId}`} className="text-sm font-bold text-[#131b2e] hover:text-[#2563eb]">
                          {item.clientName}
                        </Link>
                        <span className="text-xs text-[#434655]">· {item.clientCompany}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {item.dueTime || item.dueDate}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#131b2e] mt-1">{item.title}</p>
                      <p className="text-xs text-[#434655] mt-0.5">{item.context}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => toggleFollowUpComplete(item.id)}
                      type="button"
                      className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#004ac6] text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Send Draft</span>
                    </button>
                    <button
                      onClick={() => deleteFollowUp(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* DUE TODAY & UPCOMING */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-[#131b2e] px-1">Upcoming Cadence Queue</h2>
            {[...dueTodayItems, ...upcomingItems].map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleFollowUpComplete(item.id)}
                    className="mt-1 w-5 h-5 rounded accent-[#2563eb] cursor-pointer"
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/clients/${item.clientId}`} className="text-sm font-bold text-[#131b2e] hover:text-[#2563eb]">
                        {item.clientName}
                      </Link>
                      <span className="text-xs text-[#434655]">· {item.clientCompany}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#004ac6] text-[10px] font-bold">
                        {item.dueDate}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#131b2e] mt-1">{item.title}</p>
                    <p className="text-xs text-[#434655] mt-0.5">{item.context}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => toggleFollowUpComplete(item.id)}
                    type="button"
                    className="px-3 py-1.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Mark Done</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Side Templates Drawer (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#131b2e]">Quick Email Templates</h3>
              <span className="text-[10px] text-[#004ac6] uppercase font-bold tracking-wider">Fast Copy</span>
            </div>

            <div className="space-y-2 mb-4">
              {[
                {
                  label: "Polite Milestone Check-in",
                  text: "Hi [Client],\n\nFollowing up on our recent milestone deliverables. Let me know if you have any questions or need adjustments before we proceed.\n\nBest,\nSarah",
                },
                {
                  label: "Invoice Grace Follow-up",
                  text: "Hi [Client],\n\nHope your week is going well! Just checking in on invoice #[Number] sent last week. Please let me know if AP needs any additional documentation.\n\nBest,\nSarah",
                },
                {
                  label: "Proposal Gentle Nudge",
                  text: "Hi [Client],\n\nWanted to check if you had a chance to review the proposal deck sent earlier this week. Looking forward to our discussion!\n\nBest,\nSarah",
                },
              ].map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.text)}
                  className="w-full text-left p-2.5 rounded-lg text-xs font-semibold bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] transition-colors cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-3 bg-[#f2f3ff] rounded-lg text-xs text-[#131b2e] border border-slate-200 font-mono resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb]"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedTemplate);
                alert("Template copied to clipboard!");
              }}
              className="w-full mt-3 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Copy Template to Clipboard
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
