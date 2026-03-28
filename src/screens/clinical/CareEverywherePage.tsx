'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { CommonTabs, StatTile } from '@/src/ui/components/molecules';
import CommonDataGrid, { type CommonColumn } from '@/src/components/table/CommonDataGrid';
import {
  EnterpriseStatusChip,
} from '@/src/screens/clinical/components/EnterpriseUi';
import { alpha, useTheme } from '@/src/ui/theme';
import { GLOBAL_PATIENTS, type GlobalPatient } from '@/src/mocks/global-patients';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CloudDownload as CloudDownloadIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  EditNote as EditNoteIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterAltOff as FilterAltOffIcon,
  Hub as HubIcon,
  ImportExport as ImportExportIcon,
  LocalHospital as LocalHospitalIcon,
  OpenInNew as OpenInNewIcon,
  PendingActions as PendingActionsIcon,
  Public as PublicIcon,
  QueryStats as QueryStatsIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Sync as SyncIcon,
  Tune as TuneIcon,
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

type CETab = 'overview' | 'labs' | 'radiology' | 'discharge' | 'rx';
type RecordType = 'Lab Result' | 'Radiology' | 'Discharge' | 'Prescription' | 'Consult Note';
type RecordStatus = 'Verified' | 'Pending' | 'Error' | 'New';
type DateFilter = 'all' | 'last30' | 'last6m' | 'last1y' | '2026' | '2025';
type DrawerTab = 'details' | 'documents' | 'timeline' | 'consent';
type ExportFormat = 'PDF' | 'FHIR Bundle' | 'CCD XML';
type ExportScope = 'all' | 'filtered';
type QueryRange = '6m' | '1y' | '2y' | 'all';
type NetworkState = 'live' | 'warning' | 'offline';
type WorklistStatusFilter = 'all' | 'Active' | 'Admitted' | 'Discharged';

interface ExternalRecord {
  id: string;
  patientName: string;
  type: RecordType;
  organization: string;
  date: string;
  provider: string;
  status: RecordStatus;
  documents: string[];
  summary: string;
}

interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: NetworkState;
  records: number;
  latency: string;
}

interface ActivityItem {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}

interface ConsentItem {
  id: string;
  label: string;
  organization: string;
  enabled: boolean;
  expiresOn: string;
}

const RECORD_SEED: ExternalRecord[] = [
  {
    id: 'REC-20260324-001',
    patientName: 'Rajan M. Patel',
    type: 'Lab Result',
    organization: 'Apollo Hospitals',
    date: '2026-03-24',
    provider: 'Dr. Neha Bhat',
    status: 'Verified',
    documents: ['CBC Panel.pdf', 'Lipid Profile.pdf'],
    summary: 'CBC and lipid values imported and validated against local reference ranges.',
  },
  {
    id: 'REC-20260322-002',
    patientName: 'Rajan M. Patel',
    type: 'Radiology',
    organization: 'Kokilaben DHC',
    date: '2026-03-22',
    provider: 'Dr. M. Sen',
    status: 'Verified',
    documents: ['CT Abdomen Report.pdf', 'Image Link'],
    summary: 'CT abdomen report received through ABDM FHIR endpoint.',
  },
  {
    id: 'REC-20260320-003',
    patientName: 'Rajan M. Patel',
    type: 'Discharge',
    organization: 'Fortis Healthcare',
    date: '2026-03-20',
    provider: 'Dr. A. Gupta',
    status: 'Pending',
    documents: ['Discharge Summary.pdf'],
    summary: 'Pending reconciliation for medications and follow-up plan.',
  },
  {
    id: 'REC-20260318-004',
    patientName: 'Rajan M. Patel',
    type: 'Prescription',
    organization: 'Medanta Hospital',
    date: '2026-03-18',
    provider: 'Dr. K. Sharma',
    status: 'Verified',
    documents: ['Rx-Metformin.pdf', 'Rx-Atorvastatin.pdf'],
    summary: 'External prescriptions matched with current active medication chart.',
  },
  {
    id: 'REC-20260312-005',
    patientName: 'Rajan M. Patel',
    type: 'Consult Note',
    organization: 'AIIMS Delhi',
    date: '2026-03-12',
    provider: 'Dr. J. Fernandes',
    status: 'New',
    documents: ['Cardiology OPD Note.pdf'],
    summary: 'New cardiology consult note available for clinician review.',
  },
  {
    id: 'REC-20260228-006',
    patientName: 'Rajan M. Patel',
    type: 'Radiology',
    organization: 'Narayana Health',
    date: '2026-02-28',
    provider: 'Dr. S. Iyer',
    status: 'Error',
    documents: ['Echo Attempt.log'],
    summary: 'Partial payload received, checksum mismatch detected.',
  },
  {
    id: 'REC-20260224-007',
    patientName: 'Rajan M. Patel',
    type: 'Lab Result',
    organization: 'Apollo Hospitals',
    date: '2026-02-24',
    provider: 'Dr. P. Rao',
    status: 'Pending',
    documents: ['HbA1c.pdf'],
    summary: 'Awaiting consent validation for trend-line merge.',
  },
  {
    id: 'REC-20260220-008',
    patientName: 'Rajan M. Patel',
    type: 'Prescription',
    organization: 'Fortis Healthcare',
    date: '2026-02-20',
    provider: 'Dr. A. Gupta',
    status: 'Verified',
    documents: ['Post-op Antibiotics.pdf'],
    summary: 'Prescription successfully reconciled with local formulary.',
  },
  {
    id: 'REC-20260214-009',
    patientName: 'Rajan M. Patel',
    type: 'Discharge',
    organization: 'Apollo Hospitals',
    date: '2026-02-14',
    provider: 'Dr. Neha Bhat',
    status: 'Verified',
    documents: ['Daycare Discharge.pdf'],
    summary: 'Discharge instructions and follow-up schedule imported.',
  },
  {
    id: 'REC-20260130-010',
    patientName: 'Rajan M. Patel',
    type: 'Lab Result',
    organization: 'Medanta Hospital',
    date: '2026-01-30',
    provider: 'Dr. K. Sharma',
    status: 'Verified',
    documents: ['Kidney Function Test.pdf'],
    summary: 'Renal profile values integrated into longitudinal chart.',
  },
  {
    id: 'REC-20251218-011',
    patientName: 'Rajan M. Patel',
    type: 'Radiology',
    organization: 'Kokilaben DHC',
    date: '2025-12-18',
    provider: 'Dr. M. Sen',
    status: 'Verified',
    documents: ['Chest X-Ray Report.pdf'],
    summary: 'Imaging report archived and linked to encounter timeline.',
  },
  {
    id: 'REC-20251103-012',
    patientName: 'Rajan M. Patel',
    type: 'Consult Note',
    organization: 'AIIMS Delhi',
    date: '2025-11-03',
    provider: 'Dr. V. Menon',
    status: 'Pending',
    documents: ['Neurology Follow-up Note.pdf'],
    summary: 'Pending due to unresolved source encounter identifier mapping.',
  },
];

