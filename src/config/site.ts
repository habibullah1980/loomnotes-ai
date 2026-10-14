/**
 * Site configuration and navigation structure for LoomNotesAI
 */

export const siteConfig = {
  name: "LoomNotesAI",
  description:
    "All-in-one AI platform for meeting intelligence, document summaries, video compression, electronic NDA signing, and actionable task management.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://loomnotes.ai",
  links: {
    github: "https://github.com",
    docs: "/#features",
    supportEmail: "support@loomnotes.ai",
  },
  navItems: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
};
