import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton Stripe client instance for server-side operations.
 * Throws a descriptive error if STRIPE_SECRET_KEY is missing when an active Stripe API call is made.
 */
export function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured in server environment variables. Please add it to .env.local or your hosting environment."
    );
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia" as any,
    appInfo: {
      name: "LoomNotes AI",
      version: "0.1.0",
    },
    typescript: true,
  });

  return stripeInstance;
}
