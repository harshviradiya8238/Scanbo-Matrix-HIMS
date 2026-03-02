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

export type PatientPortalTabId =
  | 'home'
  | 'profile'
  | 'appointments'
  | 'my-appointments'
  | 'medications'
  | 'lab-reports'
  | 'prescriptions'
  | 'medical-records'
  | 'bills'
  | 'chat'
  | 'settings';
