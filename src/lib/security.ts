/**
 * Security utilities for protecting against common attacks
 */

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting to prevent brute force attacks
 */
export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Check if domain is in allowed list
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    // If URL parsing fails, check if it's a relative path
    return url.startsWith('/') && !url.startsWith('//');
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check for common SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*|;|'|"|\||&)/g,
    /(\bOR\b|\bAND\b).*?=/gi,
    /UNION.*?SELECT/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  return { isValid: true };
}

/**
 * Detect and prevent clickjacking
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "frame-ancestors 'none'",
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Hash sensitive data (for logging, not for passwords)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate session token
 */
export function validateSessionToken(token: string): boolean {
  // Check token format (should be a valid JWT-like structure)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Check token length
  if (token.length < 100 || token.length > 2000) return false;
  
  return true;
}

/**
 * Detect suspicious patterns in user input
 */
export function detectSuspiciousActivity(input: string): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for SQL injection
  if (detectSQLInjection(input)) {
    reasons.push('Potential SQL injection detected');
  }

  // Check for XSS attempts
  if (/<script|javascript:|onerror|onload/gi.test(input)) {
    reasons.push('Potential XSS attack detected');
  }

  // Check for path traversal
  if (/\.\.[\/\\]/.test(input)) {
    reasons.push('Potential path traversal detected');
  }

  // Check for command injection
  if (/[;&|`$()]/.test(input)) {
    reasons.push('Potential command injection detected');
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * Log security event (implement proper logging in production)
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical'
): void {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY ${severity.toUpperCase()}] ${timestamp}:`, event, details);
  
  // In production, send to security monitoring service
  // e.g., Sentry, DataDog, CloudWatch, etc.
}
