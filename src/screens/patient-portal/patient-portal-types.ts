export interface PatientProfile {
  id: string;
  name: string;
  initials: string;
  pid: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  avatarColor: string;
  conditions: string[];
  allergies: string;
  pastSurgeries: string;
  currentMedications: string;
  familyHistory: string;
  smokingAlcohol: string;
  lastCheckup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface HealthStat {
  id: string;
  label: string;
  value: string;
  badge: string;
  badgeType: 'good' | 'warn';
  iconBg: string;
  emoji: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  timing: string;
  iconBg: string;
  emoji: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  refRange: string;
  status: 'Normal' | 'High' | 'Low';
  recordedAt?: string;
}

export interface LabRequisition {
  id: string;
  requisitionNo: string;
  date: string;
  time: string;
  orderedBy: string;
  lab?: string;
  tests: string[];
  status: 'Pending' | 'Sent to Lab' | 'Collected' | 'Completed';
  shareMethod?: 'digital' | 'physical';
  uploadedFile?: string;
  ocrExtracted?: boolean;
  notes?: string;
}

export interface LabReport {
  id: string;
  reportNo: string;
  date: string;
  time: string;
  lab: string;
  orderedBy: string;
  category: string;
  tests: string[];
  status: 'Normal' | 'Needs Review' | 'Critical';
  uploadType: 'digital' | 'scan' | 'manual';
  uploadedFile?: string;
  ocrExtracted?: boolean;
  sharedWith?: string[];
}

export interface Appointment {
  id: string;
  doctorName: string;
  department: string;
  location: string;
  date: string;
  day: string;
  month: string;
  time: string;
  token: string;
  type: 'in-person' | 'video' | 'home-visit';
  patient: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Prescription {
  id: string;
  date: string;
  doctor: string;
  department: string;
  diagnosis: string;
  medications: string[];
  status: 'Active' | 'Completed' | 'Expired';
}

export interface BillRecord {
  id: string;
  invoiceNo: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface MedicalRecord {
  id: string;
  date: string;
  time: string;
  type: 'Visit' | 'Lab' | 'Imaging' | 'Procedure' | 'Prescription';
  title: string;
  doctor: string;
  summary: string;
}

export interface ChatContact {
  id: string;
  name: string;
  department: string;
  initials: string;
  color: string;
  lastMessage: string;
  unreadCount: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  text: string;
  time: string;
  direction: 'in' | 'out';
}

export interface Vital {
  id: string;
  label: string;
  value: string;
  unit: string;
  fillPercent: number;
  color: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dob: string;
  age?: number;
  gender?: string;
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  patientId?: string;
  conditions?: string[];
  allergies?: string;
  avatarColor?: string;
  status?: 'Active' | 'Pending';
  /* extended fields matching patient registration */
  maritalStatus?: string;
  occupation?: string;
  religion?: string;
  drugAllergies?: string;
  foodAllergies?: string;
  emergencyContact?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  aadhaarNumber?: string;
  abhaNumber?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  pastHistory?: string;
  consentVerbal?: boolean;
  consentShare?: boolean;
  consentAbha?: boolean;
}

export interface InsuranceDetail {
  id: string;
  provider: string;
  policyNo: string;
  validTill: string;
  coverage: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export type PatientPortalTabId =
  | 'home'
  | 'profile'
  | 'appointments'
  | 'my-appointments'
  | 'medications'
  | 'lab-reports'
  | 'lab-requisitions'
  | 'prescriptions'
  | 'medical-records'
  | 'bills'
  | 'chat'
  | 'settings'
  | 'family'
  | 'financial-assistance'
  | 'share';
