"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { StatTile } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  AssignmentReturn as AssignmentReturnIcon,
  CheckCircle as CheckCircleIcon,
  DoDisturbAlt as DoDisturbAltIcon,
  PendingActions as PendingActionsIcon,
  TaskAlt as TaskAltIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { usePermission } from "@/src/core/auth/usePermission";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReturnStatus = "Pending Review" | "Approved" | "Rejected" | "Completed";
type ReturnReason =
  | "Damaged"
  | "Expired"
  | "Near Expiry"
  | "Wrong Dispense"
  | "Recall";
type ReturnsFilter = "All" | ReturnStatus;
type ToastSeverity = "success" | "info" | "warning" | "error";

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

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "scanbo.hims.pharmacy.returns.ui.v1";
const EMPTY_DRAFT: ReturnDraft = {
  drug: "",
  batchNo: "",
  quantity: "",
  reason: "Damaged",
  vendor: "",
  location: "",
  note: "",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
function formatDateTime(v: string) {
  const p = Date.parse(v);
  return Number.isNaN(p) ? "--" : dateFormatter.format(p);
}
function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
}
function nowIso() {
  return new Date().toISOString();
}
function historyEntry(
  actor: string,
  action: string,
  note?: string,
): ReturnHistory {
  return { id: buildId("ret-h"), timestamp: nowIso(), actor, action, note };
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  ReturnStatus,
  { color: string; bg: string; dot: string; label: string }
> = {
  "Pending Review": {
    color: "#b45309",
    bg: "#fffbeb",
    dot: "#f59e0b",
    label: "Pending Review",
  },
  Approved: {
    color: "#1172BA",
    bg: "#eff6ff",
    dot: "#3b82f6",
    label: "Approved",
  },
  Rejected: {
    color: "#be123c",
    bg: "#fff1f2",
    dot: "#f43f5e",
    label: "Rejected",
  },
  Completed: {
    color: "#15803d",
    bg: "#f0fdf4",
    dot: "#22c55e",
    label: "Completed",
  },
};

const REASON_CFG: Record<
  ReturnReason,
  { color: string; bg: string; emoji: string }
> = {
  Damaged: { color: "#dc2626", bg: "#fff5f5", emoji: "🔴" },
  Expired: { color: "#7c3aed", bg: "#faf5ff", emoji: "⏰" },
  "Near Expiry": { color: "#d97706", bg: "#fffbeb", emoji: "⚠️" },
  "Wrong Dispense": { color: "#0891b2", bg: "#ecfeff", emoji: "🔄" },
  Recall: { color: "#be123c", bg: "#fff1f2", emoji: "📢" },
};

function StatusBadge({ status }: { status: ReturnStatus }) {
  const c = STATUS_CFG[status];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        px: 1,
        py: 0.25,
        borderRadius: "4px",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: c.color,
        bgcolor: c.bg,
        fontFamily: '"DM Mono", "Fira Code", monospace',
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </Box>
  );
}

function ReasonTag({ reason }: { reason: ReturnReason }) {
  const c = REASON_CFG[reason];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        px: "7px",
        py: "2px",
        borderRadius: "4px",
        fontSize: "0.68rem",
        fontWeight: 600,
        color: c.color,
        bgcolor: c.bg,
      }}
    >
      {c.emoji} {reason}
    </Box>
  );
}

