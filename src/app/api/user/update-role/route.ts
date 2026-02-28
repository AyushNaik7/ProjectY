import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    console.log('=== Update Role API Called ===');
    
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No userId found - unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { role } = body;

    if (!role || !["creator", "brand"].includes(role)) {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { error: "Invalid role. Must be 'creator' or 'brand'" },
        { status: 400 }
      );
    }

    // Update user metadata using Clerk's backend API
    console.log('Updating user metadata for:', userId, 'with role:', role);
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });

    console.log('Successfully updated role');
    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Error updating role:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}
