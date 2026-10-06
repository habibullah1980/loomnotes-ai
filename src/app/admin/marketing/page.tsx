import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminPrivilegedClient } from "@/lib/admin/admin-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminMarketingView } from "@/components/admin/admin-marketing-view";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Intelligence - Super Admin - LoomNotes AI",
  description: "Subscriber opt-in status, acquisition sources, and privacy-compliant marketing contacts.",
};

export default async function AdminMarketingPage() {
  const authContext = await requirePermission("marketing.view");
  const adminClient = getAdminPrivilegedClient();

  const [authRes, profilesRes] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("*"),
  ]);

  const authUsers = authRes.data?.users || [];
  const profiles = (profilesRes.data as any[]) || [];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  let optInCount = 0;
  const subscribers = authUsers.map((u) => {
    const p = profileMap.get(u.id);
    const isSubscribed = p?.marketing_consent ?? Boolean(u.user_metadata?.marketing_consent);
    if (isSubscribed) optInCount++;

    return {
      id: u.id,
      name: p?.full_name || (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User",
      email: u.email || "",
      company: p?.company_name || (u.user_metadata?.company_name as string) || null,
      phone: p?.phone_number || (u.user_metadata?.phone_number as string) || null,
      consentDate: p?.marketing_consent_at || (u.user_metadata?.marketing_consent_at as string) || null,
      signupDate: u.created_at,
      isSubscribed,
    };
  });

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
              <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 text-xs font-bold">
                <Megaphone className="h-3.5 w-3.5 mr-1" />
                Marketing &amp; Subscribers
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {optInCount} Subscribed Contacts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Marketing Opt-In Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review user consent preferences, attribution sources, and download privacy-compliant subscriber lists.
            </p>
          </div>
        </div>

        <AdminMarketingView
          subscribers={subscribers}
          optInCount={optInCount}
          totalCount={subscribers.length}
        />
      </div>
    </AdminLayoutShell>
  );
}
