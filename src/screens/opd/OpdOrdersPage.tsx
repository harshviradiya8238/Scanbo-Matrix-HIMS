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
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { useAppDispatch } from '@/src/store/hooks';
import {
  addEncounterOrder,
  removeEncounterOrder,
  updateEncounter,
  updateEncounterOrder,
} from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import { OrderCatalogItem } from './opd-mock-data';
import {
  buildEncounterPrescriptionsRoute,
  buildEncounterRoute,
  resolveEncounterFromState,
} from './opd-encounter';
import OpdLayout from './components/OpdLayout';
import OpdTable from './components/OpdTable';

interface OpdOrdersPageProps {
  encounterId?: string;
}

interface DraftOrderLine {
  id: string;
  catalogId: string;
  priority: 'Routine' | 'Urgent';
  instructions: string;
}

function buildDefaultDraftLine(orderCatalog: OrderCatalogItem[]): DraftOrderLine {
  const first = orderCatalog[0];
  return {
    id: `line-${Date.now()}`,
    catalogId: first?.id ?? '',
    priority: first?.defaultPriority ?? 'Routine',
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

export default function OpdOrdersPage({ encounterId }: OpdOrdersPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const mrnParam = useMrnParam();
  const {
    encounters,
    orders,
    orderCatalog,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const encounter = React.useMemo(
    () => resolveEncounterFromState(encounters, { encounterId, mrn: mrnParam }),
    [encounters, encounterId, mrnParam]
  );

  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<'All' | OrderCatalogItem['category']>('All');
  const [draftLine, setDraftLine] = React.useState<DraftOrderLine>(() => buildDefaultDraftLine(orderCatalog));
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(null);
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
    if (!draftLine.catalogId && orderCatalog.length > 0) {
      setDraftLine(buildDefaultDraftLine(orderCatalog));
    }
  }, [draftLine.catalogId, orderCatalog]);

  const subtitle = formatPatientLabel(encounter?.patientName, encounter?.mrn);

  const filteredCatalog = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return orderCatalog.filter((item) => {
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesQuery = query.length === 0 || item.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, orderCatalog, search]);

  const encounterOrders = React.useMemo(
    () => orders.filter((item) => item.encounterId === encounter?.id),
    [orders, encounter?.id]
  );

  const updateDraftField = <K extends keyof DraftOrderLine>(
    field: K,
    value: DraftOrderLine[K]
  ) => {
    setDraftLine((prev) => ({ ...prev, [field]: value }));
  };

  const resetDraft = React.useCallback(() => {
    setDraftLine(buildDefaultDraftLine(orderCatalog));
    setEditingOrderId(null);
  }, [orderCatalog]);

  const handleEditOrder = (orderId: string) => {
    const selectedOrder = encounterOrders.find((item) => item.id === orderId);
    if (!selectedOrder) return;

    const matchingCatalog = orderCatalog.find(
      (item) => item.name === selectedOrder.orderName && item.category === selectedOrder.category
    );

    setCategoryFilter(selectedOrder.category);
    setDraftLine({
      id: `line-edit-${Date.now()}`,
      catalogId: matchingCatalog?.id ?? orderCatalog[0]?.id ?? '',
      priority: selectedOrder.priority,
      instructions: selectedOrder.instructions,
    });
    setEditingOrderId(selectedOrder.id);
  };

  const handleDeleteOrder = (orderId: string) => {
    dispatch(removeEncounterOrder(orderId));
    if (editingOrderId === orderId) {
      resetDraft();
    }
    setSnackbar({
      open: true,
      message: 'Order removed successfully.',
      severity: 'success',
    });
  };

  const handleSaveOrder = () => {
    if (!encounter) return;

    const selectedCatalog = orderCatalog.find((item) => item.id === draftLine.catalogId);
    if (!selectedCatalog) {
      setSnackbar({ open: true, message: 'Select an order from catalog.', severity: 'error' });
      return;
    }

    const orderedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingOrderId) {
      dispatch(
        updateEncounterOrder({
          id: editingOrderId,
          changes: {
            orderName: selectedCatalog.name,
            category: selectedCatalog.category,
            priority: draftLine.priority,
            instructions: draftLine.instructions,
            orderedAt,
          },
        })
      );
      resetDraft();
      setSnackbar({ open: true, message: 'Order updated successfully.', severity: 'success' });
      return;
    }

    dispatch(
      addEncounterOrder({
        id: `order-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        orderName: selectedCatalog.name,
        category: selectedCatalog.category,
        priority: draftLine.priority,
        status: 'Pending',
        instructions: draftLine.instructions,
        orderedAt,
      })
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );

    resetDraft();
    setSnackbar({
      open: true,
      message: 'Order added successfully.',
      severity: 'success',
    });
  };

  if (!encounter) {
    return (
      <OpdLayout title="Encounter Orders" subtitle={mrnParam ? `MRN ${mrnParam}` : undefined} currentPageTitle="Orders">
        <Alert severity="error">Orders require an encounter context. Start from Queue and open a consultation.</Alert>
      </OpdLayout>
    );
  }

  return (
    <OpdLayout title="Encounter Orders" subtitle={subtitle} currentPageTitle="Orders">
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
          background: `linear-gradient(115deg, ${alpha(theme.palette.info.main, 0.16)} 0%, ${theme.palette.background.paper} 38%)`,
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
              Clinical Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add lab, radiology, and procedure orders under encounter {encounter.id}.
            </Typography>
            <Stack direction="row" spacing={0.7} flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip size="small" label={`Patient ${encounter.patientName}`} color="primary" />
              <Chip size="small" label={encounter.status.replace('_', ' ')} variant="outlined" />
              <Chip size="small" label={`${encounterOrders.length} placed`} variant="outlined" />
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={() => router.push(buildEncounterRoute(encounter.id))}>
              Back to Consultation
            </Button>
            <Button
              variant="contained"
              startIcon={<LocalPharmacyIcon />}
              onClick={() => router.push(buildEncounterPrescriptionsRoute(encounter.id))}
            >
              Continue to Prescriptions
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
                  Order Entry
                </Typography>

                <TextField
                  size="small"
                  placeholder="Search order catalog..."
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

                <TextField
                  select
                  label="Category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as 'All' | OrderCatalogItem['category'])}
                >
                  {['All', 'Lab', 'Radiology', 'Procedure'].map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Order"
                  value={draftLine.catalogId}
                  onChange={(event) => updateDraftField('catalogId', event.target.value)}
                >
                  {filteredCatalog.map((catalog) => (
                    <MenuItem key={catalog.id} value={catalog.id}>
                      {catalog.name} ({catalog.category})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Priority"
                  value={draftLine.priority}
                  onChange={(event) => updateDraftField('priority', event.target.value as 'Routine' | 'Urgent')}
                >
                  {['Routine', 'Urgent'].map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Instructions"
                  multiline
                  minRows={3}
                  value={draftLine.instructions}
                  onChange={(event) => updateDraftField('instructions', event.target.value)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="outlined" onClick={resetDraft}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveOrder}>
                    {editingOrderId ? 'Update Order' : 'Add Order'}
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Order List
            </Typography>
            <OpdTable
              rows={encounterOrders}
              emptyMessage="No orders have been placed for this encounter."
              rowKey={(row) => row.id}
              variant="plain"
              columns={[
                { id: 'name', label: 'Order', render: (row) => row.orderName },
                { id: 'category', label: 'Category', render: (row) => row.category },
                { id: 'priority', label: 'Priority', render: (row) => row.priority },
                { id: 'status', label: 'Status', render: (row) => row.status },
                { id: 'at', label: 'Ordered At', render: (row) => row.orderedAt },
                {
                  id: 'actions',
                  label: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <IconButton size="small" aria-label="Edit order" onClick={() => handleEditOrder(row.id)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete order"
                        color="error"
                        onClick={() => handleDeleteOrder(row.id)}
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
