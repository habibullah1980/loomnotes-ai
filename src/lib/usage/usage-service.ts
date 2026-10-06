import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

export interface MonthlyUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  month: string;
  percentageUsed: number;
  isSuperAdmin?: boolean;
  isUnlimited?: boolean;
  isEarlyAccess?: boolean;
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
 * Retrieves monthly usage for the specified user and calendar month under RLS.
 * Growth & Early-Access Model: All users receive unlimited AI meeting generation.
 * Usage continues to be tracked for product analytics without blocking users.
 */
export async function getMonthlyUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<MonthlyUsageInfo> {
  // 1. Check user role
  let role = "user";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, plan")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role;
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id === userId) {
        role =
          (userData.user.user_metadata?.role as string) ||
          (userData.user.app_metadata?.role as string) ||
          "user";
      }
    }
  } catch {
    // Non-blocking role fallback
  }

  const isSuperAdmin = role === "super_admin";
  let usedCount = 0;

  // 2. Query usage_tracking table for analytics
  const { data: trackingData, error: trackingError } = await supabase
    .from("usage_tracking")
    .select("meetings_generated")
    .eq("user_id", userId)
    .eq("month", monthKey)
    .maybeSingle();

  if (!trackingError && trackingData) {
    usedCount = trackingData.meetings_generated;
  } else {
    // 3. Fallback: count meetings created this month
    const { startIso, endIso } = getMonthDateRange(monthKey);
    const { count, error: countError } = await supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .lt("created_at", endIso);

    if (!countError && typeof count === "number") {
      usedCount = count;
    }
  }

  // Early-access model: All users have unlimited generation
  return {
    used: usedCount,
    limit: Infinity,
    remaining: Infinity,
    isLimitReached: false,
    month: monthKey,
    percentageUsed: 0,
    isSuperAdmin,
    isUnlimited: true,
    isEarlyAccess: true,
  };
}

/**
 * Checks if the user is allowed to generate a new meeting.
 * Always returns allowed: true under the Early-Access model.
 */
export async function checkUsageAllowance(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<{ allowed: boolean; usage: MonthlyUsageInfo }> {
  const usage = await getMonthlyUsage(supabase, userId, monthKey);

  return {
    allowed: true,
    usage,
  };
}

/**
 * Atomically increments the user's monthly usage counter for analytics.
 * Does NOT block or enforce limits.
 */
export async function incrementMonthlyUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  monthKey: string = getCurrentMonthKey()
): Promise<{ success: boolean; limitReached?: boolean; currentUsage: number; error?: string }> {
  const usage = await getMonthlyUsage(supabase, userId, monthKey);
  const nextCount = usage.used + 1;

  try {
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
  } catch (err) {
    console.warn("Usage tracking upsert notice:", err);
  }

  return {
    success: true,
    currentUsage: nextCount,
    limitReached: false,
  };
}
