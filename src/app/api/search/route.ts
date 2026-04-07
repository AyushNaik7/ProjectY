/**
 * API Route: Universal Search
 *
 * GET /api/search?q=[query]&type=[creators|campaigns|all] — Search across platform
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      const res = NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    let results: any = {
      creators: [],
      campaigns: [],
    };

    // Search creators
    if (type === "all" || type === "creators") {
      const { data: creators } = await timedQuery(
        log,
        "search_creators",
        () =>
          supabaseAdmin.rpc("search_creators", {
            p_query: query,
            p_limit: limit,
            p_offset: 0,
          })
      );

      results.creators = creators || [];
    }

    // Search campaigns
    if (type === "all" || type === "campaigns") {
      const { data: campaigns } = await timedQuery(
        log,
        "search_campaigns",
        () =>
          supabaseAdmin.rpc("search_campaigns", {
            p_query: query,
            p_limit: limit,
            p_offset: 0,
          })
      );

      results.campaigns = campaigns || [];
    }

    const res = NextResponse.json(results);
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "search_failed");
    const res = NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
