/**
 * API Route: Portfolio Item Operations
 *
 * PATCH  /api/portfolio/items/[id] — Update or reorder item
 * DELETE /api/portfolio/items/[id] — Delete item
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const itemId = params.id;

    // Verify creator role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role;

    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can update portfolio items" },
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

    // Verify ownership
    const { data: item } = await supabaseAdmin
      .from("portfolio_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (!item || item.creator_id !== creator.id) {
      const res = NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    const body = await req.json();

    // Update item
    const { data: updated, error } = await timedQuery(
      log,
      "portfolio_items.update",
      () =>
        supabaseAdmin
          .from("portfolio_items")
          .update(body)
          .eq("id", itemId)
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to update portfolio item");
      const res = NextResponse.json(
        { error: "Failed to update portfolio item" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ item: updated });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in PATCH portfolio item");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const itemId = params.id;

    // Verify creator role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role;

    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can delete portfolio items" },
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

    // Verify ownership and delete
    const { error } = await timedQuery(log, "portfolio_items.delete", () =>
      supabaseAdmin
        .from("portfolio_items")
        .delete()
        .eq("id", itemId)
        .eq("creator_id", creator.id)
    );

    if (error) {
      log.error({ error }, "Failed to delete portfolio item");
      const res = NextResponse.json(
        { error: "Failed to delete portfolio item" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in DELETE portfolio item");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
