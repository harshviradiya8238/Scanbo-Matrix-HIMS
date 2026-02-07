'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Checkbox, Chip, Divider, FormControlLabel, InputAdornment, List, ListItemButton, ListItemText, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  Checklist as ChecklistIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ReceiptLong as ReceiptLongIcon,
  Search as SearchIcon,
  TaskAlt as TaskAltIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import IpdFlowHeader from './components/IpdFlowHeader';
import {
  DISCHARGE_CANDIDATES,
  DISCHARGE_CHECKLIST,
  INPATIENT_STAYS,
} from './ipd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';

interface DischargeDraft {
  finalDiagnosis: string;
  hospitalCourse: string;
  procedures: string;
  conditionAtDischarge: string;
  dischargeMedications: string;
  warningSigns: string;
  followUpDate: string;
  followUpDepartment: string;
  followUpDoctor: string;
  patientInstructions: string;
  billingReference: string;
  insuranceApproval: string;
}

type DraftErrors = Partial<Record<keyof DischargeDraft, string>>;
type ChecklistState = Record<string, boolean>;

interface CompletedDischargeEntry {
  id: string;
  patientName: string;
  mrn: string;
  completedAt: string;
  preparedBy: string;
}

function buildInitialDraft(patientId: string): DischargeDraft {
  const patient = INPATIENT_STAYS.find((item) => item.id === patientId);
  return {
    finalDiagnosis: patient?.diagnosis ?? '',
    hospitalCourse: '',
    procedures: '',
    conditionAtDischarge: 'Hemodynamically stable',
    dischargeMedications: '',
    warningSigns: '',
    followUpDate: '',
    followUpDepartment: patient?.consultant.includes('Surgery') ? 'Surgery OPD' : 'Medicine OPD',
    followUpDoctor: patient?.consultant ?? '',
    patientInstructions: '',
    billingReference: '',
    insuranceApproval: '',
  };
}

function buildInitialChecklistState(patientId: string): ChecklistState {
  const candidate = DISCHARGE_CANDIDATES.find((item) => item.patientId === patientId);

  const baseState = DISCHARGE_CHECKLIST.reduce<ChecklistState>((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});

  if (!candidate) {
    return baseState;
  }

  if (candidate.billingStatus === 'Cleared') {
    baseState['bill-clearance'] = true;
  }

  if (candidate.pharmacyStatus === 'Ready') {
    baseState.pharmacy = true;
  }

  if (candidate.transportStatus === 'Arranged') {
    baseState.transport = true;
  }

  return baseState;
}

function isRequiredChecklistComplete(checklistState: ChecklistState): boolean {
  return DISCHARGE_CHECKLIST.filter((item) => item.required).every(
    (item) => checklistState[item.id]
  );
}

