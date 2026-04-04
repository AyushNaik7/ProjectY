import { NextRequest, NextResponse } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function requireUser(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return {
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role as "creator" | "brand" | undefined;

    // Return a user object compatible with existing code
    // Clerk's userId is the unique identifier
    return {
      user: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        // For compatibility with existing code that checks user_metadata
        user_metadata: {
          role,
          name:
            clerkUser.firstName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        },
        publicMetadata: clerkUser.publicMetadata,
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
