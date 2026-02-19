'use client';

import * as React from 'react';
import { Avatar, Box, Chip, Divider, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from './Card';
import { alpha, useTheme } from '@/src/ui/theme';

type HeaderVariant = 'ipd' | 'opd';
type HeaderTone = 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
type HeaderChipVariant = 'filled' | 'outlined';

export interface PatientHeaderSummaryItem {
  label: string;
  value: React.ReactNode;
  tone?: HeaderTone;
}

export interface PatientHeaderChipItem {
  label: React.ReactNode;
  color?: HeaderTone;
  variant?: HeaderChipVariant;
}

interface PatientGlobalHeaderProps {
  variant?: HeaderVariant;
  patientName: string;
  mrn?: string;
  ageGender?: string;
  primaryContext?: string;
  providerLabel?: string;
  providerName?: string;
  summaryItems?: PatientHeaderSummaryItem[];
  statusChips?: PatientHeaderChipItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

function getValueToneColor(variant: HeaderVariant, tone: HeaderTone = 'default') {
  if (tone === 'default') {
    return variant === 'ipd' ? 'common.white' : 'text.primary';
  }
  if (variant === 'ipd') {
    if (tone === 'success') return 'success.light';
    if (tone === 'warning') return 'warning.light';
    if (tone === 'error') return 'error.light';
    if (tone === 'info') return 'info.light';
    if (tone === 'secondary') return 'secondary.light';
    return 'primary.light';
  }
  if (tone === 'success') return 'success.main';
  if (tone === 'warning') return 'warning.main';
  if (tone === 'error') return 'error.main';
  if (tone === 'info') return 'info.main';
  if (tone === 'secondary') return 'secondary.main';
  return 'primary.main';
}

export default function PatientGlobalHeader({
  variant = 'ipd',
  patientName,
  mrn,
  ageGender,
  primaryContext,
  providerLabel = 'Consultant',
  providerName,
  summaryItems = [],
  statusChips = [],
  actions,
  children,
}: PatientGlobalHeaderProps) {
  const theme = useTheme();
  const isIpd = variant === 'ipd';
  const initials = getInitials(patientName || 'Patient') || 'P';

  const background = isIpd
    ? `linear-gradient(140deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(
        theme.palette.info.dark,
        0.9
      )} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.11)} 0%, ${alpha(
        theme.palette.info.main,
        0.08
      )} 100%)`;

  const hasLowerSection = summaryItems.length > 0 || statusChips.length > 0 || Boolean(children);

  return (
    <Card
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: isIpd ? alpha(theme.palette.common.white, 0.16) : alpha(theme.palette.primary.main, 0.16),
        background,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 1.25, md: 2 }, py: 1.4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.15} alignItems="center">
            <Avatar
              sx={{
                width: { xs: 44, md: 50 },
                height: { xs: 44, md: 50 },
                fontWeight: 800,
                bgcolor: isIpd ? alpha(theme.palette.common.white, 0.16) : 'primary.main',
                color: isIpd ? 'common.white' : 'common.white',
                border: '1px solid',
                borderColor: isIpd ? alpha(theme.palette.common.white, 0.26) : alpha(theme.palette.common.white, 0.36),
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: isIpd ? 'common.white' : 'text.primary',
                  }}
                >
                  {patientName}
                </Typography>

                {mrn ? (
                  <Chip
                    size="small"
                    label={mrn}
                    variant={isIpd ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 700,
                      bgcolor: isIpd ? alpha(theme.palette.common.white, 0.14) : undefined,
                      color: isIpd ? 'common.white' : undefined,
                      borderColor: isIpd ? alpha(theme.palette.common.white, 0.2) : undefined,
                    }}
                  />
                ) : null}

                {ageGender ? (
                  <Chip
                    size="small"
                    label={ageGender}
                    variant="outlined"
                    sx={{
                      borderColor: isIpd ? alpha(theme.palette.common.white, 0.22) : undefined,
                      color: isIpd ? alpha(theme.palette.common.white, 0.92) : undefined,
                    }}
                  />
                ) : null}
              </Stack>

              {primaryContext ? (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.15,
                    color: isIpd ? alpha(theme.palette.common.white, 0.76) : 'text.secondary',
                  }}
                >
                  {primaryContext}
                </Typography>
              ) : null}

              {providerName ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: isIpd ? alpha(theme.palette.common.white, 0.82) : 'text.secondary',
                  }}
                >
                  {providerLabel}: {providerName}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          {actions ? <Box sx={{ width: { xs: '100%', md: 'auto' } }}>{actions}</Box> : null}
        </Stack>
      </Box>

      {hasLowerSection ? (
        <>
          <Divider sx={{ borderColor: isIpd ? alpha(theme.palette.common.white, 0.14) : 'divider' }} />
          <Box sx={{ px: { xs: 1.25, md: 2 }, py: 1.2 }}>
            {summaryItems.length > 0 ? (
              <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                {summaryItems.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      minWidth: { xs: 'calc(50% - 6px)', md: 138 },
                      flexGrow: 1,
                      px: 1.05,
                      py: 0.85,
                      borderRadius: 1.35,
                      border: '1px solid',
                      borderColor: isIpd ? alpha(theme.palette.common.white, 0.15) : alpha(theme.palette.primary.main, 0.14),
                      backgroundColor: isIpd
                        ? alpha(theme.palette.common.white, 0.08)
                        : alpha(theme.palette.background.paper, 0.72),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: 0.45,
                        fontWeight: 700,
                        color: isIpd ? alpha(theme.palette.common.white, 0.66) : 'text.secondary',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.2,
                        fontWeight: 800,
                        color: getValueToneColor(variant, item.tone),
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : null}

            {statusChips.length > 0 ? (
              <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap" sx={{ mt: summaryItems.length > 0 ? 1 : 0 }}>
                {statusChips.map((item, index) => (
                  <Chip
                    key={`${String(item.label)}-${index}`}
                    size="small"
                    label={item.label}
                    color={item.color ?? 'default'}
                    variant={item.variant ?? (isIpd ? 'filled' : 'outlined')}
                    sx={
                      isIpd && (item.color === undefined || item.color === 'default')
                        ? {
                            color: 'common.white',
                            bgcolor: alpha(theme.palette.common.white, 0.11),
                            borderColor: alpha(theme.palette.common.white, 0.22),
                          }
                        : undefined
                    }
                  />
                ))}
              </Stack>
            ) : null}

            {children ? <Box sx={{ mt: summaryItems.length > 0 || statusChips.length > 0 ? 1.1 : 0 }}>{children}</Box> : null}
          </Box>
        </>
      ) : null}
    </Card>
  );
}
