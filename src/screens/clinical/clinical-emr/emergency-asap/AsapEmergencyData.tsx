import * as React from "react";
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
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import type {
  BedAssignForm,
  BedBoardFilter,
  BedStatus,
  ChipColor,
  DischargeForm,
  EmergencyBed,
  EmergencyOrder,
  EmergencyPageId,
  EmergencyPatient,
  ObservationEntry,
  OrderForm,
  OrderType,
  RegistrationForm,
  TriageForm,
  TriageLevel,
  VitalsForm,
  CaseTrackingTabId,
} from "./components";

export const TRIAGE_META: Record<
  TriageLevel,
  { color: ChipColor; accent: string; rank: number }
> = {
  Critical: { color: "error", accent: "#d32f2f", rank: 1 },
  Emergency: { color: "warning", accent: "#ef6c00", rank: 2 },
  Urgent: { color: "warning", accent: "#f9a825", rank: 3 },
  "Semi-Urgent": { color: "success", accent: "#2e7d32", rank: 4 },
  "Non-Urgent": { color: "info", accent: "#1565c0", rank: 5 },
};

export const TRIAGE_LEVEL_LABELS: Record<
  TriageLevel,
  { level: string; note: string }
> = {
  Critical: { level: "I", note: "Immediate" },
  Emergency: { level: "II", note: "Emergency" },
  Urgent: { level: "III", note: "Urgent" },
  "Semi-Urgent": { level: "IV", note: "Semi-Urgent" },
  "Non-Urgent": { level: "V", note: "Non-Urgent" },
};

export const TRIAGE_LEVEL_ORDER: TriageLevel[] = [
  "Critical",
  "Emergency",
  "Urgent",
  "Semi-Urgent",
  "Non-Urgent",
];

export const TRIAGE_BUTTON_COLOR: Record<
  TriageLevel,
  "error" | "warning" | "success" | "info"
> = {
  Critical: "error",
  Emergency: "warning",
  Urgent: "warning",
  "Semi-Urgent": "success",
  "Non-Urgent": "info",
};

export const BED_STATUS_META: Record<BedStatus, { color: ChipColor }> = {
  Free: { color: "success" },
  Occupied: { color: "info" },
  Cleaning: { color: "warning" },
  Critical: { color: "error" },
};

export const EMERGENCY_PAGES: Array<{
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

export const CASE_TRACKING_TABS: Array<{
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

export const OPERATIONS_SNAPSHOT = {
  dischargedToday: 31,
  staffOnDuty: 14,
  physiciansOnDuty: 6,
  nursesOnDuty: 8,
};

export const INITIAL_PATIENTS: EmergencyPatient[] = [
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

export const INITIAL_BEDS: EmergencyBed[] = [
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

export const INITIAL_ORDERS: EmergencyOrder[] = [
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

export const INITIAL_OBSERVATION_LOG: ObservationEntry[] = [
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

export const DEFAULT_REGISTRATION: RegistrationForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  arrivalMode: "Walk-in",
  broughtBy: "",
  chiefComplaint: "",
  triageLevel: "Urgent",
};

export const DEFAULT_TRIAGE: TriageForm = {
  patientId: "",
  heartRate: "",
  bloodPressure: "",
  temperature: "",
  respiratoryRate: "",
  spo2: "",
  triageLevel: "Urgent",
};

export const BED_ASSIGN_FLOW_STEPS = [
  "Tracking Board",
  "Assign Bed",
  "Case Tracking",
  "Orders",
  "Discharge / Transfer",
] as const;

export const BED_ASSIGN_PHYSICIANS = [
  "Dr. Neha Bhat",
  "Dr. R. Kiran",
  "Dr. P. Menon",
  "Dr. S. Rao",
  "Dr. A. George",
] as const;

export const BED_ASSIGN_NURSES = [
  "RN Kavitha",
  "RN Meera",
  "RN Ramesh",
  "RN Latha",
] as const;

export const DEFAULT_ORDER_FORM: OrderForm = {
  type: "Lab Tests",
  item: "",
  priority: "Routine",
};

export const DEFAULT_VITALS_FORM: VitalsForm = {
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

export const DEFAULT_DISCHARGE_FORM: DischargeForm = {
  diagnosis: "",
  condition: "Stable for discharge",
  instructions: "",
  followUp: "",
  medications: "",
  destination: "Home",
};

export const ORDER_TEMPLATES: Record<OrderType, string[]> = {
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
