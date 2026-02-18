'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card } from '@/src/ui/components/molecules';
import { alpha, Theme, useTheme } from '@/src/ui/theme';
import {
  CheckCircle as CheckCircleIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import LegacyEncounterRedirect from '../opd/LegacyEncounterRedirect';
import {
  IpdMetricCard,
  IpdSectionCard,
  ipdFormStylesSx,
} from '../ipd/components/ipd-ui';
import {
  IpdEncounterRecord,
  syncIpdEncounterClinical,
  syncIpdEncounterDischargeChecks,
  useIpdEncounterState,
} from '../ipd/ipd-encounter-context';

type RouteType = 'PO (Oral)' | 'IV' | 'IM' | 'SC' | 'Topical';
type RxStatus = 'Prescribed' | 'Dispensed' | 'Administered' | 'Stopped';
type RxFilter = 'All' | RxStatus;
type BillingStatus = 'Pending' | 'Ready for Billing' | 'Cancelled';

interface PrescriptionRow {
  id: string;
  medicationName: string;
  dose: string;
  route: RouteType;
  frequency: string;
  duration: string;
  notes: string;
  status: RxStatus;
  prescribedBy: string;
  updatedAt: string;
}

interface PrescriptionDraft {
  medicationName: string;
  dose: string;
  route: RouteType;
  frequency: string;
  duration: string;
  notes: string;
}

type PrescriptionStore = Record<string, PrescriptionRow[]>;

interface BillingEntry {
  id: string;
  orderId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  admissionId: string;
  encounterId: string;
  category: 'Medication';
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: 'INR';
  status: BillingStatus;
  orderedBy: string;
  orderedAt: string;
  statusUpdatedAt: string;
  statusUpdatedBy: string;
}

const STORAGE_KEY = 'scanbo.hims.ipd.prescriptions.module.v1';
const ORDER_BILLING_STORAGE_KEY = 'scanbo.hims.ipd.orders-billing.v1';

const ROUTE_OPTIONS: RouteType[] = ['PO (Oral)', 'IV', 'IM', 'SC', 'Topical'];

const defaultDraft: PrescriptionDraft = {
  medicationName: '',
  dose: '',
  route: 'PO (Oral)',
  frequency: 'OD',
  duration: '',
  notes: '',
};

function readStore(): PrescriptionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PrescriptionStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: PrescriptionStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // best effort persistence only
  }
}

function isPendingMedication(status: RxStatus): boolean {
  return status === 'Prescribed' || status === 'Dispensed';
}

function mapRxStatusToBillingStatus(status: RxStatus): BillingStatus {
  if (status === 'Stopped') return 'Cancelled';
  if (status === 'Dispensed' || status === 'Administered') return 'Ready for Billing';
  return 'Pending';
}

