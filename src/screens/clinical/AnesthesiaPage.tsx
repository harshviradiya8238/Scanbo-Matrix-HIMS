'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
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
import CommonDataGrid, { type CommonColumn } from '@/src/components/table/CommonDataGrid';
import { Card, CommonTabs, StatTile, WorkspaceHeaderCard } from '@/src/ui/components/molecules';
import {
  EnterpriseStatusChip,
  enterpriseCardSx,
} from '@/src/screens/clinical/components/EnterpriseUi';
import { alpha } from '@/src/ui/theme';
import { cardShadow } from '@/src/core/theme/tokens';
import {
  Add as AddIcon,
  Air as AirIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
  Timeline as TimelineIcon,
  Verified as VerifiedIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';

type ViewMode = 'select' | 'workspace';
type WorkspaceTab = 'overview' | 'drugs' | 'flowsheet' | 'handoff';
type WorklistFilter = 'all' | 'in-or' | 'pre-op' | 'pacu' | 'scheduled';
type CaseStatus = 'In OR' | 'Pre-Op' | 'PACU' | 'Scheduled' | 'Completed';
type StatusTone = 'active' | 'warning' | 'critical' | 'info' | 'pending' | 'completed' | 'neutral';
type WaveformMode = 'ecg' | 'spo2' | 'etco2' | 'resp';

interface EventEntry {
  time: string;
  text: string;
  tone: StatusTone;
}

interface DrugEntry {
  name: string;
  route: string;
  rate: string;
  status: string;
  tone: StatusTone;
  time: string;
}

interface ChecklistEntry {
  step: string;
  done: boolean;
  owner: string;
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface WorklistCase {
  id: string;
  room: string;
  scheduledAt: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  procedure: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  asaClass: string;
  status: CaseStatus;
  duration: string;
  fluidsInMl: string;
  bloodLossMl: string;
  allergyTags: string[];
  vitals: {
    hr: string;
    bp: string;
    spo2: string;
    etco2: string;
    temp: string;
    bis: string;
  };
  ventilation: {
    o2Flow: string;
    fio2: string;
    tidalVolume: string;
    rr: string;
    peep: string;
    pip: string;
  };
  checklist: ChecklistEntry[];
  events: EventEntry[];
  drugs: DrugEntry[];
  flowsheetTimes: string[];
  flowsheetRows: Array<{ label: string; values: string[] }>;
  team: TeamMember[];
  notes: string;
}

const TABS: Array<{ value: WorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'drugs', label: 'Drug Chart' },
  { value: 'flowsheet', label: 'Flowsheet' },
  { value: 'handoff', label: 'Team & Handoff' },
];

const CASES: WorklistCase[] = [
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

function statusTone(status: CaseStatus): StatusTone {
  if (status === 'In OR') return 'warning';
  if (status === 'Pre-Op') return 'pending';
  if (status === 'PACU') return 'active';
  if (status === 'Scheduled') return 'info';
  return 'completed';
}

function matchesFilter(status: CaseStatus, filter: WorklistFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'in-or') return status === 'In OR';
  if (filter === 'pre-op') return status === 'Pre-Op';
  if (filter === 'pacu') return status === 'PACU';
  return status === 'Scheduled';
}

const FILTER_OPTIONS: Array<{ value: WorklistFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'in-or', label: 'In OR' },
  { value: 'pre-op', label: 'Pre-Op' },
  { value: 'pacu', label: 'PACU' },
  { value: 'scheduled', label: 'Scheduled' },
];

