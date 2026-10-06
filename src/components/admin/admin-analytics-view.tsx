"use client";

import {
  Users,
  Video,
  Sparkles,
  TrendingUp,
  Percent,
  Compass,
  Laptop,
  Globe,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsSummary } from "@/lib/analytics/events";

interface AdminAnalyticsViewProps {
  analytics: AnalyticsSummary;
}

export function AdminAnalyticsView({ analytics }: AdminAnalyticsViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. CORE USER GROWTH METRICS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          User Growth &amp; Engagement KPIs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-blue-500/40 transition-colors shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Registered Users
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.totalRegisteredUsers}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                +{analytics.newUsersThisMonth} new this month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-teal-500/40 transition-colors shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Daily Active Users (DAU)
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {analytics.dailyActiveUsers}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Active in the last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/40 transition-colors shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Monthly Active Users (MAU)
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {analytics.monthlyActiveUsers}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {analytics.returningUsers} returning users
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/40 transition-colors shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Signup → 1st Meeting
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Percent className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {analytics.signupConversionRate}%
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Conversion to active workspace
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. PRODUCT & AI ACTIVITY */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Product &amp; AI Intelligence
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Meetings
              </CardTitle>
              <Video className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.totalMeetings}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Avg {analytics.avgMeetingsPerUser} per user
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                AI Generations
              </CardTitle>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analytics.aiGenerations}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Gemini 3.5 Flash notes generated
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Loom Videos Processed
              </CardTitle>
              <Video className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {analytics.loomVideosProcessed}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Extracted from Loom public links
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Action Items Completed
              </CardTitle>
              <Layers className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.actionItemsCompletedCount}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Completed across all workspaces
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. VISUAL ACTIVITY TREND BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend (Last 14 Days) */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>New User Signups (Last 14 Days)</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-1.5 h-36 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
              {analytics.userGrowthTrend.map((t, idx) => {
                const max = Math.max(...analytics.userGrowthTrend.map((x) => x.count), 1);
                const heightPercent = Math.max((t.count / max) * 100, 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-blue-500/80 group-hover:bg-blue-600 rounded-t-sm transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {t.count} users ({t.date.slice(5)})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>{analytics.userGrowthTrend[0]?.date}</span>
              <span>
                {analytics.userGrowthTrend[analytics.userGrowthTrend.length - 1]?.date}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Activity Trend (Last 14 Days) */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>AI Meeting Note Generations (Last 14 Days)</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-1.5 h-36 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
              {analytics.meetingActivityTrend.map((t, idx) => {
                const max = Math.max(...analytics.meetingActivityTrend.map((x) => x.count), 1);
                const heightPercent = Math.max((t.count / max) * 100, 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-teal-500/80 group-hover:bg-teal-600 rounded-t-sm transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {t.count} notes ({t.date.slice(5)})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>{analytics.meetingActivityTrend[0]?.date}</span>
              <span>
                {analytics.meetingActivityTrend[analytics.meetingActivityTrend.length - 1]?.date}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. TRAFFIC, DEVICES, GEOGRAPHY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Traffic &amp; Referral Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.trafficSources.map((src, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {src.source}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{src.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${src.percentage}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Device & Browser Breakdown */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Devices &amp; Browsers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Device Category</span>
              {analytics.deviceBreakdown.map((dev, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{dev.device}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {dev.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Browser</span>
              {analytics.browserBreakdown.map((br, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{br.browser}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {br.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Geographic Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.geographicDistribution.map((geo, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {geo.country}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{geo.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${geo.percentage}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
