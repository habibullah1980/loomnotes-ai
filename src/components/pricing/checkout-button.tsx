"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  isLoggedIn: boolean;
  isPro?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
  text?: string;
}

export function CheckoutButton({
  isLoggedIn,
  isPro = false,
  className = "",
  size = "lg",
  text = "Upgrade to Pro — $9.99/mo",
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push("/signup?redirect=/pricing");
      return;
    }

    if (isPro) {
      router.push("/dashboard/settings");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start Stripe checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server.");
      }
    } catch (err: any) {
      console.error("Checkout initiation failed:", err);
      setError(err?.message || "Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPro) {
    return (
      <Button
        onClick={() => router.push("/dashboard/settings")}
        variant="secondary"
        size={size === "lg" ? "md" : (size as any)}
        className={`w-full font-semibold border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30 ${className}`}
      >
        <Check className="h-4 w-4 mr-2 text-teal-600" />
        Current Plan (Pro Active)
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        size={size === "lg" ? "md" : (size as any)}
        className={`w-full font-semibold text-white bg-gradient-to-r from-[#4b49ac] via-[#7978e3] to-[#7DA0FA] hover:opacity-95 shadow-md active:scale-[0.99] cursor-pointer transition-all ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to Stripe...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#98dbff]" />
            <span>{text}</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
