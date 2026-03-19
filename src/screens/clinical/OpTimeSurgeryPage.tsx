'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  MenuItem,
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
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card, CommonTabs, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { useUser } from '@/src/core/auth/UserContext';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Biotech as BiotechIcon,
  CheckCircle as CheckCircleIcon,
  Checklist as ChecklistIcon,
  Healing as HealingIcon,
  LocalHospital as LocalHospitalIcon,
  MeetingRoom as MeetingRoomIcon,
  MonitorHeart as MonitorHeartIcon,
  OpenInNew as OpenInNewIcon,
  QueryStats as QueryStatsIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type OpTimeTab =
  | 'dashboard'
  | 'ot-rooms'
  | 'scheduling'
  | 'pre-op'
  | 'consent'
  | 'anaesthesia'
  | 'intra-op'
  | 'recovery'
  | 'post-op'
  | 'staff'
  | 'inventory'
  | 'billing'
  | 'reports';
type OpTimeMenu = 'dashboard' | 'scheduling' | 'pre-op' | 'intra-op' | 'post-op';

type SurgeryPriority = 'STAT' | 'Urgent' | 'Elective';
type SurgeryStatus =
  | 'Scheduled'
  | 'Pre-Op'
  | 'In OR'
  | 'Closing'
  | 'PACU'
  | 'Completed'
  | 'Cancelled';
type RoomState = 'Open' | 'Occupied' | 'Turnover' | 'Cleaning' | 'Blocked';
type TimelineEventType =
  | 'Patient In Room'
  | 'Incision'
  | 'Specimen Sent'
  | 'Implant'
  | 'Blood Start'
  | 'Closure'
  | 'Critical Event'
  | 'PACU Transfer';
type ConsentPhase = 'Sign In' | 'Time Out' | 'Sign Out';

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

interface OrRoom {
  id: string;
  label: string;
  suite: string;
  specialty: string;
  state: RoomState;
  nurseLead: string;
  nextReadyAt: string;
}

interface PreOpChecklist {
  consentSigned: boolean;
  npoConfirmed: boolean;
  siteMarked: boolean;
  labsVerified: boolean;
  imagingReady: boolean;
  anesthesiaCleared: boolean;
  bloodReady: boolean;
}

interface SurgeryCase {
  id: string;
  caseNo: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  diagnosis: string;
  procedure: string;
  specialty: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  estimatedMinutes: number;
  asaClass: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV';
  priority: SurgeryPriority;
  status: SurgeryStatus;
  checklist: PreOpChecklist;
  bloodUnits: number;
  implants: string[];
  pacuBed: string;
  painScore: number;
  aldreteScore: number;
  notes: string;
}

interface IntraOpEvent {
  id: string;
  caseId: string;
  time: string;
  type: TimelineEventType;
  note: string;
  by: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface ScheduleForm {
  patientName: string;
  mrn: string;
  ageGender: string;
  diagnosis: string;
  procedure: string;
  specialty: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  estimatedMinutes: string;
  priority: SurgeryPriority;
  asaClass: SurgeryCase['asaClass'];
  bloodUnits: string;
  pacuBed: string;
}

interface TeamForm {
  surgeon: string;
  anesthetist: string;
  nurseLead: string;
  pacuBed: string;
}

interface TimelineForm {
  type: TimelineEventType;
  time: string;
  note: string;
  by: string;
}

interface AnaesthesiaPlanForm {
  technique: string;
  airwayPlan: string;
  inductionAgent: string;
  maintenance: string;
  analgesia: string;
  notes: string;
}

interface PostOpNoteForm {
  woundClosureTime: string;
  outOfOtTime: string;
  transferTo: 'PACU' | 'ICU' | 'Ward';
  summary: string;
}

interface StaffRosterEntry {
  id: string;
  name: string;
  role: 'Surgeon' | 'Anaesthetist' | 'Scrub Nurse' | 'Circulating Nurse' | 'Recovery Nurse';
  specialty: string;
  shift: string;
  assignedUnit: string;
  casesToday: number | '-';
  status: 'Active' | 'In OT' | 'On Call' | 'Emergency';
}

interface OtInventoryItem {
  id: string;
  item: string;
  category: 'Consumable' | 'Implant' | 'Instrument' | 'Drug';
  stock: number;
  reorderLevel: number;
  location: string;
  status: 'Available' | 'Low Stock' | 'Critical' | 'Out of Stock';
}

interface IndentForm {
  item: string;
  qty: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  note: string;
}

interface PersistedOptimeState {
  version: 1;
  rooms: OrRoom[];
  cases: SurgeryCase[];
  events: IntraOpEvent[];
}

const OPTIME_STORAGE_KEY = 'scanbo.hims.surgery.optime.ui.v1';

const MENU_GROUPS: Array<{ id: OpTimeMenu; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'scheduling', label: 'OT Scheduling' },
  { id: 'pre-op', label: 'Pre-Op' },
  { id: 'intra-op', label: 'Intra-Op' },
  { id: 'post-op', label: 'Post-Op' },
];

const MENU_SUB_TAB_MAP: Record<OpTimeMenu, OpTimeTab[]> = {
  dashboard: ['dashboard', 'ot-rooms', 'reports'],
  scheduling: ['scheduling'],
  'pre-op': ['pre-op', 'consent', 'anaesthesia'],
  'intra-op': ['intra-op', 'recovery'],
  'post-op': ['post-op', 'billing', 'staff', 'inventory'],
};

const MENU_ICON_MAP: Record<OpTimeMenu, React.ReactElement> = {
  dashboard: <LocalHospitalIcon fontSize="small" />,
  scheduling: <AddCircleOutlineIcon fontSize="small" />,
  'pre-op': <HealingIcon fontSize="small" />,
  'intra-op': <TimelineIcon fontSize="small" />,
  'post-op': <CheckCircleIcon fontSize="small" />,
};

const CHECKLIST_ITEMS: Array<{
  key: keyof PreOpChecklist;
  label: string;
  critical?: boolean;
}> = [
  { key: 'consentSigned', label: 'Consent Signed', critical: true },
  { key: 'npoConfirmed', label: 'NPO Confirmed', critical: true },
  { key: 'siteMarked', label: 'Site Marked', critical: true },
  { key: 'labsVerified', label: 'Labs Verified' },
  { key: 'imagingReady', label: 'Imaging Ready' },
  { key: 'anesthesiaCleared', label: 'Anesthesia Cleared', critical: true },
  { key: 'bloodReady', label: 'Blood Ready' },
];

const PRIORITY_COLOR: Record<SurgeryPriority, ChipColor> = {
  STAT: 'error',
  Urgent: 'warning',
  Elective: 'info',
};

const STATUS_COLOR: Record<SurgeryStatus, ChipColor> = {
  Scheduled: 'default',
  'Pre-Op': 'warning',
  'In OR': 'info',
  Closing: 'secondary',
  PACU: 'success',
  Completed: 'success',
  Cancelled: 'error',
};

const ROOM_STATE_COLOR: Record<RoomState, ChipColor> = {
  Open: 'success',
  Occupied: 'error',
  Turnover: 'warning',
  Cleaning: 'info',
  Blocked: 'default',
};

const NEXT_STATUS: Partial<Record<SurgeryStatus, SurgeryStatus>> = {
  Scheduled: 'Pre-Op',
  'Pre-Op': 'In OR',
  'In OR': 'Closing',
  Closing: 'PACU',
  PACU: 'Completed',
};

const NEXT_STATUS_LABEL: Partial<Record<SurgeryStatus, string>> = {
  Scheduled: 'Send to Pre-Op',
  'Pre-Op': 'Move to OR',
  'In OR': 'Start Closure',
  Closing: 'Transfer to PACU',
  PACU: 'Complete Handoff',
};

