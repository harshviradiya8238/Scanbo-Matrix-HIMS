"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import { Box } from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import { OpdAppointment } from "../../opd-mock-data";
import { AppointmentStatus } from "../../opd-mock-data";
import { appointmentStatusColor } from "../types/opd-calendar.types";
import {
  calendarMinTime,
  calendarMaxTime,
  formatDuration,
  isSameDate,
} from "../utils/opd-calendar.utils";

interface OpdCalendarGridProps {
  calendarRef: React.RefObject<FullCalendar>;
  calendarContainerRef: React.RefObject<HTMLDivElement | null>;
  events: EventInput[];
  selectedEvent: OpdAppointment | null;
  selectedDate: string;
  calendarView: string;
  slotDurationMinutes: number;
  onDateClick: (arg: DateClickArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onDatesSet: (arg: DatesSetArg) => void;
}

export function OpdCalendarGrid({
  calendarRef,
  calendarContainerRef,
  events,
  selectedEvent,
  selectedDate,
  calendarView,
  slotDurationMinutes,
  onDateClick,
  onEventClick,
  onDatesSet,
}: OpdCalendarGridProps) {
  const theme = useTheme();

  const getStatusTone = React.useCallback(
    (status: AppointmentStatus) => {
      const tone = appointmentStatusColor[status];
      return tone === "default"
        ? theme.palette.grey[600]
        : theme.palette[tone].main;
    },
    [theme.palette],
  );

  const dayHeaderContent = React.useCallback(
    (arg: { date: Date; view: { type: string } }) => {
      const dayName = arg.date
        .toLocaleDateString(undefined, { weekday: "short" })
        .toUpperCase();
      if (arg.view.type === "dayGridMonth") {
        return {
          html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${dayName}</div></div>`,
        };
      }
      const dayNum = arg.date.getDate();
      const today = isSameDate(arg.date, new Date());
      return {
        html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${dayName}</div><div class="fc-scanbo-daynum${today ? " is-today" : ""}">${dayNum}</div></div>`,
      };
    },
    [],
  );

  const renderEventContent = React.useCallback((arg: EventContentArg) => {
    const kind = (arg.event.extendedProps as { kind?: string }).kind;
    if (kind === "availability") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            {arg.timeText}
          </span>
        </div>
      );
    }
    const appointment = (
      arg.event.extendedProps as { appointment?: OpdAppointment }
    ).appointment;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {arg.timeText}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {appointment?.patientName ?? arg.event.title}
        </span>
      </div>
    );
  }, []);

  return (
    <Box
      ref={calendarContainerRef}
      sx={{
        borderTop: "none",
        height: { xs: "70vh", md: "78vh" },
        minWidth: 0,
        "& .fc": {
          fontFamily: "Nunito, sans-serif",
          color: theme.palette.text.primary,
          "--fc-border-color": alpha(theme.palette.divider, 0.15),
          "--fc-page-bg-color": theme.palette.background.paper,
          "--fc-neutral-bg-color": alpha(theme.palette.primary.main, 0.04),
          "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.08),
        },
        "& .fc-toolbar": {
          m: 0,
          p: 1.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
        "& .fc-toolbar-title": { fontSize: "1.1rem", fontWeight: 700 },
        "& .fc-button": {
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          textTransform: "capitalize",
          boxShadow: "none",
          borderRadius: 10,
          padding: "6px 12px",
          fontWeight: 600,
        },
        "& .fc-button:hover": {
          backgroundColor: theme.palette.primary.dark,
          borderColor: theme.palette.primary.dark,
        },
        "& .fc-button-primary:not(:disabled).fc-button-active": {
          backgroundColor: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.main,
        },
        "& .fc-button:disabled": {
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
          borderColor: "transparent",
          color: theme.palette.common.white,
        },
        "& .fc-scrollgrid": { borderColor: "transparent" },
        "& .fc-theme-standard td, & .fc-theme-standard th": {
          borderColor: alpha(theme.palette.divider, 0.1),
        },
        "& .fc-col-header-cell": {
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          fontWeight: 600,
          color: theme.palette.text.primary,
          borderColor: alpha(theme.palette.divider, 0.2),
        },
        "& .fc-col-header-cell-cushion": {
          padding: 0,
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          justifyContent: "center",
        },
        "& .fc-scanbo-dayhead": {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "10px 0 8px",
        },
        "& .fc-scanbo-dayname": {
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: theme.palette.text.secondary,
        },
        "& .fc-scanbo-daynum": {
          fontSize: "1.35rem",
          fontWeight: 700,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.text.primary,
        },
        "& .fc-scanbo-daynum.is-today": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
        },
        "& .fc-daygrid-day-top": {
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 10,
        },
        "& .fc-timegrid-slot-label": {
          color: theme.palette.text.secondary,
          fontSize: "0.8rem",
        },
        "& .fc-timegrid-axis": {
          borderColor: alpha(theme.palette.divider, 0.2),
          color: theme.palette.text.secondary,
          fontSize: "0.8rem",
        },
        "& .fc-timegrid-axis-frame": {
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
        },
        "& .fc-timegrid-divider": {
          borderColor: alpha(theme.palette.divider, 0.2),
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
        },
        "& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        "& .fc-event": {
          borderRadius: 10,
          padding: "3px 6px",
          boxShadow: "none",
        },
        "& .fc-timegrid-event": { minHeight: 34 },
        "& .fc-timegrid-event-harness, & .fc-timegrid-event-harness-inset": {
          left: "2px !important",
          right: "2px !important",
        },
        "& .fc-event-selected": {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`,
        },
        "& .fc-event-main": {
          color: theme.palette.text.primary,
          fontSize: "0.85rem",
          lineHeight: 1.3,
          overflow: "hidden",
        },
        "& .fc-event-time": { fontWeight: 700, fontSize: "0.8rem" },
        "& .fc-event-title": { fontWeight: 700 },
        "& .fc-view-harness": { minHeight: "100%" },
        "& .fc-timegrid-slot": {
          borderColor: alpha(theme.palette.divider, 0.2),
          height: 36,
        },
        "& .fc-timegrid-slot-minor": { borderColor: "transparent" },
        "& .fc-timegrid-now-indicator-line": {
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
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
          omitZeroMinute: true,
        }}
        slotLabelInterval={{ hours: 1 }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
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
        dateClick={onDateClick}
        eventClick={onEventClick}
        datesSet={onDatesSet}
        dayHeaderContent={dayHeaderContent}
        eventContent={renderEventContent}
        eventDidMount={(info) => {
          const kind = (info.event.extendedProps as { kind?: string }).kind;
          if (kind === "availability") {
            info.el.style.backgroundColor = "transparent";
            info.el.style.border = `1px solid ${alpha(theme.palette.primary.main, 0.7)}`;
            info.el.style.color = theme.palette.primary.main;
            info.el.style.borderRadius = "10px";
            info.el.style.boxShadow = "none";
            info.el.style.cursor = "pointer";
            return;
          }
          const appointment = (
            info.event.extendedProps as { appointment?: OpdAppointment }
          ).appointment;
          if (!appointment) return;
          const tone = getStatusTone(appointment.status);
          info.el.style.backgroundColor = alpha(tone, 0.22);
          info.el.style.border = `1px solid ${alpha(tone, 0.55)}`;
          info.el.style.color = theme.palette.text.primary;
          info.el.style.borderRadius = "10px";
          info.el.style.boxShadow = `0 1px 2px ${alpha(tone, 0.2)}`;
          info.el.style.cursor = "pointer";
          if (selectedEvent && appointment.id === selectedEvent.id) {
            info.el.style.boxShadow = `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`;
          }
        }}
      />
    </Box>
  );
}
