/**
 * Role-Based Permissions
 * Defines permissions for each user role
 */

import { UserRole } from './types';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'], // All permissions
  HOSPITAL_ADMIN: [
    'dashboard.read',
    'patients.*',
    'appointments.*',
    'ipd.*',
    'clinical.*',
    'orders.*',
    'diagnostics.*',
    'pharmacy.*',
    'billing.*',
    'inventory.*',
    'staff.*',
    'reports.*',
    'admin.*',
    'help.read',
  ],
  DOCTOR: [
    'dashboard.read',
    'patients.read',
    'patients.profile.read',
    'appointments.*',
    'ipd.*',
    'clinical.*',
    'orders.*',
    'diagnostics.read',
    'pharmacy.read',
    'help.read',
  ],
  NURSE: [
    'dashboard.read',
    'patients.read',
    'patients.profile.read',
    'appointments.read',
    'ipd.*',
    'clinical.vitals.write',
    'clinical.notes.write',
    'orders.read',
    'diagnostics.read',
    'help.read',
  ],
  RECEPTION: [
    'dashboard.read',
    'patients.*',
    'appointments.*',
    'billing.read',
    'help.read',
  ],
  LAB_TECH: [
    'dashboard.read',
    'orders.lab.*',
    'diagnostics.lab.*',
    'help.read',
  ],
  PHARMACIST: [
    'dashboard.read',
    'pharmacy.*',
    'inventory.items.read',
    'help.read',
  ],
  BILLING: [
    'dashboard.read',
    'patients.read',
    'billing.*',
    'reports.billing.*',
    'help.read',
  ],
  INVENTORY: [
    'dashboard.read',
    'inventory.*',
    'reports.inventory.*',
    'help.read',
  ],
  PATIENT_PORTAL: [
    'dashboard.read',
    'patients.profile.read',
    'appointments.read',
    'diagnostics.lab.results.read',
    'billing.invoices.read',
    'help.read',
  ],
  AUDITOR: [
    'dashboard.read',
    'patients.read',
    'billing.read',
    'reports.*',
    'admin.audit.read',
    'help.read',
  ],
};

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has permission
 * Supports wildcard matching (e.g., 'patients.*' matches 'patients.read')
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes('*')) {
    return true; // Super admin
  }

  // Exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Wildcard match (e.g., 'patients.*' matches 'patients.read')
  const permissionParts = requiredPermission.split('.');
  for (let i = permissionParts.length; i > 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }
  }

  return false;
}

