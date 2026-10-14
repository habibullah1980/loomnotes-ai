"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClientFollow } from "@/context/clientfollow-context";

export default function CalendarView() {
  const { clients, touchpoints, addFollowUp } = useClientFollow();

  const [activeView, setActiveView] = useState<"Month" | "Week" | "Day" | "Agenda">("Month");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October
  const [filterType, setFilterType] = useState<string>("All");
  const [touchpointModalOpen, setTouchpointModalOpen] = useState(false);
  const [tpClient, setTpClient] = useState(clients[0]?.name || "Elena Rostova");
  const [tpTitle, setTpTitle] = useState("");
  const [tpDate, setTpDate] = useState("2026-10-15");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handleCreateTouchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tpTitle) return;
    const matched = clients.find((c) => c.name === tpClient) || clients[0];
    addFollowUp({
      clientId: matched.id,
      clientName: matched.name,
      clientCompany: matched.company,
      clientAvatar: matched.avatarUrl,
      type: "Check-in",
      title: tpTitle,
      context: `Scheduled calendar event for ${tpDate}`,
      dueDate: tpDate,
      dueTime: "2:00 PM",
      urgency: "upcoming",
      dealValue: matched.monthlyValue,
      recommendedChannel: "call",
      cadenceRule: "Calendar Touchpoint",
      completed: false,
    });
    setTpTitle("");
    setTouchpointModalOpen(false);
    alert("Touchpoint scheduled on timeline!");
  };

  // Mock days grid for October
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header & Live Metric Ticker */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pt-4">
        <div>
          <div className="flex items-center gap-2 text-[#004ac6] text-xs uppercase tracking-wider font-extrabold mb-1">
            <span className="material-symbols-outlined text-sm leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_clock
            </span>
            <span>Timeline &amp; Cadence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">Follow-up Calendar</h1>
          <p className="text-sm text-[#434655] max-w-2xl mt-1">
            Visual timeline of scheduled client check-ins, touchpoints, and billing milestones.
          </p>
        </div>

        {/* Quick Stats Metric Micro-Bar */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start lg:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffdad6]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="text-xs text-[#93000a] font-bold">1 Overdue</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#86f2e4]/30">
            <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
            <span className="text-xs text-[#006f66] font-bold">4 Today</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e2e7ff]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span className="text-xs text-[#004ac6] font-bold">12 This Week</span>
          </div>
        </div>
      </div>

      {/* Controls & Action Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Date Navigation & Period Jump */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#f2f3ff] p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                aria-label="Previous Period"
                className="p-1 rounded-md hover:bg-white text-[#434655] hover:text-[#131b2e] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                aria-label="Next Period"
                className="p-1 rounded-md hover:bg-white text-[#434655] hover:text-[#131b2e] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-[#131b2e] tracking-tight min-w-[150px]">
              {monthNames[currentMonthIndex]} 2026
            </h2>

            <button
              onClick={() => setCurrentMonthIndex(9)}
              className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold transition-colors cursor-pointer"
              type="button"
            >
              Today
            </button>

            {/* View Switcher */}
            <div className="flex items-center bg-[#f2f3ff] p-1 rounded-lg border border-slate-200">
              {(["Month", "Week", "Day", "Agenda"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeView === view
                      ? "bg-white text-[#004ac6] shadow-2xs font-bold"
                      : "text-[#434655] hover:text-[#131b2e]"
                  }`}
                  type="button"
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action: Schedule Touchpoint Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTouchpointModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ Schedule Touchpoint</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
          <span className="text-[10px] text-[#737686] uppercase font-bold tracking-wider pr-1">Filter:</span>
          {[
            { id: "All", label: "All Clients", color: "bg-[#004ac6]" },
            { id: "Retainers", label: "Retainer Check-ins", color: "bg-[#006a61]" },
            { id: "Milestones", label: "Project Milestones", color: "bg-[#2563eb]" },
            { id: "Leads", label: "New Leads", color: "bg-[#006242]" },
            { id: "Billing", label: "Invoices & Billing", color: "bg-[#ba1a1a]" },
          ].map((chip) => {
            const isSelected = filterType === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id)}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#004ac6] text-white shadow-2xs"
                    : "bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chip.color}`}></span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Calendar Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Month Grid (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Weekday Headings */}
          <div className="grid grid-cols-7 bg-[#f2f3ff] text-center py-2.5 px-2 border-b border-slate-200">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="text-xs font-bold text-[#131b2e]">
                {day}
              </span>
            ))}
          </div>

          {/* Month Cells Matrix */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 p-px">
            {/* Leading padding cell */}
            <div className="bg-[#faf8ff] p-2 min-h-[105px] flex flex-col justify-between">
              <span className="text-[11px] text-[#737686]">28</span>
            </div>
            <div className="bg-[#faf8ff] p-2 min-h-[105px] flex flex-col justify-between">
              <span className="text-[11px] text-[#737686]">29</span>
            </div>
            <div className="bg-[#faf8ff] p-2 min-h-[105px] flex flex-col justify-between">
              <span className="text-[11px] text-[#737686]">30</span>
            </div>

            {/* Days 1 to 31 */}
            {daysInMonth.map((day) => {
              const isToday = day === 15;
              const hasTouchpoint = day === 8 || day === 9 || day === 10 || day === 15 || day === 22;

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[105px] flex flex-col justify-between transition-colors ${
                    isToday
                      ? "bg-blue-50/70 ring-2 ring-[#2563eb] rounded-xs"
                      : "bg-white hover:bg-[#faf8ff]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "bg-[#2563eb] text-white px-1.5 py-0.5 rounded-full font-bold" : "text-[#131b2e]"
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse"></span>}
                  </div>

                  <div className="flex flex-col gap-1 my-auto pt-1">
                    {day === 8 && (
                      <div className="p-1 rounded bg-red-100 text-[#ba1a1a] text-[10px] font-bold truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">warning</span>
                        <span className="truncate">David - Seed Deck</span>
                      </div>
                    )}
                    {day === 9 && (
                      <div className="p-1 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">warning</span>
                        <span className="truncate">Julianne - Milestone 2</span>
                      </div>
                    )}
                    {day === 10 && (
                      <div className="p-1 rounded bg-[#e2e7ff] text-[#004ac6] text-[10px] font-bold truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]"></span>
                        <span className="truncate">Marcus - Sprint Call</span>
                      </div>
                    )}
                    {day === 15 && (
                      <>
                        <div className="p-1 rounded bg-[#86f2e4]/40 text-[#006f66] text-[10px] font-bold truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                          <span className="truncate">Elena - Packaging</span>
                        </div>
                        <div className="p-1 rounded bg-[#e2e7ff] text-[#004ac6] text-[10px] font-bold truncate flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">call</span>
                          <span className="truncate">Marcus - Q4 Call</span>
                        </div>
                      </>
                    )}
                    {day === 22 && (
                      <div className="p-1 rounded bg-[#bdffdb] text-[#006242] text-[10px] font-bold truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006242]"></span>
                        <span className="truncate">Arthur - Advisory</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Agenda Panel (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#131b2e]">Upcoming Touchpoints Agenda</h3>
              <span className="text-[10px] text-[#004ac6] uppercase font-bold tracking-wider">Sync Log</span>
            </div>

            <div className="space-y-3">
              {touchpoints.map((tp) => (
                <div
                  key={tp.id}
                  className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col gap-1 hover:bg-[#eaedff] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#131b2e]">{tp.clientName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tp.status === "overdue"
                          ? "bg-[#ffdad6] text-[#ba1a1a]"
                          : "bg-[#e2e7ff] text-[#004ac6]"
                      }`}
                    >
                      {tp.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#434655] font-semibold">{tp.title}</p>
                  <span className="text-[11px] text-[#737686]">{tp.date} · {tp.company}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert("Google Calendar and Outlook sync verified.")}
              className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              Sync with External Calendar
            </button>
          </section>
        </div>
      </div>

      {/* SCHEDULE TOUCHPOINT MODAL */}
      {touchpointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-[#131b2e] mb-3">Schedule Timeline Touchpoint</h3>
            <form onSubmit={handleCreateTouchpoint} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#434655] mb-1">Select Client</label>
                <select
                  value={tpClient}
                  onChange={(e) => setTpClient(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-sm rounded-lg border border-slate-200 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655] mb-1">Touchpoint Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Design critique & roadmap sync"
                  value={tpTitle}
                  onChange={(e) => setTpTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-sm rounded-lg border border-slate-200 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655] mb-1">Event Date</label>
                <input
                  type="date"
                  value={tpDate}
                  onChange={(e) => setTpDate(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] text-sm rounded-lg border border-slate-200 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTouchpointModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#434655] hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#004ac6] hover:bg-[#2563eb] rounded-lg shadow-xs"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