function getTodayAt(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function getLocalInputDateTime(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const INITIAL_ROOMS: OrRoom[] = [
  {
    id: 'or-1',
    label: 'OR-01',
    suite: 'Main OT',
    specialty: 'General Surgery',
    state: 'Occupied',
    nurseLead: 'Nurse Sunita Rao',
    nextReadyAt: getTodayAt(13, 15),
  },
  {
    id: 'or-2',
    label: 'OR-02',
    suite: 'Main OT',
    specialty: 'Orthopedics',
    state: 'Turnover',
    nurseLead: 'Nurse Nikhil Joshi',
    nextReadyAt: getTodayAt(12, 40),
  },
  {
    id: 'or-3',
    label: 'OR-03',
    suite: 'Neuro OT',
    specialty: 'Neurosurgery',
    state: 'Open',
    nurseLead: 'Nurse Mary Dsouza',
    nextReadyAt: getTodayAt(14, 0),
  },
  {
    id: 'or-4',
    label: 'OR-04',
    suite: 'Cardiac OT',
    specialty: 'Cardiothoracic',
    state: 'Cleaning',
    nurseLead: 'Nurse Imran Khan',
    nextReadyAt: getTodayAt(13, 30),
  },
  {
    id: 'or-5',
    label: 'OR-05',
    suite: 'Day Care OT',
    specialty: 'ENT',
    state: 'Blocked',
    nurseLead: 'Nurse Keerti Patil',
    nextReadyAt: getTodayAt(16, 0),
  },
];

const INITIAL_CASES: SurgeryCase[] = [
  {
    id: 'ot-case-001',
    caseNo: 'OT-2026-001',
    patientName: 'Rajiv Menon',
    mrn: 'MRN-332104',
    ageGender: '56y / Male',
    diagnosis: 'Acute cholecystitis',
    procedure: 'Laparoscopic Cholecystectomy',
    specialty: 'General Surgery',
    surgeon: 'Dr. Kavita Sharma',
    anesthetist: 'Dr. R. Mehta',
    roomId: 'or-1',
    scheduledAt: getTodayAt(9, 15),
    estimatedMinutes: 110,
    asaClass: 'ASA II',
    priority: 'Urgent',
    status: 'In OR',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: true,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: true,
      bloodReady: true,
    },
    bloodUnits: 1,
    implants: [],
    pacuBed: 'PACU-03',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Diabetic. Broad-spectrum prophylaxis given.',
  },
  {
    id: 'ot-case-002',
    caseNo: 'OT-2026-002',
    patientName: 'Ritika Saini',
    mrn: 'MRN-332188',
    ageGender: '34y / Female',
    diagnosis: 'Comminuted distal radius fracture',
    procedure: 'ORIF Distal Radius',
    specialty: 'Orthopedics',
    surgeon: 'Dr. A. Verma',
    anesthetist: 'Dr. S. Iyer',
    roomId: 'or-2',
    scheduledAt: getTodayAt(11, 50),
    estimatedMinutes: 140,
    asaClass: 'ASA I',
    priority: 'Urgent',
    status: 'Pre-Op',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: true,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: true,
      bloodReady: false,
    },
    bloodUnits: 1,
    implants: ['Volar locking plate'],
    pacuBed: 'PACU-05',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Implant kit verified, fluoroscopy requested in room.',
  },
  {
    id: 'ot-case-003',
    caseNo: 'OT-2026-003',
    patientName: 'Amitabh Roy',
    mrn: 'MRN-332221',
    ageGender: '68y / Male',
    diagnosis: 'Triple vessel CAD',
    procedure: 'CABG x3',
    specialty: 'Cardiothoracic',
    surgeon: 'Dr. M. Sen',
    anesthetist: 'Dr. J. Fernandes',
    roomId: 'or-4',
    scheduledAt: getTodayAt(13, 40),
    estimatedMinutes: 260,
    asaClass: 'ASA IV',
    priority: 'Elective',
    status: 'Scheduled',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: false,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: false,
      bloodReady: true,
    },
    bloodUnits: 4,
    implants: ['Sternotomy wires'],
    pacuBed: 'ICU-Cardiac-02',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Perfusion team confirmed. ICU bed reserved.',
  },
  {
    id: 'ot-case-004',
    caseNo: 'OT-2026-004',
    patientName: 'Nazia Khan',
    mrn: 'MRN-332249',
    ageGender: '42y / Female',
    diagnosis: 'Thyroid nodule',
    procedure: 'Hemithyroidectomy',
    specialty: 'ENT',
    surgeon: 'Dr. P. Rao',
    anesthetist: 'Dr. S. Iyer',
    roomId: 'or-5',
    scheduledAt: getTodayAt(10, 0),
    estimatedMinutes: 90,
    asaClass: 'ASA II',
    priority: 'Elective',
    status: 'Cancelled',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: false,
      labsVerified: false,
      imagingReady: true,
      anesthesiaCleared: false,
      bloodReady: false,
    },
    bloodUnits: 0,
    implants: [],
    pacuBed: 'PACU-02',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Case cancelled: patient developed acute URTI symptoms.',
  },
  {
    id: 'ot-case-005',
    caseNo: 'OT-2026-005',
    patientName: 'Priyanka Das',
    mrn: 'MRN-332276',
    ageGender: '29y / Female',
    diagnosis: 'Ruptured ectopic pregnancy',
    procedure: 'Emergency Laparotomy',
    specialty: 'Gynecology',
    surgeon: 'Dr. Neha Bhat',
    anesthetist: 'Dr. R. Mehta',
    roomId: 'or-3',
    scheduledAt: getTodayAt(8, 45),
    estimatedMinutes: 120,
    asaClass: 'ASA III',
    priority: 'STAT',
    status: 'PACU',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: true,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: true,
      bloodReady: true,
    },
    bloodUnits: 2,
    implants: [],
    pacuBed: 'PACU-01',
    painScore: 4,
    aldreteScore: 8,
    notes: 'Hemodynamically stable. Monitor drain output for next 2 hours.',
  },
  {
    id: 'ot-case-006',
    caseNo: 'OT-2026-006',
    patientName: 'Suresh Patel',
    mrn: 'MRN-332305',
    ageGender: '63y / Male',
    diagnosis: 'Large bowel obstruction',
    procedure: 'Right Hemicolectomy',
    specialty: 'General Surgery',
    surgeon: 'Dr. Kavita Sharma',
    anesthetist: 'Dr. J. Fernandes',
    roomId: 'or-1',
    scheduledAt: getTodayAt(12, 20),
    estimatedMinutes: 180,
    asaClass: 'ASA III',
    priority: 'Urgent',
    status: 'Closing',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: true,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: true,
      bloodReady: true,
    },
    bloodUnits: 2,
    implants: [],
    pacuBed: 'PACU-06',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Stoma nurse informed. ICU backup not required currently.',
  },
  {
    id: 'ot-case-007',
    caseNo: 'OT-2026-007',
    patientName: 'Deepak Jain',
    mrn: 'MRN-332336',
    ageGender: '47y / Male',
    diagnosis: 'Lumbar canal stenosis',
    procedure: 'L4-L5 Decompression',
    specialty: 'Neurosurgery',
    surgeon: 'Dr. T. Nair',
    anesthetist: 'Dr. S. Iyer',
    roomId: 'or-3',
    scheduledAt: getTodayAt(15, 30),
    estimatedMinutes: 170,
    asaClass: 'ASA II',
    priority: 'Elective',
    status: 'Scheduled',
    checklist: {
      consentSigned: true,
      npoConfirmed: false,
      siteMarked: false,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: false,
      bloodReady: false,
    },
    bloodUnits: 1,
    implants: ['Titanium rods'],
    pacuBed: 'PACU-07',
    painScore: 0,
    aldreteScore: 0,
    notes: 'Implant tray to be shifted from CSSD by 14:30.',
  },
  {
    id: 'ot-case-008',
    caseNo: 'OT-2026-008',
    patientName: 'Anita Batra',
    mrn: 'MRN-332365',
    ageGender: '51y / Female',
    diagnosis: 'Fibroid uterus',
    procedure: 'Total Abdominal Hysterectomy',
    specialty: 'Gynecology',
    surgeon: 'Dr. Neha Bhat',
    anesthetist: 'Dr. R. Mehta',
    roomId: 'or-2',
    scheduledAt: getTodayAt(14, 25),
    estimatedMinutes: 150,
    asaClass: 'ASA II',
    priority: 'Elective',
    status: 'Completed',
    checklist: {
      consentSigned: true,
      npoConfirmed: true,
      siteMarked: true,
      labsVerified: true,
      imagingReady: true,
      anesthesiaCleared: true,
      bloodReady: true,
    },
    bloodUnits: 1,
    implants: [],
    pacuBed: 'PACU-04',
    painScore: 2,
    aldreteScore: 9,
    notes: 'Shifted to ward with stable vitals and clear handoff notes.',
  },
];

const INITIAL_EVENTS: IntraOpEvent[] = [
  {
    id: 'evt-001',
    caseId: 'ot-case-001',
    time: getTodayAt(9, 22),
    type: 'Patient In Room',
    note: 'WHO timeout completed.',
    by: 'Nurse Sunita Rao',
  },
  {
    id: 'evt-002',
    caseId: 'ot-case-001',
    time: getTodayAt(9, 31),
    type: 'Incision',
    note: 'Ports placed successfully.',
    by: 'Dr. Kavita Sharma',
  },
  {
    id: 'evt-003',
    caseId: 'ot-case-001',
    time: getTodayAt(10, 15),
    type: 'Specimen Sent',
    note: 'Gall bladder sent to histopathology.',
    by: 'OT Technician',
  },
  {
    id: 'evt-004',
    caseId: 'ot-case-005',
    time: getTodayAt(8, 52),
    type: 'Patient In Room',
    note: 'Massive transfusion protocol ready.',
    by: 'Nurse Mary Dsouza',
  },
  {
    id: 'evt-005',
    caseId: 'ot-case-005',
    time: getTodayAt(9, 3),
    type: 'Incision',
    note: 'Midline laparotomy started.',
    by: 'Dr. Neha Bhat',
  },
  {
    id: 'evt-006',
    caseId: 'ot-case-005',
    time: getTodayAt(10, 44),
    type: 'PACU Transfer',
    note: 'Shifted extubated to PACU-01.',
    by: 'Dr. R. Mehta',
  },
  {
    id: 'evt-007',
    caseId: 'ot-case-006',
    time: getTodayAt(12, 32),
    type: 'Patient In Room',
    note: 'Checklist completed, antibiotics given.',
    by: 'Nurse Sunita Rao',
  },
  {
    id: 'evt-008',
    caseId: 'ot-case-006',
    time: getTodayAt(12, 42),
    type: 'Incision',
    note: 'Bowel decompression initiated.',
    by: 'Dr. Kavita Sharma',
  },
  {
    id: 'evt-009',
    caseId: 'ot-case-006',
    time: getTodayAt(14, 35),
    type: 'Closure',
    note: 'Stoma matured and dressing applied.',
    by: 'Dr. Kavita Sharma',
  },
];

const STAFF_ROSTER: StaffRosterEntry[] = [
  {
    id: 'staff-1',
    name: 'Dr. Kavita Sharma',
    role: 'Surgeon',
    specialty: 'General Surgery',
    shift: '07:00 - 15:00',
    assignedUnit: 'OT-1',
    casesToday: 3,
    status: 'In OT',
  },
  {
    id: 'staff-2',
    name: 'Dr. Neha Bhat',
    role: 'Surgeon',
    specialty: 'Gynecology',
    shift: '08:00 - 16:00',
    assignedUnit: 'OT-3',
    casesToday: 2,
    status: 'Emergency',
  },
  {
    id: 'staff-3',
    name: 'Dr. R. Mehta',
    role: 'Anaesthetist',
    specialty: 'General + Emergency',
    shift: '07:00 - 15:00',
    assignedUnit: 'OT-1',
    casesToday: 4,
    status: 'Active',
  },
  {
    id: 'staff-4',
    name: 'Nurse Sunita Rao',
    role: 'Scrub Nurse',
    specialty: 'General OT',
    shift: '07:00 - 15:00',
    assignedUnit: 'OT-1',
    casesToday: 3,
    status: 'In OT',
  },
  {
    id: 'staff-5',
    name: 'Nurse Pallavi Joshi',
    role: 'Recovery Nurse',
    specialty: 'PACU',
    shift: '07:00 - 15:00',
    assignedUnit: 'PACU',
    casesToday: '-',
    status: 'Active',
  },
];

const INVENTORY_ITEMS: OtInventoryItem[] = [
  {
    id: 'inv-1',
    item: 'Surgical Drapes (Sterile)',
    category: 'Consumable',
    stock: 42,
    reorderLevel: 20,
    location: 'OT Central Store',
    status: 'Available',
  },
  {
    id: 'inv-2',
    item: 'Volar Locking Plate Set',
    category: 'Implant',
    stock: 4,
    reorderLevel: 3,
    location: 'Implant Rack - Ortho',
    status: 'Low Stock',
  },
  {
    id: 'inv-3',
    item: 'Vicryl 2-0',
    category: 'Consumable',
    stock: 12,
    reorderLevel: 15,
    location: 'OT Pharmacy',
    status: 'Critical',
  },
  {
    id: 'inv-4',
    item: 'Sternal Wire Pack',
    category: 'Implant',
    stock: 0,
    reorderLevel: 4,
    location: 'Cardiac OT',
    status: 'Out of Stock',
  },
  {
    id: 'inv-5',
    item: 'Laparoscopic Tower Set',
    category: 'Instrument',
    stock: 3,
    reorderLevel: 2,
    location: 'Equipment Bay',
    status: 'Available',
  },
];

