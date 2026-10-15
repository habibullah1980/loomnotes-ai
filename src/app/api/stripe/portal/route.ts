import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getUserSubscription } from "@/lib/stripe/subscription-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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
        { error: "You must be signed in to manage your subscription." },
        { status: 401 }
      );
    }

    const subInfo = await getUserSubscription(supabase, user.id);

    if (!subInfo.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active Stripe customer found for this account. Please subscribe to Pro first." },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const stripe = getStripeClient();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subInfo.stripeCustomerId,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Stripe Portal Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to open billing portal." },
      { status: 500 }
    );
  }
}
