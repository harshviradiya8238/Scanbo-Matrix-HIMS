'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card, CommonDialog, WorkspaceHeaderCard } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { INPATIENT_STAYS } from './ipd-mock-data';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import { ipdFormStylesSx } from './components/ipd-ui';
import IpdPatientTopBar, {
  IPD_PATIENT_TOP_BAR_STICKY_OFFSET,
  IpdPatientOption,
  IpdPatientTopBarField,
} from './components/IpdPatientTopBar';
import {
  IpdEncounterRecord,
  IpdClinicalStatus,
  syncIpdEncounterClinical,
  syncIpdEncounterDischargeChecks,
  useIpdEncounters,
} from './ipd-encounter-context';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Checklist as ChecklistIcon,
  CloseRounded as CloseRoundedIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  NoteAlt as NoteAltIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type ClinicalTab =
  | 'rounds'
  | 'nursing'
  | 'vitals'
  | 'orders'
  | 'billing'
  | 'medications'
  | 'notes'
  | 'procedures';

type PatientStatus = 'Stable' | 'Needs Review' | 'Critical';
type OrderPriority = 'Routine' | 'Urgent' | 'STAT';
type OrderStatus = 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
type BillingCategory = 'Lab' | 'Imaging' | 'Procedure' | 'Consultation' | 'Medication' | 'Nursing' | 'Other';
type BillingStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';
type MedicationState = 'Active' | 'Due' | 'Given';
type NoteKind = 'Physician Note' | 'Nursing Note' | 'SOAP Note';
type NoteSeverity = 'Routine' | 'Urgent' | 'STAT';
type ProcedureStatus = 'Completed' | 'Scheduled' | 'Pending' | 'In Progress';
type MedicationSlot = 'morning' | 'afternoon' | 'night';
type SharedPrescriptionStatus = 'Prescribed' | 'Dispensed' | 'Administered' | 'Stopped';

interface ClinicalPatient {
  id: string;
  mrn: string;
  name: string;
  age: string;
  gender: string;
  bed: string;
  ward: string;
  consultant: string;
  diagnosis: string;
  admissionDate: string;
  dayOfStay: number;
  bloodGroup: string;
  allergy: string;
  status: PatientStatus;
}

interface VitalReading {
  time: string;
  bp: string;
  hr: number;
  spo2: number;
  temp: number;
  rr: number;
  bloodSugar: number;
  pain: number;
}

interface ClinicalOrder {
  id: string;
  type: string;
  description: string;
  frequency: string;
  orderedBy: string;
  time: string;
  priority: OrderPriority;
  status: OrderStatus;
  billingId?: string;
  billingCategory?: BillingCategory;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
}

interface BillingEntry {
  id: string;
  orderId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  admissionId: string;
  encounterId: string;
  category: BillingCategory;
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: 'INR';
  status: BillingStatus;
  orderedBy: string;
  orderedAt: string;
  statusUpdatedAt: string;
  statusUpdatedBy: string;
}

interface PersistedOrderBillingState {
  version: 1;
  ordersByPatient: Record<string, ClinicalOrder[]>;
  billingByPatient: Record<string, BillingEntry[]>;
}

interface SharedPrescriptionRow {
  id: string;
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  notes: string;
  status: SharedPrescriptionStatus;
  prescribedBy: string;
  updatedAt: string;
}

type SharedPrescriptionStore = Record<string, SharedPrescriptionRow[]>;

interface ServicePriceMasterItem {
  code: string;
  category: BillingCategory;
  label: string;
  price: number;
  orderTypes: string[];
  keywords: string[];
}

interface MedicationRow {
  id: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  state: MedicationState;
  given: Record<MedicationSlot, boolean>;
}

interface ProgressNote {
  id: string;
  author: string;
  role: string;
  time: string;
  type: NoteKind;
  severity?: NoteSeverity;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ProcedureRow {
  id: string;
  type: 'Procedure' | 'Consult';
  title: string;
  details: string;
  status: ProcedureStatus;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  updatedBy?: string;
}

type SnackSeverity = 'success' | 'error' | 'warning' | 'info';

const CLINICAL_TABS: Array<{ id: ClinicalTab; label: string }> = [
  { id: 'rounds', label: 'Doctor Rounds' },
  { id: 'nursing', label: 'Nursing Care' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'orders', label: 'Orders' },
  { id: 'billing', label: 'Billing' },
  { id: 'medications', label: 'Medication Schedule' },
  { id: 'notes', label: 'Progress Notes' },
  { id: 'procedures', label: 'Procedures / Consults' },
];

const ORDER_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'Lab', label: 'Lab / Investigation' },
  { value: 'Imaging', label: 'Imaging' },
  { value: 'Medication', label: 'Medication' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Procedure', label: 'Procedure' },
  { value: 'Consult', label: 'Consult' },
];

const PATIENT_EXTRA: Record<
  string,
  { status: PatientStatus; dayOfStay: number; bloodGroup: string; allergy: string }
> = {
  'ipd-1': { status: 'Needs Review', dayOfStay: 3, bloodGroup: 'B+', allergy: 'Penicillin' },
  'ipd-2': { status: 'Stable', dayOfStay: 2, bloodGroup: 'O+', allergy: 'No known allergies' },
  'ipd-3': { status: 'Critical', dayOfStay: 4, bloodGroup: 'A+', allergy: 'No known allergies' },
  'ipd-4': { status: 'Needs Review', dayOfStay: 2, bloodGroup: 'AB+', allergy: 'Sulfa drugs' },
};

const INSURANCE_BY_PATIENT_ID: Record<string, string> = {
  'ipd-1': 'Star Health',
  'ipd-2': 'HDFC Ergo',
  'ipd-3': 'New India Assurance',
  'ipd-4': 'No Insurance',
};

const TOTAL_BILL_BY_PATIENT_ID: Record<string, number> = {
  'ipd-1': 67000,
  'ipd-2': 52000,
  'ipd-3': 182000,
  'ipd-4': 48000,
};

const INR_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';
const ROUNDS_MEDICATION_STORAGE_KEY = 'scanbo.hims.ipd.rounds-medications.v1';
const IPD_PRESCRIPTION_STORAGE_KEY = 'scanbo.hims.ipd.prescriptions.module.v1';
const ROUNDS_MEDICATION_BILLING_PREFIX = 'bill-rx-rounds-';

const ORDER_TYPE_TO_BILLING_CATEGORY: Record<string, BillingCategory> = {
  lab: 'Lab',
  imaging: 'Imaging',
  procedure: 'Procedure',
  consult: 'Consultation',
  medication: 'Medication',
  nursing: 'Nursing',
};

const SERVICE_PRICE_MASTER: ServicePriceMasterItem[] = [
  {
    code: 'LAB-CBC',
    category: 'Lab',
    label: 'Complete Blood Count (CBC)',
    price: 450,
    orderTypes: ['lab'],
    keywords: ['cbc', 'blood count'],
  },
  {
    code: 'LAB-CRP',
    category: 'Lab',
    label: 'C-Reactive Protein (CRP)',
    price: 700,
    orderTypes: ['lab'],
    keywords: ['crp'],
  },
  {
    code: 'LAB-TROP',
    category: 'Lab',
    label: 'Troponin Panel',
    price: 1600,
    orderTypes: ['lab'],
    keywords: ['troponin'],
  },
  {
    code: 'IMG-CXR',
    category: 'Imaging',
    label: 'Chest X-Ray',
    price: 900,
    orderTypes: ['imaging'],
    keywords: ['x-ray', 'xray', 'chest'],
  },
  {
    code: 'IMG-CT',
    category: 'Imaging',
    label: 'CT Scan',
    price: 4500,
    orderTypes: ['imaging'],
    keywords: ['ct'],
  },
  {
    code: 'PROC-NEB',
    category: 'Procedure',
    label: 'Nebulization Therapy',
    price: 1200,
    orderTypes: ['procedure'],
    keywords: ['nebulization', 'nebulisation'],
  },
  {
    code: 'CONS-CARD',
    category: 'Consultation',
    label: 'Specialist Consultation',
    price: 1500,
    orderTypes: ['consult'],
    keywords: ['review', 'consult', 'cardiology', 'pulmonology'],
  },
  {
    code: 'MED-IPD',
    category: 'Medication',
    label: 'Medication Administration',
    price: 350,
    orderTypes: ['medication'],
    keywords: ['medication', 'protocol'],
  },
  {
    code: 'NUR-CARE',
    category: 'Nursing',
    label: 'Nursing Care Task',
    price: 300,
    orderTypes: ['nursing'],
    keywords: ['education', 'monitoring', 'charting'],
  },
];

const DEFAULT_SERVICE_BY_CATEGORY: Record<
  BillingCategory,
  { code: string; label: string; price: number }
> = {
  Lab: { code: 'LAB-GEN', label: 'General Lab Service', price: 500 },
  Imaging: { code: 'IMG-GEN', label: 'General Imaging Service', price: 1200 },
  Procedure: { code: 'PROC-GEN', label: 'General Procedure Service', price: 1800 },
  Consultation: { code: 'CONS-GEN', label: 'Consultation Service', price: 1000 },
  Medication: { code: 'MED-GEN', label: 'Medication Service', price: 300 },
  Nursing: { code: 'NUR-GEN', label: 'Nursing Service', price: 250 },
  Other: { code: 'SRV-GEN', label: 'General Service', price: 500 },
};

const INDIAN_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const STAY_BY_ID = INPATIENT_STAYS.reduce<Record<string, (typeof INPATIENT_STAYS)[number]>>(
  (accumulator, stay) => {
    accumulator[stay.id] = stay;
    return accumulator;
  },
  {}
);

const STAY_BY_MRN = INPATIENT_STAYS.reduce<Record<string, (typeof INPATIENT_STAYS)[number]>>(
  (accumulator, stay) => {
    accumulator[stay.mrn.trim().toUpperCase()] = stay;
    return accumulator;
  },
  {}
);

const INITIAL_VITALS: Record<string, VitalReading[]> = {
  'ipd-1': [
    {
      time: '17-Feb-2026 08:20',
      bp: '132/84',
      hr: 96,
      spo2: 93,
      temp: 100.4,
      rr: 20,
      bloodSugar: 164,
      pain: 4,
    },
    {
      time: '16-Feb-2026 18:10',
      bp: '128/82',
      hr: 92,
      spo2: 94,
      temp: 99.4,
      rr: 19,
      bloodSugar: 152,
      pain: 3,
    },
    {
      time: '16-Feb-2026 09:30',
      bp: '134/86',
      hr: 98,
      spo2: 92,
      temp: 100.8,
      rr: 22,
      bloodSugar: 171,
      pain: 5,
    },
  ],
  'ipd-2': [
    {
      time: '17-Feb-2026 08:00',
      bp: '118/76',
      hr: 82,
      spo2: 98,
      temp: 98.6,
      rr: 16,
      bloodSugar: 118,
      pain: 2,
    },
    {
      time: '16-Feb-2026 20:15',
      bp: '120/78',
      hr: 84,
      spo2: 98,
      temp: 98.4,
      rr: 16,
      bloodSugar: 122,
      pain: 2,
    },
  ],
  'ipd-3': [
    {
      time: '17-Feb-2026 08:05',
      bp: '168/102',
      hr: 112,
      spo2: 90,
      temp: 99.1,
      rr: 24,
      bloodSugar: 208,
      pain: 6,
    },
    {
      time: '16-Feb-2026 23:00',
      bp: '162/98',
      hr: 108,
      spo2: 91,
      temp: 99.2,
      rr: 22,
      bloodSugar: 198,
      pain: 5,
    },
  ],
  'ipd-4': [
    {
      time: '17-Feb-2026 08:15',
      bp: '136/88',
      hr: 90,
      spo2: 97,
      temp: 98.9,
      rr: 18,
      bloodSugar: 214,
      pain: 3,
    },
    {
      time: '16-Feb-2026 20:05',
      bp: '138/90',
      hr: 92,
      spo2: 97,
      temp: 99.0,
      rr: 18,
      bloodSugar: 226,
      pain: 4,
    },
  ],
};

const INITIAL_ORDERS: Record<string, ClinicalOrder[]> = {
  'ipd-1': [
    {
      id: 'ord-1',
      type: 'Lab',
      description: 'CBC and CRP repeat',
      frequency: 'Once daily',
      orderedBy: 'Dr. Nisha Rao',
      time: '17-Feb-2026 08:30',
      priority: 'Urgent',
      status: 'Pending',
    },
    {
      id: 'ord-2',
      type: 'Imaging',
      description: 'Chest X-Ray follow-up',
      frequency: 'Once',
      orderedBy: 'Dr. Nisha Rao',
      time: '17-Feb-2026 09:00',
      priority: 'Routine',
      status: 'Scheduled',
    },
    {
      id: 'ord-3',
      type: 'Nursing',
      description: 'Incentive spirometry education',
      frequency: 'Q6H',
      orderedBy: 'Dr. Nisha Rao',
      time: '17-Feb-2026 09:15',
      priority: 'Routine',
      status: 'In Progress',
    },
  ],
  'ipd-2': [
    {
      id: 'ord-4',
      type: 'Medication',
      description: 'Post-op pain protocol',
      frequency: 'Q8H',
      orderedBy: 'Dr. Sameer Kulkarni',
      time: '17-Feb-2026 08:20',
      priority: 'Routine',
      status: 'In Progress',
    },
  ],
  'ipd-3': [
    {
      id: 'ord-5',
      type: 'Consult',
      description: 'Urgent cardiology review',
      frequency: 'Immediate',
      orderedBy: 'Dr. K. Anand',
      time: '17-Feb-2026 08:10',
      priority: 'STAT',
      status: 'Pending',
    },
    {
      id: 'ord-6',
      type: 'Lab',
      description: 'Serial troponin panel',
      frequency: 'Q6H',
      orderedBy: 'Dr. K. Anand',
      time: '17-Feb-2026 08:25',
      priority: 'Urgent',
      status: 'Scheduled',
    },
  ],
  'ipd-4': [
    {
      id: 'ord-7',
      type: 'Lab',
      description: 'Capillary glucose monitoring',
      frequency: 'Q4H',
      orderedBy: 'Dr. Vidya Iyer',
      time: '17-Feb-2026 08:40',
      priority: 'Urgent',
      status: 'In Progress',
    },
  ],
};

