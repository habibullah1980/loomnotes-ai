"use client";

import { useActionState } from "react";
import { updateUserProfileAction, AuthState } from "@/app/actions/auth";
import { User, Building2, Phone, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield, Sun, CreditCard, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { PortalButton } from "@/components/pricing/portal-button";

interface SettingsFormProps {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    companyName?: string | null;
    marketingConsent?: boolean;
    role?: string;
    plan?: string;
    subscriptionStatus?: string;
    hasStripeCustomer?: boolean;
    usedVideos?: number;
    remainingVideos?: number;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    updateUserProfileAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>Your profile information and preferences have been updated successfully.</span>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Profile Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={user.fullName || ""}
              required
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name (Optional)</label>
            <input
              type="text"
              name="companyName"
              defaultValue={user.companyName || ""}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phoneNumber"
              defaultValue={user.phoneNumber || ""}
              placeholder="e.g. +1 555-0199"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Subscription & Billing */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#4b49ac] dark:text-[#98dbff]" />
              <span>Subscription &amp; Billing</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your current plan, video processing quota, and Stripe billing details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.plan === "pro"
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {user.plan === "pro" ? "Pro Plan • $9.99/mo" : "Free Plan (3 Videos)"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Current Status</span>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 capitalize">
              <span className={`h-2 w-2 rounded-full ${user.plan === "pro" ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`} />
              {user.plan === "pro" ? "Active Subscription" : "Free Tier"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Video Quota</span>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {user.plan === "pro"
                ? "Unlimited video meeting notes"
                : `${user.usedVideos ?? 0} of 3 free videos used (${user.remainingVideos ?? 0} left)`}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {user.plan === "pro" ? (
            <PortalButton />
          ) : (
            <CheckoutButton
              isLoggedIn={true}
              isPro={false}
              size="default"
              text="Upgrade to Pro — $9.99/mo"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold"
            />
          )}
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Appearance &amp; Theme</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your interface theme preference or sync automatically with your system.
            </p>
          </div>
          <ThemeToggle variant="pill" />
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span>Product Communications</span>
        </h3>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
          <input
            type="checkbox"
            name="marketingConsent"
            defaultChecked={Boolean(user.marketingConsent)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Receive product updates, tips, and AI feature announcements
            </span>
            <p className="text-[11px] text-slate-500">
              We send occasional high-signal release notes. No spam. Unsubscribe anytime.
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving changes...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
}
