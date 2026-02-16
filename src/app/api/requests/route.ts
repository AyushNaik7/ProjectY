/**
 * API Route: Update Request Status (Accept/Reject)
 *
 * PATCH /api/requests
 * Body: { idToken, requestId, status: "accepted" | "rejected" }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken, requestId, status } = body;

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Verify creator role
        const userDoc = await adminDb.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            return NextResponse.json({ error: "Only creators can respond to requests" }, { status: 403 });
        }

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "requestId and status (accepted/rejected) required" }, { status: 400 });
        }

        // Fetch and validate the request
        const requestDoc = await adminDb.doc(`requests/${requestId}`).get();
        if (!requestDoc.exists) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const requestData = requestDoc.data()!;

        // Verify this creator owns the request
        if (requestData.creatorId !== uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Only pending requests can be updated
        if (requestData.status !== "pending") {
            return NextResponse.json({ error: `Request is already ${requestData.status}` }, { status: 400 });
        }

        await adminDb.doc(`requests/${requestId}`).update({
            status,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error updating request:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
