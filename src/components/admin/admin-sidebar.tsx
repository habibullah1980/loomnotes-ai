"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  Video,
  Megaphone,
  ShieldAlert,
  KeyRound,
  Settings,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { AdminRole, Permission } from "@/lib/admin/permissions";

interface AdminSidebarProps {
  userRole: AdminRole;
  effectivePermissions: Permission[];
}

export function AdminSidebar({ userRole, effectivePermissions }: AdminSidebarProps) {
  const pathname = usePathname();

  const isPermitted = (perm: Permission) => {
    if (userRole === "super_admin") return true;
    return effectivePermissions.includes(perm);
  };

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      show: true,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
      show: isPermitted("users.view"),
    },
    {
      label: "User Activity",
      href: "/admin/activity",
      icon: Activity,
      active: pathname.startsWith("/admin/activity"),
      show: isPermitted("analytics.view") || isPermitted("users.view"),
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin/analytics"),
      show: isPermitted("analytics.view"),
    },
    {
      label: "Meetings",
      href: "/admin/meetings",
      icon: Video,
      active: pathname.startsWith("/admin/meetings"),
      show: isPermitted("meetings.view"),
    },
    {
      label: "Marketing",
      href: "/admin/marketing",
      icon: Megaphone,
      active: pathname.startsWith("/admin/marketing"),
      show: isPermitted("marketing.view"),
    },
    {
      label: "Audit Log",
      href: "/admin/audit-log",
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/audit-log"),
      show: isPermitted("analytics.view") || userRole === "super_admin" || userRole === "admin",
    },
    {
      label: "Permissions",
      href: "/admin/permissions",
      icon: KeyRound,
      active: pathname.startsWith("/admin/permissions") || pathname.startsWith("/admin/roles"),
      show: userRole === "super_admin" || isPermitted("admins.manage"),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
      show: userRole === "super_admin" || isPermitted("settings.manage"),
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex shadow-2xs transition-colors">
      <div className="p-4 space-y-5">
        {/* Role Identity Badge */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Admin Platform
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              Role: <strong className="text-slate-900 dark:text-slate-100">{userRole.replace("_", " ")}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    item.active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.active ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Bottom Workspace Return */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          <span>Exit to Workspace</span>
        </Link>
      </div>
    </aside>
  );
}