export default function IpdDischargePage() {
  const mrnParam = useMrnParam();
  const initialPatientId = DISCHARGE_CANDIDATES[0]?.patientId ?? '';
  const [selectedPatientId, setSelectedPatientId] = React.useState(initialPatientId);
  const [search, setSearch] = React.useState('');
  const [saveStamp, setSaveStamp] = React.useState('');
  const [completedPatientIds, setCompletedPatientIds] = React.useState<string[]>([]);
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const [drafts, setDrafts] = React.useState<Record<string, DischargeDraft>>(() =>
    DISCHARGE_CANDIDATES.reduce<Record<string, DischargeDraft>>((acc, candidate) => {
      acc[candidate.patientId] = buildInitialDraft(candidate.patientId);
      return acc;
    }, {})
  );

  const [checklists, setChecklists] = React.useState<Record<string, ChecklistState>>(() =>
    DISCHARGE_CANDIDATES.reduce<Record<string, ChecklistState>>((acc, candidate) => {
      acc[candidate.patientId] = buildInitialChecklistState(candidate.patientId);
      return acc;
    }, {})
  );

  const [errors, setErrors] = React.useState<DraftErrors>({});
  const [completedEntries, setCompletedEntries] = React.useState<CompletedDischargeEntry[]>([]);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const activeCandidates = React.useMemo(
    () => DISCHARGE_CANDIDATES.filter((candidate) => !completedPatientIds.includes(candidate.patientId)),
    [completedPatientIds]
  );

  React.useEffect(() => {
    if (activeCandidates.length === 0) {
      return;
    }

    const stillExists = activeCandidates.some((candidate) => candidate.patientId === selectedPatientId);
    if (!stillExists) {
      setSelectedPatientId(activeCandidates[0].patientId);
    }
  }, [activeCandidates, selectedPatientId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = INPATIENT_STAYS.find((patient) => patient.mrn === mrnParam);
    if (match) {
      setSelectedPatientId(match.id);
      setSearch(mrnParam);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied]);

  const selectedCandidate = React.useMemo(
    () => activeCandidates.find((candidate) => candidate.patientId === selectedPatientId),
    [activeCandidates, selectedPatientId]
  );

  const selectedPatient = React.useMemo(
    () => INPATIENT_STAYS.find((patient) => patient.id === selectedPatientId),
    [selectedPatientId]
  );

  const seededPatient = getPatientByMrn(selectedPatient?.mrn ?? mrnParam);
  const displayName = selectedPatient?.patientName || seededPatient?.name;
  const displayMrn = selectedPatient?.mrn || seededPatient?.mrn || mrnParam;
  const pageSubtitle = formatPatientLabel(displayName, displayMrn);

  const filteredCandidates = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return activeCandidates.filter((candidate) => {
      const patient = INPATIENT_STAYS.find((item) => item.id === candidate.patientId);
      if (!patient) return false;

      if (!query) return true;

      return [
        patient.patientName,
        patient.mrn,
        patient.diagnosis,
        patient.ward,
        patient.consultant,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [activeCandidates, search]);

  const currentDraft = drafts[selectedPatientId] ?? buildInitialDraft(selectedPatientId);
  const currentChecklist =
    checklists[selectedPatientId] ?? buildInitialChecklistState(selectedPatientId);

  const requiredComplete = isRequiredChecklistComplete(currentChecklist);

  const readyCount = activeCandidates.filter((candidate) =>
    isRequiredChecklistComplete(checklists[candidate.patientId] ?? buildInitialChecklistState(candidate.patientId))
  ).length;

  const pendingCount = activeCandidates.length - readyCount;

  const updateDraftField = <K extends keyof DischargeDraft>(
    field: K,
    value: DischargeDraft[K]
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [selectedPatientId]: {
        ...(prev[selectedPatientId] ?? buildInitialDraft(selectedPatientId)),
        [field]: value,
      },
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateChecklistItem = (checklistId: string, checked: boolean) => {
    setChecklists((prev) => ({
      ...prev,
      [selectedPatientId]: {
        ...(prev[selectedPatientId] ?? buildInitialChecklistState(selectedPatientId)),
        [checklistId]: checked,
      },
    }));
  };

  const handleSaveDraft = () => {
    const now = new Date();
    setSaveStamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSnackbar({
      open: true,
      message: 'Discharge draft saved locally.',
      severity: 'info',
    });
  };

  const validateCompletion = (): boolean => {
    const nextErrors: DraftErrors = {};

    const requiredFields: Array<[keyof DischargeDraft, string]> = [
      ['finalDiagnosis', 'Final diagnosis'],
      ['conditionAtDischarge', 'Condition at discharge'],
      ['dischargeMedications', 'Discharge medications'],
      ['followUpDate', 'Follow-up date'],
      ['followUpDoctor', 'Follow-up doctor'],
      ['patientInstructions', 'Patient instructions'],
    ];

    requiredFields.forEach(([field, label]) => {
      if (!currentDraft[field].trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (!requiredComplete) {
      setSnackbar({
        open: true,
        message: 'Complete all required checklist items before discharge.',
        severity: 'error',
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && requiredComplete;
  };

  const handleCompleteDischarge = () => {
    if (!selectedPatient || !selectedCandidate) {
      return;
    }

    const valid = validateCompletion();
    if (!valid) {
      return;
    }

    const completedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setCompletedPatientIds((prev) => [...prev, selectedPatient.id]);
    setCompletedEntries((prev) => [
      {
        id: `discharge-${Date.now()}`,
        patientName: selectedPatient.patientName,
        mrn: selectedPatient.mrn,
        completedAt,
        preparedBy: 'Ward Nurse 1',
      },
      ...prev,
    ]);

    setSaveStamp(completedAt);

    setSnackbar({
      open: true,
      message: `Discharge completed for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="IPD Discharge" subtitle={pageSubtitle} currentPageTitle="Discharge">
      <Stack spacing={2}>
        <IpdFlowHeader
          activeStep="discharge"
          title="Discharge Coordination"
          description="Close clinical documentation, complete clearances, and deliver final discharge instructions."
          patientMrn={displayMrn}
          patientName={displayName}
          primaryAction={{
            label: 'Open Patient List',
            route: '/patients/list',
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatTile
              label="Ready for Discharge"
              value={readyCount}
              tone="success"
              icon={<TaskAltIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatTile
              label="Pending Clearances"
              value={pendingCount}
              tone="warning"
              icon={<WarningAmberIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatTile
              label="Completed Today"
              value={completedEntries.length}
              tone="info"
              icon={<ReceiptLongIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={3.5}>
            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Discharge Queue
                </Typography>

                <TextField
                  size="small"
                  placeholder="Search patient, MRN, ward..."
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
                  {filteredCandidates.map((candidate) => {
                    const patient = INPATIENT_STAYS.find((item) => item.id === candidate.patientId);
                    if (!patient) return null;

                    const patientChecklist =
                      checklists[patient.id] ?? buildInitialChecklistState(patient.id);
                    const isReady = isRequiredChecklistComplete(patientChecklist);

                    return (
                      <ListItemButton
                        key={candidate.patientId}
                        selected={candidate.patientId === selectedPatientId}
                        onClick={() => {
                          setSelectedPatientId(candidate.patientId);
                          setErrors({});
                        }}
                        sx={{
                          mb: 1,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor:
                            candidate.patientId === selectedPatientId ? 'primary.main' : 'divider',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {patient.patientName}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {patient.mrn} · {patient.ward}
                              </Typography>
                            }
                          />

                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip size="small" variant="outlined" label={`LOS ${candidate.losDays}d`} />
                            <Chip
                              size="small"
                              label={isReady ? 'Ready' : 'Pending'}
                              color={isReady ? 'success' : 'warning'}
                            />
                          </Stack>
                        </Box>
                      </ListItemButton>
                    );
                  })}
                </List>

                {filteredCandidates.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No active discharge candidates.
                  </Typography>
                ) : null}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8.5}>
            <Card
              elevation={0}
              sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Discharge Workspace
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPatient
                        ? `${selectedPatient.patientName} · ${selectedPatient.diagnosis}`
                        : 'Select a patient from queue'}
                    </Typography>
                  </Box>

                  {selectedCandidate ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" icon={<ChecklistIcon />} label={`LOS ${selectedCandidate.losDays} days`} />
                      <Chip
                        size="small"
                        color={selectedCandidate.billingStatus === 'Cleared' ? 'success' : 'warning'}
                        label={`Billing ${selectedCandidate.billingStatus}`}
                      />
                      <Chip
                        size="small"
                        color={selectedCandidate.pharmacyStatus === 'Ready' ? 'success' : 'warning'}
                        icon={<LocalPharmacyIcon />}
                        label={`Pharmacy ${selectedCandidate.pharmacyStatus}`}
                      />
                    </Stack>
                  ) : null}
                </Stack>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Required Checklist
                </Typography>

                <Grid container spacing={1}>
                  {DISCHARGE_CHECKLIST.map((item) => (
                    <Grid item xs={12} md={6} key={item.id}>
                      <Card variant="outlined" sx={{ px: 1.2, py: 0.8 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(currentChecklist[item.id])}
                              onChange={(event) => updateChecklistItem(item.id, event.target.checked)}
                            />
                          }
                          label={
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Typography variant="body2">{item.label}</Typography>
                              {item.required ? (
                                <Chip size="small" color="error" variant="outlined" label="Required" />
                              ) : null}
                            </Stack>
                          }
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Discharge Summary
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Final Diagnosis"
                      value={currentDraft.finalDiagnosis}
                      onChange={(event) => updateDraftField('finalDiagnosis', event.target.value)}
                      error={Boolean(errors.finalDiagnosis)}
                      helperText={errors.finalDiagnosis}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Condition at Discharge"
                      value={currentDraft.conditionAtDischarge}
                      onChange={(event) =>
                        updateDraftField('conditionAtDischarge', event.target.value)
                      }
                      error={Boolean(errors.conditionAtDischarge)}
                      helperText={errors.conditionAtDischarge}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Hospital Course"
                      value={currentDraft.hospitalCourse}
                      onChange={(event) => updateDraftField('hospitalCourse', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Procedures / Interventions"
                      value={currentDraft.procedures}
                      onChange={(event) => updateDraftField('procedures', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Discharge Medications"
                      value={currentDraft.dischargeMedications}
                      onChange={(event) =>
                        updateDraftField('dischargeMedications', event.target.value)
                      }
                      error={Boolean(errors.dischargeMedications)}
                      helperText={errors.dischargeMedications}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Warning Signs / Return Precautions"
                      value={currentDraft.warningSigns}
                      onChange={(event) => updateDraftField('warningSigns', event.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Follow-up and Billing Handover
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Follow-up Date"
                      value={currentDraft.followUpDate}
                      onChange={(event) => updateDraftField('followUpDate', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.followUpDate)}
                      helperText={errors.followUpDate}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Follow-up Department"
                      value={currentDraft.followUpDepartment}
                      onChange={(event) =>
                        updateDraftField('followUpDepartment', event.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Follow-up Doctor"
                      value={currentDraft.followUpDoctor}
                      onChange={(event) => updateDraftField('followUpDoctor', event.target.value)}
                      error={Boolean(errors.followUpDoctor)}
                      helperText={errors.followUpDoctor}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Billing Reference"
                      value={currentDraft.billingReference}
                      onChange={(event) => updateDraftField('billingReference', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Insurance Approval"
                      value={currentDraft.insuranceApproval}
                      onChange={(event) => updateDraftField('insuranceApproval', event.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Patient Instructions"
                      value={currentDraft.patientInstructions}
                      onChange={(event) =>
                        updateDraftField('patientInstructions', event.target.value)
                      }
                      error={Boolean(errors.patientInstructions)}
                      helperText={errors.patientInstructions}
                    />
                  </Grid>
                </Grid>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {saveStamp ? `Last saved at ${saveStamp}` : 'No draft saved yet'}
                  </Typography>

                  <Stack direction="row" spacing={1.2}>
                    <Button variant="outlined" onClick={handleSaveDraft}>
                      Save Draft
                    </Button>
                    <Button
                      variant="contained"
                      color={requiredComplete ? 'success' : 'primary'}
                      onClick={handleCompleteDischarge}
                    >
                      Complete Discharge
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Completed Discharges
            </Typography>

            {completedEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No discharge completed yet in this session.
              </Typography>
            ) : (
              completedEntries.map((entry) => (
                <Stack
                  key={entry.id}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ py: 0.75, borderBottom: '1px dashed', borderColor: 'divider' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {entry.patientName} ({entry.mrn})
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color="success" label={`Done ${entry.completedAt}`} />
                    <Chip size="small" variant="outlined" label={entry.preparedBy} />
                  </Stack>
                </Stack>
              ))
            )}
          </Stack>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
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
