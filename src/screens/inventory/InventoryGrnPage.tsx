"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  TextField,
  MenuItem,
  Divider,
  Chip,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { WorkspaceHeaderCard, StatTile } from "@/src/ui/components/molecules";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { alpha, useTheme } from "@/src/ui/theme";
import { usePermission } from "@/src/core/auth/usePermission";
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
} from "@/src/core/inventory/inventoryStore";
import {
  FactCheck as FactCheckIcon,
  Inventory2 as Inventory2Icon,
  LocalShipping as LocalShippingIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  ReceiptLong as ReceiptLongIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { Paper } from "@/src/ui/components";

// ─── Types ───────────────────────────────────────────────────────────────────
type ToastSeverity = "success" | "info" | "warning" | "error";
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
type InputSxParams = {
  bg: string;
  border: string;
  color: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const formatDateTime = (v: string) => {
  const p = Date.parse(v);
  return Number.isNaN(p) ? "--" : dateFormatter.format(p);
};
const createEmptyLineDraft = (): GrnLineDraft => ({
  acceptedQty: "",
  rejectedQty: "",
  batchNo: "",
  expiryDate: "",
  location: "",
});
const getEligiblePo = (pos: PurchaseOrderRecord[]) =>
  pos.filter((po) =>
    ["Approved", "Sent to Vendor", "Partially Received"].includes(po.status),
  );

function poStatusColor(
  s: string,
): "default" | "warning" | "info" | "success" | "error" {
  if (s === "Draft") return "default";
  if (s === "Pending Approval" || s === "Partially Received") return "warning";
  if (s === "Approved" || s === "Sent to Vendor") return "info";
  if (s === "Closed") return "success";
  return "error";
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Pill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "error";
}) {
  const theme = useTheme();
  const colors = {
    default: {
      bg: alpha(theme.palette.text.secondary, 0.08),
      text: theme.palette.text.secondary,
      border: alpha(theme.palette.text.secondary, 0.1),
    },
    success: {
      bg: alpha(theme.palette.success.main, 0.08),
      text: theme.palette.success.main,
      border: alpha(theme.palette.success.main, 0.2),
    },
    error: {
      bg: alpha(theme.palette.error.main, 0.08),
      text: theme.palette.error.main,
      border: alpha(theme.palette.error.main, 0.2),
    },
  }[variant];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "20px",
        px: 1,
        py: 0.2,
        fontSize: "0.675rem",
        fontWeight: 700,
        color: colors.text,
      }}
    >
      {children}
    </Box>
  );
}

