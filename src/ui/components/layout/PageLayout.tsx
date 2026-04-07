import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
  currentPageTitle?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export default function PageLayout({
  children,
  fullHeight,
}: PageLayoutProps) {
  const rootSx = fullHeight
    ? {
        width: '100%',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }
    : { width: '100%', margin: 0, padding: 0 };
  const contentSx = fullHeight
    ? {
        px: 0,
        pb: 0,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : { px: 0, pb: 0 };

  return (
    <Box sx={rootSx}>
      <Box sx={contentSx}>{children}</Box>
    </Box>
  );
}
