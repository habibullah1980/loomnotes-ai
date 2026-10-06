import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMonthlyUsage } from "@/lib/usage/usage-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Settings, ShieldCheck, ChevronRight, User, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Account Settings - LoomNotes AI",
  description: "Manage your account profile, preferences, and workspace settings.",
};

export default async function DashboardSettingsPage() {
  const { user, profile, role, isSuperAdmin } = await requireUser();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login");
  }

  const usage = await getMonthlyUsage(supabase, user.id);

  const fullName = profile?.full_name || user.user_metadata?.full_name || "";
  const phoneNumber = profile?.phone_number || user.user_metadata?.phone_number || null;
  const companyName = profile?.company_name || user.user_metadata?.company_name || null;
  const marketingConsent = profile?.marketing_consent ?? user.user_metadata?.marketing_consent ?? false;

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        fullName: fullName || user.email?.split("@")[0] || "User",
        role: role,
      }}
      usage={usage}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb & Header */}
        <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-medium">Settings</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your personal details, workspace preferences, and product updates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                {isSuperAdmin ? "Super Admin" : "Standard User"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <SettingsForm
          user={{
            id: user.id,
            email: user.email || "",
            fullName,
            phoneNumber,
            companyName,
            marketingConsent,
            role,
          }}
        />
      </div>
    </DashboardShell>
  );
}
