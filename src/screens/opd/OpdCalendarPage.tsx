'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from '@fullcalendar/core';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Drawer,
  IconButton,
  Popover,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  SelectChangeEvent,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
  Settings as SettingsIcon,
  Apps as AppsIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import {
  AppointmentStatus,
  OPD_APPOINTMENTS,
  OPD_PROVIDER_AVAILABILITY,
  OPD_PROVIDERS,
  OPD_SLOT_TIMES,
  OpdAppointment,
  ProviderAvailability,
  VisitType,
} from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn, GLOBAL_PATIENTS, GlobalPatient } from '@/src/mocks/global-patients';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';

interface BookingForm {
  date: string;
  time: string;
  provider: string;
  department: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  phone: string;
  visitType: VisitType;
  payerType: 'General' | 'Insurance' | 'Corporate';
  chiefComplaint: string;
}

type BookingErrors = Partial<Record<keyof BookingForm, string>>;
type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth';

const appointmentStatusColor: Record<AppointmentStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Scheduled: 'default',
  'Checked-In': 'info',
  'In Triage': 'warning',
  'In Consultation': 'warning',
  Completed: 'success',
  'No Show': 'error',
};

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const addMinutesToTime = (value: string, minutesToAdd: number) => {
  const total = toMinutes(value) + minutesToAdd;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${mins}`.padStart(2, '0')}:00`;
};

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getSlotDurationMinutes = (slots: string[]) => {
  if (slots.length < 2) return 20;
  return Math.max(10, toMinutes(slots[1]) - toMinutes(slots[0]));
};

const slotDurationMinutes = getSlotDurationMinutes(OPD_SLOT_TIMES);
const calendarMinTime = '00:00:00';
const calendarMaxTime = '24:00:00';

function buildDefaultBooking(): BookingForm {
  return {
    date: '2026-02-04',
    time: OPD_SLOT_TIMES[0] ?? '09:00',
    provider: OPD_PROVIDERS[0],
    department: 'General Medicine',
    patientName: '',
    mrn: '',
    ageGender: '',
    phone: '',
    visitType: 'New',
    payerType: 'General',
    chiefComplaint: '',
  };
}

