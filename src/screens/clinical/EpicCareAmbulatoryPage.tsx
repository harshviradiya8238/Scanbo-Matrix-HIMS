'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Button, Chip, Divider, InputAdornment, List, ListItemButton, ListItemText, Stack, Tab, Tabs, TextField, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useTheme } from '@mui/material';
import { getSoftSurface, getSubtleSurface } from '@/src/core/theme/surfaces';
import {
  Air as AirIcon,
  Biotech as BiotechIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
  Favorite as HeartRateIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
  PendingActions as PendingActionsIcon,
  Person as PersonIcon,
  PlaylistAdd as PlaylistAddIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  Thermostat as ThermostatIcon,
  Timer as TimerIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import PageTemplate from '@/src/ui/components/PageTemplate';

type QueueStatus = 'Waiting' | 'In Consultation' | 'Completed';
type Priority = 'Routine' | 'Urgent';
type OrderStatus = 'Pending' | 'In Progress' | 'Completed';
type ResultStatus = 'Normal' | 'Abnormal' | 'Critical';
type ProblemStatus = 'Active' | 'Monitoring' | 'Resolved';
type TimelineType = 'checkin' | 'note' | 'order' | 'result';

interface OrderItem {
  id: string;
  name: string;
  department: string;
  priority: Priority;
  status: OrderStatus;
  eta: string;
}

interface ResultItem {
  id: string;
  test: string;
  value: string;
  reference: string;
  status: ResultStatus;
  updatedAt: string;
}

interface ProblemItem {
  id: string;
  name: string;
  status: ProblemStatus;
  since: string;
}

interface TimelineItem {
  id: string;
  time: string;
  type: TimelineType;
  title: string;
  description: string;
}

interface Vitals {
  bp: string;
  hr: string;
  spo2: string;
  temp: string;
  rr: string;
}

interface QueuePatient {
  id: string;
  name: string;
  ageGender: string;
  mrn: string;
  status: QueueStatus;
  waitTime: string;
  visitType: string;
  chiefComplaint: string;
  allergies: string[];
  problems: ProblemItem[];
  orders: OrderItem[];
  results: ResultItem[];
  timeline: TimelineItem[];
  vitals: Vitals;
}

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const QUEUE_PATIENTS: QueuePatient[] = [
  {
    id: 'p-1001',
    name: 'Aarav Nair',
    ageGender: '34 / Male',
    mrn: 'MRN-245781',
    status: 'In Consultation',
    waitTime: '05 min',
    visitType: 'Follow-up',
    chiefComplaint: 'Uncontrolled blood sugar and fatigue',
    allergies: ['Penicillin'],
    problems: [
      { id: 'pb1', name: 'Type 2 Diabetes Mellitus', status: 'Active', since: '2021' },
      { id: 'pb2', name: 'Obesity', status: 'Monitoring', since: '2022' },
    ],
    orders: [
      {
        id: 'od1',
        name: 'HbA1c',
        department: 'Laboratory',
        priority: 'Routine',
        status: 'In Progress',
        eta: '15 min',
      },
      {
        id: 'od2',
        name: 'Fasting Lipid Profile',
        department: 'Laboratory',
        priority: 'Routine',
        status: 'Pending',
        eta: '30 min',
      },
    ],
    results: [
      {
        id: 'rs1',
        test: 'Random Blood Sugar',
        value: '238 mg/dL',
        reference: '70 - 140 mg/dL',
        status: 'Abnormal',
        updatedAt: '09:20 AM',
      },
      {
        id: 'rs2',
        test: 'Creatinine',
        value: '1.0 mg/dL',
        reference: '0.7 - 1.3 mg/dL',
        status: 'Normal',
        updatedAt: '09:05 AM',
      },
    ],
    timeline: [
      {
        id: 'tl1',
        time: '08:45 AM',
        type: 'checkin',
        title: 'Patient checked in',
        description: 'Front desk verified identity and insurance.',
      },
      {
        id: 'tl2',
        time: '08:52 AM',
        type: 'note',
        title: 'Triage recorded',
        description: 'Vitals captured by OPD nurse.',
      },
      {
        id: 'tl3',
        time: '09:02 AM',
        type: 'order',
        title: 'Lab orders created',
        description: 'HbA1c and fasting lipid profile requested.',
      },
      {
        id: 'tl4',
        time: '09:20 AM',
        type: 'result',
        title: 'First result posted',
        description: 'Random blood sugar result is high.',
      },
    ],
    vitals: {
      bp: '142/92',
      hr: '96 bpm',
      spo2: '98%',
      temp: '98.6 F',
      rr: '18/min',
    },
  },
  {
    id: 'p-1002',
    name: 'Meera Joshi',
    ageGender: '28 / Female',
    mrn: 'MRN-245799',
    status: 'Waiting',
    waitTime: '18 min',
    visitType: 'New Visit',
    chiefComplaint: 'Headache and dizziness',
    allergies: ['No known allergies'],
    problems: [
      { id: 'pb3', name: 'Migraine', status: 'Monitoring', since: '2023' },
    ],
    orders: [
      {
        id: 'od3',
        name: 'CBC',
        department: 'Laboratory',
        priority: 'Routine',
        status: 'Pending',
        eta: '25 min',
      },
    ],
    results: [],
    timeline: [
      {
        id: 'tl5',
        time: '09:03 AM',
        type: 'checkin',
        title: 'Patient checked in',
        description: 'New registration completed.',
      },
    ],
    vitals: {
      bp: '118/76',
      hr: '82 bpm',
      spo2: '99%',
      temp: '98.2 F',
      rr: '16/min',
    },
  },
  {
    id: 'p-1003',
    name: 'Ravi Iyer',
    ageGender: '52 / Male',
    mrn: 'MRN-245802',
    status: 'Waiting',
    waitTime: '12 min',
    visitType: 'Follow-up',
    chiefComplaint: 'Shortness of breath on exertion',
    allergies: ['Sulfa drugs'],
    problems: [
      { id: 'pb4', name: 'Hypertension', status: 'Active', since: '2018' },
      { id: 'pb5', name: 'Coronary artery disease', status: 'Active', since: '2020' },
    ],
    orders: [
      {
        id: 'od4',
        name: 'ECG',
        department: 'Cardiology',
        priority: 'Urgent',
        status: 'Pending',
        eta: '10 min',
      },
    ],
    results: [
      {
        id: 'rs3',
        test: 'Troponin I',
        value: 'Negative',
        reference: 'Negative',
        status: 'Normal',
        updatedAt: '08:58 AM',
      },
    ],
    timeline: [
      {
        id: 'tl6',
        time: '08:50 AM',
        type: 'checkin',
        title: 'Patient checked in',
        description: 'Escalated to fast-track due to symptom severity.',
      },
    ],
    vitals: {
      bp: '150/95',
      hr: '102 bpm',
      spo2: '95%',
      temp: '99.1 F',
      rr: '22/min',
    },
  },
  {
    id: 'p-1004',
    name: 'Fatima Khan',
    ageGender: '41 / Female',
    mrn: 'MRN-245811',
    status: 'Completed',
    waitTime: '0 min',
    visitType: 'Follow-up',
    chiefComplaint: 'Thyroid medication review',
    allergies: ['No known allergies'],
    problems: [{ id: 'pb6', name: 'Hypothyroidism', status: 'Monitoring', since: '2019' }],
    orders: [],
    results: [],
    timeline: [
      {
        id: 'tl7',
        time: '08:20 AM',
        type: 'checkin',
        title: 'Visit completed',
        description: 'Discharge advice and follow-up date provided.',
      },
    ],
    vitals: {
      bp: '122/80',
      hr: '78 bpm',
      spo2: '99%',
      temp: '98.3 F',
      rr: '15/min',
    },
  },
];

const DEFAULT_NOTES: Record<string, SoapNote> = {
  'p-1001': {
    subjective:
      'Patient reports fatigue, increased thirst, and irregular diet over the last 2 weeks.',
    objective:
      'Vitals stable except elevated BP. RBS elevated at 238 mg/dL. No acute distress.',
    assessment: 'Type 2 DM - likely poor glycemic control. Rule out medication non-adherence.',
    plan:
      'Adjust metformin dose, order HbA1c/lipid profile, reinforce diet counseling, follow-up in 2 weeks.',
  },
  'p-1002': {
    subjective: 'Complains of headache with occasional dizziness for 3 days.',
    objective: 'Neuro exam grossly normal, vitals within normal range.',
    assessment: 'Probable migraine episode.',
    plan: 'Start symptomatic treatment, hydrate, review CBC and reassess.',
  },
  'p-1003': {
    subjective: 'Breathlessness while climbing stairs, no active chest pain now.',
    objective: 'BP and HR elevated, mild tachypnea present.',
    assessment: 'Known CAD with exertional dyspnea; monitor for acute changes.',
    plan: 'ECG and review prior cardiology notes, optimize antihypertensives.',
  },
  'p-1004': {
    subjective: 'No fresh complaints; came for routine medication review.',
    objective: 'Stable vitals.',
    assessment: 'Hypothyroidism stable on current regimen.',
    plan: 'Continue current dose and repeat TSH in 8 weeks.',
  },
};

const queueStatusColor: Record<QueueStatus, 'warning' | 'info' | 'success'> = {
  Waiting: 'warning',
  'In Consultation': 'info',
  Completed: 'success',
};

const orderStatusColor: Record<OrderStatus, 'warning' | 'info' | 'success'> = {
  Pending: 'warning',
  'In Progress': 'info',
  Completed: 'success',
};

const resultStatusColor: Record<ResultStatus, 'success' | 'warning' | 'error'> = {
  Normal: 'success',
  Abnormal: 'warning',
  Critical: 'error',
};

const problemStatusColor: Record<ProblemStatus, 'error' | 'warning' | 'success'> = {
  Active: 'error',
  Monitoring: 'warning',
  Resolved: 'success',
};

function getPatientInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function getTimelineDotColor(type: TimelineType, palette: { primary: { main: string; dark: string }; secondary: { main: string }; info: { main: string } }): string {
  if (type === 'checkin') return palette.primary.main;
  if (type === 'note') return palette.secondary.main;
  if (type === 'order') return palette.info.main;
  return palette.primary.dark;
}

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) {
    return null;
  }

  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function EpicCareAmbulatoryPage() {
  const router = useRouter();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const subtleSurface = getSubtleSurface(theme);
  const [selectedPatientId, setSelectedPatientId] = React.useState(QUEUE_PATIENTS[0].id);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState(0);

  const timelineDotColor = React.useCallback(
    (type: TimelineType) => getTimelineDotColor(type, theme.palette),
    [theme]
  );
  const [soapNotes, setSoapNotes] = React.useState<Record<string, SoapNote>>(DEFAULT_NOTES);

  const selectedPatient = React.useMemo(
    () => QUEUE_PATIENTS.find((p) => p.id === selectedPatientId) ?? QUEUE_PATIENTS[0],
    [selectedPatientId]
  );

  const filteredQueue = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return QUEUE_PATIENTS;
    return QUEUE_PATIENTS.filter((p) =>
      [p.name, p.mrn, p.chiefComplaint, p.visitType].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search]);

  const waitingCount = React.useMemo(
    () => QUEUE_PATIENTS.filter((p) => p.status === 'Waiting').length,
    []
  );
  const inConsultationCount = React.useMemo(
    () => QUEUE_PATIENTS.filter((p) => p.status === 'In Consultation').length,
    []
  );
  const pendingOrdersCount = React.useMemo(
    () =>
      QUEUE_PATIENTS.flatMap((p) => p.orders).filter((o) => o.status !== 'Completed').length,
    []
  );
  const unreviewedResultsCount = React.useMemo(
    () =>
      QUEUE_PATIENTS.flatMap((p) => p.results).filter((r) => r.status !== 'Normal').length,
    []
  );

  const currentNotes = soapNotes[selectedPatient.id] ?? {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  };

  const updateNoteField = (field: keyof SoapNote, value: string) => {
    setSoapNotes((prev) => ({
      ...prev,
      [selectedPatient.id]: {
        ...(prev[selectedPatient.id] ?? {
          subjective: '',
          objective: '',
          assessment: '',
          plan: '',
        }),
        [field]: value,
      },
    }));
  };

  return (
    <PageTemplate
      title="Ambulatory Care (OPD)"
      currentPageTitle="Clinical Encounters"
    >
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
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip size="small" color="primary" label="Clinical Module" />
                  <Chip size="small" color="info" variant="outlined" label="OPD Workflow" />
                  <Chip size="small" color="success" variant="outlined" label="Ready for Use" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Doctor + Nurse Workspace for Outpatient Encounters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Document visits, write notes, place orders, review results, and track patient
                  problems in one screen.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<MedicalServicesIcon />}
                  onClick={() => router.push('/appointments/visit')}
                >
                  Start New Encounter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditNoteIcon />}
                  onClick={() => router.push('/clinical/notes')}
                >
                  Create Quick Note
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="Patients Waiting"
              value={String(waitingCount)}
              subtitle="Average wait: 14 min"
              tone="info"
              icon={<TimerIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="In Consultation"
              value={String(inConsultationCount)}
              subtitle="Doctor rooms active"
              tone="success"
              icon={<LocalHospitalIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="Orders Pending"
              value={String(pendingOrdersCount)}
              subtitle="Lab/radiology/procedures"
              tone="warning"
              icon={<PendingActionsIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="Results to Review"
              value={String(unreviewedResultsCount)}
              subtitle="Require clinical sign-off"
              tone="primary"
              icon={<BiotechIcon />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  OPD Queue
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search patient or MRN..."
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
                  {filteredQueue.map((patient) => (
                    <ListItemButton
                      key={patient.id}
                      selected={patient.id === selectedPatient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      sx={{
                        mb: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor:
                          patient.id === selectedPatient.id ? 'primary.main' : 'divider',
                        alignItems: 'flex-start',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'primary.main',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {getPatientInitials(patient.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, width: '100%' }}>
                          <ListItemText
                            primary={
                              <Typography noWrap variant="body2" sx={{ fontWeight: 600 }}>
                                {patient.name}
                              </Typography>
                            }
                            secondary={
                              <Typography noWrap variant="caption" color="text.secondary">
                                {patient.ageGender} · {patient.mrn}
                              </Typography>
                            }
                          />
                          <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap">
                            <Chip
                              size="small"
                              color={queueStatusColor[patient.status]}
                              label={patient.status}
                            />
                            <Chip
                              size="small"
                              icon={<TimerIcon sx={{ fontSize: 14 }} />}
                              label={patient.waitTime}
                              variant="outlined"
                            />
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
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
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
                      Encounter Workspace
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPatient.name} · {selectedPatient.visitType} ·{' '}
                      {selectedPatient.chiefComplaint}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PlaylistAddIcon />}
                      onClick={() => router.push('/clinical/orders')}
                    >
                      Add Order
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditNoteIcon />}
                      onClick={() => router.push('/clinical/notes')}
                    >
                      Sign Note
                    </Button>
                  </Stack>
                </Stack>

                <Tabs
                  value={activeTab}
                  onChange={(_, value: number) => setActiveTab(value)}
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
                  <Tab icon={<EditNoteIcon fontSize="small" />} iconPosition="start" label="SOAP Notes" />
                  <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Orders" />
                  <Tab icon={<BiotechIcon fontSize="small" />} iconPosition="start" label="Results" />
                  <Tab icon={<MonitorHeartIcon fontSize="small" />} iconPosition="start" label="Problems" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Stack spacing={1.25}>
                    <TextField
                      label="Subjective"
                      multiline
                      minRows={2.4}
                      value={currentNotes.subjective}
                      onChange={(event) => updateNoteField('subjective', event.target.value)}
                    />
                    <TextField
                      label="Objective"
                      multiline
                      minRows={2.4}
                      value={currentNotes.objective}
                      onChange={(event) => updateNoteField('objective', event.target.value)}
                    />
                    <TextField
                      label="Assessment"
                      multiline
                      minRows={2.2}
                      value={currentNotes.assessment}
                      onChange={(event) => updateNoteField('assessment', event.target.value)}
                    />
                    <TextField
                      label="Plan"
                      multiline
                      minRows={2.2}
                      value={currentNotes.plan}
                      onChange={(event) => updateNoteField('plan', event.target.value)}
                    />
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Stack spacing={1}>
                    {selectedPatient.orders.length === 0 ? (
                      <Card
                        variant="outlined"
                        sx={{ p: 2, textAlign: 'center', borderStyle: 'dashed' }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No active orders for this visit.
                        </Typography>
                      </Card>
                    ) : (
                      selectedPatient.orders.map((order) => (
                        <Card
                          key={order.id}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 1.5 }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {order.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.department} · ETA {order.eta}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75}>
                              <Chip
                                size="small"
                                label={order.priority}
                                color={order.priority === 'Urgent' ? 'error' : 'default'}
                                variant={order.priority === 'Urgent' ? 'filled' : 'outlined'}
                              />
                              <Chip
                                size="small"
                                label={order.status}
                                color={orderStatusColor[order.status]}
                              />
                            </Stack>
                          </Stack>
                        </Card>
                      ))
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Stack spacing={1}>
                    {selectedPatient.results.length === 0 ? (
                      <Card
                        variant="outlined"
                        sx={{ p: 2, textAlign: 'center', borderStyle: 'dashed' }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Results will appear here once available.
                        </Typography>
                      </Card>
                    ) : (
                      selectedPatient.results.map((result) => (
                        <Card
                          key={result.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderLeft: '4px solid',
                            borderLeftColor:
                              result.status === 'Normal'
                                ? 'success.main'
                                : result.status === 'Abnormal'
                                ? 'warning.main'
                                : 'error.main',
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {result.test}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Ref: {result.reference} · Updated {result.updatedAt}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {result.value}
                              </Typography>
                              <Chip size="small" label={result.status} color={resultStatusColor[result.status]} />
                            </Stack>
                          </Stack>
                        </Card>
                      ))
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <Stack spacing={1}>
                    {selectedPatient.problems.map((problem) => (
                      <Card
                        key={problem.id}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 1.5 }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {problem.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Since {problem.since}
                            </Typography>
                          </Box>
                          <Chip size="small" label={problem.status} color={problemStatusColor[problem.status]} />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>
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
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedPatient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.ageGender} · {selectedPatient.mrn}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack spacing={0.9}>
                    <Typography variant="caption" color="text.secondary">
                      Chief complaint
                    </Typography>
                    <Typography variant="body2">{selectedPatient.chiefComplaint}</Typography>
                  </Stack>
                  <Stack spacing={0.9}>
                    <Typography variant="caption" color="text.secondary">
                      Allergies
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      {selectedPatient.allergies.map((allergy) => (
                        <Chip
                          key={allergy}
                          size="small"
                          color={allergy === 'No known allergies' ? 'success' : 'error'}
                          icon={allergy === 'No known allergies' ? <CheckCircleIcon /> : <WarningAmberIcon />}
                          label={allergy}
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

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
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Latest Vitals
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <MonitorHeartIcon fontSize="small" color="error" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              BP
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {selectedPatient.vitals.bp}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <HeartRateIcon fontSize="small" color="error" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              HR
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {selectedPatient.vitals.hr}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <AirIcon fontSize="small" color="info" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              SpO2
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {selectedPatient.vitals.spo2}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <ThermostatIcon fontSize="small" color="warning" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Temp
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {selectedPatient.vitals.temp}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary">
                    Respiratory rate: {selectedPatient.vitals.rr}
                  </Typography>
                </Stack>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Care Checklist
                  </Typography>
                  <Stack spacing={0.8}>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Identity verified</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Vitals captured</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <WarningAmberIcon color="warning" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Medication reconciliation pending</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <CalendarIcon color="info" sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Follow-up date not booked</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
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
          <Stack spacing={1.2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Visit Timeline
            </Typography>
            <Stack spacing={1}>
              {selectedPatient.timeline.map((event) => (
                <Stack key={event.id} direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      mt: 0.6,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: timelineDotColor(event.type),
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {event.title}
                      </Typography>
                      <Chip size="small" variant="outlined" label={event.time} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
