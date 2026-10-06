"use client";

import { useState, useTransition } from "react";
import { deleteMeetingAction } from "@/app/actions/meetings";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteMeetingButtonProps {
  meetingId: string;
  meetingTitle: string;
}

export function DeleteMeetingButton({ meetingId, meetingTitle }: DeleteMeetingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteMeetingAction(meetingId);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        title="Delete meeting"
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer shadow-2xs"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete Meeting</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Meeting Note</h3>
                  <span className="text-xs text-slate-500">This action cannot be undone.</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete &quot;<strong className="text-slate-900">{meetingTitle}</strong>&quot;? All extracted takeaways, decisions, and action items will be removed.
            </p>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
