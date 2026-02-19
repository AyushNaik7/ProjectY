import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=== TEST REDIRECT HIT ===");
  console.log("URL:", request.url);
  
  return NextResponse.json({
    message: "Test redirect route works!",
    url: request.url,
    params: Object.fromEntries(new URL(request.url).searchParams),
  });
}
