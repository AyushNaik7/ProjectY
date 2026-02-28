import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Don't protect routes by default - let pages handle their own auth
  // Only protect specific routes if needed
  
  const response = NextResponse.next();

  // Security Headers
  const securityHeaders = {
    'X-Frame-Options': 'SAMEORIGIN', // Changed from DENY to allow Clerk iframes
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://*.clerk.accounts.dev https://clerk.happy-akita-7.lcl.dev https://clerk-telemetry.com",
      "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://*.clerk.accounts.dev",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    'X-Powered-By': '',
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  const pathname = request.nextUrl.pathname;

  // Prevent access to sensitive files
  const blockedPaths = [
    '/.env',
    '/.git',
    '/node_modules',
    '/.next',
    '/package.json',
    '/package-lock.json',
  ];
  
  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ];

    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
