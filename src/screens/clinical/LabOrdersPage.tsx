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
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import DataTable from '@/src/ui/components/organisms/DataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  LocalHospital as LocalHospitalIcon,
  Science as ScienceIcon,
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
  moveOrderToSamples,
  removeOrder,
  updateOrder,
} from '@/src/store/slices/labSlice';
import { LabOrder, LabOrderStatus, LabPriority } from '@/src/core/laboratory/types';

type OrderFormState = {
  patientName: string;
  mrn: string;
  ageGender: string;
  testPanel: string;
  specimenType: string;
  priority: LabPriority;
  status: LabOrderStatus;
  requestedAt: string;
  collectionWindow: string;
  orderingPhysician: string;
  department: string;
};

const priorityColors: Record<LabPriority, 'error' | 'warning' | 'default'> = {
  STAT: 'error',
  Urgent: 'warning',
  Routine: 'default',
};

const statusColors: Record<LabOrderStatus, 'default' | 'info' | 'warning' | 'success'> = {
  'Pending Collection': 'warning',
  Collected: 'info',
  'In Lab': 'default',
  Resulted: 'success',
};

const buildEmptyForm = (): OrderFormState => ({
  patientName: '',
  mrn: '',
  ageGender: '',
  testPanel: '',
  specimenType: 'Blood',
  priority: 'Routine',
  status: 'Pending Collection',
  requestedAt: '',
  collectionWindow: '',
  orderingPhysician: '',
  department: '',
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function LabOrdersPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.lab.orders);

  const [selectedOrderId, setSelectedOrderId] = React.useState(orders[0]?.id ?? '');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<LabOrder | null>(null);
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
  const [drawerOpen, setDrawerOpen] = React.useState(false);

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

  const pendingCount = orders.filter((order) => order.status === 'Pending Collection').length;
  const inLabCount = orders.filter((order) => order.status === 'In Lab').length;
  const totalCount = orders.length;

  const handleReviewOrder = React.useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  }, []);

  const orderColumns = React.useMemo<GridColDef<LabOrder>[]>(
    () => [
      {
        field: 'patientName',
        headerName: 'Patient',
        minWidth: 260,
        flex: 1.1,
        renderCell: (params: GridRenderCellParams<LabOrder>) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, py: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
              {getInitials(params.row.patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {params.row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }} noWrap>
                {params.row.mrn} · {params.row.ageGender}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'testPanel',
        headerName: 'Panel',
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'specimenType',
        headerName: 'Specimen',
        width: 130,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        renderCell: (params: GridRenderCellParams<LabOrder, LabPriority>) => (
          <Chip size="small" label={params.row.priority} color={priorityColors[params.row.priority]} />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params: GridRenderCellParams<LabOrder, LabOrderStatus>) => (
          <Chip size="small" label={params.row.status} color={statusColors[params.row.status]} variant="outlined" />
        ),
      },
      {
        field: 'requestedAt',
        headerName: 'Requested',
        width: 120,
      },
      {
        field: 'collectionWindow',
        headerName: 'Collection Window',
        width: 170,
      },
      {
        field: 'actions',
        headerName: 'Next',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<LabOrder>) => (
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={(event) => {
              event.stopPropagation();
              handleReviewOrder(String(params.id));
            }}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleReviewOrder]
  );

  const openCreateDialog = () => {
    setEditingOrder(null);
    setFormState(buildEmptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (order: LabOrder) => {
    setEditingOrder(order);
    setFormState({
      patientName: order.patientName,
      mrn: order.mrn,
      ageGender: order.ageGender,
      testPanel: order.testPanel,
      specimenType: order.specimenType,
      priority: order.priority,
      status: order.status,
      requestedAt: order.requestedAt,
      collectionWindow: order.collectionWindow,
      orderingPhysician: order.orderingPhysician,
      department: order.department,
    });
    setDialogOpen(true);
  };

  const handlePatientSelect = (mrn: string) => {
    const patient = GLOBAL_PATIENTS.find((entry) => entry.mrn === mrn);
    if (!patient) return;
    setFormState((prev) => ({
      ...prev,
      mrn: patient.mrn,
      patientName: patient.name,
      ageGender: patient.ageGender,
      orderingPhysician: patient.primaryDoctor,
      department: patient.department,
    }));
  };

  const handleSave = () => {
    if (!formState.patientName || !formState.mrn || !formState.testPanel) {
      setSnackbar({
        open: true,
        message: 'Patient name, MRN, and test panel are required.',
        severity: 'error',
      });
      return;
    }

    if (editingOrder) {
      dispatch(
        updateOrder({
          id: editingOrder.id,
          changes: {
            ...formState,
          },
        })
      );
      setSnackbar({ open: true, message: 'Order updated.', severity: 'success' });
    } else {
      const newOrder: LabOrder = {
        id: `lab-ord-${Date.now()}`,
        ...formState,
        status: formState.status || 'Pending Collection',
      };
      dispatch(addOrder(newOrder));
      setSnackbar({ open: true, message: 'Order created.', severity: 'success' });
      setSelectedOrderId(newOrder.id);
    }

    setDialogOpen(false);
  };

  const handleSendToCollection = () => {
    if (!selectedOrder) return;
    dispatch(moveOrderToSamples(selectedOrder.id));
    setSnackbar({
      open: true,
      message: `Sent ${selectedOrder.patientName} to collection queue.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Lab Orders" subtitle={pageSubtitle} currentPageTitle="Lab Orders">
      <Stack spacing={2}>
        <ModuleHeaderCard
          title="Laboratory Orders Console"
          description="Capture lab requests, prioritize collection, and route samples to the lab team."
          chips={[{ label: 'Laboratory', color: 'primary' }, { label: 'Front Desk Workflow', variant: 'outlined' }]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<ScienceIcon />}
                onClick={() => router.push(withMrn('/diagnostics/lab/samples'))}
              >
                Open Samples
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                New Order
              </Button>
            </>
          }
        />

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Pending Collection
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                In Lab
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {inLabCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: 'flex', minWidth: 0 }}>
            <WorkflowSectionCard
              title="Order Queue"
              subtitle="Click Review to open the details drawer."
              action={
                <Button size="small" variant="text" startIcon={<AddIcon />} onClick={openCreateDialog}>
                  Add Order
                </Button>
              }
              sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
            >
              <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
                <DataTable
                  tableId="lab-orders-console"
                  rows={orders}
                  columns={orderColumns}
                  rowHeight={88}
                  tableHeight={430}
                  onRowClick={(params) => handleReviewOrder(String(params.id))}
                  checkboxSelection={false}
                  toolbarConfig={{
                    title: 'Lab Orders',
                    showSavedViews: false,
                    showDensity: false,
                    showQuickFilter: true,
                    emptyCtaLabel: 'Add Order',
                    onEmptyCtaClick: openCreateDialog,
                  }}
                />
              </Box>
            </WorkflowSectionCard>
          </Grid>
        </Grid>
      </Stack>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transitionDuration={{ enter: 280, exit: 200 }}
        SlideProps={{
          easing: {
            enter: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
          },
        }}
        ModalProps={{
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            p: 2.5,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            boxShadow: '0px 24px 60px rgba(15, 23, 42, 0.18)',
          },
        }}
      >
        <Stack spacing={2.5} sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Order Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review, edit, and route to collection.
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          {selectedOrder ? (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 46, height: 46, bgcolor: 'primary.main', fontSize: 14 }}>
                    {getInitials(selectedOrder.patientName)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {selectedOrder.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedOrder.mrn} · {selectedOrder.ageGender}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedOrder.specimenType} · {selectedOrder.testPanel}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Priority: ${selectedOrder.priority}`}
                    color={priorityColors[selectedOrder.priority]}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Status: ${selectedOrder.status}`}
                    color={statusColors[selectedOrder.status]}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Requested
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedOrder.requestedAt || '--'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Collection Window
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedOrder.collectionWindow || '--'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Ordering Physician
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedOrder.orderingPhysician || '--'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedOrder.department || '--'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Actions
                </Typography>
                <Stack spacing={1.25}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    startIcon={<SendIcon />}
                    onClick={handleSendToCollection}
                  >
                    Send to Collection
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<LocalHospitalIcon />}
                    onClick={() => router.push(withMrn('/diagnostics/lab/samples'))}
                  >
                    Open Samples
                  </Button>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
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
                          description: 'This removes the lab order from the queue.',
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
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">Click Review on a row to open order details.</Alert>
          )}
        </Stack>
      </Drawer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Lab Order' : 'New Lab Order'}</DialogTitle>
        <DialogContent>
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
            <TextField
              label="Test Panel"
              value={formState.testPanel}
              onChange={(event) => setFormState((prev) => ({ ...prev, testPanel: event.target.value }))}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Specimen Type"
                fullWidth
                value={formState.specimenType}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, specimenType: event.target.value }))
                }
              >
                {['Blood', 'Urine', 'Swab', 'Stool'].map((option) => (
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
                  setFormState((prev) => ({ ...prev, priority: event.target.value as LabPriority }))
                }
              >
                {['STAT', 'Urgent', 'Routine'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Requested At"
                fullWidth
                value={formState.requestedAt}
                onChange={(event) => setFormState((prev) => ({ ...prev, requestedAt: event.target.value }))}
              />
              <TextField
                label="Collection Window"
                fullWidth
                value={formState.collectionWindow}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, collectionWindow: event.target.value }))
                }
              />
            </Stack>
            <TextField
              label="Ordering Physician"
              value={formState.orderingPhysician}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, orderingPhysician: event.target.value }))
              }
            />
            <TextField
              label="Department"
              value={formState.department}
              onChange={(event) => setFormState((prev) => ({ ...prev, department: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingOrder ? 'Save Changes' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)}>
        <DialogTitle>{confirmAction?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmAction?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirmAction?.onConfirm();
              setConfirmAction(null);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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
