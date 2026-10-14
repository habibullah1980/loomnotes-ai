"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ClientFollowSettingsView({ userEmail = "sarah.jenkins@studiojenkins.com" }: { userEmail?: string }) {
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [fullName, setFullName] = useState("Sarah Jenkins");
  const [practiceName, setPracticeName] = useState("Jenkins Brand & Design Co.");
  const [timezone, setTimezone] = useState("(GMT-07:00) Pacific Time (US & Canada)");
  const [currency, setCurrency] = useState("USD ($) - United States Dollar");
  const [cadenceTrigger, setCadenceTrigger] = useState("7 days after proposal sent");
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);
  const [aiDrafting, setAiDrafting] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings preferences saved successfully!");
  };

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Header Section with Decorative Metadata Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-xs uppercase tracking-wider font-bold">
                Preferences
              </span>
              <span className="text-[#737686] text-xs">•</span>
              <span className="text-[#434655] text-xs flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-sm leading-none text-[#006242]">check_circle</span>
                Workspace Synced
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight">Account &amp; Workspace Settings</h1>
            <p className="text-sm text-[#434655]">Manage your profile, automated follow-up cadences, notification preferences, and billing.</p>
          </div>
          <div className="flex items-center gap-2 z-10 shrink-0">
            <div className="bg-[#f2f3ff] px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-200">
              <span className="material-symbols-outlined text-[#004ac6] text-xl">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#434655] uppercase font-bold leading-none">Status</span>
                <span className="text-xs text-[#131b2e] font-extrabold">Pro Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Vertical Navigation Bar */}
          <aside className="lg:col-span-3 flex flex-col gap-2 sticky top-24">
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              {[
                { id: "profile", label: "My Profile & Brand", icon: "person" },
                { id: "cadence", label: "Cadence & Automation", icon: "auto_schedule", badge: "3 AI" },
                { id: "notifications", label: "Email & Alerts", icon: "notifications_active" },
                { id: "integrations", label: "Integrations", icon: "extension", dot: true },
                { id: "billing", label: "Billing & Invoices", icon: "credit_card", badge: "PRO" },
                { id: "security", label: "Security & Sessions", icon: "lock" },
              ].map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    type="button"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#e2e7ff] text-[#004ac6] font-extrabold shadow-2xs"
                        : "text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-base leading-none">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-[#dae2fd] text-[#004ac6] text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.dot && <span className="w-2 h-2 rounded-full bg-[#006242]"></span>}
                  </button>
                );
              })}
            </div>

            {/* Help Callout */}
            <div className="bg-[#f2f3ff] p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-1.5 text-[#004ac6] text-xs font-bold">
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Dedicated Setup Help</span>
              </div>
              <p className="text-xs text-[#434655]">Need help mapping your pipeline triggers or connecting Gmail sync? Our consultants are on standby.</p>
              <button
                type="button"
                onClick={() => alert("Support ticket opened with pdfkitfree onboarding team.")}
                className="text-[#004ac6] text-xs font-bold hover:underline flex items-center gap-1 mt-1 text-left cursor-pointer"
              >
                <span>Schedule 15m onboarding</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </aside>

          {/* Right Active Settings Content Panel */}
          <section className="lg:col-span-9 flex flex-col gap-6">
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* SECTION 1: Profile & Freelance Practice */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-2xl leading-none">badge</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#131b2e]">Profile &amp; Freelance Practice</h2>
                    <p className="text-xs text-[#434655]">Your identity visible on automated client signatures and invoices.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#f2f3ff] rounded-xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Sarah Jenkins"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#131b2e]">Sarah Jenkins</h3>
                    <p className="text-xs text-[#434655]">{userEmail}</p>
                    <span className="inline-block mt-1 text-[11px] text-[#004ac6] font-semibold">
                      Account Owner · Pro Member
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">Full Legal Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">Practice &amp; Studio Name</label>
                    <input
                      type="text"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">Primary Operating Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option>(GMT-07:00) Pacific Time (US &amp; Canada)</option>
                      <option>(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                      <option>(GMT+00:00) Greenwich Mean Time : London</option>
                      <option>(GMT+01:00) Central European Time : Berlin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">Default Deal Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] text-[#131b2e] text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option>USD ($) - United States Dollar</option>
                      <option>EUR (€) - Euro</option>
                      <option>GBP (£) - British Pound</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Smart Follow-up Automation Defaults */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-2xl leading-none">magic_button</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#131b2e]">Smart Follow-up Automation Defaults</h2>
                    <p className="text-xs text-[#434655]">Establish cadence rhythms to prevent stalled negotiations without manual tracking.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-[#f2f3ff] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#131b2e]">Default Follow-up Trigger Cadence</span>
                      <p className="text-xs text-[#434655]">Initial countdown timer generated automatically whenever a proposal is marked Sent.</p>
                    </div>
                    <select
                      value={cadenceTrigger}
                      onChange={(e) => setCadenceTrigger(e.target.value)}
                      className="h-10 px-3 bg-white rounded-lg text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option>7 days after proposal sent</option>
                      <option>14 days after last message</option>
                      <option>30 days quarterly check-in</option>
                    </select>
                  </div>

                  <div className="p-4 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-slate-200">
                    <div>
                      <span className="text-sm font-bold text-[#131b2e]">Enforce Business Hours Schedule</span>
                      <p className="text-xs text-[#434655]">Only dispatch reminder alerts Monday–Friday, 9:00 AM – 6:00 PM.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={businessHoursOnly}
                      onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                      className="w-5 h-5 accent-[#2563eb] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#131b2e]">AI Email Drafting Assistant</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-[10px] font-bold">
                          Pro Feature
                        </span>
                      </div>
                      <p className="text-xs text-[#434655]">Pre-compose customized draft follow-ups based on past meeting notes and client sentiment.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiDrafting}
                      onChange={(e) => setAiDrafting(e.target.checked)}
                      className="w-5 h-5 accent-[#2563eb] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
