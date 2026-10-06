import "server-only";
import { getAdminPrivilegedClient } from "./admin-service";
import { AdminRole } from "./permissions";

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface UserActivityCohorts {
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  inactive: number;
}

export interface CountryItem {
  country: string;
  count: number;
}

export interface AdminAnalyticsChartsData {
  // Raw 365-day time series for client-side date slicing
  userRegistrationsSeries: TimeSeriesPoint[];
  meetingsSeries: TimeSeriesPoint[];

  // Role Breakdown
  userTypeDistribution: DistributionItem[];
  totalUsersCount: number;

  // Marketing Consent
  marketingConsentDistribution: DistributionItem[];
  marketingOptInPercentage: number;
  marketingOptInCount: number;
  marketingTotalCount: number;

  // Activity Cohorts
  userActivityCohorts: UserActivityCohorts;

  // Traffic Sources
  trafficSourcesDistribution: DistributionItem[];
  hasTrafficData: boolean;

  // Devices
  deviceDistribution: DistributionItem[];
  hasDeviceData: boolean;

  // Country / Region (Top 10)
  countryDistribution: CountryItem[];
  hasCountryData: boolean;

  // High-level totals
  totalMeetingsCount: number;
}

/**
 * Server-side Aggregator: Fetches live data from Supabase Auth, profiles, meetings, and events.
 * Executes in a single parallel batch without redundant queries.
 */
