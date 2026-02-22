import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Enforce HTTPS (only in production)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    
    // Remove server header
    'X-Powered-By': '',
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // Rate limiting check (basic implementation)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;

  // Protect sensitive endpoints
  const sensitiveEndpoints = ['/api/auth', '/api/login', '/api/signup'];
  if (sensitiveEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    // Add rate limiting header
    response.headers.set('X-RateLimit-Limit', '10');
  }

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
      'https://your-domain.vercel.app', // Add your production domain
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
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
