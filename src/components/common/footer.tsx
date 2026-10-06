import Link from "next/link";
import { Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-blue-700 to-teal-600 text-white shadow-2xs">
                <Video className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                LoomNotes<span className="text-teal-600 dark:text-teal-400 font-semibold ml-0.5">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Transform your Loom meeting conversations into concise summaries, key decisions, and actionable tasks — automatically with Google Gemini.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/dashboard/new" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  New Meeting
                </Link>
              </li>
              <li>
                <Link href="/dashboard/meetings" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Meeting History
                </Link>
              </li>
              <li>
                <Link href="/dashboard/action-items" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Action Items Hub
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Documentation & Workflow
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Security & RLS Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LoomNotes AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with Next.js 16, Supabase, and Google Gemini.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
