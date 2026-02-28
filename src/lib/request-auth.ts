import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function requireUser(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Return a user object compatible with existing code
    // Clerk's userId is the unique identifier
    return {
      user: {
        id: userId,
        // For compatibility with existing code that checks user_metadata
        user_metadata: {},
      },
      token: userId, // Return userId as token for compatibility
    };
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 }
      ),
    };
  }
}

export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}
