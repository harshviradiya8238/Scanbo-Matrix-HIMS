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
  EventContentArg,
  DatesSetArg,
} from "@fullcalendar/core";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  FiberNew as FiberNewIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { getPrimaryChipSx } from "@/src/core/theme/surfaces";
import { PageTemplate } from "@/src/ui/components";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlotStatus = "done" | "scheduled" | "new" | "urgent";
export type Priority = "Routine" | "Urgent" | "STAT";

export interface ApptExtended {
  patientName: string;
  mrn: string;
  study: string;
  status: SlotStatus;
  priority: Priority;
  room: string;
}

export interface AppointmentEvent {
  id: string;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  extendedProps: ApptExtended;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RESOURCES = [
  { id: "xray", title: "X-RAY ROOM" },
  { id: "ct1", title: "CT ROOM 1" },
  { id: "usg", title: "USG ROOM" },
];

const STATUS_META: Record<
  SlotStatus,
  {
    label: string;
    bg: string;
    border: string;
    accent: string;
    textColor: string;
    Icon: React.ElementType;
  }
> = {
  done: {
    label: "Done",
    bg: "#fff",
    border: "#86efac",
    accent: "#16a34a",
    textColor: "#14532d",
    Icon: CheckCircleOutlineIcon,
  },
  scheduled: {
    label: "Scheduled",
    bg: "#eff6ff",
    border: "#93c5fd",
    accent: "#2563eb",
    textColor: "#1e3a8a",
    Icon: ScheduleIcon,
  },
  new: {
    label: "New",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    accent: "#0284c7",
    textColor: "#0c4a6e",
    Icon: FiberNewIcon,
  },
  urgent: {
    label: "STAT",
    bg: "#fff1f2",
    border: "#fca5a5",
    accent: "#dc2626",
    textColor: "#7f1d1d",
    Icon: WarningAmberIcon,
  },
};

const PRIORITY_COLOR: Record<Priority, "default" | "warning" | "error"> = {
  Routine: "default",
  Urgent: "warning",
  STAT: "error",
};

// ─── Mock Events ──────────────────────────────────────────────────────────────

function todayAt(h: number, m = 0): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function dayAt(offset: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const INITIAL_EVENTS: AppointmentEvent[] = [
  {
    id: "e1",
    resourceId: "xray",
    title: "M. Iyer",
    start: todayAt(8, 0),
    end: todayAt(8, 30),
    extendedProps: {
      patientName: "M. Iyer",
      mrn: "MRN-0312",
      study: "Skull AP/Lat",
      status: "done",
      priority: "Routine",
      room: "X-RAY ROOM",
    },
  },
  {
    id: "e2",
    resourceId: "usg",
    title: "T. Nair",
    start: todayAt(8, 0),
    end: todayAt(8, 30),
    extendedProps: {
      patientName: "T. Nair",
      mrn: "MRN-0550",
      study: "USG Thyroid",
      status: "done",
      priority: "Routine",
      room: "USG ROOM",
    },
  },
  {
    id: "e3",
    resourceId: "xray",
    title: "K. Desai",
    start: todayAt(9, 0),
    end: todayAt(9, 20),
    extendedProps: {
      patientName: "K. Desai",
      mrn: "MRN-2201",
      study: "CXR PA",
      status: "done",
      priority: "Routine",
      room: "X-RAY ROOM",
    },
  },
  {
    id: "e4",
    resourceId: "ct1",
    title: "R. Patel",
    start: todayAt(9, 0),
    end: todayAt(9, 45),
    extendedProps: {
      patientName: "R. Patel",
      mrn: "MRN-3312",
      study: "CT Chest",
      status: "scheduled",
      priority: "Urgent",
      room: "CT ROOM 1",
    },
  },
  {
    id: "e5",
    resourceId: "usg",
    title: "A. Singh",
    start: todayAt(9, 0),
    end: todayAt(9, 30),
    extendedProps: {
      patientName: "A. Singh",
      mrn: "MRN-1123",
      study: "USG Abdomen",
      status: "scheduled",
      priority: "Routine",
      room: "USG ROOM",
    },
  },
  {
    id: "e6",
    resourceId: "xray",
    title: "N. Sharma",
    start: todayAt(10, 0),
    end: todayAt(10, 20),
    extendedProps: {
      patientName: "N. Sharma",
      mrn: "MRN-4401",
      study: "CXR AP",
      status: "scheduled",
      priority: "Routine",
      room: "X-RAY ROOM",
    },
  },
  {
    id: "e7",
    resourceId: "usg",
    title: "V. Menon",
    start: todayAt(10, 0),
    end: todayAt(10, 30),
    extendedProps: {
      patientName: "V. Menon",
      mrn: "MRN-5512",
      study: "USG Pelvis",
      status: "scheduled",
      priority: "Routine",
      room: "USG ROOM",
    },
  },
  {
    id: "e8",
    resourceId: "xray",
    title: "Rahul Menon",
    start: todayAt(11, 0),
    end: todayAt(11, 20),
    extendedProps: {
      patientName: "Rahul Menon",
      mrn: "MRN-1042",
      study: "Chest X-Ray",
      status: "new",
      priority: "Urgent",
      room: "X-RAY ROOM",
    },
  },
  {
    id: "e9",
    resourceId: "ct1",
    title: "S. Gupta",
    start: todayAt(13, 0),
    end: todayAt(13, 50),
    extendedProps: {
      patientName: "S. Gupta",
      mrn: "MRN-6601",
      study: "CT Abdomen",
      status: "scheduled",
      priority: "Routine",
      room: "CT ROOM 1",
    },
  },
  {
    id: "e10",
    resourceId: "xray",
    title: "D. Kumar",
    start: todayAt(14, 0),
    end: todayAt(14, 20),
    extendedProps: {
      patientName: "D. Kumar",
      mrn: "MRN-7712",
      study: "Knee AP/Lat",
      status: "scheduled",
      priority: "Routine",
      room: "X-RAY ROOM",
    },
  },
  {
    id: "e11",
    resourceId: "usg",
    title: "F. Ali",
    start: todayAt(14, 0),
    end: todayAt(14, 30),
    extendedProps: {
      patientName: "F. Ali",
      mrn: "MRN-8823",
      study: "USG Neck",
      status: "scheduled",
      priority: "Routine",
      room: "USG ROOM",
    },
  },
  {
    id: "e12",
    resourceId: "ct1",
    title: "L. Verma",
    start: todayAt(15, 0),
    end: todayAt(15, 45),
    extendedProps: {
      patientName: "L. Verma",
      mrn: "MRN-9934",
      study: "CT Head",
      status: "urgent",
      priority: "STAT",
      room: "CT ROOM 1",
    },
  },
  {
    id: "e13",
    resourceId: "xray",
    title: "P. Bose",
    start: todayAt(16, 0),
    end: todayAt(16, 20),
    extendedProps: {
      patientName: "P. Bose",
      mrn: "MRN-0045",
      study: "Spine LS",
      status: "scheduled",
      priority: "Routine",
      room: "X-RAY ROOM",
    },
  },
];

const UNSCHEDULED = [
  {
    id: "u1",
    patientName: "Rahul Menon",
    mrn: "MRN-1042",
    study: "Chest X-Ray follow-up",
    priority: "Urgent" as Priority,
  },
  {
    id: "u2",
    patientName: "Priya Shah",
    mrn: "MRN-0891",
    study: "USG Abdomen",
    priority: "Routine" as Priority,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventContent({ info }: { info: EventContentArg }) {
  const ep = info.event.extendedProps as ApptExtended;
  const meta = STATUS_META[ep.status];
  const isMonth = info.view.type === "dayGridMonth";

  if (isMonth) {
    return (
      <Box
        sx={{
          px: 0.75,
          py: 0.2,
          borderRadius: "5px",
          backgroundColor: meta.bg,
          borderLeft: `3px solid ${meta.accent}`,
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            color: meta.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ep.patientName}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.57rem",
            color: alpha(meta.textColor, 0.75),
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ep.study}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        px: 0.75,
        py: 0.5,
        borderRadius: "7px",
        border: `1px solid ${meta.border}`,
        borderLeft: `3px solid ${meta.accent}`,
        backgroundColor: meta.bg,
        overflow: "hidden",
        cursor: "pointer",
        transition: "filter 0.14s, box-shadow 0.14s",
        "&:hover": {
          filter: "brightness(0.97)",
          boxShadow: `0 3px 10px ${alpha(meta.accent, 0.2)}`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 0.1 }}>
        <meta.Icon sx={{ fontSize: 10, color: meta.accent, flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 800,
            color: meta.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.2,
          }}
        >
          {ep.patientName}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: "0.59rem",
          color: alpha(meta.textColor, 0.78),
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
      >
        {ep.study}
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 0.2 }}
      >
        <Typography sx={{ fontSize: "0.55rem", color: "#94a3b8" }}>
          {ep.mrn}
        </Typography>
        {ep.priority !== "Routine" && (
          <Box
            sx={{
              px: 0.5,
              py: 0.1,
              borderRadius: "4px",
              backgroundColor: ep.priority === "STAT" ? "#fee2e2" : "#fef3c7",
              border: `1px solid ${ep.priority === "STAT" ? "#fca5a5" : "#fde68a"}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.52rem",
                fontWeight: 800,
                color: ep.priority === "STAT" ? "#b91c1c" : "#92400e",
              }}
            >
              {ep.priority}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ─── Event Detail Dialog ──────────────────────────────────────────────────────

function EventDetailDialog({
  event,
  onClose,
  onStatusChange,
}: {
  event: {
    id: string;
    start: string;
    end: string;
    extendedProps: ApptExtended;
  } | null;
  onClose: () => void;
  onStatusChange: (id: string, status: SlotStatus) => void;
}) {
  if (!event) return null;
  const meta = STATUS_META[event.extendedProps.status];

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {event.extendedProps.patientName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {event.extendedProps.mrn}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1.1}>
          {[
            { label: "Study", value: event.extendedProps.study },
            { label: "Room", value: event.extendedProps.room },
            {
              label: "Start",
              value: new Date(event.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            {
              label: "End",
              value: new Date(event.end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            { label: "Priority", value: event.extendedProps.priority },
          ].map(({ label, value }) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  width: 70,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.7rem",
                width: 70,
              }}
            >
              Status
            </Typography>
            <Chip
              size="small"
              label={meta.label}
              sx={{
                backgroundColor: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.textColor,
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 20,
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 0.75 }}>
        {event.extendedProps.status !== "done" && (
          <Button
            size="small"
            variant="contained"
            color="success"
            disableElevation
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => {
              onStatusChange(event.id, "done");
              onClose();
            }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
          >
            Confirm
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Cancel Appt
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Book Slot Dialog ─────────────────────────────────────────────────────────

function BookSlotDialog({
  open,
  defaultStart,
  defaultResource,
  onClose,
  onBook,
}: {
  open: boolean;
  defaultStart: string;
  defaultResource: string;
  onClose: () => void;
  onBook: (e: Omit<AppointmentEvent, "id">) => void;
}) {
  const [form, setForm] = React.useState({
    patientName: "",
    mrn: "",
    study: "",
    resource: defaultResource,
    priority: "Routine" as Priority,
    duration: "30",
  });
  React.useEffect(() => {
    setForm((f) => ({ ...f, resource: defaultResource }));
  }, [defaultResource]);

  const submit = () => {
    if (!form.patientName.trim() || !form.study.trim()) return;
    const start = new Date(defaultStart || new Date());
    const end = new Date(start.getTime() + Number(form.duration) * 60000);
    const room =
      RESOURCES.find((r) => r.id === form.resource)?.title ?? form.resource;
    onBook({
      resourceId: form.resource,
      title: `${form.patientName} — ${form.study}`,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        patientName: form.patientName,
        mrn: form.mrn || "MRN-NEW",
        study: form.study,
        status: "new",
        priority: form.priority,
        room,
      },
    });
    onClose();
    setForm({
      patientName: "",
      mrn: "",
      study: "",
      resource: defaultResource,
      priority: "Routine",
      duration: "30",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: "0.95rem", pb: 1 }}>
        Book Appointment Slot
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          <TextField
            label="Patient Name *"
            size="small"
            fullWidth
            value={form.patientName}
            onChange={(e) =>
              setForm((f) => ({ ...f, patientName: e.target.value }))
            }
          />
          <TextField
            label="MRN"
            size="small"
            fullWidth
            value={form.mrn}
            onChange={(e) => setForm((f) => ({ ...f, mrn: e.target.value }))}
            placeholder="e.g. MRN-1234"
          />
          <TextField
            label="Study / Procedure *"
            size="small"
            fullWidth
            value={form.study}
            onChange={(e) => setForm((f) => ({ ...f, study: e.target.value }))}
          />
          <TextField
            select
            label="Room"
            size="small"
            fullWidth
            value={form.resource}
            onChange={(e) =>
              setForm((f) => ({ ...f, resource: e.target.value }))
            }
          >
            {RESOURCES.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.title}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              label="Priority"
              size="small"
              fullWidth
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value as Priority }))
              }
            >
              {(["Routine", "Urgent", "STAT"] as Priority[]).map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Duration"
              size="small"
              fullWidth
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: e.target.value }))
              }
            >
              {["15", "20", "30", "45", "60", "90"].map((d) => (
                <MenuItem key={d} value={d}>
                  {d} min
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {defaultStart && (
            <Box
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                Slot:{" "}
                {new Date(defaultStart).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={submit}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Book Slot
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  events,
  onUnscheduledBook,
  selectedResourceId,
  setSelectedResourceId,
}: {
  events: AppointmentEvent[];
  onUnscheduledBook: (u: (typeof UNSCHEDULED)[0]) => void;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
}) {
  const theme = useTheme();
  const today = new Date();
  const todayEvts = events.filter((e) => {
    const d = new Date(e.start);
    return isSameDate(d, today);
  });
  const total = todayEvts.length;
  const done = todayEvts.filter(
    (e) => e.extendedProps.status === "done",
  ).length;
  const stat = todayEvts.filter(
    (e) =>
      e.extendedProps.priority === "STAT" ||
      e.extendedProps.status === "urgent",
  ).length;

  return (
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
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="text.primary"
          sx={{ mb: 1.5 }}
        >
          Today's Summary
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {[
            { label: "Total", value: total, bg: "#eff6ff", color: "#1d4ed8" },
            { label: "Done", value: done, bg: "#f0fdf4", color: "#15803d" },
            {
              label: "Pending",
              value: total - done,
              bg: "#fffbeb",
              color: "#b45309",
            },
            { label: "STAT", value: stat, bg: "#fff1f2", color: "#b91c1c" },
          ].map(({ label, value, bg, color }) => (
            <Box
              key={label}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: bg,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 2, py: 1.5, display: "block", textTransform: "uppercase" }}
        >
          Testing Rooms
        </Typography>
        <Stack spacing={0}>
          {RESOURCES.map((r) => (
            <Box
              key={r.id}
              onClick={() =>
                setSelectedResourceId(selectedResourceId === r.id ? null : r.id)
              }
              sx={{
                py: 1.25,
                px: 2,
                cursor: "pointer",
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor:
                  selectedResourceId === r.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                borderLeft:
                  selectedResourceId === r.id
                    ? `3px solid ${theme.palette.primary.main}`
                    : "3px solid transparent",
                "&:hover": {
                  bgcolor:
                    selectedResourceId === r.id
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.04),
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: 1.5,
                  }}
                >
                  {r.id === "xray" ? "XR" : r.id === "ct1" ? "CT" : "US"}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    {r.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {todayEvts.filter((e) => e.resourceId === r.id).length}{" "}
                    appts
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.warning.main, 0.02),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "warning.main",
            }}
          />
          <Typography
            variant="caption"
            fontWeight={800}
            color="warning.main"
            sx={{ textTransform: "uppercase" }}
          >
            Unscheduled ({UNSCHEDULED.length})
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {UNSCHEDULED.map((u) => (
            <Box
              key={u.id}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.warning.main, 0.3),
                bgcolor: "background.paper",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: "0.75rem", mb: 0.25 }}
              >
                {u.patientName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {u.study}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                fullWidth
                onClick={() => onUnscheduledBook(u)}
                sx={{
                  py: 0.4,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 1.5,
                }}
              >
                Schedule Now
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function RadiologyScheduleCalendar({
  onSnack = (msg: string) => console.log(msg),
  onConfirm,
}: {
  onSnack?: (msg: string) => void;
  onConfirm?: (evt: AppointmentEvent) => void;
}) {
  const theme = useTheme();
  const calendarRef = React.useRef<FullCalendar | null>(null);

  const [calendarView, setCalendarView] = React.useState<string>(
    "resourceTimeGridDay",
  );
  const [calendarTitle, setCalendarTitle] = React.useState("");

  const [events, setEvents] =
    React.useState<AppointmentEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] =
    React.useState<AppointmentEvent | null>(null);
  const [bookDialog, setBookDialog] = React.useState({
    open: false,
    start: "",
    resource: "xray",
  });
  const [snack, setSnack] = React.useState({ open: false, message: "" });

  const [selectedResourceId, setSelectedResourceId] = React.useState<
    string | null
  >(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const visibleEvents = React.useMemo(() => {
    let list = events;
    if (selectedResourceId) {
      list = list.filter((e) => e.resourceId === selectedResourceId);
    }
    if (statusFilter !== "all") {
      list = list.filter((e) => e.extendedProps.status === statusFilter);
    }
    return list;
  }, [events, selectedResourceId, statusFilter]);

  const filteredResources = React.useMemo(() => {
    if (selectedResourceId) {
      return RESOURCES.filter((r) => r.id === selectedResourceId);
    }
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
    setBookDialog({
      open: true,
      start: arg.startStr,
      resource: (arg as any).resource?.id ?? "xray",
    });
    arg.view.calendar.unselect();
  };

  const handleBook = (data: Omit<AppointmentEvent, "id">) => {
    setEvents((prev) => [...prev, { ...data, id: `local-${Date.now()}` }]);
    showSnack(
      `Booked: ${data.extendedProps.patientName} — ${data.extendedProps.study}`,
    );
  };

  const handleStatusChange = (id: string, status: SlotStatus) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, extendedProps: { ...e.extendedProps, status } }
          : e,
      ),
    );

    if (status === "done") {
      const confirmedEvt = events.find((e) => e.id === id);
      if (confirmedEvt && onConfirm) {
        onConfirm({
          ...confirmedEvt,
          extendedProps: { ...confirmedEvt.extendedProps, status: "done" },
        });
      }
    }

    showSnack(`Marked as ${STATUS_META[status].label}`);
  };

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
        html: `<div class="fc-hims-dayhead"><div class="fc-hims-dayname">${dayName}</div><div class="fc-hims-daynum${
          isToday ? " is-today" : ""
        }">${dayNum}</div></div>`,
      };
    },
    [],
  );

  return (
    <PageTemplate
      title="Radiology Schedule"
      subtitle="Manage radiology appointments and schedules."
      currentPageTitle="Schedule"
    >
      <WorkspaceHeaderCard sx={{ p: 2, borderRadius: '22px' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              Radiology Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track radiology appointments and schedules.
            </Typography>
          </Box>
        </Stack>
      </WorkspaceHeaderCard>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          height: "calc(100vh - 200px)",
          minHeight: 600,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Sidebar
          events={events}
          onUnscheduledBook={(u) => {
            const start = new Date();
            start.setMinutes(0, 0, 0);
            start.setHours(start.getHours() + 1);
            setBookDialog({
              open: true,
              start: start.toISOString(),
              resource: "xray",
            });
          }}
          selectedResourceId={selectedResourceId}
          setSelectedResourceId={setSelectedResourceId}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
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
            <Box sx={{ flex: 1, display: "flex" }}>
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
                      px: 1.75,
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
                          ? "0 1px 3px rgba(0,0,0,0.06)"
                          : "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
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
                  size="small"
                  variant="outlined"
                  onClick={() => calendarRef.current?.getApi().today()}
                  sx={{ borderRadius: 1.5, fontWeight: 700, px: 2 }}
                >
                  Today
                </Button>
                <IconButton
                  size="small"
                  onClick={() => calendarRef.current?.getApi().prev()}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  minWidth={180}
                  textAlign="center"
                >
                  {calendarTitle}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => calendarRef.current?.getApi().next()}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setBookDialog((b) => ({ ...b, open: true }))}
                sx={{ px: 2, fontWeight: 700 }}
              >
                New Booking
              </Button>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2,
              height: 44,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                sx={{ mr: 1, textTransform: "uppercase" }}
              >
                Filter:
              </Typography>
              <Chip
                label="All Status"
                size="small"
                onClick={() => setStatusFilter("all")}
                sx={{
                  height: 24,
                  ...(statusFilter === "all"
                    ? getPrimaryChipSx(theme)
                    : {
                        bgcolor: "transparent",
                        border: "1px solid transparent",
                      }),
                  fontWeight: statusFilter === "all" ? 700 : 500,
                }}
              />
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <Chip
                  key={key}
                  label={meta.label}
                  size="small"
                  onClick={() => setStatusFilter(key)}
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: meta.accent,
                        ml: 1,
                      }}
                    />
                  }
                  sx={{
                    height: 24,
                    bgcolor: statusFilter === key ? meta.bg : "transparent",
                    border:
                      statusFilter === key
                        ? `1px solid ${meta.border}`
                        : "1px solid transparent",
                    color: meta.textColor,
                    fontWeight: statusFilter === key ? 700 : 500,
                    "& .MuiChip-icon": { ml: 0.5, mr: -0.5 },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              bgcolor: alpha(theme.palette.primary.main, 0.01),

              "& .fc-hims-dayhead": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                py: "8px",
              },
              "& .fc-hims-dayname": {
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: theme.palette.text.secondary,
              },
              "& .fc-hims-daynum": {
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                fontWeight: 800,
                fontSize: "0.9rem",
              },
              "& .fc-hims-daynum.is-today": {
                bgcolor: theme.palette.primary.main,
                color: "#fff",
              },

              "& .fc": {
                height: "100%",
                fontFamily: "Inter, sans-serif",
                "--fc-border-color": alpha(theme.palette.divider, 0.2),
                "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.02),
              },
              "& .fc-col-header-cell": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
              "& .fc-scrollgrid": { borderColor: "transparent" },
              "& .fc-timegrid-slot": { height: 60 },
              "& .fc-timegrid-slot-minor": { borderColor: "transparent" },
              "& .fc-timegrid-now-indicator-line": {
                borderColor: theme.palette.error.main,
                borderWidth: 2,
              },
              "& .fc-event": { borderRadius: "8px", border: "none !important" },
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[
                resourceTimeGridPlugin,
                timeGridPlugin,
                dayGridPlugin,
                interactionPlugin,
              ]}
              initialView={calendarView}
              headerToolbar={false}
              resources={filteredResources}
              events={visibleEvents}
              selectable
              selectMirror
              editable
              nowIndicator
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
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

        <EventDetailDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onStatusChange={handleStatusChange}
        />

        <BookSlotDialog
          open={bookDialog.open}
          defaultStart={bookDialog.start}
          defaultResource={bookDialog.resource}
          onClose={() => setBookDialog((b) => ({ ...b, open: false }))}
          onBook={handleBook}
        />

        <Snackbar
          open={snack.open}
          autoHideDuration={2500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          message={snack.message}
        />
      </Box>
    </PageTemplate>
  );
}
