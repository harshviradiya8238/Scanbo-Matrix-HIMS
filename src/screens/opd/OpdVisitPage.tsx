'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Avatar, Box, Button, Chip, Divider, InputAdornment, List, ListItemButton, ListItemText, Snackbar, Stack, Tab, Tabs, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  PlaylistAdd as PlaylistAddIcon,
  Search as SearchIcon,
  StickyNote2 as StickyNote2Icon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import { OpdEncounterCase } from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useAppDispatch } from '@/src/store/hooks';
import { updateEncounter } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';

const OPD_HOME_ROUTE = '/reports/doctor-volume';

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const DEFAULT_SOAP: Record<string, SoapNote> = {
  'enc-1': {
    subjective: 'Patient reports fatigue, occasional dizziness, and irregular meal timings.',
    objective: 'BP high, HR mildly elevated. No acute distress on examination.',
    assessment: 'Type 2 diabetes with suboptimal glycemic control and uncontrolled blood pressure.',
    plan: 'Increase metformin dose, add antihypertensive adjustment, review HbA1c and renal profile.',
  },
  'enc-2': {
    subjective: 'Headache for three days with intermittent dizziness.',
    objective: 'Vitals stable. Neuro exam within normal limits.',
    assessment: 'Likely migraine episode, no red flag signs.',
    plan: 'Symptomatic treatment, hydration advice, and follow-up if persistent.',
  },
  'enc-3': {
    subjective: 'Shortness of breath on walking short distances.',
    objective: 'Elevated BP and HR with mild tachypnea. SpO2 borderline.',
    assessment: 'Known CAD with probable exertional symptom progression.',
    plan: 'Immediate ECG, optimize anti-anginal therapy, schedule cardiology review.',
  },
  'enc-4': {
    subjective: 'Follow-up for throat pain; improved compared to last visit.',
    objective: 'Mild pharyngeal congestion only.',
    assessment: 'Resolving pharyngitis.',
    plan: 'Continue supportive care and reassess after one week if symptoms recur.',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function SoapTabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) return null;
  return <Box sx={{ pt: 1.8 }}>{children}</Box>;
}

