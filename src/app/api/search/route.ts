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
import { verifyAccessToken } from "@/lib/supabase-server";
import {
  searchCreatorsByQuery,
  searchCampaignsByQuery,
} from "@/lib/vector-matching";

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

    await verifyAccessToken(token);

    const body = await req.json();
    const { target, query, limit } = body;

    if (!target || !query) {
      return NextResponse.json(
        { error: 'Missing "target" or "query" field' },
        { status: 400 }
      );
    }

    if (typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
    }

    const resultLimit = Math.min(Math.max(limit || 10, 1), 50);

    switch (target) {
      case "creators": {
        const results = await searchCreatorsByQuery(query.trim(), resultLimit);
        return NextResponse.json({ creators: results });
      }
      case "campaigns": {
        const results = await searchCampaignsByQuery(query.trim(), resultLimit);
        return NextResponse.json({ campaigns: results });
      }
      default:
        return NextResponse.json(
          { error: `Invalid target: ${target}. Use "creators" or "campaigns"` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Search error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
