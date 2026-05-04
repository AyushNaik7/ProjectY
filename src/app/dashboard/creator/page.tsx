"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity,
  Brain,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell from "@/components/DashboardShell";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/ClerkAuthContext";
import { createClient } from "@/lib/supabase-browser";
import { callGetMatchedCampaigns, type MatchedCampaign } from "@/lib/functions";

export default function CreatorDashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const [creatorProfile, setCreatorProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchTriggered, setMatchTriggered] = useState(false);
  const [matchedCampaigns, setMatchedCampaigns] = useState<MatchedCampaign[]>([]);
  const [apiStats, setApiStats] = useState<{
    totalEarnings: number;
    activeCampaigns: number;
    newFollowers: number;
    engagementRate: number;
  } | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "creator") {
      router.push("/role-select");
    }
  }, [loading, role, router, user]);

  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("creators")
          .select("*")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (!data) {
          router.push("/onboarding/creator");
          return;
        }

        setCreatorProfile(data);
      } catch {
        router.push("/onboarding/creator");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [loading, router, user]);

  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) return;
        const json = (await response.json()) as { stats?: typeof apiStats };
        if (json?.stats) setApiStats(json.stats as NonNullable<typeof apiStats>);
      } catch {
        // Keep dashboard functional with local fallback stats.
      }
    })();
  }, [loading, user]);

  const handleFindCampaigns = async () => {
    if (!creatorProfile) return;

    setMatchLoading(true);
    setMatchTriggered(true);
    try {
      const result = await callGetMatchedCampaigns();
      setMatchedCampaigns(result.campaigns || []);
    } catch {
      setMatchedCampaigns([]);
    } finally {
      setMatchLoading(false);
    }
  };

  const creatorName =
    (creatorProfile?.name as string) ||
    ((user?.user_metadata as Record<string, unknown> | undefined)?.name as string) ||
    user?.email?.split("@")[0] ||
    "Creator";

  const igFollowers = (creatorProfile?.instagram_followers as number) || 0;
  const ytFollowers = (creatorProfile?.youtube_followers as number) || 0;
  const ttFollowers = (creatorProfile?.tiktok_followers as number) || 0;
  const totalReach = igFollowers + ytFollowers + ttFollowers;
  const avgEngagement = (creatorProfile?.instagram_engagement as number) || 0;

  const chartTrend = [
    { week: "W1", reach: Math.max(totalReach * 0.72, 1200), clicks: 120 },
    { week: "W2", reach: Math.max(totalReach * 0.78, 1400), clicks: 180 },
    { week: "W3", reach: Math.max(totalReach * 0.86, 1700), clicks: 250 },
    { week: "W4", reach: Math.max(totalReach * 0.95, 2200), clicks: 310 },
    { week: "W5", reach: Math.max(totalReach, 2600), clicks: 370 },
  ];

  const previewCampaigns = useMemo(
    () =>
      matchedCampaigns.slice(0, 4).map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        brand: "Matched Brand",
        budget: `₹${campaign.budget.toLocaleString("en-IN")}`,
        timeline: campaign.timeline || "2-4 weeks",
        fit: `AI fit score ${campaign.matchScore}%`,
        status: campaign.matchScore > 80 ? "active" : "ending-soon",
        href: `/campaigns/${campaign.id}`,
      })),
    [matchedCampaigns]
  );

  const metrics = [
    {
      label: "Total Reach",
      value:
        (apiStats?.newFollowers || totalReach) > 1_000_000
          ? `${((apiStats?.newFollowers || totalReach) / 1_000_000).toFixed(1)}M`
          : (apiStats?.newFollowers || totalReach) > 1000
          ? `${((apiStats?.newFollowers || totalReach) / 1000).toFixed(1)}K`
          : String(apiStats?.newFollowers || totalReach),
      delta: "+8.2% this week",
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "Engagement",
      value: `${(apiStats?.engagementRate ?? avgEngagement).toFixed(1)}%`,
      delta: "+1.4% from last month",
      icon: Activity,
      tone: "purple" as const,
    },
    {
      label: "AI Matches",
      value: String(matchedCampaigns.length),
      delta: "Synced in real-time",
      icon: Brain,
      tone: "green" as const,
    },
    {
      label: "Profile Health",
      value: creatorProfile ? "92/100" : "--",
      delta: "Portfolio almost complete",
      icon: Target,
      tone: "amber" as const,
    },
  ];

  const recentActivity = [
    "Your portfolio got 3 new brand views",
    "2 collaboration requests moved to review",
    "Audience growth exceeded weekly target",
    "AI matching model refreshed your profile",
  ];

  const formatCompact = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
  };

  return (
    <DashboardShell role="creator">
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_46px_rgba(6,12,32,0.55)] backdrop-blur-2xl md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Creator HQ
              </p>
              <h1 className="font-brand text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
                Welcome back, {creatorName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Track growth, review AI-curated opportunities, and respond faster to brands.
              </p>
            </div>
            <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 md:w-auto">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns, analytics, or content"
                className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </motion.div>

        <DashboardCards metrics={metrics} loading={profileLoading} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_42px_rgba(8,12,34,0.52)] xl:col-span-2"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                <TrendingUp className="h-5 w-5 text-violet-300" />
                Reach Performance
              </h2>
              <span className="text-xs text-slate-400">Last 5 weeks</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartTrend}>
                  <defs>
                    <linearGradient id="reachGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.95} />
                    </linearGradient>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415566" />
                  <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="url(#reachGradient)"
                    strokeWidth={3}
                    fill="url(#areaGlow)"
                    dot={{ r: 4, fill: "#a78bfa" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_42px_rgba(8,12,34,0.52)]"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-100">Top Performing Content</h2>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-1 text-xs font-medium text-emerald-200">
                +12.6%
              </span>
            </div>
            <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-blue-500/15 p-4">
              <div className="aspect-[4/3] rounded-xl bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.35),transparent_45%),linear-gradient(140deg,rgba(22,28,58,0.95),rgba(15,23,42,0.9))]" />
            </div>
            <p className="text-sm font-medium text-slate-100">Studio Reel: Creator Setup Walkthrough</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
              <Eye className="h-4 w-4 text-blue-300" />
              <span>{formatCompact((creatorProfile?.avg_views as number) || 12400)} views</span>
            </div>
            <p className="mt-4 text-xs text-slate-400">Best performing in the last 7 days</p>
          </motion.article>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <section className="xl:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                <TrendingUp className="h-5 w-5 text-violet-300" />
                Campaign Opportunities
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleFindCampaigns}
                  disabled={matchLoading || profileLoading}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
                >
                  {matchLoading ? "Matching..." : "Discover Matches"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={() => router.push("/campaigns")}
                >
                  View all
                </Button>
              </div>
            </div>

            {matchLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : previewCampaigns.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-100">No campaign matches yet</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Trigger AI matching to load personalized campaign opportunities.
                </p>
                <Button
                  onClick={handleFindCampaigns}
                  className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                >
                  Generate Matches
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_16px_42px_rgba(8,12,34,0.52)]">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 bg-white/[0.04]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Campaign</th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Budget</th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewCampaigns.map((campaign) => {
                      const status = campaign.status || "active";
                      const statusStyle =
                        status === "active"
                          ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200"
                          : status === "draft"
                          ? "border-slate-300/30 bg-slate-500/15 text-slate-200"
                          : "border-amber-300/35 bg-amber-400/15 text-amber-200";

                      return (
                        <tr key={campaign.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.04]">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-100">{campaign.title}</p>
                            <p className="text-xs text-slate-400">{campaign.fit || "High fit based on your audience"}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-200">{campaign.budget}</td>
                          <td className="px-5 py-4 text-sm text-slate-300">{campaign.timeline}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle}`}>
                              {status.replace("-", " ")}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => router.push("/messages")}
                                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
                              >
                                Message
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_42px_rgba(8,12,34,0.52)]">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">Activity Feed</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {recentActivity.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-start gap-2">
                    {item.toLowerCase().includes("review") ? (
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    )}
                    <span>{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {!matchTriggered ? (
          <p className="text-center text-xs text-slate-400">
            AI matching is on-demand to keep performance and cost optimized.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
