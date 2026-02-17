import { getMenuItemByRoute } from './nav-config';
import { hasPermission } from './permissions';
import { getClinicalModuleBySlug } from '@/src/screens/clinical/module-registry';

export interface RouteAccessInfo {
  requiredPermissions: string[];
  source: 'nav' | 'clinical-module' | 'fallback' | 'route-override';
}

const ROUTE_PERMISSION_OVERRIDES: Array<{
  pattern: RegExp;
  requiredPermissions: string[];
}> = [
  {
    pattern: /^\/appointments\/visit$/,
    requiredPermissions: ['clinical.ambulatory.write'],
  },
  {
    pattern: /^\/encounters\/[^/]+$/,
    requiredPermissions: ['clinical.ambulatory.write'],
  },
  {
    pattern: /^\/encounters\/[^/]+\/orders$/,
    requiredPermissions: ['clinical.orders.write'],
  },
  {
    pattern: /^\/encounters\/[^/]+\/prescriptions$/,
    requiredPermissions: ['clinical.prescriptions.write'],
  },
];

function normalizePathname(pathname: string): string {
  if (!pathname) return '';
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export function getRouteAccessInfo(pathname: string): RouteAccessInfo | null {
  if (!pathname) return null;

  const normalizedPathname = normalizePathname(pathname);

  const routeOverride = ROUTE_PERMISSION_OVERRIDES.find((item) => item.pattern.test(normalizedPathname));
  if (routeOverride) {
    return { requiredPermissions: routeOverride.requiredPermissions, source: 'route-override' };
  }

  const menuItem = getMenuItemByRoute(normalizedPathname);
  if (menuItem?.requiredPermissions && menuItem.requiredPermissions.length > 0) {
    return { requiredPermissions: menuItem.requiredPermissions, source: 'nav' };
  }

  if (normalizedPathname.startsWith('/clinical/modules/')) {
    const slug = normalizedPathname.split('/').filter(Boolean).pop() ?? '';
    const moduleDefinition = getClinicalModuleBySlug(slug);
    if (moduleDefinition?.requiredPermissions && moduleDefinition.requiredPermissions.length > 0) {
      return { requiredPermissions: moduleDefinition.requiredPermissions, source: 'clinical-module' };
    }
    return { requiredPermissions: ['clinical.read'], source: 'fallback' };
  }

  return null;
}

export function canAccessRoute(pathname: string, userPermissions: string[]): boolean {
  const accessInfo = getRouteAccessInfo(pathname);
  if (!accessInfo || accessInfo.requiredPermissions.length === 0) return true;
  return accessInfo.requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}
