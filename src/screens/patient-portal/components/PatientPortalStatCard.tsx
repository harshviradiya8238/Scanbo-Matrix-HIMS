'use client';

import * as React from 'react';
import { Box, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

type StatTone = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

interface PatientPortalStatCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
}

const toneColor = (theme: Theme, tone: StatTone) => {
  if (tone === 'secondary') return theme.palette.secondary.main;
  if (tone === 'info') return theme.palette.info.main;
  if (tone === 'success') return theme.palette.success.main;
  if (tone === 'warning') return theme.palette.warning.main;
  if (tone === 'error') return theme.palette.error.main;
  return theme.palette.primary.main;
};

export default function PatientPortalStatCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'primary',
}: PatientPortalStatCardProps) {
  const theme = useTheme<Theme>();
  const accent = toneColor(theme, tone);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.16),
        backgroundColor: alpha(theme.palette.primary.main, 0.035),
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.65, fontWeight: 800, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ mt: 0.7, color: 'text.secondary', fontWeight: 500 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: alpha(accent, 0.14),
              border: `1px solid ${alpha(accent, 0.2)}`,
              color: accent,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>
    </Card>
  );
}
