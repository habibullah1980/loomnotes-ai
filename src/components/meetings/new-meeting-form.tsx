"use client";

import { useState, useActionState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Video,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
  Wand2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createMeetingAction } from "@/app/actions/meetings";
import { fetchLoomTranscriptAction } from "@/app/actions/loom";
import { parseLoomUrl } from "@/lib/loom/url";
import { MonthlyUsageInfo } from "@/lib/usage/usage-service";

interface NewMeetingFormProps {
  usage?: MonthlyUsageInfo;
}

const SAMPLE_TRANSCRIPT = `Sarah (Product Lead): Hey everyone, thanks for joining our weekly product sync. Today we need to lock down the MVP scope for LoomNotes AI and review the onboarding flow.

Alex (Frontend Eng): Sounds good. On the frontend, we've set up Next.js 16 and Tailwind v4. The Supabase auth integration is complete and tested. Habib tested the dashboard protection, and the user session proxy is working smoothly.

Sarah: Fantastic. Michael, what's the status on the Gemini API connection?

Michael (Backend Eng): We connected the official @google/genai SDK with gemini-3.5-flash-lite. The test prompt passed with a 4-second response time. It's ready to receive full transcripts and generate summaries and action items.

Sarah: Great progress! For action items: Alex, please finalize the meeting detail page today. Michael, hook up the server-side summarization pipeline with Gemini and connect it to our meetings and action_items tables in Supabase by 2026-10-15. Let's aim to have the full workflow tested by tomorrow morning.

Alex: Got it, I'll have the UI ready with validation and action item toggling.

Michael: Confirmed, I'll prepare the Gemini summarization prompt and Supabase insertion logic.`;

