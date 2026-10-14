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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pdfkitfree.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FreePDFKit - All-in-One Free PDF Tools, Video Compressor & NDA Signing",
    template: "%s | FreePDFKit",
  },
  description:
    "Free online PDF tools to merge, split, compress, convert, edit, and protect PDFs. Features video compressor, electronic NDA signing, and AI document chat with bank-grade security.",
  keywords: [
    "FreePDFKit",
    "pdfkitfree",
    "merge pdf free",
    "split pdf",
    "compress pdf online",
    "convert pdf to word",
    "video compressor free",
    "sign nda online",
    "ai document chat",
    "gemini pdf analyzer",
    "electronic signature pdf",
  ],
  authors: [{ name: "FreePDFKit Team" }],
  creator: "FreePDFKit",
  publisher: "FreePDFKit",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "FreePDFKit - All-in-One Free PDF Tools, Video Compressor & NDA Signing",
    description:
      "Merge, split, compress, convert, and protect PDFs online. Includes video compression, e-signing NDAs, and Gemini AI document chat.",
    url: appUrl,
    siteName: "FreePDFKit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreePDFKit - All-in-One Free PDF Tools & Video Compressor",
    description:
      "Merge, split, compress, convert, edit PDFs and sign NDAs online with FreePDFKit.",
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
