/**
 * API Route: Complete Brand Onboarding
 *
 * POST /api/onboarding/brand
 * Headers: Authorization: Bearer <access_token>
 * Body: { brandName, category, budgetMin, budgetMax, website?, description? }
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
    const uid = user.id;
    const body = await req.json();
    const { brandName, category, budgetMin, budgetMax, website, description } =
      body;

    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      return NextResponse.json(
        { error: "Only brands can complete brand onboarding" },
        { status: 403 }
      );
    }

    // Validation
    if (
      !brandName ||
      typeof brandName !== "string" ||
      brandName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: "Brand name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }
    if (typeof budgetMin !== "number" || budgetMin < 0) {
      return NextResponse.json(
        { error: "Minimum budget must be a non-negative number" },
        { status: 400 }
      );
    }
    if (typeof budgetMax !== "number" || budgetMax < 0) {
      return NextResponse.json(
        { error: "Maximum budget must be a non-negative number" },
        { status: 400 }
      );
    }
    if (budgetMax < budgetMin) {
      return NextResponse.json(
        { error: "Maximum budget must be >= minimum budget" },
        { status: 400 }
      );
    }

    // Upsert brand profile
    const { error: brandError } = await supabaseAdmin.from("brands").upsert({
      id: uid,
      name: brandName.trim(),
      email: user.email || "",
      industry: category,
      website: typeof website === "string" ? website.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
    });

    if (brandError) {
      return NextResponse.json({ error: brandError.message }, { status: 500 });
    }

    // Mark onboarding complete in user metadata
    await supabaseAdmin.auth.admin.updateUserById(uid, {
      user_metadata: {
        role: "brand",
        onboarding_complete: true,
        brandName: brandName.trim(),
        name: brandName.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error in brand onboarding:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
