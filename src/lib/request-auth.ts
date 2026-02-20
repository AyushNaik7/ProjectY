import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/supabase-server";

export function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function requireUser(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  try {
    const user = await verifyAccessToken(token);
    return { user, token };
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 }
      ),
    };
  }
}
