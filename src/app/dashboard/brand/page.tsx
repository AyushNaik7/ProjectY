"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, Users, Zap, Brain, ChevronDown } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase-browser";
import {
  callGetCreatorsForCampaign,
  type MatchedCreator,
} from "@/lib/functions";
import { formatMatchScore, getMatchColor } from "@/lib/matching";

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
  const { user, role, loading, signOut } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );
  const [matchedCreators, setMatchedCreators] = useState<MatchedCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    if (!loading && (!user || role !== "brand")) {
      router.push("/login");
    }
  }, [user, role, loading, router]);

  // Fetch brand profile & campaigns
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const supabase = createClient();
        const [{ data: brand, error: brandError }, { data: camps }] =
          await Promise.all([
            supabase.from("brands").select("name").eq("id", user.id).single(),
            supabase
              .from("campaigns")
              .select("*")
              .eq("brand_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

        if (brandError || !brand) {
          // No brand profile found - redirect to onboarding
          console.log("No brand profile found, redirecting to onboarding");
          router.push("/onboarding/brand");
          return;
        }

        const metaName =
          ((user.user_metadata as Record<string, unknown>)
            ?.brandName as string) ||
          ((user.user_metadata as Record<string, unknown>)?.name as string);
        setBrandName(
          (brand?.name as string) ||
            metaName ||
            user.email?.split("@")[0] ||
            "Brand"
        );
        setCampaigns((camps as CampaignRow[]) || []);
      } catch (err) {
        console.error("Failed to load brand data:", err);
        router.push("/onboarding/brand");
      } finally {
        setCampaignsLoading(false);
      }
    })();
  }, [user, router]);

  // Fetch AI-matched creators for selected campaign
  const fetchMatches = useCallback(async (campaignId: string) => {
    setCreatorsLoading(true);
    try {
      const result = await callGetCreatorsForCampaign(campaignId);
      setMatchedCreators(result.creators || []);
    } catch (err) {
      console.error("Failed to load creator matches:", err);
      setMatchedCreators([]);
    } finally {
      setCreatorsLoading(false);
    }
  }, []);

  // Only fetch when user explicitly triggers
  const handleFindCreators = () => {
    if (selectedCampaignId) fetchMatches(selectedCampaignId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== "brand") return null;

  const handleSendRequest = (creatorId: string) => {
    console.log("Send request to creator:", creatorId);
  };
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalBudget = activeCampaigns.reduce((sum, c) => sum + c.budget, 0);

  const stats = [
    {
      label: "Active Campaigns",
      value: String(activeCampaigns.length),
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "AI Matches Found",
      value: String(matchedCreators.length),
      icon: Brain,
      color: "text-blue-600",
    },
    {
      label: "Total Budget",
      value:
        totalBudget >= 100000
          ? `₹${(totalBudget / 100000).toFixed(1)}L`
          : `₹${totalBudget.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  return (
    <DashboardShell role="brand">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {brandName}
        </h1>
        <p className="text-muted-foreground">
          Manage your campaigns and discover AI-matched creators
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Link href="/campaigns/new">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Ready to find creators?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Post a new campaign and get AI-matched with relevant
                    creators instantly.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-5 h-5" /> Post Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Active Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Your Campaigns</CardTitle>
            <CardDescription>
              Select a campaign to see AI-matched creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No campaigns yet. Create one to get started!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Campaign
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Budget
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Niche
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow
                        key={campaign.id}
                        className={`border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${
                          selectedCampaignId === campaign.id
                            ? "bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          campaign.status === "active" &&
                          setSelectedCampaignId(campaign.id)
                        }
                      >
                        <TableCell className="font-medium text-sm">
                          {campaign.title}
                        </TableCell>
                        <TableCell className="text-sm">
                          ₹
                          {campaign.budget >= 100000
                            ? `${(campaign.budget / 100000).toFixed(1)}L`
                            : campaign.budget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {campaign.niche || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {campaign.status === "active"
                              ? "🟢 Active"
                              : "⚫ " + campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.status === "active" && (
                            <Button
                              variant={
                                selectedCampaignId === campaign.id
                                  ? "default"
                                  : "ghost"
                              }
                              size="sm"
                              className="text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCampaignId(campaign.id);
                                setMatchedCreators([]);
                              }}
                            >
                              <Brain className="w-3 h-3" /> Select
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI-Suggested Creators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-0.5">
              AI-Suggested Creators
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a campaign and find the best creators using AI matching
            </p>
          </div>
        </div>

        {/* Campaign selector + Find button */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Campaign to Match
                </label>
                <select
                  value={selectedCampaignId || ""}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value || null);
                    setMatchedCreators([]);
                  }}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Choose a campaign...</option>
                  {activeCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — ₹{c.budget.toLocaleString()} (
                      {c.niche || "General"})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 shrink-0"
                disabled={!selectedCampaignId || creatorsLoading}
                onClick={handleFindCreators}
              >
                {creatorsLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" /> Find Creators
                  </>
                )}
              </Button>
            </div>
            {selectedCampaignId && (
              <p className="text-xs text-muted-foreground mt-3">
                AI will analyze creator profiles, engagement rates, niche
                alignment, budget fit, and semantic relevance to find the best
                matches.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {!selectedCampaignId && matchedCreators.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Select a campaign above and click &quot;Find Creators&quot; to
                see AI-matched results
              </p>
            </CardContent>
          </Card>
        ) : creatorsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Finding best creators with AI...
              </p>
            </div>
          </div>
        ) : matchedCreators.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No matching creators found for this campaign yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedCreators.slice(0, 9).map((creator, index) => (
              <motion.div
                key={creator.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {creator.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {creator.niche}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {creator.matchScore}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          match
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Followers
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {creator.followers >= 1_000_000
                            ? `${(creator.followers / 1_000_000).toFixed(1)}M`
                            : creator.followers >= 1000
                            ? `${(creator.followers / 1000).toFixed(1)}K`
                            : creator.followers}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Engagement
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {creator.engagementRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Avg Views
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {creator.avgViews >= 1_000_000
                            ? `${(creator.avgViews / 1_000_000).toFixed(1)}M`
                            : creator.avgViews >= 1000
                            ? `${(creator.avgViews / 1000).toFixed(1)}K`
                            : creator.avgViews}
                        </p>
                      </div>
                    </div>

                    {/* Match reasons */}
                    <div className="mb-4">
                      <p
                        className={`text-xs font-medium mb-1.5 ${getMatchColor(
                          creator.matchScore
                        )}`}
                      >
                        {formatMatchScore(creator.matchScore)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {creator.matchReasons.slice(0, 3).map((reason, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      {creator.semanticScore && creator.semanticScore > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> AI Relevance:{" "}
                          {creator.semanticScore}%
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/creators/${creator.uid}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-primary hover:bg-primary/90"
                        onClick={() => handleSendRequest(creator.uid)}
                      >
                        Send Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardShell>
  );
}
