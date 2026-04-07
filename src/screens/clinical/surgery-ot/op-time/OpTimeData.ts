import { alpha } from "@/src/ui/theme";

export type CasePriority = "STAT" | "Urgent" | "Elective";
export type CaseStatus =
  | "Scheduled"
  | "Pre-Op"
  | "In OR"
  | "Closing"
  | "PACU"
  | "Completed"
  | "Cancelled";
export type WorkspaceTab = "preop" | "intraop" | "postop";
export type ViewMode = "board" | "workspace";

export interface OtCase {
  id: string;
  caseNo: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  procedure: string;
  department: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  priority: CasePriority;
  status: CaseStatus;
  prepPercent: number;
  allergies: string[];
  asaClass: string;
  estimatedDurationMin: number;
}

export interface ScheduleForm {
  patientName: string;
  mrn: string;
  procedure: string;
  department: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  priority: CasePriority;
}

export interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

export interface InstrumentCountRow {
  id: string;
  item: string;
  initial: string;
  final: string;
  status: "OK" | "Pending";
}

export interface MedicationRow {
  id: string;
  drug: string;
  dose: string;
  route: string;
  time: string;
}

export interface DischargeMedicationRow {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface VitalReading {
  label: string;
  value: string;
  tone: "success" | "warning" | "info";
}

export interface PreOpChecklistItemState {
  done: boolean;
  time: string | null;
}

export const ROOM_OPTIONS = [
  { id: "or-1", label: "OR-01" },
  { id: "or-2", label: "OR-02" },
  { id: "or-3", label: "OR-03" },
  { id: "or-4", label: "OR-04" },
  { id: "or-5", label: "OR-05" },
];

export const PREOP_CHECKLIST_ITEMS = [
  "Patient identity + wristband verified",
  "Surgical consent signed",
  "NPO status confirmed",
  "Procedure site marked",
  "Blood products cross-matched",
  "Antibiotic prophylaxis planned",
  "Implants/instruments available",
  "Anesthesia clearance complete",
];

export const POSTOP_CHECKLIST_ITEMS = [
  "Airway patent and stable",
  "Pain control within protocol",
  "Post-op orders acknowledged by nursing",
  "Discharge counselling completed",
  "Follow-up appointment booked",
];

export const PREOP_CHECKLIST_DEFAULT_TIMES = [
  "08:18 AM",
  "08:42 AM",
  "09:18 AM",
  "09:42 AM",
  "10:18 AM",
  "10:42 AM",
  "11:05 AM",
  "11:22 AM",
];

export const PREOP_TIMELINE = [
  {
    time: "07:25",
    title: "Admission to pre-op bay",
    subtitle: "Nursing triage complete",
    tone: "blue" as const,
  },
  {
    time: "07:42",
    title: "Pre-anesthesia review",
    subtitle: "ASA documented and signed",
    tone: "purple" as const,
  },
  {
    time: "08:00",
    title: "Surgical briefing done",
    subtitle: "WHO checklist started",
    tone: "green" as const,
  },
];

export const INTRAOP_TIMELINE = [
  {
    time: "08:05",
    title: "Anesthesia induced",
    subtitle: "Dr. R. Mehta",
    tone: "green" as const,
  },
  {
    time: "08:18",
    title: "Incision made",
    subtitle: "Primary surgeon in room",
    tone: "blue" as const,
  },
  {
    time: "08:45",
    title: "Specimen sent to lab",
    subtitle: "Pathology acknowledged",
    tone: "orange" as const,
  },
  {
    time: "09:30",
    title: "Expected closure",
    subtitle: "Current OT phase: hemostasis",
    tone: "red" as const,
  },
];

export const PRIORITY_COLOR: Record<CasePriority, "error" | "warning" | "default"> = {
  STAT: "error",
  Urgent: "warning",
  Elective: "default",
};

export const STATUS_COLOR: Record<
  CaseStatus,
  "default" | "warning" | "info" | "success" | "error"
> = {
  Scheduled: "default",
  "Pre-Op": "warning",
  "In OR": "info",
  Closing: "info",
  PACU: "warning",
  Completed: "success",
  Cancelled: "error",
};

export function getTodayAt(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function getLocalInputDateTime(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function defaultScheduleForm(roomId: string): ScheduleForm {
  const target = new Date();
  target.setHours(target.getHours() + 1, 0, 0, 0);
  return {
    patientName: "",
    mrn: "",
    procedure: "",
    department: "General Surgery",
    diagnosis: "",
    surgeon: "",
    anesthetist: "",
    roomId,
    scheduledAt: getLocalInputDateTime(target),
    priority: "Elective",
  };
}

export function mapStatusToWorkspaceTab(status: CaseStatus): WorkspaceTab {
  if (status === "In OR" || status === "Closing") return "intraop";
  if (status === "PACU" || status === "Completed" || status === "Cancelled")
    return "postop";
  return "preop";
}

export function toStatusTone(
  status: InstrumentCountRow["status"],
): "completed" | "warning" {
  return status === "OK" ? "completed" : "warning";
}

export function toneToBg(tone: VitalReading["tone"]): string {
  if (tone === "success") return alpha("#2FA77A", 0.12);
  if (tone === "warning") return alpha("#C9931E", 0.12);
  return alpha("#2C8AD3", 0.12);
}

export function buildChecklistStateForCase(
  caseItem: OtCase,
): PreOpChecklistItemState[] {
  const doneCount = Math.round(
    (caseItem.prepPercent / 100) * PREOP_CHECKLIST_ITEMS.length,
  );
  return PREOP_CHECKLIST_ITEMS.map((_, index) => ({
    done: index < doneCount,
    time:
      index < doneCount ? (PREOP_CHECKLIST_DEFAULT_TIMES[index] ?? null) : null,
  }));
}

export function formatChecklistTimeNow(): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export const INITIAL_CASES: OtCase[] = [
  {
    id: "ot-case-005",
    caseNo: "OT-2026-005",
    patientName: "Priyanka Das",
    mrn: "MRN-332276",
    ageGender: "35Y / F",
    procedure: "Emergency Laparotomy",
    department: "Gynecology",
    diagnosis: "Ruptured ectopic pregnancy",
    surgeon: "Dr. Neha Bhat",
    anesthetist: "Dr. R. Mehta",
    roomId: "or-3",
    scheduledAt: getTodayAt(8, 45),
    priority: "STAT",
    status: "PACU",
    prepPercent: 100,
    allergies: ["Penicillin"],
    asaClass: "ASA III",
    estimatedDurationMin: 110,
  },
  {
    id: "ot-case-001",
    caseNo: "OT-2026-001",
    patientName: "Rajiv Menon",
    mrn: "MRN-332104",
    ageGender: "47Y / M",
    procedure: "Laparoscopic Cholecystectomy",
    department: "General Surgery",
    diagnosis: "Symptomatic cholelithiasis",
    surgeon: "Dr. Kavita Sharma",
    anesthetist: "Dr. R. Mehta",
    roomId: "or-1",
    scheduledAt: getTodayAt(9, 15),
    priority: "Urgent",
    status: "In OR",
    prepPercent: 100,
    allergies: ["None"],
    asaClass: "ASA II",
    estimatedDurationMin: 95,
  },
  {
    id: "ot-case-004",
    caseNo: "OT-2026-004",
    patientName: "Nazia Khan",
    mrn: "MRN-332249",
    ageGender: "41Y / F",
    procedure: "Hemithyroidectomy",
    department: "ENT",
    diagnosis: "Left thyroid nodule",
    surgeon: "Dr. P. Rao",
    anesthetist: "Dr. S. Iyer",
    roomId: "or-5",
    scheduledAt: getTodayAt(10, 0),
    priority: "Elective",
    status: "Cancelled",
    prepPercent: 43,
    allergies: ["Latex"],
    asaClass: "ASA II",
    estimatedDurationMin: 120,
  },
  {
    id: "ot-case-002",
    caseNo: "OT-2026-002",
    patientName: "Ritika Saini",
    mrn: "MRN-332188",
    ageGender: "29Y / F",
    procedure: "ORIF Distal Radius",
    department: "Orthopedics",
    diagnosis: "Distal radius fracture",
    surgeon: "Dr. A. Verma",
    anesthetist: "Dr. S. Iyer",
    roomId: "or-2",
    scheduledAt: getTodayAt(11, 50),
    priority: "Urgent",
    status: "Pre-Op",
    prepPercent: 86,
    allergies: ["None"],
    asaClass: "ASA I",
    estimatedDurationMin: 85,
  },
  {
    id: "ot-case-006",
    caseNo: "OT-2026-006",
    patientName: "Suresh Patel",
    mrn: "MRN-332305",
    ageGender: "58Y / M",
    procedure: "Right Hemicolectomy",
    department: "General Surgery",
    diagnosis: "Ascending colon mass",
    surgeon: "Dr. Kavita Sharma",
    anesthetist: "Dr. J. Fernandes",
    roomId: "or-1",
    scheduledAt: getTodayAt(12, 20),
    priority: "Urgent",
    status: "Closing",
    prepPercent: 100,
    allergies: ["None"],
    asaClass: "ASA III",
    estimatedDurationMin: 180,
  },
  {
    id: "ot-case-003",
    caseNo: "OT-2026-003",
    patientName: "Arjun Mehta",
    mrn: "MRN-332190",
    ageGender: "63Y / M",
    procedure: "CABG ×3",
    department: "Cardiothoracic",
    diagnosis: "Triple vessel CAD",
    surgeon: "Dr. D. Nair",
    anesthetist: "Dr. M. Singh",
    roomId: "or-4",
    scheduledAt: getTodayAt(14, 30),
    priority: "STAT",
    status: "Scheduled",
    prepPercent: 60,
    allergies: ["Heparin sensitivity"],
    asaClass: "ASA IV",
    estimatedDurationMin: 260,
  },
];