function PanelCard({
  title,
  children,
  headerRight,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        {icon && (
          <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        )}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "0.875rem",
            color: "text.primary",
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {headerRight && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {headerRight}
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function InventoryGrnPage() {
  const theme = useTheme();
  const permissionGate = usePermission();
  const canRead =
    permissionGate("inventory.grn.write") || permissionGate("inventory.*");
  const canWrite =
    permissionGate("inventory.grn.write") || permissionGate("inventory.*");

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(
    () => readInventoryState(),
  );
  const [selectedPoId, setSelectedPoId] = React.useState("");
  const [invoiceNo, setInvoiceNo] = React.useState("");
  const [receivedBy, setReceivedBy] = React.useState("Store Receiver");
  const [notes, setNotes] = React.useState("");
  const [lineDraftById, setLineDraftById] = React.useState<
    Record<string, GrnLineDraft>
  >({});
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    msg: "",
    severity: "success",
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [grnSearch, setGrnSearch] = React.useState("");
  const [viewGrn, setViewGrn] = React.useState<GrnRecord | null>(null);

  const handleView = (row: GrnRecord) => setViewGrn(row);
  const handleEdit = (row: GrnRecord) => {
    notify(`Edit functionality for ${row.grnNumber} is coming soon.`, "info");
  };

  React.useEffect(() => {
    writeInventoryState(inventoryState);
  }, [inventoryState]);
  const notify = React.useCallback(
    (msg: string, severity: ToastSeverity = "success") =>
      setToast({ open: true, msg, severity }),
    [],
  );

  const eligiblePo = React.useMemo(
    () =>
      getEligiblePo(inventoryState.purchaseOrders).sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [inventoryState.purchaseOrders],
  );

  React.useEffect(() => {
    if (!eligiblePo.length) {
      setSelectedPoId("");
      return;
    }
    if (!eligiblePo.some((po) => po.id === selectedPoId))
      setSelectedPoId(eligiblePo[0].id);
  }, [eligiblePo, selectedPoId]);

  const selectedPo = eligiblePo.find((po) => po.id === selectedPoId) ?? null;

  React.useEffect(() => {
    if (!selectedPo) {
      setLineDraftById({});
      return;
    }
    const next: Record<string, GrnLineDraft> = {};
    selectedPo.lines.forEach((l) => {
      next[l.id] = createEmptyLineDraft();
    });
    setLineDraftById(next);
  }, [selectedPoId]);

  const pendingLines = selectedPo
    ? selectedPo.lines
        .map((l) => ({
          ...l,
          pending: Math.max(0, l.quantityOrdered - l.quantityReceived),
        }))
        .filter((l) => l.pending > 0)
    : [];

  const today = new Date();
  const openPoCount = eligiblePo.length;
  const grnToday = inventoryState.grns.filter((g) => {
    const d = new Date(g.receivedAt);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;
  const totalAccepted = inventoryState.grns.reduce(
    (s, g) => s + g.lines.reduce((ss, l) => ss + l.acceptedQty, 0),
    0,
  );
  const totalRejected = inventoryState.grns.reduce(
    (s, g) => s + g.lines.reduce((ss, l) => ss + l.rejectedQty, 0),
    0,
  );

  const postGrn = () => {
    if (!selectedPo) return;
    if (!canWrite) {
      notify("Read-only mode — GRN posting disabled.", "warning");
      return;
    }
    if (!invoiceNo.trim()) {
      notify("Invoice number is required.", "warning");
      return;
    }

    const linesToPost: GrnLine[] = [];
    for (const line of pendingLines) {
      const draft = lineDraftById[line.id] ?? createEmptyLineDraft();
      const acc = Number(draft.acceptedQty || 0);
      const rej = Number(draft.rejectedQty || 0);
      const total = acc + rej;
      if (!Number.isFinite(acc) || acc < 0) {
        notify(`Invalid accepted qty — ${line.itemLabel}`, "warning");
        return;
      }
      if (!Number.isFinite(rej) || rej < 0) {
        notify(`Invalid rejected qty — ${line.itemLabel}`, "warning");
        return;
      }
      if (total > line.pending) {
        notify(`Qty exceeds pending for ${line.itemLabel}`, "warning");
        return;
      }
      if (total === 0) continue;
      if (
        acc > 0 &&
        (!draft.batchNo.trim() || !draft.expiryDate || !draft.location.trim())
      ) {
        notify(
          `Batch, expiry & location required for ${line.itemLabel}`,
          "warning",
        );
        return;
      }
      linesToPost.push({
        id: buildInventoryId("grn-line"),
        itemId: line.itemId,
        itemLabel: line.itemLabel,
        acceptedQty: acc,
        rejectedQty: rej,
        batchNo: draft.batchNo.trim(),
        expiryDate: draft.expiryDate,
        location: draft.location.trim(),
        unitCost: line.unitCost,
      });
    }
    if (!linesToPost.length) {
      notify("Enter at least one quantity before posting.", "warning");
      return;
    }

    const grn: GrnRecord = {
      id: buildInventoryId("grn"),
      grnNumber: getNextGrnNumber(inventoryState.grns),
      poId: selectedPo.id,
      poNumber: selectedPo.poNumber,
      vendor: selectedPo.vendor,
      invoiceNo: invoiceNo.trim(),
      receivedBy: receivedBy.trim() || "Store Receiver",
      receivedAt: nowIso(),
      notes: notes.trim(),
      lines: linesToPost,
    };

    setInventoryState((prev) => {
      const purchaseOrders = prev.purchaseOrders.map((po) => {
        if (po.id !== selectedPo.id) return po;
        const lines = po.lines.map((line) => {
          const p = linesToPost.find((e) => e.itemId === line.itemId);
          if (!p) return line;
          return {
            ...line,
            quantityReceived:
              line.quantityReceived + p.acceptedQty + p.rejectedQty,
          };
        });
        return {
          ...po,
          lines,
          status: computePoStatusFromLines(po.status, lines),
          history: [
            ...po.history,
            {
              id: buildInventoryId("po-h"),
              at: nowIso(),
              actor: receivedBy.trim() || "Store Receiver",
              action: `GRN posted (${grn.grnNumber})`,
              note: `${linesToPost.length} lines processed.`,
            },
          ],
        };
      });
      const stock = [...prev.stock];
      linesToPost.forEach((line) => {
        if (line.acceptedQty <= 0) return;
        const idx = stock.findIndex((e) => e.itemId === line.itemId);
        if (idx >= 0)
          stock[idx] = {
            ...stock[idx],
            onHand: stock[idx].onHand + line.acceptedQty,
            location: line.location || stock[idx].location,
            nextExpiry: line.expiryDate || stock[idx].nextExpiry,
            updatedAt: nowIso(),
          };
        else
          stock.push({
            id: buildInventoryId("stk"),
            itemId: line.itemId,
            onHand: line.acceptedQty,
            reserved: 0,
            location: line.location || "MAIN-STORE",
            nextExpiry: line.expiryDate,
            updatedAt: nowIso(),
          });
      });
      return { ...prev, purchaseOrders, stock, grns: [grn, ...prev.grns] };
    });

    setLineDraftById({});
    setDialogOpen(false);
    notify(`${grn.grnNumber} posted successfully.`, "success");
  };

  const metricTiles = [
    {
      label: "PO Awaiting GRN",
      value: openPoCount,
      subtitle: "Eligible for receipt",
      tone: "warning",
      icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "GRN Today",
      value: grnToday,
      subtitle: "Items received today",
      tone: "info",
      icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Units Accepted",
      value: totalAccepted,
      subtitle: "Added to inventory",
      tone: "success",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Units Rejected",
      value: totalRejected,
      subtitle: "Returned / QC issues",
      tone: "error",
      icon: <CancelOutlinedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const grnColumns: CommonColumn<GrnRecord>[] = [
    {
      field: "grnNumber",
      headerName: "GRN No",
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: "primary.main" }}
        >
          {row.grnNumber}
        </Typography>
      ),
    },
    {
      field: "poNumber",
      headerName: "PO No",
      renderCell: (row) => (
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {row.poNumber}
        </Typography>
      ),
    },
    { field: "vendor", headerName: "Vendor" },
    {
      field: "invoiceNo",
      headerName: "Invoice",
      renderCell: (row) => (
        <Typography
          variant="caption"
          sx={{ bgcolor: "action.hover", px: 1, py: 0.5, borderRadius: 1 }}
        >
          {row.invoiceNo}
        </Typography>
      ),
    },
    {
      field: "receivedAt",
      headerName: "Received At",
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(row.receivedAt)}
        </Typography>
      ),
    },
    {
      field: "receivedBy",
      headerName: "Received By",
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.receivedBy}
        </Typography>
      ),
    },
    {
      field: "items",
      headerName: "Summary",
      // align: "right",
      renderCell: (row) => {
        const acc = row.lines.reduce((s, l) => s + l.acceptedQty, 0);
        const rej = row.lines.reduce((s, l) => s + l.rejectedQty, 0);
        return (
          <Stack direction="row" spacing={1}>
            <Pill variant="success">{acc} Acc</Pill>
            {rej > 0 && <Pill variant="error">{rej} Rej</Pill>}
            <Pill>{row.lines.length} Lines</Pill>
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(row)}
            disabled={!canRead}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(row)}
            disabled={!canWrite}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Goods Receipt Note"
      subtitle="Operational console for stock receipt against purchase orders."
      currentPageTitle="GRN"
    >
      {/* <Box sx={{ px: 3, py: 3 }}> */}
      <WorkspaceHeaderCard sx={{ mb: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: "primary.main", mb: 0.5 }}
            >
              Inventory Receiving
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {eligiblePo.length} purchase orders ready for Goods Receipt Note
              (GRN) posting.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!canWrite}
            sx={{
              borderRadius: 2.5,
              px: 3,
              fontWeight: 700,
              boxShadow: (t) =>
                `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
            }}
          >
            New GRN Recording
          </Button>
        </Stack>
      </WorkspaceHeaderCard>

      <Stack spacing={3}>
        {/* Permission alerts */}
        {!canRead && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Access denied — request `inventory.grn.write` permission.
          </Alert>
        )}

        {canRead && (
          <>
            {!canWrite && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Read-only mode active.
              </Alert>
            )}

            {/* KPI tiles */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
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
                  tone={tile.tone as any}
                />
              ))}
            </Box>

            {/* Full-width Receipt History DataGrid */}
            <Box>
              {/* <PanelCard
                title="Receipt History"
                icon={<Inventory2Icon sx={{ fontSize: 20 }} />}
              > */}
              <CommonDataGrid
                showSerialNo
                columns={grnColumns}
                rows={inventoryState.grns}
                externalSearchValue={grnSearch}
                onSearchChange={setGrnSearch}
                hideSearch
                toolbarLeft={
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: "text.primary",
                      fontSize: "1.1rem",
                      mr: 2,
                    }}
                  >
                    Receipt History
                  </Typography>
                }
                toolbarRight={
                  <TextField
                    size="small"
                    placeholder="Search GRNs..."
                    value={grnSearch}
                    onChange={(e) => setGrnSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ fontSize: 18, color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: 400,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                        fontSize: "0.875rem",
                        bgcolor: "background.paper",
                      },
                    }}
                  />
                }
                emptyTitle="No receipt notes posted yet."
                emptyDescription="New GRN recordings will appear here after posting."
              />
              {/* </PanelCard> */}
            </Box>

            {/* ── GRN Recording Dialog ────────────────────────────────────────── */}
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              fullWidth
              maxWidth="lg"
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minHeight: "70vh",
                  // bgcolor: "#f8fafc",
                  boxShadow: "0 25px 60px rgba(15,23,42,0.12)",
                },
              }}
            >
              {/* ── Title ── */}
              <DialogTitle
                sx={{
                  m: 0,
                  p: 0,
                  background: "#1172BA",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 3, py: 2 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ReceiptLongIcon sx={{ color: "#fff", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
                      >
                        New Goods Receipt Note
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        Record incoming stock against a purchase order
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton
                    onClick={() => setDialogOpen(false)}
                    size="small"
                    sx={{
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.12)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </DialogTitle>

              {/* ── Content ── */}
              <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  {/* Receipt Particulars */}
                  <Paper
                    elevation={0}
                    sx={{
                      border: "1px solid rgba(17, 114, 186, 0.24)",
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "#fff",
                      mt: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderBottom: "1px solid #f1f5f9",
                        bgcolor: "#fafbfc",
                      }}
                    >
                      <ReceiptLongIcon
                        sx={{ fontSize: 16, color: "#1a6fe0" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: "#0f172a" }}
                      >
                        Receipt Particulars
                      </Typography>
                    </Stack>

                    <Box sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "repeat(3, 1fr)",
                            },
                            gap: 2,
                          }}
                        >
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Purchase Order"
                            value={selectedPoId}
                            onChange={(e) => setSelectedPoId(e.target.value)}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fafafa",
                                "&:hover fieldset": { borderColor: "#1a6fe0" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#1a6fe0",
                                },
                              },
                              "& label.Mui-focused": { color: "#1a6fe0" },
                            }}
                          >
                            {eligiblePo.map((po) => (
                              <MenuItem key={po.id} value={po.id}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 800, color: "#1a6fe0" }}
                                  >
                                    {po.poNumber}
                                  </Typography>
                                  <Divider orientation="vertical" flexItem />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {po.vendor}
                                  </Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField
                            fullWidth
                            size="small"
                            label="Invoice Number"
                            placeholder="e.g. INV-8829"
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fafafa",
                                "&:hover fieldset": { borderColor: "#1a6fe0" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#1a6fe0",
                                },
                              },
                              "& label.Mui-focused": { color: "#1a6fe0" },
                            }}
                          />

                          <TextField
                            fullWidth
                            size="small"
                            label="Received By"
                            value={receivedBy}
                            onChange={(e) => setReceivedBy(e.target.value)}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fafafa",
                                "&:hover fieldset": { borderColor: "#1a6fe0" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#1a6fe0",
                                },
                              },
                              "& label.Mui-focused": { color: "#1a6fe0" },
                            }}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          size="small"
                          label="Notes / Remarks"
                          multiline
                          minRows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Note any damage or missing items here..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "#fafafa",
                              "&:hover fieldset": { borderColor: "#1a6fe0" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#1a6fe0",
                              },
                            },
                            "& label.Mui-focused": { color: "#1a6fe0" },
                          }}
                        />
                      </Stack>
                    </Box>
                  </Paper>

                  {/* GRN Line Items */}
                  <Paper
                    elevation={0}
                    sx={{
                      border: "1px solid rgba(17, 114, 186, 0.24)",
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "#fff",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderBottom: "1px solid #f1f5f9",
                        bgcolor: "#fafbfc",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FactCheckIcon
                          sx={{ fontSize: 16, color: "#1a6fe0" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 800, color: "#0f172a" }}
                        >
                          GRN Line Items
                        </Typography>
                      </Stack>
                      {selectedPo && (
                        <Chip
                          size="small"
                          label={`Vendor: ${selectedPo.vendor}`}
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            bgcolor: "#e8f1fc",
                            color: "#1a6fe0",
                            border: "1px solid #bfdbfe",
                            height: 22,
                          }}
                        />
                      )}
                    </Stack>

                    {!selectedPo ? (
                      <Box sx={{ py: 8, textAlign: "center" }}>
                        <Inventory2Icon
                          sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Select a purchase order to begin receiving items.
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer sx={{ maxHeight: 480 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {[
                                "Item / Medication",
                                "Expected",
                                "Accepted ✓",
                                "Rejected ✕",
                                "Batch No",
                                "Expiry",
                                "Location",
                              ].map((col) => (
                                <TableCell
                                  key={col}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    color: "#64748b",
                                    bgcolor: "#f8fafc",
                                    borderBottom: "2px solid #e2e8f0",
                                    py: 1.2,
                                    px: 1.5,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {col}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingLines.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} sx={{ py: 4 }}>
                                  <Alert
                                    severity="success"
                                    sx={{ mx: 2, borderRadius: 2 }}
                                  >
                                    All items from this PO have been fully
                                    received.
                                  </Alert>
                                </TableCell>
                              </TableRow>
                            ) : (
                              pendingLines.map((line, idx) => {
                                const draft =
                                  lineDraftById[line.id] ??
                                  createEmptyLineDraft();
                                // const cellSx = { px: 1.5, py: 1 };
                                const inputSx = ({
                                  bg,
                                  border,
                                  color,
                                }: InputSxParams) => ({
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    bgcolor: bg,
                                    fontSize: "0.82rem",
                                    "& fieldset": { borderColor: border },
                                    "&:hover fieldset": { borderColor: color },
                                    "&.Mui-focused fieldset": {
                                      borderColor: color,
                                    },
                                  },
                                  "& input": {
                                    py: 0.7,
                                    px: 1,
                                    fontWeight: 700,
                                    color,
                                  },
                                });

                                return (
                                  <TableRow
                                    key={line.id}
                                    sx={{
                                      bgcolor:
                                        idx % 2 === 0 ? "#fff" : "#fafbfd",
                                      "&:hover": { bgcolor: "#f0f7ff" },
                                      transition: "background 0.15s",
                                    }}
                                  >
                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 700,
                                          color: "#0f172a",
                                        }}
                                      >
                                        {line.itemLabel}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#94a3b8" }}
                                      >
                                        ₹{line.unitCost.toFixed(2)} / unit
                                      </Typography>
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <Chip
                                        label={line.pending}
                                        // size="small"
                                        color="primary"
                                        // borderRa
                                        sx={{
                                          borderRadius: 1.4,
                                          // fontWeight: 800,
                                          // fontSize: "0.75rem",
                                          // bgcolor: "#f1f5f9",
                                          // color: "#334155",
                                          // height: 24,
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <TextField
                                        size="small"
                                        // type="number"
                                        value={draft.acceptedQty}
                                        onChange={(e) =>
                                          setLineDraftById((p) => ({
                                            ...p,
                                            [line.id]: {
                                              ...draft,
                                              acceptedQty: e.target.value,
                                            },
                                          }))
                                        }
                                        sx={{
                                          width: 76,
                                          ...inputSx({
                                            bg: "#f0fdf4",
                                            border: "#bbf7d0",
                                            color: "#15803d",
                                          }),
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <TextField
                                        size="small"
                                        // type="number"
                                        value={draft.rejectedQty}
                                        onChange={(e) =>
                                          setLineDraftById((p) => ({
                                            ...p,
                                            [line.id]: {
                                              ...draft,
                                              rejectedQty: e.target.value,
                                            },
                                          }))
                                        }
                                        sx={{
                                          width: 76,
                                          ...inputSx({
                                            bg: "#fef2f2",
                                            border: "#fecaca",
                                            color: "#dc2626",
                                          }),
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <TextField
                                        size="small"
                                        value={draft.batchNo}
                                        placeholder="B-001"
                                        onChange={(e) =>
                                          setLineDraftById((p) => ({
                                            ...p,
                                            [line.id]: {
                                              ...draft,
                                              batchNo: e.target.value,
                                            },
                                          }))
                                        }
                                        sx={{
                                          width: 100,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 1.5,
                                            bgcolor: "#fafafa",
                                            fontSize: "0.82rem",
                                          },
                                          "& input": { py: 0.7, px: 1 },
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <TextField
                                        size="small"
                                        type="date"
                                        value={draft.expiryDate}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(e) =>
                                          setLineDraftById((p) => ({
                                            ...p,
                                            [line.id]: {
                                              ...draft,
                                              expiryDate: e.target.value,
                                            },
                                          }))
                                        }
                                        sx={{
                                          width: 128,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 1.5,
                                            bgcolor: "#fafafa",
                                            fontSize: "0.82rem",
                                          },
                                          "& input": { py: 0.7, px: 1 },
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell
                                    // sx={cellSx}
                                    >
                                      <TextField
                                        size="small"
                                        value={draft.location}
                                        placeholder="Shelf-A"
                                        onChange={(e) =>
                                          setLineDraftById((p) => ({
                                            ...p,
                                            [line.id]: {
                                              ...draft,
                                              location: e.target.value,
                                            },
                                          }))
                                        }
                                        sx={{
                                          width: 90,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 1.5,
                                            bgcolor: "#fafafa",
                                            fontSize: "0.82rem",
                                          },
                                          "& input": { py: 0.7, px: 1 },
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Stack>
              </DialogContent>

              {/* ── Actions ── */}
              <DialogActions
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: "1px solid #e2e8f0",
                  bgcolor: "#fff",
                  gap: 1,
                }}
              >
                <Button
                  onClick={() => setDialogOpen(false)}
                  sx={{
                    fontWeight: 700,
                    color: "#64748b",
                    borderRadius: 2,
                    px: 3,
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={
                    !canWrite || !selectedPo || pendingLines.length === 0
                  }
                  onClick={postGrn}
                  startIcon={<LocalShippingOutlinedIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    fontWeight: 700,
                    background: "#1172BA",
                    "&.Mui-disabled": {
                      background: "#e2e8f0",
                      color: "#94a3b8",
                      boxShadow: "none",
                    },
                  }}
                >
                  Post Goods Receipt Note
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Stack>
      {/* </Box> */}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

      {/* ── View GRN Details Dialog ────────────────────────────────────────── */}
      <Dialog
        open={Boolean(viewGrn)}
        onClose={() => setViewGrn(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
            boxShadow: "0 24px 80px rgba(17, 114, 186, 0.12)",
            overflow: "hidden",
            bgcolor: "#ffffff",
          },
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1.5px solid rgba(255,255,255,0.1)",
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                fontFamily: '"DM Mono", monospace',
                mb: 0.4,
              }}
            >
              Goods Receipt Note
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Mono", monospace',
                fontWeight: 900,
                fontSize: "1.2rem",
                color: "#ffffff",
                letterSpacing: "0.04em",
              }}
            >
              {viewGrn?.grnNumber}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setViewGrn(null)}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              color: "#ffffff",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
                transform: "rotate(90deg)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {viewGrn && (
            <Stack spacing={0}>
              {/* ── Meta Info Grid ──────────────────────────────────── */}
              <Box
                sx={{
                  px: 3,
                  py: 3,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  bgcolor: "#ffffff",
                }}
              >
                {[
                  {
                    label: "PO Reference",
                    value: viewGrn.poNumber,
                    mono: true,
                    type: "primary",
                  },
                  {
                    label: "Vendor Entity",
                    value: viewGrn.vendor,
                    mono: false,
                    type: "default",
                  },
                  {
                    label: "Invoice No",
                    value: viewGrn.invoiceNo,
                    mono: true,
                    type: "info",
                  },
                  {
                    label: "Received Date",
                    value: formatDateTime(viewGrn.receivedAt),
                    mono: false,
                    type: "default",
                  },
                  {
                    label: "Processed By",
                    value: viewGrn.receivedBy,
                    mono: false,
                    type: "default",
                  },
                ].map(({ label, value, mono, type }) => (
                  <Box
                    key={label}
                    sx={{
                      p: 2,
                      border: (t) =>
                        `1.5px solid ${alpha(t.palette.primary.main, 0.08)}`,
                      borderRadius: "12px",
                      bgcolor: "#ffffff",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: "primary.light",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        fontFamily: '"DM Mono", monospace',
                        opacity: 0.6,
                        mb: 1,
                      }}
                    >
                      {label}
                    </Typography>

                    {type === "primary" || type === "info" ? (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          bgcolor: (t) =>
                            alpha(
                              type === "primary"
                                ? t.palette.primary.main
                                : t.palette.info.main,
                              0.08,
                            ),
                          border: (t) =>
                            `1px solid ${alpha(type === "primary" ? t.palette.primary.main : t.palette.info.main, 0.15)}`,
                          borderRadius: "6px",
                          px: 1.25,
                          py: 0.5,
                          fontFamily: '"DM Mono", monospace',
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          color:
                            type === "primary" ? "primary.main" : "info.main",
                        }}
                      >
                        {value}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "text.primary",
                          fontFamily: mono ? '"DM Mono", monospace' : "inherit",
                        }}
                      >
                        {value}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* ── Divider ─────────────────────────────────────────── */}
              <Box sx={{ height: "1.5px", bgcolor: "#e2e8f0" }} />

              {/* ── Items Table ─────────────────────────────────────── */}
              <Box sx={{ px: 2.5, py: 2.25, bgcolor: "#ffffff" }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "text.primary",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 18,
                      bgcolor: "primary.main",
                      borderRadius: 4,
                    }}
                  />
                  Items Received Analysis
                </Typography>

                <Box
                  sx={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                          }}
                        >
                          {[
                            "Item Particulars",
                            "Acc Qty",
                            "Rej Qty",
                            "Batch No",
                            "Expiry",
                            "Location",
                          ].map((h, i) => (
                            <TableCell
                              key={h}
                              align={i === 1 || i === 2 ? "right" : "left"}
                              sx={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "primary.main",
                                py: 1.5,
                                px: 2,
                                borderBottom: (t) =>
                                  `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewGrn.lines.map((l, idx) => (
                          <TableRow
                            key={l.id}
                            sx={{
                              bgcolor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                              "&:hover": { bgcolor: "#f0f9ff" },
                              "&:last-child td": { border: 0 },
                              transition: "background 0.15s",
                            }}
                          >
                            {/* Item */}
                            <TableCell
                              sx={{
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                py: 1,
                              }}
                            >
                              {l.itemLabel}
                            </TableCell>

                            {/* Accepted Qty */}
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: 38,
                                  px: 1,
                                  py: 0.3,
                                  borderRadius: "6px",
                                  bgcolor: "#dcfce7",
                                  color: "#15803d",
                                  fontFamily: '"DM Mono", monospace',
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  border: "1px solid #bbf7d0",
                                }}
                              >
                                {l.acceptedQty}
                              </Box>
                            </TableCell>

                            {/* Rejected Qty */}
                            <TableCell align="right" sx={{ py: 1 }}>
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: 38,
                                  px: 1,
                                  py: 0.3,
                                  borderRadius: "6px",
                                  bgcolor:
                                    l.rejectedQty > 0 ? "#fee2e2" : "#f1f5f9",
                                  color:
                                    l.rejectedQty > 0 ? "#b91c1c" : "#94a3b8",
                                  fontFamily: '"DM Mono", monospace',
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  border: `1px solid ${l.rejectedQty > 0 ? "#fecaca" : "#e2e8f0"}`,
                                }}
                              >
                                {l.rejectedQty}
                              </Box>
                            </TableCell>

                            {/* Batch No */}
                            <TableCell sx={{ py: 1 }}>
                              <Typography
                                sx={{
                                  fontFamily: '"DM Mono", monospace',
                                  fontSize: "0.74rem",
                                  fontWeight: 600,
                                  color: "#3730a3",
                                  bgcolor: "#eef2ff",
                                  border: "1px solid #c7d2fe",
                                  px: 0.75,
                                  py: 0.2,
                                  borderRadius: "4px",
                                  display: "inline-block",
                                }}
                              >
                                {l.batchNo}
                              </Typography>
                            </TableCell>

                            {/* Expiry */}
                            <TableCell sx={{ py: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.74rem",
                                  color: "#64748b",
                                  fontFamily: '"DM Mono", monospace',
                                }}
                              >
                                {l.expiryDate}
                              </Typography>
                            </TableCell>

                            {/* Location */}
                            <TableCell sx={{ py: 1 }}>
                              <Typography
                                sx={{ fontSize: "0.74rem", color: "#64748b" }}
                              >
                                {l.location}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>

              {/* ── Remarks ─────────────────────────────────────────── */}
              {viewGrn.notes && (
                <>
                  <Box sx={{ height: "1px", bgcolor: "divider", mx: 3 }} />
                  <Box sx={{ px: 3, py: 2.5, bgcolor: "#ffffff" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 16,
                          bgcolor: "warning.main",
                          borderRadius: 4,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "text.primary",
                        }}
                      >
                        Internal Processing Notes
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: (t) => alpha(t.palette.warning.main, 0.05),
                        border: (t) =>
                          `1px solid ${alpha(t.palette.warning.main, 0.15)}`,
                        borderRadius: "12px",
                        borderLeft: (t) =>
                          `5px solid ${t.palette.warning.main}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: "text.primary",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                        }}
                      >
                        "{viewGrn.notes}"
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: (t) =>
              `1px solid ${alpha(t.palette.primary.main, 0.08)}`,
            bgcolor: "#ffffff",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => setViewGrn(null)}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "#ffffff",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "0.875rem",
              textTransform: "none",
              px: 4,
              py: 1.25,
              boxShadow: (t) =>
                `0 8px 24px ${alpha(t.palette.primary.main, 0.25)}`,
              "&:hover": {
                bgcolor: "primary.dark",
                boxShadow: "0 12px 30px rgba(17,114,186,0.35)",
              },
            }}
          >
            Dismiss Detail View
          </Button>
        </Box>
      </Dialog>
    </PageTemplate>
  );
}
