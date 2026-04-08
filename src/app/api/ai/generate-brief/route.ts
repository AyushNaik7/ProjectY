/**
 * API Route: AI Campaign Brief Generator
 *
 * POST /api/ai/generate-brief — Generate campaign brief using OpenAI GPT-4
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/request-auth";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import OpenAI from "openai";
import { parseJsonBody } from "@/lib/api-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateBriefPayload {
  brand_name: string;
  product_name: string;
  product_description: string;
  campaign_goal: "awareness" | "sales" | "engagement";
  target_audience: string;
  budget: number;
  platform: string;
  tone_of_voice: string;
}

export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const parsed = await parseJsonBody<GenerateBriefPayload>(req);
    if (!parsed.ok) return attachRequestId(parsed.response, requestId);
    const body = parsed.data;
    const {
      brand_name,
      product_name,
      product_description,
      campaign_goal,
      target_audience,
      budget,
      platform,
      tone_of_voice,
    } = body;

    // Validate required fields
    if (
      !brand_name ||
      !product_name ||
      !product_description ||
      !campaign_goal ||
      !target_audience ||
      !budget ||
      !platform ||
      !tone_of_voice
    ) {
      const res = NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Create structured prompt for GPT-4
    const prompt = `You are an expert influencer marketing campaign strategist. Generate a comprehensive campaign brief based on the following information:

Brand: ${brand_name}
Product: ${product_name}
Product Description: ${product_description}
Campaign Goal: ${campaign_goal}
Target Audience: ${target_audience}
Budget: ₹${budget.toLocaleString()}
Platform: ${platform}
Tone of Voice: ${tone_of_voice}

Generate a campaign brief in the following JSON format:
{
  "campaign_title": "A catchy, creative campaign title (max 60 characters)",
  "campaign_description": "A detailed 2-3 paragraph description of the campaign strategy and objectives",
  "deliverable_type": "The type of content creators should produce (e.g., 'Instagram Reel', 'YouTube Video', 'Story Series')",
  "content_guidelines": "Detailed guidelines for content creation (3-4 sentences)",
  "do_list": ["3 specific things creators SHOULD do"],
  "dont_list": ["3 specific things creators SHOULD NOT do"],
  "sample_caption": "A sample Instagram caption that creators can use as inspiration (include emojis)",
  "suggested_hashtags": ["10-15 relevant hashtags without the # symbol"]
}

Make the brief specific to the Indian market, culturally relevant, and optimized for ${platform}. Focus on ${campaign_goal} as the primary objective.`;

    // Call OpenAI API with streaming
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert influencer marketing strategist specializing in the Indian market. You create compelling, data-driven campaign briefs that drive results. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const brief = JSON.parse(responseText);

    // Validate response structure
    const requiredFields = [
      "campaign_title",
      "campaign_description",
      "deliverable_type",
      "content_guidelines",
      "do_list",
      "dont_list",
      "sample_caption",
      "suggested_hashtags",
    ];

    for (const field of requiredFields) {
      if (!brief[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    log.info({ brief }, "campaign_brief_generated");

    const res = NextResponse.json({ brief });
    return attachRequestId(res, requestId);
  } catch (error: any) {
    log.error({ err: error }, "generate_brief_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to generate campaign brief" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}

// Streaming version for real-time generation
export async function GET(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const auth = await requireUser(req);
    if (auth.error) return attachRequestId(auth.error, requestId);

    const { searchParams } = new URL(req.url);
    const brand_name = searchParams.get("brand_name");
    const product_name = searchParams.get("product_name");
    const product_description = searchParams.get("product_description");
    const campaign_goal = searchParams.get("campaign_goal");
    const target_audience = searchParams.get("target_audience");
    const budget = searchParams.get("budget");
    const platform = searchParams.get("platform");
    const tone_of_voice = searchParams.get("tone_of_voice");

    if (
      !brand_name ||
      !product_name ||
      !product_description ||
      !campaign_goal ||
      !target_audience ||
      !budget ||
      !platform ||
      !tone_of_voice
    ) {
      const res = NextResponse.json(
        { error: "All query parameters are required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    const prompt = `You are an expert influencer marketing campaign strategist. Generate a comprehensive campaign brief based on the following information:

Brand: ${brand_name}
Product: ${product_name}
Product Description: ${product_description}
Campaign Goal: ${campaign_goal}
Target Audience: ${target_audience}
Budget: ₹${parseInt(budget).toLocaleString()}
Platform: ${platform}
Tone of Voice: ${tone_of_voice}

Generate a campaign brief in the following JSON format:
{
  "campaign_title": "A catchy, creative campaign title (max 60 characters)",
  "campaign_description": "A detailed 2-3 paragraph description of the campaign strategy and objectives",
  "deliverable_type": "The type of content creators should produce",
  "content_guidelines": "Detailed guidelines for content creation",
  "do_list": ["3 specific things creators SHOULD do"],
  "dont_list": ["3 specific things creators SHOULD NOT do"],
  "sample_caption": "A sample Instagram caption with emojis",
  "suggested_hashtags": ["10-15 relevant hashtags without # symbol"]
}

Make it specific to the Indian market and optimized for ${platform}.`;

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert influencer marketing strategist. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      stream: true,
      response_format: { type: "json_object" },
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Request-ID": requestId,
      },
    });
  } catch (error: any) {
    log.error({ err: error }, "stream_brief_failed");
    const res = NextResponse.json(
      { error: error.message || "Failed to stream campaign brief" },
      { status: 500 }
    );
    return attachRequestId(res, requestId);
  }
}
