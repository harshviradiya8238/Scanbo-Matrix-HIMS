'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { usePermission } from '@/src/core/auth/usePermission';
import {
  buildInventoryId,
  computePoStatusFromLines,
  getItemLabel,
  getNextPoNumber,
  InventoryState,
  PurchaseOrderLine,
  PurchaseOrderRecord,
  PurchaseOrderStatus,
  readInventoryState,
  writeInventoryState,
} from '@/src/core/inventory/inventoryStore';
import {
  Approval as ApprovalIcon,
  LocalShipping as LocalShippingIcon,
  PendingActions as PendingActionsIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

type PoFilter = 'All' | PurchaseOrderStatus;
type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

interface PoDraft {
  vendor: string;
  expectedDeliveryDate: string;
  notes: string;
}

interface PoLineDraft {
  itemId: string;
  quantityOrdered: string;
  unitCost: string;
}

interface ToastState {
  open: boolean;
  msg: string;
  severity: ToastSeverity;
}

const DEFAULT_PO_DRAFT: PoDraft = {
  vendor: '',
  expectedDeliveryDate: '',
  notes: '',
};

const DEFAULT_LINE_DRAFT: PoLineDraft = {
  itemId: '',
  quantityOrdered: '',
  unitCost: '',
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '--';
  return dateFormatter.format(parsed);
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function statusColor(status: PurchaseOrderStatus): 'default' | 'warning' | 'info' | 'success' | 'error' {
  if (status === 'Draft') return 'default';
  if (status === 'Pending Approval') return 'warning';
  if (status === 'Approved') return 'info';
  if (status === 'Sent to Vendor') return 'info';
  if (status === 'Partially Received') return 'warning';
  if (status === 'Closed') return 'success';
  return 'error';
}

export default function InventoryPurchaseOrdersPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const permissionGate = usePermission();

  const canRead = permissionGate('inventory.purchase.write') || permissionGate('inventory.*');
  const canWrite = permissionGate('inventory.purchase.write') || permissionGate('inventory.*');

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(() => readInventoryState());
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<PoFilter>('All');
  const [selectedPoId, setSelectedPoId] = React.useState('');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [poDraft, setPoDraft] = React.useState<PoDraft>(DEFAULT_PO_DRAFT);
  const [lineDraft, setLineDraft] = React.useState<PoLineDraft>(DEFAULT_LINE_DRAFT);
  const [draftLines, setDraftLines] = React.useState<PurchaseOrderLine[]>([]);

  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: '',
    severity: 'success',
  });

  React.useEffect(() => {
    writeInventoryState(inventoryState);
  }, [inventoryState]);

  const notify = React.useCallback((msg: string, severity: ToastSeverity = 'success') => {
    setToast({ open: true, msg, severity });
  }, []);

  const activeItems = React.useMemo(
    () => inventoryState.items.filter((item) => item.status === 'Active'),
    [inventoryState.items]
  );

  const filteredPo = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...inventoryState.purchaseOrders]
      .filter((po) => {
        if (filter !== 'All' && po.status !== filter) return false;
        if (!q) return true;

        return (
          po.poNumber.toLowerCase().includes(q) ||
          po.vendor.toLowerCase().includes(q) ||
          po.status.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [filter, inventoryState.purchaseOrders, search]);

  React.useEffect(() => {
    if (!filteredPo.length) {
      setSelectedPoId('');
      return;
    }

    if (!filteredPo.some((po) => po.id === selectedPoId)) {
      setSelectedPoId(filteredPo[0].id);
    }
  }, [filteredPo, selectedPoId]);

  React.useEffect(() => {
    const prefillItemId = searchParams.get('item');
    if (!prefillItemId) return;
    if (!activeItems.some((item) => item.id === prefillItemId)) return;

    setDialogOpen(true);
    setLineDraft((prev) => ({ ...prev, itemId: prefillItemId }));
  }, [activeItems, searchParams]);

  const selectedPo = filteredPo.find((po) => po.id === selectedPoId) ?? null;

  const pendingApproval = inventoryState.purchaseOrders.filter(
    (po) => po.status === 'Pending Approval'
  ).length;
  const sentCount = inventoryState.purchaseOrders.filter((po) => po.status === 'Sent to Vendor').length;
  const partialCount = inventoryState.purchaseOrders.filter(
    (po) => po.status === 'Partially Received'
  ).length;
  const closedCount = inventoryState.purchaseOrders.filter((po) => po.status === 'Closed').length;
  const totalOpenValue = inventoryState.purchaseOrders
    .filter((po) => !['Closed', 'Cancelled'].includes(po.status))
    .reduce(
      (sum, po) =>
        sum +
        po.lines.reduce((lineSum, line) => lineSum + line.quantityOrdered * line.unitCost, 0),
      0
    );

  const openCreate = () => {
    if (!canWrite) {
      notify('You are in read-only mode for PO updates.', 'warning');
      return;
    }

    setPoDraft(DEFAULT_PO_DRAFT);
    setLineDraft(DEFAULT_LINE_DRAFT);
    setDraftLines([]);
    setDialogOpen(true);
  };

  const closeCreate = () => {
    setDialogOpen(false);
    setPoDraft(DEFAULT_PO_DRAFT);
    setLineDraft(DEFAULT_LINE_DRAFT);
    setDraftLines([]);
  };

  const addLine = () => {
    const item = activeItems.find((entry) => entry.id === lineDraft.itemId);
    if (!item) {
      notify('Select a valid item to add line.', 'warning');
      return;
    }

    const qty = Number(lineDraft.quantityOrdered);
    const cost = Number(lineDraft.unitCost || item.unitCost);

    if (!Number.isFinite(qty) || qty <= 0) {
      notify('Quantity must be greater than zero.', 'warning');
      return;
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      notify('Unit cost must be greater than zero.', 'warning');
      return;
    }

    setDraftLines((prev) => [
      ...prev,
      {
        id: buildInventoryId('po-line'),
        itemId: item.id,
        itemLabel: getItemLabel(item),
        quantityOrdered: qty,
        quantityReceived: 0,
        unitCost: cost,
      },
    ]);
    setLineDraft(DEFAULT_LINE_DRAFT);
  };

  const removeLine = (lineId: string) => {
    setDraftLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const createPo = () => {
    if (!canWrite) {
      notify('You are in read-only mode for PO updates.', 'warning');
      return;
    }

    if (!poDraft.vendor.trim()) {
      notify('Vendor is required.', 'warning');
      return;
    }

    if (draftLines.length === 0) {
      notify('Add at least one PO line.', 'warning');
      return;
    }

    const po: PurchaseOrderRecord = {
      id: buildInventoryId('po'),
      poNumber: getNextPoNumber(inventoryState.purchaseOrders),
      vendor: poDraft.vendor.trim(),
      status: 'Draft',
      expectedDeliveryDate: poDraft.expectedDeliveryDate || '',
      requestedBy: 'Inventory Desk',
      createdAt: new Date().toISOString(),
      notes: poDraft.notes.trim(),
      lines: draftLines,
      history: [
        {
          id: buildInventoryId('po-h'),
          at: new Date().toISOString(),
          actor: 'Inventory Desk',
          action: 'PO drafted',
        },
      ],
    };

    setInventoryState((prev) => ({
      ...prev,
      purchaseOrders: [po, ...prev.purchaseOrders],
    }));

    setSelectedPoId(po.id);
    closeCreate();
    notify(`Purchase order ${po.poNumber} created.`, 'success');
  };

  const updatePoStatus = (
    poId: string,
    status: PurchaseOrderStatus,
    actor: string,
    note?: string
  ) => {
    if (!canWrite) {
      notify('You are in read-only mode for PO updates.', 'warning');
      return;
    }

    setInventoryState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((po) => {
        if (po.id !== poId) return po;

        const nextStatus = computePoStatusFromLines(status, po.lines);

        return {
          ...po,
          status: nextStatus,
          approvedBy: status === 'Approved' ? actor : po.approvedBy,
          history: [
            ...po.history,
            {
              id: buildInventoryId('po-h'),
              at: new Date().toISOString(),
              actor,
              action: `Status changed to ${nextStatus}`,
              note,
            },
          ],
        };
      }),
    }));

    notify(`PO updated to ${status}.`, 'success');
  };

  const poTotal = (po: PurchaseOrderRecord): number =>
    po.lines.reduce((sum, line) => sum + line.quantityOrdered * line.unitCost, 0);

  const metricTiles = [
    {
      label: 'Pending Approval',
      value: pendingApproval,
      subtitle: 'Awaiting supervisor',
      icon: <PendingActionsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Sent to Vendor',
      value: sentCount,
      subtitle: 'Order dispatched',
      icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Partially Received',
      value: partialCount,
      subtitle: 'GRN pending lines',
      icon: <ApprovalIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Closed',
      value: closedCount,
      subtitle: 'Completed procurement',
      icon: <PlaylistAddCheckIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Open PO Value',
      value: formatCurrency(totalOpenValue),
      subtitle: 'Unclosed order amount',
      icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <PageTemplate
      title="Purchase Orders"
      subtitle="Procurement workflow: draft, approval, vendor dispatch, and GRN-linked closure."
      currentPageTitle="Purchase Orders"
      fullHeight
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!canRead ? (
          <Alert severity="error">
            You do not have access to Purchase Orders. Request `inventory.purchase.write`.
          </Alert>
        ) : null}

        {canRead ? (
          <>
            {!canWrite ? <Alert severity="info">You are in read-only mode for PO workflow.</Alert> : null}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                  xl: 'repeat(5, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {metricTiles.map((tile) => (
                <StatTile
                  key={tile.label}
                  label={tile.label}
                  value={tile.value}
                  subtitle={tile.subtitle}
                  icon={tile.icon}
                  variant="soft"
                />
              ))}
            </Box>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 1.2,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Search by PO number / vendor"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ width: { xs: '100%', md: 320 } }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value as PoFilter)}
                    sx={{ width: { xs: '100%', md: 220 } }}
                  >
                    {([
                      'All',
                      'Draft',
                      'Pending Approval',
                      'Approved',
                      'Sent to Vendor',
                      'Partially Received',
                      'Closed',
                      'Cancelled',
                    ] as const).map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ flex: 1 }} />
                  <Button variant="contained" onClick={openCreate}>
                    + New PO
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '500px minmax(0, 1fr)' },
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    borderRight: { lg: '1px solid' },
                    borderBottom: { xs: '1px solid', lg: 'none' },
                    borderColor: 'divider',
                    minHeight: 0,
                    overflow: 'hidden',
                  }}
                >
                  <TableContainer sx={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>PO Number</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Expected</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPo.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Alert severity="info">No purchase orders match current filters.</Alert>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPo.map((po) => (
                            <TableRow
                              key={po.id}
                              hover
                              selected={po.id === selectedPo?.id}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => setSelectedPoId(po.id)}
                            >
                              <TableCell sx={{ fontWeight: 700 }}>{po.poNumber}</TableCell>
                              <TableCell>{po.vendor}</TableCell>
                              <TableCell>
                                <Chip size="small" label={po.status} color={statusColor(po.status)} />
                              </TableCell>
                              <TableCell>{po.expectedDeliveryDate || '--'}</TableCell>
                              <TableCell>{formatCurrency(poTotal(po))}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box
                  sx={{
                    p: 1.2,
                    minHeight: 0,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 99 },
                  }}
                >
                  {!selectedPo ? (
                    <Alert severity="info">Select a purchase order to view details.</Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 1.8,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.18),
                          p: 1.1,
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {selectedPo.poNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                              Vendor: {selectedPo.vendor}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                              Requested by: {selectedPo.requestedBy} - {formatDateTime(selectedPo.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                              Expected delivery: {selectedPo.expectedDeliveryDate || '--'}
                            </Typography>
                          </Box>
                          <Chip size="small" label={selectedPo.status} color={statusColor(selectedPo.status)} />
                        </Stack>

                        {selectedPo.notes ? (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            {selectedPo.notes}
                          </Alert>
                        ) : null}

                        <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={selectedPo.status !== 'Draft' || !canWrite}
                            onClick={() =>
                              updatePoStatus(
                                selectedPo.id,
                                'Pending Approval',
                                'Inventory Desk',
                                'Submitted for supervisor approval.'
                              )
                            }
                          >
                            Submit for Approval
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={selectedPo.status !== 'Pending Approval' || !canWrite}
                            onClick={() =>
                              updatePoStatus(
                                selectedPo.id,
                                'Approved',
                                'Inventory Supervisor',
                                'Approved after budget and vendor checks.'
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            disabled={selectedPo.status !== 'Approved' || !canWrite}
                            onClick={() =>
                              updatePoStatus(
                                selectedPo.id,
                                'Sent to Vendor',
                                'Inventory Desk',
                                'Dispatched to vendor for fulfillment.'
                              )
                            }
                          >
                            Send to Vendor
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={
                              ['Closed', 'Cancelled', 'Partially Received'].includes(selectedPo.status) ||
                              !canWrite
                            }
                            onClick={() =>
                              updatePoStatus(
                                selectedPo.id,
                                'Cancelled',
                                'Inventory Supervisor',
                                'Cancelled due to operational decision.'
                              )
                            }
                          >
                            Cancel PO
                          </Button>
                        </Stack>
                      </Card>

                      <Card
                        elevation={0}
                        sx={{ borderRadius: 1.8, border: '1px solid', borderColor: 'divider', p: 1.1 }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                          PO Lines
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Ordered</TableCell>
                                <TableCell>Received</TableCell>
                                <TableCell>Pending</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedPo.lines.map((line) => (
                                <TableRow key={line.id}>
                                  <TableCell sx={{ fontWeight: 700 }}>{line.itemLabel}</TableCell>
                                  <TableCell>{line.quantityOrdered}</TableCell>
                                  <TableCell>{line.quantityReceived}</TableCell>
                                  <TableCell>{Math.max(0, line.quantityOrdered - line.quantityReceived)}</TableCell>
                                  <TableCell>{formatCurrency(line.unitCost)}</TableCell>
                                  <TableCell>{formatCurrency(line.quantityOrdered * line.unitCost)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography variant="subtitle2" sx={{ textAlign: 'right', mt: 0.8, fontWeight: 800 }}>
                          Total: {formatCurrency(poTotal(selectedPo))}
                        </Typography>
                      </Card>

                      <Card
                        elevation={0}
                        sx={{ borderRadius: 1.8, border: '1px solid', borderColor: 'divider', p: 1.1 }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                          Status History
                        </Typography>
                        <Stack spacing={0.7}>
                          {selectedPo.history.map((entry) => (
                            <Card
                              key={entry.id}
                              elevation={0}
                              sx={{
                                borderRadius: 1.4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.16),
                                px: 0.9,
                                py: 0.7,
                              }}
                            >
                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.6}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.action}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                  {entry.actor} - {formatDateTime(entry.at)}
                                </Typography>
                              </Stack>
                              {entry.note ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: 0.2, display: 'block' }}
                                >
                                  {entry.note}
                                </Typography>
                              ) : null}
                            </Card>
                          ))}
                        </Stack>
                      </Card>
                    </Stack>
                  )}
                </Box>
              </Box>
            </Card>
          </>
        ) : null}
      </Stack>

      <Dialog open={dialogOpen} onClose={closeCreate} fullWidth maxWidth="md">
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                fullWidth
                label="Vendor"
                size="small"
                value={poDraft.vendor}
                onChange={(event) => setPoDraft((prev) => ({ ...prev, vendor: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Expected Delivery"
                type="date"
                size="small"
                value={poDraft.expectedDeliveryDate}
                InputLabelProps={{ shrink: true }}
                onChange={(event) =>
                  setPoDraft((prev) => ({ ...prev, expectedDeliveryDate: event.target.value }))
                }
              />
            </Stack>

            <TextField
              label="Notes"
              size="small"
              multiline
              minRows={2}
              value={poDraft.notes}
              onChange={(event) => setPoDraft((prev) => ({ ...prev, notes: event.target.value }))}
            />

            <Card elevation={0} sx={{ borderRadius: 1.6, border: '1px solid', borderColor: 'divider', p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.7 }}>
                Add Line Item
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Item"
                  value={lineDraft.itemId}
                  onChange={(event) =>
                    setLineDraft((prev) => ({ ...prev, itemId: event.target.value }))
                  }
                >
                  {activeItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.itemCode} - {getItemLabel(item)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Quantity"
                  value={lineDraft.quantityOrdered}
                  onChange={(event) =>
                    setLineDraft((prev) => ({ ...prev, quantityOrdered: event.target.value }))
                  }
                />

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Unit Cost"
                  value={lineDraft.unitCost}
                  onChange={(event) =>
                    setLineDraft((prev) => ({ ...prev, unitCost: event.target.value }))
                  }
                />

                <Button variant="contained" onClick={addLine}>
                  Add
                </Button>
              </Stack>

              <Stack spacing={0.6} sx={{ mt: 0.9 }}>
                {draftLines.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No lines added yet.
                  </Typography>
                ) : (
                  draftLines.map((line) => (
                    <Stack
                      key={line.id}
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={0.8}
                      alignItems={{ md: 'center' }}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.3,
                        px: 0.8,
                        py: 0.55,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
                        {line.itemLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qty: {line.quantityOrdered}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rate: {formatCurrency(line.unitCost)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Amount: {formatCurrency(line.quantityOrdered * line.unitCost)}
                      </Typography>
                      <Button size="small" color="error" onClick={() => removeLine(line.id)}>
                        Remove
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreate}>Cancel</Button>
          <Button variant="contained" onClick={createPo}>
            Create PO
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
