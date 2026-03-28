'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card, CommonTable, CommonTabs, StatTile } from '@/src/ui/components/molecules';
import type { CommonTableColumn, CommonTableFilter } from '@/src/ui/components/molecules/CommonTable';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  ArrowBack as ArrowBackIcon,
  FactCheck as FactCheckIcon,
  LocalHospital as LocalHospitalIcon,
  MonitorHeart as MonitorHeartIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  TaskAlt as TaskAltIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  EnterpriseModuleHeader,
  EnterpriseSectionTitle,
  EnterpriseStatusChip,
  EnterpriseTimeline,
} from './components/EnterpriseUi';

type CasePriority = 'STAT' | 'Urgent' | 'Elective';
type CaseStatus = 'Scheduled' | 'Pre-Op' | 'In OR' | 'Closing' | 'PACU' | 'Completed' | 'Cancelled';
type WorkspaceTab = 'preop' | 'intraop' | 'postop';
type ViewMode = 'board' | 'workspace';

interface OtCase {
  id: string;
  caseNo: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  procedure: string;
  department: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  priority: CasePriority;
  status: CaseStatus;
  prepPercent: number;
  allergies: string[];
  asaClass: string;
  estimatedDurationMin: number;
}

interface ScheduleForm {
  patientName: string;
  mrn: string;
  procedure: string;
  department: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  roomId: string;
  scheduledAt: string;
  priority: CasePriority;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface InstrumentCountRow {
  id: string;
  item: string;
  initial: string;
  final: string;
  status: 'OK' | 'Pending';
}

interface MedicationRow {
  id: string;
  drug: string;
  dose: string;
  route: string;
  time: string;
}

interface DischargeMedicationRow {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface VitalReading {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'info';
}

interface PreOpChecklistItemState {
  done: boolean;
  time: string | null;
}

const ROOM_OPTIONS = [
  { id: 'or-1', label: 'OR-01' },
  { id: 'or-2', label: 'OR-02' },
  { id: 'or-3', label: 'OR-03' },
  { id: 'or-4', label: 'OR-04' },
  { id: 'or-5', label: 'OR-05' },
];

const PREOP_CHECKLIST_ITEMS = [
  'Patient identity + wristband verified',
  'Surgical consent signed',
  'NPO status confirmed',
  'Procedure site marked',
  'Blood products cross-matched',
  'Antibiotic prophylaxis planned',
  'Implants/instruments available',
  'Anesthesia clearance complete',
];

const POSTOP_CHECKLIST_ITEMS = [
  'Airway patent and stable',
  'Pain control within protocol',
  'Post-op orders acknowledged by nursing',
  'Discharge counselling completed',
  'Follow-up appointment booked',
];

const PREOP_CHECKLIST_DEFAULT_TIMES = [
  '08:18 AM',
  '08:42 AM',
  '09:18 AM',
  '09:42 AM',
  '10:18 AM',
  '10:42 AM',
  '11:05 AM',
  '11:22 AM',
];

const PREOP_TIMELINE = [
  { time: '07:25', title: 'Admission to pre-op bay', subtitle: 'Nursing triage complete', tone: 'blue' as const },
  { time: '07:42', title: 'Pre-anesthesia review', subtitle: 'ASA documented and signed', tone: 'purple' as const },
  { time: '08:00', title: 'Surgical briefing done', subtitle: 'WHO checklist started', tone: 'green' as const },
];

const INTRAOP_TIMELINE = [
  { time: '08:05', title: 'Anesthesia induced', subtitle: 'Dr. R. Mehta', tone: 'green' as const },
  { time: '08:18', title: 'Incision made', subtitle: 'Primary surgeon in room', tone: 'blue' as const },
  { time: '08:45', title: 'Specimen sent to lab', subtitle: 'Pathology acknowledged', tone: 'orange' as const },
  { time: '09:30', title: 'Expected closure', subtitle: 'Current OT phase: hemostasis', tone: 'red' as const },
];

const PRIORITY_COLOR: Record<CasePriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Elective: 'default',
};

const STATUS_COLOR: Record<CaseStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Scheduled: 'default',
  'Pre-Op': 'warning',
  'In OR': 'info',
  Closing: 'info',
  PACU: 'warning',
  Completed: 'success',
  Cancelled: 'error',
};

