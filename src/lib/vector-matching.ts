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
  NICHE_GROUPS,
  type CreatorData,
  type CampaignData,
} from "@/lib/server-matching";

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

// ============================================================
// Hybrid Scoring: Combine Vector + Business Logic
// ============================================================

const WEIGHTS = {
  semantic: 0.4,
  engagement: 0.2,
  budget: 0.25,
  niche: 0.15,
};

function computeHybridScore(
  semanticSimilarity: number,
  creator: CreatorData,
  campaign: CampaignData
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Semantic similarity component (0-100)
  const semanticScore = Math.round(semanticSimilarity * 100);
  if (semanticScore >= 80) reasons.push("Highly relevant profile match");
  else if (semanticScore >= 60) reasons.push("Strong profile relevance");
  else if (semanticScore >= 40) reasons.push("Moderate profile relevance");

  // 2. Engagement component (0-1)
  let engagementScore = 0;
  if (creator.engagementRate >= 5) {
    engagementScore = 1.0;
    reasons.push("Exceptional engagement rate");
  } else if (creator.engagementRate >= 3) {
    engagementScore = 0.75;
    reasons.push("Strong engagement rate");
  } else if (creator.engagementRate >= 1.5) {
    engagementScore = 0.5;
    reasons.push("Good engagement rate");
  } else if (creator.engagementRate >= 0.5) {
    engagementScore = 0.25;
    reasons.push("Average engagement rate");
  }

  // Audience quality bonus
  const viewRatio = creator.avgViews / Math.max(creator.followers, 1);
  if (viewRatio >= 0.3) {
    engagementScore = Math.min(1, engagementScore + 0.15);
    reasons.push("Highly active audience");
  } else if (viewRatio >= 0.15) {
    engagementScore = Math.min(1, engagementScore + 0.08);
    reasons.push("Active audience");
  }

  // 3. Budget compatibility (0-1)
  let budgetScore = 0;
  if (creator.minRatePrivate <= campaign.budget) {
    const ratio = creator.minRatePrivate / Math.max(campaign.budget, 1);
    if (ratio >= 0.3 && ratio <= 0.8) {
      budgetScore = 1.0;
      reasons.push("Excellent budget fit");
    } else if (ratio < 0.3) {
      budgetScore = 0.6;
      reasons.push("Under budget");
    } else {
      budgetScore = 0.8;
      reasons.push("Budget compatible");
    }
  } else {
    const overRatio = creator.minRatePrivate / Math.max(campaign.budget, 1);
    if (overRatio <= 1.2) {
      budgetScore = 0.2;
      reasons.push("Slightly over budget");
    }
  }

  // 4. Niche alignment (0-1)
  let nicheScore = 0;
  if (campaign.niche === "Any" || creator.niche === campaign.niche) {
    nicheScore = 1.0;
    reasons.push("Perfect niche match");
  } else {
    const related = NICHE_GROUPS[campaign.niche] || [];
    if (related.includes(creator.niche)) {
      nicheScore = 0.5;
      reasons.push("Related niche");
    }
  }

  // Verification bonus
  if (creator.verified) {
    reasons.push("Verified creator");
  }

  // Weighted total
  const totalScore =
    WEIGHTS.semantic * semanticSimilarity +
    WEIGHTS.engagement * engagementScore +
    WEIGHTS.budget * budgetScore +
    WEIGHTS.niche * nicheScore;

  // Convert to 0-100 scale, add small verified bonus
  let finalScore = Math.round(totalScore * 100);
  if (creator.verified) finalScore = Math.min(100, finalScore + 3);

  return { score: finalScore, reasons };
}

// ============================================================
// Main Matching Functions
// ============================================================

/**
 * Find campaigns matching a creator using vector similarity + hybrid scoring.
 * Falls back to rule-based matching if embeddings are unavailable.
 */
