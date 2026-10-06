import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service - LoomNotes AI",
  description: "Terms of Service and acceptable use policy for LoomNotes AI.",
};

export default function TermsOfServicePage() {
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
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Legal Agreement
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Terms of Service
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Effective Date: October 6, 2026. Please read these terms carefully prior to accessing LoomNotes AI.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 px-3 py-1 text-xs font-medium text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Standard Enterprise SaaS Terms — Subject to Final Legal Review</span>
            </div>
          </div>

          {/* Terms Content */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or using LoomNotes AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Description of Service & Early Access</h2>
              <p>
                LoomNotes AI provides automated video transcript parsing, AI-assisted note generation, action item extraction, and meeting knowledge management. As part of our early-access growth phase, AI meeting generation is offered freely subject to fair usage guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. User Responsibilities & Acceptable Use</h2>
              <p>
                You agree not to use LoomNotes AI to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>Submit unlawful, defamatory, harassing, or infringing meeting recordings or transcripts.</li>
                <li>Attempt unauthorized access to other user accounts, administrative portals, or infrastructure.</li>
                <li>Conduct automated scraping, rate-limit bypassing, or denial-of-service activities.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Intellectual Property & Meeting Content</h2>
              <p>
                You retain full ownership of all meeting recordings, transcripts, and proprietary notes you submit to LoomNotes AI. We grant you a non-exclusive license to utilize generated insights for your organizational and personal business purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Limitation of Liability & Disclaimer</h2>
              <p>
                The Service is provided &quot;as is&quot; without warranties of any kind. LoomNotes AI and its affiliates shall not be liable for indirect, incidental, or consequential damages arising from meeting transcript inaccuracies or automated AI summaries.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Modifications & Termination</h2>
              <p>
                We reserve the right to modify these terms or discontinue features with appropriate notice. For support or legal notices, email{" "}
                <a href="mailto:support@loomnotes.ai" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  support@loomnotes.ai
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
