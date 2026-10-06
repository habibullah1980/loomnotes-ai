import React from "react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminRole, Permission } from "@/lib/admin/permissions";

interface AdminLayoutShellProps {
  user: {
    email: string;
    fullName?: string;
    role: AdminRole;
    permissions: Permission[];
  };
  children: React.ReactNode;
}

export function AdminLayoutShell({ user, children }: AdminLayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        user={{
          email: user.email,
          fullName: user.fullName || "Admin",
          role: user.role,
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AdminSidebar
          userRole={user.role}
          effectivePermissions={user.permissions}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
