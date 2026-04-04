/**
 * Vector Matching Service — Server-Side Only
 *
 * Combines pgvector semantic similarity with business logic scoring
 * to produce ranked matches between creators and campaigns.
 *
 * This replaces the simple scoring in server-matching.ts with
 * AI-powered vector similarity + hybrid scoring.
 */

import { supabaseAdmin } from "@/lib/supabase-server";
import {
  generateEmbedding,
  buildCreatorEmbeddingText,
  buildCampaignEmbeddingText,
} from "@/lib/embeddings";
import {
  computeMatchScore,
  type CreatorData,
  type CampaignData,
} from "@/lib/server-matching";
import { computeHybridScore } from "@/lib/scoring";
import { semanticScoreFromSimilarity } from "@/lib/embedding-utils";
import { cacheKeys, getOrSetJson } from "@/lib/cache";
import { timedQuery } from "@/lib/db-timing";
import { logger } from "@/lib/logger";

// ============================================================
// Types
// ============================================================

export interface VectorMatchedCampaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  deliverableType: string;
  budget: number;
  timeline: string;
  niche: string;
  status: string;
  matchScore: number;
  semanticScore: number;
  matchReasons: string[];
}

export interface VectorMatchedCreator {
  uid: string;
  username?: string;
  name: string;
  instagramHandle: string;
  niche: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  verified: boolean;
  matchScore: number;
  semanticScore: number;
  matchReasons: string[];
}

interface CampaignRow {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  deliverable_type: string;
  budget: number;
  timeline: string;
  niche?: string | null;
  status: string;
  embedding?: string | null;
}

interface CreatorRow {
  id: string;
  username?: string | null;
  name: string;
  instagram_handle?: string | null;
  niche: string;
  instagram_followers?: number | null;
  avg_views?: number | null;
  instagram_engagement?: number | null;
  min_rate_private?: number | null;
  verified?: boolean | null;
}

// ============================================================
// Cache Configuration
// ============================================================

const MATCH_TTL_SECONDS = 300;
const CAMPAIGN_TTL_SECONDS = 600;

// ============================================================
// Main Matching Functions
// ============================================================

/**
 * Find campaigns matching a creator using vector similarity + hybrid scoring.
 * Falls back to rule-based matching if embeddings are unavailable.
 */
