/**
 * Secure API route wrapper with built-in security features
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, sanitizeInput, logSecurityEvent, detectSuspiciousActivity } from './security';

interface SecureRouteOptions {
  rateLimit?: {
    maxAttempts: number;
    windowMs: number;
  };
  requireAuth?: boolean;
  allowedMethods?: string[];
  validateInput?: boolean;
}

/**
 * Wrapper for secure API routes
 */
export function secureRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecureRouteOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        );
      }

      // Rate limiting
      if (options.rateLimit) {
        const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
        const identifier = `${ip}-${req.nextUrl.pathname}`;
        
        const rateLimitResult = rateLimit(
          identifier,
          options.rateLimit.maxAttempts,
          options.rateLimit.windowMs
        );

        if (!rateLimitResult.allowed) {
          logSecurityEvent(
            'Rate limit exceeded',
            { ip, path: req.nextUrl.pathname },
            'medium'
          );
          
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { 
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
              }
            }
          );
        }
      }

      // Validate input for suspicious activity
      if (options.validateInput && req.method !== 'GET') {
        try {
          const body = await req.clone().json();
          const bodyString = JSON.stringify(body);
          
          const suspiciousCheck = detectSuspiciousActivity(bodyString);
          if (suspiciousCheck.isSuspicious) {
            logSecurityEvent(
              'Suspicious activity detected',
              {
                ip: req.ip || req.headers.get('x-forwarded-for'),
                path: req.nextUrl.pathname,
                reasons: suspiciousCheck.reasons,
              },
              'high'
            );
            
            return NextResponse.json(
              { error: 'Invalid request' },
              { status: 400 }
            );
          }
        } catch (e) {
          // If body parsing fails, continue (might be empty body)
        }
      }

      // Check authentication if required
      if (options.requireAuth) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
      }

      // Call the actual handler
      return await handler(req);
      
    } catch (error) {
      console.error('API Error:', error);
      
      logSecurityEvent(
        'API error',
        {
          path: req.nextUrl.pathname,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'high'
      );
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Sanitize request body
 */
export async function sanitizeRequestBody(req: NextRequest): Promise<any> {
  try {
    const body = await req.json();
    
    // Recursively sanitize all string values
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeInput(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    return sanitize(body);
  } catch {
    return null;
  }
}

/**
 * Verify request origin
 */
export function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://your-domain.vercel.app', // Add your production domain
  ];
  
  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed));
  }
  
  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed));
  }
  
  // Allow requests without origin/referer (e.g., from server)
  return true;
}

/**
 * Create secure response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
