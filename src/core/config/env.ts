import { z } from 'zod';

/**
 * Environment variable schema with validation
 * Add new environment variables here with proper validation
 */
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Scanbo HIMS'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(30000),

  // Feature Flags (client-side safe)
  NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),

  // Tenant/Region Configuration
  NEXT_PUBLIC_TENANT_ID: z.string().optional(),
  NEXT_PUBLIC_REGION: z.string().default('us-east-1'),

  // Analytics & Monitoring (optional)
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

/**
 * Validated environment variables
 * Throws error at build time if validation fails
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
  NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
});

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

