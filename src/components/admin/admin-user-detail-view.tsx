"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Sparkles,
  CheckSquare,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
  KeyRound,
  AlertTriangle,
  ExternalLink,
  X,
  Compass,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  Video,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminUserDetail } from "@/lib/admin/admin-service";
import { ActivityFeedItem } from "@/lib/admin/activity-service";
import { AdminRole, ALL_PERMISSIONS } from "@/lib/admin/permissions";
import {
  adminUpdateUserAction,
  adminToggleUserStatusAction,
  adminDeleteUserAction,
  adminUpdateUserRoleAction,
} from "@/app/actions/admin";

interface AdminUserDetailViewProps {
  user: AdminUserDetail;
  activityItems?: ActivityFeedItem[];
  currentUserRole: AdminRole;
}

export function AdminUserDetailView({
  user,
  activityItems = [],
  currentUserRole,
}: AdminUserDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "meetings">("overview");

  // Modals & Panels
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>(user.role);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.customPermissions);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = () => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    startTransition(async () => {
      const res = await adminToggleUserStatusAction(user.id, nextStatus);
      if (res.success) {
        showToast(`User is now ${nextStatus}.`);
        router.refresh();
      } else {
        showToast(res.error || "Failed to update status.");
      }
    });
  };

  const handleDeleteUser = () => {
    if (deleteConfirmation !== user.email) {
      setDeleteError("Confirmation email does not match.");
      return;
    }

    startTransition(async () => {
      const res = await adminDeleteUserAction(user.id);
      if (res.success) {
        router.push("/admin/users");
      } else {
        setDeleteError(res.error || "Failed to delete user.");
      }
    });
  };

  const handlePermissionToggle = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const openTasksCount = Math.max(0, user.actionItemsCreatedCount - user.actionItemsCompletedCount);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 text-xs sm:text-sm font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                }
              >
                {user.status === "active" ? "Active" : "Suspended"}
              </Badge>
              <Badge className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Edit Profile</span>
          </button>

          {currentUserRole === "super_admin" && (
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-2xs cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Role &amp; Permissions</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              user.status === "active"
                ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
            }`}
          >
            {user.status === "active" ? (
              <>
                <Ban className="h-3.5 w-3.5" />
                <span>Suspend Account</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Reactivate Account</span>
              </>
            )}
          </button>

          {currentUserRole === "super_admin" && (
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation("");
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 7. QUICK STATS PANEL (7 Core Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Total Meetings</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{user.totalMeetings}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">AI Generations</span>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{user.aiGenerations}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Loom Videos</span>
          <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">{user.loomVideosProcessed}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Open Tasks</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openTasksCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Completed Tasks</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{user.actionItemsCompletedCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Login Count</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{user.sessionCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Last Active</span>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 truncate">
            {new Date(user.lastActive).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Overview &amp; Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "activity"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Activity Stream ({activityItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("meetings")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "meetings"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Video className="h-3.5 w-3.5" />
          <span>Meetings ({user.meetings.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROFILE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Profile &amp; Identity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">User ID</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 select-all truncate max-w-[160px]">
                  {user.id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Email</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Phone</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {user.phone || <em className="text-slate-400 dark:text-slate-500">Not provided</em>}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Company</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {user.company || <em className="text-slate-400 dark:text-slate-500">Not provided</em>}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Signup Date</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date(user.signupDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 dark:text-slate-500">Last Active</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date(user.lastActive).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Usage Card */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Product Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Total Meetings</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{user.totalMeetings}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Monthly Meetings</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.meetingsThisMonth}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Loom Processing</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">{user.loomVideosProcessed}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">AI Note Generations</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{user.aiGenerations}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 dark:text-slate-500">Tasks Completed</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {user.actionItemsCompletedCount} / {user.actionItemsCreatedCount}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Marketing & Attribution */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Marketing &amp; Attribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Marketing Consent</span>
                {user.marketingConsent ? (
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Subscribed
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    <XCircle className="h-3 w-3 mr-1" /> Opted Out
                  </Badge>
                )}
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Consent Date</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {user.marketingConsentAt
                    ? new Date(user.marketingConsentAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Referral Source</span>
                <span className="text-slate-700 dark:text-slate-300">{user.referralSource || "Direct / Organic"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Device</span>
                <span className="text-slate-700 dark:text-slate-300">{user.deviceCategory}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 dark:text-slate-500">Approx. Location</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {user.city ? `${user.city}, ` : ""}
                  {user.country}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: LIVE ACTIVITY STREAM (Newest First) */}
      {activeTab === "activity" && (
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>User Activity History</span>
              </div>
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Newest events first</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                No activity records found for this user yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activityItems.map((item) => (
                  <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.eventType === "login" && <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {item.eventType === "signup" && <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                        {item.eventType === "logout" && <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                        {item.eventType === "meeting_created" && <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {item.eventType.includes("ai") && <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                        {item.eventType.includes("loom") && <Video className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                        {item.eventType === "action_item_completed" && <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.displayTitle}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          <span>{item.deviceCategory}</span>
                          <span>•</span>
                          <span>{item.browser}</span>
                          <span>•</span>
                          <span>{item.os}</span>
                          {item.country && (
                            <>
                              <span>•</span>
                              <span>{item.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: USER MEETINGS */}
      {activeTab === "meetings" && (
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Created Meetings ({user.meetings.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.meetings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                This user has not generated any meetings yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {user.meetings.map((m) => (
                  <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{m.title}</h4>
                      {m.summary && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{m.summary}</p>}
                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 pt-0.5">
                        <span>Created {new Date(m.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{m.actionItemCount} action items</span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/meetings/${m.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 shrink-0"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">{editError}</div>
            )}

            <form
              action={async (formData: FormData) => {
                startTransition(async () => {
                  setEditError(null);
                  const res = await adminUpdateUserAction(user.id, formData);
                  if (res.error) {
                    setEditError(res.error);
                  } else {
                    setIsEditModalOpen(false);
                    showToast("Profile updated.");
                    router.refresh();
                  }
                });
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Company</label>
                <input
                  name="company"
                  type="text"
                  defaultValue={user.company || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={user.phone || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="marketing-check"
                  name="marketingConsent"
                  type="checkbox"
                  defaultChecked={user.marketingConsent}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 cursor-pointer"
                />
                <label htmlFor="marketing-check" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  Marketing communications subscribed
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE & PERMISSION MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Role &amp; Permissions
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {roleError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">{roleError}</div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Assign Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="user">Standard User</option>
                  <option value="analyst">Data Analyst</option>
                  <option value="support">Customer Support</option>
                  <option value="admin">Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              {selectedRole !== "super_admin" && selectedRole !== "user" && (
                <div className="space-y-2 pt-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-200">Custom Permission Overrides</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 mt-0.5 cursor-pointer"
                        />
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{perm.label}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px]">{perm.id}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    startTransition(async () => {
                      setRoleError(null);
                      const res = await adminUpdateUserRoleAction(
                        user.id,
                        selectedRole,
                        selectedPermissions
                      );
                      if (res.error) {
                        setRoleError(res.error);
                      } else {
                        setIsRoleModalOpen(false);
                        showToast("Role and permissions updated.");
                        router.refresh();
                      }
                    });
                  }}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1220] border border-red-200 dark:border-red-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold">Permanently Delete User</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              This action will permanently delete <strong>{user.email}</strong>, all their{" "}
              {user.totalMeetings} meetings, and associated data. This cannot be undone.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Type <span className="font-mono text-red-600 dark:text-red-400">{user.email}</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={user.email}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs font-mono"
              />
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">{deleteError}</div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isPending || deleteConfirmation !== user.email}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 cursor-pointer"
              >
                {isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
