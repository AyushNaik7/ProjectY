import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Log everything
  const debugInfo = {
    url: request.url,
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    searchParams: Object.fromEntries(requestUrl.searchParams),
    headers: Object.fromEntries(request.headers),
  };
  
  console.log("=== CALLBACK DEBUG ===");
  console.log(JSON.stringify(debugInfo, null, 2));
  
  // Return as JSON for browser viewing
  return NextResponse.json(debugInfo, { status: 200 });
}
