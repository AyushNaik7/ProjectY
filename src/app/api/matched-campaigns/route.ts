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
import { getVectorMatchedCampaigns } from "@/lib/vector-matching";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    // Verify creator role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can view matches" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Use vector matching with hybrid scoring (falls back to rule-based)
    const campaigns = await getVectorMatchedCampaigns(uid, log);

    const res = NextResponse.json({ campaigns });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "matched_campaigns.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
