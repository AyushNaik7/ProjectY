import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { computeMatchScore, computeMatchesForCampaign } from "./matching";
import { validateNewRequest, processRequestUpdate } from "./requests";

// Initialize Firebase Admin — this bypasses all security rules
admin.initializeApp();
const firestore = admin.firestore();

// ============================================
// 1. INITIALIZE USER (called right after signup)
// ============================================
/**
 * Creates the user document in Firestore with role.
 * Called from frontend immediately after createUserWithEmailAndPassword.
 * This is the ONLY way a user doc gets created — frontend cannot write directly.
 */
export const initializeUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    const { role } = data;
    if (!role || !["creator", "brand"].includes(role)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Role must be 'creator' or 'brand'"
        );
    }

    const uid = context.auth.uid;
    const email = context.auth.token.email || "";

    // Idempotent: if user doc already exists, update role
    const userDoc = await firestore.doc(`users/${uid}`).get();
    if (userDoc.exists) {
        // Only allow role change if onboarding not complete
        if (userDoc.data()?.onboardingComplete) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Cannot change role after onboarding is complete"
            );
        }
        await firestore.doc(`users/${uid}`).update({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, existing: true };
    }

    // Create new user document
    await firestore.doc(`users/${uid}`).set({
        uid,
        email,
        role,
        onboardingComplete: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, existing: false };
});

// ============================================
// 2. COMPLETE CREATOR ONBOARDING
// ============================================
/**
 * Validates and saves creator profile. Marks onboarding complete.
 * Uses batch write for atomicity — either both writes succeed or neither does.
 */
export const completeCreatorOnboarding = functions.https.onCall(
    async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
        }

        const uid = context.auth.uid;

        // Server-side role verification
        const userDoc = await firestore.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only creators can complete creator onboarding"
            );
        }

        if (userDoc.data()?.onboardingComplete) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Onboarding already completed"
            );
        }

        // ---- Server-side input validation ----
        const {
            name,
            instagramHandle,
            niche,
            followers,
            avgViews,
            engagementRate,
            minRatePrivate,
        } = data;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Name must be at least 2 characters"
            );
        }
        if (!instagramHandle || typeof instagramHandle !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Instagram handle is required"
            );
        }
        if (!niche || typeof niche !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Niche is required"
            );
        }
        if (typeof followers !== "number" || followers < 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Followers must be a non-negative number"
            );
        }
        if (typeof avgViews !== "number" || avgViews < 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Average views must be a non-negative number"
            );
        }
        if (
            typeof engagementRate !== "number" ||
            engagementRate < 0 ||
            engagementRate > 100
        ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Engagement rate must be between 0 and 100"
            );
        }
        if (typeof minRatePrivate !== "number" || minRatePrivate < 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Minimum rate must be a non-negative number"
            );
        }

        // Atomic batch write: creator profile + user onboarding flag
        const batch = firestore.batch();

        batch.set(firestore.doc(`creators/${uid}`), {
            uid,
            name: name.trim(),
            instagramHandle: instagramHandle.trim().replace("@", ""),
            niche,
            followers,
            avgViews,
            engagementRate,
            minRatePrivate,
            verified: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(firestore.doc(`users/${uid}`), {
            onboardingComplete: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return { success: true };
    }
);

// ============================================
// 3. COMPLETE BRAND ONBOARDING
// ============================================
/**
 * Validates and saves brand profile. Marks onboarding complete.
 */
export const completeBrandOnboarding = functions.https.onCall(
    async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
        }

        const uid = context.auth.uid;

        const userDoc = await firestore.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "brand") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only brands can complete brand onboarding"
            );
        }

        if (userDoc.data()?.onboardingComplete) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Onboarding already completed"
            );
        }

        const { brandName, category, budgetMin, budgetMax, website, description } =
            data;

        if (
            !brandName ||
            typeof brandName !== "string" ||
            brandName.trim().length < 2
        ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Brand name must be at least 2 characters"
            );
        }
        if (!category || typeof category !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Category is required"
            );
        }
        if (typeof budgetMin !== "number" || budgetMin < 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Minimum budget must be a non-negative number"
            );
        }
        if (typeof budgetMax !== "number" || budgetMax < 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Maximum budget must be a non-negative number"
            );
        }
        if (budgetMax < budgetMin) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Maximum budget must be >= minimum budget"
            );
        }

        const batch = firestore.batch();

        batch.set(firestore.doc(`brands/${uid}`), {
            uid,
            brandName: brandName.trim(),
            category,
            budgetMin,
            budgetMax,
            website: typeof website === "string" ? website.trim() : "",
            description: typeof description === "string" ? description.trim() : "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(firestore.doc(`users/${uid}`), {
            onboardingComplete: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return { success: true };
    }
);

