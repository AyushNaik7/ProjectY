import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const body = (await req.json()) as { campaignId?: string; receiverId?: string; content?: string };
  if (!body.campaignId || !body.receiverId || !body.content) {
    return NextResponse.json(
      { error: "campaignId, receiverId and content are required" },
      { status: 400 }
    );
  }

  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("campaign_id", body.campaignId)
    .or(`creator_id.eq.${auth.user.id},brand_id.eq.${auth.user.id}`)
    .maybeSingle();

  const conversationId = conversation?.id || randomUUID();

  if (!conversation?.id) {
    await supabaseAdmin.from("conversations").insert({
      id: conversationId,
      campaign_id: body.campaignId,
      creator_id: auth.user.id,
      brand_id: body.receiverId,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      id: randomUUID(),
      conversation_id: conversationId,
      sender_id: auth.user.id,
      content: body.content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: data });
}
