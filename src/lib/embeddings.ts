/**
 * Embedding Service — Server-Side Only
 *
 * Generates vector embeddings using OpenAI's text-embedding-ada-002 model.
 * Stores embeddings in PostgreSQL via pgvector.
 *
 * SECURITY: This module must NEVER be imported on the client side.
 * All AI API calls happen exclusively on the server.
 */

import { supabaseAdmin } from "@/lib/supabase-server";

// ============================================================
// Configuration
// ============================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const EMBEDDING_MODEL = "text-embedding-ada-002";
const EMBEDDING_DIMENSIONS = 1536;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

if (!OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY is not set — embedding generation will not work."
  );
}

// ============================================================
// Types
// ============================================================

interface EmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

interface CreatorRow {
  id: string;
  name: string;
  niche: string;
  bio?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  youtube_followers?: number;
  tiktok_followers?: number;
  instagram_engagement?: number;
  youtube_engagement?: number;
  tiktok_engagement?: number;
  avg_views?: number;
  verified?: boolean;
  min_rate_private?: number;
  embedding_text?: string;
}

interface CampaignRow {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  deliverable_type: string;
  budget: number;
  timeline: string;
  niche?: string;
  status: string;
  embedding_text?: string;
}

// ============================================================
// Core: Generate Embedding via OpenAI API
// ============================================================

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text.slice(0, 8000), // Token limit safety
          model: EMBEDDING_MODEL,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // Rate limit - back off exponentially
        if (response.status === 429) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
          console.warn(`Rate limited, retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
      }

      const data: EmbeddingResponse = await response.json();
      return data.data[0].embedding;
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) =>
          setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError || new Error("Failed to generate embedding");
}

// ============================================================
// Text Builders: Convert structured data to descriptive text
// ============================================================

export function buildCreatorEmbeddingText(creator: CreatorRow): string {
  const parts: string[] = [];

  parts.push(`Creator profile: ${creator.name || "Unknown"}`);
  parts.push(`Niche and content focus: ${creator.niche}`);

  if (creator.bio) {
    parts.push(`Bio: ${creator.bio}`);
  }

  // Platform presence
  const platforms: string[] = [];
  if (creator.instagram_followers) {
    platforms.push(
      `Instagram with ${creator.instagram_followers.toLocaleString()} followers` +
        (creator.instagram_engagement
          ? ` and ${creator.instagram_engagement}% engagement rate`
          : "")
    );
  }
  if (creator.youtube_followers) {
    platforms.push(
      `YouTube with ${creator.youtube_followers.toLocaleString()} subscribers` +
        (creator.youtube_engagement
          ? ` and ${creator.youtube_engagement}% engagement rate`
          : "")
    );
  }
  if (creator.tiktok_followers) {
    platforms.push(
      `TikTok with ${creator.tiktok_followers.toLocaleString()} followers` +
        (creator.tiktok_engagement
          ? ` and ${creator.tiktok_engagement}% engagement rate`
          : "")
    );
  }

  if (platforms.length > 0) {
    parts.push(`Active on ${platforms.join(", ")}`);
  }

  if (creator.avg_views) {
    parts.push(
      `Average views per content: ${creator.avg_views.toLocaleString()}`
    );
  }

  // Audience size category
  const totalFollowers =
    (creator.instagram_followers || 0) +
    (creator.youtube_followers || 0) +
    (creator.tiktok_followers || 0);

  if (totalFollowers >= 1_000_000) {
    parts.push("Macro influencer with over 1 million total followers");
  } else if (totalFollowers >= 100_000) {
    parts.push("Mid-tier influencer with 100K-1M total followers");
  } else if (totalFollowers >= 10_000) {
    parts.push("Micro influencer with 10K-100K total followers");
  } else if (totalFollowers >= 1_000) {
    parts.push("Nano influencer with 1K-10K total followers");
  }

  if (creator.verified) {
    parts.push("Verified creator account");
  }

  return parts.join(". ") + ".";
}

export function buildCampaignEmbeddingText(campaign: CampaignRow): string {
  const parts: string[] = [];

  parts.push(`Campaign: ${campaign.title}`);
  parts.push(`Description: ${campaign.description}`);
  parts.push(`Content type required: ${campaign.deliverable_type}`);

  if (campaign.niche) {
    parts.push(`Target niche: ${campaign.niche}`);
  }

  parts.push(`Budget: ₹${campaign.budget.toLocaleString()}`);

  // Budget tier categorization
  if (campaign.budget >= 500_000) {
    parts.push("Premium campaign with high budget");
  } else if (campaign.budget >= 100_000) {
    parts.push("Mid-range campaign budget");
  } else {
    parts.push("Starter campaign budget");
  }

  if (campaign.timeline) {
    parts.push(`Timeline: ${campaign.timeline}`);
  }

  return parts.join(". ") + ".";
}

// ============================================================
// Embedding Storage & Generation
// ============================================================

/**
 * Generate and store embedding for a creator profile.
 * Skips if the embedding text hasn't changed (avoids unnecessary API calls).
 */
export async function generateCreatorEmbedding(
  creatorId: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    // Fetch creator data
    const { data: creator, error } = await supabaseAdmin
      .from("creators")
      .select("*")
      .eq("id", creatorId)
      .single();

    if (error || !creator) {
      return { success: false, error: "Creator not found" };
    }

    // Build text representation
    const embeddingText = buildCreatorEmbeddingText(creator);

    // Skip if text hasn't changed
    if (creator.embedding_text === embeddingText && creator.embedding) {
      return { success: true, skipped: true };
    }

    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);

    // Store embedding in database
    const { error: updateError } = await supabaseAdmin
      .from("creators")
      .update({
        embedding: JSON.stringify(embedding),
        embedding_text: embeddingText,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq("id", creatorId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    const errMsg = (err as Error).message;
    console.error(`Error generating creator embedding: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

/**
 * Generate and store embedding for a campaign.
 * Skips if the embedding text hasn't changed.
 */
export async function generateCampaignEmbedding(
  campaignId: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (error || !campaign) {
      return { success: false, error: "Campaign not found" };
    }

    const embeddingText = buildCampaignEmbeddingText(campaign);

    if (campaign.embedding_text === embeddingText && campaign.embedding) {
      return { success: true, skipped: true };
    }

    const embedding = await generateEmbedding(embeddingText);

    const { error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({
        embedding: JSON.stringify(embedding),
        embedding_text: embeddingText,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    const errMsg = (err as Error).message;
    console.error(`Error generating campaign embedding: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

/**
 * Batch generate embeddings for all creators without embeddings.
 * Used for backfilling existing data.
 */
export async function batchGenerateCreatorEmbeddings(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const { data: creators, error } = await supabaseAdmin
    .from("creators")
    .select("id")
    .is("embedding", null);

  if (error) {
    return {
      total: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      errors: [error.message],
    };
  }

  const results = {
    total: creators?.length || 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const creator of creators || []) {
    const result = await generateCreatorEmbedding(creator.id);
    if (result.success) {
      if (result.skipped) results.skipped++;
      else results.generated++;
    } else {
      results.failed++;
      if (result.error) results.errors.push(`${creator.id}: ${result.error}`);
    }
    // Rate limit: 60ms delay between calls
    await new Promise((r) => setTimeout(r, 60));
  }

  return results;
}

/**
 * Batch generate embeddings for all campaigns without embeddings.
 */
export async function batchGenerateCampaignEmbeddings(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const { data: campaigns, error } = await supabaseAdmin
    .from("campaigns")
    .select("id")
    .is("embedding", null);

  if (error) {
    return {
      total: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      errors: [error.message],
    };
  }

  const results = {
    total: campaigns?.length || 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const campaign of campaigns || []) {
    const result = await generateCampaignEmbedding(campaign.id);
    if (result.success) {
      if (result.skipped) results.skipped++;
      else results.generated++;
    } else {
      results.failed++;
      if (result.error) results.errors.push(`${campaign.id}: ${result.error}`);
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  return results;
}

/**
 * Generate a standalone embedding for a query string.
 * Used for ad-hoc similarity searches.
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}
