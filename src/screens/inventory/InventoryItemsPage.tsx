"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { usePermission } from "@/src/core/auth/usePermission";
import {
  buildInventoryId,
  InventoryItem,
  InventoryItemStatus,
  InventoryState,
  readInventoryState,
  ScheduleClass,
  writeInventoryState,
} from "@/src/core/inventory/inventoryStore";
import {
  Category as CategoryIcon,
  Inventory2 as Inventory2Icon,
  MedicalServices as MedicalServicesIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

type ItemFilter = "All" | InventoryItemStatus;
type ToastSeverity = "success" | "info" | "warning" | "error";

interface ItemDraft {
  drugName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  route: string;
  category: string;
  scheduleClass: ScheduleClass;
  defaultUnit: string;
  reorderLevel: string;
  unitCost: string;
  preferredVendor: string;
}

interface ToastState {
  open: boolean;
  msg: string;
  severity: ToastSeverity;
}

const EMPTY_DRAFT: ItemDraft = {
  drugName: "",
  genericName: "",
  strength: "",
  dosageForm: "Tablet",
  route: "Oral",
  category: "",
  scheduleClass: "Rx",
  defaultUnit: "unit",
  reorderLevel: "",
  unitCost: "",
  preferredVendor: "",
};

function buildItemCode(items: InventoryItem[]): string {
  const serial = items.length + 1;
  return `DRG-${String(serial).padStart(4, "0")}`;
}

function toDraft(item: InventoryItem): ItemDraft {
  return {
    drugName: item.drugName,
    genericName: item.genericName,
    strength: item.strength,
    dosageForm: item.dosageForm,
    route: item.route,
    category: item.category,
    scheduleClass: item.scheduleClass,
    defaultUnit: item.defaultUnit,
    reorderLevel: String(item.reorderLevel),
    unitCost: String(item.unitCost),
    preferredVendor: item.preferredVendor,
  };
}

export default function InventoryItemsPage() {
  const router = useRouter();
  const permissionGate = usePermission();

  const canRead =
    permissionGate("inventory.items.read") || permissionGate("inventory.*");
  const canWrite =
    permissionGate("inventory.items.write") || permissionGate("inventory.*");

  const [inventoryState, setInventoryState] = React.useState<InventoryState>(
    () => readInventoryState(),
  );
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<ItemFilter>("All");
  const [scheduleFilter, setScheduleFilter] = React.useState<
    "All" | ScheduleClass
  >("All");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [draft, setDraft] = React.useState<ItemDraft>(EMPTY_DRAFT);

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

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...inventoryState.items]
      .filter((item) => {
        if (filter !== "All" && item.status !== filter) return false;
        if (scheduleFilter !== "All" && item.scheduleClass !== scheduleFilter)
          return false;

        if (!q) return true;

        return (
          item.itemCode.toLowerCase().includes(q) ||
          item.drugName.toLowerCase().includes(q) ||
          item.genericName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.preferredVendor.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.drugName.localeCompare(b.drugName));
  }, [filter, inventoryState.items, scheduleFilter, search]);

  const activeCount = inventoryState.items.filter(
    (item) => item.status === "Active",
  ).length;
  const inactiveCount = inventoryState.items.filter(
    (item) => item.status === "Inactive",
  ).length;
  const controlledCount = inventoryState.items.filter(
    (item) => item.scheduleClass === "Controlled",
  ).length;

  const openCreate = () => {
    if (!canWrite) {
      notify("You are in read-only mode for item master updates.", "warning");
      return;
    }

    setEditingId("");
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    if (!canWrite) {
      notify("You are in read-only mode for item master updates.", "warning");
      return;
    }

    setEditingId(item.id);
    setDraft(toDraft(item));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId("");
    setDraft(EMPTY_DRAFT);
  };

  const saveItem = () => {
    if (!canWrite) {
      notify("You are in read-only mode for item master updates.", "warning");
      return;
    }

    if (
      !draft.drugName.trim() ||
      !draft.strength.trim() ||
      !draft.category.trim()
    ) {
      notify("Drug name, strength, and category are required.", "warning");
      return;
    }

    const reorderLevel = Number(draft.reorderLevel);
    const unitCost = Number(draft.unitCost);

    if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
      notify("Reorder level must be a valid number.", "warning");
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      notify("Unit cost must be a valid number.", "warning");
      return;
    }

    setInventoryState((prev) => {
      if (editingId) {
        const items = prev.items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                drugName: draft.drugName.trim(),
                genericName: draft.genericName.trim(),
                strength: draft.strength.trim(),
                dosageForm: draft.dosageForm,
                route: draft.route,
                category: draft.category.trim(),
                scheduleClass: draft.scheduleClass,
                defaultUnit: draft.defaultUnit.trim() || "unit",
                reorderLevel,
                unitCost,
                preferredVendor: draft.preferredVendor.trim(),
                updatedAt: new Date().toISOString(),
              }
            : item,
        );

        return {
          ...prev,
          items,
        };
      }

      const id = buildInventoryId("itm");
      const nextItem: InventoryItem = {
        id,
        itemCode: buildItemCode(prev.items),
        drugName: draft.drugName.trim(),
        genericName: draft.genericName.trim(),
        strength: draft.strength.trim(),
        dosageForm: draft.dosageForm,
        route: draft.route,
        category: draft.category.trim(),
        scheduleClass: draft.scheduleClass,
        defaultUnit: draft.defaultUnit.trim() || "unit",
        reorderLevel,
        unitCost,
        preferredVendor: draft.preferredVendor.trim(),
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        items: [nextItem, ...prev.items],
        stock: [
          {
            id: buildInventoryId("stk"),
            itemId: id,
            onHand: 0,
            reserved: 0,
            location: "NEW-STOCK",
            nextExpiry: "",
            updatedAt: new Date().toISOString(),
          },
          ...prev.stock,
        ],
      };
    });

    notify(
      editingId ? "Item master updated." : "New drug added to item master.",
      "success",
    );
    closeDialog();
  };

  const toggleStatus = (item: InventoryItem) => {
    if (!canWrite) {
      notify("You are in read-only mode for item master updates.", "warning");
      return;
    }

    setInventoryState((prev) => ({
      ...prev,
      items: prev.items.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              status: entry.status === "Active" ? "Inactive" : "Active",
              updatedAt: new Date().toISOString(),
            }
          : entry,
      ),
    }));

    notify(
      item.status === "Active"
        ? "Item moved to inactive list."
        : "Item reactivated.",
      item.status === "Active" ? "warning" : "success",
    );
  };

  const metricTiles = [
    {
      label: "Total Drugs",
      value: inventoryState.items.length,
      subtitle: "Master catalog items",
      icon: <Inventory2Icon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Active",
      value: activeCount,
      subtitle: "Usable in workflows",
      icon: <MedicalServicesIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Inactive",
      value: inactiveCount,
      subtitle: "Hidden from ordering",
      icon: <CategoryIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Controlled",
      value: controlledCount,
      subtitle: "Regulated schedule",
      icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const itemColumns = React.useMemo<CommonColumn<InventoryItem>[]>(
    () => [
      {
        field: "itemCode",
        headerName: "Item Code",
        width: 120,
        renderCell: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.itemCode}
          </Typography>
        ),
      },
      { field: "drugName", headerName: "Drug", width: 220 },
      {
        field: "genericName",
        headerName: "Generic",
        // width: 180,
        renderCell: (row) => row.genericName || "--",
      },
      { field: "strength", headerName: "Strength", width: 120 },
      { field: "category", headerName: "Category", width: 140 },
      {
        field: "scheduleClass",
        headerName: "Schedule",
        width: 120,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.scheduleClass}
            color={row.scheduleClass === "Controlled" ? "error" : "default"}
          />
        ),
      },
      { field: "reorderLevel", headerName: "Reorder", width: 100 },
      {
        field: "preferredVendor",
        headerName: "Vendor",
        // width: 160,
        renderCell: (row) => row.preferredVendor || "--",
      },
      {
        field: "status",
        headerName: "Status",
        // width: 110,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.status}
            color={row.status === "Active" ? "success" : "warning"}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 350,
        align: "center",
        headerAlign: "center",
        renderCell: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color={row.status === "Active" ? "warning" : "success"}
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(row);
              }}
            >
              {row.status === "Active" ? "Inactivate" : "Activate"}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/inventory/purchase-orders?item=${row.id}`);
              }}
            >
              Create PO
            </Button>
          </Stack>
        ),
      },
    ],
    [router],
  );

  return (
    <PageTemplate
      title="Inventory Items"
      subtitle="Drug master for pharmacy and procurement workflow. New drug onboarding starts here."
      currentPageTitle="Items"
      fullHeight
    >
      {/* <Box sx={{  }} */}
         <Stack
                spacing={1.25}
                sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
              >
          {!canRead ? (
            <Alert severity="error">
              You do not have access to Inventory Item Master. Request
              `inventory.items.read`.
            </Alert>
          ) : null}

          {canRead ? (
            <>
              {!canWrite ? (
                <Alert severity="info">
                  You are in read-only mode for item master.
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
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

              <CommonDataGrid<InventoryItem>
                rows={filteredItems}
                columns={itemColumns}
                getRowId={(row) => row.id}
                searchPlaceholder="Search by code / drug / generic / vendor"
                externalSearchValue={search}
                onSearchChange={setSearch}
                filterDropdowns={[
                  {
                    id: "status-filter",
                    placeholder: "Status",
                    value: filter,
                    options: ["All", "Active", "Inactive"],
                    onChange: (v) => setFilter(v as ItemFilter),
                  },
                  {
                    id: "schedule-filter",
                    placeholder: "Schedule",
                    value: scheduleFilter,
                    options: ["All", "OTC", "Rx", "Controlled"],
                    onChange: (v) => setScheduleFilter(v as any),
                  },
                ]}
                toolbarRight={
                  <Button
                    variant="contained"
                    onClick={openCreate}
                    sx={{ borderRadius: 2 }}
                  >
                    + New Drug
                  </Button>
                }
              />
            </>
          ) : null}
        </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? "Edit Drug Master" : "Add New Drug"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Drug Name"
                size="small"
                value={draft.drugName}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    drugName: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label="Generic Name"
                size="small"
                value={draft.genericName}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    genericName: event.target.value,
                  }))
                }
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Strength"
                size="small"
                value={draft.strength}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    strength: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label="Category"
                size="small"
                value={draft.category}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                select
                fullWidth
                label="Dosage Form"
                size="small"
                value={draft.dosageForm}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    dosageForm: event.target.value,
                  }))
                }
              >
                {[
                  "Tablet",
                  "Capsule",
                  "Injection",
                  "Syrup",
                  "Ointment",
                  "Vial",
                  "Solution",
                ].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Route"
                size="small"
                value={draft.route}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, route: event.target.value }))
                }
              >
                {["Oral", "IV", "IM", "SC", "Topical", "Inhalation"].map(
                  (value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ),
                )}
              </TextField>
              <TextField
                select
                fullWidth
                label="Schedule"
                size="small"
                value={draft.scheduleClass}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    scheduleClass: event.target.value as ScheduleClass,
                  }))
                }
              >
                {(["OTC", "Rx", "Controlled"] as const).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Default Unit"
                size="small"
                value={draft.defaultUnit}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    defaultUnit: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                size="small"
                value={draft.reorderLevel}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    reorderLevel: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label="Unit Cost"
                type="number"
                size="small"
                value={draft.unitCost}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    unitCost: event.target.value,
                  }))
                }
              />
            </Stack>

            <TextField
              fullWidth
              label="Preferred Vendor"
              size="small"
              value={draft.preferredVendor}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  preferredVendor: event.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveItem}>
            {editingId ? "Save Changes" : "Create Item"}
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
