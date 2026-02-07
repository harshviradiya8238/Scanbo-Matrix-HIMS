export type AdmissionPriority = 'Routine' | 'Urgent' | 'Emergency';

export interface AdmissionLead {
  id: string;
  mrn: string;
  patientType: 'General' | 'Insurance' | 'Corporate' | 'Staff';
  aadhaarId: string;
  language: string;
  patientName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  kinName: string;
  kinPhone: string;
  nationality: string;
  source: 'OPD' | 'ER' | 'Transfer';
  priority: AdmissionPriority;
  admissionReason: string;
  provisionalDiagnosis: string;
  preferredWard: string;
  consultant: string;
  knownAllergies: string;
}

export interface InpatientStay {
  id: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  consultant: string;
  diagnosis: string;
  ward: string;
  bed: string;
}

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Blocked';

export interface WardBed {
  id: string;
  ward: string;
  room: string;
  bedNumber: string;
  bedType: 'General' | 'Semi-Private' | 'Private' | 'ICU';
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  mrn?: string;
  diagnosis?: string;
  isolation?: boolean;
}

export interface DischargeCandidate {
  patientId: string;
  estimatedDischargeDate: string;
  billingStatus: 'Cleared' | 'Pending';
  pharmacyStatus: 'Ready' | 'Pending';
  transportStatus: 'Arranged' | 'Pending';
  losDays: number;
}

export interface DischargeChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export const ADMISSION_LEADS: AdmissionLead[] = [
  {
    id: 'lead-1',
    mrn: 'MRN-245990',
    patientType: 'Insurance',
    aadhaarId: '5421 8913 4432',
    language: 'English',
    patientName: 'Rahul Menon',
    gender: 'Male',
    age: 58,
    mobile: '+91 98765 44211',
    kinName: 'Anita Menon',
    kinPhone: '+91 98765 44212',
    nationality: 'Indian',
    source: 'ER',
    priority: 'Urgent',
    admissionReason: 'Fever with breathlessness and persistent productive cough.',
    provisionalDiagnosis: 'Community acquired pneumonia',
    preferredWard: 'Medical Ward - 2',
    consultant: 'Dr. Nisha Rao',
    knownAllergies: 'Penicillin',
  },
  {
    id: 'lead-2',
    mrn: 'MRN-245991',
    patientType: 'Corporate',
    aadhaarId: '7718 5519 2008',
    language: 'English',
    patientName: 'Sneha Patil',
    gender: 'Female',
    age: 42,
    mobile: '+91 98761 22341',
    kinName: 'Rohit Patil',
    kinPhone: '+91 98761 22342',
    nationality: 'Indian',
    source: 'OPD',
    priority: 'Routine',
    admissionReason: 'Planned post-operative observation admission.',
    provisionalDiagnosis: 'Post-op cholecystectomy day 1',
    preferredWard: 'Surgical Ward - 1',
    consultant: 'Dr. Sameer Kulkarni',
    knownAllergies: 'No known allergies',
  },
  {
    id: 'lead-3',
    mrn: 'MRN-245994',
    patientType: 'General',
    aadhaarId: '1192 6640 7831',
    language: 'Hindi',
    patientName: 'Arvind Sharma',
    gender: 'Male',
    age: 64,
    mobile: '+91 99882 15509',
    kinName: 'Vikas Sharma',
    kinPhone: '+91 99882 15510',
    nationality: 'Indian',
    source: 'ER',
    priority: 'Emergency',
    admissionReason: 'Acute chest pain and ECG changes requiring monitoring.',
    provisionalDiagnosis: 'Acute coronary syndrome',
    preferredWard: 'ICU',
    consultant: 'Dr. K. Anand',
    knownAllergies: 'No known allergies',
  },
  {
    id: 'lead-4',
    mrn: 'MRN-245998',
    patientType: 'Staff',
    aadhaarId: '3360 2229 1190',
    language: 'English',
    patientName: 'Neha Sinha',
    gender: 'Female',
    age: 35,
    mobile: '+91 99670 31542',
    kinName: 'Aman Sinha',
    kinPhone: '+91 99670 31543',
    nationality: 'Indian',
    source: 'Transfer',
    priority: 'Urgent',
    admissionReason: 'Transferred for inpatient diabetes stabilization.',
    provisionalDiagnosis: 'Uncontrolled diabetes with ketosis',
    preferredWard: 'Medical Ward - 1',
    consultant: 'Dr. Vidya Iyer',
    knownAllergies: 'Sulfa drugs',
  },
];

