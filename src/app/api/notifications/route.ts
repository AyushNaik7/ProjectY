/**
 * API Route: Notifications
 *
 * GET   /api/notifications — Get latest notifications for current user
 * PATCH /api/notifications/read-all — Mark all as read
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

/* ── GET: Fetch notifications ── */
export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch notifications
    const { data: notifications, error } = await timedQuery(
      log,
      "notifications.select",
      () =>
        supabaseAdmin
          .from("notifications")
          .select("*")
          .eq("user_clerk_id", uid)
          .order("created_at", { ascending: false })
          .limit(limit)
    );

    if (error) {
      log.error({ error }, "Failed to fetch notifications");
      const res = NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Count unread
    const unread_count = notifications.filter((n: any) => !n.read).length;

    const res = NextResponse.json({
      notifications,
      unread_count,
    });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in GET /api/notifications");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

/* ── PATCH: Mark all as read ── */
export async function PATCH(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    const { error } = await timedQuery(
      log,
      "notifications.update_all_read",
      () =>
        supabaseAdmin
          .from("notifications")
          .update({ read: true })
          .eq("user_clerk_id", uid)
          .eq("read", false)
    );

    if (error) {
      log.error({ error }, "Failed to mark all as read");
      const res = NextResponse.json(
        { error: "Failed to mark all as read" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in PATCH /api/notifications");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
