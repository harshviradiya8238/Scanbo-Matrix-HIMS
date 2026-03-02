'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Chip, Snackbar, Stack, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  EventBusy as EventBusyIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { APPOINTMENTS } from './patient-portal-mock-data';
import type { Appointment } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader, ppInnerCard } from './patient-portal-styles';

type TabId = 'upcoming' | 'completed' | 'cancelled';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseTimeLabelTo24Hour(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  const normalizedHour = period === 'PM' ? (hour % 12) + 12 : hour % 12;
  return `${`${normalizedHour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

function ActionButtons({
  appointment,
  onRebook,
  onCancel,
}: {
  appointment: Appointment;
  onRebook: () => void;
  onCancel: () => void;
}) {
  const btnSx = {
    textTransform: 'none' as const,
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 1.5,
    minHeight: 28,
    px: 1.5,
  };

  if (appointment.status === 'upcoming') {
    return (
      <Stack direction="row" spacing={0.75}>
        <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={onRebook}>
          Reschedule
        </Button>
        <Button size="small" variant="outlined" color="error" sx={btnSx} onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    );
  }

  if (appointment.status === 'completed') {
    return (
      <Stack direction="row" spacing={0.75}>
        <Button size="small" variant="outlined" color="primary" sx={btnSx}>
          View Report
        </Button>
        <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={onRebook}>
          Rebook
        </Button>
      </Stack>
    );
  }

  return (
    <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={onRebook}>
      Rebook
    </Button>
  );
}

export default function PatientPortalMyAppointmentsPage() {
  const theme = useTheme();
  const router = useRouter();
  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const innerCard = ppInnerCard();

  const [activeTab, setActiveTab] = React.useState<TabId>('upcoming');
  const [appointments, setAppointments] = React.useState<Appointment[]>(() =>
    APPOINTMENTS.map((appointment) => ({ ...appointment }))
  );
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const tabTheme: Record<TabId, { bg: string; fg: string; dateBg: string }> = {
    upcoming: {
      bg: alpha(theme.palette.primary.main, 0.1),
      fg: theme.palette.primary.dark,
      dateBg: theme.palette.primary.main,
    },
    completed: {
      bg: alpha(theme.palette.success.main, 0.1),
      fg: theme.palette.success.dark,
      dateBg: theme.palette.success.main,
    },
    cancelled: {
      bg: alpha(theme.palette.error.main, 0.1),
      fg: theme.palette.error.dark,
      dateBg: theme.palette.error.main,
    },
  };

  const counts: Record<TabId, number> = {
    upcoming: appointments.filter((appointment) => appointment.status === 'upcoming').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
    cancelled: appointments.filter((appointment) => appointment.status === 'cancelled').length,
  };

  const filteredAppointments = appointments.filter((appointment) => appointment.status === activeTab);

  const goToBookingCalendar = React.useCallback(() => {
    router.push('/patient-portal/appointments?focus=booking');
  }, [router]);

  const handleRebook = React.useCallback(
    (appointment: Appointment) => {
      const time24 = parseTimeLabelTo24Hour(appointment.time);
      router.push(
        `/patient-portal/appointments?focus=booking&date=${appointment.date}&time=${time24}`
      );
    },
    [router]
  );

  const handleCancel = React.useCallback((appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, status: 'cancelled' } : appointment
      )
    );
    setSnackbar({ open: true, message: 'Appointment cancelled.' });
  }, []);

  return (
    <PatientPortalWorkspaceCard current="my-appointments">
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          mb: 2,
        }}
      >
        <StatTile
          label="Upcoming"
          value={counts.upcoming}
          subtitle="Scheduled visits"
          tone="primary"
          variant="soft"
          icon={<CalendarMonthIcon fontSize="small" />}
        />
        <StatTile
          label="Completed"
          value={counts.completed}
          subtitle="Visits done"
          tone="success"
          variant="soft"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
        />
        <StatTile
          label="Cancelled"
          value={counts.cancelled}
          subtitle="Cancelled visits"
          tone="warning"
          variant="soft"
          icon={<EventBusyIcon fontSize="small" />}
        />
      </Box>

      <Card elevation={0} sx={sectionCard}>
        <Box sx={sectionHeader}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                My Appointments
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={goToBookingCalendar}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 5,
                  minHeight: 28,
                  px: 1.75,
                }}
              >
                Book New
              </Button>

              {(['upcoming', 'completed', 'cancelled'] as TabId[]).map((tab) => {
                const active = tab === activeTab;
                return (
                  <Button
                    key={tab}
                    size="small"
                    variant={active ? 'contained' : 'outlined'}
                    disableElevation
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      textTransform: 'none',
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      borderRadius: 5,
                      minHeight: 28,
                      px: 1.75,
                      borderColor: active ? 'transparent' : alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    {capitalize(tab)} ({counts[tab]})
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        </Box>

        <Stack spacing={1.25} sx={{ p: 2 }}>
          {filteredAppointments.length === 0 ? (
            <Alert severity="info">No {activeTab} appointments.</Alert>
          ) : (
            filteredAppointments.map((appointment) => {
              const palette = tabTheme[appointment.status as TabId];
              return (
                <Box key={appointment.id} sx={innerCard}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1.5}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 56,
                        borderRadius: 1.5,
                        backgroundColor: palette.dateBg,
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                        {appointment.day}
                      </Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                        {appointment.month}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {appointment.doctorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.department} · {appointment.location} · Token {appointment.token}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {appointment.time} · {capitalize(appointment.type)} · {appointment.patient}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{ xs: 'row', sm: 'column' }}
                      alignItems={{ xs: 'center', sm: 'flex-end' }}
                      spacing={0.75}
                      sx={{ flexShrink: 0 }}
                    >
                      <Chip
                        label={capitalize(appointment.status)}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: palette.bg,
                          color: palette.fg,
                        }}
                      />
                      <ActionButtons
                        appointment={appointment}
                        onRebook={() => handleRebook(appointment)}
                        onCancel={() => handleCancel(appointment.id)}
                      />
                    </Stack>
                  </Stack>
                </Box>
              );
            })
          )}
        </Stack>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