export const INPATIENT_STAYS: InpatientStay[] = [
  {
    id: 'ipd-1',
    mrn: 'MRN-245990',
    patientName: 'Rahul Menon',
    ageGender: '58 / Male',
    admissionDate: '2026-02-01',
    consultant: 'Dr. Nisha Rao',
    diagnosis: 'Community acquired pneumonia',
    ward: 'Medical Ward - 2',
    bed: 'B-12',
  },
  {
    id: 'ipd-2',
    mrn: 'MRN-245991',
    patientName: 'Sneha Patil',
    ageGender: '42 / Female',
    admissionDate: '2026-02-03',
    consultant: 'Dr. Sameer Kulkarni',
    diagnosis: 'Post-op cholecystectomy day 1',
    ward: 'Surgical Ward - 1',
    bed: 'A-04',
  },
  {
    id: 'ipd-3',
    mrn: 'MRN-245994',
    patientName: 'Arvind Sharma',
    ageGender: '64 / Male',
    admissionDate: '2026-02-02',
    consultant: 'Dr. K. Anand',
    diagnosis: 'Acute coronary syndrome',
    ward: 'ICU',
    bed: 'ICU-03',
  },
  {
    id: 'ipd-4',
    mrn: 'MRN-245998',
    patientName: 'Neha Sinha',
    ageGender: '35 / Female',
    admissionDate: '2026-02-04',
    consultant: 'Dr. Vidya Iyer',
    diagnosis: 'Uncontrolled diabetes with ketosis',
    ward: 'Medical Ward - 1',
    bed: 'M1-07',
  },
];

export const INITIAL_BED_BOARD: WardBed[] = [
  {
    id: 'bed-1',
    ward: 'Medical Ward - 1',
    room: 'M1-R1',
    bedNumber: 'M1-07',
    bedType: 'General',
    status: 'Occupied',
    patientId: 'ipd-4',
    patientName: 'Neha Sinha',
    mrn: 'MRN-245998',
    diagnosis: 'Uncontrolled diabetes with ketosis',
  },
  {
    id: 'bed-2',
    ward: 'Medical Ward - 1',
    room: 'M1-R1',
    bedNumber: 'M1-08',
    bedType: 'General',
    status: 'Available',
  },
  {
    id: 'bed-3',
    ward: 'Medical Ward - 2',
    room: 'M2-R2',
    bedNumber: 'B-12',
    bedType: 'Semi-Private',
    status: 'Occupied',
    patientId: 'ipd-1',
    patientName: 'Rahul Menon',
    mrn: 'MRN-245990',
    diagnosis: 'Community acquired pneumonia',
  },
  {
    id: 'bed-4',
    ward: 'Medical Ward - 2',
    room: 'M2-R2',
    bedNumber: 'B-13',
    bedType: 'Semi-Private',
    status: 'Cleaning',
  },
  {
    id: 'bed-5',
    ward: 'Surgical Ward - 1',
    room: 'S1-R1',
    bedNumber: 'A-04',
    bedType: 'Private',
    status: 'Occupied',
    patientId: 'ipd-2',
    patientName: 'Sneha Patil',
    mrn: 'MRN-245991',
    diagnosis: 'Post-op cholecystectomy day 1',
  },
  {
    id: 'bed-6',
    ward: 'Surgical Ward - 1',
    room: 'S1-R1',
    bedNumber: 'A-05',
    bedType: 'Private',
    status: 'Reserved',
  },
  {
    id: 'bed-7',
    ward: 'ICU',
    room: 'ICU-Block',
    bedNumber: 'ICU-03',
    bedType: 'ICU',
    status: 'Occupied',
    patientId: 'ipd-3',
    patientName: 'Arvind Sharma',
    mrn: 'MRN-245994',
    diagnosis: 'Acute coronary syndrome',
    isolation: false,
  },
  {
    id: 'bed-8',
    ward: 'ICU',
    room: 'ICU-Block',
    bedNumber: 'ICU-04',
    bedType: 'ICU',
    status: 'Blocked',
  },
  {
    id: 'bed-9',
    ward: 'HDU',
    room: 'HDU-1',
    bedNumber: 'HDU-01',
    bedType: 'Semi-Private',
    status: 'Available',
  },
  {
    id: 'bed-10',
    ward: 'HDU',
    room: 'HDU-1',
    bedNumber: 'HDU-02',
    bedType: 'Semi-Private',
    status: 'Available',
  },
];

export const DISCHARGE_CANDIDATES: DischargeCandidate[] = [
  {
    patientId: 'ipd-1',
    estimatedDischargeDate: '2026-02-05',
    billingStatus: 'Pending',
    pharmacyStatus: 'Pending',
    transportStatus: 'Pending',
    losDays: 4,
  },
  {
    patientId: 'ipd-2',
    estimatedDischargeDate: '2026-02-04',
    billingStatus: 'Cleared',
    pharmacyStatus: 'Ready',
    transportStatus: 'Arranged',
    losDays: 2,
  },
  {
    patientId: 'ipd-4',
    estimatedDischargeDate: '2026-02-06',
    billingStatus: 'Pending',
    pharmacyStatus: 'Pending',
    transportStatus: 'Pending',
    losDays: 1,
  },
];

export const DISCHARGE_CHECKLIST: DischargeChecklistItem[] = [
  { id: 'clinical-note', label: 'Final consultant note completed', required: true },
  { id: 'nursing-clearance', label: 'Nursing discharge checklist completed', required: true },
  { id: 'medication-recon', label: 'Medication reconciliation reviewed with patient', required: true },
  { id: 'bill-clearance', label: 'Billing clearance and approvals completed', required: true },
  { id: 'pharmacy', label: 'Take-home medication pack ready', required: true },
  { id: 'follow-up', label: 'Follow-up appointment booked', required: true },
  { id: 'education', label: 'Warning signs and home-care education provided', required: false },
  { id: 'transport', label: 'Transport / attendant handover arranged', required: false },
];
