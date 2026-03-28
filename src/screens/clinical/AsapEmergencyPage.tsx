"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Card, CommonTabs, StatTile } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { useUser } from "@/src/core/auth/UserContext";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import { cardShadow } from "@/src/core/theme/tokens";
import ModuleHeaderCard from "@/src/screens/clinical/components/ModuleHeaderCard";
import WorkflowSectionCard from "@/src/screens/clinical/components/WorkflowSectionCard";
import {
  AccessibilityNew as AccessibilityNewIcon,
  Air as AirIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Bloodtype as BloodtypeIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Close as CloseIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

type EmergencyPageId = "dashboard" | "triage" | "bed-board" | "chart";

type CaseTrackingTabId = "vitals" | "safety" | "timeline" | "checklist";

type CaseTrackingSidebarFilter = "All" | "Critical" | "In Treatment" | "Ready";

type TriageLevel =
  | "Critical"
  | "Emergency"
  | "Urgent"
  | "Semi-Urgent"
  | "Non-Urgent";

type Gender = "Male" | "Female" | "Other";
type ArrivalMode = "Ambulance" | "Walk-in" | "Referral" | "Police";
type PatientStatus =
  | "Waiting"
  | "In Treatment"
  | "Observation"
  | "Ready for Disposition";
type BedStatus = "Free" | "Occupied" | "Cleaning" | "Critical";
type OrderType = "Lab Tests" | "Radiology" | "Medication" | "Procedures";
type OrderPriority = "STAT" | "Urgent" | "Routine";
type OrderStatus = "Pending" | "In Progress" | "Completed";
type QueueViewMode = "table" | "kanban";
type BedBoardFilter = "ALL" | BedStatus;
type ToastSeverity = "success" | "info" | "warning" | "error";
type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error";

interface PatientVitals {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  respiratoryRate: number;
  spo2: number;
  painScore: number;
  gcs: number;
  capturedAt: string;
}

interface EmergencyPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  arrivalMode: ArrivalMode;
  broughtBy: string;
  chiefComplaint: string;
  triageLevel: TriageLevel;
  waitingMinutes: number;
  assignedBed: string | null;
  assignedDoctor: string;
  status: PatientStatus;
  vitals: PatientVitals;
  allergies: string[];
  safetyFlags: string[];
  clinicalNotes: string;
  updatedAt: string;
}

interface EmergencyBed {
  id: string;
  zone: "Resus" | "ER Bay" | "Observation";
  status: BedStatus;
  patientId: string | null;
}

interface EmergencyOrder {
  id: string;
  patientId: string;
  type: OrderType;
  item: string;
  priority: OrderPriority;
  status: OrderStatus;
  orderedAt: string;
}

interface ObservationEntry {
  id: string;
  patientId: string;
  recordedAt: string;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  respiratoryRate: number;
  spo2: number;
  painScore: number;
  gcs: number;
  note: string;
}

interface RegistrationForm {
  name: string;
  age: string;
  gender: Gender;
  phone: string;
  arrivalMode: ArrivalMode;
  broughtBy: string;
  chiefComplaint: string;
  triageLevel: TriageLevel;
}

interface TriageForm {
  patientId: string;
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
  triageLevel: TriageLevel;
}

type BedAssignPriority = "Immediate" | "High" | "Medium" | "Standard";

interface BedAssignForm {
  patientId: string;
  bedId: string;
  physician: string;
  nurse: string;
  priority: BedAssignPriority;
  notes: string;
}

interface OrderForm {
  type: OrderType;
  item: string;
  priority: OrderPriority;
}

interface VitalsForm {
  patientId: string;
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
  painScore: string;
  gcs: string;
  notes: string;
}

interface DischargeForm {
  diagnosis: string;
  condition: string;
  instructions: string;
  followUp: string;
  medications: string;
  destination: string;
}

interface EmergencyAlertItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "critical" | "warning" | "info" | "success";
}

const TRIAGE_META: Record<
  TriageLevel,
  { color: ChipColor; accent: string; rank: number }
> = {
  Critical: { color: "error", accent: "#d32f2f", rank: 1 },
  Emergency: { color: "warning", accent: "#ef6c00", rank: 2 },
  Urgent: { color: "warning", accent: "#f9a825", rank: 3 },
  "Semi-Urgent": { color: "success", accent: "#2e7d32", rank: 4 },
  "Non-Urgent": { color: "info", accent: "#1565c0", rank: 5 },
};

const TRIAGE_LEVEL_LABELS: Record<
  TriageLevel,
  { level: string; note: string }
> = {
  Critical: { level: "I", note: "Immediate" },
  Emergency: { level: "II", note: "Emergency" },
  Urgent: { level: "III", note: "Urgent" },
  "Semi-Urgent": { level: "IV", note: "Semi-Urgent" },
  "Non-Urgent": { level: "V", note: "Non-Urgent" },
};

const TRIAGE_LEVEL_ORDER: TriageLevel[] = [
  "Critical",
  "Emergency",
  "Urgent",
  "Semi-Urgent",
  "Non-Urgent",
];

const TRIAGE_BUTTON_COLOR: Record<
  TriageLevel,
  "error" | "warning" | "success" | "info"
> = {
  Critical: "error",
  Emergency: "warning",
  Urgent: "warning",
  "Semi-Urgent": "success",
  "Non-Urgent": "info",
};

const BED_STATUS_META: Record<BedStatus, { color: ChipColor }> = {
  Free: { color: "success" },
  Occupied: { color: "info" },
  Cleaning: { color: "warning" },
  Critical: { color: "error" },
};

const EMERGENCY_PAGES: Array<{
  id: EmergencyPageId;
  label: string;
  icon: React.ReactElement;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    id: "triage",
    label: "Arrivals & Triage",
    icon: <MonitorHeartIcon fontSize="small" />,
  },
  { id: "bed-board", label: "Bed Board", icon: <BedIcon fontSize="small" /> },
  {
    id: "chart",
    label: "Case Tracking",
    icon: <DescriptionIcon fontSize="small" />,
  },
];

const CASE_TRACKING_TABS: Array<{
  id: CaseTrackingTabId;
  label: string;
  icon: React.ReactElement;
}> = [
  {
    id: "vitals",
    label: "Vitals",
    icon: <MonitorHeartIcon fontSize="small" />,
  },
  {
    id: "safety",
    label: "Safety & Labs",
    icon: <ScienceIcon fontSize="small" />,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: <TimelineIcon fontSize="small" />,
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: <ViewListIcon fontSize="small" />,
  },
];

const OPERATIONS_SNAPSHOT = {
  dischargedToday: 31,
  staffOnDuty: 14,
  physiciansOnDuty: 6,
  nursesOnDuty: 8,
};

const RECENT_ALERTS: EmergencyAlertItem[] = [
  {
    id: "AL-1",
    title: "Critical vitals in Resus-1",
    detail: "ER-5101 SpO2 at 90% with hypotension trend.",
    time: "4 min ago",
    tone: "critical",
  },
  {
    id: "AL-2",
    title: "Bed capacity warning",
    detail: "Cleaning beds need turnaround to reduce queue delay.",
    time: "7 min ago",
    tone: "warning",
  },
  {
    id: "AL-3",
    title: "Lab result ready",
    detail: "Troponin-I reported for ER-5101.",
    time: "11 min ago",
    tone: "info",
  },
  {
    id: "AL-4",
    title: "Transfer completed",
    detail: "ER-5104 is marked ready for downstream handoff.",
    time: "20 min ago",
    tone: "success",
  },
];

const INITIAL_PATIENTS: EmergencyPatient[] = [
  {
    id: "ER-5101",
    mrn: "MRN-247811",
    name: "Ramesh Gupta",
    age: 58,
    gender: "Male",
    phone: "9876543210",
    arrivalMode: "Ambulance",
    broughtBy: "Ambulance Team 12",
    chiefComplaint: "Acute chest pain with diaphoresis",
    triageLevel: "Critical",
    waitingMinutes: 6,
    assignedBed: "Resus-1",
    assignedDoctor: "Dr. Neha Bhat",
    status: "In Treatment",
    vitals: {
      heartRate: 122,
      bloodPressure: "88/56",
      temperature: 37.4,
      respiratoryRate: 28,
      spo2: 90,
      painScore: 8,
      gcs: 14,
      capturedAt: "08:52",
    },
    allergies: ["Aspirin sensitivity"],
    safetyFlags: ["Cardiac alert", "High fall risk"],
    clinicalNotes:
      "Suspected ACS. STEMI pathway initiated. Cardiology informed.",
    updatedAt: "08:52",
  },
  {
    id: "ER-5102",
    mrn: "MRN-247902",
    name: "Asha Iyer",
    age: 34,
    gender: "Female",
    phone: "9812345678",
    arrivalMode: "Referral",
    broughtBy: "Relative",
    chiefComplaint: "Road traffic injury with severe thigh pain",
    triageLevel: "Emergency",
    waitingMinutes: 18,
    assignedBed: "Bay-4",
    assignedDoctor: "Dr. R. Kiran",
    status: "In Treatment",
    vitals: {
      heartRate: 108,
      bloodPressure: "104/68",
      temperature: 37.1,
      respiratoryRate: 22,
      spo2: 96,
      painScore: 9,
      gcs: 15,
      capturedAt: "08:40",
    },
    allergies: ["No known allergies"],
    safetyFlags: ["Trauma protocol"],
    clinicalNotes: "Trauma protocol active. X-ray and ortho consult ordered.",
    updatedAt: "08:40",
  },
  {
    id: "ER-5103",
    mrn: "MRN-248010",
    name: "Iqbal Khan",
    age: 46,
    gender: "Male",
    phone: "9898765432",
    arrivalMode: "Ambulance",
    broughtBy: "EMS",
    chiefComplaint: "Acute breathlessness",
    triageLevel: "Emergency",
    waitingMinutes: 12,
    assignedBed: "Bay-5",
    assignedDoctor: "Dr. P. Menon",
    status: "Observation",
    vitals: {
      heartRate: 116,
      bloodPressure: "96/62",
      temperature: 36.8,
      respiratoryRate: 30,
      spo2: 89,
      painScore: 7,
      gcs: 15,
      capturedAt: "08:48",
    },
    allergies: ["Dust allergy"],
    safetyFlags: ["Respiratory watch"],
    clinicalNotes: "Nebulization started. ABG ordered.",
    updatedAt: "08:48",
  },
  {
    id: "ER-5104",
    mrn: "MRN-248044",
    name: "Nisha Fernandes",
    age: 27,
    gender: "Female",
    phone: "9700112233",
    arrivalMode: "Walk-in",
    broughtBy: "Self",
    chiefComplaint: "High fever with vomiting",
    triageLevel: "Urgent",
    waitingMinutes: 34,
    assignedBed: "Obs-2",
    assignedDoctor: "Dr. S. Rao",
    status: "Ready for Disposition",
    vitals: {
      heartRate: 94,
      bloodPressure: "112/74",
      temperature: 38.4,
      respiratoryRate: 18,
      spo2: 98,
      painScore: 4,
      gcs: 15,
      capturedAt: "08:24",
    },
    allergies: ["No known allergies"],
    safetyFlags: ["Isolation review"],
    clinicalNotes: "IV fluids completed. Repeat vitals stable.",
    updatedAt: "08:24",
  },
  {
    id: "ER-5105",
    mrn: "MRN-248153",
    name: "Ritu Sharma",
    age: 19,
    gender: "Female",
    phone: "9911223344",
    arrivalMode: "Walk-in",
    broughtBy: "Friend",
    chiefComplaint: "Forearm laceration",
    triageLevel: "Semi-Urgent",
    waitingMinutes: 21,
    assignedBed: null,
    assignedDoctor: "Dr. A. George",
    status: "Waiting",
    vitals: {
      heartRate: 88,
      bloodPressure: "118/76",
      temperature: 36.9,
      respiratoryRate: 16,
      spo2: 99,
      painScore: 5,
      gcs: 15,
      capturedAt: "08:31",
    },
    allergies: ["Latex"],
    safetyFlags: ["Awaiting suturing"],
    clinicalNotes: "Wound dressing pending.",
    updatedAt: "08:31",
  },
  {
    id: "ER-5106",
    mrn: "MRN-248221",
    name: "Manoj Kulkarni",
    age: 63,
    gender: "Male",
    phone: "9822003344",
    arrivalMode: "Walk-in",
    broughtBy: "Family",
    chiefComplaint: "Dizziness and imbalance",
    triageLevel: "Non-Urgent",
    waitingMinutes: 39,
    assignedBed: null,
    assignedDoctor: "Dr. S. Rao",
    status: "Waiting",
    vitals: {
      heartRate: 82,
      bloodPressure: "130/82",
      temperature: 36.6,
      respiratoryRate: 16,
      spo2: 99,
      painScore: 2,
      gcs: 15,
      capturedAt: "08:14",
    },
    allergies: ["No known allergies"],
    safetyFlags: ["Senior review pending"],
    clinicalNotes: "Awaiting neuro review.",
    updatedAt: "08:14",
  },
];

const INITIAL_BEDS: EmergencyBed[] = [
  { id: "Resus-1", zone: "Resus", status: "Critical", patientId: "ER-5101" },
  { id: "Resus-2", zone: "Resus", status: "Free", patientId: null },
  { id: "Bay-4", zone: "ER Bay", status: "Occupied", patientId: "ER-5102" },
  { id: "Bay-5", zone: "ER Bay", status: "Occupied", patientId: "ER-5103" },
  { id: "Bay-6", zone: "ER Bay", status: "Cleaning", patientId: null },
  { id: "Bay-7", zone: "ER Bay", status: "Free", patientId: null },
  { id: "Obs-1", zone: "Observation", status: "Free", patientId: null },
  {
    id: "Obs-2",
    zone: "Observation",
    status: "Occupied",
    patientId: "ER-5104",
  },
  { id: "Obs-3", zone: "Observation", status: "Free", patientId: null },
  { id: "Obs-4", zone: "Observation", status: "Cleaning", patientId: null },
];