// ─── Default seed data ────────────────────────────────────────────────────────
function buildDefault(): ReturnsUiState {
  const now = Date.now();
  return {
    requests: [
      {
        id: "ret-001",
        requestNo: "RET-2026-001",
        drug: "Morphine 10mg/mL",
        batchNo: "MOR-26-11",
        quantity: 2,
        reason: "Damaged",
        status: "Pending Review",
        vendor: "LifeMed Exports",
        location: "SAFE-1",
        raisedBy: "Ph. Rohit",
        raisedAt: new Date(now - 65 * 60000).toISOString(),
        note: "Two ampoules cracked during transfer from controlled cabinet.",
        history: [
          {
            id: "ret-h-001",
            timestamp: new Date(now - 65 * 60000).toISOString(),
            actor: "Ph. Rohit",
            action: "Return request created",
            note: "Damage identified during bin audit.",
          },
        ],
      },
      {
        id: "ret-002",
        requestNo: "RET-2026-002",
        drug: "Vancomycin 500mg",
        batchNo: "VNC-25-19",
        quantity: 16,
        reason: "Expired",
        status: "Approved",
        vendor: "Kare Labs",
        location: "A-12",
        raisedBy: "Ph. Ananya",
        raisedAt: new Date(now - 140 * 60000).toISOString(),
        note: "Batch expired and isolated from active inventory.",
        history: [
          {
            id: "ret-h-002",
            timestamp: new Date(now - 140 * 60000).toISOString(),
            actor: "Ph. Ananya",
            action: "Return request created",
          },
          {
            id: "ret-h-003",
            timestamp: new Date(now - 100 * 60000).toISOString(),
            actor: "Inventory Supervisor",
            action: "Approved",
            note: "Vendor pickup scheduled for next cycle.",
          },
        ],
      },
      {
        id: "ret-003",
        requestNo: "RET-2026-003",
        drug: "Piperacillin/Tazobactam 4.5g",
        batchNo: "PTZ-26-09",
        quantity: 4,
        reason: "Near Expiry",
        status: "Rejected",
        vendor: "Kare Labs",
        location: "ICU-COLD-2",
        raisedBy: "Ph. Noor",
        raisedAt: new Date(now - 220 * 60000).toISOString(),
        note: "Not eligible for return under current vendor policy window.",
        history: [
          {
            id: "ret-h-004",
            timestamp: new Date(now - 220 * 60000).toISOString(),
            actor: "Ph. Noor",
            action: "Return request created",
          },
          {
            id: "ret-h-005",
            timestamp: new Date(now - 190 * 60000).toISOString(),
            actor: "Inventory Supervisor",
            action: "Rejected",
            note: "Transfer for internal consumption before expiry.",
          },
        ],
      },
      {
        id: "ret-004",
        requestNo: "RET-2026-004",
        drug: "Ketorolac 30mg/mL",
        batchNo: "KTR-26-06",
        quantity: 6,
        reason: "Wrong Dispense",
        status: "Completed",
        vendor: "MedAxis",
        location: "A-04",
        raisedBy: "Ph. Ananya",
        raisedAt: new Date(now - 310 * 60000).toISOString(),
        note: "Reverse logistics completed and credit note received.",
        history: [
          {
            id: "ret-h-006",
            timestamp: new Date(now - 310 * 60000).toISOString(),
            actor: "Ph. Ananya",
            action: "Return request created",
          },
          {
            id: "ret-h-007",
            timestamp: new Date(now - 280 * 60000).toISOString(),
            actor: "Inventory Supervisor",
            action: "Approved",
          },
          {
            id: "ret-h-008",
            timestamp: new Date(now - 250 * 60000).toISOString(),
            actor: "Inventory Desk",
            action: "Completed",
            note: "Vendor acknowledgement uploaded.",
          },
        ],
      },
    ],
  };
}

