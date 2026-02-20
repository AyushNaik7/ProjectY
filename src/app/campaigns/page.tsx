"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { createClient } from "@/lib/supabase-browser";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  IndianRupee,
  Calendar,
  Film,
  ImageIcon,
  MessageSquare,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface CampaignItem {
  id: string;
  brandId: string;
  brandName?: string;
  title: string;
  description: string;
  deliverableType: string;
  budget: number;
  timeline: string;
  niche?: string;
  status: string;
  matchScore?: number;
  matchReasons?: string[];
  createdAt: Date;
}

const PAGE_SIZE = 12;

const deliverableIcons: Record<string, React.ReactNode> = {
  Reel: <Film className="w-4 h-4" />,
  Post: <ImageIcon className="w-4 h-4" />,
  Story: <MessageSquare className="w-4 h-4" />,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getMatchColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-muted-foreground";
}

export default function CampaignsPage() {
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  /**
   * Fetch campaigns:
   * - BRAND: Supabase query (own campaigns)
   * - CREATOR / OTHER: All active campaigns from Supabase
   */
  const fetchCampaigns = useCallback(
    async (loadMore = false) => {
      if (!user) return;

      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const currentPage = loadMore ? page + 1 : 0;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const supabase = createClient();
        let query = supabase
          .from("campaigns")
          .select("*, brands(name)")
          .order("created_at", { ascending: false })
          .range(from, to);

        // Brands see only their own; everyone else sees all active campaigns
        if (role === "brand") {
          query = query.eq("brand_id", user.id);
        } else {
          query = query.eq("status", "active");
        }

        const { data, error } = await query;
        if (error) throw error;

        const newCampaigns: CampaignItem[] = (data || []).map((c: any) => ({
          id: c.id,
          brandId: c.brand_id,
          brandName: c.brands?.name || "",
          title: c.title,
          description: c.description,
          deliverableType: c.deliverable_type,
          budget: c.budget,
          timeline: c.timeline,
          niche: c.niche || "",
          status: c.status,
          createdAt: new Date(c.created_at),
        }));

        if (loadMore) {
          setCampaigns((prev) => [...prev, ...newCampaigns]);
        } else {
          setCampaigns(newCampaigns);
        }

        setPage(currentPage);
        setHasMore(newCampaigns.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, role, page]
  );

  useEffect(() => {
    if (!user) return;
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardShell role={role || "creator"}>
      <div className="space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {role === "brand" ? "Your Campaigns" : "Matched Campaigns"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {role === "brand"
                ? "Manage all your campaigns in one place."
                : "Campaigns ranked by match score — powered by our matching engine."}
            </p>
          </div>
          {role === "brand" && (
            <Button
              onClick={() => router.push("/campaigns/new")}
              className="gap-2"
            >
              <Megaphone className="w-4 h-4" />
              New Campaign
            </Button>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-muted/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">
              {role === "brand"
                ? "You haven't created any campaigns yet."
                : "No active campaigns found."}
            </p>
            {role === "brand" && (
              <Button
                className="mt-4"
                onClick={() => router.push("/campaigns/new")}
              >
                Create Your First Campaign
              </Button>
            )}
          </div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {campaigns.map((campaign) => (
                <motion.div key={campaign.id} variants={fadeInUp}>
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 h-full flex flex-col group cursor-pointer">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "success"
                              : campaign.status === "draft"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {campaign.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          {deliverableIcons[campaign.deliverableType]}
                          {campaign.deliverableType}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {campaign.description}
                      </p>

                      {campaign.niche && (
                        <Badge variant="outline" className="w-fit mb-3">
                          {campaign.niche}
                        </Badge>
                      )}

                      {campaign.brandName && (
                        <p className="text-xs text-muted-foreground mb-3">
                          by{" "}
                          <span className="font-medium text-foreground">
                            {campaign.brandName}
                          </span>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1 font-semibold text-sm">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {campaign.budget?.toLocaleString("en-IN")}
                        </div>
                        {campaign.timeline && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {campaign.timeline}
                          </div>
                        )}
                      </div>

                      {/* Show match score for creator view (computed server-side) */}
                      {campaign.matchScore != null && (
                        <div
                          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${getMatchColor(
                            campaign.matchScore
                          )}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {campaign.matchScore}% Match
                          {campaign.matchReasons &&
                            campaign.matchReasons.length > 0 && (
                              <span className="text-muted-foreground font-normal ml-1">
                                · {campaign.matchReasons.slice(0, 2).join(", ")}
                              </span>
                            )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchCampaigns(true)}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
