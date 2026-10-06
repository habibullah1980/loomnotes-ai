import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";
import { AdminRole, Permission, getEffectivePermissions } from "./permissions";
import { getCurrentMonthKey, getMonthDateRange } from "@/lib/usage/usage-service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminPrivilegedClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration for Super Admin service.");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  signupDate: string;
  meetingsCount: number;
  lastActive: string;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  role: AdminRole;
  status: "active" | "suspended";
  customPermissions: string[];
  effectivePermissions: Permission[];
}

export interface AdminMetrics {
  // 1. User Overview
  totalUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  activeUsers: number;
  superAdminCount: number;
  suspendedCount: number;

  // 2. Product Usage
  totalMeetings: number;
  meetingsThisMonth: number;
  loomVideosProcessed: number;
  aiGenerations: number;
  currentMonth: string;

  // 3. Marketing
  marketingOptInsCount: number;

  // 4. User Directory
  users: AdminUserRecord[];
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: AdminRole;
  status: "active" | "suspended";
  customPermissions: string[];
  effectivePermissions: Permission[];
  signupDate: string;
  lastActive: string;
  lastSignInAt: string | null;

  // Marketing
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  referralSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;

  // Product Usage
  totalMeetings: number;
  meetingsThisMonth: number;
  loomVideosProcessed: number;
  aiGenerations: number;
  actionItemsCreatedCount: number;
  actionItemsCompletedCount: number;

  // Activity & Device
  sessionCount: number;
  deviceCategory: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  recentActivity: {
    id: string;
    eventType: string;
    metadata: Record<string, any>;
    createdAt: string;
  }[];

  // User Meetings List
  meetings: {
    id: string;
    title: string;
    summary: string | null;
    createdAt: string;
    actionItemCount: number;
  }[];
}

