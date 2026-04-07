import { AppointmentEvent, Priority } from "./schedule.types";

// ─── Mock Events ──────────────────────────────────────────────────────────────

function todayAt(h: number, m = 0): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
export function dayAt(offset: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const INITIAL_EVENTS: AppointmentEvent[] = [
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

export const UNSCHEDULED = [
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

export const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
