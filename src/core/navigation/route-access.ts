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
    pattern: /^\/clinical\/encounters$/,
    requiredPermissions: ['clinical.encounters.read'],
  },
  {
    pattern: /^\/clinical\/orders$/,
    requiredPermissions: ['clinical.orders.read'],
  },
  {
    pattern: /^\/clinical\/prescriptions$/,
    requiredPermissions: ['clinical.prescriptions.write'],
  },
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
  // Lab module: all sub-routes use lab permission (sidebar shows 5 items; sub-pages still protected)
  { pattern: /^\/lab\/dashboard$/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/samples(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/worksheets(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/results(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/clients(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/tests(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/instruments(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/inventory(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/reports(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/quality-control(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/lab\/settings(?:\/|$)/, requiredPermissions: ['diagnostics.lab.read'] },
  { pattern: /^\/patient-portal\//, requiredPermissions: ['patient-portal.read'] },
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
