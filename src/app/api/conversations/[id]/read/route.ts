/**
 * API Route: Mark Conversation as Read
 *
 * PATCH /api/conversations/[id]/read — Mark all messages as read
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

    const conversationId = params.id;
    const user = auth.user;
    const uid = user.id;

    // Get user role
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
    } else {
      const { data: creator } = await supabaseAdmin
        .from("creators")
        .select("id")
        .eq("clerk_user_id", uid)
        .single();
      userEntityId = creator?.id;
    }

    // Verify conversation access
    const { data: conversation } = await timedQuery(
      log,
      "conversations.select_by_id",
      () =>
        supabaseAdmin
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single()
    );

    if (!conversation) {
      const res = NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    const isParticipant =
      (role === "brand" && conversation.brand_id === userEntityId) ||
      (role === "creator" && conversation.creator_id === userEntityId);

    if (!isParticipant) {
      const res = NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Update unread count
    const updateField = role === "brand" ? "unread_brand" : "unread_creator";
    const { error: updateError } = await timedQuery(
      log,
      "conversations.update_unread",
      () =>
        supabaseAdmin
          .from("conversations")
          .update({ [updateField]: 0 })
          .eq("id", conversationId)
    );

    if (updateError) {
      log.error({ error: updateError }, "Failed to mark as read");
      const res = NextResponse.json(
        { error: "Failed to mark as read" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Mark messages as read
    const { error: messagesError } = await timedQuery(
      log,
      "messages.update_read_at",
      () =>
        supabaseAdmin
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .neq("sender_id", uid)
          .is("read_at", null)
    );

    if (messagesError) {
      log.warn({ error: messagesError }, "Failed to update message read_at");
    }

    const res = NextResponse.json({ success: true });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in PATCH read");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
