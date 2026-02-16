/**
 * API Route: Initialize User
 *
 * POST /api/initialize-user
 * Body: { idToken: string, role: "creator" | "brand" }
 *
 * Creates the user document in Firestore with the selected role.
 * Called from frontend immediately after signup.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const { idToken, role } = await req.json();

        if (!idToken || !["creator", "brand"].includes(role)) {
            return NextResponse.json(
                { error: "idToken and role (creator/brand) are required" },
                { status: 400 }
            );
        }

        // Verify the Firebase ID token — this IS the auth check
        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;
        const email = decoded.email || "";

        // Check if user doc already exists
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (userDoc.exists) {
            if (userDoc.data()?.onboardingComplete) {
                return NextResponse.json(
                    { error: "Cannot change role after onboarding" },
                    { status: 400 }
                );
            }
            await adminDb.doc(`users/${uid}`).update({
                role,
                updatedAt: FieldValue.serverTimestamp(),
            });
            return NextResponse.json({ success: true, existing: true });
        }

        // Create new user document
        await adminDb.doc(`users/${uid}`).set({
            uid,
            email,
            role,
            onboardingComplete: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, existing: false });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error in initialize-user:", err);
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
