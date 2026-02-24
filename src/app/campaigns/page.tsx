"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { createClient } from "@/lib/supabase-browser";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Megaphone, Loader2, ChevronRight } from "lucide-react";

import type {
  MarketplaceCampaign,
  MarketplaceFilters,
  ViewMode,
} from "@/lib/marketplace-types";
import { DEFAULT_FILTERS } from "@/lib/marketplace-types";
import {
  mapRowToMarketplaceCampaign,
  applyFilters,
  sortCampaigns,
} from "@/lib/marketplace-utils";
import { MarketplaceCampaignCard, FilterBar } from "@/components/marketplace";

const PAGE_SIZE = 12;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CampaignsPage() {
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();

  // ─── Data state ─────────────────────────────────────────────────────────
  const [allCampaigns, setAllCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ─── Filter / view state ────────────────────────────────────────────────
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const isBrand = role === "brand";

  // ─── Derived: filtered + sorted campaigns ──────────────────────────────
  const filteredCampaigns = useMemo(() => {
    const filtered = applyFilters(allCampaigns, filters);
    return sortCampaigns(filtered);
  }, [allCampaigns, filters]);

  // ─── Auth guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // ─── Fetch campaigns ───────────────────────────────────────────────────
  const fetchCampaigns = useCallback(
    async (loadMore = false) => {
      if (!user) return;

      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        if (!isBrand) {
          // ── Creator view: call AI marketplace API for enriched match data ──
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData.session?.access_token;
          if (!accessToken) throw new Error("Not authenticated");

          const res = await fetch("/api/marketplace-campaigns", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
          });

          const json = await res.json();
          if (!res.ok)
            throw new Error(
              json.error || "Failed to fetch marketplace campaigns",
            );

          const enrichedCampaigns: MarketplaceCampaign[] = (
            json.campaigns || []
          ).map((row: any) => mapRowToMarketplaceCampaign(row));

          setAllCampaigns(enrichedCampaigns);
          setPage(0);
          setHasMore(false); // AI results are already ranked & limited
        } else {
          // ── Brand view: paginated fetch of own campaigns ──
          const currentPage = loadMore ? page + 1 : 0;
          const from = currentPage * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;

          const supabase = createClient();
          const { data, error } = await supabase
            .from("campaigns")
            .select("*, brands(*)")
            .eq("brand_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to);

          if (error) throw error;

          const newCampaigns: MarketplaceCampaign[] = (data || []).map(
            (row: any) => mapRowToMarketplaceCampaign(row),
          );

          if (loadMore) {
            setAllCampaigns((prev) => [...prev, ...newCampaigns]);
          } else {
            setAllCampaigns(newCampaigns);
          }

          setPage(currentPage);
          setHasMore(newCampaigns.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, isBrand, page],
  );

  // ─── Load saved IDs from Supabase (creator only) ──────────────────────
  const loadSavedIds = useCallback(async () => {
    if (!user || isBrand) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_campaigns")
        .select("campaign_id")
        .eq("creator_id", user.id);
      if (data) {
        setSavedIds(new Set(data.map((r: any) => r.campaign_id)));
      }
    } catch (err) {
      console.error("Error loading saved campaigns:", err);
    }
  }, [user, isBrand]);

  useEffect(() => {
    if (!user) return;
    fetchCampaigns();
    loadSavedIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  // ─── Action handlers ───────────────────────────────────────────────────
  const handleViewDetails = useCallback(
    (id: string) => router.push(`/campaigns/${id}`),
    [router],
  );

  /** Brands → manage campaign; Creators → send proposal */
  const handleSendProposal = useCallback(
    (id: string) => {
      if (isBrand) {
        router.push(`/campaigns/${id}`);
      } else {
        router.push(`/campaigns/${id}?action=proposal`);
      }
    },
    [router, isBrand],
  );

  /** Toggle save in Supabase */
  const handleToggleSave = useCallback(
    async (id: string) => {
      if (!user || isBrand) return;
      const supabase = createClient();
      const currentlySaved = savedIds.has(id);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        if (currentlySaved) {
          await supabase
            .from("saved_campaigns")
            .delete()
            .eq("creator_id", user.id)
            .eq("campaign_id", id);
        } else {
          await supabase
            .from("saved_campaigns")
            .insert({ creator_id: user.id, campaign_id: id });
        }
      } catch (err) {
        console.error("Save toggle error:", err);
        // Revert on failure
        setSavedIds((prev) => {
          const reverted = new Set(prev);
          if (currentlySaved) reverted.add(id);
          else reverted.delete(id);
          return reverted;
        });
      }
    },
    [user, isBrand, savedIds],
  );

  const handleQuickApply = useCallback(
    (id: string) => router.push(`/campaigns/${id}?action=apply`),
    [router],
  );

  // ─── Loading / auth guard render ───────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardShell role={role || "creator"}>
      <div className="space-y-6">
        {/* ─── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isBrand ? "Your Campaigns" : "Matched Campaigns"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isBrand
                ? "Manage all your campaigns in one place."
                : "Campaigns ranked by AI match score — filter, compare, and apply."}
            </p>
          </div>
          {isBrand && (
            <Button
              onClick={() => router.push("/campaigns/new")}
              className="gap-2"
            >
              <Megaphone className="w-4 h-4" />
              New Campaign
            </Button>
          )}
        </motion.div>

        {/* ─── Smart Filter Bar ──────────────────────────────────────── */}
        {!loading && allCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalResults={filteredCampaigns.length}
            />
          </motion.div>
        )}

        {/* ─── Content ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-muted/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">
              {allCampaigns.length === 0
                ? isBrand
                  ? "You haven't created any campaigns yet."
                  : "No active campaigns found."
                : "No campaigns match your current filters."}
            </p>
            {allCampaigns.length === 0 && isBrand && (
              <Button
                className="mt-4"
                onClick={() => router.push("/campaigns/new")}
              >
                Create Your First Campaign
              </Button>
            )}
            {allCampaigns.length > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Campaign cards grid / list */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredCampaigns.map((campaign, idx) => (
                <MarketplaceCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isSaved={savedIds.has(campaign.id)}
                  onViewDetails={handleViewDetails}
                  onSendProposal={handleSendProposal}
                  onToggleSave={handleToggleSave}
                  onQuickApply={handleQuickApply}
                  index={idx}
                  viewMode={viewMode}
                  isBrandView={isBrand}
                />
              ))}
            </motion.div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-2">
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
