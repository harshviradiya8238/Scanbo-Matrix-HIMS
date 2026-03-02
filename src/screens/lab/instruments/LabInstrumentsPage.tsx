'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { toggleInstrumentStatus } from '@/src/store/slices/limsSlice';
import { useLabStatusConfig } from '../lab-status-config';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

export default function LabInstrumentsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { instrumentStatus } = useLabStatusConfig();
  const { instruments } = useAppSelector((state) => state.lims);

  return (
    <PageTemplate title="Instruments" subtitle="Lab equipment & calibration tracking" currentPageTitle="Instruments">
      <LabWorkspaceCard current="instruments">
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
          {instruments.map((inst) => {
            const cfg = instrumentStatus[inst.status];
            return (
              <Box key={inst.id} sx={{ ...lab.cardSx, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{inst.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{inst.type}</Typography>
                  </Box>
                  <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {[
                    ['Department', inst.dept],
                    ['Last Calibration', inst.lastCalib],
                    ['Next Calibration', inst.nextCalib],
                    ['Instrument ID', inst.id],
                  ].map(([k, v]) => (
                    <Box key={String(k)}>
                      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5 }}>{k}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{v}</Typography>
                    </Box>
                  ))}
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined" color="warning" onClick={() => dispatch(toggleInstrumentStatus(inst.id))}>
                    {inst.status === 'online' ? 'Set Maintenance' : 'Set Online'}
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Box>
        </Stack>
      </LabWorkspaceCard>
    </PageTemplate>
  );
}
