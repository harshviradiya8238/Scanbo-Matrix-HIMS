'use client';

import * as React from 'react';
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
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  AssignmentReturn as AssignmentReturnIcon,
  CheckCircle as CheckCircleIcon,
  DoDisturbAlt as DoDisturbAltIcon,
  PendingActions as PendingActionsIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { usePermission } from '@/src/core/auth/usePermission';

type ReturnStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Completed';
type ReturnReason = 'Damaged' | 'Expired' | 'Near Expiry' | 'Wrong Dispense' | 'Recall';
type ReturnsFilter = 'All' | ReturnStatus;
type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

interface ReturnHistory {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

interface ReturnRequest {
  id: string;
  requestNo: string;
  drug: string;
  batchNo: string;
  quantity: number;
  reason: ReturnReason;
  status: ReturnStatus;
  vendor: string;
  location: string;
  raisedBy: string;
  raisedAt: string;
  note: string;
  history: ReturnHistory[];
}

interface ReturnsUiState {
  requests: ReturnRequest[];
}

interface ReturnDraft {
  drug: string;
  batchNo: string;
  quantity: string;
  reason: ReturnReason;
  vendor: string;
  location: string;
  note: string;
}

interface ToastState {
  open: boolean;
  msg: string;
  severity: ToastSeverity;
}

const RETURNS_UI_STORAGE_KEY = 'scanbo.hims.pharmacy.returns.ui.v1';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const EMPTY_DRAFT: ReturnDraft = {
  drug: '',
  batchNo: '',
  quantity: '',
  reason: 'Damaged',
  vendor: '',
  location: '',
  note: '',
};

function nowIso(): string {
  return new Date().toISOString();
}

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '--';
  return dateFormatter.format(parsed);
}

function buildId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

function historyEntry(actor: string, action: string, note?: string): ReturnHistory {
  return {
    id: buildId('ret-h'),
    timestamp: nowIso(),
    actor,
    action,
    note,
  };
}

function buildDefaultReturnsState(): ReturnsUiState {
  const now = Date.now();

  return {
    requests: [
      {
        id: 'ret-001',
        requestNo: 'RET-2026-001',
        drug: 'Morphine 10mg/mL',
        batchNo: 'MOR-26-11',
        quantity: 2,
        reason: 'Damaged',
        status: 'Pending Review',
        vendor: 'LifeMed Exports',
        location: 'SAFE-1',
        raisedBy: 'Ph. Rohit',
        raisedAt: new Date(now - 65 * 60_000).toISOString(),
        note: 'Two ampoules cracked during transfer from controlled cabinet.',
        history: [
          {
            id: 'ret-h-001',
            timestamp: new Date(now - 65 * 60_000).toISOString(),
            actor: 'Ph. Rohit',
            action: 'Return request created',
            note: 'Damage identified during bin audit.',
          },
        ],
      },
      {
        id: 'ret-002',
        requestNo: 'RET-2026-002',
        drug: 'Vancomycin 500mg',
        batchNo: 'VNC-25-19',
        quantity: 16,
        reason: 'Expired',
        status: 'Approved',
        vendor: 'Kare Labs',
        location: 'A-12',
        raisedBy: 'Ph. Ananya',
        raisedAt: new Date(now - 140 * 60_000).toISOString(),
        note: 'Batch expired and isolated from active inventory.',
        history: [
          {
            id: 'ret-h-002',
            timestamp: new Date(now - 140 * 60_000).toISOString(),
            actor: 'Ph. Ananya',
            action: 'Return request created',
          },
          {
            id: 'ret-h-003',
            timestamp: new Date(now - 100 * 60_000).toISOString(),
            actor: 'Inventory Supervisor',
            action: 'Approved',
            note: 'Vendor pickup scheduled for next cycle.',
          },
        ],
      },
      {
        id: 'ret-003',
        requestNo: 'RET-2026-003',
        drug: 'Piperacillin/Tazobactam 4.5g',
        batchNo: 'PTZ-26-09',
        quantity: 4,
        reason: 'Near Expiry',
        status: 'Rejected',
        vendor: 'Kare Labs',
        location: 'ICU-COLD-2',
        raisedBy: 'Ph. Noor',
        raisedAt: new Date(now - 220 * 60_000).toISOString(),
        note: 'Not eligible for return under current vendor policy window.',
        history: [
          {
            id: 'ret-h-004',
            timestamp: new Date(now - 220 * 60_000).toISOString(),
            actor: 'Ph. Noor',
            action: 'Return request created',
          },
          {
            id: 'ret-h-005',
            timestamp: new Date(now - 190 * 60_000).toISOString(),
            actor: 'Inventory Supervisor',
            action: 'Rejected',
            note: 'Transfer for internal consumption before expiry.',
          },
        ],
      },
      {
        id: 'ret-004',
        requestNo: 'RET-2026-004',
        drug: 'Ketorolac 30mg/mL',
        batchNo: 'KTR-26-06',
        quantity: 6,
        reason: 'Wrong Dispense',
        status: 'Completed',
        vendor: 'MedAxis',
        location: 'A-04',
        raisedBy: 'Ph. Ananya',
        raisedAt: new Date(now - 310 * 60_000).toISOString(),
        note: 'Reverse logistics completed and credit note received.',
        history: [
          {
            id: 'ret-h-006',
            timestamp: new Date(now - 310 * 60_000).toISOString(),
            actor: 'Ph. Ananya',
            action: 'Return request created',
          },
          {
            id: 'ret-h-007',
            timestamp: new Date(now - 280 * 60_000).toISOString(),
            actor: 'Inventory Supervisor',
            action: 'Approved',
          },
          {
            id: 'ret-h-008',
            timestamp: new Date(now - 250 * 60_000).toISOString(),
            actor: 'Inventory Desk',
            action: 'Completed',
            note: 'Vendor acknowledgement uploaded.',
          },
        ],
      },
    ],
  };
}

