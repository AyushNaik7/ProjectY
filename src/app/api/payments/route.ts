import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCreatorIdByClerkId } from "@/lib/api-utils";

export async function GET(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const creatorId = await getCreatorIdByClerkId(auth.user.id);
  if (!creatorId) {
    return NextResponse.json({ payments: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    // Keep endpoint stable even when table is not yet deployed.
    return NextResponse.json({ payments: [] });
  }

  return NextResponse.json({ payments: data || [] });
}
