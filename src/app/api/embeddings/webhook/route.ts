/**
 * API Route: Embedding Webhook — Auto-generate on Insert/Update
 * POST /api/embeddings/webhook
 *
 * Called by Supabase Database Webhooks when creators or campaigns are
 * inserted/updated. Generates embeddings automatically.
 *
 * Setup: Configure Supabase Database Webhooks to call this endpoint
 * with the table name and record ID.
 *
 * Body: { type: "INSERT" | "UPDATE", table: "creators" | "campaigns", record: { id: ... } }
 * Headers: x-webhook-secret: <WEBHOOK_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateCreatorEmbedding,
  generateCampaignEmbedding,
} from "@/lib/embeddings";

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get("x-webhook-secret");
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, table, record } = body;

    if (!type || !table || !record?.id) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Only process INSERT and UPDATE events
    if (type !== "INSERT" && type !== "UPDATE") {
      return NextResponse.json({ success: true, message: "Skipped" });
    }

    let result;
    if (table === "creators") {
      result = await generateCreatorEmbedding(record.id);
    } else if (table === "campaigns") {
      result = await generateCampaignEmbedding(record.id);
    } else {
      return NextResponse.json(
        { error: `Unsupported table: ${table}` },
        { status: 400 }
      );
    }

    if (!result.success) {
      console.error(`Webhook embedding generation failed: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      skipped: result.skipped || false,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
