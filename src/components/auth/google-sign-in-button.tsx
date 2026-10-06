"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AlertCircle, Loader2 } from "lucide-react";

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  text?: string;
  redirectTo?: string;
}

export function GoogleSignInButton({
  text = "Continue with Google",
  redirectTo = "/dashboard",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase is not configured. Check environment variables.");
      }

      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        redirectTo
      )}`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err?.message || "Failed to initiate Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-zinc-700 dark:text-slate-200 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-slate-700 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-slate-400" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>{text}</span>
          </>
        )}
      </button>
    </div>
  );
}
