import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function parseJsonBody<T>(req: NextRequest): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }
> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

export async function getBrandIdByClerkId(clerkUserId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
}

export async function getCreatorIdByClerkId(clerkUserId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("creators")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
}