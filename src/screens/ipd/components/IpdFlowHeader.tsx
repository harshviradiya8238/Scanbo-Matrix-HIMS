'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@mui/material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { IPD_FLOW_STEPS, IpdFlowStepId } from '../ipd-flow-config';

interface IpdFlowHeaderProps {
  activeStep: IpdFlowStepId;
  title: string;
  description: string;
  patientMrn?: string;
  patientName?: string;
  primaryAction?: {
    label: string;
    route: string;
  };
}

export default function IpdFlowHeader({
  activeStep,
  title,
  description,
  patientMrn,
  patientName,
  primaryAction,
}: IpdFlowHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
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
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ mt: { xs: 0.5, md: 0 } }}
              >
                <Chip size="small" color="primary" label="Scanbo Matrix HIMS" />
                <Chip size="small" color="info" variant="outlined" label="Inpatient Flow" />
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
          {IPD_FLOW_STEPS.map((step, index) => {
            const isActive = step.id === activeStep;
            return (
              <Button
                key={step.id}
                variant={isActive ? 'contained' : 'outlined'}
                color={'primary'}
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
        </Stack>
      </Stack>
    </Card>
  );
}
