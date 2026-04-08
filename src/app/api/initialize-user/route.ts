/**
 * API Route: Initialize User
 *
 * POST /api/initialize-user
 * Headers: Authorization: Bearer <access_token>
 * Body: { role: "creator" | "brand" }
 *
 * Stores/updates the user's role in Supabase user_metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import { parseJsonBody } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const parsed = await parseJsonBody<{ role: string }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const { role } = parsed.data;

    if (!["creator", "brand"].includes(role)) {
      const res = NextResponse.json(
        { error: "role (creator/brand) is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Update user metadata with the selected role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { role, onboarding_complete: false },
    });

    if (error) {
      const res = NextResponse.json({ error: error.message }, { status: 500 });
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "initialize_user.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
