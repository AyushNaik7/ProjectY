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
import { supabaseAdmin } from "@/lib/supabase-server";
import { getVectorMatchedCreators } from "@/lib/vector-matching";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import { getBrandIdByClerkId, parseJsonBody } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const parsed = await parseJsonBody<{ campaignId: string }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const { campaignId } = parsed.data;

    if (!campaignId) {
      const res = NextResponse.json(
        { error: "Missing campaignId" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify brand role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      const res = NextResponse.json(
        { error: "Only brands can view creator matches" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    const brandId = await getBrandIdByClerkId(uid);
    if (!brandId) {
      const res = NextResponse.json(
        { error: "Brand profile not found. Complete onboarding first." },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Ensure brand owns the campaign
    const { data: campaign, error: campErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, brand_id")
      .eq("id", campaignId)
      .single();

    if (campErr || !campaign) {
      const res = NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    if (campaign.brand_id !== brandId) {
      const res = NextResponse.json(
        { error: "Unauthorized access to campaign" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Use vector matching with hybrid scoring (falls back to rule-based)
    const creators = await getVectorMatchedCreators(campaignId, log);

    const res = NextResponse.json({ creators });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "creators_for_campaign.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
