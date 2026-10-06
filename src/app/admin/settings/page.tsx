import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Cpu, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Settings - Super Admin - LoomNotes AI",
  description: "Global system parameters, AI model configuration, and platform environment info.",
};

export default async function AdminSettingsPage() {
  const authContext = await requirePermission("settings.manage");

  const displayName =
    authContext.profile?.full_name || authContext.user.email?.split("@")[0] || "Admin";

  return (
    <AdminLayoutShell
      user={{
        email: authContext.user.email || "",
        fullName: displayName,
        role: authContext.role,
        permissions: authContext.permissions,
      }}
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 text-xs font-bold">
                <Settings className="h-3.5 w-3.5 mr-1" />
                System Configuration
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                Environment: Production
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform &amp; Engine Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review AI model connections, database persistence, authentication safeguards, and growth tiers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Configuration */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>AI Model Pipeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Primary Model</span>
                <span className="font-semibold text-slate-900 dark:text-white">Google Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Structured Output</span>
                <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">JSON Schema Enforced</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">API Key Storage</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">Server-Side Environment Only</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Processing Mode</span>
                <span className="text-slate-700 dark:text-slate-300">Multi-Section Meeting Extraction</span>
              </div>
            </CardContent>
          </Card>

          {/* Database & Security */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Database &amp; Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Database Engine</span>
                <span className="font-semibold text-slate-900 dark:text-white">Supabase PostgreSQL 15+</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Row-Level Security (RLS)</span>
                <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Active &amp; Enforced</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Authentication</span>
                <span className="text-slate-700 dark:text-slate-300">Email/Password + Google OAuth</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Growth Plan Allowance</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">100% Free Unlimited Early Access</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
