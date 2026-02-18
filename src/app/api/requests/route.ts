/**
 * API Route: Collaboration Requests
 *
 * POST   /api/requests — Create a new collaboration request (brand only)
 * PATCH  /api/requests — Accept or reject a request (creator only)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/* ── POST: brand sends a collaboration request ── */
export async function POST(req: NextRequest) {
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
    const { creatorId, campaignId, message } = body;

    // Verify brand role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      return NextResponse.json(
        { error: "Only brands can send collaboration requests" },
        { status: 403 }
      );
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: "creatorId is required" },
        { status: 400 }
      );
    }

    // If campaignId provided, verify brand owns the campaign
    if (campaignId) {
      const { data: campaign, error: campErr } = await supabaseAdmin
        .from("campaigns")
        .select("id, brand_id")
        .eq("id", campaignId)
        .single();

      if (campErr || !campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }
      if (campaign.brand_id !== uid) {
        return NextResponse.json(
          { error: "You don't own this campaign" },
          { status: 403 }
        );
      }
    }

    // Check for duplicate pending request
    const dupQuery = supabaseAdmin
      .from("collaboration_requests")
      .select("id")
      .eq("brand_id", uid)
      .eq("creator_id", creatorId)
      .eq("status", "pending");
    if (campaignId) dupQuery.eq("campaign_id", campaignId);
    const { data: existing } = await dupQuery.limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "A pending request already exists for this creator" },
        { status: 409 }
      );
    }

    // Build insert payload — campaignId may be null for a general request
    const insertPayload: Record<string, unknown> = {
      brand_id: uid,
      creator_id: creatorId,
      status: "pending",
      message: typeof message === "string" ? message.trim() : "",
    };
    if (campaignId) insertPayload.campaign_id = campaignId;

    const { data, error } = await supabaseAdmin
      .from("collaboration_requests")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requestId: data.id });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error creating request:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ── PATCH: creator accepts/rejects a collaboration request ── */
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
