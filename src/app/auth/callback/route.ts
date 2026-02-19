import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  console.log("=== Auth Callback ===");
  console.log("Code:", code ? "present" : "missing");
  console.log("Error:", error);
  console.log("Error description:", error_description);
  console.log("All params:", Object.fromEntries(requestUrl.searchParams));

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    try {
      // Create response object that we'll use for redirecting
      const response = NextResponse.next();
      
      // Create a Supabase client with proper cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      console.log("Exchanging code for session...");
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      console.log("Session exchange successful");
      console.log("User:", data.user?.email);
      console.log("User metadata:", data.user?.user_metadata);
      console.log("Session:", data.session ? "present" : "missing");
      console.log("Access token:", data.session?.access_token ? "present" : "missing");

      if (data.session && data.user) {
        // Check for pending role from query params (passed from signup)
        const pendingRole = requestUrl.searchParams.get("role") as "creator" | "brand" | null;
        
        // Get existing role from user metadata
        let role = data.user.user_metadata?.role as "creator" | "brand" | undefined;
        
        console.log("Pending role:", pendingRole);
        console.log("Existing role:", role);
        
        // If there's a pending role and no existing role, set it
        if (pendingRole && !role) {
          console.log("Setting pending role:", pendingRole);
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: pendingRole },
          });
          
          if (!updateError) {
            role = pendingRole;
            console.log("Role updated successfully");
          } else {
            console.error("Error updating role:", updateError);
          }
        }
        
        // Determine redirect URL
        const redirectUrl = role === "creator"
          ? `${requestUrl.origin}/dashboard/creator`
          : role === "brand"
          ? `${requestUrl.origin}/dashboard/brand`
          : `${requestUrl.origin}/role-select`;

        console.log("Redirecting to:", redirectUrl);

        // Create redirect response and copy cookies from the response object
        const redirectResponse = NextResponse.redirect(redirectUrl);
        
        // Copy all cookies that were set during session exchange
        response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie);
        });
        
        return redirectResponse;
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected_error`
      );
    }
  }

  // No code present, redirect to login
  console.error("No code in callback URL");
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