export default function OpdVisitPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const { encounters, notes, status: opdStatus, error: opdError } = useOpdData();
  const [search, setSearch] = React.useState('');
  const [selectedCaseId, setSelectedCaseId] = React.useState(encounters[0]?.id ?? '');
  const [soapTab, setSoapTab] = React.useState(0);
  const [soapNotes, setSoapNotes] = React.useState<Record<string, SoapNote>>(DEFAULT_SOAP);
  const [saveStamp, setSaveStamp] = React.useState('');
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredCases = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return encounters.filter((encounter) => {
      const isVisible = encounter.status !== 'Completed';
      if (!isVisible) return false;

      if (!query) return true;
      return [
        encounter.patientName,
        encounter.mrn,
        encounter.chiefComplaint,
        encounter.doctor,
        encounter.department,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [encounters, search]);

  React.useEffect(() => {
    if (filteredCases.length === 0) return;

    const exists = filteredCases.some((item) => item.id === selectedCaseId);
    if (!exists) {
      setSelectedCaseId(filteredCases[0].id);
    }
  }, [filteredCases, selectedCaseId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = encounters.find((encounter) => encounter.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
      setSearch(mrnParam);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, encounters]);

  const selectedCase = React.useMemo<OpdEncounterCase | undefined>(
    () => encounters.find((encounter) => encounter.id === selectedCaseId),
    [encounters, selectedCaseId]
  );

  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const seededPatient = getPatientByMrn(flowMrn);
  const flowName = selectedCase?.patientName || seededPatient?.name;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  const currentSoap =
    (selectedCase && soapNotes[selectedCase.id]) || {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    };

  const inConsultCount = encounters.filter((encounter) => encounter.status === 'In Consultation').length;
  const waitingCount = encounters.filter(
    (encounter) => encounter.status === 'Checked-In' || encounter.status === 'In Triage'
  ).length;
  const activeDoctors = new Set(encounters.map((encounter) => encounter.doctor)).size;
  const patientNotes = React.useMemo(
    () => (notes ?? []).filter((note) => note.patientId === selectedCaseId),
    [notes, selectedCaseId]
  );

  const updateSoapField = (field: keyof SoapNote, value: string) => {
    if (!selectedCase) return;

    setSoapNotes((prev) => ({
      ...prev,
      [selectedCase.id]: {
        ...(prev[selectedCase.id] || {
          subjective: '',
          objective: '',
          assessment: '',
          plan: '',
        }),
        [field]: value,
      },
    }));
  };

  const handleSaveNote = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSaveStamp(now);
    setSnackbar({
      open: true,
      message: 'Encounter note saved.',
      severity: 'success',
    });
  };

  const handleCompleteVisit = () => {
    if (!selectedCase) return;

    if (!currentSoap.assessment.trim() || !currentSoap.plan.trim()) {
      setSnackbar({
        open: true,
        message: 'Add assessment and plan before completing visit.',
        severity: 'error',
      });
      return;
    }

    dispatch(
      updateEncounter({
        id: selectedCase.id,
        changes: { status: 'Completed' },
      })
    );
    setSnackbar({
      open: true,
      message: `Visit completed for ${selectedCase.patientName}.`,
      severity: 'success',
    });
    router.push(withMrn(OPD_HOME_ROUTE));
  };

  return (
    <PageTemplate title="Visit / Encounter" subtitle={pageSubtitle} currentPageTitle="Visit">
      <Stack spacing={2}>
        {opdStatus === 'loading' ? (
          <Alert severity="info">Loading OPD data from the local JSON server.</Alert>
        ) : null}
        {opdStatus === 'error' ? (
          <Alert severity="warning">
            OPD JSON server not reachable. Showing fallback data.
            {opdError ? ` (${opdError})` : ''}
          </Alert>
        ) : null}
        <OpdFlowHeader
          activeStep="visit"
          title="OPD Encounter Workspace"
          description="Capture SOAP notes, review vitals, and route patient to orders, prescription, or follow-up."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Go to Orders', route: '/clinical/orders' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Consultation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {inConsultCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Waiting / Triage
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {waitingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Active Doctors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {activeDoctors}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3.2}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack spacing={1.3}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Patient Queue
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search patient, MRN, complaint..."
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
                  {filteredCases.map((encounter) => (
                    <ListItemButton
                      key={encounter.id}
                      selected={encounter.id === selectedCaseId}
                      onClick={() => setSelectedCaseId(encounter.id)}
                      sx={{
                        mb: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: encounter.id === selectedCaseId ? 'primary.main' : 'divider',
                        alignItems: 'flex-start',
                        opacity: encounter.status === 'Completed' ? 0.65 : 1,
                      }}
                    >
                      <Stack direction="row" spacing={1.1} sx={{ width: '100%' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                          {getInitials(encounter.patientName)}
                        </Avatar>
                        <Box sx={{ width: '100%' }}>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{encounter.patientName}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{encounter.mrn} · {encounter.appointmentTime}</Typography>}
                          />
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip size="small" variant="outlined" label={encounter.department} />
                            <Chip size="small" color={encounter.queuePriority === 'Urgent' ? 'error' : 'success'} label={encounter.queuePriority} />
                          </Stack>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5.8}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {!selectedCase ? (
                <Typography variant="body2" color="text.secondary">
                  Select a patient from queue.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Encounter Note
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCase.patientName} · {selectedCase.chiefComplaint}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" icon={<AssignmentIcon />} label={selectedCase.doctor} />
                      <Chip
                        size="small"
                        color={selectedCase.status === 'In Consultation' ? 'warning' : 'info'}
                        label={selectedCase.status}
                      />
                    </Stack>
                  </Stack>

                  <Tabs
                    value={soapTab}
                    onChange={(_, value: number) => setSoapTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      minHeight: 42,
                      '& .MuiTab-root': {
                        minHeight: 42,
                        textTransform: 'none',
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Tab icon={<StickyNote2Icon fontSize="small" />} iconPosition="start" label="Subjective" />
                    <Tab icon={<MonitorHeartIcon fontSize="small" />} iconPosition="start" label="Objective" />
                    <Tab icon={<EditNoteIcon fontSize="small" />} iconPosition="start" label="Assessment" />
                    <Tab icon={<CheckCircleIcon fontSize="small" />} iconPosition="start" label="Plan" />
                  </Tabs>

                  <SoapTabPanel value={soapTab} index={0}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Subjective"
                      value={currentSoap.subjective}
                      onChange={(event) => updateSoapField('subjective', event.target.value)}
                    />
                  </SoapTabPanel>
                  <SoapTabPanel value={soapTab} index={1}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Objective"
                      value={currentSoap.objective}
                      onChange={(event) => updateSoapField('objective', event.target.value)}
                    />
                  </SoapTabPanel>
                  <SoapTabPanel value={soapTab} index={2}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Assessment"
                      value={currentSoap.assessment}
                      onChange={(event) => updateSoapField('assessment', event.target.value)}
                    />
                  </SoapTabPanel>
                  <SoapTabPanel value={soapTab} index={3}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Plan"
                      value={currentSoap.plan}
                      onChange={(event) => updateSoapField('plan', event.target.value)}
                    />
                  </SoapTabPanel>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {saveStamp ? `Last saved at ${saveStamp}` : 'Unsaved note changes'}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={handleSaveNote}>
                        Save Note
                      </Button>
                      <Button variant="contained" color="success" onClick={handleCompleteVisit}>
                        Complete Visit
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {selectedCase ? (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Clinical Snapshot
                    </Typography>
                    <Typography variant="body2"><strong>Vitals:</strong> BP {selectedCase.vitals.bp}</Typography>
                    <Typography variant="body2"><strong>HR:</strong> {selectedCase.vitals.hr}</Typography>
                    <Typography variant="body2"><strong>Temp:</strong> {selectedCase.vitals.temp}</Typography>
                    <Typography variant="body2"><strong>SpO2:</strong> {selectedCase.vitals.spo2}</Typography>
                    <Divider />
                    <Typography variant="caption" color="text.secondary">Problems</Typography>
                    {selectedCase.problems.map((problem) => (
                      <Chip key={problem} size="small" variant="outlined" label={problem} />
                    ))}
                  </Stack>
                ) : null}
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Encounter Actions
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PlaylistAddIcon />}
                    onClick={() => router.push(withMrn('/clinical/orders'))}
                  >
                    Place Orders
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MedicationIcon />}
                    onClick={() => router.push(withMrn('/clinical/prescriptions'))}
                  >
                    Add Prescription
                  </Button>
                  <Button variant="text" onClick={() => router.push(withMrn('/clinical/notes'))}>
                    Open Notes Page
                  </Button>
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Notes for this Patient
                  </Typography>
                  {patientNotes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No notes yet. Capture one in the Notes screen.</Typography>
                  ) : (
                    patientNotes.slice(0, 4).map((note) => (
                      <Card key={note.id} variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{note.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.savedAt} · {note.author}
                        </Typography>
                        <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                          {note.content.slice(0, 120)}...
                        </Typography>
                      </Card>
                    ))
                  )}
                  <Button variant="outlined" size="small" onClick={() => router.push(withMrn('/clinical/notes'))}>
                    View All Notes
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3200}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </PageTemplate>
  );
}
