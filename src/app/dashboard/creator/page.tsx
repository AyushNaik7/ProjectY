"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Brain,
  Compass,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell from "@/components/DashboardShell";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import {
  CampaignCard,
  PreviewCampaign,
} from "@/components/dashboard/CampaignCard";
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

  const platformBars = [
    { name: "Instagram", followers: igFollowers },
    { name: "YouTube", followers: ytFollowers },
    { name: "TikTok", followers: ttFollowers },
  ];

  const previewCampaigns: PreviewCampaign[] = useMemo(
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
        totalReach > 1_000_000
          ? `${(totalReach / 1_000_000).toFixed(1)}M`
          : totalReach > 1000
          ? `${(totalReach / 1000).toFixed(1)}K`
          : String(totalReach),
      delta: "+8.2% this week",
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "Engagement",
      value: `${avgEngagement.toFixed(1)}%`,
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

  return (
    <DashboardShell role="creator">
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_12px_34px_rgba(30,50,122,0.1)] backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Creator HQ
              </p>
              <h1 className="font-brand text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Welcome back, {creatorName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Track growth, review AI-curated opportunities, and respond faster to brands.
              </p>
            </div>
            <Button
              onClick={handleFindCampaigns}
              disabled={matchLoading || profileLoading}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:brightness-110"
            >
              {matchLoading ? "Matching..." : "Discover Campaign Matches"}
            </Button>
          </div>
        </motion.div>

        <DashboardCards metrics={metrics} loading={profileLoading} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)] xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Reach Performance
              </h2>
              <span className="text-xs text-slate-500">Last 5 weeks</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)]">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-slate-900">Audience Split</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Compass className="h-5 w-5 text-blue-600" />
                Campaign Preview
              </h2>
              <Button variant="outline" className="rounded-xl" onClick={() => router.push("/campaigns")}>View all</Button>
            </div>

            {matchLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse rounded-3xl border border-white/60 bg-white/60" />
                ))}
              </div>
            ) : previewCampaigns.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No campaign matches yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Trigger AI matching to load personalized campaign opportunities.
                </p>
                <Button
                  onClick={handleFindCampaigns}
                  className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                >
                  Generate Matches
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {previewCampaigns.map((campaign, index) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                    ctaLabel="Apply"
                    secondaryCtaLabel="Message Brand"
                    onPrimaryAction={(campaignId) => router.push(`/campaigns/${campaignId}`)}
                    onSecondaryAction={() => router.push("/messages")}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)]">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {recentActivity.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {!matchTriggered ? (
          <p className="text-center text-xs text-slate-500">
            AI matching is on-demand to keep performance and cost optimized.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
