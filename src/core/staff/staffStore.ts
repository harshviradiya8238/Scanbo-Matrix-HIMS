'use client';

import * as React from 'react';
import {
  ROLE_METADATA,
  ROLE_ORDER,
  getSystemPermissionsForRole,
  registerRoleDefinitions,
} from '@/src/core/navigation/permissions';
import { SystemUserRole } from '@/src/core/navigation/types';

export type StaffRole = {
  id: string;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type StaffUserStatus = 'active' | 'invited' | 'suspended';

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  department?: string;
  title?: string;
  status: StaffUserStatus;
  lastLogin?: string;
  createdAt: string;
};

export type StaffState = {
  roles: StaffRole[];
  users: StaffUser[];
};

const STORAGE_KEY = 'scanbo:staff-directory';

const DEFAULT_TIMESTAMP = '2026-01-15T09:00:00Z';

const buildDefaultRoles = (): StaffRole[] =>
  ROLE_ORDER.map((role) => ({
    id: role,
    label: ROLE_METADATA[role as SystemUserRole]?.label ?? role,
    description: ROLE_METADATA[role as SystemUserRole]?.description ?? '',
    permissions: getSystemPermissionsForRole(role as SystemUserRole),
    isSystem: true,
    isActive: true,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
  }));

const DEFAULT_USERS: StaffUser[] = [
  {
    id: 'user-001',
    name: 'Varun Sharma',
    email: 'varun.sharma@scanbo.health',
    phone: '+91 98100 41001',
    roleId: 'HOSPITAL_ADMIN',
    department: 'Administration',
    title: 'Hospital Director',
    status: 'active',
    lastLogin: '2026-02-09 08:42',
    createdAt: '2025-11-12',
  },
  {
    id: 'user-002',
    name: 'Dr. Nisha Rao',
    email: 'nisha.rao@scanbo.health',
    phone: '+91 98100 41002',
    roleId: 'DOCTOR',
    department: 'General Medicine',
    title: 'Senior Consultant',
    status: 'active',
    lastLogin: '2026-02-10 09:05',
    createdAt: '2025-10-03',
  },
  {
    id: 'user-003',
    name: 'Sana Khan',
    email: 'sana.khan@scanbo.health',
    phone: '+91 98100 41003',
    roleId: 'NURSE',
    department: 'Emergency',
    title: 'Charge Nurse',
    status: 'active',
    lastLogin: '2026-02-10 08:20',
    createdAt: '2025-09-21',
  },
  {
    id: 'user-004',
    name: 'Aarav Patel',
    email: 'aarav.patel@scanbo.health',
    phone: '+91 98100 41004',
    roleId: 'RECEPTION',
    department: 'Front Desk',
    title: 'Front Desk Lead',
    status: 'active',
    lastLogin: '2026-02-10 08:10',
    createdAt: '2025-08-11',
  },
  {
    id: 'user-005',
    name: 'Priya Menon',
    email: 'priya.menon@scanbo.health',
    phone: '+91 98100 41005',
    roleId: 'CARE_COORDINATOR',
    department: 'Care Management',
    title: 'Care Coordinator',
    status: 'invited',
    lastLogin: 'N/A',
    createdAt: '2026-02-06',
  },
  {
    id: 'user-006',
    name: 'Rohit Verma',
    email: 'rohit.verma@scanbo.health',
    phone: '+91 98100 41006',
    roleId: 'LAB_TECH',
    department: 'Laboratory',
    title: 'Lab Technician',
    status: 'active',
    lastLogin: '2026-02-09 16:30',
    createdAt: '2025-07-19',
  },
  {
    id: 'user-007',
    name: 'Neha Iyer',
    email: 'neha.iyer@scanbo.health',
    phone: '+91 98100 41007',
    roleId: 'RADIOLOGY_TECH',
    department: 'Radiology',
    title: 'Radiology Technician',
    status: 'active',
    lastLogin: '2026-02-09 15:18',
    createdAt: '2025-06-02',
  },
  {
    id: 'user-008',
    name: 'Ritu Gupta',
    email: 'ritu.gupta@scanbo.health',
    phone: '+91 98100 41008',
    roleId: 'PHARMACIST',
    department: 'Pharmacy',
    title: 'Pharmacist',
    status: 'active',
    lastLogin: '2026-02-09 14:55',
    createdAt: '2025-09-04',
  },
  {
    id: 'user-009',
    name: 'Amit Singh',
    email: 'amit.singh@scanbo.health',
    phone: '+91 98100 41009',
    roleId: 'BILLING',
    department: 'Finance',
    title: 'Billing Executive',
    status: 'active',
    lastLogin: '2026-02-08 17:10',
    createdAt: '2025-07-26',
  },
  {
    id: 'user-010',
    name: 'Rahul Nair',
    email: 'rahul.nair@scanbo.health',
    phone: '+91 98100 41010',
    roleId: 'AUDITOR',
    department: 'Compliance',
    title: 'Compliance Auditor',
    status: 'suspended',
    lastLogin: '2026-01-12 11:42',
    createdAt: '2025-05-14',
  },
];

