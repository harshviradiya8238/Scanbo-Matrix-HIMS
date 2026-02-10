'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Avatar, Box, Button, Chip, Divider, InputAdornment, List, ListItemButton, ListItemText, Stack, Tab, Tabs, TextField, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useTheme } from '@mui/material';
import { getSoftSurface, getSubtleSurface } from '@/src/core/theme/surfaces';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useUser } from '@/src/core/auth/UserContext';
import { usePermission } from '@/src/core/auth/usePermission';
import { canAccessRoute } from '@/src/core/navigation/route-access';
import {
  Bed as BedIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Hotel as HotelIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  PendingActions as PendingActionsIcon,
  PlaylistAdd as PlaylistAddIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type WardStatus = 'Stable' | 'Needs Review' | 'Critical';
type TaskStatus = 'Done' | 'Pending';

interface WardTask {
  id: string;
  label: string;
  status: TaskStatus;
}

interface MedicationPlan {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
}

interface RoundingEvent {
  id: string;
  time: string;
  title: string;
  details: string;
}

interface InpatientCase {
  id: string;
  name: string;
  mrn: string;
  bed: string;
  ward: string;
  consultant: string;
  diagnosis: string;
  admissionDate: string;
  status: WardStatus;
  ageGender: string;
  vitals: {
    bp: string;
    hr: string;
    spo2: string;
    temp: string;
  };
  tasks: WardTask[];
  medications: MedicationPlan[];
  timeline: RoundingEvent[];
}

interface ClinDocNote {
  admissionNote: string;
  dailyProgress: string;
  carePlan: string;
  dischargeSummary: string;
}

const INPATIENT_CASES: InpatientCase[] = [
  {
    id: 'ipd-1',
    name: 'Rahul Menon',
    mrn: 'MRN-245990',
    bed: 'B-12',
    ward: 'Medical Ward - 2',
    consultant: 'Dr. Nisha Rao',
    diagnosis: 'Community acquired pneumonia',
    admissionDate: '2026-02-01',
    status: 'Needs Review',
    ageGender: '58 / Male',
    vitals: { bp: '132/84', hr: '96 bpm', spo2: '93%', temp: '100.4 F' },
    tasks: [
      { id: 't1', label: 'Morning round note', status: 'Done' },
      { id: 't2', label: 'Antibiotic review', status: 'Pending' },
      { id: 't3', label: 'Chest X-ray follow-up', status: 'Pending' },
    ],
    medications: [
      { id: 'm1', drug: 'Piperacillin/Tazobactam', dosage: '4.5g IV', frequency: 'q8h' },
      { id: 'm2', drug: 'Paracetamol', dosage: '650mg', frequency: 'SOS' },
    ],
    timeline: [
      {
        id: 'r1',
        time: '07:40 AM',
        title: 'Nursing update',
        details: 'Mild fever overnight; oxygen 2L via nasal cannula.',
      },
      {
        id: 'r2',
        time: '08:05 AM',
        title: 'Physician round',
        details: 'Improved breath sounds but persistent cough.',
      },
      {
        id: 'r3',
        time: '09:10 AM',
        title: 'Lab reviewed',
        details: 'WBC trending down; continue current regimen.',
      },
    ],
  },
  {
    id: 'ipd-2',
    name: 'Sneha Patil',
    mrn: 'MRN-245991',
    bed: 'A-04',
    ward: 'Surgical Ward - 1',
    consultant: 'Dr. Sameer Kulkarni',
    diagnosis: 'Post-op cholecystectomy day 1',
    admissionDate: '2026-02-03',
    status: 'Stable',
    ageGender: '42 / Female',
    vitals: { bp: '118/76', hr: '82 bpm', spo2: '98%', temp: '98.6 F' },
    tasks: [
      { id: 't4', label: 'Pain assessment', status: 'Done' },
      { id: 't5', label: 'Drain output charting', status: 'Done' },
      { id: 't6', label: 'Discharge planning', status: 'Pending' },
    ],
    medications: [
      { id: 'm3', drug: 'Ceftriaxone', dosage: '1g IV', frequency: 'q12h' },
      { id: 'm4', drug: 'Pantoprazole', dosage: '40mg', frequency: 'OD' },
    ],
    timeline: [
      {
        id: 'r4',
        time: '08:15 AM',
        title: 'Nursing note',
        details: 'Pain score reduced to 3/10.',
      },
      {
        id: 'r5',
        time: '09:30 AM',
        title: 'Surgery review',
        details: 'Mobilization advised; remove drain tomorrow.',
      },
    ],
  },
  {
    id: 'ipd-3',
    name: 'Arvind Sharma',
    mrn: 'MRN-245994',
    bed: 'ICU-03',
    ward: 'ICU',
    consultant: 'Dr. K. Anand',
    diagnosis: 'Acute coronary syndrome',
    admissionDate: '2026-02-02',
    status: 'Critical',
    ageGender: '64 / Male',
    vitals: { bp: '168/102', hr: '112 bpm', spo2: '90%', temp: '99.1 F' },
    tasks: [
      { id: 't7', label: 'Cardiology review', status: 'Pending' },
      { id: 't8', label: 'Serial ECG', status: 'Pending' },
      { id: 't9', label: 'Troponin repeat', status: 'Pending' },
    ],
    medications: [
      { id: 'm5', drug: 'Heparin', dosage: 'IV infusion', frequency: 'continuous' },
      { id: 'm6', drug: 'Atorvastatin', dosage: '40mg', frequency: 'HS' },
    ],
    timeline: [
      {
        id: 'r6',
        time: '06:55 AM',
        title: 'ICU escalation',
        details: 'Transient chest discomfort; telemetry changes noted.',
      },
      {
        id: 'r7',
        time: '07:20 AM',
        title: 'Consultant informed',
        details: 'Urgent cardiology review requested.',
      },
    ],
  },
];

const DEFAULT_NOTES: Record<string, ClinDocNote> = {
  'ipd-1': {
    admissionNote:
      'Admitted with fever, productive cough, and breathlessness. CXR suggestive of right lower lobe consolidation.',
    dailyProgress:
      'Day 2: afebrile for 6 hours, cough improved. Continue IV antibiotics and monitor oxygen requirement.',
    carePlan:
      'Continue antibiotics, incentive spirometry, daily CBC, and physiotherapy review.',
    dischargeSummary:
      'To be completed after 24-hour afebrile period and oral antibiotic switch.',
  },
  'ipd-2': {
    admissionNote:
      'Post-laparoscopic cholecystectomy observation for pain control and recovery.',
    dailyProgress:
      'Day 1 post-op: hemodynamically stable, tolerating oral intake.',
    carePlan:
      'Early ambulation, continue prophylactic antibiotics, reassess drain output.',
    dischargeSummary:
      'Likely discharge tomorrow if pain controlled and no surgical concerns.',
  },
  'ipd-3': {
    admissionNote:
      'Admitted to ICU for chest pain with ST changes; high-risk ACS protocol initiated.',
    dailyProgress:
      'Persistent hypertension with intermittent discomfort. Serial ECG and biomarkers ongoing.',
    carePlan:
      'Cardiology-led management, anticoagulation, strict telemetry, and fluid balance.',
    dischargeSummary:
      'Not ready; remain in ICU pending stabilization and intervention decision.',
  },
};

const wardStatusColor: Record<WardStatus, 'success' | 'warning' | 'error'> = {
  Stable: 'success',
  'Needs Review': 'warning',
  Critical: 'error',
};

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function ClinDocTabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function InpatientClinDocPage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const subtleSurface = getSubtleSurface(theme);
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const can = usePermission();
  const [selectedCaseId, setSelectedCaseId] = React.useState(INPATIENT_CASES[0].id);
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState(0);
  const [notes, setNotes] = React.useState<Record<string, ClinDocNote>>(DEFAULT_NOTES);
  const [saveStamp, setSaveStamp] = React.useState('');
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedCase = React.useMemo(
    () => INPATIENT_CASES.find((patientCase) => patientCase.id === selectedCaseId) ?? INPATIENT_CASES[0],
    [selectedCaseId]
  );

  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );
  const pageSubtitle = formatPatientLabel(selectedCase?.name, flowMrn);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = INPATIENT_CASES.find((patientCase) => patientCase.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
      setSearch(mrnParam);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const filteredCases = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return INPATIENT_CASES;
    return INPATIENT_CASES.filter((patientCase) =>
      [patientCase.name, patientCase.mrn, patientCase.bed, patientCase.ward, patientCase.diagnosis]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const currentNote = notes[selectedCase.id] ?? {
    admissionNote: '',
    dailyProgress: '',
    carePlan: '',
    dischargeSummary: '',
  };

  const updateNote = (field: keyof ClinDocNote, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [selectedCase.id]: {
        ...(prev[selectedCase.id] ?? {
          admissionNote: '',
          dailyProgress: '',
          carePlan: '',
          dischargeSummary: '',
        }),
        [field]: value,
      },
    }));
  };

  const saveCurrentNote = () => {
    const now = new Date();
    setSaveStamp(now.toLocaleTimeString());
  };

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions]
  );
  const canWriteNotes = can('clinical.clindoc.write');
  const canWriteOrders = can('clinical.orders.write');

  const stableCount = INPATIENT_CASES.filter((patientCase) => patientCase.status === 'Stable').length;
  const reviewCount = INPATIENT_CASES.filter((patientCase) => patientCase.status === 'Needs Review').length;
  const criticalCount = INPATIENT_CASES.filter((patientCase) => patientCase.status === 'Critical').length;

  return (
    <PageTemplate title="Inpatient Documentation (ClinDoc)" subtitle={pageSubtitle} currentPageTitle="IPD Rounds">
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: softSurface,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label="IPD Module" color="primary" />
                  <Chip size="small" label="ClinDoc Workflow" color="info" variant="outlined" />
                  <Chip size="small" label="Doctor + Nurse" color="success" variant="outlined" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Admission Notes, Daily Rounds, Care Plans, Discharge Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete inpatient documentation workflow with ward census, progress notes, and
                  care coordination.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<LocalHospitalIcon />}
                  disabled={!canNavigate('/ipd/admissions')}
                  onClick={() => router.push(withMrn('/ipd/admissions'))}
                >
                  Open Admissions
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HotelIcon />}
                  disabled={!canNavigate('/ipd/beds')}
                  onClick={() => router.push(withMrn('/ipd/beds'))}
                >
                  Open Bed Board
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  disabled={!canNavigate('/ipd/discharge')}
                  onClick={() => router.push(withMrn('/ipd/discharge'))}
                >
                  Open Discharge
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatTile
              label="Stable Patients"
              value={stableCount}
              tone="success"
              icon={<HealthAndSafetyIcon sx={{ fontSize: 34 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile
              label="Needs Review"
              value={reviewCount}
              tone="warning"
              icon={<PendingActionsIcon sx={{ fontSize: 34 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile
              label="Critical Patients"
              value={criticalCount}
              tone="error"
              icon={<WarningAmberIcon sx={{ fontSize: 34 }} />}
            />
          </Grid>
        </Grid>

        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              IPD Flow Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Move between admissions, bed board, rounds, and discharge with the current MRN context.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/admissions')}
                onClick={() => router.push(withMrn('/ipd/admissions'))}
              >
                Admissions
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/beds')}
                onClick={() => router.push(withMrn('/ipd/beds'))}
              >
                Bed Board
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!canNavigate('/ipd/rounds')}
                onClick={() => router.push(withMrn('/ipd/rounds'))}
              >
                Rounds
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/ipd/discharge')}
                onClick={() => router.push(withMrn('/ipd/discharge'))}
              >
                Discharge
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/clinical/orders')}
                onClick={() => router.push(withMrn('/clinical/orders'))}
              >
                Orders
              </Button>
            </Box>
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Related Modules
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/patients/profile')}
                onClick={() => router.push(withMrn('/patients/profile'))}
              >
                Patient Profile
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/clinical/modules/bugsy-infection-control')}
                onClick={() => router.push('/clinical/modules/bugsy-infection-control')}
              >
                Infection Control
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canNavigate('/clinical/modules/care-companion')}
                onClick={() => router.push('/clinical/modules/care-companion')}
              >
                Care Companion
              </Button>
            </Box>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3}>
            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Ward Census
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search ward, bed, MRN..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <List sx={{ p: 0 }}>
                  {filteredCases.map((patientCase) => (
                    <ListItemButton
                      key={patientCase.id}
                      selected={patientCase.id === selectedCase.id}
                      onClick={() => setSelectedCaseId(patientCase.id)}
                      sx={{
                        mb: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: patientCase.id === selectedCase.id ? 'primary.main' : 'divider',
                        alignItems: 'flex-start',
                        '&.Mui-selected': { backgroundColor: 'primary.light' },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                          {initialsFromName(patientCase.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, width: '100%' }}>
                          <ListItemText
                            primary={
                              <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                                {patientCase.name}
                              </Typography>
                            }
                            secondary={
                              <Typography noWrap variant="caption" color="text.secondary">
                                {patientCase.mrn} · {patientCase.bed}
                              </Typography>
                            }
                          />
                          <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap">
                            <Chip size="small" icon={<BedIcon />} label={patientCase.ward} variant="outlined" />
                            <Chip size="small" color={wardStatusColor[patientCase.status]} label={patientCase.status} />
                          </Stack>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      ClinDoc Workspace
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCase.name} · {selectedCase.diagnosis}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PlaylistAddIcon />}
                      disabled={!canWriteOrders}
                      onClick={() => router.push(withMrn('/clinical/orders'))}
                    >
                      Add Order
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditNoteIcon />}
                      disabled={!canWriteNotes}
                      onClick={saveCurrentNote}
                    >
                      Save Note
                    </Button>
                  </Stack>
                </Stack>

                <Tabs
                  value={tab}
                  onChange={(_, value: number) => setTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    minHeight: 44,
                    '& .MuiTab-root': {
                      minHeight: 44,
                      textTransform: 'none',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Tab icon={<EditNoteIcon fontSize="small" />} iconPosition="start" label="Admission Note" />
                  <Tab icon={<MonitorHeartIcon fontSize="small" />} iconPosition="start" label="Daily Progress" />
                  <Tab icon={<MedicationIcon fontSize="small" />} iconPosition="start" label="Care Plan" />
                  <Tab icon={<CheckCircleIcon fontSize="small" />} iconPosition="start" label="Discharge Summary" />
                </Tabs>

                <ClinDocTabPanel value={tab} index={0}>
                  <TextField
                    label="Admission Note"
                    fullWidth
                    multiline
                    minRows={8}
                    value={currentNote.admissionNote}
                    onChange={(event) => updateNote('admissionNote', event.target.value)}
                  />
                </ClinDocTabPanel>

                <ClinDocTabPanel value={tab} index={1}>
                  <TextField
                  fullWidth
                    label="Daily Progress"
                    multiline
                    minRows={8}
                    value={currentNote.dailyProgress}
                    onChange={(event) => updateNote('dailyProgress', event.target.value)}
                  />
                </ClinDocTabPanel>

                <ClinDocTabPanel value={tab} index={2}>
                  <TextField
                  fullWidth
                    label="Care Plan"
                    multiline
                    minRows={8}
                    value={currentNote.carePlan}
                    onChange={(event) => updateNote('carePlan', event.target.value)}
                  />
                </ClinDocTabPanel>

                <ClinDocTabPanel value={tab} index={3}>
                  <TextField
                    label="Discharge Summary"
                    multiline
                    minRows={8}
                    fullWidth
                    value={currentNote.dischargeSummary}
                    onChange={(event) => updateNote('dischargeSummary', event.target.value)}
                  />
                </ClinDocTabPanel>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {saveStamp ? `Last saved at ${saveStamp}` : 'Unsaved changes'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CalendarMonthIcon />}
                    disabled={!canNavigate('/ipd/discharge')}
                    onClick={() => router.push(withMrn('/ipd/discharge'))}
                  >
                    Go to Discharge UI
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: subtleSurface,
                }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Patient Snapshot
                  </Typography>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{initialsFromName(selectedCase.name)}</Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedCase.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCase.ageGender} · {selectedCase.mrn}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Typography variant="body2">
                    <strong>Consultant:</strong> {selectedCase.consultant}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ward/Bed:</strong> {selectedCase.ward} / {selectedCase.bed}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Admission:</strong> {selectedCase.admissionDate}
                  </Typography>
                  <Chip size="small" color={wardStatusColor[selectedCase.status]} label={selectedCase.status} sx={{ width: 'fit-content' }} />
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Vitals
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip size="small" icon={<MonitorHeartIcon />} label={`BP ${selectedCase.vitals.bp}`} variant="outlined" />
                    <Chip size="small" icon={<MonitorHeartIcon />} label={`HR ${selectedCase.vitals.hr}`} variant="outlined" />
                    <Chip size="small" icon={<HealthAndSafetyIcon />} label={`SpO2 ${selectedCase.vitals.spo2}`} variant="outlined" />
                    <Chip size="small" icon={<ScienceIcon />} label={`Temp ${selectedCase.vitals.temp}`} variant="outlined" />
                  </Stack>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Medication Plan
                  </Typography>
                  {selectedCase.medications.map((medication) => (
                    <Box key={medication.id}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {medication.drug}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {medication.dosage} · {medication.frequency}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Round Checklist
                  </Typography>
                  {selectedCase.tasks.map((task) => (
                    <Stack key={task.id} direction="row" spacing={1} alignItems="center">
                      {task.status === 'Done' ? (
                        <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                      ) : (
                        <WarningAmberIcon color="warning" sx={{ fontSize: 18 }} />
                      )}
                      <Typography variant="body2">{task.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={1.2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Daily Timeline
            </Typography>
            {selectedCase.timeline.map((event) => (
              <Stack key={event.id} direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                  sx={{
                    mt: 0.65,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {event.title}
                    </Typography>
                    <Chip size="small" variant="outlined" label={event.time} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {event.details}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
