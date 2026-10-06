import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Video } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset Password - LoomNotes AI",
  description: "Reset your LoomNotes AI account password securely.",
};

function FormFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-zinc-50 dark:bg-[#090d16] transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Video className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              LoomNotes AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Forgot your password?
          </h1>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {/* Card form */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-sm">
          <Suspense fallback={<FormFallback />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
