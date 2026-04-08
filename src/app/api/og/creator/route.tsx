/**
 * API Route: Dynamic OG Image for Creator Profiles
 *
 * GET /api/og/creator?handle=[handle] — Generate OG image
 */

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return new Response("Missing handle parameter", { status: 400 });
    }

    // Fetch creator data
    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("name, niche, instagram_followers, instagram_engagement, tier")
      .eq("instagram_handle", handle)
      .single();

    if (!creator) {
      return new Response("Creator not found", { status: 404 });
    }

    const formatFollowers = (count: number) => {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    };

    const tierColors: Record<string, string> = {
      bronze: "#78716c",
      silver: "#94a3b8",
      gold: "#f59e0b",
      platinum: "#3b82f6",
    };

    const tierColor = tierColors[creator.tier] || tierColors.bronze;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#e6f1fb",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Main Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "24px",
              padding: "60px 80px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Creator Name */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {creator.name}
            </div>

            {/* Niche Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f3f4f6",
                borderRadius: "999px",
                padding: "12px 32px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#6366f1",
                }}
              >
                {creator.niche}
              </div>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: "flex",
                gap: "48px",
                marginBottom: "24px",
              }}
            >
              {/* Followers */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                >
                  {formatFollowers(creator.instagram_followers)}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#6b7280",
                  }}
                >
                  Followers
                </div>
              </div>

              {/* Engagement */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                >
                  {creator.instagram_engagement.toFixed(1)}%
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#6b7280",
                  }}
                >
                  Engagement
                </div>
              </div>

              {/* Tier */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: tierColor,
                    textTransform: "capitalize",
                  }}
                >
                  {creator.tier}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#6b7280",
                  }}
                >
                  Tier
                </div>
              </div>
            </div>

            {/* Platform Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  color: "#6b7280",
                }}
              >
                InstaCollab
              </div>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#6b7280",
                }}
              />
              <div
                style={{
                  fontSize: "24px",
                  color: "#6b7280",
                }}
              >
                Creator Profile
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("OG image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
