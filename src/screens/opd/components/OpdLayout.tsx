'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Stack } from '@/src/ui/components/atoms';

interface OpdLayoutProps {
  title: string;
  subtitle?: string;
  currentPageTitle: string;
  children: React.ReactNode;
}

export default function OpdLayout({ title, subtitle, currentPageTitle, children }: OpdLayoutProps) {
  return (
    <PageTemplate title={title} subtitle={subtitle} currentPageTitle={currentPageTitle}>
      <Stack spacing={2}>{children}</Stack>
    </PageTemplate>
  );
}
