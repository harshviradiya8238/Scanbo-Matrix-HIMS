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
  currentPageTitle?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export default function PageLayout({
  title,
  subtitle,
  overline,
  actions,
  header,
  children,
  currentPageTitle,
  fullHeight,
  noPadding = false,
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
        px: noPadding ? 0 : { xs: 2, sm: 3 },
        pb: noPadding ? 0 : 2,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : { px: noPadding ? 0 : { xs: 2, sm: 3 }, pb: noPadding ? 0 : 2 };

  return (
    <Box sx={rootSx}>
      {!noPadding && (header
        ? header
        : title
        ? (
          <PageHeader
            title={title}
            subtitle={subtitle}
            overline={overline}
            actions={actions}
            currentPageTitle={currentPageTitle}
          />
        )
        : null)}
      <Box sx={contentSx}>{children}</Box>
    </Box>
  );
}
