import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCreatorIdByClerkId } from "@/lib/api-utils";

export async function POST(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const user = auth.user;
  const role = (user.user_metadata as Record<string, unknown>)?.role;
  if (role !== "creator") {
    return NextResponse.json({ error: "Only creators can apply" }, { status: 403 });
  }

  const body = (await req.json()) as { campaignId?: string };
  if (!body.campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const creatorId = await getCreatorIdByClerkId(user.id);
  if (!creatorId) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const { data: campaign } = await supabaseAdmin
    .from("campaigns")
    .select("id, brand_id")
    .eq("id", body.campaignId)
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { data: existing } = await supabaseAdmin
    .from("collaboration_requests")
    .select("id")
    .eq("campaign_id", body.campaignId)
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ success: true, requestId: existing.id, alreadyApplied: true });
  }

  const { data, error } = await supabaseAdmin
    .from("collaboration_requests")
    .insert({
      id: randomUUID(),
      campaign_id: body.campaignId,
      creator_id: creatorId,
      brand_id: campaign.brand_id,
      status: "pending",
      message: "Quick application from campaigns dashboard",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, requestId: data.id });
}
