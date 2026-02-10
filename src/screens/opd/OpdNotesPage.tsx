'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Chip, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useOpdData } from '@/src/store/opdHooks';
import { useAppDispatch } from '@/src/store/hooks';
import { addNote } from '@/src/store/slices/opdSlice';

interface NotesDraft {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  examination: string;
  assessment: string;
  plan: string;
}

function buildDefaultDraft(): NotesDraft {
  return {
    chiefComplaint: '',
    historyOfPresentIllness: '',
    examination: '',
    assessment: '',
    plan: '',
  };
}

export default function OpdNotesPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const { encounters, noteTemplates, notes, status: opdStatus, error: opdError } = useOpdData();
  const [selectedPatientId, setSelectedPatientId] = React.useState(encounters[0]?.id ?? '');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState(noteTemplates[0]?.id ?? '');
  const [draft, setDraft] = React.useState<NotesDraft>(() => {
    const firstPatient = encounters[0];
    if (!firstPatient) return buildDefaultDraft();
    return {
      chiefComplaint: firstPatient.chiefComplaint,
      historyOfPresentIllness: firstPatient.triageNote,
      examination: `Vitals reviewed: BP ${firstPatient.vitals.bp}, HR ${firstPatient.vitals.hr}.`,
      assessment: '',
      plan: '',
    };
  });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mrnApplied, setMrnApplied] = React.useState(false);

  React.useEffect(() => {
    if (!selectedPatientId && encounters.length > 0) {
      setSelectedPatientId(encounters[0].id);
    }
  }, [encounters, selectedPatientId]);

  React.useEffect(() => {
    if (!selectedTemplateId && noteTemplates.length > 0) {
      setSelectedTemplateId(noteTemplates[0].id);
    }
  }, [noteTemplates, selectedTemplateId]);

  const selectedPatient = React.useMemo(
    () => encounters.find((item) => item.id === selectedPatientId),
    [encounters, selectedPatientId]
  );

  const flowMrn = selectedPatient?.mrn ?? mrnParam;
  const seededPatient = getPatientByMrn(flowMrn);
  const flowName = selectedPatient?.patientName || seededPatient?.name;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  const patientHistory = React.useMemo(
    () => notes.filter((note) => note.patientId === selectedPatientId),
    [notes, selectedPatientId]
  );

  React.useEffect(() => {
    if (!selectedPatient) return;

    setDraft((prev) => ({
      ...prev,
      chiefComplaint: selectedPatient.chiefComplaint,
      historyOfPresentIllness: prev.historyOfPresentIllness || selectedPatient.triageNote,
      examination:
        prev.examination ||
        `Vitals reviewed: BP ${selectedPatient.vitals.bp}, HR ${selectedPatient.vitals.hr}, Temp ${selectedPatient.vitals.temp}.`,
    }));
  }, [selectedPatient?.id]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = encounters.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedPatientId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, encounters]);

  const updateField = <K extends keyof NotesDraft>(field: K, value: NotesDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyTemplate = () => {
    const template = noteTemplates.find((item) => item.id === selectedTemplateId);
    if (!template) return;

    const sections = template.content.split('\n');
    setDraft((prev) => ({
      ...prev,
      historyOfPresentIllness: sections[0]?.replace('Subjective: ', '') ?? prev.historyOfPresentIllness,
      examination: sections[1]?.replace('Objective: ', '') ?? prev.examination,
      assessment: sections[2]?.replace('Assessment: ', '') ?? prev.assessment,
      plan: sections[3]?.replace('Plan: ', '') ?? prev.plan,
    }));

    setSnackbar({
      open: true,
      message: 'Template applied to notes draft.',
      severity: 'info',
    });
  };

  const handleSaveNote = () => {
    if (!selectedPatient) return;
    if (!draft.assessment.trim() || !draft.plan.trim()) {
      setSnackbar({
        open: true,
        message: 'Assessment and plan are required before saving note.',
        severity: 'error',
      });
      return;
    }

    const content = [
      `Chief Complaint: ${draft.chiefComplaint}`,
      `HPI: ${draft.historyOfPresentIllness}`,
      `Examination: ${draft.examination}`,
      `Assessment: ${draft.assessment}`,
      `Plan: ${draft.plan}`,
    ].join('\n');

    dispatch(
      addNote({
        id: `note-${Date.now()}`,
        patientId: selectedPatient.id,
        title: `${selectedPatient.patientName} - OPD Progress Note`,
        content,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Dr. Duty Doctor',
      })
    );
    setSnackbar({
      open: true,
      message: `Clinical note saved for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
    router.push(withMrn(OPD_HOME_ROUTE));
  };

  return (
    <PageTemplate title="Clinical Notes" subtitle={pageSubtitle} currentPageTitle="Notes">
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
          activeStep="notes"
          title="Clinical Notes Composer"
          description="Write structured OPD notes using templates and maintain patient-wise documentation history."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Open Orders', route: '/clinical/orders' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.3}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Note Draft</Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      select
                      label="Patient"
                      value={selectedPatientId}
                      onChange={(event) => setSelectedPatientId(event.target.value)}
                      sx={{ minWidth: 220 }}
                    >
                      {encounters.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.patientName} ({patient.mrn})
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      select
                      label="Template"
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                      sx={{ minWidth: 220 }}
                    >
                      {noteTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={handleApplyTemplate}>
                      Apply
                    </Button>
                  </Stack>
                </Stack>

                <TextField
                  fullWidth
                  label="Chief Complaint"
                  value={draft.chiefComplaint}
                  onChange={(event) => updateField('chiefComplaint', event.target.value)}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="History of Present Illness"
                  value={draft.historyOfPresentIllness}
                  onChange={(event) => updateField('historyOfPresentIllness', event.target.value)}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Examination"
                  value={draft.examination}
                  onChange={(event) => updateField('examination', event.target.value)}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Assessment"
                  value={draft.assessment}
                  onChange={(event) => updateField('assessment', event.target.value)}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Plan"
                  value={draft.plan}
                  onChange={(event) => updateField('plan', event.target.value)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveNote}>
                    Save Note
                  </Button>
                  <Button variant="outlined" onClick={() => router.push(withMrn('/clinical/orders'))}>
                    Continue to Orders
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Patient Snapshot</Typography>
                  {selectedPatient ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPatient.patientName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.mrn} · {selectedPatient.ageGender}
                      </Typography>
                      <Chip size="small" label={selectedPatient.department} variant="outlined" />
                      <Chip size="small" label={selectedPatient.doctor} />
                    </>
                  ) : null}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HistoryIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Notes</Typography>
                  </Stack>

                  {patientHistory.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No previous notes saved.</Typography>
                  ) : (
                    patientHistory.slice(0, 5).map((note) => (
                      <Card key={note.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{note.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {note.savedAt} · {note.author}
                          </Typography>
                          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                            {note.content.slice(0, 130)}...
                          </Typography>
                        </Stack>
                      </Card>
                    ))
                  )}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DescriptionIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>All Notes</Typography>
                  </Stack>
                  {patientHistory.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No notes captured yet.</Typography>
                  ) : (
                    patientHistory.map((note) => (
                      <Card key={note.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{note.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {note.savedAt} · {note.author}
                          </Typography>
                          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                            {note.content}
                          </Typography>
                        </Stack>
                      </Card>
                    ))
                  )}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => router.push(withMrn('/appointments/visit'))}
                  >
                    Encounter Workspace
                  </Button>
                  <Button variant="text" onClick={() => router.push(withMrn('/clinical/prescriptions'))}>
                    Prescriptions
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
const OPD_HOME_ROUTE = '/reports/doctor-volume';