function syncPrescriptionBillingLedger(
  encounters: IpdEncounterRecord[],
  prescriptionStore: PrescriptionStore
): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.sessionStorage.getItem(ORDER_BILLING_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const ordersByPatient = parsed?.ordersByPatient;
    const existingBillingByPatient = (parsed?.billingByPatient ?? {}) as Record<string, BillingEntry[]>;
    const nextBillingByPatient: Record<string, BillingEntry[]> = { ...existingBillingByPatient };

    const encounterByPatientId = encounters.reduce<Record<string, IpdEncounterRecord>>((acc, record) => {
      acc[record.patientId] = record;
      return acc;
    }, {});

    Object.entries(prescriptionStore).forEach(([patientId, rows]) => {
      const encounter = encounterByPatientId[patientId];
      if (!encounter) return;

      const preservedRows = (nextBillingByPatient[patientId] ?? []).filter(
        (row) => !String(row.id).startsWith(`bill-rx-ipd-${patientId}-`)
      );

      const medicationRows: BillingEntry[] = rows
        .filter((row) => !String(row.id).startsWith(`rounds-${patientId}-`))
        .map((row) => {
          const billingId = `bill-rx-ipd-${patientId}-${row.id}`;
          const billingStatus = mapRxStatusToBillingStatus(row.status);

          return {
            id: billingId,
            orderId: `rx-ipd-${row.id}`,
            patientId,
            patientMrn: encounter.mrn,
            patientName: encounter.patientName,
            admissionId: encounter.admissionId,
            encounterId: encounter.encounterId,
            category: 'Medication',
            serviceCode: 'MED-IPD',
            serviceName: `${row.medicationName} (${row.dose})`,
            quantity: 1,
            unitPrice: 300,
            amount: 300,
            currency: 'INR',
            status: billingStatus,
            orderedBy: row.prescribedBy,
            orderedAt: row.updatedAt,
            statusUpdatedAt: row.updatedAt,
            statusUpdatedBy: row.prescribedBy,
          };
        });

      nextBillingByPatient[patientId] = [...medicationRows, ...preservedRows];
    });

    window.sessionStorage.setItem(
      ORDER_BILLING_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        ordersByPatient:
          ordersByPatient && typeof ordersByPatient === 'object'
            ? ordersByPatient
            : {},
        billingByPatient: nextBillingByPatient,
      })
    );
  } catch {
    // best effort sync only
  }
}

