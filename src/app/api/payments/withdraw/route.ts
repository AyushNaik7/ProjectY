import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCreatorIdByClerkId } from "@/lib/api-utils";

export async function POST(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const body = (await req.json()) as { amount?: number };
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  const creatorId = await getCreatorIdByClerkId(auth.user.id);
  if (!creatorId) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert({
      id: randomUUID(),
      creator_id: creatorId,
      amount: body.amount,
      type: "withdrawal",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, payment: data });
}
