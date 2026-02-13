export type AppointmentStatus =
  | 'Scheduled'
  | 'Checked-In'
  | 'In Triage'
  | 'In Consultation'
  | 'Completed'
  | 'No Show'
  | 'Cancelled';

export type EncounterStatus =
  | 'BOOKED'
  | 'ARRIVED'
  | 'IN_QUEUE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type VisitType = 'New' | 'Follow-up' | 'Review';
export type QueuePriority = 'Routine' | 'Urgent';
export type SlotStatus = 'Available' | 'Booked' | 'Break' | 'Blocked';

export interface OpdAppointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  department: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  visitType: VisitType;
  status: AppointmentStatus;
  chiefComplaint: string;
  payerType: 'General' | 'Insurance' | 'Corporate';
  phone: string;
}

export interface ProviderSlot {
  time: string;
  status: SlotStatus;
  label?: string;
}

export interface ProviderAvailability {
  provider: string;
  date: string;
  location: string;
  slots: ProviderSlot[];
}

export interface OpdEncounterCase {
  id: string;
  patientId: string;
  appointmentId: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  doctor: string;
  department: string;
  status: EncounterStatus;
  queuePriority: QueuePriority;
  appointmentTime: string;
  chiefComplaint: string;
  triageNote: string;
  allergies: string[];
  problems: string[];
  notes: string[];
  orders: string[];
  prescriptions: string[];
  vitals: {
    bp: string;
    hr: string;
    rr: string;
    temp: string;
    spo2: string;
    weightKg: string;
    bmi: string;
  };
}

export interface OpdEncounterOrder {
  id: string;
  encounterId: string;
  patientId: string;
  orderName: string;
  category: OrderCatalogItem['category'];
  priority: 'Routine' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  instructions: string;
  orderedAt: string;
}

export interface OpdEncounterPrescription {
  id: string;
  encounterId: string;
  patientId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: 'Oral' | 'IV' | 'IM' | 'Topical';
  instructions: string;
  issuedAt: string;
}

export interface VitalTrendRecord {
  id: string;
  patientId: string;
  recordedAt: string;
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  painScore: number;
  nurse: string;
}

export interface OrderCatalogItem {
  id: string;
  name: string;
  category: 'Lab' | 'Radiology' | 'Procedure';
  defaultPriority: 'Routine' | 'Urgent';
}

export interface MedicationCatalogItem {
  id: string;
  genericName: string;
  strength: string;
  form: string;
  commonFrequency: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
}

export const OPD_PROVIDERS = [
  'Dr. Nisha Rao',
  'Dr. Sameer Kulkarni',
  'Dr. Vidya Iyer',
  'Dr. Rohan Mehta',
  'Dr. Sana Khan',
];

