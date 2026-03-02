'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Popover,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  AccessTime as AccessTimeIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudQueueRounded as CloudQueueRoundedIcon,
  EventBusy as EventBusyIcon,
  HomeRounded as HomeRoundedIcon,
  LocalHospitalOutlined as LocalHospitalOutlinedIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon,
  NightsStayRounded as NightsStayRoundedIcon,
  VideocamOutlined as VideocamOutlinedIcon,
  WbSunnyRounded as WbSunnyRoundedIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { APPOINTMENTS, PATIENT } from './patient-portal-mock-data';
import type { Appointment } from './patient-portal-types';
import { useAppDispatch } from '@/src/store/hooks';
import { addAppointment, updateAppointment } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import type {
  AppointmentStatus,
  OpdAppointment,
  ProviderSlot,
  SlotStatus,
  VisitType,
} from '../opd/opd-mock-data';
import { ppSectionCard } from './patient-portal-styles';

type TabId = 'upcoming' | 'completed' | 'cancelled';
type BookingStep = 1 | 2 | 3 | 4;
type ConsultationType = 'video' | 'home' | 'clinic';
type CalendarView = 'timeGridWeek' | 'timeGridDay';

const BOOKING_STEPS: Array<{ id: BookingStep; label: string }> = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Doctor' },
  { id: 3, label: 'Slot' },
  { id: 4, label: 'Details' },
];

