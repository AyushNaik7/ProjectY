/**
 * API Client Library — Frontend → Next.js API Routes → Firebase Admin → Firestore
 *
 * This is the ONLY way the frontend communicates with the backend for writes.
 * All mutations go through these typed API wrappers.
 * The frontend NEVER writes to Firestore directly.
 *
 * Architecture (Spark plan): Frontend → Next.js API Routes → Admin SDK → Firestore
 * Architecture (Blaze plan): Frontend → Cloud Functions → Admin SDK → Firestore
 */

import { auth } from "./firebase";

// --------------------------------------------------
// Type definitions for request/response payloads
// --------------------------------------------------

export interface CreatorOnboardingRequest {
    name: string;
    instagramHandle: string;
    niche: string;
    followers: number;
    avgViews: number;
    engagementRate: number;
    minRatePrivate: number;
}

export interface BrandOnboardingRequest {
    brandName: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    website?: string;
    description?: string;
}

export interface CreateCampaignRequest {
    title: string;
    description: string;
    deliverableType: "Reel" | "Post" | "Story";
    budget: number;
    timeline: string;
    niche: string;
}

export interface UpdateRequestStatusPayload {
    requestId: string;
    status: "accepted" | "rejected";
}

export interface MatchedCampaign {
    id: string;
    brandId: string;
    title: string;
    description: string;
    deliverableType: string;
    budget: number;
    timeline: string;
    niche: string;
    status: string;
    matchScore: number;
    matchReasons: string[];
}

export interface MatchedCreator {
    uid: string;
    name: string;
    instagramHandle: string;
    niche: string;
    followers: number;
    avgViews: number;
    engagementRate: number;
    verified: boolean;
    matchScore: number;
    matchReasons: string[];
}

// --------------------------------------------------
// Helper: Get current user's ID token for API auth
// --------------------------------------------------

async function getIdToken(): Promise<string> {
    const user = auth?.currentUser;
    if (!user) throw new Error("Not authenticated");
    return user.getIdToken();
}

async function apiCall<T>(url: string, body: Record<string, unknown>, method = "POST"): Promise<T> {
    const idToken = await getIdToken();
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, idToken }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
    }
    return data as T;
}

// --------------------------------------------------
// API function wrappers
// --------------------------------------------------

/**
 * Initialize user document after signup.
 * Must be called immediately after createUserWithEmailAndPassword.
 */
export async function callInitializeUser(role: "creator" | "brand") {
    return apiCall<{ success: boolean }>("/api/initialize-user", { role });
}

/**
 * Complete creator onboarding — validates + saves profile server-side.
 */
export async function callCompleteCreatorOnboarding(data: CreatorOnboardingRequest) {
    return apiCall<{ success: boolean }>("/api/onboarding/creator", data as unknown as Record<string, unknown>);
}

/**
 * Complete brand onboarding — validates + saves profile server-side.
 */
export async function callCompleteBrandOnboarding(data: BrandOnboardingRequest) {
    return apiCall<{ success: boolean }>("/api/onboarding/brand", data as unknown as Record<string, unknown>);
}

/**
 * Create a campaign — brand only, validated server-side.
 */
export async function callCreateCampaign(data: CreateCampaignRequest) {
    return apiCall<{ campaignId: string }>("/api/campaigns", data as unknown as Record<string, unknown>);
}

/**
 * Accept or reject a request — creator only.
 */
export async function callUpdateRequestStatus(data: UpdateRequestStatusPayload) {
    return apiCall<{ success: boolean }>("/api/requests", data as unknown as Record<string, unknown>, "PATCH");
}

/**
 * Get campaigns matched to the current creator — scored server-side.
 * Match scoring uses minRatePrivate server-side, never exposed to frontend.
 */
export async function callGetMatchedCampaigns() {
    const idToken = await getIdToken();
    const res = await fetch("/api/matched-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch matches");
    return data as { campaigns: MatchedCampaign[] };
}

/**
 * Get matched creators for a campaign — brand only.
 * Returns sanitized profiles (minRatePrivate is stripped server-side).
 */
export async function callGetCreatorsForCampaign(campaignId: string) {
    const idToken = await getIdToken();
    const res = await fetch("/api/creators-for-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, campaignId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch creators");
    return data as { creators: MatchedCreator[] };
}
