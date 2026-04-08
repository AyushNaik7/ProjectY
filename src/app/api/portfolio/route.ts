/**
 * API Route: Portfolio Metadata
 *
 * POST  /api/portfolio — Create or update portfolio metadata
 * PATCH /api/portfolio — Update portfolio metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import { clerkClient } from "@clerk/nextjs/server";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";
import { parseJsonBody } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    // Verify creator role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role;

    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can update portfolio" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Get creator ID
    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("id")
      .eq("clerk_user_id", uid)
      .single();

    if (!creator) {
      const res = NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    const parsed = await parseJsonBody<{
      portfolio_headline?: string;
      portfolio_tagline?: string;
      audience_age_range?: string;
      audience_gender_split?: Record<string, unknown>;
      audience_top_cities?: string[];
      past_brands?: string[];
      content_themes?: string[];
      awards?: string[];
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);

    const {
      portfolio_headline,
      portfolio_tagline,
      audience_age_range,
      audience_gender_split,
      audience_top_cities,
      past_brands,
      content_themes,
      awards,
    } = parsed.data;

    // Update creator portfolio metadata
    const { data: updated, error } = await timedQuery(
      log,
      "creators.update_portfolio",
      () =>
        supabaseAdmin
          .from("creators")
          .update({
            portfolio_headline,
            portfolio_tagline,
            audience_age_range,
            audience_gender_split,
            audience_top_cities,
            past_brands,
            content_themes,
            awards,
            updated_at: new Date().toISOString(),
          })
          .eq("id", creator.id)
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to update portfolio");
      const res = NextResponse.json(
        { error: "Failed to update portfolio" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ portfolio: updated });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST /api/portfolio");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
