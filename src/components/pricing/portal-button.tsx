"use client";

import { useState } from "react";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalButton({ className = "" }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received from server.");
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      setError(err?.message || "Failed to open Stripe portal.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        onClick={handleOpenPortal}
        disabled={isLoading}
        variant="secondary"
        size="md"
        className={`font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening Stripe Portal...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#4b49ac] dark:text-[#98dbff]" />
            <span>Manage Billing &amp; Invoices</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </span>
        )}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