export const OPD_APPOINTMENTS: OpdAppointment[] = [
  {
    id: 'appt-1',
    date: '2026-02-04',
    time: '09:00',
    provider: 'Dr. Nisha Rao',
    department: 'General Medicine',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    ageGender: '34 / Male',
    visitType: 'Follow-up',
    status: 'In Consultation',
    chiefComplaint: 'High blood sugar and fatigue',
    payerType: 'Insurance',
    phone: '+91 98100 44110',
  },
  {
    id: 'appt-2',
    date: '2026-02-04',
    time: '09:20',
    provider: 'Dr. Nisha Rao',
    department: 'General Medicine',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    ageGender: '28 / Female',
    visitType: 'New',
    status: 'Checked-In',
    chiefComplaint: 'Headache and dizziness',
    payerType: 'General',
    phone: '+91 98100 44111',
  },
  {
    id: 'appt-3',
    date: '2026-02-04',
    time: '09:40',
    provider: 'Dr. Rohan Mehta',
    department: 'Cardiology',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    ageGender: '52 / Male',
    visitType: 'Follow-up',
    status: 'In Triage',
    chiefComplaint: 'Dyspnea on exertion',
    payerType: 'Corporate',
    phone: '+91 98100 44112',
  },
  {
    id: 'appt-4',
    date: '2026-02-04',
    time: '10:00',
    provider: 'Dr. Sana Khan',
    department: 'ENT',
    patientName: 'Fatima Khan',
    mrn: 'MRN-245811',
    ageGender: '41 / Female',
    visitType: 'Review',
    status: 'Scheduled',
    chiefComplaint: 'Sore throat follow-up',
    payerType: 'Insurance',
    phone: '+91 98100 44113',
  },
  {
    id: 'appt-5',
    date: '2026-02-04',
    time: '10:20',
    provider: 'Dr. Sameer Kulkarni',
    department: 'Surgery',
    patientName: 'Sneha Patil',
    mrn: 'MRN-245991',
    ageGender: '42 / Female',
    visitType: 'Review',
    status: 'Completed',
    chiefComplaint: 'Post-op wound review',
    payerType: 'Corporate',
    phone: '+91 98100 44114',
  },
  {
    id: 'appt-6',
    date: '2026-02-04',
    time: '10:40',
    provider: 'Dr. Vidya Iyer',
    department: 'Endocrinology',
    patientName: 'Neha Sinha',
    mrn: 'MRN-245998',
    ageGender: '35 / Female',
    visitType: 'Follow-up',
    status: 'Scheduled',
    chiefComplaint: 'Diabetes medication adjustment',
    payerType: 'Insurance',
    phone: '+91 98100 44115',
  },
  {
    id: 'appt-7',
    date: '2026-02-04',
    time: '11:00',
    provider: 'Dr. Rohan Mehta',
    department: 'Cardiology',
    patientName: 'Arvind Sharma',
    mrn: 'MRN-245994',
    ageGender: '64 / Male',
    visitType: 'Review',
    status: 'No Show',
    chiefComplaint: 'Post-discharge heart review',
    payerType: 'Insurance',
    phone: '+91 98100 44116',
  },
  {
    id: 'appt-8',
    date: '2026-02-05',
    time: '09:10',
    provider: 'Dr. Nisha Rao',
    department: 'General Medicine',
    patientName: 'Pooja Menon',
    mrn: 'MRN-246002',
    ageGender: '30 / Female',
    visitType: 'New',
    status: 'Scheduled',
    chiefComplaint: 'Fever and body ache',
    payerType: 'General',
    phone: '+91 98100 44117',
  },
  {
    id: 'appt-9',
    date: '2026-02-05',
    time: '09:30',
    provider: 'Dr. Sana Khan',
    department: 'ENT',
    patientName: 'Vikram Bedi',
    mrn: 'MRN-246003',
    ageGender: '47 / Male',
    visitType: 'Follow-up',
    status: 'Scheduled',
    chiefComplaint: 'Sinusitis reassessment',
    payerType: 'Corporate',
    phone: '+91 98100 44118',
  },
];

export const OPD_SLOT_TIMES = ['09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20'];

const buildProviderSlots = (
  provider: string,
  date: string,
  breakTimes: string[] = []
): ProviderSlot[] => {
  const bookedTimes = OPD_APPOINTMENTS.filter(
    (appointment) => appointment.provider === provider && appointment.date === date
  ).map((appointment) => appointment.time);

  return OPD_SLOT_TIMES.map((time) => {
    if (breakTimes.includes(time)) {
      return { time, status: 'Break', label: 'Break' };
    }
    if (bookedTimes.includes(time)) {
      return { time, status: 'Booked' };
    }
    return { time, status: 'Available' };
  });
};

export const OPD_PROVIDER_AVAILABILITY: ProviderAvailability[] = [
  ...OPD_PROVIDERS.flatMap((provider, index) => [
    {
      provider,
      date: '2026-02-04',
      location: index % 2 === 0 ? 'OPD Wing A' : 'OPD Wing B',
      slots: buildProviderSlots(provider, '2026-02-04', index % 2 === 0 ? ['10:20'] : ['10:00']),
    },
    {
      provider,
      date: '2026-02-05',
      location: index % 2 === 0 ? 'OPD Wing A' : 'OPD Wing B',
      slots: buildProviderSlots(provider, '2026-02-05', index % 2 === 0 ? ['10:20'] : ['10:00']),
    },
  ]),
];

