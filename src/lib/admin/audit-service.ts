import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getPrivilegedClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration for audit logging.");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type AdminAuditAction =
  | "user_created"
  | "user_updated"
  | "user_suspended"
  | "user_reactivated"
  | "user_deleted"
  | "role_changed"
  | "permission_changed"
  | "meeting_deleted"
  | "data_exported"
  | "settings_changed";

export interface AuditLogEntry {
  actorId: string;
  actorEmail: string;
  action: AdminAuditAction | string;
  targetId?: string | null;
  targetType: "user" | "meeting" | "permission" | "system";
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export interface AdminAuditRecord {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_id: string | null;
  target_type: string;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

/**
 * Records an immutable administrative action into the audit log.
 */
export async function logAdminAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const client = getPrivilegedClient();
    const { error } = await client.from("admin_audit_logs").insert({
      actor_id: entry.actorId,
      actor_email: entry.actorEmail,
      action: entry.action,
      target_id: entry.targetId || null,
      target_type: entry.targetType,
      details: entry.details || {},
      ip_address: entry.ipAddress || null,
    });
    if (error && error.code !== "PGRST205" && !error.message?.includes("schema cache")) {
      console.warn("Audit log insert notice:", error.message || error);
    }
  } catch {
    // Graceful fallback if audit table is pending migration
  }
}

/**
 * Retrieves audit logs with optional filtering.
 */
export async function getAdminAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  actorEmail?: string;
}): Promise<{ logs: AdminAuditRecord[]; total: number }> {
  const client = getPrivilegedClient();
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;

  let query = client
    .from("admin_audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.action && options.action !== "all") {
    query = query.eq("action", options.action);
  }

  if (options?.actorEmail) {
    query = query.ilike("actor_email", `%${options.actorEmail}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    // If the table has not yet been migrated in Supabase, return empty list gracefully
    if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
      return { logs: [], total: 0 };
    }
    console.warn("Audit logs query notice:", error.message || error);
    return { logs: [], total: 0 };
  }

  const formattedLogs: AdminAuditRecord[] = (data || []).map((row) => ({
    id: row.id,
    actor_id: row.actor_id,
    actor_email: row.actor_email,
    action: row.action,
    target_id: row.target_id,
    target_type: row.target_type,
    details: (row.details as Record<string, any>) || {},
    ip_address: row.ip_address,
    created_at: row.created_at,
  }));

  return { logs: formattedLogs, total: count || 0 };
}