export default function OpdCalendarPage() {
  const router = useRouter();
  const theme = useTheme();
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const mrnParam = useMrnParam();

  const [appointments, setAppointments] = React.useState<OpdAppointment[]>(OPD_APPOINTMENTS);
  const [availability, setAvailability] = React.useState<ProviderAvailability[]>(
    OPD_PROVIDER_AVAILABILITY
  );
  const [selectedDate, setSelectedDate] = React.useState('2026-02-04');
  const [providerFilter, setProviderFilter] = React.useState<'All' | string>('All');
  const [booking, setBooking] = React.useState<BookingForm>(buildDefaultBooking());
  const [errors, setErrors] = React.useState<BookingErrors>({});
  const [selectedPatientOption, setSelectedPatientOption] = React.useState<GlobalPatient | null>(null);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [calendarView, setCalendarView] = React.useState<CalendarView>('timeGridWeek');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  const [selectedEvent, setSelectedEvent] = React.useState<OpdAppointment | null>(null);
  const [eventAnchor, setEventAnchor] = React.useState<HTMLElement | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const seededPatient = React.useMemo(
    () => getPatientByMrn(booking.mrn || mrnParam),
    [booking.mrn, mrnParam]
  );
  const patientName = booking.patientName || seededPatient?.name;
  const patientMrn = booking.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(patientName, patientMrn);

  const todayAppointments = React.useMemo(
    () => appointments.filter((appointment) => appointment.date === selectedDate),
    [appointments, selectedDate]
  );

  const totalSlots = todayAppointments.length;
  const checkedInCount = todayAppointments.filter((appointment) => appointment.status === 'Checked-In').length;
  const inProgressCount = todayAppointments.filter(
    (appointment) => appointment.status === 'In Triage' || appointment.status === 'In Consultation'
  ).length;
  const noShowCount = todayAppointments.filter((appointment) => appointment.status === 'No Show').length;

  const updateBookingField = <K extends keyof BookingForm,>(field: K, value: BookingForm[K]) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getSlotForSelection = React.useCallback(
    (provider: string, date: string, time: string) => {
      const availabilityEntry = availability.find(
        (entry) => entry.provider === provider && entry.date === date
      );
      return availabilityEntry?.slots.find((slot) => slot.time === time);
    },
    [availability]
  );

  const ensureAvailabilitySlot = React.useCallback((provider: string, date: string, time: string) => {
    setAvailability((prev) => {
      let foundEntry = false;
      const next = prev.map((entry) => {
        if (entry.provider !== provider || entry.date !== date) return entry;
        foundEntry = true;
        const slotExists = entry.slots.some((slot) => slot.time === time);
        if (slotExists) return entry;
        return {
          ...entry,
          slots: [...entry.slots, { time, status: 'Available' as const }],
        };
      });
      if (!foundEntry) {
        next.push({
          provider,
          date,
          location: 'Main OPD Wing',
          slots: [{ time, status: 'Available' as const }],
        });
      }
      return next;
    });
  }, []);

  const markSlotBooked = React.useCallback((provider: string, date: string, time: string) => {
    setAvailability((prev) => {
      let foundEntry = false;
      const next: ProviderAvailability[] = prev.map((entry) => {
        if (entry.provider !== provider || entry.date !== date) return entry;
        foundEntry = true;
        const slotExists = entry.slots.some((slot) => slot.time === time);
        if (!slotExists) {
          return {
            ...entry,
            slots: [...entry.slots, { time, status: 'Booked' as const }],
          };
        }
        return {
          ...entry,
          slots: entry.slots.map((slot) =>
            slot.time === time ? { ...slot, status: 'Booked' as const } : slot
          ),
        };
      });
      if (!foundEntry) {
        next.push({
          provider,
          date,
          location: 'Main OPD Wing',
          slots: [{ time, status: 'Booked' as const }],
        });
      }
      return next;
    });
  }, []);

  const handleSelectPatient = (patient: GlobalPatient | null) => {
    setSelectedPatientOption(patient);
    if (!patient) return;
    updateBookingField('patientName', patient.name);
    updateBookingField('mrn', patient.mrn);
    updateBookingField('ageGender', patient.ageGender);
    updateBookingField('phone', patient.phone);
    updateBookingField('department', patient.department);
  };

  const handleDateClick = React.useCallback(
    (arg: DateClickArg) => {
      const calendarApi = calendarRef.current?.getApi();
      const clickedDate = formatIsoDate(arg.date);

      if (arg.view.type === 'dayGridMonth') {
        calendarApi?.changeView('timeGridDay', clickedDate);
        setCalendarView('timeGridDay');
        setSelectedDate(clickedDate);
        return;
      }

      const clickedTime = formatTime(arg.date);
      const provider = providerFilter === 'All' ? booking.provider : providerFilter;
      const slot = getSlotForSelection(provider, clickedDate, clickedTime);

      if (slot && slot.status !== 'Available') {
        setSnackbar({
          open: true,
          message: `${slot.time} is ${slot.status.toLowerCase()}. Choose another slot.`,
          severity: 'info',
        });
        return;
      }

      if (!slot) {
        ensureAvailabilitySlot(provider, clickedDate, clickedTime);
      }
      setSelectedDate(clickedDate);
      setBooking((prev) => ({
        ...prev,
        date: clickedDate,
        time: clickedTime,
        provider,
      }));
      setBookingOpen(true);
    },
    [booking.provider, getSlotForSelection, providerFilter]
  );

  const handleEventClick = React.useCallback((arg: EventClickArg) => {
    const appointment = arg.event.extendedProps.appointment as OpdAppointment | undefined;
    if (!appointment) return;
    setSelectedEvent(appointment);
    setEventAnchor(arg.el);
  }, []);

  const handleDatesSet = React.useCallback((arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCalendarView(arg.view.type as CalendarView);
    if (arg.view.type === 'dayGridMonth') {
      setSelectedDate(formatIsoDate(arg.view.currentStart));
      return;
    }
    setSelectedDate(formatIsoDate(arg.start));
  }, []);

  React.useEffect(() => {
    if (!bookingOpen) {
      setBooking((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [selectedDate, bookingOpen]);

  React.useEffect(() => {
    if (providerFilter !== 'All') {
      setBooking((prev) => ({
        ...prev,
        provider: providerFilter,
      }));
    }
  }, [providerFilter]);

  const flowMrn = booking.mrn || mrnParam;
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = getPatientByMrn(mrnParam);
    if (match) {
      setSelectedPatientOption(match);
      setBooking((prev) => ({
        ...prev,
        mrn: match.mrn,
        patientName: match.name,
        ageGender: match.ageGender,
        phone: match.phone,
        department: match.department,
      }));
    } else {
      setBooking((prev) => ({ ...prev, mrn: mrnParam }));
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const validateBooking = (): boolean => {
    const nextErrors: BookingErrors = {};
    const requiredFields: Array<[keyof BookingForm, string]> = [
      ['date', 'Date'],
      ['time', 'Time'],
      ['provider', 'Provider'],
      ['department', 'Department'],
      ['patientName', 'Patient name'],
      ['phone', 'Phone'],
      ['visitType', 'Visit type'],
      ['chiefComplaint', 'Chief complaint'],
    ];

    requiredFields.forEach(([field, label]) => {
      if (!booking[field].trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateBooking = (sendToQueue: boolean) => {
    const valid = validateBooking();
    if (!valid) {
      setSnackbar({
        open: true,
        message: 'Please complete all required booking fields.',
        severity: 'error',
      });
      return;
    }

    const slot = getSlotForSelection(booking.provider, booking.date, booking.time);
    if (slot && slot.status !== 'Available') {
      setSnackbar({
        open: true,
        message: `Selected slot is ${slot.status.toLowerCase()}. Choose an available slot.`,
        severity: 'error',
      });
      return;
    }

    if (!slot) {
      ensureAvailabilitySlot(booking.provider, booking.date, booking.time);
    }

    const created: OpdAppointment = {
      id: `appt-${Date.now()}`,
      date: booking.date,
      time: booking.time,
      provider: booking.provider,
      department: booking.department,
      patientName: booking.patientName,
      mrn: booking.mrn || `MRN-${Math.floor(Math.random() * 900000 + 100000)}`,
      ageGender: booking.ageGender || 'Unknown',
      visitType: booking.visitType,
      status: sendToQueue ? 'Checked-In' : 'Scheduled',
      chiefComplaint: booking.chiefComplaint,
      payerType: booking.payerType,
      phone: booking.phone,
    };

    setAppointments((prev) => [...prev, created].sort((a, b) => a.time.localeCompare(b.time)));
    markSlotBooked(created.provider, created.date, created.time);
    setBookingOpen(false);

    setSnackbar({
      open: true,
      message: sendToQueue
        ? `Booking created and sent to queue for ${created.patientName}.`
        : `Booking created for ${created.patientName}.`,
      severity: 'success',
    });

    if (sendToQueue) {
      router.push(withMrn('/appointments/queue'));
    }

    setBooking((prev) => ({
      ...buildDefaultBooking(),
      date: prev.date,
      provider: prev.provider,
      department: prev.department,
    }));
  };

  const events = React.useMemo<EventInput[]>(
    () =>
      appointments
        .filter((appointment) => providerFilter === 'All' || appointment.provider === providerFilter)
        .map((appointment) => ({
          id: appointment.id,
          title: appointment.patientName,
          start: `${appointment.date}T${appointment.time}:00`,
          end: `${appointment.date}T${addMinutesToTime(appointment.time, slotDurationMinutes)}:00`,
          classNames:
            selectedEvent && selectedEvent.id === appointment.id ? ['fc-event-selected'] : [],
          extendedProps: { appointment },
        })),
    [appointments, providerFilter, selectedEvent]
  );

  const renderEventContent = React.useCallback(
    (arg: EventContentArg) => {
      const appointment = arg.event.extendedProps.appointment as OpdAppointment | undefined;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
            {arg.timeText}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
            {appointment?.patientName ?? arg.event.title}
          </span>
        </div>
      );
    },
    []
  );

  const getStatusTone = React.useCallback(
    (status: AppointmentStatus) => {
      const tone = appointmentStatusColor[status];
      return tone === 'default' ? theme.palette.grey[600] : theme.palette[tone].main;
    },
    [theme.palette]
  );

  const handleNewBooking = React.useCallback(() => {
    setBooking((prev) => ({
      ...prev,
      date: selectedDate,
      time: prev.time || OPD_SLOT_TIMES[0],
      provider: providerFilter === 'All' ? prev.provider : providerFilter,
    }));
    setBookingOpen(true);
  }, [providerFilter, selectedDate]);

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const handleViewSelect = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const value = (event.target as HTMLInputElement).value as CalendarView;
    if (!value) return;
    setCalendarView(value);
    calendarRef.current?.getApi().changeView(value);
  };

  const dayHeaderContent = React.useCallback((arg: { date: Date; view: { type: string } }) => {
    const dayName = arg.date
      .toLocaleDateString(undefined, { weekday: 'short' })
      .toUpperCase();
    if (arg.view.type === 'dayGridMonth') {
      return {
        html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${dayName}</div></div>`,
      };
    }
    const dayNum = arg.date.getDate();
    const today = isSameDate(arg.date, new Date());
    return {
      html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${dayName}</div><div class="fc-scanbo-daynum${today ? ' is-today' : ''}">${dayNum}</div></div>`,
    };
  }, []);

  return (
    <PageTemplate title="Appointments Calendar" subtitle={pageSubtitle} currentPageTitle="Calendar">
      <Stack spacing={2}>
        <OpdFlowHeader
          activeStep="calendar"
          title="OPD Schedule and Booking"
          description="Manage provider slots, create new bookings, and push arrivals into OPD queue."
          patientMrn={patientMrn}
          patientName={patientName}
          primaryAction={{ label: 'Open Queue', route: '/appointments/queue' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Slots on {selectedDate}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalSlots}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Checked-In
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {checkedInCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Triage / Consult
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {inProgressCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                No Show
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {noShowCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 3, border: 'none', boxShadow: 'none', overflow: 'hidden' }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  justifyContent="space-between"
                  sx={{
                    p: 2,
                    pb: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 4,
                    bgcolor: alpha(theme.palette.background.paper, 0.96),
                    backdropFilter: 'blur(6px)',
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.2),
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleToday}
                      sx={{ borderRadius: 999, px: 2.5, fontWeight: 600 }}
                    >
                      Today
                    </Button>
                    <IconButton
                      size="small"
                      onClick={handlePrev}
                      aria-label="Previous"
                      sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleNext}
                      aria-label="Next"
                      sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 1 }}>
                      {calendarTitle || 'Calendar'}
                    </Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton size="small">
                        <SearchIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      size="small"
                      select
                      label="Provider"
                      value={providerFilter}
                      onChange={(event) => setProviderFilter(event.target.value)}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="All">All Providers</MenuItem>
                      {OPD_PROVIDERS.map((provider) => (
                        <MenuItem key={provider} value={provider}>
                          {provider}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      select
                      label="View"
                      value={calendarView}
                      onChange={(e) => handleViewSelect(e as SelectChangeEvent)}
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="dayGridMonth">Month</MenuItem>
                      <MenuItem value="timeGridWeek">Week</MenuItem>
                      <MenuItem value="timeGridDay">Day</MenuItem>
                    </TextField>
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CalendarMonthIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <AppsIcon fontSize="small" />
                    </IconButton>
                    <Button size="small" variant="contained" onClick={handleNewBooking}>
                      New Booking
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    borderTop: 'none',
                    bgcolor: 'background.paper',
                    height: { xs: '70vh', md: '78vh' },
                    '& .fc': {
                      fontFamily: 'Nunito, sans-serif',
                      color: theme.palette.text.primary,
                      '--fc-border-color': alpha(theme.palette.divider, 0.15),
                      '--fc-page-bg-color': theme.palette.background.paper,
                      '--fc-neutral-bg-color': alpha(theme.palette.primary.main, 0.04),
                      '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .fc-toolbar': {
                      m: 0,
                      p: 1.5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '& .fc-toolbar-title': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    },
                    '& .fc-button': {
                      backgroundColor: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      textTransform: 'capitalize',
                      boxShadow: 'none',
                      borderRadius: 10,
                      padding: '6px 12px',
                      fontWeight: 600,
                    },
                    '& .fc-button:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      borderColor: theme.palette.primary.dark,
                    },
                    '& .fc-button-primary:not(:disabled).fc-button-active': {
                      backgroundColor: theme.palette.secondary.main,
                      borderColor: theme.palette.secondary.main,
                    },
                    '& .fc-button:disabled': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                      borderColor: 'transparent',
                      color: theme.palette.common.white,
                    },
                    '& .fc-scrollgrid': {
                      borderColor: 'transparent',
                    },
                    '& .fc-theme-standard td, & .fc-theme-standard th': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '& .fc-col-header-cell': {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '& .fc-col-header-cell-cushion': {
                      padding: 0,
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      justifyContent: 'center',
                    },
                    '& .fc-scanbo-dayhead': {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 0 8px',
                    },
                    '& .fc-scanbo-dayname': {
                      fontSize: '0.8rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    },
                    '& .fc-scanbo-daynum': {
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.text.primary,
                    },
                    '& .fc-scanbo-daynum.is-today': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    },
                    '& .fc-daygrid-day-top': {
                      flexDirection: 'column',
                      alignItems: 'center',
                      paddingTop: 10,
                    },
                    '& .fc-timegrid-slot-label': {
                      color: theme.palette.text.secondary,
                      fontSize: '0.8rem',
                    },
                    '& .fc-timegrid-axis': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                      color: theme.palette.text.secondary,
                      fontSize: '0.8rem',
                    },
                    '& .fc-timegrid-axis-frame': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    },
                    '& .fc-timegrid-divider': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    },
                    '& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '& .fc-event': {
                      borderRadius: 10,
                      padding: '6px 8px',
                      boxShadow: 'none',
                    },
                    '& .fc-timegrid-event': {
                      minHeight: 56,
                    },
                    '& .fc-event-selected': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`,
                    },
                    '& .fc-event-main': {
                      color: theme.palette.text.primary,
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                    },
                    '& .fc-event-time': {
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    },
                    '& .fc-event-title': {
                      fontWeight: 700,
                    },
                    '& .fc-view-harness': {
                      minHeight: '100%',
                    },
                    '& .fc-timegrid-slot': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '& .fc-timegrid-slot-minor': {
                      borderColor: 'transparent',
                    },
                    '& .fc-timegrid-now-indicator-line': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={calendarView}
                    initialDate={selectedDate}
                    headerToolbar={false}
                    height="100%"
                    slotMinTime={calendarMinTime}
                    slotMaxTime={calendarMaxTime}
                    slotDuration={formatDuration(slotDurationMinutes)}
                    slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short', omitZeroMinute: true }}
                    slotLabelInterval={{ hours: 1 }}
                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                    scrollTime="00:00:00"
                    nowIndicator
                    allDaySlot
                    dayMaxEvents
                    expandRows
                    stickyHeaderDates
                    stickyFooterScrollbar
                    slotEventOverlap={false}
                    eventOverlap={false}
                    eventMaxStack={2}
                    eventMinHeight={46}
                    eventShortHeight={46}
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    dayHeaderContent={dayHeaderContent}
                    eventContent={renderEventContent}
                    eventDidMount={(info) => {
                      const appointment = info.event.extendedProps.appointment as OpdAppointment | undefined;
                      if (!appointment) return;
                      const tone = getStatusTone(appointment.status);
                      info.el.style.backgroundColor = alpha(tone, 0.22);
                      info.el.style.border = `1px solid ${alpha(tone, 0.55)}`;
                      info.el.style.color = theme.palette.text.primary;
                      info.el.style.borderRadius = '10px';
                      info.el.style.boxShadow = `0 1px 2px ${alpha(tone, 0.2)}`;
                      info.el.style.cursor = 'pointer';
                      if (selectedEvent && appointment.id === selectedEvent.id) {
                        info.el.style.boxShadow = `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`;
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                OPD Flow Quick Actions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Continue to queue and encounter once patient checks in.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => router.push(withMrn('/appointments/queue'))}
              >
                Queue Desk
              </Button>
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={() => router.push(withMrn('/appointments/visit'))}
              >
                Visit Workspace
              </Button>
              <Button
                variant="text"
                startIcon={<WarningAmberIcon />}
                onClick={() => router.push(withMrn('/clinical/orders'))}
              >
                Clinical Orders
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Drawer
          anchor="right"
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 420 },
              p: 2,
            },
          }}
        >
          <Stack spacing={1.3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Create Booking
              </Typography>
              <IconButton size="small" onClick={() => setBookingOpen(false)}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Autocomplete
              options={GLOBAL_PATIENTS}
              value={selectedPatientOption}
              onChange={(_, value) => handleSelectPatient(value)}
              getOptionLabel={(option) => `${option.name} (${option.mrn})`}
              renderInput={(params) => (
                <TextField {...params} label="Select Patient" placeholder="Search by name or MRN" />
              )}
            />

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={booking.date}
                  onChange={(event) => updateBookingField('date', event.target.value)}
                  error={Boolean(errors.date)}
                  helperText={errors.date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={booking.time}
                  onChange={(event) => updateBookingField('time', event.target.value)}
                  error={Boolean(errors.time)}
                  helperText={errors.time}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              select
              label="Provider"
              value={booking.provider}
              onChange={(event) => updateBookingField('provider', event.target.value)}
              error={Boolean(errors.provider)}
              helperText={errors.provider}
            >
              {OPD_PROVIDERS.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Department"
              value={booking.department}
              onChange={(event) => updateBookingField('department', event.target.value)}
              error={Boolean(errors.department)}
              helperText={errors.department}
            />

            <TextField
              label="Patient Name"
              value={booking.patientName}
              onChange={(event) => {
                setSelectedPatientOption(null);
                updateBookingField('patientName', event.target.value);
              }}
              error={Boolean(errors.patientName)}
              helperText={errors.patientName}
            />

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="MRN (optional)"
                  value={booking.mrn}
                  onChange={(event) => {
                    setSelectedPatientOption(null);
                    updateBookingField('mrn', event.target.value);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Age / Gender"
                  value={booking.ageGender}
                  onChange={(event) => updateBookingField('ageGender', event.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Phone"
              value={booking.phone}
              onChange={(event) => updateBookingField('phone', event.target.value)}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
            />

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Visit Type"
                  value={booking.visitType}
                  onChange={(event) => updateBookingField('visitType', event.target.value as VisitType)}
                >
                  {['New', 'Follow-up', 'Review'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Payer"
                  value={booking.payerType}
                  onChange={(event) =>
                    updateBookingField(
                      'payerType',
                      event.target.value as 'General' | 'Insurance' | 'Corporate'
                    )
                  }
                >
                  {['General', 'Insurance', 'Corporate'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Chief Complaint"
              multiline
              minRows={2}
              value={booking.chiefComplaint}
              onChange={(event) => updateBookingField('chiefComplaint', event.target.value)}
              error={Boolean(errors.chiefComplaint)}
              helperText={errors.chiefComplaint}
            />

            <Stack direction="row" spacing={1.2}>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => handleCreateBooking(false)}
              >
                Create Booking
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<GroupIcon />}
                onClick={() => handleCreateBooking(true)}
              >
                Create + Check-In
              </Button>
            </Stack>
          </Stack>
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Popover
          open={Boolean(selectedEvent && eventAnchor)}
          anchorEl={eventAnchor}
          onClose={() => {
            setSelectedEvent(null);
            setEventAnchor(null);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          marginThreshold={24}
          PaperProps={{
            sx: {
              p: 2,
              borderRadius: 3,
              minWidth: 280,
              maxWidth: 360,
              width: 'max-content',
              maxHeight: '70vh',
              overflowY: 'auto',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.25),
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: theme.palette.common.white,
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 6,
                height: '100%',
                background: theme.palette.primary.main,
              },
            },
          }}
        >
          {selectedEvent ? (
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedEvent.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEvent.date} · {selectedEvent.time} · {selectedEvent.provider}
              </Typography>
              <Divider />
              <Typography variant="body2">
                <strong>Status:</strong> {selectedEvent.status}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {selectedEvent.department}
              </Typography>
              <Typography variant="body2">
                <strong>MRN:</strong> {selectedEvent.mrn}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {selectedEvent.phone}
              </Typography>
              <Typography variant="body2">
                <strong>Complaint:</strong> {selectedEvent.chiefComplaint}
              </Typography>
            </Stack>
          ) : null}
        </Popover>
      </Stack>
    </PageTemplate>
  );
}
