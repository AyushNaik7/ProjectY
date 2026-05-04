import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function PUT(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const role = (auth.user.user_metadata as Record<string, unknown>)?.role;
  const table = role === "brand" ? "brands" : "creators";
  const body = (await req.json()) as Record<string, unknown>;

  const allowedKeys =
    role === "brand"
      ? ["name", "category", "budget_min", "budget_max", "website", "description"]
      : [
          "name",
          "username",
          "niche",
          "bio",
          "instagram_handle",
          "youtube_handle",
          "followers",
          "avg_views",
          "engagement_rate",
        ];

  const updates: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates[key] = body[key];
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(table)
    .update(updates)
    .eq("clerk_user_id", auth.user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data || null });
}
