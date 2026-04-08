/**
 * API Route: Reviews
 *
 * POST /api/reviews — Submit a review
 * GET  /api/reviews — Get reviews for a target
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import { clerkClient } from "@clerk/nextjs/server";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";
import { parseJsonBody } from "@/lib/api-utils";

/* ── POST: Submit a review ── */
export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;

    const parsed = await parseJsonBody<{
      collaboration_request_id: string;
      rating: number;
      review_text?: string;
      is_public?: boolean;
    }>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const {
      collaboration_request_id,
      rating,
      review_text,
      is_public = true,
    } = parsed.data;

    // Validation
    if (!collaboration_request_id) {
      const res = NextResponse.json(
        { error: "collaboration_request_id is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    if (!rating || rating < 1 || rating > 5) {
      const res = NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get user role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role as "creator" | "brand";

    if (!role) {
      const res = NextResponse.json(
        { error: "User role not set" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get collaboration request
    const { data: collab, error: collabError } = await timedQuery(
      log,
      "collaboration_requests.select",
      () =>
        supabaseAdmin
          .from("collaboration_requests")
          .select("*")
          .eq("id", collaboration_request_id)
          .single()
    );

    if (collabError || !collab) {
      const res = NextResponse.json(
        { error: "Collaboration request not found" },
        { status: 404 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify collaboration is completed
    if (collab.status !== "completed") {
      const res = NextResponse.json(
        { error: "Can only review completed collaborations" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Verify user is part of collaboration
    let userEntityId: string | null = null;
    let targetId: string | null = null;
    let targetType: "creator" | "brand";

    if (role === "brand") {
      const { data: brand } = await supabaseAdmin
        .from("brands")
        .select("id")
        .eq("clerk_user_id", uid)
        .single();
      userEntityId = brand?.id;

      if (userEntityId !== collab.brand_id) {
        const res = NextResponse.json(
          { error: "You are not part of this collaboration" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
      }

      targetId = collab.creator_id;
      targetType = "creator";
    } else {
      const { data: creator } = await supabaseAdmin
        .from("creators")
        .select("id")
        .eq("clerk_user_id", uid)
        .single();
      userEntityId = creator?.id;

      if (userEntityId !== collab.creator_id) {
        const res = NextResponse.json(
          { error: "You are not part of this collaboration" },
          { status: 403 }
        );
        return attachRequestId(res, requestId);
      }

      targetId = collab.brand_id;
      targetType = "brand";
    }

    // Check if review already exists
    const { data: existing } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("collaboration_request_id", collaboration_request_id)
      .eq("reviewer_role", role)
      .maybeSingle();

    if (existing) {
      const res = NextResponse.json(
        { error: "You have already reviewed this collaboration" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Insert review
    const { data: review, error } = await timedQuery(
      log,
      "reviews.insert",
      () =>
        supabaseAdmin
          .from("reviews")
          .insert({
            reviewer_clerk_id: uid,
            reviewer_role: role,
            target_id: targetId,
            target_type: targetType,
            collaboration_request_id,
            rating,
            review_text,
            is_public,
          })
          .select()
          .single()
    );

    if (error) {
      log.error({ error }, "Failed to submit review");
      const res = NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Trigger will auto-update avg_rating

    const res = NextResponse.json({ review });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST /api/reviews");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

/* ── GET: Fetch reviews ── */
export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const { searchParams } = new URL(req.url);
    const target_id = searchParams.get("target_id");
    const target_type = searchParams.get("target_type") as
      | "creator"
      | "brand"
      | null;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!target_id || !target_type) {
      const res = NextResponse.json(
        { error: "target_id and target_type are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Fetch reviews
    const { data: reviews, error } = await timedQuery(
      log,
      "reviews.select",
      () =>
        supabaseAdmin
          .from("reviews")
          .select("*")
          .eq("target_id", target_id)
          .eq("target_type", target_type)
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1)
    );

    if (error) {
      log.error({ error }, "Failed to fetch reviews");
      const res = NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Get reviewer names
    const client = await clerkClient();
    const reviewsWithNames = await Promise.all(
      (reviews || []).map(async (review: any) => {
        try {
          const reviewer = await client.users.getUser(review.reviewer_clerk_id);
          return {
            ...review,
            reviewer_name:
              reviewer.firstName ||
              reviewer.username ||
              reviewer.emailAddresses[0]?.emailAddress ||
              "Anonymous",
            collaboration_verified: !!review.collaboration_request_id,
          };
        } catch {
          return {
            ...review,
            reviewer_name: "Anonymous",
            collaboration_verified: !!review.collaboration_request_id,
          };
        }
      })
    );

    const res = NextResponse.json({ reviews: reviewsWithNames });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in GET /api/reviews");
    const res = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
