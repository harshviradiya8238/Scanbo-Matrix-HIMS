'use client';

import * as React from 'react';
import { Avatar, Box, Chip, Divider, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@mui/material';
import { EncounterStatus, OpdEncounterCase } from '../opd-mock-data';
import { ENCOUNTER_STATUS_LABEL } from '../opd-encounter';
import StatusBadge from './StatusBadge';

const TIMELINE: EncounterStatus[] = ['BOOKED', 'ARRIVED', 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED'];

interface PatientInfoCardProps {
  encounter?: OpdEncounterCase;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

export default function PatientInfoCard({ encounter }: PatientInfoCardProps) {
  const theme = useTheme();

  if (!encounter) {
    return (
      <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">Select an encounter to view patient details.</Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.paper} 24%)`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'primary.main',
              fontWeight: 700,
            }}
          >
            {getInitials(encounter.patientName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {encounter.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {encounter.ageGender} · {encounter.mrn}
            </Typography>
            <Stack direction="row" spacing={0.6} sx={{ mt: 0.75 }} flexWrap="wrap">
              <Chip size="small" label={encounter.department} variant="outlined" />
              <Chip size="small" label={encounter.appointmentTime} />
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 1, px: 1.2, borderRadius: 1.5, backgroundColor: alpha(theme.palette.background.default, 0.7) }}
        >
          <Typography variant="caption" color="text.secondary">
            Visit Status
          </Typography>
          <StatusBadge status={encounter.status} />
        </Stack>

        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary">
            Timeline
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {TIMELINE.map((step) => {
              const isCurrent = encounter.status === step;
              return (
                <Chip
                  key={step}
                  size="small"
                  label={ENCOUNTER_STATUS_LABEL[step]}
                  color={isCurrent ? 'primary' : 'default'}
                  variant={isCurrent ? 'filled' : 'outlined'}
                />
              );
            })}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={0.8}>
          <Typography variant="caption" color="text.secondary">
            Latest Vitals
          </Typography>
          {[
            ['BP', encounter.vitals.bp],
            ['HR', encounter.vitals.hr],
            ['Temp', encounter.vitals.temp],
            ['SpO2', encounter.vitals.spo2],
            ['RR', encounter.vitals.rr],
            ['Wt', encounter.vitals.weightKg],
          ].map(([label, value]) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              sx={{ px: 1.2, py: 0.7, borderRadius: 1, backgroundColor: alpha(theme.palette.background.default, 0.65) }}
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {value || '--'}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Stack spacing={0.8}>
          <Typography variant="caption" color="text.secondary">
            Allergies
          </Typography>
          {encounter.allergies.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No known allergies.
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.6} flexWrap="wrap">
              {encounter.allergies.map((allergy) => (
                <Chip
                  key={allergy}
                  size="small"
                  color="error"
                  variant="outlined"
                  label={allergy}
                />
              ))}
            </Stack>
          )}
        </Stack>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Chief Complaint
          </Typography>
          <Typography variant="body2">{encounter.chiefComplaint}</Typography>
          <Typography variant="caption" color="text.secondary">
            Assigned Doctor: {encounter.doctor}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
