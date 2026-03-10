"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventHoveringArg,
  EventInput,
} from "@fullcalendar/core";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useTheme } from "@/src/ui/theme";
import { alpha } from "@mui/material";
import { getPrimaryChipSx } from "@/src/core/theme/surfaces";
import {
  Add as AddIcon,
  BeachAccess as BeachAccessIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  LocalCafe as LocalCafeIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useUser } from "@/src/core/auth/UserContext";
import {
  getAppointmentsForRange,
  getDepartments,
  getDoctorScheduleList,
  getScheduleBlocksForRange,
  getScheduleBlocksForWeek,
  getScheduleSummary,
  type BookedAppointment,
  type ScheduleBlock,
  type ScheduleBlockType,
} from "@/src/mocks/doctor-schedule-mock";
import CustomRepeatDialog, { type CustomRepeatConfig } from "./components/CustomRepeatDialog";

// ─── Avatar colors ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#1172BA",
  "#0B84D0",
  "#2FA77A",
  "#E77B7B",
  "#F3C44E",
  "#7C3AED",
  "#059669",
  "#2C8AD3",
  "#DC2626",
  "#9333EA",
];
function getAvatarColor(name: string) {
  return AVATAR_COLORS[
    Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
      AVATAR_COLORS.length
  ];
}
// ─── Date helpers ─────────────────────────────────────────────────────────────
function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatTime = (date: Date) =>
  `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;

const fmt12 = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${`${m}`.padStart(2, "0")}${period}`;
};

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
/** Get all YYYY-MM-DD dates between start and end (inclusive) */
function getDatesBetween(startStr: string, endStr: string): string[] {
  const out: string[] = [];
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  if (end < start) return out;
  const pad = (n: number) => String(n).padStart(2, "0");
  const cursor = new Date(start);
  while (cursor <= end) {
    out.push(
      `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`,
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
/** Get YYYY-MM-DD for a day name in the given week (weekStart = Monday) */
function getDateForDay(weekStart: Date, dayName: string): string {
  const idx = DAY_NAMES.indexOf(dayName as (typeof DAY_NAMES)[number]);
  const d = new Date(weekStart);
  d.setDate(weekStart.getDate() + (idx >= 0 ? idx : 0));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Generate dates from custom repeat config (Google Calendar–like). Max 730 occurrences. */
function getDatesFromCustomRepeat(
  config: CustomRepeatConfig,
  startDateStr: string,
): string[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const toStr = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const start = new Date(startDateStr + "T12:00:00");
  const out: string[] = [];
  const maxOccurrences = 730;

  const endDate =
    config.endType === "end_date" && config.endDate
      ? new Date(config.endDate + "T23:59:59")
      : null;

  const shouldStop = () => {
    if (config.endType === "end_after" && out.length >= config.endAfter)
      return true;
    if (out.length >= maxOccurrences) return true;
    return false;
  };

  if (config.frequency === "daily") {
    let cursor = new Date(start);
    while (!shouldStop()) {
      if (endDate && cursor > endDate) break;
      out.push(toStr(cursor));
      cursor.setDate(cursor.getDate() + config.interval);
    }
  } else if (config.frequency === "weekly" && config.days.length > 0) {
    // Week start = Monday
    const getMonday = (d: Date) => {
      const x = new Date(d);
      const day = x.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      x.setDate(x.getDate() + diff);
      x.setHours(0, 0, 0, 0);
      return x;
    };
    let weekStart = getMonday(start);
    while (!shouldStop()) {
      for (const dayName of config.days) {
        const idx = DAY_NAMES.indexOf(dayName as (typeof DAY_NAMES)[number]);
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + idx);
        if (d >= start) {
          if (endDate && d > endDate) return out;
          out.push(toStr(d));
          if (shouldStop()) return out;
        }
      }
      const next = new Date(weekStart);
      next.setDate(next.getDate() + config.interval * 7);
      weekStart = next;
      if (endDate && weekStart > endDate) break;
    }
  } else if (config.frequency === "monthly") {
    let cursor = new Date(start);
    while (!shouldStop()) {
      if (endDate && cursor > endDate) break;
      out.push(toStr(cursor));
      cursor.setMonth(cursor.getMonth() + config.interval);
    }
  } else if (config.frequency === "yearly") {
    let cursor = new Date(start);
    while (!shouldStop()) {
      if (endDate && cursor > endDate) break;
      out.push(toStr(cursor));
      cursor.setFullYear(cursor.getFullYear() + config.interval);
    }
  }

  return config.endType === "end_after"
    ? out.slice(0, config.endAfter)
    : out;
}

// ─── Block → FullCalendar event ──────────────────────────────────────────────
function blocksToEvents(blocks: ScheduleBlock[]): EventInput[] {
  return blocks.map((block) => {
    const isFullDay =
      block.type === "leave" &&
      block.startTime === "00:00" &&
      block.endTime === "23:59";
    // Block: text only for Break and Leave; Availability and appointments show as before
    const title =
      block.type === "availability" ? "" : block.type === "break" ? "Break" : "Leave";
    if (isFullDay) {
      return {
        id: block.id,
        title,
        start: block.date,
        end: nextDay(block.date),
        allDay: true,
        extendedProps: { block },
      };
    }
    return {
      id: block.id,
      title,
      start: `${block.date}T${block.startTime}:00`,
      end: `${block.date}T${block.endTime}:00`,
      extendedProps: { block },
    };
  });
}

/** Booked appointments → FullCalendar events (like Google Calendar) */
function appointmentsToEvents(appointments: BookedAppointment[]): EventInput[] {
  return appointments.map((apt) => ({
    id: apt.id,
    title: `${apt.patientName} – ${apt.startTime}-${apt.endTime}`,
    start: `${apt.date}T${apt.startTime}:00`,
    end: `${apt.date}T${apt.endTime}:00`,
    extendedProps: { isAppointment: true, appointment: apt },
  }));
}

// ─── Timezones (for Add Schedule form) ───────────────────────────────────────
const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
];

// ─── Legend / block colours (availability = sidebar menu / primary) ───────────
const LEGEND_COLOR: Record<ScheduleBlockType, string> = {
  availability: "#1172BA", // same as sidebar menu / primary
  break: "#F3C44E",
  leave: "#E77B7B",
  "show all": "#1F6AA5", // slate grey-blue (distinct from availability)
};

// ─── Types ────────────────────────────────────────────────────────────────────
type CalendarView = "timeGridWeek" | "timeGridDay" | "dayGridMonth";

/** Payload for API when creating/updating schedule. Replace submitScheduleWithApi with your API call. */
export interface ScheduleFormPayload {
  id?: string;
  type: "availability" | "break" | "leave";
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  serviceType?: "Home visit" | "Video call" | "In-clinic";
  durationMinutes?: number;
  repeatType?: "none" | "weekly" | "custom";
  repeatDays?: string;
  customStartDate?: string;
  customEndDate?: string;
  timezone?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DoctorSchedulePage() {
  const theme = useTheme();
  const calendarRef = React.useRef<FullCalendar | null>(null);

  // Calendar state
  const [calendarView, setCalendarView] =
    React.useState<CalendarView>("timeGridWeek");
  const [calendarTitle, setCalendarTitle] = React.useState("");
  const [weekStart, setWeekStart] = React.useState<Date>(() =>
    getWeekStart(new Date()),
  );
  const [visibleRange, setVisibleRange] = React.useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const { role: userRole } = useUser();
  const isDoctorView = userRole === "DOCTOR";

  // Sidebar state
  const [search, setSearch] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string | null>(
    null,
  );

  // Legend filter: which block types to show on calendar (Availability, Break, Leave, Show All)
  const [blockTypeFilter, setBlockTypeFilter] =
    React.useState<ScheduleBlockType>("show all");

  // Popover for event click (booked appointment only)
  const [appointmentAnchor, setAppointmentAnchor] = React.useState<{
    el: HTMLElement;
    appointment: BookedAppointment;
  } | null>(null);

  // Add Schedule drawer (add vs edit mode)
  const [addScheduleOpen, setAddScheduleOpen] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<ScheduleBlock | null>(
    null,
  );
  const isEditMode = Boolean(editingBlock);
  const [scheduleType, setScheduleType] = React.useState<
    "availability" | "break" | "leave"
  >("availability");
  const [addFormDoctor, setAddFormDoctor] = React.useState("");
  const [addFormDate, setAddFormDate] = React.useState("");
  const [addFormBreakDays, setAddFormBreakDays] = React.useState<string[]>([
    "Mon",
  ]);
  const [addFormServiceType, setAddFormServiceType] = React.useState<
    "Home visit" | "Video call" | "In-clinic"
  >("In-clinic");
  const [addFormDuration, setAddFormDuration] = React.useState("30");
  const [addFormAvailDays, setAddFormAvailDays] = React.useState<string[]>([
    "Mon",
  ]);
  const [addFormFrom, setAddFormFrom] = React.useState("09:00");
  const [addFormTo, setAddFormTo] = React.useState("13:00");
  const [addFormRepeatType, setAddFormRepeatType] = React.useState<
    "none" | "weekly" | "custom"
  >("none");
  const [addFormRepeatDays, setAddFormRepeatDays] = React.useState("Mon-Fri");
  const [addFormCustomStartDate, setAddFormCustomStartDate] =
    React.useState("");
  const [addFormCustomEndDate, setAddFormCustomEndDate] = React.useState("");
  const [addFormCustomRepeatConfig, setAddFormCustomRepeatConfig] =
    React.useState<CustomRepeatConfig | null>(null);
  const [customRepeatDialogOpen, setCustomRepeatDialogOpen] =
    React.useState(false);
  const [addFormTimezone, setAddFormTimezone] = React.useState("Asia/Kolkata");
  const [addFormNote, setAddFormNote] = React.useState("");

  // ─── Data ────────────────────────────────────────────────────────────────
  const doctors = React.useMemo(
    () => getDoctorScheduleList(weekStart),
    [weekStart],
  );
  const departments = React.useMemo(() => getDepartments(), []);

  const filteredDoctors = React.useMemo(() => {
    let list = doctors;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q),
      );
    }
    if (selectedDept) list = list.filter((d) => d.department === selectedDept);
    return list;
  }, [doctors, search, selectedDept]);

  // On first load, select the first doctor in the list
  const hasInitialDoctorSelected = React.useRef(false);
  React.useEffect(() => {
    if (filteredDoctors.length > 0 && !hasInitialDoctorSelected.current) {
      setSelectedDoctorId(filteredDoctors[0].id);
      hasInitialDoctorSelected.current = true;
    }
  }, [filteredDoctors]);

  const blocks = React.useMemo(() => {
    const start = visibleRange ? visibleRange.start : weekStart;
    const end = visibleRange
      ? visibleRange.end
      : (() => {
          const e = new Date(weekStart);
          e.setDate(e.getDate() + 6);
          return e;
        })();
    return getScheduleBlocksForRange(start, end);
  }, [visibleRange, weekStart]);
  const summary = React.useMemo(() => getScheduleSummary(blocks), [blocks]);

  // Pre-fill drawer form when opening in edit mode; reset when opening in add mode
  React.useEffect(() => {
    if (!addScheduleOpen) return;
    if (editingBlock) {
      const block = editingBlock;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayFromDate = dayNames[new Date(block.date + "T12:00:00").getDay()];
      setScheduleType(block.type as "availability" | "break" | "leave");
      setAddFormDoctor(block.doctorId);
      setAddFormDate(block.date);
      setAddFormBreakDays([dayFromDate]);
      setAddFormAvailDays([dayFromDate]);
      setAddFormFrom(block.startTime);
      setAddFormTo(block.endTime);
    } else {
      setScheduleType("availability");
      setAddFormDoctor(selectedDoctorId ?? "");
      setAddFormDate("");
      setAddFormBreakDays(["Mon"]);
      setAddFormAvailDays(["Mon"]);
      setAddFormFrom("09:00");
      setAddFormTo("13:00");
      setAddFormRepeatType("none");
      setAddFormRepeatDays("Mon-Fri");
      setAddFormCustomStartDate("");
      setAddFormCustomEndDate("");
      setAddFormCustomRepeatConfig(null);
      setAddFormTimezone("Asia/Kolkata");
      setAddFormNote("");
    }
  }, [addScheduleOpen, editingBlock, selectedDoctorId]);

  // Filter blocks by selected doctor
  const visibleBlocks = React.useMemo(() => {
    if (!selectedDoctorId) return blocks;
    return blocks.filter((b) => b.doctorId === selectedDoctorId);
  }, [blocks, selectedDoctorId]);

  // Filter blocks by legend type (Availability / Break / Leave / Show All) so week & month show same as day
  const filteredBlocksByType = React.useMemo(() => {
    if (blockTypeFilter === "show all") return visibleBlocks;
    return visibleBlocks.filter((b) => b.type === blockTypeFilter);
  }, [visibleBlocks, blockTypeFilter]);

  const appointmentsInRange = React.useMemo(() => {
    const start = visibleRange?.start ?? weekStart;
    const end =
      visibleRange?.end ??
      (() => {
        const e = new Date(weekStart);
        e.setDate(weekStart.getDate() + 6);
        return e;
      })();
    return getAppointmentsForRange(start, end, selectedDoctorId ?? undefined);
  }, [visibleRange, weekStart, selectedDoctorId]);

  const calendarEvents = React.useMemo(() => {
    const blockEvents = blocksToEvents(filteredBlocksByType);
    const showAppointments =
      blockTypeFilter === "show all" || blockTypeFilter === "availability";
    const appointmentEvents = showAppointments
      ? appointmentsToEvents(appointmentsInRange)
      : [];
    return [...blockEvents, ...appointmentEvents];
  }, [filteredBlocksByType, appointmentsInRange, blockTypeFilter]);

  // ─── Calendar callbacks ──────────────────────────────────────────────────
  const handleDatesSet = React.useCallback((arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCalendarView(arg.view.type as CalendarView);
    const start = arg.start;
    if (start && arg.end) {
      setVisibleRange({ start, end: arg.end });
      const d = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
      setWeekStart(d);
    }
  }, []);

  const dayHeaderContent = React.useCallback(
    (arg: { date: Date; view: { type: string } }) => {
      const dayName = arg.date
        .toLocaleDateString(undefined, { weekday: "short" })
        .toUpperCase();
      const isMonthView = arg.view?.type === "dayGridMonth";
      if (isMonthView) {
        return {
          html: `<div class="fc-hims-dayhead"><div class="fc-hims-dayname">${dayName}</div></div>`,
        };
      }
      const dayNum = arg.date.getDate();
      const isToday = isSameDate(arg.date, new Date());
      return {
        html: `<div class="fc-hims-dayhead"><div class="fc-hims-dayname">${dayName}</div><div class="fc-hims-daynum${isToday ? " is-today" : ""}">${dayNum}</div></div>`,
      };
    },
    [],
  );

  // Appointment tooltip on hover (right side), NOT on click
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleEventMouseEnter = React.useCallback((info: EventHoveringArg) => {
    const props = info.event.extendedProps as {
      isAppointment?: boolean;
      appointment?: BookedAppointment;
    };
    if (props.isAppointment && props.appointment) {
      // Small delay so fast-passes don't flash the tooltip
      hoverTimeoutRef.current = setTimeout(() => {
        setAppointmentAnchor({ el: info.el, appointment: props.appointment! });
      }, 120);
    }
  }, []);

  const handleEventMouseLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setAppointmentAnchor(null);
  }, []);

  const handleEventClick = React.useCallback((info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const props = info.event.extendedProps as {
      block?: ScheduleBlock;
      isAppointment?: boolean;
    };
    // Appointment: tooltip is on hover, click does nothing extra
    if (props.isAppointment) return;
    // Block: open edit drawer
    if (props.block) {
      setAppointmentAnchor(null);
      setEditingBlock(props.block);
      setAddScheduleOpen(true);
    }
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const changeView = (v: CalendarView) => {
    setCalendarView(v);
    calendarRef.current?.getApi().changeView(v);
  };

  const selectedDoctor = React.useMemo(
    () =>
      selectedDoctorId ? doctors.find((d) => d.id === selectedDoctorId) : null,
    [doctors, selectedDoctorId],
  );

  /** Build API payload(s) from form. For repeat availability returns one payload per day; otherwise one. */
  const getSchedulePayloads = React.useCallback((): ScheduleFormPayload[] => {
    const base: Omit<ScheduleFormPayload, "date"> = {
      ...(editingBlock?.id && { id: editingBlock.id }),
      type: scheduleType,
      doctorId: addFormDoctor,
      startTime: addFormFrom,
      endTime: addFormTo,
      ...(addFormNote?.trim() && { note: addFormNote.trim() }),
      ...(scheduleType === "availability" && {
        serviceType: addFormServiceType,
        durationMinutes: Number(addFormDuration) || 30,
        repeatType: addFormRepeatType,
        repeatDays:
          addFormRepeatType === "weekly" ? addFormRepeatDays : undefined,
        customStartDate:
          addFormRepeatType === "custom" ? addFormCustomStartDate : undefined,
        customEndDate:
          addFormRepeatType === "custom" ? addFormCustomEndDate : undefined,
        timezone: addFormTimezone,
      }),
    };
    if (scheduleType === "leave") {
      return [{ ...base, date: addFormDate }];
    }
    if (scheduleType === "break") {
      const days =
        addFormBreakDays.length > 0 ? addFormBreakDays : ["Mon"];
      return days.map((day) => ({
        ...base,
        date: getDateForDay(weekStart, day),
      }));
    }
    if (scheduleType === "availability") {
      const defaultDay = addFormAvailDays[0] ?? "Mon";
      if (addFormRepeatType === "none") {
        const days = addFormAvailDays.length > 0 ? addFormAvailDays : ["Mon"];
        return days.map((day) => ({
          ...base,
          date: getDateForDay(weekStart, day),
        }));
      }
      if (addFormRepeatType === "custom") {
        if (addFormCustomRepeatConfig?.startDate) {
          const dates = getDatesFromCustomRepeat(
            addFormCustomRepeatConfig,
            addFormCustomRepeatConfig.startDate,
          );
          if (dates.length === 0)
            return [{ ...base, date: getDateForDay(weekStart, defaultDay) }];
          return dates.map((date) => ({ ...base, date }));
        }
        if (addFormCustomStartDate && addFormCustomEndDate) {
          const dates = getDatesBetween(
            addFormCustomStartDate,
            addFormCustomEndDate,
          );
          if (dates.length === 0)
            return [{ ...base, date: getDateForDay(weekStart, defaultDay) }];
          return dates.map((date) => ({ ...base, date }));
        }
        return [{ ...base, date: getDateForDay(weekStart, defaultDay) }];
      }
      let days: string[] = [];
      const range = addFormRepeatDays;
      if (range === "Mon-Fri") days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      else if (range === "Mon-Sat")
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      else days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day) => ({
        ...base,
        date: getDateForDay(weekStart, day),
      }));
    }
    return [];
  }, [
    scheduleType,
    addFormDoctor,
    addFormFrom,
    addFormTo,
    addFormNote,
    addFormDate,
    addFormBreakDays,
    addFormAvailDays,
    addFormRepeatType,
    addFormRepeatDays,
    addFormCustomStartDate,
    addFormCustomEndDate,
    addFormCustomRepeatConfig,
    addFormTimezone,
    addFormServiceType,
    addFormDuration,
    weekStart,
    editingBlock?.id,
  ]);

  /**
   * Replace this with your API call when integrating.
   * Example: await api.post('/schedule', payload) or await api.put(`/schedule/${payload.id}`, payload)
   */
  const submitScheduleWithApi = React.useCallback(
    async (payload: ScheduleFormPayload): Promise<boolean> => {
      // TODO: Replace with actual API call. Payload has all form values.
      console.log("Schedule payload (send this to API):", payload);
      return true;
    },
    [],
  );

  const handleSaveSchedule = React.useCallback(async () => {
    const payloads = getSchedulePayloads();
    if (!payloads.length) return;
    try {
      for (const payload of payloads) {
        const ok = await submitScheduleWithApi(payload);
        if (!ok) return;
      }
      setAddScheduleOpen(false);
      setEditingBlock(null);
    } catch (e) {
      console.error("Schedule submit failed:", e);
    }
  }, [getSchedulePayloads, submitScheduleWithApi]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <PageTemplate
      title="Doctor Schedule"
      subtitle="Manage availability, breaks and leaves globally"
    >
      {/* ── Outer shell: sidebar + calendar ── */}
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 160px)",
          minHeight: 480,
          // border: "1px solid",
          // borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* ═══════════════ LEFT SIDEBAR (hidden for doctor — they see only their schedule) ═══════════════ */}
        {!isDoctorView && (
        <Box
          sx={{
            width: 272,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          {/* Search + dept chips */}
          <Box
            sx={{
              p: 1.5,
              // borderTop: "1px solid",
              // borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Title row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color="text.primary"
              >
                Doctors
              </Typography>
              <Chip
                label={`${filteredDoctors.length}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </Stack>

            {/* Search field */}
            <TextField
              size="small"
              placeholder="Search by name or dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  fontSize: "0.8125rem",
                },
              }}
            />

            {/* Department chips — horizontal scroll, no scrollbar */}
            <Box
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                mx: -0.5,
                px: 0.5,
                py: 0.5,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Stack direction="row" flexWrap="nowrap" gap={0.5}>
                <Chip
                  label="All"
                  size="small"
                  onClick={() => setSelectedDept(null)}
                  sx={{
                    flexShrink: 0,
                    ...(!selectedDept
                      ? {
                          ...getPrimaryChipSx(theme),
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }
                      : {
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          fontWeight: 500,
                          fontSize: "0.7rem",
                        }),
                  }}
                />
                {departments.map((dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    size="small"
                    onClick={() =>
                      setSelectedDept(selectedDept === dept ? null : dept)
                    }
                    sx={{
                      flexShrink: 0,
                      ...(selectedDept === dept
                        ? {
                            ...getPrimaryChipSx(theme),
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }
                        : {
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            fontWeight: 500,
                            fontSize: "0.7rem",
                          }),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Doctor list — flat list */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {filteredDoctors.map((doc) => (
              <ListItemButton
                key={doc.id}
                selected={selectedDoctorId === doc.id}
                onClick={() =>
                  setSelectedDoctorId(
                    selectedDoctorId === doc.id ? null : doc.id,
                  )
                }
                sx={{
                  py: 0.875,
                  px: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: getAvatarColor(doc.name),
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: 1.5,
                    flexShrink: 0,
                  }}
                >
                  {doc.initials}
                </Avatar>

                <ListItemText
                  primary={doc.name}
                  secondary={doc.specialty}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    noWrap: true,
                  }}
                  sx={{ ml: 1.25, minWidth: 0 }}
                />

                <Stack
                  direction="row"
                  spacing={0.25}
                  sx={{ ml: 0.5, flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: doc.hasAvailability
                        ? LEGEND_COLOR.availability
                        : "grey.300",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: doc.hasBreak ? LEGEND_COLOR.break : "grey.300",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: doc.hasLeave ? LEGEND_COLOR.leave : "grey.300",
                    }}
                  />
                </Stack>
              </ListItemButton>
            ))}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {filteredDoctors.length} doctors
            </Typography>
            {selectedDoctorId && (
              <Typography
                variant="caption"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedDoctorId(null)}
              >
                ✕ Clear
              </Typography>
            )}
          </Box>
        </Box>
        )}

        {/* ═══════════════ MAIN CALENDAR AREA ═══════════════ */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* ── Toolbar ── */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2,
              height: 52,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
            }}
          >
            {/* Left: View switcher */}
            <Box
              sx={{
                flex: "1 1 0",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: "2px",
                  gap: "2px",
                }}
              >
                {(
                  [
                    { value: "timeGridWeek", label: "Week" },
                    { value: "timeGridDay", label: "Day" },
                    // { value: "dayGridMonth", label: "Month" },
                  ] as { value: CalendarView; label: string }[]
                ).map(({ value, label }) => (
                  <Box
                    key={value}
                    onClick={() => changeView(value)}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.8125rem",
                      fontWeight: calendarView === value ? 700 : 500,
                      color:
                        calendarView === value
                          ? "primary.main"
                          : "text.secondary",
                      bgcolor:
                        calendarView === value
                          ? "background.paper"
                          : "transparent",
                      boxShadow:
                        calendarView === value
                          ? "0 1px 2px rgba(16,24,40,.06)"
                          : "none",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all .15s",
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Center: Today + date navigation */}
            <Box
              sx={{ flex: "1 1 0", display: "flex", justifyContent: "center" }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => calendarRef.current?.getApi().today()}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    minWidth: "auto",
                    px: 1.5,
                    py: 0.4,
                  }}
                >
                  Today
                </Button>
                <IconButton
                  size="small"
                  onClick={() => calendarRef.current?.getApi().prev()}
                  sx={{
                    width: 28,
                    height: 28,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  fontFamily="Manrope, sans-serif"
                  sx={{
                    minWidth: 185,
                    textAlign: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  {calendarTitle || "—"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => calendarRef.current?.getApi().next()}
                  sx={{
                    width: 28,
                    height: 28,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Right: Add Schedule */}
            <Box
              sx={{
                flex: "1 1 0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                onClick={() => setAddScheduleOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  py: 0.6,
                  px: 1.5,
                  minHeight: 32,
                }}
              >
                Add Schedule
              </Button>
            </Box>
          </Stack>

          {/* ── Legend bar ── */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              height: 38,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            {/* Legend pills — clickable to filter calendar by type (Show All first) */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {(
                [
                  { type: "show all", label: "Show All" },
                  { type: "availability", label: "Availability" },
                  { type: "break", label: "Break" },
                  { type: "leave", label: "Leave" },
                ] as { type: ScheduleBlockType; label: string }[]
              ).map(({ type, label }) => {
                const isSelected = blockTypeFilter === type;
                const color = LEGEND_COLOR[type];
                return (
                  <Stack
                    key={type}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    onClick={() => setBlockTypeFilter(type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setBlockTypeFilter(type);
                      }
                    }}
                    sx={{
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 20,
                      border: "1px solid",
                      borderColor: isSelected ? color : alpha(color, 0.4),
                      bgcolor: isSelected ? color : alpha(color, 0.12),
                      color: isSelected ? "#fff" : undefined,
                      cursor: "pointer",
                      transition: "border-color .15s, background-color .15s",
                      "&:hover": {
                        bgcolor: isSelected ? color : alpha(color, 0.25),
                        borderColor: alpha(color, 0.7),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: isSelected ? "#fff" : color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={isSelected ? 700 : 500}
                      sx={{
                        fontSize: "0.75rem",
                        color: isSelected ? "#fff" : color,
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            {/* Stats — last (right) */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="caption"
                sx={{ color: LEGEND_COLOR.availability, fontWeight: 500 }}
              >
                Avail: <strong>{summary.available}</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: LEGEND_COLOR.break, fontWeight: 500 }}
              >
                Break: <strong>{summary.onBreak}</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: LEGEND_COLOR.leave, fontWeight: 500 }}
              >
                Leave: <strong>{summary.onLeave}</strong>
              </Typography>
            </Stack>
          </Stack>

          {/* ── FullCalendar ── */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",

              // ── Custom day-header cells (week view: day name + date number) ──
              "& .fc-hims-dayhead": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                py: "10px",
              },
              "& .fc-hims-dayname": {
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: theme.palette.text.secondary,
              },
              "& .fc-hims-daynum": {
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: theme.palette.text.primary,
                backgroundColor: "transparent",
              },
              "& .fc-hims-daynum.is-today": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },

              // ── FullCalendar base styles ────────────────────────────
              "& .fc": {
                fontFamily: "Inter, sans-serif",
                color: theme.palette.text.primary,
                "--fc-border-color": alpha(theme.palette.divider, 0.15),
                "--fc-page-bg-color": theme.palette.background.paper,
                "--fc-neutral-bg-color": alpha(
                  theme.palette.primary.main,
                  0.04,
                ),
                "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.06),
                height: "100%",
              },
              "& .fc-scrollgrid": { borderColor: "transparent" },
              "& .fc-theme-standard td, & .fc-theme-standard th": {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .fc-col-header-cell": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                fontWeight: 600,
                borderColor: alpha(theme.palette.divider, 0.15),
              },
              "& .fc-col-header-cell-cushion": {
                p: 0,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                justifyContent: "center",
              },

              // time grid
              "& .fc-timegrid-slot": {
                height: 54,
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .fc-timegrid-slot-minor": { borderColor: "transparent" },
              "& .fc-timegrid-axis": {
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
              },
              "& .fc-timegrid-now-indicator-line": {
                borderColor: theme.palette.primary.main,
              },
              "& .fc-timegrid-slot-label": {
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
              },

              // events
              "& .fc-event": {
                borderRadius: "6px",
                boxShadow: "none",
                cursor: "pointer",
              },
              "& .fc-event-main": {
                color: theme.palette.text.primary,
                fontSize: "0.78rem",
                lineHeight: 1.3,
              },
              "& .fc-timegrid-event-harness, & .fc-timegrid-event-harness-inset":
                {
                  left: "2px !important",
                  right: "2px !important",
                },
              "& .fc-timegrid-event": { minHeight: 28 },
              "& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today":
                {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={false}
              height="100%"
              scrollTime="06:00:00"
              nowIndicator
              allDaySlot={true}
              dayMaxEvents={10}
              expandRows
              stickyHeaderDates
              stickyFooterScrollbar
              slotEventOverlap={false}
              eventOverlap={false}
              eventMaxStack={3}
              eventMinHeight={28}
              slotLabelInterval={{ hours: 1 }}
              slotLabelFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
                omitZeroMinute: true,
              }}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              events={calendarEvents}
              datesSet={handleDatesSet}
              dayHeaderContent={dayHeaderContent}
              eventClick={handleEventClick}
              eventMouseEnter={handleEventMouseEnter}
              eventMouseLeave={handleEventMouseLeave}
              eventContent={(arg: EventContentArg) => {
                const isMonthView = arg.view?.type === "dayGridMonth";
                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                      px: "2px",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1.15,
                        opacity: 0.85,
                        color: isMonthView ? "#000" : undefined,
                      }}
                    >
                      {arg.event.title}
                    </Box>
                  </Box>
                );
              }}
              eventDidMount={(info) => {
                const props = info.event.extendedProps as {
                  block?: ScheduleBlock;
                  isAppointment?: boolean;
                  appointment?: BookedAppointment;
                };
                if (props.isAppointment) {
                  const blue = theme.palette.primary.main;
                  info.el.style.backgroundColor = alpha(blue, 0.18);
                  info.el.style.border = `1px solid ${alpha(blue, 0.5)}`;
                  info.el.style.borderLeft = `4px solid ${blue}`;
                  info.el.style.color = "#fff";
                  info.el.style.borderRadius = "6px";
                  return;
                }
                const block = props.block;
                if (!block) return;
                const color = LEGEND_COLOR[block.type];
                info.el.style.backgroundColor = alpha(color, 0.22);
                info.el.style.border = `1px solid ${alpha(color, 0.5)}`;
                info.el.style.color =
                  block.type === "break"
                    ? LEGEND_COLOR.break
                    : block.type === "leave"
                      ? LEGEND_COLOR.leave
                      : "#fff";
                info.el.style.borderRadius = "6px";
                info.el.style.borderLeft = `3px solid ${color}`;
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ═══════════════ APPOINTMENT TOOLTIP (hover → right side of event) ═══════════════ */}
      <Popover
        open={!!appointmentAnchor}
        anchorEl={appointmentAnchor?.el}
        onClose={() => setAppointmentAnchor(null)}
        disableRestoreFocus
        disableScrollLock
        sx={{ pointerEvents: "none" }}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0 12px 40px rgba(16,24,40,.18)",
              minWidth: 300,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            },
          },
        }}
      >
        {appointmentAnchor && (
          <Box
            sx={{
              borderLeft: "4px solid",
              borderColor: "primary.main",
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {appointmentAnchor.appointment.patientName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {appointmentAnchor.appointment.date}&nbsp;·&nbsp;
              {appointmentAnchor.appointment.startTime}&nbsp;·&nbsp;
              {appointmentAnchor.appointment.doctorName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "inline-block",
                mt: 1,
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              {appointmentAnchor.appointment.status}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Department:</strong>{" "}
              {appointmentAnchor.appointment.department}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>MRN:</strong> {appointmentAnchor.appointment.mrn}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Phone:</strong> {appointmentAnchor.appointment.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Complaint:</strong>{" "}
              {appointmentAnchor.appointment.complaint}
            </Typography>
          </Box>
        )}
      </Popover>

      {/* Add Schedule drawer (right side) */}
      <Drawer
        anchor="right"
        open={addScheduleOpen}
        onClose={() => {
          setAddScheduleOpen(false);
          setEditingBlock(null);
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100%",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ flex: 1, textAlign: "center" }}
            >
              {isEditMode ? "Edit Schedule" : "Add Schedule"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setAddScheduleOpen(false);
                setEditingBlock(null);
              }}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {/* Schedule type: Availability | Break | Leave */}
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ mb: 0.75, display: "block", fontSize: "0.7rem" }}
            >
              Schedule type
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {(
                [
                  {
                    value: "availability" as const,
                    label: "Availability",
                    Icon: CheckCircleIcon,
                  },
                  {
                    value: "break" as const,
                    label: "Break",
                    Icon: LocalCafeIcon,
                  },
                  {
                    value: "leave" as const,
                    label: "Leave",
                    Icon: BeachAccessIcon,
                  },
                ] as const
              ).map(({ value, label, Icon }) => {
                const isSelected = scheduleType === value;
                const primary = theme.palette.primary.main;
                return (
                  <Box
                    key={value}
                    onClick={() => setScheduleType(value)}
                    sx={{
                      flex: 1,
                      py: 1.25,
                      px: 1,
                      borderRadius: 1.5,
                      border: "1.5px solid",
                      borderColor: isSelected
                        ? primary
                        : theme.palette.divider,
                      bgcolor: isSelected ? alpha(primary, 0.12) : "transparent",
                      boxShadow: isSelected
                        ? `0 0 0 1px ${alpha(primary, 0.15)}`
                        : "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      transition: "border-color 0.2s, background-color 0.2s",
                      "&:hover": {
                        borderColor: isSelected
                          ? primary
                          : theme.palette.primary.main,
                        bgcolor: isSelected ? alpha(primary, 0.18) : "transparent",
                      },
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 22,
                        color: primary,
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        fontSize: "0.7rem",
                        color: isSelected
                          ? primary
                          : theme.palette.text.secondary,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {/* Doctor — hidden when logged in as doctor (they manage only their schedule) */}
            {!isDoctorView && (
              <TextField
                select
                fullWidth
                label="Doctor"
                value={addFormDoctor}
                onChange={(e) => setAddFormDoctor(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Select doctor</MenuItem>
                {filteredDoctors.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} - {d.specialty}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Break: Day (multiple), Start Time, End Time */}
            {scheduleType === "break" && (
              <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Day"
                  size="small"
                  value={addFormBreakDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAddFormBreakDays(
                      Array.isArray(v) ? v : v ? [v] : [],
                    );
                  }}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) =>
                      (selected as string[]).join(", ") || "Select days",
                  }}
                >
                  <MenuItem value="Mon">Mon</MenuItem>
                  <MenuItem value="Tue">Tue</MenuItem>
                  <MenuItem value="Wed">Wed</MenuItem>
                  <MenuItem value="Thu">Thu</MenuItem>
                  <MenuItem value="Fri">Fri</MenuItem>
                  <MenuItem value="Sat">Sat</MenuItem>
                  <MenuItem value="Sun">Sun</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  size="small"
                  value={addFormFrom}
                  onChange={(e) => setAddFormFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  size="small"
                  value={addFormTo}
                  onChange={(e) => setAddFormTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            )}

            {/* Date (for Leave only; Availability uses Day) */}
            {scheduleType === "leave" && (
              <TextField
                fullWidth
                label="Date"
                type="date"
                size="small"
                value={addFormDate}
                onChange={(e) => setAddFormDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            )}

            {/* Availability only: Service type, Duration, Day, Timezone */}
            {scheduleType === "availability" && (
              <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Service type"
                  size="small"
                  value={addFormServiceType}
                  onChange={(e) =>
                    setAddFormServiceType(
                      e.target.value as
                        | "Home visit"
                        | "Video call"
                        | "In-clinic",
                    )
                  }
                >
                  <MenuItem value="Home visit">Home visit</MenuItem>
                  <MenuItem value="Video call">Video call</MenuItem>
                  <MenuItem value="In-clinic">In-clinic</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Duration"
                  size="small"
                  value={addFormDuration}
                  onChange={(e) => setAddFormDuration(e.target.value)}
                >
                  <MenuItem value="15">15 minutes</MenuItem>
                  <MenuItem value="30">30 minutes</MenuItem>
                  <MenuItem value="45">45 minutes</MenuItem>
                  <MenuItem value="60">60 minutes</MenuItem>
                  <MenuItem value="90">90 minutes</MenuItem>
                </TextField>
                {addFormRepeatType !== "custom" && (
                  <TextField
                    select
                    fullWidth
                    label="Day (multiple select)"
                    size="small"
                    value={addFormAvailDays}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAddFormAvailDays(
                        typeof v === "string" ? (v ? [v] : []) : v,
                      );
                    }}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) =>
                        (selected as string[]).join(", "),
                    }}
                  >
                    <MenuItem value="Mon">Mon</MenuItem>
                    <MenuItem value="Tue">Tue</MenuItem>
                    <MenuItem value="Wed">Wed</MenuItem>
                    <MenuItem value="Thu">Thu</MenuItem>
                    <MenuItem value="Fri">Fri</MenuItem>
                    <MenuItem value="Sat">Sat</MenuItem>
                    <MenuItem value="Sun">Sun</MenuItem>
                  </TextField>
                )}
                <TextField
                  select
                  fullWidth
                  label="Timezone"
                  size="small"
                  value={addFormTimezone}
                  onChange={(e) => setAddFormTimezone(e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz} value={tz}>
                      {tz}
                    </MenuItem>
                  ))}
                  </TextField>
              </Stack>
            )}

            {/* Start time / End time (Availability, Leave); Break has its own block above */}
            {scheduleType !== "break" && (
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={
                    scheduleType === "availability" ? "Start time" : "From"
                  }
                  type="time"
                  size="small"
                  value={addFormFrom}
                  onChange={(e) => setAddFormFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label={scheduleType === "availability" ? "End time" : "To"}
                  type="time"
                  size="small"
                  value={addFormTo}
                  onChange={(e) => setAddFormTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            )}

            {/* Repeat: None / Weekly / Custom (Availability only) */}
            {scheduleType === "availability" && (
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Repeat"
                  size="small"
                  value={addFormRepeatType}
                  onChange={(e) => {
                    const v = e.target.value as "none" | "weekly" | "custom";
                    setAddFormRepeatType(v);
                    if (v === "custom") {
                      setCustomRepeatDialogOpen(true);
                    }
                  }}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {addFormRepeatType === "weekly" && (
                  <TextField
                    select
                    fullWidth
                    label="Days"
                    size="small"
                    value={addFormRepeatDays}
                    onChange={(e) => setAddFormRepeatDays(e.target.value)}
                  >
                    <MenuItem value="Mon-Fri">Mon-Fri</MenuItem>
                    <MenuItem value="Mon-Sat">Mon-Sat</MenuItem>
                    <MenuItem value="All days">All days</MenuItem>
                  </TextField>
                )}
                {addFormRepeatType === "custom" && (
                  <Stack spacing={1.5}>
                    {addFormCustomRepeatConfig ? (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75} sx={{ mb: 1.25 }}>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {addFormCustomRepeatConfig.interval === 1
                              ? `Every ${addFormCustomRepeatConfig.frequency === "daily" ? "day" : addFormCustomRepeatConfig.frequency === "weekly" ? "week" : addFormCustomRepeatConfig.frequency === "monthly" ? "month" : "year"}`
                              : `Every ${addFormCustomRepeatConfig.interval} ${addFormCustomRepeatConfig.frequency === "daily" ? "days" : addFormCustomRepeatConfig.frequency === "weekly" ? "weeks" : addFormCustomRepeatConfig.frequency === "monthly" ? "months" : "years"}`}
                          </Typography>
                          {addFormCustomRepeatConfig.frequency === "weekly" &&
                            addFormCustomRepeatConfig.days.length > 0 && (
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  on
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                  {addFormCustomRepeatConfig.days.map((d) => (
                                    <Chip
                                      key={d}
                                      label={d}
                                      size="small"
                                      sx={{
                                        height: 24,
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                        color: "primary.main",
                                        border: "1px solid",
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                        "& .MuiChip-label": { px: 1 },
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </>
                            )}
                          {addFormCustomRepeatConfig.endType === "end_date" &&
                            addFormCustomRepeatConfig.endDate && (
                              <Typography variant="body2" color="text.secondary">
                                until {addFormCustomRepeatConfig.endDate}
                              </Typography>
                            )}
                        </Stack>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setCustomRepeatDialogOpen(true)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            borderColor: "primary.main",
                            color: "primary.main",
                            py: 0.5,
                            px: 1.5,
                            "&:hover": {
                              borderColor: "primary.dark",
                              color: "primary.dark",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          Customize
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCustomRepeatDialogOpen(true)}
                        sx={{
                          textTransform: "none",
                          alignSelf: "flex-start",
                          fontWeight: 600,
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            borderColor: "primary.dark",
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        Set custom repeat…
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            )}

            {/* Note */}
            <TextField
              fullWidth
              label="Note (optional)"
              placeholder="e.g. Specialist consultation..."
              multiline
              rows={3}
              value={addFormNote}
              onChange={(e) => setAddFormNote(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
          </Box>

          {/* Footer actions */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setAddScheduleOpen(false)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveSchedule}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {isEditMode ? "Update Schedule" : "Save Schedule"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <CustomRepeatDialog
        open={customRepeatDialogOpen}
        onClose={() => setCustomRepeatDialogOpen(false)}
        onSave={(config) => {
          setAddFormCustomRepeatConfig(config);
          setCustomRepeatDialogOpen(false);
        }}
        initialConfig={addFormCustomRepeatConfig ?? undefined}
        startDate={
          addFormCustomRepeatConfig?.startDate ||
          getDateForDay(weekStart, "Mon")
        }
      />
    </PageTemplate>
  );
}
