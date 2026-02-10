import { getMenuItemByRoute } from './nav-config';
import { hasPermission } from './permissions';
import { getClinicalModuleBySlug } from '@/src/screens/clinical/module-registry';

export interface RouteAccessInfo {
  requiredPermissions: string[];
  source: 'nav' | 'clinical-module' | 'fallback';
}

export function getRouteAccessInfo(pathname: string): RouteAccessInfo | null {
  if (!pathname) return null;

  const menuItem = getMenuItemByRoute(pathname);
  if (menuItem?.requiredPermissions && menuItem.requiredPermissions.length > 0) {
    return { requiredPermissions: menuItem.requiredPermissions, source: 'nav' };
  }

  if (pathname.startsWith('/clinical/modules/')) {
    const slug = pathname.split('/').filter(Boolean).pop() ?? '';
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
