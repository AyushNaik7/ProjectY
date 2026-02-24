/**
 * API Route: Collaboration Requests
 *
 * POST   /api/requests — Create a new collaboration request (brand only)
 * PATCH  /api/requests — Update request status:
 *          Brand: pending → brand_approved (verify/approve the request)
 *          Creator: brand_approved → accepted | rejected
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

/* ── POST: brand sends a collaboration request ── */
export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const body = await req.json();
    const { creatorId, campaignId, message } = body;

    // Verify brand role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      const res = NextResponse.json(
        { error: "Only brands can send collaboration requests" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    if (!creatorId) {
      const res = NextResponse.json(
        { error: "creatorId is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // If campaignId provided, verify brand owns the campaign
    if (campaignId) {
      const { data: campaign, error: campErr } = await timedQuery(
        log,
        "campaigns.select_owner",
        () =>
          supabaseAdmin
            .from("campaigns")
            .select("id, brand_id")
            .eq("id", campaignId)
            .single(),
        { brandId: uid }
      );

      if (campErr || !campaign) {
        const res = NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
        return attachRequestId(res, requestId);
      }
      if (campaign.brand_id !== uid) {
        const res = NextResponse.json(
          { error: "You don't own this campaign" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
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
      const res = NextResponse.json(
        { error: "A pending request already exists for this creator" },
        { status: 409 }
      );
      return attachRequestId(res, requestId);
    }

    // Build insert payload — campaignId may be null for a general request
    const insertPayload: Record<string, unknown> = {
      brand_id: uid,
      creator_id: creatorId,
      status: "pending",
      message: typeof message === "string" ? message.trim() : "",
    };
    if (campaignId) insertPayload.campaign_id = campaignId;

    const { data, error } = await timedQuery(
      log,
      "collaboration_requests.insert",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .insert(insertPayload)
          .select("id")
          .single(),
      { brandId: uid }
    );

    if (error) {
      const res = NextResponse.json({ error: error.message }, { status: 500 });
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true, requestId: data.id });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "requests.create_failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}

/* ── PATCH: update request status (brand approves, creator accepts/rejects) ── */
export async function PATCH(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const body = await req.json();
    const { requestId: bodyRequestId, status } = body;

    const role = (user.user_metadata as Record<string, unknown>)?.role;

    if (!bodyRequestId || !status) {
      const res = NextResponse.json(
        { error: "requestId and status are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch the request
    const { data: requestData, error: fetchErr } = await timedQuery(
      log,
      "collaboration_requests.select_by_id",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .select("*")
          .eq("id", bodyRequestId)
          .single(),
      { userId: uid }
    );

    if (fetchErr || !requestData) {
      const res = NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // ── Brand flow: approve a pending request ──
    if (role === "brand") {
      if (status !== "brand_approved") {
        const res = NextResponse.json(
          { error: "Brands can only set status to brand_approved" },
          { status: 400 }
        );
        return attachRequestId(res, requestId);
      }

      // Verify this brand owns the request
      if (requestData.brand_id !== uid) {
        const res = NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
      }

      // Only pending requests can be approved
      if (requestData.status !== "pending") {
        const res = NextResponse.json(
          { error: `Request is already ${requestData.status}` },
          { status: 400 }
        );
        return attachRequestId(res, requestId);
      }

      const { error: updateErr } = await timedQuery(
        log,
        "collaboration_requests.brand_approve",
        () =>
          supabaseAdmin
            .from("collaboration_requests")
            .update({ status: "brand_approved", updated_at: new Date().toISOString() })
            .eq("id", bodyRequestId),
        { brandId: uid }
      );

      if (updateErr) {
        const res = NextResponse.json(
          { error: updateErr.message },
          { status: 500 }
        );
        return attachRequestId(res, requestId);
      }

      const res = NextResponse.json({ success: true });
      logRequestCompleted(log, startTimeMs, 200);
      return attachRequestId(res, requestId);
    }

    // ── Creator flow: accept/reject a brand_approved request ──
    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only brands or creators can update requests" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    if (!["accepted", "rejected"].includes(status)) {
      const res = NextResponse.json(
        { error: "Creators can only set status to accepted or rejected" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify this creator owns the request
    if (requestData.creator_id !== uid) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return attachRequestId(res, requestId);
    }

    // Only brand_approved requests can be accepted/rejected by creators
    if (requestData.status !== "brand_approved") {
      const res = NextResponse.json(
        {
          error:
            requestData.status === "pending"
              ? "This request is still pending brand approval. You can accept only after the brand verifies it."
              : `Request is already ${requestData.status}`,
        },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    const { error: updateErr } = await timedQuery(
      log,
      "collaboration_requests.update_status",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", bodyRequestId),
      { creatorId: uid }
    );

    if (updateErr) {
      const res = NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ success: true });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "requests.update_failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