const DEFAULT_RETURNS_STATE = buildDefaultReturnsState();

function readReturnsState(): ReturnsUiState {
  if (typeof window === 'undefined') return DEFAULT_RETURNS_STATE;

  try {
    const raw = window.localStorage.getItem(RETURNS_UI_STORAGE_KEY);
    if (!raw) return DEFAULT_RETURNS_STATE;

    const parsed = JSON.parse(raw) as Partial<ReturnsUiState>;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_RETURNS_STATE;

    return {
      requests: Array.isArray(parsed.requests) ? parsed.requests : DEFAULT_RETURNS_STATE.requests,
    };
  } catch {
    return DEFAULT_RETURNS_STATE;
  }
}

function writeReturnsState(state: ReturnsUiState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RETURNS_UI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort persistence
  }
}

function statusColor(status: ReturnStatus): 'warning' | 'info' | 'error' | 'success' {
  if (status === 'Pending Review') return 'warning';
  if (status === 'Approved') return 'info';
  if (status === 'Rejected') return 'error';
  return 'success';
}

export default function PharmacyReturnsPage() {
  const theme = useTheme();
  const permissionGate = usePermission();
  const canWrite = permissionGate('pharmacy.returns.write') || permissionGate('pharmacy.*');
  const dividerColor = alpha(theme.palette.primary.main, 0.12);
  const scrollbarThumbColor = alpha(theme.palette.primary.main, 0.22);

  const [uiState, setUiState] = React.useState<ReturnsUiState>(() => readReturnsState());
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<ReturnsFilter>('All');
  const [selectedId, setSelectedId] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ReturnDraft>(EMPTY_DRAFT);

  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: '',
    severity: 'success',
  });

  React.useEffect(() => {
    writeReturnsState(uiState);
  }, [uiState]);

  const notify = React.useCallback((msg: string, severity: ToastSeverity = 'success') => {
    setToast({ open: true, msg, severity });
  }, []);

  const filteredRequests = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...uiState.requests]
      .filter((row) => {
        if (filter !== 'All' && row.status !== filter) return false;

        if (!q) return true;

        return (
          row.requestNo.toLowerCase().includes(q) ||
          row.drug.toLowerCase().includes(q) ||
          row.batchNo.toLowerCase().includes(q) ||
          row.vendor.toLowerCase().includes(q) ||
          row.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Date.parse(b.raisedAt) - Date.parse(a.raisedAt));
  }, [filter, search, uiState.requests]);

  React.useEffect(() => {
    if (!filteredRequests.length) {
      setSelectedId('');
      return;
    }

    if (!filteredRequests.some((row) => row.id === selectedId)) {
      setSelectedId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedId]);

  const selectedRequest = filteredRequests.find((row) => row.id === selectedId) ?? null;

  const pendingCount = uiState.requests.filter((row) => row.status === 'Pending Review').length;
  const approvedCount = uiState.requests.filter((row) => row.status === 'Approved').length;
  const rejectedCount = uiState.requests.filter((row) => row.status === 'Rejected').length;
  const completedCount = uiState.requests.filter((row) => row.status === 'Completed').length;
  const pendingUnits = uiState.requests
    .filter((row) => row.status === 'Pending Review')
    .reduce((sum, row) => sum + row.quantity, 0);

  const metricTiles = [
    {
      label: 'Pending Review',
      value: pendingCount,
      color: theme.palette.warning.main,
      icon: <PendingActionsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Approved',
      value: approvedCount,
      color: theme.palette.info.main,
      icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      color: theme.palette.error.main,
      icon: <DoDisturbAltIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Completed',
      value: completedCount,
      color: theme.palette.success.main,
      icon: <TaskAltIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Pending Units',
      value: pendingUnits,
      color: theme.palette.warning.dark,
      icon: <AssignmentReturnIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const updateStatus = (status: ReturnStatus, note: string) => {
    if (!selectedRequest) return;

    if (!canWrite) {
      notify('You are in read-only mode for return workflows.', 'warning');
      return;
    }

    setUiState((prev) => ({
      ...prev,
      requests: prev.requests.map((row) => {
        if (row.id !== selectedRequest.id) return row;

        return {
          ...row,
          status,
          history: [
            ...row.history,
            historyEntry(
              status === 'Completed' ? 'Inventory Desk' : 'Inventory Supervisor',
              status,
              note
            ),
          ],
        };
      }),
    }));

    notify(`Return request ${selectedRequest.requestNo} updated to ${status}.`, 'success');
  };

  const openCreateDialog = () => {
    if (!canWrite) {
      notify('You are in read-only mode for return workflows.', 'warning');
      return;
    }

    setDraft(EMPTY_DRAFT);
    setCreateOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setDraft(EMPTY_DRAFT);
  };

  const createReturnRequest = () => {
    if (!canWrite) {
      notify('You are in read-only mode for return workflows.', 'warning');
      return;
    }

    const qty = Number(draft.quantity);
    if (!draft.drug.trim() || !draft.batchNo.trim() || !draft.vendor.trim() || !draft.location.trim()) {
      notify('Drug, batch, vendor, and location are required.', 'warning');
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      notify('Quantity must be greater than zero.', 'warning');
      return;
    }

    const requestNo = `RET-2026-${String(uiState.requests.length + 1).padStart(3, '0')}`;
    const created: ReturnRequest = {
      id: buildId('ret'),
      requestNo,
      drug: draft.drug.trim(),
      batchNo: draft.batchNo.trim(),
      quantity: qty,
      reason: draft.reason,
      status: 'Pending Review',
      vendor: draft.vendor.trim(),
      location: draft.location.trim(),
      raisedBy: 'Shift Pharmacist',
      raisedAt: nowIso(),
      note: draft.note.trim(),
      history: [historyEntry('Shift Pharmacist', 'Return request created', draft.note.trim() || undefined)],
    };

    setUiState((prev) => ({
      ...prev,
      requests: [created, ...prev.requests],
    }));

    setSelectedId(created.id);
    closeCreateDialog();
    notify(`Return request ${created.requestNo} created.`, 'success');
  };

  return (
    <PageTemplate
      title="Pharmacy Returns"
      subtitle="Returns control desk for review, approval, vendor handoff, and audit-ready history."
      currentPageTitle="Returns"
      fullHeight
    >
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!canWrite ? (
          <Alert severity="info">You are currently in read-only mode for return workflows.</Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            p: 1.2,
          }}
        >
          <Grid container spacing={1.05}>
            {metricTiles.map((tile) => (
              <Grid key={tile.label} item xs={6} md={4} lg={2}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 1.6,
                    border: '1px solid',
                    borderColor: alpha(tile.color, 0.24),
                    px: 1,
                    py: 0.9,
                    bgcolor: alpha(tile.color, 0.05),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {tile.label}
                    </Typography>
                    <Box sx={{ color: tile.color, display: 'inline-flex', alignItems: 'center' }}>
                      {tile.icon}
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 800, lineHeight: 1.1 }}>
                    {tile.value}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: dividerColor,
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
              borderColor: dividerColor,
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
              <TextField
                size="small"
                placeholder="Search by request no / drug / batch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ width: { xs: '100%', md: 360 } }}
              />

              <TextField
                select
                size="small"
                label="Status"
                value={filter}
                onChange={(event) => setFilter(event.target.value as ReturnsFilter)}
                sx={{ width: { xs: '100%', md: 220 } }}
              >
                {(['All', 'Pending Review', 'Approved', 'Rejected', 'Completed'] as const).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ flex: 1 }} />

              <Button variant="contained" onClick={openCreateDialog}>
                New Return Request
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '460px minmax(0, 1fr)' },
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                borderRight: { lg: '1px solid' },
                borderBottom: { xs: '1px solid', lg: 'none' },
                borderColor: dividerColor,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TableContainer
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  '&::-webkit-scrollbar': { width: 5, height: 5 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: scrollbarThumbColor, borderRadius: 99 },
                }}
              >
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 88 }}>Request No.</TableCell>
                      <TableCell>Drug</TableCell>
                      <TableCell sx={{ width: 56 }}>Qty</TableCell>
                      <TableCell sx={{ width: 130 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Alert severity="info">No return requests match current filters.</Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((row) => {
                        const isSelected = selectedRequest?.id === row.id;

                        return (
                          <TableRow
                            key={row.id}
                            hover
                            selected={isSelected}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => setSelectedId(row.id)}
                          >
                            <TableCell sx={{ fontWeight: 700 }}>{row.requestNo}</TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={row.drug}>
                                {row.drug}
                              </Typography>
                            </TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>
                              <Chip size="small" label={row.status} color={statusColor(row.status)} />
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                overflowX: 'hidden',
                '&::-webkit-scrollbar': { width: 5 },
                '&::-webkit-scrollbar-thumb': { bgcolor: scrollbarThumbColor, borderRadius: 99 },
              }}
            >
              {!selectedRequest ? (
                <Alert severity="info">Select a return request to view details.</Alert>
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
                          {selectedRequest.requestNo}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.3 }}>
                          {selectedRequest.drug}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          Batch: {selectedRequest.batchNo} - Qty: {selectedRequest.quantity} - Reason: {selectedRequest.reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                          Vendor: {selectedRequest.vendor} - Location: {selectedRequest.location}
                        </Typography>
                      </Box>

                      <Box>
                        <Chip size="small" label={selectedRequest.status} color={statusColor(selectedRequest.status)} />
                      </Box>
                    </Stack>

                    {selectedRequest.note ? (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        {selectedRequest.note}
                      </Alert>
                    ) : null}

                    <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={selectedRequest.status !== 'Pending Review' || !canWrite}
                        onClick={() => updateStatus('Approved', 'Reviewed and approved for vendor return.')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={selectedRequest.status !== 'Pending Review' || !canWrite}
                        onClick={() =>
                          updateStatus('Rejected', 'Rejected after review; keep in active stock rotation.')
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        disabled={selectedRequest.status !== 'Approved' || !canWrite}
                        onClick={() => updateStatus('Completed', 'Vendor pickup and credit closure completed.')}
                      >
                        Mark Completed
                      </Button>
                    </Stack>
                  </Card>

                  <Card elevation={0} sx={{ borderRadius: 1.8, border: '1px solid', borderColor: 'divider', p: 1.1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.9 }}>
                      Audit Timeline
                    </Typography>
                    <Stack spacing={0.8}>
                      {selectedRequest.history.map((entry) => (
                        <Card
                          key={entry.id}
                          elevation={0}
                          sx={{
                            borderRadius: 1.4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.16),
                            px: 0.95,
                            py: 0.7,
                          }}
                        >
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.6}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {entry.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                              {entry.actor} - {formatDateTime(entry.timestamp)}
                            </Typography>
                          </Stack>
                          {entry.note ? (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
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
      </Stack>

      <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Return Request</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <TextField
              label="Drug"
              size="small"
              value={draft.drug}
              onChange={(event) => setDraft((prev) => ({ ...prev, drug: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Batch"
                size="small"
                fullWidth
                value={draft.batchNo}
                onChange={(event) => setDraft((prev) => ({ ...prev, batchNo: event.target.value }))}
              />
              <TextField
                label="Quantity"
                size="small"
                fullWidth
                type="number"
                value={draft.quantity}
                onChange={(event) => setDraft((prev) => ({ ...prev, quantity: event.target.value }))}
              />
            </Stack>
            <TextField
              select
              label="Reason"
              size="small"
              value={draft.reason}
              onChange={(event) => setDraft((prev) => ({ ...prev, reason: event.target.value as ReturnReason }))}
            >
              {(['Damaged', 'Expired', 'Near Expiry', 'Wrong Dispense', 'Recall'] as const).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Vendor"
                size="small"
                fullWidth
                value={draft.vendor}
                onChange={(event) => setDraft((prev) => ({ ...prev, vendor: event.target.value }))}
              />
              <TextField
                label="Location"
                size="small"
                fullWidth
                value={draft.location}
                onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Stack>
            <TextField
              label="Note"
              size="small"
              multiline
              minRows={2}
              value={draft.note}
              onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Reason details, evidence, or vendor reference"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>Cancel</Button>
          <Button variant="contained" onClick={createReturnRequest}>
            Create Request
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
