/**
 * API Route: Get Matched Campaigns for Creator
 *
 * POST /api/matched-campaigns
 * Headers: Authorization: Bearer <access_token>
 *
 * Returns campaigns scored against creator profile.
 * minRatePrivate is used for scoring but NEVER returned to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";
import {
  computeMatchScore,
  CreatorData,
  CampaignData,
} from "@/lib/server-matching";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);
    const uid = user.id;

    // Verify creator role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "creator") {
      return NextResponse.json(
        { error: "Only creators can view matches" },
        { status: 403 }
      );
    }

    // Fetch creator profile
    const { data: creatorRow, error: creatorErr } = await supabaseAdmin
      .from("creators")
      .select("*")
      .eq("id", uid)
      .single();

    if (creatorErr || !creatorRow) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
    }

    const creator: CreatorData = {
      niche: creatorRow.niche,
      followers: creatorRow.instagram_followers || 0,
      avgViews: creatorRow.avg_views || 0,
      engagementRate: creatorRow.instagram_engagement || 0,
      minRatePrivate: creatorRow.min_rate_private || 0,
      verified: creatorRow.verified || false,
    };

    // Fetch active campaigns
    const { data: campaigns, error: campErr } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (campErr) {
      return NextResponse.json({ error: campErr.message }, { status: 500 });
    }

    const matchedCampaigns = (campaigns || []).map((c) => {
      const campaignData: CampaignData = {
        niche: c.niche || "",
        budget: c.budget,
      };
      const match = computeMatchScore(creator, campaignData);

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
        matchReasons: match.reasons,
      };
    });

    // Sort by match score, best first
    matchedCampaigns.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ campaigns: matchedCampaigns });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error fetching matched campaigns:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