const NETWORK_SEED: NetworkNode[] = [
  {
    id: 'net-1',
    name: 'Apollo Hospitals',
    type: 'Hospital Network · ABDM',
    status: 'live',
    records: 87,
    latency: '34 ms',
  },
  {
    id: 'net-2',
    name: 'Kokilaben DHC',
    type: 'Specialty Center · HL7 FHIR',
    status: 'live',
    records: 54,
    latency: '42 ms',
  },
  {
    id: 'net-3',
    name: 'Fortis Healthcare',
    type: 'Hospital Chain · CCD',
    status: 'warning',
    records: 42,
    latency: '88 ms',
  },
  {
    id: 'net-4',
    name: 'AIIMS Delhi',
    type: 'Government · ABDM / NHA',
    status: 'live',
    records: 33,
    latency: '39 ms',
  },
  {
    id: 'net-5',
    name: 'Narayana Health',
    type: 'Cardiac Chain · HL7 v2',
    status: 'offline',
    records: 27,
    latency: '—',
  },
];

const ACTIVITY_SEED: ActivityItem[] = [
  {
    id: 'act-1',
    event: 'Records Retrieved',
    detail: '18 records fetched from Apollo Hospitals via ABDM.',
    timestamp: '2026-03-24 08:42',
    severity: 'success',
  },
  {
    id: 'act-2',
    event: 'Consent Updated',
    detail: 'Discharge summaries consent extended for 12 months.',
    timestamp: '2026-03-24 08:15',
    severity: 'info',
  },
  {
    id: 'act-3',
    event: 'Query Timeout',
    detail: 'Fortis Healthcare returned partial payload with 3 pending documents.',
    timestamp: '2026-03-23 17:30',
    severity: 'warning',
  },
  {
    id: 'act-4',
    event: 'Network Offline',
    detail: 'Narayana Health gateway unavailable during scheduled sync.',
    timestamp: '2026-03-23 11:00',
    severity: 'error',
  },
];

const CONSENT_SEED: ConsentItem[] = [
  {
    id: 'consent-1',
    label: 'Lab Results Access',
    organization: 'All Connected Networks',
    enabled: true,
    expiresOn: '2026-12-31',
  },
  {
    id: 'consent-2',
    label: 'Radiology & Imaging Access',
    organization: 'Apollo + Kokilaben',
    enabled: true,
    expiresOn: '2026-09-30',
  },
  {
    id: 'consent-3',
    label: 'Discharge Summary Access',
    organization: 'All Connected Networks',
    enabled: false,
    expiresOn: '2026-04-15',
  },
  {
    id: 'consent-4',
    label: 'Prescription History Access',
    organization: 'Fortis + Medanta',
    enabled: true,
    expiresOn: '2026-10-31',
  },
];

