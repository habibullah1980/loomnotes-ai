/**
 * LoomNotesAI Grounded Knowledge Base & Documentation Source
 * Strictly verified against actual LoomNotesAI product features and policies.
 */

export interface KnowledgeArticle {
  id: string;
  topic: string;
  keywords: string[];
  title: string;
  summary: string;
  steps?: string[];
  link?: { label: string; url: string };
  category:
    | "meeting_notes"
    | "loom_extraction"
    | "action_items"
    | "client_crm"
    | "account"
    | "pricing"
    | "privacy"
    | "support";
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "loom-video-extraction",
    topic: "Loom Video Extraction",
    keywords: ["loom", "loom video", "video url", "extract transcript", "loom link", "paste loom", "fetch transcript"],
    title: "How to Extract Notes from a Loom Video",
    summary:
      "LoomNotesAI connects to public Loom video URLs, automatically fetches the spoken transcript, and prepares it for instant Google Gemini AI analysis without requiring manual typing.",
    steps: [
      "Open your workspace and click 'New Meeting' or navigate to /dashboard/new.",
      "In the 'Loom Video' tab, paste any public Loom share link (e.g., https://www.loom.com/share/...).",
      "Click 'Fetch Transcript' to extract the video transcript automatically.",
      "Review the parsed text and click 'Analyze with Gemini AI' to generate structured takeaways in 5 seconds.",
    ],
    link: { label: "Create New Meeting", url: "/dashboard/new" },
    category: "loom_extraction",
  },
  {
    id: "five-part-summary",
    topic: "5-Part AI Meeting Summary",
    keywords: ["summary", "5-part", "structured notes", "takeaways", "decisions", "follow-up questions", "gemini", "executive summary"],
    title: "What is Included in the 5-Part AI Meeting Summary?",
    summary:
      "Every analyzed meeting transcript produces a structured, actionable 5-part dossier powered by Google Gemini AI, free of conversational filler.",
    steps: [
      "1. Executive Summary: High-level overview of core discussions, goals, and outcomes.",
      "2. Key Takeaways: High-value insights, metrics, and technical considerations.",
      "3. Key Decisions: Explicit consensus, agreed approaches, and architectural commitments.",
      "4. Action Items: Concrete tasks mapped with explicit owners, priority levels, and due dates.",
      "5. Follow-up Questions: Unresolved ambiguities and questions that need clarification before implementation.",
    ],
    link: { label: "Analyze a Meeting", url: "/dashboard/new" },
    category: "meeting_notes",
  },
  {
    id: "manual-transcript",
    topic: "Paste Raw Transcripts",
    keywords: ["transcript", "paste transcript", "manual", "zoom", "google meet", "teams", "text notes", "recording text"],
    title: "How to Analyze Transcripts from Zoom, Google Meet, or Teams",
    summary:
      "In addition to Loom videos, LoomNotesAI supports any meeting transcript from Zoom, Google Meet, Microsoft Teams, Otter.ai, or written conversation logs.",
    steps: [
      "Navigate to New Meeting (/dashboard/new).",
      "Select the 'Paste Transcript' tab.",
      "Provide a meeting title and paste your conversation text or raw transcript.",
      "Click 'Analyze with Gemini AI' to produce structured decisions, takeaways, and tasks.",
    ],
    link: { label: "Paste Transcript", url: "/dashboard/new" },
    category: "meeting_notes",
  },
  {
    id: "action-items-hub",
    topic: "Action Items & Task Tracker",
    keywords: ["action items", "tasks", "assignee", "due date", "checkbox", "hub", "completed tasks", "todo", "task tracker"],
    title: "How to Track and Manage Meeting Action Items",
    summary:
      "All action items detected across your meetings are aggregated in an interactive Action Items Hub. You can view tasks by meeting, filter by assignee, and check off items as they are completed.",
    steps: [
      "Visit the Action Items Hub (/dashboard/action-items) from the sidebar.",
      "View tasks organized with assignee badges, priority tags, and deadline indicators.",
      "Click the interactive checkbox next to any task to toggle its completion status.",
      "Meeting stats, completion percentages, and dashboard widgets update in real time.",
    ],
    link: { label: "Open Action Items Hub", url: "/dashboard/action-items" },
    category: "action_items",
  },
  {
    id: "meeting-history",
    topic: "Meeting History & Search",
    keywords: ["meeting history", "search meetings", "archive", "past meetings", "find notes", "filter meetings", "repository"],
    title: "How to Search and Access Past Meeting Notes",
    summary:
      "All your processed meetings and AI summaries are permanently stored in your secure Supabase repository. You can search by meeting title, date, or topics at any time.",
    steps: [
      "Navigate to Meeting History (/dashboard/meetings).",
      "Use the search field to filter past sessions by meeting title, date, or discussion keywords.",
      "Click any meeting card to view its full 5-part summary, transcript, and decisions.",
      "Use one-click export buttons to copy markdown notes or client email summaries.",
    ],
    link: { label: "View Meeting History", url: "/dashboard/meetings" },
    category: "meeting_notes",
  },
  {
    id: "client-crm-followups",
    topic: "Client CRM & Follow-ups Cadence",
    keywords: ["clients", "follow-ups", "crm", "cadence", "touchpoint", "email template", "client follow up", "relationships"],
    title: "How to Manage Client Relationships and Follow-up Workflows",
    summary:
      "LoomNotesAI includes dedicated Client Directory and Follow-ups tools to help freelancers and teams maintain regular communication cadences and track client commitments.",
    steps: [
      "Navigate to Clients Directory (/clients) to view profiles, engagement history, and active milestones.",
      "Open Follow-ups (/follow-ups) to see scheduled touchpoints, draft reminders, and overdue outreach.",
      "Convert meeting takeaways into polished client email updates with one click.",
    ],
    link: { label: "Open Clients Directory", url: "/clients" },
    category: "client_crm",
  },
  {
    id: "pricing-early-access",
    topic: "100% Free Early Access & Pricing",
    keywords: ["pricing", "cost", "free", "early access", "subscription", "plans", "credit card", "price", "tier"],
    title: "LoomNotesAI Pricing & Early Access Free Tier",
    summary:
      "LoomNotesAI is currently 100% free in Technical Preview / Early Access. All registered users enjoy unlimited AI meeting generations with zero fees and no credit card required.",
    steps: [
      "Early Access Free Tier ($0/month): Unlimited AI meeting generations, automatic Loom transcript fetching, 5-part structured notes, Action Items Hub, and Client CRM.",
      "No credit card is required to sign up or create meetings.",
      "Pro ($15/mo) and Business ($39/mo) tiers will offer advanced team collaboration and centralized administration in upcoming releases.",
      "Enterprise teams can contact support@loomnotes.ai for custom integration needs.",
    ],
    link: { label: "View Pricing Section", url: "/#pricing" },
    category: "pricing",
  },
  {
    id: "account-registration",
    topic: "Account Registration & Verification",
    keywords: ["register", "signup", "verify", "email verification", "create account", "login", "password reset", "google login"],
    title: "How to Register and Verify Your LoomNotesAI Account",
    summary:
      "Signing up takes under 30 seconds. We support secure email & password registration as well as one-click Google OAuth sign-in.",
    steps: [
      "Visit Sign Up (/signup) and enter your name, work email, and password (minimum 6 characters), or click 'Continue with Google'.",
      "Check your inbox for a verification email link if using email registration.",
      "Click the verification link to activate full workspace access.",
      "If you ever forget your password, use Forgot Password (/forgot-password) to receive a secure reset link.",
    ],
    link: { label: "Create Free Account", url: "/signup" },
    category: "account",
  },
  {
    id: "privacy-security",
    topic: "Privacy, File Retention & Data Security",
    keywords: ["privacy", "security", "gdpr", "retention", "tls", "encryption", "rls", "supabase", "is my data safe", "train ai"],
    title: "Privacy, Data Security & AI Model Training Policy",
    summary:
      "Your meeting conversations and transcripts are private to you. LoomNotesAI implements strict PostgreSQL Row Level Security (RLS), TLS 1.3 encryption in transit, and never uses your proprietary meeting content to train public AI models.",
    steps: [
      "Private by Default: Row Level Security guarantees that only you can access your meetings and tasks.",
      "No Model Training: Your transcripts and meeting notes will never be used to train public Google Gemini models.",
      "Full Data Ownership: You can delete any meeting or transcript permanently from your dashboard at any time.",
    ],
    link: { label: "Read Privacy Policy", url: "/privacy" },
    category: "privacy",
  },
  {
    id: "contact-support",
    topic: "Contact Customer Support",
    keywords: ["support", "help", "contact", "email support", "human", "talk to human", "ticket", "issue", "assistance"],
    title: "How to Contact LoomNotesAI Customer Support",
    summary:
      "Need help with an account, bug report, or feature request? Our engineering and support team is standing by.",
    steps: [
      "Email our support team directly at support@loomnotes.ai.",
      "Open your workspace Settings (/settings) to update account profile details.",
      "Typical support response time is within 4-8 business hours.",
    ],
    link: { label: "Contact Support", url: "mailto:support@loomnotes.ai" },
    category: "support",
  },
];