const INITIAL_MEDICATIONS: Record<string, MedicationRow[]> = {
  'ipd-1': [
    {
      id: 'med-1',
      medication: 'Piperacillin/Tazobactam',
      dose: '4.5 g',
      route: 'IV',
      frequency: 'Q8H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: false },
    },
    {
      id: 'med-2',
      medication: 'Paracetamol',
      dose: '650 mg',
      route: 'Oral',
      frequency: 'SOS',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
  ],
  'ipd-2': [
    {
      id: 'med-3',
      medication: 'Ceftriaxone',
      dose: '1 g',
      route: 'IV',
      frequency: 'Q12H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: true },
    },
    {
      id: 'med-4',
      medication: 'Pantoprazole',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'OD',
      state: 'Given',
      given: { morning: true, afternoon: true, night: true },
    },
  ],
  'ipd-3': [
    {
      id: 'med-5',
      medication: 'Heparin',
      dose: 'As per protocol',
      route: 'IV infusion',
      frequency: 'Continuous',
      state: 'Active',
      given: { morning: true, afternoon: true, night: true },
    },
    {
      id: 'med-6',
      medication: 'Atorvastatin',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'HS',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    },
  ],
  'ipd-4': [
    {
      id: 'med-7',
      medication: 'Insulin Regular',
      dose: 'Sliding scale',
      route: 'SC',
      frequency: 'Q6H',
      state: 'Active',
      given: { morning: true, afternoon: false, night: false },
    },
  ],
};

const INITIAL_NOTES: Record<string, ProgressNote[]> = {
  'ipd-1': [
    {
      id: 'note-1',
      author: 'Dr. Nisha Rao',
      role: 'Physician',
      time: '17-Feb-2026 09:40',
      type: 'SOAP Note',
      subjective: 'Cough persists but breathlessness is lower than yesterday.',
      objective: 'SpO2 93% on room air, coarse crepitations in right lower zone.',
      assessment: 'Improving CAP with residual inflammatory burden.',
      plan: 'Continue IV antibiotics, repeat CBC/CRP, chest physiotherapy.',
    },
    {
      id: 'note-2',
      author: 'Nurse Rekha Singh',
      role: 'Nursing',
      time: '17-Feb-2026 08:50',
      type: 'Nursing Note',
      subjective: 'Patient reports better sleep overnight.',
      objective: 'No desaturation episodes overnight.',
      assessment: 'Clinically stable for ward-level nursing care.',
      plan: 'Continue frequent vitals and sputum output monitoring.',
    },
  ],
  'ipd-2': [
    {
      id: 'note-3',
      author: 'Dr. Sameer Kulkarni',
      role: 'Surgeon',
      time: '17-Feb-2026 10:00',
      type: 'Physician Note',
      subjective: 'Mild post-op pain with movement.',
      objective: 'Incision clean, drain output minimal.',
      assessment: 'Day 1 post-op recovery on track.',
      plan: 'Early ambulation and diet advancement.',
    },
  ],
  'ipd-3': [
    {
      id: 'note-4',
      author: 'Dr. K. Anand',
      role: 'ICU Consultant',
      time: '17-Feb-2026 08:30',
      type: 'SOAP Note',
      subjective: 'Intermittent chest heaviness overnight.',
      objective: 'Telemetry changes with elevated troponin trend.',
      assessment: 'High-risk ACS requiring close monitoring.',
      plan: 'Urgent cardiology review, continue heparin protocol.',
    },
  ],
  'ipd-4': [
    {
      id: 'note-5',
      author: 'Dr. Vidya Iyer',
      role: 'Physician',
      time: '17-Feb-2026 09:10',
      type: 'Physician Note',
      subjective: 'Feels less fatigued today.',
      objective: 'Glucose remains elevated but improving trend.',
      assessment: 'Uncontrolled diabetes with better response.',
      plan: 'Continue insulin correction and diabetic counseling.',
    },
  ],
};

const INITIAL_PROCEDURES: Record<string, ProcedureRow[]> = {
  'ipd-1': [
    {
      id: 'proc-1',
      type: 'Procedure',
      title: 'Nebulization therapy',
      details: 'Q8H respiratory support',
      status: 'In Progress',
    },
    {
      id: 'proc-2',
      type: 'Consult',
      title: 'Pulmonology review',
      details: 'Planned for afternoon round',
      status: 'Scheduled',
    },
  ],
  'ipd-2': [
    {
      id: 'proc-3',
      type: 'Procedure',
      title: 'Drain output monitoring',
      details: 'Post-op hourly charting',
      status: 'In Progress',
    },
  ],
  'ipd-3': [
    {
      id: 'proc-4',
      type: 'Consult',
      title: 'Cardiology emergency review',
      details: 'On-call cardiology notified',
      status: 'Pending',
    },
    {
      id: 'proc-5',
      type: 'Procedure',
      title: 'Serial ECG',
      details: 'Repeat every 6 hours',
      status: 'In Progress',
    },
  ],
  'ipd-4': [
    {
      id: 'proc-6',
      type: 'Consult',
      title: 'Diabetology counseling',
      details: 'Diet and insulin adjustment session',
      status: 'Scheduled',
    },
  ],
};

const CHECKLIST_TEMPLATE: Array<{ id: string; label: string }> = [
  { id: 'med-recon', label: 'Medication reconciliation complete' },
  { id: 'pending-orders', label: 'All pending orders reviewed' },
  { id: 'education', label: 'Patient and family education documented' },
  { id: 'summary', label: 'Discharge summary draft prepared' },
  { id: 'followup', label: 'Follow-up appointment date finalized' },
  { id: 'billing', label: 'Billing and clearance confirmed' },
];

function buildChecklist(doneItemIds: string[] = []): ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map((item) => ({
    id: item.id,
    label: item.label,
    done: doneItemIds.includes(item.id),
    updatedBy: doneItemIds.includes(item.id) ? 'Completed in morning round' : undefined,
  }));
}

const INITIAL_CHECKLISTS: Record<string, ChecklistItem[]> = {
  'ipd-1': buildChecklist(['med-recon', 'pending-orders', 'education']),
  'ipd-2': buildChecklist(['med-recon', 'pending-orders', 'education', 'summary', 'followup']),
  'ipd-3': buildChecklist(['med-recon']),
  'ipd-4': buildChecklist(['med-recon', 'education']),
};

const PATIENT_TIMELINE = [
  {
    id: 'admission',
    title: 'Admission and triage',
    subtitle: 'Day 1',
    note: 'Patient stabilized and moved to assigned ward.',
  },
  {
    id: 'assessment',
    title: 'Consultant assessment',
    subtitle: 'Day 1',
    note: 'Primary diagnosis and care plan documented.',
  },
  {
    id: 'active',
    title: 'Active treatment',
    subtitle: 'Current',
    note: 'Monitoring vitals, executing orders, and documenting progress.',
  },
  {
    id: 'discharge',
    title: 'Discharge readiness',
    subtitle: 'Upcoming',
    note: 'Checklist completion and handoff preparation.',
  },
];

function isClinicalTab(value: string | null): value is ClinicalTab {
  return value !== null && CLINICAL_TABS.some((tab) => tab.id === value);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function cloneOrders(source: Record<string, ClinicalOrder[]>): Record<string, ClinicalOrder[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, ClinicalOrder[]>;
}

function cloneBillingEntries(source: Record<string, BillingEntry[]>): Record<string, BillingEntry[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, BillingEntry[]>;
}

function normalizeOrderType(type: string): string {
  return type.trim().toLowerCase();
}

function resolveBillingCategory(orderType: string): BillingCategory {
  return ORDER_TYPE_TO_BILLING_CATEGORY[normalizeOrderType(orderType)] ?? 'Other';
}

function resolveBillingService(
  orderType: string,
  description: string
): { code: string; label: string; category: BillingCategory; price: number } {
  const normalizedType = normalizeOrderType(orderType);
  const normalizedDescription = description.trim().toLowerCase();
  const matched = SERVICE_PRICE_MASTER.find((service) => {
    const typeMatch = service.orderTypes.includes(normalizedType);
    if (!typeMatch) return false;
    if (!normalizedDescription) return true;
    return service.keywords.some((keyword) => normalizedDescription.includes(keyword));
  });

  if (matched) {
    return {
      code: matched.code,
      label: matched.label,
      category: matched.category,
      price: matched.price,
    };
  }

  const category = resolveBillingCategory(orderType);
  const fallback = DEFAULT_SERVICE_BY_CATEGORY[category];
  return {
    code: fallback.code,
    label: fallback.label,
    category,
    price: fallback.price,
  };
}

function billingStatusFromOrderStatus(status: OrderStatus): BillingStatus {
  if (status === 'Cancelled') return 'Cancelled';
  if (status === 'Completed') return 'Ready for Billing';
  return 'Pending';
}

function formatBillingAmount(amount: number): string {
  return INDIAN_CURRENCY.format(amount);
}

function buildSeedOrderBillingState(): PersistedOrderBillingState {
  const ordersByPatient = cloneOrders(INITIAL_ORDERS);
  const billingByPatient: Record<string, BillingEntry[]> = {};

  Object.entries(ordersByPatient).forEach(([patientId, rows]) => {
    const stay = STAY_BY_ID[patientId];

    const seededOrders = rows.map((order) => {
      const billingId = order.billingId ?? `bill-${order.id}`;
      const service = resolveBillingService(order.type, order.description);
      return {
        ...order,
        billingId,
        billingCategory: service.category,
        statusUpdatedAt: order.time,
        statusUpdatedBy: order.orderedBy,
      };
    });

    ordersByPatient[patientId] = seededOrders;
    billingByPatient[patientId] = seededOrders.map((order) => {
      const service = resolveBillingService(order.type, order.description);
      const quantity = 1;
      const unitPrice = service.price;
      return {
        id: order.billingId ?? `bill-${order.id}`,
        orderId: order.id,
        patientId,
        patientMrn: stay?.mrn ?? '',
        patientName: stay?.patientName ?? '',
        admissionId: `adm-${patientId}`,
        encounterId: `enc-${patientId}`,
        category: service.category,
        serviceCode: service.code,
        serviceName: service.label,
        quantity,
        unitPrice,
        amount: unitPrice * quantity,
        currency: 'INR',
        status: billingStatusFromOrderStatus(order.status),
        orderedBy: order.orderedBy,
        orderedAt: order.time,
        statusUpdatedAt: order.statusUpdatedAt ?? order.time,
        statusUpdatedBy: order.statusUpdatedBy ?? order.orderedBy,
      };
    });
  });

  return {
    version: 1,
    ordersByPatient,
    billingByPatient,
  };
}

function readPersistedOrderBillingState(): PersistedOrderBillingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedOrderBillingState>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.ordersByPatient ||
      typeof parsed.ordersByPatient !== 'object' ||
      !parsed.billingByPatient ||
      typeof parsed.billingByPatient !== 'object'
    ) {
      return null;
    }
    return {
      version: 1,
      ordersByPatient: cloneOrders(parsed.ordersByPatient as Record<string, ClinicalOrder[]>),
      billingByPatient: cloneBillingEntries(parsed.billingByPatient as Record<string, BillingEntry[]>),
    };
  } catch {
    return null;
  }
}

function writePersistedOrderBillingState(state: PersistedOrderBillingState): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = readPersistedOrderBillingState();
    const mergedBillingByPatient = cloneBillingEntries(state.billingByPatient);

    if (existing) {
      Object.entries(existing.billingByPatient).forEach(([patientId, rows]) => {
        const preservedPrescriptionRows = rows.filter((row) =>
          String(row.id).startsWith('bill-rx-ipd-')
        );
        if (preservedPrescriptionRows.length === 0) return;

        const currentRows = mergedBillingByPatient[patientId] ?? [];
        const withoutPreservedRows = currentRows.filter(
          (row) => !String(row.id).startsWith('bill-rx-ipd-')
        );

        mergedBillingByPatient[patientId] = [
          ...preservedPrescriptionRows,
          ...withoutPreservedRows,
        ];
      });
    }

    window.sessionStorage.setItem(
      ORDER_BILLING_STORAGE_KEY,
      JSON.stringify({
        ...state,
        billingByPatient: mergedBillingByPatient,
      })
    );
  } catch {
    // best-effort cache only
  }
}

