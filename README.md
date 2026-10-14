# FreePDFKit (pdfkitfree)

**All-in-One Free PDF Tools, Video Compressor & Electronic NDA Signing SaaS**

FreePDFKit provides high-performance document tools, meeting summaries, video compression, and electronic contract signing with bank-grade security, PostgreSQL Row Level Security (RLS), and Google Gemini AI intelligence.

---

## 🌟 Core Features

- **PDF Processing Suite**: Merge, split, compress, convert (PDF to Word/Excel/Image, Image to PDF), annotate, and password-protect PDFs.
- **Video Compressor**: Shrink large MP4, WebM, and MOV video recordings for easy sharing and email delivery.
- **Electronic NDA Signing**: Create standard mutual NDAs or upload agreements, place signature fields, draw/type e-signatures, and download signed contracts with digital audit trails.
- **AI Document & Meeting Chat**: Extract executive summaries, decisions, and action items powered by Google Gemini.
- **Customer Support Chatbot**: Persistent floating AI & grounded knowledge assistant answering tool questions, pricing details, and troubleshooting.
- **Google Analytics 4 (GA4)**: Privacy-safe, PII-free event tracking with user consent management.
- **Technical SEO**: Canonical URLs, Open Graph / Twitter Cards, XML Sitemap, Robots.txt, and JSON-LD structured data.
- **Super Admin Console**: Comprehensive user management, audit logging, system analytics, and permission roles.

---

## 🎨 Brand Design Tokens

The application strictly preserves the brand identity:
- **Primary Indigo**: `#4b49ac`
- **Sky Blue**: `#98dbff`
- **Periwinkle**: `#7DA0FA`
- **Slate Purple**: `#7978e3`
- **Soft Coral**: `#f3797e`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project (URL and anon key)
- Google Gemini API key (optional for AI streaming; falls back to grounded knowledge engine)

### Installation

```bash
git clone https://github.com/habibullah1980/loomnotes-ai.git
cd loomnotes-ai
npm install
```

### Environment Variables

Configure `.env.local`:

```env
# Application URL
NEXT_PUBLIC_APP_URL="https://pdfkitfree.com"

# Supabase Auth & Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Google Analytics 4 (GA4)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Search Console Verification (Optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="your-verification-code"
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001).

---

## 📊 Google Analytics 4 Configuration

1. Obtain your **Measurement ID** (format: `G-XXXXXXXXXX`) from your Google Analytics 4 Admin property settings.
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"` to `.env.local` or your Vercel project environment settings.
3. The tracking system operates under strict privacy constraints:
   - **No PII is ever transmitted**: Email addresses, passwords, document contents, and personal names are scrubbed.
   - **Consent-aware**: Tracking is queued until the user grants analytics consent via the banner.
   - **Development isolated**: In non-production environments, events are logged cleanly to the console for testing.

---

## 🤖 Customer Support Chatbot

The support chatbot widget is globally accessible on all pages:
- Grounded in `/src/lib/support/knowledge-base.ts`.
- Server-side rate limited to prevent denial-of-service.
- Secure fallback when AI credentials are not configured.
- Escalation path directly to `support@pdfkitfree.com`.

---

## 🔍 Quality Assurance & Testing

```bash
# Typecheck and production build
npm run build

# Run linting
npm run lint

# Verify database connection
npm run db:verify

# End-to-end integration flow
npm run test:e2e
```

---

## 🛡️ License & Credits

Design and Developed by [HThinkers.com](https://hthinkers.com).  
© 2026 FreePDFKit. All rights reserved.
