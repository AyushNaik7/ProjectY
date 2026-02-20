/**
 * API Route: Semantic Search
 * POST /api/search
 *
 * Performs vector similarity search across creators or campaigns.
 *
 * Body:
 *   { target: "creators", query: "fashion influencer with high engagement" }
 *   { target: "campaigns", query: "tech product launch for YouTube" }
 *
 * Headers: Authorization: Bearer <access_token>
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import {
  searchCreatorsByQuery,
  searchCampaignsByQuery,
} from "@/lib/vector-matching";
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

    const body = await req.json();
    const { target, query, limit } = body;

    if (!target || !query) {
      const res = NextResponse.json(
        { error: 'Missing "target" or "query" field' },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    if (typeof query !== "string" || query.trim().length < 3) {
      const res = NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    const resultLimit = Math.min(Math.max(limit || 10, 1), 50);

    switch (target) {
      case "creators": {
        const results = await searchCreatorsByQuery(query.trim(), resultLimit);
        const res = NextResponse.json({ creators: results });
        logRequestCompleted(log, startTimeMs, 200);
        return attachRequestId(res, requestId);
      }
      case "campaigns": {
        const results = await searchCampaignsByQuery(query.trim(), resultLimit);
        const res = NextResponse.json({ campaigns: results });
        logRequestCompleted(log, startTimeMs, 200);
        return attachRequestId(res, requestId);
      }
      default:
        const res = NextResponse.json(
          { error: `Invalid target: ${target}. Use "creators" or "campaigns"` },
          { status: 400 }
        );
        return attachRequestId(res, requestId);
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "search.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
