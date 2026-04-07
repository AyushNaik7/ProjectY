/**
 * API Route: Approve Deliverable
 *
 * PATCH /api/deliverables/[id]/approve — Brand approves deliverable
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
        { error: "Only the brand can approve deliverables" },
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
            status: "approved",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", deliverableId)
          .select()
          .single()
    );

    if (error) throw error;

    // Update collaboration request status to completed
    await supabaseAdmin
      .from("collaboration_requests")
      .update({ status: "completed" })
      .eq("id", deliverable.collaboration_request_id);

    // Create notification for creator
    await supabaseAdmin.from("notifications").insert({
      user_clerk_id: deliverable.collaboration_requests.creators.clerk_user_id,
      type: "deliverable_approved",
      title: "Content Approved!",
      body: "Your submitted content has been approved",
      action_url: `/requests/${deliverable.collaboration_request_id}`,
    });

    // Trigger payment release if payment exists
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("collaboration_request_id", deliverable.collaboration_request_id)
      .eq("status", "escrowed")
      .single();

    if (payment) {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Notify creator of payment release
      await supabaseAdmin.from("notifications").insert({
        user_clerk_id: deliverable.collaboration_requests.creators.clerk_user_id,
        type: "payment_received",
        title: "Payment Released",
        body: `₹${payment.creator_payout.toLocaleString()} has been released to you`,
        action_url: `/dashboard/creator/payments`,
      });
    }

    const res = NextResponse.json({ deliverable: updated });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "approve_deliverable_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to approve deliverable" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