// ============================================
// 4. CREATE CAMPAIGN (Brand only)
// ============================================
/**
 * Server-side campaign creation with full validation.
 * Only brands with completed onboarding can create campaigns.
 */
export const createCampaign = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    const uid = context.auth.uid;

    // Verify user is a brand with completed onboarding
    const userDoc = await firestore.doc(`users/${uid}`).get();
    if (!userDoc.exists || userDoc.data()?.role !== "brand") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only brands can create campaigns"
        );
    }
    if (!userDoc.data()?.onboardingComplete) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Complete brand onboarding first"
        );
    }

    const { title, description, deliverableType, budget, timeline, niche } = data;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Title must be at least 3 characters"
        );
    }
    if (
        !description ||
        typeof description !== "string" ||
        description.trim().length < 10
    ) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Description must be at least 10 characters"
        );
    }
    if (!["Reel", "Post", "Story"].includes(deliverableType)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Deliverable must be Reel, Post, or Story"
        );
    }
    if (typeof budget !== "number" || budget <= 0) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Budget must be a positive number"
        );
    }
    if (!timeline || typeof timeline !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Timeline is required"
        );
    }
    if (!niche || typeof niche !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Niche is required"
        );
    }

    const campaignRef = await firestore.collection("campaigns").add({
        brandId: uid,
        title: title.trim(),
        description: description.trim(),
        deliverableType,
        budget,
        timeline: timeline.trim(),
        niche,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { campaignId: campaignRef.id };
});

// ============================================
// 5. GET MATCHED CAMPAIGNS (Creator feed)
// ============================================
/**
 * Returns campaigns ranked by match score for a creator.
 * Match scoring uses minRatePrivate server-side — never exposed.
 */
export const getMatchedCampaigns = functions.https.onCall(
    async (_data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Must be logged in"
            );
        }

        const uid = context.auth.uid;

        const userDoc = await firestore.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only creators can view matches"
            );
        }

        const creatorDoc = await firestore.doc(`creators/${uid}`).get();
        if (!creatorDoc.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Creator profile not found"
            );
        }

        const creator = creatorDoc.data() as {
            uid: string;
            name: string;
            instagramHandle: string;
            niche: string;
            followers: number;
            avgViews: number;
            engagementRate: number;
            minRatePrivate: number;
            verified: boolean;
        };

        // Fetch active campaigns
        const campaignsSnap = await firestore
            .collection("campaigns")
            .where("status", "==", "active")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const matchedCampaigns = campaignsSnap.docs.map((doc) => {
            const campaign = doc.data() as {
                brandId: string;
                title: string;
                description: string;
                deliverableType: string;
                budget: number;
                timeline: string;
                niche: string;
                status: string;
            };

            const match = computeMatchScore(creator, campaign, doc.id);

            // Return campaign WITHOUT exposing creator's private rate
            return {
                id: doc.id,
                brandId: campaign.brandId,
                title: campaign.title,
                description: campaign.description,
                deliverableType: campaign.deliverableType,
                budget: campaign.budget,
                timeline: campaign.timeline,
                niche: campaign.niche,
                status: campaign.status,
                matchScore: match.score,
                matchReasons: match.reasons,
            };
        });

        // Sort by match score descending
        matchedCampaigns.sort((a, b) => b.matchScore - a.matchScore);

        return { campaigns: matchedCampaigns };
    }
);

// ============================================
// 6. CREATE REQUEST (Brand sends deal to creator)
// ============================================
/**
 * Server-side request creation with full validation.
 * Computes match score server-side before saving.
 */
export const createRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    const uid = context.auth.uid;

    const userDoc = await firestore.doc(`users/${uid}`).get();
    if (!userDoc.exists || userDoc.data()?.role !== "brand") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only brands can create requests"
        );
    }

    const { campaignId, creatorId } = data;

    if (!campaignId || !creatorId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "campaignId and creatorId are required"
        );
    }

    // Server-side validation (campaign exists, active, belongs to brand, no duplicates)
    const validation = await validateNewRequest(
        { campaignId, creatorId, brandId: uid },
        firestore
    );

    if (!validation.valid) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            validation.error || "Validation failed"
        );
    }

    // Compute match score server-side
    const creatorDoc = await firestore.doc(`creators/${creatorId}`).get();
    const campaignDoc = await firestore.doc(`campaigns/${campaignId}`).get();

    let matchScore = 0;
    if (creatorDoc.exists && campaignDoc.exists) {
        const match = computeMatchScore(
            creatorDoc.data() as any,
            campaignDoc.data() as any,
            campaignId
        );
        matchScore = match.score;
    }

    const requestRef = await firestore.collection("requests").add({
        campaignId,
        creatorId,
        brandId: uid,
        status: "pending",
        matchScore,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { requestId: requestRef.id, matchScore };
});

