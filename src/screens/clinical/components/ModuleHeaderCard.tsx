'use client';

import * as React from 'react';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { WorkspaceHeaderCard } from '@/src/ui/components/molecules';

type ModuleChip = {
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  variant?: 'filled' | 'outlined';
};

export default function ModuleHeaderCard({
  title,
  description,
  chips = [],
  actions,
}: {
  title: string;
  description: string;
  chips?: ModuleChip[];
  actions?: React.ReactNode;
}) {
  return (
    <WorkspaceHeaderCard
      sx={{
        p: 1.75,
        borderRadius: 2.5,
      }}
    >
      <Stack spacing={1.25}>
        {chips.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {chips.map((chip, index) => (
              <Chip
                key={`${chip.label}-${index}`}
                size="small"
                label={chip.label}
                color={chip.color}
                variant={chip.variant}
              />
            ))}
          </Stack>
        ) : null}
        <Stack
          direction={{ xs: 'column', md: actions ? 'row' : 'column' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: actions ? 'center' : 'flex-start' }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          {actions ? <Stack direction="row" spacing={1}>{actions}</Stack> : null}
        </Stack>
      </Stack>
    </WorkspaceHeaderCard>
  );
}
