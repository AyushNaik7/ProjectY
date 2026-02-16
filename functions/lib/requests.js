"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNewRequest = validateNewRequest;
exports.processRequestUpdate = processRequestUpdate;
const admin = __importStar(require("firebase-admin"));
/**
 * Validate a new request before creation
 * Called from the Cloud Function, NOT the client
 */
async function validateNewRequest(data, firestore) {
    // 1. Verify campaign exists and is active
    const campaignDoc = await firestore.doc(`campaigns/${data.campaignId}`).get();
    if (!campaignDoc.exists) {
        return { valid: false, error: "Campaign not found" };
    }
    const campaign = campaignDoc.data();
    if ((campaign === null || campaign === void 0 ? void 0 : campaign.status) !== "active") {
        return { valid: false, error: "Campaign is not active" };
    }
    if ((campaign === null || campaign === void 0 ? void 0 : campaign.brandId) !== data.brandId) {
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
async function processRequestUpdate(requestId, newStatus, creatorId, firestore) {
    const requestDoc = await firestore.doc(`requests/${requestId}`).get();
    if (!requestDoc.exists) {
        return { success: false, error: "Request not found" };
    }
    const request = requestDoc.data();
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
//# sourceMappingURL=requests.js.map