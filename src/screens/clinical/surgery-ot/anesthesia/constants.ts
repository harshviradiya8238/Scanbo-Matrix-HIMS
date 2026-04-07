import { alpha } from '@/src/ui/theme';
import { cardShadow } from '@/src/core/theme/tokens';
import { enterpriseCardSx } from '@/src/screens/clinical/components/EnterpriseUi';
import { WorkspaceTab, WorklistCase, WorklistFilter, WaveformMode } from './types';

export const TABS: Array<{ value: WorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'drugs', label: 'Drug Chart' },
  { value: 'flowsheet', label: 'Flowsheet' },
  { value: 'handoff', label: 'Team & Handoff' },
];

export const CASES: WorklistCase[] = [
  {
    id: 'case-001',
    room: 'OR-3',
    scheduledAt: '08:42',
    patientName: 'Rajan M. Patel',
    mrn: '00482918',
    ageGender: '52 / Male',
    procedure: 'Laparoscopic Cholecystectomy',
    diagnosis: 'Gallstone Disease',
    surgeon: 'Dr. Kirti Shah',
    anesthetist: 'Dr. Anil Mehta',
    asaClass: 'ASA II',
    status: 'In OR',
    duration: '01:47',
    fluidsInMl: '1350',
    bloodLossMl: '50',
    allergyTags: ['Morphine', 'Penicillin', 'Latex protocol'],
    vitals: { hr: '87', bp: '124/78', spo2: '99', etco2: '38', temp: '36.4', bis: '48' },
    ventilation: {
      o2Flow: '2.0 L/min',
      fio2: '60%',
      tidalVolume: '480 mL',
      rr: '12 /min',
      peep: '5 cmH2O',
      pip: '22 cmH2O',
    },
    checklist: [
      { step: 'Sign In complete', done: true, owner: 'OT Nurse' },
      { step: 'Time Out complete', done: true, owner: 'Surgeon + Anesthesia' },
      { step: 'Sign Out pending', done: false, owner: 'Anesthesia' },
    ],
    events: [
      { time: '08:42', text: 'Induction completed with Propofol + Fentanyl', tone: 'info' },
      { time: '08:48', text: 'Intubation successful, ETT 7.5 secured', tone: 'active' },
      { time: '09:10', text: 'Surgical incision started', tone: 'warning' },
      { time: '09:38', text: 'Hemodynamics stable, no vasopressor required', tone: 'active' },
    ],
    drugs: [
      { name: 'Propofol', route: 'IV', rate: '120 mcg/kg/min', status: 'Continuous', tone: 'active', time: '08:42' },
      { name: 'Fentanyl', route: 'IV', rate: '100 mcg bolus', status: 'Bolus', tone: 'warning', time: '08:42' },
      { name: 'Rocuronium', route: 'IV', rate: '50 mg bolus', status: 'Given', tone: 'info', time: '08:44' },
      { name: 'Paracetamol', route: 'IV', rate: '1 g infusion', status: 'Planned', tone: 'pending', time: '09:55' },
    ],
    flowsheetTimes: ['08:45', '09:00', '09:15', '09:30', '09:45', '10:00'],
    flowsheetRows: [
      { label: 'HR', values: ['86', '88', '85', '87', '89', '87'] },
      { label: 'NIBP', values: ['122/76', '124/78', '120/75', '126/80', '124/78', '122/76'] },
      { label: 'SpO2', values: ['99', '99', '98', '99', '99', '99'] },
      { label: 'EtCO2', values: ['37', '38', '38', '37', '38', '38'] },
      { label: 'Temp', values: ['36.5', '36.4', '36.4', '36.4', '36.5', '36.5'] },
    ],
    team: [
      { name: 'Dr. Anil Mehta', role: 'Anesthesiologist', initials: 'AM', color: '#2563eb' },
      { name: 'Dr. Kirti Shah', role: 'Surgeon', initials: 'KS', color: '#16a34a' },
      { name: 'Nurse Ritu', role: 'Scrub Nurse', initials: 'NR', color: '#ea580c' },
    ],
    notes: 'Case progressing smoothly. Continue current anesthetic depth and warm fluids.',
  },
  {
    id: 'case-002',
    room: 'OR-4',
    scheduledAt: '11:00',
    patientName: 'Sunita Desai',
    mrn: '00481077',
    ageGender: '67 / Female',
    procedure: 'Total Knee Replacement',
    diagnosis: 'Severe OA Knee',
    surgeon: 'Dr. Joshi',
    anesthetist: 'Dr. B. Patel',
    asaClass: 'ASA III',
    status: 'Pre-Op',
    duration: '00:00',
    fluidsInMl: '0',
    bloodLossMl: '0',
    allergyTags: ['Penicillin'],
    vitals: { hr: '82', bp: '136/84', spo2: '97', etco2: '-', temp: '36.6', bis: '-' },
    ventilation: {
      o2Flow: 'Planned',
      fio2: 'Planned',
      tidalVolume: 'Planned',
      rr: 'Planned',
      peep: 'Planned',
      pip: 'Planned',
    },
    checklist: [
      { step: 'Sign In complete', done: true, owner: 'OT Nurse' },
      { step: 'Regional anesthesia plan documented', done: true, owner: 'Anesthesia' },
      { step: 'Blood products crossmatched', done: false, owner: 'Blood Bank' },
    ],
    events: [{ time: '10:12', text: 'Final pre-op assessment underway', tone: 'pending' }],
    drugs: [],
    flowsheetTimes: [],
    flowsheetRows: [],
    team: [
      { name: 'Dr. B. Patel', role: 'Anesthesiologist', initials: 'BP', color: '#2563eb' },
      { name: 'Dr. Joshi', role: 'Orthopedic Surgeon', initials: 'DJ', color: '#16a34a' },
    ],
    notes: 'Awaiting blood availability confirmation before transfer to OR.',
  },
  {
    id: 'case-003',
    room: 'PACU-1',
    scheduledAt: '10:05',
    patientName: 'Priya Singh',
    mrn: '00475621',
    ageGender: '32 / Female',
    procedure: 'Laparoscopic Appendectomy',
    diagnosis: 'Acute Appendicitis',
    surgeon: 'Dr. Verma',
    anesthetist: 'Dr. Anil Mehta',
    asaClass: 'ASA I',
    status: 'PACU',
    duration: '01:05',
    fluidsInMl: '850',
    bloodLossMl: '20',
    allergyTags: ['None'],
    vitals: { hr: '80', bp: '112/72', spo2: '99', etco2: '-', temp: '36.8', bis: '-' },
    ventilation: {
      o2Flow: 'Nasal O2 2 L/min',
      fio2: 'NA',
      tidalVolume: 'NA',
      rr: '18 /min',
      peep: 'NA',
      pip: 'NA',
    },
    checklist: [
      { step: 'Sign In complete', done: true, owner: 'OT Nurse' },
      { step: 'Time Out complete', done: true, owner: 'Team' },
      { step: 'Sign Out complete', done: true, owner: 'Anesthesia' },
    ],
    events: [{ time: '10:05', text: 'Transferred to PACU, extubated and stable', tone: 'active' }],
    drugs: [{ name: 'Paracetamol', route: 'IV', rate: '1 g', status: 'Given', tone: 'completed', time: '09:55' }],
    flowsheetTimes: [],
    flowsheetRows: [],
    team: [{ name: 'Nurse Kavya', role: 'PACU Nurse', initials: 'NK', color: '#ea580c' }],
    notes: 'Aldrete 9/10. Plan transfer to ward in 30 minutes.',
  },
  {
    id: 'case-004',
    room: 'OR-5',
    scheduledAt: '13:30',
    patientName: 'Rajiv Nair',
    mrn: '00490081',
    ageGender: '29 / Male',
    procedure: 'Inguinal Hernia Repair',
    diagnosis: 'Right Inguinal Hernia',
    surgeon: 'Dr. Khan',
    anesthetist: 'Dr. R. Shah',
    asaClass: 'ASA I',
    status: 'Scheduled',
    duration: '00:00',
    fluidsInMl: '0',
    bloodLossMl: '0',
    allergyTags: ['None'],
    vitals: { hr: '76', bp: '122/78', spo2: '99', etco2: '-', temp: '36.5', bis: '-' },
    ventilation: {
      o2Flow: 'Planned',
      fio2: 'Planned',
      tidalVolume: 'Planned',
      rr: 'Planned',
      peep: 'Planned',
      pip: 'Planned',
    },
    checklist: [{ step: 'Case briefing pending', done: false, owner: 'OT Team' }],
    events: [{ time: '11:40', text: 'Case queued in OR scheduler', tone: 'info' }],
    drugs: [],
    flowsheetTimes: [],
    flowsheetRows: [],
    team: [{ name: 'Dr. R. Shah', role: 'Anesthesiologist', initials: 'RS', color: '#2563eb' }],
    notes: 'Awaiting previous case turnover.',
  },
];

