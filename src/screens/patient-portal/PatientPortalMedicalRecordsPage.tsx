'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { cardShadow } from '@/src/core/theme/tokens';
import { alpha, useTheme } from '@/src/ui/theme';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  FolderShared as FolderSharedIcon,
  Image as ImageIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MedicalInformation as MedicalInformationIcon,
  MonitorWeight as MonitorWeightIcon,
  Print as PrintIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  Vaccines as VaccinesIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import {
  LAB_REQUISITIONS,
  MEDICAL_RECORDS,
} from './patient-portal-mock-data';
import type {
  LabRequisition,
  MedicalRecord,
} from './patient-portal-types';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';
import PatientPortalLabReportsPage from './PatientPortalLabReportsPage';

type RecordsTab =
  | 'lab-reports'
  | 'lab-requisitions'
  | 'vitals'
  | 'bmi'
  | 'upload'
  | 'other';

type OcrBlockId = 'lab-report' | 'lab-requisition' | 'other-docs';
type OcrState = 'idle' | 'file-selected' | 'running' | 'done';
type SmartScaleFilter = 'all' | 'normal' | 'over';

type SmartScaleSession = {
  id: string;
  date: string;
  time: string;
  month: string;
  sessionNo: number;
  weight: number;
  bmi: number;
  category: 'Normal' | 'Normal-High' | 'Overweight' | 'Obese';
  bodyFat: number;
  bmr: number;
  visceralFat: number;
  bodyType: string;
};

const REQ_STATUS_META: Record<
  LabRequisition['status'],
  { color: string; bg: string; label: string }
> = {
  Pending: { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  'Sent to Lab': { color: '#1e40af', bg: '#dbeafe', label: 'Sent to Lab' },
  Collected: { color: '#6d28d9', bg: '#ede9fe', label: 'Collected' },
  Completed: { color: '#065f46', bg: '#d1fae5', label: 'Completed' },
};

const RECORD_TYPE_META: Record<
  MedicalRecord['type'],
  { color: string; icon: React.ReactNode }
> = {
  Visit: {
    color: '#1172BA',
    icon: <LocalHospitalIcon sx={{ fontSize: 14 }} />,
  },
  Lab: {
    color: '#2FA77A',
    icon: <ScienceIcon sx={{ fontSize: 14 }} />,
  },
  Imaging: {
    color: '#0B84D0',
    icon: <ImageIcon sx={{ fontSize: 14 }} />,
  },
  Procedure: {
    color: '#2C8AD3',
    icon: <VaccinesIcon sx={{ fontSize: 14 }} />,
  },
  Prescription: {
    color: '#F3C44E',
    icon: <LocalPharmacyIcon sx={{ fontSize: 14 }} />,
  },
};

const SMART_SCALE_SESSIONS: SmartScaleSession[] = [
  {
    id: 'ss-8',
    date: '11 Jan 2026',
    time: '11:19 AM',
    month: 'Jan 2026',
    sessionNo: 8,
    weight: 59.4,
    bmi: 21.8,
    category: 'Normal',
    bodyFat: 34.9,
    bmr: 1210,
    visceralFat: 8,
    bodyType: 'Normal',
  },
  {
    id: 'ss-7',
    date: '05 Dec 2025',
    time: '09:42 AM',
    month: 'Dec 2025',
    sessionNo: 7,
    weight: 60.8,
    bmi: 22.4,
    category: 'Normal',
    bodyFat: 35.6,
    bmr: 1225,
    visceralFat: 8.4,
    bodyType: 'Normal',
  },
  {
    id: 'ss-6',
    date: '18 Oct 2025',
    time: '08:15 AM',
    month: 'Oct 2025',
    sessionNo: 6,
    weight: 64.2,
    bmi: 23.8,
    category: 'Normal-High',
    bodyFat: 37.2,
    bmr: 1240,
    visceralFat: 9,
    bodyType: 'Normal',
  },
  {
    id: 'ss-5',
    date: '03 Aug 2025',
    time: '07:50 AM',
    month: 'Aug 2025',
    sessionNo: 5,
    weight: 67.8,
    bmi: 25.1,
    category: 'Overweight',
    bodyFat: 39.5,
    bmr: 1260,
    visceralFat: 10,
    bodyType: 'Mild Overweight',
  },
  {
    id: 'ss-4',
    date: '20 May 2025',
    time: '10:05 AM',
    month: 'May 2025',
    sessionNo: 4,
    weight: 71.1,
    bmi: 26.3,
    category: 'Overweight',
    bodyFat: 41.1,
    bmr: 1280,
    visceralFat: 10.6,
    bodyType: 'Overweight',
  },
  {
    id: 'ss-3',
    date: '10 Mar 2025',
    time: '09:00 AM',
    month: 'Mar 2025',
    sessionNo: 3,
    weight: 73.5,
    bmi: 27.1,
    category: 'Overweight',
    bodyFat: 42.8,
    bmr: 1295,
    visceralFat: 11.1,
    bodyType: 'Overweight',
  },
  {
    id: 'ss-2',
    date: '15 Jan 2025',
    time: '06:30 AM',
    month: 'Jan 2025',
    sessionNo: 2,
    weight: 75.2,
    bmi: 27.7,
    category: 'Overweight',
    bodyFat: 44.1,
    bmr: 1305,
    visceralFat: 11.6,
    bodyType: 'Overweight',
  },
  {
    id: 'ss-1',
    date: '02 Nov 2024',
    time: '10:20 AM',
    month: 'Nov 2024',
    sessionNo: 1,
    weight: 77,
    bmi: 28.4,
    category: 'Overweight',
    bodyFat: 45.5,
    bmr: 1320,
    visceralFat: 12,
    bodyType: 'Overweight',
  },
];

const SMART_SCALE_COMPOSITION = [
  { name: 'Body Fat (%)', value: '39.50%', pct: 39.5 },
  { name: 'Muscle (%)', value: '56.80%', pct: 56.8 },
  { name: 'Skeletal Muscle (%)', value: '33.20%', pct: 33.2 },
  { name: 'Subcutaneous Fat (%)', value: '29.20%', pct: 29.2 },
  { name: 'Visceral Fat', value: '10.00', pct: 50 },
  { name: 'Bone Mass', value: '2.74 kg', pct: 20 },
  { name: 'Protein (%)', value: '12.10%', pct: 12.1 },
  { name: 'Water (%)', value: '43.80%', pct: 43.8 },
] as const;

const SMART_SCALE_MASS_BREAKDOWN = [
  {
    label: 'Protein Mass Range',
    min: 6.8,
    avg: 7.8,
    max: 8.8,
    unit: 'kg',
    progress: 65,
  },
  {
    label: 'Water Mass Range',
    min: 25,
    avg: 28.9,
    max: 32.8,
    unit: 'kg',
    progress: 55,
  },
  {
    label: 'Muscle Mass Range',
    min: 32.4,
    avg: 37.2,
    max: 42,
    unit: 'kg',
    progress: 50,
  },
] as const;

function getBmiBadge(category: SmartScaleSession['category']) {
  if (category === 'Normal') {
    return {
      color: '#166534',
      bg: '#ecfdf3',
      border: '#a7f3d0',
    };
  }
  if (category === 'Normal-High') {
    return {
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    };
  }
  if (category === 'Overweight') {
    return {
      color: '#0b84d0',
      bg: '#ecf7ff',
      border: '#bae6fd',
    };
  }
  return {
    color: '#991b1b',
    bg: '#fef2f2',
    border: '#fecaca',
  };
}

const OCR_PLACEHOLDER_TEXT: Record<OcrBlockId, string> = {
  'lab-report':
    'CBC report extracted. HbA1c elevated at 7.1%. LDL borderline high. Suggested follow-up in 6 weeks.',
  'lab-requisition':
    'Requisition extracted: CBC, HbA1c, Lipid Panel. Fasting sample required before 9:00 AM.',
  'other-docs':
    'Discharge summary extracted: Continue Metoprolol 50mg OD, monitor BP twice daily, follow-up after 14 days.',
};

const UPLOAD_BLOCKS: Array<{
  id: OcrBlockId;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'lab-report',
    title: 'Upload Lab Report',
    subtitle: 'Auto OCR extraction for report values',
    color: '#2563eb',
    icon: <ScienceIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: 'lab-requisition',
    title: 'Upload Lab Requisition',
    subtitle: 'Extract ordered tests and send digitally',
    color: '#7c3aed',
    icon: <AssignmentIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: 'other-docs',
    title: 'Upload Other Medical Documents',
    subtitle: 'Discharge summaries, imaging, insurance, prescription',
    color: '#0f766e',
    icon: <MedicalInformationIcon sx={{ fontSize: 16 }} />,
  },
];