function readState(): ReturnsUiState {
  if (typeof window === "undefined") return buildDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefault();
    const p = JSON.parse(raw) as Partial<ReturnsUiState>;
    return {
      requests: Array.isArray(p.requests)
        ? p.requests
        : buildDefault().requests,
    };
  } catch {
    return buildDefault();
  }
}
function writeState(s: ReturnsUiState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* best effort */
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PharmacyReturnsPage() {
  const theme = useTheme();
  const permissionGate = usePermission();
  const canWrite =
    permissionGate("pharmacy.returns.write") || permissionGate("pharmacy.*");

  const [uiState, setUiState] = React.useState<ReturnsUiState>(() =>
    readState(),
  );
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<ReturnsFilter>("All");
  const [selectedId, setSelectedId] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ReturnDraft>(EMPTY_DRAFT);
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: "",
    severity: "success",
  });

  // Shared input style — matches PO page
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "#f8fafc",
      fontSize: "0.82rem",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": { fontSize: "0.8rem", color: "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
  };

  React.useEffect(() => {
    writeState(uiState);
  }, [uiState]);

  const notify = React.useCallback(
    (msg: string, severity: ToastSeverity = "success") => {
      setToast({ open: true, msg, severity });
    },
    [],
  );

  const filteredRequests = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...uiState.requests]
      .filter((row) => {
        if (filter !== "All" && row.status !== filter) return false;
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
      setSelectedId("");
      return;
    }
    if (!filteredRequests.some((r) => r.id === selectedId))
      setSelectedId(filteredRequests[0].id);
  }, [filteredRequests, selectedId]);

  const selected = filteredRequests.find((r) => r.id === selectedId) ?? null;

  const pendingCount = uiState.requests.filter(
    (r) => r.status === "Pending Review",
  ).length;
  const approvedCount = uiState.requests.filter(
    (r) => r.status === "Approved",
  ).length;
  const rejectedCount = uiState.requests.filter(
    (r) => r.status === "Rejected",
  ).length;
  const completedCount = uiState.requests.filter(
    (r) => r.status === "Completed",
  ).length;
  const pendingUnits = uiState.requests
    .filter((r) => r.status === "Pending Review")
    .reduce((s, r) => s + r.quantity, 0);

  const updateStatus = (status: ReturnStatus, note: string) => {
    if (!selected) return;
    if (!canWrite) {
      notify("Read-only mode — cannot update.", "warning");
      return;
    }
    setUiState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id !== selected.id
          ? r
          : {
              ...r,
              status,
              history: [
                ...r.history,
                historyEntry(
                  status === "Completed"
                    ? "Inventory Desk"
                    : "Inventory Supervisor",
                  status,
                  note,
                ),
              ],
            },
      ),
    }));
    notify(`${selected.requestNo} updated to ${status}.`, "success");
  };

  const openCreate = () => {
    if (!canWrite) {
      notify("Read-only mode.", "warning");
      return;
    }
    setDraft(EMPTY_DRAFT);
    setCreateOpen(true);
  };
  const closeCreate = () => {
    setCreateOpen(false);
    setDraft(EMPTY_DRAFT);
  };
  const createRequest = () => {
    if (!canWrite) {
      notify("Read-only mode.", "warning");
      return;
    }
    const qty = Number(draft.quantity);
    if (
      !draft.drug.trim() ||
      !draft.batchNo.trim() ||
      !draft.vendor.trim() ||
      !draft.location.trim()
    ) {
      notify("Drug, batch, vendor, and location are required.", "warning");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      notify("Quantity must be > 0.", "warning");
      return;
    }
    const requestNo = `RET-2026-${String(uiState.requests.length + 1).padStart(3, "0")}`;
    const created: ReturnRequest = {
      id: buildId("ret"),
      requestNo,
      drug: draft.drug.trim(),
      batchNo: draft.batchNo.trim(),
      quantity: qty,
      reason: draft.reason,
      status: "Pending Review",
      vendor: draft.vendor.trim(),
      location: draft.location.trim(),
      raisedBy: "Shift Pharmacist",
      raisedAt: nowIso(),
      note: draft.note.trim(),
      history: [
        historyEntry(
          "Shift Pharmacist",
          "Return request created",
          draft.note.trim() || undefined,
        ),
      ],
    };
    setUiState((prev) => ({ ...prev, requests: [created, ...prev.requests] }));
    setSelectedId(created.id);
    closeCreate();
    notify(`${created.requestNo} created.`, "success");
  };

  return (
    <PageTemplate
      title="Pharmacy Returns"
      subtitle="Returns control desk for review, approval, vendor handoff, and audit-ready history."
      currentPageTitle="Returns"
      fullHeight
    >
      <Box
        sx={{
          bgcolor: "#f8fafc",
          minHeight: "100%",
          fontFamily: '"DM Sans", sans-serif',
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {!canWrite ? (
          <Alert
            severity="info"
            sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
          >
            You are currently in read-only mode for return workflows.
          </Alert>
        ) : null}

        {/* ── Stat Strip ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(5, 1fr)",
            },
            gap: 1.5,
          }}
        >
          <StatTile
            label="Pending Review"
            value={pendingCount}
            subtitle="Awaiting review"
            icon={<PendingActionsIcon sx={{ fontSize: 18 }} />}
            variant="soft"
            tone="warning"
          />
          <StatTile
            label="Approved"
            value={approvedCount}
            subtitle="Ready for dispatch"
            icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
            variant="soft"
            tone="info"
          />
          <StatTile
            label="Rejected"
            value={rejectedCount}
            subtitle="Not eligible"
            icon={<DoDisturbAltIcon sx={{ fontSize: 18 }} />}
            variant="soft"
            tone="error"
          />
          <StatTile
            label="Completed"
            value={completedCount}
            subtitle="Vendor pickup done"
            icon={<TaskAltIcon sx={{ fontSize: 18 }} />}
            variant="soft"
            tone="success"
          />
          <StatTile
            label="Pending Units"
            value={pendingUnits}
            subtitle="Units under review"
            icon={<AssignmentReturnIcon sx={{ fontSize: 18 }} />}
            variant="soft"
            tone="primary"
          />
        </Box>

        {/* ── Main Panel ──────────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: "#ffffff",
            border: "1.5px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: "1.5px solid #e2e8f0",
              bgcolor: "#ffffff",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              alignItems={{ md: "center" }}
            >
              {/* Search — same as PO page */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  px: 1.25,
                  gap: 0.75,
                  width: { xs: "100%", md: 280 },
                  "&:focus-within": { borderColor: theme.palette.primary.main },
                }}
              >
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  ⌕
                </Typography>
                <Box
                  component="input"
                  placeholder="Search request / drug / batch..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearch(e.target.value)
                  }
                  sx={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "0.82rem",
                    color: "#1e293b",
                    width: "100%",
                    py: 0.75,
                    fontFamily: '"DM Sans", sans-serif',
                    "&::placeholder": { color: "#94a3b8" },
                  }}
                />
              </Box>

              <TextField
                select
                size="small"
                label="Status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as ReturnsFilter)}
                sx={{ width: { xs: "100%", md: 200 }, ...inputSx }}
              >
                {(
                  [
                    "All",
                    "Pending Review",
                    "Approved",
                    "Rejected",
                    "Completed",
                  ] as const
                ).map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.82rem" }}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ flex: 1 }} />

              <Button
                variant="contained"
                onClick={openCreate}
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.03em",
                  px: 2.5,
                  py: 0.85,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                }}
              >
                New Return Request
              </Button>
            </Stack>
          </Box>

          {/* Split View */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "420px minmax(0, 1fr)" },
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* ── Request List ─────────────────────────────────────────── */}
            <Box
              sx={{
                borderRight: { lg: "1.5px solid #e2e8f0" },
                borderBottom: { xs: "1.5px solid #e2e8f0", lg: "none" },
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {filteredRequests.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    No return requests match current filters.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    overflowY: "auto",
                    flex: 1,
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#e2e8f0",
                      borderRadius: 8,
                    },
                  }}
                >
                  {filteredRequests.map((row, idx) => {
                    const isSelected = row.id === selectedId;
                    return (
                      <Box
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        sx={{
                          px: 2,
                          py: 1.4,
                          cursor: "pointer",
                          borderBottom:
                            idx < filteredRequests.length - 1
                              ? "1px solid #f1f5f9"
                              : "none",
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.04)
                            : "transparent",
                          borderLeft: isSelected
                            ? `3px solid ${theme.palette.primary.main}`
                            : "3px solid transparent",
                          transition: "all 0.15s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                fontWeight: 800,
                                color: isSelected
                                  ? theme.palette.primary.main
                                  : "#1e293b",
                                fontFamily: '"DM Mono", monospace',
                                letterSpacing: "0.03em",
                              }}
                            >
                              {row.requestNo}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                color: isSelected ? "#1e293b" : "#475569",
                                mt: 0.2,
                                fontWeight: isSelected ? 700 : 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 200,
                              }}
                            >
                              {row.drug}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.68rem",
                                color: "#94a3b8",
                                mt: 0.15,
                              }}
                            >
                              {row.vendor} · Qty: {row.quantity}
                            </Typography>
                          </Box>
                          <Stack alignItems="flex-end" spacing={0.5}>
                            <StatusBadge status={row.status} />
                            <ReasonTag reason={row.reason} />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* ── Detail Panel ─────────────────────────────────────────── */}
            <Box
              sx={{
                overflowY: "auto",
                p: 2,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#e2e8f0",
                  borderRadius: 8,
                },
              }}
            >
              {!selected ? (
                <Box sx={{ textAlign: "center", pt: 6 }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    ← Select a return request to view details
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {/* ── Header Card ── */}
                  <Box
                    sx={{
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: "#fff",
                        borderBottom: "1.5px solid #e2e8f0",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: '"DM Mono", monospace',
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: "black",
                            }}
                          >
                            {selected.requestNo}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: "#64748B",
                              mt: 0.2,
                              fontWeight: 500,
                            }}
                          >
                            {selected.drug}
                          </Typography>
                        </Box>
                        <StatusBadge status={selected.status} />
                      </Stack>
                    </Box>

                    {/* Meta grid */}
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 1.25,
                          mb: 1.5,
                        }}
                      >
                        {[
                          { label: "Batch No.", value: selected.batchNo },
                          {
                            label: "Quantity",
                            value: String(selected.quantity),
                          },
                          { label: "Reason", value: selected.reason },
                          { label: "Vendor", value: selected.vendor },
                          { label: "Location", value: selected.location },
                          { label: "Raised By", value: selected.raisedBy },
                        ].map(({ label, value }) => (
                          <Box key={label}>
                            <Typography
                              sx={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                color: "#94a3b8",
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                fontFamily: '"DM Mono", monospace',
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "#1e293b",
                                mt: 0.2,
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          fontFamily: '"DM Mono", monospace',
                          mb: 0.4,
                        }}
                      >
                        Raised At
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {formatDateTime(selected.raisedAt)}
                      </Typography>

                      {selected.note ? (
                        <Alert
                          severity="info"
                          sx={{
                            mt: 1.5,
                            fontSize: "0.78rem",
                            borderRadius: "8px",
                          }}
                        >
                          {selected.note}
                        </Alert>
                      ) : null}
                    </Box>

                    {/* Workflow actions */}
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderTop: "1.5px solid #e2e8f0",
                        bgcolor: "#fafbfc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          fontFamily: '"DM Mono", monospace',
                          mb: 1,
                        }}
                      >
                        Workflow Actions
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Button
                          size="small"
                          variant="contained"
                          disabled={
                            selected.status !== "Pending Review" || !canWrite
                          }
                          onClick={() =>
                            updateStatus(
                              "Approved",
                              "Reviewed and approved for vendor return.",
                            )
                          }
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "none",
                            px: 1.75,
                            py: 0.6,
                            boxShadow: "none",
                            bgcolor: "#059669",
                            "&:hover": {
                              bgcolor: "#047857",
                              boxShadow: "none",
                            },
                            "&.Mui-disabled": {
                              bgcolor: "#e2e8f0",
                              color: "#94a3b8",
                            },
                          }}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="small"
                          disabled={
                            selected.status !== "Pending Review" || !canWrite
                          }
                          onClick={() =>
                            updateStatus(
                              "Rejected",
                              "Rejected after review; keep in active stock rotation.",
                            )
                          }
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "none",
                            px: 1.75,
                            py: 0.6,
                            border: "1.5px solid #be123c40",
                            color: "#be123c",
                            bgcolor: "#fff1f2",
                            "&:hover": {
                              bgcolor: "#ffe4e6",
                              borderColor: "#be123c",
                            },
                            "&.Mui-disabled": { opacity: 0.35 },
                          }}
                        >
                          ✕ Reject
                        </Button>
                        <Button
                          size="small"
                          disabled={selected.status !== "Approved" || !canWrite}
                          onClick={() =>
                            updateStatus(
                              "Completed",
                              "Vendor pickup and credit closure completed.",
                            )
                          }
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "none",
                            px: 1.75,
                            py: 0.6,
                            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            color: theme.palette.primary.main,
                            bgcolor: "#eff6ff",
                            "&:hover": {
                              bgcolor: "#dbeafe",
                              borderColor: theme.palette.primary.main,
                            },
                            "&.Mui-disabled": { opacity: 0.35 },
                          }}
                        >
                          ✔ Mark Completed
                        </Button>
                      </Stack>
                    </Box>
                  </Box>

                  {/* ── Audit Timeline ── */}
                  <Box
                    sx={{
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        bgcolor: "#fff",
                        borderBottom: "1.5px solid #e2e8f0",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: "black",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          fontFamily: '"DM Mono", monospace',
                        }}
                      >
                        Audit Timeline
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={0}>
                        {selected.history.map((entry, i) => (
                          <Stack key={entry.id} direction="row" spacing={1.5}>
                            <Stack alignItems="center" sx={{ pt: 0.4 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  bgcolor:
                                    i === selected.history.length - 1
                                      ? theme.palette.primary.main
                                      : "#cbd5e1",
                                  border: "2px solid",
                                  borderColor:
                                    i === selected.history.length - 1
                                      ? theme.palette.primary.dark
                                      : "#e2e8f0",
                                }}
                              />
                              {i < selected.history.length - 1 ? (
                                <Box
                                  sx={{
                                    width: 1.5,
                                    flex: 1,
                                    bgcolor: "#e2e8f0",
                                    my: 0.3,
                                  }}
                                />
                              ) : null}
                            </Stack>
                            <Box
                              sx={{
                                pb: i < selected.history.length - 1 ? 1.75 : 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                {entry.action}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.68rem",
                                  color: "#94a3b8",
                                  mt: 0.15,
                                  fontFamily: '"DM Mono", monospace',
                                }}
                              >
                                {entry.actor} ·{" "}
                                {formatDateTime(entry.timestamp)}
                              </Typography>
                              {entry.note ? (
                                <Typography
                                  sx={{
                                    fontSize: "0.73rem",
                                    color: "#475569",
                                    mt: 0.3,
                                    bgcolor: "#f8fafc",
                                    px: 1,
                                    py: 0.4,
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {entry.note}
                                </Typography>
                              ) : null}
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Create Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={closeCreate}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "14px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 800,
            fontSize: "0.95rem",
            color: "#0f172a",
            borderBottom: "1.5px solid #e2e8f0",
            bgcolor: "#f8fafc",
            px: 2.5,
            py: 1.5,
          }}
        >
          Create Return Request
        </DialogTitle>

        <DialogContent sx={{ pt: "20px !important", bgcolor: "#ffffff" }}>
          <Stack spacing={1.75}>
            <TextField
              fullWidth
              label="Drug *"
              size="small"
              value={draft.drug}
              onChange={(e) =>
                setDraft((p) => ({ ...p, drug: e.target.value }))
              }
              sx={inputSx}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                fullWidth
                label="Batch No. *"
                size="small"
                value={draft.batchNo}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, batchNo: e.target.value }))
                }
                sx={inputSx}
              />
              <TextField
                fullWidth
                label="Quantity *"
                size="small"
                type="number"
                value={draft.quantity}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, quantity: e.target.value }))
                }
                sx={inputSx}
              />
            </Stack>
            <TextField
              select
              label="Reason"
              size="small"
              value={draft.reason}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  reason: e.target.value as ReturnReason,
                }))
              }
              sx={inputSx}
            >
              {(
                [
                  "Damaged",
                  "Expired",
                  "Near Expiry",
                  "Wrong Dispense",
                  "Recall",
                ] as const
              ).map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: "0.82rem" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {REASON_CFG[v].emoji}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem" }}>{v}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                fullWidth
                label="Vendor *"
                size="small"
                value={draft.vendor}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, vendor: e.target.value }))
                }
                sx={inputSx}
              />
              <TextField
                fullWidth
                label="Location *"
                size="small"
                value={draft.location}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, location: e.target.value }))
                }
                sx={inputSx}
              />
            </Stack>
            <TextField
              label="Notes"
              size="small"
              multiline
              minRows={2}
              value={draft.note}
              onChange={(e) =>
                setDraft((p) => ({ ...p, note: e.target.value }))
              }
              placeholder="Reason details, evidence, or vendor reference"
              sx={inputSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: "1.5px solid #e2e8f0",
            gap: 1,
            bgcolor: "#f8fafc",
          }}
        >
          <Button
            onClick={closeCreate}
            sx={{
              textTransform: "none",
              color: "#64748b",
              fontWeight: 600,
              borderRadius: "7px",
              px: 2,
              border: "1.5px solid #e2e8f0",
              "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createRequest}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              borderRadius: "7px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
              },
            }}
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
