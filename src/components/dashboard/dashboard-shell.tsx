"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  ListTodo,
  ShieldCheck,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Settings,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { MonthlyUsageInfo } from "@/lib/usage/usage-service";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface DashboardShellProps {
  user: {
    email: string;
    fullName?: string | null;
    role?: string | null;
  };
  usage: MonthlyUsageInfo;
  children: React.ReactNode;
}

export function DashboardShell({ user, usage, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSuperAdmin = user.role === "super_admin";

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Meetings",
      href: "/dashboard/meetings",
      icon: Video,
      active: pathname.startsWith("/dashboard/meetings"),
    },
    {
      name: "Action Items",
      href: "/dashboard/action-items",
      icon: ListTodo,
      active: pathname.startsWith("/dashboard/action-items"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shrink-0 sticky top-0 h-screen z-30 transition-colors">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-600 text-white shadow-xs">
              <Video className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              LoomNotes<span className="text-teal-600 dark:text-teal-400 font-semibold ml-0.5">AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Super Admin Special Link */}
          {isSuperAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                System
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Super Admin Console</span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Bottom: Usage Mini Card & User Profile */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          {/* Subtle Usage Widget */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-700 text-[11px]">AI Usage</span>
              <span className="text-blue-600 text-[11px]">
                {usage.isSuperAdmin ? "Unlimited" : `${usage.used} / ${usage.limit}`}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usage.isSuperAdmin
                    ? "bg-gradient-to-r from-blue-600 to-teal-500 w-full"
                    : usage.isLimitReached
                    ? "bg-red-500 w-full"
                    : "bg-blue-600"
                }`}
                style={{ width: usage.isSuperAdmin ? "100%" : `${usage.percentageUsed}%` }}
              />
            </div>
            {!usage.isSuperAdmin && usage.isLimitReached && (
              <Link
                href="/#pricing"
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            )}
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 overflow-hidden group p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors flex-1"
              title="Manage Profile & Settings"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs shrink-0 group-hover:bg-blue-100 transition-colors">
                {(user.fullName || user.email)[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {user.fullName || "User"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                <Video className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">LoomNotes</span>
            </Link>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search meetings, summaries, or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors active:scale-[0.99]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Meeting</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    item.active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Super Admin Console</span>
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{user.email}</span>
              <form action={logoutAction}>
                <button type="submit" className="text-red-600 font-medium">
                  Log out
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
