/**
 * Site configuration and navigation structure for LoomNotes AI
 */

export const siteConfig = {
  name: "LoomNotes AI",
  description:
    "Transform Loom video recordings into executive summaries, action items, and searchable knowledge using Google Gemini & Supabase.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com",
    docs: "/docs",
  },
  navItems: [
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Roadmap", href: "#roadmap" },
  ],
};