export async function getAdminAnalyticsChartsData(): Promise<AdminAnalyticsChartsData> {
  const adminClient = getAdminPrivilegedClient();

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  
  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const weekStartIso = weekStart.toISOString();

  const monthStart = new Date();
  monthStart.setUTCDate(monthStart.getUTCDate() - 30);
  const monthStartIso = monthStart.toISOString();

  // 1. Fetch raw data in parallel
  const [authRes, profilesRes, meetingsRes, eventsRes] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("*"),
    adminClient.from("meetings").select("id, user_id, created_at"),
    adminClient.from("activity_events").select("*"),
  ]);

  const authUsers = authRes.data?.users || [];
  const profiles = (profilesRes.data as any[]) || [];
  const meetings = meetingsRes.data || [];
  const events = (eventsRes.data as any[]) || [];

  const profileMap = new Map<string, any>();
  profiles.forEach((p) => profileMap.set(p.id, p));

  // 2. Build 365-day date series map
  const userRegistrationCountByDate = new Map<string, number>();
  const meetingCountByDate = new Map<string, number>();

  for (let i = 365; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    userRegistrationCountByDate.set(dateStr, 0);
    meetingCountByDate.set(dateStr, 0);
  }

  authUsers.forEach((u) => {
    const dStr = u.created_at.split("T")[0];
    if (userRegistrationCountByDate.has(dStr)) {
      userRegistrationCountByDate.set(dStr, (userRegistrationCountByDate.get(dStr) || 0) + 1);
    }
  });

  meetings.forEach((m) => {
    const dStr = m.created_at.split("T")[0];
    if (meetingCountByDate.has(dStr)) {
      meetingCountByDate.set(dStr, (meetingCountByDate.get(dStr) || 0) + 1);
    }
  });

  const userRegistrationsSeries: TimeSeriesPoint[] = Array.from(
    userRegistrationCountByDate.entries()
  ).map(([date, count]) => ({ date, count }));

  const meetingsSeries: TimeSeriesPoint[] = Array.from(
    meetingCountByDate.entries()
  ).map(([date, count]) => ({ date, count }));

  // 3. User Type Distribution (Roles)
  const roleCounts: Record<AdminRole, number> = {
    super_admin: 0,
    admin: 0,
    support: 0,
    analyst: 0,
    user: 0,
  };

  authUsers.forEach((u) => {
    const p = profileMap.get(u.id);
    let role: AdminRole = "user";
    if (p?.role) {
      role = p.role as AdminRole;
    } else if (u.email === "habibullah1980@gmail.com") {
      role = "super_admin";
    } else if (u.user_metadata?.role) {
      role = u.user_metadata.role as AdminRole;
    }

    if (roleCounts[role] !== undefined) {
      roleCounts[role]++;
    } else {
      roleCounts.user++;
    }
  });

  const totalUsersCount = authUsers.length;
  const userTypeDistribution: DistributionItem[] = [
    {
      name: "Super Admin",
      value: roleCounts.super_admin,
      percentage: totalUsersCount > 0 ? Math.round((roleCounts.super_admin / totalUsersCount) * 100) : 0,
      fill: "#8B5CF6", // Purple
    },
    {
      name: "Admin",
      value: roleCounts.admin,
      percentage: totalUsersCount > 0 ? Math.round((roleCounts.admin / totalUsersCount) * 100) : 0,
      fill: "#2563EB", // Primary Blue
    },
    {
      name: "Support",
      value: roleCounts.support,
      percentage: totalUsersCount > 0 ? Math.round((roleCounts.support / totalUsersCount) * 100) : 0,
      fill: "#0D9488", // Teal
    },
    {
      name: "Analyst",
      value: roleCounts.analyst,
      percentage: totalUsersCount > 0 ? Math.round((roleCounts.analyst / totalUsersCount) * 100) : 0,
      fill: "#6366F1", // Indigo
    },
    {
      name: "Regular User",
      value: roleCounts.user,
      percentage: totalUsersCount > 0 ? Math.round((roleCounts.user / totalUsersCount) * 100) : 0,
      fill: "#94A3B8", // Slate
    },
  ].filter((item) => item.value > 0);

  // 4. Marketing Consent Distribution
  let marketingOptInCount = 0;
  let marketingOptOutCount = 0;

  authUsers.forEach((u) => {
    const p = profileMap.get(u.id);
    const consent = p?.marketing_consent ?? Boolean(u.user_metadata?.marketing_consent);
    if (consent) {
      marketingOptInCount++;
    } else {
      marketingOptOutCount++;
    }
  });

  const marketingTotalCount = marketingOptInCount + marketingOptOutCount;
  const marketingOptInPercentage =
    marketingTotalCount > 0
      ? Math.round((marketingOptInCount / marketingTotalCount) * 100)
      : 0;

  const marketingConsentDistribution: DistributionItem[] = [
    {
      name: "Opted In",
      value: marketingOptInCount,
      percentage: marketingOptInPercentage,
      fill: "#0D9488", // Teal
    },
    {
      name: "Not Opted In",
      value: marketingOptOutCount,
      percentage: 100 - marketingOptInPercentage,
      fill: "#CBD5E1", // Slate Light
    },
  ];

  // 5. User Activity Cohorts (Active Today, Active This Week, Active This Month, Inactive)
  const userLatestActivity = new Map<string, string>();

  meetings.forEach((m) => {
    const existing = userLatestActivity.get(m.user_id);
    if (!existing || new Date(m.created_at) > new Date(existing)) {
      userLatestActivity.set(m.user_id, m.created_at);
    }
  });

  events.forEach((e) => {
    if (e.user_id) {
      const existing = userLatestActivity.get(e.user_id);
      if (!existing || new Date(e.created_at) > new Date(existing)) {
        userLatestActivity.set(e.user_id, e.created_at);
      }
    }
  });

  authUsers.forEach((u) => {
    const existing = userLatestActivity.get(u.id);
    const signInDate = u.last_sign_in_at;
    if (signInDate && (!existing || new Date(signInDate) > new Date(existing))) {
      userLatestActivity.set(u.id, signInDate);
    }
  });

  let activeToday = 0;
  let activeThisWeek = 0;
  let activeThisMonth = 0;
  let inactive = 0;

  authUsers.forEach((u) => {
    const latest = userLatestActivity.get(u.id);
    if (!latest) {
      inactive++;
    } else {
      const d = new Date(latest);
      if (d >= new Date(todayStart)) {
        activeToday++;
      } else if (d >= new Date(weekStartIso)) {
        activeThisWeek++;
      } else if (d >= new Date(monthStartIso)) {
        activeThisMonth++;
      } else {
        inactive++;
      }
    }
  });

  const userActivityCohorts: UserActivityCohorts = {
    activeToday,
    activeThisWeek,
    activeThisMonth,
    inactive,
  };

  // 6. Traffic Sources Breakdown
  const trafficCounts = new Map<string, number>();
  events.forEach((e) => {
    let src = e.utm_source;
    if (!src && e.referrer) {
      try {
        src = new URL(e.referrer).hostname.replace("www.", "");
      } catch {
        src = e.referrer;
      }
    }
    if (src) {
      trafficCounts.set(src, (trafficCounts.get(src) || 0) + 1);
    }
  });

  // Also inspect profile referral_source / utm_source
  profiles.forEach((p) => {
    const src = p.utm_source || p.referral_source;
    if (src) {
      trafficCounts.set(src, (trafficCounts.get(src) || 0) + 1);
    }
  });

  const hasTrafficData = trafficCounts.size > 0;
  const trafficTotal = Array.from(trafficCounts.values()).reduce((a, b) => a + b, 0) || 1;

  const trafficColors = ["#2563EB", "#0D9488", "#8B5CF6", "#F59E0B", "#64748B"];
  const trafficSourcesDistribution: DistributionItem[] = Array.from(trafficCounts.entries())
    .map(([name, value], i) => ({
      name,
      value,
      percentage: Math.round((value / trafficTotal) * 100),
      fill: trafficColors[i % trafficColors.length],
    }))
    .sort((a, b) => b.value - a.value);

  // 7. Device Breakdown
  const deviceCounts = new Map<string, number>();
  events.forEach((e) => {
    if (e.device_category) {
      const dev = e.device_category.charAt(0).toUpperCase() + e.device_category.slice(1);
      deviceCounts.set(dev, (deviceCounts.get(dev) || 0) + 1);
    }
  });

  const hasDeviceData = deviceCounts.size > 0;
  const deviceTotal = Array.from(deviceCounts.values()).reduce((a, b) => a + b, 0) || 1;
  const deviceColors: Record<string, string> = {
    Desktop: "#2563EB",
    Mobile: "#0D9488",
    Tablet: "#8B5CF6",
  };

  const deviceDistribution: DistributionItem[] = Array.from(deviceCounts.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / deviceTotal) * 100),
      fill: deviceColors[name] || "#64748B",
    }))
    .sort((a, b) => b.value - a.value);

  // 8. Country / Region (Top 10)
  const countryCounts = new Map<string, number>();
  events.forEach((e) => {
    if (e.country) {
      countryCounts.set(e.country, (countryCounts.get(e.country) || 0) + 1);
    }
  });

  const hasCountryData = countryCounts.size > 0;
  const countryDistribution: CountryItem[] = Array.from(countryCounts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    userRegistrationsSeries,
    meetingsSeries,
    userTypeDistribution,
    totalUsersCount,
    marketingConsentDistribution,
    marketingOptInPercentage,
    marketingOptInCount,
    marketingTotalCount,
    userActivityCohorts,
    trafficSourcesDistribution,
    hasTrafficData,
    deviceDistribution,
    hasDeviceData,
    countryDistribution,
    hasCountryData,
    totalMeetingsCount: meetings.length,
  };
}