function tabFromQuery(view: string | null): RecordsTab {
  if (view === 'lab-reports') return 'lab-reports';
  if (view === 'lab-requisitions') return 'lab-requisitions';
  return 'lab-reports';
}

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query);
}

export default function PatientPortalMedicalRecordsPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);

  const [activeTab, setActiveTab] = React.useState<RecordsTab>(() =>
    tabFromQuery(searchParams.get('view'))
  );
  const [query, setQuery] = React.useState('');
  const [selectedRequisition, setSelectedRequisition] =
    React.useState<LabRequisition | null>(null);
  const [selectedOtherRecord, setSelectedOtherRecord] =
    React.useState<MedicalRecord | null>(null);
  const [smartScaleFilter, setSmartScaleFilter] =
    React.useState<SmartScaleFilter>('all');
  const [smartScaleActiveId, setSmartScaleActiveId] = React.useState(
    SMART_SCALE_SESSIONS[3]?.id ?? SMART_SCALE_SESSIONS[0]?.id ?? ''
  );
  const [addRecordOpen, setAddRecordOpen] = React.useState(false);
  const [addRecordDraft, setAddRecordDraft] = React.useState({
    type: 'Lab Report',
    title: '',
    date: '2026-03-19',
    source: '',
    issuedBy: '',
    notes: '',
  });
  const [addRecordFileName, setAddRecordFileName] = React.useState('');
  const addRecordFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'info' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  const [ocrProgress, setOcrProgress] = React.useState<Record<OcrBlockId, number>>({
    'lab-report': 0,
    'lab-requisition': 0,
    'other-docs': 0,
  });
  const [ocrText, setOcrText] = React.useState<Record<OcrBlockId, string>>({
    'lab-report': '',
    'lab-requisition': '',
    'other-docs': '',
  });
  const [ocrState, setOcrState] = React.useState<Record<OcrBlockId, OcrState>>({
    'lab-report': 'idle',
    'lab-requisition': 'idle',
    'other-docs': 'idle',
  });
  const [ocrFileName, setOcrFileName] = React.useState<Record<OcrBlockId, string>>({
    'lab-report': '',
    'lab-requisition': '',
    'other-docs': '',
  });
  const [dragOver, setDragOver] = React.useState<Record<OcrBlockId, boolean>>({
    'lab-report': false,
    'lab-requisition': false,
    'other-docs': false,
  });
  const fileInputRefs = React.useRef<Record<OcrBlockId, HTMLInputElement | null>>({
    'lab-report': null,
    'lab-requisition': null,
    'other-docs': null,
  });
  const [runningOcr, setRunningOcr] = React.useState<OcrBlockId | null>(null);

  React.useEffect(() => {
    setActiveTab(tabFromQuery(searchParams.get('view')));
  }, [searchParams]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRequisitions = React.useMemo(() => {
    if (!normalizedQuery) return LAB_REQUISITIONS;
    return LAB_REQUISITIONS.filter((req) =>
      [
        req.requisitionNo,
        req.orderedBy,
        req.lab ?? '',
        req.status,
        req.tests.join(' '),
      ].some((value) => includesQuery(value, normalizedQuery))
    );
  }, [normalizedQuery]);

  const otherRecords = React.useMemo(() => {
    const records = MEDICAL_RECORDS.filter((record) => record.type !== 'Lab');
    if (!normalizedQuery) return records;
    return records.filter((record) =>
      [record.title, record.type, record.summary, record.doctor, record.date].some(
        (value) => includesQuery(value, normalizedQuery)
      )
    );
  }, [normalizedQuery]);

  const smartScaleVisibleSessions = React.useMemo(() => {
    return SMART_SCALE_SESSIONS.filter((session) => {
      if (smartScaleFilter === 'normal' && !['Normal', 'Normal-High'].includes(session.category)) {
        return false;
      }
      if (smartScaleFilter === 'over' && !['Overweight', 'Obese'].includes(session.category)) {
        return false;
      }
      return true;
    });
  }, [smartScaleFilter]);

  React.useEffect(() => {
    if (smartScaleVisibleSessions.length === 0) return;
    if (smartScaleVisibleSessions.some((session) => session.id === smartScaleActiveId)) return;
    setSmartScaleActiveId(smartScaleVisibleSessions[0].id);
  }, [smartScaleVisibleSessions, smartScaleActiveId]);

  const activeSmartScaleSession = React.useMemo(
    () =>
      SMART_SCALE_SESSIONS.find((session) => session.id === smartScaleActiveId) ??
      SMART_SCALE_SESSIONS[0],
    [smartScaleActiveId]
  );
  const activeSmartScaleBadge = getBmiBadge(activeSmartScaleSession.category);
  const bmiRingRadius = 44;
  const bmiRingCircumference = 2 * Math.PI * bmiRingRadius;
  const bmiRingProgress = Math.min(
    1,
    Math.max(0, (activeSmartScaleSession.bmi - 15) / 25)
  );
  const bmiRingOffset = bmiRingCircumference - bmiRingProgress * bmiRingCircumference;
  const bmiPinLeft = Math.min(
    97,
    Math.max(2, ((activeSmartScaleSession.bmi - 15) / 25) * 100)
  );

  const tabSearchPlaceholder: Record<RecordsTab, string> = {
    'lab-reports': 'Search report number, category, lab, tests...',
    'lab-requisitions': 'Search requisition number, doctor, lab, tests...',
    vitals: 'Search vital name or status...',
    bmi: 'Search not required for BMI panel',
    upload: 'Search not required for upload panel',
    other: 'Search document title, doctor, type...',
  };

  const setToast = React.useCallback(
    (msg: string, severity: 'success' | 'info' | 'error' = 'success') => {
      setSnack({ open: true, msg, severity });
    },
    []
  );

  const handleCopy = React.useCallback(
    (value: string, label: string) => {
      navigator.clipboard?.writeText(value);
      setToast(`${label} copied`, 'info');
    },
    [setToast]
  );

  const handleDownload = React.useCallback(
    (label: string) => {
      setToast(`Downloading: ${label}`, 'success');
    },
    [setToast]
  );

  const handleFileSelect = React.useCallback((id: OcrBlockId, fileName: string) => {
    setOcrFileName((prev) => ({ ...prev, [id]: fileName }));
    setOcrState((prev) => ({ ...prev, [id]: 'file-selected' }));
    setOcrText((prev) => ({ ...prev, [id]: '' }));
    setOcrProgress((prev) => ({ ...prev, [id]: 0 }));
  }, []);

  const handleRunOCR = React.useCallback(
    (id: OcrBlockId) => {
      if (runningOcr) return;
      if (ocrState[id] !== 'file-selected') { setToast('Please select a file first', 'error'); return; }
      setRunningOcr(id);
      setOcrState((prev) => ({ ...prev, [id]: 'running' }));
      setOcrProgress((prev) => ({ ...prev, [id]: 0 }));

      let progress = 0;
      const timer = window.setInterval(() => {
        progress += 16;
        setOcrProgress((prev) => ({ ...prev, [id]: Math.min(progress, 100) }));

        if (progress >= 100) {
          window.clearInterval(timer);
          setRunningOcr(null);
          setOcrState((prev) => ({ ...prev, [id]: 'done' }));
          setOcrText((prev) => ({ ...prev, [id]: OCR_PLACEHOLDER_TEXT[id] }));
          setToast('OCR extraction complete', 'success');
        }
      }, 280);
    },
    [runningOcr, ocrState, setToast]
  );

  const handleSaveRecord = React.useCallback(() => {
    if (!addRecordDraft.title.trim()) {
      setToast('Record title is required', 'error');
      return;
    }
    setAddRecordOpen(false);
    setAddRecordDraft({
      type: 'Lab Report',
      title: '',
      date: '2026-03-19',
      source: '',
      issuedBy: '',
      notes: '',
    });
    setAddRecordFileName('');
    setToast('Medical record saved', 'success');
  }, [addRecordDraft.title, setToast]);

  const panelScrollbar = {
    '&::-webkit-scrollbar': { width: 6, height: 6 },
    '&::-webkit-scrollbar-thumb': {
      bgcolor: alpha(theme.palette.primary.main, 0.2),
      borderRadius: 99,
    },
  } as const;
  const smartScaleCardSx = {
    borderRadius: 2,
    border: 'none',
    bgcolor: 'background.paper',
    boxShadow: cardShadow,
  } as const;

  return (
    <PatientPortalWorkspaceCard current="medical-records">
      <Stack spacing={1.25}>
        <Card
          elevation={0}
          sx={{
            ...sectionCard,
            ...(activeTab === 'bmi'
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  height: { xs: 'auto', lg: 'calc(100dvh - 170px)' },
                  minHeight: 0,
                  overflow: 'hidden',
                }
              : {}),
          }}
        >
          <Box
            sx={{
              ...sectionHeader,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FolderSharedIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Medical Records Workspace
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                disableElevation
                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                onClick={() => setActiveTab('upload')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Upload
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={() => setAddRecordOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Add Record
              </Button>
            </Stack>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_event, value: RecordsTab) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              pt: 1,
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 42,
                fontWeight: 700,
              },
            }}
          >
            <Tab value="lab-reports" label="Lab Reports" />
            <Tab value="lab-requisitions" label="Lab Requisitions" />
            <Tab value="vitals" label="Vital Reports" />
            <Tab value="bmi" label="Smart Scale" />
            <Tab value="upload" label="Upload & OCR" />
            <Tab value="other" label="Other Records" />
          </Tabs>

          {(activeTab === 'lab-requisitions' || activeTab === 'other') && (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <TextField
                size="small"
                fullWidth
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tabSearchPlaceholder[activeTab]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {activeTab === 'lab-reports' && (
            <Box sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <PatientPortalLabReportsPage embedded forcedTab={0} showTopTabs={false} />
            </Box>
          )}

          {activeTab === 'lab-requisitions' && (
            <Stack spacing={1.2} sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {filteredRequisitions.map((req) => {
                const statusMeta = REQ_STATUS_META[req.status];
                return (
                  <Box
                    key={req.id}
                    sx={{
                      mt: 1.2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      borderRadius: 2,
                      p: 1.4,
                      bgcolor: alpha(theme.palette.background.default, 0.35),
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {req.requisitionNo}
                          </Typography>
                          <Chip
                            size="small"
                            label={statusMeta.label}
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: statusMeta.bg,
                              color: statusMeta.color,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {req.date} {req.time} - Ordered by {req.orderedBy} -{' '}
                          {req.lab ?? 'Lab not assigned'}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.55}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 0.75 }}
                        >
                          {req.tests.map((test) => (
                            <Chip
                              key={`${req.id}-${test}`}
                              size="small"
                              label={test}
                              variant="outlined"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                          onClick={() => setSelectedRequisition(req)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                        >
                          View
                        </Button>
                        {req.status === 'Pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            startIcon={<SendIcon sx={{ fontSize: 13 }} />}
                            onClick={() => setToast('Requisition sent to lab digitally', 'success')}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                          >
                            Send to Lab
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleDownload(req.requisitionNo)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

              {filteredRequisitions.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <AssignmentIcon
                    sx={{ fontSize: 38, color: 'text.disabled', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No lab requisitions found for this search.
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          {activeTab === 'vitals' && (
            <Box sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <PatientPortalLabReportsPage embedded forcedTab={1} showTopTabs={false} />
            </Box>
          )}

          {activeTab === 'bmi' && (
            <Box
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                flex: 1,
                minHeight: { xs: 560, lg: 0 },
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' },
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    borderRight: { lg: '1px solid' },
                    borderColor: { lg: 'divider' },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        mb: 0.6,
                        display: 'block',
                      }}
                    >
                      Session History
                    </Typography>
                    <Stack direction="row" spacing={0.7} sx={{ mt: 0.2 }} flexWrap="wrap" useFlexGap>
                      {([
                        { id: 'all', label: 'All' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'over', label: 'Overweight' },
                      ] as const).map((filter) => (
                        <Chip
                          key={filter.id}
                          size="small"
                          label={filter.label}
                          clickable
                          onClick={() => setSmartScaleFilter(filter.id)}
                          color={smartScaleFilter === filter.id ? 'primary' : 'default'}
                          variant={smartScaleFilter === filter.id ? 'filled' : 'outlined'}
                          sx={{
                            fontWeight: 600,
                            fontSize: 11.5,
                            height: 28,
                            borderRadius: 1.6,
                            '& .MuiChip-label': { px: 1.1 },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', ...panelScrollbar }}>
                    {smartScaleVisibleSessions.map((session) => {
                      const badge = getBmiBadge(session.category);
                      const selected = session.id === activeSmartScaleSession.id;
                      return (
                        <Box
                          key={session.id}
                          onClick={() => setSmartScaleActiveId(session.id)}
                          sx={{
                            px: 2,
                            py: 1.75,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            bgcolor: selected
                              ? alpha(theme.palette.primary.main, 0.06)
                              : 'background.paper',
                            borderLeft: selected
                              ? `3px solid ${theme.palette.primary.main}`
                              : '3px solid transparent',
                            '&:hover': {
                              bgcolor: selected
                                ? alpha(theme.palette.primary.main, 0.06)
                                : alpha(theme.palette.primary.main, 0.03),
                            },
                            transition: 'background 0.15s',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                              }}
                            >
                              <MonitorWeightIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13.5 }}>
                                  {session.date}, {session.time}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={session.category}
                                  sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: badge.bg,
                                    color: badge.color,
                                    border: `1px solid ${badge.border}`,
                                  }}
                                />
                              </Stack>
                              <Stack direction="row" spacing={0.9} alignItems="center" sx={{ mt: 0.35 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 700, color: badge.color, fontSize: 12.5 }}
                                >
                                  BMI {session.bmi.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>
                                  {session.weight.toFixed(2)} kg
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                    {smartScaleVisibleSessions.length === 0 ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No sessions found.
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.grey[100], 0.35),
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      flexShrink: 0,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Smart Scale Report - Krishna Gajera
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {activeSmartScaleSession.date}, {activeSmartScaleSession.time}
                          </Typography>
                          <Box sx={{ width: 3, height: 3, borderRadius: 999, bgcolor: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            Session #{activeSmartScaleSession.sessionNo}
                          </Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          clickable
                          icon={<DownloadIcon sx={{ fontSize: 14 }} />}
                          label="Download"
                          onClick={() =>
                            handleDownload(
                              `Smart Scale ${activeSmartScaleSession.date} ${activeSmartScaleSession.time}`
                            )
                          }
                          color="primary"
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            fontSize: 11.5,
                            height: 29,
                            borderRadius: 1.7,
                            '& .MuiChip-label': { px: 1.1 },
                          }}
                        />
                        <Chip
                          size="small"
                          clickable
                          icon={<PrintIcon sx={{ fontSize: 14 }} />}
                          label="Print"
                          onClick={() => setToast('Preparing print preview...', 'info')}
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: 11.5,
                            height: 29,
                            borderRadius: 1.7,
                            '& .MuiChip-label': { px: 1.1 },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.1, ...panelScrollbar }}>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                          gap: 1,
                        }}
                      >
                        {[
                          {
                            label: 'Weight',
                            value: `${activeSmartScaleSession.weight.toFixed(2)} kg`,
                            sub: 'Target: 57.10 kg',
                            color: '#2b5ea7',
                          },
                          {
                            label: 'BMI Index',
                            value: activeSmartScaleSession.bmi.toFixed(2),
                            sub: activeSmartScaleSession.category,
                            color: activeSmartScaleBadge.color,
                          },
                          {
                            label: 'Body Fat',
                            value: `${activeSmartScaleSession.bodyFat.toFixed(2)}%`,
                            sub: `Visceral Fat: ${activeSmartScaleSession.visceralFat.toFixed(2)}`,
                            color: '#0b84d0',
                          },
                          {
                            label: 'Basal Met. Rate',
                            value: `${activeSmartScaleSession.bmr}`,
                            sub: `Body Type: ${activeSmartScaleSession.bodyType}`,
                            color: '#166534',
                          },
                        ].map((item) => (
                          <Card
                            key={item.label}
                            elevation={0}
                            sx={{
                              ...smartScaleCardSx,
                              p: 1.2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                                color: 'text.secondary',
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: item.color, lineHeight: 1.2 }}>
                              {item.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.sub}
                            </Typography>
                          </Card>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 0.92fr) minmax(420px, 1.5fr) minmax(240px, 0.9fr)' },
                        }}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            ...smartScaleCardSx,
                            overflow: 'hidden',
                          }}
                        >
                          <Box sx={{ p: 1.2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              BMI Index
                            </Typography>
                          </Box>
                          <Box sx={{ p: 1.4 }}>
                            <Box sx={{ width: 110, height: 110, mx: 'auto', position: 'relative' }}>
                              <svg width="110" height="110" viewBox="0 0 110 110">
                                <circle cx="55" cy="55" r={bmiRingRadius} fill="none" stroke="#eef0f4" strokeWidth="10" />
                                <circle
                                  cx="55"
                                  cy="55"
                                  r={bmiRingRadius}
                                  fill="none"
                                  stroke={activeSmartScaleBadge.color}
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeDasharray={bmiRingCircumference}
                                  strokeDashoffset={bmiRingOffset}
                                  transform="rotate(-90 55 55)"
                                />
                              </svg>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                  {activeSmartScaleSession.bmi.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  BMI
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', height: 7, borderRadius: 99, overflow: 'hidden' }}>
                                <Box sx={{ flex: 28, bgcolor: '#bbf7d0' }} />
                                <Box sx={{ flex: 17, bgcolor: '#bfdbfe' }} />
                                <Box sx={{ flex: 23, bgcolor: '#fed7aa' }} />
                                <Box sx={{ flex: 32, bgcolor: '#fecaca' }} />
                              </Box>
                              <Box
                                sx={{
                                  position: 'relative',
                                  mt: -1.3,
                                  left: `${bmiPinLeft}%`,
                                  width: 13,
                                  height: 13,
                                  borderRadius: 999,
                                  border: '2px solid',
                                  borderColor: 'text.primary',
                                  bgcolor: 'background.paper',
                                  transform: 'translateX(-50%)',
                                }}
                              />
                            </Box>

                            <Stack spacing={0.65} sx={{ mt: 1.2 }}>
                              {[
                                { key: 'Height', value: '165.00 cm' },
                                { key: 'Age', value: '33 years' },
                                { key: 'Target Wt', value: '57.10 kg' },
                                { key: 'Body Type', value: activeSmartScaleSession.bodyType },
                                { key: 'BMR', value: `${activeSmartScaleSession.bmr} kcal` },
                              ].map((item) => (
                                <Stack
                                  key={item.key}
                                  direction="row"
                                  justifyContent="space-between"
                                  sx={{
                                    py: 0.45,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    {item.key}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {item.value}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>

                            <Box
                              sx={{
                                mt: 1.1,
                                p: 0.9,
                                borderRadius: 1.25,
                                border: '1px solid',
                                borderColor: activeSmartScaleBadge.border,
                                bgcolor: activeSmartScaleBadge.bg,
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600, color: activeSmartScaleBadge.color }}>
                                Obesity Level
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: activeSmartScaleBadge.color }}>
                                {activeSmartScaleSession.category}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>

                        <Card
                          elevation={0}
                          sx={{
                            ...smartScaleCardSx,
                            overflow: 'hidden',
                          }}
                        >
                          <Box sx={{ p: 1.2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              Body Composition
                            </Typography>
                          </Box>
                          <Stack spacing={0} sx={{ p: 0 }}>
                            {SMART_SCALE_COMPOSITION.map((row) => (
                              <Stack
                                key={row.name}
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                  px: 1.4,
                                  py: 0.95,
                                  borderBottom: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {row.name}
                                </Typography>
                                <Box sx={{ width: 84, height: 4, bgcolor: 'divider', borderRadius: 99 }}>
                                  <Box
                                    sx={{
                                      width: `${row.pct}%`,
                                      height: '100%',
                                      bgcolor: 'primary.main',
                                      borderRadius: 99,
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ minWidth: 62, textAlign: 'right', fontWeight: 600 }}>
                                  {row.value}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Card>

                        <Card
                          elevation={0}
                          sx={{
                            ...smartScaleCardSx,
                            overflow: 'hidden',
                          }}
                        >
                          <Box sx={{ p: 1.2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              Mass Breakdown
                            </Typography>
                          </Box>
                          <Stack spacing={0}>
                            {SMART_SCALE_MASS_BREAKDOWN.map((section) => (
                              <Box key={section.label} sx={{ p: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
                                  {section.label}
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75, mt: 0.75 }}>
                                  {[
                                    { key: 'Min', value: section.min, highlighted: false },
                                    { key: 'Avg', value: section.avg, highlighted: true },
                                    { key: 'Max', value: section.max, highlighted: false },
                                  ].map((item) => (
                                    <Box
                                      key={item.key}
                                      sx={{
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: item.highlighted ? alpha(theme.palette.primary.main, 0.35) : 'divider',
                                        bgcolor: item.highlighted ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.grey[500], 0.04),
                                        p: 0.75,
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        {item.key}
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                        {item.value.toFixed(2)}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {section.unit}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                                <Box sx={{ mt: 0.85, height: 4, borderRadius: 99, bgcolor: 'divider' }}>
                                  <Box
                                    sx={{
                                      width: `${section.progress}%`,
                                      height: '100%',
                                      borderRadius: 99,
                                      background:
                                        'linear-gradient(90deg, rgba(148,163,184,0.8), rgba(37,99,235,0.85))',
                                    }}
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Card>
                      </Box>

                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'upload' && (
            <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              {/* ── top row: Lab Report + Lab Requisition side-by-side ── */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
                {UPLOAD_BLOCKS.filter(b => b.id !== 'other-docs').map((block) => {
                  const state = ocrState[block.id];
                  const progress = ocrProgress[block.id];
                  const text = ocrText[block.id];
                  const fileName = ocrFileName[block.id];
                  const isDragOver = dragOver[block.id];

                  return (
                    <Card key={block.id} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(block.color, 0.22), overflow: 'hidden' }}>
                      {/* Card header */}
                      <Box sx={{ px: 1.75, py: 1.1, borderBottom: '1px solid', borderColor: alpha(block.color, 0.18), bgcolor: alpha(block.color, 0.05), display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: alpha(block.color, 0.15), color: block.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{block.icon}</Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{block.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{block.subtitle}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ p: 1.5 }}>
                        {/* Drop zone */}
                        <Box
                          onClick={() => fileInputRefs.current[block.id]?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, [block.id]: true })); }}
                          onDragLeave={() => setDragOver(p => ({ ...p, [block.id]: false }))}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(p => ({ ...p, [block.id]: false }));
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileSelect(block.id, file.name);
                          }}
                          sx={{
                            border: '2px dashed', borderRadius: 2, py: 2.5, px: 1.5, textAlign: 'center', cursor: 'pointer',
                            borderColor: isDragOver ? block.color : state === 'file-selected' || state === 'running' || state === 'done' ? alpha(block.color, 0.5) : alpha(block.color, 0.3),
                            bgcolor: isDragOver ? alpha(block.color, 0.07) : state !== 'idle' ? alpha(block.color, 0.04) : alpha(block.color, 0.02),
                            transition: 'all 0.18s',
                            '&:hover': { borderColor: block.color, bgcolor: alpha(block.color, 0.06) },
                          }}
                        >
                          {state === 'idle' ? (
                            <>
                              <CloudUploadIcon sx={{ fontSize: 34, color: alpha(block.color, 0.55), mb: 0.75 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>Drop file here or click to browse</Typography>
                              <Typography variant="caption" color="text.secondary">Supports PDF, JPG, PNG, TIFF up to 10MB</Typography>
                              <Stack direction="row" spacing={0.6} justifyContent="center" sx={{ mt: 1.1, flexWrap: 'wrap', gap: 0.5 }}>
                                {['PDF', 'JPG', 'PNG', 'TIFF'].map(f => (
                                  <Chip key={f} size="small" label={f} sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(block.color, 0.08), color: block.color }} />
                                ))}
                              </Stack>
                            </>
                          ) : (
                            <Stack alignItems="center" spacing={0.5}>
                              <CheckCircleIcon sx={{ fontSize: 22, color: block.color }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: block.color }}>{fileName}</Typography>
                              <Typography variant="caption" color="text.secondary">Click to change file</Typography>
                            </Stack>
                          )}
                        </Box>
                        <input ref={el => { fileInputRefs.current[block.id] = el; }} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.tiff"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(block.id, f.name); }} />

                        {/* Run OCR button — only visible after file selected */}
                        {(state === 'file-selected' || state === 'running' || state === 'done') && (
                          <Box sx={{ mt: 1.25 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              disableElevation
                              size="small"
                              startIcon={state === 'done' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PsychologyIcon sx={{ fontSize: 14 }} />}
                              disabled={state === 'running' || state === 'done'}
                              onClick={() => handleRunOCR(block.id)}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, py: 0.9, bgcolor: state === 'done' ? 'success.main' : block.color, '&:hover': { bgcolor: state === 'done' ? 'success.dark' : alpha(block.color, 0.85) } }}
                            >
                              {state === 'running' ? 'Extracting…' : state === 'done' ? 'OCR Complete' : 'Run OCR'}
                            </Button>
                          </Box>
                        )}

                        {/* Progress bar */}
                        {state === 'running' && (
                          <Box sx={{ mt: 1.25 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: block.color }}>Extracting text from document…</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress}%</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 99, height: 6, bgcolor: alpha(block.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: block.color } }} />
                          </Box>
                        )}

                        {/* OCR Result box — styled like mediport monospace card */}
                        {state === 'done' && text && (
                          <Box sx={{ mt: 1.5, borderRadius: 1.5, border: '1.5px solid', borderColor: alpha(theme.palette.success.main, 0.3), bgcolor: alpha(theme.palette.success.main, 0.04), overflow: 'hidden' }}>
                            <Box sx={{ px: 1.5, py: 0.9, borderBottom: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2), display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.dark' }}>OCR Extracted Text</Typography>
                            </Box>
                            <Box sx={{ px: 1.5, py: 1.1, maxHeight: 160, overflowY: 'auto' }}>
                              <Typography component="pre" variant="caption" sx={{ fontFamily: '"Courier New", monospace', color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block' }}>
                                {text}
                              </Typography>
                            </Box>
                            <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: alpha(theme.palette.success.main, 0.15), display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              <Button size="small" variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }} onClick={() => setToast('Saved to medical records', 'success')}>Save to Records</Button>
                              {block.id === 'lab-requisition' && (
                                <Button size="small" variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, bgcolor: block.color, '&:hover': { bgcolor: alpha(block.color, 0.85) } }} startIcon={<SendIcon sx={{ fontSize: 13 }} />} onClick={() => setToast('Requisition sent to lab digitally', 'success')}>Send to Lab Digitally</Button>
                              )}
                              {block.id === 'lab-report' && (
                                <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5 }} onClick={() => setToast('Share dialog opening…', 'info')}>Share with Doctor</Button>
                              )}
                              <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5 }} startIcon={<ContentCopyIcon sx={{ fontSize: 12 }} />} onClick={() => handleCopy(text, 'Extracted text')}>Copy Text</Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  );
                })}
              </Box>

              {/* ── full-width: Other Medical Documents ── */}
              {(() => {
                const block = UPLOAD_BLOCKS.find(b => b.id === 'other-docs')!;
                const state = ocrState[block.id];
                const progress = ocrProgress[block.id];
                const text = ocrText[block.id];
                const fileName = ocrFileName[block.id];
                const isDragOver = dragOver[block.id];
                return (
                  <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(block.color, 0.22), overflow: 'hidden' }}>
                    <Box sx={{ px: 1.75, py: 1.1, borderBottom: '1px solid', borderColor: alpha(block.color, 0.18), bgcolor: alpha(block.color, 0.05), display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: alpha(block.color, 0.15), color: block.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{block.icon}</Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{block.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{block.subtitle}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Box
                        onClick={() => fileInputRefs.current[block.id]?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, [block.id]: true })); }}
                        onDragLeave={() => setDragOver(p => ({ ...p, [block.id]: false }))}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(p => ({ ...p, [block.id]: false }));
                          const file = e.dataTransfer.files[0];
                          if (file) handleFileSelect(block.id, file.name);
                        }}
                        sx={{
                          border: '2px dashed', borderRadius: 2, py: 2.5, px: 1.5, textAlign: 'center', cursor: 'pointer',
                          borderColor: isDragOver ? block.color : state !== 'idle' ? alpha(block.color, 0.5) : alpha(block.color, 0.3),
                          bgcolor: isDragOver ? alpha(block.color, 0.07) : state !== 'idle' ? alpha(block.color, 0.04) : alpha(block.color, 0.02),
                          transition: 'all 0.18s',
                          '&:hover': { borderColor: block.color, bgcolor: alpha(block.color, 0.06) },
                        }}
                      >
                        {state === 'idle' ? (
                          <>
                            <CloudUploadIcon sx={{ fontSize: 34, color: alpha(block.color, 0.55), mb: 0.75 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>Drop any medical document here · supports multiple files</Typography>
                            <Typography variant="caption" color="text.secondary">Discharge summaries, imaging reports, insurance letters, prescriptions</Typography>
                            <Stack direction="row" spacing={0.6} justifyContent="center" sx={{ mt: 1.1, flexWrap: 'wrap', gap: 0.5 }}>
                              {['PDF', 'JPG', 'PNG', 'DOCX', 'TIFF'].map(f => (
                                <Chip key={f} size="small" label={f} sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(block.color, 0.08), color: block.color }} />
                              ))}
                            </Stack>
                          </>
                        ) : (
                          <Stack alignItems="center" spacing={0.5}>
                            <CheckCircleIcon sx={{ fontSize: 22, color: block.color }} />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: block.color }}>{fileName}</Typography>
                            <Typography variant="caption" color="text.secondary">Click to change file</Typography>
                          </Stack>
                        )}
                      </Box>
                      <input ref={el => { fileInputRefs.current[block.id] = el; }} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.docx,.tiff" multiple
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(block.id, f.name); }} />

                      {(state === 'file-selected' || state === 'running' || state === 'done') && (
                        <Box sx={{ mt: 1.25 }}>
                          <Button fullWidth variant="contained" disableElevation size="small"
                            startIcon={state === 'done' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PsychologyIcon sx={{ fontSize: 14 }} />}
                            disabled={state === 'running' || state === 'done'}
                            onClick={() => handleRunOCR(block.id)}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, py: 0.9, bgcolor: state === 'done' ? 'success.main' : block.color, '&:hover': { bgcolor: state === 'done' ? 'success.dark' : alpha(block.color, 0.85) } }}
                          >
                            {state === 'running' ? 'Extracting…' : state === 'done' ? 'OCR Complete' : 'Run OCR'}
                          </Button>
                        </Box>
                      )}

                      {state === 'running' && (
                        <Box sx={{ mt: 1.25 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: block.color }}>Extracting text from document…</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 99, height: 6, bgcolor: alpha(block.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: block.color } }} />
                        </Box>
                      )}

                      {state === 'done' && text && (
                        <Box sx={{ mt: 1.5, borderRadius: 1.5, border: '1.5px solid', borderColor: alpha(theme.palette.success.main, 0.3), bgcolor: alpha(theme.palette.success.main, 0.04), overflow: 'hidden' }}>
                          <Box sx={{ px: 1.5, py: 0.9, borderBottom: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2), display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.dark' }}>OCR Extracted Text</Typography>
                          </Box>
                          <Box sx={{ px: 1.5, py: 1.1, maxHeight: 160, overflowY: 'auto' }}>
                            <Typography component="pre" variant="caption" sx={{ fontFamily: '"Courier New", monospace', color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block' }}>
                              {text}
                            </Typography>
                          </Box>
                          <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: alpha(theme.palette.success.main, 0.15), display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                            <Button size="small" variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }} onClick={() => setToast('Saved to medical records', 'success')}>Save to Records</Button>
                            <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5 }} onClick={() => setToast('Share dialog opening…', 'info')}>Share</Button>
                            <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5 }} startIcon={<ContentCopyIcon sx={{ fontSize: 12 }} />} onClick={() => handleCopy(text, 'Extracted text')}>Copy Text</Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Card>
                );
              })()}
            </Box>
          )}

          {activeTab === 'other' && (
            <Stack spacing={1.2} sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {otherRecords.map((record) => {
                const meta = RECORD_TYPE_META[record.type];
                return (
                  <Box
                    key={record.id}
                    sx={{
                      mt: 1.2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      borderRadius: 2,
                      p: 1.4,
                      borderLeft: `4px solid ${meta.color}`,
                      bgcolor: alpha(theme.palette.background.default, 0.35),
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1.1} sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.4,
                            bgcolor: alpha(meta.color, 0.12),
                            color: meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {record.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={record.type}
                              sx={{
                                height: 18,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: alpha(meta.color, 0.1),
                                color: meta.color,
                              }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {record.doctor} - {record.date}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.4, fontSize: 13 }}
                          >
                            {record.summary}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.75}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                          onClick={() => setSelectedOtherRecord(record)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleDownload(record.title)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

              {otherRecords.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <FolderSharedIcon sx={{ fontSize: 38, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No records found for this search.
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Card>
      </Stack>

      <Dialog
        open={addRecordOpen}
        onClose={() => setAddRecordOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>Add Medical Record</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.75 }}>
            <TextField
              select
              size="small"
              label="Record Type"
              value={addRecordDraft.type}
              onChange={(event) =>
                setAddRecordDraft((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              {['Lab Report', 'Requisition', 'Vital Reading', 'BMI', 'Other Record'].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              size="small"
              label="Record Title"
              placeholder="e.g. Complete Blood Count"
              value={addRecordDraft.title}
              onChange={(event) =>
                setAddRecordDraft((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1,
              }}
            >
              <TextField
                size="small"
                label="Date"
                type="date"
                value={addRecordDraft.date}
                onChange={(event) =>
                  setAddRecordDraft((prev) => ({ ...prev, date: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                label="Source / Lab / Hospital"
                placeholder="e.g. Synlab Diagnostics"
                value={addRecordDraft.source}
                onChange={(event) =>
                  setAddRecordDraft((prev) => ({ ...prev, source: event.target.value }))
                }
              />
            </Box>
            <TextField
              size="small"
              label="Ordered / Issued By"
              placeholder="Doctor name"
              value={addRecordDraft.issuedBy}
              onChange={(event) =>
                setAddRecordDraft((prev) => ({ ...prev, issuedBy: event.target.value }))
              }
            />
            <TextField
              size="small"
              label="Notes"
              placeholder="Clinical notes..."
              multiline
              minRows={3}
              value={addRecordDraft.notes}
              onChange={(event) =>
                setAddRecordDraft((prev) => ({ ...prev, notes: event.target.value }))
              }
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Attach File (optional)
              </Typography>
              <input
                ref={addRecordFileInputRef}
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) =>
                  setAddRecordFileName(event.target.files?.[0]?.name ?? '')
                }
              />
              <Box
                role="button"
                tabIndex={0}
                onClick={() => addRecordFileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    addRecordFileInputRef.current?.click();
                  }
                }}
                sx={{
                  mt: 0.75,
                  borderRadius: 1.6,
                  border: '1.5px dashed',
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  p: 1.4,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {addRecordFileName || 'Click to attach file'}
                </Typography>
                {!addRecordFileName ? (
                  <Typography variant="caption" color="text.secondary">
                    PDF, JPG, PNG
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setAddRecordOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveRecord}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Save Record
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedRequisition}
        onClose={() => setSelectedRequisition(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          {selectedRequisition?.requisitionNo}
        </DialogTitle>
        <DialogContent>
          {selectedRequisition && (
            <Stack spacing={1.2} sx={{ pt: 0.5 }}>
              <Box
                sx={{
                  p: 1.4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Ordered by {selectedRequisition.orderedBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedRequisition.date} {selectedRequisition.time} -{' '}
                  {selectedRequisition.lab ?? 'Lab not assigned'}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                ORDERED TESTS
              </Typography>
              <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
                {selectedRequisition.tests.map((test) => (
                  <Chip
                    key={test}
                    size="small"
                    label={test}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Stack>
              {selectedRequisition.notes && (
                <Alert severity="info" icon={false} sx={{ borderRadius: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {selectedRequisition.notes}
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectedRequisition(null)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              if (!selectedRequisition) return;
              handleDownload(selectedRequisition.requisitionNo);
              setSelectedRequisition(null);
            }}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedOtherRecord}
        onClose={() => setSelectedOtherRecord(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          {selectedOtherRecord?.title}
        </DialogTitle>
        <DialogContent>
          {selectedOtherRecord && (
            <Stack spacing={1.2} sx={{ pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {selectedOtherRecord.type} - {selectedOtherRecord.date} {selectedOtherRecord.time}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedOtherRecord.doctor}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {selectedOtherRecord.summary}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectedOtherRecord(null)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              if (!selectedOtherRecord) return;
              handleDownload(selectedOtherRecord.title);
              setSelectedOtherRecord(null);
            }}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ fontWeight: 600 }}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
