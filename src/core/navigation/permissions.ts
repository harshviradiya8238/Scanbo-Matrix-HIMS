/**
 * Role-Based Permissions
 * Defines permissions for each user role
 */

import { SystemUserRole, UserRole } from './types';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export const ROLE_METADATA: Record<
  SystemUserRole,
  {
    label: string;
    description: string;
  }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full access to every module and configuration setting.',
  },
  HOSPITAL_ADMIN: {
    label: 'Hospital Admin',
    description: 'Oversees hospital-wide operations, staff, and configuration.',
  },
  DOCTOR: {
    label: 'Doctor',
    description: 'Clinical provider managing OPD/IPD encounters, orders, and notes.',
  },
  NURSE: {
    label: 'Nurse',
    description: 'Supports triage, vitals, clinical documentation, and inpatient care.',
  },
  RECEPTION: {
    label: 'Front Desk',
    description: 'Handles registration, appointments, check-in, and front-desk workflows.',
  },
  CARE_COORDINATOR: {
    label: 'Care Coordinator',
    description: 'Manages follow-ups, care plans, and patient engagement.',
  },
  INFECTION_CONTROL: {
    label: 'Infection Control',
    description: 'Tracks infection cases, isolation, and safety audits.',
  },
  LAB_TECH: {
    label: 'Lab Technician',
    description: 'Processes laboratory orders and results.',
  },
  RADIOLOGY_TECH: {
    label: 'Radiology Technician',
    description: 'Manages imaging orders and radiology reporting.',
  },
  PHARMACIST: {
    label: 'Pharmacist',
    description: 'Verifies prescriptions, dispenses medications, and manages stock.',
  },
  BILLING: {
    label: 'Billing',
    description: 'Handles claims, payments, and revenue cycle workflows.',
  },
  INVENTORY: {
    label: 'Inventory',
    description: 'Procurement, stock management, and vendor coordination.',
  },
  PATIENT_PORTAL: {
    label: 'Patient Portal',
    description: 'Patient-facing access for results, appointments, and invoices.',
  },
  AUDITOR: {
    label: 'Auditor',
    description: 'Read-only access for compliance and reporting.',
  },
};

export const ROLE_ORDER: SystemUserRole[] = [
  'SUPER_ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTION',
  'CARE_COORDINATOR',
  'INFECTION_CONTROL',
  'LAB_TECH',
  'RADIOLOGY_TECH',
  'PHARMACIST',
  'BILLING',
  'INVENTORY',
  'PATIENT_PORTAL',
  'AUDITOR',
];

const ROLE_PERMISSIONS: Record<SystemUserRole, string[]> = {
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
    'ipd.read',
    'ipd.admissions.read',
    'ipd.admissions.write',
    'ipd.transfer.write',
    'ipd.beds.read',
    'ipd.rounds.read',
    'ipd.rounds.write',
    'ipd.discharge.read',
    'ipd.discharge.write',
    'clinical.read',
    'clinical.flow_overview.read',
    'clinical.ambulatory.*',
    'clinical.clindoc.*',
    'clinical.care_companion.read',
    'clinical.notes.write',
    'clinical.orders.read',
    'clinical.orders.write',
    'clinical.prescriptions.write',
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
    'ipd.read',
    'ipd.admissions.read',
    'ipd.beds.read',
    'ipd.beds.write',
    'ipd.rounds.read',
    'ipd.rounds.write',
    'ipd.discharge.read',
    'clinical.read',
    'clinical.flow_overview.read',
    'clinical.ambulatory.read',
    'clinical.clindoc.read',
    'clinical.kiosk.read',
    'clinical.care_companion.read',
    'clinical.vitals.write',
    'clinical.notes.write',
    'clinical.orders.read',
    'orders.read',
    'diagnostics.read',
    'help.read',
  ],
  RECEPTION: [
    'dashboard.read',
    'patients.*',
    'appointments.*',
    'ipd.read',
    'ipd.admissions.read',
    'ipd.admissions.write',
    'clinical.kiosk.*',
    'clinical.flow_overview.read',
    'billing.read',
    'help.read',
  ],
  CARE_COORDINATOR: [
    'dashboard.read',
    'patients.read',
    'patients.profile.read',
    'appointments.read',
    'ipd.read',
    'ipd.discharge.read',
    'clinical.care_companion.*',
    'clinical.flow_overview.read',
    'help.read',
  ],
  INFECTION_CONTROL: [
    'dashboard.read',
    'patients.read',
    'patients.profile.read',
    'clinical.infection_control.*',
    'clinical.flow_overview.read',
    'diagnostics.read',
    'ipd.read',
    'help.read',
  ],
  LAB_TECH: [
    'dashboard.read',
    'orders.lab.*',
    'diagnostics.lab.*',
    'help.read',
  ],
  RADIOLOGY_TECH: [
    'dashboard.read',
    'orders.radiology.*',
    'diagnostics.radiology.*',
    'help.read',
  ],
  PHARMACIST: [
    'dashboard.read',
    'clinical.prescriptions.write',
    'clinical.prescriptions.read',
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
    'patient-portal.*',
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

const SYSTEM_ROLE_DEFINITIONS: RoleDefinition[] = ROLE_ORDER.map((role) => ({
  id: role,
  label: ROLE_METADATA[role]?.label ?? role,
  description: ROLE_METADATA[role]?.description ?? '',
  permissions: ROLE_PERMISSIONS[role] ?? [],
  isSystem: true,
}));

let roleDefinitions = SYSTEM_ROLE_DEFINITIONS;
let roleDefinitionMap = new Map<string, RoleDefinition>(
  SYSTEM_ROLE_DEFINITIONS.map((role) => [role.id, role])
);

const normalizeRoleDefinitions = (definitions: RoleDefinition[]): RoleDefinition[] => {
  if (!definitions || definitions.length === 0) {
    return SYSTEM_ROLE_DEFINITIONS;
  }
  const systemRoleIds = new Set(SYSTEM_ROLE_DEFINITIONS.map((role) => role.id));
  const overrides = new Map(definitions.map((role) => [role.id, role]));

  const mergedSystemRoles = SYSTEM_ROLE_DEFINITIONS.map((role) => {
    const override = overrides.get(role.id);
    if (!override) return role;
    return {
      ...role,
      ...override,
      id: role.id,
      isSystem: true,
      permissions: override.permissions ?? role.permissions,
    };
  });

  const customRoles = definitions
    .filter((role) => !systemRoleIds.has(role.id))
    .map((role) => ({
      ...role,
      isSystem: role.isSystem ?? false,
    }));

  return [...mergedSystemRoles, ...customRoles];
};

export function registerRoleDefinitions(definitions: RoleDefinition[]) {
  roleDefinitions = normalizeRoleDefinitions(definitions);
  roleDefinitionMap = new Map(roleDefinitions.map((role) => [role.id, role]));
}

export function getRoleDefinitions(): RoleDefinition[] {
  return roleDefinitions;
}

export function getSystemPermissionsForRole(role: SystemUserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole): string[] {
  return roleDefinitionMap.get(role)?.permissions ?? [];
}

export function getRoleLabel(role: UserRole): string {
  return roleDefinitionMap.get(role)?.label ?? role;
}

export function getRoleDescription(role: UserRole): string {
  return roleDefinitionMap.get(role)?.description ?? '';
}

export function getRolesForPermissions(requiredPermissions: string[]): UserRole[] {
  if (requiredPermissions.length === 0) return [];
  return roleDefinitions
    .filter((role) =>
      requiredPermissions.some((perm) => hasPermission(role.permissions, perm))
    )
    .map((role) => role.id);
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
