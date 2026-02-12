'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs as MuiBreadcrumbs, Box } from '@/src/ui/components/atoms';
import Link from '@/src/ui/components/atoms/Link';
import Text from '@/src/ui/components/atoms/Text';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { getBreadcrumbPath } from '@/src/core/navigation/nav-config';

interface BreadcrumbsProps {
  currentPageTitle?: string;
}

type BreadcrumbItem = {
  id: string;
  label: string;
  route?: string;
};

export default function Breadcrumbs({ currentPageTitle }: BreadcrumbsProps) {
  const pathname = usePathname() ?? '';
  const breadcrumbPath = React.useMemo(() => getBreadcrumbPath(pathname), [pathname]);

  if (breadcrumbPath.length === 0 && !currentPageTitle) {
    return null;
  }

  const items: BreadcrumbItem[] = breadcrumbPath.length
    ? breadcrumbPath
    : currentPageTitle
    ? [{ id: 'current', label: currentPageTitle }]
    : [];

  const commonSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    px: 0.75,
    py: 0.35,
    borderRadius: 999,
    lineHeight: 1.2,
    fontSize: { xs: '0.85rem', md: '0.9rem' },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
        aria-label="breadcrumb navigation"
        sx={{
          px: 1.25,
          py: 0.75,
          borderRadius: 999,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.08)',
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
            flexWrap: 'wrap',
          },
          '& .MuiBreadcrumbs-separator': {
            mx: 0.35,
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const displayLabel = isLast && currentPageTitle ? currentPageTitle : item.label;
          if (isLast || !item.route) {
            return (
              <Text
                key={item.id}
                component="span"
                color={isLast ? 'text.primary' : 'text.secondary'}
                aria-current={isLast ? 'page' : undefined}
                sx={{
                  ...commonSx,
                  fontWeight: isLast ? 700 : 600,
                  backgroundColor: isLast ? 'action.selected' : 'transparent',
                }}
              >
                {displayLabel}
              </Text>
            );
          }

          return (
            <Link
              key={item.id}
              color="inherit"
              href={item.route}
              sx={{
                ...commonSx,
                textDecoration: 'none',
                color: 'text.secondary',
                fontWeight: 600,
                transition: 'color 150ms ease, background-color 150ms ease',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'action.hover',
                  textDecoration: 'none',
                },
                '&:focus-visible': {
                  outline: `2px solid currentColor`,
                  outlineOffset: '2px',
                  borderRadius: '2px',
                },
              }}
            >
              {displayLabel}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