function readPersistedRoundsMedicationRows(): Record<string, MedicationRow[]> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(ROUNDS_MEDICATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, MedicationRow[]>;
    if (!parsed || typeof parsed !== 'object') return null;
    return cloneMedicationRows(parsed);
  } catch {
    return null;
  }
}

function writePersistedRoundsMedicationRows(state: Record<string, MedicationRow[]>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ROUNDS_MEDICATION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort cache only
  }
}

function readSharedPrescriptionStore(): SharedPrescriptionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(IPD_PRESCRIPTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SharedPrescriptionStore;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeSharedPrescriptionStore(state: SharedPrescriptionStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(IPD_PRESCRIPTION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort cache only
  }
}

function mapMedicationStateToSharedStatus(state: MedicationState): SharedPrescriptionStatus {
  if (state === 'Given') return 'Administered';
  if (state === 'Active') return 'Dispensed';
  return 'Prescribed';
}

function sharedStatusRank(status: SharedPrescriptionStatus): number {
  if (status === 'Stopped') return 4;
  if (status === 'Administered') return 3;
  if (status === 'Dispensed') return 2;
  return 1;
}

function mergeSharedPrescriptionStatus(
  mappedStatus: SharedPrescriptionStatus,
  existingStatus?: SharedPrescriptionStatus
): SharedPrescriptionStatus {
  if (!existingStatus) return mappedStatus;
  return sharedStatusRank(existingStatus) > sharedStatusRank(mappedStatus)
    ? existingStatus
    : mappedStatus;
}

function billingStatusRank(status: BillingStatus): number {
  if (status === 'Cancelled') return 3;
  if (status === 'Ready for Billing') return 2;
  return 1;
}

function mergeRoundBillingStatus(
  mappedStatus: BillingStatus,
  existingStatus?: BillingStatus
): BillingStatus {
  if (!existingStatus) return mappedStatus;
  return billingStatusRank(existingStatus) > billingStatusRank(mappedStatus)
    ? existingStatus
    : mappedStatus;
}

function cloneMedicationRows(source: Record<string, MedicationRow[]>): Record<string, MedicationRow[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({
        ...row,
        given: { ...row.given },
      })),
    ])
  ) as Record<string, MedicationRow[]>;
}

function cloneNotes(source: Record<string, ProgressNote[]>): Record<string, ProgressNote[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, ProgressNote[]>;
}

function cloneChecklists(source: Record<string, ChecklistItem[]>): Record<string, ChecklistItem[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, ChecklistItem[]>;
}

function cloneVitals(source: Record<string, VitalReading[]>): Record<string, VitalReading[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, VitalReading[]>;
}

function cloneProcedures(source: Record<string, ProcedureRow[]>): Record<string, ProcedureRow[]> {
  return Object.fromEntries(
    Object.entries(source).map(([patientId, rows]) => [
      patientId,
      rows.map((row) => ({ ...row })),
    ])
  ) as Record<string, ProcedureRow[]>;
}

function getVitalTone(
  metric: 'bp' | 'hr' | 'spo2' | 'temp',
  value: string | number
): 'success' | 'warning' | 'error' {
  if (metric === 'bp') {
    const systolic = Number(String(value).split('/')[0]);
    if (Number.isNaN(systolic)) return 'warning';
    if (systolic >= 160) return 'error';
    if (systolic >= 140) return 'warning';
    return 'success';
  }

  if (metric === 'hr') {
    const hr = Number(value);
    if (hr >= 110 || hr < 50) return 'error';
    if (hr >= 100 || hr < 60) return 'warning';
    return 'success';
  }

  if (metric === 'spo2') {
    const spo2 = Number(value);
    if (spo2 < 92) return 'error';
    if (spo2 < 95) return 'warning';
    return 'success';
  }

  const temp = Number(value);
  if (temp >= 102 || temp < 96) return 'error';
  if (temp >= 99.5) return 'warning';
  return 'success';
}

function orderStatusChipColor(status: OrderStatus): 'default' | 'warning' | 'info' | 'success' | 'error' {
  if (status === 'Cancelled') return 'error';
  if (status === 'Pending') return 'warning';
  if (status === 'Scheduled') return 'default';
  if (status === 'In Progress') return 'info';
  return 'success';
}

function billingStatusChipColor(status: BillingStatus): 'warning' | 'success' | 'error' {
  if (status === 'Cancelled') return 'error';
  if (status === 'Ready for Billing') return 'success';
  return 'warning';
}

function priorityChipColor(priority: OrderPriority): 'default' | 'warning' | 'error' {
  if (priority === 'STAT') return 'error';
  if (priority === 'Urgent') return 'warning';
  return 'default';
}

function procedureChipColor(
  status: ProcedureStatus
): 'default' | 'warning' | 'info' | 'success' {
  if (status === 'Pending') return 'warning';
  if (status === 'Scheduled') return 'default';
  if (status === 'In Progress') return 'info';
  return 'success';
}

function patientStatusChipColor(status: PatientStatus): 'success' | 'warning' | 'error' {
  if (status === 'Critical') return 'error';
  if (status === 'Needs Review') return 'warning';
  return 'success';
}

function mapPatientStatusToEncounterStatus(status: PatientStatus): IpdClinicalStatus {
  if (status === 'Critical') return 'critical';
  if (status === 'Needs Review') return 'watch';
  return 'stable';
}

function mapEncounterStatusToPatientStatus(status: IpdClinicalStatus): PatientStatus {
  if (status === 'critical') return 'Critical';
  if (status === 'watch') return 'Needs Review';
  return 'Stable';
}

function noteMetaLine(note: ProgressNote): string {
  return `${note.role} | ${note.type}${note.severity ? ` | ${note.severity}` : ''}`;
}

function syncRoundMedicationBillingRows(
  currentBillingByPatient: Record<string, BillingEntry[]>,
  medicationsByPatient: Record<string, MedicationRow[]>,
  patientById: Record<string, ClinicalPatient>,
  encounterByPatientId: Record<string, IpdEncounterRecord>
): Record<string, BillingEntry[]> {
  const next = cloneBillingEntries(currentBillingByPatient);

  Object.entries(medicationsByPatient).forEach(([patientId, medications]) => {
    const patient = patientById[patientId];
    const encounter = encounterByPatientId[patientId];
    const consultant = patient?.consultant || encounter?.consultant || 'IPD Consultant';
    const patientMrn = patient?.mrn || encounter?.mrn || '';
    const patientName = patient?.name || encounter?.patientName || '';
    const admissionId = encounter?.admissionId ?? `adm-${patientId}`;
    const encounterId = encounter?.encounterId ?? `enc-${patientId}`;
    const existingRows = next[patientId] ?? [];
    const existingRoundRowsById = new Map(
      existingRows
        .filter((row) => String(row.id).startsWith(ROUNDS_MEDICATION_BILLING_PREFIX))
        .map((row) => [row.id, row])
    );
    const preservedRows = existingRows.filter(
      (row) => !String(row.id).startsWith(ROUNDS_MEDICATION_BILLING_PREFIX)
    );

    const medicationRows = medications.map((medication) => {
      const billingId = `${ROUNDS_MEDICATION_BILLING_PREFIX}${patientId}-${medication.id}`;
      const service = resolveBillingService('Medication', medication.medication);
      const mappedStatus: BillingStatus = medication.state === 'Given' ? 'Ready for Billing' : 'Pending';
      const stamp = new Date().toLocaleString();
      const existing = existingRoundRowsById.get(billingId);
      const billingStatus = mergeRoundBillingStatus(mappedStatus, existing?.status);
      const serviceName = `${medication.medication} (${medication.dose})`;
      const shouldRefreshStatusStamp =
        !existing ||
        existing.status !== billingStatus ||
        existing.serviceName !== serviceName;

      return {
        id: billingId,
        orderId: `rx-rounds-${patientId}-${medication.id}`,
        patientId,
        patientMrn,
        patientName,
        admissionId,
        encounterId,
        category: 'Medication' as BillingCategory,
        serviceCode: service.code,
        serviceName,
        quantity: 1,
        unitPrice: service.price,
        amount: service.price,
        currency: 'INR' as const,
        status: billingStatus,
        orderedBy: existing?.orderedBy ?? consultant,
        orderedAt: existing?.orderedAt ?? stamp,
        statusUpdatedAt: shouldRefreshStatusStamp
          ? stamp
          : existing?.statusUpdatedAt ?? stamp,
        statusUpdatedBy: shouldRefreshStatusStamp
          ? consultant
          : existing?.statusUpdatedBy ?? consultant,
      };
    });

    next[patientId] = [...medicationRows, ...preservedRows];
  });

  return next;
}

