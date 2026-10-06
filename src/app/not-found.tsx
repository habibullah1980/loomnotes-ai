import Link from "next/link";
import { Video, LayoutDashboard, Home, FileQuestion } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | LoomNotes AI",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090d16] text-[#0F172A] dark:text-slate-100 transition-colors duration-200">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-600 text-white shadow-2xs">
            <Video className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            LoomNotes<span className="text-teal-600 dark:text-teal-400 font-semibold ml-0.5">AI</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-2xs border border-blue-100 dark:border-blue-900">
            <FileQuestion className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              404 Error
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              The page you are looking for doesn&apos;t exist, was moved, or you may not have authorization to view it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-[0.99]"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-14 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] px-4 text-center flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        <p>© {new Date().getFullYear()} LoomNotes AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
