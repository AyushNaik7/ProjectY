/**
 * API Route: Get Matched Campaigns for Creator
 *
 * POST /api/matched-campaigns
 * Headers: Authorization: Bearer <access_token>
 *
 * Uses AI vector embeddings (pgvector) for semantic similarity matching,
 * combined with hybrid scoring (engagement, budget, niche).
 * Falls back to rule-based scoring if embeddings are not yet generated.
 *
 * minRatePrivate is used for scoring but NEVER returned to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/supabase-server";
import { getVectorMatchedCampaigns } from "@/lib/vector-matching";

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

    // Use vector matching with hybrid scoring (falls back to rule-based)
    const campaigns = await getVectorMatchedCampaigns(uid);

    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error fetching matched campaigns:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
