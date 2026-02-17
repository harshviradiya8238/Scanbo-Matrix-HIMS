'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommandCenterChips } from '@/src/ui/components/molecules';
import {
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import type { EncounterStatus } from '../opd-mock-data';

interface ConsultationWorkspaceHeaderProps {
  status: EncounterStatus;
  elapsedLabel: string;
  dateLabel: string;
  surfaceColor: string;
  onSaveDraft: () => void;
  onExit: () => void;
  onComplete: () => void;
  onStart: () => void;
  canSaveDraft?: boolean;
  canStart?: boolean;
  canComplete?: boolean;
}

export default function ConsultationWorkspaceHeader({
  status,
  elapsedLabel,
  dateLabel,
  surfaceColor,
  onSaveDraft,
  onExit,
  onComplete,
  onStart,
  canSaveDraft = true,
  canStart = true,
  canComplete = true,
}: ConsultationWorkspaceHeaderProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
        backgroundColor: surfaceColor,
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Consultation Workspace
          </Typography>
          <Box sx={{ mt: 1 }}>
            <CommandCenterChips dateLabel={dateLabel} />
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              px: 1.2,
              py: 0.65,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <TimerIcon fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {elapsedLabel}
            </Typography>
          </Stack>

          {status === 'IN_PROGRESS' ? (
            <>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSaveDraft} disabled={!canSaveDraft}>
                Save Draft
              </Button>
              <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={onExit} sx={{ color: 'white' }}>
                Exit
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={onComplete}
                disabled={!canComplete}
              >
                Complete
              </Button>
            </>
          ) : null}

          {status === 'COMPLETED' ? (
            <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={onExit}>
              Exit
            </Button>
          ) : null}

          {status !== 'IN_PROGRESS' && status !== 'COMPLETED' ? (
            <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={onStart} disabled={!canStart}>
              Start Consult
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}
