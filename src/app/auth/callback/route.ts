import { NextRequest, NextResponse } from "next/server";

/**
 * This route is deprecated - using Clerk for authentication instead.
 * Keeping for reference but redirecting to login.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  console.log("Auth callback called - redirecting to login (using Clerk now)");
  
  // Redirect to login since we're using Clerk
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
