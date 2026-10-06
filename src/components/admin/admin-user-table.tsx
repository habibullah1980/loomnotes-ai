"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Phone,
  Building2,
  Video,
  CheckCircle2,
  XCircle,
  X,
  UserPlus,
  Download,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminUserRecord } from "@/lib/admin/admin-service";
import { AdminRole } from "@/lib/admin/permissions";
import {
  adminCreateUserAction,
  adminToggleUserStatusAction,
  adminDeleteUserAction,
  adminExportUsersCSVAction,
  adminUpdateUserAction,
} from "@/app/actions/admin";

interface AdminUserTableProps {
  users: AdminUserRecord[];
  currentUserRole?: AdminRole;
}

export function AdminUserTable({ users, currentUserRole = "super_admin" }: AdminUserTableProps) {
  const [isPending, startTransition] = useTransition();

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [marketingFilter, setMarketingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "meetings" | "name" | "activity">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<AdminUserRecord | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUserRecord | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter & Sort Pipeline
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Role Filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // Marketing Filter
    if (marketingFilter === "subscribed") {
      result = result.filter((u) => u.marketingConsent);
    } else if (marketingFilter === "unsubscribed") {
      result = result.filter((u) => !u.marketingConsent);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        cmp = new Date(a.signupDate).getTime() - new Date(b.signupDate).getTime();
      } else if (sortBy === "meetings") {
        cmp = a.meetingsCount - b.meetingsCount;
      } else if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === "activity") {
        cmp = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [users, searchQuery, roleFilter, statusFilter, marketingFilter, sortBy, sortOrder]);

  // Handlers
  const handleExportCSV = async () => {
    startTransition(async () => {
      const res = await adminExportUsersCSVAction();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `loomnotes_users_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("User directory exported to CSV successfully.");
      } else {
        showToast(res.error || "Failed to export CSV.");
      }
    });
  };

  const handleToggleStatus = (user: AdminUserRecord) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    startTransition(async () => {
      const res = await adminToggleUserStatusAction(user.id, nextStatus);
      if (res.success) {
        showToast(`User ${user.email} is now ${nextStatus}.`);
      } else {
        showToast(res.error || "Failed to change status.");
      }
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    if (deleteConfirmationInput !== deleteTargetUser.email) {
      setDeleteError("Email confirmation does not match exactly.");
      return;
    }

    startTransition(async () => {
      const res = await adminDeleteUserAction(deleteTargetUser.id);
      if (res.success) {
        setDeleteTargetUser(null);
        setDeleteConfirmationInput("");
        setDeleteError(null);
        showToast(`User ${deleteTargetUser.email} has been permanently deleted.`);
      } else {
        setDeleteError(res.error || "Failed to delete user.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 text-xs sm:text-sm font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, company, or phone..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1220] py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Create User + Export CSV */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="support">Support</option>
            <option value="analyst">Analyst</option>
            <option value="user">Users</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Marketing Filter */}
          <select
            value={marketingFilter}
            onChange={(e) => setMarketingFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Marketing</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="date">Signup Date</option>
            <option value="meetings">Meeting Count</option>
            <option value="activity">Last Active</option>
            <option value="name">Name</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle sort direction"
          >
            {sortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Contact &amp; Org</th>
                <th className="py-3 px-4 font-semibold">Role &amp; Status</th>
                <th className="py-3 px-4 font-semibold">Meetings</th>
                <th className="py-3 px-4 font-semibold">Marketing</th>
                <th className="py-3 px-4 font-semibold">Activity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No users match the current search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {user.name}
                        </Link>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[180px]">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* Contact & Company */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {user.company ? (
                          <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {user.company}
                          </span>
                        ) : null}
                        {user.phone ? (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">No phone</span>
                        )}
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          className={
                            user.role === "super_admin"
                              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : user.role === "admin"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : user.role === "support"
                              ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                              : user.role === "analyst"
                              ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }
                        >
                          {user.role.replace("_", " ")}
                        </Badge>

                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]"
                              : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-[10px]"
                          }
                        >
                          {user.status === "active" ? "Active" : "Suspended"}
                        </Badge>
                      </div>
                    </td>

                    {/* Meetings Count */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {user.meetingsCount}
                        </span>
                      </div>
                    </td>

                    {/* Marketing Consent */}
                    <td className="py-3 px-4">
                      {user.marketingConsent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Subscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <XCircle className="h-3.5 w-3.5" />
                          No
                        </span>
                      )}
                    </td>

                    {/* Activity */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
                        <span>Joined {new Date(user.signupDate).toLocaleDateString()}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Active {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/${user.id}`}
                          title="View 360 Profile"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          title="Edit Profile"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === "active" ? "Suspend Account" : "Reactivate Account"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.status === "active"
                              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          }`}
                        >
                          {user.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>

                        {currentUserRole === "super_admin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetUser(user);
                              setDeleteConfirmationInput("");
                              setDeleteError(null);
                            }}
                            title="Delete User (Super Admin)"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create User Account
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300">
                {createError}
              </div>
            )}

            <form
              action={async (formData: FormData) => {
                startTransition(async () => {
                  setCreateError(null);
                  const res = await adminCreateUserAction(null, formData);
                  if (res.error) {
                    setCreateError(res.error);
                  } else {
                    setIsCreateModalOpen(false);
                    showToast("User created successfully.");
                  }
                });
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@company.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Company Name
                  </label>
                  <input
                    name="company"
                    type="text"
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {currentUserRole === "super_admin" && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    System Role
                  </label>
                  <select
                    name="role"
                    defaultValue="user"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="user">Standard User</option>
                    <option value="analyst">Data Analyst</option>
                    <option value="support">Customer Support</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="create-marketing"
                  name="marketingConsent"
                  type="checkbox"
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="create-marketing"
                  className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer"
                >
                  User granted consent for marketing communications
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit User: {editUser.name}
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5 text-xs text-red-700 dark:text-red-300">
                {editError}
              </div>
            )}

            <form
              action={async (formData: FormData) => {
                startTransition(async () => {
                  setEditError(null);
                  const res = await adminUpdateUserAction(editUser.id, formData);
                  if (res.error) {
                    setEditError(res.error);
                  } else {
                    setEditUser(null);
                    showToast("User profile updated.");
                  }
                });
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={editUser.name}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Company
                </label>
                <input
                  name="company"
                  type="text"
                  defaultValue={editUser.company || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editUser.phone || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="edit-marketing"
                  name="marketingConsent"
                  type="checkbox"
                  defaultChecked={editUser.marketingConsent}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="edit-marketing" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  Marketing consent subscribed
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1220] border border-red-200 dark:border-red-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold">Permanently Delete User</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              This action is <strong>strictly irreversible</strong>. Deleting{" "}
              <strong>{deleteTargetUser.email}</strong> will permanently remove all their
              profile data, meetings, AI takeaways, and action items.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Type <span className="font-mono text-red-600 dark:text-red-400">{deleteTargetUser.email}</span> to
                confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={deleteTargetUser.email}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            {deleteError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5 text-xs text-red-700 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isPending || deleteConfirmationInput !== deleteTargetUser.email}
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
