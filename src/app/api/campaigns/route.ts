/**
 * API Route: Create Campaign
 *
 * POST /api/campaigns
 * Body: { idToken, title, description, deliverableType, budget, timeline, niche }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken, title, description, deliverableType, budget, timeline, niche } = body;

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Verify brand with completed onboarding
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "brand") {
            return NextResponse.json({ error: "Only brands can create campaigns" }, { status: 403 });
        }
        if (!userDoc.data()?.onboardingComplete) {
            return NextResponse.json({ error: "Complete brand onboarding first" }, { status: 400 });
        }

        // Validation
        if (!title || typeof title !== "string" || title.trim().length < 3) {
            return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });
        }
        if (!description || typeof description !== "string" || description.trim().length < 10) {
            return NextResponse.json({ error: "Description must be at least 10 characters" }, { status: 400 });
        }
        if (!["Reel", "Post", "Story"].includes(deliverableType)) {
            return NextResponse.json({ error: "Deliverable must be Reel, Post, or Story" }, { status: 400 });
        }
        if (typeof budget !== "number" || budget <= 0) {
            return NextResponse.json({ error: "Budget must be a positive number" }, { status: 400 });
        }
        if (!timeline || typeof timeline !== "string") {
            return NextResponse.json({ error: "Timeline is required" }, { status: 400 });
        }
        if (!niche || typeof niche !== "string") {
            return NextResponse.json({ error: "Niche is required" }, { status: 400 });
        }

        const campaignRef = await adminDb.collection("campaigns").add({
            brandId: uid,
            title: title.trim(),
            description: description.trim(),
            deliverableType,
            budget,
            timeline: timeline.trim(),
            niche,
            status: "active",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ campaignId: campaignRef.id });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error creating campaign:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
