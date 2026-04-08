/**
 * API Route: Portfolio Items
 *
 * POST /api/portfolio/items — Add portfolio item
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
        { error: "Only creators can add portfolio items" },
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
      title: string;
      description?: string;
      brand_worked_with?: string;
      campaign_type?: string;
      result_metric?: string;
      thumbnail_url?: string;
      content_url?: string;
      platform?: string;
      collab_month?: string;
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);

    const {
      title,
      description,
      brand_worked_with,
      campaign_type,
      result_metric,
      thumbnail_url,
      content_url,
      platform,
      collab_month,
    } = parsed.data;

    if (!title || title.trim().length === 0) {
      const res = NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get max display_order
    const { data: maxOrder } = await supabaseAdmin
      .from("portfolio_items")
      .select("display_order")
      .eq("creator_id", creator.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const display_order = maxOrder ? maxOrder.display_order + 1 : 0;

    // Insert portfolio item
    const { data: item, error } = await timedQuery(
      log,
      "portfolio_items.insert",
      () =>
        supabaseAdmin
          .from("portfolio_items")
          .insert({
            creator_id: creator.id,
            title: title.trim(),
            description,
            brand_worked_with,
            campaign_type,
            result_metric,
            thumbnail_url,
            content_url,
            platform,
            collab_month,
            display_order,
          })
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to add portfolio item");
      const res = NextResponse.json(
        { error: "Failed to add portfolio item" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ item });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST /api/portfolio/items");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
