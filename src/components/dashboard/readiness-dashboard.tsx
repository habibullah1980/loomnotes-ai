import {
  Layers,
  Database,
  Sparkles,
  CheckCircle2,
  FolderTree,
  Terminal,
  FileCode2,
  ShieldCheck,
  Video,
  ListTodo,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ReadinessDashboard() {
  const foundationPillars = [
    {
      title: "Next.js App Router",
      badge: "Active",
      badgeVariant: "success" as const,
      icon: Layers,
      description: "Powered by Next.js & React with modern server/client component boundaries and file-based routing.",
      details: ["App Router architecture", "React 19 support", "Server-Side & Client ready"],
    },
    {
      title: "Strict TypeScript",
      badge: "Configured",
      badgeVariant: "success" as const,
      icon: FileCode2,
      description: "End-to-end type safety covering Loom video entities, transcripts, AI summaries, and database schemas.",
      details: ["@/types domain models", "Strict compiler flags", "Path aliases (@/*) configured"],
    },
    {
      title: "Tailwind CSS Design System",
      badge: "Active",
      badgeVariant: "success" as const,
      icon: ShieldCheck,
      description: "Responsive, mobile-first design system with custom utility styling and dark/light mode balance.",
      details: ["Tailwind CSS v4 engine", "Utility class mergers (cn)", "Modular UI components"],
    },
    {
      title: "Supabase Integration Ready",
      badge: "Prepared",
      badgeVariant: "default" as const,
      icon: Database,
      description: "Architecture stubs and environment configs in place for PostgreSQL database and authentication.",
      details: ["src/lib/supabase/client.ts", "src/lib/supabase/server.ts", "Database typings ready"],
    },
    {
      title: "Google Gemini API Ready",
      badge: "Prepared",
      badgeVariant: "default" as const,
      icon: Sparkles,
      description: "Dedicated AI module with prompt templates, type contracts, and processing service abstractions.",
      details: ["src/lib/gemini/prompts.ts", "Structured output schemas", "Safe client instantiation"],
    },
    {
      title: "Scalable Folder Structure",
      badge: "Organized",
      badgeVariant: "success" as const,
      icon: FolderTree,
      description: "Clean separation of concerns designed to scale smoothly as features, routes, and auth are added.",
      details: ["components/ (ui, common, dashboard)", "lib/ (supabase, gemini, utils)", "types/ and config/ directories"],
    },
  ];

  const plannedWorkflow = [
    {
      step: "01",
      icon: Video,
      title: "Input Loom Link",
      desc: "User pastes a Loom recording URL or uploads a video reference.",
    },
    {
      step: "02",
      icon: Sparkles,
      title: "Gemini AI Analysis",
      desc: "AI extracts transcripts, generates key takeaways, timestamps, and action items.",
    },
    {
      step: "03",
      icon: Database,
      title: "Supabase Persistence",
      desc: "Structured notes and user workspaces are securely saved and synced.",
    },
    {
      step: "04",
      icon: ListTodo,
      title: "Search & Collaborate",
      desc: "Team searches, exports, and tracks action items with video timestamp navigation.",
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Project Foundation Successfully Initialized</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
          LoomNotes AI
        </h1>
        <p className="text-lg text-zinc-600">
          Turn Loom video recordings into clear, structured summaries, key takeaways, and actionable tasks with AI.
        </p>
      </section>

      {/* Foundation Pillars Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Foundation Architecture & Setup
          </h2>
          <span className="text-xs text-zinc-500">Step 1 Completed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundationPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="hover:border-zinc-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={pillar.badgeVariant}>{pillar.badge}</Badge>
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-xs text-zinc-600">
                    {pillar.details.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Planned Pipeline & Architecture Preview */}
      <section className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            LoomNotes AI Pipeline Blueprint
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Planned execution flow prepared for the subsequent Supabase and Gemini API integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plannedWorkflow.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-xl border border-zinc-200 bg-white p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {item.step}
                  </span>
                  <Icon className="h-4 w-4 text-zinc-500" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Developer Environment & Command Reference */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-500" />
          Quick Start Command
        </h3>
        <p className="text-sm text-zinc-600">
          To run this project locally in development mode:
        </p>
        <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 text-sm font-mono text-zinc-100 shadow-inner overflow-x-auto">
          <code>npm run dev</code>
          <span className="text-xs text-zinc-500 ml-4">Starts at http://localhost:3000</span>
        </div>
      </section>
    </div>
  );
}