const INITIAL_ORDERS: EmergencyOrder[] = [
  {
    id: "ER-ORD-9001",
    patientId: "ER-5101",
    type: "Lab Tests",
    item: "Troponin-I",
    priority: "STAT",
    status: "In Progress",
    orderedAt: "08:53",
  },
  {
    id: "ER-ORD-9002",
    patientId: "ER-5101",
    type: "Radiology",
    item: "Portable ECG",
    priority: "STAT",
    status: "Pending",
    orderedAt: "08:54",
  },
  {
    id: "ER-ORD-9003",
    patientId: "ER-5102",
    type: "Procedures",
    item: "Trauma primary survey + splinting",
    priority: "Urgent",
    status: "In Progress",
    orderedAt: "08:42",
  },
  {
    id: "ER-ORD-9004",
    patientId: "ER-5104",
    type: "Medication",
    item: "Ondansetron 4mg IV",
    priority: "Routine",
    status: "Completed",
    orderedAt: "08:28",
  },
];

const INITIAL_OBSERVATION_LOG: ObservationEntry[] = [
  {
    id: "OBS-1",
    patientId: "ER-5101",
    recordedAt: "08:36",
    heartRate: 128,
    bloodPressure: "86/52",
    temperature: 37.6,
    respiratoryRate: 30,
    spo2: 88,
    painScore: 9,
    gcs: 13,
    note: "Arrival triage vitals",
  },
  {
    id: "OBS-2",
    patientId: "ER-5101",
    recordedAt: "08:52",
    heartRate: 122,
    bloodPressure: "88/56",
    temperature: 37.4,
    respiratoryRate: 28,
    spo2: 90,
    painScore: 8,
    gcs: 14,
    note: "After oxygen support",
  },
  {
    id: "OBS-3",
    patientId: "ER-5104",
    recordedAt: "08:24",
    heartRate: 94,
    bloodPressure: "112/74",
    temperature: 38.4,
    respiratoryRate: 18,
    spo2: 98,
    painScore: 4,
    gcs: 15,
    note: "Pre-disposition observation",
  },
];

const DEFAULT_REGISTRATION: RegistrationForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  arrivalMode: "Walk-in",
  broughtBy: "",
  chiefComplaint: "",
  triageLevel: "Urgent",
};

const DEFAULT_TRIAGE: TriageForm = {
  patientId: "",
  heartRate: "",
  bloodPressure: "",
  temperature: "",
  respiratoryRate: "",
  spo2: "",
  triageLevel: "Urgent",
};

const BED_ASSIGN_FLOW_STEPS = [
  "Tracking Board",
  "Assign Bed",
  "Case Tracking",
  "Orders",
  "Discharge / Transfer",
] as const;

const BED_ASSIGN_PHYSICIANS = [
  "Dr. Neha Bhat",
  "Dr. R. Kiran",
  "Dr. P. Menon",
  "Dr. S. Rao",
  "Dr. A. George",
] as const;

const BED_ASSIGN_NURSES = [
  "RN Kavitha",
  "RN Meera",
  "RN Ramesh",
  "RN Latha",
] as const;

const DEFAULT_ORDER_FORM: OrderForm = {
  type: "Lab Tests",
  item: "",
  priority: "Routine",
};

const DEFAULT_VITALS_FORM: VitalsForm = {
  patientId: "",
  heartRate: "",
  bloodPressure: "",
  temperature: "",
  respiratoryRate: "",
  spo2: "",
  painScore: "",
  gcs: "15",
  notes: "",
};

const DEFAULT_DISCHARGE_FORM: DischargeForm = {
  diagnosis: "",
  condition: "Stable for discharge",
  instructions: "",
  followUp: "",
  medications: "",
  destination: "Home",
};

const ORDER_TEMPLATES: Record<OrderType, string[]> = {
  "Lab Tests": ["CBC + CRP", "ABG", "Troponin-I", "LFT + RFT"],
  Radiology: ["Chest X-Ray", "FAST Ultrasound", "CT Brain", "Portable ECG"],
  Medication: [
    "IV NS 500 mL",
    "Ondansetron 4mg IV",
    "Nebulization",
    "Paracetamol 1g IV",
  ],
  Procedures: [
    "12-lead ECG",
    "Trauma primary survey",
    "Wound dressing",
    "Splinting",
  ],
};

function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPatientInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function buildPatientId() {
  return `ER-${Math.floor(5200 + Math.random() * 6000)}`;
}

function buildMrn() {
  return `MRN-${Math.floor(250000 + Math.random() * 650000)}`;
}

function buildDischargeDraft(
  patient: EmergencyPatient | undefined,
): DischargeForm {
  if (!patient) {
    return DEFAULT_DISCHARGE_FORM;
  }

  return {
    diagnosis: patient.chiefComplaint,
    condition:
      patient.triageLevel === "Critical" || patient.triageLevel === "Emergency"
        ? "Improved after emergency stabilization"
        : "Stable for discharge",
    instructions:
      patient.triageLevel === "Critical" || patient.triageLevel === "Emergency"
        ? "Return immediately for chest pain, breathing difficulty, syncope, or worsening symptoms."
        : "Continue oral fluids, observe symptoms, and return for worsening complaints.",
    followUp: "Review in OPD / specialty clinic within 48-72 hours.",
    medications: "Continue discharge medications as prescribed in ED orders.",
    destination: "Home",
  };
}

function triageRank(level: TriageLevel) {
  return TRIAGE_META[level].rank;
}

function bedStatusForPatient(level: TriageLevel): BedStatus {
  return level === "Critical" ? "Critical" : "Occupied";
}

function applyPatientAcuityToBeds(
  nextPatients: EmergencyPatient[],
  nextBeds: EmergencyBed[],
): EmergencyBed[] {
  return nextBeds.map((bed) => {
    if (!bed.patientId) {
      if (bed.status === "Cleaning") return bed;
      return { ...bed, status: "Free" };
    }

    const patient = nextPatients.find((entry) => entry.id === bed.patientId);
    if (!patient) {
      return { ...bed, patientId: null, status: "Free" };
    }

    return { ...bed, status: bedStatusForPatient(patient.triageLevel) };
  });
}

function TriageBadge({ level }: { level: TriageLevel }) {
  return <Chip size="small" label={level} color={TRIAGE_META[level].color} />;
}

function OrderStatusChip({ status }: { status: OrderStatus }) {
  const color: ChipColor =
    status === "Completed"
      ? "success"
      : status === "In Progress"
        ? "info"
        : "warning";
  return (
    <Chip
      size="small"
      label={status}
      color={color}
      variant={status === "Completed" ? "filled" : "outlined"}
    />
  );
}

interface OrdersPanelProps {
  selectedPatient: EmergencyPatient | undefined;
  orders: EmergencyOrder[];
  orderForm: OrderForm;
  onOrderFormChange: <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => void;
  onAddOrder: () => void;
  onOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  onTemplateApply: (template: string) => void;
}

function EmergencyOrdersPanel({
  selectedPatient,
  orders,
  orderForm,
  onOrderFormChange,
  onAddOrder,
  onOrderStatusChange,
  onTemplateApply,
}: OrdersPanelProps) {
  const orderColumns = React.useMemo<CommonColumn<EmergencyOrder>[]>(
    () => [
      {
        headerName: "Time",
        field: "orderedAt",
        width: 100,
      },
      {
        headerName: "Type",
        field: "type",
        width: 120,
      },
      {
        headerName: "Order",
        field: "item",
        width: 250,
      },
      {
        headerName: "Priority",
        field: "priority",
        width: 110,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.priority}
            color={
              row.priority === "STAT"
                ? "error"
                : row.priority === "Urgent"
                  ? "warning"
                  : "default"
            }
            variant={row.priority === "Routine" ? "outlined" : "filled"}
          />
        ),
      },
      {
        headerName: "Status",
        field: "status",
        width: 130,
        renderCell: (row) => <OrderStatusChip status={row.status} />,
      },
      {
        headerName: "Action",
        field: "id",
        width: 200,
        align: "right",
        headerAlign: "right",
        renderCell: (row) => (
          <Stack direction="row" spacing={0.75} justifyContent="flex-end">
            {row.status === "Pending" ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOrderStatusChange(row.id, "In Progress");
                }}
              >
                Start
              </Button>
            ) : null}
            {row.status !== "Completed" ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOrderStatusChange(row.id, "Completed");
                }}
              >
                Complete
              </Button>
            ) : null}
          </Stack>
        ),
      },
    ],
    [onOrderStatusChange],
  );
  const rows = selectedPatient
    ? orders.filter((order) => order.patientId === selectedPatient.id)
    : [];
  const templateOptions = ORDER_TEMPLATES[orderForm.type];

  return (
    <WorkflowSectionCard
      title="Orders Panel"
      subtitle="Lab Tests, Radiology, Medication, and Procedures"
    >
      {!selectedPatient ? (
        <Alert severity="info">
          Select a patient to place emergency orders.
        </Alert>
      ) : (
        <Stack spacing={1.25}>
          <Grid container spacing={1}>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                label="Order Type"
                select
                value={orderForm.type}
                onChange={(event) =>
                  onOrderFormChange("type", event.target.value as OrderType)
                }
                fullWidth
              >
                <MenuItem value="Lab Tests">Lab Tests</MenuItem>
                <MenuItem value="Radiology">Radiology</MenuItem>
                <MenuItem value="Medication">Medication</MenuItem>
                <MenuItem value="Procedures">Procedures</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                label="Priority"
                select
                value={orderForm.priority}
                onChange={(event) =>
                  onOrderFormChange(
                    "priority",
                    event.target.value as OrderPriority,
                  )
                }
                fullWidth
              >
                <MenuItem value="STAT">STAT</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="Routine">Routine</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                size="small"
                label="Order Item"
                value={orderForm.item}
                onChange={(event) =>
                  onOrderFormChange("item", event.target.value)
                }
                fullWidth
                placeholder="Enter test / procedure / medication"
              />
            </Grid>
            <Grid xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: "100%" }}
                onClick={onAddOrder}
              >
                Add Order
              </Button>
            </Grid>
          </Grid>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75 }}
            >
              Quick templates
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {templateOptions.map((template) => (
                <Chip
                  key={template}
                  clickable
                  size="small"
                  label={template}
                  variant={orderForm.item === template ? "filled" : "outlined"}
                  color={orderForm.item === template ? "primary" : "default"}
                  onClick={() => onTemplateApply(template)}
                />
              ))}
            </Stack>
          </Box>

          <CommonDataGrid<EmergencyOrder>
            rows={rows}
            columns={orderColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search orders..."
            searchFields={["item", "type"]}
            emptyTitle="No emergency orders placed yet."
          />
        </Stack>
      )}
    </WorkflowSectionCard>
  );
}

interface ObservationPanelProps {
  selectedPatient: EmergencyPatient | undefined;
  observationRows: ObservationEntry[];
  onRecordVitals: () => void;
}

