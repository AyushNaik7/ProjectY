/**
 * API Route: Milestones
 *
 * POST /api/milestones — Add custom milestone to a collaboration
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const body = await req.json();
    const { collaboration_request_id, title, due_date } = body;

    if (!collaboration_request_id || !title || !due_date) {
      const res = NextResponse.json(
        { error: "collaboration_request_id, title, and due_date are required" },
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

    // Create milestone
    const { data: milestone, error } = await timedQuery(
      log,
      "collab_milestones.insert",
      () =>
        supabaseAdmin
          .from("collab_milestones")
          .insert({
            collaboration_request_id,
            title,
            due_date,
          })
          .select()
          .single()
    );

    if (error) throw error;

    const res = NextResponse.json({ milestone }, { status: 201 });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "create_milestone_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to create milestone" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
