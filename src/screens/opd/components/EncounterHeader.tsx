'use client';

import * as React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { OpdEncounterCase } from '../opd-mock-data';
import StatusBadge from './StatusBadge';

interface EncounterHeaderProps {
  title: string;
  description: string;
  encounter?: OpdEncounterCase;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EncounterHeader({
  title,
  description,
  encounter,
  primaryAction,
}: EncounterHeaderProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${theme.palette.background.paper} 34%)`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
          {encounter ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              <StatusBadge status={encounter.status} />
              <Chip size="small" label={`Token ${encounter.id}`} variant="outlined" />
              <Chip size="small" label={encounter.department} />
              <Typography variant="caption" color="text.secondary">
                Encounter: {encounter.id} · MRN: {encounter.mrn} · Slot: {encounter.appointmentTime}
              </Typography>
            </Stack>
          ) : null}
        </Box>

        {primaryAction ? (
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        ) : null}
      </Stack>
    </Card>
  );
}
