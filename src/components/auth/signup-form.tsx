"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Lock, Mail, User, Phone, Building2 } from "lucide-react";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  function handleSubmit(formData: FormData) {
    setClientError(null);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 6) {
      setClientError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    formAction(formData);
  }

  const errorMessage = clientError || urlError || state?.error;

  return (
    <div className="space-y-5">
      <form action={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/40 p-3.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Full Name (Required) */}
        <div className="space-y-1">
          <label
            htmlFor="fullName"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Full name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Sarah Connor"
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Work Email (Required) */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Work email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Passwords Grid (Required) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Min 6 chars"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Optional Fields Grid: Company Name & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label
              htmlFor="companyName"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
            >
              <span>Company name</span>
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">Optional</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                placeholder="Acme Corp"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="phoneNumber"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
            >
              <span>Phone number</span>
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">Optional</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Marketing Consent Checkbox (Unchecked by default) */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              id="marketingConsent"
              name="marketingConsent"
              defaultChecked={false}
              disabled={isPending}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
            />
            <span className="leading-snug">
              Send me occasional product updates, tips, and news from LoomNotes AI.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 text-xs sm:text-sm font-semibold mt-3"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating free account...
            </span>
          ) : (
            "Create Free Account"
          )}
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
