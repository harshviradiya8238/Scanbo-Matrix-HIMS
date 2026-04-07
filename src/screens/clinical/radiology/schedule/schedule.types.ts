import * as React from "react";
import {
  FiberNew as FiberNewIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";

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

export const RESOURCES = [
  { id: "xray", title: "X-RAY ROOM" },
  { id: "ct1", title: "CT ROOM 1" },
  { id: "usg", title: "USG ROOM" },
];

export const STATUS_META: Record<
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

export const PRIORITY_COLOR: Record<Priority, "default" | "warning" | "error"> = {
  Routine: "default",
  Urgent: "warning",
  STAT: "error",
};
