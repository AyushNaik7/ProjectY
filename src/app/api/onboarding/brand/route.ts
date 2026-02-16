/**
 * API Route: Complete Brand Onboarding
 *
 * POST /api/onboarding/brand
 * Body: { idToken, brandName, category, budgetMin, budgetMax, website?, description? }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken, brandName, category, budgetMin, budgetMax, website, description } = body;

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "brand") {
            return NextResponse.json({ error: "Only brands can complete brand onboarding" }, { status: 403 });
        }
        if (userDoc.data()?.onboardingComplete) {
            return NextResponse.json({ error: "Onboarding already completed" }, { status: 400 });
        }

        // Validation
        if (!brandName || typeof brandName !== "string" || brandName.trim().length < 2) {
            return NextResponse.json({ error: "Brand name must be at least 2 characters" }, { status: 400 });
        }
        if (!category || typeof category !== "string") {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }
        if (typeof budgetMin !== "number" || budgetMin < 0) {
            return NextResponse.json({ error: "Minimum budget must be a non-negative number" }, { status: 400 });
        }
        if (typeof budgetMax !== "number" || budgetMax < 0) {
            return NextResponse.json({ error: "Maximum budget must be a non-negative number" }, { status: 400 });
        }
        if (budgetMax < budgetMin) {
            return NextResponse.json({ error: "Maximum budget must be >= minimum budget" }, { status: 400 });
        }

        const batch = adminDb.batch();

        batch.set(adminDb.doc(`brands/${uid}`), {
            uid,
            brandName: brandName.trim(),
            category,
            budgetMin,
            budgetMax,
            website: typeof website === "string" ? website.trim() : "",
            description: typeof description === "string" ? description.trim() : "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        batch.update(adminDb.doc(`users/${uid}`), {
            onboardingComplete: true,
            updatedAt: FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error in brand onboarding:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