export const FILTER_OPTIONS: Array<{ value: WorklistFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'in-or', label: 'In OR' },
  { value: 'pre-op', label: 'Pre-Op' },
  { value: 'pacu', label: 'PACU' },
  { value: 'scheduled', label: 'Scheduled' },
];

export const UI_THEME = {
  shellBg: '#fafbfb',
  panelBg: '#ffffff',
  panelSoft: alpha('#1172BA', 0.04),
  border: alpha('#1172BA', 0.14),
  borderStrong: alpha('#1172BA', 0.22),
  text: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#99abb4',
  primary: '#1172BA',
  success: '#2FA77A',
  warning: '#C9931E',
  danger: '#C45757',
  violet: '#6f52d8',
  waveform: '#0b2e53',
  tableHead: alpha('#1172BA', 0.06),
  shadow: cardShadow,
};

export const WORKSPACE_PANEL_SX = {
  ...enterpriseCardSx,
  border: 'none',
  backgroundColor: 'background.paper',
  boxShadow: UI_THEME.shadow,
} as const;

export const WAVEFORM_OPTIONS: Array<{ id: WaveformMode; label: string }> = [
  { id: 'ecg', label: 'ECG' },
  { id: 'spo2', label: 'SpO2' },
  { id: 'etco2', label: 'ETCO2' },
  { id: 'resp', label: 'Resp' },
];

