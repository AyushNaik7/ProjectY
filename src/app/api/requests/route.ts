/**
 * API Route: Update Request Status (Accept/Reject)
 *
 * PATCH /api/requests
 * Headers: Authorization: Bearer <access_token>
 * Body: { requestId, status: "accepted" | "rejected" }
 *
 * POST /api/requests
 * Send collaboration request from brand to creator
 * Body: { creatorId, campaignId }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken, createClient } from "@/lib/supabase-server";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

// POST: Send collaboration request
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { creatorId, campaignId } = await req.json();

    if (!creatorId || !campaignId) {
      return NextResponse.json(
        { error: "Missing required fields: creatorId, campaignId" },
        { status: 400 }
      );
    }

    // Verify brand exists for user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, name")
      .eq("id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Verify campaign belongs to brand
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", campaignId)
      .eq("brand_id", user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or does not belong to your brand" },
        { status: 404 }
      );
    }

    // Get creator name - IMPORTANT: Do NOT fetch minRatePrivate
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, name")
      .eq("id", creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("requests")
      .select("id, status")
      .eq("brand_id", user.id)
      .eq("creator_id", creatorId)
      .eq("campaign_id", campaignId)
      .single();

    if (existingRequest) {
      return NextResponse.json(
        {
          error: `Request already exists with status: ${existingRequest.status}`,
          requestId: existingRequest.id,
        },
        { status: 409 }
      );
    }

    // Create the request record
    const { data: newRequest, error: insertError } = await supabase
      .from("requests")
      .insert({
        brand_id: user.id,
        creator_id: creatorId,
        campaign_id: campaignId,
        creator_name: creator.name,
        campaign_title: campaign.title,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create request:", insertError);
      return NextResponse.json(
        { error: "Failed to send request. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requestId: newRequest.id,
        message: `Request sent to ${creator.name}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Request creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const { requestId, status } = body;

    // Verify creator role
    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "creator") {
      return NextResponse.json(
        { error: "Only creators can respond to requests" },
        { status: 403 }
      );
    }

    if (!requestId || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "requestId and status (accepted/rejected) required" },
        { status: 400 }
      );
    }

    // Fetch and validate the request
    const { data: requestData, error: fetchErr } = await supabaseAdmin
      .from("collaboration_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchErr || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify this creator owns the request
    if (requestData.creator_id !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only pending requests can be updated
    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: `Request is already ${requestData.status}` },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("collaboration_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error updating request:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
