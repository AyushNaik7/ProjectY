"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { SocialStatsCard } from "@/components/SocialStatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Instagram,
  Youtube,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Brain,
} from "lucide-react";
import { useAuth } from "@/context/ClerkAuthContext";
import { createClient } from "@/lib/supabase-browser";
import { callGetMatchedCampaigns, type MatchedCampaign } from "@/lib/functions";
import { formatMatchScore, getMatchColor } from "@/lib/matching";

export default function CreatorDashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [matchedCampaigns, setMatchedCampaigns] = useState<MatchedCampaign[]>(
    []
  );
  const [matchLoading, setMatchLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matchTriggered, setMatchTriggered] = useState(false);

  // Auth guard
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "creator") {
      router.push("/role-select");
      return;
    }
  }, [user, role, loading, router]);

  // Fetch creator profile
  useEffect(() => {
    // Wait for auth to load AND user to be available
    if (loading || !user) return;
    
    (async () => {
      try {
        console.log('Fetching creator profile for user:', user.id);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("creators")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching creator profile:", error);
        }

        if (!data) {
          // No profile found - redirect to onboarding
          console.log("No creator profile found, redirecting to onboarding");
          router.push("/onboarding/creator");
          return;
        }

        console.log('Creator profile loaded:', data);
        setCreatorProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        router.push("/onboarding/creator");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [user, router, loading]);

  // Fetch AI-matched campaigns — only when user triggers
  const handleFindCampaigns = async () => {
    if (!user) return;

    if (!creatorProfile) {
      alert("Please complete your onboarding first");
      router.push("/onboarding/creator");
      return;
    }

    setMatchLoading(true);
    setMatchTriggered(true);
    try {
      const result = await callGetMatchedCampaigns();
      setMatchedCampaigns(result.campaigns || []);
    } catch (err) {
      console.error("Failed to load matches:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load matches";

      if (errorMsg.includes("Creator profile not found")) {
        alert("Your profile is incomplete. Please complete onboarding first.");
        router.push("/onboarding/creator");
      } else {
        alert(`Error: ${errorMsg}`);
      }
    } finally {
      setMatchLoading(false);
    }
  };

  const metaName = (user?.user_metadata as Record<string, unknown>)
    ?.name as string;
  const creatorName =
    (creatorProfile?.name as string) ||
    metaName ||
    user?.email?.split("@")[0] ||
    "Creator";
  const niche = (creatorProfile?.niche as string) || "Not set";
  const igFollowers = (creatorProfile?.instagram_followers as number) || 0;
  const ytFollowers = (creatorProfile?.youtube_followers as number) || 0;
  const ttFollowers = (creatorProfile?.tiktok_followers as number) || 0;
  const totalReach = igFollowers + ytFollowers + ttFollowers;
  const avgEngagement = (creatorProfile?.instagram_engagement as number) || 0;

  const platforms = [
    ...(igFollowers > 0
      ? [
          {
            platform: "Instagram",
            followers: igFollowers,
            engagement: (creatorProfile?.instagram_engagement as number) || 0,
            icon: Instagram,
            color: "bg-gradient-to-br from-pink-500 to-purple-600",
          },
        ]
      : []),
    ...(ytFollowers > 0
      ? [
          {
            platform: "YouTube",
            followers: ytFollowers,
            engagement: (creatorProfile?.youtube_engagement as number) || 0,
            icon: Youtube,
            color: "bg-red-600",
          },
        ]
      : []),
    ...(ttFollowers > 0
      ? [
          {
            platform: "TikTok",
            followers: ttFollowers,
            engagement: (creatorProfile?.tiktok_engagement as number) || 0,
            icon: TrendingUp,
            color: "bg-black",
          },
        ]
      : []),
  ];

  const analyticsData = [
    {
      label: "Total Reach",
      value:
        totalReach >= 1_000_000
          ? `${(totalReach / 1_000_000).toFixed(1)}M`
          : totalReach >= 1000
          ? `${(totalReach / 1000).toFixed(1)}K`
          : String(totalReach),
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Avg Engagement",
      value: `${avgEngagement}%`,
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      label: "AI Matches",
      value: String(matchedCampaigns.length),
      icon: Brain,
      color: "text-primary",
    },
  ];

  return (
    <DashboardShell role="creator">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {creatorName}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Here&apos;s your analytics overview and AI-powered campaign
          recommendations.
        </p>
      </motion.div>

      {/* Creator Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            {profileLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Niche</p>
                  <p className="text-xl font-bold text-foreground">{niche}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Total Reach
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {totalReach >= 1_000_000
                      ? `${(totalReach / 1_000_000).toFixed(1)}M`
                      : totalReach >= 1000
                      ? `${(totalReach / 1000).toFixed(1)}K`
                      : totalReach}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Avg Engagement
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {avgEngagement}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Platforms
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {platforms.length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Performance Metrics
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI-Recommended Campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            AI-Recommended Campaigns
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Discover campaigns matched to your profile using AI analysis
        </p>

        {/* Trigger Card */}
        {!matchTriggered && matchedCampaigns.length === 0 && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Find Your Perfect Campaigns
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-2">
                Our AI analyzes your niche ({niche}), engagement rate (
                {avgEngagement}%), audience size, and content style to find the
                best-fit brand campaigns for you.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Matching considers: niche alignment, budget compatibility,
                audience quality, and semantic profile relevance.
              </p>
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={handleFindCampaigns}
                disabled={matchLoading}
              >
                {matchLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Discover Matching Campaigns
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {matchLoading && matchTriggered ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Analyzing matches...
              </p>
            </div>
          </div>
        ) : matchedCampaigns.length === 0 && matchTriggered ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No matching campaigns found yet. Try again later as brands post
                new campaigns.
              </p>
              <Button
                variant="outline"
                onClick={handleFindCampaigns}
                className="gap-2"
              >
                <Brain className="w-4 h-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedCampaigns.slice(0, 6).map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          {campaign.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {campaign.niche || campaign.deliverableType}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10 ml-3">
                        <span className="text-sm font-bold text-primary">
                          {campaign.matchScore}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-y border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Budget
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          ₹{campaign.budget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Timeline
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {campaign.timeline}
                        </p>
                      </div>
                    </div>

                    {/* Match reasons */}
                    <div className="mb-4 flex-1">
                      <p
                        className={`text-xs font-medium mb-1.5 ${getMatchColor(
                          campaign.matchScore
                        )}`}
                      >
                        {formatMatchScore(campaign.matchScore)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {campaign.matchReasons.slice(0, 3).map((reason, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      {campaign.semanticScore && campaign.semanticScore > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> AI Relevance:{" "}
                          {campaign.semanticScore}%
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-auto bg-primary hover:bg-primary/90"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Social Media Stats */}
      {platforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Your Social Media Stats
            </h2>
            <p className="text-sm text-muted-foreground">
              Connected accounts and their performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform, index) => (
              <SocialStatsCard
                key={platform.platform}
                {...platform}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}
    </DashboardShell>
  );
}
