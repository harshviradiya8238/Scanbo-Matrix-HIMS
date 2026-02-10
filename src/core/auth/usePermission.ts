'use client';

import * as React from 'react';
import { useUser } from './UserContext';
import { hasPermission } from '@/src/core/navigation/permissions';

export function usePermission() {
  const { permissions } = useUser();

  return React.useCallback(
    (required: string | string[]) => {
      const list = Array.isArray(required) ? required : [required];
      return list.some((perm) => hasPermission(permissions, perm));
    },
    [permissions]
  );
}
