import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';
import Breadcrumbs from '@/src/ui/components/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  currentPageTitle?: string;
}

export default function PageHeader({
  title,
  subtitle,
  overline,
  actions,
  currentPageTitle,
}: PageHeaderProps) {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.25, pb: 1 }}>
      {currentPageTitle ? (
        <Box sx={{ mb: 0.5 }}>
          <Breadcrumbs currentPageTitle={currentPageTitle} />
        </Box>
      ) : null}
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0 }}>
          {overline ? (
            <Text variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
              {overline}
            </Text>
          ) : null}
          {!currentPageTitle ? (
            <Text variant="h5" component="h1" sx={{ fontWeight: 600, mb: 0 }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
      </Stack>
    </Box>
  );
}
