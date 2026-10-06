import Link from "next/link";
import { Video, LayoutDashboard, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { UserMenu } from "@/components/common/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavbarProps {
  user?: {
    email: string;
    fullName?: string | null;
    role?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const isPrivilegedAdmin =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "support" ||
    user?.role === "analyst";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-600 text-white shadow-xs shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Video className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                LoomNotes<span className="text-teal-600 dark:text-teal-400 font-semibold ml-0.5">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links (When logged out) */}
        {!user && (
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <nav className="flex items-center gap-3 text-xs font-medium">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {isPrivilegedAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/meetings"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Meetings</span>
              </Link>
              <UserMenu email={user.email} fullName={user.fullName} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-[0.99]"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
