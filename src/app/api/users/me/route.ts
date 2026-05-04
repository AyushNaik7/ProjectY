import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const role = (auth.user.user_metadata as Record<string, unknown>)?.role;
  const table = role === "brand" ? "brands" : "creators";

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("clerk_user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data || null });
}
