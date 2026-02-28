import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { metadata } = body;

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { error: "Invalid metadata" },
        { status: 400 }
      );
    }

    // Update user metadata using Clerk's backend API
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update metadata" },
      { status: 500 }
    );
  }
}
