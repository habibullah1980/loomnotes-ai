"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { logActivityEvent } from "@/lib/analytics/events";

export type AuthState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action for User Signup
 * Collects required full name, email, password and optional phone, company, marketing consent.
 */
export async function signupAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Optional profile fields
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim() || null;
  const companyName = (formData.get("companyName") as string)?.trim() || null;
  
  // Marketing consent
  const rawConsent = formData.get("marketingConsent");
  const marketingConsent = rawConsent === "on" || rawConsent === "true";
  const marketingConsentAt = marketingConsent ? new Date().toISOString() : null;

  // Validation
  if (!fullName) {
    return { error: "Please enter your full name." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please provide a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase client is not configured." };
  }

  const userMetadata = {
    full_name: fullName,
    phone_number: phoneNumber,
    company_name: companyName,
    marketing_consent: marketingConsent,
    marketing_consent_at: marketingConsentAt,
    role: "user",
    plan: "free",
  };

  // Attempt user creation with auto-confirmation if admin client is available
  const adminClient = createAdminSupabaseClient();
  let userId: string | null = null;

  if (adminClient) {
    const { data: adminUser, error: adminError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

    if (adminError) {
      if (adminError.message.includes("already registered")) {
        return { error: "An account with this email address already exists." };
      }
      return { error: adminError.message };
    }

    userId = adminUser?.user?.id || null;
  } else {
    // Fallback standard signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    userId = signUpData?.user?.id || null;
  }

  // Sign in to establish secure session cookies
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        signInError.message ||
        "Account created, but could not automatically log in. Please log in manually.",
    };
  }

  // Ensure profile record is created and profile fields stored
  if (userId) {
    const profilePayload: any = {
      id: userId,
      full_name: fullName,
      avatar_url: null,
      phone_number: phoneNumber,
      company_name: companyName,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsentAt,
      role: "user",
      plan: "free",
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from("profiles").upsert(profilePayload);
    if (upsertError) {
      // Graceful fallback if any new columns are absent from schema cache
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });
    }

    // Log signup activity event
    await logActivityEvent({
      userId,
      eventType: "signup",
      metadata: {
        fullName,
        hasPhone: Boolean(phoneNumber),
        hasCompany: Boolean(companyName),
        marketingConsent,
      },
    });
  }

  redirect("/dashboard");
}

/**
 * Server Action for User Login
 */
export async function loginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  let email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your username/email and password." };
  }

  // Support login with username (e.g. habibullah1980) or full email
  if (!email.includes("@")) {
    email = `${email}@gmail.com`;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase client is not configured." };
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (signInData?.user) {
    await logActivityEvent({
      userId: signInData.user.id,
      eventType: "login",
      metadata: { email },
    });
  }

  redirect("/dashboard");
}

/**
 * Server Action for User Logout
 */
export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await logActivityEvent({
        userId: user.id,
        eventType: "logout",
      });
    }
    await supabase.auth.signOut();
  }
  redirect("/login");
}

/**
 * Server Action: Updates user profile settings (name, phone, company, marketing consent)
 */
export async function updateUserProfileAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim() || null;
  const companyName = (formData.get("companyName") as string)?.trim() || null;
  const rawConsent = formData.get("marketingConsent");
  const marketingConsent = rawConsent === "on" || rawConsent === "true";

  if (!fullName) {
    return { error: "Full name is required." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase client not configured." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to update your profile." };
  }

  // Update user auth metadata
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone_number: phoneNumber,
      company_name: companyName,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    },
  });

  // Update profiles row in database
  const profilePayload: any = {
    id: user.id,
    full_name: fullName,
    phone_number: phoneNumber,
    company_name: companyName,
    marketing_consent: marketingConsent,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload);

  if (profileError) {
    // Graceful fallback if additional columns not present
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    });
  }

  // Log activity event
  await logActivityEvent({
    userId: user.id,
    eventType: "marketing_consent_updated",
    metadata: {
      fullName,
      phoneNumber,
      companyName,
      marketingConsent,
    },
  });

  return { success: true };
}

/**
 * Server Action: Sends password reset instructions
 * Privacy-preserving: Always returns success message to avoid account enumeration
 */
export async function forgotPasswordAction(
  _prevState: { error?: string; message?: string } | null,
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please provide a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Authentication service is not available." };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectTo = `${appUrl}/reset-password`;

  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  } catch (err) {
    console.error("Password reset request error:", err);
  }

  return {
    message:
      "If an account with that email address exists, a password reset link has been sent.",
  };
}

/**
 * Server Action: Updates user password after clicking reset link
 */
export async function resetPasswordAction(
  _prevState: { error?: string; message?: string } | null,
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Authentication service is not available." };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=Your password has been reset successfully. Please sign in.");
}

