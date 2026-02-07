'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@mui/material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { OPD_FLOW_STEPS, OpdFlowStepId } from '../opd-flow-config';
import {
  getOutpatientNextState,
  getOutpatientStateForStep,
} from '../opd-flow-spec';

interface OpdFlowHeaderProps {
  activeStep: OpdFlowStepId;
  title: string;
  description: string;
  patientMrn?: string;
  patientName?: string;
  primaryAction?: {
    label: string;
    route: string;
  };
}

export default function OpdFlowHeader({
  activeStep,
  title,
  description,
  patientMrn,
  patientName,
  primaryAction,
}: OpdFlowHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const flowState = getOutpatientStateForStep(activeStep);
  const nextState = getOutpatientNextState(flowState);
  const mrnSuffix = patientMrn ? `?mrn=${encodeURIComponent(patientMrn)}` : '';
  const withMrn = (route: string) => (patientMrn ? `${route}${mrnSuffix}` : route);
  const patientLabel = patientName
    ? patientMrn
      ? `${patientName} · ${patientMrn}`
      : patientName
    : patientMrn || '';

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: softSurface,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip size="small" color="primary" label="Scanbo Matrix HIMS" />
              <Chip size="small" color="primary" variant="outlined" label="Outpatient Flow" />
              <Chip
                size="small"
                variant="outlined"
                label={`State: ${flowState.name}`}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  color: theme.palette.primary.main,
                }}
              />
              {patientLabel ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Patient: ${patientLabel}`}
                  sx={{
                    borderColor: alpha(theme.palette.info.main, 0.4),
                    color: theme.palette.info.main,
                  }}
                />
              ) : null}
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {flowState.description}
              {nextState ? ` Next: ${nextState.name}.` : ''}
            </Typography>
          </Box>

          {primaryAction ? (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push(withMrn(primaryAction.route))}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {OPD_FLOW_STEPS.map((step, index) => {
            const isActive = step.id === activeStep;
            return (
              <Button
                key={step.id}
                variant={isActive ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                onClick={() => router.push(withMrn(step.route))}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderStyle: isActive ? 'solid' : 'dashed',
                }}
              >
                {index + 1}. {step.label}
              </Button>
            );
          })}
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => router.push(withMrn('/clinical/vitals'))}
            sx={{ textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}
          >
            Vitals
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => router.push(withMrn('/clinical/notes'))}
            sx={{ textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}
          >
            Notes
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
