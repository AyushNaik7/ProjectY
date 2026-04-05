/**
 * API Route: Generate Embeddings for AI Matching
 * 
 * POST /api/generate-embeddings
 * 
 * Generates embeddings for creators and campaigns to enable AI matching.
 * This should be run once to populate embeddings for existing data.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { 
  batchGenerateCreatorEmbeddings, 
  batchGenerateCampaignEmbeddings 
} from "@/lib/embeddings";
import {
  attachRequestId,
  createRequestContext,
  logRequestCompleted,
} from "@/lib/request-context";

export async function POST(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    const body = await req.json();
    const { type = "both", force = false } = body;

    const results: any = {
      creators: { total: 0, generated: 0, skipped: 0, failed: 0, errors: [] },
      campaigns: { total: 0, generated: 0, skipped: 0, failed: 0, errors: [] }
    };

    // Generate creator embeddings
    if (type === "creators" || type === "both") {
      log.info("Starting creator embeddings generation");
      try {
        results.creators = await batchGenerateCreatorEmbeddings();
        log.info({ results: results.creators }, "Creator embeddings completed");
      } catch (error) {
        const err = error as Error;
        log.error({ err }, "Creator embeddings failed");
        results.creators.errors.push(err.message);
      }
    }

    // Generate campaign embeddings
    if (type === "campaigns" || type === "both") {
      log.info("Starting campaign embeddings generation");
      try {
        results.campaigns = await batchGenerateCampaignEmbeddings();
        log.info({ results: results.campaigns }, "Campaign embeddings completed");
      } catch (error) {
        const err = error as Error;
        log.error({ err }, "Campaign embeddings failed");
        results.campaigns.errors.push(err.message);
      }
    }

    // Summary
    const totalGenerated = results.creators.generated + results.campaigns.generated;
    const totalFailed = results.creators.failed + results.campaigns.failed;
    const allErrors = [...results.creators.errors, ...results.campaigns.errors];

    const response = {
      success: totalFailed === 0,
      summary: {
        totalGenerated,
        totalFailed,
        hasErrors: allErrors.length > 0
      },
      details: results,
      errors: allErrors
    };

    const statusCode = response.success ? 200 : 207; // 207 = Multi-Status (partial success)
    const res = NextResponse.json(response, { status: statusCode });
    logRequestCompleted(log, startTimeMs, statusCode);
    return attachRequestId(res, requestId);

  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "generate_embeddings.failed");
    const res = NextResponse.json(
      { 
        success: false,
        error: err.message || "Internal server error",
        details: null
      },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}

// GET endpoint to check embedding status
export async function GET(req: NextRequest) {
  const { requestId, startTimeMs, log } = createRequestContext(req);

  try {
    // Check creators
    const { data: creatorStats } = await supabaseAdmin
      .from("creators")
      .select("id, embedding")
      .limit(1000);

    const totalCreators = creatorStats?.length || 0;
    const creatorsWithEmbeddings = creatorStats?.filter(c => c.embedding).length || 0;

    // Check campaigns
    const { data: campaignStats } = await supabaseAdmin
      .from("campaigns")
      .select("id, embedding, status")
      .eq("status", "active")
      .limit(1000);

    const totalCampaigns = campaignStats?.length || 0;
    const campaignsWithEmbeddings = campaignStats?.filter(c => c.embedding).length || 0;

    const status = {
      creators: {
        total: totalCreators,
        withEmbeddings: creatorsWithEmbeddings,
        percentage: totalCreators > 0 ? Math.round((creatorsWithEmbeddings / totalCreators) * 100) : 0
      },
      campaigns: {
        total: totalCampaigns,
        withEmbeddings: campaignsWithEmbeddings,
        percentage: totalCampaigns > 0 ? Math.round((campaignsWithEmbeddings / totalCampaigns) * 100) : 0
      },
      ready: creatorsWithEmbeddings > 0 && campaignsWithEmbeddings > 0
    };

    const res = NextResponse.json(status);
    logRequestCompleted(log, startTimeMs, 200);
    return attachRequestId(res, requestId);

  } catch (error: unknown) {
    const err = error as { message?: string };
    log.error({ err }, "embedding_status.failed");
    const res = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
    logRequestCompleted(log, startTimeMs, 500);
    return attachRequestId(res, requestId);
  }
}