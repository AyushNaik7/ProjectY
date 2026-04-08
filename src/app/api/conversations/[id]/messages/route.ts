/**
 * API Route: Messages
 *
 * GET  /api/conversations/[id]/messages — Get paginated messages
 * POST /api/conversations/[id]/messages — Send a message
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

/* ── GET: Fetch paginated messages ── */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const conversationId = params.id;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor"); // created_at timestamp for cursor
    const limit = parseInt(searchParams.get("limit") || "30");

    // Verify user is participant
    const user = auth.user;
    const uid = user.id;

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

    // Fetch messages with cursor-based pagination
    let query = supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: messages, error } = await timedQuery(
      log,
      "messages.select_paginated",
      () => query
    );

    if (error) {
      log.error({ error }, "Failed to fetch messages");
      const res = NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Get sender names for messages
    const senderIds = Array.from(
      new Set((messages || []).map((m: any) => m.sender_id))
    );
    const senderNames: Record<string, string> = {};

    for (const senderId of senderIds) {
      try {
        const senderUser = await client.users.getUser(senderId);
        senderNames[senderId] =
          senderUser.firstName ||
          senderUser.username ||
          senderUser.emailAddresses[0]?.emailAddress ||
          "Unknown";
      } catch {
        senderNames[senderId] = "Unknown";
      }
    }

    const messagesWithSender = (messages || []).map((msg: any) => ({
      ...msg,
      sender_name: senderNames[msg.sender_id] || "Unknown",
    }));

    const safeMessages = messages || [];
    const nextCursor =
      safeMessages.length === limit
        ? safeMessages[safeMessages.length - 1].created_at
        : null;

    const res = NextResponse.json({
      messages: messagesWithSender,
      nextCursor,
      hasMore: safeMessages.length === limit,
    });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in GET messages");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

/* ── POST: Send a message ── */
export async function POST(
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

    const parsed = await parseJsonBody<{
      content: string;
      message_type?: "text" | "file" | "image";
      file_url?: string | null;
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const { content, message_type = "text", file_url } = parsed.data;

    if (!content || content.trim().length === 0) {
      const res = NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get user role and entity ID
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

    // Insert message
    const { data: message, error } = await timedQuery(
      log,
      "messages.insert",
      () =>
        supabaseAdmin
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: uid,
            sender_role: role,
            content: content.trim(),
            message_type,
            file_url,
          })
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to send message");
      const res = NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Trigger will auto-update conversation

    const res = NextResponse.json({ message });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST message");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
