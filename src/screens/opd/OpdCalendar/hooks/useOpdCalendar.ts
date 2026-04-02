import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/src/core/auth/UserContext';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { useAppDispatch } from '@/src/store/hooks';
import { useOpdData } from '@/src/store/opdHooks';
import { addAppointment, updateAppointment } from '@/src/store/slices/opdSlice';
import { getOpdRoleFlowProfile } from '@/src/screens/opd/opd-role-flow';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { formatIsoDate, defaultDepartment, getSlotDurationMinutes, toMinutes, rangesOverlap } from '../utils/opd-calendar.utils';

function buildDefaultBooking(providers: string[], slotTimes: string[], date: string) {
  return {
    provider: providers[0] || '',
    time: slotTimes[0] || '',
    date: date,
    patientName: '',
    mrn: '',
    phone: '',
    ageGender: '',
    department: defaultDepartment,
    type: 'Consultation',
    payerType: 'Self Pay'
  };
}

export function useOpdCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useUser();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const { appointments, providerAvailability, providers, slotTimes } = useOpdData();

  const [availability, setAvailability] = useState(providerAvailability);
  const [selectedDate, setSelectedDate] = useState(appointments[0]?.date ?? formatIsoDate(new Date()));
  const [directDate, setDirectDate] = useState(selectedDate);
  const [providerFilter, setProviderFilter] = useState('All');
  const [directDepartment, setDirectDepartment] = useState(defaultDepartment);
  const [directProvider, setDirectProvider] = useState<string | null>(null);
  
  const [booking, setBooking] = useState(() => 
    buildDefaultBooking(providers, slotTimes, appointments[0]?.date ?? formatIsoDate(new Date()))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatientOption, setSelectedPatientOption] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [slotLocked, setSlotLocked] = useState(false);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventAnchor, setEventAnchor] = useState<any>(null);
  const [calendarRange, setCalendarRange] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const roleProfile = useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canManageCalendar = roleProfile.capabilities.canManageCalendar;

  const slotDurationMinutes = useMemo(() => getSlotDurationMinutes(slotTimes), [slotTimes]);

  useEffect(() => {
    if (providerAvailability.length > 0) {
      setAvailability(providerAvailability);
    }
  }, [providerAvailability]);

  useEffect(() => {
    if (!providers.length || !slotTimes.length) return;
    setBooking((prev) => ({
      ...prev,
      provider: prev.provider || providers[0],
      time: prev.time || slotTimes[0]
    }));
  }, [providers, slotTimes]);

  const seededPatient = useMemo(() => getPatientByMrn(booking.mrn || mrnParam), [booking.mrn, mrnParam]);
  const activePatient = selectedPatientOption ?? seededPatient ?? null;

  const patientSummary = useMemo(() => ({
    name: activePatient?.name ?? "—",
    mrn: activePatient?.mrn ?? "—",
    ageGender: activePatient?.ageGender ?? "—",
    phone: activePatient?.phone ?? "—",
    department: activePatient?.department ?? "—",
  }), [activePatient]);

  const patientName = activePatient?.name ?? "—";
  const patientMrn = activePatient?.mrn ?? "—";

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    appointments.forEach((a) => departments.add(a.department));
    if (seededPatient?.department) departments.add(seededPatient.department);
    return Array.from(departments).sort();
  }, [appointments, seededPatient?.department]);

  const providerDepartmentMap = useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((a) => {
      if (!map.has(a.provider)) map.set(a.provider, a.department);
    });
    return map;
  }, [appointments]);

  const providersByDepartment = useMemo(() => {
    const map = new Map<string, string[]>();
    appointments.forEach((a) => {
      const current = map.get(a.department) ?? [];
      if (!current.includes(a.provider)) current.push(a.provider);
      map.set(a.department, current);
    });
    return map;
  }, [appointments]);

  const appointmentStats = useMemo(() => {
    const date = directDate;
    let checkedIn = 0;
    let inTriageConsult = 0;
    let noShow = 0;
    appointments.forEach((a) => {
      if (a.date !== date) return;
      if (directDepartment && a.department !== directDepartment) return;
      if (directProvider && a.provider !== directProvider) return;
      if (a.status === "Checked-In") checkedIn += 1;
      else if (a.status === "In Triage" || a.status === "In Consultation")
        inTriageConsult += 1;
      else if (a.status === "No Show") noShow += 1;
    });
    return { checkedIn, inTriageConsult, noShow };
  }, [appointments, directDate, directDepartment, directProvider]);

  const hasOverlappingAppointment = useCallback(
    (date: string, time: string, excludeId?: string) => {
      const startMinutes = toMinutes(time);
      const endMinutes = startMinutes + slotDurationMinutes;
      return appointments.some((a) => {
        if (a.date !== date) return false;
        if (a.status === "Cancelled") return false;
        if (excludeId && a.id === excludeId) return false;
        const apptStart = toMinutes(a.time);
        const apptEnd = apptStart + slotDurationMinutes;
        return rangesOverlap(startMinutes, endMinutes, apptStart, apptEnd);
      });
    },
    [appointments, slotDurationMinutes],
  );

  const availabilityProvider =
    directProvider || (providerFilter !== "All" ? providerFilter : null);

  const slotCheck = useMemo(() => {
    const isConflict = hasOverlappingAppointment(
      booking.date,
      booking.time,
      editingAppointment?.id,
    );
    return {
      status: isConflict ? "Conflicted" : "Available",
      tone: (isConflict ? "error" : "success") as any,
      message: isConflict ? "Selected time is already booked." : "",
    };
  }, [
    booking.date,
    booking.time,
    hasOverlappingAppointment,
    editingAppointment,
  ]);

  const directProviderOptions = useMemo(() => {
    if (!directDepartment) return providers;
    return providersByDepartment.get(directDepartment) ?? [];
  }, [directDepartment, providers, providersByDepartment]);

  const availableSlotCount = useMemo(() => {
    return 12; // Simplified logic or mock value for UI display
  }, []);

  const guardCalendarAction = useCallback(
    (actionLabel: string): boolean => {
      if (canManageCalendar) return true;
      setSnackbar({
        open: true,
        message: `${roleProfile.label} cannot ${actionLabel.toLowerCase()}.`,
        severity: "warning",
      });
      return false;
    },
    [canManageCalendar, roleProfile.label],
  );

  const handleSelectPatient = useCallback((patient: any) => {
    setSelectedPatientOption(patient);
    if (patient) {
      setBooking((prev) => ({
        ...prev,
        patientName: patient.name,
        mrn: patient.mrn,
        phone: patient.phone,
        ageGender: patient.ageGender,
        department: patient.department || prev.department,
      }));
    } else {
      setBooking((prev) => ({
        ...prev,
        patientName: "",
        mrn: "",
        phone: "",
        ageGender: "",
      }));
    }
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
    setEditingAppointment(null);
    setErrors({});
  }, []);

  const openPatientRegistrationFromCalendar = useCallback(() => {
    router.push("/patients/registration?source=calendar");
  }, [router]);

  const updateBookingField = useCallback(
    (field: string, value: any) => {
      setBooking((prev: any) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const handleCreateBooking = useCallback(
    (sendToQueue: boolean) => {
      if (!guardCalendarAction("Create Booking")) return;

      const nextErrors: Record<string, string> = {};
      if (!booking.patientName) nextErrors.patientName = "Patient is required.";
      if (!booking.date) nextErrors.date = "Date is required.";
      if (!booking.time) nextErrors.time = "Time is required.";
      if (!booking.provider) nextErrors.provider = "Provider is required.";

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      const appointmentId = `appt-${Date.now()}`;
      dispatch(
        addAppointment({
          id: appointmentId,
          mrn: booking.mrn,
          patientName: booking.patientName,
          date: booking.date,
          time: booking.time,
          provider: booking.provider,
          department: booking.department,
          status: sendToQueue ? "Checked-In" : "Scheduled",
          visitType: (booking as any).visitType || "New",
          phone: booking.phone,
          ageGender: booking.ageGender,
          chiefComplaint: (booking as any).chiefComplaint || "",
          payerType: (booking as any).payerType || "General",
        }),
      );

      setSnackbar({
        open: true,
        message: sendToQueue
          ? "Appointment created and checked in."
          : "Appointment scheduled successfully.",
        severity: "success",
      });
      closeBooking();
    },
    [booking, dispatch, closeBooking, guardCalendarAction],
  );

  const handleUpdateBooking = useCallback(() => {
    if (!editingAppointment) return;
    if (!guardCalendarAction("Update Booking")) return;

    dispatch(
      updateAppointment({
        id: editingAppointment.id,
        changes: {
          date: booking.date,
          time: booking.time,
          provider: booking.provider,
          visitType: (booking as any).visitType || "New",
          phone: booking.phone,
          ageGender: booking.ageGender,
          chiefComplaint: (booking as any).chiefComplaint || "",
        },
      }),
    );
    setSnackbar({
      open: true,
      message: "Appointment updated successfully.",
      severity: "success",
    });
    closeBooking();
  }, [editingAppointment, booking, dispatch, closeBooking, guardCalendarAction]);

  const handleQuickCheckIn = useCallback(
    (appointment: any) => {
      if (!guardCalendarAction("Check-In")) return;
      dispatch(
        updateAppointment({
          id: appointment.id,
          changes: { status: "Checked-In" },
        }),
      );
      setSnackbar({
        open: true,
        message: `${appointment.patientName} checked in.`,
        severity: "success",
      });
    },
    [dispatch, guardCalendarAction],
  );

  const handleDirectDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setDirectDate(date);
  }, []);

  const openEditBooking = useCallback((appointment: any) => {
    setEditingAppointment(appointment);
    setBooking({
      provider: appointment.provider,
      time: appointment.time,
      date: appointment.date,
      patientName: appointment.patientName,
      mrn: appointment.mrn,
      phone: appointment.phone || "",
      ageGender: appointment.ageGender || "",
      department: appointment.department,
      visitType: appointment.type || "New",
      payerType: "General",
      chiefComplaint: appointment.chiefComplaint || "",
    } as any);
    setSelectedPatientOption(getPatientByMrn(appointment.mrn));
    setSlotLocked(true);
    setBookingOpen(true);
  }, []);

  const getSlotForSelection = useCallback(
    (provider: string, date: string, time: string) => {
      const avail = availability.find(
        (a) => a.provider === provider && a.date === date,
      );
      if (!avail) return null;
      return avail.slots.find((s) => s.time === time) || null;
    },
    [availability],
  );

  const handleDirectSlotPick = useCallback(
    (slot: any, meta: any) => {
      setBooking((prev: any) => ({
        ...prev,
        provider: meta.provider,
        date: meta.date,
        time: slot.time,
        department: meta.department || prev.department,
      }));
      setEditingAppointment(null);
      setSlotLocked(true);
      setBookingOpen(true);
    },
    [],
  );

  const handleDirectDepartmentChange = useCallback((department: string) => {
    setDirectDepartment(department);
  }, []);

  const handleDirectProviderChange = useCallback((provider: string) => {
    setDirectProvider(provider);
  }, []);

  return {
    router,
    searchParams,
    mrnParam,
    dispatch,
    appointments,
    availability,
    providers,
    slotTimes,
    selectedDate,
    setSelectedDate,
    directDate,
    setDirectDate,
    providerFilter,
    setProviderFilter,
    directDepartment,
    setDirectDepartment,
    directProvider,
    setDirectProvider,
    booking,
    setBooking,
    errors,
    setErrors,
    selectedPatientOption,
    setSelectedPatientOption,
    bookingOpen,
    setBookingOpen,
    editingAppointment,
    setEditingAppointment,
    slotLocked,
    setSlotLocked,
    calendarView,
    setCalendarView,
    calendarTitle,
    setCalendarTitle,
    selectedEvent,
    setSelectedEvent,
    eventAnchor,
    setEventAnchor,
    calendarRange,
    setCalendarRange,
    snackbar,
    setSnackbar,
    roleProfile,
    canManageCalendar,
    slotDurationMinutes,
    departmentOptions,
    providerDepartmentMap,
    availabilityProvider,
    appointmentStats,
    hasOverlappingAppointment,
    // Newly implemented fields
    patientSummary,
    patientName,
    patientMrn,
    slotCheck,
    directProviderOptions,
    availableSlotCount,
    guardCalendarAction,
    handleSelectPatient,
    closeBooking,
    openPatientRegistrationFromCalendar,
    updateBookingField,
    handleCreateBooking,
    handleUpdateBooking,
    handleQuickCheckIn,
    handleDirectDateChange,
    openEditBooking,
    getSlotForSelection,
    handleDirectSlotPick,
    handleDirectDepartmentChange,
    handleDirectProviderChange,
  };
}
