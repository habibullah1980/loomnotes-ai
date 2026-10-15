import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  updateUserSubscription,
  isWebhookEventProcessed,
  recordWebhookEvent,
} from "@/lib/stripe/subscription-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret unconfigured on server." },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // 1. Read raw body as text for signature validation
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to read request body: ${err?.message}` },
      { status: 400 }
    );
  }

  // 2. Cryptographically verify Stripe webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe Webhook Signature Verification Failed:", err?.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message}` },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) {
    console.error("Supabase admin client unavailable for webhook handler.");
    return NextResponse.json(
      { error: "Database service unavailable." },
      { status: 500 }
    );
  }

  // 3. Prevent duplicate processing (Idempotency)
  const isDuplicate = await isWebhookEventProcessed(adminSupabase, event.id);
  if (isDuplicate) {
    console.log(`Webhook event ${event.id} already processed. Returning 200 OK.`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  let eventUserId: string | null = null;

  try {
    // 4. Handle specific Stripe event types
    switch (event.type) {
      // ------------------------------------------------------------------------
      // A. Checkout Session Completed (First time purchase)
      // ------------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ||
          session.metadata?.userId ||
          (session as any).subscription_data?.metadata?.userId;

        if (userId && session.subscription) {
          eventUserId = userId;
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id || null;

          // Retrieve full subscription object for period dates
          const subscription = await stripe.subscriptions.retrieve(subId);

          const currentPeriodStart = (subscription as any).current_period_start
            ? new Date((subscription as any).current_period_start * 1000).toISOString()
            : null;
          const currentPeriodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null;

          await updateUserSubscription(adminSupabase, {
            userId,
            plan: "pro",
            status: "active",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subId,
            stripePriceId: subscription.items.data[0]?.price.id || null,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          });
        }
        break;
      }

      // ------------------------------------------------------------------------
      // B. Subscription Updated / Renewed / Plan Changed
      // ------------------------------------------------------------------------
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;

        // If metadata is missing, look up by stripe_customer_id in profiles
        if (!userId && subscription.customer) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          const { data: profile } = await adminSupabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id" as any, customerId)
            .maybeSingle();

          if (profile) userId = profile.id;
        }

        if (userId) {
          eventUserId = userId;
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          const currentPeriodStart = (subscription as any).current_period_start
            ? new Date((subscription as any).current_period_start * 1000).toISOString()
            : null;
          const currentPeriodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null;

          await updateUserSubscription(adminSupabase, {
            userId,
            plan: isActive ? "pro" : "free",
            status: subscription.status as any,
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id || null,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          });
        }
        break;
      }

      // ------------------------------------------------------------------------
      // C. Subscription Canceled / Deleted (Immediate revocation of Pro)
      // ------------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;

        if (!userId && subscription.customer) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          const { data: profile } = await adminSupabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id" as any, customerId)
            .maybeSingle();

          if (profile) userId = profile.id;
        }

        if (userId) {
          eventUserId = userId;
          await updateUserSubscription(adminSupabase, {
            userId,
            plan: "free",
            status: "canceled",
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionId: subscription.id,
            cancelAtPeriodEnd: false,
          });
        }
        break;
      }

      // ------------------------------------------------------------------------
      // D. Invoice Payment Succeeded (Recurring Monthly Renewal)
      // ------------------------------------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;

        if (subId && typeof subId === "string") {
          const subscription = await stripe.subscriptions.retrieve(subId);
          let userId = subscription.metadata?.userId;

          if (!userId && invoice.customer) {
            const customerId =
              typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
            const { data: profile } = await adminSupabase
              .from("profiles")
              .select("id")
              .eq("stripe_customer_id" as any, customerId)
              .maybeSingle();

            if (profile) userId = profile.id;
          }

          if (userId) {
            eventUserId = userId;
            const currentPeriodEnd = (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000).toISOString()
              : null;

            await updateUserSubscription(adminSupabase, {
              userId,
              plan: "pro",
              status: "active",
              stripeCustomerId:
                typeof invoice.customer === "string"
                  ? invoice.customer
                  : invoice.customer?.id || null,
              stripeSubscriptionId: subId,
              currentPeriodEnd,
              cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            });
          }
        }
        break;
      }

      // ------------------------------------------------------------------------
      // E. Invoice Payment Failed (Credit Card Declined / Expired)
      // ------------------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;

        if (subId && typeof subId === "string") {
          let userId: string | null = null;
          if (invoice.customer) {
            const customerId =
              typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
            const { data: profile } = await adminSupabase
              .from("profiles")
              .select("id")
              .eq("stripe_customer_id" as any, customerId)
              .maybeSingle();

            if (profile) userId = profile.id;
          }

          if (userId) {
            eventUserId = userId;
            // Mark past_due: Pro benefits suspended until payment is updated
            await updateUserSubscription(adminSupabase, {
              userId,
              plan: "free",
              status: "past_due",
              stripeCustomerId:
                typeof invoice.customer === "string"
                  ? invoice.customer
                  : invoice.customer?.id || null,
              stripeSubscriptionId: subId,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // 5. Record event in database for idempotency
    await recordWebhookEvent(adminSupabase, event.id, event.type, eventUserId);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Error processing Stripe webhook event:", err);
    return NextResponse.json(
      { error: "Webhook event handler encountered an internal error." },
      { status: 500 }
    );
  }
}
