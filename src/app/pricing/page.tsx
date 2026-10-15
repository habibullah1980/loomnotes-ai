import Link from "next/link";
import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  HelpCircle,
  Video,
  ListTodo,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Plans — LoomNotes AI",
  description:
    "Transparent freemium pricing. Start with 3 free videos, or upgrade to Pro for $9.99/month for unlimited video meeting notes and action items.",
};

const COMPARISON_ROWS = [
  {
    feature: "Video Processing Quota",
    free: "3 videos for free",
    pro: "Unlimited (Fair-use)",
    highlight: true,
  },
  {
    feature: "Monthly Price",
    free: "$0 / free forever",
    pro: "$9.99 / month",
    highlight: true,
  },
  {
    feature: "Google Gemini AI Summaries",
    free: "Yes (5-part structured)",
    pro: "Yes (Priority processing)",
  },
  {
    feature: "Executive Summary & Decisions",
    free: true,
    pro: true,
  },
  {
    feature: "Action Items & Assignees",
    free: true,
    pro: true,
  },
  {
    feature: "Follow-up Questions Extraction",
    free: true,
    pro: true,
  },
  {
    feature: "Loom Public URL Transcript Fetch",
    free: true,
    pro: true,
  },
  {
    feature: "Meeting History & Supabase Archive",
    free: "Up to 3 meetings",
    pro: "Unlimited meetings",
  },
  {
    feature: "Action Items Hub & Checklists",
    free: true,
    pro: true,
  },
  {
    feature: "Client CRM & Follow-ups Cadence",
    free: true,
    pro: true,
  },
  {
    feature: "Row-Level Security & Private Data",
    free: true,
    pro: true,
  },
  {
    feature: "Customer Support",
    free: "Standard email",
    pro: "Priority support",
  },
  {
    feature: "Stripe Subscription Management",
    free: false,
    pro: "Self-serve portal (Cancel anytime)",
  },
];

