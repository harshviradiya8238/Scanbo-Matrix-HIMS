'use client';

import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';
import { alpha, useTheme } from '@mui/material';

export const APP_FOOTER_STICKY_HEIGHT = 52;

export default function Footer() {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(6px)',
        height: APP_FOOTER_STICKY_HEIGHT,
        minHeight: APP_FOOTER_STICKY_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 0,
        px: { xs: 2, sm: 3 },
        textAlign: 'center',
      }}
    >
      <Text variant="body1" >
        © {year} Scanbo HIMS. All rights reserved.
      </Text>
    </Box>
  );
}
