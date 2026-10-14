"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClientFollow } from "@/context/clientfollow-context";

interface ClientFollowShellProps {
  children: React.ReactNode;
}

export function ClientFollowShell({ children }: ClientFollowShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newFollowUpModalOpen, setNewFollowUpModalOpen] = useState(false);
  const [quickFollowUpTitle, setQuickFollowUpTitle] = useState("");
  const [quickFollowUpClient, setQuickFollowUpClient] = useState("");
  const [quickFollowUpDate, setQuickFollowUpDate] = useState("2026-10-12");

  const { clients, followUps, addFollowUp, searchQuery, setSearchQuery } = useClientFollow();

  const overdueCount = followUps.filter((f) => f.urgency === "overdue" && !f.completed).length;

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
      active: pathname === "/dashboard",
    },
    {
      name: "Clients",
      href: "/clients",
      icon: "group",
      active: pathname.startsWith("/clients"),
    },
    {
      name: "Follow-ups",
      href: "/follow-ups",
      icon: "schedule",
      badge: overdueCount > 0 ? overdueCount : undefined,
      active: pathname.startsWith("/follow-ups"),
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: "calendar_today",
      active: pathname.startsWith("/calendar"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: "settings",
      active: pathname.startsWith("/settings") || pathname.startsWith("/dashboard/settings"),
    },
  ];

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFollowUpTitle) return;

    const matchedClient = clients.find((c) => c.name === quickFollowUpClient) || clients[0];

    addFollowUp({
      clientId: matchedClient?.id || "c1",
      clientName: matchedClient?.name || "Client",
      clientCompany: matchedClient?.company || "Company",
      clientAvatar:
        matchedClient?.avatarUrl ||
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      type: "Check-in",
      title: quickFollowUpTitle,
      context: "Quick follow-up logged from navigation bar",
      dueDate: quickFollowUpDate,
      dueTime: "10:00 AM",
      urgency: "upcoming",
      dealValue: "$5,000",
      recommendedChannel: "email",
      cadenceRule: "Ad-hoc cadence",
      completed: false,
    });

    setQuickFollowUpTitle("");
    setNewFollowUpModalOpen(false);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-sans antialiased selection:bg-[#2563eb] selection:text-white">
      {/* 1. FIXED DESKTOP ASIDE NAVIGATION BAR (260px wide) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#e2e8f0] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex-col justify-between hidden md:flex">
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#4b49ac] flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-lg leading-none font-bold">bolt</span>
              </div>
              <span className="font-bold text-lg text-[#131b2e] tracking-tight">FreePDFKit</span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-[11px] uppercase font-bold tracking-wider">
              Pro
            </span>
          </div>

          {/* "+ New Follow-up" Primary CTA */}
          <div className="px-4 py-3">
            <button
              onClick={() => setNewFollowUpModalOpen(true)}
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white hover:bg-[#004ac6] px-4 py-2.5 rounded-lg transition-colors shadow-xs font-semibold text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg leading-none">add_task</span>
              <span>+ New Follow-up</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-2">
            {navLinks.map((item) => {
              const isActive = item.active;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                    isActive
                      ? "bg-[#e2e7ff] text-[#004ac6] font-bold"
                      : "text-[#434655] hover:bg-[#eaedff] hover:text-[#131b2e]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl leading-none">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#ba1a1a] text-white text-[11px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Usage Meter & Help */}
        <div className="p-4 flex flex-col gap-3 border-t border-slate-100">
          <div className="bg-[#f2f3ff] p-3 rounded-xl flex flex-col gap-1.5 border border-[#eaedff]">
            <div className="flex items-center justify-between text-xs text-[#434655]">
              <span>Storage &amp; Usage</span>
              <span className="font-bold text-[#131b2e]">64%</span>
            </div>
            <div className="w-full h-1.5 bg-[#dae2fd] rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "64%" }} />
            </div>
            <span className="text-[11px] text-[#434655]">32 / 50 active deals</span>
          </div>

          <div className="flex items-center justify-between px-1">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-[#434655] hover:text-[#131b2e] text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base leading-none">help</span>
              <span>Help &amp; Support</span>
            </Link>
            <span className="text-[11px] text-[#737686]">v2.4</span>
          </div>
        </div>
      </aside>

      {/* 2. TOP HEADER & MAIN CANVAS (with 64px offset on md+) */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Sticky Header */}
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-[#e2e8f0] z-40 px-4 md:px-8 flex items-center justify-between">
          {/* Mobile hamburger & Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#434655] hover:text-[#131b2e] rounded-lg"
              type="button"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-2xl leading-none">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>

            <div className="relative w-full hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients, deals, or follow-ups..."
                className="w-full h-10 pl-10 pr-14 bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#737686] text-sm rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb] transition-all border border-transparent focus:border-[#2563eb]"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] bg-[#dae2fd] text-[#434655] rounded border border-[#c3c6d7]/50 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Action Icons & Profile Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/clients/new"
              className="hidden sm:flex items-center gap-1.5 bg-[#004ac6] text-white hover:bg-[#2563eb] px-3.5 py-2 rounded-lg transition-colors text-sm font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-base leading-none">person_add</span>
              <span>+ Add Client</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                aria-label="Notifications"
                className="p-2 rounded-lg text-[#434655] hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors flex items-center justify-center cursor-pointer"
                type="button"
                onClick={() => alert("3 high-priority cadence follow-ups are pending today.")}
              >
                <span className="material-symbols-outlined text-xl leading-none">notifications</span>
              </button>
              {overdueCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </div>

            <div className="h-6 w-px bg-[#e2e8f0] hidden sm:block"></div>

            {/* Profile Menu Trigger */}
            <Link
              href="/settings"
              className="flex items-center gap-2 pl-1 cursor-pointer group"
              title="View Profile Settings"
            >
              <img
                alt="Sarah Jenkins"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-[#131b2e] leading-tight group-hover:text-[#2563eb] transition-colors">
                  Sarah Jenkins
                </span>
                <span className="text-[11px] text-[#434655] leading-tight">
                  Freelance Brand Designer
                </span>
              </div>
              <span className="material-symbols-outlined text-[#737686] text-base leading-none">
                expand_more
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Flyout Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-[#e2e8f0] shadow-lg z-30 p-4 space-y-2">
            <div className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setNewFollowUpModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white py-2 rounded-lg font-semibold text-sm mb-2"
            >
              + New Follow-up
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold ${
                  link.active ? "bg-[#e2e7ff] text-[#004ac6]" : "text-[#434655] hover:bg-[#eaedff]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="bg-[#ba1a1a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="w-full pt-16 px-4 md:px-8 bg-[#faf8ff] flex-1">
          {children}
        </main>
      </div>

      {/* QUICK FOLLOW-UP MODAL */}
      {newFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl leading-none">add_task</span>
                </div>
                <h3 className="font-bold text-lg text-[#131b2e]">Create New Follow-up</h3>
              </div>
              <button
                onClick={() => setNewFollowUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Follow-up Action / Title <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send Figma prototypes & roadmap sync"
                  value={quickFollowUpTitle}
                  onChange={(e) => setQuickFollowUpTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] border border-slate-200 rounded-lg text-sm text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Select Client</label>
                <select
                  value={quickFollowUpClient}
                  onChange={(e) => setQuickFollowUpClient(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] border border-slate-200 rounded-lg text-sm text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Due Date</label>
                <input
                  type="date"
                  value={quickFollowUpDate}
                  onChange={(e) => setQuickFollowUpDate(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] border border-slate-200 rounded-lg text-sm text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewFollowUpModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-[#2563eb] hover:bg-[#004ac6] text-white shadow-xs transition-colors"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
