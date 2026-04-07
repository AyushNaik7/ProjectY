/**
 * API Route: Creator Portfolio
 *
 * GET /api/creators/[id]/portfolio — Get full portfolio data
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { requestId, log } = createRequestContext(req);

  try {
    const creatorId = params.id;

    // Fetch creator with portfolio data
    const { data: creator, error: creatorError } = await timedQuery(
      log,
      "creators.select_portfolio",
      () =>
        supabaseAdmin
          .from("creators")
          .select(
            `
            *,
            portfolio_items (*)
          `
          )
          .eq("id", creatorId)
          .single()
    );

    if (creatorError || !creator) {
      const res = NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Sort portfolio items by display_order
    if (creator.portfolio_items) {
      creator.portfolio_items.sort(
        (a: any, b: any) => a.display_order - b.display_order
      );
    }

    const res = NextResponse.json({ portfolio: creator });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in GET portfolio");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
