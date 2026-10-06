import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
    default: "LoomNotes AI - Turn Every Meeting Into Clear Action",
    template: "%s | LoomNotes AI",
  },
  description:
    "LoomNotes AI transforms your meeting conversations into concise summaries, key decisions, and actionable tasks — automatically with Google Gemini.",
  keywords: [
    "Loom notes",
    "meeting summary AI",
    "action items extractor",
    "Gemini AI meetings",
    "video transcript summary",
    "async meeting notes",
  ],
  authors: [{ name: "LoomNotes AI Team" }],
  openGraph: {
    title: "LoomNotes AI - Turn Every Meeting Into Clear Action",
    description:
      "Transform meeting conversations and Loom recordings into structured summaries, key decisions, and action items automatically with Google Gemini.",
    url: appUrl,
    siteName: "LoomNotes AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomNotes AI - Turn Every Meeting Into Clear Action",
    description:
      "Transform meeting conversations into structured summaries, key decisions, and action items with Google Gemini.",
  },
  robots: {
    index: true,
    follow: true,
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
        className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
