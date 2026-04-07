"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Snackbar,
  Stack,
  SelectChangeEvent,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { OpdAppointment, ProviderSlot } from "../opd-mock-data";
import { CalendarView } from "./types/opd-calendar.types";
import { formatIsoDate, formatTime } from "./utils/opd-calendar.utils";
import { useOpdCalendar } from "./hooks/useOpdCalendar";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { CalendarSidebar } from "./components/CalendarSidebar";
import { OpdCalendarGrid } from "./components/OpdCalendarGrid";
import { BookingDrawer } from "./components/BookingDrawer";
import { AppointmentPopover } from "./components/AppointmentPopover";
import { Dayjs } from "dayjs";

export default function OpdCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);

  const opd = useOpdCalendar();

  // Sync calendar resize on container resize
  React.useEffect(() => {
    const container = calendarContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let frame: number | null = null;
    const handleResize = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        calendarRef.current?.getApi().updateSize();
      });
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  // Apply ?date= param
  const [dateParamApplied, setDateParamApplied] = React.useState(false);
  React.useEffect(() => {
    const dateParam = searchParams.get("date");
    if (!dateParam || dateParamApplied) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return;
    opd.handleDirectDateChange(dateParam);
    calendarRef.current?.getApi().gotoDate(dateParam);
    const timeParam = searchParams.get("time");
    if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
      window.requestAnimationFrame(() => {
        const api = calendarRef.current?.getApi();
        if (api && typeof api.scrollToTime === "function") {
          api.scrollToTime(`${timeParam}:00`);
        }
      });
    }
    setDateParamApplied(true);
  }, [dateParamApplied, opd, searchParams]);

  // Apply ?appointmentId= param
  const [appointmentParamApplied, setAppointmentParamApplied] =
    React.useState(false);
  React.useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");
    if (!appointmentId || appointmentParamApplied) return;
    const target = opd.appointments.find((a) => a.id === appointmentId);
    if (!target) return;
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView("timeGridDay", target.date);
      calendarApi.gotoDate(target.date);
      if (typeof calendarApi.scrollToTime === "function") {
        calendarApi.scrollToTime(`${target.time}:00`);
      }
    }
    opd.openEditBooking(target);
    setAppointmentParamApplied(true);
  }, [appointmentParamApplied, opd, searchParams]);

  // Calendar event data
  const { events } = useCalendarEvents({
    appointments: opd.appointments,
    availability: opd.availability,
    providerFilter: opd.providerFilter,
    availabilityProvider: opd.availabilityProvider,
    calendarRange: opd.calendarRange,
    calendarView: opd.calendarView,
    slotDurationMinutes: opd.slotDurationMinutes,
    selectedEvent: opd.selectedEvent,
    directDepartment: opd.directDepartment,
    providerDepartmentMap: opd.providerDepartmentMap,
    bookingDepartment: opd.booking.department,
    hasOverlappingAppointment: opd.hasOverlappingAppointment,
  });

  // Calendar event handlers
  const handleDateClick = React.useCallback(
    (arg: DateClickArg) => {
      const calendarApi = calendarRef.current?.getApi();
      const clickedDate = formatIsoDate(arg.date);

      if (arg.view.type === "dayGridMonth") {
        calendarApi?.changeView("timeGridDay", clickedDate);
        opd.setCalendarView("timeGridDay");
        opd.setSelectedDate(clickedDate);
        opd.setDirectDate(clickedDate);
        return;
      }

      if (!opd.canManageCalendar) {
        opd.guardCalendarAction("Slot selection");
        return;
      }

      const clickedTime = formatTime(arg.date);
      const provider =
        opd.availabilityProvider ||
        (opd.providerFilter === "All"
          ? opd.booking.provider
          : opd.providerFilter);
      const slot = opd.getSlotForSelection(provider, clickedDate, clickedTime);

      if (opd.hasOverlappingAppointment(clickedDate, clickedTime)) {
        opd.setSnackbar({
          open: true,
          message: "This time overlaps another appointment.",
          severity: "info",
        });
        return;
      }

      if (opd.availabilityProvider) {
        if (!slot || slot.status !== "Available") {
          opd.setSnackbar({
            open: true,
            message: "Please choose an available slot from the calendar.",
            severity: "info",
          });
          return;
        }
        opd.handleDirectSlotPick(slot, {
          provider: opd.availabilityProvider,
          date: clickedDate,
          department:
            opd.providerDepartmentMap.get(opd.availabilityProvider) ||
            opd.directDepartment ||
            opd.booking.department,
        });
        return;
      }

      if (slot && slot.status !== "Available") {
        opd.setSnackbar({
          open: true,
          message: `${slot.time} is ${slot.status.toLowerCase()}. Choose another slot.`,
          severity: "info",
        });
        return;
      }

      opd.setSelectedDate(clickedDate);
      opd.setDirectDate(clickedDate);
      opd.setBooking((prev: typeof opd.booking) => ({
        ...prev,
        date: clickedDate,
        time: clickedTime,
        provider,
      }));
      opd.setEditingAppointment(null);
      opd.setSlotLocked(true);
      opd.setBookingOpen(true);
    },
    [opd],
  );

  const handleEventClick = React.useCallback(
    (arg: EventClickArg) => {
      const extended = arg.event.extendedProps as {
        kind?: string;
        appointment?: OpdAppointment;
        slot?: ProviderSlot;
        provider?: string;
        date?: string;
        department?: string;
      };

      if (
        extended.kind === "availability" &&
        extended.slot &&
        extended.provider &&
        extended.date
      ) {
        opd.setSelectedEvent(null);
        opd.setEventAnchor(null);
        opd.handleDirectSlotPick(extended.slot, {
          provider: extended.provider,
          date: extended.date,
          department: extended.department,
        });
        return;
      }

      if (!extended.appointment) return;
      opd.setSelectedEvent(extended.appointment);
      opd.setEventAnchor(arg.el);
    },
    [opd],
  );

  const handleDatesSet = React.useCallback(
    (arg: DatesSetArg) => {
      opd.setCalendarTitle(arg.view.title);
      opd.setCalendarView(arg.view.type as CalendarView);
      opd.setCalendarRange({ start: arg.start, end: arg.end });
      if (arg.view.type === "dayGridMonth") {
        opd.setSelectedDate(formatIsoDate(arg.view.currentStart));
        return;
      }
      opd.setSelectedDate(formatIsoDate(arg.start));
      if (arg.view.type === "timeGridDay") {
        opd.setDirectDate(formatIsoDate(arg.start));
      }
    },
    [opd],
  );

  const handleViewSelect = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent,
  ) => {
    const value = (event.target as HTMLInputElement).value as CalendarView;
    if (!value) return;
    opd.setCalendarView(value);
    calendarRef.current?.getApi().changeView(value);
  };

  const handleMiniCalendarChange = (value: Dayjs | null) => {
    if (!value) return;
    const nextDate = value.format("YYYY-MM-DD");
    opd.handleDirectDateChange(nextDate);
    calendarRef.current?.getApi().gotoDate(nextDate);
  };

  const handleNewBooking = React.useCallback(() => {
    if (!opd.guardCalendarAction("Create booking")) return;
    opd.setEditingAppointment(null);
    opd.setSlotLocked(false);
    opd.setBooking((prev: typeof opd.booking) => ({
      ...prev,
      date: opd.selectedDate,
      time: prev.time || opd.slotTimes[0],
      provider:
        opd.providerFilter === "All" ? prev.provider : opd.providerFilter,
    }));
    opd.setBookingOpen(true);
  }, [opd]);

  const handleOpenEditBooking = React.useCallback(
    (appointment: OpdAppointment) => {
      opd.openEditBooking(appointment);
      calendarRef.current?.getApi().gotoDate(appointment.date);
    },
    [opd],
  );

  return (
    <PageTemplate title="Appointments Calendar" currentPageTitle="Calendar">
      <Stack spacing={1.25}>
        {!opd.canManageCalendar ? (
          <Alert severity="info">
            {opd.roleProfile.label} view is read-only for calendar booking. Use
            queue for consultation actions.
          </Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 3,
            border: "none",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <Stack spacing={1}>
            {/* Toolbar */}
            <CalendarToolbar
              calendarTitle={opd.calendarTitle}
              calendarView={opd.calendarView}
              directDate={opd.directDate}
              availableSlotCount={opd.availableSlotCount}
              appointmentStats={opd.appointmentStats}
              canManageCalendar={opd.canManageCalendar}
              onPrev={() => calendarRef.current?.getApi().prev()}
              onNext={() => calendarRef.current?.getApi().next()}
              onToday={() => calendarRef.current?.getApi().today()}
              onViewSelect={handleViewSelect}
              onNewBooking={handleNewBooking}
            />

            {/* Calendar + Sidebar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 320px",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              <OpdCalendarGrid
                calendarRef={calendarRef}
                calendarContainerRef={calendarContainerRef}
                events={events}
                selectedEvent={opd.selectedEvent}
                selectedDate={opd.selectedDate}
                calendarView={opd.calendarView}
                slotDurationMinutes={opd.slotDurationMinutes}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onDatesSet={handleDatesSet}
              />

              <CalendarSidebar
                patientName={opd.patientName}
                patientMrn={opd.patientMrn}
                directDate={opd.directDate}
                directDepartment={opd.directDepartment}
                directProvider={opd.directProvider}
                directAvailability={opd.directAvailability}
                directProviderOptions={opd.directProviderOptions}
                departmentOptions={opd.departmentOptions}
                availableSlotCount={opd.availableSlotCount}
                onDepartmentChange={opd.handleDirectDepartmentChange}
                onProviderChange={opd.handleDirectProviderChange}
                onDateChange={handleMiniCalendarChange}
              />
            </div>
          </Stack>
        </Card>

        {/* Booking Drawer */}
        <BookingDrawer
          open={opd.bookingOpen}
          booking={opd.booking}
          errors={opd.errors}
          editingAppointment={opd.editingAppointment}
          slotLocked={opd.slotLocked}
          slotCheck={opd.slotCheck}
          providers={opd.providers}
          canManageCalendar={opd.canManageCalendar}
          selectedPatientOption={opd.selectedPatientOption}
          patientSummary={opd.patientSummary}
          onClose={opd.closeBooking}
          onSelectPatient={opd.handleSelectPatient}
          onRegisterPatient={opd.openPatientRegistrationFromCalendar}
          onUpdateField={opd.updateBookingField}
          onCreateBooking={opd.handleCreateBooking}
          onUpdateBooking={opd.handleUpdateBooking}
        />

        {/* Appointment Popover */}
        <AppointmentPopover
          selectedEvent={opd.selectedEvent}
          eventAnchor={opd.eventAnchor}
          canManageCalendar={opd.canManageCalendar}
          onClose={() => {
            opd.setSelectedEvent(null);
            opd.setEventAnchor(null);
          }}
          onReschedule={handleOpenEditBooking}
          onCheckIn={opd.handleQuickCheckIn}
        />

        {/* Snackbar */}
        <Snackbar
          open={opd.snackbar.open}
          autoHideDuration={3500}
          onClose={() =>
            opd.setSnackbar((prev: typeof opd.snackbar) => ({
              ...prev,
              open: false,
            }))
          }
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() =>
              opd.setSnackbar((prev: typeof opd.snackbar) => ({
                ...prev,
                open: false,
              }))
            }
            severity={opd.snackbar.severity}
            sx={{ width: "100%" }}
          >
            {opd.snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </PageTemplate>
  );
}