export async function getVectorMatchedCampaigns(
  creatorId: string,
  log = logger
): Promise<VectorMatchedCampaign[]> {
  const cacheKey = cacheKeys.creatorMatches(creatorId);

  return getOrSetJson(cacheKey, MATCH_TTL_SECONDS, async () => {
    const { data: creator, error: creatorErr } = await timedQuery(
      log,
      "creators.select",
      () =>
        supabaseAdmin.from("creators").select("*").eq("id", creatorId).single(),
      { creatorId }
    );

    if (creatorErr || !creator) {
      throw new Error("Creator profile not found");
    }

    const creatorData: CreatorData = {
      niche: creator.niche,
      followers: creator.instagram_followers || 0,
      avgViews: creator.avg_views || 0,
      engagementRate: creator.instagram_engagement || 0,
      minRatePrivate: creator.min_rate_private || 0,
      verified: creator.verified || false,
    };

    if (creator.embedding) {
      try {
        const { data: matches, error: matchErr } = await timedQuery(
          log,
          "rpc.match_campaigns_for_creator",
          () =>
            supabaseAdmin.rpc("match_campaigns_for_creator", {
              query_embedding: creator.embedding,
              match_threshold: 0.3,
              match_count: 20,
            }),
          { creatorId }
        );

        if (!matchErr && matches && matches.length > 0) {
          const results: VectorMatchedCampaign[] = matches.map(
            (m: Record<string, unknown>) => {
              const campaignData: CampaignData = {
                niche: (m.niche as string) || "",
                budget: m.budget as number,
              };
              const hybrid = computeHybridScore(
                m.similarity as number,
                creatorData,
                campaignData
              );

              return {
                id: m.id as string,
                brandId: m.brand_id as string,
                title: m.title as string,
                description: m.description as string,
                deliverableType: m.deliverable_type as string,
                budget: m.budget as number,
                timeline: m.timeline as string,
                niche: (m.niche as string) || "",
                status: m.status as string,
                matchScore: hybrid.score,
                semanticScore: hybrid.semanticScore,
                matchReasons: hybrid.reasons,
              };
            }
          );

          return results
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);
        }
      } catch (err) {
        log.warn({ err, creatorId }, "vector_match.failed");
      }
    }

    const campaigns = await getOrSetJson<CampaignRow[]>(
      cacheKeys.activeCampaigns(),
      CAMPAIGN_TTL_SECONDS,
      async () => {
        const { data, error } = await timedQuery(
          log,
          "campaigns.select_active",
          () =>
            supabaseAdmin
              .from("campaigns")
              .select("*")
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(50),
          { creatorId }
        );

        if (error) throw new Error(error.message);
        return data || [];
      }
    );

    const results: VectorMatchedCampaign[] = (campaigns || []).map((c) => {
      const campaignData: CampaignData = {
        niche: c.niche || "",
        budget: c.budget,
      };
      const match = computeMatchScore(creatorData, campaignData);
      return {
        id: c.id,
        brandId: c.brand_id,
        title: c.title,
        description: c.description,
        deliverableType: c.deliverable_type,
        budget: c.budget,
        timeline: c.timeline,
        niche: c.niche || "",
        status: c.status,
        matchScore: match.score,
        semanticScore: 0,
        matchReasons: match.reasons,
      };
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  });
}

/**
 * Find creators matching a campaign using vector similarity + hybrid scoring.
 * Falls back to rule-based matching if embeddings are unavailable.
 */
export async function getVectorMatchedCreators(
  campaignId: string,
  log = logger
): Promise<VectorMatchedCreator[]> {
  const cacheKey = cacheKeys.campaignMatches(campaignId);

  return getOrSetJson(cacheKey, MATCH_TTL_SECONDS, async () => {
    const campaign = await getOrSetJson<CampaignRow>(
      cacheKeys.campaignById(campaignId),
      CAMPAIGN_TTL_SECONDS,
      async () => {
        const { data, error } = await timedQuery(
          log,
          "campaigns.select_by_id",
          () =>
            supabaseAdmin
              .from("campaigns")
              .select("*")
              .eq("id", campaignId)
              .single(),
          { campaignId }
        );

        if (error || !data) {
          throw new Error("Campaign not found");
        }
        return data;
      }
    );

    const campaignData: CampaignData = {
      niche: campaign.niche || "",
      budget: campaign.budget,
    };

    if (campaign.embedding) {
      try {
        const { data: matches, error: matchErr } = await timedQuery(
          log,
          "rpc.match_creators_for_campaign",
          () =>
            supabaseAdmin.rpc("match_creators_for_campaign", {
              query_embedding: campaign.embedding,
              match_threshold: 0.3,
              match_count: 20,
            }),
          { campaignId }
        );

        if (!matchErr && matches && matches.length > 0) {
          const creatorIds = matches.map((m: Record<string, unknown>) => m.id);
          const { data: rateData } = await timedQuery(
            log,
            "creators.select_min_rate_private",
            () =>
              supabaseAdmin
                .from("creators")
                .select("id, username, min_rate_private")
                .in("id", creatorIds),
            { campaignId }
          );

          const rateMap = new Map<string, number>();
          const usernameMap = new Map<string, string>();
          for (const r of rateData || []) {
            rateMap.set(r.id, r.min_rate_private || 0);
            if (r.username) usernameMap.set(r.id, r.username);
          }

          const results: VectorMatchedCreator[] = matches.map(
            (m: Record<string, unknown>) => {
              const creatorData: CreatorData = {
                niche: m.niche as string,
                followers: m.instagram_followers as number,
                avgViews: m.avg_views as number,
                engagementRate: Number(m.instagram_engagement) || 0,
                minRatePrivate: rateMap.get(m.id as string) || 0,
                verified: (m.verified as boolean) || false,
              };

              const hybrid = computeHybridScore(
                m.similarity as number,
                creatorData,
                campaignData
              );

              return {
                uid: m.id as string,
                username: usernameMap.get(m.id as string) || undefined,
                name: m.name as string,
                instagramHandle: (m.instagram_handle as string) || "",
                niche: m.niche as string,
                followers: m.instagram_followers as number,
                avgViews: m.avg_views as number,
                engagementRate: Number(m.instagram_engagement) || 0,
                verified: (m.verified as boolean) || false,
                matchScore: hybrid.score,
                semanticScore: hybrid.semanticScore,
                matchReasons: hybrid.reasons,
              };
            }
          );

          return results
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);
        }
      } catch (err) {
        log.warn({ err, campaignId }, "vector_match.failed");
      }
    }

    const { data: creatorsData, error: creatorsErr } = await timedQuery(
      log,
      "creators.select_fallback",
      () => supabaseAdmin.from("creators").select("*").limit(100),
      { campaignId }
    );

    if (creatorsErr) throw new Error(creatorsErr.message);

    const creators = (creatorsData || []) as CreatorRow[];
    const results: VectorMatchedCreator[] = creators.map((c) => {
      const creatorData: CreatorData = {
        niche: c.niche,
        followers: c.instagram_followers || 0,
        avgViews: c.avg_views || 0,
        engagementRate: c.instagram_engagement || 0,
        minRatePrivate: c.min_rate_private || 0,
        verified: c.verified || false,
      };
      const match = computeMatchScore(creatorData, campaignData);
      return {
        uid: c.id,
        username: c.username || undefined,
        name: c.name,
        instagramHandle: c.instagram_handle || "",
        niche: c.niche,
        followers: c.instagram_followers || 0,
        avgViews: c.avg_views || 0,
        engagementRate: c.instagram_engagement || 0,
        verified: c.verified || false,
        matchScore: match.score,
        semanticScore: 0,
        matchReasons: match.reasons,
      };
    });

    return results
      .filter((c) => c.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  });
}

/**
 * Perform ad-hoc vector search with a text query.
 * Useful for searching creators or campaigns by description.
 */
export async function searchCreatorsByQuery(
  query: string,
  limit: number = 10
): Promise<VectorMatchedCreator[]> {
  const queryEmbedding = await generateEmbedding(query);

  const { data: matches, error } = await supabaseAdmin.rpc(
    "match_creators_for_campaign",
    {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.4,
      match_count: limit,
    }
  );

  if (error) throw new Error(error.message);

  return (matches || []).map((m: Record<string, unknown>) => ({
    uid: m.id as string,
    username: (m.username as string) || undefined,
    name: m.name as string,
    instagramHandle: (m.instagram_handle as string) || "",
    niche: m.niche as string,
    followers: m.instagram_followers as number,
    avgViews: m.avg_views as number,
    engagementRate: Number(m.instagram_engagement) || 0,
    verified: (m.verified as boolean) || false,
    matchScore: semanticScoreFromSimilarity(m.similarity as number),
    semanticScore: semanticScoreFromSimilarity(m.similarity as number),
    matchReasons: ["Semantic search match"],
  }));
}

export async function searchCampaignsByQuery(
  query: string,
  limit: number = 10
): Promise<VectorMatchedCampaign[]> {
  const queryEmbedding = await generateEmbedding(query);

  const { data: matches, error } = await supabaseAdmin.rpc(
    "match_campaigns_for_creator",
    {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.4,
      match_count: limit,
    }
  );

  if (error) throw new Error(error.message);

  return (matches || []).map((m: Record<string, unknown>) => ({
    id: m.id as string,
    brandId: m.brand_id as string,
    title: m.title as string,
    description: m.description as string,
    deliverableType: m.deliverable_type as string,
    budget: m.budget as number,
    timeline: m.timeline as string,
    niche: (m.niche as string) || "",
    status: m.status as string,
    matchScore: semanticScoreFromSimilarity(m.similarity as number),
    semanticScore: semanticScoreFromSimilarity(m.similarity as number),
    matchReasons: ["Semantic search match"],
  }));
}