const UI_THEME = {
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

const WORKSPACE_PANEL_SX = {
  ...enterpriseCardSx,
  border: 'none',
  backgroundColor: 'background.paper',
  boxShadow: UI_THEME.shadow,
} as const;

const WAVEFORM_OPTIONS: Array<{ id: WaveformMode; label: string }> = [
  { id: 'ecg', label: 'ECG' },
  { id: 'spo2', label: 'SpO2' },
  { id: 'etco2', label: 'ETCO2' },
  { id: 'resp', label: 'Resp' },
];

const WAVEFORM_STROKE: Record<WaveformMode, string> = {
  ecg: '#00f27f',
  spo2: '#35d0ff',
  etco2: '#f4c542',
  resp: '#8aa4ff',
};

const WAVEFORM_SPEED: Record<WaveformMode, string> = {
  ecg: '2.5s',
  spo2: '3.4s',
  etco2: '3.2s',
  resp: '4.8s',
};

const WAVEFORM_BASE_POINTS: Record<WaveformMode, Array<[number, number]>> = {
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

function buildWavePoints(basePoints: Array<[number, number]>, repeats = 6, cycleWidth = 300): string {
  const points: string[] = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    basePoints.forEach((point, idx) => {
      if (repeat > 0 && idx === 0) return;
      points.push(`${point[0] + repeat * cycleWidth},${point[1]}`);
    });
  }
  return points.join(' ');
}

function currentTimeStamp(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AnesthesiaPage() {
  const [mode, setMode] = React.useState<ViewMode>('select');
  const [tab, setTab] = React.useState<WorkspaceTab>('overview');
  const [filter, setFilter] = React.useState<WorklistFilter>('all');
  const [query, setQuery] = React.useState('');
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(CASES[0].id);

  const [customCases, setCustomCases] = React.useState<WorklistCase[]>([]);
  const [extraDrugsByCase, setExtraDrugsByCase] = React.useState<Record<string, DrugEntry[]>>({});
  const [extraEventsByCase, setExtraEventsByCase] = React.useState<Record<string, EventEntry[]>>({});
  const [ventilationOverrides, setVentilationOverrides] = React.useState<Record<string, WorklistCase['ventilation']>>({});
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, CaseStatus>>({});

  const [orBoardOpen, setOrBoardOpen] = React.useState(false);
  const [urgentCaseOpen, setUrgentCaseOpen] = React.useState(false);
  const [addDrugOpen, setAddDrugOpen] = React.useState(false);
  const [addEventOpen, setAddEventOpen] = React.useState(false);
  const [signCloseOpen, setSignCloseOpen] = React.useState(false);
  const [ventSettingsOpen, setVentSettingsOpen] = React.useState(false);
  const [finalSignoffOpen, setFinalSignoffOpen] = React.useState(false);

  const [addDrugForm, setAddDrugForm] = React.useState({
    name: '',
    route: 'IV',
    type: 'Continuous Infusion',
    dose: '',
    notes: '',
  });
  const [addEventForm, setAddEventForm] = React.useState<{
    note: string;
    tone: 'info' | 'active' | 'warning' | 'critical';
  }>({
    note: '',
    tone: 'info',
  });
  const [urgentCaseForm, setUrgentCaseForm] = React.useState({
    room: 'OR-U1',
    patientName: '',
    procedure: '',
    surgeon: '',
    anesthetist: '',
    asaClass: 'ASA III',
  });
  const [ventSettingsForm, setVentSettingsForm] = React.useState<WorklistCase['ventilation']>(CASES[0].ventilation);
  const [finalSignoffNote, setFinalSignoffNote] = React.useState('');

  const allCases = React.useMemo(() => {
    return [...customCases, ...CASES].map((item) => ({
      ...item,
      status: statusOverrides[item.id] ?? item.status,
      drugs: [...(extraDrugsByCase[item.id] ?? []), ...item.drugs],
      events: [...(extraEventsByCase[item.id] ?? []), ...item.events],
      ventilation: ventilationOverrides[item.id] ?? item.ventilation,
    }));
  }, [customCases, extraDrugsByCase, extraEventsByCase, ventilationOverrides, statusOverrides]);

  const selectedCase = allCases.find((item) => item.id === selectedCaseId) ?? allCases[0] ?? CASES[0];

  React.useEffect(() => {
    if (!allCases.length) return;
    if (allCases.some((item) => item.id === selectedCaseId)) return;
    setSelectedCaseId(allCases[0].id);
  }, [allCases, selectedCaseId]);

  const filteredCases = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allCases.filter((item) => {
      if (!matchesFilter(item.status, filter)) return false;
      if (!normalizedQuery) return true;
      return (
        item.patientName.toLowerCase().includes(normalizedQuery) ||
        item.mrn.toLowerCase().includes(normalizedQuery) ||
        item.procedure.toLowerCase().includes(normalizedQuery) ||
        item.room.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [allCases, filter, query]);

  const handleSubmitAddDrug = () => {
    const normalizedName = addDrugForm.name.trim();
    const normalizedDose = addDrugForm.dose.trim();
    if (!normalizedName || !normalizedDose) return;

    const tone: StatusTone =
      addDrugForm.type === 'Bolus' ? 'warning' : addDrugForm.type === 'Intermittent' ? 'info' : 'active';
    const statusLabel =
      addDrugForm.type === 'Bolus' ? 'Bolus' : addDrugForm.type === 'Intermittent' ? 'Scheduled' : 'Continuous';
    const time = currentTimeStamp();

    const newDrug: DrugEntry = {
      name: normalizedName,
      route: addDrugForm.route,
      rate: normalizedDose,
      status: statusLabel,
      tone,
      time,
    };

    setExtraDrugsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [newDrug, ...(prev[selectedCase.id] ?? [])],
    }));
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [
        {
          time,
          text: `Medication added: ${normalizedName} (${normalizedDose})`,
          tone: 'info',
        },
        ...(prev[selectedCase.id] ?? []),
      ],
    }));
    setAddDrugOpen(false);
    setAddDrugForm({ name: '', route: 'IV', type: 'Continuous Infusion', dose: '', notes: '' });
    setTab('drugs');
  };

  const handleSubmitEvent = () => {
    const note = addEventForm.note.trim();
    if (!note) return;
    const newEvent: EventEntry = {
      time: currentTimeStamp(),
      text: note,
      tone: addEventForm.tone,
    };
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [newEvent, ...(prev[selectedCase.id] ?? [])],
    }));
    setAddEventOpen(false);
    setAddEventForm({ note: '', tone: 'info' });
  };

  const handleCreateUrgentCase = () => {
    const patientName = urgentCaseForm.patientName.trim();
    const procedure = urgentCaseForm.procedure.trim();
    if (!patientName || !procedure) return;

    const caseId = `custom-${Date.now()}`;
    const now = currentTimeStamp();
    const newCase: WorklistCase = {
      id: caseId,
      room: urgentCaseForm.room || 'OR-U1',
      scheduledAt: now,
      patientName,
      mrn: `URG-${String(Date.now()).slice(-6)}`,
      ageGender: '-- / --',
      procedure,
      diagnosis: 'Urgent surgical case',
      surgeon: urgentCaseForm.surgeon.trim() || 'On-call Surgeon',
      anesthetist: urgentCaseForm.anesthetist.trim() || 'On-call Anesthesia',
      asaClass: urgentCaseForm.asaClass || 'ASA III',
      status: 'Pre-Op',
      duration: '00:00',
      fluidsInMl: '0',
      bloodLossMl: '0',
      allergyTags: ['Pending review'],
      vitals: {
        hr: '-',
        bp: '-',
        spo2: '-',
        etco2: '-',
        temp: '-',
        bis: '-',
      },
      ventilation: {
        o2Flow: 'Planned',
        fio2: 'Planned',
        tidalVolume: 'Planned',
        rr: 'Planned',
        peep: 'Planned',
        pip: 'Planned',
      },
      checklist: [{ step: 'Urgent triage checklist', done: false, owner: 'OT Coordinator' }],
      events: [{ time: now, text: 'Urgent case created from OR board', tone: 'warning' }],
      drugs: [],
      flowsheetTimes: [],
      flowsheetRows: [],
      team: [],
      notes: 'Urgent case created. Complete pre-op anesthesia assessment.',
    };

    setCustomCases((prev) => [newCase, ...prev]);
    setUrgentCaseOpen(false);
    setUrgentCaseForm({
      room: 'OR-U1',
      patientName: '',
      procedure: '',
      surgeon: '',
      anesthetist: '',
      asaClass: 'ASA III',
    });
    setSelectedCaseId(caseId);
    setMode('workspace');
  };

  const handleSignAndCloseCase = (source: 'sign-close' | 'final-signoff') => {
    setStatusOverrides((prev) => ({
      ...prev,
      [selectedCase.id]: 'Completed',
    }));
    const note = source === 'final-signoff' ? finalSignoffNote.trim() : '';
    setExtraEventsByCase((prev) => ({
      ...prev,
      [selectedCase.id]: [
        {
          time: currentTimeStamp(),
          text: source === 'final-signoff'
            ? `Final sign-off completed${note ? `: ${note}` : ''}`
            : 'Case signed and closed by anesthesia team',
          tone: 'completed',
        },
        ...(prev[selectedCase.id] ?? []),
      ],
    }));
    setSignCloseOpen(false);
    setFinalSignoffOpen(false);
    setFinalSignoffNote('');
  };

  const handleSaveVentSettings = () => {
    setVentilationOverrides((prev) => ({
      ...prev,
      [selectedCase.id]: { ...ventSettingsForm },
    }));
    setVentSettingsOpen(false);
  };

  return (
    <PageTemplate title="Anesthesia Module"  fullHeight>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          p: 0,
          '& .MuiTableCell-root': {
            borderBottomColor: UI_THEME.border,
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: UI_THEME.tableHead,
            color: UI_THEME.textSecondary,
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.55px',
            fontWeight: 700,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root': {
            backgroundColor: UI_THEME.panelSoft,
          },
        }}
      >
        {mode === 'select' ? (
          <CaseSelectionView
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            allCases={allCases}
            cases={filteredCases}
            onOpenOrBoard={() => setOrBoardOpen(true)}
            onOpenUrgentCase={() => setUrgentCaseOpen(true)}
            onSelect={(caseId) => {
              setSelectedCaseId(caseId);
              setMode('workspace');
            }}
          />
        ) : (
          <WorkspaceView
            caseData={selectedCase}
            tab={tab}
            setTab={setTab}
            onBack={() => setMode('select')}
            onOpenAddEvent={() => setAddEventOpen(true)}
            onOpenSignClose={() => setSignCloseOpen(true)}
            onOpenAddDrug={() => setAddDrugOpen(true)}
            onOpenVentSettings={() => {
              setVentSettingsForm({ ...selectedCase.ventilation });
              setVentSettingsOpen(true);
            }}
            onOpenFinalSignOff={() => setFinalSignoffOpen(true)}
          />
        )}
      </Box>

      <Dialog open={orBoardOpen} onClose={() => setOrBoardOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 28, height: 28, borderRadius: 1.2, display: 'grid', placeItems: 'center', bgcolor: alpha(UI_THEME.primary, 0.14), color: 'primary.main' }}>
                <MonitorHeartIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                OR Board
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOrBoardOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Procedure</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allCases.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.room}</TableCell>
                  <TableCell>{item.scheduledAt}</TableCell>
                  <TableCell>{item.patientName}</TableCell>
                  <TableCell>{item.procedure}</TableCell>
                  <TableCell>
                    <EnterpriseStatusChip label={item.status} tone={statusTone(item.status)} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedCaseId(item.id);
                        setMode('workspace');
                        setOrBoardOpen(false);
                      }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={urgentCaseOpen} onClose={() => setUrgentCaseOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Add Urgent Case
            </Typography>
            <IconButton size="small" onClick={() => setUrgentCaseOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <TextField
              label="Patient Name *"
              size="small"
              value={urgentCaseForm.patientName}
              onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, patientName: event.target.value }))}
            />
            <TextField
              label="Procedure *"
              size="small"
              value={urgentCaseForm.procedure}
              onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, procedure: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="OR Room"
                size="small"
                value={urgentCaseForm.room}
                onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, room: event.target.value }))}
              />
              <TextField
                select
                label="ASA Class"
                size="small"
                value={urgentCaseForm.asaClass}
                onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, asaClass: event.target.value }))}
              >
                {['ASA I', 'ASA II', 'ASA III', 'ASA IV'].map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Surgeon"
                size="small"
                value={urgentCaseForm.surgeon}
                onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, surgeon: event.target.value }))}
              />
              <TextField
                label="Anesthetist"
                size="small"
                value={urgentCaseForm.anesthetist}
                onChange={(event) => setUrgentCaseForm((prev) => ({ ...prev, anesthetist: event.target.value }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setUrgentCaseOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateUrgentCase}>
            Create Case
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDrugOpen} onClose={() => setAddDrugOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: 1.2, display: 'grid', placeItems: 'center', bgcolor: alpha('#7c3aed', 0.14), color: '#7c3aed' }}>
                <LocalPharmacyIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Add Drug / Infusion
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setAddDrugOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Drug Name *"
              placeholder="e.g. Propofol, Midazolam..."
              value={addDrugForm.name}
              onChange={(event) => setAddDrugForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                select
                size="small"
                label="Route"
                value={addDrugForm.route}
                onChange={(event) => setAddDrugForm((prev) => ({ ...prev, route: event.target.value }))}
              >
                {['IV', 'IM', 'Oral', 'Inhalational'].map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Type"
                value={addDrugForm.type}
                onChange={(event) => setAddDrugForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                {['Continuous Infusion', 'Bolus', 'Intermittent'].map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              size="small"
              label="Rate / Dose *"
              placeholder="e.g. 75 mcg/kg/min or 50 mg bolus"
              value={addDrugForm.dose}
              onChange={(event) => setAddDrugForm((prev) => ({ ...prev, dose: event.target.value }))}
            />
            <TextField
              size="small"
              label="Notes"
              placeholder="Additional notes..."
              value={addDrugForm.notes}
              onChange={(event) => setAddDrugForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setAddDrugOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitAddDrug}>
            Add Drug
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addEventOpen} onClose={() => setAddEventOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Intra-op Event</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <TextField
              label="Event Detail *"
              size="small"
              multiline
              minRows={3}
              value={addEventForm.note}
              onChange={(event) => setAddEventForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <TextField
              select
              label="Severity"
              size="small"
              value={addEventForm.tone}
              onChange={(event) =>
                setAddEventForm((prev) => ({ ...prev, tone: event.target.value as typeof addEventForm.tone }))
              }
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setAddEventOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitEvent}>
            Save Event
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={signCloseOpen} onClose={() => setSignCloseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sign & Close Case</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            This will mark the case as completed and append an event log entry.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setSignCloseOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleSignAndCloseCase('sign-close')}>
            Confirm Sign & Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ventSettingsOpen} onClose={() => setVentSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Vent Settings</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField size="small" label="O2 Flow" value={ventSettingsForm.o2Flow} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, o2Flow: event.target.value }))} />
              <TextField size="small" label="FiO2" value={ventSettingsForm.fio2} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, fio2: event.target.value }))} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField size="small" label="Tidal Volume" value={ventSettingsForm.tidalVolume} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, tidalVolume: event.target.value }))} />
              <TextField size="small" label="RR" value={ventSettingsForm.rr} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, rr: event.target.value }))} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField size="small" label="PEEP" value={ventSettingsForm.peep} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, peep: event.target.value }))} />
              <TextField size="small" label="PIP" value={ventSettingsForm.pip} onChange={(event) => setVentSettingsForm((prev) => ({ ...prev, pip: event.target.value }))} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setVentSettingsOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveVentSettings}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={finalSignoffOpen} onClose={() => setFinalSignoffOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Final Sign-off</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Complete final anesthesia handoff and mark the case as completed.
            </Typography>
            <TextField
              size="small"
              label="Handoff Notes"
              multiline
              minRows={3}
              value={finalSignoffNote}
              onChange={(event) => setFinalSignoffNote(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setFinalSignoffOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleSignAndCloseCase('final-signoff')}>
            Complete Sign-off
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

function CaseSelectionView({
  query,
  setQuery,
  filter,
  setFilter,
  allCases,
  cases,
  onOpenOrBoard,
  onOpenUrgentCase,
  onSelect,
}: {
  query: string;
  setQuery: (value: string) => void;
  filter: WorklistFilter;
  setFilter: (value: WorklistFilter) => void;
  allCases: WorklistCase[];
  cases: WorklistCase[];
  onOpenOrBoard: () => void;
  onOpenUrgentCase: () => void;
  onSelect: (caseId: string) => void;
}) {
  const statusCounts = React.useMemo(
    () => ({
      all: allCases.length,
      inOr: allCases.filter((item) => item.status === 'In OR').length,
      preOp: allCases.filter((item) => item.status === 'Pre-Op').length,
      pacu: allCases.filter((item) => item.status === 'PACU').length,
      scheduled: allCases.filter((item) => item.status === 'Scheduled').length,
    }),
    [allCases],
  );

  const columns = React.useMemo<CommonColumn<WorklistCase>[]>(
    () => [
      { field: 'room', headerName: 'OR', width: 90 },
      {
        field: 'scheduledAt',
        headerName: 'Time',
        width: 96,
        renderCell: (item) => (
          <Typography sx={{ fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace', fontWeight: 700 }}>
            {item.scheduledAt}
          </Typography>
        ),
      },
      {
        field: 'patientName',
        headerName: 'Patient',
        width: 230,
        renderCell: (item) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.mrn} · {item.ageGender}
            </Typography>
          </Stack>
        ),
      },
      { field: 'procedure', headerName: 'Procedure', width: 280 },
      { field: 'surgeon', headerName: 'Surgeon', width: 170 },
      { field: 'asaClass', headerName: 'ASA', width: 100 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (item) => (
          <EnterpriseStatusChip label={item.status} tone={statusTone(item.status)} />
        ),
      },
      {
        field: 'actions',
        headerName: 'Action',
        width: 190,
        align: 'right',
        renderCell: (item) => (
          <Button
            size="small"
            variant="contained"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
            sx={{ backgroundColor: 'primary.main' }}
          >
            Open Workspace
          </Button>
        ),
      },
    ],
    [onSelect],
  );

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.1, overflow: 'hidden' }}>
      <WorkspaceHeaderCard
        sx={{
          p: 1.5,
          backgroundColor: alpha(UI_THEME.primary, 0.08),
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', lg: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
              Anesthesia Worklist Selection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a patient from OT list and open the complete anesthesia workspace.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button variant="outlined" size="small" sx={{ borderColor: 'divider' }} onClick={onOpenOrBoard}>
              OR Board
            </Button>
            <Button variant="contained" size="small" sx={{ backgroundColor: 'primary.main' }} onClick={onOpenUrgentCase}>
              Add Urgent Case
            </Button>
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(5, minmax(0,1fr))' },
        }}
      >
        <StatTile label="Total Cases" value={statusCounts.all} subtitle="OT queue" tone="primary" />
        <StatTile label="In OR" value={statusCounts.inOr} subtitle="Live cases" tone="warning" />
        <StatTile label="Pre-Op" value={statusCounts.preOp} subtitle="Readying" tone="secondary" />
        <StatTile label="PACU" value={statusCounts.pacu} subtitle="Recovery" tone="success" />
        <StatTile label="Scheduled" value={statusCounts.scheduled} subtitle="Upcoming" tone="info" />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CommonDataGrid<WorklistCase>
          rows={cases}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => onSelect(row.id)}
          externalSearchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search by MRN, patient name, procedure, room..."
          searchFields={['patientName', 'mrn', 'procedure', 'room', 'surgeon', 'asaClass']}
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10]}
          emptyTitle="No matching OT cases"
          emptyDescription="Try another search or status filter."
          toolbarRight={
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
              {FILTER_OPTIONS.map((item) => (
                <Button
                  key={item.value}
                  size="small"
                  variant={filter === item.value ? 'contained' : 'outlined'}
                  onClick={() => setFilter(item.value)}
                  sx={
                    filter === item.value
                      ? { backgroundColor: 'primary.main' }
                      : { borderColor: 'divider', color: 'text.secondary' }
                  }
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          }
        />
      </Box>
    </Box>
  );
}

function WorkspaceView({
  caseData,
  tab,
  setTab,
  onBack,
  onOpenAddEvent,
  onOpenSignClose,
  onOpenAddDrug,
  onOpenVentSettings,
  onOpenFinalSignOff,
}: {
  caseData: WorklistCase;
  tab: WorkspaceTab;
  setTab: (value: WorkspaceTab) => void;
  onBack: () => void;
  onOpenAddEvent: () => void;
  onOpenSignClose: () => void;
  onOpenAddDrug: () => void;
  onOpenVentSettings: () => void;
  onOpenFinalSignOff: () => void;
}) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
      <WorkspaceHeaderCard
        sx={{
          p: 1,
          backgroundColor: alpha(UI_THEME.primary, 0.08),
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', lg: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ borderColor: alpha(UI_THEME.primary, 0.28), color: UI_THEME.primary }}
          >
            Worklist
          </Button>
          <Avatar sx={{ width: 34, height: 34, bgcolor: UI_THEME.violet, fontSize: '0.78rem' }}>
            {caseData.patientName.split(' ').map((part) => part.charAt(0)).slice(0, 2).join('')}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UI_THEME.text }}>
              Anesthesia Record · {caseData.patientName}
            </Typography>
            <Typography variant="caption" sx={{ color: UI_THEME.textSecondary }}>
              {caseData.room} · {caseData.procedure} · MRN {caseData.mrn} · {caseData.duration}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.7} flexWrap="wrap">
            <EnterpriseStatusChip label={caseData.status} tone={statusTone(caseData.status)} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon fontSize="small" />}
              sx={{ borderColor: alpha(UI_THEME.primary, 0.28), color: UI_THEME.primary }}
              onClick={onOpenAddEvent}
            >
              Add Event
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<VerifiedIcon fontSize="small" />}
              sx={{ backgroundColor: UI_THEME.primary }}
              onClick={onOpenSignClose}
            >
              Sign & Close
            </Button>
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      <Card
        elevation={0}
        sx={{
          ...WORKSPACE_PANEL_SX,
          p: 0.6,
          backgroundColor: alpha(UI_THEME.primary, 0.04),
        }}
      >
        <CommonTabs<WorkspaceTab>
          tabs={TABS.map((item, idx) => ({
            id: item.value,
            label: item.label,
            icon:
              idx === 0 ? (
                <TimelineIcon />
              ) : idx === 1 ? (
                <LocalPharmacyIcon />
              ) : idx === 2 ? (
                <MonitorHeartIcon />
              ) : (
                <GroupsIcon />
              ),
          }))}
          value={tab}
          onChange={setTab}
          allowScrollButtonsMobile
          tabSx={{
            minHeight: 36,
            px: 1.25,
          }}
        />
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {tab === 'overview' ? <OverviewTab caseData={caseData} /> : null}
        {tab === 'drugs' ? <DrugsTab caseData={caseData} onOpenAddDrug={onOpenAddDrug} /> : null}
        {tab === 'flowsheet' ? <FlowsheetTab caseData={caseData} /> : null}
        {tab === 'handoff' ? (
          <HandoffTab
            caseData={caseData}
            onOpenVentSettings={onOpenVentSettings}
            onOpenFinalSignOff={onOpenFinalSignOff}
          />
        ) : null}
      </Box>
    </Box>
  );
}

