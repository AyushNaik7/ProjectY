/**
 * API Route: Request Revision
 *
 * PATCH /api/deliverables/[id]/revision — Brand requests revision
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

    const deliverableId = params.id;
    const body = await req.json();
    const { revision_notes } = body;

    if (!revision_notes) {
      const res = NextResponse.json(
        { error: "revision_notes is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch deliverable with collaboration details
    const { data: deliverable } = await timedQuery(
      log,
      "deliverables.select",
      () =>
        supabaseAdmin
          .from("deliverables")
          .select(`
            *,
            collaboration_requests!inner(
              *,
              brands!inner(clerk_user_id),
              creators!inner(clerk_user_id, name)
            )
          `)
          .eq("id", deliverableId)
          .single()
    );

    if (!deliverable) {
      const res = NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user is the brand
    if (deliverable.collaboration_requests.brands.clerk_user_id !== auth.user.id) {
      const res = NextResponse.json(
        { error: "Only the brand can request revisions" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Update deliverable status
    const { data: updated, error } = await timedQuery(
      log,
      "deliverables.update",
      () =>
        supabaseAdmin
          .from("deliverables")
          .update({
            status: "revision_requested",
            revision_notes,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", deliverableId)
          .select()
          .single()
    );

    if (error) throw error;

    // Create notification for creator
    await supabaseAdmin.from("notifications").insert({
      user_clerk_id: deliverable.collaboration_requests.creators.clerk_user_id,
      type: "revision_requested",
      title: "Revision Requested",
      body: "The brand has requested changes to your submitted content",
      action_url: `/requests/${deliverable.collaboration_request_id}`,
    });

    const res = NextResponse.json({ deliverable: updated });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "request_revision_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to request revision" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
