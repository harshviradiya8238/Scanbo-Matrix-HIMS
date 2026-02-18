'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
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
  LocalPharmacy as LocalPharmacyIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
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
  useIpdEncounterState,
} from '../ipd/ipd-encounter-context';

type OrderType = 'Lab' | 'Imaging' | 'Medication' | 'Procedure' | 'Consult' | 'Nursing';
type OrderPriority = 'Routine' | 'Urgent' | 'STAT';
type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
type OrderFilter = 'All' | OrderStatus;

interface ClinicalOrderRow {
  id: string;
  type: OrderType;
  priority: OrderPriority;
  description: string;
  frequency: string;
  duration: string;
  notes: string;
  status: OrderStatus;
  orderedAt: string;
  orderedBy: string;
}

interface DraftOrder {
  type: OrderType;
  priority: OrderPriority;
  description: string;
  frequency: string;
  duration: string;
  notes: string;
}

type OrdersStore = Record<string, ClinicalOrderRow[]>;

const STORAGE_KEY = 'scanbo.hims.ipd.orders.module.v1';

const ORDER_TYPES: OrderType[] = [
  'Lab',
  'Imaging',
  'Medication',
  'Procedure',
  'Consult',
  'Nursing',
];

const PRIORITY_OPTIONS: OrderPriority[] = ['Routine', 'Urgent', 'STAT'];

const defaultDraft: DraftOrder = {
  type: 'Lab',
  priority: 'Routine',
  description: '',
  frequency: 'Once',
  duration: '',
  notes: '',
};

function readOrdersStore(): OrdersStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OrdersStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOrdersStore(store: OrdersStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // best effort persistence only
  }
}

function isPendingOrder(status: OrderStatus): boolean {
  return status === 'Pending' || status === 'In Progress';
}

function isDiagnosticOrder(type: OrderType): boolean {
  return type === 'Lab' || type === 'Imaging';
}

