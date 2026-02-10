'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Chip, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  DeleteOutline as DeleteOutlineIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Medication as MedicationIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import { MedicationCatalogItem } from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useOpdData } from '@/src/store/opdHooks';

interface PrescriptionLine {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: 'Oral' | 'IV' | 'IM' | 'Topical';
  instructions: string;
}

interface IssuedPrescription {
  id: string;
  patientId: string;
  lineCount: number;
  issuedAt: string;
  prescriber: string;
}

function buildDefaultLine(medications: MedicationCatalogItem[] = []): PrescriptionLine {
  const first = medications[0];
  return {
    id: `rx-${Date.now()}`,
    medicationId: first?.id ?? '',
    dose: first?.strength ?? '',
    frequency: first?.commonFrequency ?? 'OD',
    durationDays: '5',
    route: 'Oral',
    instructions: '',
  };
}

export default function OpdPrescriptionsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const { encounters, medicationCatalog, status: opdStatus, error: opdError } = useOpdData();
  const [selectedPatientId, setSelectedPatientId] = React.useState(encounters[0]?.id ?? '');
  const [draftLine, setDraftLine] = React.useState<PrescriptionLine>(() =>
    buildDefaultLine(medicationCatalog)
  );
  const [prescriptionLines, setPrescriptionLines] = React.useState<PrescriptionLine[]>([]);
  const [issuedList, setIssuedList] = React.useState<IssuedPrescription[]>([]);
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
    if (!draftLine.medicationId && medicationCatalog.length > 0) {
      setDraftLine(buildDefaultLine(medicationCatalog));
    }
  }, [draftLine.medicationId, medicationCatalog]);

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

  const patientIssued = React.useMemo(
    () => issuedList.filter((item) => item.patientId === selectedPatientId),
    [issuedList, selectedPatientId]
  );

  const updateDraftField = <K extends keyof PrescriptionLine>(
    field: K,
    value: PrescriptionLine[K]
  ) => {
    setDraftLine((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = encounters.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedPatientId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, encounters]);

  const handleMedicationChange = (medicationId: string) => {
    const selectedMedication = medicationCatalog.find((item) => item.id === medicationId);
    setDraftLine((prev) => ({
      ...prev,
      medicationId,
      dose: selectedMedication?.strength ?? prev.dose,
      frequency: selectedMedication?.commonFrequency ?? prev.frequency,
    }));
  };

  const handleAddLine = () => {
    if (!draftLine.medicationId || !draftLine.dose || !draftLine.frequency || !draftLine.durationDays) {
      setSnackbar({
        open: true,
        message: 'Medication, dose, frequency, and duration are required.',
        severity: 'error',
      });
      return;
    }

    setPrescriptionLines((prev) => [
      ...prev,
      {
        ...draftLine,
        id: `rx-${Date.now()}-${prev.length}`,
      },
    ]);

    setDraftLine((prev) => ({
      ...buildDefaultLine(medicationCatalog),
      route: prev.route,
    }));
  };

  const handleRemoveLine = (lineId: string) => {
    setPrescriptionLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const handleIssuePrescription = () => {
    if (!selectedPatient) return;

    if (prescriptionLines.length === 0) {
      setSnackbar({
        open: true,
        message: 'Add at least one medication before issuing eRx.',
        severity: 'error',
      });
      return;
    }

    const entry: IssuedPrescription = {
      id: `issued-${Date.now()}`,
      patientId: selectedPatient.id,
      lineCount: prescriptionLines.length,
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prescriber: selectedPatient.doctor,
    };

    setIssuedList((prev) => [entry, ...prev]);
    setPrescriptionLines([]);
    setSnackbar({
      open: true,
      message: `ePrescription issued for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Prescriptions" subtitle={pageSubtitle} currentPageTitle="Prescriptions">
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
          activeStep="prescriptions"
          title="OPD ePrescription"
          description="Prepare medication plan, verify allergies, and issue prescription to pharmacy."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Back to Visit', route: '/appointments/visit' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Current Rx Items</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{prescriptionLines.length}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Issued for Patient</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{patientIssued.length}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Allergy Flags</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: selectedPatient?.allergies?.[0] === 'No known allergies' ? 'success.main' : 'warning.main' }}>
                {selectedPatient?.allergies?.join(', ') ?? 'None'}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Prescription Builder</Typography>

                <TextField
                  select
                  label="Patient"
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                >
                  {encounters.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.patientName} ({patient.mrn})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Medication"
                  value={draftLine.medicationId}
                  onChange={(event) => handleMedicationChange(event.target.value)}
                >
                  {medicationCatalog.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.genericName} {item.strength}
                    </MenuItem>
                  ))}
                </TextField>

                <Grid container spacing={1.2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Dose" value={draftLine.dose} onChange={(event) => updateDraftField('dose', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Frequency" value={draftLine.frequency} onChange={(event) => updateDraftField('frequency', event.target.value)} /></Grid>
                </Grid>

                <Grid container spacing={1.2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Duration (days)" value={draftLine.durationDays} onChange={(event) => updateDraftField('durationDays', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Route"
                      value={draftLine.route}
                      onChange={(event) =>
                        updateDraftField('route', event.target.value as 'Oral' | 'IV' | 'IM' | 'Topical')
                      }
                    >
                      {['Oral', 'IV', 'IM', 'Topical'].map((route) => (
                        <MenuItem key={route} value={route}>
                          {route}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  label="Instructions"
                  multiline
                  minRows={2}
                  value={draftLine.instructions}
                  onChange={(event) => updateDraftField('instructions', event.target.value)}
                />

                <Button variant="outlined" startIcon={<MedicationIcon />} onClick={handleAddLine}>
                  Add Medication
                </Button>
                <Button variant="contained" startIcon={<SendIcon />} onClick={handleIssuePrescription}>
                  Issue ePrescription
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Medication List</Typography>
                {prescriptionLines.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No medications added.</Typography>
                ) : (
                  prescriptionLines.map((line) => {
                    const medication = medicationCatalog.find((item) => item.id === line.medicationId);
                    if (!medication) return null;

                    return (
                      <Card key={line.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.7}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {medication.genericName} {medication.strength}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => handleRemoveLine(line.id)}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip size="small" variant="outlined" label={`${line.dose} · ${line.frequency}`} />
                            <Chip size="small" label={`${line.durationDays} days`} />
                            <Chip size="small" variant="outlined" label={line.route} />
                          </Stack>
                          {line.instructions ? (
                            <Typography variant="caption" color="text.secondary">
                              {line.instructions}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Issued Prescriptions</Typography>
                  {patientIssued.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No eRx issued for selected patient.</Typography>
                  ) : (
                    patientIssued.map((entry) => (
                      <Card key={entry.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.45}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {entry.lineCount} medications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.issuedAt} · {entry.prescriber}
                          </Typography>
                        </Stack>
                      </Card>
                    ))
                  )}
                </Stack>
              </Card>

              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  {selectedPatient ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPatient.patientName}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedPatient.mrn} · {selectedPatient.doctor}</Typography>
                    </>
                  ) : null}
                  <Button
                    variant="outlined"
                    startIcon={<LocalPharmacyIcon />}
                    onClick={() => router.push(withMrn('/appointments/visit'))}
                  >
                    Encounter Workspace
                  </Button>
                  <Button variant="text" onClick={() => router.push('/patients/list')}>
                    Patient List
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
