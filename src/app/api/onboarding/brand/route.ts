/**
 * API Route: Complete Brand Onboarding
 *
 * POST /api/onboarding/brand
 * Headers: Authorization: Bearer <access_token>
 * Body: { brandName, category, budgetMin, budgetMax, website?, description? }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const user = auth.user;
    const uid = user.id;
    const body = await req.json();
    const { brandName, category, budgetMin, budgetMax, website, description } =
      body;

    const role = (user.user_metadata as Record<string, unknown>)?.role;
    if (role !== "brand") {
      const res = NextResponse.json(
        { error: "Only brands can complete brand onboarding" },
        { status: 403 }
      );
      return attachRequestId(res, requestId);
    }

    // Validation
    if (
      !brandName ||
      typeof brandName !== "string" ||
      brandName.trim().length < 2
    ) {
      const res = NextResponse.json(
        { error: "Brand name must be at least 2 characters" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (!category || typeof category !== "string") {
      const res = NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof budgetMin !== "number" || budgetMin < 0) {
      const res = NextResponse.json(
        { error: "Minimum budget must be a non-negative number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (typeof budgetMax !== "number" || budgetMax < 0) {
      const res = NextResponse.json(
        { error: "Maximum budget must be a non-negative number" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }
    if (budgetMax < budgetMin) {
      const res = NextResponse.json(
        { error: "Maximum budget must be >= minimum budget" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
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
      const res = NextResponse.json(
        { error: brandError.message },
        { status: 500 }
      );
      return attachRequestId(res, requestId);
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

    const res = NextResponse.json({ success: true });
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "onboarding.brand_failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}