function OverviewTab({ caseData }: { caseData: WorklistCase }) {
  const [waveformMode, setWaveformMode] = React.useState<WaveformMode>('ecg');
  const waveformPoints = React.useMemo(
    () => buildWavePoints(WAVEFORM_BASE_POINTS[waveformMode]),
    [waveformMode],
  );
  const waveformColor = WAVEFORM_STROKE[waveformMode];

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gap: 0.9, gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', xl: 'repeat(4,minmax(0,1fr))' } }}>
        <StatTile label="Case Status" value={caseData.status} subtitle="Intraoperative" tone="secondary" icon={<TimelineIcon fontSize="small" />} />
        <StatTile label="Case Duration" value={caseData.duration} subtitle="hours:mins" tone="success" icon={<MonitorHeartIcon fontSize="small" />} />
        <StatTile label="Total Fluids In" value={caseData.fluidsInMl} subtitle="mL" tone="warning" icon={<WaterDropIcon fontSize="small" />} />
        <StatTile label="Blood Loss" value={caseData.bloodLossMl} subtitle="mL" tone="error" icon={<LocalPharmacyIcon fontSize="small" />} />
      </Box>

      <Box sx={{ display: 'grid', gap: 0.9, gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', xl: 'repeat(6,minmax(0,1fr))' } }}>
        <VitalCard label="HR" value={caseData.vitals.hr} unit="bpm" tone="normal" />
        <VitalCard label="NIBP" value={caseData.vitals.bp} unit="mmHg" tone="normal" />
        <VitalCard label="SpO2" value={caseData.vitals.spo2} unit="percent" tone="normal" />
        <VitalCard label="EtCO2" value={caseData.vitals.etco2} unit="mmHg" tone="info" />
        <VitalCard label="Temp" value={caseData.vitals.temp} unit="deg C" tone="warning" />
        <VitalCard label="BIS" value={caseData.vitals.bis} unit="index" tone="special" />
      </Box>

      <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.7, minHeight: 110, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={0.8}
          sx={{ px: 0.3, pb: 0.7 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UI_THEME.text }}>
            Real-time Monitoring Waveforms
          </Typography>
          <Stack direction="row" spacing={0.45} alignItems="center" flexWrap="wrap" useFlexGap>
            {WAVEFORM_OPTIONS.map((option) => (
              <Button
                key={option.id}
                size="small"
                variant={waveformMode === option.id ? 'contained' : 'outlined'}
                onClick={() => setWaveformMode(option.id)}
                sx={
                  waveformMode === option.id
                    ? { backgroundColor: 'primary.main', minWidth: 64, py: 0.42, px: 1.25 }
                    : { borderColor: 'divider', color: 'text.secondary', minWidth: 64, py: 0.42, px: 1.25 }
                }
              >
                {option.label}
              </Button>
            ))}
            <Box
              sx={{
                px: 1,
                py: 0.28,
                borderRadius: 99,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#16a34a',
                backgroundColor: alpha('#16a34a', 0.12),
                border: '1px solid',
                borderColor: alpha('#16a34a', 0.34),
              }}
            >
              Live · 25mm/s
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            height: 66,
            borderRadius: 1.2,
            backgroundColor: UI_THEME.waveform,
            border: '1px solid',
            borderColor: alpha('#5f7ea6', 0.3),
            overflow: 'hidden',
            position: 'relative',
            backgroundImage:
              'linear-gradient(rgba(56,86,133,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,86,133,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 24px 24px',
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 1200 66"
            preserveAspectRatio="none"
            sx={{
              width: '100%',
              height: '100%',
              '@keyframes monitorShift': {
                '0%': { transform: 'translateX(0px)' },
                '100%': { transform: 'translateX(-300px)' },
              },
            }}
          >
            <g
              style={{
                transformOrigin: 'left center',
                animation: `monitorShift ${WAVEFORM_SPEED[waveformMode]} linear infinite`,
              }}
            >
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={waveformColor}
                strokeWidth={5}
                strokeOpacity={0.16}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={waveformColor}
                strokeWidth={2.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </Box>
        </Box>
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gap: 0.9, gridTemplateColumns: { xs: '1fr', xl: '1.5fr 1fr 1fr' } }}>
        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: UI_THEME.textSecondary, mb: 0.6, display: 'block' }}>
            Drug Snapshot
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Drug</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caseData.drugs.slice(0, 3).map((drug) => (
                  <TableRow key={drug.name + drug.time}>
                    <TableCell>{drug.name}</TableCell>
                    <TableCell>{drug.route}</TableCell>
                    <TableCell>{drug.rate}</TableCell>
                    <TableCell><EnterpriseStatusChip label={drug.status} tone={drug.tone} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: UI_THEME.textSecondary, mb: 0.6, display: 'block' }}>
            Ventilator / Gas
          </Typography>
          <MiniStat label="O2 Flow" value={caseData.ventilation.o2Flow} />
          <MiniStat label="FiO2" value={caseData.ventilation.fio2} />
          <MiniStat label="TV" value={caseData.ventilation.tidalVolume} />
          <MiniStat label="RR" value={caseData.ventilation.rr} />
          <MiniStat label="PEEP" value={caseData.ventilation.peep} />
          <MiniStat label="PIP" value={caseData.ventilation.pip} isLast />
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: UI_THEME.textSecondary, mb: 0.6, display: 'block' }}>
            Event Log
          </Typography>
          <Stack spacing={0.5} sx={{ maxHeight: '100%', overflow: 'auto' }}>
            {caseData.events.slice(0, 4).map((event) => (
              <Box
                key={event.time + event.text}
                sx={{
                  p: 0.6,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: UI_THEME.border,
                  backgroundColor: UI_THEME.panelSoft,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: UI_THEME.violet, fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace' }}
                >
                  {event.time}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                  {event.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}

function DrugsTab({
  caseData,
  onOpenAddDrug,
}: {
  caseData: WorklistCase;
  onOpenAddDrug: () => void;
}) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gap: 0.9,
        gridTemplateColumns: { xs: '1fr', xl: '1.65fr 1fr' },
        overflow: 'hidden',
      }}
    >
      <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 0.8, borderBottom: '1px solid', borderColor: UI_THEME.border }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UI_THEME.text }}>
              Drug Infusions & Boluses
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              sx={{ backgroundColor: UI_THEME.primary }}
              onClick={onOpenAddDrug}
            >
              Add Drug
            </Button>
          </Stack>
        </Box>
        <TableContainer sx={{ height: 'calc(100% - 46px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Drug</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Rate / Dose</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caseData.drugs.length ? (
                caseData.drugs.map((drug) => (
                  <TableRow key={drug.name + drug.time} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{drug.name}</TableCell>
                    <TableCell>{drug.route}</TableCell>
                    <TableCell>{drug.rate}</TableCell>
                    <TableCell sx={{ fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace' }}>{drug.time}</TableCell>
                    <TableCell>
                      <EnterpriseStatusChip label={drug.status} tone={drug.tone} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" sx={{ color: UI_THEME.textSecondary }}>
                      No medications documented for this case.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box sx={{ minHeight: 0, display: 'grid', gap: 0.9, gridTemplateRows: 'auto auto 1fr' }}>
        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.9 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8 }}>
            Medication Safety Checks
          </Typography>
          <Alert severity="warning" sx={{ mb: 0.8, borderColor: '#f59e0b55', backgroundColor: '#fef3c710' }}>
            Verify allergy contraindications before additional opioid bolus.
          </Alert>
          <Alert severity="info" sx={{ borderColor: '#3b82f655', backgroundColor: '#dbeafe1a' }}>
            Reversal preparation should begin near closure phase.
          </Alert>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography variant="caption" sx={{ color: UI_THEME.textSecondary, fontWeight: 700, mb: 0.6, display: 'block' }}>
            Surgical Checklist
          </Typography>
          <Stack spacing={0.45}>
            {caseData.checklist.map((item) => (
              <Box
                key={item.step}
                sx={{
                  p: 0.55,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: UI_THEME.border,
                  backgroundColor: UI_THEME.panelSoft,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.step}
                </Typography>
                <Typography variant="caption" sx={{ color: UI_THEME.textMuted }}>
                  {item.owner}
                </Typography>
                <Box sx={{ mt: 0.25 }}>
                  <EnterpriseStatusChip label={item.done ? 'Completed' : 'Pending'} tone={item.done ? 'active' : 'warning'} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ color: UI_THEME.textSecondary, fontWeight: 700, mb: 0.6, display: 'block' }}>
            Case Note
          </Typography>
          <Typography variant="body2" sx={{ color: UI_THEME.textSecondary, lineHeight: 1.45 }}>
            {caseData.notes}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

function FlowsheetTab({ caseData }: { caseData: WorklistCase }) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gap: 0.9, gridTemplateColumns: { xs: '1fr', xl: '1.7fr 1fr' } }}>
      <Card
        elevation={0}
        sx={{
          ...WORKSPACE_PANEL_SX,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 0.8, borderBottom: '1px solid', borderColor: UI_THEME.border }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UI_THEME.text }}>
            Intraoperative Flowsheet
          </Typography>
        </Box>
        <TableContainer sx={{ flex: 1, minHeight: 0 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                {caseData.flowsheetTimes.length ? (
                  caseData.flowsheetTimes.map((time) => (
                    <TableCell key={time} align="center">
                      {time}
                    </TableCell>
                  ))
                ) : (
                  <TableCell align="center">No records</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {caseData.flowsheetRows.length ? (
                caseData.flowsheetRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.label}</TableCell>
                    {row.values.map((value, idx) => (
                      <TableCell
                        key={row.label + idx}
                        align="center"
                        sx={{ fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace' }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" sx={{ color: UI_THEME.textSecondary }}>
                      Flowsheet will populate once intraoperative charting starts.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box sx={{ minHeight: 0, display: 'grid', gap: 0.9, gridTemplateRows: '1fr 1fr' }}>
        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ color: UI_THEME.textSecondary, fontWeight: 700, mb: 0.6, display: 'block' }}>
            Event Timeline
          </Typography>
          <Stack spacing={0.45} sx={{ maxHeight: '100%', overflow: 'auto' }}>
            {caseData.events.length ? (
              caseData.events.map((event) => (
                <Box
                  key={event.time + event.text}
                  sx={{
                    p: 0.55,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: UI_THEME.border,
                    backgroundColor: UI_THEME.panelSoft,
                  }}
                >
                  <Typography variant="caption" sx={{ color: UI_THEME.violet, fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace' }}>
                    {event.time}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                    {event.text}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: UI_THEME.textSecondary }}>
                No event data available.
              </Typography>
            )}
          </Stack>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography variant="caption" sx={{ color: UI_THEME.textSecondary, fontWeight: 700, mb: 0.6, display: 'block' }}>
            WHO Checklist Progress
          </Typography>
          <Stack spacing={0.55}>
            {caseData.checklist.map((item) => (
              <Box
                key={item.step + item.owner}
                sx={{
                  p: 0.55,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: UI_THEME.border,
                  backgroundColor: '#fff',
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.step}
                  </Typography>
                  <EnterpriseStatusChip label={item.done ? 'Done' : 'Pending'} tone={item.done ? 'active' : 'warning'} />
                </Stack>
                <Typography variant="caption" sx={{ color: UI_THEME.textMuted }}>
                  Owner: {item.owner}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}

function HandoffTab({
  caseData,
  onOpenVentSettings,
  onOpenFinalSignOff,
}: {
  caseData: WorklistCase;
  onOpenVentSettings: () => void;
  onOpenFinalSignOff: () => void;
}) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gap: 0.9, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
      <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.9, overflow: 'hidden' }}>
        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
          <GroupsIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Team on Duty
          </Typography>
        </Stack>
        <Stack spacing={0.7} sx={{ maxHeight: '100%', overflow: 'auto' }}>
          {caseData.team.map((member) => (
            <Box
              key={member.name}
              sx={{
                p: 0.7,
                borderRadius: 1.2,
                border: '1px solid',
                borderColor: UI_THEME.border,
                backgroundColor: UI_THEME.panelSoft,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              <Avatar sx={{ width: 30, height: 30, bgcolor: member.color, fontSize: '0.72rem' }}>
                {member.initials}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: UI_THEME.textSecondary }}>
                  {member.role}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>

      <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.9 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8 }}>
          PACU / Handoff
        </Typography>
        <Typography variant="caption" sx={{ color: UI_THEME.textSecondary }}>
          Allergies
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.4, mb: 0.8 }}>
          {caseData.allergyTags.map((tag) => (
            <EnterpriseStatusChip
              key={tag}
              label={tag}
              tone={tag === 'None' ? 'active' : 'critical'}
            />
          ))}
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={caseData.notes}
          InputProps={{ readOnly: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: UI_THEME.panelSoft,
              '& fieldset': { borderColor: UI_THEME.borderStrong },
            },
          }}
        />
        <Stack direction="row" spacing={0.7} sx={{ mt: 0.8, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AirIcon fontSize="small" />}
            sx={{ borderColor: UI_THEME.borderStrong, color: UI_THEME.primary }}
            onClick={onOpenVentSettings}
          >
            Vent Settings
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<VerifiedIcon fontSize="small" />}
            sx={{ backgroundColor: UI_THEME.primary }}
            onClick={onOpenFinalSignOff}
          >
            Final Sign-off
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

function VitalCard({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: 'normal' | 'warning' | 'info' | 'special';
}) {
  const toneMap = {
    normal: 'success',
    warning: 'warning',
    info: 'info',
    special: 'secondary',
  } as const;

  return (
    <StatTile
      label={label}
      value={value}
      subtitle={unit}
      tone={toneMap[tone]}
      sx={{
        p: 1.25,
        borderRadius: 1.6,
        '& .MuiTypography-caption': {
          fontSize: '0.76rem',
        },
        '& .MuiTypography-h4': {
          fontSize: '2rem',
          lineHeight: 1.06,
          color: 'text.primary',
        },
      }}
    />
  );
}

function MiniStat({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        py: 0.45,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: UI_THEME.border,
      }}
    >
      <Typography variant="body2" sx={{ color: UI_THEME.textSecondary }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}
