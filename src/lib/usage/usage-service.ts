import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";
import { getUserSubscription } from "@/lib/stripe/subscription-service";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

export interface MonthlyUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  month: string;
  percentageUsed: number;
  isSuperAdmin?: boolean;
  isUnlimited?: boolean;
  isPro?: boolean;
  plan: "free" | "pro";
  subscriptionStatus: string;
  freeLimit: number;
}

/**
 * Returns current month in 'YYYY-MM' format (e.g. '2026-10')
 */
export function getCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Computes ISO date range for a given monthKey 'YYYY-MM'
 */
export function getMonthDateRange(monthKey: string): { startIso: string; endIso: string } {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

/**
 * Retrieves usage and subscription status for the specified user under RLS.
 * Enforces Freemium model: 3 free videos total for Free users, unlimited for Pro.
 */
export async function getMonthlyUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<MonthlyUsageInfo> {
  const freeLimit = STRIPE_CONFIG.freeTier.maxFreeVideos; // 3 videos

  // 1. Fetch user subscription details
  const subInfo = await getUserSubscription(supabase, userId);
  const isSuperAdmin = subInfo.isSuperAdmin;
  const isPro = subInfo.isPro;

  // 2. Count total meetings created by this user
  let totalMeetingsCount = 0;
  const { count, error: countError } = await supabase
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!countError && typeof count === "number") {
    totalMeetingsCount = count;
  }

  // 3. Query usage_tracking table (lifetime / persistent tracking)
  let trackedCount = 0;
  try {
    const { data: trackingData } = await supabase
      .from("usage_tracking")
      .select("meetings_generated")
      .eq("user_id", userId);

    if (trackingData && trackingData.length > 0) {
      trackedCount = trackingData.reduce((acc, row) => acc + (row.meetings_generated || 0), 0);
    }
  } catch {
    // Non-blocking
  }

  // Prevent gaming via meeting deletion: used count is at least total meetings or tracked count
  const used = Math.max(totalMeetingsCount, trackedCount);

  // 4. Determine limits and remaining credits
  if (isPro || isSuperAdmin) {
    return {
      used,
      limit: Infinity,
      remaining: Infinity,
      isLimitReached: false,
      month: monthKey,
      percentageUsed: 0,
      isSuperAdmin,
      isUnlimited: true,
      isPro: true,
      plan: "pro",
      subscriptionStatus: isSuperAdmin ? "active" : subInfo.status,
      freeLimit,
    };
  }

  // Free Tier (3 videos limit)
  const isLimitReached = used >= freeLimit;
  const remaining = Math.max(0, freeLimit - used);
  const percentageUsed = Math.min(100, Math.round((used / freeLimit) * 100));

  return {
    used,
    limit: freeLimit,
    remaining,
    isLimitReached,
    month: monthKey,
    percentageUsed,
    isSuperAdmin: false,
    isUnlimited: false,
    isPro: false,
    plan: "free",
    subscriptionStatus: subInfo.status,
    freeLimit,
  };
}

/**
 * Validates whether the user is authorized to process a new meeting / video.
 * Blocks free users who have reached their 3 free videos limit.
 */
export async function checkUsageAllowance(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<{ allowed: boolean; usage: MonthlyUsageInfo; error?: string }> {
  const usage = await getMonthlyUsage(supabase, userId, monthKey);

  if (usage.isPro || usage.isSuperAdmin) {
    return {
      allowed: true,
      usage,
    };
  }

  if (usage.isLimitReached) {
    return {
      allowed: false,
      usage,
      error: "You've used your 3 free videos. Upgrade to Pro for $9.99/month to continue.",
    };
  }

  return {
    allowed: true,
    usage,
  };
}

/**
 * Increments the user's persistent usage counter upon successful meeting creation.
 */
export async function incrementMonthlyUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<{ success: boolean; limitReached?: boolean; currentUsage: number; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from("usage_tracking")
      .select("meetings_generated")
      .eq("user_id", userId)
      .eq("month", monthKey)
      .maybeSingle();

    const nextCount = (existing?.meetings_generated || 0) + 1;

    await supabase
      .from("usage_tracking")
      .upsert(
        {
          user_id: userId,
          month: monthKey,
          meetings_generated: nextCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,month" }
      );

    return {
      success: true,
      currentUsage: nextCount,
      limitReached: false,
    };
  } catch (err: any) {
    console.warn("Usage tracking notice:", err?.message);
    return {
      success: true,
      currentUsage: 1,
    };
  }
}