export default function ClinicalOrdersPage() {
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const encounterState = useIpdEncounterState();

  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const [orderStore, setOrderStore] = React.useState<OrdersStore>(() => readOrdersStore());
  const [draft, setDraft] = React.useState<DraftOrder>(defaultDraft);
  const [filter, setFilter] = React.useState<OrderFilter>('All');
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
    writeOrdersStore(orderStore);
  }, [orderStore]);

  const shouldFallbackToLegacy = Boolean(mrnParam && !ipdEncounterFromMrn);
  if (shouldFallbackToLegacy) {
    return <LegacyEncounterRedirect target="orders" />;
  }

  const selectedEncounter =
    activeEncounters.find((record) => record.patientId === selectedPatientId) ??
    ipdEncounterFromMrn ??
    activeEncounters[0] ??
    null;

  if (!selectedEncounter) {
    return (
      <PageTemplate title="Clinical Orders" currentPageTitle="Clinical Orders">
        <Alert severity="info">No active IPD encounter available for order entry.</Alert>
      </PageTemplate>
    );
  }

  const subtitle = formatPatientLabel(selectedEncounter.patientName, selectedEncounter.mrn);
  const patientOrders = orderStore[selectedEncounter.patientId] ?? [];

  const pendingOrdersCount = patientOrders.filter((order) => isPendingOrder(order.status)).length;
  const pendingDiagnosticsCount = patientOrders.filter(
    (order) => isPendingOrder(order.status) && isDiagnosticOrder(order.type)
  ).length;
  const pendingMedicationCount = patientOrders.filter(
    (order) => isPendingOrder(order.status) && order.type === 'Medication'
  ).length;
  const completedOrdersCount = patientOrders.filter((order) => order.status === 'Completed').length;

  React.useEffect(() => {
    syncIpdEncounterClinical(selectedEncounter.patientId, {
      pendingOrders: pendingOrdersCount,
      pendingDiagnostics: pendingDiagnosticsCount,
      pendingMedications: pendingMedicationCount,
      diagnosis: selectedEncounter.diagnosis,
    });
  }, [
    pendingDiagnosticsCount,
    pendingMedicationCount,
    pendingOrdersCount,
    selectedEncounter.diagnosis,
    selectedEncounter.patientId,
  ]);

  const filteredOrders = patientOrders.filter((order) => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      [order.type, order.description, order.notes, order.orderedBy, order.priority]
        .join(' ')
        .toLowerCase()
        .includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleDraftField = <K extends keyof DraftOrder>(field: K, value: DraftOrder[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleResetDraft = () => {
    setDraft(defaultDraft);
    setFormError('');
  };

  const handleAddOrder = () => {
    if (!draft.description.trim()) {
      setFormError('Order description is required.');
      return;
    }

    const newOrder: ClinicalOrderRow = {
      id: `ipd-order-${Date.now()}`,
      type: draft.type,
      priority: draft.priority,
      description: draft.description.trim(),
      frequency: draft.frequency.trim() || 'Once',
      duration: draft.duration.trim(),
      notes: draft.notes.trim(),
      status: 'Pending',
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderedBy: selectedEncounter.consultant || 'Primary Consultant',
    };

    setOrderStore((prev) => ({
      ...prev,
      [selectedEncounter.patientId]: [newOrder, ...(prev[selectedEncounter.patientId] ?? [])],
    }));
    setDraft(defaultDraft);
    setSnackbar({
      open: true,
      message: 'Order added to IPD CPOE queue.',
      severity: 'success',
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrderStore((prev) => ({
      ...prev,
      [selectedEncounter.patientId]: (prev[selectedEncounter.patientId] ?? []).map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));
    setSnackbar({
      open: true,
      message: `Order marked as ${status}.`,
      severity: 'info',
    });
  };

  const compactBtnSx = {
    minWidth: 0,
    px: 1.4,
    py: 0.45,
    borderRadius: 1.1,
    textTransform: 'none',
    fontWeight: 600,
  };

  return (
    <PageTemplate title="Clinical Orders (CPOE)" subtitle={subtitle} currentPageTitle="Clinical Orders">
      <Stack spacing={2}>
        <IpdSectionCard
          title="IPD Order Management"
          subtitle="Create and track lab, imaging, medication, and procedure orders linked to IPD workflow."
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
                  select
                  label="Order Type"
                  value={draft.type}
                  onChange={(event) => handleDraftField('type', event.target.value as OrderType)}
                >
                  {ORDER_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Priority"
                  value={draft.priority}
                  onChange={(event) =>
                    handleDraftField('priority', event.target.value as OrderPriority)
                  }
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Order Description"
                  placeholder="e.g. Repeat CBC + CRP, 12-lead ECG..."
                  value={draft.description}
                  onChange={(event) => handleDraftField('description', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Frequency"
                  placeholder="e.g. Once, Q8H, Daily"
                  value={draft.frequency}
                  onChange={(event) => handleDraftField('frequency', event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Duration"
                  placeholder="e.g. 3 days, Ongoing, PRN"
                  value={draft.duration}
                  onChange={(event) => handleDraftField('duration', event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Clinical Notes"
                  placeholder="Clinical justification..."
                  value={draft.notes}
                  onChange={(event) => handleDraftField('notes', event.target.value)}
                />
              </Grid>
            </Grid>

            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" sx={compactBtnSx} onClick={handleResetDraft}>
                Cancel
              </Button>
              <Button variant="contained" size="small" sx={compactBtnSx} onClick={handleAddOrder}>
                Submit Order
              </Button>
            </Stack>
          </Stack>
        </IpdSectionCard>

        <Grid container spacing={1.3}>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Pending Orders"
              value={pendingOrdersCount}
              trend="Open CPOE tasks"
              tone="warning"
              icon={<PlaylistAddCheckIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Diagnostics Pending"
              value={pendingDiagnosticsCount}
              trend="Lab / Imaging in queue"
              tone="info"
              icon={<ScienceIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Medication Pending"
              value={pendingMedicationCount}
              trend="Medication orders not completed"
              tone="danger"
              icon={<LocalPharmacyIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IpdMetricCard
              label="Completed"
              value={completedOrdersCount}
              trend="Orders completed"
              tone="success"
              icon={<PlaylistAddCheckIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.2 }}>
          <Stack spacing={1.2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Active Order List
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Search"
                  placeholder="Description, type, priority..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <TextField
                  size="small"
                  select
                  label="Status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as OrderFilter)}
                  sx={{ minWidth: 150 }}
                >
                  {(['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'] as OrderFilter[]).map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx(theme)}>Type</TableCell>
                    <TableCell sx={headCellSx(theme)}>Description</TableCell>
                    <TableCell sx={headCellSx(theme)}>Frequency</TableCell>
                    <TableCell sx={headCellSx(theme)}>Priority</TableCell>
                    <TableCell sx={headCellSx(theme)}>Status</TableCell>
                    <TableCell sx={headCellSx(theme)}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 2.4, textAlign: 'center', color: 'text.secondary' }}>
                        No orders found for this patient.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.type}</TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.orderedBy} · {order.orderedAt}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.duration ? `${order.frequency} · ${order.duration}` : order.frequency}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              order.priority === 'STAT'
                                ? 'error'
                                : order.priority === 'Urgent'
                                ? 'warning'
                                : 'default'
                            }
                            label={order.priority}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              order.status === 'Completed'
                                ? 'success'
                                : order.status === 'Cancelled'
                                ? 'default'
                                : order.status === 'In Progress'
                                ? 'info'
                                : 'warning'
                            }
                            label={order.status}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.7}>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={compactBtnSx}
                              disabled={order.status === 'Completed'}
                              onClick={() => updateOrderStatus(order.id, 'Completed')}
                            >
                              Done
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              sx={compactBtnSx}
                              disabled={order.status === 'Cancelled'}
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            >
                              Cancel
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
