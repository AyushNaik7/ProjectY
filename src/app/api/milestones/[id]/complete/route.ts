/**
 * API Route: Complete Milestone
 *
 * PATCH /api/milestones/[id]/complete — Mark milestone as complete
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

    const milestoneId = params.id;

    // Fetch milestone with collaboration details
    const { data: milestone } = await timedQuery(
      log,
      "collab_milestones.select",
      () =>
        supabaseAdmin
          .from("collab_milestones")
          .select(`
            *,
            collaboration_requests!inner(
              brands!inner(clerk_user_id),
              creators!inner(clerk_user_id)
            )
          `)
          .eq("id", milestoneId)
          .single()
    );

    if (!milestone) {
      const res = NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user has access
    const userClerkId = auth.user.id;
    const hasAccess =
      milestone.collaboration_requests.brands.clerk_user_id === userClerkId ||
      milestone.collaboration_requests.creators.clerk_user_id === userClerkId;

    if (!hasAccess) {
      const res = NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Update milestone
    const { data: updated, error } = await timedQuery(
      log,
      "collab_milestones.update",
      () =>
        supabaseAdmin
          .from("collab_milestones")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestoneId)
          .select()
          .single()
    );

    if (error) throw error;

    const res = NextResponse.json({ milestone: updated });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "complete_milestone_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to complete milestone" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
