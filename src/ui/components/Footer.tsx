'use client';

import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';
import { useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        py: 1.25,
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
