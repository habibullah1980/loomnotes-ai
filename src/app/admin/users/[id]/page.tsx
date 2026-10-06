import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminUserDetail } from "@/lib/admin/admin-service";
import { getActivityFeed } from "@/lib/admin/activity-service";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminUserDetailView } from "@/components/admin/admin-user-detail-view";

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "User Profile Detail - Super Admin - LoomNotes AI",
  description: "360-degree user profile, quick stats, live activity feed, and permission control.",
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;

  // Strict Server Guard: Requires 'users.view' permission
  const authContext = await requirePermission("users.view");

  const [userDetail, activityRes] = await Promise.all([
    getAdminUserDetail(id),
    getActivityFeed({ userId: id, limit: 100 }),
  ]);

  if (!userDetail) {
    notFound();
  }

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
      <AdminUserDetailView
        user={userDetail}
        activityItems={activityRes.items}
        currentUserRole={authContext.role}
      />
    </AdminLayoutShell>
  );
}
