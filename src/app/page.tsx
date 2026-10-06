import Link from "next/link";
import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Video,
  CheckCircle2,
  ListTodo,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Check,
  XCircle,
  Zap,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LoomNotes AI - Turn Every Meeting Into Clear Action",
  description:
    "LoomNotes AI transforms your meeting conversations into concise summaries, key decisions, and actionable tasks — automatically with Google Gemini.",
};

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  let user = null;

  if (supabase) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", currentUser.id)
        .single();

      user = {
        email: currentUser.email || "",
        fullName: profile?.full_name || currentUser.user_metadata?.full_name || null,
        role: profile?.role || null,
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Navbar user={user} />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-50 dark:from-[#0c1220] dark:via-[#090d16] dark:to-[#090d16]">
          {/* Subtle Ambient Background Elements */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Top Product Announcement Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-medium shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Google Gemini AI &amp; Instant Loom Extraction</span>
              <span className="text-blue-300 dark:text-blue-600">•</span>
              <span className="font-semibold text-teal-700 dark:text-teal-400">Technical Preview</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
              Turn Every Meeting Into{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 dark:from-blue-400 dark:via-blue-300 dark:to-teal-300 bg-clip-text text-transparent">
                Clear Action
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              LoomNotes AI transforms your meeting conversations into concise summaries, key decisions, and actionable tasks — automatically.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
                >
                  <span>Start Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Realistic Product Dashboard Mockup */}
            <div className="pt-8 sm:pt-12 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-md overflow-hidden text-left">
                {/* Window Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="ml-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">loomnotes.ai/dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                      <Sparkles className="h-3 w-3" />
                      Live Workspace
                    </span>
                  </div>
                </div>

                {/* Dashboard Inner Preview */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Top Row: Greeting & 4 Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total Meetings</span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">18</div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">All sessions logged</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">This Month</span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">6</div>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">+2 this week</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Open Tasks</span>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">3</div>
                      <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">Pending action</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Completed Tasks</span>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">15</div>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">83% completion</span>
                    </div>
                  </div>

                  {/* Summary & Tasks Split Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent Meeting Card */}
                    <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Sprint Planning &amp; Architecture Roadmap
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">10:30 AM</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Agreed on finalizing the Supabase RLS integration and standardizing Google Gemini schema parsing for meeting transcripts. Target launch date locked for Friday.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-900">
                          2 Key Decisions
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-900">
                          3 Action Items
                        </span>
                      </div>
                    </div>

                    {/* Open Action Items Mini Panel */}
                    <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <ListTodo className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          Action Items
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Assigned</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          Deploy OAuth callback route
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold shrink-0">Habib</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          Verify unlimited AI meetings
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold shrink-0">Sarah</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SOCIAL PROOF / TRUST BAR */}
        <section className="py-10 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Built for freelancers, teams, agencies, and growing businesses.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">5-Second Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Row-Level Security (Supabase RLS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Structured JSON Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Google Gemini Intelligence</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PROBLEM VS SOLUTION */}
        <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                The Problem &amp; Solution
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Never lose a critical meeting decision again
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Async video is fast for communication, but decisions get lost inside recorded timelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Problem Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                    <XCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      The Problem
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Important decisions disappear inside long meeting recordings.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Wasting 20+ minutes scrubbing through timelines to find what was agreed upon.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Verbal commitments and assigned tasks get lost without explicit documentation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Ambiguity around deadlines, ownership, and unresolved follow-up questions.</span>
                  </li>
                </ul>
              </div>

              {/* Solution Card */}
              <div className="rounded-2xl border border-teal-200/90 dark:border-teal-900/60 bg-white dark:bg-[#0c1220] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      The Solution
                    </h3>
                    <p className="text-xs text-teal-700 dark:text-teal-400">
                      LoomNotes turns conversations into structured information you can actually use.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 font-bold" />
                    <span>Instant executive summary and key takeaways delivered in seconds.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 font-bold" />
                    <span>Concrete action items mapped directly with assignees and due dates.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 font-bold" />
                    <span>Centralized meeting repository with searchable history and one-click task checks.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES */}
        <section id="features" className="py-16 sm:py-24 bg-white dark:bg-[#0c1220] border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Everything you need for meeting clarity
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Engineered specifically for asynchronous team videos, product reviews, and meeting recordings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-blue-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Meeting Summaries
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Concise executive summaries capturing core discussions and outcomes without conversational filler.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-teal-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Key Decisions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automatic identification of explicit agreements, technical choices, and consensus points.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-blue-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <ListTodo className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Action Items
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Extract actionable tasks with assignees and due dates. Check off items directly in your workspace.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-amber-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Follow-up Questions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Surfaces unresolved topics and critical questions that require follow-up before implementation.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-teal-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Video className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Loom Transcript Processing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Paste any public Loom video share URL. The server cleans and extracts transcripts automatically.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-6 space-y-3 hover:border-blue-500/40 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Meeting History
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Searchable, chronological repository of all past meetings, decisions, and tasks stored in Supabase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Simple Workflow
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Three easy steps from raw video link to structured actionable notes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-7 space-y-3 shadow-2xs text-left">
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add your Loom video
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Paste a Loom share URL to fetch the transcript automatically, or enter raw meeting transcripts directly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-7 space-y-3 shadow-2xs text-left">
                <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Let AI analyze the conversation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Google Gemini AI parses the transcript against a strict schema to extract key decisions and tasks without hallucinating.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-7 space-y-3 shadow-2xs text-left">
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Get structured actionable notes
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Review concise summaries, manage assigned tasks with interactive checkboxes, and search previous sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRODUCT PREVIEW SECTION */}
        <section className="py-16 sm:py-24 bg-white dark:bg-[#0c1220] border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Interactive Detail View
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Structured clarity for every meeting
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Here is an exact simulation of the 5-part structured notes generated for each video.
              </p>
            </div>

            {/* Simulated Meeting Detail UI */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm overflow-hidden text-left">
              {/* Top Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-xs font-medium border border-blue-200 dark:border-blue-900">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Structured Notes</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Today at 10:30 AM</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Q4 Architecture &amp; Product Roadmap Review
                </h3>
              </div>

              {/* 5-Section Content */}
              <div className="p-6 sm:p-8 space-y-5">
                {/* 1. Summary */}
                <div className="p-4 rounded-xl border border-blue-200/70 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>1. Executive Summary</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    The engineering team completed the Supabase SSR migration and finalized Google Gemini 1.5/2.5 Flash schema parsing. Deployment date is confirmed for Friday with automated test suites verifying 100% test coverage.
                  </p>
                </div>

                {/* 2 & 3: Takeaways and Decisions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Takeaways */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span>2. Key Takeaways</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>All 20 E2E test suites passed without regressions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>Cookie proxy preserves session tokens across subdomains.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Decisions */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>3. Key Decisions</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                        <span>Standardize on Google Gemini 1.5/2.5 Flash models.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                        <span>Freeze database migrations 24 hours prior to launch.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 4. Action Items */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      4. Action Items (2 of 3 Completed)
                    </span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold normal-case">Live Sync</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="line-through text-slate-400 dark:text-slate-500 font-medium">Deploy GraphQL transcript retrieval endpoint</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Habib • Nov 10</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="line-through text-slate-400 dark:text-slate-500 font-medium">Implement 5-field structured JSON validation</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Sarah • Nov 12</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">Publish SaaS landing page and user documentation</span>
                      </div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">Design Team • Nov 15</span>
                    </div>
                  </div>
                </div>

                {/* 5. Follow-up Questions */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <HelpCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>5. Follow-up Questions</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    • Do we need dedicated webhook listeners for automated Loom recording triggers in Q1?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. EARLY ACCESS / PRICING */}
        <section id="pricing" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                100% Free Early Access
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Unlimited AI meetings for all teams
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                LoomNotes AI is currently in technical preview. All users receive unlimited meeting generations.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              {/* Early Access Unlimited Plan */}
              <div className="rounded-2xl border-2 border-teal-600/90 dark:border-teal-500 bg-white dark:bg-[#0c1220] p-7 sm:p-9 shadow-sm relative text-left">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Unlimited Early Access
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Early Access Free Tier</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Full feature access for async teams</p>
                    </div>
                    <Badge variant="teal" className="text-xs">No Credit Card Required</Badge>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ free during early access</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Enjoy unlimited AI-generated summaries, key decisions, and action item tracking without limits, paywalls, or fees.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <li className="flex items-center gap-2.5 font-medium">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 stroke-[3]" />
                      <span>Unlimited AI meeting generations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Automatic Loom public transcript retrieval</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Action item tracker with assignees &amp; deadlines</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Key decisions &amp; follow-up questions extraction</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Searchable historical workspace repository</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={user ? "/dashboard" : "/signup"}
                    className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors text-xs sm:text-sm shadow-xs"
                  >
                    {user ? "Open Workspace" : "Get Free Early Access"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Stop rewatching meetings. Start taking action.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Save hours every week with automated summaries, decisions, and action items generated directly from your Loom recordings.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>{user ? "Open Workspace" : "Create Your Free Account"}</span>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
