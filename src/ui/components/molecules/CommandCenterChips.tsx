'use client';

import * as React from 'react';
import { Chip, Stack } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';

interface CommandCenterChipsProps {
  dateLabel: string;
  showDate?: boolean;
}

export default function CommandCenterChips({
  dateLabel,
  showDate = true,
}: CommandCenterChipsProps) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip
        size="small"
        label="Command Center"
        color="primary"
        variant="outlined"
        sx={{ borderRadius: 999, fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}
      />
      <Chip
        size="small"
        label="OPD + IPD + Billing"
        color="success"
        variant="outlined"
        sx={{ borderRadius: 999, fontWeight: 600, backgroundColor: alpha(theme.palette.success.main, 0.08) }}
      />
      {showDate ? (
        <Chip
          size="small"
          label={dateLabel}
          variant="outlined"
          sx={{ borderRadius: 999, fontWeight: 600 }}
        />
      ) : null}
    </Stack>
  );
}
