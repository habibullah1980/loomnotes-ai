import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import { STRIPE_CONFIG } from "@/lib/stripe/config";
import { getUserSubscription } from "@/lib/stripe/subscription-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication service unavailable." },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to upgrade to Pro." },
        { status: 401 }
      );
    }

    // 2. Check if user already has an active Pro subscription
    const subInfo = await getUserSubscription(supabase, user.id);
    if (subInfo.isPro && !subInfo.isSuperAdmin) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription.", alreadySubscribed: true },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const stripe = getStripeClient();
    const adminSupabase = createAdminSupabaseClient();

    // 3. Find or create Stripe Customer
    let customerId = subInfo.stripeCustomerId;

    if (!customerId) {
      // Check in Stripe by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name || undefined,
          metadata: {
            userId: user.id,
          },
        });
        customerId = newCustomer.id;
      }

      // Persist customerId in profiles
      if (adminSupabase) {
        try {
          await adminSupabase
            .from("profiles")
            .update({ stripe_customer_id: customerId } as any)
            .eq("id", user.id);
        } catch {
          // Non-blocking
        }
      }
    }

    // 4. Build line items for $9.99/month
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const lineItems: any[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: STRIPE_CONFIG.proPlan.currency,
              product_data: {
                name: STRIPE_CONFIG.proPlan.name,
                description: STRIPE_CONFIG.proPlan.description,
              },
              unit_amount: STRIPE_CONFIG.proPlan.priceCents, // $9.99
              recurring: {
                interval: STRIPE_CONFIG.proPlan.interval,
              },
            },
            quantity: 1,
          },
        ];

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: lineItems,
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: "pro",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: "pro",
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initiate Stripe Checkout." },
      { status: 500 }
    );
  }
}
