'use client';

import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';
import { alpha, useTheme } from '@mui/material';

export const APP_FOOTER_STICKY_HEIGHT = 35;

export default function Footer() {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: { xs: '14px', md: '22px' },
        border: '1px solid #DDE8F0',
        height: APP_FOOTER_STICKY_HEIGHT,
        minHeight: APP_FOOTER_STICKY_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 0,
        px: { xs: 2, sm: 3 },
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <Text variant="caption" >
        © {year} Scanbo HIMS. All rights reserved.
      </Text>
    </Box>
  );
}