/**
 * Searches knowledge base for articles matching a user query.
 */
export function searchKnowledgeBase(query: string): KnowledgeArticle[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return KNOWLEDGE_ARTICLES.slice(0, 4);

  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  const scored = KNOWLEDGE_ARTICLES.map((article) => {
    let score = 0;
    const combinedText = `${article.topic} ${article.title} ${article.summary} ${article.keywords.join(" ")}`.toLowerCase();

    for (const word of words) {
      if (article.keywords.some((k) => k.includes(word))) score += 5;
      if (article.topic.toLowerCase().includes(word)) score += 4;
      if (article.title.toLowerCase().includes(word)) score += 3;
      if (combinedText.includes(word)) score += 1;
    }

    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);
}

/**
 * Formats knowledge articles into a concise context block for AI system prompts.
 */
export function buildGroundedKnowledgeContext(): string {
  return KNOWLEDGE_ARTICLES.map((a) => {
    const stepsStr = a.steps ? a.steps.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n") : "";
    const linkStr = a.link ? ` [Link: ${a.link.label} -> ${a.link.url}]` : "";
    return `### ${a.title} (${a.topic})${linkStr}\nSummary: ${a.summary}\n${stepsStr ? `Steps:\n${stepsStr}` : ""}`;
  }).join("\n\n");
}
