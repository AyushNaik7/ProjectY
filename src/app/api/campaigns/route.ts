/**
 * API Route: Create Campaign
 *
 * POST /api/campaigns
 * Headers: Authorization: Bearer <access_token>
 * Body: { title, description, deliverableType, budget, timeline, niche }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateCampaignEmbedding } from "@/lib/embeddings";
import { requireUser } from "@/lib/request-auth";
import { clerkClient } from "@clerk/nextjs/server";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";
import {
  invalidateActiveCampaigns,
  invalidateAllCreatorMatches,
} from "@/lib/cache";
import { timedQuery } from "@/lib/db-timing";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    
    // Get role from Clerk user metadata
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(uid);
    const role = clerkUser.publicMetadata?.role;
    
    if (role !== "brand") {
      const res = NextResponse.json(
        { error: "Only brands can create campaigns" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    const body = await req.json();
    const { title, description, deliverableType, budget, timeline, niche } =
      body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      const res = NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      const res = NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (!["Reel", "Post", "Story"].includes(deliverableType)) {
      const res = NextResponse.json(
        { error: "Deliverable must be Reel, Post, or Story" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof budget !== "number" || budget <= 0) {
      const res = NextResponse.json(
        { error: "Budget must be a positive number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (!timeline || typeof timeline !== "string") {
      const res = NextResponse.json(
        { error: "Timeline is required" },
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

    const { data, error } = await timedQuery(
      log,
      "campaigns.insert",
      () =>
        supabaseAdmin
          .from("campaigns")
          .insert({
            id: globalThis.crypto.randomUUID(),
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
          .single(),
      { brandId: uid }
    );

    if (error) {
      const res = NextResponse.json({ error: error.message }, { status: 500 });
      return attachRequestId(res, requestId);
    }

    await invalidateActiveCampaigns();
    await invalidateAllCreatorMatches();

    // Generate AI embedding asynchronously (don't block the response)
    generateCampaignEmbedding(data.id).catch((err) =>
      console.error("Background campaign embedding generation failed:", err)
    );

    const res = NextResponse.json({ campaignId: data.id });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "campaigns.create_failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
