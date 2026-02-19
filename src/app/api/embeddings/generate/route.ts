/**
 * API Route: Generate Embeddings
 * POST /api/embeddings/generate
 *
 * Generates vector embeddings for creators and campaigns.
 * Server-side only — AI API key never exposed to client.
 *
 * Body:
 *   { type: "creator", id: "<uuid>" }
 *   { type: "campaign", id: "<uuid>" }
 *   { type: "batch-creators" }
 *   { type: "batch-campaigns" }
 *
 * Headers: Authorization: Bearer <access_token>
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/supabase-server";
import {
  generateCreatorEmbedding,
  generateCampaignEmbedding,
  batchGenerateCreatorEmbeddings,
  batchGenerateCampaignEmbeddings,
} from "@/lib/embeddings";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);
    const uid = user.id;

    // 2. Rate limit
    if (!checkRateLimit(uid)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // 3. Parse request
    const body = await req.json();
    const { type, id } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing "type" field' },
        { status: 400 }
      );
    }

    // 4. Process based on type
    switch (type) {
      case "creator": {
        if (!id) {
          return NextResponse.json(
            { error: "Missing creator ID" },
            { status: 400 }
          );
        }
        const result = await generateCreatorEmbedding(id);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          skipped: result.skipped || false,
          message: result.skipped
            ? "Embedding already up to date"
            : "Embedding generated successfully",
        });
      }

      case "campaign": {
        if (!id) {
          return NextResponse.json(
            { error: "Missing campaign ID" },
            { status: 400 }
          );
        }
        const result = await generateCampaignEmbedding(id);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          skipped: result.skipped || false,
          message: result.skipped
            ? "Embedding already up to date"
            : "Embedding generated successfully",
        });
      }

      case "batch-creators": {
        const results = await batchGenerateCreatorEmbeddings();
        return NextResponse.json({ success: true, ...results });
      }

      case "batch-campaigns": {
        const results = await batchGenerateCampaignEmbeddings();
        return NextResponse.json({ success: true, ...results });
      }

      default:
        return NextResponse.json(
          { error: `Invalid type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Embedding generation error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