const DEFAULT_SLOT_TIMES = [
  '09:00',
  '09:20',
  '09:40',
  '10:00',
  '10:20',
  '10:40',
  '11:00',
  '11:20',
  '11:40',
  '12:00',
  '12:20',
  '12:40',
  '13:00',
  '14:00',
  '14:20',
  '14:40',
  '15:00',
  '15:20',
  '15:40',
  '16:00',
  '16:20',
  '16:40',
  '17:00',
  '17:20',
];

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

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatTimeLabel = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${`${m}`.padStart(2, '0')} ${period}`;
};

const formatTimeCompactLabel = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 || 12;
  return `${hour12}:${`${m}`.padStart(2, '0')}${period}`;
};

const formatSlotChipTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const hour12 = h % 12 || 12;
  return `${hour12}:${`${m}`.padStart(2, '0')}`;
};

const parseTimeLabelTo24Hour = (value: string) => {
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  const normalizedHour = period === 'PM' ? (hour % 12) + 12 : hour % 12;
  return `${`${normalizedHour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
};

const statusColor = (status: AppointmentStatus, palette: any) => {
  if (status === 'Completed') return palette.success.main;
  if (status === 'Checked-In') return palette.info.main;
  if (status === 'In Triage' || status === 'In Consultation') return palette.warning.main;
  if (status === 'No Show' || status === 'Cancelled') return palette.error.main;
  return palette.primary.main;
};

const consultationToPatientType: Record<ConsultationType, Appointment['type']> = {
  clinic: 'in-person',
  video: 'video',
  home: 'home-visit',
};

const consultationToVisitType: Record<ConsultationType, VisitType> = {
  clinic: 'New',
  video: 'Follow-up',
  home: 'Review',
};

const calendarMinTime = '00:00:00';
const calendarMaxTime = '24:00:00';

export default function PatientPortalAppointmentsPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const bookingSectionRef = React.useRef<HTMLDivElement | null>(null);
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);

  const [portalAppointments, setPortalAppointments] = React.useState<Appointment[]>(APPOINTMENTS);
  const [bookingStep, setBookingStep] = React.useState<BookingStep>(1);
  const [consultationType, setConsultationType] = React.useState<ConsultationType | null>(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(formatIsoDate(new Date()));
  const [selectedSlot, setSelectedSlot] = React.useState('');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  const [calendarView, setCalendarView] = React.useState<CalendarView>('timeGridWeek');
  const [phone, setPhone] = React.useState(PATIENT.phone);
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [homeAddress, setHomeAddress] = React.useState(PATIENT.address);
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] = React.useState<OpdAppointment | null>(null);
  const [eventAnchor, setEventAnchor] = React.useState<HTMLElement | null>(null);
  const [doctorSearch, setDoctorSearch] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState('All');
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    severity: 'success' | 'info' | 'warning' | 'error';
    message: string;
  }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const { appointments, providerAvailability, providers, slotTimes, status: opdStatus, error: opdError } = useOpdData();

  const sectionCard = ppSectionCard(theme);
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

  const normalizedSlotTimes = React.useMemo(() => {
    const source = slotTimes.length > 0 ? slotTimes : DEFAULT_SLOT_TIMES;
    return Array.from(new Set(source)).sort((a, b) => toMinutes(a) - toMinutes(b));
  }, [slotTimes]);

  const slotDurationMinutes = React.useMemo(() => {
    if (normalizedSlotTimes.length < 2) return 20;
    return Math.max(10, toMinutes(normalizedSlotTimes[1]) - toMinutes(normalizedSlotTimes[0]));
  }, [normalizedSlotTimes]);

  const allProviders = React.useMemo(() => {
    const set = new Set<string>();
    providers.forEach((provider) => set.add(provider));
    appointments.forEach((appointment) => set.add(appointment.provider));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [providers, appointments]);

  const providerMeta = React.useMemo(() => {
    const map = new Map<string, { department: string; location: string }>();

    appointments.forEach((appointment) => {
      if (!map.has(appointment.provider)) {
        map.set(appointment.provider, {
          department: appointment.department,
          location: 'Main OPD Wing',
        });
      }
    });

    providerAvailability.forEach((entry) => {
      const existing = map.get(entry.provider);
      map.set(entry.provider, {
        department: existing?.department ?? 'General Medicine',
        location: entry.location || existing?.location || 'Main OPD Wing',
      });
    });

    allProviders.forEach((provider) => {
      if (!map.has(provider)) {
        map.set(provider, { department: 'General Medicine', location: 'Main OPD Wing' });
      }
    });

    return map;
  }, [allProviders, appointments, providerAvailability]);

  const doctorOptions = React.useMemo(() => {
    return allProviders.map((provider) => {
      const meta = providerMeta.get(provider);
      return {
        name: provider,
        department: meta?.department ?? 'General Medicine',
        location: meta?.location ?? 'Main OPD Wing',
      };
    });
  }, [allProviders, providerMeta]);

  const specialtyOptions = React.useMemo(() => {
    const uniqueDepartments = new Set(doctorOptions.map((doctor) => doctor.department));
    return ['All', ...Array.from(uniqueDepartments).sort((a, b) => a.localeCompare(b))];
  }, [doctorOptions]);

  const filteredDoctorOptions = React.useMemo(() => {
    const normalizedQuery = doctorSearch.trim().toLowerCase();
    return doctorOptions.filter((doctor) => {
      if (specialtyFilter !== 'All' && doctor.department !== specialtyFilter) return false;
      if (!normalizedQuery) return true;
      return [doctor.name, doctor.department, doctor.location].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [doctorOptions, doctorSearch, specialtyFilter]);

  React.useEffect(() => {
    if (filteredDoctorOptions.length === 0) {
      if (selectedDoctor) {
        setSelectedDoctor('');
        setSelectedSlot('');
      }
      return;
    }

    if (!selectedDoctor || !filteredDoctorOptions.some((doctor) => doctor.name === selectedDoctor)) {
      setSelectedDoctor(filteredDoctorOptions[0].name);
      setSelectedSlot('');
    }
  }, [filteredDoctorOptions, selectedDoctor]);

  const getSlotsForProviderDate = React.useCallback(
    (provider: string, date: string): ProviderSlot[] => {
      if (!provider || !date) return [];
      const slotMap = new Map<string, SlotStatus>();
      normalizedSlotTimes.forEach((time) => slotMap.set(time, 'Available'));

      const availabilityEntry = providerAvailability.find(
        (entry) => entry.provider === provider && entry.date === date
      );
      availabilityEntry?.slots.forEach((slot) => slotMap.set(slot.time, slot.status));

      appointments
        .filter(
          (appointment) =>
            appointment.provider === provider &&
            appointment.date === date &&
            appointment.status !== 'Cancelled'
        )
        .forEach((appointment) => slotMap.set(appointment.time, 'Booked'));

      return Array.from(slotMap.entries())
        .map(([time, status]) => ({ time, status }))
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
    },
    [appointments, normalizedSlotTimes, providerAvailability]
  );

  const providerDaySlots = React.useMemo(
    () => getSlotsForProviderDate(selectedDoctor, selectedDate),
    [getSlotsForProviderDate, selectedDate, selectedDoctor]
  );

  const visibleProviderDaySlots = React.useMemo(() => {
    const todayIso = formatIsoDate(new Date());
    if (selectedDate !== todayIso) return providerDaySlots;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return providerDaySlots.filter((slot) => toMinutes(slot.time) > currentMinutes);
  }, [providerDaySlots, selectedDate]);

  React.useEffect(() => {
    if (!selectedSlot) return;
    const slot = visibleProviderDaySlots.find((entry) => entry.time === selectedSlot);
    if (!slot || slot.status !== 'Available') {
      setSelectedSlot('');
    }
  }, [visibleProviderDaySlots, selectedSlot]);

  const availableSlotCount = React.useMemo(
    () => visibleProviderDaySlots.filter((slot) => slot.status === 'Available').length,
    [visibleProviderDaySlots]
  );

  const groupedSlots = React.useMemo(() => {
    const morning: ProviderSlot[] = [];
    const afternoon: ProviderSlot[] = [];
    const evening: ProviderSlot[] = [];

    visibleProviderDaySlots.forEach((slot) => {
      const minutes = toMinutes(slot.time);
      if (minutes < 12 * 60) {
        morning.push(slot);
      } else if (minutes < 17 * 60) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [visibleProviderDaySlots]);

  const selectedDoctorMeta =
    doctorOptions.find((doctor) => doctor.name === selectedDoctor) ?? null;

  const calendarEvents = React.useMemo<EventInput[]>(() => {
    return appointments
      .filter((appointment) => appointment.status !== 'Cancelled')
      .filter((appointment) => (selectedDoctor ? appointment.provider === selectedDoctor : true))
      .map((appointment) => ({
        id: appointment.id,
        title: appointment.patientName,
        start: `${appointment.date}T${appointment.time}:00`,
        end: `${appointment.date}T${addMinutesToTime(appointment.time, slotDurationMinutes)}:00`,
        extendedProps: {
          status: appointment.status as AppointmentStatus,
          appointment,
        },
      }));
  }, [appointments, selectedDoctor, slotDurationMinutes]);

  const upcomingPreview = React.useMemo(() => {
    const toTimestamp = (appointment: Appointment) => {
      const time24 = parseTimeLabelTo24Hour(appointment.time);
      return new Date(`${appointment.date}T${time24}:00`).getTime();
    };
    return portalAppointments
      .filter((appointment) => appointment.status === 'upcoming')
      .sort((a, b) => toTimestamp(a) - toTimestamp(b))
      .slice(0, 3);
  }, [portalAppointments]);

  const handleDateClick = React.useCallback(
    (arg: DateClickArg) => {
      const clickedDate = formatIsoDate(arg.date);
      setSelectedDate(clickedDate);
      if (bookingStep < 3) {
        setBookingStep(3);
      }

      if (selectedDoctor) {
        const clickedTime = formatTime(arg.date);
        const clickedSlot = getSlotsForProviderDate(selectedDoctor, clickedDate).find(
          (slot) => slot.time === clickedTime
        );
        const todayIso = formatIsoDate(new Date());
        const isPastTimeToday =
          clickedDate === todayIso &&
          toMinutes(clickedTime) <= (() => {
            const now = new Date();
            return now.getHours() * 60 + now.getMinutes();
          })();
        if (clickedSlot?.status === 'Available' && !isPastTimeToday) {
          setSelectedSlot(clickedTime);
        }
      }
    },
    [bookingStep, getSlotsForProviderDate, selectedDoctor]
  );

  const handleDatesSet = React.useCallback((arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCalendarView(arg.view.type as CalendarView);
  }, []);

  const handleMiniCalendarChange = React.useCallback((value: Dayjs | null) => {
    if (!value) return;
    const nextDate = value.format('YYYY-MM-DD');
    setSelectedDate(nextDate);
    setSelectedSlot('');
  }, []);

  const dayHeaderContent = React.useCallback((arg: { date: Date; view: { type: string } }) => {
    const dayName = arg.date
      .toLocaleDateString(undefined, { weekday: 'short' })
      .toUpperCase();
    const dayNum = arg.date.getDate();
    const today = isSameDate(arg.date, new Date());
    return {
      html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${dayName}</div><div class="fc-scanbo-daynum${today ? ' is-today' : ''}">${dayNum}</div></div>`,
    };
  }, []);

  React.useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    calendarApi.gotoDate(selectedDate);
  }, [selectedDate]);

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

  const jumpToBooking = React.useCallback(() => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  React.useEffect(() => {
    const focus = searchParams.get('focus');
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setSelectedDate(dateParam);
    }
    if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
      setSelectedSlot(timeParam);
      setBookingStep((prev) => (prev < 3 ? 3 : prev));
    }
    if (focus === 'booking') {
      window.requestAnimationFrame(() => {
        jumpToBooking();
      });
    }
  }, [jumpToBooking, searchParams]);

  const openBookingFromAppointment = React.useCallback(
    (appointment: Appointment) => {
      const inferredType: ConsultationType =
        appointment.type === 'video'
          ? 'video'
          : appointment.type === 'home-visit'
            ? 'home'
            : 'clinic';
      setConsultationType(inferredType);

      const matchingDoctor =
        doctorOptions.find((doctor) => doctor.name === appointment.doctorName) ??
        doctorOptions.find((doctor) => doctor.department === appointment.department);

      if (matchingDoctor) {
        setSelectedDoctor(matchingDoctor.name);
      }

      setSelectedDate(appointment.date);
      setSelectedSlot(parseTimeLabelTo24Hour(appointment.time));
      setReason(appointment.department);
      setBookingStep(3);
      jumpToBooking();
    },
    [doctorOptions, jumpToBooking]
  );

  const handleCalendarEventClick = React.useCallback((arg: EventClickArg) => {
    const appointment = (arg.event.extendedProps as { appointment?: OpdAppointment }).appointment;
    if (!appointment) return;
    setSelectedCalendarAppointment(appointment);
    setEventAnchor(arg.el as HTMLElement);
  }, []);

  const handleRescheduleFromCalendar = React.useCallback(() => {
    if (!selectedCalendarAppointment) return;

    setConsultationType('clinic');
    const matchingDoctor =
      doctorOptions.find((doctor) => doctor.name === selectedCalendarAppointment.provider) ??
      doctorOptions.find((doctor) => doctor.department === selectedCalendarAppointment.department);

    if (matchingDoctor) {
      setSelectedDoctor(matchingDoctor.name);
    }

    setSelectedDate(selectedCalendarAppointment.date);
    setSelectedSlot(selectedCalendarAppointment.time);
    setReason(selectedCalendarAppointment.chiefComplaint || selectedCalendarAppointment.department);
    setPhone(selectedCalendarAppointment.phone || PATIENT.phone);
    setBookingStep(3);
    setSelectedCalendarAppointment(null);
    setEventAnchor(null);
    jumpToBooking();
  }, [doctorOptions, jumpToBooking, selectedCalendarAppointment]);

  const handleCancelCalendarAppointment = React.useCallback(() => {
    if (!selectedCalendarAppointment) return;
    if (selectedCalendarAppointment.status !== 'Scheduled') {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Only scheduled appointments can be cancelled from patient portal.',
      });
      return;
    }

    dispatch(updateAppointment({ id: selectedCalendarAppointment.id, changes: { status: 'Cancelled' } }));

    setPortalAppointments((prev) =>
      prev.map((appointment) => {
        const sameDate = appointment.date === selectedCalendarAppointment.date;
        const sameDoctor = appointment.doctorName === selectedCalendarAppointment.provider;
        const sameTime = parseTimeLabelTo24Hour(appointment.time) === selectedCalendarAppointment.time;
        return sameDate && sameDoctor && sameTime
          ? { ...appointment, status: 'cancelled' }
          : appointment;
      })
    );

    setSelectedCalendarAppointment(null);
    setEventAnchor(null);
    setSnackbar({
      open: true,
      severity: 'success',
      message: 'Appointment cancelled successfully.',
    });
  }, [dispatch, selectedCalendarAppointment]);

  const proceedToNextStep = React.useCallback(() => {
    if (bookingStep === 1 && !consultationType) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Select consultation type to continue.',
      });
      return;
    }

    if (bookingStep === 2 && !selectedDoctor) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Choose a doctor to continue.',
      });
      return;
    }

    if (bookingStep === 3 && !selectedSlot) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Choose an available time slot.',
      });
      return;
    }

    if (bookingStep === 4) {
      if (!phone.trim()) {
        setSnackbar({
          open: true,
          severity: 'info',
          message: 'Phone number is required.',
        });
        return;
      }
      if (!reason.trim()) {
        setSnackbar({
          open: true,
          severity: 'info',
          message: 'Please mention the reason for visit.',
        });
        return;
      }
      if (consultationType === 'home' && !homeAddress.trim()) {
        setSnackbar({
          open: true,
          severity: 'info',
          message: 'Home address is required for home visit.',
        });
        return;
      }
    }

    setBookingStep((prev) => {
      const nextByStep: Record<BookingStep, BookingStep> = {
        1: 2,
        2: 3,
        3: 4,
        4: 4,
      };
      return nextByStep[prev];
    });
  }, [bookingStep, consultationType, homeAddress, phone, reason, selectedDoctor, selectedSlot]);

  const goBackStep = React.useCallback(() => {
    setBookingStep((prev) => {
      const previousByStep: Record<BookingStep, BookingStep> = {
        1: 1,
        2: 1,
        3: 2,
        4: 3,
      };
      return previousByStep[prev];
    });
  }, []);

  const handleConfirmBooking = React.useCallback(() => {
    if (!consultationType || !selectedDoctor || !selectedSlot) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Complete all booking steps before confirming.',
      });
      return;
    }

    if (!phone.trim()) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Phone number is required.',
      });
      return;
    }

    if (!reason.trim()) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Please mention the reason for visit.',
      });
      return;
    }

    if (consultationType === 'home' && !homeAddress.trim()) {
      setSnackbar({
        open: true,
        severity: 'info',
        message: 'Home address is required for home visit.',
      });
      return;
    }

    const pickedSlot = visibleProviderDaySlots.find((slot) => slot.time === selectedSlot);
    if (!pickedSlot || pickedSlot.status !== 'Available') {
      setBookingStep(3);
      setSnackbar({
        open: true,
        severity: 'warning',
        message: 'Selected slot is no longer available. Pick another slot.',
      });
      return;
    }

    const doctor = selectedDoctorMeta ?? {
      name: selectedDoctor,
      department: 'General Medicine',
      location: 'Main OPD Wing',
      fee: 600,
      rating: '4.7',
    };

    const patientMrnDigits = PATIENT.pid.replace(/\D/g, '').slice(-6) || '900001';
    const patientMrn = `MRN-${patientMrnDigits}`;
    const createdOpdAppointment: OpdAppointment = {
      id: `appt-portal-${Date.now()}`,
      date: selectedDate,
      time: selectedSlot,
      provider: doctor.name,
      department: doctor.department,
      patientName: PATIENT.name,
      mrn: patientMrn,
      ageGender: `${PATIENT.age} / ${PATIENT.gender}`,
      visitType: consultationToVisitType[consultationType],
      status: 'Scheduled',
      chiefComplaint: reason.trim(),
      payerType: 'General',
      phone: phone.trim(),
    };

    dispatch(addAppointment(createdOpdAppointment));

    const bookedDate = new Date(`${selectedDate}T${selectedSlot}:00`);
    const createdPortalAppointment: Appointment = {
      id: `pp-${Date.now()}`,
      doctorName: doctor.name,
      department: doctor.department,
      location:
        consultationType === 'home'
          ? 'Home Visit'
          : consultationType === 'video'
            ? 'Virtual Consultation'
            : doctor.location,
      date: selectedDate,
      day: `${bookedDate.getDate()}`.padStart(2, '0'),
      month: bookedDate.toLocaleDateString('en-US', { month: 'short' }),
      time: formatTimeLabel(selectedSlot),
      token: `#${Math.floor(Math.random() * 90 + 10)}`,
      type: consultationToPatientType[consultationType],
      patient: PATIENT.name,
      status: 'upcoming',
    };

    setPortalAppointments((prev) => [createdPortalAppointment, ...prev]);
    setBookingStep(1);
    setConsultationType(null);
    setSelectedSlot('');
    setReason('');
    setNotes('');
    jumpToBooking();

    setSnackbar({
      open: true,
      severity: 'success',
      message: `Appointment booked for ${selectedDate} at ${formatTimeLabel(selectedSlot)}.`,
    });
  }, [
    consultationType,
    dispatch,
    homeAddress,
    jumpToBooking,
    phone,
    visibleProviderDaySlots,
    reason,
    selectedDate,
    selectedDoctor,
    selectedDoctorMeta,
    selectedSlot,
  ]);

  const counts: Record<TabId, number> = {
    upcoming: portalAppointments.filter((a) => a.status === 'upcoming').length,
    completed: portalAppointments.filter((a) => a.status === 'completed').length,
    cancelled: portalAppointments.filter((a) => a.status === 'cancelled').length,
  };

  const appointmentStats = React.useMemo(() => {
    let checkedIn = 0;
    let inTriageConsult = 0;
    let noShow = 0;

    appointments.forEach((appointment) => {
      if (appointment.date !== selectedDate) return;
      if (selectedDoctor && appointment.provider !== selectedDoctor) return;

      if (appointment.status === 'Checked-In') {
        checkedIn += 1;
      } else if (appointment.status === 'In Triage' || appointment.status === 'In Consultation') {
        inTriageConsult += 1;
      } else if (appointment.status === 'No Show') {
        noShow += 1;
      }
    });

    return { checkedIn, inTriageConsult, noShow };
  }, [appointments, selectedDate, selectedDoctor]);

  const consultationOptions: Array<{
    id: ConsultationType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'video',
      label: 'Video Call',
      description: 'Consult online in secure session',
      icon: <VideocamOutlinedIcon fontSize="small" />,
    },
    {
      id: 'home',
      label: 'Home Visit',
      description: 'Doctor visits your home address',
      icon: <HomeRoundedIcon fontSize="small" />,
    },
    {
      id: 'clinic',
      label: 'In-Clinic',
      description: 'Visit hospital OPD for consultation',
      icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <PatientPortalWorkspaceCard current="appointments" hidePatientBar>
   
      {opdStatus === 'error' ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          OPD data feed is unavailable ({opdError ?? 'unknown error'}). Booking UI is running on fallback slot configuration.
        </Alert>
      ) : null}

      <Box ref={bookingSectionRef} sx={{ mb: 2 }}>
        <Card
          elevation={0}
          sx={{
            ...sectionCard,
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          }}
        >
          <Box sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(0, 1fr) 430px',
                  xl: 'minmax(0, 1fr) 460px',
                },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: 'none',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.3}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      pb: 1,
                      position: 'sticky',
                      top: 0,
                      zIndex: 4,
                      backdropFilter: 'blur(6px)',
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          calendarRef.current?.getApi().today();
                          setSelectedDate(formatIsoDate(new Date()));
                        }}
                        sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
                      >
                        Today
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => calendarRef.current?.getApi().prev()}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <ChevronLeftIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => calendarRef.current?.getApi().next()}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {calendarTitle || 'Calendar'}
                      </Typography>
                    </Stack>

                    
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} >
                      <TextField
                        size="small"
                        select
                        label="View"
                        value={calendarView}
                        onChange={(event) => {
                          const nextView = event.target.value as CalendarView;
                          setCalendarView(nextView);
                          calendarRef.current?.getApi().changeView(nextView);
                        }}
                        sx={{ minWidth: 130 }}
                      >
                        <MenuItem value="timeGridWeek">Week</MenuItem>
                        <MenuItem value="timeGridDay">Day</MenuItem>
                      </TextField>
                     
                    </Stack>
                  </Stack>

                  <Box
                    ref={calendarContainerRef}
                    sx={{
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
                      '& .fc-scrollgrid': {
                        borderColor: 'transparent',
                      },
                      '& .fc-theme-standard td, & .fc-theme-standard th': {
                        borderColor: alpha(theme.palette.divider, 0.1),
                      },
                      '& .fc-col-header-cell': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
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
                      slotDuration={`${`${Math.floor(slotDurationMinutes / 60)}`.padStart(2, '0')}:${`${slotDurationMinutes % 60}`.padStart(2, '0')}:00`}
                      slotLabelInterval={{ hours: 1 }}
                      slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short', omitZeroMinute: true }}
                      eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                      events={calendarEvents}
                      dateClick={handleDateClick}
                      eventClick={handleCalendarEventClick}
                      datesSet={handleDatesSet}
                      dayHeaderContent={dayHeaderContent}
                      eventContent={(arg: EventContentArg) => {
                        const startTime = arg.event.start ? formatTime(arg.event.start) : null;
                        const endTime = arg.event.end ? formatTime(arg.event.end) : null;
                        const timeRange =
                          startTime && endTime
                            ? `${formatTimeCompactLabel(startTime)} - ${formatTimeCompactLabel(endTime)}`
                            : arg.timeText;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1 }}>{timeRange}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.15 }}>{arg.event.title}</span>
                          </div>
                        );
                      }}
                      eventDidMount={(info) => {
                        const appointment = (info.event.extendedProps as { appointment?: OpdAppointment }).appointment;
                        const status = appointment?.status ?? (info.event.extendedProps as { status?: AppointmentStatus }).status;
                        const color = status ? statusColor(status, theme.palette) : theme.palette.primary.main;
                        info.el.style.backgroundColor = alpha(color, 0.22);
                        info.el.style.border = `1px solid ${alpha(color, 0.55)}`;
                        info.el.style.color = theme.palette.text.primary;
                        info.el.style.borderRadius = '10px';
                        info.el.style.boxShadow = `0 1px 2px ${alpha(color, 0.2)}`;
                        info.el.style.cursor = 'pointer';
                        if (selectedCalendarAppointment && appointment?.id === selectedCalendarAppointment.id) {
                          info.el.style.boxShadow = `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`;
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Card>

              <Stack spacing={1.5}>
                <Card
                  elevation={0}
                  sx={{
                    border: 'none',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Book Appointment
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Step {bookingStep} of {BOOKING_STEPS.length}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.8, px: 0.2 }}>
                      {BOOKING_STEPS.map((step, index) => {
                        const done = step.id < bookingStep;
                        const active = step.id === bookingStep;
                        return (
                          <React.Fragment key={step.id} >
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '1px solid',
                                borderColor: done || active ? 'primary.main' : alpha(theme.palette.text.disabled, 0.5),
                                backgroundColor: done || active ? 'primary.main' : 'transparent',
                                color: done || active ? '#fff' : 'text.secondary',
                                fontSize: 11,
                                fontWeight: 700,
                                display: 'grid',
                                placeItems: 'center',
                              }}
                            >
                              {done ? '✓' : step.id}
                            </Box>
                            {index < BOOKING_STEPS.length - 1 ? (
                              <Box
                                sx={{
                                  flex: 1,
                                  minWidth: 20,
                                  height: 1.5,
                                  mx: 0.7,
                                  borderRadius: 999,
                                  backgroundColor:
                                    step.id < bookingStep
                                      ? theme.palette.primary.main
                                      : alpha(theme.palette.text.disabled, 0.45),
                                }}
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </Box>

                    {bookingStep === 1 ? (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary' }}>
                          CONSULTATION TYPE
                        </Typography>
                        {consultationOptions.map((option) => {
                          const selected = consultationType === option.id;
                          return (
                            <Box
                              key={option.id}
                              onClick={() => setConsultationType(option.id)}
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                border: '1.5px solid',
                                borderColor: selected ? 'primary.main' : 'divider',
                                backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                cursor: 'pointer',
                                transition: 'all .15s ease',
                                '&:hover': {
                                  borderColor: alpha(theme.palette.primary.main, 0.55),
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1,
                                    display: 'grid',
                                    placeItems: 'center',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                  }}
                                >
                                  {option.icon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">{option.description}</Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  label={selected ? 'Selected' : 'Select'}
                                  color={selected ? 'primary' : 'default'}
                                  variant={selected ? 'filled' : 'outlined'}
                                  sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
                                />
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : null}

                    {bookingStep === 2 ? (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary' }}>
                          CHOOSE DOCTOR
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <TextField
                            size="small"
                            label="Search doctor"
                            placeholder="Name, specialty or location"
                            value={doctorSearch}
                            onChange={(event) => setDoctorSearch(event.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            select
                            label="Specialty"
                            value={specialtyFilter}
                            onChange={(event) => setSpecialtyFilter(event.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: 170 } }}
                          >
                            {specialtyOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                        <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.4 }}>
                          <Stack spacing={1}>
                            {filteredDoctorOptions.length === 0 ? (
                              <Box
                                sx={{
                                  p: 1.1,
                                  borderRadius: 1.5,
                                  border: '1px dashed',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  No doctors found for this search/filter. Try changing specialty or search text.
                                </Typography>
                              </Box>
                            ) : (
                              filteredDoctorOptions.map((doctor) => {
                                const selected = selectedDoctor === doctor.name;
                                return (
                                  <Box
                                    key={doctor.name}
                                    onClick={() => {
                                      setSelectedDoctor(doctor.name);
                                      setSelectedSlot('');
                                    }}
                                    sx={{
                                      p: 1.1,
                                      borderRadius: 1.5,
                                      border: '1.5px solid',
                                      borderColor: selected ? 'primary.main' : 'divider',
                                      backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{doctor.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {doctor.department} · {doctor.location}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Box>
                                );
                              })
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    ) : null}

                    {bookingStep === 3 ? (
                      <Stack spacing={1.2}>
                        <Box
                          sx={{
                            p: 1.15,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.34),
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.94)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
                            color: theme.palette.common.white,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: 1,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.common.white, 0.14),
                                color: theme.palette.common.white,
                                flexShrink: 0,
                              }}
                            >
                              <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, color: alpha(theme.palette.common.white, 0.8) }}
                              >
                                Selected
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.common.white }}>
                                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: alpha(theme.palette.common.white, 0.82),
                                textAlign: 'right',
                                lineHeight: 1.2,
                              }}
                            >
                              Click calendar
                              <br />
                              to change
                            </Typography>
                          </Stack>
                        </Box>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateCalendar
                            value={selectedDate ? dayjs(selectedDate) : null}
                            onChange={handleMiniCalendarChange}
                            showDaysOutsideCurrentMonth
                            disablePast
                            minDate={dayjs().startOf('day')}
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
                                mb: 0.4,
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

                        {selectedDoctorMeta ? (
                          <Box
                            sx={{
                              p: 1.05,
                              borderRadius: 1.4,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.24),
                              backgroundColor: alpha(theme.palette.background.paper, 0.88),
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 1,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: alpha(theme.palette.warning.main, 0.2),
                                  color: theme.palette.warning.dark,
                                  flexShrink: 0,
                                }}
                              >
                                <MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                  {selectedDoctorMeta.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {selectedDoctorMeta.department}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        ) : null}

                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, letterSpacing: 0.5, color: alpha(theme.palette.primary.main, 0.78) }}
                        >
                          AVAILABLE SLOTS
                        </Typography>

                        {[
                          {
                            key: 'morning',
                            title: 'MORNING',
                            icon: <WbSunnyRoundedIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />,
                            slots: groupedSlots.morning,
                          },
                          {
                            key: 'afternoon',
                            title: 'AFTERNOON',
                            icon: <CloudQueueRoundedIcon sx={{ fontSize: 14, color: theme.palette.info.main }} />,
                            slots: groupedSlots.afternoon,
                          },
                          {
                            key: 'evening',
                            title: 'EVENING',
                            icon: <NightsStayRoundedIcon sx={{ fontSize: 14, color: theme.palette.warning.dark }} />,
                            slots: groupedSlots.evening,
                          },
                        ].map((group) => (
                          <Box key={group.key}>
                            <Stack direction="row" spacing={0.45} alignItems="center">
                              {group.icon}
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  letterSpacing: 0.3,
                                  color: alpha(theme.palette.primary.main, 0.65),
                                }}
                              >
                                {group.title}
                              </Typography>
                            </Stack>
                            <Box sx={{ mt: 0.6, display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                              {group.slots.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">No slots</Typography>
                              ) : (
                                group.slots.map((slot) => {
                                  const selected = selectedSlot === slot.time;
                                  const disabled = slot.status !== 'Available';
                                  const isBooked = slot.status === 'Booked';
                                  const isBreak = slot.status === 'Break' || slot.status === 'Blocked';
                                  return (
                                    <Button
                                      key={`${group.key}-${slot.time}`}
                                      size="small"
                                      onClick={() => {
                                        if (!disabled) setSelectedSlot(slot.time);
                                      }}
                                      sx={{
                                        minHeight: 30,
                                        minWidth: 48,
                                        px: 1.1,
                                        textTransform: 'none',
                                        fontSize: 12,
                                        fontWeight: selected ? 800 : 700,
                                        borderRadius: 1.4,
                                        border: '1px solid',
                                        borderColor: selected
                                          ? 'primary.main'
                                          : isBooked
                                            ? alpha(theme.palette.text.secondary, 0.3)
                                            : isBreak
                                              ? alpha(theme.palette.warning.main, 0.45)
                                              : alpha(theme.palette.primary.main, 0.22),
                                        backgroundColor: selected
                                          ? theme.palette.primary.main
                                          : isBooked
                                            ? alpha(theme.palette.text.secondary, 0.08)
                                            : isBreak
                                              ? alpha(theme.palette.warning.main, 0.12)
                                              : alpha(theme.palette.background.paper, 0.85),
                                        color: selected
                                          ? theme.palette.common.white
                                          : isBooked
                                            ? theme.palette.text.secondary
                                            : isBreak
                                              ? theme.palette.warning.dark
                                              : theme.palette.text.primary,
                                        opacity: disabled && !selected ? 0.72 : 1,
                                        textDecoration: isBooked ? 'line-through' : 'none',
                                        textDecorationThickness: isBooked ? 1.2 : undefined,
                                      }}
                                    >
                                      {formatSlotChipTime(slot.time)}
                                    </Button>
                                  );
                                })
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    ) : null}

                    {bookingStep === 4 ? (
                      <Stack spacing={1.1}>
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
                            {PATIENT.name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join('')}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {PATIENT.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              MRN {PATIENT.pid}
                            </Typography>
                          </Box>
                        </Box>

                        <TextField
                          size="small"
                          label="Phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                        <TextField
                          size="small"
                          label="Reason for Visit"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          multiline
                          minRows={2}
                        />
                        <TextField
                          size="small"
                          label="Additional Notes"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          multiline
                          minRows={2}
                        />
                        {consultationType === 'home' ? (
                          <TextField
                            size="small"
                            label="Home Address"
                            value={homeAddress}
                            onChange={(event) => setHomeAddress(event.target.value)}
                            multiline
                            minRows={2}
                          />
                        ) : null}
                      </Stack>
                    ) : null}

                    <Stack direction="row" spacing={1} sx={{ mt: 1.8 }}>
                      {bookingStep > 1 ? (
                        <Button variant="outlined" onClick={goBackStep} sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
                          Back
                        </Button>
                      ) : null}
                      {bookingStep < 4 ? (
                        <Button variant="contained" onClick={proceedToNextStep} sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
                          Continue
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleConfirmBooking}
                          sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}
                        >
                          Confirm Appointment
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    border: 'none',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  }}
                >
                  <Box sx={{ px: 1.5, py: 1.15, borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12), backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Upcoming ({counts.upcoming})
                    </Typography>
                  </Box>
                  <Stack spacing={0} sx={{ px: 1.5, py: 0.5 }}>
                    {upcomingPreview.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ py: 1.25 }}>
                        No upcoming appointments.
                      </Typography>
                    ) : (
                      upcomingPreview.map((appointment, index) => (
                        <Stack
                          key={appointment.id}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            py: 0.95,
                            borderBottom: index === upcomingPreview.length - 1 ? 'none' : '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{appointment.doctorName}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {appointment.time} · {appointment.month} {appointment.day}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => openBookingFromAppointment(appointment)}
                            sx={{ textTransform: 'none', fontSize: 11, minWidth: 0 }}
                          >
                            Rebook
                          </Button>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Popover
        open={Boolean(selectedCalendarAppointment && eventAnchor)}
        anchorEl={eventAnchor}
        onClose={() => {
          setSelectedCalendarAppointment(null);
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
        {selectedCalendarAppointment ? (
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {selectedCalendarAppointment.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedCalendarAppointment.date} · {formatTimeLabel(selectedCalendarAppointment.time)} · {selectedCalendarAppointment.provider}
            </Typography>
            <Divider />
            <Typography variant="body2">
              <strong>Status:</strong> {selectedCalendarAppointment.status}
            </Typography>
            <Typography variant="body2">
              <strong>Department:</strong> {selectedCalendarAppointment.department}
            </Typography>
            <Typography variant="body2">
              <strong>MRN:</strong> {selectedCalendarAppointment.mrn}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {selectedCalendarAppointment.phone}
            </Typography>
            <Typography variant="body2">
              <strong>Complaint:</strong> {selectedCalendarAppointment.chiefComplaint || 'Not specified'}
            </Typography>
            <Divider />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleRescheduleFromCalendar}
                sx={{ textTransform: 'none' }}
              >
                Reschedule
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleCancelCalendarAppointment}
                disabled={selectedCalendarAppointment.status !== 'Scheduled'}
                sx={{ textTransform: 'none' }}
              >
                Cancel Appointment
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Popover>
    </PatientPortalWorkspaceCard>
  );
}
