import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import PageHeader from './PageHeader';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageLayout({
  title,
  subtitle,
  overline,
  actions,
  header,
  children,
}: PageLayoutProps) {
  return (
    <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
      {header
        ? header
        : title
        ? <PageHeader title={title} subtitle={subtitle} overline={overline} actions={actions} />
        : null}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>{children}</Box>
    </Box>
  );
}
