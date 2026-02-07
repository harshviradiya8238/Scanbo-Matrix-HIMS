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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb navigation"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.disabled',
            mx: 0.75,
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const displayLabel = isLast && currentPageTitle ? currentPageTitle : item.label;

          if (isLast) {
            return (
              <Text
                key={item.id}
                color="text.primary"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.2,
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
              href={item.route || '#'}
              sx={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                color: 'text.secondary',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
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