function ObservationTimelinePanel({
  selectedPatient,
  observationRows,
  onRecordVitals,
}: ObservationPanelProps) {
  const rows = selectedPatient
    ? observationRows.filter((entry) => entry.patientId === selectedPatient.id)
    : [];

  return (
    <WorkflowSectionCard
      title="Observation Screen"
      subtitle="Timeline view for emergency vitals monitoring"
      action={
        <Button
          size="small"
          variant="contained"
          onClick={onRecordVitals}
          disabled={!selectedPatient}
        >
          Record Vitals
        </Button>
      }
    >
      {!selectedPatient ? (
        <Alert severity="info">
          Select a patient to review the observation timeline.
        </Alert>
      ) : rows.length === 0 ? (
        <Alert severity="info">
          No observation entries yet for this patient.
        </Alert>
      ) : (
        <Stack spacing={1}>
          {rows.map((entry) => (
            <Card
              key={entry.id}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {entry.recordedAt}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  HR {entry.heartRate} bpm · BP {entry.bloodPressure} · Temp{" "}
                  {entry.temperature}°C · RR {entry.respiratoryRate}/min · SpO2{" "}
                  {entry.spo2}% · Pain {entry.painScore}/10 · GCS {entry.gcs}
                </Typography>
                <Typography variant="body2">{entry.note}</Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </WorkflowSectionCard>
  );
}

export default function AsapEmergencyPage() {
  const theme = useTheme();
  const router = useRouter();
  const { permissions } = useUser();

  const [activePage, setActivePage] =
    React.useState<EmergencyPageId>("dashboard");

  const [patients, setPatients] =
    React.useState<EmergencyPatient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = React.useState<EmergencyBed[]>(INITIAL_BEDS);
  const [orders, setOrders] = React.useState<EmergencyOrder[]>(INITIAL_ORDERS);
  const [observationLog, setObservationLog] = React.useState<
    ObservationEntry[]
  >(INITIAL_OBSERVATION_LOG);

  const [selectedPatientId, setSelectedPatientId] = React.useState("");
  const [queueFilter, setQueueFilter] = React.useState<"ALL" | TriageLevel>(
    "ALL",
  );
  const [queueSearch, setQueueSearch] = React.useState("");
  const [queueView, setQueueView] = React.useState<QueueViewMode>("table");
  const [queueStatusFilter, setQueueStatusFilter] = React.useState<
    "ALL" | PatientStatus
  >("ALL");
  const [queueArrivalFilter, setQueueArrivalFilter] = React.useState<
    "ALL" | ArrivalMode
  >("ALL");
  const [queueDoctorFilter, setQueueDoctorFilter] = React.useState<
    "ALL" | string
  >("ALL");
  const [caseTrackingTab, setCaseTrackingTab] =
    React.useState<CaseTrackingTabId>("vitals");
  const [caseTrackingSearch, setCaseTrackingSearch] = React.useState("");
  const [caseTrackingFilter, setCaseTrackingFilter] =
    React.useState<CaseTrackingSidebarFilter>("All");
  const [bedFilter, setBedFilter] = React.useState<BedBoardFilter>("ALL");

  const [assignBedModalOpen, setAssignBedModalOpen] = React.useState(false);
  const [assignBedForm, setAssignBedForm] = React.useState<BedAssignForm>({
    patientId: "",
    bedId: "",
    physician: BED_ASSIGN_PHYSICIANS[0],
    nurse: BED_ASSIGN_NURSES[0],
    priority: "High",
    notes: "",
  });

  const [registrationModalOpen, setRegistrationModalOpen] =
    React.useState(false);
  const [triageModalOpen, setTriageModalOpen] = React.useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [dischargePreviewOpen, setDischargePreviewOpen] = React.useState(false);
  const [registrationSearch, setRegistrationSearch] = React.useState("");
  const [registrationForm, setRegistrationForm] =
    React.useState<RegistrationForm>(DEFAULT_REGISTRATION);

  const [triageForm, setTriageForm] =
    React.useState<TriageForm>(DEFAULT_TRIAGE);
  const [vitalsForm, setVitalsForm] =
    React.useState<VitalsForm>(DEFAULT_VITALS_FORM);

  const [orderForm, setOrderForm] =
    React.useState<OrderForm>(DEFAULT_ORDER_FORM);
  const [dischargeForm, setDischargeForm] = React.useState<DischargeForm>(
    DEFAULT_DISCHARGE_FORM,
  );
  const [clinicalNoteDraft, setClinicalNoteDraft] = React.useState("");

  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const notify = React.useCallback(
    (message: string, severity: ToastSeverity = "info") => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const selectedPatient = React.useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  React.useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }

    if (
      selectedPatientId &&
      !patients.some((patient) => patient.id === selectedPatientId)
    ) {
      setSelectedPatientId("");
    }
  }, [patients, selectedPatientId]);

  React.useEffect(() => {
    if (!selectedPatient) {
      setClinicalNoteDraft("");
      setDischargeForm(DEFAULT_DISCHARGE_FORM);
      setVitalsForm(DEFAULT_VITALS_FORM);
      return;
    }
    setClinicalNoteDraft(selectedPatient.clinicalNotes);
    setDischargeForm(buildDischargeDraft(selectedPatient));
    setVitalsForm({
      patientId: selectedPatient.id,
      heartRate: String(selectedPatient.vitals.heartRate),
      bloodPressure: selectedPatient.vitals.bloodPressure,
      temperature: String(selectedPatient.vitals.temperature),
      respiratoryRate: String(selectedPatient.vitals.respiratoryRate),
      spo2: String(selectedPatient.vitals.spo2),
      painScore: String(selectedPatient.vitals.painScore),
      gcs: String(selectedPatient.vitals.gcs),
      notes: "",
    });
  }, [selectedPatient]);

  React.useEffect(() => {
    setCaseTrackingTab("vitals");
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (!triageForm.patientId) {
      const firstPatient = patients[0];
      if (!firstPatient) return;
      setTriageForm({
        patientId: firstPatient.id,
        heartRate: String(firstPatient.vitals.heartRate),
        bloodPressure: firstPatient.vitals.bloodPressure,
        temperature: String(firstPatient.vitals.temperature),
        respiratoryRate: String(firstPatient.vitals.respiratoryRate),
        spo2: String(firstPatient.vitals.spo2),
        triageLevel: firstPatient.triageLevel,
      });
      return;
    }

    const triagePatient = patients.find(
      (entry) => entry.id === triageForm.patientId,
    );
    if (!triagePatient) return;

    setTriageForm((prev) => ({
      ...prev,
      heartRate: String(triagePatient.vitals.heartRate),
      bloodPressure: triagePatient.vitals.bloodPressure,
      temperature: String(triagePatient.vitals.temperature),
      respiratoryRate: String(triagePatient.vitals.respiratoryRate),
      spo2: String(triagePatient.vitals.spo2),
      triageLevel: triagePatient.triageLevel,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triageForm.patientId]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );

  const openRoute = React.useCallback(
    (route: string, query?: Record<string, string>) => {
      if (!canNavigate(route)) {
        notify("You do not have permission to open this module.", "warning");
        return;
      }

      const params = new URLSearchParams();
      Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `${route}?${queryString}` : route);
    },
    [canNavigate, notify, router],
  );

  const dashboardMetrics = React.useMemo(() => {
    const totalPatients = patients.length;
    const criticalPatients = patients.filter(
      (patient) => patient.triageLevel === "Critical",
    ).length;
    const waitingPatients = patients.filter(
      (patient) => patient.status === "Waiting",
    ).length;
    const availableBeds = beds.filter((bed) => bed.status === "Free").length;
    const occupiedOrCritical = beds.filter(
      (bed) => bed.status === "Occupied" || bed.status === "Critical",
    ).length;
    const bedOccupancyPercent =
      beds.length > 0
        ? Math.round((occupiedOrCritical / beds.length) * 100)
        : 0;
    const avgWaitMinutes =
      patients.length > 0
        ? Math.round(
            patients.reduce((acc, patient) => acc + patient.waitingMinutes, 0) /
              patients.length,
          )
        : 0;
    const doorToDocMinutes = Math.max(8, Math.round(avgWaitMinutes * 0.45));

    return {
      totalPatients,
      criticalPatients,
      waitingPatients,
      availableBeds,
      bedOccupancyPercent,
      avgWaitMinutes,
      doorToDocMinutes,
    };
  }, [beds, patients]);

  const bedOccupancy = React.useMemo(
    () => ({
      free: beds.filter((bed) => bed.status === "Free").length,
      occupied: beds.filter((bed) => bed.status === "Occupied").length,
      cleaning: beds.filter((bed) => bed.status === "Cleaning").length,
      critical: beds.filter((bed) => bed.status === "Critical").length,
    }),
    [beds],
  );

  const sortedQueueRows = React.useMemo(() => {
    const query = queueSearch.trim().toLowerCase();

    return [...patients]
      .filter((patient) => {
        if (queueFilter !== "ALL" && patient.triageLevel !== queueFilter)
          return false;
        if (queueStatusFilter !== "ALL" && patient.status !== queueStatusFilter)
          return false;
        if (
          queueArrivalFilter !== "ALL" &&
          patient.arrivalMode !== queueArrivalFilter
        )
          return false;
        if (
          queueDoctorFilter !== "ALL" &&
          patient.assignedDoctor !== queueDoctorFilter
        )
          return false;
        if (!query) return true;
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.mrn.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const acuityRank =
          triageRank(a.triageLevel) - triageRank(b.triageLevel);
        if (acuityRank !== 0) return acuityRank;
        return b.waitingMinutes - a.waitingMinutes;
      });
  }, [
    patients,
    queueArrivalFilter,
    queueDoctorFilter,
    queueFilter,
    queueSearch,
    queueStatusFilter,
  ]);

  const queueKanbanColumns = React.useMemo(
    () =>
      (Object.keys(TRIAGE_META) as TriageLevel[]).map((level) => ({
        level,
        rows: sortedQueueRows.filter(
          (patient) => patient.triageLevel === level,
        ),
      })),
    [sortedQueueRows],
  );

  const caseTrackingRows = React.useMemo(() => {
    const query = caseTrackingSearch.trim().toLowerCase();

    return [...patients]
      .filter((patient) => {
        if (
          caseTrackingFilter === "Critical" &&
          patient.triageLevel !== "Critical"
        ) {
          return false;
        }
        if (
          caseTrackingFilter === "In Treatment" &&
          !["In Treatment", "Observation"].includes(patient.status)
        ) {
          return false;
        }
        if (
          caseTrackingFilter === "Ready" &&
          patient.status !== "Ready for Disposition"
        ) {
          return false;
        }
        if (!query) return true;
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.mrn.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const acuityRank =
          triageRank(a.triageLevel) - triageRank(b.triageLevel);
        if (acuityRank !== 0) return acuityRank;
        return b.waitingMinutes - a.waitingMinutes;
      });
  }, [caseTrackingFilter, caseTrackingSearch, patients]);

  React.useEffect(() => {
    if (activePage !== "chart") return;
    if (caseTrackingRows.length === 0) return;
    if (caseTrackingRows.some((patient) => patient.id === selectedPatientId))
      return;
    setSelectedPatientId(caseTrackingRows[0].id);
  }, [activePage, caseTrackingRows, selectedPatientId]);

  const availableBeds = React.useMemo(
    () => beds.filter((bed) => bed.status === "Free"),
    [beds],
  );

  const queueDoctorOptions = React.useMemo(
    () =>
      Array.from(
        new Set(patients.map((patient) => patient.assignedDoctor)),
      ).sort(),
    [patients],
  );

  const assignBedPatient = React.useMemo(
    () => patients.find((patient) => patient.id === assignBedForm.patientId),
    [assignBedForm.patientId, patients],
  );

  const assignBedZones = React.useMemo(() => {
    const preferredOrder = ["Resus", "ER Bay", "Observation"];
    const grouped = beds.reduce<Record<string, EmergencyBed[]>>((acc, bed) => {
      if (!acc[bed.zone]) {
        acc[bed.zone] = [];
      }
      acc[bed.zone].push(bed);
      return acc;
    }, {});

    const known = preferredOrder
      .filter((zone) => grouped[zone]?.length)
      .map((zone) => ({
        zone,
        beds: grouped[zone].slice().sort((a, b) => a.id.localeCompare(b.id)),
      }));
    const extra = Object.keys(grouped)
      .filter((zone) => !preferredOrder.includes(zone))
      .sort((a, b) => a.localeCompare(b))
      .map((zone) => ({
        zone,
        beds: grouped[zone].slice().sort((a, b) => a.id.localeCompare(b.id)),
      }));

    return [...known, ...extra];
  }, [beds]);

  const filteredBedRows = React.useMemo(
    () =>
      beds.filter((bed) =>
        bedFilter === "ALL" ? true : bed.status === bedFilter,
      ),
    [bedFilter, beds],
  );

  const registrationMatches = React.useMemo(() => {
    const query = registrationSearch.trim().toLowerCase();
    if (!query) return [];

    return patients.filter((patient) => {
      const byMrn = patient.mrn.toLowerCase().includes(query);
      const byPhone = normalizePhone(patient.phone).includes(
        normalizePhone(query),
      );
      return byMrn || byPhone;
    });
  }, [patients, registrationSearch]);

  const selectedPatientOrders = React.useMemo(() => {
    if (!selectedPatient) return [];
    return orders.filter((order) => order.patientId === selectedPatient.id);
  }, [orders, selectedPatient]);

  const selectedPatientObservations = React.useMemo(() => {
    if (!selectedPatient) return [];
    return observationLog
      .filter((entry) => entry.patientId === selectedPatient.id)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  }, [observationLog, selectedPatient]);

  const handleRegistrationField = <K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K],
  ) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriageField = <K extends keyof TriageForm>(
    field: K,
    value: TriageForm[K],
  ) => {
    setTriageForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderField = <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsField = <K extends keyof VitalsForm>(
    field: K,
    value: VitalsForm[K],
  ) => {
    setVitalsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDischargeField = <K extends keyof DischargeForm>(
    field: K,
    value: DischargeForm[K],
  ) => {
    setDischargeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignBedField = <K extends keyof BedAssignForm>(
    field: K,
    value: BedAssignForm[K],
  ) => {
    setAssignBedForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseExistingPatient = React.useCallback((patientId: string) => {
    setRegistrationModalOpen(false);
    setSelectedPatientId(patientId);
    setActivePage("chart");
  }, []);

  const openTriageAssessment = React.useCallback(
    (patientId: string) => {
      const triagePatient = patients.find(
        (patient) => patient.id === patientId,
      );
      if (!triagePatient) return;

      setSelectedPatientId(triagePatient.id);
      setTriageForm({
        patientId: triagePatient.id,
        heartRate: String(triagePatient.vitals.heartRate),
        bloodPressure: triagePatient.vitals.bloodPressure,
        temperature: String(triagePatient.vitals.temperature),
        respiratoryRate: String(triagePatient.vitals.respiratoryRate),
        spo2: String(triagePatient.vitals.spo2),
        triageLevel: triagePatient.triageLevel,
      });
      setTriageModalOpen(true);
    },
    [patients],
  );

  const openVitalsDialog = React.useCallback(
    (patientId?: string) => {
      const targetPatient = patients.find(
        (patient) => patient.id === (patientId || selectedPatientId),
      );
      if (!targetPatient) {
        notify("Select a patient before recording vitals.", "warning");
        return;
      }

      setSelectedPatientId(targetPatient.id);
      setVitalsForm({
        patientId: targetPatient.id,
        heartRate: String(targetPatient.vitals.heartRate),
        bloodPressure: targetPatient.vitals.bloodPressure,
        temperature: String(targetPatient.vitals.temperature),
        respiratoryRate: String(targetPatient.vitals.respiratoryRate),
        spo2: String(targetPatient.vitals.spo2),
        painScore: String(targetPatient.vitals.painScore),
        gcs: String(targetPatient.vitals.gcs),
        notes: "",
      });
      setVitalsDialogOpen(true);
    },
    [notify, patients, selectedPatientId],
  );

  const openAssignBedModal = React.useCallback(
    (patientId: string, preferredBedId = "") => {
      const queuePatient = patients.find((patient) => patient.id === patientId);
      if (!queuePatient) {
        return;
      }

      const suggestedPriority: BedAssignPriority =
        queuePatient.triageLevel === "Critical"
          ? "Immediate"
          : queuePatient.triageLevel === "Emergency"
            ? "High"
            : queuePatient.triageLevel === "Urgent"
              ? "Medium"
              : "Standard";

      setSelectedPatientId(queuePatient.id);
      setAssignBedForm({
        patientId: queuePatient.id,
        bedId: preferredBedId,
        physician: queuePatient.assignedDoctor || BED_ASSIGN_PHYSICIANS[0],
        nurse: BED_ASSIGN_NURSES[0],
        priority: suggestedPriority,
        notes: "",
      });
      setAssignBedModalOpen(true);
    },
    [patients],
  );

  const handleRegisterPatient = React.useCallback(() => {
    const name = registrationForm.name.trim();
    const complaint = registrationForm.chiefComplaint.trim();
    const phone = normalizePhone(registrationForm.phone);
    const age = Number(registrationForm.age);

    if (
      !name ||
      !complaint ||
      !phone ||
      phone.length < 10 ||
      !Number.isFinite(age) ||
      age <= 0
    ) {
      notify(
        "Please enter valid registration details before saving.",
        "warning",
      );
      return;
    }

    const duplicate = patients.find(
      (patient) => normalizePhone(patient.phone) === phone,
    );
    if (duplicate) {
      notify(`Patient already exists in ER queue: ${duplicate.id}`, "info");
      setRegistrationModalOpen(false);
      setSelectedPatientId(duplicate.id);
      setActivePage("chart");
      return;
    }

    const id = buildPatientId();
    const mrn = buildMrn();

    const nextPatient: EmergencyPatient = {
      id,
      mrn,
      name,
      age,
      gender: registrationForm.gender,
      phone,
      arrivalMode: registrationForm.arrivalMode,
      broughtBy: registrationForm.broughtBy.trim() || "Not specified",
      chiefComplaint: complaint,
      triageLevel: registrationForm.triageLevel,
      waitingMinutes: 0,
      assignedBed: null,
      assignedDoctor: "ED Duty Team",
      status: "Waiting",
      vitals: {
        heartRate: 0,
        bloodPressure: "--",
        temperature: 0,
        respiratoryRate: 0,
        spo2: 0,
        painScore: 0,
        gcs: 15,
        capturedAt: nowLabel(),
      },
      allergies: ["No known allergies"],
      safetyFlags: ["Needs initial triage"],
      clinicalNotes: "Registration completed. Pending triage assessment.",
      updatedAt: nowLabel(),
    };

    setPatients((prev) => [nextPatient, ...prev]);
    setSelectedPatientId(nextPatient.id);
    setRegistrationModalOpen(false);
    setRegistrationSearch("");
    setRegistrationForm(DEFAULT_REGISTRATION);
    setActivePage("triage");
    setTriageForm({
      patientId: nextPatient.id,
      heartRate: String(nextPatient.vitals.heartRate),
      bloodPressure: nextPatient.vitals.bloodPressure,
      temperature: String(nextPatient.vitals.temperature),
      respiratoryRate: String(nextPatient.vitals.respiratoryRate),
      spo2: String(nextPatient.vitals.spo2),
      triageLevel: registrationForm.triageLevel,
    });
    setTriageModalOpen(true);
    notify(
      `Emergency registration completed for ${nextPatient.id}.`,
      "success",
    );
  }, [notify, patients, registrationForm]);

  const handleSaveTriage = React.useCallback(() => {
    const triagePatient = patients.find(
      (patient) => patient.id === triageForm.patientId,
    );
    if (!triagePatient) {
      notify("Select a patient for triage assessment.", "warning");
      return;
    }

    const heartRate = Number(triageForm.heartRate);
    const temperature = Number(triageForm.temperature);
    const respiratoryRate = Number(triageForm.respiratoryRate);
    const spo2 = Number(triageForm.spo2);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !triageForm.bloodPressure.trim()
    ) {
      notify("Capture complete vitals before submitting triage.", "warning");
      return;
    }

    const nextPatients = patients.map((patient) =>
      patient.id === triagePatient.id
        ? {
            ...patient,
            triageLevel: triageForm.triageLevel,
            status:
              patient.status === "Waiting" ? "In Treatment" : patient.status,
            vitals: {
              heartRate,
              bloodPressure: triageForm.bloodPressure.trim(),
              temperature,
              respiratoryRate,
              spo2,
              painScore: patient.vitals.painScore,
              gcs: patient.vitals.gcs,
              capturedAt: nowLabel(),
            },
            updatedAt: nowLabel(),
          }
        : patient,
    );

    setPatients(nextPatients);
    setBeds((prev) => applyPatientAcuityToBeds(nextPatients, prev));

    setObservationLog((prev) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: triagePatient.id,
        recordedAt: nowLabel(),
        heartRate,
        bloodPressure: triageForm.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore: triagePatient.vitals.painScore,
        gcs: triagePatient.vitals.gcs,
        note: `Triage assessment updated (${triageForm.triageLevel})`,
      },
      ...prev,
    ]);

    setSelectedPatientId(triagePatient.id);
    setActivePage("triage");
    setTriageModalOpen(false);
    notify(`Triage saved for ${triagePatient.id}.`, "success");
  }, [notify, patients, triageForm]);

  const assignBed = React.useCallback(
    (
      patientId: string,
      bedId: string,
      assignment?: Pick<
        BedAssignForm,
        "physician" | "nurse" | "priority" | "notes"
      >,
    ) => {
      const patient = patients.find((row) => row.id === patientId);
      const bed = beds.find((row) => row.id === bedId);
      if (!patient || !bed || bed.status !== "Free") {
        notify("Selected bed is not available.", "warning");
        return;
      }

      const assignmentMemo = assignment
        ? [
            `Bed ${bedId} assigned`,
            assignment.physician ? `Physician: ${assignment.physician}` : "",
            assignment.nurse ? `Nurse: ${assignment.nurse}` : "",
            `Priority: ${assignment.priority}`,
            assignment.notes.trim() ? `Notes: ${assignment.notes.trim()}` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        : "";

      const nextPatients = patients.map((row) =>
        row.id === patientId
          ? {
              ...row,
              assignedBed: bedId,
              assignedDoctor: assignment?.physician || row.assignedDoctor,
              status: row.status === "Waiting" ? "In Treatment" : row.status,
              clinicalNotes: assignmentMemo
                ? `${row.clinicalNotes}\n${nowLabel()} · ${assignmentMemo}`.trim()
                : row.clinicalNotes,
              updatedAt: nowLabel(),
            }
          : row,
      );

      const nextBeds = beds.map((row) => {
        if (row.id === bedId) {
          return {
            ...row,
            patientId,
            status: bedStatusForPatient(patient.triageLevel),
          };
        }

        if (row.patientId === patientId && row.id !== bedId) {
          return {
            ...row,
            patientId: null,
            status: "Cleaning" as BedStatus,
          };
        }

        return row;
      });

      setPatients(nextPatients);
      setBeds(applyPatientAcuityToBeds(nextPatients, nextBeds));
      setSelectedPatientId(patientId);
      notify(`Bed assigned: ${patientId} -> ${bedId}`, "success");
    },
    [beds, notify, patients],
  );

  const handleOpenPatientChart = React.useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePage("chart");
  }, []);

  const handleConfirmAssignBed = React.useCallback(() => {
    if (!assignBedForm.patientId || !assignBedForm.bedId) {
      notify(
        "Select an available bed before confirming assignment.",
        "warning",
      );
      return;
    }

    assignBed(assignBedForm.patientId, assignBedForm.bedId, {
      physician: assignBedForm.physician,
      nurse: assignBedForm.nurse,
      priority: assignBedForm.priority,
      notes: assignBedForm.notes,
    });
    setAssignBedModalOpen(false);
    handleOpenPatientChart(assignBedForm.patientId);
  }, [
    assignBed,
    assignBedForm.bedId,
    assignBedForm.patientId,
    handleOpenPatientChart,
    notify,
  ]);

  const handleSetBedFree = React.useCallback(
    (bedId: string) => {
      setBeds((prev) =>
        prev.map((bed) =>
          bed.id === bedId ? { ...bed, status: "Free", patientId: null } : bed,
        ),
      );

      setPatients((prev) =>
        prev.map((patient) =>
          patient.assignedBed === bedId
            ? {
                ...patient,
                assignedBed: null,
                status: "Waiting",
                updatedAt: nowLabel(),
              }
            : patient,
        ),
      );
      notify(`${bedId} is now marked Free.`, "success");
    },
    [notify],
  );

  const handleSaveClinicalNote = React.useCallback(() => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatient.id
          ? {
              ...patient,
              clinicalNotes: clinicalNoteDraft.trim(),
              updatedAt: nowLabel(),
            }
          : patient,
      ),
    );
    notify("Clinical note updated.", "success");
  }, [clinicalNoteDraft, notify, selectedPatient]);

  const handleApplyOrderTemplate = React.useCallback((template: string) => {
    setOrderForm((prev) => ({ ...prev, item: template }));
  }, []);

  const handleAddOrder = React.useCallback(() => {
    if (!selectedPatient) {
      notify("Select a patient before adding an order.", "warning");
      return;
    }

    const item = orderForm.item.trim();
    if (!item) {
      notify("Order item is required.", "warning");
      return;
    }

    setOrders((prev) => [
      {
        id: `ER-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: selectedPatient.id,
        type: orderForm.type,
        item,
        priority: orderForm.priority,
        status: "Pending",
        orderedAt: nowLabel(),
      },
      ...prev,
    ]);

    setOrderForm(DEFAULT_ORDER_FORM);
    notify("Emergency order placed.", "success");
  }, [notify, orderForm, selectedPatient]);

  const handleOrderStatusChange = React.useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order,
        ),
      );
    },
    [],
  );

  const handleSaveVitals = React.useCallback(() => {
    const targetPatient = patients.find(
      (patient) => patient.id === vitalsForm.patientId,
    );
    if (!targetPatient) {
      notify("Select a patient before recording vitals.", "warning");
      return;
    }

    const heartRate = Number(vitalsForm.heartRate);
    const temperature = Number(vitalsForm.temperature);
    const respiratoryRate = Number(vitalsForm.respiratoryRate);
    const spo2 = Number(vitalsForm.spo2);
    const painScore = Number(vitalsForm.painScore);
    const gcs = Number(vitalsForm.gcs);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !Number.isFinite(painScore) ||
      !Number.isFinite(gcs) ||
      !vitalsForm.bloodPressure.trim()
    ) {
      notify("Complete all vital parameters before saving.", "warning");
      return;
    }

    const updatedAt = nowLabel();
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === targetPatient.id
          ? {
              ...patient,
              vitals: {
                heartRate,
                bloodPressure: vitalsForm.bloodPressure.trim(),
                temperature,
                respiratoryRate,
                spo2,
                painScore,
                gcs,
                capturedAt: updatedAt,
              },
              updatedAt,
            }
          : patient,
      ),
    );

    setObservationLog((prev) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: targetPatient.id,
        recordedAt: updatedAt,
        heartRate,
        bloodPressure: vitalsForm.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore,
        gcs,
        note: vitalsForm.notes.trim() || "Bedside vital capture",
      },
      ...prev,
    ]);

    setVitalsDialogOpen(false);
    notify(`Vitals recorded for ${targetPatient.id}.`, "success");
  }, [notify, patients, vitalsForm]);

  const handleDisposition = React.useCallback(
    (action: "discharge" | "admit" | "transfer") => {
      if (!selectedPatient) {
        notify("Select a patient before disposition.", "warning");
        return;
      }

      if (
        action === "discharge" &&
        (!dischargeForm.diagnosis.trim() || !dischargeForm.instructions.trim())
      ) {
        notify(
          "Add diagnosis and discharge instructions before discharging.",
          "warning",
        );
        return;
      }

      const patientId = selectedPatient.id;
      const patientMrn = selectedPatient.mrn;

      setPatients((prev) => prev.filter((patient) => patient.id !== patientId));
      setOrders((prev) =>
        prev.filter((order) => order.patientId !== patientId),
      );
      setObservationLog((prev) =>
        prev.filter((entry) => entry.patientId !== patientId),
      );
      setBeds((prev) =>
        prev.map((bed) =>
          bed.patientId === patientId
            ? {
                ...bed,
                patientId: null,
                status: "Cleaning",
              }
            : bed,
        ),
      );

      if (action === "admit") {
        notify(`${patientId} moved to IPD admission flow.`, "success");
        openRoute("/ipd/admissions", { mrn: patientMrn, source: "ER" });
        return;
      }

      if (action === "discharge") {
        notify(`${patientId} discharged from emergency.`, "success");
        openRoute("/billing/invoices", { mrn: patientMrn });
        return;
      }

      notify(`${patientId} transferred to next care unit.`, "info");
      openRoute("/appointments/queue", { mrn: patientMrn });
    },
    [
      dischargeForm.diagnosis,
      dischargeForm.instructions,
      notify,
      openRoute,
      selectedPatient,
    ],
  );

  const arrivalColumns = React.useMemo<CommonColumn<EmergencyPatient>[]>(
    () => [
      {
        headerName: "Patient",
        field: "name",
        width: 250,
        renderCell: (row) => {
          const initials = row.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.id} · {row.mrn}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        headerName: "Triage Level",
        field: "triageLevel",
        width: 140,
        renderCell: (row) => <TriageBadge level={row.triageLevel} />,
      },
      {
        headerName: "Complaint",
        field: "chiefComplaint",
        width: 280,
      },
      {
        headerName: "Wait",
        field: "waitingMinutes",
        width: 100,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color:
                row.waitingMinutes > 45
                  ? "error.main"
                  : row.waitingMinutes > 25
                    ? "warning.main"
                    : "success.main",
            }}
          >
            {row.waitingMinutes}m
          </Typography>
        ),
      },
      {
        headerName: "Bed",
        field: "assignedBed",
        width: 120,
        renderCell: (row) => row.assignedBed ?? "Not Assigned",
      },
      {
        headerName: "Doctor",
        field: "assignedDoctor",
        width: 150,
      },
      {
        headerName: "Status",
        field: "status",
        width: 140,
      },
      {
        headerName: "Actions",
        field: "id",
        width: 320,
        align: "right",
        headerAlign: "right",
        renderCell: (row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {activePage === "triage" && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTriageAssessment(row.id);
                  }}
                >
                  Triage
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={availableBeds.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAssignBedModal(row.id);
                  }}
                >
                  Assign Bed
                </Button>
              </>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                if (activePage === "dashboard") {
                  setSelectedPatientId(row.id);
                  setActivePage("chart");
                } else {
                  handleOpenPatientChart(row.id);
                }
              }}
            >
              Open Case Tracking
            </Button>
          </Stack>
        ),
      },
    ],
    [
      activePage,
      availableBeds.length,
      openAssignBedModal,
      openTriageAssessment,
      handleOpenPatientChart,
    ],
  );

  const observationColumns = React.useMemo<CommonColumn<ObservationEntry>[]>(
    () => [
      {
        headerName: "Recorded",
        field: "recordedAt",
        width: 120,
      },
      {
        headerName: "BP",
        field: "bloodPressure",
        width: 110,
      },
      {
        headerName: "HR",
        field: "heartRate",
        width: 80,
      },
      {
        headerName: "RR",
        field: "respiratoryRate",
        width: 80,
      },
      {
        headerName: "SpO2",
        field: "spo2",
        width: 90,
        renderCell: (row) => `${row.spo2}%`,
      },
      {
        headerName: "Pain",
        field: "painScore",
        width: 100,
        renderCell: (row) => `${row.painScore}/10`,
      },
      {
        headerName: "Note",
        field: "note",
        width: 250,
      },
    ],
    [],
  );

  const renderDashboard = () => {
    const panelPatient = selectedPatient;
    const alertToneStyles: Record<
      EmergencyAlertItem["tone"],
      { border: string; bg: string; color: string }
    > = {
      critical: {
        border: alpha(theme.palette.error.main, 0.4),
        bg: alpha(theme.palette.error.main, 0.08),
        color: theme.palette.error.main,
      },
      warning: {
        border: alpha(theme.palette.warning.main, 0.42),
        bg: alpha(theme.palette.warning.main, 0.12),
        color: theme.palette.warning.dark,
      },
      info: {
        border: alpha(theme.palette.info.main, 0.4),
        bg: alpha(theme.palette.info.main, 0.08),
        color: theme.palette.info.main,
      },
      success: {
        border: alpha(theme.palette.success.main, 0.42),
        bg: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.dark,
      },
    };

    return (
      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Critical Patients"
            value={dashboardMetrics.criticalPatients}
            subtitle="Highest acuity cases"
            icon={<MonitorHeartIcon />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="In Queue"
            value={dashboardMetrics.waitingPatients}
            subtitle={`Avg wait ${dashboardMetrics.avgWaitMinutes} min`}
            icon={<ViewListIcon />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Bed Occupancy"
            value={`${dashboardMetrics.bedOccupancyPercent}%`}
            subtitle={`${bedOccupancy.occupied + bedOccupancy.critical}/${beds.length} occupied`}
            icon={<BedIcon />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Discharged Today"
            value={OPERATIONS_SNAPSHOT.dischargedToday}
            subtitle="Shift cumulative"
            icon={<AssignmentTurnedInIcon />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Staff On Duty"
            value={OPERATIONS_SNAPSHOT.staffOnDuty}
            subtitle={`${OPERATIONS_SNAPSHOT.physiciansOnDuty} MD · ${OPERATIONS_SNAPSHOT.nursesOnDuty} RN`}
            icon={<PersonAddAlt1Icon />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Door-to-Doc"
            value={`${dashboardMetrics.doorToDocMinutes}m`}
            subtitle="Operational average"
            icon={<TimelineIcon />}
          />
        </Grid>

        <Grid xs={12} lg={12}>
          <Stack spacing={2}>
            {sortedQueueRows.length === 0 ? (
              <Stack spacing={1.25} alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">
                  No emergency arrivals yet for this shift.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAlt1Icon />}
                  onClick={() => setRegistrationModalOpen(true)}
                >
                  Register First Patient
                </Button>
              </Stack>
            ) : (
              <CommonDataGrid<EmergencyPatient>
                rows={sortedQueueRows.slice(0, 8)}
                columns={arrivalColumns}
                getRowId={(row) => row.id}
                searchPlaceholder="Search patients..."
                searchFields={["name", "mrn", "id"]}
                toolbarRight={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonAddAlt1Icon />}
                      onClick={() => setRegistrationModalOpen(true)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      New Arrival
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setActivePage("triage")}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      View All
                    </Button>
                  </Stack>
                }
              />
            )}
          </Stack>
        </Grid>
      </Grid>
    );
  };

  const renderRegistrationModalContent = () => (
    <Stack spacing={2.25}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Existing Patient Check
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Stack spacing={1}>
          <TextField
            size="small"
            label="MRN or Phone"
            value={registrationSearch}
            onChange={(event) => setRegistrationSearch(event.target.value)}
            placeholder="Search existing patient before new registration"
            fullWidth
          />

          {!registrationSearch.trim() ? (
            <Typography variant="caption" color="text.secondary">
              Search by MRN or phone to reuse an existing chart.
            </Typography>
          ) : registrationMatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No existing match found.
            </Typography>
          ) : (
            <Stack
              spacing={0.75}
              sx={{
                maxHeight: 180,
                overflowY: "auto",
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.light, 0.04),
              }}
            >
              {registrationMatches.map((patient) => (
                <Stack
                  key={patient.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={0.75}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  sx={{
                    p: 0.85,
                    borderRadius: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {patient.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {patient.id} · {patient.mrn} · {patient.phone}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUseExistingPatient(patient.id)}
                  >
                    Open Existing Chart
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Patient Demographics
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Grid container spacing={1}>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Patient Name *"
              value={registrationForm.name}
              onChange={(event) =>
                handleRegistrationField("name", event.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={2}>
            <TextField
              size="small"
              label="Age *"
              value={registrationForm.age}
              onChange={(event) =>
                handleRegistrationField("age", event.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              size="small"
              select
              label="Gender"
              value={registrationForm.gender}
              onChange={(event) =>
                handleRegistrationField("gender", event.target.value as Gender)
              }
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Phone *"
              value={registrationForm.phone}
              onChange={(event) =>
                handleRegistrationField("phone", event.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Brought By"
              value={registrationForm.broughtBy}
              onChange={(event) =>
                handleRegistrationField("broughtBy", event.target.value)
              }
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Emergency Details
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Grid container spacing={1}>
          <Grid xs={12} md={8}>
            <TextField
              size="small"
              label="Chief Complaint *"
              value={registrationForm.chiefComplaint}
              onChange={(event) =>
                handleRegistrationField("chiefComplaint", event.target.value)
              }
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              size="small"
              select
              label="Mode of Arrival"
              value={registrationForm.arrivalMode}
              onChange={(event) =>
                handleRegistrationField(
                  "arrivalMode",
                  event.target.value as ArrivalMode,
                )
              }
              fullWidth
            >
              <MenuItem value="Ambulance">Ambulance</MenuItem>
              <MenuItem value="Walk-in">Walk-in</MenuItem>
              <MenuItem value="Referral">Referral</MenuItem>
              <MenuItem value="Police">Police</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Triage Level Assignment
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {TRIAGE_LEVEL_ORDER.map((level) => {
            const selected = registrationForm.triageLevel === level;
            const detail = TRIAGE_LEVEL_LABELS[level];

            return (
              <Box
                key={level}
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 6px)",
                    lg: "1 1 calc(20% - 6px)",
                  },
                }}
              >
                <Button
                  fullWidth
                  variant={selected ? "contained" : "outlined"}
                  color={TRIAGE_BUTTON_COLOR[level]}
                  onClick={() => handleRegistrationField("triageLevel", level)}
                  sx={{
                    py: 1,
                    px: 0.5,
                    borderRadius: 1.5,
                    textTransform: "none",
                  }}
                >
                  <Stack spacing={0.1} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {detail.level}
                    </Typography>
                    <Typography variant="caption">{detail.note}</Typography>
                  </Stack>
                </Button>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );

  const renderTriageModalContent = () => (
    <Stack spacing={1.5}>
      <Grid container spacing={1}>
        <Grid xs={12} md={5}>
          <TextField
            size="small"
            select
            label="Patient"
            value={triageForm.patientId}
            onChange={(event) =>
              handleTriageField("patientId", event.target.value)
            }
            fullWidth
          >
            {patients.map((patient) => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.id} · {patient.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={3}>
          <TextField
            size="small"
            label="Heart Rate"
            value={triageForm.heartRate}
            onChange={(event) =>
              handleTriageField("heartRate", event.target.value)
            }
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Blood Pressure"
            value={triageForm.bloodPressure}
            onChange={(event) =>
              handleTriageField("bloodPressure", event.target.value)
            }
            fullWidth
          />
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Temperature"
            value={triageForm.temperature}
            onChange={(event) =>
              handleTriageField("temperature", event.target.value)
            }
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Respiratory Rate"
            value={triageForm.respiratoryRate}
            onChange={(event) =>
              handleTriageField("respiratoryRate", event.target.value)
            }
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="SpO2"
            value={triageForm.spo2}
            onChange={(event) => handleTriageField("spo2", event.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Triage Level
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {TRIAGE_LEVEL_ORDER.map((level) => (
            <Chip
              key={level}
              label={`${TRIAGE_LEVEL_LABELS[level].level} · ${level}`}
              clickable
              color={TRIAGE_META[level].color}
              variant={triageForm.triageLevel === level ? "filled" : "outlined"}
              onClick={() => handleTriageField("triageLevel", level)}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );

  const renderAssignBedModalContent = () => {
    if (!assignBedPatient) {
      return (
        <Alert severity="info">
          Select a patient from Arrivals & Triage to assign bed.
        </Alert>
      );
    }

    const initials = assignBedPatient.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
    const selectedBed = beds.find((bed) => bed.id === assignBedForm.bedId);

    return (
      <Grid container spacing={2}>
        <Grid xs={12} lg={8}>
          <Stack spacing={1.25}>
            <Card
              elevation={0}
              sx={{
                p: 1.25,
                borderRadius: 1.8,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.1,
                    bgcolor: "primary.main",
                    color: "common.white",
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {initials || "P"}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {assignBedPatient.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {assignBedPatient.id} · {assignBedPatient.mrn} ·{" "}
                    {assignBedPatient.age} / {assignBedPatient.gender}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.35 }}>
                    {assignBedPatient.chiefComplaint}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {assignBedZones.map((zoneEntry) => {
              const freeCount = zoneEntry.beds.filter(
                (bed) => bed.status === "Free",
              ).length;
              return (
                <Box key={zoneEntry.zone}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.75 }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      {zoneEntry.zone}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${freeCount}/${zoneEntry.beds.length} free`}
                      color={freeCount > 0 ? "success" : "warning"}
                      variant="outlined"
                    />
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 0.75,
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(3, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                      },
                    }}
                  >
                    {zoneEntry.beds.map((bed) => {
                      const occupiedPatient = bed.patientId
                        ? patients.find(
                            (patient) => patient.id === bed.patientId,
                          )
                        : null;
                      const selectable = bed.status === "Free";
                      const selected = assignBedForm.bedId === bed.id;

                      return (
                        <Card
                          key={bed.id}
                          elevation={0}
                          onClick={() => {
                            if (!selectable) return;
                            handleAssignBedField("bedId", bed.id);
                          }}
                          sx={{
                            p: 0.9,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: selected
                              ? alpha(theme.palette.primary.main, 0.7)
                              : alpha(theme.palette.divider, 0.75),
                            bgcolor: selected
                              ? alpha(theme.palette.primary.main, 0.08)
                              : "background.paper",
                            cursor: selectable ? "pointer" : "not-allowed",
                            opacity: selectable ? 1 : 0.74,
                            transition: "all .15s ease-in-out",
                          }}
                        >
                          <Stack spacing={0.45}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700 }}
                              >
                                {bed.id}
                              </Typography>
                              <Chip
                                size="small"
                                label={bed.status}
                                color={BED_STATUS_META[bed.status].color}
                                variant="outlined"
                                sx={{ "& .MuiChip-label": { px: 0.65 } }}
                              />
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {occupiedPatient
                                ? occupiedPatient.name
                                : "Available"}
                            </Typography>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Grid>

        <Grid xs={12} lg={4}>
          <Stack spacing={1}>
            <Card
              elevation={0}
              sx={{
                p: 1.1,
                borderRadius: 1.6,
                border: "1px solid",
                borderColor: assignBedForm.bedId
                  ? alpha(theme.palette.primary.main, 0.45)
                  : "divider",
                bgcolor: assignBedForm.bedId
                  ? alpha(theme.palette.primary.main, 0.05)
                  : alpha(theme.palette.background.default, 0.6),
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", fontWeight: 700 }}
              >
                Selected Bed
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.2 }}>
                {selectedBed?.id || "Not Selected"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedBed
                  ? `${selectedBed.zone} · ${selectedBed.status}`
                  : "Choose an available bed from the left panel."}
              </Typography>
            </Card>

            <TextField
              size="small"
              select
              label="Assign Physician"
              value={assignBedForm.physician}
              onChange={(event) =>
                handleAssignBedField("physician", event.target.value)
              }
              fullWidth
            >
              {BED_ASSIGN_PHYSICIANS.map((doctor) => (
                <MenuItem key={doctor} value={doctor}>
                  {doctor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              select
              label="Assign Nurse"
              value={assignBedForm.nurse}
              onChange={(event) =>
                handleAssignBedField("nurse", event.target.value)
              }
              fullWidth
            >
              {BED_ASSIGN_NURSES.map((nurse) => (
                <MenuItem key={nurse} value={nurse}>
                  {nurse}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              select
              label="Priority"
              value={assignBedForm.priority}
              onChange={(event) =>
                handleAssignBedField(
                  "priority",
                  event.target.value as BedAssignPriority,
                )
              }
              fullWidth
            >
              {(
                [
                  "Immediate",
                  "High",
                  "Medium",
                  "Standard",
                ] as BedAssignPriority[]
              ).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Nurse Notes"
              value={assignBedForm.notes}
              onChange={(event) =>
                handleAssignBedField("notes", event.target.value)
              }
              multiline
              minRows={3}
              placeholder="Any handoff notes, safety points, or transfer instructions"
              fullWidth
            />

            <Button
              variant="contained"
              disabled={!assignBedForm.bedId}
              onClick={handleConfirmAssignBed}
            >
              Confirm Bed Assignment
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  const renderQueueToolbar = () => (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.1),
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={1.5}
        >
          <TextField
            size="small"
            placeholder="Search patients..."
            value={queueSearch}
            onChange={(e) => setQueueSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { md: 340 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "background.paper",
              },
            }}
          />

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              select
              value={queueStatusFilter}
              onChange={(e) => setQueueStatusFilter(e.target.value as any)}
              sx={{
                // width: 130,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                },
              }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              {[
                "Waiting",
                "In Treatment",
                "Observation",
                "Ready for Disposition",
              ].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              value={queueArrivalFilter}
              onChange={(e) => setQueueArrivalFilter(e.target.value as any)}
              sx={{
                // width: 120,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                },
              }}
            >
              <MenuItem value="ALL">All Arrival</MenuItem>
              {["Ambulance", "Walk-in", "Referral", "Police"].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              value={queueDoctorFilter}
              onChange={(e) => setQueueDoctorFilter(e.target.value as any)}
              sx={{
                // width: 130,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                },
              }}
            >
              <MenuItem value="ALL">All Doctors</MenuItem>
              {queueDoctorOptions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Button
              size="small"
              startIcon={<ViewListIcon sx={{ fontSize: 18 }} />}
              variant={queueView === "table" ? "contained" : "text"}
              onClick={() => setQueueView("table")}
              sx={{
                borderRadius: 2.5,
                px: 2,
                textTransform: "none",
                fontWeight: queueView === "table" ? 700 : 500,
                bgcolor: queueView === "table" ? "primary.main" : "transparent",
                color: queueView === "table" ? "white" : "text.secondary",
                "&:hover": {
                  bgcolor:
                    queueView === "table"
                      ? "primary.dark"
                      : alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Table
            </Button>
            <Button
              size="small"
              startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
              variant={queueView === "kanban" ? "contained" : "text"}
              onClick={() => setQueueView("kanban")}
              sx={{
                borderRadius: 2.5,
                px: 2,
                textTransform: "none",
                fontWeight: queueView === "kanban" ? 700 : 500,
                bgcolor:
                  queueView === "kanban" ? "primary.main" : "transparent",
                color: queueView === "kanban" ? "white" : "text.secondary",
                "&:hover": {
                  bgcolor:
                    queueView === "kanban"
                      ? "primary.dark"
                      : alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Kanban
            </Button>
          </Box>

          <Button
            size="small"
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={() => setRegistrationModalOpen(true)}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              px: 2.5,
              textTransform: "none",
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            Register Patient
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );

  const renderQueue = () => (
    <Stack spacing={2}>
      {/* Unified Header & Triage Filter Row */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.08),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "flex-start", lg: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
            >
              Arrivals & Triage
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "text.secondary",
                mr: 1,
              }}
            >
              Filter Triage:
            </Typography>
            {(
              ["ALL", ...Object.keys(TRIAGE_META)] as Array<"ALL" | TriageLevel>
            ).map((level) => (
              <Chip
                key={level}
                label={level === "ALL" ? "All Patients" : level}
                clickable
                color={
                  level === "ALL"
                    ? queueFilter === "ALL"
                      ? "primary"
                      : "default"
                    : TRIAGE_META[level as TriageLevel].color
                }
                variant={queueFilter === level ? "filled" : "outlined"}
                onClick={() => setQueueFilter(level)}
                sx={{
                  fontWeight: 700,
                  height: 32,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {renderQueueToolbar()}

      <Box>
        {queueView === "table" ? (
          <CommonDataGrid<EmergencyPatient>
            rows={sortedQueueRows}
            columns={arrivalColumns}
            getRowId={(row) => row.id}
            hideToolbar
            emptyTitle="No queue rows found for the selected filter."
          />
        ) : (
          <Box sx={{ overflowX: "auto", pb: 0.5 }}>
            <Stack direction="row" spacing={2} sx={{ minWidth: 1200 }}>
              {queueKanbanColumns.map((column) => (
                <Box
                  key={column.level}
                  sx={{
                    flex: 1,
                    minWidth: 280,
                    maxWidth: 320,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderLeft: "4px solid",
                        borderLeftColor: TRIAGE_META[column.level].accent,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: "text.primary" }}
                      >
                        {column.level}
                      </Typography>
                      <Chip
                        size="small"
                        label={column.rows.length}
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(TRIAGE_META[column.level].accent, 0.1),
                          color: TRIAGE_META[column.level].accent,
                          border: "1px solid",
                          borderColor: alpha(
                            TRIAGE_META[column.level].accent,
                            0.2,
                          ),
                        }}
                      />
                    </Stack>

                    <Stack
                      spacing={1.25}
                      sx={{
                        p: 1.25,
                        borderRadius: 3,
                        bgcolor: alpha(TRIAGE_META[column.level].accent, 0.04),
                        border: "1px solid",
                        borderColor: alpha(
                          TRIAGE_META[column.level].accent,
                          0.15,
                        ),
                        minHeight: 500,
                      }}
                    >
                      {column.rows.length === 0 ? (
                        <Box
                          sx={{
                            py: 4,
                            textAlign: "center",
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="caption" color="text.disabled">
                            No patients in {column.level}
                          </Typography>
                        </Box>
                      ) : (
                        column.rows.map((patient) => (
                          <Card
                            key={patient.id}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              border: "1px solid",
                              borderColor: alpha(
                                TRIAGE_META[column.level].accent,
                                0.5,
                              ),
                              bgcolor: "background.paper",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                borderColor: TRIAGE_META[column.level].accent,
                                boxShadow: `0 4px 12px ${alpha(TRIAGE_META[column.level].accent, 0.1)}`,
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Stack spacing={1.25}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {patient.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.25 }}
                                >
                                  {patient.id} · {patient.mrn}
                                </Typography>
                              </Box>

                              <Stack spacing={0.75}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <BedIcon
                                    sx={{
                                      fontSize: 14,
                                      color: "text.disabled",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Bed: {patient.assignedBed ?? "Not Assigned"}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <FavoriteBorderIcon
                                    sx={{
                                      fontSize: 14,
                                      color: "text.disabled",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Dr: {patient.assignedDoctor}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <TimelineIcon
                                    sx={{
                                      fontSize: 14,
                                      color: theme.palette.success.main,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    Wait: {patient.waitingMinutes} min
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Divider sx={{ borderStyle: "dashed" }} />

                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    openTriageAssessment(patient.id)
                                  }
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    fontSize: "11px",
                                    borderRadius: 1.5,
                                    py: 0.5,
                                    fontWeight: 700,
                                  }}
                                >
                                  Triage
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={availableBeds.length === 0}
                                  onClick={() => openAssignBedModal(patient.id)}
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    fontSize: "11px",
                                    borderRadius: 1.5,
                                    py: 0.5,
                                    fontWeight: 700,
                                  }}
                                >
                                  Assign
                                </Button>
                                <IconButton
                                  size="small"
                                  title="Open Case Tracking"
                                  onClick={() =>
                                    handleOpenPatientChart(patient.id)
                                  }
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.08,
                                    ),
                                    color: "primary.main",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.15,
                                      ),
                                    },
                                  }}
                                >
                                  <MonitorHeartIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Card>
                        ))
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );

  const renderBedBoard = () => (
    <WorkflowSectionCard
      title="Bed Board"
      subtitle="Grid view of ER beds with status and chart access"
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {(
            [
              "ALL",
              "Free",
              "Occupied",
              "Cleaning",
              "Critical",
            ] as BedBoardFilter[]
          ).map((item) => (
            <Chip
              key={item}
              label={item === "ALL" ? "All Beds" : item}
              clickable
              color={item === "ALL" ? "primary" : BED_STATUS_META[item].color}
              variant={bedFilter === item ? "filled" : "outlined"}
              onClick={() => setBedFilter(item)}
            />
          ))}
        </Stack>

        {filteredBedRows.length === 0 ? (
          <Alert severity="info">No beds match the current filter.</Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              alignItems: "stretch",
              gridAutoRows: "1fr",
            }}
          >
            {filteredBedRows.map((bed) => {
              const patient = bed.patientId
                ? patients.find((entry) => entry.id === bed.patientId)
                : null;
              const statusColor =
                bed.status === "Free"
                  ? theme.palette.success.main
                  : bed.status === "Occupied"
                    ? theme.palette.info.main
                    : bed.status === "Cleaning"
                      ? theme.palette.warning.main
                      : theme.palette.error.main;

              return (
                <Card
                  key={bed.id}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.75,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    height: "100%",
                    minHeight: 190,
                    display: "flex",
                    width: "100%",
                    boxShadow: "none",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                  }}
                >
                  <Stack
                    spacing={0.75}
                    sx={{ width: "100%", minHeight: 0, height: "100%" }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {bed.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={bed.status}
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          color: statusColor,
                          border: "1px solid",
                          borderColor: alpha(statusColor, 0.55),
                          bgcolor: alpha(statusColor, 0.1),
                        }}
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {bed.zone}
                    </Typography>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      {patient ? (
                        <Stack spacing={0.25}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {patient.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {patient.id} · {patient.triageLevel}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No active patient assigned.
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ pt: 0.5, minHeight: 38, mt: "auto" }}>
                      {patient ? (
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleOpenPatientChart(patient.id)}
                        >
                          Open Case Tracking
                        </Button>
                      ) : bed.status === "Cleaning" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleSetBedFree(bed.id)}
                        >
                          Mark Free
                        </Button>
                      ) : bed.status === "Free" ? (
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          disabled={!selectedPatient}
                          onClick={() =>
                            selectedPatient
                              ? openAssignBedModal(selectedPatient.id, bed.id)
                              : notify(
                                  "Select a patient first from queue or chart.",
                                  "info",
                                )
                          }
                        >
                          {selectedPatient
                            ? `Assign ${selectedPatient.id}`
                            : "Select Patient First"}
                        </Button>
                      ) : null}
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Box>
        )}
      </Stack>
    </WorkflowSectionCard>
  );

  const renderCaseTrackingBoard = () => {
    const CASE_TRACKING_PANEL_H = "calc(100vh - 260px)";
    const labOrders = selectedPatientOrders
      .filter((order) => order.type === "Lab Tests")
      .slice()
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
    const radiologyOrders = selectedPatientOrders
      .filter((order) => order.type === "Radiology")
      .slice()
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
    const recentOrders = selectedPatientOrders
      .slice()
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
      .slice(0, 5);
    const latestObservation = selectedPatientObservations[0];
    const firstObservation =
      selectedPatientObservations[selectedPatientObservations.length - 1];

    const createMetricCard = (
      label: string,
      value: string,
      unit: string,
      tone: "success" | "warning" | "error" | "info",
      status: string,
    ) => {
      const paletteMap = {
        success: theme.palette.success,
        warning: theme.palette.warning,
        error: theme.palette.error,
        info: theme.palette.info,
      };
      const palette = paletteMap[tone];
      const iconMap: Record<string, React.ReactNode> = {
        "Blood Pressure": (
          <BloodtypeIcon sx={{ fontSize: 20, color: palette.main }} />
        ),
        "Heart Rate": (
          <FavoriteBorderIcon sx={{ fontSize: 20, color: palette.main }} />
        ),
        SpO2: <AirIcon sx={{ fontSize: 20, color: palette.main }} />,
        "Pain / GCS": (
          <AccessibilityNewIcon sx={{ fontSize: 20, color: palette.main }} />
        ),
      };

      return (
        <StatTile
          label={label}
          value={value}
          subtitle={`${unit} · ${status}`}
          icon={
            iconMap[label] ?? (
              <MonitorHeartIcon sx={{ fontSize: 20, color: palette.main }} />
            )
          }
          sx={{ height: "100%" }}
        />
      );
    };

    const renderQueueRail = () => (
      <Box
        sx={{
          borderBottom: { xs: "1px solid", lg: "none" },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1.25,
              mb: 1.5,
            }}
          >
            {[
              {
                label: "Active",
                value: patients.length,
                color: theme.palette.primary.main,
              },
              {
                label: "Critical",
                value: patients.filter(
                  (patient) => patient.triageLevel === "Critical",
                ).length,
                color: theme.palette.error.main,
              },
              {
                label: "Ready",
                value: patients.filter(
                  (patient) => patient.status === "Ready for Disposition",
                ).length,
                color: theme.palette.success.main,
              },
            ].map((item) => (
              <Card
                key={item.label}
                elevation={0}
                sx={{
                  boxShadow: cardShadow,
                  border: "none",
                  p: 1.25,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: 19,
                    lineHeight: 1.1,
                    color: item.color,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: 10.5,
                  }}
                >
                  {item.label}
                </Typography>
              </Card>
            ))}
          </Box>

          <TextField
            size="small"
            fullWidth
            placeholder="Search patient, MRN, ER no..."
            value={caseTrackingSearch}
            onChange={(event) => setCaseTrackingSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1.25,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
              },
            }}
          />

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {(
              [
                "All",
                "Critical",
                "In Treatment",
                "Ready",
              ] as CaseTrackingSidebarFilter[]
            ).map((filter) => (
              <Chip
                key={filter}
                label={filter}
                size="small"
                onClick={() => setCaseTrackingFilter(filter)}
                variant={caseTrackingFilter === filter ? "filled" : "outlined"}
                color={caseTrackingFilter === filter ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            maxHeight: { xs: 320, lg: "none" },
            "&::-webkit-scrollbar": { width: 5 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 99,
              bgcolor: "divider",
            },
          }}
        >
          {caseTrackingRows.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="info">
                No emergency cases match this search.
              </Alert>
            </Box>
          ) : (
            <Stack spacing={0}>
              {caseTrackingRows.map((patient) => {
                const selected = selectedPatientId === patient.id;
                const highlightColor =
                  patient.triageLevel === "Critical"
                    ? theme.palette.error.main
                    : theme.palette.primary.main;
                const waitProgress = Math.min(
                  100,
                  Math.max(10, Math.round((patient.waitingMinutes / 45) * 100)),
                );

                return (
                  <Box
                    key={patient.id}
                    onClick={() => handleOpenPatientChart(patient.id)}
                    sx={{
                      px: 2,
                      py: 1.75,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      bgcolor: selected
                        ? alpha(theme.palette.primary.main, 0.06)
                        : "background.paper",
                      borderLeft: selected
                        ? `3px solid ${highlightColor}`
                        : "3px solid transparent",
                      "&:hover": {
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, 0.06)
                          : alpha(theme.palette.primary.main, 0.03),
                      },
                      transition: "background 0.15s ease",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: highlightColor,
                          mt: 0.7,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              lineHeight: 1.3,
                              mr: 0.75,
                            }}
                          >
                            {patient.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={patient.triageLevel}
                            sx={{
                              fontWeight: 700,
                              fontSize: 10,
                              ml: 0.5,
                              flexShrink: 0,
                              bgcolor: alpha(highlightColor, 0.12),
                              color:
                                patient.triageLevel === "Critical"
                                  ? "error.main"
                                  : patient.triageLevel === "Emergency" ||
                                      patient.triageLevel === "Urgent"
                                    ? "warning.dark"
                                    : "primary.main",
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "text.secondary",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {patient.id} · {patient.mrn}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.35 }}
                        >
                          {patient.chiefComplaint}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          sx={{ mt: 0.75 }}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            size="small"
                            label={
                              patient.assignedBed
                                ? `Bed ${patient.assignedBed}`
                                : "No bed"
                            }
                            sx={{
                              fontWeight: 600,
                              fontSize: 10,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: "primary.main",
                            }}
                          />
                          <Chip
                            size="small"
                            label={patient.status}
                            sx={{
                              fontWeight: 600,
                              fontSize: 10,
                              bgcolor:
                                patient.status === "Ready for Disposition"
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.info.main, 0.08),
                              color:
                                patient.status === "Ready for Disposition"
                                  ? "success.main"
                                  : "info.main",
                            }}
                          />
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontSize: 10 }}
                            >
                              Wait {patient.waitingMinutes} min
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: 10,
                                color:
                                  patient.waitingMinutes >= 30
                                    ? "warning.main"
                                    : "text.disabled",
                              }}
                            >
                              {patient.arrivalMode}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              mt: 0.5,
                              height: 4,
                              borderRadius: 99,
                              bgcolor: alpha(theme.palette.warning.main, 0.18),
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${waitProgress}%`,
                                height: "100%",
                                bgcolor:
                                  patient.waitingMinutes >= 30
                                    ? "warning.main"
                                    : patient.waitingMinutes >= 15
                                      ? "info.main"
                                      : "success.main",
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              Average Wait
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color:
                  dashboardMetrics.avgWaitMinutes >= 20
                    ? "warning.main"
                    : "success.main",
              }}
            >
              {dashboardMetrics.avgWaitMinutes} min
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 5,
              borderRadius: 99,
              bgcolor: alpha(theme.palette.warning.main, 0.15),
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.min(100, Math.max(12, Math.round((dashboardMetrics.avgWaitMinutes / 30) * 100)))}%`,
                height: "100%",
                bgcolor:
                  dashboardMetrics.avgWaitMinutes >= 20
                    ? "warning.main"
                    : "success.main",
              }}
            />
          </Box>
        </Box>
      </Box>
    );

    if (!selectedPatient) {
      return (
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            height: { xs: "auto", lg: CASE_TRACKING_PANEL_H },
            maxHeight: { xs: "none", lg: CASE_TRACKING_PANEL_H },
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
              height: "100%",
              minHeight: 0,
            }}
          >
            {renderQueueRail()}
            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: { xs: 2, md: 4 },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  color: "common.white",
                  background:
                    "linear-gradient(135deg, #0f2850 0%, #1d4ed8 100%)",
                  boxShadow: `0 18px 40px ${alpha(theme.palette.primary.dark, 0.22)}`,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Case Tracking
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: alpha(theme.palette.common.white, 0.82) }}
                >
                  This screen is only for emergency operations: case monitoring,
                  vitals, safety, timeline, and disposition.
                </Typography>
              </Box>

              <Alert severity="info">
                No case selected. Choose a patient from the left queue, or
                register a new arrival before starting the emergency workflow.
              </Alert>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => setActivePage("triage")}
                >
                  Open Arrivals & Triage
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setRegistrationModalOpen(true)}
                >
                  Register New Arrival
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setActivePage("bed-board")}
                >
                  Open Bed Board
                </Button>
              </Stack>
            </Box>
          </Box>
        </Card>
      );
    }

    const triageShortLabel = `T${TRIAGE_META[selectedPatient.triageLevel].rank}`;
    const systolic = Number(selectedPatient.vitals.bloodPressure.split("/")[0]);
    const diastolic = Number(
      selectedPatient.vitals.bloodPressure.split("/")[1],
    );
    const bpTone =
      Number.isFinite(systolic) &&
      Number.isFinite(diastolic) &&
      (systolic < 90 || diastolic < 60)
        ? "error"
        : systolic >= 140 || diastolic >= 90
          ? "warning"
          : "success";
    const hrTone =
      selectedPatient.vitals.heartRate >= 120
        ? "warning"
        : selectedPatient.vitals.heartRate >= 60 &&
            selectedPatient.vitals.heartRate <= 100
          ? "success"
          : "info";
    const spo2Tone =
      selectedPatient.vitals.spo2 < 90
        ? "error"
        : selectedPatient.vitals.spo2 <= 94
          ? "warning"
          : "success";
    const painTone =
      selectedPatient.vitals.painScore >= 7
        ? "warning"
        : selectedPatient.vitals.painScore >= 4
          ? "info"
          : "success";

    const timelineEntries: Array<{
      id: string;
      title: string;
      actor: string;
      detail: string;
      time: string;
      tone: "critical" | "warning" | "info" | "success";
    }> = [];

    if (clinicalNoteDraft.trim()) {
      timelineEntries.push({
        id: `note-${selectedPatient.id}`,
        title: "ED note updated",
        actor: selectedPatient.assignedDoctor,
        detail: clinicalNoteDraft.trim(),
        time: selectedPatient.updatedAt,
        tone: "info",
      });
    }

    selectedPatientObservations.slice(0, 4).forEach((entry) => {
      timelineEntries.push({
        id: entry.id,
        title: "Vitals recorded",
        actor: "ER nursing team",
        detail: `${entry.bloodPressure} · HR ${entry.heartRate} · SpO2 ${entry.spo2}% · ${entry.note}`,
        time: entry.recordedAt,
        tone: entry.spo2 < 90 || entry.painScore >= 8 ? "warning" : "info",
      });
    });

    recentOrders.slice(0, 4).forEach((order) => {
      timelineEntries.push({
        id: `order-${order.id}`,
        title: `${order.type} order`,
        actor: selectedPatient.assignedDoctor,
        detail: `${order.item} · ${order.priority} · ${order.status}`,
        time: order.orderedAt,
        tone:
          order.status === "Completed"
            ? "success"
            : order.priority === "STAT"
              ? "critical"
              : "warning",
      });
    });

    timelineEntries.push({
      id: `arrival-${selectedPatient.id}`,
      title: `Arrived via ${selectedPatient.arrivalMode}`,
      actor: selectedPatient.broughtBy || "Front desk",
      detail: selectedPatient.chiefComplaint,
      time: firstObservation?.recordedAt ?? selectedPatient.updatedAt,
      tone: selectedPatient.triageLevel === "Critical" ? "critical" : "info",
    });

    const checklistColumns = [
      {
        title: "Airway",
        items: [
          {
            label: "Oxygen and saturation monitoring",
            done:
              selectedPatient.vitals.spo2 <= 94 ||
              selectedPatientObservations.length > 0,
          },
          {
            label: "Respiratory reassessment",
            done: selectedPatient.vitals.respiratoryRate > 0,
          },
          {
            label: "Airway backup ready",
            done: selectedPatient.triageLevel === "Critical",
          },
          {
            label: "Portable chest support ordered",
            done: radiologyOrders.some((order) =>
              order.item.toLowerCase().includes("chest"),
            ),
          },
        ],
      },
      {
        title: "Circulation",
        items: [
          {
            label: "BP and pulse trending",
            done: selectedPatientObservations.length >= 2,
          },
          {
            label: "IV medication / fluid order present",
            done: selectedPatientOrders.some(
              (order) => order.type === "Medication",
            ),
          },
          { label: "Bed assigned", done: Boolean(selectedPatient.assignedBed) },
          {
            label: "Doctor assigned",
            done: Boolean(selectedPatient.assignedDoctor),
          },
        ],
      },
      {
        title: "Investigations",
        items: [
          { label: "Lab order placed", done: labOrders.length > 0 },
          { label: "Imaging order placed", done: radiologyOrders.length > 0 },
          {
            label: "At least one result completed",
            done: selectedPatientOrders.some(
              (order) => order.status === "Completed",
            ),
          },
          {
            label: "Critical flag reviewed",
            done: selectedPatient.safetyFlags.length > 0,
          },
        ],
      },
      {
        title: "Disposition",
        items: [
          { label: "ED note saved", done: clinicalNoteDraft.trim().length > 0 },
          {
            label: "Diagnosis captured",
            done: dischargeForm.diagnosis.trim().length > 0,
          },
          {
            label: "Instructions drafted",
            done: dischargeForm.instructions.trim().length > 0,
          },
          {
            label: "Ready for disposition",
            done: selectedPatient.status === "Ready for Disposition",
          },
        ],
      },
    ];

    return (
      <Card
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          height: { xs: "auto", lg: CASE_TRACKING_PANEL_H },
          maxHeight: { xs: "none", lg: CASE_TRACKING_PANEL_H },
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
            height: "100%",
            minHeight: 0,
          }}
        >
          {renderQueueRail()}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.01),
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                bgcolor: "background.default",
                flexShrink: 0,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.08),
                  bgcolor: "background.paper",
                  backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)} 0%, ${theme.palette.background.paper} 72%)`,
                  overflow: "hidden",
                }}
              >
                <Stack
                  spacing={0.9}
                  sx={{
                    px: { xs: 1.5, md: 1.75 },
                    py: 1.15,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.1}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(theme.palette.primary.main, 0.14),
                        color: "primary.main",
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {getPatientInitials(selectedPatient.name)}
                    </Avatar>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      useFlexGap
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          fontSize: 16,
                          lineHeight: 1.2,
                          mr: 0.25,
                        }}
                      >
                        {selectedPatient.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedPatient.id}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={selectedPatient.mrn}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${selectedPatient.age}y / ${selectedPatient.gender}`}
                        sx={{
                          bgcolor: alpha(theme.palette.text.secondary, 0.08),
                          color: "text.primary",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${triageShortLabel} ${selectedPatient.triageLevel}`}
                        sx={{
                          fontWeight: 800,
                          fontFamily: '"JetBrains Mono", monospace',
                          bgcolor:
                            selectedPatient.triageLevel === "Critical"
                              ? alpha(theme.palette.error.main, 0.12)
                              : selectedPatient.triageLevel === "Emergency"
                                ? alpha(theme.palette.warning.main, 0.16)
                                : alpha(theme.palette.primary.main, 0.12),
                          color:
                            selectedPatient.triageLevel === "Critical"
                              ? "error.main"
                              : selectedPatient.triageLevel === "Emergency"
                                ? "warning.dark"
                                : "primary.main",
                        }}
                      />
                      <Chip
                        size="small"
                        label={selectedPatient.status}
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            selectedPatient.status === "Ready for Disposition"
                              ? alpha(theme.palette.success.main, 0.12)
                              : alpha(theme.palette.info.main, 0.12),
                          color:
                            selectedPatient.status === "Ready for Disposition"
                              ? "success.main"
                              : "info.main",
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={0.75}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.35,
                        fontWeight: 500,
                      }}
                    >
                      {selectedPatient.chiefComplaint}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        letterSpacing: 0.15,
                        display: "flex",
                        gap: 0.75,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Box component="span">
                        Bed {selectedPatient.assignedBed ?? "Not assigned"}
                      </Box>
                      <Box component="span" sx={{ color: "divider" }}>
                        •
                      </Box>
                      <Box component="span">
                        {selectedPatient.assignedDoctor}
                      </Box>
                      <Box component="span" sx={{ color: "divider" }}>
                        •
                      </Box>
                      <Box component="span">{selectedPatient.arrivalMode}</Box>
                    </Typography>
                  </Stack>
                </Stack>

                <Divider
                  sx={{ borderColor: alpha(theme.palette.primary.main, 0.08) }}
                />

                <Box
                  sx={{
                    px: 1,
                    py: 0.45,
                    bgcolor: alpha(theme.palette.primary.main, 0.015),
                  }}
                >
                  <CommonTabs
                    tabs={CASE_TRACKING_TABS.map((tab) => ({
                      id: tab.id,
                      label: tab.label,
                      icon: tab.icon,
                    }))}
                    value={caseTrackingTab}
                    onChange={setCaseTrackingTab}
                    sx={{ minHeight: 0 }}
                    tabSx={{
                      minHeight: 34,
                      px: 1.2,
                      borderRadius: 1.25,
                      fontSize: 12.5,
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>
              </Card>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: { xs: "visible", lg: "auto" },
                p: 2,
              }}
            >
              {caseTrackingTab === "vitals" ? (
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}
                    >
                      Latest Vitals · Captured{" "}
                      {selectedPatient.vitals.capturedAt}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openVitalsDialog(selectedPatient.id)}
                    >
                      Record New
                    </Button>
                  </Stack>

                  <Grid container spacing={1.25}>
                    <Grid xs={12} sm={6} lg={3}>
                      {createMetricCard(
                        "Blood Pressure",
                        selectedPatient.vitals.bloodPressure,
                        "mmHg",
                        bpTone,
                        bpTone === "error"
                          ? "Hypotensive"
                          : bpTone === "warning"
                            ? "Watch"
                            : "Stable",
                      )}
                    </Grid>
                    <Grid xs={12} sm={6} lg={3}>
                      {createMetricCard(
                        "Heart Rate",
                        String(selectedPatient.vitals.heartRate),
                        "bpm",
                        hrTone,
                        hrTone === "warning"
                          ? "Tachycardia"
                          : hrTone === "success"
                            ? "Normal"
                            : "Observe",
                      )}
                    </Grid>
                    <Grid xs={12} sm={6} lg={3}>
                      {createMetricCard(
                        "SpO2",
                        `${selectedPatient.vitals.spo2}%`,
                        "oxygen sat.",
                        spo2Tone,
                        spo2Tone === "error"
                          ? "Critical"
                          : spo2Tone === "warning"
                            ? "Low"
                            : "Adequate",
                      )}
                    </Grid>
                    <Grid xs={12} sm={6} lg={3}>
                      {createMetricCard(
                        "Pain / GCS",
                        `${selectedPatient.vitals.painScore}/10`,
                        `GCS ${selectedPatient.vitals.gcs}`,
                        painTone,
                        painTone === "warning"
                          ? "Severe pain"
                          : painTone === "info"
                            ? "Moderate"
                            : "Controlled",
                      )}
                    </Grid>
                  </Grid>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Observation Log
                      </Typography>
                    </Box>
                    <CommonDataGrid<ObservationEntry>
                      rows={selectedPatientObservations.slice(0, 6)}
                      columns={observationColumns}
                      getRowId={(row) => row.id}
                      emptyTitle="No vitals log available for this case."
                    />
                  </Card>
                </Stack>
              ) : null}

              {caseTrackingTab === "safety" ? (
                <Grid container spacing={1.5}>
                  <Grid xs={12} lg={5}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          Allergies and ED Flags
                        </Typography>
                      </Box>
                      <Stack spacing={1.5} sx={{ p: 1.75 }}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 0.4,
                              textTransform: "uppercase",
                              color: "text.secondary",
                            }}
                          >
                            Allergies
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 0.9 }}
                          >
                            {selectedPatient.allergies.map((allergy) => (
                              <Chip
                                key={allergy}
                                size="small"
                                label={allergy}
                                sx={{
                                  bgcolor:
                                    allergy === "No known allergies"
                                      ? alpha(theme.palette.success.main, 0.1)
                                      : alpha(theme.palette.error.main, 0.1),
                                  color:
                                    allergy === "No known allergies"
                                      ? "success.main"
                                      : "error.main",
                                  fontWeight: 700,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 0.4,
                              textTransform: "uppercase",
                              color: "text.secondary",
                            }}
                          >
                            ED Flags
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 0.9 }}
                          >
                            {selectedPatient.safetyFlags.map((flag) => (
                              <Chip
                                key={flag}
                                size="small"
                                label={flag}
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.warning.main,
                                    0.12,
                                  ),
                                  color: "warning.dark",
                                  fontWeight: 700,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 0.4,
                              textTransform: "uppercase",
                              color: "text.secondary",
                            }}
                          >
                            Patient Notes
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.9,
                              p: 1.25,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {selectedPatient.clinicalNotes ||
                                "No additional ED notes captured."}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid xs={12} lg={7}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          Lab Orders and Results
                        </Typography>
                      </Box>
                      <Stack spacing={1.25} sx={{ p: 1.75 }}>
                        <Grid container spacing={1}>
                          <Grid xs={12} md={3}>
                            <TextField
                              select
                              size="small"
                              label="Type"
                              value={orderForm.type}
                              onChange={(event) =>
                                handleOrderField(
                                  "type",
                                  event.target.value as OrderType,
                                )
                              }
                              fullWidth
                            >
                              {(
                                [
                                  "Lab Tests",
                                  "Radiology",
                                  "Medication",
                                  "Procedures",
                                ] as OrderType[]
                              ).map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid xs={12} md={3}>
                            <TextField
                              select
                              size="small"
                              label="Priority"
                              value={orderForm.priority}
                              onChange={(event) =>
                                handleOrderField(
                                  "priority",
                                  event.target.value as OrderPriority,
                                )
                              }
                              fullWidth
                            >
                              {(
                                ["STAT", "Urgent", "Routine"] as OrderPriority[]
                              ).map((priority) => (
                                <MenuItem key={priority} value={priority}>
                                  {priority}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid xs={12} md={6}>
                            <Stack direction="row" spacing={1}>
                              <TextField
                                size="small"
                                label="Order item"
                                value={orderForm.item}
                                onChange={(event) =>
                                  handleOrderField("item", event.target.value)
                                }
                                fullWidth
                              />
                              <Button
                                variant="contained"
                                onClick={handleAddOrder}
                              >
                                Add
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {ORDER_TEMPLATES[orderForm.type].map((template) => (
                            <Chip
                              key={template}
                              size="small"
                              label={template}
                              color={
                                orderForm.item === template
                                  ? "primary"
                                  : "default"
                              }
                              variant={
                                orderForm.item === template
                                  ? "filled"
                                  : "outlined"
                              }
                              onClick={() => handleApplyOrderTemplate(template)}
                            />
                          ))}
                        </Stack>

                        <Divider />

                        <Stack spacing={1}>
                          {recentOrders.length === 0 ? (
                            <Alert severity="info">
                              No active emergency orders for this case.
                            </Alert>
                          ) : (
                            recentOrders.map((order) => (
                              <Card
                                key={order.id}
                                elevation={0}
                                sx={{
                                  px: 1.25,
                                  py: 1,
                                  borderRadius: 1.5,
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  justifyContent="space-between"
                                  spacing={1}
                                >
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {order.item}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {order.type} · {order.orderedAt} ·{" "}
                                      {order.priority}
                                    </Typography>
                                  </Box>
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <OrderStatusChip status={order.status} />
                                    <TextField
                                      select
                                      size="small"
                                      value={order.status}
                                      onChange={(event) =>
                                        handleOrderStatusChange(
                                          order.id,
                                          event.target.value as OrderStatus,
                                        )
                                      }
                                      sx={{ minWidth: 124 }}
                                    >
                                      {(
                                        [
                                          "Pending",
                                          "In Progress",
                                          "Completed",
                                        ] as OrderStatus[]
                                      ).map((status) => (
                                        <MenuItem key={status} value={status}>
                                          {status}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Stack>
                                </Stack>
                              </Card>
                            ))
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}

              {caseTrackingTab === "timeline" ? (
                <Grid container spacing={1.5}>
                  <Grid xs={12} lg={7}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          Care Timeline
                        </Typography>
                      </Box>
                      <Stack spacing={1.5} sx={{ p: 1.75 }}>
                        {timelineEntries.map((entry, index) => {
                          const toneColor =
                            entry.tone === "critical"
                              ? theme.palette.error.main
                              : entry.tone === "warning"
                                ? theme.palette.warning.main
                                : entry.tone === "success"
                                  ? theme.palette.success.main
                                  : theme.palette.info.main;

                          return (
                            <Stack
                              key={entry.id}
                              direction="row"
                              spacing={1.25}
                            >
                              <Stack
                                alignItems="center"
                                sx={{ width: 28, flexShrink: 0 }}
                              >
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    display: "grid",
                                    placeItems: "center",
                                    border: "1px solid",
                                    borderColor: alpha(toneColor, 0.35),
                                    bgcolor: alpha(toneColor, 0.1),
                                    color: toneColor,
                                    fontWeight: 800,
                                    fontSize: 12,
                                  }}
                                >
                                  {entry.tone === "critical"
                                    ? "!"
                                    : entry.tone === "warning"
                                      ? "•"
                                      : entry.tone === "success"
                                        ? "✓"
                                        : "i"}
                                </Box>
                                {index < timelineEntries.length - 1 ? (
                                  <Box
                                    sx={{
                                      width: 2,
                                      flex: 1,
                                      bgcolor: "divider",
                                      my: 0.5,
                                    }}
                                  />
                                ) : null}
                              </Stack>
                              <Box
                                sx={{
                                  flex: 1,
                                  pb:
                                    index < timelineEntries.length - 1 ? 1 : 0,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  spacing={1}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {entry.title}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      fontFamily: '"JetBrains Mono", monospace',
                                    }}
                                  >
                                    {entry.time}
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    mt: 0.25,
                                    color: "text.secondary",
                                    fontFamily: '"JetBrains Mono", monospace',
                                  }}
                                >
                                  {entry.actor}
                                </Typography>
                                <Box
                                  sx={{
                                    mt: 0.75,
                                    p: 1,
                                    borderRadius: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.02,
                                    ),
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {entry.detail}
                                  </Typography>
                                </Box>
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid xs={12} lg={5}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          ED Note Composer
                        </Typography>
                      </Box>
                      <Stack spacing={1.25} sx={{ p: 1.75 }}>
                        <TextField
                          size="small"
                          value={clinicalNoteDraft}
                          onChange={(event) =>
                            setClinicalNoteDraft(event.target.value)
                          }
                          multiline
                          minRows={10}
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          onClick={handleSaveClinicalNote}
                        >
                          Save ED Note
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}

              {caseTrackingTab === "checklist" ? (
                <Stack spacing={1.5}>
                  <Grid container spacing={0}>
                    {checklistColumns.map((column) => (
                      <Grid xs={12} sm={6} lg={3} key={column.title}>
                        <Card
                          elevation={0}
                          sx={{
                            height: "100%",
                            borderRadius: 0,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRightWidth: { lg: 0 },
                            "&:last-of-type": {
                              borderRightWidth: { lg: 1 },
                            },
                          }}
                        >
                          <Box sx={{ p: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mb: 1,
                                fontWeight: 800,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                color: "text.secondary",
                              }}
                            >
                              {column.title}
                            </Typography>
                            <Stack spacing={0.9}>
                              {column.items.map((item) => (
                                <Stack
                                  key={item.label}
                                  direction="row"
                                  spacing={0.8}
                                  alignItems="flex-start"
                                  sx={{
                                    color: item.done
                                      ? "text.secondary"
                                      : "text.primary",
                                    textDecoration: item.done
                                      ? "line-through"
                                      : "none",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    readOnly
                                  />
                                  <Typography variant="body2">
                                    {item.label}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Disposition and Handover
                      </Typography>
                    </Box>
                    <Stack spacing={1.25} sx={{ p: 1.75 }}>
                      <Grid container spacing={1}>
                        <Grid xs={12} md={6}>
                          <TextField
                            size="small"
                            label="Disposition Diagnosis"
                            value={dischargeForm.diagnosis}
                            onChange={(event) =>
                              handleDischargeField(
                                "diagnosis",
                                event.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid xs={12} md={6}>
                          <TextField
                            size="small"
                            label="Condition on Exit"
                            value={dischargeForm.condition}
                            onChange={(event) =>
                              handleDischargeField(
                                "condition",
                                event.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid xs={12}>
                          <TextField
                            size="small"
                            label="Instructions"
                            value={dischargeForm.instructions}
                            onChange={(event) =>
                              handleDischargeField(
                                "instructions",
                                event.target.value,
                              )
                            }
                            multiline
                            minRows={3}
                            fullWidth
                          />
                        </Grid>
                        <Grid xs={12} md={6}>
                          <TextField
                            size="small"
                            label="Follow-up"
                            value={dischargeForm.followUp}
                            onChange={(event) =>
                              handleDischargeField(
                                "followUp",
                                event.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid xs={12} md={6}>
                          <TextField
                            size="small"
                            label="Destination"
                            value={dischargeForm.destination}
                            onChange={(event) =>
                              handleDischargeField(
                                "destination",
                                event.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => setDischargePreviewOpen(true)}
                        >
                          Preview AVS
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleDisposition("admit")}
                        >
                          Admit to IPD
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => handleDisposition("discharge")}
                        >
                          Discharge
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => handleDisposition("transfer")}
                        >
                          Transfer
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Card>
    );
  };

  const subtitle = selectedPatient
    ? `${selectedPatient.name} · ${selectedPatient.id} · ${selectedPatient.mrn}`
    : "No active emergency patient selected";

  return (
    <PageTemplate
      title="ASAP Emergency"
      subtitle={subtitle}
      currentPageTitle="Emergency"
      fullHeight={activePage === "chart"}
    >
      <Stack
        spacing={1.25}
        sx={
          activePage === "chart"
            ? {
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }
            : undefined
        }
      >
        <ModuleHeaderCard
          title="Emergency "
          description=""
        
          actions={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="contained"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setRegistrationModalOpen(true)}
              >
                New Arrival
              </Button>
            </Stack>
          }
        />

        <CommonTabs
          tabs={EMERGENCY_PAGES.map((page) => ({
            id: page.id,
            label: page.label,
            icon: page.icon,
          }))}
          value={activePage}
          onChange={setActivePage}
        />

        {activePage === "dashboard" ? renderDashboard() : null}
        {activePage === "triage" ? renderQueue() : null}
        {activePage === "bed-board" ? renderBedBoard() : null}
        {activePage === "chart" ? renderCaseTrackingBoard() : null}
      </Stack>

      <Dialog
        open={assignBedModalOpen}
        onClose={() => setAssignBedModalOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <BedIcon color="primary" fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Assign Bed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Arrivals & Triage to bed allocation workflow
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setAssignBedModalOpen(false)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 2.25, py: 1.75 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
              {BED_ASSIGN_FLOW_STEPS.map((step, index) => (
                <Chip
                  key={step}
                  size="small"
                  label={`${index + 1}. ${step}`}
                  color={
                    index < 1 ? "success" : index === 1 ? "primary" : "default"
                  }
                  variant={index <= 1 ? "filled" : "outlined"}
                />
              ))}
            </Stack>
            <Divider />
            {renderAssignBedModalContent()}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <MonitorHeartIcon color="primary" fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Triage Assessment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Capture vitals and assign acuity level
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setTriageModalOpen(false)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 2.25, py: 2 }}>
          {renderTriageModalContent()}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.25,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Button onClick={() => setTriageModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTriage}
            startIcon={<MonitorHeartIcon />}
          >
            Save Triage Assessment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <PersonAddAlt1Icon color="primary" fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Register Emergency Patient
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Walk-in, EMS, or transfer registration
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setRegistrationModalOpen(false)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 2.25, py: 2 }}>
          {renderRegistrationModalContent()}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.25,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Button onClick={() => setRegistrationModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRegisterPatient}
            startIcon={<PersonAddAlt1Icon />}
          >
            Register & Assign MRN
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={vitalsDialogOpen}
        onClose={() => setVitalsDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <MonitorHeartIcon color="primary" fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Record Vitals
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bedside capture for emergency reassessment
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setVitalsDialogOpen(false)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 2.25, py: 2 }}>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              select
              label="Patient"
              value={vitalsForm.patientId}
              onChange={(event) =>
                handleVitalsField("patientId", event.target.value)
              }
              fullWidth
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.id} · {patient.name}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={1}>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Heart Rate"
                  value={vitalsForm.heartRate}
                  onChange={(event) =>
                    handleVitalsField("heartRate", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Blood Pressure"
                  value={vitalsForm.bloodPressure}
                  onChange={(event) =>
                    handleVitalsField("bloodPressure", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Temperature"
                  value={vitalsForm.temperature}
                  onChange={(event) =>
                    handleVitalsField("temperature", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Respiratory Rate"
                  value={vitalsForm.respiratoryRate}
                  onChange={(event) =>
                    handleVitalsField("respiratoryRate", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="SpO2"
                  value={vitalsForm.spo2}
                  onChange={(event) =>
                    handleVitalsField("spo2", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  size="small"
                  label="Pain"
                  value={vitalsForm.painScore}
                  onChange={(event) =>
                    handleVitalsField("painScore", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  size="small"
                  label="GCS"
                  value={vitalsForm.gcs}
                  onChange={(event) =>
                    handleVitalsField("gcs", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              size="small"
              label="Observation Notes"
              value={vitalsForm.notes}
              onChange={(event) =>
                handleVitalsField("notes", event.target.value)
              }
              multiline
              minRows={3}
              placeholder="Example: Pain reduced after analgesic, patient comfortable on oxygen support."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.25,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Button onClick={() => setVitalsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveVitals}>
            Save Vitals
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dischargePreviewOpen}
        onClose={() => setDischargePreviewOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.success.main, 0.05),
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                AVS Preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emergency discharge summary preview for patient handoff
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setDischargePreviewOpen(false)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 2.25, py: 2 }}>
          {!selectedPatient ? (
            <Alert severity="info">No patient selected for AVS preview.</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Card
                elevation={0}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedPatient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.id} · {selectedPatient.mrn} ·{" "}
                    {selectedPatient.age}y / {selectedPatient.gender}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Diagnosis:</strong>{" "}
                    {dischargeForm.diagnosis || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Condition on exit:</strong>{" "}
                    {dischargeForm.condition || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instructions:</strong>{" "}
                    {dischargeForm.instructions || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Follow-up:</strong> {dischargeForm.followUp || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Medication advice:</strong>{" "}
                    {dischargeForm.medications || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Destination:</strong>{" "}
                    {dischargeForm.destination || "--"}
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.25,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.success.main, 0.05),
          }}
        >
          <Button onClick={() => setDischargePreviewOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() =>
              selectedPatient
                ? openRoute("/ipd/discharge", {
                    tab: "avs",
                    mrn: selectedPatient.mrn,
                  })
                : undefined
            }
            disabled={!selectedPatient || !canNavigate("/ipd/discharge")}
          >
            Open Full AVS Workspace
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