export default async function PricingPage() {
  const supabase = await createServerSupabaseClient();
  let user = null;
  let usage = null;

  if (supabase) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, plan, status")
        .eq("id", currentUser.id)
        .maybeSingle();

      user = {
        email: currentUser.email || "",
        fullName: profile?.full_name || currentUser.user_metadata?.full_name || null,
        role: profile?.role || null,
      };

      usage = await getMonthlyUsage(supabase, currentUser.id);
    }
  }

  const isPro = usage?.isPro || usage?.isSuperAdmin || false;
  const isLimitReached = usage?.isLimitReached || false;
  const used = usage?.used || 0;
  const remaining = usage?.remaining || 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar user={user} />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* 1. Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#7DA0FA]" />
              <span>Simple, Transparent Freemium Pricing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Start Free. Upgrade to Pro for{" "}
              <span className="bg-gradient-to-r from-[#4b49ac] via-[#7978e3] to-[#7DA0FA] bg-clip-text text-transparent">
                $9.99/mo
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every new user gets 3 free videos with full Google Gemini AI analysis. Upgrade to Pro for unlimited meeting intelligence without restrictions.
            </p>
          </div>

          {/* 2. Authenticated User Status Banner */}
          {user && usage && (
            <div className="max-w-3xl mx-auto">
              <div
                className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isPro
                    ? "bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800"
                    : isLimitReached
                    ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                    : "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPro
                        ? "bg-teal-600 text-white"
                        : isLimitReached
                        ? "bg-amber-500 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <Video className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Current Plan: {isPro ? "Pro Subscription" : "Free Plan"}</span>
                      {isPro && (
                        <Badge variant="teal" className="text-[10px]">
                          Active • Unlimited
                        </Badge>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {isPro
                        ? "You have unlimited video meeting notes. Your subscription is active."
                        : isLimitReached
                        ? "You've used your 3 free videos. Upgrade to Pro for $9.99/month to continue."
                        : `You have processed ${used} of your 3 free videos (${remaining} remaining).`}
                    </p>
                  </div>
                </div>

                {!isPro && (
                  <div className="shrink-0 w-full sm:w-auto">
                    <CheckoutButton
                      isLoggedIn={true}
                      isPro={false}
                      size="default"
                      text="Upgrade to Pro — $9.99/mo"
                      className="w-full sm:w-auto px-4 py-2 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Plan Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-7 sm:p-9 shadow-sm flex flex-col justify-between relative transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Plan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Perfect to test AI notes with real meetings
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Free Forever
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                    $0
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ 3 videos free</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-5">
                  Get started immediately without entering a credit card. Process your first 3 meeting recordings with complete AI summaries and task extraction.
                </p>

                {/* Free Features List */}
                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 stroke-[3]" />
                    <span>3 free video meeting notes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>5-part structured notes (Summary, Decisions, Tasks)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Automatic Loom video transcript extraction</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Interactive Action Items Hub with assignees &amp; due dates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>PostgreSQL Row Level Security (RLS) data isolation</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                    <X className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    <span>Unlimited video processing</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                {user ? (
                  <Link
                    href="/dashboard/new"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>{isPro ? "Go to Workspace" : "Use Free Credits"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Start Free (No Credit Card)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Pro Subscription Card (Featured) */}
            <div className="rounded-3xl border-2 border-[#4b49ac] dark:border-[#7978e3] bg-white dark:bg-[#0c1220] p-7 sm:p-9 shadow-xl flex flex-col justify-between relative transition-all ring-4 ring-[#7DA0FA]/15">
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#4b49ac] to-[#7978e3] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#98dbff]" />
                <span>Most Popular</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro Subscription</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      For professionals, freelancers, and growing teams
                    </p>
                  </div>
                  <Badge variant="teal" className="text-xs font-semibold">
                    Stripe Secure
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                    $9.99
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-5">
                  Unlock unlimited video processing with priority Google Gemini processing, recurring monthly billing, and flexible self-service cancellation anytime.
                </p>

                {/* Pro Features List */}
                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 stroke-[3]" />
                    <span>Unlimited video processing (no free-tier limits)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Priority Google Gemini AI notes and summaries</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Full meeting history archive with instant search</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Action Items Hub with assignee tracking &amp; live sync</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Client follow-up cadence &amp; email generation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Self-serve Stripe Customer Portal (Cancel anytime)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <CheckoutButton
                  isLoggedIn={Boolean(user)}
                  isPro={isPro}
                  size="lg"
                  text={isLimitReached ? "Upgrade to Pro for $9.99/mo to continue" : "Upgrade to Pro — $9.99/mo"}
                />
                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
                  Encrypted 256-bit Stripe checkout. Cancel anytime with one click.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Detailed Comparison Table */}
          <div className="max-w-4xl mx-auto space-y-6 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Plan Comparison
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Detailed side-by-side feature breakdown between Free and Pro tiers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-900 dark:text-white font-bold">
                      <th className="p-4 sm:p-5">Feature</th>
                      <th className="p-4 sm:p-5 text-center w-40">Free Plan</th>
                      <th className="p-4 sm:p-5 text-center w-48 text-[#4b49ac] dark:text-[#98dbff]">
                        Pro ($9.99/mo)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {COMPARISON_ROWS.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.highlight ? "bg-blue-50/20 dark:bg-blue-950/20 font-medium" : ""}
                      >
                        <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-slate-100">
                          {row.feature}
                        </td>
                        <td className="p-4 sm:p-5 text-center text-slate-600 dark:text-slate-400">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span>{row.free}</span>
                          )}
                        </td>
                        <td className="p-4 sm:p-5 text-center font-semibold text-slate-900 dark:text-white">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-teal-700 dark:text-teal-300">{row.pro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. Frequently Asked Questions */}
          <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Have questions about our freemium credits or Pro subscription?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span>How do the 3 free videos work?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every new registered account receives 3 video meeting credits completely free. You can paste public Loom video links or raw meeting transcripts. Once you process your third video, you will be prompted to upgrade to Pro for $9.99/month to continue processing meetings.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <span>Can I cancel my Pro subscription at any time?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes, with zero hassle. You can open the Stripe Customer Portal from your Account Settings and cancel anytime. Your Pro benefits remain active until the end of your prepaid monthly billing cycle.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span>Are payments secure?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  All transactions are handled directly through Stripe with 256-bit TLS encryption. LoomNotes AI never sees or stores your raw credit card numbers. Access is unlocked automatically via verified Stripe webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
