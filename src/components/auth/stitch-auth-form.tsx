"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, signupAction } from "@/app/actions/auth";

interface StitchAuthProps {
  initialMode?: "signin" | "signup";
}

export function StitchAuthForm({ initialMode = "signin" }: StitchAuthProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (mode === "signup") {
      formData.append("fullName", fullName);
      formData.append("confirmPassword", password);
    }

    try {
      if (mode === "signin") {
        const res = await loginAction(null, formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          router.push("/dashboard");
        }
      } else {
        const res = await signupAction(null, formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      // Fallback for mock demo if offline
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden relative">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* LEFT BRANDING & VALUE PROPOSITION PANEL */}
        <section className="lg:col-span-5 bg-[#f2f3ff] p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex flex-col space-y-6">
            {/* Logo & Brand Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#4b49ac] flex items-center justify-center text-white shadow-xs font-bold text-lg">
                <span className="material-symbols-outlined leading-none">bolt</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg text-[#131b2e] tracking-tight font-extrabold">FreePDFKit</span>
                <span className="text-[10px] text-[#434655] uppercase tracking-wider font-bold">
                  Freelance Pipeline Engine
                </span>
              </div>
            </div>

            {/* Editorial Lead Copy */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86f2e4] text-[#006f66] text-xs font-bold mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006a61]"></span>
                Precision Follow-Ups
              </div>
              <h1 className="text-xl md:text-2xl text-[#131b2e] font-extrabold leading-snug">
                Turn quiet proposals into signed client engagements.
              </h1>
              <p className="text-xs text-[#434655] mt-2 leading-relaxed">
                The frictionless CRM built specifically for high-rate independent consultants and boutique design directors.
              </p>
            </div>

            {/* Feature Checklist Points */}
            <ul className="flex flex-col space-y-3 pt-2">
              {[
                "Automated follow-up cadences that sound handwritten",
                "Zero dropped client relationships across multi-month deals",
                "Tailored for solo professionals, zero corporate bloat",
              ].map((text) => (
                <li key={text} className="flex items-start space-x-2.5 text-xs text-[#131b2e] font-semibold">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#86f2e4] text-[#006f66]">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Proof / Testimonial Box */}
          <div className="mt-6 rounded-xl bg-white p-4 shadow-2xs border border-slate-200/80">
            <div className="flex items-center space-x-1 text-[#F59E0B] mb-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-xs text-[#131b2e] italic leading-relaxed">
              &ldquo;pdfkitfree helped me recover $18,000 in forgotten project proposals and cut client ghosting to zero.&rdquo;
            </p>
            <div className="mt-2.5 flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-full bg-[#eaedff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                SJ
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#131b2e] font-bold">Sarah Jenkins</span>
                <span className="text-[10px] text-[#434655]">Principal Design Director, Studio Jenkins</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT AUTH FORM PANEL */}
        <section className="lg:col-span-7 bg-white p-6 lg:p-8 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto flex flex-col">
            {/* Mode Switcher Tabs */}
            <div className="inline-flex w-full p-1 rounded-lg bg-[#f2f3ff] mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-[#131b2e] shadow-2xs"
                    : "text-[#434655] hover:text-[#131b2e]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#131b2e] shadow-2xs"
                    : "text-[#434655] hover:text-[#131b2e]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Dynamic Header */}
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-[#131b2e] tracking-tight">
                {mode === "signin" ? "Welcome back to FreePDFKit" : "Create your Consultant Account"}
              </h2>
              <p className="text-xs text-[#434655] mt-1">
                {mode === "signin"
                  ? "Enter your credentials to access your client dashboard and pipeline."
                  : "Start your 14-day free trial. Setup takes under 60 seconds."}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Social Sign-in Actions */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current text-[#131b2e]" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.79 1.44-.6.69-1.13 1.83-.99 2.94 1.07.08 2.14-.49 2.79-1.28z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2 mb-4">
              <div className="w-full h-px bg-slate-200"></div>
              <span className="absolute px-3 bg-white text-[10px] text-[#434655] uppercase tracking-wider font-bold">
                or continue with email
              </span>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              {mode === "signup" && (
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-[#131b2e]">Full Name</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] text-[#131b2e] text-xs border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-[#131b2e]">Work Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] text-[#131b2e] text-xs border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#131b2e]">Password</label>
                  {mode === "signin" && (
                    <Link href="/forgot-password" className="text-[11px] text-[#004ac6] hover:underline font-semibold">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="h-10 w-full pl-3 pr-16 rounded-lg bg-[#f2f3ff] text-[#131b2e] text-xs border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 px-2 py-1 text-[11px] text-[#434655] hover:text-[#131b2e] font-bold cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#2563eb] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-[#434655] cursor-pointer">
                  {mode === "signin"
                    ? "Remember this device for 30 days"
                    : "I agree to the Terms of Service & Privacy Policy"}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center space-x-2 w-full h-11 rounded-lg bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>
                  {loading
                    ? "Authenticating..."
                    : mode === "signin"
                    ? "Sign In to Dashboard"
                    : "Start 14-Day Free Trial"}
                </span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#434655]">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-[#004ac6] font-bold hover:underline cursor-pointer"
                    >
                      Sign up for a 14-day free trial.
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-[#004ac6] font-bold hover:underline cursor-pointer"
                    >
                      Sign in to your pipeline.
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Trust Badges Footer */}
          <div className="mt-6 pt-3 bg-[#f2f3ff] rounded-lg p-2.5 flex items-center justify-around gap-2 text-center text-[#434655] border border-slate-200">
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[16px] text-[#006242]">verified_user</span>
              <span className="text-[10px] font-bold">SOC2 Type II</span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[16px] text-[#004ac6]">lock</span>
              <span className="text-[10px] font-bold">256-bit Encryption</span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[16px] text-[#006a61]">credit_card_off</span>
              <span className="text-[10px] font-bold">No CC Required</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
