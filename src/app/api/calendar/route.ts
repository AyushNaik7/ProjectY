/**
 * API Route: Calendar & Milestones
 *
 * GET /api/calendar — Get all milestones for current user
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const userClerkId = auth.user.id;

    // Get user role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userClerkId);
    const role = clerkUser.publicMetadata?.role as "creator" | "brand";

    if (!role) {
      const res = NextResponse.json(
        { error: "User role not set" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get user's brand_id or creator_id
    let userId: string | null = null;
    if (role === "brand") {
      const { data: brand } = await timedQuery(
        log,
        "brands.select_by_clerk_id",
        () =>
          supabaseAdmin
            .from("brands")
            .select("id")
            .eq("clerk_user_id", userClerkId)
            .single()
      );
      userId = brand?.id || null;
    } else {
      const { data: creator } = await timedQuery(
        log,
        "creators.select_by_clerk_id",
        () =>
          supabaseAdmin
            .from("creators")
            .select("id")
            .eq("clerk_user_id", userClerkId)
            .single()
      );
      userId = creator?.id || null;
    }

    if (!userId) {
      const res = NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch milestones with collaboration details
    const { data: milestones, error } = await timedQuery(
      log,
      "collab_milestones.select",
      () =>
        supabaseAdmin
          .from("collab_milestones")
          .select(`
            *,
            collaboration_requests!inner(
              id,
              campaign_id,
              brand_id,
              creator_id,
              campaigns(title),
              brands(name),
              creators(name)
            )
          `)
          .or(
            role === "brand"
              ? `collaboration_requests.brand_id.eq.${userId}`
              : `collaboration_requests.creator_id.eq.${userId}`
          )
          .order("due_date", { ascending: true })
    );

    if (error) throw error;

    // Format milestones for calendar
    const formattedMilestones = milestones?.map((milestone: any) => ({
      id: milestone.id,
      collaboration_request_id: milestone.collaboration_request_id,
      title: milestone.title,
      due_date: milestone.due_date,
      completed: milestone.completed,
      completed_at: milestone.completed_at,
      campaign_title: milestone.collaboration_requests.campaigns?.title,
      other_party_name:
        role === "brand"
          ? milestone.collaboration_requests.creators.name
          : milestone.collaboration_requests.brands.name,
    }));

    const res = NextResponse.json({ milestones: formattedMilestones || [] });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "get_calendar_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to fetch calendar" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
