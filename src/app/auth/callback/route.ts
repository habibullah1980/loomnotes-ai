import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";
import { Database } from "@/lib/supabase/types";

/**
 * OAuth Callback Route Handler
 * Exchanges OAuth authorization code for a Supabase session and sets cookies.
 * Automatically provisions user profile while strictly preserving permissions & roles.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  // Safe redirect path handling to prevent open-redirect vulnerabilities
  let next = requestUrl.searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  const origin = requestUrl.origin;

  // Handle explicit OAuth errors from the provider
  if (error) {
    const message = errorDescription || error || "Google sign-in was canceled or failed.";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("No authorization code provided.")}`
    );
  }

  if (!supabaseConfig.isConfigured) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Authentication service is not configured.")}`
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
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
            // Handled safely in Route Handler
          }
        },
      },
    }
  );

  // Exchange authorization code for a valid Supabase Auth session
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.user) {
    console.error("OAuth code exchange error:", exchangeError);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        exchangeError?.message || "Failed to exchange authorization code for session."
      )}`
    );
  }

  const user = data.user;

  try {
    // 1. Check if user already has a profile record
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    // Extract metadata from Google OAuth provider payload
    const rawFullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split("@")[0] : "Google User");
    const rawAvatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    if (!existingProfile) {
      // 2. Automatically create new profile for first-time Google sign-ins
      // Default: standard user permissions, never automatically grant super_admin
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: rawFullName,
        avatar_url: rawAvatarUrl,
        updated_at: new Date().toISOString(),
      });
    } else {
      // 3. Update profile avatar / name if previously empty, preserving all existing permissions
      const updates: { full_name?: string; avatar_url?: string; updated_at: string } = {
        updated_at: new Date().toISOString(),
      };

      if (!existingProfile.full_name && rawFullName) {
        updates.full_name = rawFullName;
      }
      if (!existingProfile.avatar_url && rawAvatarUrl) {
        updates.avatar_url = rawAvatarUrl;
      }

      if (updates.full_name || updates.avatar_url) {
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
      }
    }
  } catch (err) {
    // Non-blocking profile sync error: user session is established
    console.warn("Profile sync warning during OAuth callback:", err);
  }

  // Handle environment-aware redirect (e.g. behind proxy/custom domain or local)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    return NextResponse.redirect(`${origin}${next}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
