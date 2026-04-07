'use client';

import * as React from 'react';
import { Stack } from '@/src/ui/components/atoms';

interface ActionBarProps {
  children: React.ReactNode;
}

export default function ActionBar({ children }: ActionBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="flex-end"
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      {children}
    </Stack>
  );
}
