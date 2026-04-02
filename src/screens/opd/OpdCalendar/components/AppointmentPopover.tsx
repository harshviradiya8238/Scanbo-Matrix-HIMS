"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Popover,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import { OpdAppointment } from "../../opd-mock-data";
import { appointmentStatusColor } from "../types/opd-calendar.types";

interface AppointmentPopoverProps {
  selectedEvent: OpdAppointment | null;
  eventAnchor: HTMLElement | null;
  canManageCalendar: boolean;
  onClose: () => void;
  onReschedule: (appointment: OpdAppointment) => void;
  onCheckIn: (appointment: OpdAppointment) => void;
}

export function AppointmentPopover({
  selectedEvent,
  eventAnchor,
  canManageCalendar,
  onClose,
  onReschedule,
  onCheckIn,
}: AppointmentPopoverProps) {
  const theme = useTheme();

  return (
    <Popover
      open={Boolean(selectedEvent && eventAnchor)}
      anchorEl={eventAnchor}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      marginThreshold={24}
      PaperProps={{
        sx: {
          p: 2,
          borderRadius: 3,
          minWidth: 280,
          maxWidth: 360,
          width: "max-content",
          maxHeight: "70vh",
          overflowY: "auto",
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.25),
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
          position: "relative",
          overflow: "hidden",
          backgroundColor: theme.palette.common.white,
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: 6,
            height: "100%",
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
            {selectedEvent.date} · {selectedEvent.time} ·{" "}
            {selectedEvent.provider}
          </Typography>
          <Divider />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">
              <strong>Status:</strong>
            </Typography>
            <Chip
              color={
                selectedEvent.status === "Pending"
                  ? "primary"
                  : appointmentStatusColor[selectedEvent.status] || "default"
              }
              label={selectedEvent.status}
              size="small"
              sx={{ borderRadius: 1, fontWeight: 600, px: 0.5, py: 0 }}
            />
          </Stack>
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
              onClick={() => onReschedule(selectedEvent)}
            >
              Reschedule
            </Button>
            {selectedEvent.status === "Pending" && (
              <Button
                size="small"
                variant="contained"
                disabled={!canManageCalendar}
                onClick={() => onCheckIn(selectedEvent)}
              >
                Check In
              </Button>
            )}
          </Stack>
        </Stack>
      ) : null}
    </Popover>
  );
}
