import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";
import { Database } from "./types";

/**
 * Creates a Supabase client for browser/client components.
 */
export function createBrowserSupabaseClient() {
  if (!supabaseConfig.isConfigured) {
    return null;
  }

  return createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey
  );
}
