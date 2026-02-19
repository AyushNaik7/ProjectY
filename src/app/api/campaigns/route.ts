/**
 * API Route: Create Campaign
 *
 * POST /api/campaigns
 * Headers: Authorization: Bearer <access_token>
 * Body: { title, description, deliverableType, budget, timeline, niche }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";
import { generateCampaignEmbedding } from "@/lib/embeddings";

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
    const { title, description, deliverableType, budget, timeline, niche } =
      body;

    // Verify brand role from user metadata
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      return NextResponse.json(
        { error: "Only brands can create campaigns" },
        { status: 403 }
      );
    }

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }
    if (!["Reel", "Post", "Story"].includes(deliverableType)) {
      return NextResponse.json(
        { error: "Deliverable must be Reel, Post, or Story" },
        { status: 400 }
      );
    }
    if (typeof budget !== "number" || budget <= 0) {
      return NextResponse.json(
        { error: "Budget must be a positive number" },
        { status: 400 }
      );
    }
    if (!timeline || typeof timeline !== "string") {
      return NextResponse.json(
        { error: "Timeline is required" },
        { status: 400 }
      );
    }
    if (!niche || typeof niche !== "string") {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        brand_id: uid,
        title: title.trim(),
        description: description.trim(),
        deliverable_type: deliverableType,
        budget,
        timeline: timeline.trim(),
        niche,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate AI embedding asynchronously (don't block the response)
    generateCampaignEmbedding(data.id).catch((err) =>
      console.error("Background campaign embedding generation failed:", err)
    );

    return NextResponse.json({ campaignId: data.id });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error creating campaign:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
