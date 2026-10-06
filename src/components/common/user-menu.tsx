"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";

interface UserMenuProps {
  email: string;
  fullName?: string | null;
}

export function UserMenu({ email, fullName }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  const displayName = fullName || email.split("@")[0];
  const initial = (fullName ? fullName[0] : email[0]).toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors py-1 pl-1 pr-3 shadow-xs group"
        title="Manage Account Settings"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-teal-600 text-xs font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
          {initial}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[120px] sm:max-w-[160px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[120px] sm:max-w-[160px] truncate">
            {email}
          </span>
        </div>
      </Link>

      <button
        onClick={handleLogout}
        disabled={isPending}
        title="Sign out"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
