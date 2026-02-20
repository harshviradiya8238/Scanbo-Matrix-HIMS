import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  currentPageTitle?: string;
}

export default function PageHeader({
  title,
  overline,
  actions,
  currentPageTitle,
}: PageHeaderProps) {
  const displayTitle = currentPageTitle || title;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.25, pb: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0 }}>
          {overline ? (
            <Text variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
              {overline}
            </Text>
          ) : null}
          {/* <Text variant="h5" component="h1" sx={{ fontWeight: 600, mb: 0 }}>
            {displayTitle}
          </Text> */}
        </Box>
        {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
      </Stack>
    </Box>
  );
}