const INITIAL_CASES: OtCase[] = [
  {
    id: 'ot-case-005',
    caseNo: 'OT-2026-005',
    patientName: 'Priyanka Das',
    mrn: 'MRN-332276',
    ageGender: '35Y / F',
    procedure: 'Emergency Laparotomy',
    department: 'Gynecology',
    diagnosis: 'Ruptured ectopic pregnancy',
    surgeon: 'Dr. Neha Bhat',
    anesthetist: 'Dr. R. Mehta',
    roomId: 'or-3',
    scheduledAt: getTodayAt(8, 45),
    priority: 'STAT',
    status: 'PACU',
    prepPercent: 100,
    allergies: ['Penicillin'],
    asaClass: 'ASA III',
    estimatedDurationMin: 110,
  },
  {
    id: 'ot-case-001',
    caseNo: 'OT-2026-001',
    patientName: 'Rajiv Menon',
    mrn: 'MRN-332104',
    ageGender: '47Y / M',
    procedure: 'Laparoscopic Cholecystectomy',
    department: 'General Surgery',
    diagnosis: 'Symptomatic cholelithiasis',
    surgeon: 'Dr. Kavita Sharma',
    anesthetist: 'Dr. R. Mehta',
    roomId: 'or-1',
    scheduledAt: getTodayAt(9, 15),
    priority: 'Urgent',
    status: 'In OR',
    prepPercent: 100,
    allergies: ['None'],
    asaClass: 'ASA II',
    estimatedDurationMin: 95,
  },
  {
    id: 'ot-case-004',
    caseNo: 'OT-2026-004',
    patientName: 'Nazia Khan',
    mrn: 'MRN-332249',
    ageGender: '41Y / F',
    procedure: 'Hemithyroidectomy',
    department: 'ENT',
    diagnosis: 'Left thyroid nodule',
    surgeon: 'Dr. P. Rao',
    anesthetist: 'Dr. S. Iyer',
    roomId: 'or-5',
    scheduledAt: getTodayAt(10, 0),
    priority: 'Elective',
    status: 'Cancelled',
    prepPercent: 43,
    allergies: ['Latex'],
    asaClass: 'ASA II',
    estimatedDurationMin: 120,
  },
  {
    id: 'ot-case-002',
    caseNo: 'OT-2026-002',
    patientName: 'Ritika Saini',
    mrn: 'MRN-332188',
    ageGender: '29Y / F',
    procedure: 'ORIF Distal Radius',
    department: 'Orthopedics',
    diagnosis: 'Distal radius fracture',
    surgeon: 'Dr. A. Verma',
    anesthetist: 'Dr. S. Iyer',
    roomId: 'or-2',
    scheduledAt: getTodayAt(11, 50),
    priority: 'Urgent',
    status: 'Pre-Op',
    prepPercent: 86,
    allergies: ['None'],
    asaClass: 'ASA I',
    estimatedDurationMin: 85,
  },
  {
    id: 'ot-case-006',
    caseNo: 'OT-2026-006',
    patientName: 'Suresh Patel',
    mrn: 'MRN-332305',
    ageGender: '58Y / M',
    procedure: 'Right Hemicolectomy',
    department: 'General Surgery',
    diagnosis: 'Ascending colon mass',
    surgeon: 'Dr. Kavita Sharma',
    anesthetist: 'Dr. J. Fernandes',
    roomId: 'or-1',
    scheduledAt: getTodayAt(12, 20),
    priority: 'Urgent',
    status: 'Closing',
    prepPercent: 100,
    allergies: ['None'],
    asaClass: 'ASA III',
    estimatedDurationMin: 180,
  },
  {
    id: 'ot-case-003',
    caseNo: 'OT-2026-003',
    patientName: 'Arjun Mehta',
    mrn: 'MRN-332190',
    ageGender: '63Y / M',
    procedure: 'CABG ×3',
    department: 'Cardiothoracic',
    diagnosis: 'Triple vessel CAD',
    surgeon: 'Dr. D. Nair',
    anesthetist: 'Dr. M. Singh',
    roomId: 'or-4',
    scheduledAt: getTodayAt(14, 30),
    priority: 'STAT',
    status: 'Scheduled',
    prepPercent: 60,
    allergies: ['Heparin sensitivity'],
    asaClass: 'ASA IV',
    estimatedDurationMin: 260,
  },
];

