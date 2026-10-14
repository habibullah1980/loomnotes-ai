import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SupportChatWidget } from "@/components/support/support-chat-widget";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://loomnotes.ai";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LoomNotesAI - AI Meeting Notes, Summaries & Action Items",
    template: "%s | LoomNotesAI",
  },
  description:
    "LoomNotesAI transforms your meeting recordings and transcripts into concise summaries, key decisions, and actionable tasks — automatically with Google Gemini AI.",
  keywords: [
    "LoomNotesAI",
    "loomnotesai",
    "loom notes ai",
    "meeting summary AI",
    "action items extractor",
    "Gemini AI meetings",
    "video transcript summary",
    "async meeting notes",
    "NDA signing",
    "video compressor",
  ],
  authors: [{ name: "LoomNotesAI Team" }],
  creator: "LoomNotesAI",
  publisher: "LoomNotesAI",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "LoomNotesAI - AI Meeting Notes, Summaries & Action Items",
    description:
      "Transform meeting conversations and recordings into structured summaries, key decisions, and action items with LoomNotesAI.",
    url: appUrl,
    siteName: "LoomNotesAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomNotesAI - AI Meeting Notes, Summaries & Action Items",
    description:
      "Transform meeting conversations into structured summaries, key decisions, and action items with LoomNotesAI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('loomnotes_theme');
                const isDark = storedTheme === 'dark' || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#4b49ac] selection:text-white transition-colors"
      >
        <GoogleAnalytics />
        <ThemeProvider>
          {children}
          <SupportChatWidget />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