/**
 * Fetches aggregated growth metrics and detailed user directory for the Super Admin dashboard.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const adminClient = getAdminPrivilegedClient();
  const currentMonthKey = getCurrentMonthKey();
  const { startIso: monthStartIso, endIso: monthEndIso } = getMonthDateRange(currentMonthKey);

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();

  // Fetch auth users, profiles, and all meetings
  const [authUsersRes, profilesRes, meetingsRes] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
    adminClient
      .from("meetings")
      .select("id, user_id, title, summary, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const authUsers = authUsersRes.data?.users || [];
  const profiles = (profilesRes.data as any[]) || [];
  const allMeetings = meetingsRes.data || [];

  // Map meeting counts and latest activity per user
  const userMeetingCounts = new Map<string, number>();
  const userLatestMeetingDate = new Map<string, string>();

  allMeetings.forEach((m) => {
    userMeetingCounts.set(m.user_id, (userMeetingCounts.get(m.user_id) || 0) + 1);
    const existingLatest = userLatestMeetingDate.get(m.user_id);
    if (!existingLatest || new Date(m.created_at) > new Date(existingLatest)) {
      userLatestMeetingDate.set(m.user_id, m.created_at);
    }
  });

  // Build profile lookup map
  const profileMap = new Map<string, any>();
  profiles.forEach((p) => {
    profileMap.set(p.id, p);
  });

  // Construct complete user records
  const userRecords: AdminUserRecord[] = authUsers.map((u) => {
    const profile = profileMap.get(u.id);

    const name =
      profile?.full_name ||
      (u.user_metadata?.full_name as string) ||
      (u.user_metadata?.name as string) ||
      u.email?.split("@")[0] ||
      "User";

    const phone =
      profile?.phone_number ||
      (u.user_metadata?.phone_number as string) ||
      u.phone ||
      null;

    const company =
      profile?.company_name ||
      (u.user_metadata?.company_name as string) ||
      null;

    const marketingConsent =
      profile?.marketing_consent ??
      Boolean(u.user_metadata?.marketing_consent);

    const marketingConsentAt =
      profile?.marketing_consent_at ||
      (u.user_metadata?.marketing_consent_at as string) ||
      null;

    let role: AdminRole = "user";
    if (profile?.role) {
      role = profile.role as AdminRole;
    } else if (u.email === "habibullah1980@gmail.com") {
      role = "super_admin";
    } else if (u.user_metadata?.role) {
      role = u.user_metadata.role as AdminRole;
    }

    const status: "active" | "suspended" = (profile?.status as any) || "active";
    const customPermissions = (profile?.custom_permissions as string[]) || [];
    const effectivePermissions = getEffectivePermissions(role, customPermissions);

    const meetingsCount = userMeetingCounts.get(u.id) || 0;

    // Last active determination
    const latestMeeting = userLatestMeetingDate.get(u.id);
    const lastSignIn = u.last_sign_in_at;
    const updatedAt = profile?.updated_at || u.created_at;

    const dates = [latestMeeting, lastSignIn, updatedAt, u.created_at]
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime());

    const maxTime = dates.length > 0 ? Math.max(...dates) : new Date(u.created_at).getTime();
    const lastActive = new Date(maxTime).toISOString();

    return {
      id: u.id,
      name,
      email: u.email || "",
      phone,
      company,
      signupDate: u.created_at,
      meetingsCount,
      lastActive,
      marketingConsent,
      marketingConsentAt,
      role,
      status,
      customPermissions,
      effectivePermissions,
    };
  });

  // Calculate high-level metrics
  const totalUsers = userRecords.length;

  const newUsersToday = userRecords.filter(
    (u) => new Date(u.signupDate) >= new Date(todayStartIso)
  ).length;

  const newUsersThisMonth = userRecords.filter(
    (u) => new Date(u.signupDate) >= new Date(monthStartIso) && new Date(u.signupDate) < new Date(monthEndIso)
  ).length;

  const activeUsers = userRecords.filter((u) => u.meetingsCount > 0).length;
  const superAdminCount = userRecords.filter((u) => u.role === "super_admin").length;
  const suspendedCount = userRecords.filter((u) => u.status === "suspended").length;

  const totalMeetings = allMeetings.length;
  const meetingsThisMonth = allMeetings.filter(
    (m) => m.created_at >= monthStartIso && m.created_at < monthEndIso
  ).length;

  const loomVideosProcessed = totalMeetings;
  const aiGenerations = totalMeetings;
  const marketingOptInsCount = userRecords.filter((u) => u.marketingConsent).length;

  // Sort user directory newest signup first
  userRecords.sort(
    (a, b) => new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime()
  );

  return {
    totalUsers,
    newUsersToday,
    newUsersThisMonth,
    activeUsers,
    superAdminCount,
    suspendedCount,
    totalMeetings,
    meetingsThisMonth,
    loomVideosProcessed,
    aiGenerations,
    currentMonth: currentMonthKey,
    marketingOptInsCount,
    users: userRecords,
  };
}

/**
 * Fetches full 360-degree user detail for `/admin/users/[id]`.
 */
