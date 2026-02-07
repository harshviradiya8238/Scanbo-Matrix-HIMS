import * as React from 'react';
import { alpha, useTheme } from '@mui/material';
import { Box, Stack } from '@/src/ui/components/atoms';
import Paper from '@/src/ui/components/atoms/Paper';
import Text from '@/src/ui/components/atoms/Text';

type Tone = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

interface StatTileProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  variant?: 'soft' | 'outlined';
  sx?: object;
}

export default function StatTile({
  label,
  value,
  subtitle,
  icon,
  tone = 'primary',
  variant = 'soft',
  sx,
}: StatTileProps) {
  const theme = useTheme();
  const palette = theme.palette.primary;
  const background =
    variant === 'outlined'
      ? theme.palette.background.paper
      : alpha(palette.main, 0.08);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: variant === 'outlined' ? 'divider' : undefined,
        background,
        ...sx,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Text variant="caption" color="text.secondary">
            {label}
          </Text>
          <Text variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
            {value}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="text.secondary">
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(palette.main, 0.16),
              color: palette.main,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
