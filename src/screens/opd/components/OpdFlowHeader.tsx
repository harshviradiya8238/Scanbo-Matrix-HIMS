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
import {
  buildEncounterOrdersRoute,
  buildEncounterPrescriptionsRoute,
  buildEncounterRoute,
} from '../opd-encounter';

interface OpdFlowHeaderProps {
  activeStep: OpdFlowStepId;
  title: string;
  description: string;
  patientMrn?: string;
  patientName?: string;
  encounterId?: string;
  showStepButtons?: boolean;
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
  encounterId,
  showStepButtons = true,
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
  const resolveStepRoute = (stepId: OpdFlowStepId) => {
    if (!encounterId) {
      return OPD_FLOW_STEPS.find((step) => step.id === stepId)?.route ?? '/appointments/queue';
    }

    switch (stepId) {
      case 'calendar':
        return '/appointments/calendar';
      case 'queue':
        return '/appointments/queue';
      case 'visit':
        return buildEncounterRoute(encounterId);
      case 'orders':
        return buildEncounterOrdersRoute(encounterId);
      case 'prescriptions':
        return buildEncounterPrescriptionsRoute(encounterId);
      default:
        return '/appointments/queue';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: softSurface,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ mt: { xs: 0.5, md: 0 } }}
              >
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
            </Stack>
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

        {showStepButtons ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {OPD_FLOW_STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <Button
                  key={step.id}
                  variant={isActive ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => router.push(withMrn(resolveStepRoute(step.id)))}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderStyle: isActive ? 'solid' : 'dashed',
                  }}
                >
                  {step.label}
                </Button>
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
