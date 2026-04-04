/**
 * API Client Library — Frontend → Next.js API Routes → Supabase
 *
 * This is the ONLY way the frontend communicates with the backend for writes.
 * All mutations go through these typed API wrappers.
 * The frontend NEVER writes to the database directly (except through Supabase services).
 */

import { createClient } from "./supabase-browser";

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
  status: "brand_approved" | "accepted" | "rejected";
}

export interface SendCollaborationRequestPayload {
  creatorId: string;
  campaignId?: string;
  message?: string;
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
  semanticScore?: number;
  matchReasons: string[];
}

export interface MatchedCreator {
  uid: string;
  username?: string;
  name: string;
  instagramHandle: string;
  niche: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  verified: boolean;
  matchScore: number;
  semanticScore?: number;
  matchReasons: string[];
}

// --------------------------------------------------
// Helper: Make authenticated API calls
// --------------------------------------------------

async function apiCall<T>(
  url: string,
  body: Record<string, unknown>,
  method = "POST"
): Promise<T> {
  // Clerk handles authentication via cookies automatically
  // No need to manually pass tokens
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include", // Include cookies for Clerk auth
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

// --------------------------------------------------
// API Functions
// --------------------------------------------------

/**
 * Initialize user document after signup.
 */
export async function callInitializeUser(role: "creator" | "brand") {
  return apiCall<{ success: boolean }>("/api/initialize-user", { role });
}

/**
 * Complete creator onboarding — validates + saves profile server-side.
 */
export async function callCompleteCreatorOnboarding(
  data: CreatorOnboardingRequest
) {
  return apiCall<{ success: boolean }>(
    "/api/onboarding/creator",
    data as unknown as Record<string, unknown>
  );
}

/**
 * Complete brand onboarding — validates + saves profile server-side.
 */
export async function callCompleteBrandOnboarding(
  data: BrandOnboardingRequest
) {
  return apiCall<{ success: boolean }>(
    "/api/onboarding/brand",
    data as unknown as Record<string, unknown>
  );
}

/**
 * Create a campaign — brand only, validated server-side.
 */
export async function callCreateCampaign(data: CreateCampaignRequest) {
  return apiCall<{ campaignId: string }>(
    "/api/campaigns",
    data as unknown as Record<string, unknown>
  );
}

/**
 * Accept or reject a request — creator only.
 */
export async function callUpdateRequestStatus(
  data: UpdateRequestStatusPayload
) {
  return apiCall<{ success: boolean }>(
    "/api/requests",
    data as unknown as Record<string, unknown>,
    "PATCH"
  );
}

/**
 * Send a collaboration request to a creator — brand only.
 */
export async function callSendCollaborationRequest(
  data: SendCollaborationRequestPayload
) {
  return apiCall<{ success: boolean; requestId: string }>(
    "/api/requests",
    data as unknown as Record<string, unknown>,
    "POST"
  );
}

/**
 * Get campaigns matched to the current creator — scored server-side.
 * Match scoring uses minRatePrivate server-side, never exposed to frontend.
 */
export async function callGetMatchedCampaigns() {
  return apiCall<{ campaigns: MatchedCampaign[] }>("/api/matched-campaigns", {});
}

/**
 * Get matched creators for a campaign — brand only.
 * Returns sanitized profiles (minRatePrivate is stripped server-side).
 */
export async function callGetCreatorsForCampaign(campaignId: string) {
  return apiCall<{ creators: MatchedCreator[] }>("/api/creators-for-campaign", { campaignId });
}

// --------------------------------------------------
// AI Embedding & Search functions
// --------------------------------------------------

/**
 * Generate embedding for a creator profile.
 * Called after onboarding or profile update.
 */
export async function callGenerateCreatorEmbedding(creatorId: string) {
  return apiCall<{ success: boolean; skipped: boolean; message: string }>(
    "/api/embeddings/generate",
    { type: "creator", id: creatorId }
  );
}

/**
 * Generate embedding for a campaign.
 * Called after campaign creation or update.
 */
export async function callGenerateCampaignEmbedding(campaignId: string) {
  return apiCall<{ success: boolean; skipped: boolean; message: string }>(
    "/api/embeddings/generate",
    { type: "campaign", id: campaignId }
  );
}

/**
 * Batch generate all missing creator embeddings.
 */
export async function callBatchGenerateCreatorEmbeddings() {
  return apiCall<{
    success: boolean;
    total: number;
    generated: number;
    skipped: number;
    failed: number;
  }>("/api/embeddings/generate", { type: "batch-creators" });
}

/**
 * Batch generate all missing campaign embeddings.
 */
export async function callBatchGenerateCampaignEmbeddings() {
  return apiCall<{
    success: boolean;
    total: number;
    generated: number;
    skipped: number;
    failed: number;
  }>("/api/embeddings/generate", { type: "batch-campaigns" });
}

/**
 * Semantic search across creators using natural language.
 */
export async function callSearchCreators(query: string, limit?: number) {
  return apiCall<{ creators: MatchedCreator[] }>("/api/search", { target: "creators", query, limit });
}

/**
 * Semantic search across campaigns using natural language.
 */
export async function callSearchCampaigns(query: string, limit?: number) {
  return apiCall<{ campaigns: MatchedCampaign[] }>("/api/search", { target: "campaigns", query, limit });
}
