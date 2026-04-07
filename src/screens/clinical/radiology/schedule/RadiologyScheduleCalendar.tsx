"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg,
  DateSelectArg,
  DatesSetArg,
} from "@fullcalendar/core";

import {
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { getPrimaryChipSx } from "@/src/core/theme/surfaces";
import { PageTemplate } from "@/src/ui/components";

// ─── Internal Modules ────────────────────────────────────────────────────────
import {
  SlotStatus,
  AppointmentEvent,
  ApptExtended,
  RESOURCES,
  STATUS_META,
} from "./schedule.types";
import { INITIAL_EVENTS, isSameDate } from "./schedule.data";
import { EventContent } from "./components/EventContent";
import { EventDetailDialog } from "./components/EventDetailDialog";
import { BookSlotDialog } from "./components/BookSlotDialog";
import { Sidebar } from "./components/Sidebar";

export default function RadiologyScheduleCalendar({
  onSnack = (msg: string) => console.log(msg),
  onConfirm,
}: {
  onSnack?: (msg: string) => void;
  onConfirm?: (evt: AppointmentEvent) => void;
}) {
  const theme = useTheme();
  const calendarRef = React.useRef<FullCalendar | null>(null);

  const [calendarView, setCalendarView] = React.useState<string>("resourceTimeGridDay");
  const [calendarTitle, setCalendarTitle] = React.useState("");
  const [events, setEvents] = React.useState<AppointmentEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = React.useState<AppointmentEvent | null>(null);
  const [bookDialog, setBookDialog] = React.useState({ open: false, start: "", resource: "xray" });
  const [snack, setSnack] = React.useState({ open: false, message: "" });
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const visibleEvents = React.useMemo(() => {
    let list = events;
    if (selectedResourceId) list = list.filter((e) => e.resourceId === selectedResourceId);
    if (statusFilter !== "all") list = list.filter((e) => e.extendedProps.status === statusFilter);
    return list;
  }, [events, selectedResourceId, statusFilter]);

  const filteredResources = React.useMemo(() => {
    if (selectedResourceId) return RESOURCES.filter((r) => r.id === selectedResourceId);
    return RESOURCES;
  }, [selectedResourceId]);

  const handleDatesSet = React.useCallback((arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCalendarView(arg.view.type);
  }, []);

  const changeView = (v: string) => {
    setCalendarView(v);
    calendarRef.current?.getApi().changeView(v);
  };

  const showSnack = (msg: string) => setSnack({ open: true, message: msg });

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEvent({
      id: arg.event.id,
      resourceId: arg.event.getResources()[0]?.id || "xray",
      title: arg.event.title,
      start: arg.event.startStr,
      end: arg.event.endStr,
      extendedProps: arg.event.extendedProps as ApptExtended,
    });
  };

  const handleDateSelect = (arg: DateSelectArg) => {
    setBookDialog({ open: true, start: arg.startStr, resource: (arg as any).resource?.id ?? "xray" });
    arg.view.calendar.unselect();
  };

  const handleBook = (data: Omit<AppointmentEvent, "id">) => {
    setEvents((prev) => [...prev, { ...data, id: `local-${Date.now()}` }]);
    showSnack(`Booked: ${data.extendedProps.patientName} — ${data.extendedProps.study}`);
  };

  const handleStatusChange = (id: string, status: SlotStatus) => {
    setEvents((prev) =>
      prev.map((e) => e.id === id ? { ...e, extendedProps: { ...e.extendedProps, status } } : e)
    );
    if (status === "done") {
      const confirmedEvt = events.find((e) => e.id === id);
      if (confirmedEvt && onConfirm) onConfirm({ ...confirmedEvt, extendedProps: { ...confirmedEvt.extendedProps, status: "done" } });
    }
    showSnack(`Marked as ${STATUS_META[status].label}`);
  };

  const dayHeaderContent = React.useCallback(
    (arg: { date: Date; view: { type: string } }) => {
      const dayName = arg.date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
      const isMonthView = arg.view?.type === "dayGridMonth";
      if (isMonthView) {
        return { html: `<div class="fc-hims-dayhead"><div class="fc-hims-dayname">${dayName}</div></div>` };
      }
      const dayNum = arg.date.getDate();
      const isToday = isSameDate(arg.date, new Date());
      return {
        html: `<div class="fc-hims-dayhead"><div class="fc-hims-dayname">${dayName}</div><div class="fc-hims-daynum${isToday ? " is-today" : ""}">${dayNum}</div></div>`,
      };
    },
    [],
  );

  return (
    <PageTemplate title="Radiology Schedule" currentPageTitle="Schedule" fullHeight>
      {/* Two-card layout: sidebar card + calendar card */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, gap: 1.25 }}>

        {/* ── Left: Today's Summary card ── */}
        <Box
          sx={{
            width: 250,
            flexShrink: 0,
            borderRadius: '16px',
            border: '1px solid #DDE8F0',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Sidebar
            events={events}
            onUnscheduledBook={() => {
              const start = new Date();
              start.setMinutes(0, 0, 0);
              start.setHours(start.getHours() + 1);
              setBookDialog({ open: true, start: start.toISOString(), resource: "xray" });
            }}
            selectedResourceId={selectedResourceId}
            setSelectedResourceId={setSelectedResourceId}
          />
        </Box>

        {/* ── Right: Calendar card ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            borderRadius: '16px',
            border: '1px solid #DDE8F0',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Toolbar row 1: view switcher + nav + new booking */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2,
              height: 56,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
            }}
          >
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ whiteSpace: "nowrap" }}>
                Radiology Schedule
              </Typography>
              <Stack
                direction="row"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: "3px",
                  gap: "3px",
                }}
              >
                {[
                  { value: "resourceTimeGridDay", label: "Day" },
                  { value: "timeGridWeek", label: "Week" },
                  { value: "dayGridMonth", label: "Month" },
                ].map(({ value, label }) => (
                  <Box
                    key={value}
                    onClick={() => changeView(value)}
                    sx={{
                      px: 1.75, py: 0.5, borderRadius: 1,
                      fontSize: "0.8125rem",
                      fontWeight: calendarView === value ? 700 : 500,
                      color: calendarView === value ? "primary.main" : "text.secondary",
                      bgcolor: calendarView === value ? "background.paper" : "transparent",
                      boxShadow: calendarView === value ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="small" variant="outlined"
                  onClick={() => calendarRef.current?.getApi().today()}
                  sx={{ borderRadius: 1.5, fontWeight: 700, px: 2 }}
                >
                  Today
                </Button>
                <IconButton size="small" onClick={() => calendarRef.current?.getApi().prev()} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2" fontWeight={800} minWidth={180} textAlign="center">
                  {calendarTitle}
                </Typography>
                <IconButton size="small" onClick={() => calendarRef.current?.getApi().next()} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained" size="small" startIcon={<AddIcon />}
                onClick={() => setBookDialog((b) => ({ ...b, open: true }))}
                sx={{ px: 2, fontWeight: 700 }}
              >
                New Booking
              </Button>
            </Box>
          </Stack>

          {/* Toolbar row 2: status filter chips */}
          <Stack
            direction="row" alignItems="center"
            sx={{
              px: 2, height: 44,
              borderBottom: "1px solid", borderColor: "divider",
              bgcolor: "background.paper", flexShrink: 0,
              overflowX: "auto", "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mr: 1, textTransform: "uppercase" }}>
                Filter:
              </Typography>
              <Chip
                label="All Status" size="small"
                onClick={() => setStatusFilter("all")}
                sx={{
                  height: 24,
                  ...(statusFilter === "all" ? getPrimaryChipSx(theme) : { bgcolor: "transparent", border: "1px solid transparent" }),
                  fontWeight: statusFilter === "all" ? 700 : 500,
                }}
              />
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <Chip
                  key={key} label={meta.label} size="small"
                  onClick={() => setStatusFilter(key)}
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: meta.accent, ml: 1 }} />}
                  sx={{
                    height: 24,
                    bgcolor: statusFilter === key ? meta.bg : "transparent",
                    border: statusFilter === key ? `1px solid ${meta.border}` : "1px solid transparent",
                    color: meta.textColor,
                    fontWeight: statusFilter === key ? 700 : 500,
                    "& .MuiChip-icon": { ml: 0.5, mr: -0.5 },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Calendar — exact same CSS as original */}
          <Box
            sx={{
              flex: 1, minHeight: 0, overflow: "hidden",
              "& .fc-hims-dayhead": { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", py: "10px" },
              "& .fc-hims-dayname": { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.palette.text.secondary },
              "& .fc-hims-daynum": { width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "0.95rem", fontWeight: 700, color: theme.palette.text.primary, backgroundColor: "transparent" },
              "& .fc-hims-daynum.is-today": { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
              "& .fc": { fontFamily: "Inter, sans-serif", color: theme.palette.text.primary, "--fc-border-color": alpha(theme.palette.divider, 0.15), "--fc-page-bg-color": theme.palette.background.paper, "--fc-neutral-bg-color": alpha(theme.palette.primary.main, 0.04), "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.06), height: "100%" },
              "& .fc-scrollgrid": { borderColor: "transparent" },
              "& .fc-theme-standard td, & .fc-theme-standard th": { borderColor: alpha(theme.palette.divider, 0.1) },
              "& .fc-col-header-cell": { bgcolor: alpha(theme.palette.primary.main, 0.04), fontWeight: 600, borderColor: alpha(theme.palette.divider, 0.15) },
              "& .fc-col-header-cell-cushion": { p: 0, textDecoration: "none", color: "inherit", display: "flex", justifyContent: "center" },
              "& .fc-timegrid-slot": { height: 54, borderColor: alpha(theme.palette.divider, 0.1) },
              "& .fc-timegrid-slot-minor": { borderColor: "transparent" },
              "& .fc-timegrid-axis": { fontSize: "0.72rem", color: theme.palette.text.secondary },
              "& .fc-timegrid-now-indicator-line": { borderColor: theme.palette.primary.main },
              "& .fc-timegrid-slot-label": { fontSize: "0.72rem", color: theme.palette.text.secondary },
              "& .fc-event": { borderRadius: "6px", boxShadow: "none", cursor: "pointer" },
              "& .fc-event-main": { color: theme.palette.text.primary, fontSize: "0.78rem", lineHeight: 1.3 },
              "& .fc-timegrid-event-harness, & .fc-timegrid-event-harness-inset": { left: "2px !important", right: "2px !important" },
              "& .fc-timegrid-event": { minHeight: 28 },
              "& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={false}
              resources={filteredResources}
              events={visibleEvents}
              selectable selectMirror editable nowIndicator
              slotMinTime="07:00:00" slotMaxTime="20:00:00" allDaySlot={false}
              eventContent={(info) => <EventContent info={info} />}
              eventClick={handleEventClick}
              select={handleDateSelect}
              datesSet={handleDatesSet}
              dayHeaderContent={dayHeaderContent}
              height="100%"
              stickyHeaderDates
            />
          </Box>
        </Box>
      </Box>

      <EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} onStatusChange={handleStatusChange} />
      <BookSlotDialog open={bookDialog.open} defaultStart={bookDialog.start} defaultResource={bookDialog.resource} onClose={() => setBookDialog((b) => ({ ...b, open: false }))} onBook={handleBook} />
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} message={snack.message} />
    </PageTemplate>
  );
}
