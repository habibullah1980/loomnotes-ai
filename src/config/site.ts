/**
 * Site configuration and navigation structure for FreePDFKit
 */

export const siteConfig = {
  name: "FreePDFKit",
  description:
    "All-in-one free online PDF tools to merge, split, compress, and convert documents, plus video compression, electronic NDA signing, and AI document chat.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://pdfkitfree.com",
  links: {
    github: "https://github.com",
    docs: "/#features",
    supportEmail: "support@pdfkitfree.com",
  },
  navItems: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
};
