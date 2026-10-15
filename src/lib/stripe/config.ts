/**
 * LoomNotes AI Freemium & Pro Subscription Configuration
 */

export const STRIPE_CONFIG = {
  // Pro Subscription Details
  proPlan: {
    id: "pro",
    name: "LoomNotes AI Pro",
    price: 9.99,
    priceCents: 999, // $9.99 in USD cents
    currency: "usd",
    interval: "month" as const,
    description: "Unlimited video processing, AI summaries, decisions, takeaways, and action items.",
  },

  // Free Tier Limits
  freeTier: {
    id: "free",
    name: "Free Plan",
    maxFreeVideos: 3, // Exactly 3 free videos per registered user
    price: 0,
    description: "Up to 3 free video meeting notes with full Google Gemini AI analysis.",
  },

  // Brand Colors matching LoomNotes AI
  colors: {
    primary: "#4b49ac",
    primaryHover: "#7978e3",
    secondary: "#7DA0FA",
    accent: "#98dbff",
    danger: "#f3797e",
  },
};
