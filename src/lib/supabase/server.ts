import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";
import { Database } from "./types";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 */
export async function createServerSupabaseClient() {
  if (!supabaseConfig.isConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Ignored if middleware or route handlers manage cookie refreshing.
          }
        },
      },
    }
  );
}
