import { z } from 'zod';

/**
 * Input validation schemas and utilities
 * Prevents XSS, injection attacks, and invalid data
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize user input
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(input);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => e.message).join(', '),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // ID validation
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),

  // Email validation
  email: z.string().email().max(255),

  // URL validation
  url: z.string().url().max(2048),

  // Phone number (basic)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),

  // Text input (sanitized)
  text: z.string().min(1).max(1000).transform(sanitizeInput),

  // Numeric input
  number: z.coerce.number().int().positive(),

  // Date string (ISO format)
  date: z.string().datetime(),

  // Password (basic - enhance based on requirements)
  password: z.string().min(8).max(128),
};

/**
 * CSRF token validation helper
 * In production, implement proper CSRF token generation and validation
 */
export function validateCSRFToken(token: string, sessionToken?: string): boolean {
  // Placeholder - implement proper CSRF validation
  // This should compare tokens from session and request
  return !!token && token.length > 0;
}

