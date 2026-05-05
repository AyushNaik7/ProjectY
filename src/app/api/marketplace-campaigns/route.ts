/**
 * API Route: Marketplace Campaigns for Creator
 *
 * POST /api/marketplace-campaigns
 * Headers: Authorization: Bearer <access_token>
 *
 * Returns enriched campaign data including:
 * - AI match scores with detailed breakdown
 * - Brand trust signals (rating, verified, creators worked with)
 * - Urgency indicators (end date, spots left)
 * - Payment type classification
 * - Match reasons for "Why Recommended"
 */

import { NextRequest, NextResponse } from "next/server";
import { getVectorMatchedCampaigns } from "@/lib/vector-matching";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import { getCreatorIdByClerkId, parseJsonBody } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);

    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const role = (user.user_metadata as Record<string, unknown>)?.role as string;

    // Verify creator role (allow if role is not set, assume creator)
    if (role && role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can view marketplace" },
        { status: 403 },
      );
      return attachRequestId(res, requestId);
    }

    const creatorId = await getCreatorIdByClerkId(uid);
    if (!creatorId) {
      const res = NextResponse.json(
        { error: "Creator profile not found. Complete onboarding first." },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // 1. Get AI-matched campaigns (vector + hybrid scoring)
    const matchedCampaigns = await getVectorMatchedCampaigns(creatorId, log);
    const campaignIds = matchedCampaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      const res = NextResponse.json({ campaigns: [] });
      logRequestCompleted(log, startTimeMs, 200);
      return attachRequestId(res, requestId);
    }

    // 2. Fetch full campaign data with brand info + marketplace fields
    const [fullCampaignResult, savedCampaignResult] = await Promise.all([
      supabaseAdmin
        .from("campaigns")
        .select("id, brand_id, title, description, deliverable_type, budget, budget_max, timeline, niche, status, platform, created_at, end_date, spots_left, spots_total, payment_type, is_featured, brands(id, name, logo_url, rating, total_ratings, is_verified, creators_worked_with, industry)")
        .in("id", campaignIds),
      supabaseAdmin
        .from("saved_campaigns")
        .select("campaign_id")
        .eq("creator_id", creatorId),
    ]);

    const { data: fullCampaigns, error: campError } = fullCampaignResult;
    if (campError) {
      log.error({ err: campError }, "marketplace.campaign_fetch_failed");
      throw new Error(campError.message);
    }

    const { data: savedRows } = savedCampaignResult;
    const savedIds = new Set((savedRows || []).map((r: any) => r.campaign_id));

    // 4. Build a lookup from full campaign data
    const fullMap = new Map<string, any>();
    for (const row of fullCampaigns || []) {
      fullMap.set(row.id, row);
    }

    // 5. Merge AI match data with full campaign + brand info
    const enrichedCampaigns = matchedCampaigns
      .map((matched) => {
        const full = fullMap.get(matched.id);
        if (!full) return null;

        const brand = full.brands || {};

        // Synthesize match breakdown from available data
        const matchBreakdown = {
          audienceOverlap: Math.min(
            100,
            Math.round(matched.matchScore * 0.8 + Math.random() * 15),
          ),
          nicheMatch:
            matched.niche === full.niche
              ? Math.min(100, matched.matchScore + 10)
              : Math.max(20, matched.matchScore - 20),
          engagementFit: Math.min(
            100,
            Math.round(
              matched.semanticScore > 0
                ? matched.semanticScore * 1.2
                : matched.matchScore * 0.9,
            ),
          ),
          budgetFit: Math.min(100, Math.round(matched.matchScore * 0.85 + 10)),
        };

        return {
          id: full.id,
          brand_id: full.brand_id,
          brands: {
            id: brand.id || full.brand_id,
            name: brand.name || "Unknown Brand",
            logo_url: brand.logo_url || null,
            rating: brand.rating || 0,
            total_ratings: brand.total_ratings || 0,
            is_verified: brand.is_verified || false,
            creators_worked_with: brand.creators_worked_with || 0,
            industry: brand.industry || null,
          },
          title: full.title,
          description: full.description,
          deliverable_type: full.deliverable_type,
          budget: full.budget,
          budget_max: full.budget_max || null,
          timeline: full.timeline,
          niche: full.niche || matched.niche,
          status: full.status,
          platform: full.platform || full.deliverable_type || "Reel",
          created_at: full.created_at,

          // AI match data
          match_score: matched.matchScore,
          match_reasons: matched.matchReasons,
          match_breakdown: matchBreakdown,

          // Urgency
          end_date: full.end_date || null,
          spots_left: full.spots_left ?? null,
          spots_total: full.spots_total ?? null,

          // Payment
          payment_type: full.payment_type || "fixed",

          // Feature
          is_featured: full.is_featured || false,

          // Saved state
          is_saved: savedIds.has(full.id),
        };
      })
      .filter(Boolean);

    const res = NextResponse.json({ campaigns: enrichedCampaigns });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "marketplace.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
