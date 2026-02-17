'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch } from '@/src/store/hooks';
import {
  addEncounterPrescription,
  removeEncounterPrescription,
  updateEncounter,
  updateEncounterPrescription,
} from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import { MedicationCatalogItem } from './opd-mock-data';
import {
  buildEncounterOrdersRoute,
  buildEncounterRoute,
  resolveEncounterFromState,
} from './opd-encounter';
import OpdLayout from './components/OpdLayout';
import OpdTable from './components/OpdTable';

interface OpdPrescriptionsPageProps {
  encounterId?: string;
}

interface PrescriptionLine {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: 'Oral' | 'IV' | 'IM' | 'Topical';
  instructions: string;
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

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

export default function OpdPrescriptionsPage({ encounterId }: OpdPrescriptionsPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const mrnParam = useMrnParam();
  const {
    encounters,
    prescriptions,
    medicationCatalog,
    orders,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const encounter = React.useMemo(
    () => resolveEncounterFromState(encounters, { encounterId, mrn: mrnParam }),
    [encounters, encounterId, mrnParam]
  );

  const [draftLine, setDraftLine] = React.useState<PrescriptionLine>(() => buildDefaultLine(medicationCatalog));
  const [editingPrescriptionId, setEditingPrescriptionId] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    if (!draftLine.medicationId && medicationCatalog.length > 0) {
      setDraftLine(buildDefaultLine(medicationCatalog));
    }
  }, [draftLine.medicationId, medicationCatalog]);

  const subtitle = formatPatientLabel(encounter?.patientName, encounter?.mrn);
  const encounterPrescriptions = React.useMemo(
    () => prescriptions.filter((item) => item.encounterId === encounter?.id),
    [prescriptions, encounter?.id]
  );
  const encounterOrders = React.useMemo(
    () => orders.filter((item) => item.encounterId === encounter?.id),
    [orders, encounter?.id]
  );

  const updateDraftField = <K extends keyof PrescriptionLine>(
    field: K,
    value: PrescriptionLine[K]
  ) => {
    setDraftLine((prev) => ({ ...prev, [field]: value }));
  };

  const resetDraft = React.useCallback(() => {
    setDraftLine(buildDefaultLine(medicationCatalog));
    setEditingPrescriptionId(null);
  }, [medicationCatalog]);

  const handleMedicationChange = (medicationId: string) => {
    const selectedMedication = medicationCatalog.find((item) => item.id === medicationId);
    setDraftLine((prev) => ({
      ...prev,
      medicationId,
      dose: selectedMedication?.strength ?? prev.dose,
      frequency: selectedMedication?.commonFrequency ?? prev.frequency,
    }));
  };

  const handleEditMedication = (prescriptionId: string) => {
    const selectedPrescription = encounterPrescriptions.find((item) => item.id === prescriptionId);
    if (!selectedPrescription) return;

    const matchingMedication = medicationCatalog.find(
      (item) => `${item.genericName} ${item.strength}` === selectedPrescription.medicationName
    );

    setDraftLine({
      id: `rx-edit-${Date.now()}`,
      medicationId: matchingMedication?.id ?? medicationCatalog[0]?.id ?? '',
      dose: selectedPrescription.dose,
      frequency: selectedPrescription.frequency,
      durationDays: selectedPrescription.durationDays,
      route: selectedPrescription.route,
      instructions: selectedPrescription.instructions,
    });
    setEditingPrescriptionId(selectedPrescription.id);
  };

  const handleDeleteMedication = (prescriptionId: string) => {
    dispatch(removeEncounterPrescription(prescriptionId));
    if (editingPrescriptionId === prescriptionId) {
      resetDraft();
    }

    setSnackbar({
      open: true,
      message: 'Medication removed from prescription list.',
      severity: 'success',
    });
  };

  const handleSaveMedication = () => {
    if (!encounter) return;

    if (!draftLine.medicationId || !draftLine.dose || !draftLine.frequency || !draftLine.durationDays) {
      setSnackbar({
        open: true,
        message: 'Medication, dose, frequency, and duration are required.',
        severity: 'error',
      });
      return;
    }

    const medication = medicationCatalog.find((item) => item.id === draftLine.medicationId);
    if (!medication) {
      setSnackbar({
        open: true,
        message: 'Select a valid medication from catalog.',
        severity: 'error',
      });
      return;
    }

    const issuedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingPrescriptionId) {
      dispatch(
        updateEncounterPrescription({
          id: editingPrescriptionId,
          changes: {
            medicationName: `${medication.genericName} ${medication.strength}`,
            dose: draftLine.dose,
            frequency: draftLine.frequency,
            durationDays: draftLine.durationDays,
            route: draftLine.route,
            instructions: draftLine.instructions,
            issuedAt,
          },
        })
      );
      resetDraft();
      setSnackbar({ open: true, message: 'Medication updated successfully.', severity: 'success' });
      return;
    }

