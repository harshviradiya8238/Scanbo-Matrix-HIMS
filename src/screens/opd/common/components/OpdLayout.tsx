'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { alpha } from '@/src/ui/theme';
import { useUser } from '@/src/core/auth/UserContext';
import { getOpdRoleFlowProfile } from '../../opd-role-flow';

interface OpdLayoutProps {
  title: string;
  subtitle?: string;
  currentPageTitle: string;
  children: React.ReactNode;
  showRoleGuide?: boolean;
  fullHeight?: boolean;
}

export default function OpdLayout({
  title,
  subtitle,
  currentPageTitle,
  children,
  showRoleGuide = true,
  fullHeight = false,
}: OpdLayoutProps) {
  const { role } = useUser();
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);

  return (
    <PageTemplate title={title} subtitle={subtitle} currentPageTitle={currentPageTitle} fullHeight={fullHeight}>
      <Stack spacing={2} sx={fullHeight ? { flex: 1, minHeight: 0, overflow: 'hidden' } : undefined}>

        {children}
      </Stack>
    </PageTemplate>
  );
}
