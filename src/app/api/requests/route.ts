/**
 * API Route: Update Request Status (Accept/Reject)
 *
 * PATCH /api/requests
 * Headers: Authorization: Bearer <access_token>
 * Body: { requestId, status: "accepted" | "rejected" }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);
    const uid = user.id;
    const body = await req.json();
    const { requestId, status } = body;

    // Verify creator role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "creator") {
      return NextResponse.json(
        { error: "Only creators can respond to requests" },
        { status: 403 }
      );
    }

    if (!requestId || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "requestId and status (accepted/rejected) required" },
        { status: 400 }
      );
    }

    // Fetch and validate the request
    const { data: requestData, error: fetchErr } = await supabaseAdmin
      .from("collaboration_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchErr || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify this creator owns the request
    if (requestData.creator_id !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only pending requests can be updated
    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: `Request is already ${requestData.status}` },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("collaboration_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error updating request:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
