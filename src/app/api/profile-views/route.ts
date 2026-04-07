/**
 * API Route: Profile Views
 *
 * POST /api/profile-views — Track a profile view
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  attachRequestId,
  createRequestContext,
} from "@/lib/request-context";
import { timedQuery } from "@/lib/db-timing";

export async function POST(req: NextRequest) {
  const { requestId, log } = createRequestContext(req);

  try {
    const body = await req.json();
    const { creator_id } = body;

    if (!creator_id) {
      const res = NextResponse.json(
        { error: "creator_id is required" },
        { status: 400 }
      );
      return attachRequestId(res, requestId);
    }

    // Get viewer info if authenticated
    const { userId } = getAuth(req);
    let viewerClerkId: string | null = null;
    let viewerRole: string | null = null;

    if (userId) {
      viewerClerkId = userId;
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        viewerRole = (clerkUser.publicMetadata?.role as string) || null;
      } catch {
        // User not found, continue as anonymous
      }
    }

    // Insert profile view
    const { error } = await timedQuery(log, "profile_views.insert", () =>
      supabaseAdmin.from("profile_views").insert({
        creator_id,
        viewer_clerk_id: viewerClerkId,
        viewer_role: viewerRole,
      })
    );

    if (error) {
      log.error({ error }, "Failed to track profile view");
      // Don't fail the request, just log
    }

    const res = NextResponse.json({ success: true });
    return attachRequestId(res, requestId);
  } catch (err) {
    log.error({ err }, "Unexpected error in POST /api/profile-views");
    const res = NextResponse.json({ success: true }); // Don't fail
    return attachRequestId(res, requestId);
  }
}
