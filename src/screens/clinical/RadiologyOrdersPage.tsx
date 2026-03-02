'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommonDialog } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  LocalHospital as LocalHospitalIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import ModuleHeaderCard from '@/src/screens/clinical/components/ModuleHeaderCard';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { GLOBAL_PATIENTS } from '@/src/mocks/global-patients';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  addOrder,
  moveOrderToWorklist,
  removeOrder,
  updateOrder,
} from '@/src/store/slices/radiologySlice';
import { ImagingOrder, ImagingPriority, ValidationState } from '@/src/core/radiology/types';

type OrderFormState = {
  patientName: string;
  mrn: string;
  ageGender: string;
  modality: string;
  study: string;
  priority: ImagingPriority;
  validationState: ValidationState;
  authorization: string;
  clinicalCheck: string;
  scheduledSlot: string;
};

const priorityColors: Record<ImagingPriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Routine: 'default',
};

const validationColors: Record<ValidationState, 'success' | 'warning' | 'info' | 'error'> = {
  Ready: 'success',
  'Needs Authorization': 'warning',
  'Needs Clinical Review': 'info',
  Hold: 'error',
};

const buildEmptyForm = (): OrderFormState => ({
  patientName: '',
  mrn: '',
  ageGender: '',
  modality: 'MRI',
  study: '',
  priority: 'Routine',
  validationState: 'Needs Authorization',
  authorization: '',
  clinicalCheck: '',
  scheduledSlot: '',
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function RadiologyOrdersPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.radiology.orders);

  const [selectedOrderId, setSelectedOrderId] = React.useState(orders[0]?.id ?? '');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<ImagingOrder | null>(null);
  const [formState, setFormState] = React.useState<OrderFormState>(buildEmptyForm);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedOrder = React.useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId]
  );

  React.useEffect(() => {
    if (orders.length === 0) {
      setSelectedOrderId('');
      return;
    }
    if (!orders.find((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = orders.find((order) => order.mrn === mrnParam);
    if (match) {
      setSelectedOrderId(match.id);
    }
    setMrnApplied(true);
  }, [mrnApplied, mrnParam, orders]);

  const pageSubtitle = formatPatientLabel(selectedOrder?.patientName, selectedOrder?.mrn);
  const withMrn = React.useCallback(
    (route: string) => (selectedOrder?.mrn ? `${route}?mrn=${selectedOrder.mrn}` : route),
    [selectedOrder]
  );

  const pendingCount = orders.filter((order) => order.validationState !== 'Ready').length;
  const totalCount = orders.length;

  const orderColumns = React.useMemo<GridColDef<ImagingOrder>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 220,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<ImagingOrder>) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: '100%' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.mrn} · {params.row.ageGender}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'modality',
        headerName: 'Modality',
        width: 110,
      },
      {
        field: 'study',
        headerName: 'Study',
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params: GridRenderCellParams<ImagingOrder, ImagingPriority>) => (
          <Chip size="small" label={params.row.priority} color={priorityColors[params.row.priority]} />
        ),
      },
      {
        field: 'validationState',
        headerName: 'Validation',
        width: 170,
        renderCell: (params: GridRenderCellParams<ImagingOrder, ValidationState>) => (
          <Chip
            size="small"
            label={params.row.validationState}
            color={validationColors[params.row.validationState]}
            variant={params.row.validationState === 'Ready' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'scheduledSlot',
        headerName: 'Slot',
        width: 110,
      },
    ],
    []
  );

  const openCreateDialog = () => {
    setEditingOrder(null);
    setFormState(buildEmptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (order: ImagingOrder) => {
    setEditingOrder(order);
    setFormState({
      patientName: order.patientName,
      mrn: order.mrn,
      ageGender: order.ageGender,
      modality: order.modality,
      study: order.study,
      priority: order.priority,
      validationState: order.validationState,
      authorization: order.authorization,
      clinicalCheck: order.clinicalCheck,
      scheduledSlot: order.scheduledSlot,
    });
    setDialogOpen(true);
  };

  const handlePatientSelect = (mrn: string) => {
    const patient = GLOBAL_PATIENTS.find((item) => item.mrn === mrn);
    setFormState((prev) => ({
      ...prev,
      mrn: patient?.mrn ?? mrn,
      patientName: patient?.name ?? prev.patientName,
      ageGender: patient?.ageGender ?? prev.ageGender,
    }));
  };

  const handleSave = () => {
    const trimmedName = formState.patientName.trim();
    const trimmedMrn = formState.mrn.trim().toUpperCase();
    const trimmedStudy = formState.study.trim();

    if (!trimmedName || !trimmedMrn || !trimmedStudy) {
      setSnackbar({
        open: true,
        message: 'Patient name, MRN, and study are required.',
        severity: 'error',
      });
      return;
    }

    const payload: ImagingOrder = {
      id: editingOrder?.id ?? `rad-ord-${Date.now()}`,
      patientName: trimmedName,
      mrn: trimmedMrn,
      ageGender: formState.ageGender.trim() || '-',
      modality: formState.modality,
      study: trimmedStudy,
      priority: formState.priority,
      validationState: formState.validationState,
      authorization: formState.authorization.trim() || 'Pending',
      clinicalCheck: formState.clinicalCheck.trim() || 'Pending',
      scheduledSlot: formState.scheduledSlot.trim() || 'TBD',
    };

    if (editingOrder) {
      dispatch(updateOrder({ id: editingOrder.id, changes: payload }));
      setSnackbar({ open: true, message: 'Order updated.', severity: 'success' });
    } else {
      dispatch(addOrder(payload));
      setSelectedOrderId(payload.id);
      setSnackbar({ open: true, message: 'Order created.', severity: 'success' });
    }

    setDialogOpen(false);
  };

  const handleSendToWorklist = () => {
    if (!selectedOrder) return;
    dispatch(moveOrderToWorklist({ id: selectedOrder.id }));
    setSnackbar({
      open: true,
      message: `Sent ${selectedOrder.patientName} to technician worklist.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Radiology Orders" subtitle={pageSubtitle} currentPageTitle="Radiology Orders">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Radiology Orders Console"
          description="Create imaging orders, validate prerequisites, and schedule scan slots before sending to the technician worklist."
          chips={[
            { label: 'Radiology', color: 'primary' },
            { label: 'Front Desk Workflow', variant: 'outlined' },
          ]}
          actions={
            <>
              <Button variant="outlined" startIcon={<LocalHospitalIcon />} onClick={openCreateDialog}>
                New Order
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!selectedOrder}
                onClick={handleSendToWorklist}
              >
                Send to Worklist
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Pending Validation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Selected Slot
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {selectedOrder?.scheduledSlot ?? '--'}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Order Queue"
              subtitle="Validate insurance, clinical checks, and scheduling readiness."
              action={
                <Button size="small" variant="text" startIcon={<AddIcon />} onClick={openCreateDialog}>
                  Add Order
                </Button>
              }
              sx={{ flex: 1 }}
            >
              <DataTable
                tableId="radiology-orders-console"
                rows={orders}
                columns={orderColumns}
                rowHeight={62}
                tableHeight={430}
                onRowClick={(params) => setSelectedOrderId(String(params.id))}
                toolbarConfig={{
                  title: 'Front Desk Orders',
                  showSavedViews: false,
                  showDensity: false,
                  showQuickFilter: true,
                  emptyCtaLabel: 'Add Order',
                  onEmptyCtaClick: openCreateDialog,
                }}
              />
            </WorkflowSectionCard>
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
            <WorkflowSectionCard
              title="Order Details"
              subtitle="Review validation checklist before sending to the technician queue."
              sx={{ flex: 1 }}
            >
              {selectedOrder ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14 }}>
                      {getInitials(selectedOrder.patientName)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedOrder.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedOrder.mrn} · {selectedOrder.modality}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Validation: ${selectedOrder.validationState}`}
                    color={validationColors[selectedOrder.validationState]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Priority: ${selectedOrder.priority}`}
                    color={priorityColors[selectedOrder.priority]}
                    variant="outlined"
                  />
                  <Chip size="small" label={`Authorization: ${selectedOrder.authorization}`} variant="outlined" />
                  <Chip size="small" label={`Clinical Check: ${selectedOrder.clinicalCheck}`} variant="outlined" />
                  <Typography variant="body2">1. Confirm authorization status.</Typography>
                  <Typography variant="body2">2. Complete clinical pre-check.</Typography>
                  <Typography variant="body2">3. Confirm slot and send to technician queue.</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={handleSendToWorklist}
                    >
                      Send to Worklist
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocalHospitalIcon />}
                      onClick={() => router.push(withMrn('/clinical/modules/radiant'))}
                    >
                      Open Workflow
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => openEditDialog(selectedOrder)}
                    >
                      Edit Order
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() =>
                        setConfirmAction({
                          title: 'Delete order?',
                          description: 'This removes the order from the queue.',
                          onConfirm: () => {
                            dispatch(removeOrder(selectedOrder.id));
                            setSnackbar({
                              open: true,
                              message: 'Order deleted.',
                              severity: 'info',
                            });
                          },
                        })
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">Select an order to review the checklist.</Alert>
              )}
            </WorkflowSectionCard>
          </Grid>
        </Grid>
      </Stack>

      <CommonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingOrder ? 'Edit Radiology Order' : 'New Radiology Order'}
        maxWidth="sm"
        content={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Patient"
              value={formState.mrn}
              onChange={(event) => handlePatientSelect(event.target.value)}
              helperText="Select a patient to auto-fill MRN and demographics."
            >
              {GLOBAL_PATIENTS.map((patient) => (
                <MenuItem key={patient.mrn} value={patient.mrn}>
                  {patient.name} · {patient.mrn}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Patient Name"
              value={formState.patientName}
              onChange={(event) => setFormState((prev) => ({ ...prev, patientName: event.target.value }))}
              required
            />
            <TextField
              label="MRN"
              value={formState.mrn}
              onChange={(event) => setFormState((prev) => ({ ...prev, mrn: event.target.value }))}
              required
            />
            <TextField
              label="Age / Gender"
              value={formState.ageGender}
              onChange={(event) => setFormState((prev) => ({ ...prev, ageGender: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Modality"
                fullWidth
                value={formState.modality}
                onChange={(event) => setFormState((prev) => ({ ...prev, modality: event.target.value }))}
              >
                {['MRI', 'CT', 'X-Ray', 'Ultrasound'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Priority"
                fullWidth
                value={formState.priority}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, priority: event.target.value as ImagingPriority }))
                }
              >
                {['Routine', 'Urgent', 'STAT'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Study"
              value={formState.study}
              onChange={(event) => setFormState((prev) => ({ ...prev, study: event.target.value }))}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Validation State"
                fullWidth
                value={formState.validationState}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    validationState: event.target.value as ValidationState,
                  }))
                }
              >
                {['Ready', 'Needs Authorization', 'Needs Clinical Review', 'Hold'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Scheduled Slot"
                fullWidth
                value={formState.scheduledSlot}
                onChange={(event) => setFormState((prev) => ({ ...prev, scheduledSlot: event.target.value }))}
              />
            </Stack>
            <TextField
              label="Authorization"
              value={formState.authorization}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorization: event.target.value }))}
            />
            <TextField
              label="Clinical Check"
              value={formState.clinicalCheck}
              onChange={(event) => setFormState((prev) => ({ ...prev, clinicalCheck: event.target.value }))}
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {editingOrder ? 'Save Changes' : 'Create Order'}
            </Button>
          </>
        }
      />

      <CommonDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel="Confirm"
        confirmColor="error"
        onConfirm={() => {
          confirmAction?.onConfirm();
          setConfirmAction(null);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