export const OPD_ENCOUNTERS: OpdEncounterCase[] = [
  {
    id: 'enc-1',
    patientId: 'MRN-245781',
    appointmentId: 'appt-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    ageGender: '34 / Male',
    doctor: 'Dr. Nisha Rao',
    department: 'General Medicine',
    status: 'IN_PROGRESS',
    queuePriority: 'Urgent',
    appointmentTime: '09:00',
    chiefComplaint: 'High blood sugar and fatigue',
    triageNote: 'Fasting sugar elevated, patient reports poor sleep and diet adherence.',
    allergies: ['Penicillin'],
    problems: ['Type 2 Diabetes Mellitus', 'Obesity'],
    notes: [],
    orders: [],
    prescriptions: [],
    vitals: {
      bp: '142/92',
      hr: '96 bpm',
      rr: '18/min',
      temp: '98.6 F',
      spo2: '98%',
      weightKg: '88',
      bmi: '29.7',
    },
  },
  {
    id: 'enc-2',
    patientId: 'MRN-245799',
    appointmentId: 'appt-2',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    ageGender: '28 / Female',
    doctor: 'Dr. Nisha Rao',
    department: 'General Medicine',
    status: 'ARRIVED',
    queuePriority: 'Routine',
    appointmentTime: '09:20',
    chiefComplaint: 'Headache and dizziness',
    triageNote: 'No loss of consciousness. Hydration poor as per patient.',
    allergies: ['No known allergies'],
    problems: ['Migraine'],
    notes: [],
    orders: [],
    prescriptions: [],
    vitals: {
      bp: '118/76',
      hr: '82 bpm',
      rr: '16/min',
      temp: '98.2 F',
      spo2: '99%',
      weightKg: '58',
      bmi: '22.1',
    },
  },
  {
    id: 'enc-3',
    patientId: 'MRN-245802',
    appointmentId: 'appt-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    ageGender: '52 / Male',
    doctor: 'Dr. Rohan Mehta',
    department: 'Cardiology',
    status: 'IN_QUEUE',
    queuePriority: 'Urgent',
    appointmentTime: '09:40',
    chiefComplaint: 'Dyspnea on exertion',
    triageNote: 'Mild tachypnea observed, escalate to cardiology room on priority.',
    allergies: ['Sulfa drugs'],
    problems: ['Hypertension', 'Coronary artery disease'],
    notes: [],
    orders: [],
    prescriptions: [],
    vitals: {
      bp: '150/95',
      hr: '102 bpm',
      rr: '22/min',
      temp: '99.1 F',
      spo2: '95%',
      weightKg: '81',
      bmi: '27.9',
    },
  },
  {
    id: 'enc-4',
    patientId: 'MRN-245811',
    appointmentId: 'appt-4',
    patientName: 'Fatima Khan',
    mrn: 'MRN-245811',
    ageGender: '41 / Female',
    doctor: 'Dr. Sana Khan',
    department: 'ENT',
    status: 'BOOKED',
    queuePriority: 'Routine',
    appointmentTime: '10:00',
    chiefComplaint: 'Sore throat follow-up',
    triageNote: 'Awaiting check-in at front desk.',
    allergies: ['No known allergies'],
    problems: ['Recurrent pharyngitis'],
    notes: [],
    orders: [],
    prescriptions: [],
    vitals: {
      bp: '120/78',
      hr: '80 bpm',
      rr: '16/min',
      temp: '98.4 F',
      spo2: '99%',
      weightKg: '63',
      bmi: '24.2',
    },
  },
];

