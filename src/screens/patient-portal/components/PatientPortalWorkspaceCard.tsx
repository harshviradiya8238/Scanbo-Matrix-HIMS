'use client';

import * as React from 'react';
import { Avatar, Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { PatientPortalTabId } from '../patient-portal-types';
import { PATIENT } from '../patient-portal-mock-data';

export default function PatientPortalWorkspaceCard({
  current: _current,
  children,
  actions,
  hidePatientBar = true,
}: {
  current: PatientPortalTabId;
  children: React.ReactNode;
  actions?: React.ReactNode;
  hidePatientBar?: boolean;
}) {
  const theme = useTheme();

  return (
    <>
      {/* ── Patient Info Bar ──
          Rendered with ZERO outer padding — full-width, flush below app header.
          Exactly mirrors IpdPatientTopBar layout.
          Hidden on pages (e.g. Profile) that render their own header card. */}
      {!hidePatientBar && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 12,
            backgroundColor: theme.palette.common.white,
            border: 0,
            borderBottom: '1px solid',
            borderBottomColor: alpha(theme.palette.primary.main, 0.28),
            overflow: 'hidden',
            marginBottom: 1.5,
            boxShadow: 'none',
            // bgcolor: "rgba(17, 114, 186, 0.06)",
          }}
        >
          <Box sx={{ px: { xs: 1, md: 1.5 }, py: { xs: 1, md: 1.15 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              {/* Left — avatar + name + demographics */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: 'primary.main',
                    color: theme.palette.primary.contrastText,
                    fontWeight: 600,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {PATIENT.initials}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.15, color: 'text.primary' }}
                      noWrap
                    >
                      {PATIENT.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={`PID: ${PATIENT.pid}`}
                      sx={{
                        height: 21,
                        border: 0,
                        borderRadius: 1.2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                        '& .MuiChip-label': {
                          px: 0.85,
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          fontSize: 11,
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={0.6} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 0.25 }}>
                    {[`${PATIENT.age} yrs`, PATIENT.gender, PATIENT.phone].map((item, index) => (
                      <Stack key={`${item}-${index}`} direction="row" spacing={0.45} alignItems="center">
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>•</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              {/* Right — field chips + optional page-level actions */}
              <Stack direction="row" spacing={0.6} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    mr: { md: actions ? 1.25 : 0 },
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: 4 },
                    '&::-webkit-scrollbar-thumb': {
                      borderRadius: 999,
                      backgroundColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  }}
                >
                  <Stack direction="row" spacing={0.6} sx={{ minWidth: 'max-content', pr: 0.4 }}>
                    {[
                      { label: 'Blood Group', value: PATIENT.bloodGroup },
                      { label: 'Last Checkup', value: PATIENT.lastCheckup },
                      ...PATIENT.conditions.map((c) => ({ label: 'Condition', value: c })),
                    ].map((field) => (
                      <Chip
                        key={`${field.label}-${field.value}`}
                        size="small"
                        variant="outlined"
                        label={
                          <Box component="span">
                            <Box component="span" sx={{ fontWeight: 700 }}>{field.label}: </Box>
                            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{field.value}</Box>
                          </Box>
                        }
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.24),
                          backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          maxWidth: 260,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            fontSize: 11.5,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {actions && (
                  <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexShrink: 0 }}>
                    {actions}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}

      {/* ── Page content with standard padding ── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: hidePatientBar ? 2 : 0, pb: 3, backgroundColor: theme.palette.common.white }}>
        {children}
      </Box>
    </>
  );
}
