"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { setConsentStatus } from "@/lib/analytics/ga4";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("freepdfkit_analytics_consent");
      if (!consent) {
        // Show after a brief delay so it doesn't block initial page load
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAccept = () => {
    setConsentStatus(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    setConsentStatus(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Analytics Consent"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-md z-40 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 sm:p-5 text-xs text-slate-600 dark:text-slate-300 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-xl bg-[#4b49ac]/10 text-[#4b49ac] dark:text-[#7DA0FA] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Privacy &amp; Analytics</h4>
            <button
              onClick={handleDecline}
              aria-label="Dismiss banner"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="leading-relaxed">
            We use privacy-friendly analytics to understand tool performance. We never track document contents, personal identities, or files. Read our{" "}
            <Link href="/privacy" className="text-[#4b49ac] dark:text-[#7DA0FA] underline font-semibold">
              Privacy Policy
            </Link>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-lg bg-[#4b49ac] hover:bg-[#7978e3] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Accept Analytics
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
