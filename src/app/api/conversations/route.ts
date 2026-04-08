/**
 * API Route: Conversations
 *
 * GET  /api/conversations — List all conversations for current user
 * POST /api/conversations — Create or get existing conversation
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

/* ── GET: List all conversations for current user ── */
export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    // Get user role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role as "creator" | "brand";

    if (!role) {
      const res = NextResponse.json(
        { error: "User role not set" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get user's brand_id or creator_id
    let userId: string | null = null;
    if (role === "brand") {
      const { data: brand } = await timedQuery(
        log,
        "brands.select_by_clerk_id",
        () =>
          supabaseAdmin
            .from("brands")
            .select("id")
            .eq("clerk_user_id", uid)
            .single()
      );
      userId = brand?.id;
    } else {
      const { data: creator } = await timedQuery(
        log,
        "creators.select_by_clerk_id",
        () =>
          supabaseAdmin
            .from("creators")
            .select("id")
            .eq("clerk_user_id", uid)
            .single()
      );
      userId = creator?.id;
    }

    if (!userId) {
      const res = NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch conversations
    const query =
      role === "brand"
        ? supabaseAdmin
            .from("conversations")
            .select(
              `
              *,
              creator:creators!inner(id, name, instagram_handle),
              campaign:campaigns(id, title)
            `
            )
            .eq("brand_id", userId)
        : supabaseAdmin
            .from("conversations")
            .select(
              `
              *,
              brand:brands!inner(id, name, logo_url),
              campaign:campaigns(id, title)
            `
            )
            .eq("creator_id", userId);

    const { data: conversations, error } = await timedQuery(
      log,
      "conversations.select_with_details",
      () => query.order("updated_at", { ascending: false })
    );

    if (error) {
      log.error({ error }, "Failed to fetch conversations");
      const res = NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Format response
    const formatted = (conversations || []).map((conv: any) => ({
      id: conv.id,
      brand_id: conv.brand_id,
      creator_id: conv.creator_id,
      campaign_id: conv.campaign_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message_preview: conv.last_message_preview,
      unread_count: role === "brand" ? conv.unread_brand : conv.unread_creator,
      other_party_name:
        role === "brand" ? conv.creator?.name : conv.brand?.name,
      other_party_avatar:
        role === "brand" ? null : conv.brand?.logo_url,
      other_party_handle:
        role === "brand" ? conv.creator?.instagram_handle : null,
      campaign_title: conv.campaign?.title,
    }));

    const res = NextResponse.json({ conversations: formatted });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in GET /api/conversations");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

/* ── POST: Create or get existing conversation ── */
export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    const parsed = await parseJsonBody<{
      brand_id: string;
      creator_id: string;
      campaign_id?: string | null;
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const { brand_id, creator_id, campaign_id } = parsed.data;

    if (!brand_id || !creator_id) {
      const res = NextResponse.json(
        { error: "brand_id and creator_id are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user is one of the participants
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role as "creator" | "brand";

    let userEntityId: string | null = null;
    if (role === "brand") {
      const { data: brand } = await supabaseAdmin
        .from("brands")
        .select("id")
        .eq("clerk_user_id", uid)
        .single();
      userEntityId = brand?.id;
      if (userEntityId !== brand_id) {
        const res = NextResponse.json(
          { error: "You can only create conversations for your own brand" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
      }
    } else {
      const { data: creator } = await supabaseAdmin
        .from("creators")
        .select("id")
        .eq("clerk_user_id", uid)
        .single();
      userEntityId = creator?.id;
      if (userEntityId !== creator_id) {
        const res = NextResponse.json(
          { error: "You can only create conversations for your own profile" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
      }
    }

    // Check if conversation already exists
    const { data: existing } = await timedQuery(
      log,
      "conversations.select_existing",
      () =>
        supabaseAdmin
          .from("conversations")
          .select("*")
          .eq("brand_id", brand_id)
          .eq("creator_id", creator_id)
          .eq("campaign_id", campaign_id || null)
          .maybeSingle()
    );

    if (existing) {
      const res = NextResponse.json({ conversation: existing });
      return attachRequestId(res, requestId);
    }

    // Create new conversation
    const { data: newConversation, error } = await timedQuery(
      log,
      "conversations.insert",
      () =>
        supabaseAdmin
          .from("conversations")
          .insert({
            brand_id,
            creator_id,
            campaign_id: campaign_id || null,
          })
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to create conversation");
      const res = NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ conversation: newConversation });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST /api/conversations");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
