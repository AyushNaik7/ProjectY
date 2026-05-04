import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const user = auth.user;
  const role = (user.user_metadata as Record<string, unknown>)?.role as string | undefined;

  if (role === "creator") {
    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("id, instagram_followers, youtube_followers, tiktok_followers, instagram_engagement")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    const creatorId = creator?.id;
    const { count: activeCampaigns } = creatorId
      ? await supabaseAdmin
          .from("collaboration_requests")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", creatorId)
          .in("status", ["brand_approved", "accepted"])
      : { count: 0 };

    const followers =
      (creator?.instagram_followers || 0) +
      (creator?.youtube_followers || 0) +
      (creator?.tiktok_followers || 0);

    return NextResponse.json({
      stats: {
        totalEarnings: 0,
        activeCampaigns: activeCampaigns || 0,
        newFollowers: followers,
        engagementRate: creator?.instagram_engagement || 0,
      },
    });
  }

  const { data: brand } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  const { count: activeCampaigns } = brand?.id
    ? await supabaseAdmin
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("brand_id", brand.id)
        .eq("status", "active")
    : { count: 0 };

  return NextResponse.json({
    stats: {
      totalEarnings: 0,
      activeCampaigns: activeCampaigns || 0,
      newFollowers: 0,
      engagementRate: 0,
    },
  });
}