export const WAVEFORM_STROKE: Record<WaveformMode, string> = {
  ecg: '#00f27f',
  spo2: '#35d0ff',
  etco2: '#f4c542',
  resp: '#8aa4ff',
};

export const WAVEFORM_SPEED: Record<WaveformMode, string> = {
  ecg: '2.5s',
  spo2: '3.4s',
  etco2: '3.2s',
  resp: '4.8s',
};

export const WAVEFORM_BASE_POINTS: Record<WaveformMode, Array<[number, number]>> = {
  ecg: [
    [0, 40], [35, 40], [52, 40], [60, 35], [66, 40], [74, 40], [80, 10], [86, 58], [92, 40], [120, 40], [160, 40], [210, 39], [250, 40], [300, 40],
  ],
  spo2: [
    [0, 52], [25, 52], [45, 47], [65, 40], [85, 33], [105, 34], [125, 40], [145, 48], [165, 54], [190, 56], [220, 54], [250, 52], [300, 52],
  ],
  etco2: [
    [0, 58], [30, 58], [48, 44], [70, 40], [150, 40], [170, 42], [186, 58], [300, 58],
  ],
  resp: [
    [0, 44], [30, 38], [60, 32], [90, 29], [120, 30], [150, 35], [180, 44], [210, 52], [240, 58], [270, 55], [300, 44],
  ],
};