    dispatch(
      addEncounterPrescription({
        id: `rx-issued-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        medicationName: `${medication.genericName} ${medication.strength}`,
        dose: draftLine.dose,
        frequency: draftLine.frequency,
        durationDays: draftLine.durationDays,
        route: draftLine.route,
        instructions: draftLine.instructions,
        issuedAt,
      })
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );

    resetDraft();
    setSnackbar({ open: true, message: 'Medication added successfully.', severity: 'success' });
  };

  const handleCompleteFlow = () => {
    if (!encounter) return;
    if (encounter.status !== 'IN_PROGRESS') {
      setSnackbar({
        open: true,
        message: 'Encounter must be IN_PROGRESS before completion.',
        severity: 'error',
      });
      return;
    }

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'COMPLETED' },
      })
    );

    setSnackbar({
      open: true,
      message: `OPD visit completed for ${encounter.patientName}.`,
      severity: 'success',
    });

    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  if (!encounter) {
    return (
      <OpdLayout
        title="Encounter Prescriptions"
        subtitle={mrnParam ? `MRN ${mrnParam}` : undefined}
        currentPageTitle="Prescriptions"
      >
        <Alert severity="error">Prescriptions require an encounter context. Start from Queue and open a consultation.</Alert>
      </OpdLayout>
    );
  }

  return (
    <OpdLayout title="Encounter Prescriptions" subtitle={subtitle} currentPageTitle="Prescriptions">
      {opdStatus === 'loading' ? <Alert severity="info">Loading OPD data from the local JSON server.</Alert> : null}
      {opdStatus === 'error' ? (
        <Alert severity="warning">
          OPD JSON server not reachable. Showing fallback data.
          {opdError ? ` (${opdError})` : ''}
        </Alert>
      ) : null}

      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(115deg, ${alpha(theme.palette.secondary.main, 0.14)} 0%, ${theme.palette.background.paper} 38%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              ePrescription
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add and manage medications under encounter {encounter.id}.
            </Typography>
            <Stack direction="row" spacing={0.7} flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip size="small" label={`Patient ${encounter.patientName}`} color="primary" />
              <Chip size="small" label={`${encounterPrescriptions.length} medicines`} variant="outlined" />
              <Chip size="small" label={`${encounterOrders.length} orders`} variant="outlined" />
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" startIcon={<ScienceIcon />} onClick={() => router.push(buildEncounterOrdersRoute(encounter.id))}>
              Back to Orders
            </Button>
            <Button variant="outlined" onClick={() => router.push(buildEncounterRoute(encounter.id))}>
              Consultation Workspace
            </Button>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleCompleteFlow}>
              Complete Visit
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontWeight: 700 }}>
                  {getInitials(encounter.patientName)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {encounter.patientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {encounter.mrn} · {encounter.ageGender}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mt: 1.1 }}>
                <Chip size="small" label={encounter.department} variant="outlined" />
                <Chip size="small" label={`Dr. ${encounter.doctor.replace('Dr. ', '')}`} />
                <Chip size="small" color="warning" label={`Queue ${encounter.queuePriority}`} />
              </Stack>
            </Card>

            <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Medication Details
                </Typography>

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
                      onChange={(event) => updateDraftField('route', event.target.value as 'Oral' | 'IV' | 'IM' | 'Topical')}
                    >
                      {['Oral', 'IV', 'IM', 'Topical'].map((route) => (
                        <MenuItem key={route} value={route}>{route}</MenuItem>
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

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="outlined" onClick={resetDraft}>
                    Cancel
                  </Button>
                  <Button variant="contained" startIcon={<MedicationIcon />} onClick={handleSaveMedication}>
                    {editingPrescriptionId ? 'Update Medicine' : 'Add Medicine'}
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Prescription List
            </Typography>
            <OpdTable
              rows={encounterPrescriptions}
              emptyMessage="No prescriptions added for this encounter."
              rowKey={(row) => row.id}
              variant="plain"
              columns={[
                { id: 'drug', label: 'Medication', render: (row) => row.medicationName },
                { id: 'dose', label: 'Dose', render: (row) => row.dose },
                { id: 'freq', label: 'Frequency', render: (row) => row.frequency },
                { id: 'duration', label: 'Duration', render: (row) => `${row.durationDays} days` },
                { id: 'at', label: 'Issued At', render: (row) => row.issuedAt },
                {
                  id: 'actions',
                  label: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <IconButton size="small" aria-label="Edit prescription" onClick={() => handleEditMedication(row.id)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete prescription"
                        color="error"
                        onClick={() => handleDeleteMedication(row.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ),
                },
              ]}
            />
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
    </OpdLayout>
  );
}