// ============================================
// 7. UPDATE REQUEST STATUS (Creator accepts/rejects)
// ============================================
/**
 * Only the target creator can respond to a request.
 * Only pending requests can be updated.
 */
export const updateRequestStatus = functions.https.onCall(
    async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Must be logged in"
            );
        }

        const uid = context.auth.uid;

        const userDoc = await firestore.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "creator") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only creators can respond to requests"
            );
        }

        const { requestId, status } = data;

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "requestId and status (accepted/rejected) are required"
            );
        }

        const result = await processRequestUpdate(
            requestId,
            status,
            uid,
            firestore
        );

        if (!result.success) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                result.error || "Update failed"
            );
        }

        return { success: true };
    }
);

// ============================================
// 8. ON CAMPAIGN CREATED — Pre-compute matches
// ============================================
/**
 * Background trigger: when a new campaign is created,
 * pre-compute match scores for all verified creators.
 */
export const onCampaignCreated = functions.firestore
    .document("campaigns/{campaignId}")
    .onCreate(async (snap, context) => {
        const campaign = snap.data() as {
            brandId: string;
            title: string;
            description: string;
            deliverableType: string;
            budget: number;
            timeline: string;
            niche: string;
            status: string;
        };
        const campaignId = context.params.campaignId;

        try {
            const matches = await computeMatchesForCampaign(
                campaignId,
                campaign,
                firestore
            );

            // Store top matches as sub-collection for quick retrieval
            const batch = firestore.batch();
            const matchesRef = firestore.collection(
                `campaigns/${campaignId}/matches`
            );

            for (const match of matches.slice(0, 50)) {
                const matchDocRef = matchesRef.doc(match.creatorId);
                batch.set(matchDocRef, {
                    creatorId: match.creatorId,
                    score: match.score,
                    reasons: match.reasons,
                    computedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            await batch.commit();
            console.log(
                `Computed ${matches.length} matches for campaign ${campaignId}`
            );
        } catch (error) {
            console.error("Error computing matches:", error);
        }
    });

// ============================================
// 9. GET CREATORS FOR CAMPAIGN (Brand view)
// ============================================
/**
 * Returns sanitized creator profiles — minRatePrivate is NEVER exposed.
 * Uses pre-computed match scores from sub-collection.
 */
export const getCreatorsForCampaign = functions.https.onCall(
    async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Must be logged in"
            );
        }

        const uid = context.auth.uid;

        const userDoc = await firestore.doc(`users/${uid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== "brand") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only brands can view creators"
            );
        }

        const { campaignId } = data;
        if (!campaignId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "campaignId is required"
            );
        }

        // Verify campaign belongs to this brand
        const campaignDoc = await firestore.doc(`campaigns/${campaignId}`).get();
        if (!campaignDoc.exists || campaignDoc.data()?.brandId !== uid) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Campaign not found or unauthorized"
            );
        }

        // Get pre-computed matches
        const matchesSnap = await firestore
            .collection(`campaigns/${campaignId}/matches`)
            .orderBy("score", "desc")
            .limit(20)
            .get();

        const creators = await Promise.all(
            matchesSnap.docs.map(async (matchDoc) => {
                const matchData = matchDoc.data();
                const creatorDoc = await firestore
                    .doc(`creators/${matchData.creatorId}`)
                    .get();

                if (!creatorDoc.exists) return null;

                const creator = creatorDoc.data()!;
                // NEVER expose minRatePrivate to brands
                return {
                    uid: creator.uid,
                    name: creator.name,
                    instagramHandle: creator.instagramHandle,
                    niche: creator.niche,
                    followers: creator.followers,
                    avgViews: creator.avgViews,
                    engagementRate: creator.engagementRate,
                    verified: creator.verified,
                    matchScore: matchData.score,
                    matchReasons: matchData.reasons,
                };
            })
        );

        return { creators: creators.filter(Boolean) };
    }
);
