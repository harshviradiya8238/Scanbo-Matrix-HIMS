'use client';

import * as React from 'react';
import { alpha } from '@/src/ui/theme';
import { palette } from '@/src/core/theme/tokens';
import { Box, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';

export const IPD_COLORS = {
  primary: palette.primary.main,
  primaryLight: palette.primary.dark,
  accent: palette.info.main,
  accentWarm: palette.success.main,
  textMain: palette.text.primary,
  textMuted: palette.text.secondary,
  border: palette.grey.A100,
  success: palette.success.main,
  warning: palette.warning.main,
  danger: palette.error.main,
};

export const IPD_FONT_SERIF = 'inherit';
export const IPD_FONT_SANS = 'inherit';

export const ipdSurfaceCardSx = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: alpha(IPD_COLORS.primary, 0.14),
  boxShadow: '0 10px 28px rgba(10, 77, 104, 0.08)',
  backgroundColor: '#FFFFFF',
};

export const ipdFormStylesSx = {
  '& .MuiInputLabel-root': {
    fontSize: 13,
    fontWeight: 600,
    color: IPD_COLORS.textMain,
  },
  '& .MuiInputBase-input': {
    fontSize: 14,
    fontFamily: IPD_FONT_SANS,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: IPD_COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: alpha(IPD_COLORS.primary, 0.55),
    },
    '&.Mui-focused fieldset': {
      borderColor: IPD_COLORS.accent,
      boxShadow: `0 0 0 3px ${alpha(IPD_COLORS.accent, 0.14)}`,
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: 11,
  },
};

type MetricTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const metricToneMap: Record<
  MetricTone,
  { accent: string }
> = {
  primary: {
    accent: IPD_COLORS.primary,
  },
  success: {
    accent: IPD_COLORS.success,
  },
  warning: {
    accent: IPD_COLORS.warning,
  },
  danger: {
    accent: IPD_COLORS.danger,
  },
  info: {
    accent: IPD_COLORS.accent,
  },
};

interface IpdMetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  tone?: MetricTone;
  icon?: React.ReactNode;
}

export function IpdMetricCard({
  label,
  value,
  trend,
  tone = 'primary',
  icon,
}: IpdMetricCardProps) {
  const toneConfig = metricToneMap[tone];

  return (
    <Card
      elevation={0}
      sx={{
        ...ipdSurfaceCardSx,
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(palette.primary.main, 0.1),
        boxShadow: 'none',
        backgroundColor: alpha(palette.primary.main, 0.06),
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography
            variant="body2"
            sx={{
              display: 'block',
              fontWeight: 500,
              color: 'text.secondary',
              fontFamily: IPD_FONT_SANS,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mt: 0.15,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'text.primary',
              fontFamily: IPD_FONT_SERIF,
            }}
          >
            {value}
          </Typography>
          {trend ? (
            <Typography
              variant="body2"
              sx={{
                display: 'block',
                mt: 0.1,
                color: 'text.secondary',
                fontFamily: IPD_FONT_SANS,
              }}
            >
              {trend}
            </Typography>
          ) : null}
        </Box>

        {icon ? (
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: toneConfig.accent,
              backgroundColor: alpha(palette.primary.main, 0.12),
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>
    </Card>
  );
}

interface IpdSectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: Record<string, unknown>;
  bodySx?: Record<string, unknown>;
}

export function IpdSectionCard({
  title,
  subtitle,
  action,
  children,
  sx,
  bodySx,
}: IpdSectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        ...ipdSurfaceCardSx,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.25}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          borderBottom: '1px solid',
          borderColor: IPD_COLORS.border,
          background: `linear-gradient(135deg, ${alpha(IPD_COLORS.primary, 0.04)} 0%, ${alpha(IPD_COLORS.accent, 0.04)} 100%)`,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: IPD_COLORS.primary,
              lineHeight: 1.2,
              fontFamily: IPD_FONT_SERIF,
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                mt: 0.3,
                color: IPD_COLORS.textMuted,
                fontFamily: IPD_FONT_SANS,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box>{action}</Box> : null}
      </Stack>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, sm: 2.5 }, ...bodySx }}>{children}</Box>
    </Card>
  );
}

interface IpdInfoBoxProps {
  title: string;
  description: React.ReactNode;
}

export function IpdInfoBox({ title, description }: IpdInfoBoxProps) {
  return (
    <Box
      sx={{
        borderRadius: 1.75,
        border: '1px solid',
        borderColor: alpha(IPD_COLORS.accent, 0.35),
        borderLeftWidth: 4,
        px: 2,
        py: 1.5,
        backgroundColor: alpha(IPD_COLORS.accent, 0.05),
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: IPD_COLORS.primary, fontFamily: IPD_FONT_SANS }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 0.4, color: IPD_COLORS.textMuted, fontFamily: IPD_FONT_SANS }}
      >
        {description}
      </Typography>
    </Box>
  );
}