const DEFAULT_STATE: StaffState = {
  roles: buildDefaultRoles(),
  users: DEFAULT_USERS,
};

let staffState: StaffState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => staffState;
const getServerSnapshot = () => DEFAULT_STATE;

const notify = () => listeners.forEach((listener) => listener());

const persist = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staffState));
  }
};

const normalizePermissions = (permissions: string[] = []) => {
  const seen = new Set<string>();
  const list: string[] = [];
  permissions.forEach((perm) => {
    if (!perm || seen.has(perm)) return;
    seen.add(perm);
    list.push(perm);
  });
  return list;
};

const normalizeState = (state: StaffState): StaffState => {
  const systemRoles = buildDefaultRoles();
  const systemRoleIds = new Set(systemRoles.map((role) => role.id));
  const roleById = new Map((state.roles ?? []).map((role) => [role.id, role]));

  const mergedSystemRoles = systemRoles.map((role) => {
    const override = roleById.get(role.id);
    if (!override) return role;
    return {
      ...role,
      ...override,
      id: role.id,
      isSystem: true,
      permissions: normalizePermissions(override.permissions ?? role.permissions),
      isActive: override.isActive ?? role.isActive ?? true,
      updatedAt: override.updatedAt ?? role.updatedAt,
    };
  });

  const customRoles = (state.roles ?? [])
    .filter((role) => !systemRoleIds.has(role.id))
    .map((role) => ({
      ...role,
      isSystem: false,
      permissions: normalizePermissions(role.permissions),
      isActive: role.isActive ?? true,
      createdAt: role.createdAt ?? DEFAULT_TIMESTAMP,
      updatedAt: role.updatedAt ?? DEFAULT_TIMESTAMP,
    }));

  const roles = [...mergedSystemRoles, ...customRoles];
  const validRoleIds = new Set(roles.map((role) => role.id));
  const fallbackRoleId = roles.find((role) => role.id === 'HOSPITAL_ADMIN')?.id ?? roles[0]?.id ?? '';

  const users = (state.users ?? DEFAULT_USERS).map((user) => ({
    ...user,
    roleId: validRoleIds.has(user.roleId) ? user.roleId : fallbackRoleId,
    status: user.status ?? 'active',
    createdAt: user.createdAt ?? DEFAULT_TIMESTAMP,
  }));

  return { roles, users };
};

const safeParse = (value: string | null): StaffState | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as StaffState;
  } catch {
    return null;
  }
};

const updateState = (nextState: StaffState) => {
  staffState = nextState;
  registerRoleDefinitions(staffState.roles);
  persist();
  notify();
};

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  const stored = safeParse(localStorage.getItem(STORAGE_KEY));
  if (stored) {
    staffState = normalizeState(stored);
  }
  registerRoleDefinitions(staffState.roles);
  notify();
};

const createRoleId = (label: string, existingIds: Set<string>) => {
  const base = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const rawId = base.length > 0 ? base : 'CUSTOM_ROLE';
  const prefix = rawId.startsWith('CUSTOM_') ? rawId : `CUSTOM_${rawId}`;
  let candidate = prefix;
  let counter = 2;
  while (existingIds.has(candidate)) {
    candidate = `${prefix}_${counter}`;
    counter += 1;
  }
  return candidate;
};

const createUserId = () => `user-${Date.now()}`;

