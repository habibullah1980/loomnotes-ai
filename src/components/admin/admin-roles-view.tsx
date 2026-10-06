"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AdminRole,
  ROLE_DEFINITIONS,
  ALL_PERMISSIONS,
} from "@/lib/admin/permissions";
import { AdminUserRecord } from "@/lib/admin/admin-service";
import { adminUpdateUserRoleAction } from "@/app/actions/admin";

interface AdminRolesViewProps {
  adminUsers: AdminUserRecord[];
}

export function AdminRolesView({ adminUsers }: AdminRolesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [targetRole, setTargetRole] = useState<AdminRole>("user");
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEdit = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setCustomPermissions(user.customPermissions || []);
    setErrorMsg(null);
  };

  const handleToggleCustomPerm = (permId: string) => {
    if (customPermissions.includes(permId)) {
      setCustomPermissions(customPermissions.filter((p) => p !== permId));
    } else {
      setCustomPermissions([...customPermissions, permId]);
    }
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    startTransition(async () => {
      setErrorMsg(null);
      const res = await adminUpdateUserRoleAction(
        selectedUser.id,
        targetRole,
        customPermissions
      );

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSelectedUser(null);
        showToast("Role and permissions updated successfully.");
        router.refresh();
      }
    });
  };

  const rolesList: AdminRole[] = ["super_admin", "admin", "support", "analyst", "user"];

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 text-xs sm:text-sm font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. ROLE DEFINITIONS MATRIX */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Role &amp; Permission Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Permission Name</th>
                  {rolesList.map((r) => (
                    <th key={r} className="py-2.5 px-3 font-semibold text-center capitalize">
                      {r.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {perm.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{perm.id}</span>
                      </div>
                    </td>
                    {rolesList.map((r) => {
                      const hasPerm =
                        r === "super_admin" ||
                        ROLE_DEFINITIONS[r].permissions.includes(perm.id);
                      return (
                        <td key={r} className="py-2 px-3 text-center">
                          {hasPerm ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. ADMINISTRATIVE USERS DIRECTORY */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Privileged Admin Accounts ({adminUsers.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Effective Permissions</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={
                          user.role === "super_admin"
                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            : user.role === "admin"
                            ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            : user.role === "support"
                            ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                            : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        }
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={
                          user.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {user.role === "super_admin"
                          ? "Universal Full Control (13/13)"
                          : `${user.effectivePermissions.length} permissions active`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* EDIT ROLE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Manage Role: {selectedUser.name}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">{errorMsg}</div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">System Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as AdminRole)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="super_admin">Super Administrator (Full universal control)</option>
                  <option value="admin">Administrator (Management, exports, settings)</option>
                  <option value="support">Customer Support (User assistance &amp; meetings)</option>
                  <option value="analyst">Data Analyst (Read-only analytics &amp; marketing)</option>
                  <option value="user">Standard User (Demote to normal workspace)</option>
                </select>
              </div>

              {targetRole !== "super_admin" && targetRole !== "user" && (
                <div className="space-y-2 pt-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-200">Custom Permission Overrides</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customPermissions.includes(perm.id)}
                          onChange={() => handleToggleCustomPerm(perm.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 mt-0.5 cursor-pointer"
                        />
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {perm.label}
                          </span>
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
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save Role & Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
