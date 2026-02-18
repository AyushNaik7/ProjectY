/**
 * API Route: Get Creators for Campaign
 *
 * POST /api/creators-for-campaign
 * Headers: Authorization: Bearer <access_token>
 * Body: { campaignId }
 *
 * Uses AI vector embeddings (pgvector) for semantic similarity matching,
 * combined with hybrid scoring (engagement, budget, niche).
 * Falls back to rule-based scoring if embeddings are not yet generated.
 *
 * NEVER returns minRatePrivate to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";
import { getVectorMatchedCreators } from "@/lib/vector-matching";

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

    // Ensure brand owns the campaign
    const { data: campaign, error: campErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, brand_id")
      .eq("id", campaignId)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.brand_id !== uid) {
      return NextResponse.json(
        { error: "Unauthorized access to campaign" },
        { status: 403 }
      );
    }

    // Use vector matching with hybrid scoring (falls back to rule-based)
    const creators = await getVectorMatchedCreators(campaignId);

    return NextResponse.json({ creators });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error fetching matched creators:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