export async function getVectorMatchedCampaigns(
  creatorId: string
): Promise<VectorMatchedCampaign[]> {
  // Fetch creator
  const { data: creator, error: creatorErr } = await supabaseAdmin
    .from("creators")
    .select("*")
    .eq("id", creatorId)
    .single();

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

  // Try vector matching first
  if (creator.embedding) {
    try {
      // Use the pgvector RPC function
      const { data: matches, error: matchErr } = await supabaseAdmin.rpc(
        "match_campaigns_for_creator",
        {
          query_embedding: creator.embedding,
          match_threshold: 0.3,
          match_count: 20,
        }
      );

      if (!matchErr && matches && matches.length > 0) {
        // Apply hybrid scoring
        const results: VectorMatchedCampaign[] = matches.map(
          (m: Record<string, unknown>) => {
            const campaignData: CampaignData = {
              niche: (m.niche as string) || "",
              budget: m.budget as number,
            };
            const { score, reasons } = computeHybridScore(
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
              matchScore: score,
              semanticScore: Math.round((m.similarity as number) * 100),
              matchReasons: reasons,
            };
          }
        );

        return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
      }
    } catch (err) {
      console.warn("Vector matching failed, falling back to rule-based:", err);
    }
  }

  // Fallback: rule-based matching (no embeddings)
  const { data: campaigns, error: campErr } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (campErr) throw new Error(campErr.message);

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
}

/**
 * Find creators matching a campaign using vector similarity + hybrid scoring.
 * Falls back to rule-based matching if embeddings are unavailable.
 */
export async function getVectorMatchedCreators(
  campaignId: string
): Promise<VectorMatchedCreator[]> {
  // Fetch campaign
  const { data: campaign, error: campErr } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campErr || !campaign) {
    throw new Error("Campaign not found");
  }

  const campaignData: CampaignData = {
    niche: campaign.niche || "",
    budget: campaign.budget,
  };

  // Try vector matching
  if (campaign.embedding) {
    try {
      const { data: matches, error: matchErr } = await supabaseAdmin.rpc(
        "match_creators_for_campaign",
        {
          query_embedding: campaign.embedding,
          match_threshold: 0.3,
          match_count: 20,
        }
      );

      if (!matchErr && matches && matches.length > 0) {
        // Fetch min_rate_private separately (not in the RPC result for security)
        const creatorIds = matches.map((m: Record<string, unknown>) => m.id);
        const { data: rateData } = await supabaseAdmin
          .from("creators")
          .select("id, min_rate_private")
          .in("id", creatorIds);

        const rateMap = new Map<string, number>();
        for (const r of rateData || []) {
          rateMap.set(r.id, r.min_rate_private || 0);
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

            const { score, reasons } = computeHybridScore(
              m.similarity as number,
              creatorData,
              campaignData
            );

            return {
              uid: m.id as string,
              name: m.name as string,
              instagramHandle: (m.instagram_handle as string) || "",
              niche: m.niche as string,
              followers: m.instagram_followers as number,
              avgViews: m.avg_views as number,
              engagementRate: Number(m.instagram_engagement) || 0,
              verified: (m.verified as boolean) || false,
              matchScore: score,
              semanticScore: Math.round((m.similarity as number) * 100),
              matchReasons: reasons,
            };
          }
        );

        return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
      }
    } catch (err) {
      console.warn("Vector matching failed, falling back to rule-based:", err);
    }
  }

  // Fallback: rule-based
  const { data: creators, error: creatorsErr } = await supabaseAdmin
    .from("creators")
    .select("*")
    .limit(100);

  if (creatorsErr) throw new Error(creatorsErr.message);

  const results: VectorMatchedCreator[] = (creators || []).map((c) => {
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
    name: m.name as string,
    instagramHandle: (m.instagram_handle as string) || "",
    niche: m.niche as string,
    followers: m.instagram_followers as number,
    avgViews: m.avg_views as number,
    engagementRate: Number(m.instagram_engagement) || 0,
    verified: (m.verified as boolean) || false,
    matchScore: Math.round((m.similarity as number) * 100),
    semanticScore: Math.round((m.similarity as number) * 100),
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
    matchScore: Math.round((m.similarity as number) * 100),
    semanticScore: Math.round((m.similarity as number) * 100),
    matchReasons: ["Semantic search match"],
  }));
}
