'use client';

import * as React from 'react';
import { UserRole } from '@/src/core/navigation/types';
import { getPermissionsForRole } from '@/src/core/navigation/permissions';

interface UserContextType {
  role: UserRole;
  permissions: string[];
  setRole: (role: UserRole) => void;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  defaultRole = 'HOSPITAL_ADMIN',
}: {
  children: React.ReactNode;
  defaultRole?: UserRole;
}) {
  const [role, setRole] = React.useState<UserRole>(defaultRole);
  const permissions = React.useMemo(() => getPermissionsForRole(role), [role]);

  return (
    <UserContext.Provider value={{ role, permissions, setRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
