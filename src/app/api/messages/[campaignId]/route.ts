import { NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request, { params }: { params: { campaignId: string } }) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("campaign_id", params.campaignId)
    .or(`creator_id.eq.${auth.user.id},brand_id.eq.${auth.user.id}`)
    .maybeSingle();

  if (!conversation?.id) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
}
