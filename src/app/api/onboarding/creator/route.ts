/**
 * API Route: Complete Creator Onboarding
 *
 * POST /api/onboarding/creator
 * Headers: Authorization: Bearer <access_token>
 * Body: { name, instagramHandle, niche, followers, avgViews, engagementRate, minRatePrivate }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateCreatorEmbedding } from "@/lib/embeddings";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import {
  invalidateAllCampaignMatches,
  invalidateCreatorMatchCache,
} from "@/lib/cache";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const body = await req.json();
    const {
      name,
      instagramHandle,
      niche,
      followers,
      avgViews,
      engagementRate,
      minRatePrivate,
    } = body;

    // Verify role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "creator") {
      const res = NextResponse.json(
        { error: "Only creators can complete creator onboarding" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      const res = NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (!instagramHandle || typeof instagramHandle !== "string") {
      const res = NextResponse.json(
        { error: "Instagram handle is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (!niche || typeof niche !== "string") {
      const res = NextResponse.json(
        { error: "Niche is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof followers !== "number" || followers < 0) {
      const res = NextResponse.json(
        { error: "Followers must be a non-negative number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof avgViews !== "number" || avgViews < 0) {
      const res = NextResponse.json(
        { error: "Average views must be a non-negative number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (
      typeof engagementRate !== "number" ||
      engagementRate < 0 ||
      engagementRate > 100
    ) {
      const res = NextResponse.json(
        { error: "Engagement rate must be between 0 and 100" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof minRatePrivate !== "number" || minRatePrivate < 0) {
      const res = NextResponse.json(
        { error: "Minimum rate must be a non-negative number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Upsert creator profile
    const { error: creatorError } = await supabaseAdmin
      .from("creators")
      .upsert({
        id: uid,
        name: name.trim(),
        email: user.email || "",
        niche,
        instagram_handle: instagramHandle.trim().replace("@", ""),
        instagram_followers: followers,
        avg_views: avgViews,
        instagram_engagement: engagementRate,
        min_rate_private: minRatePrivate,
        verified: false,
      });

    if (creatorError) {
      const res = NextResponse.json(
        { error: creatorError.message },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
    }

    // Mark onboarding complete in user metadata
    await supabaseAdmin.auth.admin.updateUserById(uid, {
      user_metadata: {
        role: "creator",
        onboarding_complete: true,
        name: name.trim(),
      },
    });

    await invalidateCreatorMatchCache(uid);
    await invalidateAllCampaignMatches();

    // Generate AI embedding asynchronously (don't block the response)
    generateCreatorEmbedding(uid).catch((err) =>
      console.error("Background embedding generation failed:", err)
    );

    const res = NextResponse.json({ success: true });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "onboarding.creator_failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
