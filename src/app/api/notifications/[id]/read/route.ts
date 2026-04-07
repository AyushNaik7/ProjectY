/**
 * API Route: Mark Single Notification as Read
 *
 * PATCH /api/notifications/[id]/read — Mark notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
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
    const notificationId = params.id;

    // Verify ownership and update
    const { error } = await timedQuery(
      log,
      "notifications.update_read",
      () =>
        supabaseAdmin
          .from("notifications")
          .update({ read: true })
          .eq("id", notificationId)
          .eq("user_clerk_id", uid)
    );

    if (error) {
      log.error({ error }, "Failed to mark notification as read");
      const res = NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in PATCH notification read");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
