/**
 * API Route: Complete Creator Onboarding
 *
 * POST /api/onboarding/creator
 * Body: { idToken, name, instagramHandle, niche, followers, avgViews, engagementRate, minRatePrivate }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken, name, instagramHandle, niche, followers, avgViews, engagementRate, minRatePrivate } = body;

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Verify role
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            return NextResponse.json({ error: "Only creators can complete creator onboarding" }, { status: 403 });
        }
        if (userDoc.data()?.onboardingComplete) {
            return NextResponse.json({ error: "Onboarding already completed" }, { status: 400 });
        }

        // Server-side validation
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
        }
        if (!instagramHandle || typeof instagramHandle !== "string") {
            return NextResponse.json({ error: "Instagram handle is required" }, { status: 400 });
        }
        if (!niche || typeof niche !== "string") {
            return NextResponse.json({ error: "Niche is required" }, { status: 400 });
        }
        if (typeof followers !== "number" || followers < 0) {
            return NextResponse.json({ error: "Followers must be a non-negative number" }, { status: 400 });
        }
        if (typeof avgViews !== "number" || avgViews < 0) {
            return NextResponse.json({ error: "Average views must be a non-negative number" }, { status: 400 });
        }
        if (typeof engagementRate !== "number" || engagementRate < 0 || engagementRate > 100) {
            return NextResponse.json({ error: "Engagement rate must be between 0 and 100" }, { status: 400 });
        }
        if (typeof minRatePrivate !== "number" || minRatePrivate < 0) {
            return NextResponse.json({ error: "Minimum rate must be a non-negative number" }, { status: 400 });
        }

        // Atomic batch write
        const batch = adminDb.batch();

        batch.set(adminDb.doc(`creators/${uid}`), {
            uid,
            name: name.trim(),
            instagramHandle: instagramHandle.trim().replace("@", ""),
            niche,
            followers,
            avgViews,
            engagementRate,
            minRatePrivate,
            verified: false,
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
        console.error("Error in creator onboarding:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