export function NewMeetingForm({ usage }: NewMeetingFormProps) {
  const [state, formAction, isPending] = useActionState(createMeetingAction, null);
  const [title, setTitle] = useState("");
  const [loomUrl, setLoomUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  // Loom transcript retrieval states
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [transcriptFetchError, setTranscriptFetchError] = useState<string | null>(null);
  const [transcriptFetchSuccess, setTranscriptFetchSuccess] = useState<string | null>(null);

  // Validate Loom URL on client
  const loomValidation = useMemo(() => {
    if (!loomUrl.trim()) return null;
    return parseLoomUrl(loomUrl);
  }, [loomUrl]);

  const charCount = transcript.length;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const isGenerateDisabled = !transcript.trim() || isPending || isFetchingTranscript;

  const handleLoomUrlChange = (value: string) => {
    setLoomUrl(value);
    setTranscriptFetchError(null);
    setTranscriptFetchSuccess(null);
  };

  const handleGetTranscript = async () => {
    if (!loomUrl.trim()) return;

    setIsFetchingTranscript(true);
    setTranscriptFetchError(null);
    setTranscriptFetchSuccess(null);
    setClientError(null);

    try {
      const result = await fetchLoomTranscriptAction(loomUrl);

      if (!result.success || !result.transcript) {
        setTranscriptFetchError(result.error || "Failed to retrieve transcript from Loom.");
      } else {
        setTranscript(result.transcript);
        setTranscriptFetchSuccess(
          `Transcript retrieved successfully (${result.transcript.length.toLocaleString()} characters)`
        );

        if (!title.trim() && result.title) {
          setTitle(result.title);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to transcript service.";
      setTranscriptFetchError(msg);
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const handleLoadSample = () => {
    setTitle("Product Engineering Sync: LoomNotes MVP");
    setTranscript(SAMPLE_TRANSCRIPT);
    setClientError(null);
    setTranscriptFetchError(null);
    setTranscriptFetchSuccess(null);
  };

  const handleClear = () => {
    setTitle("");
    setLoomUrl("");
    setTranscript("");
    setClientError(null);
    setTranscriptFetchError(null);
    setTranscriptFetchSuccess(null);
  };

  const handleSubmit = (formData: FormData) => {
    setClientError(null);

    const titleVal = (formData.get("title") as string)?.trim();
    const transcriptVal = (formData.get("transcript") as string)?.trim();
    const loomUrlVal = (formData.get("loomUrl") as string)?.trim();

    if (!titleVal) {
      setClientError("Please provide a title for this meeting.");
      return;
    }

    if (!transcriptVal || transcriptVal.length < 20) {
      setClientError("Please provide a transcript of at least 20 characters for AI analysis.");
      return;
    }

    if (loomUrlVal) {
      const check = parseLoomUrl(loomUrlVal);
      if (!check.isValid) {
        setClientError(check.error || "Please enter a valid Loom URL or leave it blank.");
        return;
      }
    }

    formAction(formData);
  };

  const displayError = clientError || state?.error;

  return (
    <form action={handleSubmit} className="space-y-6">

      {/* Top Info Banner */}
      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 p-4 transition-colors">
        <div className="flex items-start gap-3">
          <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
              Transcript Required for AI Processing
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter a Loom share link to fetch the transcript, or paste discussion text manually. Google Gemini will extract summaries, key decisions, and actionable tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Error message alert */}
      {displayError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 p-4 text-xs text-red-600 dark:text-red-400 transition-colors">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Unable to Process Meeting</span>
            <p>{displayError}</p>
          </div>
        </div>
      )}

      {/* Main Form Fields Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-7 shadow-xs space-y-5 transition-colors">
        {/* Field 1: Meeting Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="title"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Required</span>
          </div>
          <div className="relative">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Sprint Planning & Product Architecture"
              disabled={isPending || isFetchingTranscript}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        {/* Field 2: Loom Video URL & Transcript Retrieval */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="loomUrl"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              Loom Video URL
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>

            {/* Loom URL Detection Status */}
            {loomValidation && loomValidation.isValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                <Check className="h-3 w-3" />
                Loom URL detected
              </span>
            ) : loomValidation && !loomValidation.isValid ? (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Invalid Loom URL
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">e.g. loom.com/share/ID</span>
            )}
          </div>

          {/* URL Input and Get Transcript CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="loomUrl"
                name="loomUrl"
                type="url"
                value={loomUrl}
                onChange={(e) => handleLoomUrlChange(e.target.value)}
                placeholder="https://www.loom.com/share/d4a8e29bf4914fa6b21914c628f28941"
                disabled={isPending || isFetchingTranscript}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
              />
            </div>

            {/* "Get Transcript" Button */}
            <button
              type="button"
              onClick={handleGetTranscript}
              disabled={
                !loomValidation?.isValid ||
                isFetchingTranscript ||
                isPending
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white px-3.5 py-2 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {isFetchingTranscript ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  <span>Get Transcript</span>
                </>
              )}
            </button>
          </div>

          {/* Transcript Retrieval Success Alert */}
          {transcriptFetchSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 p-2.5 text-xs text-teal-800 dark:text-teal-200">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{transcriptFetchSuccess}</span>
            </div>
          )}

          {/* Transcript Retrieval Error Alert */}
          {transcriptFetchError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{transcriptFetchError}</span>
            </div>
          )}
        </div>

        {/* Field 3: Meeting Transcript Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="transcript"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Meeting Transcript <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={isPending || isFetchingTranscript}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="h-3 w-3" />
                Load Sample
              </button>
              {transcript && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isPending || isFetchingTranscript}
                  className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer disabled:opacity-50 ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="transcript"
              name="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the raw video transcript or discussion text here, or use 'Get Transcript' above..."
              disabled={isPending || isFetchingTranscript}
              required
              rows={10}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 font-mono leading-relaxed resize-y transition-colors"
            />
          </div>

          {/* Character & Counter */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
            <div className="flex items-center gap-2.5">
              <span>{charCount.toLocaleString()} characters</span>
              <span>•</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
            {charCount >= 20 && (
              <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Gemini
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <Button
          type="submit"
          disabled={isGenerateDisabled}
          size="md"
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating notes with Gemini...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Notes</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
