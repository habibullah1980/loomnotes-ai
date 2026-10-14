"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useClientFollow } from "@/context/clientfollow-context";

export default function ClientProfileView() {
  const params = useParams();
  const router = useRouter();
  const clientId = (params?.id as string) || "c1";

  const { clients, followUps, addFollowUp, toggleFollowUpComplete, deleteClient } = useClientFollow();

  const client = clients.find((c) => c.id === clientId) || clients[0];
  const clientFollowUps = followUps.filter((f) => f.clientId === client.id);

  const [activeTab, setActiveTab] = useState<string>("Overview & Activity");
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logNote, setLogNote] = useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNote) return;
    addFollowUp({
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientAvatar: client.avatarUrl,
      type: "Check-in",
      title: logNote,
      context: "Logged note from client dossier",
      dueDate: "2026-10-18",
      dueTime: "11:00 AM",
      urgency: "upcoming",
      dealValue: client.monthlyValue,
      recommendedChannel: "email",
      cadenceRule: "Manual log",
      completed: false,
    });
    setLogNote("");
    setLogModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Profile Hero Banner / Card */}
      <div className="relative bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 mb-6 overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Identity & Context */}
          <div className="flex items-start md:items-center gap-6">
            <div className="relative group shrink-0">
              <img
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                src={client.avatarUrl}
                alt={client.name}
              />
              <span
                className="absolute bottom-0 right-0 w-6 h-6 bg-[#006242] rounded-full shadow-sm flex items-center justify-center text-white text-[11px]"
                title="Relationship Active"
              >
                <span
                  className="material-symbols-outlined text-sm leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  {client.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] font-bold">
                  Primary Stakeholder
                </span>
              </div>
              <p className="text-sm text-[#434655] flex items-center gap-1.5">
                <span className="font-semibold text-[#131b2e]">{client.title}</span>
                <span className="text-[#737686]">/</span>
                <span className="inline-flex items-center gap-1 text-[#004ac6] font-semibold">
                  <span className="material-symbols-outlined text-sm leading-none">biotech</span>
                  {client.company}
                </span>
              </p>
              {/* Badges cluster */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                  Active Retainer ({client.monthlyValue})
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#434655] text-xs font-medium">
                  <span className="material-symbols-outlined text-xs leading-none text-[#737686]">history</span>
                  Client since Jan 2024
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#bdffdb] text-[#006242] text-xs font-bold">
                  <span
                    className="material-symbols-outlined text-xs leading-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Health: {client.healthScore}% Strong
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#2563eb] text-white hover:bg-[#004ac6] px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base leading-none">edit_note</span>
              <span>Log Communication</span>
            </button>
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-1.5 bg-[#eaedff] text-[#004ac6] hover:bg-[#e2e7ff] px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-base leading-none">mail</span>
              <span>Email</span>
            </a>
            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-1.5 bg-[#f2f3ff] text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff] px-3 py-2 rounded-lg text-sm transition-colors"
              title="Call"
            >
              <span className="material-symbols-outlined text-base leading-none">call</span>
            </a>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to remove ${client.name}?`)) {
                  deleteClient(client.id);
                  router.push("/clients");
                }
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f2f3ff] text-[#ba1a1a] hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete dossier"
              type="button"
            >
              <span className="material-symbols-outlined text-base leading-none">delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#434655] text-xs uppercase tracking-wider mb-2 font-bold">
            <span>Total Revenue to Date</span>
            <span className="material-symbols-outlined text-base text-[#2563eb]">payments</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
              {client.totalRevenue}
            </span>
            <span className="text-xs text-[#006242] flex items-center gap-0.5 font-bold">
              <span className="material-symbols-outlined text-xs leading-none">trending_up</span>
              +$6.2k this mo
            </span>
          </div>
          <div className="w-full bg-[#e2e7ff] h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "78%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#434655] text-xs uppercase tracking-wider mb-2 font-bold">
            <span>Open Deliverables</span>
            <span className="material-symbols-outlined text-base text-[#006a61]">inventory_2</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#131b2e] tracking-tight">3 items</span>
            <span className="text-xs text-[#434655]">1 awaiting feedback</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="h-1 flex-1 bg-[#006a61] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#006a61] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#eaedff] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#434655] text-xs uppercase tracking-wider mb-2 font-bold">
            <span>Days Since Last Touch</span>
            <span className="material-symbols-outlined text-base text-[#006242]">history_toggle_off</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#131b2e] tracking-tight">3 days</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] font-bold">
              On schedule
            </span>
          </div>
          <p className="text-xs text-[#434655] mt-2 truncate">Slack check-in via #project-channel</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#434655] text-xs uppercase tracking-wider mb-2 font-bold">
            <span>Next Follow-up</span>
            <span className="material-symbols-outlined text-base text-[#2563eb]">alarm</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#131b2e]">{client.nextFollowUpDate}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#e2e7ff] text-[#004ac6] font-bold">
                {client.nextFollowUpType}
              </span>
            </div>
            <span className="text-xs text-[#434655] truncate mt-0.5">Design Critique Review</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#434655] text-xs mt-3">
            <span className="material-symbols-outlined text-sm leading-none text-[#2563eb]">videocam</span>
            <span>Google Meet • 30 mins</span>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs px-4 pt-2 mb-6 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          {["Overview & Activity", "Follow-ups & Reminders", "Notes & Context", "Projects & Invoices"].map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-3 px-1 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                    isActive ? "text-[#004ac6]" : "text-[#434655] hover:text-[#131b2e]"
                  }`}
                  type="button"
                >
                  <span>{tab}</span>
                  {tab === "Follow-ups & Reminders" && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#eaedff] text-[#004ac6] text-xs">
                      {clientFollowUps.length}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004ac6] rounded-t-full"></span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Main Content Layout (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb] text-xl leading-none">next_plan</span>
                <h2 className="text-base font-bold text-[#131b2e]">Upcoming Scheduled Follow-ups</h2>
              </div>
              <button
                onClick={() => setLogModalOpen(true)}
                className="text-xs text-[#004ac6] hover:underline font-bold"
              >
                + Add Task
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {clientFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#f2f3ff] border border-[#eaedff] hover:bg-[#eaedff] transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleFollowUpComplete(item.id)}
                      className="w-5 h-5 mt-0.5 rounded-md bg-white border border-slate-300 hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#131b2e]">{item.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#004ac6] text-[10px] font-bold">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#434655] mt-1">{item.context}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#434655]">
                        <span className="flex items-center gap-1 text-[#004ac6] font-semibold">
                          <span className="material-symbols-outlined text-sm">event</span>
                          {item.dueDate} · {item.dueTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes & Client Brief Section */}
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="font-bold text-base text-[#131b2e] mb-2">Internal Client Context &amp; Notes</h3>
            <p className="text-sm text-[#434655] leading-relaxed bg-[#f2f3ff] p-4 rounded-xl border border-[#eaedff]">
              {client.notes}
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="font-bold text-base text-[#131b2e] mb-4">Contact Dossier</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#434655]">Direct Email</span>
                <a href={`mailto:${client.email}`} className="font-semibold text-[#004ac6] hover:underline">
                  {client.email}
                </a>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#434655]">Phone Number</span>
                <span className="font-semibold text-[#131b2e]">{client.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#434655]">Billing Arrangement</span>
                <span className="font-bold text-[#006242]">{client.engagementType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#434655]">Cadence Frequency</span>
                <span className="font-semibold text-[#131b2e]">Every {client.cadenceDays} Days</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/clients"
                className="text-xs text-[#434655] hover:text-[#131b2e] font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Directory</span>
              </Link>
              <Link
                href="/clients/new"
                className="px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-bold hover:bg-[#004ac6] transition-colors"
              >
                Add Another Client
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* LOG MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-[#131b2e] mb-3">Log Communication Touchpoint</h3>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#434655] mb-1">Touchpoint Details</label>
                <textarea
                  required
                  rows={3}
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="e.g. Sent review link for latest sprint assets..."
                  className="w-full p-3 bg-[#f2f3ff] rounded-lg text-sm border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#434655] font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#2563eb] hover:bg-[#004ac6] font-bold rounded-lg"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
