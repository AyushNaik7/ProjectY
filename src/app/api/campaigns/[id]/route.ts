import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getBrandIdByClerkId } from "@/lib/api-utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const role = (auth.user.user_metadata as Record<string, unknown>)?.role;
  if (role !== "brand") {
    return NextResponse.json({ error: "Only brands can update campaign status" }, { status: 403 });
  }

  const brandId = await getBrandIdByClerkId(auth.user.id);
  if (!brandId) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  const body = (await req.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("brand_id", brandId)
    .select("id,status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, campaign: data });
}