export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const adminClient = getAdminPrivilegedClient();
  const currentMonthKey = getCurrentMonthKey();
  const { startIso: monthStartIso, endIso: monthEndIso } = getMonthDateRange(currentMonthKey);

  // Parallel fetching of auth user, profile, meetings, activity events, and action items
  const [authUserRes, profileRes, meetingsRes, eventsRes, actionItemsRes] = await Promise.all([
    adminClient.auth.admin.getUserById(userId),
    adminClient.from("profiles").select("*").eq("id", userId).maybeSingle(),
    adminClient
      .from("meetings")
      .select("id, title, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    adminClient
      .from("activity_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminClient
      .from("action_items")
      .select("id, meeting_id, completed"),
  ]);

  const authUser = authUserRes.data?.user;
  if (!authUser) {
    return null;
  }

  const profile = profileRes.data as any;
  const meetings = meetingsRes.data || [];
  const events = eventsRes.data || [];
  const actionItems = actionItemsRes.data || [];

  // Match action items to user's meetings
  const userMeetingIds = new Set(meetings.map((m) => m.id));
  const userActionItems = actionItems.filter((a) => userMeetingIds.has(a.meeting_id));
  const actionItemsCreatedCount = userActionItems.length;
  const actionItemsCompletedCount = userActionItems.filter((a) => a.completed).length;

  const meetingActionCounts = new Map<string, number>();
  userActionItems.forEach((a) => {
    meetingActionCounts.set(a.meeting_id, (meetingActionCounts.get(a.meeting_id) || 0) + 1);
  });

  const name =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string) ||
    (authUser.user_metadata?.name as string) ||
    authUser.email?.split("@")[0] ||
    "User";

  const phone =
    profile?.phone_number ||
    (authUser.user_metadata?.phone_number as string) ||
    authUser.phone ||
    null;

  const company =
    profile?.company_name ||
    (authUser.user_metadata?.company_name as string) ||
    null;

  let role: AdminRole = "user";
  if (profile?.role) {
    role = profile.role as AdminRole;
  } else if (authUser.email === "habibullah1980@gmail.com") {
    role = "super_admin";
  } else if (authUser.user_metadata?.role) {
    role = authUser.user_metadata.role as AdminRole;
  }

  const status: "active" | "suspended" = (profile?.status as any) || "active";
  const customPermissions = (profile?.custom_permissions as string[]) || [];
  const effectivePermissions = getEffectivePermissions(role, customPermissions);

  const totalMeetings = meetings.length;
  const meetingsThisMonth = meetings.filter(
    (m) => m.created_at >= monthStartIso && m.created_at < monthEndIso
  ).length;

  // Session & Device Info from events / metadata
  const latestEventWithDevice = events.find((e) => e.device_category || e.browser || e.country);
  const deviceCategory = latestEventWithDevice?.device_category || "Desktop";
  const browser = latestEventWithDevice?.browser || "Chrome";
  const country = latestEventWithDevice?.country || "United States";
  const city = latestEventWithDevice?.city || null;

  const sessionCount = Math.max(
    events.filter((e) => e.event_type === "login" || e.event_type === "page_view").length,
    1
  );

  // Determine last active
  const latestMeeting = meetings[0]?.created_at;
  const lastSignIn = authUser.last_sign_in_at;
  const latestEvent = events[0]?.created_at;
  const dates = [latestMeeting, lastSignIn, latestEvent, profile?.updated_at, authUser.created_at]
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime());
  const maxTime = dates.length > 0 ? Math.max(...dates) : new Date(authUser.created_at).getTime();
  const lastActive = new Date(maxTime).toISOString();

  const formattedMeetings = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    summary: m.summary,
    createdAt: m.created_at,
    actionItemCount: meetingActionCounts.get(m.id) || 0,
  }));

  const formattedEvents = events.map((e) => ({
    id: e.id,
    eventType: e.event_type,
    metadata: (e.metadata as Record<string, any>) || {},
    createdAt: e.created_at,
  }));

  return {
    id: authUser.id,
    name,
    email: authUser.email || "",
    phone,
    company,
    role,
    status,
    customPermissions,
    effectivePermissions,
    signupDate: authUser.created_at,
    lastActive,
    lastSignInAt: authUser.last_sign_in_at || null,
    marketingConsent: profile?.marketing_consent ?? Boolean(authUser.user_metadata?.marketing_consent),
    marketingConsentAt: profile?.marketing_consent_at || (authUser.user_metadata?.marketing_consent_at as string) || null,
    referralSource: profile?.referral_source || (authUser.user_metadata?.referral_source as string) || null,
    utmSource: profile?.utm_source || null,
    utmMedium: profile?.utm_medium || null,
    utmCampaign: profile?.utm_campaign || null,
    totalMeetings,
    meetingsThisMonth,
    loomVideosProcessed: totalMeetings,
    aiGenerations: totalMeetings,
    actionItemsCreatedCount,
    actionItemsCompletedCount,
    sessionCount,
    deviceCategory,
    browser,
    country,
    city,
    recentActivity: formattedEvents,
    meetings: formattedMeetings,
  };
}