function getTodayAt(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function getLocalInputDateTime(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function defaultScheduleForm(roomId: string): ScheduleForm {
  const target = new Date();
  target.setHours(target.getHours() + 1, 0, 0, 0);
  return {
    patientName: '',
    mrn: '',
    procedure: '',
    department: 'General Surgery',
    diagnosis: '',
    surgeon: '',
    anesthetist: '',
    roomId,
    scheduledAt: getLocalInputDateTime(target),
    priority: 'Elective',
  };
}

function mapStatusToWorkspaceTab(status: CaseStatus): WorkspaceTab {
  if (status === 'In OR' || status === 'Closing') return 'intraop';
  if (status === 'PACU' || status === 'Completed' || status === 'Cancelled') return 'postop';
  return 'preop';
}

function toStatusTone(status: InstrumentCountRow['status']): 'completed' | 'warning' {
  return status === 'OK' ? 'completed' : 'warning';
}

function toneToBg(tone: VitalReading['tone']): string {
  if (tone === 'success') return alpha('#2FA77A', 0.12);
  if (tone === 'warning') return alpha('#C9931E', 0.12);
  return alpha('#2C8AD3', 0.12);
}

function buildChecklistStateForCase(caseItem: OtCase): PreOpChecklistItemState[] {
  const doneCount = Math.round((caseItem.prepPercent / 100) * PREOP_CHECKLIST_ITEMS.length);
  return PREOP_CHECKLIST_ITEMS.map((_, index) => ({
    done: index < doneCount,
    time: index < doneCount ? PREOP_CHECKLIST_DEFAULT_TIMES[index] ?? null : null,
  }));
}

function formatChecklistTimeNow(): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

export default function OpTimeSurgeryPage() {
  const theme = useTheme();

  const [cases, setCases] = React.useState<OtCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(INITIAL_CASES[1]?.id ?? '');
  const [viewMode, setViewMode] = React.useState<ViewMode>('board');
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>('intraop');
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleForm>(() =>
    defaultScheduleForm(ROOM_OPTIONS[0]?.id ?? 'or-1')
  );
  const [preOpChecklistByCaseId, setPreOpChecklistByCaseId] = React.useState<Record<string, PreOpChecklistItemState[]>>(() => {
    const initial: Record<string, PreOpChecklistItemState[]> = {};
    INITIAL_CASES.forEach((item) => {
      initial[item.id] = buildChecklistStateForCase(item);
    });
    return initial;
  });
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  React.useEffect(() => {
    if (selectedCaseId && cases.some((item) => item.id === selectedCaseId)) return;
    setSelectedCaseId(cases[0]?.id ?? '');
  }, [cases, selectedCaseId]);

  const selectedCase = React.useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? null,
    [cases, selectedCaseId]
  );

  React.useEffect(() => {
    if (viewMode === 'workspace' && !selectedCase) {
      setViewMode('board');
    }
  }, [selectedCase, viewMode]);

  const boardRows = React.useMemo(
    () => [...cases].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)),
    [cases]
  );

  const roomLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    ROOM_OPTIONS.forEach((room) => map.set(room.id, room.label));
    return map;
  }, []);

  const boardStats = React.useMemo(() => {
    const scheduled = cases.filter((item) => item.status === 'Scheduled').length;
    const inProgress = cases.filter((item) => item.status === 'In OR' || item.status === 'Closing').length;
    const pendingRecovery = cases.filter((item) => item.status === 'PACU').length;
    const completed = cases.filter((item) => item.status === 'Completed').length;
    const utilization = Math.round(((inProgress + pendingRecovery + completed) / Math.max(cases.length, 1)) * 100);
    return { scheduled, inProgress, pendingRecovery, completed, utilization };
  }, [cases]);

  const openWorkspace = React.useCallback((row: OtCase) => {
    setSelectedCaseId(row.id);
    setWorkspaceTab(mapStatusToWorkspaceTab(row.status));
    setViewMode('workspace');
  }, []);

  const handleTabChange = React.useCallback((value: WorkspaceTab) => {
    setWorkspaceTab(value);
  }, []);

  React.useEffect(() => {
    setPreOpChecklistByCaseId((prev) => {
      let changed = false;
      const next = { ...prev };
      cases.forEach((item) => {
        if (!next[item.id] || next[item.id].length !== PREOP_CHECKLIST_ITEMS.length) {
          next[item.id] = buildChecklistStateForCase(item);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [cases]);

  const togglePreOpChecklistItem = React.useCallback(
    (index: number) => {
      if (!selectedCase) return;
      setPreOpChecklistByCaseId((prev) => {
        const current = prev[selectedCase.id] ?? buildChecklistStateForCase(selectedCase);
        if (index < 0 || index >= current.length) return prev;

        const nextItems = current.map((item) => ({ ...item }));
        const currentItem = nextItems[index];
        if (currentItem.done) {
          nextItems[index] = { done: false, time: null };
        } else {
          nextItems[index] = { done: true, time: formatChecklistTimeNow() };
        }
        return { ...prev, [selectedCase.id]: nextItems };
      });
    },
    [selectedCase]
  );

  const updateFormField = React.useCallback(<K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) => {
    setScheduleForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleScheduleCase = React.useCallback(() => {
    if (!scheduleForm.patientName.trim() || !scheduleForm.mrn.trim() || !scheduleForm.procedure.trim() || !scheduleForm.surgeon.trim()) {
      setToast({ open: true, message: 'Patient, MRN, Procedure, and Surgeon are required.', severity: 'warning' });
      return;
    }

    const scheduledDate = new Date(scheduleForm.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      setToast({ open: true, message: 'Please select a valid schedule date and time.', severity: 'warning' });
      return;
    }

    const nextNumber = cases.length + 1;
    const newCase: OtCase = {
      id: `ot-case-${Date.now()}`,
      caseNo: `OT-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`,
      patientName: scheduleForm.patientName.trim(),
      mrn: scheduleForm.mrn.trim(),
      ageGender: '45Y / M',
      procedure: scheduleForm.procedure.trim(),
      department: scheduleForm.department.trim() || 'General Surgery',
      diagnosis: scheduleForm.diagnosis.trim() || 'Pending diagnosis entry',
      surgeon: scheduleForm.surgeon.trim(),
      anesthetist: scheduleForm.anesthetist.trim() || '--',
      roomId: scheduleForm.roomId,
      scheduledAt: scheduledDate.toISOString(),
      priority: scheduleForm.priority,
      status: 'Scheduled',
      prepPercent: scheduleForm.priority === 'STAT' ? 25 : 40,
      allergies: ['None'],
      asaClass: 'ASA II',
      estimatedDurationMin: 90,
    };

    setCases((prev) => [...prev, newCase]);
    setSelectedCaseId(newCase.id);
    setWorkspaceTab('preop');
    setViewMode('workspace');
    setScheduleDialogOpen(false);
    setScheduleForm(defaultScheduleForm(scheduleForm.roomId));
    setToast({ open: true, message: `${newCase.caseNo} scheduled and opened in workspace.`, severity: 'success' });
  }, [cases.length, scheduleForm]);

  const caseBoardColumns = React.useMemo<CommonTableColumn<OtCase>[]>(
    () => [
      {
        id: 'time',
        label: 'Time',
        minWidth: 96,
        renderCell: (row) => (
          <Typography sx={{ fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace', fontSize: '0.78rem', fontWeight: 700 }}>
            {formatTime(row.scheduledAt)}
          </Typography>
        ),
      },
      {
        id: 'case',
        label: 'Case',
        minWidth: 220,
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace' }}>
              {row.caseNo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.patientName} • {row.mrn} • {row.ageGender}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'procedure',
        label: 'Procedure',
        minWidth: 230,
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.procedure}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.department}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'team',
        label: 'Surgical Team',
        minWidth: 190,
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="caption">{row.surgeon}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.anesthetist}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'room',
        label: 'Room',
        minWidth: 96,
        renderCell: (row) => (
          <Chip
            size="small"
            label={roomLabelById.get(row.roomId) ?? row.roomId}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.34),
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              fontWeight: 700,
              fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
            }}
          />
        ),
      },
      {
        id: 'priority',
        label: 'Priority',
        minWidth: 95,
        renderCell: (row) => <Chip size="small" label={row.priority} color={PRIORITY_COLOR[row.priority]} />,
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 110,
        renderCell: (row) => <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />,
      },
      {
        id: 'prep',
        label: 'Prep',
        minWidth: 130,
        renderCell: (row) => (
          <Stack spacing={0.45} sx={{ minWidth: 95 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace' }}>
              {row.prepPercent}%
            </Typography>
            <LinearProgress variant="determinate" value={row.prepPercent} sx={{ height: 5, borderRadius: 99 }} />
          </Stack>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: 132,
        renderCell: (row) => (
          <Button size="small" variant={selectedCaseId === row.id ? 'contained' : 'outlined'} onClick={() => openWorkspace(row)}>
            Open Workspace
          </Button>
        ),
      },
    ],
    [openWorkspace, roomLabelById, selectedCaseId, theme.palette.primary.main]
  );

  const boardFilters = React.useMemo<CommonTableFilter<OtCase>[]>(
    () => [
      {
        id: 'status',
        label: 'Status',
        allValue: 'all',
        defaultValue: 'all',
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Scheduled', value: 'Scheduled' },
          { label: 'Pre-Op', value: 'Pre-Op' },
          { label: 'In OR', value: 'In OR' },
          { label: 'Closing', value: 'Closing' },
          { label: 'PACU', value: 'PACU' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Cancelled', value: 'Cancelled' },
        ],
        getValue: (row) => row.status,
      },
      {
        id: 'room',
        label: 'Room',
        allValue: 'all',
        defaultValue: 'all',
        options: [{ label: 'All Rooms', value: 'all' }].concat(
          ROOM_OPTIONS.map((room) => ({ label: room.label, value: room.id }))
        ),
        getValue: (row) => row.roomId,
      },
      {
        id: 'priority',
        label: 'Priority',
        allValue: 'all',
        defaultValue: 'all',
        options: [
          { label: 'All Priorities', value: 'all' },
          { label: 'STAT', value: 'STAT' },
          { label: 'Urgent', value: 'Urgent' },
          { label: 'Elective', value: 'Elective' },
        ],
        getValue: (row) => row.priority,
      },
    ],
    []
  );

  const preOpChecklistRows = React.useMemo(() => {
    if (!selectedCase) {
      return PREOP_CHECKLIST_ITEMS.map((item) => ({
        label: item,
        done: false,
        time: '--',
      }));
    }

    const checklist = preOpChecklistByCaseId[selectedCase.id] ?? buildChecklistStateForCase(selectedCase);
    return PREOP_CHECKLIST_ITEMS.map((item, index) => ({
      label: item,
      done: checklist[index]?.done ?? false,
      time: checklist[index]?.time ?? '--',
    }));
  }, [preOpChecklistByCaseId, selectedCase]);

  const preOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: 'BP', value: '136/84 mmHg', tone: 'warning' },
      { label: 'HR', value: '90 bpm', tone: 'info' },
      { label: 'SpO₂', value: '98%', tone: 'success' },
      { label: 'Temp', value: selectedCase?.allergies.includes('None') ? '37.2 °C' : '38.2 °C', tone: selectedCase?.allergies.includes('None') ? 'info' : 'warning' },
      { label: 'RBS', value: '132 mg/dL', tone: 'info' },
      { label: 'Pain', value: '4/10', tone: 'warning' },
    ],
    [selectedCase?.allergies]
  );

  const intraOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: 'BP', value: '118/76 mmHg', tone: 'success' },
      { label: 'HR', value: '82 bpm', tone: 'success' },
      { label: 'SpO₂', value: '99%', tone: 'success' },
      { label: 'EtCO₂', value: '35 mmHg', tone: 'info' },
      { label: 'Temp', value: '37.1 °C', tone: 'info' },
      { label: 'UO', value: '180 ml/hr', tone: 'success' },
    ],
    []
  );

  const postOpVitals = React.useMemo<VitalReading[]>(
    () => [
      { label: 'BP', value: '122/80 mmHg', tone: 'success' },
      { label: 'Pulse', value: '78 bpm', tone: 'success' },
      { label: 'SpO₂', value: '97%', tone: 'success' },
      { label: 'Temp', value: '37.4 °C', tone: 'info' },
      { label: 'Pain', value: '3/10 VAS', tone: 'warning' },
      { label: 'UO', value: '95 ml/hr', tone: 'info' },
    ],
    []
  );

  const instrumentRows = React.useMemo<InstrumentCountRow[]>(
    () => [
      { id: 'count-swabs', item: 'Swabs', initial: '20', final: '20', status: 'OK' },
      { id: 'count-needles', item: 'Needles', initial: '8', final: '8', status: 'OK' },
      { id: 'count-instruments', item: 'Instruments', initial: '32', final: selectedCase?.status === 'Closing' ? '32' : '--', status: selectedCase?.status === 'Closing' ? 'OK' : 'Pending' },
      { id: 'count-retractors', item: 'Retractors', initial: '4', final: '4', status: 'OK' },
    ],
    [selectedCase?.status]
  );

  const intraOpMedicationRows = React.useMemo<MedicationRow[]>(
    () => [
      { id: 'med-propofol', drug: 'Propofol 2%', dose: '200 mg', route: 'IV Bolus', time: '08:05' },
      { id: 'med-cef', drug: 'Ceftriaxone', dose: '1 g', route: 'IV', time: '08:10' },
      { id: 'med-fentanyl', drug: 'Fentanyl', dose: '100 mcg', route: 'IV Push', time: '08:15' },
      { id: 'med-rocuronium', drug: 'Rocuronium', dose: '50 mg', route: 'IV', time: '08:18' },
    ],
    []
  );

  const dischargeMedicationRows = React.useMemo<DischargeMedicationRow[]>(
    () => [
      {
        id: 'dmed-1',
        drug: 'Paracetamol',
        dose: '500 mg',
        frequency: 'TDS',
        duration: '5 days',
        instructions: 'After food',
      },
      {
        id: 'dmed-2',
        drug: 'Pantoprazole',
        dose: '40 mg',
        frequency: 'OD',
        duration: '7 days',
        instructions: 'Before breakfast',
      },
      {
        id: 'dmed-3',
        drug: 'Amox-Clav',
        dose: '625 mg',
        frequency: 'BD',
        duration: '5 days',
        instructions: 'After meals',
      },
    ],
    []
  );

  const countColumns = React.useMemo<CommonTableColumn<InstrumentCountRow>[]>(
    () => [
      { id: 'item', label: 'Item', minWidth: 120, renderCell: (row) => <Typography variant="body2">{row.item}</Typography> },
      { id: 'initial', label: 'Initial', minWidth: 80, renderCell: (row) => <Typography variant="caption">{row.initial}</Typography> },
      { id: 'final', label: 'Final', minWidth: 80, renderCell: (row) => <Typography variant="caption">{row.final}</Typography> },
      {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        renderCell: (row) => <EnterpriseStatusChip label={row.status} tone={toStatusTone(row.status)} />,
      },
    ],
    []
  );

  const medicationColumns = React.useMemo<CommonTableColumn<MedicationRow>[]>(
    () => [
      { id: 'drug', label: 'Drug', minWidth: 130, renderCell: (row) => <Typography variant="body2">{row.drug}</Typography> },
      { id: 'dose', label: 'Dose', minWidth: 80, renderCell: (row) => <Typography variant="caption">{row.dose}</Typography> },
      { id: 'route', label: 'Route', minWidth: 90, renderCell: (row) => <Typography variant="caption">{row.route}</Typography> },
      {
        id: 'time',
        label: 'Time',
        minWidth: 85,
        renderCell: (row) => (
          <Typography variant="caption" sx={{ fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace' }}>
            {row.time}
          </Typography>
        ),
      },
    ],
    []
  );

  const dischargeMedicationColumns = React.useMemo<CommonTableColumn<DischargeMedicationRow>[]>(
    () => [
      {
        id: 'drug',
        label: 'Drug',
        minWidth: 130,
        renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.drug}</Typography>,
      },
      { id: 'dose', label: 'Dose', minWidth: 80, renderCell: (row) => <Typography variant="caption">{row.dose}</Typography> },
      { id: 'frequency', label: 'Freq', minWidth: 70, renderCell: (row) => <Typography variant="caption">{row.frequency}</Typography> },
      { id: 'duration', label: 'Duration', minWidth: 95, renderCell: (row) => <Typography variant="caption">{row.duration}</Typography> },
      {
        id: 'instructions',
        label: 'Instructions',
        minWidth: 130,
        renderCell: (row) => <Typography variant="caption" color="text.secondary">{row.instructions}</Typography>,
      },
    ],
    []
  );

  const tabMeta = React.useMemo(
    () => {
      const preOpDone = preOpChecklistRows.filter((item) => item.done).length;
      return [
        { value: 'preop' as const, label: 'Pre-Op', count: `${preOpDone}/${PREOP_CHECKLIST_ITEMS.length}`, icon: <FactCheckIcon fontSize="small" /> },
        { value: 'intraop' as const, label: 'Intra-Op', count: '5', icon: <TimelineIcon fontSize="small" /> },
        { value: 'postop' as const, label: 'Post-Op', count: '4', icon: <MonitorHeartIcon fontSize="small" /> },
      ];
    },
    [preOpChecklistRows]
  );

  const dashboardCardSx = React.useMemo(
    () => ({
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      boxShadow: 'none',
    }),
    []
  );

  const workspaceCardSx = React.useMemo(
    () => ({
      ...dashboardCardSx,
      p: 1.25,
      height: '100%',
    }),
    [dashboardCardSx]
  );

  const workspacePanel = React.useMemo(() => {
    if (!selectedCase) return null;

    if (workspaceTab === 'preop') {
      return (
        <Stack spacing={1.1}>
          
          <Grid container spacing={1.1}>
            <Grid xs={12} md={4}>
              <Stack spacing={1.1} sx={{ height: '100%' }}>

                <Card elevation={0} sx={{ ...workspaceCardSx, flex: 1 }}>
                  <EnterpriseSectionTitle title="Pre-Op Checklist" />
                  <Stack spacing={0.6}>
                    {preOpChecklistRows.map((item, index) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        onClick={() => togglePreOpChecklistItem(index)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            togglePreOpChecklistItem(index);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        sx={{
                          px: 1,
                          py: 0.6,
                          borderRadius: 1.2,
                          border: '1px solid',
                          borderColor: item.done ? alpha('#2FA77A', 0.4) : 'divider',
                          bgcolor: item.done ? alpha('#2FA77A', 0.12) : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: item.done ? alpha('#2FA77A', 0.52) : alpha(theme.palette.primary.main, 0.28),
                            bgcolor: item.done ? alpha('#2FA77A', 0.17) : alpha(theme.palette.primary.main, 0.06),
                          },
                        }}
                      >
                        {item.done ? <TaskAltIcon sx={{ fontSize: 16, color: '#2FA77A' }} /> : <FactCheckIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
                        <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.time}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            <Grid xs={12} md={8}>
              <Stack spacing={1.1} sx={{ height: '100%' }}>
                <Card elevation={0} sx={workspaceCardSx}>
                  <EnterpriseSectionTitle title="Pre-Operative Notes" />
                  <Grid container spacing={0.85}>
                    <Grid xs={12} md={7}>
                      <TextField fullWidth label="Pre-Operative Diagnosis" value={selectedCase.diagnosis} />
                    </Grid>
                    <Grid xs={6} md={2.5}>
                      <TextField fullWidth select label="ASA" value={selectedCase.asaClass}>
                        <MenuItem value="ASA I">ASA I</MenuItem>
                        <MenuItem value="ASA II">ASA II</MenuItem>
                        <MenuItem value="ASA III">ASA III</MenuItem>
                        <MenuItem value="ASA IV">ASA IV</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid xs={6} md={2.5}>
                      <TextField fullWidth label="Duration (min)" value={selectedCase.estimatedDurationMin} />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        defaultValue={`Patient prepared for ${selectedCase.procedure}. Site verification and WHO timeout checklist confirmed by OT nursing.`}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.9 }}>
                    <Button size="small" variant="contained" startIcon={<SaveIcon fontSize="small" />}>
                      Save Notes
                    </Button>
                  </Stack>
                </Card>
                <Grid container spacing={1.1} sx={{ flex: 1 }}>
                  <Grid xs={12} md={5}>
                    <Card elevation={0} sx={workspaceCardSx}>
                      <EnterpriseSectionTitle title="Pre-Op Vitals" />
                      <Grid container spacing={0.7}>
                        {preOpVitals.map((vital) => (
                          <Grid key={vital.label} xs={6}>
                            <Box sx={{ p: 0.9, borderRadius: 1.2, bgcolor: toneToBg(vital.tone), border: '1px solid', borderColor: alpha('#1172BA', 0.15) }}>
                              <Typography variant="caption" color="text.secondary">{vital.label}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{vital.value}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={7}>
                    <Card elevation={0} sx={workspaceCardSx}>
                      <EnterpriseSectionTitle title="Case Timeline" />
                      <EnterpriseTimeline items={PREOP_TIMELINE} />
                    </Card>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      );
    }

    if (workspaceTab === 'intraop') {
      return (
        <Grid container spacing={1.1}>
          <Grid xs={12} md={7}>
            <Card elevation={0} sx={workspaceCardSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                <EnterpriseSectionTitle title="Intra-Op Events" />
                <Button size="small" variant="outlined">+ Add Event</Button>
              </Stack>
              <EnterpriseTimeline items={INTRAOP_TIMELINE} />
            </Card>
          </Grid>
          <Grid xs={12} md={5}>
            <Card elevation={0} sx={workspaceCardSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <EnterpriseSectionTitle title="Live Vitals" />
                <Chip size="small" label="LIVE" color="success" />
              </Stack>
              <Grid container spacing={0.7}>
                {intraOpVitals.map((vital) => (
                  <Grid key={vital.label} xs={6}>
                    <Box sx={{ p: 0.9, borderRadius: 1.2, bgcolor: toneToBg(vital.tone), border: '1px solid', borderColor: alpha('#1172BA', 0.15) }}>
                      <Typography variant="caption" color="text.secondary">{vital.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{vital.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card elevation={0} sx={workspaceCardSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                <EnterpriseSectionTitle title="Instrument & Swab Count" />
                <Button size="small" variant="outlined">Verify</Button>
              </Stack>
              <CommonTable
                rows={instrumentRows}
                columns={countColumns}
                getRowId={(row) => row.id}
                emptyMessage="No count records."
                initialRowsPerPage={4}
                rowsPerPageOptions={[4]}
              />
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card elevation={0} sx={workspaceCardSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                <EnterpriseSectionTitle title="Intra-Op Medications" />
                <Button size="small" variant="outlined">+ Add</Button>
              </Stack>
              <CommonTable
                rows={intraOpMedicationRows}
                columns={medicationColumns}
                getRowId={(row) => row.id}
                emptyMessage="No medication entries."
                initialRowsPerPage={4}
                rowsPerPageOptions={[4]}
              />
            </Card>
          </Grid>
          <Grid xs={12}>
            <Card elevation={0} sx={workspaceCardSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                <EnterpriseSectionTitle title="Surgeon's Operative Notes" />
                <Button size="small" variant="contained" startIcon={<SaveIcon fontSize="small" />}>Save Notes</Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                minRows={4}
                defaultValue="Procedure progressing as planned. Critical structures identified and preserved. Estimated blood loss ~150 ml."
              />
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (workspaceTab === 'postop') {
      return (
        <Stack spacing={1.1}>
          <Grid container spacing={1.1}>
            <Grid xs={12} md={7}>
              <Card elevation={0} sx={{ ...workspaceCardSx, height: 'auto' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <EnterpriseSectionTitle title="Recovery Summary" />
                  <EnterpriseStatusChip label="PACU Cleared" tone="completed" />
                </Stack>
                <Grid container spacing={0.8}>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Surgery End</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>09:32 AM</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">PACU In</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>09:40 AM</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">PACU Out</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>11:10 AM</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Transferred</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Ward 4B</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Aldrete</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>9 / 10</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Pain Score</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>3 / 10</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Blood Loss</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>~150 ml</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Box sx={{ p: 0.75, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.16) }}>
                      <Typography variant="caption" color="text.secondary">Fluids</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>1200 ml</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card elevation={0} sx={workspaceCardSx}>
                <EnterpriseSectionTitle title="Post-Op Vitals" />
                <Grid container spacing={0.7}>
                  {postOpVitals.map((vital) => (
                    <Grid key={vital.label} xs={6}>
                      <Box sx={{ p: 0.9, borderRadius: 1.2, bgcolor: toneToBg(vital.tone), border: '1px solid', borderColor: alpha('#1172BA', 0.15) }}>
                        <Typography variant="caption" color="text.secondary">{vital.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{vital.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card elevation={0} sx={workspaceCardSx}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                  <EnterpriseSectionTitle title="Discharge Medications" />
                  <Button size="small" variant="outlined">+ Add</Button>
                </Stack>
                <CommonTable
                  rows={dischargeMedicationRows}
                  columns={dischargeMedicationColumns}
                  getRowId={(row) => row.id}
                  searchBy={(row) => `${row.drug} ${row.dose} ${row.frequency} ${row.duration} ${row.instructions}`}
                  searchPlaceholder="Search discharge medications..."
                  emptyMessage="No discharge medications."
                  initialRowsPerPage={4}
                  rowsPerPageOptions={[4]}
                />
              </Card>
            </Grid>
            <Grid xs={12} md={7}>
              <Card elevation={0} sx={workspaceCardSx}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                  <EnterpriseSectionTitle title="Surgeon's Post-Op Note" />
                  <Button size="small" variant="contained" startIcon={<SaveIcon fontSize="small" />}>Complete & Discharge</Button>
                </Stack>
                <Stack spacing={0.8}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    defaultValue="Laparoscopic cholecystectomy completed without complications. Patient stable in PACU and tolerating oral clear fluids."
                  />
                  <TextField fullWidth type="date" label="Follow-up Date" value="2026-04-03" InputLabelProps={{ shrink: true }} />
                </Stack>
              </Card>
            </Grid>
            <Grid xs={12}>
              <Card elevation={0} sx={workspaceCardSx}>
                <EnterpriseSectionTitle title="Post-Op Checklist" />
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {POSTOP_CHECKLIST_ITEMS.map((item) => (
                    <Chip key={item} size="small" icon={<TaskAltIcon fontSize="small" />} label={item} color="success" variant="outlined" />
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      );
    }

    return null;
  }, [
    countColumns,
    dischargeMedicationColumns,
    dischargeMedicationRows,
    intraOpMedicationRows,
    intraOpVitals,
    medicationColumns,
    postOpVitals,
    preOpChecklistRows,
    preOpVitals,
    selectedCase,
    workspaceCardSx,
    workspaceTab,
    instrumentRows,
  ]);

  return (
    <PageTemplate title="OpTime" currentPageTitle="OT Scheduling" fullHeight>
      <Box
        sx={{
          p: { xs: 0.5, sm: 0.8 },
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          spacing={1.1}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowX: 'hidden',
            overflowY: viewMode === 'board' ? 'auto' : 'hidden',
          }}
        >
          {viewMode === 'board' ? (
            <>
              <EnterpriseModuleHeader
                title="OpTime Enterprise OT Command Center"
                subtitle="Global OT scheduling and perioperative execution workspace"
                icon={<LocalHospitalIcon fontSize="small" />}
                accent="blue"
              
                actions={
                  <>
                    
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      onClick={() => {
                        setScheduleForm(defaultScheduleForm(ROOM_OPTIONS[0]?.id ?? 'or-1'));
                        setScheduleDialogOpen(true);
                      }}
                    >
                      Schedule Case
                    </Button>
                  </>
                }
              />

              <Grid container spacing={1.1}>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatTile
                    label="OT Utilization"
                    value={`${boardStats.utilization}%`}
                    subtitle="Live throughput status"
                    tone="primary"
                    icon={<LocalHospitalIcon sx={{ fontSize: 24 }} />}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatTile
                    label="Scheduled"
                    value={boardStats.scheduled}
                    subtitle="Awaiting OT execution"
                    tone="secondary"
                    icon={<ScheduleIcon sx={{ fontSize: 24 }} />}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatTile
                    label="In Progress"
                    value={boardStats.inProgress}
                    subtitle="In OR + closing"
                    tone="warning"
                    icon={<TimelineIcon sx={{ fontSize: 24 }} />}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatTile
                    label="PACU Queue"
                    value={boardStats.pendingRecovery}
                    subtitle="Recovery bay workload"
                    tone="success"
                    icon={<MonitorHeartIcon sx={{ fontSize: 24 }} />}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatTile
                    label="Completed"
                    value={boardStats.completed}
                    subtitle="Closed OT cases today"
                    tone="info"
                    icon={<TaskAltIcon sx={{ fontSize: 24 }} />}
                  />
                </Grid>
              </Grid>

              <Card
                elevation={0}
                sx={{
                  ...dashboardCardSx,
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 1.6, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Today's OR Case Board
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open one patient case to continue full workflow in Pre-Op, Intra-Op, and Post-Op modules.
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                  <CommonTable
                    rows={boardRows}
                    columns={caseBoardColumns}
                    getRowId={(row) => row.id}
                    searchBy={(row) =>
                      [
                        row.caseNo,
                        row.patientName,
                        row.mrn,
                        row.procedure,
                        row.department,
                        row.diagnosis,
                        row.surgeon,
                        row.anesthetist,
                        roomLabelById.get(row.roomId) ?? row.roomId,
                        row.status,
                        row.priority,
                      ].join(' ')
                    }
                    searchPlaceholder="Search by case, patient, MRN, procedure, department, doctor..."
                    filters={boardFilters}
                    emptyMessage="No OT cases found for current filters."
                    initialRowsPerPage={10}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </Box>
              </Card>
            </>
          ) : (
            <>
              <Box
                sx={{
                  px: { xs: 1, sm: 1.25 },
                  py: { xs: 0.75, sm: 0.85 },
                  borderRadius: 1.75,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.75)} 75%)`,
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.9} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.65} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        onClick={() => setViewMode('board')}
                        sx={{ px: 0.75, minWidth: 'unset', fontWeight: 700 }}
                      >
                        Back to OR Board
                      </Button>
                      <Typography sx={{ fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace', fontWeight: 700, color: 'primary.main' }}>
                        {selectedCase?.caseNo ?? '--'}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800 }}>
                        {selectedCase?.patientName ?? 'No Case Selected'}
                      </Typography>
                      {selectedCase ? <Chip size="small" label={selectedCase.priority} color={PRIORITY_COLOR[selectedCase.priority]} /> : null}
                      {selectedCase ? <Chip size="small" label={selectedCase.status} color={STATUS_COLOR[selectedCase.status]} /> : null}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.1 }}>
                      {selectedCase?.mrn ?? '--'} • {selectedCase?.department ?? '--'} • Room {roomLabelById.get(selectedCase?.roomId ?? '') ?? '--'} • {selectedCase?.surgeon ?? '--'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.65} sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}>
                    <Button size="small" variant="outlined" startIcon={<PrintIcon fontSize="small" />} sx={{ py: 0.55 }}>
                      Print Summary
                    </Button>
                    <Button size="small" variant="contained" startIcon={<SaveIcon fontSize="small" />} sx={{ py: 0.55 }}>
                      Save Case
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 3,
                    bgcolor: 'background.default',
                    px: 1,
                  }}
                >
                  <CommonTabs
                    value={workspaceTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    tabs={tabMeta.map((tab) => ({
                      id: tab.value,
                      icon: tab.icon,
                      label: (
                        <Stack direction="row" spacing={0.55} alignItems="center">
                          <span>{tab.label}</span>
                          <Chip
                            size="small"
                            label={tab.count}
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.primary.main, 0.14),
                              color: 'primary.main',
                            }}
                          />
                        </Stack>
                      ),
                    }))}
                    sx={{
                      px: 0.4,
                      '& .MuiTabs-indicator': { display: 'none' },
                    }}
                    tabSx={{
                      minHeight: 44,
                      textTransform: 'none',
                      fontWeight: 700,
                      '&.Mui-selected': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    p: 1.1,
                    pb: 2,
                    bgcolor: 'transparent',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  {selectedCase ? workspacePanel : <Alert severity="warning">No case selected. Go back to board and open one case.</Alert>}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule New OT Case</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.35} sx={{ pt: 0.5 }}>
            <Alert severity="info">Minimum required details are enough. Case opens directly in enterprise workspace after scheduling.</Alert>
            <Grid container spacing={1.05}>
              <Grid xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={scheduleForm.patientName}
                  onChange={(event) => updateFormField('patientName', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  label="MRN"
                  value={scheduleForm.mrn}
                  onChange={(event) => updateFormField('mrn', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Scheduled At"
                  value={scheduleForm.scheduledAt}
                  onChange={(event) => updateFormField('scheduledAt', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Procedure"
                  value={scheduleForm.procedure}
                  onChange={(event) => updateFormField('procedure', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Department"
                  value={scheduleForm.department}
                  onChange={(event) => updateFormField('department', event.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Diagnosis"
                  value={scheduleForm.diagnosis}
                  onChange={(event) => updateFormField('diagnosis', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Surgeon"
                  value={scheduleForm.surgeon}
                  onChange={(event) => updateFormField('surgeon', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Anaesthetist"
                  value={scheduleForm.anesthetist}
                  onChange={(event) => updateFormField('anesthetist', event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Room"
                  value={scheduleForm.roomId}
                  onChange={(event) => updateFormField('roomId', event.target.value)}
                >
                  {ROOM_OPTIONS.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={scheduleForm.priority}
                  onChange={(event) => updateFormField('priority', event.target.value as CasePriority)}
                >
                  <MenuItem value="STAT">STAT</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                  <MenuItem value="Elective">Elective</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleCase} startIcon={<AddCircleOutlineIcon fontSize="small" />}>
            Schedule & Open
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
