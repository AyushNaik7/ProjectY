/**
 * API Route: Initialize User
 *
 * POST /api/initialize-user
 * Headers: Authorization: Bearer <access_token>
 * Body: { role: "creator" | "brand" }
 *
 * Stores/updates the user's role in Supabase user_metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAccessToken } from "@/lib/supabase-server";

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);
    const { role } = await req.json();

    if (!["creator", "brand"].includes(role)) {
      return NextResponse.json(
        { error: "role (creator/brand) is required" },
        { status: 400 }
      );
    }

    // Update user metadata with the selected role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { role, onboarding_complete: false },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error in initialize-user:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