const TABS: Array<{ id: CETab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'labs', label: 'Lab Results' },
  { id: 'radiology', label: 'Radiology' },
  { id: 'discharge', label: 'Discharge' },
  { id: 'rx', label: 'Prescriptions' },
];

const TAB_TYPE_FILTER: Partial<Record<CETab, RecordType>> = {
  labs: 'Lab Result',
  radiology: 'Radiology',
  discharge: 'Discharge',
  rx: 'Prescription',
};

const STATUS_FILTERS: Array<'all' | RecordStatus> = ['all', 'Verified', 'Pending', 'Error', 'New'];

function statusTone(status: RecordStatus): 'active' | 'warning' | 'critical' | 'info' {
  if (status === 'Verified') return 'active';
  if (status === 'Pending') return 'warning';
  if (status === 'Error') return 'critical';
  return 'info';
}

function activityTone(severity: ActivityItem['severity']): 'active' | 'warning' | 'critical' | 'info' {
  if (severity === 'success') return 'active';
  if (severity === 'warning') return 'warning';
  if (severity === 'error') return 'critical';
  return 'info';
}

function networkTone(status: NetworkState): 'active' | 'warning' | 'critical' {
  if (status === 'live') return 'active';
  if (status === 'warning') return 'warning';
  return 'critical';
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function dateMatchesFilter(dateValue: string, filter: DateFilter): boolean {
  if (filter === 'all') return true;
  const recordDate = new Date(dateValue);
  if (Number.isNaN(recordDate.getTime())) return false;

  const now = new Date();
  const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

  if (filter === 'last30') return diffDays <= 30;
  if (filter === 'last6m') return diffDays <= 180;
  if (filter === 'last1y') return diffDays <= 365;
  if (filter === '2026') return recordDate.getFullYear() === 2026;
  return recordDate.getFullYear() === 2025;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function getExternalRecordCount(patient: GlobalPatient): number {
  const seed = patient.mrn.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (seed % 12) + 4;
}

function getNetworkAccessState(
  patient: GlobalPatient,
): { label: string; tone: 'active' | 'warning' | 'info' | 'critical' } {
  if (patient.status === 'Admitted') return { label: 'Connected', tone: 'active' };
  if (patient.tags.includes('High Risk')) return { label: 'Review Needed', tone: 'warning' };
  if (patient.status === 'Discharged') return { label: 'Archive Mode', tone: 'info' };
  return { label: 'Connected', tone: 'active' };
}

function getPatientStatusTone(
  status: GlobalPatient['status'],
): 'active' | 'warning' | 'critical' | 'info' | 'neutral' {
  if (status === 'Admitted') return 'active';
  if (status === 'Active') return 'info';
  if (status === 'Discharged') return 'neutral';
  if (status === 'Billing Hold') return 'warning';
  return 'critical';
}

export default function CareEverywherePage() {
  const theme = useTheme();
  const softSurfaceSx = {
    border: 'none',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    boxShadow: '0 10px 26px rgba(15, 23, 42, 0.06)',
  } as const;

  const [selectedPatient, setSelectedPatient] = React.useState<GlobalPatient | null>(null);
  const [tab, setTab] = React.useState<CETab>('overview');
  const [records, setRecords] = React.useState<ExternalRecord[]>(RECORD_SEED);
  const [consents, setConsents] = React.useState<ConsentItem[]>(CONSENT_SEED);

  const [search, setSearch] = React.useState('');
  const [orgFilter, setOrgFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | RecordType>('all');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | RecordStatus>('all');

  const [activeRecordId, setActiveRecordId] = React.useState<string | null>(null);
  const [recordDrawerOpen, setRecordDrawerOpen] = React.useState(false);
  const [drawerTab, setDrawerTab] = React.useState<DrawerTab>('details');

  const [queryOpen, setQueryOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [consentOpen, setConsentOpen] = React.useState(false);
  const [networkOpen, setNetworkOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  const [queryRange, setQueryRange] = React.useState<QueryRange>('6m');
  const [queryNetworks, setQueryNetworks] = React.useState<string[]>(
    NETWORK_SEED.filter((item) => item.status !== 'offline').map((item) => item.id),
  );
  const [queryRecordTypes, setQueryRecordTypes] = React.useState<RecordType[]>([
    'Lab Result',
    'Radiology',
    'Discharge',
    'Prescription',
  ]);
  const [queryRunning, setQueryRunning] = React.useState(false);
  const [queryProgress, setQueryProgress] = React.useState(0);

  const [importForm, setImportForm] = React.useState({
    type: 'Lab Result' as RecordType,
    organization: '',
    provider: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [exportFormat, setExportFormat] = React.useState<ExportFormat>('PDF');
  const [exportScope, setExportScope] = React.useState<ExportScope>('all');
  const [includeAuditTrail, setIncludeAuditTrail] = React.useState(true);

  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [worklistSearch, setWorklistSearch] = React.useState('');
  const [worklistStatus, setWorklistStatus] = React.useState<WorklistStatusFilter>('all');

  const patientWorklist = React.useMemo(() => GLOBAL_PATIENTS.slice(0, 14), []);

  const filteredPatientWorklist = React.useMemo(() => {
    return patientWorklist.filter((patient) => {
      const statusMatch = worklistStatus === 'all' ? true : patient.status === worklistStatus;
      return statusMatch;
    });
  }, [patientWorklist, worklistStatus]);

  const activeTypeFilter = tab === 'overview' ? typeFilter : TAB_TYPE_FILTER[tab] ?? 'all';

  const tabCounts = React.useMemo(() => {
    const labs = records.filter((item) => item.type === 'Lab Result').length;
    const radiology = records.filter((item) => item.type === 'Radiology').length;
    const discharge = records.filter((item) => item.type === 'Discharge').length;
    const rx = records.filter((item) => item.type === 'Prescription').length;
    return {
      overview: records.length,
      labs,
      radiology,
      discharge,
      rx,
    };
  }, [records]);

  const organizationOptions = React.useMemo(() => {
    const unique = Array.from(new Set(records.map((item) => item.organization)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records.filter((item) => {
      const text = `${item.id} ${item.type} ${item.organization} ${item.provider} ${item.summary}`.toLowerCase();
      const searchOk = search.trim() ? text.includes(search.trim().toLowerCase()) : true;
      const orgOk = orgFilter === 'all' ? true : item.organization === orgFilter;
      const typeOk = activeTypeFilter === 'all' ? true : item.type === activeTypeFilter;
      const dateOk = dateMatchesFilter(item.date, dateFilter);
      const statusOk = statusFilter === 'all' ? true : item.status === statusFilter;
      return searchOk && orgOk && typeOk && dateOk && statusOk;
    });
  }, [records, search, orgFilter, activeTypeFilter, dateFilter, statusFilter]);

  const metrics = React.useMemo(() => {
    const total = records.length;
    const verified = records.filter((item) => item.status === 'Verified').length;
    const pending = records.filter((item) => item.status === 'Pending').length;
    const errors = records.filter((item) => item.status === 'Error').length;
    const latest = records
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      total,
      verified,
      pending,
      errors,
      latest: latest ? formatDate(latest.date) : '—',
    };
  }, [records]);

  const activeRecord = React.useMemo(
    () => records.find((item) => item.id === activeRecordId) ?? null,
    [records, activeRecordId],
  );

  React.useEffect(() => {
    if (!queryRunning) return;

    const handle = window.setInterval(() => {
      setQueryProgress((previous) => {
        if (previous >= 100) {
          window.clearInterval(handle);
          setQueryRunning(false);
          setToast({
            open: true,
            message: 'External network query completed. New records are ready for review.',
            severity: 'success',
          });
          return 100;
        }
        return previous + 12;
      });
    }, 350);

    return () => window.clearInterval(handle);
  }, [queryRunning]);

  const tabsWithCounts = React.useMemo(
    () =>
      TABS.map((item) => ({
        id: item.id,
        label: (
          <Stack direction="row" spacing={0.8} alignItems="center">
            <span>{item.label}</span>
            <Chip
              size="small"
              label={tabCounts[item.id]}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                borderRadius: 99,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            />
          </Stack>
        ),
      })),
    [tabCounts, theme.palette.primary.main],
  );

  const clearFilters = () => {
    setSearch('');
    setOrgFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    setStatusFilter('all');
    setTab('overview');
  };

  const openRecordDrawer = (recordId: string) => {
    setActiveRecordId(recordId);
    setDrawerTab('details');
    setRecordDrawerOpen(true);
  };

  const worklistColumns = React.useMemo<CommonColumn<GlobalPatient>[]>(
    () => [
      {
        field: 'patient',
        headerName: 'Patient',
        width: '26%',
        renderCell: (patient) => (
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontWeight: 700 }}>
              {initials(patient.name)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {patient.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {patient.mrn} · {patient.ageGender}
              </Typography>
              <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 0.45 }}>
                <EnterpriseStatusChip label={patient.status} tone={getPatientStatusTone(patient.status)} />
                {patient.tags.slice(0, 1).map((tag) => (
                  <Chip key={`${patient.mrn}-${tag}`} size="small" label={tag} variant="outlined" />
                ))}
              </Stack>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'department',
        headerName: 'Department',
        width: '16%',
        renderCell: (patient) => (
          <Box>
            <Typography variant="body2">{patient.department}</Typography>
            <Typography variant="caption" color="text.secondary">
              {patient.city}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'primaryDoctor',
        headerName: 'Primary Doctor',
        width: '16%',
        renderCell: (patient) => patient.primaryDoctor,
      },
      {
        field: 'lastVisit',
        headerName: 'Last Visit',
        width: '12%',
        renderCell: (patient) => formatDate(patient.lastVisit),
      },
      {
        field: 'externalRecords',
        headerName: 'External Records',
        width: '12%',
        renderCell: (patient) => (
          <Chip
            size="small"
            label={`${getExternalRecordCount(patient)} records`}
            sx={{
              borderRadius: 99,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.22),
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          />
        ),
      },
      {
        field: 'access',
        headerName: 'Access',
        width: '10%',
        renderCell: (patient) => {
          const access = getNetworkAccessState(patient);
          return <EnterpriseStatusChip label={access.label} tone={access.tone} />;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'right',
        width: '8%',
        renderCell: (patient) => (
          <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => setSelectedPatient(patient)}>
            View
          </Button>
        ),
      },
    ],
    [theme.palette.primary.main],
  );

  const recordColumns = React.useMemo<CommonColumn<ExternalRecord>[]>(
    () => [
      {
        field: 'record',
        headerName: 'Record / Patient',
        width: '22%',
        renderCell: (record) => (
          <Stack spacing={0.35}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {record.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {record.patientName} · {selectedPatient?.mrn}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: '14%',
        renderCell: (record) => <Chip size="small" label={record.type} variant="outlined" />,
      },
      {
        field: 'organization',
        headerName: 'Source Organization',
        width: '18%',
        renderCell: (record) => (
          <Stack direction="row" spacing={0.7} alignItems="center">
            <PublicIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{record.organization}</Typography>
          </Stack>
        ),
      },
      {
        field: 'date',
        headerName: 'Date',
        width: '10%',
        renderCell: (record) => formatDate(record.date),
      },
      {
        field: 'provider',
        headerName: 'Provider',
        width: '14%',
        renderCell: (record) => record.provider,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: '10%',
        renderCell: (record) => <EnterpriseStatusChip label={record.status} tone={statusTone(record.status)} />,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'right',
        width: '12%',
        renderCell: (record) => (
          <Stack direction="row" spacing={0.4} justifyContent="flex-end">
            <IconButton size="small" onClick={() => openRecordDrawer(record.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                setToast({
                  open: true,
                  message: `Copied ${record.id} reference to clipboard.`,
                  severity: 'info',
                })
              }
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                setToast({
                  open: true,
                  message: `Reconciliation opened for ${record.id}.`,
                  severity: 'info',
                })
              }
            >
              <ImportExportIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [selectedPatient?.mrn],
  );

  const handleRunQuery = () => {
    if (queryNetworks.length === 0 || queryRecordTypes.length === 0) {
      setToast({
        open: true,
        message: 'Select at least one network and one record type before querying.',
        severity: 'warning',
      });
      return;
    }
    setQueryOpen(false);
    setQueryProgress(0);
    setQueryRunning(true);
  };

  const handleImportRecord = () => {
    if (!importForm.organization.trim() || !importForm.provider.trim()) {
      setToast({
        open: true,
        message: 'Organization and provider are required.',
        severity: 'warning',
      });
      return;
    }

    const newRecord: ExternalRecord = {
      id: `REC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(records.length + 1).padStart(3, '0')}`,
      patientName: selectedPatient?.name ?? 'Patient',
      type: importForm.type,
      organization: importForm.organization.trim(),
      date: importForm.date,
      provider: importForm.provider.trim(),
      status: 'New',
      documents: ['Imported Document'],
      summary: importForm.notes.trim() || 'Imported manually by user.',
    };

    setRecords((previous) => [newRecord, ...previous]);
    setImportOpen(false);
    setImportForm({
      type: 'Lab Result',
      organization: '',
      provider: '',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setToast({
      open: true,
      message: 'Record imported and added to Care Everywhere queue.',
      severity: 'success',
    });
  };

  const handleExport = () => {
    const scopeCount = exportScope === 'all' ? records.length : filteredRecords.length;

    setExportOpen(false);
    setToast({
      open: true,
      message: `Prepared ${scopeCount} record(s) in ${exportFormat} format${includeAuditTrail ? ' with audit trail' : ''}.`,
      severity: 'info',
    });
  };

  const toggleConsent = (id: string, enabled: boolean) => {
    setConsents((previous) =>
      previous.map((item) => (item.id === id ? { ...item, enabled } : item)),
    );
  };

  if (!selectedPatient) {
    return (
      <PageTemplate
        title="Care Everywhere"
        subtitle="Interoperability Network"
      >
        <Stack spacing={2}>
          <Box
            sx={{
              ...softSurfaceSx,
              p: 1.6,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                theme.palette.info.main,
                0.03,
              )} 100%)`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Care Everywhere Patient Worklist
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select patient from table and open external records workspace using the View button.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <CommonDataGrid<GlobalPatient>
            rows={filteredPatientWorklist}
            columns={worklistColumns}
            getRowId={(row) => row.mrn}
            showSerialNo={true}
            searchPlaceholder="Search patient, MRN, phone, department..."
            searchFields={['mrn', 'name', 'phone', 'department', 'primaryDoctor']}
            externalSearchValue={worklistSearch}
            onSearchChange={setWorklistSearch}
            defaultRowsPerPage={8}
            toolbarRight={
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={worklistStatus}
                  onChange={(event) => setWorklistStatus(event.target.value as WorklistStatusFilter)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Admitted">Admitted</MenuItem>
                  <MenuItem value="Discharged">Discharged</MenuItem>
                </TextField>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setWorklistSearch('');
                    setWorklistStatus('all');
                  }}
                >
                  Clear
                </Button>
              </Stack>
            }
          />
        </Stack>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Care Everywhere"
      subtitle="External Interoperability Workspace"
    >
      <Stack spacing={2}>
        <Box
          sx={{
            ...softSurfaceSx,
            p: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.info.main,
              0.03,
            )} 100%)`,
          }}
        >
          <Stack spacing={1.75}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 800 }}>
                  {initials(selectedPatient.name)}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {selectedPatient.name}
                    </Typography>
                    <Chip size="small" label={selectedPatient.mrn} variant="outlined" />
                    <Chip size="small" label={selectedPatient.ageGender} variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Department: {selectedPatient.department}
                  </Typography>
                
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SyncIcon />}
                  onClick={() => {
                    setQueryProgress(0);
                    setQueryRunning(true);
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setSelectedPatient(null);
                    setRecordDrawerOpen(false);
                  }}
                >
                  Back to Worklist
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ ...softSurfaceSx, p: 1.25 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CommonTabs tabs={tabsWithCounts} value={tab} onChange={setTab} />
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button variant="outlined" size="small" startIcon={<SearchIcon />} onClick={() => setQueryOpen(true)}>
                Query
              </Button>
              <Button variant="contained" size="small" startIcon={<UploadFileIcon />} onClick={() => setImportOpen(true)}>
                Import
              </Button>
              <Button variant="outlined" size="small" startIcon={<QueryStatsIcon />} onClick={() => setActivityOpen(true)}>
                Activity
              </Button>
              <Button variant="outlined" size="small" startIcon={<ShieldIcon />} onClick={() => setConsentOpen(true)}>
                Consent
              </Button>
              <Button variant="outlined" size="small" startIcon={<HubIcon />} onClick={() => setNetworkOpen(true)}>
                Networks
              </Button>
            </Stack>
          </Stack>
        </Box>

        {queryRunning ? (
          <Alert
            severity="info"
            icon={<SyncIcon fontSize="small" />}
            sx={{ ...softSurfaceSx, py: 1.1, '& .MuiAlert-message': { width: '100%' } }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Querying external networks for latest records
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.min(queryProgress, 100)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(queryProgress, 100)}
                sx={{ height: 8, borderRadius: 99, backgroundColor: alpha(theme.palette.primary.main, 0.14) }}
              />
            </Stack>
          </Alert>
        ) : null}

        <Grid container spacing={1.4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatTile label="Total Records" value={metrics.total} subtitle="Across networks" tone="primary" icon={<HubIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatTile label="Verified" value={metrics.verified} subtitle="Clinically reconciled" tone="success" icon={<CheckCircleIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatTile label="Pending" value={metrics.pending} subtitle="Need review/consent" tone="warning" icon={<PendingActionsIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatTile label="Errors" value={metrics.errors} subtitle="Sync issues" tone="error" icon={<ErrorOutlineIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatTile label="Last Record" value={metrics.latest} subtitle="Most recent source update" tone="info" icon={<CloudDownloadIcon />} />
          </Grid>
        </Grid>

        <Box sx={{ ...softSurfaceSx, p: 1.2 }}>
          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            {STATUS_FILTERS.map((filter) => {
              const selected = statusFilter === filter;
              return (
                <Chip
                  key={filter}
                  label={filter === 'all' ? 'All' : filter}
                  onClick={() => setStatusFilter(filter)}
                  sx={{
                    borderRadius: 99,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.06),
                    color: selected ? theme.palette.primary.contrastText : 'text.secondary',
                    border: '1px solid',
                    borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.18),
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <CommonDataGrid<ExternalRecord>
          rows={filteredRecords}
          columns={recordColumns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search by record id, type, source organization, provider..."
          searchFields={['id', 'patientName', 'type', 'organization', 'provider', 'summary']}
          externalSearchValue={search}
          onSearchChange={setSearch}
          defaultRowsPerPage={6}
          toolbarRight={
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <TextField
                select
                label="Organization"
                size="small"
                sx={{ minWidth: 180 }}
                value={orgFilter}
                onChange={(event) => setOrgFilter(event.target.value)}
              >
                <MenuItem value="all">All Organizations</MenuItem>
                {organizationOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Type"
                size="small"
                sx={{ minWidth: 160 }}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as 'all' | RecordType)}
                disabled={tab !== 'overview'}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Lab Result">Lab Result</MenuItem>
                <MenuItem value="Radiology">Radiology</MenuItem>
                <MenuItem value="Discharge">Discharge</MenuItem>
                <MenuItem value="Prescription">Prescription</MenuItem>
                <MenuItem value="Consult Note">Consult Note</MenuItem>
              </TextField>
              <TextField
                select
                label="Date"
                size="small"
                sx={{ minWidth: 135 }}
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              >
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="last30">Last 30 Days</MenuItem>
                <MenuItem value="last6m">Last 6 Months</MenuItem>
                <MenuItem value="last1y">Last 1 Year</MenuItem>
                <MenuItem value="2026">Year 2026</MenuItem>
                <MenuItem value="2025">Year 2025</MenuItem>
              </TextField>
              <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>
                Clear
              </Button>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => setExportOpen(true)}>
                Export
              </Button>
            </Stack>
          }
        />

      </Stack>

      <Dialog open={activityOpen} onClose={() => setActivityOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Query Activity</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.1}>
            {ACTIVITY_SEED.map((item) => (
              <Paper
                key={item.id}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.14),
                }}
              >
                <Stack spacing={0.45}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.event}
                    </Typography>
                    <EnterpriseStatusChip
                      label={item.severity.toUpperCase()}
                      tone={activityTone(item.severity)}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {item.timestamp}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setActivityOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={queryOpen} onClose={() => setQueryOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Query External Networks</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Patient ABHA ID" value="91-1234-5678-90" disabled />
            <TextField
              select
              label="Query Date Range"
              value={queryRange}
              onChange={(event) => setQueryRange(event.target.value as QueryRange)}
            >
              <MenuItem value="6m">Last 6 months</MenuItem>
              <MenuItem value="1y">Last 1 year</MenuItem>
              <MenuItem value="2y">Last 2 years</MenuItem>
              <MenuItem value="all">All time</MenuItem>
            </TextField>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                Select Networks
              </Typography>
              <Grid container spacing={1}>
                {NETWORK_SEED.map((network) => (
                  <Grid item xs={12} md={6} key={network.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        borderColor: alpha(theme.palette.primary.main, 0.16),
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={queryNetworks.includes(network.id)}
                            onChange={(event) =>
                              setQueryNetworks((previous) => {
                                if (event.target.checked) return [...previous, network.id];
                                return previous.filter((id) => id !== network.id);
                              })
                            }
                          />
                        }
                        label={
                          <Stack spacing={0.1}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {network.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {network.type}
                            </Typography>
                          </Stack>
                        }
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                Record Types
              </Typography>
              <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                {(['Lab Result', 'Radiology', 'Discharge', 'Prescription', 'Consult Note'] as RecordType[]).map((type) => {
                  const selected = queryRecordTypes.includes(type);
                  return (
                    <Chip
                      key={type}
                      label={type}
                      onClick={() =>
                        setQueryRecordTypes((previous) => {
                          if (previous.includes(type)) return previous.filter((item) => item !== type);
                          return [...previous, type];
                        })
                      }
                      sx={{
                        borderRadius: 99,
                        cursor: 'pointer',
                        fontWeight: 700,
                        backgroundColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.08),
                        color: selected ? theme.palette.primary.contrastText : 'text.secondary',
                        border: '1px solid',
                        borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.18),
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setQueryOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<SyncIcon />} onClick={handleRunQuery}>
            Run Query
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Import Record</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Record Type"
              value={importForm.type}
              onChange={(event) =>
                setImportForm((previous) => ({ ...previous, type: event.target.value as RecordType }))
              }
            >
              <MenuItem value="Lab Result">Lab Result</MenuItem>
              <MenuItem value="Radiology">Radiology</MenuItem>
              <MenuItem value="Discharge">Discharge</MenuItem>
              <MenuItem value="Prescription">Prescription</MenuItem>
              <MenuItem value="Consult Note">Consult Note</MenuItem>
            </TextField>
            <TextField
              label="Source Organization"
              value={importForm.organization}
              onChange={(event) =>
                setImportForm((previous) => ({ ...previous, organization: event.target.value }))
              }
            />
            <TextField
              label="Provider"
              value={importForm.provider}
              onChange={(event) =>
                setImportForm((previous) => ({ ...previous, provider: event.target.value }))
              }
            />
            <TextField
              type="date"
              label="Record Date"
              value={importForm.date}
              onChange={(event) => setImportForm((previous) => ({ ...previous, date: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Clinical Notes"
              multiline
              minRows={3}
              value={importForm.notes}
              onChange={(event) => setImportForm((previous) => ({ ...previous, notes: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setImportOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleImportRecord}>
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Export Records</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Export Format"
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
            >
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="FHIR Bundle">FHIR Bundle</MenuItem>
              <MenuItem value="CCD XML">CCD XML</MenuItem>
            </TextField>
            <TextField
              select
              label="Scope"
              value={exportScope}
              onChange={(event) => setExportScope(event.target.value as ExportScope)}
            >
              <MenuItem value="all">All Records ({records.length})</MenuItem>
              <MenuItem value="filtered">Filtered Records ({filteredRecords.length})</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={includeAuditTrail}
                  onChange={(event) => setIncludeAuditTrail(event.target.checked)}
                />
              }
              label="Include audit trail"
            />
            <Alert severity="info" icon={<TuneIcon fontSize="small" />}>
              Export package is encrypted and generated with user-access logs.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setExportOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={consentOpen} onClose={() => setConsentOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Consent Management</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            {consents.map((consent) => (
              <Paper
                key={consent.id}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <Switch
                    checked={consent.enabled}
                    onChange={(event) => toggleConsent(consent.id, event.target.checked)}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {consent.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {consent.organization}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Expires on {formatDate(consent.expiresOn)}
                    </Typography>
                  </Box>
                  <EnterpriseStatusChip
                    label={consent.enabled ? 'Granted' : 'Revoked'}
                    tone={consent.enabled ? 'active' : 'critical'}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setConsentOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConsentOpen(false);
              setToast({
                open: true,
                message: 'Consent preferences updated successfully.',
                severity: 'success',
              });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={networkOpen} onClose={() => setNetworkOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Manage Networks</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1.2}>
            {NETWORK_SEED.map((network) => (
              <Grid item xs={12} md={6} key={network.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    borderColor: alpha(theme.palette.primary.main, 0.16),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <PublicIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {network.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {network.type}
                      </Typography>
                    </Box>
                    <EnterpriseStatusChip
                      label={network.status === 'live' ? 'Connected' : network.status === 'warning' ? 'Degraded' : 'Offline'}
                      tone={networkTone(network.status)}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      Records: {network.records}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Latency: {network.latency}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button variant="outlined" onClick={() => setNetworkOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setNetworkOpen(false);
              setToast({
                open: true,
                message: 'Network configuration saved.',
                severity: 'success',
              });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={recordDrawerOpen}
        onClose={() => setRecordDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520 },
            borderLeft: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
          },
        }}
      >
        {activeRecord ? (
          <Stack sx={{ height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Avatar sx={{ width: 42, height: 42, bgcolor: 'primary.main' }}>
                  {initials(activeRecord.patientName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {activeRecord.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeRecord.type} · {activeRecord.organization}
                  </Typography>
                  <Stack direction="row" spacing={0.8} sx={{ mt: 0.8 }}>
                    <EnterpriseStatusChip label={activeRecord.status} tone={statusTone(activeRecord.status)} />
                    <Chip size="small" label={formatDate(activeRecord.date)} variant="outlined" />
                  </Stack>
                </Box>
                <IconButton size="small" onClick={() => setRecordDrawerOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{ px: 1.25, pt: 1 }}>
              <CommonTabs
                tabs={[
                  { id: 'details', label: 'Details' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'consent', label: 'Consent' },
                ]}
                value={drawerTab}
                onChange={(value) => setDrawerTab(value as DrawerTab)}
              />
            </Box>

            <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
              {drawerTab === 'details' ? (
                <Stack spacing={1.4}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14) }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Clinical Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                      {activeRecord.summary}
                    </Typography>
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14) }}
                  >
                    <Stack spacing={0.8}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Source Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Patient:</strong> {activeRecord.patientName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Provider:</strong> {activeRecord.provider}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Organization:</strong> {activeRecord.organization}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(activeRecord.date)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Stack>
              ) : null}

              {drawerTab === 'documents' ? (
                <Stack spacing={1}>
                  {activeRecord.documents.map((doc) => (
                    <Paper
                      key={doc}
                      variant="outlined"
                      sx={{ p: 1.1, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14) }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalHospitalIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="body2">{doc}</Typography>
                        </Stack>
                        <Button size="small" variant="text" startIcon={<OpenInNewIcon fontSize="small" />}>
                          Open
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : null}

              {drawerTab === 'timeline' ? (
                <Stack spacing={1}>
                  {ACTIVITY_SEED.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 1.1, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14) }}
                    >
                      <Stack spacing={0.45}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.event}
                          </Typography>
                          <EnterpriseStatusChip label={item.severity.toUpperCase()} tone={activityTone(item.severity)} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {item.detail}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {item.timestamp}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : null}

              {drawerTab === 'consent' ? (
                <Stack spacing={1}>
                  {consents.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 1.1, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14) }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.organization}
                          </Typography>
                        </Box>
                        <Switch checked={item.enabled} onChange={(event) => toggleConsent(item.id, event.target.checked)} />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : null}
            </Box>

            <Divider />
            <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
              <Button variant="outlined" startIcon={<EditNoteIcon />} fullWidth>
                Reconcile
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} fullWidth>
                Download
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>

      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((previous) => ({ ...previous, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