export default function IpdRoundsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const theme = useTheme();
  const encounterRows = useIpdEncounters();
  const { permissions } = useUser();

  const clinicalPatients = React.useMemo<ClinicalPatient[]>(() => {
    return encounterRows
      .filter((record) => record.workflowStatus !== 'discharged')
      .map((record) => {
        const normalizedMrn = record.mrn.trim().toUpperCase();
        const seededPatient = getPatientByMrn(record.mrn);
        const staySeed = STAY_BY_MRN[normalizedMrn];
        const [ageFromStay = '--', genderFromStay = '--'] = (staySeed?.ageGender ?? '')
          .split('/')
          .map((value) => value.trim())
          .filter(Boolean);
        const extra = PATIENT_EXTRA[record.patientId] ?? {
          status: 'Stable' as PatientStatus,
          dayOfStay: 1,
          bloodGroup: '--',
          allergy: 'No known allergies',
        };

        return {
          id: record.patientId,
          mrn: record.mrn,
          name: record.patientName || seededPatient?.name || staySeed?.patientName || 'Unknown Patient',
          age: seededPatient ? String(seededPatient.age) : ageFromStay,
          gender: seededPatient?.gender ?? genderFromStay,
          bed: record.bed || staySeed?.bed || '--',
          ward: record.ward || staySeed?.ward || '--',
          consultant: record.consultant || staySeed?.consultant || '--',
          diagnosis: record.diagnosis || staySeed?.diagnosis || '--',
          admissionDate: staySeed?.admissionDate ?? '--',
          dayOfStay: extra.dayOfStay,
          bloodGroup: extra.bloodGroup,
          allergy: extra.allergy,
          status: mapEncounterStatusToPatientStatus(record.clinicalStatus),
        };
      });
  }, [encounterRows]);

  const encounterByPatientId = React.useMemo(
    () =>
      encounterRows.reduce<Record<string, (typeof encounterRows)[number]>>((accumulator, record) => {
        accumulator[record.patientId] = record;
        return accumulator;
      }, {}),
    [encounterRows]
  );

  const patientById = React.useMemo(
    () =>
      clinicalPatients.reduce<Record<string, ClinicalPatient>>((accumulator, patient) => {
        accumulator[patient.id] = patient;
        return accumulator;
      }, {}),
    [clinicalPatients]
  );

  const initialOrderBillingState = React.useMemo<PersistedOrderBillingState>(
    () => readPersistedOrderBillingState() ?? buildSeedOrderBillingState(),
    []
  );

  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<ClinicalTab>('rounds');
  const [vitalsByPatient, setVitalsByPatient] = React.useState<Record<string, VitalReading[]>>(
    () => cloneVitals(INITIAL_VITALS)
  );
  const [ordersByPatient, setOrdersByPatient] = React.useState<Record<string, ClinicalOrder[]>>(
    () => cloneOrders(initialOrderBillingState.ordersByPatient)
  );
  const [billingByPatient, setBillingByPatient] = React.useState<Record<string, BillingEntry[]>>(
    () => cloneBillingEntries(initialOrderBillingState.billingByPatient)
  );
  const [medicationsByPatient, setMedicationsByPatient] = React.useState<
    Record<string, MedicationRow[]>
  >(() => readPersistedRoundsMedicationRows() ?? cloneMedicationRows(INITIAL_MEDICATIONS));
  const [proceduresByPatient, setProceduresByPatient] = React.useState<
    Record<string, ProcedureRow[]>
  >(() => cloneProcedures(INITIAL_PROCEDURES));
  const [notesByPatient, setNotesByPatient] = React.useState<Record<string, ProgressNote[]>>(() =>
    cloneNotes(INITIAL_NOTES)
  );
  const [checklistsByPatient, setChecklistsByPatient] = React.useState<
    Record<string, ChecklistItem[]>
  >(() => cloneChecklists(INITIAL_CHECKLISTS));
  const [quickOrder, setQuickOrder] = React.useState<{
    type: string;
    priority: OrderPriority;
    description: string;
    frequency: string;
    duration: string;
  }>({
    type: 'Lab',
    priority: 'Routine',
    description: '',
    frequency: 'Once',
    duration: '',
  });
  const [quickOrderError, setQuickOrderError] = React.useState('');
  const [quickNote, setQuickNote] = React.useState<{
    type: NoteKind;
    severity: NoteSeverity;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  }>({
    type: 'Physician Note',
    severity: 'Routine',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [quickNoteError, setQuickNoteError] = React.useState('');
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [vitalsDialogError, setVitalsDialogError] = React.useState('');
  const [vitalsDraft, setVitalsDraft] = React.useState({
    systolic: '',
    diastolic: '',
    hr: '',
    spo2: '',
    temp: '',
    rr: '',
    bloodSugar: '',
    pain: '',
    notes: '',
  });
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [orderDialogError, setOrderDialogError] = React.useState('');
  const [orderDraft, setOrderDraft] = React.useState({
    type: 'Lab',
    priority: 'Routine' as OrderPriority,
    description: '',
    frequency: 'Once',
    duration: '',
    notes: '',
  });
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [noteDialogError, setNoteDialogError] = React.useState('');
  const [noteDraft, setNoteDraft] = React.useState({
    type: 'SOAP Note' as NoteKind,
    severity: 'Routine' as NoteSeverity,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [medDialogOpen, setMedDialogOpen] = React.useState(false);
  const [medDialogError, setMedDialogError] = React.useState('');
  const [medDraft, setMedDraft] = React.useState({
    medication: '',
    dose: '',
    route: 'Oral',
    frequency: 'OD',
    duration: '',
    notes: '',
  });
  const [procedureDialogOpen, setProcedureDialogOpen] = React.useState(false);
  const [procedureDialogError, setProcedureDialogError] = React.useState('');
  const [procedureDraft, setProcedureDraft] = React.useState<{
    type: 'Procedure' | 'Consult';
    title: string;
    details: string;
    status: ProcedureStatus;
  }>({
    type: 'Procedure',
    title: '',
    details: '',
    status: 'Pending',
  });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: SnackSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!isClinicalTab(tabParam)) return;
    setActiveTab((currentTab) => (currentTab === tabParam ? currentTab : tabParam));
  }, [searchParams]);

  React.useEffect(() => {
    writePersistedOrderBillingState({
      version: 1,
      ordersByPatient,
      billingByPatient,
    });
  }, [billingByPatient, ordersByPatient]);

  React.useEffect(() => {
    writePersistedRoundsMedicationRows(medicationsByPatient);
  }, [medicationsByPatient]);

  React.useEffect(() => {
    const currentStore = readSharedPrescriptionStore();
    const nextStore: SharedPrescriptionStore = { ...currentStore };

    Object.entries(medicationsByPatient).forEach(([patientId, rows]) => {
      const existingRows = nextStore[patientId] ?? [];
      const existingRowById = new Map(existingRows.map((row) => [row.id, row]));
      const preservedRows = existingRows.filter(
        (row) => !String(row.id).startsWith(`rounds-${patientId}-`)
      );
      const consultant = patientById[patientId]?.consultant || 'IPD Consultant';

      const mirroredRows: SharedPrescriptionRow[] = rows.map((row) => {
        const mirroredId = `rounds-${patientId}-${row.id}`;
        const mappedStatus = mapMedicationStateToSharedStatus(row.state);
        const existing = existingRowById.get(mirroredId);
        const nextStatus = mergeSharedPrescriptionStatus(mappedStatus, existing?.status);
        const shouldRefreshTimestamp =
          !existing ||
          existing.status !== nextStatus ||
          existing.medicationName !== row.medication ||
          existing.dose !== row.dose ||
          existing.route !== row.route ||
          existing.frequency !== row.frequency;

        return {
          id: mirroredId,
          medicationName: row.medication,
          dose: row.dose,
          route: row.route,
          frequency: row.frequency,
          duration: '',
          notes: 'Synced from IPD Clinical Care workspace',
          status: nextStatus,
          prescribedBy: consultant,
          updatedAt: shouldRefreshTimestamp
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : existing?.updatedAt ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });

      nextStore[patientId] = [...mirroredRows, ...preservedRows];
    });

    writeSharedPrescriptionStore(nextStore);
  }, [medicationsByPatient, patientById]);

  React.useEffect(() => {
    setBillingByPatient((previous) => {
      const next = syncRoundMedicationBillingRows(
        previous,
        medicationsByPatient,
        patientById,
        encounterByPatientId
      );

      return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
    });
  }, [encounterByPatientId, medicationsByPatient, patientById]);

  React.useEffect(() => {
    if (clinicalPatients.length === 0) {
      setSelectedPatientId('');
      return;
    }

    if (mrnParam) {
      const matched = clinicalPatients.find((patient) => patient.mrn === mrnParam);
      if (matched) {
        setSelectedPatientId((currentPatientId) =>
          currentPatientId === matched.id ? currentPatientId : matched.id
        );
        return;
      }
    }

    setSelectedPatientId((currentPatientId) => {
      if (currentPatientId && clinicalPatients.some((patient) => patient.id === currentPatientId)) {
        return currentPatientId;
      }
      return clinicalPatients[0]?.id ?? '';
    });
  }, [clinicalPatients, mrnParam]);

  const selectedPatient = React.useMemo(
    () =>
      clinicalPatients.find((patient) => patient.id === selectedPatientId) ?? clinicalPatients[0] ?? null,
    [clinicalPatients, selectedPatientId]
  );

  if (!selectedPatient) {
    return (
      <PageTemplate
        title="Clinical Care"
        header={
          <IpdPatientTopBar
            moduleTitle="IPD Clinical Care"
            sectionLabel="IPD"
            pageLabel="Clinical Care Workspace"
            patient={null}
            fields={[]}
            patientOptions={[]}
            onSelectPatient={() => {}}
          />
        }
        currentPageTitle="Clinical Care Workspace"
      >
        <Card elevation={0} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No inpatient records available.
          </Typography>
        </Card>
      </PageTemplate>
    );
  }

  const replaceWorkspaceQuery = React.useCallback(
    (nextTab: ClinicalTab, nextMrn?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
      if (nextMrn) {
        params.set('mrn', nextMrn);
      } else {
        params.delete('mrn');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const withMrn = React.useCallback(
    (route: string) => {
      if (!selectedPatient.mrn) return route;
      const joiner = route.includes('?') ? '&' : '?';
      return `${route}${joiner}mrn=${encodeURIComponent(selectedPatient.mrn)}`;
    },
    [selectedPatient.mrn]
  );

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );

  const patientVitals = vitalsByPatient[selectedPatient.id] ?? [];
  const patientOrders = ordersByPatient[selectedPatient.id] ?? [];
  const patientBillingEntries = billingByPatient[selectedPatient.id] ?? [];
  const patientMeds = medicationsByPatient[selectedPatient.id] ?? [];
  const patientNotes = notesByPatient[selectedPatient.id] ?? [];
  const patientProcedures = proceduresByPatient[selectedPatient.id] ?? [];
  const patientChecklist = checklistsByPatient[selectedPatient.id] ?? [];
  const latestVitals = patientVitals[0];
  const pendingOrders = patientOrders.filter(
    (order) => order.status !== 'Completed' && order.status !== 'Cancelled'
  );
  const pendingBillingEntries = patientBillingEntries.filter((entry) => entry.status === 'Pending');
  const readyBillingEntries = patientBillingEntries.filter(
    (entry) => entry.status === 'Ready for Billing'
  );
  const cancelledBillingEntries = patientBillingEntries.filter(
    (entry) => entry.status === 'Cancelled'
  );
  const totalBillingAmount = patientBillingEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const checklistDoneCount = patientChecklist.filter((item) => item.done).length;
  const stableCount = clinicalPatients.filter((patient) => patient.status === 'Stable').length;
  const reviewCount = clinicalPatients.filter(
    (patient) => patient.status === 'Needs Review'
  ).length;
  const criticalCount = clinicalPatients.filter(
    (patient) => patient.status === 'Critical'
  ).length;

  React.useEffect(() => {
    const selectedOrders = ordersByPatient[selectedPatient.id] ?? [];
    const selectedMeds = medicationsByPatient[selectedPatient.id] ?? [];
    const selectedChecklist = checklistsByPatient[selectedPatient.id] ?? [];

    const pendingOrdersCount = selectedOrders.filter(
      (order) => order.status !== 'Completed' && order.status !== 'Cancelled'
    ).length;
    const pendingDiagnosticsCount = selectedOrders.filter((order) => {
      const orderType = order.type.toLowerCase();
      const isDiagnostic = orderType.includes('lab') || orderType.includes('imaging');
      return isDiagnostic && order.status !== 'Completed' && order.status !== 'Cancelled';
    }).length;
    const pendingMedicationsCount = selectedMeds.filter((row) => row.state !== 'Given').length;
    const followUpReady = selectedChecklist.find((item) => item.id === 'followup')?.done ?? false;

    syncIpdEncounterClinical(selectedPatient.id, {
      pendingOrders: pendingOrdersCount,
      pendingDiagnostics: pendingDiagnosticsCount,
      pendingMedications: pendingMedicationsCount,
      clinicalStatus: mapPatientStatusToEncounterStatus(selectedPatient.status),
      diagnosis: selectedPatient.diagnosis,
    });
    syncIpdEncounterDischargeChecks(selectedPatient.id, { followUpReady });
  }, [
    checklistsByPatient,
    medicationsByPatient,
    ordersByPatient,
    selectedPatient.diagnosis,
    selectedPatient.id,
    selectedPatient.status,
  ]);

  const flowButtons = [
    { label: 'Admissions', route: '/ipd/admissions' },
    { label: 'Bed Board', route: '/ipd/beds?tab=inpatient-list' },
    { label: 'Clinical Orders', route: '/clinical/orders' },
    { label: 'Prescriptions', route: '/clinical/prescriptions' },
    { label: 'Discharge', route: '/ipd/discharge?tab=pending' },
  ];

  const tabItems = CLINICAL_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'orders'
        ? pendingOrders.length
        : tab.id === 'billing'
        ? pendingBillingEntries.length
        : undefined,
  }));

  const openRoute = (route: string, permissionRoute: string) => {
    if (!canNavigate(permissionRoute)) return;
    router.push(withMrn(route));
  };

  const switchTab = React.useCallback(
    (nextTab: ClinicalTab) => {
      setActiveTab(nextTab);
      replaceWorkspaceQuery(nextTab, selectedPatient.mrn);
    },
    [replaceWorkspaceQuery, selectedPatient.mrn]
  );

  const onTabChange = (_: React.SyntheticEvent, nextTab: string) => {
    if (!isClinicalTab(nextTab)) return;
    switchTab(nextTab);
  };

  const onSelectPatient = (patientId: string) => {
    const patient = clinicalPatients.find((item) => item.id === patientId);
    if (!patient) return;
    setSelectedPatientId(patient.id);
    replaceWorkspaceQuery(activeTab, patient.mrn);
  };

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    return clinicalPatients.map((patient) => {
      const status =
        patient.status === 'Critical'
          ? 'Critical'
          : patient.status === 'Needs Review'
          ? 'Discharge Due'
          : patient.ward.toLowerCase().includes('icu')
          ? 'ICU'
          : 'Admitted';
      const tags = ['Admitted'];
      if (patient.status === 'Needs Review') tags.push('Discharge Due');
      if (patient.status === 'Critical') tags.push('Critical');
      if (patient.ward.toLowerCase().includes('icu') || patient.bed.toLowerCase().includes('icu')) tags.push('ICU');

      return {
        patientId: patient.id,
        name: patient.name,
        mrn: patient.mrn,
        ageGender: `${patient.age} / ${patient.gender}`,
        ward: patient.ward,
        bed: patient.bed,
        consultant: patient.consultant,
        diagnosis: patient.diagnosis,
        status,
        statusTone:
          status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : status === 'ICU' ? 'info' : 'success',
        insurance: INSURANCE_BY_PATIENT_ID[patient.id] ?? '--',
        totalBill: TOTAL_BILL_BY_PATIENT_ID[patient.id] ?? 0,
        tags,
      };
    });
  }, [clinicalPatients]);

  const selectedTopBarPatient = React.useMemo(
    () => topBarPatientOptions.find((row) => row.patientId === selectedPatient.id) ?? null,
    [selectedPatient.id, topBarPatientOptions]
  );

  const topBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    const status =
      selectedPatient.status === 'Critical'
        ? 'Critical'
        : selectedPatient.status === 'Needs Review'
        ? 'Discharge Due'
        : selectedPatient.ward.toLowerCase().includes('icu')
        ? 'ICU'
        : 'Admitted';

    return [
      { id: 'age-sex', label: 'Age / Sex', value: `${selectedPatient.age} / ${selectedPatient.gender}` },
      { id: 'ward-bed', label: 'Ward / Bed', value: `${selectedPatient.ward} · ${selectedPatient.bed}` },
      { id: 'admitted', label: 'Admitted', value: selectedPatient.admissionDate || '--' },
      { id: 'los', label: 'LOS', value: `Day ${selectedPatient.dayOfStay}` },
      { id: 'diagnosis', label: 'Diagnosis', value: selectedPatient.diagnosis || '--' },
      { id: 'consultant', label: 'Consultant', value: selectedPatient.consultant || '--' },
      { id: 'blood-group', label: 'Blood Group', value: selectedPatient.bloodGroup || '--' },
      { id: 'allergies', label: 'Allergies', value: selectedPatient.allergy || '--', tone: selectedPatient.allergy === 'No known allergies' ? 'success' : 'warning' },
      { id: 'insurance', label: 'Insurance', value: INSURANCE_BY_PATIENT_ID[selectedPatient.id] ?? '--', tone: 'info' },
      { id: 'status', label: 'Status', value: status, tone: status === 'Critical' ? 'error' : status === 'Discharge Due' ? 'warning' : 'success' },
      {
        id: 'total-bill',
        label: 'Total Bill',
        value: INR_CURRENCY.format(TOTAL_BILL_BY_PATIENT_ID[selectedPatient.id] ?? 0),
        tone: 'info',
      },
    ];
  }, [selectedPatient]);

  const topBarHeader = (
    <IpdPatientTopBar
      moduleTitle="IPD Clinical Care"
      sectionLabel="IPD"
      pageLabel="Clinical Care"
      patient={selectedTopBarPatient}
      fields={topBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onSelectPatient}
    />
  );

  const showSnack = React.useCallback((message: string, severity: SnackSeverity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const appendOrderWithAutoBilling = React.useCallback(
    (payload: {
      type: string;
      description: string;
      frequency: string;
      priority: OrderPriority;
      orderedBy: string;
    }) => {
      const now = new Date();
      const stamp = now.toLocaleString();
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const billingId = `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const service = resolveBillingService(payload.type, payload.description);
      const encounter = encounterByPatientId[selectedPatient.id];

      const newOrder: ClinicalOrder = {
        id: orderId,
        type: payload.type,
        description: payload.description,
        frequency: payload.frequency,
        orderedBy: payload.orderedBy,
        time: stamp,
        priority: payload.priority,
        status: 'Pending',
        billingId,
        billingCategory: service.category,
        statusUpdatedAt: stamp,
        statusUpdatedBy: payload.orderedBy,
      };

      const newBillingEntry: BillingEntry = {
        id: billingId,
        orderId: orderId,
        patientId: selectedPatient.id,
        patientMrn: selectedPatient.mrn,
        patientName: selectedPatient.name,
        admissionId: encounter?.admissionId ?? `adm-${selectedPatient.id}`,
        encounterId: encounter?.encounterId ?? `enc-${selectedPatient.id}`,
        category: service.category,
        serviceCode: service.code,
        serviceName: service.label,
        quantity: 1,
        unitPrice: service.price,
        amount: service.price,
        currency: 'INR',
        status: 'Pending',
        orderedBy: payload.orderedBy,
        orderedAt: stamp,
        statusUpdatedAt: stamp,
        statusUpdatedBy: payload.orderedBy,
      };

      setOrdersByPatient((previous) => ({
        ...previous,
        [selectedPatient.id]: [newOrder, ...(previous[selectedPatient.id] ?? [])],
      }));
      setBillingByPatient((previous) => ({
        ...previous,
        [selectedPatient.id]: [newBillingEntry, ...(previous[selectedPatient.id] ?? [])],
      }));

      return { newOrder, newBillingEntry };
    },
    [encounterByPatientId, selectedPatient.id, selectedPatient.mrn, selectedPatient.name]
  );

  const updateSelectedOrderStatus = React.useCallback(
    (orderId: string, status: OrderStatus) => {
      const statusStamp = new Date().toLocaleString();
      setOrdersByPatient((previous) => ({
        ...previous,
        [selectedPatient.id]: (previous[selectedPatient.id] ?? []).map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                statusUpdatedAt: statusStamp,
                statusUpdatedBy: selectedPatient.consultant,
              }
            : order
        ),
      }));
      setBillingByPatient((previous) => ({
        ...previous,
        [selectedPatient.id]: (previous[selectedPatient.id] ?? []).map((entry) =>
          entry.orderId === orderId
            ? {
                ...entry,
                status: billingStatusFromOrderStatus(status),
                statusUpdatedAt: statusStamp,
                statusUpdatedBy: selectedPatient.consultant,
              }
            : entry
        ),
      }));
    },
    [selectedPatient.consultant, selectedPatient.id]
  );

  const openVitalsDialog = () => {
    setVitalsDialogError('');
    setVitalsDraft({
      systolic: latestVitals?.bp?.split('/')[0] ?? '',
      diastolic: latestVitals?.bp?.split('/')[1] ?? '',
      hr: latestVitals ? String(latestVitals.hr) : '',
      spo2: latestVitals ? String(latestVitals.spo2) : '',
      temp: latestVitals ? String(latestVitals.temp) : '',
      rr: latestVitals ? String(latestVitals.rr) : '',
      bloodSugar: latestVitals ? String(latestVitals.bloodSugar) : '',
      pain: latestVitals ? String(latestVitals.pain) : '',
      notes: '',
    });
    setVitalsDialogOpen(true);
  };

  const saveVitalsFromDialog = () => {
    if (!vitalsDraft.systolic.trim() || !vitalsDraft.diastolic.trim()) {
      setVitalsDialogError('Systolic and diastolic BP are required.');
      return;
    }

    const nextRow: VitalReading = {
      time: new Date().toLocaleString(),
      bp: `${vitalsDraft.systolic.trim()}/${vitalsDraft.diastolic.trim()}`,
      hr: Number(vitalsDraft.hr) || 0,
      spo2: Number(vitalsDraft.spo2) || 0,
      temp: Number(vitalsDraft.temp) || 0,
      rr: Number(vitalsDraft.rr) || 0,
      bloodSugar: Number(vitalsDraft.bloodSugar) || 0,
      pain: Number(vitalsDraft.pain) || 0,
    };

    setVitalsByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: [nextRow, ...(previous[selectedPatient.id] ?? [])],
    }));
    setVitalsDialogOpen(false);
    showSnack('Vitals recorded successfully.', 'success');
    switchTab('vitals');
  };

  const openOrderDialog = () => {
    setOrderDialogError('');
    setOrderDraft({
      type: 'Lab',
      priority: 'Routine',
      description: '',
      frequency: 'Once',
      duration: '',
      notes: '',
    });
    setOrderDialogOpen(true);
  };

  const submitOrderFromDialog = () => {
    if (!orderDraft.description.trim()) {
      setOrderDialogError('Order description is required.');
      return;
    }

    const description = orderDraft.notes.trim()
      ? `${orderDraft.description.trim()} | Note: ${orderDraft.notes.trim()}`
      : orderDraft.description.trim();
    const frequency = orderDraft.duration.trim()
      ? `${orderDraft.frequency.trim() || 'Once'} | ${orderDraft.duration.trim()}`
      : orderDraft.frequency.trim() || 'Once';

    const { newOrder, newBillingEntry } = appendOrderWithAutoBilling({
      type: orderDraft.type,
      description,
      frequency,
      priority: orderDraft.priority,
      orderedBy: selectedPatient.consultant,
    });

    setOrderDialogOpen(false);
    showSnack(
      `Order placed (${newOrder.id}). Billing ${newBillingEntry.id} generated for ${formatBillingAmount(newBillingEntry.amount)}.`,
      'success'
    );
    switchTab('orders');
  };

  const openNoteDialog = () => {
    setNoteDialogError('');
    setNoteDraft({
      type: 'SOAP Note',
      severity: 'Routine',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    });
    setNoteDialogOpen(true);
  };

  const saveNoteFromDialog = () => {
    if (
      !noteDraft.subjective.trim() &&
      !noteDraft.objective.trim() &&
      !noteDraft.assessment.trim() &&
      !noteDraft.plan.trim()
    ) {
      setNoteDialogError('At least one note field is required.');
      return;
    }

    const newNote: ProgressNote = {
      id: `note-${Date.now()}`,
      author: selectedPatient.consultant,
      role: 'Physician',
      time: new Date().toLocaleString(),
      type: noteDraft.type,
      severity: noteDraft.severity,
      subjective: noteDraft.subjective.trim() || '--',
      objective: noteDraft.objective.trim() || '--',
      assessment: noteDraft.assessment.trim() || '--',
      plan: noteDraft.plan.trim() || '--',
    };

    setNotesByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: [newNote, ...(previous[selectedPatient.id] ?? [])],
    }));
    setNoteDialogOpen(false);
    showSnack('Note saved successfully.', 'success');
    switchTab('notes');
  };

  const openMedicationDialog = () => {
    setMedDialogError('');
    setMedDraft({
      medication: '',
      dose: '',
      route: 'Oral',
      frequency: 'OD',
      duration: '',
      notes: '',
    });
    setMedDialogOpen(true);
  };

  const addMedicationFromDialog = () => {
    if (!medDraft.medication.trim()) {
      setMedDialogError('Medication name is required.');
      return;
    }

    const newMedication: MedicationRow = {
      id: `med-${Date.now()}`,
      medication: medDraft.medication.trim(),
      dose: medDraft.dose.trim() || '--',
      route: medDraft.route.trim() || 'Oral',
      frequency: medDraft.duration.trim()
        ? `${medDraft.frequency.trim() || 'OD'} | ${medDraft.duration.trim()}`
        : medDraft.frequency.trim() || 'OD',
      state: 'Due',
      given: { morning: false, afternoon: false, night: false },
    };

    setMedicationsByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: [...(previous[selectedPatient.id] ?? []), newMedication],
    }));
    setMedDialogOpen(false);
    showSnack(`${newMedication.medication} added to medication list.`, 'success');
    switchTab('medications');
  };

  const removeMedication = (rowId: string) => {
    setMedicationsByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: (previous[selectedPatient.id] ?? []).filter((row) => row.id !== rowId),
    }));
    showSnack('Medication removed.', 'warning');
  };

  const openProcedureDialog = (type: 'Procedure' | 'Consult' = 'Procedure') => {
    setProcedureDialogError('');
    setProcedureDraft({
      type,
      title: '',
      details: '',
      status: type === 'Consult' ? 'Pending' : 'Scheduled',
    });
    setProcedureDialogOpen(true);
  };

  const saveProcedureFromDialog = () => {
    if (!procedureDraft.title.trim()) {
      setProcedureDialogError('Title is required.');
      return;
    }

    const nextProcedure: ProcedureRow = {
      id: `proc-${Date.now()}`,
      type: procedureDraft.type,
      title: procedureDraft.title.trim(),
      details: procedureDraft.details.trim() || '--',
      status: procedureDraft.status,
    };

    setProceduresByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: [nextProcedure, ...(previous[selectedPatient.id] ?? [])],
    }));
    setProcedureDialogOpen(false);
    showSnack(`${nextProcedure.type} saved successfully.`, 'success');
    switchTab('procedures');
  };

  const markOrderCompleted = (orderId: string) => {
    updateSelectedOrderStatus(orderId, 'Completed');
    showSnack('Order marked as completed. Billing updated to Ready for Billing.', 'success');
  };

  const cancelOrder = (orderId: string) => {
    updateSelectedOrderStatus(orderId, 'Cancelled');
    showSnack('Order cancelled. Linked billing entry was cancelled.', 'warning');
  };

  const placeQuickOrder = () => {
    if (!quickOrder.description.trim()) {
      setQuickOrderError('Order description is required.');
      return;
    }
    setQuickOrderError('');

    const frequency = quickOrder.duration.trim()
      ? `${quickOrder.frequency.trim() || 'Once'} | ${quickOrder.duration.trim()}`
      : quickOrder.frequency.trim() || 'Once';

    const { newOrder, newBillingEntry } = appendOrderWithAutoBilling({
      type: quickOrder.type,
      description: quickOrder.description.trim(),
      frequency,
      priority: quickOrder.priority,
      orderedBy: selectedPatient.consultant,
    });

    setQuickOrder((previous) => ({ ...previous, description: '', duration: '' }));
    showSnack(
      `Quick order placed (${newOrder.id}). Billing ${newBillingEntry.id} generated for ${formatBillingAmount(newBillingEntry.amount)}.`,
      'success'
    );
    if (activeTab !== 'orders') {
      setActiveTab('orders');
      replaceWorkspaceQuery('orders', selectedPatient.mrn);
    }
  };

  const toggleMedicationSlot = (rowId: string, slot: MedicationSlot) => {
    setMedicationsByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: (previous[selectedPatient.id] ?? []).map((row) => {
        if (row.id !== rowId) return row;
        const nextGiven = { ...row.given, [slot]: !row.given[slot] };
        const allGiven = nextGiven.morning && nextGiven.afternoon && nextGiven.night;
        return {
          ...row,
          given: nextGiven,
          state: allGiven ? 'Given' : nextGiven.morning || nextGiven.afternoon || nextGiven.night ? 'Active' : 'Due',
        };
      }),
    }));
  };

  const saveQuickNote = () => {
    if (
      !quickNote.subjective.trim() &&
      !quickNote.objective.trim() &&
      !quickNote.assessment.trim() &&
      !quickNote.plan.trim()
    ) {
      setQuickNoteError('At least one note field is required.');
      return;
    }

    setQuickNoteError('');
    const newNote: ProgressNote = {
      id: `note-${Date.now()}`,
      author: selectedPatient.consultant,
      role: 'Physician',
      time: new Date().toLocaleString(),
      type: quickNote.type,
      severity: quickNote.severity,
      subjective: quickNote.subjective.trim() || '--',
      objective: quickNote.objective.trim() || '--',
      assessment: quickNote.assessment.trim() || '--',
      plan: quickNote.plan.trim() || '--',
    };

    setNotesByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: [newNote, ...(previous[selectedPatient.id] ?? [])],
    }));

    setQuickNote({
      type: quickNote.type,
      severity: quickNote.severity,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    });

    if (activeTab !== 'notes') {
      setActiveTab('notes');
      replaceWorkspaceQuery('notes', selectedPatient.mrn);
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklistsByPatient((previous) => ({
      ...previous,
      [selectedPatient.id]: (previous[selectedPatient.id] ?? []).map((item) =>
        item.id === itemId
          ? {
              ...item,
              done: !item.done,
              updatedBy: !item.done
                ? `Updated ${new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : undefined,
            }
          : item
      ),
    }));
  };

  const sectionCardSx = {
    p: 0,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.14),
    borderRadius: 2.5,
    boxShadow: 'none',
    overflow: 'hidden',
  };

  const clinicalDialogTitleSx = {
    px: 2.5,
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  };

  const clinicalDialogContentSx = {
    ...ipdFormStylesSx,
    px: 2.5,
    py: 2,
    pt: 2.3,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
    '& textarea': {
      lineHeight: 1.4,
    },
    '& .MuiInputBase-input::placeholder': {
      color: alpha(theme.palette.text.primary, 0.5),
      opacity: 1,
    },
  };

  const clinicalDialogActionsSx = {
    px: 2.5,
    py: 1.2,
    borderTop: '1px solid',
    borderColor: 'divider',
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  };

  const clinicalDialogButtonSx = {
    minWidth: 0,
    px: 1.6,
    py: 0.43,
    borderRadius: 1.3,
    // lineHeight: 1.2,
  };

  const clinicalPrimaryButtonSx = {
    ...clinicalDialogButtonSx,
    boxShadow: 'none',
    background: 'linear-gradient(90deg, #4f46e5 0%, #4338ca 100%)',
    '&:hover': {
      background: 'linear-gradient(90deg, #4338ca 0%, #3730a3 100%)',
    },
  };

  const clinicalLabelSx = {
    display: 'block',
    mb: 0.5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.35,
    color: alpha(theme.palette.text.primary, 0.78),
    textTransform: 'uppercase',
  };

  const clinicalInlineFormSx = {
    ...ipdFormStylesSx,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.3,
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
    '& .MuiInputBase-input::placeholder': {
      color: alpha(theme.palette.text.primary, 0.5),
      opacity: 1,
    },
  };

  const renderClinicalDialogTitle = (
    label: string,
    icon: React.ReactNode,
    onClose: () => void,
    tone: 'primary' | 'warning' | 'success' | 'info' = 'primary'
  ) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={0.8} alignItems="center">
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: alpha(theme.palette[tone].main, 0.16),
            color: `${tone}.main`,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>
      <IconButton
        size="small"
        onClick={onClose}
        aria-label="Close dialog"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          p: 0.45,
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  return (
    <PageTemplate
      title="Clinical Care"
      header={topBarHeader}
    >
      <Stack spacing={2}>
        <Stack spacing={0}>
          <WorkspaceHeaderCard
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: '10px 10px 0 0',
              borderBottom: 'none',
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
              spacing={1.25}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                  Clinical Care Workspace
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Doctor rounds, nursing execution, vitals, orders, medication, and discharge handoff.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!canNavigate('/ipd/beds')}
                  onClick={() => openRoute('/ipd/beds?tab=inpatient-list', '/ipd/beds')}
                >
                  All Patients
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!canNavigate('/appointments/visit')}
                  onClick={openVitalsDialog}
                >
                  Record Vitals
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!canNavigate('/clinical/orders')}
                  onClick={openOrderDialog}
                >
                  Write Order
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={!canNavigate('/ipd/discharge')}
                  onClick={() => openRoute('/ipd/discharge?tab=pending', '/ipd/discharge')}
                >
                  Start Discharge
                </Button>
              </Stack>
            </Stack>
          </WorkspaceHeaderCard>

          <Box
            sx={{
              position: 'sticky',
              top: IPD_PATIENT_TOP_BAR_STICKY_OFFSET,
              zIndex: 5,
              backgroundColor: alpha(theme.palette.background.default, 0.92),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Card
              elevation={0}
              sx={{
                p: 0,
                borderRadius: '0 0 10px 10px',
                border: '1px solid',
                borderTop: 'none',
                borderColor: alpha(theme.palette.primary.main, 0.16),
              }}
            >
              <Box sx={{ px: 0.75, py: 0.5 }}>
                <Tabs
                  value={activeTab}
                  onChange={onTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-flexContainer': { gap: 0.5 },
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 40,
                      px: 2,
                      borderRadius: 1.5,
                      color: 'text.secondary',
                    },
                    '& .MuiTab-root.Mui-selected': {
                      color: 'common.white',
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  {tabItems.map((tab) => (
                    <Tab
                      key={tab.id}
                      value={tab.id}
                      label={tab.count && tab.count > 0 ? `${tab.label} (${tab.count})` : tab.label}
                    />
                  ))}
                </Tabs>
              </Box>
            </Card>
          </Box>
        </Stack>

        <Box sx={{ pt: 0.5 }}>
            {activeTab === 'rounds' ? (
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} lg={7}>
                  <Stack spacing={2}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: alpha(theme.palette.info.main, 0.05),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MonitorHeartIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Today&apos;s Vitals Snapshot
                            </Typography>
                          </Stack>
                          <Button size="small" variant="text" onClick={() => switchTab('vitals')}>
                            Full Vitals
                          </Button>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Grid container spacing={1.2}>
                          {[
                            {
                              key: 'bp',
                              label: 'Blood Pressure',
                              value: latestVitals ? latestVitals.bp : '--',
                              unit: 'mmHg',
                              tone: latestVitals ? getVitalTone('bp', latestVitals.bp) : 'warning',
                            },
                            {
                              key: 'hr',
                              label: 'Heart Rate',
                              value: latestVitals ? latestVitals.hr : '--',
                              unit: 'bpm',
                              tone: latestVitals ? getVitalTone('hr', latestVitals.hr) : 'warning',
                            },
                            {
                              key: 'spo2',
                              label: 'SpO2',
                              value: latestVitals ? latestVitals.spo2 : '--',
                              unit: '%',
                              tone: latestVitals ? getVitalTone('spo2', latestVitals.spo2) : 'warning',
                            },
                            {
                              key: 'temp',
                              label: 'Temperature',
                              value: latestVitals ? latestVitals.temp : '--',
                              unit: 'F',
                              tone: latestVitals ? getVitalTone('temp', latestVitals.temp) : 'warning',
                            },
                          ].map((vital) => (
                            <Grid xs={12} sm={6} key={vital.key}>
                              <Card
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor:
                                    vital.tone === 'error'
                                      ? alpha(theme.palette.error.main, 0.45)
                                      : vital.tone === 'warning'
                                      ? alpha(theme.palette.warning.main, 0.45)
                                      : alpha(theme.palette.success.main, 0.45),
                                  boxShadow: 'none',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  {vital.label}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                  {vital.value}{' '}
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    {vital.unit}
                                  </Typography>
                                </Typography>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Card>

                    <Card elevation={0} sx={sectionCardSx}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <NoteAltIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Round Notes
                            </Typography>
                          </Stack>
                          <Button size="small" variant="contained" onClick={openNoteDialog}>
                            + Add Round
                          </Button>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1.2}>
                          {patientNotes.slice(0, 3).map((note) => (
                            <Card
                              key={note.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {note.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {noteMetaLine(note)}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {note.time}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ mt: 0.75 }}>
                                {note.assessment}
                              </Typography>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    </Card>
                  </Stack>
                </Grid>

                <Grid xs={12} lg={5}>
                  <Stack spacing={2}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalHospitalIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Clinical Summary
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={0.9}>
                          {[
                            ['Diagnosis', selectedPatient.diagnosis],
                            ['Consultant', selectedPatient.consultant],
                            ['Blood Group', selectedPatient.bloodGroup],
                            ['Allergy', selectedPatient.allergy],
                            ['Ward / Bed', `${selectedPatient.ward} / ${selectedPatient.bed}`],
                            ['Day of Stay', `Day ${selectedPatient.dayOfStay}`],
                          ].map(([label, value]) => (
                            <Stack key={label} direction="row" justifyContent="space-between" spacing={1}>
                              <Typography variant="caption" color="text.secondary">
                                {label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
                                {value}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Card>

                    <Card elevation={0} sx={sectionCardSx}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ChecklistIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Pending Actions
                            </Typography>
                          </Stack>
                          <Button size="small" variant="text" onClick={() => switchTab('orders')}>
                            Orders
                          </Button>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          {pendingOrders.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No pending actions.
                            </Typography>
                          ) : (
                            pendingOrders.slice(0, 4).map((order) => (
                              <Stack
                                key={order.id}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  px: 1.2,
                                  py: 0.9,
                                  borderRadius: 1.4,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <ScienceIcon fontSize="small" color="primary" />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                    {order.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {order.type} | {order.time}
                                  </Typography>
                                </Box>
                                <Chip size="small" color={orderStatusChipColor(order.status)} label={order.status} />
                              </Stack>
                            ))
                          )}
                        </Stack>
                      </Box>
                    </Card>

                    <Card elevation={0} sx={sectionCardSx}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          IPD Journey
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1.2}>
                          {PATIENT_TIMELINE.map((step, index) => (
                            <Stack key={step.id} direction="row" spacing={1}>
                              <Stack alignItems="center" sx={{ width: 16, pt: 0.4 }}>
                                <Box
                                  sx={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: '50%',
                                    bgcolor:
                                      index === 2
                                        ? 'primary.main'
                                        : index < 2
                                        ? 'success.main'
                                        : 'divider',
                                  }}
                                />
                                {index < PATIENT_TIMELINE.length - 1 ? (
                                  <Box sx={{ width: 1, flex: 1, bgcolor: 'divider', minHeight: 24, mt: 0.3 }} />
                                ) : null}
                              </Stack>
                              <Box sx={{ pb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {step.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {step.subtitle}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                  {step.note}
                                </Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            ) : null}

            {activeTab === 'nursing' ? (
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} lg={7}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <NoteAltIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Nursing Assessment and Notes
                          </Typography>
                        </Stack>
                        <Button size="small" variant="contained" onClick={openNoteDialog}>
                          + Add Note
                        </Button>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.1}>
                        {patientNotes.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No nursing notes available.
                          </Typography>
                        ) : (
                          patientNotes.map((note) => (
                            <Card
                              key={note.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {note.author}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {note.time}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                                {note.objective}
                              </Typography>
                            </Card>
                          ))
                        )}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                <Grid xs={12} lg={5}>
                  <Stack spacing={2}>
                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AssignmentTurnedInIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Nursing Checklist
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {checklistDoneCount}/{patientChecklist.length} complete
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={0.9}>
                          {patientChecklist.map((item) => (
                            <Stack
                              key={item.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{
                                px: 1,
                                py: 0.9,
                                borderRadius: 1.3,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Button
                                size="small"
                                variant={item.done ? 'contained' : 'outlined'}
                                onClick={() => toggleChecklistItem(item.id)}
                                sx={{ minWidth: 36, px: 0.8 }}
                              >
                                {item.done ? 'Done' : 'Todo'}
                              </Button>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    textDecoration: item.done ? 'line-through' : 'none',
                                  }}
                                >
                                  {item.label}
                                </Typography>
                                {item.updatedBy ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {item.updatedBy}
                                  </Typography>
                                ) : null}
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Card>

                    <Card elevation={0} sx={sectionCardSx}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WarningAmberIcon fontSize="small" color="warning" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Active Care Alerts
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Chip size="small" color="error" label={`Allergy: ${selectedPatient.allergy}`} sx={{ width: 'fit-content' }} />
                          <Chip size="small" color="warning" label="Fall risk monitor active" sx={{ width: 'fit-content' }} />
                          <Chip size="small" color="info" label="Fluid balance charting every shift" sx={{ width: 'fit-content' }} />
                        </Stack>
                      </Box>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            ) : null}

            {activeTab === 'vitals' ? (
              <Stack spacing={2}>
                <Grid container spacing={1.2}>
                  {[
                    {
                      label: 'Blood Pressure',
                      value: latestVitals ? latestVitals.bp : '--',
                      unit: 'mmHg',
                      tone: latestVitals ? getVitalTone('bp', latestVitals.bp) : 'warning',
                    },
                    {
                      label: 'Heart Rate',
                      value: latestVitals ? latestVitals.hr : '--',
                      unit: 'bpm',
                      tone: latestVitals ? getVitalTone('hr', latestVitals.hr) : 'warning',
                    },
                    {
                      label: 'SpO2',
                      value: latestVitals ? latestVitals.spo2 : '--',
                      unit: '%',
                      tone: latestVitals ? getVitalTone('spo2', latestVitals.spo2) : 'warning',
                    },
                    {
                      label: 'Temperature',
                      value: latestVitals ? latestVitals.temp : '--',
                      unit: 'F',
                      tone: latestVitals ? getVitalTone('temp', latestVitals.temp) : 'warning',
                    },
                  ].map((vital) => (
                    <Grid xs={12} sm={6} md={3} key={vital.label}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor:
                            vital.tone === 'error'
                              ? alpha(theme.palette.error.main, 0.45)
                              : vital.tone === 'warning'
                              ? alpha(theme.palette.warning.main, 0.45)
                              : alpha(theme.palette.success.main, 0.45),
                          boxShadow: 'none',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {vital.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {vital.value}{' '}
                          <Typography component="span" variant="caption" color="text.secondary">
                            {vital.unit}
                          </Typography>
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card elevation={0} sx={{ ...sectionCardSx, p: 0 }}>
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Vitals History
                      </Typography>
                      <Button size="small" variant="contained" onClick={openVitalsDialog}>
                        + Record Vitals
                      </Button>
                    </Stack>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>BP</TableCell>
                          <TableCell>HR</TableCell>
                          <TableCell>SpO2</TableCell>
                          <TableCell>Temp</TableCell>
                          <TableCell>RR</TableCell>
                          <TableCell>Blood Sugar</TableCell>
                          <TableCell>Pain</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientVitals.map((row) => (
                          <TableRow key={row.time}>
                            <TableCell>{row.time}</TableCell>
                            <TableCell>{row.bp}</TableCell>
                            <TableCell>{row.hr}</TableCell>
                            <TableCell>{row.spo2}%</TableCell>
                            <TableCell>{row.temp}</TableCell>
                            <TableCell>{row.rr}</TableCell>
                            <TableCell>{row.bloodSugar}</TableCell>
                            <TableCell>{row.pain}/10</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Stack>
            ) : null}

            {activeTab === 'orders' ? (
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} lg={7}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ScienceIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Active Orders ({patientOrders.length})
                          </Typography>
                        </Stack>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={openOrderDialog}
                        >
                          + New Order
                        </Button>
                      </Stack>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {patientOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.type}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {order.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.orderedBy} | {order.time}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Billing: {order.billingId ?? '--'} · {order.billingCategory ?? resolveBillingCategory(order.type)}
                                </Typography>
                              </TableCell>
                              <TableCell>{order.frequency}</TableCell>
                              <TableCell>
                                <Chip size="small" color={priorityChipColor(order.priority)} label={order.priority} />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" color={orderStatusChipColor(order.status)} label={order.status} />
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                                    onClick={() => markOrderCompleted(order.id)}
                                  >
                                    Mark Done
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="text"
                                    disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                                    onClick={() => cancelOrder(order.id)}
                                  >
                                    Cancel
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>

                <Grid xs={12} lg={5}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box sx={{ p: 2, ...clinicalInlineFormSx }}>
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1.2,
                              display: 'grid',
                              placeItems: 'center',
                              color: 'warning.main',
                              backgroundColor: alpha(theme.palette.warning.main, 0.16),
                            }}
                          >
                            <ScienceIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            Quick Order
                          </Typography>
                        </Stack>

                        <Grid container spacing={1.1} sx={{ mt: 0.1 }}>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Type
                            </Typography>
                            <TextField
                              select
                              size="small"
                              value={quickOrder.type}
                              onChange={(event) =>
                                setQuickOrder((previous) => ({ ...previous, type: event.target.value }))
                              }
                              fullWidth
                            >
                              {ORDER_TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Priority
                            </Typography>
                            <TextField
                              select
                              size="small"
                              value={quickOrder.priority}
                              onChange={(event) =>
                                setQuickOrder((previous) => ({
                                  ...previous,
                                  priority: event.target.value as OrderPriority,
                                }))
                              }
                              fullWidth
                            >
                              {(['Routine', 'Urgent', 'STAT'] as OrderPriority[]).map((priority) => (
                                <MenuItem key={priority} value={priority}>
                                  {priority}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Box>
                          <Typography variant="caption" sx={clinicalLabelSx}>
                            Order
                          </Typography>
                          <TextField
                            size="small"
                            placeholder="Describe the order..."
                            value={quickOrder.description}
                            onChange={(event) =>
                              setQuickOrder((previous) => ({
                                ...previous,
                                description: event.target.value,
                              }))
                            }
                            fullWidth
                            error={Boolean(quickOrderError)}
                            helperText={quickOrderError || ' '}
                          />
                        </Box>

                        <Grid container spacing={1.1}>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Frequency
                            </Typography>
                            <TextField
                              size="small"
                              placeholder="e.g. Once, Q8H"
                              value={quickOrder.frequency}
                              onChange={(event) =>
                                setQuickOrder((previous) => ({
                                  ...previous,
                                  frequency: event.target.value,
                                }))
                              }
                              fullWidth
                            />
                          </Grid>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Duration
                            </Typography>
                            <TextField
                              size="small"
                              placeholder="e.g. 3 days"
                              value={quickOrder.duration}
                              onChange={(event) =>
                                setQuickOrder((previous) => ({
                                  ...previous,
                                  duration: event.target.value,
                                }))
                              }
                              fullWidth
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={placeQuickOrder}
                            startIcon={<ScienceIcon sx={{ fontSize: 14 }} />}
                            sx={clinicalPrimaryButtonSx}
                          >
                            Place Order
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {activeTab === 'billing' ? (
              <Stack spacing={2}>
                <Grid container spacing={1.2}>
                  {[
                    {
                      id: 'total-billing',
                      label: 'Total Charges',
                      value: formatBillingAmount(totalBillingAmount),
                      tone: 'primary.main',
                    },
                    {
                      id: 'pending-billing',
                      label: 'Pending Bills',
                      value: `${pendingBillingEntries.length}`,
                      tone: 'warning.main',
                    },
                    {
                      id: 'ready-billing',
                      label: 'Ready for Billing',
                      value: `${readyBillingEntries.length}`,
                      tone: 'success.main',
                    },
                    {
                      id: 'cancelled-billing',
                      label: 'Cancelled Bills',
                      value: `${cancelledBillingEntries.length}`,
                      tone: 'error.main',
                    },
                  ].map((item) => (
                    <Grid xs={12} sm={6} md={3} key={item.id}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 1.4,
                          borderRadius: 1.8,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: item.tone }}>
                          {item.value}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card elevation={0} sx={sectionCardSx}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AssignmentTurnedInIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Order-linked Billing Ledger ({patientBillingEntries.length})
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!canNavigate('/ipd/charges')}
                        onClick={() => openRoute('/ipd/charges?tab=charges', '/ipd/charges')}
                      >
                        Open Charge / Drug
                      </Button>
                    </Stack>
                  </Box>

                  {patientBillingEntries.length === 0 ? (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No billing entries yet. Create an order to auto-generate billing.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableRow>
                            <TableCell>Billing ID</TableCell>
                            <TableCell>Order Link</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Admission / Encounter</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Audit</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {patientBillingEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell sx={{ fontWeight: 700 }}>{entry.id}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.orderId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  MRN: {entry.patientMrn}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.serviceName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {entry.serviceCode}
                                </Typography>
                              </TableCell>
                              <TableCell>{entry.category}</TableCell>
                              <TableCell>
                                <Typography variant="body2">{entry.admissionId}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {entry.encounterId}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{formatBillingAmount(entry.amount)}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={billingStatusChipColor(entry.status)}
                                  label={entry.status}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                  Ordered by: {entry.orderedBy}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                  Ordered at: {entry.orderedAt}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                  Updated by: {entry.statusUpdatedBy}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                  Updated at: {entry.statusUpdatedAt}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Card>
              </Stack>
            ) : null}

            {activeTab === 'medications' ? (
              <Card elevation={0} sx={sectionCardSx}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MedicationIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Medication Administration Record
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={openMedicationDialog}>
                        + Add Medication
                      </Button>
                    
                    </Stack>
                  </Stack>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableRow>
                        <TableCell>Medication</TableCell>
                        <TableCell>Dose / Route</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Morning</TableCell>
                        <TableCell>Afternoon</TableCell>
                        <TableCell>Night</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patientMeds.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{row.medication}</TableCell>
                          <TableCell>
                            {row.dose} / {row.route}
                          </TableCell>
                          <TableCell>{row.frequency}</TableCell>
                          {(['morning', 'afternoon', 'night'] as MedicationSlot[]).map((slot) => (
                            <TableCell key={`${row.id}-${slot}`}>
                              <Button
                                size="small"
                                variant={row.given[slot] ? 'contained' : 'outlined'}
                                color={row.given[slot] ? 'success' : 'primary'}
                                onClick={() => toggleMedicationSlot(row.id, slot)}
                                sx={clinicalDialogButtonSx}
                              >
                                {row.given[slot] ? 'Given' : 'Due'}
                              </Button>
                            </TableCell>
                          ))}
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.state}
                              color={
                                row.state === 'Given'
                                  ? 'success'
                                  : row.state === 'Due'
                                  ? 'warning'
                                  : 'info'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" color="error" onClick={() => removeMedication(row.id)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ) : null}

            {activeTab === 'notes' ? (
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} lg={7}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Progress Notes ({patientNotes.length})
                        </Typography>
                        <Button size="small" variant="contained" onClick={openNoteDialog}>
                          + Add Note
                        </Button>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.3}>
                        {patientNotes.map((note) => {
                          const soapSections: Array<{
                            id: 'subjective' | 'objective' | 'assessment' | 'plan';
                            label: string;
                            value: string;
                            color: string;
                          }> = [
                            {
                              id: 'subjective',
                              label: 'SUBJECTIVE',
                              value: note.subjective,
                              color: '#4338ca',
                            },
                            {
                              id: 'objective',
                              label: 'OBJECTIVE',
                              value: note.objective,
                              color: '#7e22ce',
                            },
                            {
                              id: 'assessment',
                              label: 'ASSESSMENT',
                              value: note.assessment,
                              color: '#ea580c',
                            },
                            {
                              id: 'plan',
                              label: 'PLAN',
                              value: note.plan,
                              color: '#16a34a',
                            },
                          ];

                          const isNursingNote = note.role.toLowerCase().includes('nurs');

                          return (
                            <Card
                              key={note.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.14),
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                boxShadow: 'none',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      fontSize: 12,
                                      fontWeight: 800,
                                      bgcolor: isNursingNote ? 'error.main' : 'primary.main',
                                    }}
                                  >
                                    {initials(note.author)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                      {note.author}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {noteMetaLine(note).split(' | ').join(' · ')}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                  {note.time}
                                </Typography>
                              </Stack>

                              <Grid container spacing={0.8} sx={{ mt: 1 }}>
                                {soapSections.map((section) => (
                                  <Grid xs={12} sm={6} key={`${note.id}-${section.id}`}>
                                    <Box
                                      sx={{
                                        p: 1,
                                        borderRadius: 1.2,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.12),
                                        borderLeftWidth: 3,
                                        borderLeftColor: section.color,
                                        backgroundColor: alpha(theme.palette.background.paper, 0.98),
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          display: 'block',
                                          fontSize: 11,
                                          fontWeight: 800,
                                          lineHeight: 1.1,
                                          color: section.color,
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        {section.label}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          mt: 0.2,
                                          color: 'text.secondary',
                                          lineHeight: 1.35,
                                        }}
                                      >
                                        {section.value}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                <Grid xs={12} lg={5}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box sx={{ p: 2, ...clinicalInlineFormSx }}>
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1.2,
                              display: 'grid',
                              placeItems: 'center',
                              color: 'warning.main',
                              backgroundColor: alpha(theme.palette.warning.main, 0.16),
                            }}
                          >
                            <NoteAltIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            Quick Note
                          </Typography>
                        </Stack>

                        <Grid container spacing={1.1} sx={{ mt: 0.1 }}>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Type
                            </Typography>
                            <TextField
                              select
                              size="small"
                              value={quickNote.type}
                              onChange={(event) =>
                                setQuickNote((previous) => ({
                                  ...previous,
                                  type: event.target.value as NoteKind,
                                }))
                              }
                              fullWidth
                            >
                              {(['Physician Note', 'Nursing Note', 'SOAP Note'] as NoteKind[]).map((noteType) => (
                                <MenuItem key={noteType} value={noteType}>
                                  {noteType}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid xs={12} sm={6}>
                            <Typography variant="caption" sx={clinicalLabelSx}>
                              Severity
                            </Typography>
                            <TextField
                              select
                              size="small"
                              value={quickNote.severity}
                              onChange={(event) =>
                                setQuickNote((previous) => ({
                                  ...previous,
                                  severity: event.target.value as NoteSeverity,
                                }))
                              }
                              fullWidth
                            >
                              {(['Routine', 'Urgent', 'STAT'] as NoteSeverity[]).map((severity) => (
                                <MenuItem key={severity} value={severity}>
                                  {severity}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Box>
                          <Typography variant="caption" sx={clinicalLabelSx}>
                            Subjective
                          </Typography>
                          <TextField
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="Patient complaints..."
                            value={quickNote.subjective}
                            onChange={(event) =>
                              setQuickNote((previous) => ({
                                ...previous,
                                subjective: event.target.value,
                              }))
                            }
                            fullWidth
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={clinicalLabelSx}>
                            Objective Findings
                          </Typography>
                          <TextField
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="Vitals, exam..."
                            value={quickNote.objective}
                            onChange={(event) =>
                              setQuickNote((previous) => ({
                                ...previous,
                                objective: event.target.value,
                              }))
                            }
                            fullWidth
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={clinicalLabelSx}>
                            Assessment &amp; Plan
                          </Typography>
                          <TextField
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="Assessment and plan..."
                            value={quickNote.assessment}
                            onChange={(event) =>
                              setQuickNote((previous) => ({
                                ...previous,
                                assessment: event.target.value,
                                plan: event.target.value,
                              }))
                            }
                            fullWidth
                            error={Boolean(quickNoteError)}
                            helperText={quickNoteError || ' '}
                          />
                        </Box>
                        <Stack direction="row" justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={saveQuickNote}
                            startIcon={<NoteAltIcon sx={{ fontSize: 14 }} />}
                            sx={clinicalPrimaryButtonSx}
                          >
                            Save Note
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {activeTab === 'procedures' ? (
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} lg={6}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Procedures and Consults
                        </Typography>
                        <Button size="small" variant="contained" onClick={() => openProcedureDialog('Procedure')}>
                          + Add Procedure
                        </Button>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        {patientProcedures.map((row) => (
                          <Stack
                            key={row.id}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                              px: 1.2,
                              py: 1,
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Chip size="small" label={row.type} variant="outlined" />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {row.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.details}
                              </Typography>
                            </Box>
                            <Chip size="small" label={row.status} color={procedureChipColor(row.status)} />
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                <Grid xs={12} lg={6}>
                  <Card elevation={0} sx={sectionCardSx}>
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Related Workflow Shortcuts
                        </Typography>
                        <Button size="small" variant="outlined" onClick={() => openProcedureDialog('Consult')}>
                          + Request Consult
                        </Button>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Button
                          variant="outlined"
                          disabled={!canNavigate('/diagnostics/lab/samples')}
                          onClick={() => openRoute('/diagnostics/lab/samples', '/diagnostics/lab/samples')}
                        >
                          Open Lab Samples
                        </Button>
                        <Button
                          variant="outlined"
                          disabled={!canNavigate('/diagnostics/radiology/worklist')}
                          onClick={() =>
                            openRoute('/diagnostics/radiology/worklist', '/diagnostics/radiology/worklist')
                          }
                        >
                          Open Radiology Worklist
                        </Button>
                        <Button
                          variant="outlined"
                          disabled={!canNavigate('/clinical/modules/bugsy-infection-control')}
                          onClick={() =>
                            openRoute(
                              '/clinical/modules/bugsy-infection-control',
                              '/clinical/modules/bugsy-infection-control'
                            )
                          }
                        >
                          Infection Control
                        </Button>
                        <Button
                          variant="contained"
                          disabled={!canNavigate('/ipd/discharge')}
                          onClick={() => openRoute('/ipd/discharge?tab=pending', '/ipd/discharge')}
                        >
                          Continue to Discharge Planning
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ) : null}

        </Box>

        <CommonDialog
          open={vitalsDialogOpen}
          onClose={() => setVitalsDialogOpen(false)}
          title={renderClinicalDialogTitle(
            'Record Vitals',
            <MonitorHeartIcon sx={{ fontSize: 14 }} />,
            () => setVitalsDialogOpen(false),
            'info'
          )}
          maxWidth="sm"
          fullWidth
          titleSx={clinicalDialogTitleSx}
          contentSx={clinicalDialogContentSx}
          actionsSx={clinicalDialogActionsSx}
          actions={
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setVitalsDialogOpen(false)}
                sx={clinicalDialogButtonSx}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={saveVitalsFromDialog}
                startIcon={<MonitorHeartIcon sx={{ fontSize: 14 }} />}
                sx={clinicalPrimaryButtonSx}
              >
                Save Vitals
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Grid container spacing={1.1} sx={{ mt: 0.15 }}>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    BP Systolic
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.systolic}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, systolic: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    BP Diastolic
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.diastolic}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, diastolic: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Heart Rate (BPM)
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.hr}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, hr: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    SpO2. %
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.spo2}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, spo2: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Temp (F)
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.temp}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, temp: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Resp. Rate
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.rr}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, rr: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Blood Sugar (mg/dL)
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.bloodSugar}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, bloodSugar: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Pain Score (0-10)
                  </Typography>
                  <TextField
                    size="small"
                    value={vitalsDraft.pain}
                    onChange={(event) =>
                      setVitalsDraft((previous) => ({ ...previous, pain: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  Notes
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Any observations..."
                  value={vitalsDraft.notes}
                  onChange={(event) =>
                    setVitalsDraft((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  fullWidth
                />
              </Box>
              {vitalsDialogError ? (
                <Typography variant="caption" color="error.main">
                  {vitalsDialogError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <CommonDialog
          open={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
          title={renderClinicalDialogTitle(
            'Write New Order',
            <ScienceIcon sx={{ fontSize: 14 }} />,
            () => setOrderDialogOpen(false),
            'warning'
          )}
          maxWidth="sm"
          fullWidth
          titleSx={clinicalDialogTitleSx}
          contentSx={clinicalDialogContentSx}
          actionsSx={clinicalDialogActionsSx}
          actions={
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setOrderDialogOpen(false)}
                sx={clinicalDialogButtonSx}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={submitOrderFromDialog}
                startIcon={<ScienceIcon sx={{ fontSize: 14 }} />}
                sx={clinicalPrimaryButtonSx}
              >
                Submit Order
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Grid container spacing={1.1} sx={{ mt: 0.15 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Order Type
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={orderDraft.type}
                    onChange={(event) =>
                      setOrderDraft((previous) => ({ ...previous, type: event.target.value }))
                    }
                    fullWidth
                  >
                    {ORDER_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Priority
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={orderDraft.priority}
                    onChange={(event) =>
                      setOrderDraft((previous) => ({
                        ...previous,
                        priority: event.target.value as OrderPriority,
                      }))
                    }
                    fullWidth
                  >
                    {(['Routine', 'Urgent', 'STAT'] as OrderPriority[]).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  Order Description
                </Typography>
                <TextField
                  size="small"
                  placeholder="e.g. Repeat CBC + CMP, 12-lead ECG..."
                  value={orderDraft.description}
                  onChange={(event) =>
                    setOrderDraft((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Box>
              <Grid container spacing={1.1}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Frequency
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. Once, Q8H, Daily"
                    value={orderDraft.frequency}
                    onChange={(event) =>
                      setOrderDraft((previous) => ({
                        ...previous,
                        frequency: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Duration
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. 3 days, Ongoing, PRN"
                    value={orderDraft.duration}
                    onChange={(event) =>
                      setOrderDraft((previous) => ({
                        ...previous,
                        duration: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  Clinical Notes
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Clinical justification..."
                  value={orderDraft.notes}
                  onChange={(event) =>
                    setOrderDraft((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Box>
              {orderDialogError ? (
                <Typography variant="caption" color="error.main">
                  {orderDialogError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <CommonDialog
          open={noteDialogOpen}
          onClose={() => setNoteDialogOpen(false)}
          title={renderClinicalDialogTitle(
            'Add Progress Note',
            <NoteAltIcon sx={{ fontSize: 14 }} />,
            () => setNoteDialogOpen(false),
            'warning'
          )}
          maxWidth="sm"
          fullWidth
          titleSx={clinicalDialogTitleSx}
          contentSx={clinicalDialogContentSx}
          actionsSx={clinicalDialogActionsSx}
          actions={
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setNoteDialogOpen(false)}
                sx={clinicalDialogButtonSx}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={saveNoteFromDialog}
                startIcon={<NoteAltIcon sx={{ fontSize: 14 }} />}
                sx={clinicalPrimaryButtonSx}
              >
                Save Note
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Grid container spacing={1.1} sx={{ mt: 0.15 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    NOTE TYPE
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={noteDraft.type}
                    onChange={(event) =>
                      setNoteDraft((previous) => ({
                        ...previous,
                        type: event.target.value as NoteKind,
                      }))
                    }
                    fullWidth
                  >
                    {(['Physician Note', 'Nursing Note', 'SOAP Note'] as NoteKind[]).map((noteType) => (
                      <MenuItem key={noteType} value={noteType}>
                        {noteType}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    SEVERITY
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={noteDraft.severity}
                    onChange={(event) =>
                      setNoteDraft((previous) => ({
                        ...previous,
                        severity: event.target.value as NoteSeverity,
                      }))
                    }
                    fullWidth
                  >
                    {(['Routine', 'Urgent', 'STAT'] as NoteSeverity[]).map((severity) => (
                      <MenuItem key={severity} value={severity}>
                        {severity}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  SUBJECTIVE (PATIENT COMPLAINTS)
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="What the patient reports..."
                  value={noteDraft.subjective}
                  onChange={(event) =>
                    setNoteDraft((previous) => ({ ...previous, subjective: event.target.value }))
                  }
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  OBJECTIVE (FINDINGS)
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Vitals, exam findings, labs..."
                  value={noteDraft.objective}
                  onChange={(event) =>
                    setNoteDraft((previous) => ({ ...previous, objective: event.target.value }))
                  }
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  ASSESSMENT
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Clinical assessment and diagnosis..."
                  value={noteDraft.assessment}
                  onChange={(event) =>
                    setNoteDraft((previous) => ({ ...previous, assessment: event.target.value }))
                  }
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  PLAN
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Treatment plan, follow-up..."
                  value={noteDraft.plan}
                  onChange={(event) =>
                    setNoteDraft((previous) => ({ ...previous, plan: event.target.value }))
                  }
                  fullWidth
                />
              </Box>
              {noteDialogError ? (
                <Typography variant="caption" color="error.main">
                  {noteDialogError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <CommonDialog
          open={medDialogOpen}
          onClose={() => setMedDialogOpen(false)}
          title={renderClinicalDialogTitle(
            'Add Medication',
            <MedicationIcon sx={{ fontSize: 14 }} />,
            () => setMedDialogOpen(false),
            'warning'
          )}
          maxWidth="sm"
          fullWidth
          titleSx={clinicalDialogTitleSx}
          contentSx={clinicalDialogContentSx}
          actionsSx={clinicalDialogActionsSx}
          actions={
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setMedDialogOpen(false)}
                sx={clinicalDialogButtonSx}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={addMedicationFromDialog}
                startIcon={<MedicationIcon sx={{ fontSize: 14 }} />}
                sx={clinicalPrimaryButtonSx}
              >
                Add Medication
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Grid container spacing={1.1} sx={{ mt: 0.15 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Medication Name
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. Aspirin"
                    value={medDraft.medication}
                    onChange={(event) =>
                      setMedDraft((previous) => ({ ...previous, medication: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Dose
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. 75mg"
                    value={medDraft.dose}
                    onChange={(event) =>
                      setMedDraft((previous) => ({ ...previous, dose: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1.1}>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Route
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={medDraft.route}
                    onChange={(event) =>
                      setMedDraft((previous) => ({ ...previous, route: event.target.value }))
                    }
                    fullWidth
                  >
                    <MenuItem value="Oral">PO (Oral)</MenuItem>
                    <MenuItem value="IV">IV</MenuItem>
                    <MenuItem value="SC">SC</MenuItem>
                    <MenuItem value="IM">IM</MenuItem>
                    <MenuItem value="Topical">Topical</MenuItem>
                  </TextField>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Frequency
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. OD, BD, TDS"
                    value={medDraft.frequency}
                    onChange={(event) =>
                      setMedDraft((previous) => ({ ...previous, frequency: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" sx={clinicalLabelSx}>
                    Duration
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="e.g. 5 days"
                    value={medDraft.duration}
                    onChange={(event) =>
                      setMedDraft((previous) => ({ ...previous, duration: event.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" sx={clinicalLabelSx}>
                  Notes
                </Typography>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Instructions..."
                  value={medDraft.notes}
                  onChange={(event) =>
                    setMedDraft((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  fullWidth
                />
              </Box>
              {medDialogError ? (
                <Typography variant="caption" color="error.main">
                  {medDialogError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <CommonDialog
          open={procedureDialogOpen}
          onClose={() => setProcedureDialogOpen(false)}
          title={renderClinicalDialogTitle(
            procedureDraft.type === 'Consult' ? 'Request Consult' : 'Add Procedure',
            <LocalHospitalIcon sx={{ fontSize: 14 }} />,
            () => setProcedureDialogOpen(false),
            procedureDraft.type === 'Consult' ? 'info' : 'primary'
          )}
          maxWidth="sm"
          fullWidth
          titleSx={clinicalDialogTitleSx}
          contentSx={clinicalDialogContentSx}
          actionsSx={clinicalDialogActionsSx}
          actions={
            <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcedureDialogOpen(false)}
                sx={clinicalDialogButtonSx}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={saveProcedureFromDialog}
                startIcon={<LocalHospitalIcon sx={{ fontSize: 14 }} />}
                sx={clinicalPrimaryButtonSx}
              >
                Save
              </Button>
            </Stack>
          }
          content={
            <Stack spacing={1.1}>
              <Grid container spacing={1.2}>
                <Grid xs={6}>
                  <TextField
                    select
                    size="small"
                    label="Type"
                    value={procedureDraft.type}
                    onChange={(event) =>
                      setProcedureDraft((previous) => ({
                        ...previous,
                        type: event.target.value as ProcedureRow['type'],
                      }))
                    }
                    fullWidth
                  >
                    {(['Procedure', 'Consult'] as ProcedureRow['type'][]).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={6}>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={procedureDraft.status}
                    onChange={(event) =>
                      setProcedureDraft((previous) => ({
                        ...previous,
                        status: event.target.value as ProcedureStatus,
                      }))
                    }
                    fullWidth
                  >
                    {(['Pending', 'Scheduled', 'In Progress', 'Completed'] as ProcedureStatus[]).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                size="small"
                label={procedureDraft.type === 'Consult' ? 'Consult Title' : 'Procedure Title'}
                value={procedureDraft.title}
                onChange={(event) =>
                  setProcedureDraft((previous) => ({ ...previous, title: event.target.value }))
                }
                fullWidth
              />
              <TextField
                size="small"
                multiline
                minRows={3}
                label="Details"
                value={procedureDraft.details}
                onChange={(event) =>
                  setProcedureDraft((previous) => ({ ...previous, details: event.target.value }))
                }
                fullWidth
              />
              {procedureDialogError ? (
                <Typography variant="caption" color="error.main">
                  {procedureDialogError}
                </Typography>
              ) : null}
            </Stack>
          }
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3200}
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </PageTemplate>
  );
}
