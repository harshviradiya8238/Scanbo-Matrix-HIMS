"use client";

import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  SelectChangeEvent,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { CalendarView } from "../types/opd-calendar.types";

interface StatsPillProps {
  label: string;
  count: number | string;
}

function StatsPill({ label, count }: StatsPillProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.4,
        py: 0.55,
        borderRadius: 999,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.25),
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          fontSize: "0.72rem",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.common.white,
          fontWeight: 700,
          fontSize: "0.7rem",
          display: "grid",
          placeItems: "center",
        }}
      >
        {count}
      </Box>
    </Box>
  );
}

interface CalendarToolbarProps {
  calendarTitle: string;
  calendarView: CalendarView;
  directDate: string;
  availableSlotCount: number;
  appointmentStats: {
    checkedIn: number;
    inTriageConsult: number;
    noShow: number;
  };
  canManageCalendar: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewSelect: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent,
  ) => void;
  onNewBooking: () => void;
}

export function CalendarToolbar({
  calendarTitle,
  calendarView,
  directDate,
  availableSlotCount,
  appointmentStats,
  canManageCalendar,
  onPrev,
  onNext,
  onToday,
  onViewSelect,
  onNewBooking,
}: CalendarToolbarProps) {
  const theme = useTheme();

  return (
    <Stack
      spacing={1.2}
      sx={{
        p: 1.5,
        pb: 1,
        position: "sticky",
        top: 0,
        zIndex: 4,
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.2),
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        {/* Left: Navigation */}
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          flexWrap="wrap"
          sx={{ flexShrink: 0 }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={onToday}
            sx={{ borderRadius: 999, px: 2.5, fontWeight: 600 }}
          >
            Today
          </Button>
          <IconButton
            size="small"
            onClick={onPrev}
            aria-label="Previous"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onNext}
            aria-label="Next"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 1 }}>
            {calendarTitle || "Calendar"}
          </Typography>
        </Stack>

        {/* Center: Stats */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "center" },
            overflowX: "auto",
            py: 0.25,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: "nowrap", "& > *": { flexShrink: 0 } }}
          >
            <StatsPill
              label={`Slots on ${directDate}`}
              count={availableSlotCount}
            />
            <StatsPill label="Checked-In" count={appointmentStats.checkedIn} />
            <StatsPill
              label="In Triage / Consult"
              count={appointmentStats.inTriageConsult}
            />
            <StatsPill label="No Show" count={appointmentStats.noShow} />
          </Stack>
        </Box>

        {/* Right: View selector + New Booking */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ flexShrink: 0 }}
        >
          <TextField
            size="small"
            select
            label="View"
            value={calendarView}
            onChange={(e) => onViewSelect(e as SelectChangeEvent)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="dayGridMonth">Month</MenuItem>
            <MenuItem value="timeGridWeek">Week</MenuItem>
            <MenuItem value="timeGridDay">Day</MenuItem>
          </TextField>
          <Button
            size="small"
            variant="contained"
            disabled={!canManageCalendar}
            onClick={onNewBooking}
          >
            New Booking
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