export const OPD_VITAL_TRENDS: VitalTrendRecord[] = [
  {
    id: 'vt-1',
    patientId: 'enc-1',
    recordedAt: '08:48 AM',
    bp: '148/94',
    hr: '100 bpm',
    rr: '20/min',
    temp: '98.7 F',
    spo2: '97%',
    painScore: 2,
    nurse: 'Nurse Priya',
  },
  {
    id: 'vt-2',
    patientId: 'enc-1',
    recordedAt: '09:04 AM',
    bp: '142/92',
    hr: '96 bpm',
    rr: '18/min',
    temp: '98.6 F',
    spo2: '98%',
    painScore: 1,
    nurse: 'Nurse Priya',
  },
  {
    id: 'vt-3',
    patientId: 'enc-3',
    recordedAt: '09:31 AM',
    bp: '154/98',
    hr: '105 bpm',
    rr: '24/min',
    temp: '99.0 F',
    spo2: '94%',
    painScore: 3,
    nurse: 'Nurse Kavya',
  },
];

export const OPD_ORDER_CATALOG: OrderCatalogItem[] = [
  { id: 'ord-1', name: 'Complete Blood Count', category: 'Lab', defaultPriority: 'Routine' },
  { id: 'ord-2', name: 'HbA1c', category: 'Lab', defaultPriority: 'Routine' },
  { id: 'ord-3', name: 'Lipid Profile', category: 'Lab', defaultPriority: 'Routine' },
  { id: 'ord-4', name: 'Chest X-Ray PA View', category: 'Radiology', defaultPriority: 'Routine' },
  { id: 'ord-5', name: 'ECG 12-Lead', category: 'Procedure', defaultPriority: 'Urgent' },
  { id: 'ord-6', name: '2D Echocardiography', category: 'Procedure', defaultPriority: 'Urgent' },
  { id: 'ord-7', name: 'TSH', category: 'Lab', defaultPriority: 'Routine' },
];

export const OPD_MEDICATION_CATALOG: MedicationCatalogItem[] = [
  { id: 'med-1', genericName: 'Metformin', strength: '500 mg', form: 'Tablet', commonFrequency: 'BD' },
  { id: 'med-2', genericName: 'Telmisartan', strength: '40 mg', form: 'Tablet', commonFrequency: 'OD' },
  { id: 'med-3', genericName: 'Pantoprazole', strength: '40 mg', form: 'Tablet', commonFrequency: 'OD' },
  { id: 'med-4', genericName: 'Paracetamol', strength: '650 mg', form: 'Tablet', commonFrequency: 'SOS' },
  { id: 'med-5', genericName: 'Atorvastatin', strength: '20 mg', form: 'Tablet', commonFrequency: 'HS' },
  { id: 'med-6', genericName: 'Amoxicillin + Clavulanate', strength: '625 mg', form: 'Tablet', commonFrequency: 'BD' },
];

export const OPD_NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'tpl-1',
    name: 'General Follow-up',
    content:
      'Subjective: Patient reports symptomatic improvement with current treatment.\nObjective: Vitals reviewed; no acute distress.\nAssessment: Stable chronic condition.\nPlan: Continue medications and follow-up after 2 weeks.',
  },
  {
    id: 'tpl-2',
    name: 'Diabetes Review',
    content:
      'Subjective: Reports variable fasting sugars and occasional dietary lapses.\nObjective: BP mildly elevated, random glucose above target.\nAssessment: Suboptimal glycemic control.\nPlan: Reinforce lifestyle modifications, adjust oral hypoglycemics, repeat HbA1c.',
  },
  {
    id: 'tpl-3',
    name: 'Cardiology Follow-up',
    content:
      'Subjective: Exertional breathlessness but no active chest pain.\nObjective: Elevated BP and HR, ECG requested.\nAssessment: CAD with possible effort intolerance.\nPlan: Urgent ECG, optimize antihypertensive therapy, close review in 1 week.',
  },
];
