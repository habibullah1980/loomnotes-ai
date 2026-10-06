import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - LoomNotes AI",
  description: "Privacy Policy and data protection commitments for LoomNotes AI.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090d16] text-[#0F172A] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Trust & Governance
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Privacy Policy
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Last Updated: October 6, 2026. This policy outlines how LoomNotes AI collects, processes, and protects your information.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 px-3 py-1 text-xs font-medium text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Standard Enterprise SaaS Compliance Template — Subject to Legal Review</span>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
              <p>
                When you use LoomNotes AI, we collect the necessary information to provide AI meeting intelligence services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Account Information:</strong> Name, email address, password hashes, and optional details (phone number, company name).</li>
                <li><strong>Meeting Data:</strong> Loom video URLs, transcripts submitted for analysis, and generated summaries, decisions, and action items.</li>
                <li><strong>Usage & Telemetry:</strong> Feature usage, browser types, session timestamps, and authentication metadata to ensure platform reliability.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. How We Use Your Data</h2>
              <p>
                We use collected information solely to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>Generate executive meeting notes, action items, and knowledge extraction via Google Gemini AI models.</li>
                <li>Authenticate your identity and isolate your data using strict Row Level Security (RLS).</li>
                <li>Deliver product updates and announcements (only when explicit marketing consent is granted).</li>
                <li>Improve application reliability, API latency, and meeting transcription processing.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. AI Processing & Third-Party Services</h2>
              <p>
                LoomNotes AI interfaces with enterprise cloud providers:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Google Gemini API:</strong> Transcripts are transmitted securely to generate meeting insights. We do not use your private meeting transcripts to train public foundational AI models.</li>
                <li><strong>Supabase:</strong> Data is encrypted at rest and in transit via TLS 1.3 with PostgreSQL Row-Level Security policies.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Data Security & Retention</h2>
              <p>
                Your meeting records and personal profile are protected by server-side authentication guards and database isolation. You may delete individual meetings or request complete account deletion at any time through the application or by contacting support.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Contact Us</h2>
              <p>
                For privacy inquiries, data export requests, or security audits, contact our security team at{" "}
                <a href="mailto:privacy@loomnotes.ai" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@loomnotes.ai
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