const CONSENT_TEMPLATE: Record<ConsentPhase, string[]> = {
  'Sign In': [
    'Patient identity, procedure, and consent verified',
    'Site marking completed by surgeon',
    'Anaesthesia safety check complete',
    'Pulse oximeter functional',
  ],
  'Time Out': [
    'Team introductions and role confirmation',
    'Antibiotic prophylaxis given within 60 min',
    'Critical steps discussed by surgeon',
    'Blood and implants availability confirmed',
  ],
  'Sign Out': [
    'Procedure and instrument count verbally confirmed',
    'Specimen labels and dispatch confirmed',
    'Post-op plan and destination confirmed',
    'PACU handoff points communicated',
  ],
};

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '--';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '--';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatHours(minutes: number): string {
  if (minutes <= 0) return '0h';
  const hours = minutes / 60;
  return `${hours.toFixed(hours >= 10 ? 1 : 2)}h`;
}

function checklistCompletion(checklist: PreOpChecklist): number {
  const values = Object.values(checklist);
  const done = values.filter(Boolean).length;
  return Math.round((done / values.length) * 100);
}

function inventoryStatusColor(status: OtInventoryItem['status']): ChipColor {
  if (status === 'Available') return 'success';
  if (status === 'Low Stock') return 'warning';
  if (status === 'Critical') return 'error';
  return 'default';
}

function staffStatusColor(status: StaffRosterEntry['status']): ChipColor {
  if (status === 'Active') return 'success';
  if (status === 'In OT') return 'info';
  if (status === 'Emergency') return 'error';
  return 'warning';
}

function buildOtBillingRows(caseItem: SurgeryCase) {
  const roomCharge = caseItem.estimatedMinutes * 42;
  const anaesthesiaCharge = Math.round(caseItem.estimatedMinutes * 19);
  const implantCharge = caseItem.implants.length * 24500;
  const bloodCharge = caseItem.bloodUnits * 1800;
  const consumableCharge = 2200;
  const nursingCharge = 1400;

  const rows = [
    { label: `OT Room Charges (${caseItem.estimatedMinutes} min)`, amount: roomCharge },
    { label: 'Anaesthesia & Monitoring', amount: anaesthesiaCharge },
    { label: 'OT Consumables', amount: consumableCharge },
    { label: 'Nursing & Technical Support', amount: nursingCharge },
    { label: `Blood / Transfusion (${caseItem.bloodUnits} units)`, amount: bloodCharge },
    { label: `Implants (${caseItem.implants.length})`, amount: implantCharge },
  ];

  const total = rows.reduce((sum, item) => sum + item.amount, 0);
  return { rows, total };
}

function buildConsentChecklistState(): Record<ConsentPhase, Record<string, boolean>> {
  return {
    'Sign In': Object.fromEntries(CONSENT_TEMPLATE['Sign In'].map((item) => [item, false])),
    'Time Out': Object.fromEntries(CONSENT_TEMPLATE['Time Out'].map((item) => [item, false])),
    'Sign Out': Object.fromEntries(CONSENT_TEMPLATE['Sign Out'].map((item) => [item, false])),
  };
}

function defaultAnaesthesiaPlan(caseItem: SurgeryCase | null): AnaesthesiaPlanForm {
  return {
    technique: caseItem?.priority === 'STAT' ? 'General Anaesthesia' : 'Balanced General Anaesthesia',
    airwayPlan: 'Endotracheal tube',
    inductionAgent: 'Propofol + Fentanyl',
    maintenance: 'O2 + Air + Sevoflurane',
    analgesia: 'Paracetamol + Opioid PRN',
    notes: caseItem ? `${caseItem.asaClass} | Blood units planned: ${caseItem.bloodUnits}` : '',
  };
}

function defaultPostOpNote(): PostOpNoteForm {
  return {
    woundClosureTime: '',
    outOfOtTime: '',
    transferTo: 'PACU',
    summary: '',
  };
}

function parsePersistedState(raw: string | null): PersistedOptimeState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedOptimeState>;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.rooms) || !Array.isArray(parsed.cases) || !Array.isArray(parsed.events)) {
      return null;
    }
    return {
      version: 1,
      rooms: parsed.rooms as OrRoom[],
      cases: parsed.cases as SurgeryCase[],
      events: parsed.events as IntraOpEvent[],
    };
  } catch {
    return null;
  }
}

function readPersistedState(): PersistedOptimeState | null {
  if (typeof window === 'undefined') return null;
  return parsePersistedState(window.localStorage.getItem(OPTIME_STORAGE_KEY));
}

function writePersistedState(state: PersistedOptimeState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OPTIME_STORAGE_KEY, JSON.stringify(state));
}

function defaultScheduleForm(roomId: string): ScheduleForm {
  const target = new Date();
  target.setHours(target.getHours() + 1, 0, 0, 0);

  return {
    patientName: '',
    mrn: '',
    ageGender: '',
    diagnosis: '',
    procedure: '',
    specialty: 'General Surgery',
    surgeon: '',
    anesthetist: '',
    roomId,
    scheduledAt: getLocalInputDateTime(target),
    estimatedMinutes: '120',
    priority: 'Elective',
    asaClass: 'ASA II',
    bloodUnits: '0',
    pacuBed: 'PACU-01',
  };
}

