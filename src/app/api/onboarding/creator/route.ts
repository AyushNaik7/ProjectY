/**
 * API Route: Complete Creator Onboarding
 *
 * POST /api/onboarding/creator
 * Headers: Authorization: Bearer <access_token>
 * Body: { name, instagramHandle, niche, followers, avgViews, engagementRate, minRatePrivate }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";
import { generateCreatorEmbedding } from "@/lib/embeddings";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

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
      return NextResponse.json(
        { error: "Only creators can complete creator onboarding" },
        { status: 403 }
      );
    }

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!instagramHandle || typeof instagramHandle !== "string") {
      return NextResponse.json(
        { error: "Instagram handle is required" },
        { status: 400 }
      );
    }
    if (!niche || typeof niche !== "string") {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 });
    }
    if (typeof followers !== "number" || followers < 0) {
      return NextResponse.json(
        { error: "Followers must be a non-negative number" },
        { status: 400 }
      );
    }
    if (typeof avgViews !== "number" || avgViews < 0) {
      return NextResponse.json(
        { error: "Average views must be a non-negative number" },
        { status: 400 }
      );
    }
    if (
      typeof engagementRate !== "number" ||
      engagementRate < 0 ||
      engagementRate > 100
    ) {
      return NextResponse.json(
        { error: "Engagement rate must be between 0 and 100" },
        { status: 400 }
      );
    }
    if (typeof minRatePrivate !== "number" || minRatePrivate < 0) {
      return NextResponse.json(
        { error: "Minimum rate must be a non-negative number" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: creatorError.message },
        { status: 500 }
      );
    }

    // Mark onboarding complete in user metadata
    await supabaseAdmin.auth.admin.updateUserById(uid, {
      user_metadata: { role: "creator", onboarding_complete: true },
    });

    // Generate AI embedding asynchronously (don't block the response)
    generateCreatorEmbedding(uid).catch((err) =>
      console.error("Background embedding generation failed:", err)
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error in creator onboarding:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
