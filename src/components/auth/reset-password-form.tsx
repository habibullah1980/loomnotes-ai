"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Lock } from "lucide-react";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const [clientError, setClientError] = useState<string | null>(null);

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

  const errorMessage = clientError || state?.error;

  return (
    <div className="space-y-5">
      <form action={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-zinc-700 dark:text-slate-200"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-slate-500" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-zinc-700 dark:text-slate-200"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-slate-500" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 text-sm font-semibold mt-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating password...
            </span>
          ) : (
            "Set New Password"
          )}
        </Button>

        <p className="text-center text-xs text-zinc-500 dark:text-slate-400 pt-2">
          <Link
            href="/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            Back to Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