export function useStaffStore() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    hydrate();
    setMounted(true);
  }, []);

  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const roleMap = React.useMemo(() => new Map(snapshot.roles.map((role) => [role.id, role])), [snapshot.roles]);
  const userMap = React.useMemo(() => new Map(snapshot.users.map((user) => [user.id, user])), [snapshot.users]);

  const addRole = React.useCallback(
    (payload: { label: string; description?: string; cloneFromId?: string }) => {
      const label = payload.label.trim();
      if (!label) return '';
      const existingIds = new Set(snapshot.roles.map((role) => role.id));
      const roleId = createRoleId(label, existingIds);
      const cloneFrom = payload.cloneFromId
        ? snapshot.roles.find((role) => role.id === payload.cloneFromId)
        : null;
      const now = new Date().toISOString();
      const newRole: StaffRole = {
        id: roleId,
        label,
        description: payload.description?.trim() ?? '',
        permissions: normalizePermissions(cloneFrom?.permissions ?? []),
        isSystem: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      updateState({
        ...snapshot,
        roles: [...snapshot.roles, newRole],
      });
      return roleId;
    },
    [snapshot]
  );

  const updateRole = React.useCallback(
    (roleId: string, updates: Partial<Omit<StaffRole, 'id' | 'createdAt' | 'isSystem'>>) => {
      updateState({
        ...snapshot,
        roles: snapshot.roles.map((role) => {
          if (role.id !== roleId) return role;
          return {
            ...role,
            ...updates,
            label: updates.label?.trim() ?? role.label,
            description: updates.description?.trim() ?? role.description,
            permissions: normalizePermissions(updates.permissions ?? role.permissions),
            updatedAt: new Date().toISOString(),
          };
        }),
      });
    },
    [snapshot]
  );

  const deleteRole = React.useCallback(
    (roleId: string, reassignedRoleId?: string) => {
      const role = snapshot.roles.find((item) => item.id === roleId);
      if (!role || role.isSystem) return;
      const remainingRoles = snapshot.roles.filter((item) => item.id !== roleId);
      const fallbackRoleId =
        reassignedRoleId && remainingRoles.some((item) => item.id === reassignedRoleId)
          ? reassignedRoleId
          : remainingRoles.find((item) => item.id === 'HOSPITAL_ADMIN')?.id ?? remainingRoles[0]?.id;

      const updatedUsers = snapshot.users.map((user) =>
        user.roleId === roleId ? { ...user, roleId: fallbackRoleId ?? user.roleId } : user
      );

      updateState({
        roles: remainingRoles,
        users: updatedUsers,
      });
    },
    [snapshot]
  );

  const addUser = React.useCallback(
    (payload: {
      name: string;
      email: string;
      phone?: string;
      roleId: string;
      department?: string;
      title?: string;
      status?: StaffUserStatus;
    }) => {
      const name = payload.name.trim();
      const email = payload.email.trim();
      if (!name || !email) return '';
      const now = new Date().toISOString();
      const newUser: StaffUser = {
        id: createUserId(),
        name,
        email,
        phone: payload.phone?.trim() ?? '',
        roleId: payload.roleId,
        department: payload.department?.trim() ?? '',
        title: payload.title?.trim() ?? '',
        status: payload.status ?? 'invited',
        lastLogin: payload.status === 'active' ? 'Just now' : '—',
        createdAt: now,
      };
      updateState({
        ...snapshot,
        users: [...snapshot.users, newUser],
      });
      return newUser.id;
    },
    [snapshot]
  );

  const updateUser = React.useCallback(
    (userId: string, updates: Partial<Omit<StaffUser, 'id' | 'createdAt'>>) => {
      updateState({
        ...snapshot,
        users: snapshot.users.map((user) => {
          if (user.id !== userId) return user;
          return {
            ...user,
            ...updates,
            name: updates.name?.trim() ?? user.name,
            email: updates.email?.trim() ?? user.email,
            phone: updates.phone?.trim() ?? user.phone,
            department: updates.department?.trim() ?? user.department,
            title: updates.title?.trim() ?? user.title,
          };
        }),
      });
    },
    [snapshot]
  );

  const setUserStatus = React.useCallback(
    (userId: string, status: StaffUserStatus) => {
      updateState({
        ...snapshot,
        users: snapshot.users.map((user) =>
          user.id === userId ? { ...user, status } : user
        ),
      });
    },
    [snapshot]
  );

  const deleteUser = React.useCallback(
    (userId: string) => {
      updateState({
        ...snapshot,
        users: snapshot.users.filter((user) => user.id !== userId),
      });
    },
    [snapshot]
  );

  const resetDirectory = React.useCallback(() => {
    updateState(DEFAULT_STATE);
  }, []);

  return {
    roles: snapshot.roles,
    users: snapshot.users,
    roleMap,
    userMap,
    hydrated: mounted,
    addRole,
    updateRole,
    deleteRole,
    addUser,
    updateUser,
    deleteUser,
    setUserStatus,
    resetDirectory,
  };
}

registerRoleDefinitions(staffState.roles);
