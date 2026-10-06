import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminPrivilegedClient } from "@/lib/admin/admin-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminMeetingsView } from "@/components/admin/admin-meetings-view";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Meetings Oversight - Super Admin - LoomNotes AI",
  description: "Global inspection of AI meeting notes, summaries, and action items across all workspaces.",
};

export default async function AdminMeetingsPage() {
  const authContext = await requirePermission("meetings.view");
  const adminClient = getAdminPrivilegedClient();

  const [meetingsRes, usersRes, profilesRes] = await Promise.all([
    adminClient.from("meetings").select("id, user_id, title, summary, created_at").order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("id, full_name"),
  ]);

  const rawMeetings = meetingsRes.data || [];
  const authUsers = usersRes.data?.users || [];
  const profiles = (profilesRes.data as any[]) || [];

  const userMap = new Map<string, { name: string; email: string }>();
  profiles.forEach((p) => userMap.set(p.id, { name: p.full_name || "User", email: "" }));
  authUsers.forEach((u) => {
    const existing = userMap.get(u.id);
    userMap.set(u.id, {
      name: (u.user_metadata?.full_name as string) || existing?.name || u.email?.split("@")[0] || "User",
      email: u.email || "",
    });
  });

  const formattedMeetings = rawMeetings.map((m) => {
    const user = userMap.get(m.user_id);
    return {
      id: m.id,
      userId: m.user_id,
      userName: user?.name || "Workspace User",
      userEmail: user?.email || "",
      title: m.title,
      summary: m.summary,
      createdAt: m.created_at,
      actionItemsCount: 0,
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
              <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 text-xs font-bold">
                <Video className="h-3.5 w-3.5 mr-1" />
                Global Meetings
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {formattedMeetings.length} Total Meetings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Meeting Notes Oversight
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inspect AI-generated notes, summaries, and transcripts created across all accounts.
            </p>
          </div>
        </div>

        <AdminMeetingsView meetings={formattedMeetings} />
      </div>
    </AdminLayoutShell>
  );
}
