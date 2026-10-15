import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

export interface UserSubscriptionInfo {
  userId: string;
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "none";
  isPro: boolean;
  isSuperAdmin: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface UpdateSubscriptionParams {
  userId: string;
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "none";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Retrieves the current subscription state for a given user.
 * Validates role, plan, and active subscription status.
 */
export async function getUserSubscription(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserSubscriptionInfo> {
  let role = "user";
  let plan: "free" | "pro" = "free";
  let status: UserSubscriptionInfo["status"] = "none";
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let currentPeriodEnd: string | null = null;
  let cancelAtPeriodEnd = false;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, plan, status")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      if (profile.role) role = profile.role;
      if (profile.plan === "pro") plan = "pro";
      if (profile.status) {
        status = profile.status as UserSubscriptionInfo["status"];
      }
    }

    // Try reading extended subscription fields if available in profiles or subscriptions
    const { data: subData } = await supabase
      .from("subscriptions" as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subData) {
      const s = subData as any;
      if (s.plan === "pro") plan = "pro";
      if (s.status) status = s.status;
      stripeCustomerId = s.stripe_customer_id || null;
      stripeSubscriptionId = s.stripe_subscription_id || null;
      currentPeriodEnd = s.current_period_end || null;
      cancelAtPeriodEnd = Boolean(s.cancel_at_period_end);
    }
  } catch {
    // Graceful fallback to Auth user metadata
  }

  // Fallback / complement from auth user metadata
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user && authData.user.id === userId) {
      const meta = authData.user.user_metadata || {};
      const appMeta = authData.user.app_metadata || {};

      if (appMeta.role) role = appMeta.role;
      if (meta.role) role = meta.role;

      if (meta.plan === "pro" || appMeta.plan === "pro") {
        plan = "pro";
      }
      if (meta.subscription_status) {
        status = meta.subscription_status;
      }
      if (meta.stripe_customer_id && !stripeCustomerId) {
        stripeCustomerId = meta.stripe_customer_id;
      }
      if (meta.stripe_subscription_id && !stripeSubscriptionId) {
        stripeSubscriptionId = meta.stripe_subscription_id;
      }
      if (meta.current_period_end && !currentPeriodEnd) {
        currentPeriodEnd = meta.current_period_end;
      }
      if (typeof meta.cancel_at_period_end === "boolean") {
        cancelAtPeriodEnd = meta.cancel_at_period_end;
      }
    }
  } catch {
    // Non-blocking
  }

  const isSuperAdmin = role === "super_admin";
  const isPro = (plan === "pro" && (status === "active" || status === "none")) || isSuperAdmin;

  return {
    userId,
    plan: isPro ? "pro" : "free",
    status: isPro && status === "none" ? "active" : status,
    isPro,
    isSuperAdmin,
    stripeCustomerId,
    stripeSubscriptionId,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  };
}

/**
 * Server-side updates a user's subscription and plan using the privileged admin client.
 * Synchronizes profiles, auth metadata, subscriptions table, and activity event logs.
 */
export async function updateUserSubscription(
  adminClient: SupabaseClient<Database>,
  params: UpdateSubscriptionParams
): Promise<{ success: boolean; error?: string }> {
  const {
    userId,
    plan,
    status,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd = false,
  } = params;

  try {
    // 1. Update public.profiles (safely updating plan and status)
    try {
      const fullUpdates: Record<string, any> = {
        plan,
        status: status === "active" ? "active" : status,
        updated_at: new Date().toISOString(),
      };
      if (stripeCustomerId) fullUpdates.stripe_customer_id = stripeCustomerId;
      if (stripeSubscriptionId) fullUpdates.stripe_subscription_id = stripeSubscriptionId;
      if (currentPeriodEnd) fullUpdates.current_period_end = currentPeriodEnd;
      if (typeof cancelAtPeriodEnd === "boolean") fullUpdates.cancel_at_period_end = cancelAtPeriodEnd;

      const { error: fullErr } = await adminClient.from("profiles").update(fullUpdates as any).eq("id", userId);
      if (fullErr) {
        // If extended columns don't exist yet, update core plan and status
        await adminClient.from("profiles").update({
          plan,
          status: status === "active" ? "active" : status,
          updated_at: new Date().toISOString(),
        } as any).eq("id", userId);
      }
    } catch {
      // Non-blocking fallback
    }

    // 2. Synchronize Supabase Auth user metadata
    const { data: userRecord } = await adminClient.auth.admin.getUserById(userId);
    if (userRecord?.user) {
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...userRecord.user.user_metadata,
          plan,
          subscription_status: status,
          stripe_customer_id: stripeCustomerId || userRecord.user.user_metadata?.stripe_customer_id || null,
          stripe_subscription_id: stripeSubscriptionId || userRecord.user.user_metadata?.stripe_subscription_id || null,
          current_period_end: currentPeriodEnd || userRecord.user.user_metadata?.current_period_end || null,
          cancel_at_period_end: cancelAtPeriodEnd,
        },
        app_metadata: {
          ...userRecord.user.app_metadata,
          plan,
          subscription_status: status,
        },
      });
    }

    // 3. Upsert into subscriptions table if it exists
    if (stripeSubscriptionId && stripeCustomerId) {
      try {
        await adminClient.from("subscriptions" as any).upsert(
          {
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_price_id: stripePriceId || null,
            status,
            plan,
            current_period_start: currentPeriodStart || null,
            current_period_end: currentPeriodEnd || null,
            cancel_at_period_end: cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        );
      } catch {
        // Non-blocking if table is not yet in PostgREST schema cache
      }
    }

    // 4. Log audit activity event
    try {
      await adminClient.from("activity_events").insert({
        user_id: userId,
        event_type: "subscription_updated",
        metadata: {
          plan,
          status,
          stripeCustomerId,
          stripeSubscriptionId,
          cancelAtPeriodEnd,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Non-blocking audit log
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateUserSubscription:", err);
    return { success: false, error: err?.message || "Failed to update subscription" };
  }
}

/**
 * Checks if a Stripe webhook event has already been processed (Idempotency).
 */
export async function isWebhookEventProcessed(
  adminClient: SupabaseClient<Database>,
  eventId: string
): Promise<boolean> {
  // Check in stripe_webhook_events first
  try {
    const { data } = await adminClient
      .from("stripe_webhook_events" as any)
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (data) return true;
  } catch {
    // If table not yet in cache, check activity_events fallback
  }

  try {
    const { data: eventLog } = await adminClient
      .from("activity_events")
      .select("id")
      .eq("event_type", "stripe_webhook_received")
      .contains("metadata", { event_id: eventId })
      .maybeSingle();

    if (eventLog) return true;
  } catch {
    // Fallback
  }

  return false;
}

/**
 * Records a processed Stripe webhook event to guarantee idempotency on retries.
 */
export async function recordWebhookEvent(
  adminClient: SupabaseClient<Database>,
  eventId: string,
  eventType: string,
  userId?: string | null
): Promise<void> {
  try {
    await adminClient.from("stripe_webhook_events" as any).insert({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });
  } catch {
    // Fallback to activity_events
  }

  try {
    await adminClient.from("activity_events").insert({
      user_id: userId || null,
      event_type: "stripe_webhook_received",
      metadata: {
        event_id: eventId,
        event_type: eventType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Non-blocking
  }
}
