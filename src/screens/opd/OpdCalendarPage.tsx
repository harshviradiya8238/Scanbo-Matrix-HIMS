'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Avatar,
  Box,
  Button,
  Chip,
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
import { alpha, useTheme } from '@/src/ui/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
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
import {
  AppointmentStatus,
  OpdAppointment,
  ProviderAvailability,
  ProviderSlot,
  VisitType,
} from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { getPatientByMrn, GLOBAL_PATIENTS, GlobalPatient } from '@/src/mocks/global-patients';
import { useUser } from '@/src/core/auth/UserContext';
import { useAppDispatch } from '@/src/store/hooks';
import { addAppointment, addEncounter, updateAppointment } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import { getOpdRoleFlowProfile } from './opd-role-flow';

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
  Cancelled: 'error',
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

const rangesOverlap = (start: number, end: number, otherStart: number, otherEnd: number) =>
  start < otherEnd && end > otherStart;

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

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

const calendarMinTime = '00:00:00';
const calendarMaxTime = '24:00:00';
const defaultDepartment = 'General Medicine';
type SlotCheckTone = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
type SlotCheckResult = { status: string; available: boolean; tone: SlotCheckTone; message: string };

function buildDefaultBooking(
  providers: string[],
  slotTimes: string[],
  defaultDate: string
): BookingForm {
  return {
    date: defaultDate,
    time: slotTimes[0] ?? '09:00',
    provider: providers[0] ?? '',
    department: defaultDepartment,
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
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { role } = useUser();
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mrnParam = useMrnParam();
  const statsPillSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1.1,
    py: 0.45,
    borderRadius: 999,
    border: '1px solid',
    borderColor: alpha(theme.palette.divider, 0.4),
    bgcolor: alpha(theme.palette.background.default, 0.6),
  };
  const statsLabelSx = {
    fontWeight: 600,
    color: theme.palette.primary.main,
    fontSize: '0.72rem',
    letterSpacing: '0.02em',
  };
  const statsCountSx = {
    width: 22,
    height: 22,
    borderRadius: '50%',
    bgcolor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: '0.7rem',
    display: 'grid',
    placeItems: 'center',
  };

  const dispatch = useAppDispatch();
  const {
    appointments,
    providerAvailability,
    providers,
    slotTimes,
    status: opdStatus,
    error: opdError,
  } = useOpdData();
  const [availability, setAvailability] = React.useState<ProviderAvailability[]>(providerAvailability);
  const [selectedDate, setSelectedDate] = React.useState(
    appointments[0]?.date ?? formatIsoDate(new Date())
  );
  const [directDate, setDirectDate] = React.useState(() => selectedDate);
  const [providerFilter, setProviderFilter] = React.useState<'All' | string>('All');
  const [directDepartment, setDirectDepartment] = React.useState(defaultDepartment);
  const [directProvider, setDirectProvider] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<BookingForm>(() =>
    buildDefaultBooking(providers, slotTimes, appointments[0]?.date ?? formatIsoDate(new Date()))
  );
  const [errors, setErrors] = React.useState<BookingErrors>({});
  const [selectedPatientOption, setSelectedPatientOption] = React.useState<GlobalPatient | null>(null);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<OpdAppointment | null>(null);
  const [slotLocked, setSlotLocked] = React.useState(false);
  const [calendarView, setCalendarView] = React.useState<CalendarView>('timeGridWeek');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  const [selectedEvent, setSelectedEvent] = React.useState<OpdAppointment | null>(null);
  const [eventAnchor, setEventAnchor] = React.useState<HTMLElement | null>(null);
  const [calendarRange, setCalendarRange] = React.useState<{ start: Date; end: Date } | null>(
    null
  );
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canManageCalendar = roleProfile.capabilities.canManageCalendar;
  const slotDurationMinutes = React.useMemo(
    () => getSlotDurationMinutes(slotTimes),
    [slotTimes]
  );

  const guardCalendarAction = React.useCallback(
    (actionLabel: string): boolean => {
      if (canManageCalendar) return true;
      setSnackbar({
        open: true,
        message: `${roleProfile.label} has read-only calendar access. ${actionLabel} is restricted.`,
        severity: 'warning',
      });
      return false;
    },
    [canManageCalendar, roleProfile.label]
  );

  React.useEffect(() => {
    if (providerAvailability.length > 0) {
      setAvailability(providerAvailability);
    }
  }, [providerAvailability]);

  React.useEffect(() => {
    if (!providers.length || !slotTimes.length) return;
    setBooking((prev) => ({
      ...prev,
      provider: prev.provider || providers[0],
      time: prev.time || slotTimes[0],
    }));
  }, [providers, slotTimes]);

  React.useEffect(() => {
    const container = calendarContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    let frame: number | null = null;

    const handleResize = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        calendarRef.current?.getApi().updateSize();
      });
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      observer.disconnect();
    };
  }, []);

  const seededPatient = React.useMemo(
    () => getPatientByMrn(booking.mrn || mrnParam),
    [booking.mrn, mrnParam]
  );
  const activePatient = selectedPatientOption ?? seededPatient ?? null;
  const patientName = booking.patientName || seededPatient?.name;
  const patientMrn = booking.mrn || seededPatient?.mrn || mrnParam;
  const patientSummary = {
    name: booking.patientName || activePatient?.name || '',
    mrn: booking.mrn || activePatient?.mrn || mrnParam || '',
    ageGender: booking.ageGender || activePatient?.ageGender || '',
    phone: booking.phone || activePatient?.phone || '',
    department: booking.department || activePatient?.department || directDepartment || '',
  };

  const departmentOptions = React.useMemo(() => {
    const departments = new Set<string>();
    appointments.forEach((appointment) => departments.add(appointment.department));
    if (seededPatient?.department) {
      departments.add(seededPatient.department);
    }
    return Array.from(departments).sort((a, b) => a.localeCompare(b));
  }, [appointments, seededPatient?.department]);

  const providersByDepartment = React.useMemo(() => {
    const map = new Map<string, string[]>();
    appointments.forEach((appointment) => {
      const current = map.get(appointment.department) ?? [];
      if (!current.includes(appointment.provider)) {
        current.push(appointment.provider);
      }
      map.set(appointment.department, current);
    });
    departmentOptions.forEach((department) => {
      if (!map.has(department)) {
        map.set(department, []);
      }
    });
    map.forEach((list) => list.sort((a, b) => a.localeCompare(b)));
    return map;
  }, [appointments, departmentOptions]);

  const providerDepartmentMap = React.useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((appointment) => {
      if (!map.has(appointment.provider)) {
        map.set(appointment.provider, appointment.department);
      }
    });
    return map;
  }, [appointments]);

  const directProviderOptions = React.useMemo(() => {
    if (!directDepartment) {
      return providers;
    }
    const list = providersByDepartment.get(directDepartment) ?? [];
    return list.length ? list : providers;
  }, [directDepartment, providers, providersByDepartment]);

  const directAvailability = React.useMemo(() => {
    if (!directProvider) return null;
    return (
      availability.find(
        (entry) => entry.provider === directProvider && entry.date === directDate
      ) ?? null
    );
  }, [availability, directDate, directProvider]);

  const directSlots = React.useMemo(() => {
    if (!directAvailability) return [];
    return [...directAvailability.slots].sort((a, b) => a.time.localeCompare(b.time));
  }, [directAvailability]);

  const availableSlotCount = React.useMemo(
    () => directSlots.filter((slot) => slot.status === 'Available').length,
    [directSlots]
  );

  const availabilityProvider =
    directProvider || (providerFilter !== 'All' ? providerFilter : null);

  const appointmentStats = React.useMemo(() => {
    const date = directDate;
    let checkedIn = 0;
    let inTriageConsult = 0;
    let noShow = 0;

    appointments.forEach((appointment) => {
      if (appointment.date !== date) return;
      if (directDepartment && appointment.department !== directDepartment) return;
      if (directProvider && appointment.provider !== directProvider) return;

      if (appointment.status === 'Checked-In') {
        checkedIn += 1;
      } else if (appointment.status === 'In Triage' || appointment.status === 'In Consultation') {
        inTriageConsult += 1;
      } else if (appointment.status === 'No Show') {
        noShow += 1;
      }
    });

    return { checkedIn, inTriageConsult, noShow };
  }, [appointments, directDate, directDepartment, directProvider]);


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

  const hasOverlappingAppointment = React.useCallback(
    (date: string, time: string, excludeId?: string) => {
      const startMinutes = toMinutes(time);
      const endMinutes = startMinutes + slotDurationMinutes;
      return appointments.some((appointment) => {
        if (appointment.date !== date) return false;
        if (appointment.status === 'Cancelled') return false;
        if (excludeId && appointment.id === excludeId) return false;
        const apptStart = toMinutes(appointment.time);
        const apptEnd = apptStart + slotDurationMinutes;
        return rangesOverlap(startMinutes, endMinutes, apptStart, apptEnd);
      });
    },
    [appointments, slotDurationMinutes]
  );

  const getSlotCheck = React.useCallback(
    (provider: string, date: string, time: string, editTarget?: OpdAppointment | null): SlotCheckResult => {
      if (!provider || !date || !time) {
        return { status: 'Select time', available: false, tone: 'info' as const, message: '' };
      }

      if (hasOverlappingAppointment(date, time, editTarget?.id)) {
        return {
          status: 'Overlap',
          available: false,
          tone: 'error' as const,
          message: 'Conflicts with another appointment.',
        };
      }

      const slot = getSlotForSelection(provider, date, time);
      const isSameSlot = Boolean(
        editTarget &&
          provider === editTarget.provider &&
          date === editTarget.date &&
          time === editTarget.time
      );

      if (!slot || slot.status === 'Available') {
        return { status: 'Available', available: true, tone: 'success' as const, message: '' };
      }

      if (isSameSlot) {
        return { status: slot.status, available: true, tone: 'info' as const, message: '' };
      }

      const tone: SlotCheckTone = slot.status === 'Booked' ? 'error' : 'warning';
      return { status: slot.status, available: false, tone, message: `Slot is ${slot.status.toLowerCase()}.` };
    },
    [getSlotForSelection, hasOverlappingAppointment]
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

  const markSlotAvailable = React.useCallback((provider: string, date: string, time: string) => {
    setAvailability((prev) => {
      let foundEntry = false;
      const next: ProviderAvailability[] = prev.map((entry) => {
        if (entry.provider !== provider || entry.date !== date) return entry;
        foundEntry = true;
        const slotExists = entry.slots.some((slot) => slot.time === time);
        if (!slotExists) {
          return {
            ...entry,
            slots: [...entry.slots, { time, status: 'Available' as const }],
          };
        }
        return {
          ...entry,
          slots: entry.slots.map((slot) =>
            slot.time === time ? { ...slot, status: 'Available' as const } : slot
          ),
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

  const handleSelectPatient = (patient: GlobalPatient | null) => {
    setSelectedPatientOption(patient);
    if (!patient) return;
    updateBookingField('patientName', patient.name);
    updateBookingField('mrn', patient.mrn);
    updateBookingField('ageGender', patient.ageGender);
    updateBookingField('phone', patient.phone);
    updateBookingField('department', patient.department);
    setDirectDepartment(patient.department);
  };

  const handleDirectSlotPick = React.useCallback(
    (slot: ProviderSlot, overrides?: { provider?: string; date?: string; department?: string }) => {
      if (!guardCalendarAction('Booking workflow')) return;
      if (slot.status !== 'Available') return;
      const selectedProvider = overrides?.provider ?? directProvider;
      const selectedDate = overrides?.date ?? directDate;
      const selectedDepartment = overrides?.department ?? directDepartment;
      if (!selectedProvider || !selectedDepartment) {
        setSnackbar({
          open: true,
          message: 'Select a department and doctor before choosing a slot.',
          severity: 'info',
        });
        return;
      }
      if (hasOverlappingAppointment(selectedDate, slot.time)) {
        setSnackbar({
          open: true,
          message: 'This slot overlaps another appointment.',
          severity: 'info',
        });
        return;
      }
      setDirectProvider(selectedProvider);
      setDirectDate(selectedDate);
      setDirectDepartment(selectedDepartment);
      setProviderFilter(selectedProvider);
      ensureAvailabilitySlot(selectedProvider, selectedDate, slot.time);
      updateBookingField('date', selectedDate);
      updateBookingField('time', slot.time);
      updateBookingField('provider', selectedProvider);
      updateBookingField('department', selectedDepartment);
      setEditingAppointment(null);
      setSlotLocked(true);
      setBookingOpen(true);
    },
    [
      directDate,
      directDepartment,
      directProvider,
      ensureAvailabilitySlot,
      guardCalendarAction,
      hasOverlappingAppointment,
      updateBookingField,
    ]
  );

  const handleDateClick = React.useCallback(
    (arg: DateClickArg) => {
      const calendarApi = calendarRef.current?.getApi();
      const clickedDate = formatIsoDate(arg.date);

      if (arg.view.type === 'dayGridMonth') {
        calendarApi?.changeView('timeGridDay', clickedDate);
        setCalendarView('timeGridDay');
        setSelectedDate(clickedDate);
        setDirectDate(clickedDate);
        return;
      }

      if (!canManageCalendar) {
        guardCalendarAction('Slot selection');
        return;
      }

      const clickedTime = formatTime(arg.date);
      const provider = availabilityProvider || (providerFilter === 'All' ? booking.provider : providerFilter);
      const slot = getSlotForSelection(provider, clickedDate, clickedTime);

      if (hasOverlappingAppointment(clickedDate, clickedTime)) {
        setSnackbar({
          open: true,
          message: 'This time overlaps another appointment.',
          severity: 'info',
        });
        return;
      }

      if (availabilityProvider) {
        if (!slot || slot.status !== 'Available') {
          setSnackbar({
            open: true,
            message: 'Please choose an available slot from the calendar.',
            severity: 'info',
          });
          return;
        }
        handleDirectSlotPick(slot, {
          provider: availabilityProvider,
          date: clickedDate,
          department:
            providerDepartmentMap.get(availabilityProvider) ||
            directDepartment ||
            booking.department,
        });
        return;
      }

      if (slot && slot.status !== 'Available') {
        setSnackbar({
          open: true,
          message: `${slot.time} is ${slot.status.toLowerCase()}. Choose another slot.`,
          severity: 'info',
        });
        return;
      }

      setSelectedDate(clickedDate);
      setDirectDate(clickedDate);
      setBooking((prev) => ({
        ...prev,
        date: clickedDate,
        time: clickedTime,
        provider,
      }));
      setEditingAppointment(null);
      setSlotLocked(true);
      setBookingOpen(true);
    },
    [
      availabilityProvider,
      booking.department,
      booking.provider,
      directDepartment,
      getSlotForSelection,
      handleDirectSlotPick,
      hasOverlappingAppointment,
      providerDepartmentMap,
      providerFilter,
      canManageCalendar,
      guardCalendarAction,
    ]
  );

  const handleEventClick = React.useCallback((arg: EventClickArg) => {
    const extended = arg.event.extendedProps as {
      kind?: string;
      appointment?: OpdAppointment;
      slot?: ProviderSlot;
      provider?: string;
      date?: string;
      department?: string;
    };

    if (extended.kind === 'availability' && extended.slot && extended.provider && extended.date) {
      setSelectedEvent(null);
      setEventAnchor(null);
      handleDirectSlotPick(extended.slot, {
        provider: extended.provider,
        date: extended.date,
        department: extended.department,
      });
      return;
    }

    if (!extended.appointment) return;
    setSelectedEvent(extended.appointment);
    setEventAnchor(arg.el);
  }, [handleDirectSlotPick]);

  const handleDatesSet = React.useCallback((arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCalendarView(arg.view.type as CalendarView);
    setCalendarRange({ start: arg.start, end: arg.end });
    if (arg.view.type === 'dayGridMonth') {
      setSelectedDate(formatIsoDate(arg.view.currentStart));
      return;
    }
    setSelectedDate(formatIsoDate(arg.start));
    if (arg.view.type === 'timeGridDay') {
      setDirectDate(formatIsoDate(arg.start));
    }
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

  React.useEffect(() => {
    if (!directDepartment) return;
    setBooking((prev) => ({
      ...prev,
      department: directDepartment,
    }));
  }, [directDepartment]);

  React.useEffect(() => {
    if (!directProvider) return;
    setBooking((prev) => ({
      ...prev,
      provider: directProvider,
    }));
  }, [directProvider]);

  React.useEffect(() => {
    if (!directDepartment) return;
    const options = directProviderOptions;
    if (directProvider && options.includes(directProvider)) return;
    if (options.length === 1) {
      setDirectProvider(options[0]);
    } else {
      setDirectProvider(null);
    }
  }, [directDepartment, directProvider, directProviderOptions]);

  const handleDirectDepartmentChange = (value: string) => {
    setDirectDepartment(value);
    updateBookingField('department', value);
    setDirectProvider(null);
    setProviderFilter('All');
  };

  const handleDirectProviderChange = (value: string | null) => {
    setDirectProvider(value);
    if (value) {
      updateBookingField('provider', value);
      setProviderFilter(value);
    } else {
      setProviderFilter('All');
    }
  };

  const handleDirectDateChange = (value: string) => {
    if (!value) return;
    setDirectDate(value);
    setSelectedDate(value);
    updateBookingField('date', value);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(value);
    }
  };

  const handleMiniCalendarChange = (value: Dayjs | null) => {
    if (!value) return;
    const nextDate = value.format('YYYY-MM-DD');
    handleDirectDateChange(nextDate);
  };

  const flowMrn = booking.mrn || mrnParam;
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  const slotCheck = React.useMemo(
    () => getSlotCheck(booking.provider, booking.date, booking.time, editingAppointment),
    [booking.provider, booking.date, booking.time, editingAppointment, getSlotCheck]
  );

  const openEditBooking = React.useCallback(
    (appointment: OpdAppointment) => {
      if (!guardCalendarAction('Reschedule')) return;
      setEditingAppointment(appointment);
      setSlotLocked(false);
      setErrors({});
      setSelectedPatientOption(getPatientByMrn(appointment.mrn) ?? null);
      setBooking({
        date: appointment.date,
        time: appointment.time,
        provider: appointment.provider,
        department: appointment.department,
        patientName: appointment.patientName,
        mrn: appointment.mrn,
        ageGender: appointment.ageGender,
        phone: appointment.phone,
        visitType: appointment.visitType,
        payerType: appointment.payerType,
        chiefComplaint: appointment.chiefComplaint,
      });
      setDirectDepartment(appointment.department);
      setDirectProvider(appointment.provider);
      setDirectDate(appointment.date);
      setProviderFilter(appointment.provider);
      setSelectedDate(appointment.date);
      calendarRef.current?.getApi().gotoDate(appointment.date);
      setBookingOpen(true);
      setSelectedEvent(null);
      setEventAnchor(null);
    },
    [guardCalendarAction]
  );

  const closeBooking = React.useCallback(() => {
    setBookingOpen(false);
    setEditingAppointment(null);
    setErrors({});
    setSlotLocked(false);
  }, []);

  const [dateParamApplied, setDateParamApplied] = React.useState(false);
  React.useEffect(() => {
    const dateParam = searchParams.get('date');
    if (!dateParam || dateParamApplied) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return;
    handleDirectDateChange(dateParam);
    const timeParam = searchParams.get('time');
    if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
      window.requestAnimationFrame(() => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && typeof calendarApi.scrollToTime === 'function') {
          calendarApi.scrollToTime(`${timeParam}:00`);
        }
      });
    }
    setDateParamApplied(true);
  }, [dateParamApplied, handleDirectDateChange, searchParams]);

  const [appointmentParamApplied, setAppointmentParamApplied] = React.useState(false);
  React.useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    if (!appointmentId || appointmentParamApplied) return;
    const target = appointments.find((appointment) => appointment.id === appointmentId);
    if (!target) return;

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', target.date);
      calendarApi.gotoDate(target.date);
      if (typeof calendarApi.scrollToTime === 'function') {
        calendarApi.scrollToTime(`${target.time}:00`);
      }
    }
    openEditBooking(target);
    setAppointmentParamApplied(true);
  }, [appointmentParamApplied, appointments, openEditBooking, searchParams]);

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
      setDirectDepartment((prev) => prev || match.department);
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
    if (!guardCalendarAction('Create booking')) return;
    const valid = validateBooking();
    if (!valid) {
      setSnackbar({
        open: true,
        message: 'Please complete all required booking fields.',
        severity: 'error',
      });
      return;
    }

    const slotCheckResult = getSlotCheck(booking.provider, booking.date, booking.time, null);
    if (!slotCheckResult.available) {
      setSnackbar({
        open: true,
        message: slotCheckResult.message || 'Selected slot is not available.',
        severity: 'error',
      });
      return;
    }

    const slot = getSlotForSelection(booking.provider, booking.date, booking.time);
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

    dispatch(addAppointment(created));
    markSlotBooked(created.provider, created.date, created.time);
    closeBooking();

    setSnackbar({
      open: true,
      message: sendToQueue
        ? `Booking created and sent to queue for ${created.patientName}.`
        : `Booking created for ${created.patientName}.`,
      severity: 'success',
    });

    if (sendToQueue) {
      dispatch(
        addEncounter({
          id: `enc-${Date.now()}`,
          patientId: created.mrn,
          appointmentId: created.id,
          patientName: created.patientName,
          mrn: created.mrn,
          ageGender: created.ageGender,
          doctor: created.provider,
          department: created.department,
          status: 'ARRIVED',
          queuePriority: 'Routine',
          appointmentTime: created.time,
          chiefComplaint: created.chiefComplaint,
          triageNote: 'Sent from calendar to OPD queue.',
          allergies: ['No known allergies'],
          problems: [],
          notes: [],
          orders: [],
          prescriptions: [],
          vitals: {
            bp: '',
            hr: '',
            rr: '',
            temp: '',
            spo2: '',
            weightKg: '',
            bmi: '',
          },
        })
      );
      router.push(withMrn('/appointments/queue'));
    }

    setBooking((prev) => ({
      ...buildDefaultBooking(providers, slotTimes, prev.date),
      date: prev.date,
      provider: prev.provider,
      department: prev.department,
    }));
  };

  const handleUpdateBooking = () => {
    if (!guardCalendarAction('Update booking')) return;
    if (!editingAppointment) return;
    const valid = validateBooking();
    if (!valid) {
      setSnackbar({
        open: true,
        message: 'Please complete all required booking fields.',
        severity: 'error',
      });
      return;
    }

    const slotCheckResult = getSlotCheck(
      booking.provider,
      booking.date,
      booking.time,
      editingAppointment
    );
    if (!slotCheckResult.available) {
      setSnackbar({
        open: true,
        message: slotCheckResult.message || 'Selected slot is not available.',
        severity: 'error',
      });
      return;
    }

    const old = editingAppointment;
    const changedSlot =
      old.provider !== booking.provider || old.date !== booking.date || old.time !== booking.time;

    if (changedSlot) {
      if (!hasOverlappingAppointment(old.date, old.time, old.id)) {
        markSlotAvailable(old.provider, old.date, old.time);
      }
      const slot = getSlotForSelection(booking.provider, booking.date, booking.time);
      if (!slot) {
        ensureAvailabilitySlot(booking.provider, booking.date, booking.time);
      }
      markSlotBooked(booking.provider, booking.date, booking.time);
    }

    dispatch(
      updateAppointment({
        id: old.id,
        changes: {
          date: booking.date,
          time: booking.time,
          provider: booking.provider,
          department: booking.department,
          patientName: booking.patientName,
          mrn: booking.mrn,
          ageGender: booking.ageGender,
          visitType: booking.visitType,
          status: old.status,
          chiefComplaint: booking.chiefComplaint,
          payerType: booking.payerType,
          phone: booking.phone,
        },
      })
    );

    setSnackbar({
      open: true,
      message: `Appointment rescheduled for ${booking.patientName}.`,
      severity: 'success',
    });

    closeBooking();
  };

  const appointmentEvents = React.useMemo<EventInput[]>(
    () => {
      const filtered = appointments.filter(
        (appointment) =>
          (providerFilter === 'All' || appointment.provider === providerFilter) &&
          appointment.status !== 'Cancelled'
      );

      const sorted = [...filtered].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        const timeDiff = toMinutes(a.time) - toMinutes(b.time);
        if (timeDiff !== 0) return timeDiff;
        return a.id.localeCompare(b.id);
      });

      const intervalsByDate = new Map<string, Array<[number, number]>>();
      const nonOverlapping = sorted.filter((appointment) => {
        const startMinutes = toMinutes(appointment.time);
        const endMinutes = startMinutes + slotDurationMinutes;
        const intervals = intervalsByDate.get(appointment.date) ?? [];
        if (intervals.some(([start, end]) => rangesOverlap(startMinutes, endMinutes, start, end))) {
          return false;
        }
        intervals.push([startMinutes, endMinutes]);
        intervalsByDate.set(appointment.date, intervals);
        return true;
      });

      return nonOverlapping.map((appointment) => ({
        id: appointment.id,
        title: appointment.patientName,
        start: `${appointment.date}T${appointment.time}:00`,
        end: `${appointment.date}T${addMinutesToTime(appointment.time, slotDurationMinutes)}:00`,
        classNames:
          selectedEvent && selectedEvent.id === appointment.id ? ['fc-event-selected'] : [],
        extendedProps: { kind: 'appointment', appointment },
      }));
    },
    [appointments, providerFilter, selectedEvent, slotDurationMinutes]
  );

  const availabilityEvents = React.useMemo<EventInput[]>(() => {
    if (!availabilityProvider || !calendarRange || calendarView === 'dayGridMonth') return [];
    const start = calendarRange.start;
    const end = calendarRange.end;

    return availability
      .filter((entry) => entry.provider === availabilityProvider)
      .filter((entry) => {
        const dateValue = new Date(`${entry.date}T00:00:00`);
        return dateValue >= start && dateValue < end;
      })
      .flatMap((entry) =>
        entry.slots
          .filter((slot) => slot.status === 'Available')
          .filter((slot) => {
            return !hasOverlappingAppointment(entry.date, slot.time);
          })
          .map((slot) => ({
            id: `avail-${availabilityProvider}-${entry.date}-${slot.time}`,
            title: 'Available',
            start: `${entry.date}T${slot.time}:00`,
            end: `${entry.date}T${addMinutesToTime(slot.time, slotDurationMinutes)}:00`,
            classNames: ['fc-availability-event'],
            extendedProps: {
              kind: 'availability',
              slot,
              provider: availabilityProvider,
              date: entry.date,
              department:
                providerDepartmentMap.get(availabilityProvider) ||
                directDepartment ||
                booking.department,
            },
          }))
      );
  }, [
    availabilityProvider,
    calendarRange,
    calendarView,
    availability,
    slotDurationMinutes,
    hasOverlappingAppointment,
    providerDepartmentMap,
    directDepartment,
    booking.department,
  ]);

  const events = React.useMemo<EventInput[]>(
    () => [...appointmentEvents, ...availabilityEvents],
    [appointmentEvents, availabilityEvents]
  );

  const renderEventContent = React.useCallback(
    (arg: EventContentArg) => {
      const kind = (arg.event.extendedProps as { kind?: string }).kind;
      if (kind === 'availability') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              {arg.timeText}
            </span>
          </div>
        );
      }

      const appointment = (arg.event.extendedProps as { appointment?: OpdAppointment }).appointment;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {arg.timeText}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.1, wordBreak: 'break-word' }}>
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
    if (!guardCalendarAction('Create booking')) return;
    setEditingAppointment(null);
    setSlotLocked(false);
    setBooking((prev) => ({
      ...prev,
      date: selectedDate,
      time: prev.time || slotTimes[0],
      provider: providerFilter === 'All' ? prev.provider : providerFilter,
    }));
    setBookingOpen(true);
  }, [guardCalendarAction, providerFilter, selectedDate, slotTimes]);

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
    <PageTemplate title="Appointments Calendar" currentPageTitle="Calendar">
      <Stack spacing={2}>
        {!canManageCalendar ? (
          <Alert severity="info">
            {roleProfile.label} view is read-only for calendar booking. Use queue for consultation actions.
          </Alert>
        ) : null}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 3, border: 'none', boxShadow: 'none', overflow: 'hidden' }}
            >
              <Stack spacing={1}>
                <Stack
                  spacing={1.2}
                  sx={{
                    p: 1.5,
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
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" sx={{ flexShrink: 0 }}>
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
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-start', md: 'center' },
                        overflowX: 'auto',
                        py: 0.25,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          flexWrap: 'nowrap',
                          '& > *': { flexShrink: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            ...statsPillSx,
                            px: 1.4,
                            py: 0.55,
                            borderColor: alpha(theme.palette.primary.main, 0.25),
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                          }}
                        >
                          <Typography variant="caption" sx={statsLabelSx}>
                            Slots on {directDate}
                          </Typography>
                          <Box sx={statsCountSx}>{availableSlotCount}</Box>
                        </Box>
                        <Box
                          sx={{
                            ...statsPillSx,
                            px: 1.4,
                            py: 0.55,
                            borderColor: alpha(theme.palette.primary.main, 0.25),
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                          }}
                        >
                          <Typography variant="caption" sx={statsLabelSx}>
                            Checked-In
                          </Typography>
                          <Box sx={statsCountSx}>{appointmentStats.checkedIn}</Box>
                        </Box>
                        <Box
                          sx={{
                            ...statsPillSx,
                            px: 1.4,
                            py: 0.55,
                            borderColor: alpha(theme.palette.primary.main, 0.25),
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                          }}
                        >
                          <Typography variant="caption" sx={statsLabelSx}>
                            In Triage / Consult
                          </Typography>
                          <Box sx={statsCountSx}>{appointmentStats.inTriageConsult}</Box>
                        </Box>
                        <Box
                          sx={{
                            ...statsPillSx,
                            px: 1.4,
                            py: 0.55,
                            borderColor: alpha(theme.palette.primary.main, 0.25),
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                          }}
                        >
                          <Typography variant="caption" sx={statsLabelSx}>
                            No Show
                          </Typography>
                          <Box sx={statsCountSx}>{appointmentStats.noShow}</Box>
                        </Box>
                      </Stack>
                    </Box>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'stretch', md: 'center' }}
                      sx={{ flexShrink: 0 }}
                    >
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
                      <Button size="small" variant="contained" disabled={!canManageCalendar} onClick={handleNewBooking}>
                        New Booking
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
                    gap: 2,
                    alignItems: 'stretch',
                  }}
                >
                  <Box
                    ref={calendarContainerRef}
                    sx={{
                      borderTop: 'none',
                      bgcolor: 'background.paper',
                      height: { xs: '70vh', md: '78vh' },
                      minWidth: 0,
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
                        padding: '3px 6px',
                        boxShadow: 'none',
                      },
                      '& .fc-timegrid-event': {
                        minHeight: 34,
                      },
                      '& .fc-timegrid-event-harness, & .fc-timegrid-event-harness-inset': {
                        left: '2px !important',
                        right: '2px !important',
                      },
                      '& .fc-event-selected': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`,
                      },
                      '& .fc-event-main': {
                        color: theme.palette.text.primary,
                        fontSize: '0.85rem',
                        lineHeight: 1.3,
                        overflow: 'hidden',
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
                        height: 36,
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
                      allDaySlot={false}
                      dayMaxEvents
                      expandRows
                      stickyHeaderDates
                      stickyFooterScrollbar
                      slotEventOverlap={false}
                      eventOverlap={false}
                      eventMaxStack={2}
                      eventMinHeight={34}
                      eventShortHeight={34}
                      events={events}
                      dateClick={handleDateClick}
                      eventClick={handleEventClick}
                      datesSet={handleDatesSet}
                      dayHeaderContent={dayHeaderContent}
                      eventContent={renderEventContent}
                      eventDidMount={(info) => {
                        const kind = (info.event.extendedProps as { kind?: string }).kind;
                        if (kind === 'availability') {
                          info.el.style.backgroundColor = 'transparent';
                          info.el.style.border = `1px solid ${alpha(theme.palette.primary.main, 0.7)}`;
                          info.el.style.color = theme.palette.primary.main;
                          info.el.style.borderRadius = '10px';
                          info.el.style.boxShadow = 'none';
                          info.el.style.cursor = 'pointer';
                          return;
                        }

                        const appointment = (info.event.extendedProps as { appointment?: OpdAppointment })
                          .appointment;
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

                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: 'none',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      alignSelf: 'stretch',
                      height: '100%',
                    }}
                  >
                    <Stack spacing={1.5} sx={{ height: '100%' }}>
                      {patientName ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.2,
                            py: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: '0.8rem',
                              bgcolor: alpha(theme.palette.primary.main, 0.18),
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(patientName)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {patientName}
                            </Typography>
                            {patientMrn ? (
                              <Typography variant="caption" color="text.secondary">
                                MRN {patientMrn}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      ) : null}
                      {patientName ? <Divider /> : null}
                      <Stack
                        spacing={1.2}
                     
                      >
                        <TextField
                          size="small"
                          select
                          label="Department"
                          value={directDepartment}
                          onChange={(event) => handleDirectDepartmentChange(event.target.value)}
                          fullWidth
                        >
                          <MenuItem value="">Select department</MenuItem>
                          {departmentOptions.map((department) => (
                            <MenuItem key={department} value={department}>
                              {department}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                          value={directDate ? dayjs(directDate) : null}
                          onChange={handleMiniCalendarChange}
                          showDaysOutsideCurrentMonth
                          sx={{
                            height: 'auto',
                            minHeight: 0,
                            borderRadius: 0,
                            border: 'none',
                            backgroundColor: 'transparent',
                            p: 0,
                            alignSelf: 'stretch',
                            width: '100%',
                            maxWidth: '100%',
                            '& .MuiDateCalendar-viewTransitionContainer': {
                              minHeight: 0,
                            },
                            '& .MuiPickersCalendarHeader-root': {
                              px: 0,
                              mb: 0.5,
                              justifyContent: 'space-between',
                            },
                            '& .MuiPickersCalendarHeader-label': {
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            },
                            '& .MuiPickersArrowSwitcher-root .MuiIconButton-root': {
                              border: 'none',
                              bgcolor: 'transparent',
                              width: 26,
                              height: 26,
                            },
                            '& .MuiDayCalendar-header': {
                              mx: 0,
                              mb: 0.2,
                              justifyContent: 'space-between',
                            },
                            '& .MuiDayCalendar-root': {
                              minHeight: 0,
                            },
                            '& .MuiDayCalendar-weekContainer': {
                              margin: 0,
                              justifyContent: 'space-between',
                            },
                            '& .MuiDayCalendar-monthContainer': {
                              minHeight: 0,
                            },
                            '& .MuiDayCalendar-slideTransition': {
                              minHeight: 0,
                            },
                            '& .MuiDayCalendar-weekDayLabel': {
                              width: 24,
                              height: 24,
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: theme.palette.text.secondary,
                            },
                            '& .MuiPickersDay-root': {
                              width: 26,
                              height: 26,
                              margin: 0,
                              fontSize: '0.72rem',
                              borderRadius: 7,
                            },
                            '& .MuiPickersSlideTransition-root': {
                              minHeight: 132,
                            },
                            '& .MuiPickersDay-root.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: theme.palette.common.white,
                            },
                            '& .MuiPickersDay-root.MuiPickersDay-today': {
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <Divider />
                      <Stack
                        spacing={1.2}
                        
                      >
                        <Autocomplete
                          options={directProviderOptions}
                          value={directProvider}
                          onChange={(_, value) => handleDirectProviderChange(value)}
                          disabled={!directDepartment}
                          fullWidth
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Doctor"
                              placeholder={directDepartment ? 'Select doctor' : 'Choose department first'}
                            />
                          )}
                        />
                        <TextField
                          size="small"
                          label="Appointment Date"
                          value={directDate}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Stack>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <Typography
                          variant="caption"
                         
                          sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                        >
                          Availability
                        </Typography>
                        {directProvider ? (
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
                            {directAvailability?.location ? (
                              <Chip
                                label={`Unit: ${directAvailability.location}`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: alpha(theme.palette.primary.main, 0.35) }}
                              />
                            ) : null}
                            <Chip
                              label={`${availableSlotCount} slots available`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 700,
                                borderColor:
                                  availableSlotCount === 0
                                    ? alpha(theme.palette.error.main, 0.5)
                                    : availableSlotCount < 4
                                      ? alpha(theme.palette.warning.main, 0.6)
                                      : alpha(theme.palette.success.main, 0.6),
                                color:
                                  availableSlotCount === 0
                                    ? theme.palette.error.main
                                    : availableSlotCount < 4
                                      ? theme.palette.warning.main
                                      : theme.palette.success.main,
                              }}
                            />
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                            Choose a department and doctor to view available slots.
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }} />
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        

        <Drawer
          anchor="right"
          open={bookingOpen}
          onClose={closeBooking}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 520, md: 600 },
              p: 2,
            },
          }}
        >
          <Stack spacing={1.3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {editingAppointment ? 'Reschedule Appointment' : 'Create Booking'}
              </Typography>
              <IconButton size="small" onClick={closeBooking}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Autocomplete
              options={GLOBAL_PATIENTS}
              value={selectedPatientOption}
              onChange={(_, value) => handleSelectPatient(value)}
              getOptionLabel={(option) => `${option.name} (${option.mrn})`}
              disabled={Boolean(editingAppointment)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Search by MRN or name"
                />
              )}
            />

            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: '0.08em' }}
              >
                Patient Details
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    MRN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {patientSummary.mrn || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {patientSummary.name || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Age / Gender
                  </Typography>
                  <Typography variant="body2">{patientSummary.ageGender || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body2">{patientSummary.phone || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body2">{patientSummary.department || '—'}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={booking.date}
                  onChange={(event) => updateBookingField('date', event.target.value)}
                  disabled={slotLocked && !editingAppointment}
                  error={Boolean(errors.date) && !(slotLocked && !editingAppointment)}
                  helperText={
                    slotLocked && !editingAppointment
                      ? 'Choose another slot from the calendar to change.'
                      : errors.date
                  }
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
                  disabled={slotLocked && !editingAppointment}
                  error={Boolean(errors.time) && !(slotLocked && !editingAppointment)}
                  helperText={
                    slotLocked && !editingAppointment
                      ? 'Pick a different slot to change time.'
                      : errors.time
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Slot status
              </Typography>
              <Chip
                label={slotCheck.status}
                size="small"
                color={slotCheck.tone}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
              {slotCheck.message ? (
                <Typography variant="caption" color="text.secondary">
                  {slotCheck.message}
                </Typography>
              ) : null}
            </Stack>

            <TextField
              select
              label="Provider"
              value={booking.provider}
              onChange={(event) => updateBookingField('provider', event.target.value)}
              disabled={slotLocked && !editingAppointment}
              error={Boolean(errors.provider) && !(slotLocked && !editingAppointment)}
              helperText={
                slotLocked && !editingAppointment
                  ? 'Provider is locked to the selected slot.'
                  : errors.provider
              }
            >
              {providers.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Department"
              value={booking.department}
              disabled
              error={Boolean(errors.department)}
              helperText={errors.department}
            />

            <TextField
              label="Patient Name"
              value={booking.patientName}
              disabled
              error={Boolean(errors.patientName)}
              helperText={errors.patientName}
            />

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="MRN"
                  value={booking.mrn}
                  disabled
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
                  fullWidth
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
                  fullWidth
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

            {editingAppointment ? (
              <Stack direction="row" spacing={1.2}>
                <Button variant="outlined" onClick={closeBooking}>
                  Cancel
                </Button>
                <Button variant="contained" disabled={!canManageCalendar} onClick={handleUpdateBooking}>
                  Save Changes
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1.2}>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  disabled={!canManageCalendar}
                  onClick={() => handleCreateBooking(false)}
                >
                  Create Booking
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<GroupIcon />}
                  disabled={!canManageCalendar}
                  onClick={() => handleCreateBooking(true)}
                >
                  Create + Check-In
                </Button>
              </Stack>
            )}
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
              <Divider />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!canManageCalendar}
                  onClick={() => openEditBooking(selectedEvent)}
                >
                  Reschedule
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Popover>
      </Stack>
    </PageTemplate>
  );
}
