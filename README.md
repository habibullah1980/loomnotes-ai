# LoomNotes AI

**AI-powered meeting notes, summaries, and action-item management.**

LoomNotes AI transforms meeting transcripts into structured notes using Google's Gemini AI. It helps teams capture key takeaways, decisions, action items, and follow-up questions in one workspace.

## Features

- **AI Meeting Summaries** — Generate structured summaries from meeting transcripts.
- **Action Items** — Extract tasks, assignees, and due dates.
- **Key Takeaways & Decisions** — Organize important meeting outcomes.
- **Follow-up Questions** — Identify questions requiring further discussion.
- **Meeting History** — Save and revisit previously processed meetings.
- **Loom Integration Support** — Associate Loom URLs with meeting records.
- **Authentication** — User signup, login, password reset, and session management.
- **Admin Dashboard** — Administrative tools for user management, permissions, analytics, and audit logs.
- **Usage Tracking** — Track monthly AI meeting generation activity.

## Technology Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Authentication and PostgreSQL
- Google Gemini AI
- Tailwind CSS 4
- Vercel deployment

## Getting Started

### Requirements

- Node.js compatible with your installed Next.js version
- npm
- A Supabase project
- A Google Gemini API key

### Installation

Clone the repository:

```bash
git clone https://github.com/habibullah1980/loomnotes-ai.git
cd loomnotes-ai
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables using the names documented in `.env.example` and the corresponding service documentation. Never commit real API keys or credentials.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:verify` | Verify database connectivity |
| `npm run test:auth` | Run authentication tests |
| `npm run test:admin` | Run admin authorization tests |
| `npm run test:e2e` | Run end-to-end test script |

Some test scripts require a configured `.env.local` and access to a test database. Review each script before running it against production.

## Deployment

The application can be deployed to Vercel with a configured Supabase project and Gemini API credentials.

Before deployment:

1. Configure all required environment variables.
2. Apply the database migrations.
3. Verify authentication and Row Level Security policies.
4. Run the production build.
5. Test the deployed authentication and meeting workflows.

See `DEPLOYMENT.md` for project-specific deployment instructions.

## Security

- Keep service-role keys and API credentials server-side.
- Never commit `.env.local` or production secrets.
- Verify database Row Level Security policies before production use.
- Restrict administrative operations to authorized administrators.
- Test account isolation and access controls before handling real customer data.

## Project Status

LoomNotes AI is an actively prepared software asset. Some functionality may require further development, testing, or configuration before production use.

Review the current implementation and test results before relying on individual features.

## License and Ownership

License terms and ownership-transfer arrangements should be confirmed by the current owner before redistribution or acquisition.

## Contact

For product information or acquisition inquiries, contact the project owner.
