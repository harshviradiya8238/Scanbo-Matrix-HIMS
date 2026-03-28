"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { usePermission } from "@/src/core/auth/usePermission";
import {
  buildInventoryId,
  getItemLabel,
  InventoryItem,
  InventoryItemStatus,
  InventoryState,
  readInventoryState,
  writeInventoryState,
} from "@/src/core/inventory/inventoryStore";
import {
  FilterList as FilterListIcon,
  Inventory2 as Inventory2Icon,
  LocalShipping as LocalShippingIcon,
  Medication as MedicationIcon,
  ReceiptLong as ReceiptLongIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";

type StockHealth = "Normal" | "Low Stock" | "Out of Stock";
type StockFilter = "All" | StockHealth | "Expiring Soon";
type StatusFilter = "All" | InventoryItemStatus;
type AdjustmentType = "Increase" | "Decrease" | "Set";
type ToastSeverity = "success" | "info" | "warning" | "error";

interface StockViewRow {
  item: InventoryItem;
  onHand: number;
  reserved: number;
  location: string;
  nextExpiry: string;
  _searchText: string;
}

interface ToastState {
  open: boolean;
  msg: string;
  severity: ToastSeverity;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function stockHealth(row: StockViewRow): StockHealth {
  if (row.onHand <= 0) return "Out of Stock";
  if (row.onHand <= row.item.reorderLevel) return "Low Stock";
  return "Normal";
}

function daysToExpiry(nextExpiry: string): number {
  const parsed = Date.parse(nextExpiry);
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;

  const diffMs = parsed - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function isExpiringSoon(nextExpiry: string): boolean {
  const days = daysToExpiry(nextExpiry);
  return days <= 45;
}

// ─── CommonTable columns (no built-in filters – filtering handled by Drawer) ──

function stockTableColumns(
  openAdjust: (itemId: string) => void,
  router: ReturnType<typeof useRouter>,
): CommonColumn<StockViewRow>[] {
  return [
    {
      field: "code",
      headerName: "Code",
      width: 120,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {row.item.itemCode}
        </Typography>
      ),
    },
    {
      field: "drug",
      headerName: "Drug",
      width: 180,
      renderCell: (row) => getItemLabel(row.item),
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (row) => row.item.category,
    },
    {
      field: "status",
      headerName: "Status",
      // width: 100,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.item.status}
          color={row.item.status === "Active" ? "success" : "warning"}
        />
      ),
    },
    {
      field: "onHand",
      headerName: "On Hand",
      align: "right",
      // width: 100,
      renderCell: (row) => row.onHand,
    },
    {
      field: "reserved",
      headerName: "Reserved",
      align: "right",
      // width: 100,
      renderCell: (row) => row.reserved,
    },
    {
      field: "reorder",
      headerName: "Reorder",
      align: "right",
      // width: 100,
      renderCell: (row) => row.item.reorderLevel,
    },
    {
      field: "coverage",
      headerName: "Coverage",
      // width: 160,
      renderCell: (row) => {
        const health = stockHealth(row);
        const coverage =
          row.item.reorderLevel > 0
            ? Math.min(
                100,
                Math.round((row.onHand / row.item.reorderLevel) * 100),
              )
            : 0;
        return (
          <Box sx={{}}>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, coverage)}
              color={
                health === "Out of Stock"
                  ? "error"
                  : health === "Low Stock"
                    ? "warning"
                    : "success"
              }
              sx={{ height: 7, borderRadius: 99 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {coverage}% of reorder
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "health",
      headerName: "Health",
      // width: 120,
      renderCell: (row) => {
        const health = stockHealth(row);
        return (
          <Chip
            size="small"
            label={health}
            color={
              health === "Out of Stock"
                ? "error"
                : health === "Low Stock"
                  ? "warning"
                  : "success"
            }
          />
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      // width: 120,
      renderCell: (row) => row.location || "--",
    },
    {
      field: "expiry",
      headerName: "Expiry",
      // width: 140,
      renderCell: (row) => {
        if (!row.nextExpiry) return "--";
        const days = daysToExpiry(row.nextExpiry);
        return (
          <Chip
            size="small"
            label={
              days < 0
                ? "Expired"
                : days <= 45
                  ? `Expiring in ${days}d`
                  : row.nextExpiry
            }
            color={days < 0 ? "error" : days <= 45 ? "warning" : "default"}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      align: "right",
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={() => openAdjust(row.item.id)}
          >
            Adjust
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() =>
              router.push(`/inventory/purchase-orders?item=${row.item.id}`)
            }
          >
            Request PO
          </Button>
        </Stack>
      ),
    },
  ];
}

export default function PharmacyStockPage() {
  const router = useRouter();
  const permissionGate = usePermission();

  const canRead =
    permissionGate("pharmacy.stock.read") ||
    permissionGate("inventory.items.read") ||
    permissionGate("inventory.*");
  const canWrite =
    permissionGate("pharmacy.stock.write") ||
    permissionGate("inventory.items.write") ||
    permissionGate("inventory.*");

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(
    () => readInventoryState(),
  );
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [healthFilter, setHealthFilter] = React.useState<StockFilter>("All");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");
  // Draft values inside the drawer (applied on "Apply")
  const [draftHealth, setDraftHealth] = React.useState<StockFilter>("All");
  const [draftStatus, setDraftStatus] = React.useState<StatusFilter>("All");

  const [adjustItemId, setAdjustItemId] = React.useState("");
  const [adjustType, setAdjustType] =
    React.useState<AdjustmentType>("Increase");
  const [adjustQty, setAdjustQty] = React.useState("");
  const [adjustReason, setAdjustReason] = React.useState("");

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

  const stockRows = React.useMemo<StockViewRow[]>(() => {
    return inventoryState.items.map((item) => {
      const stockRow = inventoryState.stock.find(
        (row) => row.itemId === item.id,
      );
      return {
        item,
        onHand: stockRow?.onHand ?? 0,
        reserved: stockRow?.reserved ?? 0,
        location: stockRow?.location ?? "UNASSIGNED",
        nextExpiry: stockRow?.nextExpiry ?? "",
        _searchText: [
          item.itemCode,
          item.drugName,
          item.genericName,
          stockRow?.location,
          item.preferredVendor,
        ]
          .join(" ")
          .toLowerCase(),
      };
    });
  }, [inventoryState.items, inventoryState.stock]);

  const filteredRows = React.useMemo(() => {
    return [...stockRows]
      .filter((row) => {
        const health = stockHealth(row);
        if (healthFilter !== "All") {
          if (
            healthFilter === "Expiring Soon" &&
            !isExpiringSoon(row.nextExpiry)
          )
            return false;
          if (healthFilter !== "Expiring Soon" && health !== healthFilter)
            return false;
        }
        if (statusFilter !== "All" && row.item.status !== statusFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        const scoreA =
          stockHealth(a) === "Out of Stock"
            ? 0
            : stockHealth(a) === "Low Stock"
              ? 1
              : 2;
        const scoreB =
          stockHealth(b) === "Out of Stock"
            ? 0
            : stockHealth(b) === "Low Stock"
              ? 1
              : 2;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.item.drugName.localeCompare(b.item.drugName);
      });
  }, [healthFilter, statusFilter, stockRows]);

  const activeFilterCount =
    (healthFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const totalSkus = stockRows.length;
  const activeSkus = stockRows.filter(
    (row) => row.item.status === "Active",
  ).length;
  const lowStock = stockRows.filter(
    (row) => stockHealth(row) === "Low Stock",
  ).length;
  const outOfStock = stockRows.filter(
    (row) => stockHealth(row) === "Out of Stock",
  ).length;
  const expiringSoon = stockRows.filter((row) =>
    isExpiringSoon(row.nextExpiry),
  ).length;
  const onHandValue = stockRows.reduce(
    (sum, row) => sum + row.onHand * row.item.unitCost,
    0,
  );

  const selectedAdjustRow =
    stockRows.find((row) => row.item.id === adjustItemId) ?? null;

  const openAdjust = (itemId: string) => {
    if (!canWrite) {
      notify("You are in read-only mode for stock adjustments.", "warning");
      return;
    }

    setAdjustItemId(itemId);
    setAdjustType("Increase");
    setAdjustQty("");
    setAdjustReason("");
  };

  const closeAdjust = () => {
    setAdjustItemId("");
    setAdjustQty("");
    setAdjustReason("");
  };

  const submitAdjustment = () => {
    if (!selectedAdjustRow) return;
    if (!canWrite) {
      notify("You are in read-only mode for stock adjustments.", "warning");
      return;
    }

    const qty = Number(adjustQty);
    if (!Number.isFinite(qty) || qty < 0) {
      notify("Quantity should be a valid positive number.", "warning");
      return;
    }
    if (!adjustReason.trim()) {
      notify("Adjustment reason is required.", "warning");
      return;
    }

    setInventoryState((prev) => {
      const stock = [...prev.stock];
      const idx = stock.findIndex(
        (row) => row.itemId === selectedAdjustRow.item.id,
      );

      if (idx >= 0) {
        const current = stock[idx];
        let nextOnHand = current.onHand;

        if (adjustType === "Increase") nextOnHand = current.onHand + qty;
        if (adjustType === "Decrease")
          nextOnHand = Math.max(0, current.onHand - qty);
        if (adjustType === "Set") nextOnHand = qty;

        stock[idx] = {
          ...current,
          onHand: nextOnHand,
          updatedAt: new Date().toISOString(),
        };
      } else {
        stock.push({
          id: buildInventoryId("stk"),
          itemId: selectedAdjustRow.item.id,
          onHand: adjustType === "Decrease" ? 0 : qty,
          reserved: 0,
          location: "MAIN-STORE",
          nextExpiry: "",
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        stock,
      };
    });

    notify("Stock adjusted successfully.", "success");
    closeAdjust();
  };

  const metricTiles = [
    {
      label: "Total SKUs",
      value: totalSkus,
      subtitle: "In inventory catalog",
      icon: <Inventory2Icon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Active SKUs",
      value: activeSkus,
      subtitle: "Available for dispensing",
      icon: <MedicationIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Low / OOS",
      value: `${lowStock} / ${outOfStock}`,
      subtitle: "Needs restock attention",
      icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Expiring <= 45d",
      value: expiringSoon,
      subtitle: "Monitor FEFO movement",
      icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "On-hand Value",
      value: formatCurrency(onHandValue),
      subtitle: "Current stock valuation",
      icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <PageTemplate
      title="Pharmacy Stock"
      subtitle="Operational stock console linked to Inventory Item Master, PO, and GRN workflow."
      currentPageTitle="Stock"
    >
      <Box sx={{ }}>
        <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
          {!canRead ? (
            <Alert severity="error">
              You do not have access to Pharmacy Stock. Request
              `pharmacy.stock.read`.
            </Alert>
          ) : null}

          {canRead ? (
            <>
              {!canWrite ? (
                <Alert severity="info">
                  You are in read-only mode for stock corrections.
                </Alert>
              ) : null}

              <Alert severity="info">
                New drug onboarding happens in <strong>Inventory Items</strong>.
                New stock receipt happens via
                <strong> GRN</strong>. Use this screen for monitoring and
                controlled adjustments.
              </Alert>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                    xl: "repeat(5, minmax(0, 1fr))",
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

              {/* <Box sx={{ mt: 2 }}> */}
              <CommonDataGrid<StockViewRow>
                rows={filteredRows}
                columns={stockTableColumns(openAdjust, router)}
                getRowId={(row) => row.item.id}
                searchPlaceholder="Search by code / drug / generic / location..."
                searchFields={["_searchText"]}
                emptyTitle="No stock rows match current filters."
                emptyDescription=""
                toolbarLeft={
                  hasActiveFilters ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      sx={{ ml: 2 }}
                    >
                      {healthFilter !== "All" && (
                        <Chip
                          size="small"
                          label={`Health: ${healthFilter}`}
                          onDelete={() => setHealthFilter("All")}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {statusFilter !== "All" && (
                        <Chip
                          size="small"
                          label={`Status: ${statusFilter}`}
                          onDelete={() => setStatusFilter("All")}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        sx={{ ml: 0.5, fontWeight: 600, fontSize: 12 }}
                        onClick={() => {
                          setHealthFilter("All");
                          setStatusFilter("All");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Stack>
                  ) : null
                }
                toolbarRight={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Badge badgeContent={activeFilterCount} color="primary">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FilterListIcon />}
                        onClick={() => {
                          setDraftHealth(healthFilter);
                          setDraftStatus(statusFilter);
                          setFilterDrawerOpen(true);
                        }}
                      >
                        Filter
                      </Button>
                    </Badge>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/inventory/items")}
                    >
                      Item Master
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/inventory/grn")}
                    >
                      Receive (GRN)
                    </Button>
                  </Stack>
                }
              />
              {/* </Box> */}

              {/* ── Filter Drawer ─────────────────────────────────────── */}
              <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{
                  sx: {
                    width: 320,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
              >
                {/* Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FilterListIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Filters
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => setFilterDrawerOpen(false)}
                  >
                    ✕
                  </IconButton>
                </Stack>

                {/* Filter fields */}
                <Stack spacing={2.5} sx={{ px: 3, py: 3, flex: 1 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Stock Health"
                    value={draftHealth}
                    onChange={(e) =>
                      setDraftHealth(e.target.value as StockFilter)
                    }
                  >
                    {(
                      [
                        "All",
                        "Normal",
                        "Low Stock",
                        "Out of Stock",
                        "Expiring Soon",
                      ] as const
                    ).map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Item Status"
                    value={draftStatus}
                    onChange={(e) =>
                      setDraftStatus(e.target.value as StatusFilter)
                    }
                  >
                    {(["All", "Active", "Inactive"] as const).map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                {/* Footer actions */}
                <Divider />
                <Stack direction="row" spacing={1.5} sx={{ px: 3, py: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setDraftHealth("All");
                      setDraftStatus("All");
                      setHealthFilter("All");
                      setStatusFilter("All");
                      setFilterDrawerOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      setHealthFilter(draftHealth);
                      setStatusFilter(draftStatus);
                      setFilterDrawerOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Drawer>
            </>
          ) : null}
        </Stack>
      </Box>

      <Dialog
        open={Boolean(selectedAdjustRow)}
        onClose={closeAdjust}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Stock Adjustment</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <TextField
              label="Drug"
              size="small"
              value={
                selectedAdjustRow ? getItemLabel(selectedAdjustRow.item) : ""
              }
              InputProps={{ readOnly: true }}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                select
                fullWidth
                label="Type"
                size="small"
                value={adjustType}
                onChange={(event) =>
                  setAdjustType(event.target.value as AdjustmentType)
                }
              >
                {(["Increase", "Decrease", "Set"] as const).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                size="small"
                value={adjustQty}
                onChange={(event) => setAdjustQty(event.target.value)}
              />
            </Stack>
            <TextField
              label="Reason"
              size="small"
              multiline
              minRows={2}
              value={adjustReason}
              onChange={(event) => setAdjustReason(event.target.value)}
              placeholder="Cycle count correction, wastage, emergency adjustment"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdjust}>Cancel</Button>
          <Button variant="contained" onClick={submitAdjustment}>
            Save
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
