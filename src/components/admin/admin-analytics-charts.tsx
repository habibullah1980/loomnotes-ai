"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Users,
  Video,
  CheckCircle2,
  Compass,
  Laptop,
  Globe,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAnalyticsChartsData } from "@/lib/admin/admin-charts-service";

type DateRangeOption = "7d" | "30d" | "90d" | "year";

interface AdminAnalyticsChartsProps {
  initialData: AdminAnalyticsChartsData;
}

export function AdminAnalyticsCharts({ initialData }: AdminAnalyticsChartsProps) {
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");

  // Filter time series based on selected date range
  const filteredTimeSeries = useMemo(() => {
    let days = 30;
    if (dateRange === "7d") days = 7;
    else if (dateRange === "30d") days = 30;
    else if (dateRange === "90d") days = 90;
    else if (dateRange === "year") days = 365;

    const sliceStart = Math.max(0, initialData.userRegistrationsSeries.length - days);

    const userGrowth = initialData.userRegistrationsSeries.slice(sliceStart);
    const meetingActivity = initialData.meetingsSeries.slice(sliceStart);

    // Merge for dual charting or individual datasets
    const merged = userGrowth.map((u, index) => ({
      date: u.date.slice(5), // MM-DD for clean x-axis
      fullDate: u.date,
      newUsers: u.count,
      meetings: meetingActivity[index]?.count || 0,
    }));

    const totalNewUsersInRange = userGrowth.reduce((acc, curr) => acc + curr.count, 0);
    const totalMeetingsInRange = meetingActivity.reduce((acc, curr) => acc + curr.count, 0);
    const avgMeetingsPerDay = (totalMeetingsInRange / days).toFixed(1);

    return {
      data: merged,
      days,
      totalNewUsersInRange,
      totalMeetingsInRange,
      avgMeetingsPerDay,
    };
  }, [dateRange, initialData]);

  // User Activity Cohorts data format for horizontal bar chart
  const userActivityData = useMemo(() => {
    const cohorts = initialData.userActivityCohorts;
    return [
      { name: "Active Today", count: cohorts.activeToday, fill: "#0D9488" },
      { name: "Active This Week", count: cohorts.activeThisWeek, fill: "#2563EB" },
      { name: "Active This Month", count: cohorts.activeThisMonth, fill: "#6366F1" },
      { name: "Inactive", count: cohorts.inactive, fill: "#94A3B8" },
    ];
  }, [initialData.userActivityCohorts]);

  return (
    <div className="space-y-6">
      {/* Date Range Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xs">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Interactive Analytics Overview
          </span>
        </div>

        {/* Global Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDateRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              dateRange === "7d"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setDateRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              dateRange === "30d"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setDateRange("90d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              dateRange === "90d"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Last 90 days
          </button>
          <button
            type="button"
            onClick={() => setDateRange("year")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              dateRange === "year"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            This year
          </button>
        </div>
      </div>

      {/* ROW 1: TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="hover:border-blue-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Users
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {initialData.totalUsersCount}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              +{filteredTimeSeries.totalNewUsersInRange} in selected period
            </p>
          </CardContent>
        </Card>

        {/* Active Today */}
        <Card className="hover:border-teal-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Today
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {initialData.userActivityCohorts.activeToday}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {initialData.userActivityCohorts.activeThisWeek} active this week
            </p>
          </CardContent>
        </Card>

        {/* Total Meetings */}
        <Card className="hover:border-indigo-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Meetings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Video className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {initialData.totalMeetingsCount}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Avg {filteredTimeSeries.avgMeetingsPerDay} meetings/day
            </p>
          </CardContent>
        </Card>

        {/* Marketing Opt-In Rate */}
        <Card className="hover:border-emerald-500/40 transition-colors shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Marketing Opt-In
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {initialData.marketingOptInPercentage}%
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {initialData.marketingOptInCount} of {initialData.marketingTotalCount} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: USER GROWTH (2/3) + USER TYPE DONUT (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. USER GROWTH — LINE CHART (2/3 width) */}
        <Card className="lg:col-span-2 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>User Growth</span>
              </CardTitle>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">New registered users per day</p>
            </div>
            <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900">
              +{filteredTimeSeries.totalNewUsersInRange} new users
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredTimeSeries.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                    labelFormatter={(label, payload) => {
                      const full = payload?.[0]?.payload?.fullDate;
                      return full ? `Date: ${full}` : label;
                    }}
                    formatter={(value: any) => [`${value} new users`, "Signups"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563EB", r: 3 }}
                    activeDot={{ r: 6, fill: "#1D4ED8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. USER TYPE — DONUT CHART (1/3 width) */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>User Type</span>
            </CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Role proportions across workspace</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={initialData.userTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {initialData.userTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} users (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {initialData.userTypeDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: MEETING ACTIVITY (2/3) + MARKETING CONSENT (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. MEETING ACTIVITY — BAR CHART (2/3 width) */}
        <Card className="lg:col-span-2 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Meeting Activity</span>
              </CardTitle>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Meetings generated per day</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900">
                {filteredTimeSeries.totalMeetingsInRange} Total Notes
              </Badge>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                Avg {filteredTimeSeries.avgMeetingsPerDay}/day
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTimeSeries.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                    labelFormatter={(label, payload) => {
                      const full = payload?.[0]?.payload?.fullDate;
                      return full ? `Date: ${full}` : label;
                    }}
                    formatter={(value: any) => [`${value} meetings`, "AI Notes"]}
                  />
                  <Bar dataKey="meetings" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. MARKETING CONSENT — DONUT CHART (1/3 width) */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Marketing Consent</span>
            </CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Subscriber opt-in distribution</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={initialData.marketingConsentDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {initialData.marketingConsentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} users (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend with Total Percentage */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <div className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0" />
                  Opted In ({initialData.marketingOptInCount})
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {initialData.marketingOptInPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                  Not Opted In ({initialData.marketingTotalCount - initialData.marketingOptInCount})
                </span>
                <span className="font-medium text-slate-400 dark:text-slate-500 font-mono">
                  {100 - initialData.marketingOptInPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4: TRAFFIC SOURCES (1/3) + DEVICE BREAKDOWN (1/3) + USER ACTIVITY (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 6. TRAFFIC SOURCE — PIE/DONUT CHART (1/3) */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Traffic Sources</span>
            </CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Referral and campaign attribution</p>
          </CardHeader>
          <CardContent className="pt-2">
            {initialData.hasTrafficData ? (
              <div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={initialData.trafficSourcesDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {initialData.trafficSourcesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "12px",
                          border: "1px solid #1E293B",
                          color: "#FFFFFF",
                          fontSize: "12px",
                        }}
                        formatter={(value: any, name: any, item: any) => [
                          `${value} visitors (${item.payload.percentage}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {initialData.trafficSourcesDistribution.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-2">
                  <Compass className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Traffic source data will appear as visitors arrive.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  UTM campaign parameters and referrers will automatically populate here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7. DEVICE BREAKDOWN — PIE/DONUT CHART (1/3) */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Device Breakdown</span>
            </CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Hardware category distribution</p>
          </CardHeader>
          <CardContent className="pt-2">
            {initialData.hasDeviceData ? (
              <div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={initialData.deviceDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {initialData.deviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "12px",
                          border: "1px solid #1E293B",
                          color: "#FFFFFF",
                          fontSize: "12px",
                        }}
                        formatter={(value: any, name: any, item: any) => [
                          `${value} sessions (${item.payload.percentage}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {initialData.deviceDistribution.map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-500 dark:text-teal-400 mb-2">
                  <Laptop className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Device breakdown data will appear as user sessions occur.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Desktop, mobile, and tablet categories will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. USER ACTIVITY — BAR CHART (1/3) */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>User Activity Cohorts</span>
            </CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Active users grouped by recency</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`${value} users`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 5: COUNTRY / REGION (FULL WIDTH) */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Top Countries / Regions</span>
            </div>
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
              Top 10 approximate geographic distribution
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {initialData.hasCountryData ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={initialData.countryDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="country"
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "12px",
                      border: "1px solid #1E293B",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`${value} users`, "Visitors"]}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center p-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-2">
                <Globe className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Geographic data will appear as visitors access the workspace.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Approximate regional distribution is calculated from privacy-conscious session origins.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
