/**
 * API Client Library — Frontend → Next.js API Routes → Supabase
 *
 * This is the ONLY way the frontend communicates with the backend for writes.
 * All mutations go through these typed API wrappers.
 * The frontend NEVER writes to the database directly (except through Supabase services).
 */

import { supabase } from "./supabase";

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
  semanticScore?: number;
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
  semanticScore?: number;
  matchReasons: string[];
}

// --------------------------------------------------
// Helper: Get current user's Supabase access token
// --------------------------------------------------

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function apiCall<T>(
  url: string,
  body: Record<string, unknown>,
  method = "POST"
): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
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
 * Get campaigns matched to the current creator — scored server-side.
 * Match scoring uses minRatePrivate server-side, never exposed to frontend.
 */
export async function callGetMatchedCampaigns() {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/matched-campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
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
  const accessToken = await getAccessToken();
  const res = await fetch("/api/creators-for-campaign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ campaignId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch creators");
  return data as { creators: MatchedCreator[] };
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
  const accessToken = await getAccessToken();
  const res = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ target: "creators", query, limit }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Search failed");
  return data as { creators: MatchedCreator[] };
}

/**
 * Semantic search across campaigns using natural language.
 */
export async function callSearchCampaigns(query: string, limit?: number) {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ target: "campaigns", query, limit }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Search failed");
  return data as { campaigns: MatchedCampaign[] };
}
