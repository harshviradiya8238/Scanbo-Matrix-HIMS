'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Chip, InputAdornment, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  AddShoppingCart as AddShoppingCartIcon,
  DeleteOutline as DeleteOutlineIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import { OrderCatalogItem } from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useOpdData } from '@/src/store/opdHooks';

interface DraftOrderLine {
  id: string;
  catalogId: string;
  priority: 'Routine' | 'Urgent';
  instructions: string;
}

interface PlacedOrder {
  id: string;
  patientId: string;
  orderName: string;
  category: OrderCatalogItem['category'];
  priority: 'Routine' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  orderedAt: string;
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

export default function OpdOrdersPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const { encounters, orderCatalog, status: opdStatus, error: opdError } = useOpdData();
  const [selectedPatientId, setSelectedPatientId] = React.useState(encounters[0]?.id ?? '');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<'All' | OrderCatalogItem['category']>('All');
  const [draftLine, setDraftLine] = React.useState<DraftOrderLine>(() =>
    buildDefaultDraftLine(orderCatalog)
  );
  const [orderCart, setOrderCart] = React.useState<DraftOrderLine[]>([]);
  const [placedOrders, setPlacedOrders] = React.useState<PlacedOrder[]>([
    {
      id: 'placed-1',
      patientId: 'enc-1',
      orderName: 'HbA1c',
      category: 'Lab',
      priority: 'Routine',
      status: 'In Progress',
      orderedAt: '09:08 AM',
    },
    {
      id: 'placed-2',
      patientId: 'enc-3',
      orderName: 'ECG 12-Lead',
      category: 'Procedure',
      priority: 'Urgent',
      status: 'Pending',
      orderedAt: '09:35 AM',
    },
  ]);
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
    if (!draftLine.catalogId && orderCatalog.length > 0) {
      setDraftLine(buildDefaultDraftLine(orderCatalog));
    }
  }, [draftLine.catalogId, orderCatalog]);

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

  const filteredCatalog = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return orderCatalog.filter((item) => {
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesQuery = query.length === 0 || item.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, orderCatalog, search]);

  const patientOrders = React.useMemo(
    () => placedOrders.filter((order) => order.patientId === selectedPatientId),
    [placedOrders, selectedPatientId]
  );

  const pendingCount = patientOrders.filter((order) => order.status !== 'Completed').length;

  const updateDraftField = <K extends keyof DraftOrderLine>(
    field: K,
    value: DraftOrderLine[K]
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

  const handleAddToCart = () => {
    if (!draftLine.catalogId) return;

    const selectedCatalog = orderCatalog.find((item) => item.id === draftLine.catalogId);
    if (!selectedCatalog) return;

    setOrderCart((prev) => [
      ...prev,
      {
        ...draftLine,
        id: `line-${Date.now()}-${prev.length}`,
        priority: draftLine.priority || selectedCatalog.defaultPriority,
      },
    ]);

    setDraftLine((prev) => ({
      ...prev,
      instructions: '',
      priority: selectedCatalog.defaultPriority,
    }));
  };

  const handleRemoveCartItem = (lineId: string) => {
    setOrderCart((prev) => prev.filter((line) => line.id !== lineId));
  };

  const handlePlaceOrders = () => {
    if (!selectedPatient) return;
    if (orderCart.length === 0) {
      setSnackbar({ open: true, message: 'Order cart is empty.', severity: 'error' });
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrders: PlacedOrder[] = [];
    orderCart.forEach((line, index) => {
      const catalog = orderCatalog.find((item) => item.id === line.catalogId);
      if (!catalog) return;

      newOrders.push({
        id: `placed-${Date.now()}-${index}`,
        patientId: selectedPatient.id,
        orderName: catalog.name,
        category: catalog.category,
        priority: line.priority,
        status: 'Pending',
        orderedAt: now,
      });
    });

    setPlacedOrders((prev) => [...newOrders, ...prev]);
    setOrderCart([]);
    setSnackbar({
      open: true,
      message: `${newOrders.length} orders placed for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Clinical Orders" subtitle={pageSubtitle} currentPageTitle="Orders">
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
          activeStep="orders"
          title="OPD Orders and Services"
          description="Build an order cart, set urgency, and submit lab/radiology/procedure requests."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Go to Prescriptions', route: '/clinical/prescriptions' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Orders in Cart</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{orderCart.length}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Patient Pending Orders</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{pendingCount}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Total Placed (Today)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{placedOrders.length}</Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Order Entry</Typography>

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
                  onChange={(event) =>
                    updateDraftField('priority', event.target.value as 'Routine' | 'Urgent')
                  }
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
                  minRows={2}
                  value={draftLine.instructions}
                  onChange={(event) => updateDraftField('instructions', event.target.value)}
                />

                <Button variant="outlined" startIcon={<AddShoppingCartIcon />} onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button variant="contained" onClick={handlePlaceOrders}>Place Orders</Button>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Order Cart</Typography>
                {orderCart.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No orders in cart.</Typography>
                ) : (
                  orderCart.map((line) => {
                    const catalog = orderCatalog.find((item) => item.id === line.catalogId);
                    if (!catalog) return null;
                    return (
                      <Card key={line.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.7}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {catalog.name}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => handleRemoveCartItem(line.id)}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <Stack direction="row" spacing={0.75}>
                            <Chip size="small" variant="outlined" label={catalog.category} />
                            <Chip size="small" color={line.priority === 'Urgent' ? 'warning' : 'default'} label={line.priority} />
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Placed Orders</Typography>
                  {patientOrders.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No orders placed for selected patient.</Typography>
                  ) : (
                    patientOrders.map((order) => (
                      <Card key={order.id} variant="outlined" sx={{ p: 1.1, borderRadius: 1.5 }}>
                        <Stack spacing={0.45}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.orderName}</Typography>
                          <Stack direction="row" spacing={0.75}>
                            <Chip size="small" variant="outlined" label={order.category} />
                            <Chip size="small" color={order.priority === 'Urgent' ? 'warning' : 'default'} label={order.priority} />
                            <Chip
                              size="small"
                              color={
                                order.status === 'Completed'
                                  ? 'success'
                                  : order.status === 'In Progress'
                                  ? 'info'
                                  : 'default'
                              }
                              label={order.status}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">Ordered at {order.orderedAt}</Typography>
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
                      <Typography variant="caption" color="text.secondary">{selectedPatient.mrn} · {selectedPatient.department}</Typography>
                    </>
                  ) : null}
                  <Button
                    variant="outlined"
                    startIcon={<LocalPharmacyIcon />}
                    onClick={() => router.push(withMrn('/clinical/prescriptions'))}
                  >
                    Continue to Prescription
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<ScienceIcon />}
                    onClick={() => router.push(withMrn('/appointments/visit'))}
                  >
                    Back to Encounter
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