export default function OpTimeSurgeryPage() {
  const theme = useTheme();
  const router = useRouter();
  const { permissions, role } = useUser();

  const [menuGroup, setMenuGroup] = React.useState<OpTimeMenu>('dashboard');
  const [rooms, setRooms] = React.useState<OrRoom[]>(INITIAL_ROOMS);
  const [surgeryCases, setSurgeryCases] = React.useState<SurgeryCase[]>(INITIAL_CASES);
  const [timelineEvents, setTimelineEvents] = React.useState<IntraOpEvent[]>(INITIAL_EVENTS);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(INITIAL_CASES[0]?.id ?? '');

  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | SurgeryStatus>('All');
  const [roomFilter, setRoomFilter] = React.useState<'All' | string>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<'All' | SurgeryPriority>('All');

  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleForm>(() => defaultScheduleForm(INITIAL_ROOMS[0]?.id ?? 'or-1'));

  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [teamForm, setTeamForm] = React.useState<TeamForm>({
    surgeon: '',
    anesthetist: '',
    nurseLead: '',
    pacuBed: '',
  });

  const [timelineDialogOpen, setTimelineDialogOpen] = React.useState(false);
  const [timelineForm, setTimelineForm] = React.useState<TimelineForm>({
    type: 'Incision',
    time: getLocalInputDateTime(new Date()),
    note: '',
    by: '',
  });

  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');

  const [consentPhase, setConsentPhase] = React.useState<ConsentPhase>('Sign In');
  const [consentChecklist, setConsentChecklist] = React.useState<Record<ConsentPhase, Record<string, boolean>>>(
    () => buildConsentChecklistState()
  );

  const [anaesthesiaPlans, setAnaesthesiaPlans] = React.useState<Record<string, AnaesthesiaPlanForm>>({});
  const [postOpNotes, setPostOpNotes] = React.useState<Record<string, PostOpNoteForm>>({});

  const [indentDialogOpen, setIndentDialogOpen] = React.useState(false);
  const [indentForm, setIndentForm] = React.useState<IndentForm>({
    item: '',
    qty: '1',
    priority: 'Routine',
    note: '',
  });

  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [hasHydrated, setHasHydrated] = React.useState(false);

  const findMenuByTab = React.useCallback((nextTab: OpTimeTab): OpTimeMenu => {
    const found = (Object.entries(MENU_SUB_TAB_MAP) as Array<[OpTimeMenu, OpTimeTab[]]>).find(([, tabs]) =>
      tabs.includes(nextTab)
    );
    return found?.[0] ?? 'dashboard';
  }, []);

  React.useEffect(() => {
    const persisted = readPersistedState();
    if (persisted) {
      setRooms(persisted.rooms);
      setSurgeryCases(persisted.cases);
      setTimelineEvents(persisted.events);
      setSelectedCaseId(persisted.cases[0]?.id ?? '');
    }
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hasHydrated) return;
    writePersistedState({
      version: 1,
      rooms,
      cases: surgeryCases,
      events: timelineEvents,
    });
  }, [hasHydrated, rooms, surgeryCases, timelineEvents]);

  React.useEffect(() => {
    if (selectedCaseId && surgeryCases.some((item) => item.id === selectedCaseId)) return;
    setSelectedCaseId(surgeryCases[0]?.id ?? '');
  }, [selectedCaseId, surgeryCases]);

  const selectedCase = React.useMemo(
    () => surgeryCases.find((item) => item.id === selectedCaseId) ?? null,
    [selectedCaseId, surgeryCases]
  );

  const selectedAnaesthesiaPlan = React.useMemo(() => {
    if (!selectedCase) return defaultAnaesthesiaPlan(null);
    return anaesthesiaPlans[selectedCase.id] ?? defaultAnaesthesiaPlan(selectedCase);
  }, [anaesthesiaPlans, selectedCase]);

  const selectedPostOpNote = React.useMemo(() => {
    if (!selectedCase) return defaultPostOpNote();
    return postOpNotes[selectedCase.id] ?? defaultPostOpNote();
  }, [postOpNotes, selectedCase]);

  const filteredCases = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...surgeryCases]
      .filter((item) => {
        const matchesQuery =
          q.length === 0 ||
          [
            item.caseNo,
            item.patientName,
            item.mrn,
            item.procedure,
            item.surgeon,
            item.anesthetist,
            item.specialty,
            item.status,
          ]
            .join(' ')
            .toLowerCase()
            .includes(q);

        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesRoom = roomFilter === 'All' || item.roomId === roomFilter;
        const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
        return matchesQuery && matchesStatus && matchesRoom && matchesPriority;
      })
      .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
  }, [surgeryCases, query, statusFilter, roomFilter, priorityFilter]);

  const eventsByCase = React.useMemo(() => {
    const grouped: Record<string, IntraOpEvent[]> = {};
    timelineEvents.forEach((event) => {
      const existing = grouped[event.caseId] ?? [];
      existing.push(event);
      grouped[event.caseId] = existing;
    });

    Object.keys(grouped).forEach((caseId) => {
      grouped[caseId].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
    });

    return grouped;
  }, [timelineEvents]);

  const selectedCaseEvents = React.useMemo(
    () => (selectedCase ? eventsByCase[selectedCase.id] ?? [] : []),
    [selectedCase, eventsByCase]
  );

  const selectedClosureEvent = React.useMemo(
    () => selectedCaseEvents.find((entry) => entry.type === 'Closure') ?? null,
    [selectedCaseEvents]
  );

  const consentPhaseCompletion = React.useMemo(() => {
    const entries = Object.values(consentChecklist[consentPhase]);
    if (entries.length === 0) return 0;
    return Math.round((entries.filter(Boolean).length / entries.length) * 100);
  }, [consentChecklist, consentPhase]);

  const consentOverallCompletion = React.useMemo(() => {
    const all = Object.values(consentChecklist).flatMap((phase) => Object.values(phase));
    if (all.length === 0) return 0;
    return Math.round((all.filter(Boolean).length / all.length) * 100);
  }, [consentChecklist]);

  const billingSnapshot = React.useMemo(() => {
    if (!selectedCase) return null;
    return buildOtBillingRows(selectedCase);
  }, [selectedCase]);

  const totalOperationalCases = React.useMemo(
    () => surgeryCases.filter((item) => item.status !== 'Cancelled').length,
    [surgeryCases]
  );

  const activeOrCases = React.useMemo(
    () => surgeryCases.filter((item) => item.status === 'In OR' || item.status === 'Closing').length,
    [surgeryCases]
  );

  const pacuCases = React.useMemo(
    () => surgeryCases.filter((item) => item.status === 'PACU').length,
    [surgeryCases]
  );

  const completedCases = React.useMemo(
    () => surgeryCases.filter((item) => item.status === 'Completed').length,
    [surgeryCases]
  );

  const delayedCases = React.useMemo(
    () =>
      surgeryCases.filter((item) => {
        if (item.status === 'Cancelled' || item.status === 'Completed') return false;
        if (item.status !== 'Scheduled' && item.status !== 'Pre-Op') return false;
        return Date.parse(item.scheduledAt) < Date.now();
      }).length,
    [surgeryCases]
  );

  const preOpAtRiskCases = React.useMemo(
    () =>
      surgeryCases.filter((item) => {
        if (item.status !== 'Scheduled' && item.status !== 'Pre-Op') return false;
        return checklistCompletion(item.checklist) < 80;
      }).length,
    [surgeryCases]
  );

  const completionRate = totalOperationalCases === 0 ? 0 : Math.round((completedCases / totalOperationalCases) * 100);

  const roomMetrics = React.useMemo(() => {
    return rooms.map((room) => {
      const roomCases = surgeryCases.filter((item) => item.roomId === room.id && item.status !== 'Cancelled');
      const plannedMinutes = roomCases.reduce((sum, item) => sum + item.estimatedMinutes, 0);
      const finishedMinutes = roomCases
        .filter((item) => ['In OR', 'Closing', 'PACU', 'Completed'].includes(item.status))
        .reduce((sum, item) => sum + item.estimatedMinutes, 0);
      const utilization = Math.round((finishedMinutes / 480) * 100);

      const activeCase = roomCases.find((item) => item.status === 'In OR' || item.status === 'Closing') ?? null;
      const nextCase = roomCases
        .filter((item) => item.status === 'Scheduled' || item.status === 'Pre-Op')
        .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0] ?? null;

      let liveState: RoomState = room.state;
      if (activeCase) {
        liveState = 'Occupied';
      } else if (nextCase) {
        liveState = 'Turnover';
      }

      return {
        room,
        roomCases,
        plannedMinutes,
        finishedMinutes,
        utilization,
        activeCase,
        nextCase,
        liveState,
      };
    });
  }, [rooms, surgeryCases]);

  const utilizationAverage =
    roomMetrics.length === 0
      ? 0
      : Math.round(
          roomMetrics.reduce((sum, item) => sum + Math.max(0, Math.min(100, item.utilization)), 0) / roomMetrics.length
        );

  const longRunningCases = React.useMemo(
    () => surgeryCases.filter((item) => item.estimatedMinutes >= 180 && item.status !== 'Cancelled').length,
    [surgeryCases]
  );

  const canceledCases = React.useMemo(
    () => surgeryCases.filter((item) => item.status === 'Cancelled').length,
    [surgeryCases]
  );

  const updateCaseById = React.useCallback((caseId: string, updater: (value: SurgeryCase) => SurgeryCase) => {
    setSurgeryCases((prev) => prev.map((item) => (item.id === caseId ? updater(item) : item)));
  }, []);

  const addTimelineEvent = React.useCallback((payload: Omit<IntraOpEvent, 'id'>) => {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTimelineEvents((prev) => [{ id, ...payload }, ...prev]);
  }, []);

  const showToast = React.useCallback((message: string, severity: ToastState['severity']) => {
    setToast({ open: true, message, severity });
  }, []);

  const openTab = React.useCallback((nextTab: OpTimeTab) => {
    setMenuGroup(findMenuByTab(nextTab));
  }, [findMenuByTab]);

  const routeTo = React.useCallback(
    (route: string, mrn?: string) => {
      if (!canAccessRoute(route, permissions)) {
        showToast('Current role does not have permission for this screen.', 'warning');
        return;
      }
      const target = mrn ? `${route}?mrn=${encodeURIComponent(mrn)}` : route;
      router.push(target);
    },
    [permissions, router, showToast]
  );

  const handleTransition = React.useCallback(
    (caseId: string) => {
      const current = surgeryCases.find((item) => item.id === caseId);
      if (!current) return;

      const next = NEXT_STATUS[current.status];
      if (!next) {
        showToast('No further transition available for this case.', 'info');
        return;
      }

      updateCaseById(caseId, (value) => {
        const updated = {
          ...value,
          status: next,
          aldreteScore: next === 'PACU' ? 8 : value.aldreteScore,
          painScore: next === 'PACU' ? Math.max(2, value.painScore) : value.painScore,
        };
        return updated;
      });

      const transitionEvent: TimelineEventType =
        next === 'In OR'
          ? 'Patient In Room'
          : next === 'Closing'
          ? 'Closure'
          : next === 'PACU'
          ? 'PACU Transfer'
          : 'Critical Event';

      addTimelineEvent({
        caseId,
        time: new Date().toISOString(),
        type: transitionEvent,
        note: `${current.caseNo} moved to ${next}.`,
        by: role,
      });

      showToast(`${current.caseNo} moved to ${next}.`, 'success');
    },
    [addTimelineEvent, role, showToast, surgeryCases, updateCaseById]
  );

  const handleChecklistToggle = React.useCallback(
    (caseId: string, key: keyof PreOpChecklist) => {
      updateCaseById(caseId, (item) => {
        const nextChecklist = {
          ...item.checklist,
          [key]: !item.checklist[key],
        };
        return { ...item, checklist: nextChecklist };
      });
    },
    [updateCaseById]
  );

  const handleScheduleCase = React.useCallback(() => {
    if (!scheduleForm.patientName || !scheduleForm.mrn || !scheduleForm.procedure || !scheduleForm.surgeon) {
      showToast('Patient, MRN, Procedure, and Surgeon are required.', 'warning');
      return;
    }

    const scheduledDate = new Date(scheduleForm.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      showToast('Please provide a valid date and time.', 'warning');
      return;
    }

    const nextNumber = surgeryCases.length + 1;
    const newCase: SurgeryCase = {
      id: `ot-case-${Date.now()}`,
      caseNo: `OT-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`,
      patientName: scheduleForm.patientName.trim(),
      mrn: scheduleForm.mrn.trim(),
      ageGender: scheduleForm.ageGender.trim() || '--',
      diagnosis: scheduleForm.diagnosis.trim() || '--',
      procedure: scheduleForm.procedure.trim(),
      specialty: scheduleForm.specialty,
      surgeon: scheduleForm.surgeon.trim(),
      anesthetist: scheduleForm.anesthetist.trim() || '--',
      roomId: scheduleForm.roomId,
      scheduledAt: scheduledDate.toISOString(),
      estimatedMinutes: Math.max(30, Number(scheduleForm.estimatedMinutes) || 120),
      asaClass: scheduleForm.asaClass,
      priority: scheduleForm.priority,
      status: 'Scheduled',
      checklist: {
        consentSigned: false,
        npoConfirmed: false,
        siteMarked: false,
        labsVerified: false,
        imagingReady: false,
        anesthesiaCleared: false,
        bloodReady: Number(scheduleForm.bloodUnits) > 0 ? false : true,
      },
      bloodUnits: Math.max(0, Number(scheduleForm.bloodUnits) || 0),
      implants: [],
      pacuBed: scheduleForm.pacuBed.trim() || 'PACU-01',
      painScore: 0,
      aldreteScore: 0,
      notes: 'Case created from OpTime OR schedule workflow.',
    };

    setSurgeryCases((prev) => [...prev, newCase]);
    setSelectedCaseId(newCase.id);
    setScheduleDialogOpen(false);
    setScheduleForm(defaultScheduleForm(scheduleForm.roomId));
    showToast(`${newCase.caseNo} scheduled successfully.`, 'success');
  }, [scheduleForm, showToast, surgeryCases.length]);

  const openTeamDialog = React.useCallback(() => {
    if (!selectedCase) return;
    const room = rooms.find((item) => item.id === selectedCase.roomId);
    setTeamForm({
      surgeon: selectedCase.surgeon,
      anesthetist: selectedCase.anesthetist,
      nurseLead: room?.nurseLead ?? '',
      pacuBed: selectedCase.pacuBed,
    });
    setTeamDialogOpen(true);
  }, [rooms, selectedCase]);

  const handleSaveTeam = React.useCallback(() => {
    if (!selectedCase) return;

    updateCaseById(selectedCase.id, (item) => ({
      ...item,
      surgeon: teamForm.surgeon.trim() || item.surgeon,
      anesthetist: teamForm.anesthetist.trim() || item.anesthetist,
      pacuBed: teamForm.pacuBed.trim() || item.pacuBed,
    }));

    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedCase.roomId
          ? { ...room, nurseLead: teamForm.nurseLead.trim() || room.nurseLead }
          : room
      )
    );

    setTeamDialogOpen(false);
    showToast(`Team assignment updated for ${selectedCase.caseNo}.`, 'success');
  }, [selectedCase, showToast, teamForm, updateCaseById]);

  const handleAddTimeline = React.useCallback(() => {
    if (!selectedCase) return;
    if (!timelineForm.note.trim()) {
      showToast('Timeline note is required.', 'warning');
      return;
    }

    const eventTime = new Date(timelineForm.time);
    if (Number.isNaN(eventTime.getTime())) {
      showToast('Please select a valid timeline time.', 'warning');
      return;
    }

    addTimelineEvent({
      caseId: selectedCase.id,
      time: eventTime.toISOString(),
      type: timelineForm.type,
      note: timelineForm.note.trim(),
      by: timelineForm.by.trim() || role,
    });

    setTimelineDialogOpen(false);
    setTimelineForm({
      type: 'Incision',
      time: getLocalInputDateTime(new Date()),
      note: '',
      by: '',
    });
    showToast(`Timeline updated for ${selectedCase.caseNo}.`, 'success');
  }, [addTimelineEvent, role, selectedCase, showToast, timelineForm]);

  const handleCancelCase = React.useCallback(() => {
    if (!selectedCase) return;
    if (!cancelReason.trim()) {
      showToast('Cancellation reason is required.', 'warning');
      return;
    }

    updateCaseById(selectedCase.id, (item) => ({
      ...item,
      status: 'Cancelled',
      notes: `${item.notes} | Cancel reason: ${cancelReason.trim()}`,
    }));

    addTimelineEvent({
      caseId: selectedCase.id,
      time: new Date().toISOString(),
      type: 'Critical Event',
      note: `Case cancelled: ${cancelReason.trim()}`,
      by: role,
    });

    setCancelDialogOpen(false);
    setCancelReason('');
    showToast(`${selectedCase.caseNo} cancelled.`, 'warning');
  }, [addTimelineEvent, cancelReason, role, selectedCase, showToast, updateCaseById]);

  const handleConsentToggle = React.useCallback((phase: ConsentPhase, itemLabel: string) => {
    setConsentChecklist((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [itemLabel]: !prev[phase][itemLabel],
      },
    }));
  }, []);

  const updateSelectedAnaesthesiaPlan = React.useCallback(
    (patch: Partial<AnaesthesiaPlanForm>) => {
      if (!selectedCase) return;
      setAnaesthesiaPlans((prev) => ({
        ...prev,
        [selectedCase.id]: {
          ...(prev[selectedCase.id] ?? defaultAnaesthesiaPlan(selectedCase)),
          ...patch,
        },
      }));
    },
    [selectedCase]
  );

  const updateSelectedPostOpNote = React.useCallback(
    (patch: Partial<PostOpNoteForm>) => {
      if (!selectedCase) return;
      setPostOpNotes((prev) => ({
        ...prev,
        [selectedCase.id]: {
          ...(prev[selectedCase.id] ?? defaultPostOpNote()),
          ...patch,
        },
      }));
    },
    [selectedCase]
  );

  const handleSaveAnaesthesiaPlan = React.useCallback(() => {
    if (!selectedCase) return;
    setAnaesthesiaPlans((prev) => ({
      ...prev,
      [selectedCase.id]: selectedAnaesthesiaPlan,
    }));
    showToast(`Anaesthesia plan saved for ${selectedCase.caseNo}.`, 'success');
  }, [selectedAnaesthesiaPlan, selectedCase, showToast]);

  const handleSavePostOpNote = React.useCallback(() => {
    if (!selectedCase) return;
    const note = postOpNotes[selectedCase.id];
    if (!note?.summary?.trim()) {
      showToast('Post-op summary is required before save.', 'warning');
      return;
    }
    showToast(`Post-op note saved for ${selectedCase.caseNo}.`, 'success');
  }, [postOpNotes, selectedCase, showToast]);

  const handleIndentSubmit = React.useCallback(() => {
    if (!indentForm.item.trim() || Number(indentForm.qty) <= 0) {
      showToast('Item and valid quantity are required for indent.', 'warning');
      return;
    }
    setIndentDialogOpen(false);
    setIndentForm({
      item: '',
      qty: '1',
      priority: 'Routine',
      note: '',
    });
    showToast('Indent request submitted to stores.', 'success');
  }, [indentForm, showToast]);

  const prepCases = React.useMemo(
    () =>
      surgeryCases
        .filter((item) => item.status === 'Scheduled' || item.status === 'Pre-Op')
        .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)),
    [surgeryCases]
  );

  const intraOpCases = React.useMemo(
    () =>
      surgeryCases
        .filter((item) => item.status === 'In OR' || item.status === 'Closing')
        .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)),
    [surgeryCases]
  );

  const recoveryCases = React.useMemo(
    () =>
      surgeryCases
        .filter((item) => item.status === 'PACU' || item.status === 'Completed')
        .sort((a, b) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt)),
    [surgeryCases]
  );

  const actionRouteConfig = React.useMemo(
    () => [
      { label: 'Anesthesia', route: '/clinical/modules/anesthesia', icon: <MonitorHeartIcon fontSize="small" /> },
      { label: 'Radiant', route: '/clinical/modules/radiant', icon: <ScienceIcon fontSize="small" /> },
      { label: 'Beaker', route: '/clinical/modules/beaker', icon: <BiotechIcon fontSize="small" /> },
      { label: 'IPD Rounds', route: '/ipd/rounds', icon: <HealingIcon fontSize="small" /> },
      { label: 'Billing', route: '/clinical/modules/resolute-billing', icon: <QueryStatsIcon fontSize="small" /> },
    ],
    []
  );

  return (
    <PageTemplate title="OpTime" currentPageTitle="Operating Room">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="OpTime - Surgical Workflow"
          description="HIMS OT lifecycle: Dashboard, OT status, scheduling, pre-op, consent, anaesthesia, intra-op, PACU, post-op, staff, inventory, billing, and reports."
          chips={[
            { label: 'Surgery', color: 'primary' },
            { label: 'Live UI', color: 'success', variant: 'outlined' },
            { label: 'Role: ' + role, variant: 'outlined' },
          ]}
          actions={
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => openTab('anaesthesia')}
                endIcon={<MonitorHeartIcon fontSize="small" />}
              >
                Anaesthesia Plan
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setScheduleForm(defaultScheduleForm(rooms[0]?.id ?? 'or-1'));
                  setScheduleDialogOpen(true);
                }}
                startIcon={<AddCircleOutlineIcon fontSize="small" />}
              >
                Schedule Case
              </Button>
            </>
          }
        />

        <Card elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CommonTabs
            tabs={MENU_GROUPS.map((menu) => ({
              ...menu,
              icon: MENU_ICON_MAP[menu.id],
            }))}
            value={menuGroup}
            onChange={setMenuGroup}
            variant="scrollable"
            allowScrollButtonsMobile
          />
        </Card>

        <Stack spacing={2}>
              {menuGroup === 'dashboard' ? (
                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={6} md={4} lg={2.4}>
                    <StatTile
                      label="Operational Cases"
                      value={totalOperationalCases}
                      subtitle="Excluding cancelled"
                      icon={<LocalHospitalIcon fontSize="small" />}
                      tone="info"
                      variant="soft"
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={2.4}>
                    <StatTile
                      label="Active in OR"
                      value={activeOrCases}
                      subtitle="Incision/closure"
                      icon={<TimelineIcon fontSize="small" />}
                      tone="primary"
                      variant="soft"
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={2.4}>
                    <StatTile
                      label="PACU Queue"
                      value={pacuCases}
                      subtitle="Awaiting handoff"
                      icon={<MonitorHeartIcon fontSize="small" />}
                      tone="success"
                      variant="soft"
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={6} lg={2.4}>
                    <StatTile
                      label="Delayed Starts"
                      value={delayedCases}
                      subtitle="Behind schedule"
                      icon={<WarningAmberIcon fontSize="small" />}
                      tone="warning"
                      variant="soft"
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={6} lg={2.4}>
                    <StatTile
                      label="Case Completion"
                      value={`${completionRate}%`}
                      subtitle={`${completedCases} completed`}
                      icon={<CheckCircleIcon fontSize="small" />}
                      tone="success"
                      variant="soft"
                    />
                  </Grid>
                </Grid>
              ) : null}

              {menuGroup === 'dashboard' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="OT Dashboard Overview" subtitle="Current running, completed, and pending surgical workload">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Procedure</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>OT</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCases.slice(0, 6).map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          selected={selectedCaseId === item.id}
                          onClick={() => setSelectedCaseId(item.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.caseNo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.patientName} • {item.mrn}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.procedure}</TableCell>
                          <TableCell>{rooms.find((room) => room.id === item.roomId)?.label ?? item.roomId}</TableCell>
                          <TableCell>{formatTime(item.scheduledAt)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={item.status} color={STATUS_COLOR[item.status]} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" onClick={() => openTab('scheduling')}>
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <Stack spacing={2}>
                <WorkflowSectionCard title="OT Alerts" subtitle="Priority operational focus">
                  <Stack spacing={1}>
                    <Alert severity={delayedCases > 0 ? 'warning' : 'success'}>
                      {delayedCases} delayed starts. Align transport and anaesthesia prep.
                    </Alert>
                    <Alert severity={preOpAtRiskCases > 0 ? 'error' : 'success'}>
                      {preOpAtRiskCases} pre-op risk cases pending checklist completion.
                    </Alert>
                    <Alert severity="info">
                      PACU active beds: {pacuCases}. Maintain handoff and medication reconciliation.
                    </Alert>
                  </Stack>
                </WorkflowSectionCard>
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'dashboard' ? (
          <WorkflowSectionCard title="OT Room Status - Live" subtitle="Occupancy, turnover, and next case visibility">
            <Grid container spacing={1.5}>
              {roomMetrics.map((metric) => (
                <Grid key={metric.room.id} xs={12} md={6} lg={4}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor:
                        metric.liveState === 'Occupied'
                          ? alpha(theme.palette.error.main, 0.32)
                          : metric.liveState === 'Turnover'
                          ? alpha(theme.palette.warning.main, 0.32)
                          : 'divider',
                      backgroundColor:
                        metric.liveState === 'Occupied'
                          ? alpha(theme.palette.error.main, 0.05)
                          : metric.liveState === 'Turnover'
                          ? alpha(theme.palette.warning.main, 0.07)
                          : 'background.paper',
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {metric.room.label}
                        </Typography>
                        <Chip size="small" label={metric.liveState} color={ROOM_STATE_COLOR[metric.liveState]} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {metric.room.suite} • {metric.room.specialty}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nurse Lead: {metric.room.nurseLead}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active: {metric.activeCase ? `${metric.activeCase.caseNo} (${metric.activeCase.patientName})` : 'No active case'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Next: {metric.nextCase ? `${metric.nextCase.caseNo} at ${formatTime(metric.nextCase.scheduledAt)}` : 'No scheduled case'}
                      </Typography>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Utilization {Math.max(0, Math.min(100, metric.utilization))}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.max(0, Math.min(100, metric.utilization))}
                          sx={{ mt: 0.5, height: 6, borderRadius: 999 }}
                        />
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => openTab('scheduling')}>
                        View Cases
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </WorkflowSectionCard>
        ) : null}

        {menuGroup === 'scheduling' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard
                title="Today's OR Case Board"
                subtitle="Real-time surgical queue with progression controls"
                action={
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search case, patient, procedure"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      size="small"
                      select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'All' | SurgeryStatus)}
                      sx={{ minWidth: 130 }}
                    >
                      {['All', 'Scheduled', 'Pre-Op', 'In OR', 'Closing', 'PACU', 'Completed', 'Cancelled'].map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      select
                      value={roomFilter}
                      onChange={(event) => setRoomFilter(event.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="All">All Rooms</MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value as 'All' | SurgeryPriority)}
                      sx={{ minWidth: 120 }}
                    >
                      {['All', 'STAT', 'Urgent', 'Elective'].map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                }
              >
                <TableContainer>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Procedure</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Prep</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCases.map((item) => {
                        const readiness = checklistCompletion(item.checklist);
                        const nextStatus = NEXT_STATUS[item.status];
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={selectedCaseId === item.id}
                            onClick={() => setSelectedCaseId(item.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{formatTime(item.scheduledAt)}</TableCell>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {item.caseNo}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.patientName} • {item.mrn}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item.procedure}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.specialty}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" display="block">
                                {item.surgeon}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.anesthetist}
                              </Typography>
                            </TableCell>
                            <TableCell>{rooms.find((room) => room.id === item.roomId)?.label ?? item.roomId}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.priority} color={PRIORITY_COLOR[item.priority]} />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status} color={STATUS_COLOR[item.status]} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {readiness}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={readiness}
                                sx={{ mt: 0.5, height: 6, borderRadius: 99 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant={selectedCaseId === item.id ? 'contained' : 'outlined'}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedCaseId(item.id);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={!nextStatus}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleTransition(item.id);
                                  }}
                                >
                                  {nextStatus ? NEXT_STATUS_LABEL[item.status] : 'Closed'}
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <Stack spacing={2}>
                <WorkflowSectionCard title="OR Room Control Tower" subtitle="Room-wise occupancy and next case">
                  <Stack spacing={1.25}>
                    {roomMetrics.map((metric) => (
                      <Card
                        key={metric.room.id}
                        elevation={0}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor:
                            metric.liveState === 'Occupied'
                              ? alpha(theme.palette.error.main, 0.28)
                              : metric.liveState === 'Turnover'
                              ? alpha(theme.palette.warning.main, 0.35)
                              : 'divider',
                          backgroundColor:
                            metric.liveState === 'Occupied'
                              ? alpha(theme.palette.error.main, 0.05)
                              : metric.liveState === 'Turnover'
                              ? alpha(theme.palette.warning.main, 0.06)
                              : 'background.paper',
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {metric.room.label}
                            </Typography>
                            <Chip size="small" label={metric.liveState} color={ROOM_STATE_COLOR[metric.liveState]} />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {metric.room.suite} • {metric.room.specialty}
                          </Typography>
                          {metric.activeCase ? (
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Live: {metric.activeCase.caseNo} ({metric.activeCase.procedure})
                              </Typography>
                            </Alert>
                          ) : null}
                          <Typography variant="caption" color="text.secondary">
                            Nurse Lead: {metric.room.nurseLead}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Next Case: {metric.nextCase ? `${metric.nextCase.caseNo} at ${formatTime(metric.nextCase.scheduledAt)}` : 'No pending case'}
                          </Typography>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Utilization: {Math.max(0, Math.min(100, metric.utilization))}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.max(0, Math.min(100, metric.utilization))}
                              sx={{ mt: 0.5, height: 6, borderRadius: 99 }}
                            />
                          </Box>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </WorkflowSectionCard>

                <WorkflowSectionCard
                  title="Selected Case Snapshot"
                  subtitle="HIMS cross-module actions"
                  action={
                    <Button size="small" variant="outlined" onClick={openTeamDialog} disabled={!selectedCase}>
                      Assign Team
                    </Button>
                  }
                >
                  {selectedCase ? (
                    <Stack spacing={1.5}>
                      <Stack direction="row" flexWrap="wrap" spacing={0.75}>
                        <Chip size="small" label={selectedCase.caseNo} color="primary" />
                        <Chip size="small" label={selectedCase.priority} color={PRIORITY_COLOR[selectedCase.priority]} />
                        <Chip size="small" label={selectedCase.status} color={STATUS_COLOR[selectedCase.status]} />
                        <Chip size="small" label={selectedCase.asaClass} variant="outlined" />
                      </Stack>

                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {selectedCase.patientName} • {selectedCase.ageGender}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          MRN: {selectedCase.mrn}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {selectedCase.procedure}
                        </Typography>
                      </Box>

                      <Divider />

                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          Linked Modules
                        </Typography>
                        <Grid container spacing={1}>
                          {actionRouteConfig.map((action) => (
                            <Grid key={action.route} xs={12} sm={6}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={action.icon}
                                onClick={() => routeTo(action.route, selectedCase.mrn)}
                                disabled={!canAccessRoute(action.route, permissions)}
                              >
                                {action.label}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleTransition(selectedCase.id)}
                          disabled={!NEXT_STATUS[selectedCase.status]}
                        >
                          {NEXT_STATUS[selectedCase.status] ? NEXT_STATUS_LABEL[selectedCase.status] : 'No Transition'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setCancelDialogOpen(true)}
                          disabled={selectedCase.status === 'Completed' || selectedCase.status === 'Cancelled'}
                        >
                          Cancel Case
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Select a case from OR Board.
                    </Typography>
                  )}
                </WorkflowSectionCard>
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'pre-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Pre-Op Readiness Queue" subtitle="Checklist compliance before room entry">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Scheduled</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Readiness</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Gap</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prepCases.map((item) => {
                        const readiness = checklistCompletion(item.checklist);
                        const pending = CHECKLIST_ITEMS.filter((entry) => !item.checklist[entry.key]);
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={selectedCaseId === item.id}
                            onClick={() => setSelectedCaseId(item.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.caseNo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.patientName}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDateTime(item.scheduledAt)}</TableCell>
                            <TableCell>
                              <Typography variant="caption" display="block">
                                {item.surgeon}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.anesthetist}
                              </Typography>
                            </TableCell>
                            <TableCell>{rooms.find((room) => room.id === item.roomId)?.label ?? item.roomId}</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {readiness}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={readiness}
                                color={readiness >= 85 ? 'success' : readiness >= 65 ? 'warning' : 'error'}
                                sx={{ mt: 0.5, height: 6, borderRadius: 99 }}
                              />
                            </TableCell>
                            <TableCell>
                              {pending.length === 0 ? (
                                <Chip size="small" label="Ready" color="success" />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  {pending.slice(0, 2).map((item) => item.label).join(', ')}
                                  {pending.length > 2 ? ` +${pending.length - 2}` : ''}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard
                title="Pre-Op Checklist Workspace"
                subtitle="Toggle readiness markers per selected case"
                action={
                  <Button size="small" variant="outlined" onClick={openTeamDialog} disabled={!selectedCase}>
                    Update Team
                  </Button>
                }
              >
                {selectedCase ? (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedCase.caseNo} • {selectedCase.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCase.procedure}
                      </Typography>
                    </Box>

                    <Grid container spacing={1}>
                      {CHECKLIST_ITEMS.map((item) => {
                        const checked = selectedCase.checklist[item.key];
                        return (
                          <Grid key={item.key} xs={12} md={6}>
                            <Card
                              elevation={0}
                              sx={{
                                p: 1,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: checked
                                  ? alpha(theme.palette.success.main, 0.35)
                                  : alpha(theme.palette.warning.main, 0.25),
                                backgroundColor: checked
                                  ? alpha(theme.palette.success.main, 0.08)
                                  : alpha(theme.palette.warning.main, 0.06),
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <FormControlLabel
                                  sx={{ m: 0 }}
                                  control={
                                    <Checkbox
                                      checked={checked}
                                      color={checked ? 'success' : item.critical ? 'warning' : 'primary'}
                                      onChange={() => handleChecklistToggle(selectedCase.id, item.key)}
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {item.label}
                                    </Typography>
                                  }
                                />
                                {item.critical ? <Chip size="small" label="Critical" color="warning" variant="outlined" /> : null}
                              </Stack>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Completion {checklistCompletion(selectedCase.checklist)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={checklistCompletion(selectedCase.checklist)}
                        color={checklistCompletion(selectedCase.checklist) >= 85 ? 'success' : 'warning'}
                        sx={{ mt: 0.5, height: 8, borderRadius: 999 }}
                      />
                    </Box>

                    {checklistCompletion(selectedCase.checklist) < 80 ? (
                      <Alert severity="warning">
                        <Typography variant="body2">
                          Case is not fully ready for OR transfer. Resolve pending checklist items before induction.
                        </Typography>
                      </Alert>
                    ) : (
                      <Alert severity="success">
                        <Typography variant="body2">Pre-op checklist target achieved. Case is ready for theatre transfer.</Typography>
                      </Alert>
                    )}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="contained"
                        disabled={selectedCase.status !== 'Pre-Op' || checklistCompletion(selectedCase.checklist) < 80}
                        onClick={() => handleTransition(selectedCase.id)}
                      >
                        Move to OR
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => routeTo('/clinical/modules/radiant', selectedCase.mrn)}
                      >
                        Verify Imaging
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => routeTo('/clinical/modules/beaker', selectedCase.mrn)}
                      >
                        Verify Labs
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a case from prep queue.
                  </Typography>
                )}
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'pre-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="OT Safety Checklist (WHO)" subtitle="Sign In, Time Out, Sign Out compliance">
                <Stack spacing={1.25}>
                  <CommonTabs
                    tabs={(['Sign In', 'Time Out', 'Sign Out'] as ConsentPhase[]).map((phase) => ({
                      id: phase,
                      label: phase,
                    }))}
                    value={consentPhase}
                    onChange={setConsentPhase}
                    variant="standard"
                  />

                  <Divider />

                  <Stack spacing={1}>
                    {CONSENT_TEMPLATE[consentPhase].map((item) => {
                      const checked = consentChecklist[consentPhase][item];
                      return (
                        <Card
                          key={item}
                          elevation={0}
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: checked
                              ? alpha(theme.palette.success.main, 0.35)
                              : alpha(theme.palette.warning.main, 0.25),
                            backgroundColor: checked
                              ? alpha(theme.palette.success.main, 0.08)
                              : alpha(theme.palette.warning.main, 0.08),
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Checkbox
                                  checked={checked}
                                  color={checked ? 'success' : 'warning'}
                                  onChange={() => handleConsentToggle(consentPhase, item)}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item}
                                </Typography>
                              }
                            />
                            <Chip
                              size="small"
                              label={checked ? 'Done' : 'Pending'}
                              color={checked ? 'success' : 'warning'}
                              variant={checked ? 'filled' : 'outlined'}
                            />
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                </Stack>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Checklist Status" subtitle="OT entry safety gate">
                <Stack spacing={1.25}>
                  <Typography variant="caption" color="text.secondary">
                    Current phase completion: {consentPhaseCompletion}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={consentPhaseCompletion}
                    sx={{ height: 7, borderRadius: 999 }}
                    color={consentPhaseCompletion >= 90 ? 'success' : 'warning'}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Overall WHO checklist: {consentOverallCompletion}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={consentOverallCompletion}
                    sx={{ height: 7, borderRadius: 999 }}
                    color={consentOverallCompletion >= 85 ? 'success' : 'warning'}
                  />

                  <Alert severity={consentOverallCompletion >= 85 ? 'success' : 'warning'}>
                    {consentOverallCompletion >= 85
                      ? 'Checklist compliance is acceptable for OT workflow.'
                      : 'Complete pending checklist items before case transfer.'}
                  </Alert>

                  <Button size="small" variant="contained" onClick={() => showToast('WHO checklist saved successfully.', 'success')}>
                    Save Checklist
                  </Button>
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'pre-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Anaesthesia Plan" subtitle="Perioperative plan and intra-op monitoring strategy">
                {selectedCase ? (
                  <Stack spacing={1.25}>
                    <Alert severity="info">
                      {selectedCase.caseNo} • {selectedCase.patientName} • {selectedCase.asaClass}
                    </Alert>

                    <Grid container spacing={1.25}>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Technique"
                          value={selectedAnaesthesiaPlan.technique}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ technique: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Airway Plan"
                          value={selectedAnaesthesiaPlan.airwayPlan}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ airwayPlan: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Induction Agent"
                          value={selectedAnaesthesiaPlan.inductionAgent}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ inductionAgent: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Maintenance"
                          value={selectedAnaesthesiaPlan.maintenance}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ maintenance: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Analgesia Plan"
                          value={selectedAnaesthesiaPlan.analgesia}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ analgesia: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Anaesthesia Notes"
                          multiline
                          minRows={3}
                          value={selectedAnaesthesiaPlan.notes}
                          onChange={(event) => updateSelectedAnaesthesiaPlan({ notes: event.target.value })}
                        />
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={handleSaveAnaesthesiaPlan}>
                        Save Plan
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => routeTo('/clinical/modules/radiant', selectedCase.mrn)}
                      >
                        Review Imaging
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a case from Scheduling to prepare anaesthesia plan.
                  </Typography>
                )}
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Anaesthesia Safety Snapshot" subtitle="Monitoring readiness before induction">
                {selectedCase ? (
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        ASA Class
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedCase.asaClass}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Blood Units Planned
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedCase.bloodUnits}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Consent Check
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedCase.checklist.consentSigned ? 'Completed' : 'Pending'}
                        color={selectedCase.checklist.consentSigned ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        NPO Check
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedCase.checklist.npoConfirmed ? 'Confirmed' : 'Pending'}
                        color={selectedCase.checklist.npoConfirmed ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Alert severity={selectedCase.checklist.anesthesiaCleared ? 'success' : 'warning'}>
                      {selectedCase.checklist.anesthesiaCleared
                        ? 'Anaesthesia clearance recorded.'
                        : 'Anaesthesia clearance pending.'}
                    </Alert>
                  </Stack>
                ) : null}
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'intra-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Active Intra-Op Cases" subtitle="Live operations and closure workflow">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Procedure</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Incision</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {intraOpCases.map((item) => {
                        const incisionEvent = (eventsByCase[item.id] ?? []).find((entry) => entry.type === 'Incision');
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={selectedCaseId === item.id}
                            onClick={() => setSelectedCaseId(item.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{rooms.find((room) => room.id === item.roomId)?.label ?? item.roomId}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.caseNo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.patientName}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.procedure}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status} color={STATUS_COLOR[item.status]} />
                            </TableCell>
                            <TableCell>{incisionEvent ? formatTime(incisionEvent.time) : '--'}</TableCell>
                            <TableCell>
                              <Button size="small" variant="text" onClick={() => handleTransition(item.id)}>
                                {NEXT_STATUS_LABEL[item.status] ?? 'Update'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard
                title="Intra-Op Timeline"
                subtitle="Chronological case events"
                action={
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={() => {
                      setTimelineForm((prev) => ({ ...prev, time: getLocalInputDateTime(new Date()) }));
                      setTimelineDialogOpen(true);
                    }}
                    disabled={!selectedCase}
                  >
                    Add Event
                  </Button>
                }
              >
                {selectedCase ? (
                  <Stack spacing={1.25}>
                    <Stack direction="row" flexWrap="wrap" spacing={0.75}>
                      <Chip size="small" label={selectedCase.caseNo} color="primary" />
                      <Chip size="small" label={selectedCase.status} color={STATUS_COLOR[selectedCase.status]} />
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {selectedCase.procedure} • {selectedCase.surgeon}
                    </Typography>

                    <Divider />

                    <Stack spacing={1}>
                      {selectedCaseEvents.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No timeline entries for this case yet.
                        </Typography>
                      ) : (
                        selectedCaseEvents.map((entry) => (
                          <Card
                            key={entry.id}
                            elevation={0}
                            sx={{
                              p: 1.25,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.14),
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip size="small" label={entry.type} color="info" variant="outlined" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(entry.time)}
                                </Typography>
                              </Stack>
                              <Typography variant="body2">{entry.note}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                By {entry.by}
                              </Typography>
                            </Stack>
                          </Card>
                        ))
                      )}
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button size="small" variant="outlined" onClick={() => routeTo('/clinical/modules/beaker', selectedCase.mrn)}>
                        Send to Beaker
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => routeTo('/clinical/modules/radiant', selectedCase.mrn)}>
                        Open Radiant
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select an active intra-op case.
                  </Typography>
                )}
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'intra-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="PACU & Handoff Queue" subtitle="Post-op monitoring and closure handoff">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>PACU Bed</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Aldrete</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pain</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Last Update</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recoveryCases.map((item) => {
                        const lastUpdate = (eventsByCase[item.id] ?? [])[0];
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={selectedCaseId === item.id}
                            onClick={() => setSelectedCaseId(item.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.caseNo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.patientName}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.pacuBed}</TableCell>
                            <TableCell>{item.aldreteScore || '--'}</TableCell>
                            <TableCell>{item.painScore || '--'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status} color={STATUS_COLOR[item.status]} />
                            </TableCell>
                            <TableCell>{lastUpdate ? formatDateTime(lastUpdate.time) : '--'}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={item.status !== 'PACU'}
                                onClick={() => handleTransition(item.id)}
                              >
                                Complete
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <Stack spacing={2}>
                <WorkflowSectionCard title="Handoff Quality Gate" subtitle="Minimum data before ward transfer">
                  <Stack spacing={1}>
                    <Alert severity="info">
                      <Typography variant="body2">PACU nurse sign-off and surgeon post-op note are mandatory.</Typography>
                    </Alert>
                    <Alert severity="success">
                      <Typography variant="body2">Medication reconciliation and pain plan linked to Willow and MAR.</Typography>
                    </Alert>
                    <Alert severity="warning">
                      <Typography variant="body2">Any pending critical lab/imaging must be acknowledged before discharge.</Typography>
                    </Alert>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button size="small" variant="outlined" onClick={() => routeTo('/clinical/modules/willow', selectedCase?.mrn)}>
                        Open Willow
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => routeTo('/clinical/modules/resolute-billing', selectedCase?.mrn)}
                      >
                        Open Billing
                      </Button>
                    </Stack>
                  </Stack>
                </WorkflowSectionCard>

                <WorkflowSectionCard title="Recovery Snapshot" subtitle="Module KPI for shift handover">
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        PACU Active
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {pacuCases}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Completed Handoffs
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {completedCases}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Pre-Op at Risk
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: preOpAtRiskCases > 0 ? 'warning.main' : 'success.main' }}>
                        {preOpAtRiskCases}
                      </Typography>
                    </Stack>
                  </Stack>
                </WorkflowSectionCard>
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'post-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Post-Op Closure Note" subtitle="Mandatory closure summary and transfer details">
                {selectedCase ? (
                  <Stack spacing={1.25}>
                    <Alert severity="info">
                      {selectedCase.caseNo} • {selectedCase.procedure} • {selectedCase.patientName}
                    </Alert>
                    <Grid container spacing={1.25}>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          label="Wound Closure Time"
                          InputLabelProps={{ shrink: true }}
                          value={selectedPostOpNote.woundClosureTime}
                          onChange={(event) => updateSelectedPostOpNote({ woundClosureTime: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          label="Patient Out Of OT"
                          InputLabelProps={{ shrink: true }}
                          value={selectedPostOpNote.outOfOtTime}
                          onChange={(event) => updateSelectedPostOpNote({ outOfOtTime: event.target.value })}
                        />
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="Transfer To"
                          value={selectedPostOpNote.transferTo}
                          onChange={(event) =>
                            updateSelectedPostOpNote({
                              transferTo: event.target.value as PostOpNoteForm['transferTo'],
                            })
                          }
                        >
                          <MenuItem value="PACU">PACU</MenuItem>
                          <MenuItem value="ICU">ICU</MenuItem>
                          <MenuItem value="Ward">Ward</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Estimated OT Time"
                          value={`${selectedCase.estimatedMinutes} min`}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          minRows={3}
                          label="Post-Op Summary"
                          value={selectedPostOpNote.summary}
                          onChange={(event) => updateSelectedPostOpNote({ summary: event.target.value })}
                        />
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={handleSavePostOpNote}>
                        Save Post-Op Note
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => routeTo('/clinical/modules/resolute-billing', selectedCase.mrn)}
                      >
                        Send to Billing
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a case from Scheduling.
                  </Typography>
                )}
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Turnaround Snapshot" subtitle="OT turnaround and transfer visibility">
                {selectedCase ? (
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Scheduled Start
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatDateTime(selectedCase.scheduledAt)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Closure Logged
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedClosureEvent ? formatDateTime(selectedClosureEvent.time) : '--'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        PACU Bed
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedCase.pacuBed}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Chip size="small" label={selectedCase.status} color={STATUS_COLOR[selectedCase.status]} />
                    </Stack>
                    <Alert severity={selectedCase.status === 'Completed' ? 'success' : 'info'}>
                      {selectedCase.status === 'Completed'
                        ? 'Case fully closed and transferred.'
                        : 'Finalize post-op note before completion.'}
                    </Alert>
                  </Stack>
                ) : null}
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'post-op' ? (
          <WorkflowSectionCard title="OT Staff Roster" subtitle="Surgeons, anaesthesia, nursing and recovery coverage">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Specialty</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Shift</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned Unit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cases Today</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {STAFF_ROSTER.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.specialty}</TableCell>
                      <TableCell>{member.shift}</TableCell>
                      <TableCell>{member.assignedUnit}</TableCell>
                      <TableCell>{member.casesToday}</TableCell>
                      <TableCell>
                        <Chip size="small" label={member.status} color={staffStatusColor(member.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </WorkflowSectionCard>
        ) : null}

        {menuGroup === 'post-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard
                title="OT Inventory - Critical Items"
                subtitle="Consumables, implants and instruments for surgical continuity"
                action={
                  <Button size="small" variant="contained" onClick={() => setIndentDialogOpen(true)}>
                    Raise Indent
                  </Button>
                }
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Reorder</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {INVENTORY_ITEMS.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{item.item}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell>{item.reorderLevel}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            <Chip size="small" label={item.status} color={inventoryStatusColor(item.status)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Inventory Alerts" subtitle="Stock health for OT readiness">
                <Stack spacing={1}>
                  {INVENTORY_ITEMS.filter((item) => item.status !== 'Available').map((item) => (
                    <Alert key={item.id} severity={item.status === 'Out of Stock' ? 'error' : 'warning'}>
                      {item.item}: {item.status} ({item.stock} left)
                    </Alert>
                  ))}
                  <Button size="small" variant="outlined" onClick={() => routeTo('/inventory/items')}>
                    Open Central Inventory
                  </Button>
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'post-op' ? (
          <Grid container spacing={2}>
            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="OT Billing Summary" subtitle="Case-wise operation theatre charge components">
                {selectedCase && billingSnapshot ? (
                  <Stack spacing={1}>
                    <Alert severity="info">
                      {selectedCase.caseNo} • {selectedCase.patientName} • {selectedCase.procedure}
                    </Alert>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Charge Head</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount (INR)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {billingSnapshot.rows.map((row) => (
                            <TableRow key={row.label}>
                              <TableCell>{row.label}</TableCell>
                              <TableCell>{row.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Total OT Bill</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {billingSnapshot.total.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={() => showToast('OT bill generated successfully.', 'success')}>
                        Generate Bill
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => routeTo('/clinical/modules/resolute-billing', selectedCase.mrn)}>
                        Open Resolute Billing
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a case from Scheduling to view OT billing breakdown.
                  </Typography>
                )}
              </WorkflowSectionCard>
            </Grid>

            <Grid xs={12} lg={12}>
              <WorkflowSectionCard title="Daily Revenue Snapshot" subtitle="Live OT billing performance">
                <Stack spacing={1.25}>
                  <StatTile
                    label="Total OT Bills"
                    value={completedCases}
                    subtitle="Closed surgery cases"
                    tone="info"
                    variant="outlined"
                  />
                  <StatTile
                    label="Potential OT Revenue"
                    value={`₹${surgeryCases
                      .filter((item) => item.status !== 'Cancelled')
                      .reduce((sum, item) => sum + buildOtBillingRows(item).total, 0)
                      .toLocaleString('en-IN')}`}
                    subtitle="From today's active schedule"
                    tone="success"
                    variant="outlined"
                  />
                </Stack>
              </WorkflowSectionCard>
            </Grid>
          </Grid>
        ) : null}

        {menuGroup === 'dashboard' ? (
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid xs={12} sm={6} md={3}>
                <StatTile
                  label="Average Utilization"
                  value={`${utilizationAverage}%`}
                  subtitle="Across all OT rooms"
                  icon={<MeetingRoomIcon fontSize="small" />}
                  tone="primary"
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <StatTile
                  label="Long Cases"
                  value={longRunningCases}
                  subtitle=">= 3 hours"
                  icon={<TimelineIcon fontSize="small" />}
                  tone="warning"
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <StatTile
                  label="Cancelled Cases"
                  value={canceledCases}
                  subtitle="Same-day cancellations"
                  icon={<WarningAmberIcon fontSize="small" />}
                  tone="error"
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <StatTile
                  label="Prep Risk Cases"
                  value={preOpAtRiskCases}
                  subtitle="Checklist < 80%"
                  icon={<ChecklistIcon fontSize="small" />}
                  tone="info"
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid xs={12} lg={12}>
                <WorkflowSectionCard title="Room Utilization Matrix" subtitle="Block vs used hour visibility for OT manager">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Cases</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Planned</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Executed</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Utilization</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roomMetrics.map((metric) => (
                          <TableRow key={metric.room.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {metric.room.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {metric.room.suite}
                              </Typography>
                            </TableCell>
                            <TableCell>{metric.roomCases.length}</TableCell>
                            <TableCell>{formatHours(metric.plannedMinutes)}</TableCell>
                            <TableCell>{formatHours(metric.finishedMinutes)}</TableCell>
                            <TableCell sx={{ minWidth: 170 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {Math.max(0, Math.min(100, metric.utilization))}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.max(0, Math.min(100, metric.utilization))}
                                color={metric.utilization >= 75 ? 'success' : metric.utilization >= 50 ? 'warning' : 'error'}
                                sx={{ mt: 0.5, height: 6, borderRadius: 99 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={metric.liveState} color={ROOM_STATE_COLOR[metric.liveState]} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </WorkflowSectionCard>
              </Grid>

              <Grid xs={12} lg={12}>
                <WorkflowSectionCard title="Operational Insights" subtitle="Actionable alerts for OT command center">
                  <Stack spacing={1}>
                    <Alert severity={utilizationAverage < 70 ? 'warning' : 'success'}>
                      <Typography variant="body2">
                        Overall utilization {utilizationAverage}% {utilizationAverage < 70 ? '- review block planning and idle room windows.' : '- healthy throughput for current shift.'}
                      </Typography>
                    </Alert>
                    <Alert severity={delayedCases > 0 ? 'warning' : 'success'}>
                      <Typography variant="body2">
                        {delayedCases} delayed starts flagged. Re-align transport, anesthesia induction, and room turnover.
                      </Typography>
                    </Alert>
                    <Alert severity={preOpAtRiskCases > 0 ? 'error' : 'success'}>
                      <Typography variant="body2">
                        {preOpAtRiskCases} cases have incomplete prep checklist. Prioritize readiness closure before OT slot.
                      </Typography>
                    </Alert>
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={() => routeTo('/reports/analytics')}
                    >
                      Open Analytics
                    </Button>
                  </Stack>
                </WorkflowSectionCard>
              </Grid>
            </Grid>
          </Stack>
        ) : null}
      </Stack>
      </Stack>

      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Surgery Case</DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Patient Name"
                value={scheduleForm.patientName}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, patientName: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="MRN"
                value={scheduleForm.mrn}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, mrn: event.target.value.toUpperCase() }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Age / Gender"
                value={scheduleForm.ageGender}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, ageGender: event.target.value }))}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Diagnosis"
                value={scheduleForm.diagnosis}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Procedure"
                value={scheduleForm.procedure}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, procedure: event.target.value }))}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Specialty"
                value={scheduleForm.specialty}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, specialty: event.target.value }))}
              >
                {['General Surgery', 'Orthopedics', 'Neurosurgery', 'Cardiothoracic', 'Gynecology', 'ENT', 'Urology'].map(
                  (item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Surgeon"
                value={scheduleForm.surgeon}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, surgeon: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Anesthetist"
                value={scheduleForm.anesthetist}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, anesthetist: event.target.value }))}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="OT Room"
                value={scheduleForm.roomId}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, roomId: event.target.value }))}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.label} ({room.suite})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label="Scheduled Date/Time"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.scheduledAt}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Estimated Minutes"
                value={scheduleForm.estimatedMinutes}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, estimatedMinutes: event.target.value }))}
              />
            </Grid>

            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                select
                label="Priority"
                value={scheduleForm.priority}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, priority: event.target.value as SurgeryPriority }))}
              >
                {(['STAT', 'Urgent', 'Elective'] as SurgeryPriority[]).map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                select
                label="ASA"
                value={scheduleForm.asaClass}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    asaClass: event.target.value as SurgeryCase['asaClass'],
                  }))
                }
              >
                {(['ASA I', 'ASA II', 'ASA III', 'ASA IV'] as SurgeryCase['asaClass'][]).map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Blood Units"
                value={scheduleForm.bloodUnits}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, bloodUnits: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="PACU Bed"
                value={scheduleForm.pacuBed}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, pacuBed: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleCase} variant="contained">
            Create Case
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Surgical Team</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Surgeon"
              value={teamForm.surgeon}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, surgeon: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Anesthetist"
              value={teamForm.anesthetist}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, anesthetist: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Nurse Lead"
              value={teamForm.nurseLead}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, nurseLead: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="PACU Bed"
              value={teamForm.pacuBed}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, pacuBed: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTeam} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={timelineDialogOpen} onClose={() => setTimelineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Intra-Op Timeline Event</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Event Type"
              value={timelineForm.type}
              onChange={(event) =>
                setTimelineForm((prev) => ({
                  ...prev,
                  type: event.target.value as TimelineEventType,
                }))
              }
            >
              {(
                [
                  'Patient In Room',
                  'Incision',
                  'Specimen Sent',
                  'Implant',
                  'Blood Start',
                  'Closure',
                  'Critical Event',
                  'PACU Transfer',
                ] as TimelineEventType[]
              ).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="Event Time"
              InputLabelProps={{ shrink: true }}
              value={timelineForm.time}
              onChange={(event) => setTimelineForm((prev) => ({ ...prev, time: event.target.value }))}
            />

            <TextField
              fullWidth
              size="small"
              label="Updated By"
              value={timelineForm.by}
              onChange={(event) => setTimelineForm((prev) => ({ ...prev, by: event.target.value }))}
            />

            <TextField
              fullWidth
              size="small"
              label="Note"
              multiline
              minRows={3}
              value={timelineForm.note}
              onChange={(event) => setTimelineForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTimeline} variant="contained">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Surgical Case</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <Alert severity="warning">
              <Typography variant="body2">
                This action will mark the selected case as cancelled and log the reason in timeline.
              </Typography>
            </Alert>
            <TextField
              fullWidth
              size="small"
              label="Cancellation Reason"
              multiline
              minRows={3}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button onClick={handleCancelCase} variant="contained" color="error">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={indentDialogOpen} onClose={() => setIndentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Raise OT Indent Request</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Item Name"
              value={indentForm.item}
              onChange={(event) => setIndentForm((prev) => ({ ...prev, item: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Quantity"
              value={indentForm.qty}
              onChange={(event) => setIndentForm((prev) => ({ ...prev, qty: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              select
              label="Priority"
              value={indentForm.priority}
              onChange={(event) =>
                setIndentForm((prev) => ({
                  ...prev,
                  priority: event.target.value as IndentForm['priority'],
                }))
              }
            >
              <MenuItem value="Routine">Routine</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
              <MenuItem value="STAT">STAT</MenuItem>
            </TextField>
            <TextField
              fullWidth
              size="small"
              label="Notes"
              multiline
              minRows={3}
              value={indentForm.note}
              onChange={(event) => setIndentForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIndentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleIndentSubmit} variant="contained">
            Send Indent
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
