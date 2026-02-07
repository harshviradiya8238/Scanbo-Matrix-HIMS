import { env } from './env';

/**
 * Feature flag configuration
 * Supports:
 * - Environment-based flags
 * - Tenant-specific overrides
 * - Region-specific overrides
 * - Runtime feature toggles
 */

export interface FeatureFlags {
  // UI Features
  enableAdvancedSearch: boolean;
  enableDarkMode: boolean;
  enableNotifications: boolean;

  // Business Features
  enableMultiTenant: boolean;
  enableAnalytics: boolean;
  enableExport: boolean;

  // Experimental Features
  enableBetaFeatures: boolean;
  enableNewDashboard: boolean;
}

/**
 * Default feature flags
 */
const defaultFlags: FeatureFlags = {
  enableAdvancedSearch: true,
  enableDarkMode: false,
  enableNotifications: true,
  enableMultiTenant: false,
  enableAnalytics: !!env.NEXT_PUBLIC_ANALYTICS_ID,
  enableExport: true,
  enableBetaFeatures: false,
  enableNewDashboard: false,
};

/**
 * Parse feature flags from environment variable
 * Format: "flag1:true,flag2:false"
 */
function parseEnvFlags(): Partial<FeatureFlags> {
  const flags: Partial<FeatureFlags> = {};
  const envFlags = env.NEXT_PUBLIC_FEATURE_FLAGS;

  if (!envFlags) return flags;

  envFlags.split(',').forEach((flag) => {
    const [key, value] = flag.split(':');
    if (key && value !== undefined) {
      const boolValue = value === 'true';
      (flags as Record<string, boolean>)[key] = boolValue;
    }
  });

  return flags;
}

/**
 * Get tenant-specific feature flags
 * Override this function to fetch from API or database
 */
function getTenantFlags(tenantId?: string): Partial<FeatureFlags> {
  if (!tenantId) return {};

  // Example: Fetch from API or database
  // In production, this would be an async call
  return {};
}

/**
 * Get region-specific feature flags
 */
function getRegionFlags(region: string): Partial<FeatureFlags> {
  const regionFlags: Record<string, Partial<FeatureFlags>> = {
    'us-east-1': {},
    'eu-west-1': {
      enableDarkMode: true, // Example: EU prefers dark mode
    },
    'ap-southeast-1': {},
  };

  return regionFlags[region] || {};
}

/**
 * Get active feature flags with all overrides applied
 */
export function getFeatureFlags(
  tenantId?: string,
  region?: string
): FeatureFlags {
  const envFlags = parseEnvFlags();
  const tenantFlags = getTenantFlags(tenantId || env.NEXT_PUBLIC_TENANT_ID);
  const regionFlags = getRegionFlags(region || env.NEXT_PUBLIC_REGION);

  return {
    ...defaultFlags,
    ...envFlags,
    ...regionFlags,
    ...tenantFlags, // Tenant flags override everything
  };
}

/**
 * Hook-compatible feature flag checker
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // This would typically use React context or Redux
  // For now, return the static value
  const flags = getFeatureFlags();
  return flags[flag] ?? false;
}

