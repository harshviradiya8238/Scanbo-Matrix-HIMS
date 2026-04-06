import { EmergencyPatient, EmergencyBed, EmergencyOrder, ObservationEntry, RegistrationForm, TriageForm, OrderForm, VitalsForm, DischargeForm, TriageLevel, OrderType, EmergencyPageId, CaseTrackingTabId } from '../types';

export const TRIAGE_META = {
  Critical: { rank: 1, color: "error" as const, label: "Critical" },
  Emergency: { rank: 2, color: "error" as const, label: "Emergency" },
  Urgent: { rank: 3, color: "warning" as const, label: "Urgent" },
  "Semi-Urgent": { rank: 4, color: "success" as const, label: "Semi-Urgent" },
  "Non-Urgent": { rank: 5, color: "info" as const, label: "Non-Urgent" },
} as const;

export const TRIAGE_LEVEL_LABELS: Record<TriageLevel, string> = {
  Critical: "Critical",
  Emergency: "Emergency",
  Urgent: "Urgent",
  "Semi-Urgent": "Semi-Urgent",
  "Non-Urgent": "Non-Urgent",
};

export const EMERGENCY_PAGES: Record<EmergencyPageId, { label: string; icon: string }> = {
  dashboard: { label: "Dashboard", icon: "dashboard" },
  triage: { label: "Triage", icon: "local_hospital" },
  "bed-board": { label: "Bed Board", icon: "bed" },
  chart: { label: "Chart", icon: "assignment" },
};

export const CASE_TRACKING_TABS: Record<CaseTrackingTabId, { label: string; icon: string }> = {
  vitals: { label: "Vitals", icon: "monitor_heart" },
  safety: { label: "Safety & Labs", icon: "science" },
  timeline: { label: "Timeline", icon: "timeline" },
  checklist: { label: "Checklist", icon: "checklist" },
};

export const INITIAL_PATIENTS: EmergencyPatient[] = [
  {
    id: "ER-5101",
    mrn: "MRN-248219",
    name: "Ravi Kumar",
    age: 45,
    gender: "Male",
    phone: "9876543210",
    arrivalMode: "Ambulance",
    broughtBy: "EMS",
    chiefComplaint: "Chest pain and shortness of breath",
    triageLevel: "Critical",
    waitingMinutes: 5,
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
    allergies: ["Penicillin"],
    safetyFlags: ["High risk for cardiac arrest"],
    clinicalNotes: "STEMI suspected. ECG ordered. Oxygen started.",
    updatedAt: "08:52",
  },
  {
    id: "ER-5102",
    mrn: "MRN-248220",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    phone: "9876543211",
    arrivalMode: "Walk-in",
    broughtBy: "Self",
    chiefComplaint: "Road traffic accident - head injury",
    triageLevel: "Emergency",
    waitingMinutes: 12,
    assignedBed: "Bay-4",
    assignedDoctor: "Dr. R. Kiran",
    status: "In Treatment",
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
    id: "ER-5103",
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