export default function ClinicalPrescriptionsPage() {
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const encounterState = useIpdEncounterState();

  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const [rxStore, setRxStore] = React.useState<PrescriptionStore>(() => readStore());
  const [draft, setDraft] = React.useState<PrescriptionDraft>(defaultDraft);
  const [filter, setFilter] = React.useState<RxFilter>('All');
  const [search, setSearch] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const activeEncounters = React.useMemo<IpdEncounterRecord[]>(
    () =>
      Object.values(encounterState)
        .filter((record) => record.workflowStatus !== 'discharged')
        .sort((a, b) => a.patientName.localeCompare(b.patientName)),
    [encounterState]
  );

  const ipdEncounterFromMrn = React.useMemo(
    () =>
      mrnParam ? activeEncounters.find((record) => record.mrn === mrnParam) ?? null : null,
    [activeEncounters, mrnParam]
  );

  React.useEffect(() => {
    if (ipdEncounterFromMrn) {
      setSelectedPatientId(ipdEncounterFromMrn.patientId);
      return;
    }
    if (!selectedPatientId && activeEncounters[0]) {
      setSelectedPatientId(activeEncounters[0].patientId);
    }
  }, [activeEncounters, ipdEncounterFromMrn, selectedPatientId]);

  React.useEffect(() => {
    writeStore(rxStore);
  }, [rxStore]);

  React.useEffect(() => {
    syncPrescriptionBillingLedger(activeEncounters, rxStore);
  }, [activeEncounters, rxStore]);

  const shouldFallbackToLegacy = Boolean(mrnParam && !ipdEncounterFromMrn);
  if (shouldFallbackToLegacy) {
    return <LegacyEncounterRedirect target="prescriptions" />;
  }

  const selectedEncounter =
    activeEncounters.find((record) => record.patientId === selectedPatientId) ??
    ipdEncounterFromMrn ??
    activeEncounters[0] ??
    null;

  if (!selectedEncounter) {
    return (
      <PageTemplate title="Medication / eMAR" currentPageTitle="Prescriptions">
        <Alert severity="info">No active IPD encounter available for medication management.</Alert>
      </PageTemplate>
    );
  }

  const subtitle = formatPatientLabel(selectedEncounter.patientName, selectedEncounter.mrn);
  const patientPrescriptions = rxStore[selectedEncounter.patientId] ?? [];

  const pendingMedicationCount = patientPrescriptions.filter((row) =>
    isPendingMedication(row.status)
  ).length;
  const dispensedCount = patientPrescriptions.filter((row) => row.status === 'Dispensed').length;
  const administeredCount = patientPrescriptions.filter(
    (row) => row.status === 'Administered'
  ).length;
  const pharmacyClear = patientPrescriptions.length > 0 && pendingMedicationCount === 0;

  React.useEffect(() => {
    syncIpdEncounterClinical(selectedEncounter.patientId, {
      pendingMedications: pendingMedicationCount,
      diagnosis: selectedEncounter.diagnosis,
    });
    syncIpdEncounterDischargeChecks(selectedEncounter.patientId, {
      pharmacyCleared: pharmacyClear,
    });
  }, [
    pendingMedicationCount,
    pharmacyClear,
    selectedEncounter.diagnosis,
    selectedEncounter.patientId,
  ]);

  const filteredRows = patientPrescriptions.filter((row) => {
    const matchesFilter = filter === 'All' || row.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      [row.medicationName, row.dose, row.route, row.frequency, row.notes, row.prescribedBy]
        .join(' ')
        .toLowerCase()
        .includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleDraftField = <K extends keyof PrescriptionDraft>(
    field: K,
    value: PrescriptionDraft[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
    setFormError('');
  };

  const addPrescription = () => {
    if (!draft.medicationName.trim() || !draft.dose.trim()) {
      setFormError('Medication name and dose are required.');
      return;
    }

    const row: PrescriptionRow = {
      id: `ipd-rx-${Date.now()}`,
      medicationName: draft.medicationName.trim(),
      dose: draft.dose.trim(),
      route: draft.route,
      frequency: draft.frequency.trim() || 'OD',
      duration: draft.duration.trim(),
      notes: draft.notes.trim(),
      status: 'Prescribed',
      prescribedBy: selectedEncounter.consultant || 'Primary Consultant',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRxStore((prev) => ({
      ...prev,
      [selectedEncounter.patientId]: [row, ...(prev[selectedEncounter.patientId] ?? [])],
    }));
    setDraft(defaultDraft);
    setSnackbar({
      open: true,
      message: 'Medication prescribed.',
      severity: 'success',
    });
  };

  const updateRxStatus = (rowId: string, status: RxStatus) => {
    setRxStore((prev) => ({
      ...prev,
      [selectedEncounter.patientId]: (prev[selectedEncounter.patientId] ?? []).map((row) =>
        row.id === rowId
          ? {
              ...row,
              status,
              updatedAt: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : row
      ),
    }));
    setSnackbar({
      open: true,
      message: `Medication marked as ${status}.`,
      severity: 'info',
    });
  };

  const compactBtnSx = {
    minWidth: 0,
    px: 1.35,
    py: 0.45,
    borderRadius: 1.1,
    textTransform: 'none',
    fontWeight: 600,
  };

  return (
    <PageTemplate title="Medication / eMAR" subtitle={subtitle} currentPageTitle="Prescriptions">
      <Stack spacing={2}>
        <IpdSectionCard
          title="IPD Medication Management"
          subtitle="Prescribe, dispense, and administer medications linked to IPD encounter workflow."
          bodySx={ipdFormStylesSx}
        >
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
              <TextField
                size="small"
                select
                label="IPD Patient"
                value={selectedEncounter.patientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
                sx={{ minWidth: { xs: '100%', md: 280 } }}
              >
                {activeEncounters.map((record) => (
                  <MenuItem key={record.patientId} value={record.patientId}>
                    {record.patientName} ({record.mrn}) · {record.bed || '--'}
                  </MenuItem>
                ))}
              </TextField>
              <Chip
                size="small"
                label={`Ward ${selectedEncounter.ward}`}
                sx={{
                  width: 'fit-content',
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                }}
              />
              <Chip size="small" label={`Bed ${selectedEncounter.bed || '--'}`} variant="outlined" />
            </Stack>

            <Grid container spacing={1.2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Medication Name"
                  placeholder="e.g. Piperacillin/Tazobactam"
                  value={draft.medicationName}
                  onChange={(event) => handleDraftField('medicationName', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dose"
                  placeholder="e.g. 4.5 g"
                  value={draft.dose}
                  onChange={(event) => handleDraftField('dose', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Route"
                  value={draft.route}
                  onChange={(event) => handleDraftField('route', event.target.value as RouteType)}
                >
                  {ROUTE_OPTIONS.map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Frequency"
                  placeholder="e.g. OD, BD, TDS"
                  value={draft.frequency}
                  onChange={(event) => handleDraftField('frequency', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Duration"
                  placeholder="e.g. 5 days"
                  value={draft.duration}
                  onChange={(event) => handleDraftField('duration', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Instructions"
                  placeholder="Clinical instructions..."
                  value={draft.notes}
                  onChange={(event) => handleDraftField('notes', event.target.value)}
                />
              </Grid>
            </Grid>

            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" sx={compactBtnSx} onClick={resetDraft}>
                Cancel
              </Button>
              <Button variant="contained" size="small" sx={compactBtnSx} onClick={addPrescription}>
                Add Medication
              </Button>
            </Stack>
          </Stack>
        </IpdSectionCard>

        <Grid container spacing={1.3}>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Pending Medication"
              value={pendingMedicationCount}
              trend="Pending dispense/administer"
              tone="warning"
              icon={<MedicationIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Dispensed"
              value={dispensedCount}
              trend="Ready at pharmacy"
              tone="info"
              icon={<ScienceIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Administered"
              value={administeredCount}
              trend="Given to patient"
              tone="success"
              icon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Pharmacy Clearance"
              value={pharmacyClear ? 'Ready' : 'Pending'}
              trend="Discharge medication readiness"
              tone={pharmacyClear ? 'success' : 'danger'}
              icon={<LocalPharmacyIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
        </Grid>

        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.2 }}
        >
          <Stack spacing={1.2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Medication Schedule
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Search"
                  placeholder="Medication, dose, route..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <TextField
                  size="small"
                  select
                  label="Status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as RxFilter)}
                  sx={{ minWidth: 160 }}
                >
                  {(['All', 'Prescribed', 'Dispensed', 'Administered', 'Stopped'] as RxFilter[]).map(
                    (value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Stack>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx(theme)}>Medication</TableCell>
                    <TableCell sx={headCellSx(theme)}>Dose/Route</TableCell>
                    <TableCell sx={headCellSx(theme)}>Frequency</TableCell>
                    <TableCell sx={headCellSx(theme)}>Status</TableCell>
                    <TableCell sx={headCellSx(theme)}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 2.4, textAlign: 'center', color: 'text.secondary' }}>
                        No medication records for this patient.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ minWidth: 250 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.medicationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.prescribedBy} · {row.updatedAt}
                          </Typography>
                        </TableCell>
                        <TableCell>{`${row.dose} · ${row.route}`}</TableCell>
                        <TableCell>{row.duration ? `${row.frequency} · ${row.duration}` : row.frequency}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              row.status === 'Administered'
                                ? 'success'
                                : row.status === 'Dispensed'
                                ? 'info'
                                : row.status === 'Stopped'
                                ? 'default'
                                : 'warning'
                            }
                            label={row.status}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.7}>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={compactBtnSx}
                              disabled={row.status === 'Dispensed' || row.status === 'Administered'}
                              onClick={() => updateRxStatus(row.id, 'Dispensed')}
                            >
                              Dispense
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={compactBtnSx}
                              disabled={row.status === 'Administered'}
                              onClick={() => updateRxStatus(row.id, 'Administered')}
                            >
                              Given
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              sx={compactBtnSx}
                              disabled={row.status === 'Stopped'}
                              onClick={() => updateRxStatus(row.id, 'Stopped')}
                            >
                              Stop
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Card>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}

function headCellSx(theme: Theme) {
  return {
    py: 1,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    color: 'text.secondary',
    borderBottom: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.16),
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  };
}
