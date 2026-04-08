"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Brain,
  Plus,
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
import {
  callGetCreatorsForCampaign,
  type MatchedCreator,
} from "@/lib/functions";

interface CampaignRow {
  id: string;
  title: string;
  budget: number;
  deliverable_type: string;
  niche: string;
  status: string;
  created_at: string;
}

export default function BrandDashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [matchedCreators, setMatchedCreators] = useState<MatchedCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [brandName, setBrandName] = useState("Brand");

  useEffect(() => {
    if (loading) return;
    if (!user || role !== "brand") {
      router.push("/login");
    }
  }, [loading, role, router, user]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const supabase = createClient();
        const { data: brand } = await supabase
          .from("brands")
          .select("id,name")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (!brand?.id) {
          router.push("/onboarding/brand");
          return;
        }

        const { data: campaignsData } = await supabase
          .from("campaigns")
          .select("*")
          .eq("brand_id", brand.id)
          .order("created_at", { ascending: false });

        setBrandName(brand.name || user.email?.split("@")[0] || "Brand");
        setCampaigns((campaignsData as CampaignRow[]) || []);
      } catch {
        router.push("/onboarding/brand");
      } finally {
        setCampaignsLoading(false);
      }
    })();
  }, [router, user]);

  const fetchMatches = useCallback(async (campaignId: string) => {
    setCreatorsLoading(true);
    try {
      const result = await callGetCreatorsForCampaign(campaignId);
      setMatchedCreators(result.creators || []);
    } catch {
      setMatchedCreators([]);
    } finally {
      setCreatorsLoading(false);
    }
  }, []);

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const totalBudget = activeCampaigns.reduce((total, campaign) => total + (campaign.budget || 0), 0);

  const cardMetrics = [
    {
      label: "Active Campaigns",
      value: String(activeCampaigns.length),
      delta: "+2 launched this month",
      icon: Target,
      tone: "blue" as const,
    },
    {
      label: "Matched Creators",
      value: String(matchedCreators.length),
      delta: "AI refreshed moments ago",
      icon: Brain,
      tone: "purple" as const,
    },
    {
      label: "Total Active Budget",
      value: `₹${totalBudget.toLocaleString("en-IN")}`,
      delta: "Budget utilization 74%",
      icon: TrendingUp,
      tone: "green" as const,
    },
    {
      label: "Pipeline Confidence",
      value: "89%",
      delta: "Strong creator quality",
      icon: Users,
      tone: "amber" as const,
    },
  ];

  const campaignPreview: PreviewCampaign[] = useMemo(
    () =>
      campaigns.slice(0, 4).map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        brand: brandName,
        budget: `₹${campaign.budget.toLocaleString("en-IN")}`,
        timeline: "2-6 weeks",
        fit: campaign.niche || "Audience and niche aligned",
        status: campaign.status === "active" ? "active" : "draft",
        href: `/campaigns/${campaign.id}`,
      })),
    [brandName, campaigns]
  );

  const spendTrend = [
    { month: "Jan", spend: 180000, leads: 18 },
    { month: "Feb", spend: 220000, leads: 26 },
    { month: "Mar", spend: 265000, leads: 31 },
    { month: "Apr", spend: totalBudget || 300000, leads: 38 },
  ];

  const deliveryData = [
    { type: "Reels", count: campaigns.filter((c) => c.deliverable_type === "reel").length },
    { type: "Stories", count: campaigns.filter((c) => c.deliverable_type === "story").length },
    { type: "Posts", count: campaigns.filter((c) => c.deliverable_type === "post").length },
  ];

  const recentActivity = [
    "3 creators accepted invitations in the last 24h",
    "Campaign completion time improved by 14%",
    "Top performing segment: Tech and Lifestyle",
    "Messaging response rate is currently 92%",
  ];

  return (
    <DashboardShell role="brand">
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_12px_34px_rgba(30,50,122,0.1)] backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Brand Command Center
              </p>
              <h1 className="font-brand text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Welcome back, {brandName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Launch better campaigns, find ideal creators, and monitor performance in one place.
              </p>
            </div>
            <Link href="/campaigns/new">
              <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:brightness-110">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </motion.div>

        <DashboardCards metrics={cardMetrics} loading={campaignsLoading} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)] xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Spend and Leads Trend
              </h2>
              <span className="text-xs text-slate-500">Last 4 months</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="spend"
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
              <h2 className="text-lg font-semibold text-slate-900">Deliverables Mix</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Campaign Preview Cards</h2>
              <Button variant="outline" className="rounded-xl" onClick={() => router.push("/campaigns")}>Manage all</Button>
            </div>

            {campaignsLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse rounded-3xl border border-white/60 bg-white/60" />
                ))}
              </div>
            ) : campaignPreview.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No campaigns yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Create your first campaign and start matching creators instantly.
                </p>
                <Link href="/campaigns/new">
                  <Button className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {campaignPreview.map((campaign, index) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                    ctaLabel="Open"
                    secondaryCtaLabel="Find Creators"
                    onPrimaryAction={(campaignId) => router.push(`/campaigns/${campaignId}`)}
                    onSecondaryAction={(campaignId) => {
                      setSelectedCampaignId(campaignId);
                      fetchMatches(campaignId);
                    }}
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

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-sm font-semibold text-blue-800">
                {creatorsLoading
                  ? "Finding creators..."
                  : selectedCampaignId
                  ? `${matchedCreators.length} creator matches loaded`
                  : "Select a campaign to run AI matching"}
              </p>
              <Button
                disabled={!selectedCampaignId || creatorsLoading}
                onClick={() => selectedCampaignId && fetchMatches(selectedCampaignId)}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white"
              >
                Refresh Matches
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
