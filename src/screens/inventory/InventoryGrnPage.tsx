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
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import { usePermission } from '@/src/core/auth/usePermission';
import {
  buildInventoryId,
  computePoStatusFromLines,
  getNextGrnNumber,
  GrnLine,
  GrnRecord,
  InventoryState,
  nowIso,
  PurchaseOrderRecord,
  readInventoryState,
  writeInventoryState,
} from '@/src/core/inventory/inventoryStore';
import {
  FactCheck as FactCheckIcon,
  Inventory2 as Inventory2Icon,
  LocalShipping as LocalShippingIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

interface ToastState {
  open: boolean;
  msg: string;
  severity: ToastSeverity;
}

interface GrnLineDraft {
  acceptedQty: string;
  rejectedQty: string;
  batchNo: string;
  expiryDate: string;
  location: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '--';
  return dateFormatter.format(parsed);
}

function createEmptyLineDraft(): GrnLineDraft {
  return {
    acceptedQty: '',
    rejectedQty: '',
    batchNo: '',
    expiryDate: '',
    location: '',
  };
}

function poStatusColor(status: string): 'default' | 'warning' | 'info' | 'success' | 'error' {
  if (status === 'Draft') return 'default';
  if (status === 'Pending Approval') return 'warning';
  if (status === 'Approved' || status === 'Sent to Vendor') return 'info';
  if (status === 'Partially Received') return 'warning';
  if (status === 'Closed') return 'success';
  return 'error';
}

function getEligiblePo(purchaseOrders: PurchaseOrderRecord[]): PurchaseOrderRecord[] {
  return purchaseOrders.filter((po) =>
    ['Approved', 'Sent to Vendor', 'Partially Received'].includes(po.status)
  );
}

export default function InventoryGrnPage() {
  const theme = useTheme();
  const permissionGate = usePermission();

  const canRead = permissionGate('inventory.grn.write') || permissionGate('inventory.*');
  const canWrite = permissionGate('inventory.grn.write') || permissionGate('inventory.*');

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(() => readInventoryState());
  const [selectedPoId, setSelectedPoId] = React.useState('');
  const [invoiceNo, setInvoiceNo] = React.useState('');
  const [receivedBy, setReceivedBy] = React.useState('Store Receiver');
  const [notes, setNotes] = React.useState('');
  const [lineDraftById, setLineDraftById] = React.useState<Record<string, GrnLineDraft>>({});

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

  const eligiblePo = React.useMemo(
    () => getEligiblePo(inventoryState.purchaseOrders).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [inventoryState.purchaseOrders]
  );

  React.useEffect(() => {
    if (!eligiblePo.length) {
      setSelectedPoId('');
      return;
    }

    if (!eligiblePo.some((po) => po.id === selectedPoId)) {
      setSelectedPoId(eligiblePo[0].id);
    }
  }, [eligiblePo, selectedPoId]);

  const selectedPo = eligiblePo.find((po) => po.id === selectedPoId) ?? null;

  React.useEffect(() => {
    if (!selectedPo) {
      setLineDraftById({});
      return;
    }

    const next: Record<string, GrnLineDraft> = {};
    selectedPo.lines.forEach((line) => {
      next[line.id] = createEmptyLineDraft();
    });
    setLineDraftById(next);
  }, [selectedPoId]);

  const pendingLines = selectedPo
    ? selectedPo.lines
        .map((line) => ({ ...line, pending: Math.max(0, line.quantityOrdered - line.quantityReceived) }))
        .filter((line) => line.pending > 0)
    : [];

  const openPoCount = eligiblePo.length;
  const grnToday = inventoryState.grns.filter((grn) => {
    const today = new Date();
    const date = new Date(grn.receivedAt);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  }).length;
  const totalReceivedUnits = inventoryState.grns.reduce(
    (sum, grn) => sum + grn.lines.reduce((lineSum, line) => lineSum + line.acceptedQty, 0),
    0
  );
  const totalRejectedUnits = inventoryState.grns.reduce(
    (sum, grn) => sum + grn.lines.reduce((lineSum, line) => lineSum + line.rejectedQty, 0),
    0
  );

  const postGrn = () => {
    if (!selectedPo) return;

    if (!canWrite) {
      notify('You are in read-only mode for GRN updates.', 'warning');
      return;
    }

    if (!invoiceNo.trim()) {
      notify('Invoice number is required.', 'warning');
      return;
    }

    const linesToPost: GrnLine[] = [];

    for (const line of pendingLines) {
      const draft = lineDraftById[line.id] ?? createEmptyLineDraft();
      const acceptedQty = Number(draft.acceptedQty || 0);
      const rejectedQty = Number(draft.rejectedQty || 0);
      const total = acceptedQty + rejectedQty;

      if (!Number.isFinite(acceptedQty) || acceptedQty < 0) {
        notify(`Invalid accepted qty for ${line.itemLabel}.`, 'warning');
        return;
      }
      if (!Number.isFinite(rejectedQty) || rejectedQty < 0) {
        notify(`Invalid rejected qty for ${line.itemLabel}.`, 'warning');
        return;
      }
      if (total > line.pending) {
        notify(`Accepted + rejected exceeds pending qty for ${line.itemLabel}.`, 'warning');
        return;
      }

      if (total === 0) continue;

      if (acceptedQty > 0 && (!draft.batchNo.trim() || !draft.expiryDate || !draft.location.trim())) {
        notify(`Batch, expiry, and location are required for accepted qty (${line.itemLabel}).`, 'warning');
        return;
      }

      linesToPost.push({
        id: buildInventoryId('grn-line'),
        itemId: line.itemId,
        itemLabel: line.itemLabel,
        acceptedQty,
        rejectedQty,
        batchNo: draft.batchNo.trim(),
        expiryDate: draft.expiryDate,
        location: draft.location.trim(),
        unitCost: line.unitCost,
      });
    }

    if (linesToPost.length === 0) {
      notify('Enter at least one received or rejected quantity before posting GRN.', 'warning');
      return;
    }

    const grn: GrnRecord = {
      id: buildInventoryId('grn'),
      grnNumber: getNextGrnNumber(inventoryState.grns),
      poId: selectedPo.id,
      poNumber: selectedPo.poNumber,
      vendor: selectedPo.vendor,
      invoiceNo: invoiceNo.trim(),
      receivedBy: receivedBy.trim() || 'Store Receiver',
      receivedAt: nowIso(),
      notes: notes.trim(),
      lines: linesToPost,
    };

    setInventoryState((prev) => {
      const purchaseOrders = prev.purchaseOrders.map((po) => {
        if (po.id !== selectedPo.id) return po;

        const lines = po.lines.map((line) => {
          const postedLine = linesToPost.find((entry) => entry.itemId === line.itemId);
          if (!postedLine) return line;

          return {
            ...line,
            quantityReceived:
              line.quantityReceived + postedLine.acceptedQty + postedLine.rejectedQty,
          };
        });

        const computedStatus = computePoStatusFromLines(po.status, lines);

        return {
          ...po,
          lines,
          status: computedStatus,
          history: [
            ...po.history,
            {
              id: buildInventoryId('po-h'),
              at: nowIso(),
              actor: receivedBy.trim() || 'Store Receiver',
              action: `GRN posted (${grn.grnNumber})`,
              note: `${linesToPost.length} lines processed.`,
            },
          ],
        };
      });

      const stock = [...prev.stock];
      linesToPost.forEach((line) => {
        if (line.acceptedQty <= 0) return;

        const existingIndex = stock.findIndex((entry) => entry.itemId === line.itemId);
        if (existingIndex >= 0) {
          stock[existingIndex] = {
            ...stock[existingIndex],
            onHand: stock[existingIndex].onHand + line.acceptedQty,
            location: line.location || stock[existingIndex].location,
            nextExpiry: line.expiryDate || stock[existingIndex].nextExpiry,
            updatedAt: nowIso(),
          };
        } else {
          stock.push({
            id: buildInventoryId('stk'),
            itemId: line.itemId,
            onHand: line.acceptedQty,
            reserved: 0,
            location: line.location || 'MAIN-STORE',
            nextExpiry: line.expiryDate,
            updatedAt: nowIso(),
          });
        }
      });

      return {
        ...prev,
        purchaseOrders,
        stock,
        grns: [grn, ...prev.grns],
      };
    });

    setInvoiceNo('');
    setNotes('');
    setLineDraftById({});
    notify(`GRN ${grn.grnNumber} posted successfully.`, 'success');
  };

  const metricTiles = [
    {
      label: 'PO Awaiting GRN',
      value: openPoCount,
      subtitle: 'Eligible for receipt',
      icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'GRN Today',
      value: grnToday,
      subtitle: 'Posted on current date',
      icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Units Received',
      value: totalReceivedUnits,
      subtitle: 'Accepted stock units',
      icon: <Inventory2Icon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Units Rejected',
      value: totalRejectedUnits,
      subtitle: 'QC / damage units',
      icon: <FactCheckIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <PageTemplate
      title="GRN (Goods Receipt Note)"
      subtitle="Receive against approved/sent POs. Stock is posted only through GRN in this workflow."
      currentPageTitle="GRN"
      fullHeight
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!canRead ? (
          <Alert severity="error">
            You do not have access to GRN module. Request `inventory.grn.write`.
          </Alert>
        ) : null}

        {canRead ? (
          <>
            {!canWrite ? <Alert severity="info">You are in read-only mode for GRN workflow.</Alert> : null}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
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
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Purchase Order"
                    value={selectedPoId}
                    onChange={(event) => setSelectedPoId(event.target.value)}
                  >
                    {eligiblePo.map((po) => (
                      <MenuItem key={po.id} value={po.id}>
                        {po.poNumber} - {po.vendor} - {po.status}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    size="small"
                    label="Invoice No"
                    value={invoiceNo}
                    onChange={(event) => setInvoiceNo(event.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Received By"
                    value={receivedBy}
                    onChange={(event) => setReceivedBy(event.target.value)}
                  />
                </Stack>
                <TextField
                  sx={{ mt: 1 }}
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    borderRight: { xl: '1px solid' },
                    borderBottom: { xs: '1px solid', xl: 'none' },
                    borderColor: 'divider',
                    minHeight: 0,
                    overflow: 'hidden',
                  }}
                >
                  {!selectedPo ? (
                    <Box sx={{ p: 1.2 }}>
                      <Alert severity="info">No PO eligible for GRN posting.</Alert>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ px: 1.2, py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {selectedPo.poNumber}
                          </Typography>
                          <Chip size="small" label={selectedPo.status} color={poStatusColor(selectedPo.status)} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Vendor: {selectedPo.vendor} - Expected: {selectedPo.expectedDeliveryDate || '--'}
                        </Typography>
                      </Box>

                      <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell>Pending</TableCell>
                              <TableCell>Accepted</TableCell>
                              <TableCell>Rejected</TableCell>
                              <TableCell>Batch</TableCell>
                              <TableCell>Expiry</TableCell>
                              <TableCell>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingLines.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7}>
                                  <Alert severity="success">No pending lines. PO is ready to close.</Alert>
                                </TableCell>
                              </TableRow>
                            ) : (
                              pendingLines.map((line) => {
                                const draft = lineDraftById[line.id] ?? createEmptyLineDraft();
                                return (
                                  <TableRow key={line.id}>
                                    <TableCell sx={{ fontWeight: 700 }}>{line.itemLabel}</TableCell>
                                    <TableCell>{line.pending}</TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={draft.acceptedQty}
                                        onChange={(event) =>
                                          setLineDraftById((prev) => ({
                                            ...prev,
                                            [line.id]: { ...draft, acceptedQty: event.target.value },
                                          }))
                                        }
                                        sx={{ width: 90 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={draft.rejectedQty}
                                        onChange={(event) =>
                                          setLineDraftById((prev) => ({
                                            ...prev,
                                            [line.id]: { ...draft, rejectedQty: event.target.value },
                                          }))
                                        }
                                        sx={{ width: 90 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        value={draft.batchNo}
                                        onChange={(event) =>
                                          setLineDraftById((prev) => ({
                                            ...prev,
                                            [line.id]: { ...draft, batchNo: event.target.value },
                                          }))
                                        }
                                        sx={{ width: 130 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        type="date"
                                        value={draft.expiryDate}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(event) =>
                                          setLineDraftById((prev) => ({
                                            ...prev,
                                            [line.id]: { ...draft, expiryDate: event.target.value },
                                          }))
                                        }
                                        sx={{ width: 150 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        value={draft.location}
                                        onChange={(event) =>
                                          setLineDraftById((prev) => ({
                                            ...prev,
                                            [line.id]: { ...draft, location: event.target.value },
                                          }))
                                        }
                                        sx={{ width: 130 }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.85,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Button variant="contained" onClick={postGrn} disabled={!canWrite || !selectedPo}>
                          Post GRN
                        </Button>
                      </Box>
                    </>
                  )}
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                    Recent GRN Entries
                  </Typography>

                  <Stack spacing={0.8}>
                    {inventoryState.grns.length === 0 ? (
                      <Alert severity="info">No GRN records yet.</Alert>
                    ) : (
                      inventoryState.grns.map((grn) => (
                        <Card
                          key={grn.id}
                          elevation={0}
                          sx={{
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.16),
                            px: 0.9,
                            py: 0.75,
                          }}
                        >
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.6}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {grn.grnNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                              {grn.poNumber} - {grn.vendor}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(grn.receivedAt)}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                            Invoice: {grn.invoiceNo} - Received by: {grn.receivedBy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                            Lines: {grn.lines.length} - Accepted units:{' '}
                            {grn.lines.reduce((sum, line) => sum + line.acceptedQty, 0)} - Rejected units:{' '}
                            {grn.lines.reduce((sum, line) => sum + line.rejectedQty, 0)}
                          </Typography>
                        </Card>
                      ))
                    )}
                  </Stack>
                </Box>
              </Box>
            </Card>
          </>
        ) : null}
      </Stack>

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
