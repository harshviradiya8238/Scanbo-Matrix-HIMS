"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
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
} from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { usePermission } from "@/src/core/auth/usePermission";
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
} from "@/src/core/inventory/inventoryStore";
import {
  Approval as ApprovalIcon,
  LocalShipping as LocalShippingIcon,
  PendingActions as PendingActionsIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  KeyboardArrowRight as ArrowIcon,
} from "@mui/icons-material";

// ─── Types ───────────────────────────────────────────────────────────────────

type PoFilter = "All" | PurchaseOrderStatus;
type ToastSeverity = "success" | "info" | "warning" | "error";

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

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PO_DRAFT: PoDraft = {
  vendor: "",
  expectedDeliveryDate: "",
  notes: "",
};
const DEFAULT_LINE_DRAFT: PoLineDraft = {
  itemId: "",
  quantityOrdered: "",
  unitCost: "",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "--";
  return dateFormatter.format(parsed);
}
function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; dot: string }
> = {
  Draft: { color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  "Pending Approval": { color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
  Approved: { color: "#1172BA", bg: "#eff6ff", dot: "#3b82f6" },
  "Sent to Vendor": { color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  "Partially Received": { color: "#c2410c", bg: "#fff7ed", dot: "#f97316" },
  Closed: { color: "#1172BA", bg: "#f0f9ff", dot: "#0ea5e9" },
  Cancelled: { color: "#be123c", bg: "#fff1f2", dot: "#f43f5e" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#94a3b8",
  };
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
        color: cfg.color,
        bgcolor: cfg.bg,
        fontFamily: '"DM Mono", "Fira Code", monospace',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPurchaseOrdersPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const permissionGate = usePermission();

  const canRead =
    permissionGate("inventory.purchase.write") || permissionGate("inventory.*");
  const canWrite =
    permissionGate("inventory.purchase.write") || permissionGate("inventory.*");

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(
    () => readInventoryState(),
  );
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<PoFilter>("All");
  const [selectedPoId, setSelectedPoId] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [poDraft, setPoDraft] = React.useState<PoDraft>(DEFAULT_PO_DRAFT);
  const [lineDraft, setLineDraft] =
    React.useState<PoLineDraft>(DEFAULT_LINE_DRAFT);
  const [draftLines, setDraftLines] = React.useState<PurchaseOrderLine[]>([]);

  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: "",
    severity: "success",
  });

  React.useEffect(() => {
    writeInventoryState(inventoryState);
  }, [inventoryState]);

  const notify = React.useCallback(
    (msg: string, severity: ToastSeverity = "success") => {
      setToast({ open: true, msg, severity });
    },
    [],
  );

  const activeItems = React.useMemo(
    () => inventoryState.items.filter((item) => item.status === "Active"),
    [inventoryState.items],
  );

  const filteredPo = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...inventoryState.purchaseOrders]
      .filter((po) => {
        if (filter !== "All" && po.status !== filter) return false;
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
      setSelectedPoId("");
      return;
    }
    if (!filteredPo.some((po) => po.id === selectedPoId))
      setSelectedPoId(filteredPo[0].id);
  }, [filteredPo, selectedPoId]);

  React.useEffect(() => {
    const prefillItemId = searchParams.get("item");
    if (!prefillItemId) return;
    if (!activeItems.some((item) => item.id === prefillItemId)) return;
    setDialogOpen(true);
    setLineDraft((prev) => ({ ...prev, itemId: prefillItemId }));
  }, [activeItems, searchParams]);

  const selectedPo = filteredPo.find((po) => po.id === selectedPoId) ?? null;

  const pendingApproval = inventoryState.purchaseOrders.filter(
    (po) => po.status === "Pending Approval",
  ).length;
  const sentCount = inventoryState.purchaseOrders.filter(
    (po) => po.status === "Sent to Vendor",
  ).length;
  const partialCount = inventoryState.purchaseOrders.filter(
    (po) => po.status === "Partially Received",
  ).length;
  const closedCount = inventoryState.purchaseOrders.filter(
    (po) => po.status === "Closed",
  ).length;
  const totalOpenValue = inventoryState.purchaseOrders
    .filter((po) => !["Closed", "Cancelled"].includes(po.status))
    .reduce(
      (sum, po) =>
        sum +
        po.lines.reduce((ls, l) => ls + l.quantityOrdered * l.unitCost, 0),
      0,
    );

  // Handlers
  const openCreate = () => {
    if (!canWrite) {
      notify("Read-only mode — PO updates not permitted.", "warning");
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
    const item = activeItems.find((e) => e.id === lineDraft.itemId);
    if (!item) {
      notify("Select a valid item.", "warning");
      return;
    }
    const qty = Number(lineDraft.quantityOrdered);
    const cost = Number(lineDraft.unitCost || item.unitCost);
    if (!Number.isFinite(qty) || qty <= 0) {
      notify("Quantity must be > 0.", "warning");
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      notify("Unit cost must be > 0.", "warning");
      return;
    }
    setDraftLines((prev) => [
      ...prev,
      {
        id: buildInventoryId("po-line"),
        itemId: item.id,
        itemLabel: getItemLabel(item),
        quantityOrdered: qty,
        quantityReceived: 0,
        unitCost: cost,
      },
    ]);
    setLineDraft(DEFAULT_LINE_DRAFT);
  };
  const removeLine = (lineId: string) =>
    setDraftLines((prev) => prev.filter((l) => l.id !== lineId));
  const createPo = () => {
    if (!canWrite) {
      notify("Read-only mode.", "warning");
      return;
    }
    if (!poDraft.vendor.trim()) {
      notify("Vendor is required.", "warning");
      return;
    }
    if (draftLines.length === 0) {
      notify("Add at least one line.", "warning");
      return;
    }
    const po: PurchaseOrderRecord = {
      id: buildInventoryId("po"),
      poNumber: getNextPoNumber(inventoryState.purchaseOrders),
      vendor: poDraft.vendor.trim(),
      status: "Draft",
      expectedDeliveryDate: poDraft.expectedDeliveryDate || "",
      requestedBy: "Inventory Desk",
      createdAt: new Date().toISOString(),
      notes: poDraft.notes.trim(),
      lines: draftLines,
      history: [
        {
          id: buildInventoryId("po-h"),
          at: new Date().toISOString(),
          actor: "Inventory Desk",
          action: "PO drafted",
        },
      ],
    };
    setInventoryState((prev) => ({
      ...prev,
      purchaseOrders: [po, ...prev.purchaseOrders],
    }));
    setSelectedPoId(po.id);
    closeCreate();
    notify(`${po.poNumber} created successfully.`, "success");
  };
  const updatePoStatus = (
    poId: string,
    status: PurchaseOrderStatus,
    actor: string,
    note?: string,
  ) => {
    if (!canWrite) {
      notify("Read-only mode.", "warning");
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
          approvedBy: status === "Approved" ? actor : po.approvedBy,
          history: [
            ...po.history,
            {
              id: buildInventoryId("po-h"),
              at: new Date().toISOString(),
              actor,
              action: `Status → ${nextStatus}`,
              note,
            },
          ],
        };
      }),
    }));
    notify(`PO moved to ${status}.`, "success");
  };
  const poTotal = (po: PurchaseOrderRecord) =>
    po.lines.reduce((s, l) => s + l.quantityOrdered * l.unitCost, 0);

  // Shared input style overrides
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

  return (
    <PageTemplate
      title="Purchase Orders"
      subtitle="Procurement workflow: draft → approval → dispatch → GRN closure"
      currentPageTitle="Purchase Orders"
      fullHeight
    >
      <Box
        sx={{
          bgcolor: "#f8fafc",
          minHeight: "100%",
          fontFamily: '"DM Sans", sans-serif',
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        {!canRead ? (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            No access to Purchase Orders. Request{" "}
            <code>inventory.purchase.write</code>.
          </Alert>
        ) : null}

        {canRead ? (
          <>
            {!canWrite ? (
              <Alert
                severity="info"
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                You are in read-only mode — PO workflow actions are disabled.
              </Alert>
            ) : null}

            {/* ── Metric Strip ─────────────────────────────────────── */}
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
                label="Pending Approval"
                value={pendingApproval}
                subtitle="Awaiting supervisor"
                icon={<PendingActionsIcon sx={{ fontSize: 18 }} />}
                variant="soft"
                tone="warning"
              />
              <StatTile
                label="Sent to Vendor"
                value={sentCount}
                subtitle="Order dispatched"
                icon={<LocalShippingIcon sx={{ fontSize: 18 }} />}
                variant="soft"
                tone="info"
              />
              <StatTile
                label="Partially Received"
                value={partialCount}
                subtitle="GRN pending lines"
                icon={<ApprovalIcon sx={{ fontSize: 18 }} />}
                variant="soft"
                tone="warning"
              />
              <StatTile
                label="Closed"
                value={closedCount}
                subtitle="Completed procurement"
                icon={<PlaylistAddCheckIcon sx={{ fontSize: 18 }} />}
                variant="soft"
                tone="success"
              />
              <StatTile
                label="Open PO Value"
                value={formatCurrency(totalOpenValue)}
                subtitle="Unclosed order amount"
                icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
                variant="soft"
                tone="primary"
              />
            </Box>

            {/* ── Main Panel ───────────────────────────────────────── */}
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
                  {/* Search */}
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
                      "&:focus-within": {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      ⌕
                    </Typography>
                    <Box
                      component="input"
                      placeholder="Search PO / vendor..."
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

                  {/* Filter */}
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as PoFilter)}
                    sx={{ width: { xs: "100%", md: 200 }, ...inputSx }}
                  >
                    {(
                      [
                        "All",
                        "Draft",
                        "Pending Approval",
                        "Approved",
                        "Sent to Vendor",
                        "Partially Received",
                        "Closed",
                        "Cancelled",
                      ] as const
                    ).map((v) => (
                      <MenuItem key={v} value={v} sx={{ fontSize: "0.82rem" }}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box sx={{ flex: 1 }} />

                  {/* New PO Button */}
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
                    New PO
                  </Button>
                </Stack>
              </Box>

              {/* Split View */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "420px minmax(0, 1fr)",
                  },
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {/* ── PO List ─────────────────────────────────────── */}
                <Box
                  sx={{
                    borderRight: { lg: "1.5px solid #e2e8f0" },
                    borderBottom: { xs: "1.5px solid #e2e8f0", lg: "none" },
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {filteredPo.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        sx={{ fontSize: "0.82rem", color: "#94a3b8" }}
                      >
                        No purchase orders match current filters.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ overflowY: "auto", flex: 1 }}>
                      {filteredPo.map((po, idx) => {
                        const isSelected = po.id === selectedPo?.id;
                        const total = poTotal(po);
                        return (
                          <Box
                            key={po.id}
                            onClick={() => setSelectedPoId(po.id)}
                            sx={{
                              px: 2,
                              py: 1.4,
                              cursor: "pointer",
                              borderBottom:
                                idx < filteredPo.length - 1
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
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.02,
                                ),
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
                                  {po.poNumber}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: isSelected ? "#1e293b" : "#475569",
                                    mt: 0.2,
                                    fontWeight: isSelected ? 700 : 500,
                                  }}
                                >
                                  {po.vendor}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.68rem",
                                    color: "#94a3b8",
                                    mt: 0.15,
                                  }}
                                >
                                  {po.expectedDeliveryDate
                                    ? `Exp: ${po.expectedDeliveryDate}`
                                    : "No delivery date"}
                                </Typography>
                              </Box>
                              <Stack alignItems="flex-end" spacing={0.5}>
                                <StatusBadge status={po.status} />
                                <Typography
                                  sx={{
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    color: "#1172BA",
                                    fontFamily: '"DM Mono", monospace',
                                  }}
                                >
                                  {formatCurrency(total)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {/* ── PO Detail ────────────────────────────────────── */}
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
                  {!selectedPo ? (
                    <Box sx={{ textAlign: "center", pt: 6 }}>
                      <Typography
                        sx={{ fontSize: "0.85rem", color: "#94a3b8" }}
                      >
                        ← Select a purchase order to view details
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {/* Header Card */}
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
                            bgcolor: "#f8fafc",
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
                                  color: "#0f172a",
                                }}
                              >
                                {selectedPo.poNumber}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.78rem",
                                  color: "#64748b",
                                  mt: 0.25,
                                }}
                              >
                                {selectedPo.vendor}
                              </Typography>
                            </Box>
                            <StatusBadge status={selectedPo.status} />
                          </Stack>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: 1,
                              mt: 1.25,
                            }}
                          >
                            {[
                              {
                                label: "Requested By",
                                value: selectedPo.requestedBy,
                              },
                              {
                                label: "Created",
                                value: formatDateTime(selectedPo.createdAt),
                              },
                              {
                                label: "Expected Delivery",
                                value: selectedPo.expectedDeliveryDate || "--",
                              },
                              {
                                label: "Total Value",
                                value: formatCurrency(poTotal(selectedPo)),
                              },
                            ].map(({ label, value }) => (
                              <Box key={label}>
                                <Typography
                                  sx={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    color: "#94a3b8",
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
                                    mt: 0.1,
                                  }}
                                >
                                  {value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                          {selectedPo.notes ? (
                            <Box
                              sx={{
                                mt: 1.25,
                                p: 1,
                                bgcolor: "#fffbeb",
                                border: "1px solid #fde68a",
                                borderRadius: "8px",
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "0.75rem", color: "#92400e" }}
                              >
                                {selectedPo.notes}
                              </Typography>
                            </Box>
                          ) : null}
                        </Box>

                        {/* Workflow Actions */}
                        <Box sx={{ px: 2, py: 1.25, bgcolor: "#ffffff" }}>
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "#94a3b8",
                              mb: 1,
                              fontFamily: '"DM Mono", monospace',
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
                            {[
                              {
                                label: "Submit for Approval",
                                disabled:
                                  selectedPo.status !== "Draft" || !canWrite,
                                variant: "contained" as const,
                                onClick: () =>
                                  updatePoStatus(
                                    selectedPo.id,
                                    "Pending Approval",
                                    "Inventory Desk",
                                    "Submitted for supervisor approval.",
                                  ),
                                color: "default",
                              },
                              {
                                label: "Approve",
                                disabled:
                                  selectedPo.status !== "Pending Approval" ||
                                  !canWrite,
                                variant: "outlined" as const,
                                onClick: () =>
                                  updatePoStatus(
                                    selectedPo.id,
                                    "Approved",
                                    "Inventory Supervisor",
                                    "Approved after budget and vendor checks.",
                                  ),
                                color: "success",
                              },
                              {
                                label: "Send to Vendor",
                                disabled:
                                  selectedPo.status !== "Approved" || !canWrite,
                                variant: "outlined" as const,
                                onClick: () =>
                                  updatePoStatus(
                                    selectedPo.id,
                                    "Sent to Vendor",
                                    "Inventory Desk",
                                    "Dispatched to vendor for fulfillment.",
                                  ),
                                color: "info",
                              },
                              {
                                label: "Cancel PO",
                                disabled:
                                  [
                                    "Closed",
                                    "Cancelled",
                                    "Partially Received",
                                  ].includes(selectedPo.status) || !canWrite,
                                variant: "outlined" as const,
                                onClick: () =>
                                  updatePoStatus(
                                    selectedPo.id,
                                    "Cancelled",
                                    "Inventory Supervisor",
                                    "Cancelled due to operational decision.",
                                  ),
                                color: "error",
                              },
                            ].map((action) => (
                              <Button
                                key={action.label}
                                size="small"
                                variant={action.variant}
                                disabled={action.disabled}
                                onClick={action.onClick}
                                sx={{
                                  borderRadius: "7px",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  textTransform: "none",
                                  px: 1.5,
                                  py: 0.6,
                                  ...(action.color === "default" &&
                                  !action.disabled
                                    ? {
                                        bgcolor: theme.palette.primary.main,
                                        color: "#fff",
                                        border: "none",
                                        "&:hover": {
                                          bgcolor: theme.palette.primary.dark,
                                        },
                                      }
                                    : {}),
                                }}
                                color={
                                  action.color === "default"
                                    ? undefined
                                    : (action.color as any)
                                }
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Stack>
                        </Box>
                      </Box>

                      {/* PO Lines */}
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
                            py: 1.1,
                            bgcolor: "#f8fafc",
                            borderBottom: "1.5px solid #e2e8f0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              fontFamily: '"DM Mono", monospace',
                            }}
                          >
                            Line Items
                          </Typography>
                        </Box>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#fafafa" }}>
                                {[
                                  "Item",
                                  "Ordered",
                                  "Received",
                                  "Pending",
                                  "Rate",
                                  "Amount",
                                ].map((h) => (
                                  <TableCell
                                    key={h}
                                    sx={{
                                      fontSize: "0.67rem",
                                      fontWeight: 700,
                                      color: "#94a3b8",
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                      fontFamily: '"DM Mono", monospace',
                                      py: 0.8,
                                    }}
                                  >
                                    {h}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedPo.lines.map((line) => (
                                <TableRow
                                  key={line.id}
                                  sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                                >
                                  <TableCell
                                    sx={{
                                      fontSize: "0.8rem",
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      py: 0.9,
                                    }}
                                  >
                                    {line.itemLabel}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "0.78rem",
                                      color: "#475569",
                                    }}
                                  >
                                    {line.quantityOrdered}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "0.78rem",
                                      color: "#475569",
                                    }}
                                  >
                                    {line.quantityReceived}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "0.78rem",
                                      color:
                                        line.quantityOrdered -
                                          line.quantityReceived >
                                        0
                                          ? "#f97316"
                                          : "#64748b",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Math.max(
                                      0,
                                      line.quantityOrdered -
                                        line.quantityReceived,
                                    )}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "0.78rem",
                                      color: "#475569",
                                      fontFamily: '"DM Mono", monospace',
                                    }}
                                  >
                                    {formatCurrency(line.unitCost)}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: "0.8rem",
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontFamily: '"DM Mono", monospace',
                                    }}
                                  >
                                    {formatCurrency(
                                      line.quantityOrdered * line.unitCost,
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderTop: "1.5px solid #e2e8f0",
                            display: "flex",
                            justifyContent: "flex-end",
                            bgcolor: "#f8fafc",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: theme.palette.primary.main,
                              fontFamily: '"DM Mono", monospace',
                            }}
                          >
                            Total: {formatCurrency(poTotal(selectedPo))}
                          </Typography>
                        </Box>
                      </Box>

                      {/* History */}
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
                            py: 1.1,
                            bgcolor: "#f8fafc",
                            borderBottom: "1.5px solid #e2e8f0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              fontFamily: '"DM Mono", monospace',
                            }}
                          >
                            Status Timeline
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                          <Stack spacing={0}>
                            {selectedPo.history.map((entry, i) => (
                              <Stack
                                key={entry.id}
                                direction="row"
                                spacing={1.5}
                              >
                                {/* Timeline line */}
                                <Stack alignItems="center" sx={{ pt: 0.25 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      bgcolor:
                                        i === selectedPo.history.length - 1
                                          ? theme.palette.primary.main
                                          : "#cbd5e1",
                                      border: "2px solid",
                                      borderColor:
                                        i === selectedPo.history.length - 1
                                          ? theme.palette.primary.main
                                          : "#e2e8f0",
                                    }}
                                  />
                                  {i < selectedPo.history.length - 1 ? (
                                    <Box
                                      sx={{
                                        width: 1.5,
                                        flex: 1,
                                        bgcolor: "#e2e8f0",
                                        my: 0.25,
                                      }}
                                    />
                                  ) : null}
                                </Stack>
                                {/* Content */}
                                <Box
                                  sx={{
                                    pb:
                                      i < selectedPo.history.length - 1
                                        ? 1.5
                                        : 0,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.78rem",
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
                                      mt: 0.1,
                                      fontFamily: '"DM Mono", monospace',
                                    }}
                                  >
                                    {entry.actor} · {formatDateTime(entry.at)}
                                  </Typography>
                                  {entry.note ? (
                                    <Typography
                                      sx={{
                                        fontSize: "0.72rem",
                                        color: "#64748b",
                                        mt: 0.2,
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
          </>
        ) : null}
      </Box>

      {/* ── Create PO Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={closeCreate}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 24px 80px rgba(15,23,42,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Sora", sans-serif',
            fontWeight: 800,
            fontSize: "1rem",
            color: "#0f172a",
            pb: 1,
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          Create Purchase Order
        </DialogTitle>

        <DialogContent sx={{ pt: "16px !important" }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                fullWidth
                label="Vendor"
                size="small"
                value={poDraft.vendor}
                onChange={(e) =>
                  setPoDraft((p) => ({ ...p, vendor: e.target.value }))
                }
                sx={inputSx}
              />
              <TextField
                fullWidth
                label="Expected Delivery"
                type="date"
                size="small"
                value={poDraft.expectedDeliveryDate}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setPoDraft((p) => ({
                    ...p,
                    expectedDeliveryDate: e.target.value,
                  }))
                }
                sx={inputSx}
              />
            </Stack>

            <TextField
              label="Notes"
              size="small"
              multiline
              minRows={2}
              value={poDraft.notes}
              onChange={(e) =>
                setPoDraft((p) => ({ ...p, notes: e.target.value }))
              }
              sx={inputSx}
            />

            <Box
              sx={{
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                p: 1.5,
                bgcolor: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  mb: 1.25,
                  fontFamily: '"DM Mono", monospace',
                }}
              >
                Add Line Item
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems="flex-start"
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Item"
                  value={lineDraft.itemId}
                  onChange={(e) =>
                    setLineDraft((p) => ({ ...p, itemId: e.target.value }))
                  }
                  sx={inputSx}
                >
                  {activeItems.map((item) => (
                    <MenuItem
                      key={item.id}
                      value={item.id}
                      sx={{ fontSize: "0.82rem" }}
                    >
                      {item.itemCode} – {getItemLabel(item)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Quantity"
                  value={lineDraft.quantityOrdered}
                  onChange={(e) =>
                    setLineDraft((p) => ({
                      ...p,
                      quantityOrdered: e.target.value,
                    }))
                  }
                  sx={{ ...inputSx, maxWidth: { md: 120 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Unit Cost"
                  value={lineDraft.unitCost}
                  onChange={(e) =>
                    setLineDraft((p) => ({ ...p, unitCost: e.target.value }))
                  }
                  sx={{ ...inputSx, maxWidth: { md: 120 } }}
                />
                <Button
                  variant="contained"
                  onClick={addLine}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    px: 2.5,
                    py: 0.9,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: "none",
                    },
                  }}
                >
                  + Add
                </Button>
              </Stack>

              <Stack spacing={0.6} sx={{ mt: 1.25 }}>
                {draftLines.length === 0 ? (
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    No lines added yet.
                  </Typography>
                ) : (
                  draftLines.map((line) => (
                    <Stack
                      key={line.id}
                      direction={{ xs: "column", md: "row" }}
                      spacing={1}
                      alignItems={{ md: "center" }}
                      sx={{
                        bgcolor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        px: 1.25,
                        py: 0.75,
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {line.itemLabel}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#64748b",
                          fontFamily: '"DM Mono", monospace',
                        }}
                      >
                        Qty: {line.quantityOrdered}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#64748b",
                          fontFamily: '"DM Mono", monospace',
                        }}
                      >
                        Rate: {formatCurrency(line.unitCost)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          fontFamily: '"DM Mono", monospace',
                        }}
                      >
                        {formatCurrency(line.quantityOrdered * line.unitCost)}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeLine(line.id)}
                        sx={{
                          fontSize: "0.72rem",
                          textTransform: "none",
                          minWidth: 0,
                          px: 1,
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ px: 2.5, py: 1.5, borderTop: "1.5px solid #e2e8f0", gap: 1 }}
        >
          <Button
            onClick={closeCreate}
            sx={{
              textTransform: "none",
              color: "#64748b",
              fontWeight: 600,
              borderRadius: "8px",
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createPo}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
                boxShadow: "none",
              },
            }}
          >
            Create PO
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
            borderRadius: "10px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
