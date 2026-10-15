/**
 * Site configuration and navigation structure for LoomNotesAI
 */

export const siteConfig = {
  name: "LoomNotesAI",
  description:
    "AI-powered meeting intelligence platform that turns Loom recordings and video transcripts into concise summaries, key decisions, and actionable tasks automatically.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://loomnotes.ai",
  links: {
    github: "https://github.com",
    docs: "/#how-it-works",
    supportEmail: "support@loomnotes.ai",
  },
  navItems: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
};
