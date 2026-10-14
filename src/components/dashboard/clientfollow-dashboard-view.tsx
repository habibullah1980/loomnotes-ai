"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClientFollow } from "@/context/clientfollow-context";

export default function DashboardClientView({ userGreeting = "Sarah" }: { userGreeting?: string }) {
  const { clients, followUps, toggleFollowUpComplete, addFollowUp, searchQuery } = useClientFollow();

  const [activeChannelFilter, setActiveChannelFilter] = useState<string>("All");
  const [quickClientName, setQuickClientName] = useState(clients[0]?.name || "Elena Rostova");
  const [quickDate, setQuickDate] = useState("2026-10-14");
  const [quickChannel, setQuickChannel] = useState("Email");
  const [quickNote, setQuickNote] = useState("");

  const filteredQueue = followUps.filter((item) => {
    if (activeChannelFilter === "All") return true;
    if (activeChannelFilter === "Email") return item.recommendedChannel === "email";
    if (activeChannelFilter === "Call") return item.recommendedChannel === "call";
    return true;
  }).filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const dueTodayCount = followUps.filter((f) => f.urgency === "due_today" && !f.completed).length;
  const overdueCount = followUps.filter((f) => f.urgency === "overdue" && !f.completed).length;
  const upcomingCount = followUps.filter((f) => f.urgency === "upcoming" && !f.completed).length;

  const handleQuickSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = clients.find((c) => c.name === quickClientName) || clients[0];
    addFollowUp({
      clientId: matched.id,
      clientName: matched.name,
      clientCompany: matched.company,
      clientAvatar: matched.avatarUrl,
      type: "Check-in",
      title: quickNote || `Cadence check-in with ${matched.name}`,
      context: `Scheduled via Quick Scheduler (${quickChannel})`,
      dueDate: quickDate,
      dueTime: "10:30 AM",
      urgency: "upcoming",
      dealValue: matched.monthlyValue,
      recommendedChannel: quickChannel.toLowerCase().includes("call") ? "call" : "email",
      cadenceRule: "Custom quick schedule",
      completed: false,
    });
    setQuickNote("");
    alert("Follow-up touchpoint scheduled successfully!");
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Greeting & Header Bar */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-[#006a61] tracking-widest uppercase font-bold">
              Executive Dispatch
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
            <span className="text-[11px] text-[#434655] font-mono">Tuesday, Oct 24</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">
            Good morning, {userGreeting} 👋
          </h1>
          <p className="text-sm text-[#434655] mt-0.5">
            Here is what needs your attention today across {clients.length} active freelance clients.
          </p>
        </div>

        {/* Quick Stats Ribbon & Action Trigger */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="hidden xl:flex items-center gap-2 bg-[#eaedff] px-4 py-1.5 rounded-full shadow-2xs text-[#434655] text-xs font-semibold">
            <span
              className="material-symbols-outlined text-base text-[#006242]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>All systems sync</span>
            <span className="text-[#737686]">·</span>
            <span className="font-mono text-[#131b2e] font-bold">99.4% SLA</span>
          </div>
          <button
            onClick={() => alert("Daily sequence checked: 4 touchpoints staged for dispatch.")}
            type="button"
            className="flex items-center gap-2 bg-[#2563eb] text-white hover:bg-[#004ac6] px-4 py-2 rounded-lg shadow-xs transition-all text-sm font-semibold active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">instant_mix</span>
            <span>Run Daily Sequence</span>
          </button>
        </div>
      </section>

      {/* 4 Primary Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Clients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">
              Total Clients
            </span>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-[11px] font-bold">
              <span className="material-symbols-outlined text-xs leading-none">arrow_upward</span>
              +12%
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
              {clients.length}
            </span>
            <span className="text-xs text-[#434655]">+3 this month</span>
          </div>
          <div className="w-full bg-[#e2e7ff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "78%" }}></div>
          </div>
        </div>

        {/* Card 2: Due Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">
              Due Today
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#131b2e] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
              High Priority
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
              {dueTodayCount}
            </span>
            <span className="text-xs text-[#434655]">Before 6:00 PM</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#434655] text-xs">
            <span className="material-symbols-outlined text-sm leading-none text-[#2563eb]">alarm</span>
            <span>Next due in 35m (Vanguard)</span>
          </div>
        </div>

        {/* Card 3: Upcoming Follow-ups */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">
              Upcoming
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#006242] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007d55]"></span>
              On Track
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
              {upcomingCount}
            </span>
            <span className="text-xs text-[#434655]">Next 7 days</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#434655] text-xs">
            <span className="material-symbols-outlined text-sm leading-none text-[#006242]">calendar_clock</span>
            <span>Scheduled automated check-ins</span>
          </div>
        </div>

        {/* Card 4: Overdue Follow-ups */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">
              Overdue
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
              Attention
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#ba1a1a] tracking-tight tabular-nums">
              {overdueCount}
            </span>
            <span className="text-xs text-[#434655]">Immediate action</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#ba1a1a] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm leading-none">warning</span>
            <span>Invoice milestone &amp; Pitch deck</span>
          </div>
        </div>
      </section>

      {/* Two-Column Master Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAJOR COLUMN (8 of 12 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Today's Action Queue */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[#2563eb] text-2xl leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  task_alt
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#131b2e] tracking-tight">Today&apos;s Action Queue</h2>
                  <p className="text-xs text-[#434655]">Actionable items requiring outbound correspondence today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#434655]">Filter:</span>
                {["All", "Email", "Call"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveChannelFilter(filter)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      activeChannelFilter === filter
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#eaedff] text-[#131b2e] hover:bg-[#e2e7ff]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up Items List */}
            <div className="flex flex-col gap-3 mt-4">
              {filteredQueue.map((item) => {
                const isOverdue = item.urgency === "overdue";
                return (
                  <div
                    key={item.id}
                    className={`group p-4 rounded-xl transition-all border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      item.completed
                        ? "bg-slate-50 opacity-60 border-slate-200"
                        : isOverdue
                        ? "bg-[#fff7f7] border-red-200 hover:bg-[#ffefef]"
                        : "bg-[#f2f3ff] border-[#eaedff] hover:bg-[#eaedff]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleFollowUpComplete(item.id)}
                        aria-label="Mark task done"
                        className="mt-1 h-4 w-4 rounded accent-[#2563eb] cursor-pointer"
                      />
                      <img
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        src={item.clientAvatar}
                        alt={item.clientName}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/clients/${item.clientId}`}
                            className="text-sm font-bold text-[#131b2e] hover:text-[#2563eb] transition-colors"
                          >
                            {item.clientName}
                          </Link>
                          <span className="text-xs text-[#434655]">· {item.clientCompany}</span>
                          {isOverdue && !item.completed && (
                            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                              Overdue
                            </span>
                          )}
                          {item.completed && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Completed
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm text-[#131b2e] mt-1 ${
                            item.completed ? "line-through text-slate-500" : ""
                          }`}
                        >
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#434655]">
                          <span className="flex items-center gap-1 text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-sm leading-none text-[#2563eb]">
                              {item.recommendedChannel === "call" ? "call" : "mail"}
                            </span>
                            {item.recommendedChannel.toUpperCase()}
                          </span>
                          <span>·</span>
                          <span className={isOverdue ? "text-[#ba1a1a] font-bold font-mono" : "font-mono"}>
                            {item.dueTime || item.dueDate}
                          </span>
                          {item.dealValue && (
                            <>
                              <span>·</span>
                              <span className="font-semibold tabular-nums text-[#006242]">{item.dealValue}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => toggleFollowUpComplete(item.id)}
                        type="button"
                        className="px-3 py-1.5 bg-[#2563eb] text-white hover:bg-[#004ac6] rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm leading-none">
                          {item.completed ? "undo" : "send"}
                        </span>
                        <span>{item.completed ? "Undo" : "Mark Sent"}</span>
                      </button>
                      <button
                        onClick={() => alert(`Touchpoint for ${item.clientName} snoozed by 24h.`)}
                        type="button"
                        className="p-1.5 text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff] rounded-lg transition-colors cursor-pointer"
                        title="Snooze"
                      >
                        <span className="material-symbols-outlined text-lg leading-none">snooze</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Recent Client Interactions Timeline */}
          <section className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[#006a61] text-2xl leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  history
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#131b2e] tracking-tight">Recent Client Interactions</h2>
                  <p className="text-xs text-[#434655]">Direct log stream across synced mailboxes &amp; calendars</p>
                </div>
              </div>
              <Link
                href="/follow-ups"
                className="text-[#004ac6] hover:text-[#2563eb] text-xs font-bold flex items-center gap-1"
              >
                <span>View All Logs</span>
                <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
              </Link>
            </div>

            <div className="relative pl-6 flex flex-col gap-6 mt-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dae2fd]">
              {/* Timeline Entry 1 */}
              <div className="relative flex items-start justify-between gap-4">
                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006242]"></span>
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#131b2e]">Contract Signoff Completed</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#006242] text-[10px] font-bold">
                      Retainer
                    </span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Elena Rostova signed <span className="font-semibold text-[#131b2e]">Aura Studio Brand Refresh Addendum B</span> ($12,000 value).
                  </p>
                  <span className="font-mono text-[11px] text-[#737686] mt-1">Today at 8:45 AM</span>
                </div>
                <span className="material-symbols-outlined text-[#006242] text-xl shrink-0">verified</span>
              </div>

              {/* Timeline Entry 2 */}
              <div className="relative flex items-start justify-between gap-4">
                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#131b2e]">Email Follow-up Sent</span>
                    <span className="text-xs text-[#434655]">via Gmail Auto-sync</span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Logged outgoing email to <span className="font-semibold text-[#131b2e]">David Chen</span> at Kinetics AI regarding <span className="italic">&quot;Seed Pitch Deck Revision &amp; Demo Notes&quot;</span>.
                  </p>
                  <span className="font-mono text-[11px] text-[#737686] mt-1">Yesterday at 5:12 PM</span>
                </div>
                <span className="material-symbols-outlined text-[#434655] text-xl shrink-0">mark_email_read</span>
              </div>

              {/* Timeline Entry 3 */}
              <div className="relative flex items-start justify-between gap-4">
                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#131b2e]">Client Call Logged</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#131b2e] text-[10px] font-bold">35 min call</span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Quarterly sync with <span className="font-semibold text-[#131b2e]">Marcus Vance (Vanguard Studio)</span>. Noted requirement for design sprint in mid-November.
                  </p>
                  <span className="font-mono text-[11px] text-[#737686] mt-1">Oct 23, 2:15 PM</span>
                </div>
                <span className="material-symbols-outlined text-[#006a61] text-xl shrink-0">phone_callback</span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT / MINOR COLUMN (4 of 12 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Widget 1: Quick Follow-up Composer */}
          <section className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb] text-xl leading-none">add_circle</span>
                <h3 className="font-bold text-base text-[#131b2e]">Quick Scheduler</h3>
              </div>
              <span className="text-[11px] text-[#004ac6] font-bold uppercase tracking-wider">Fast Log</span>
            </div>

            <form onSubmit={handleQuickSchedule} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#434655]">Select Client</label>
                <select
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#434655]">Date</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full h-10 px-2 bg-[#f2f3ff] text-[#131b2e] text-xs rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#434655]">Channel</label>
                  <select
                    value={quickChannel}
                    onChange={(e) => setQuickChannel(e.target.value)}
                    className="w-full h-10 px-2 bg-[#f2f3ff] text-[#131b2e] text-xs rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Slack DM</option>
                    <option>LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#434655]">Context or Objective</label>
                <textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="e.g. Inquire about feedback on design sprint..."
                  rows={2}
                  className="w-full p-2.5 bg-[#f2f3ff] text-[#131b2e] text-xs rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">schedule_send</span>
                <span>Schedule Follow-up</span>
              </button>
            </form>
          </section>

          {/* Widget 2: Pipeline Overview & Health */}
          <section className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#131b2e]">Pipeline Health</h3>
                <span className="text-xs text-[#434655]">28 active client lifecycles</span>
              </div>
              <span className="text-base font-extrabold text-[#006242] tabular-nums">$64.2k</span>
            </div>

            <div className="flex flex-col gap-3 my-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#131b2e]">Lead Outreach</span>
                  <span className="font-mono text-[#434655]">6 clients</span>
                </div>
                <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#131b2e]">Proposal Sent</span>
                  <span className="font-mono text-[#434655]">5 clients</span>
                </div>
                <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#004ac6] h-full rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#131b2e]">Project Active</span>
                  <span className="font-mono text-[#434655]">11 clients</span>
                </div>
                <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006a61] h-full rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#131b2e]">Monthly Retainer</span>
                  <span className="font-mono text-[#434655]">6 clients</span>
                </div>
                <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006242] h-full rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>

            <div className="mt-2 p-3 bg-[#f2f3ff] rounded-lg flex items-center justify-between border border-[#eaedff]">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#434655]">Avg Close Velocity</span>
                <span className="text-sm font-extrabold text-[#131b2e]">14.2 Days</span>
              </div>
              <svg className="w-20 h-6 text-[#2563eb]" fill="none" viewBox="0 0 100 30">
                <path d="M0 25 Q 25 20, 45 14 T 75 8 T 100 4" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="100" cy="4" fill="currentColor" r="3" />
              </svg>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
