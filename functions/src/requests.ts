import * as admin from "firebase-admin";

/**
 * Request management utilities for Cloud Functions
 * Handles business logic for deal requests between brands and creators
 */

interface RequestData {
    campaignId: string;
    creatorId: string;
    brandId: string;
    status: "pending" | "accepted" | "rejected";
    matchScore?: number;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

/**
 * Validate a new request before creation
 * Called from the Cloud Function, NOT the client
 */
export async function validateNewRequest(
    data: {
        campaignId: string;
        creatorId: string;
        brandId: string;
    },
    firestore: admin.firestore.Firestore
): Promise<{ valid: boolean; error?: string }> {
    // 1. Verify campaign exists and is active
    const campaignDoc = await firestore.doc(`campaigns/${data.campaignId}`).get();
    if (!campaignDoc.exists) {
        return { valid: false, error: "Campaign not found" };
    }
    const campaign = campaignDoc.data();
    if (campaign?.status !== "active") {
        return { valid: false, error: "Campaign is not active" };
    }
    if (campaign?.brandId !== data.brandId) {
        return { valid: false, error: "Unauthorized: Campaign does not belong to this brand" };
    }

    // 2. Verify creator exists
    const creatorDoc = await firestore.doc(`creators/${data.creatorId}`).get();
    if (!creatorDoc.exists) {
        return { valid: false, error: "Creator not found" };
    }

    // 3. Check for duplicate request
    const existingRequest = await firestore
        .collection("requests")
        .where("campaignId", "==", data.campaignId)
        .where("creatorId", "==", data.creatorId)
        .limit(1)
        .get();

    if (!existingRequest.empty) {
        return { valid: false, error: "A request already exists for this creator-campaign pair" };
    }

    return { valid: true };
}

/**
 * Process a request status update (accept/reject)
 * Called from the Cloud Function when a creator responds to a request
 */
export async function processRequestUpdate(
    requestId: string,
    newStatus: "accepted" | "rejected",
    creatorId: string,
    firestore: admin.firestore.Firestore
): Promise<{ success: boolean; error?: string }> {
    const requestDoc = await firestore.doc(`requests/${requestId}`).get();

    if (!requestDoc.exists) {
        return { success: false, error: "Request not found" };
    }

    const request = requestDoc.data() as RequestData;

    // Verify the creator owns this request
    if (request.creatorId !== creatorId) {
        return { success: false, error: "Unauthorized: You cannot modify this request" };
    }

    // Verify the request is still pending
    if (request.status !== "pending") {
        return { success: false, error: `Request is already ${request.status}` };
    }

    // Update the request
    await firestore.doc(`requests/${requestId}`).update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
}
