/**
 * API Route: Deliverables
 *
 * GET  /api/deliverables?request_id= — List deliverables for a collaboration
 * POST /api/deliverables — Submit new deliverable
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";
import { parseJsonBody } from "@/lib/api-utils";

/* ── GET: List deliverables for a collaboration ── */
export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const { searchParams } = new URL(req.url);
    const collaborationRequestId = searchParams.get("request_id");

    if (!collaborationRequestId) {
      const res = NextResponse.json(
        { error: "request_id is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user has access to this collaboration
    const { data: collab } = await timedQuery(
      log,
      "collaboration_requests.select",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .select("*, brands!inner(clerk_user_id), creators!inner(clerk_user_id)")
          .eq("id", collaborationRequestId)
          .single()
    );

    if (!collab) {
      const res = NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    const userClerkId = auth.user.id;
    const hasAccess =
      collab.brands.clerk_user_id === userClerkId ||
      collab.creators.clerk_user_id === userClerkId;

    if (!hasAccess) {
      const res = NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch deliverables
    const { data: deliverables, error } = await timedQuery(
      log,
      "deliverables.select",
      () =>
        supabaseAdmin
          .from("deliverables")
          .select("*")
          .eq("collaboration_request_id", collaborationRequestId)
          .order("submission_number", { ascending: false })
    );

    if (error) {
      const res = NextResponse.json(
        { error: error.message || "Failed to fetch deliverables" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    const res = NextResponse.json({ deliverables: deliverables || [] });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "get_deliverables_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to fetch deliverables" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

/* ── POST: Submit new deliverable ── */
export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const parsed = await parseJsonBody<{
      collaboration_request_id: string;
      content_url: string;
      content_type: string;
      caption?: string;
      hashtags?: string[];
      submission_notes?: string;
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);

    const {
      collaboration_request_id,
      content_url,
      content_type,
      caption,
      hashtags,
      submission_notes,
    } = parsed.data;

    if (!collaboration_request_id || !content_url || !content_type) {
      const res = NextResponse.json(
        { error: "collaboration_request_id, content_url, and content_type are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user is the creator of this collaboration
    const { data: collab } = await timedQuery(
      log,
      "collaboration_requests.select",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .select("*, creators!inner(clerk_user_id)")
          .eq("id", collaboration_request_id)
          .single()
    );

    if (!collab) {
      const res = NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    if (collab.creators.clerk_user_id !== auth.user.id) {
      const res = NextResponse.json(
        { error: "Only the creator can submit deliverables" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Create deliverable
    const { data: deliverable, error } = await timedQuery(
      log,
      "deliverables.insert",
      () =>
        supabaseAdmin
          .from("deliverables")
          .insert({
            collaboration_request_id,
            content_url,
            content_type,
            caption,
            hashtags,
            submission_notes,
            status: "submitted",
          })
          .select()
          .single()
    );

    if (error) {
      const res = NextResponse.json(
        { error: error.message || "Failed to submit deliverable" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Create notification for brand
    await supabaseAdmin.from("notifications").insert({
      user_clerk_id: collab.brands.clerk_user_id,
      type: "new_deliverable",
      title: "New Content Submitted",
      body: `${collab.creators.name} has submitted content for review`,
      action_url: `/requests/${collaboration_request_id}`,
    });

    const res = NextResponse.json({ deliverable }, { status: 201 });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "submit_deliverable_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to submit deliverable" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
