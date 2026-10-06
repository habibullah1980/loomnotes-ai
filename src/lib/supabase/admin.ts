import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import { Database } from "./types";

/**
 * Creates an administrative Supabase client using the service role key.
 * Used exclusively on the server (e.g. Server Actions, Route Handlers) for privileged tasks.
 */
export function createAdminSupabaseClient() {
  if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
    return null;
  }

  return createClient<Database>(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
