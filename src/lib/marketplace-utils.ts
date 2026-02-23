// Marketplace utility functions — filtering, sorting, transformations

import type {
  MarketplaceCampaign,
  MarketplaceFilters,
} from "./marketplace-types";

/**
 * Apply all client-side filters to a list of marketplace campaigns.
 */
export function applyFilters(
  campaigns: MarketplaceCampaign[],
  filters: MarketplaceFilters,
): MarketplaceCampaign[] {
  return campaigns.filter((c) => {
    // Budget range
    if (c.budget < filters.budgetMin) return false;
    const upper = c.budgetMax ?? c.budget;
    if (upper > filters.budgetMax && filters.budgetMax < 500000) return false;

    // Platform
    if (filters.platforms.length > 0 && !filters.platforms.includes(c.platform))
      return false;

    // Category / niche
    if (filters.categories.length > 0 && !filters.categories.includes(c.niche))
      return false;

    // High match only
    if (filters.highMatchOnly && c.matchScore < 80) return false;

    // Negotiable only
    if (filters.negotiableOnly && c.paymentType !== "negotiable") return false;

    // Search query (title, description, brand name, niche)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const haystack = [c.title, c.description, c.brand.name, c.niche]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Find the index of the best-matched campaign in the list.
 * Returns -1 if no campaigns.
 */
export function findBestMatchIndex(campaigns: MarketplaceCampaign[]): number {
  if (campaigns.length === 0) return -1;
  let bestIdx = 0;
  for (let i = 1; i < campaigns.length; i++) {
    if (campaigns[i].matchScore > campaigns[bestIdx].matchScore) {
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Sort campaigns by match score (descending), then by budget (descending).
 */
export function sortCampaigns(
  campaigns: MarketplaceCampaign[],
): MarketplaceCampaign[] {
  return [...campaigns].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.budget - a.budget;
  });
}

/**
 * Transform raw Supabase row into MarketplaceCampaign.
 */
export function mapRowToMarketplaceCampaign(row: any): MarketplaceCampaign {
  const brand = row.brands || {};

  return {
    id: row.id,
    brandId: row.brand_id,
    brand: {
      id: brand.id || row.brand_id,
      name: brand.name || "Unknown Brand",
      logoUrl: brand.logo_url || undefined,
      rating: Number(brand.rating) || 0,
      totalRatings: Number(brand.total_ratings) || 0,
      isVerified: Boolean(brand.is_verified),
      creatorsWorkedWith: Number(brand.creators_worked_with) || 0,
      industry: brand.industry || undefined,
    },
    title: row.title,
    description: row.description || "",
    deliverableType: row.deliverable_type || "Reel",
    budget: Number(row.budget) || 0,
    budgetMax: row.budget_max ? Number(row.budget_max) : undefined,
    timeline: row.timeline || "",
    niche: row.niche || "",
    status: row.status || "active",
    platform: row.platform || row.deliverable_type || "Reel",
    createdAt: row.created_at,

    // AI match data (enriched server-side)
    matchScore: Number(row.match_score) || 0,
    matchReasons: Array.isArray(row.match_reasons) ? row.match_reasons : [],
    matchBreakdown: row.match_breakdown || {
      audienceOverlap: 0,
      nicheMatch: 0,
      engagementFit: 0,
      budgetFit: 0,
    },

    // Urgency
    endDate: row.end_date || undefined,
    spotsLeft: row.spots_left != null ? Number(row.spots_left) : undefined,
    spotsTotal: row.spots_total != null ? Number(row.spots_total) : undefined,
    isHighDemand:
      row.spots_left != null && row.spots_total != null
        ? (row.spots_total - row.spots_left) / row.spots_total > 0.7
        : false,

    // Payment
    paymentType: row.payment_type || "fixed",

    // Feature
    isFeatured: Boolean(row.is_featured),
  };
}
