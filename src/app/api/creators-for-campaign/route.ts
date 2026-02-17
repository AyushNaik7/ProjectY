/**
 * API Route: Get Creators for Campaign
 *
 * POST /api/creators-for-campaign
 * Headers: Authorization: Bearer <access_token>
 * Body: { campaignId }
 *
 * Returns potential creators matched against a specific campaign.
 * NEVER returns minRatePrivate to the frontend.
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
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Missing campaignId" },
        { status: 400 }
      );
    }

    // Verify brand role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      return NextResponse.json(
        { error: "Only brands can view creator matches" },
        { status: 403 }
      );
    }

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Ensure brand owns the campaign
    if (campaign.brand_id !== uid) {
      return NextResponse.json(
        { error: "Unauthorized access to campaign" },
        { status: 403 }
      );
    }

    const campaignData: CampaignData = {
      niche: campaign.niche || "",
      budget: campaign.budget,
    };

    // Fetch creators (limit 100 for MVP)
    const { data: creators, error: creatorsErr } = await supabaseAdmin
      .from("creators")
      .select("*")
      .limit(100);

    if (creatorsErr) {
      return NextResponse.json({ error: creatorsErr.message }, { status: 500 });
    }

    const matchedCreators = (creators || []).map((c) => {
      const creatorData: CreatorData = {
        niche: c.niche,
        followers: c.instagram_followers || 0,
        avgViews: c.avg_views || 0,
        engagementRate: c.instagram_engagement || 0,
        minRatePrivate: c.min_rate_private || 0,
        verified: c.verified || false,
      };

      const match = computeMatchScore(creatorData, campaignData);

      // Return SANITIZED creator object — minRatePrivate excluded
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
        matchReasons: match.reasons,
      };
    });

    // Filter low scores and sort by best match
    const results = matchedCreators
      .filter((c) => c.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ creators: results });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error fetching matched creators:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
