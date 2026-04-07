export type EmergencyPageId = "dashboard" | "triage" | "bed-board" | "chart";

export type CaseTrackingTabId = "vitals" | "safety" | "timeline" | "checklist";

export type CaseTrackingSidebarFilter = "All" | "Critical" | "In Treatment" | "Ready";

export type TriageLevel =
  | "Critical"
  | "Emergency"
  | "Urgent"
  | "Semi-Urgent"
  | "Non-Urgent";

export type Gender = "Male" | "Female" | "Other";
export type ArrivalMode = "Ambulance" | "Walk-in" | "Referral" | "Police";
export type PatientStatus =
  | "Waiting"
  | "In Treatment"
  | "Observation"
  | "Ready for Disposition";
export type BedStatus = "Free" | "Occupied" | "Cleaning" | "Critical";
export type OrderType = "Lab Tests" | "Radiology" | "Medication" | "Procedures";
export type OrderPriority = "STAT" | "Urgent" | "Routine";
export type OrderStatus = "Pending" | "In Progress" | "Completed";
export type QueueViewMode = "table" | "kanban";
export type BedBoardFilter = "ALL" | BedStatus;
export type ToastSeverity = "success" | "info" | "warning" | "error";
export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error";

export interface PatientVitals {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  respiratoryRate: number;
  spo2: number;
  painScore: number;
  gcs: number;
  capturedAt: string;
}

export interface EmergencyPatient {
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

export interface EmergencyBed {
  id: string;
  zone: "Resus" | "ER Bay" | "Observation";
  status: BedStatus;
  patientId: string | null;
}

export interface EmergencyOrder {
  id: string;
  patientId: string;
  type: OrderType;
  item: string;
  priority: OrderPriority;
  status: OrderStatus;
  orderedAt: string;
}

export interface ObservationEntry {
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

export interface RegistrationForm {
  name: string;
  age: string;
  gender: Gender;
  phone: string;
  arrivalMode: ArrivalMode;
  broughtBy: string;
  chiefComplaint: string;
  triageLevel: TriageLevel;
}

export interface TriageForm {
  patientId: string;
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
  triageLevel: TriageLevel;
}

export type BedAssignPriority = "Immediate" | "High" | "Medium" | "Standard";

export interface BedAssignForm {
  patientId: string;
  bedId: string;
  physician: string;
  nurse: string;
  priority: BedAssignPriority;
  notes: string;
}

export interface OrderForm {
  type: OrderType;
  item: string;
  priority: OrderPriority;
}

export interface VitalsForm {
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

export interface DischargeForm {
  diagnosis: string;
  condition: string;
  instructions: string;
  followUp: string;
  medications: string;
  destination: string;
}

export interface EmergencyAlertItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "critical" | "warning" | "info" | "success";
}