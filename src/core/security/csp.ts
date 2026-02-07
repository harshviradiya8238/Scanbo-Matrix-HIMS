/**
 * Content Security Policy configuration
 * Customize based on your application's needs
 */

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'frame-ancestors'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
}

/**
 * Generate CSP header string
 */
export function generateCSP(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (!values || values.length === 0) return '';
      return `${key} ${values.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Default CSP configuration
 * Adjust based on your CDN, analytics, and third-party service needs
 */
export const defaultCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // 'unsafe-inline' needed for Next.js
  'style-src': ["'self'", "'unsafe-inline'"], // 'unsafe-inline' needed for MUI
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

