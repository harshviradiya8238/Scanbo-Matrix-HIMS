"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  Science as ScienceIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addEncounterOrder,
  removeEncounterOrder,
  updateEncounter,
  updateEncounterOrder,
} from "@/src/store/slices/opdSlice";
import {
  OpdEncounterCase,
  OrderCatalogItem,
  OpdEncounterOrder,
} from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

interface DraftOrderLine {
  id: string;
  catalogId: string;
  orderName: string;
  category: OrderCatalogItem["category"];
  priority: "Routine" | "Urgent";
  instructions: string;
}

interface OrdersTabProps {
  encounter: OpdEncounterCase | undefined;
  canPlaceOrders: boolean;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
}

const ORDER_CATALOG: OrderCatalogItem[] = [
  {
    id: "ord-1",
    name: "CBC (Complete Blood Count)",
    category: "Lab",
    defaultPriority: "Routine",
  },
  { id: "ord-2", name: "HbA1c", category: "Lab", defaultPriority: "Routine" },
  {
    id: "ord-3",
    name: "Liver Function Test (LFT)",
    category: "Lab",
    defaultPriority: "Routine",
  },
  {
    id: "ord-4",
    name: "Renal Function Test (RFT)",
    category: "Lab",
    defaultPriority: "Routine",
  },
  {
    id: "ord-5",
    name: "Chest X-Ray AP/PA",
    category: "Radiology",
    defaultPriority: "Routine",
  },
  {
    id: "ord-6",
    name: "USG Abdomen",
    category: "Radiology",
    defaultPriority: "Routine",
  },
  {
    id: "ord-8",
    name: "MRI Brain",
    category: "Radiology",
    defaultPriority: "Routine",
  },
];

const ORDER_CATEGORIES = ["All", "Lab", "Radiology", "Procedure"];

const buildOrderLineFromCatalog = (
  item?: OrderCatalogItem,
): DraftOrderLine => ({
  id: `order-line-${Date.now()}`,
  catalogId: item?.id ?? "",
  orderName: item?.name ?? "",
  category: item?.category ?? "Lab",
  priority: item?.defaultPriority ?? "Routine",
  instructions: "",
});

export default function OrdersTab({
  encounter,
  canPlaceOrders,
  setSnackbar,
  guardRoleAction,
}: OrdersTabProps) {
  const dispatch = useAppDispatch();
  const allOrders = useAppSelector((state) => state.opd.orders);

  const encounterOrders = React.useMemo(() => {
    if (!encounter) return [];
    return (allOrders as OpdEncounterOrder[]).filter(
      (item) => item.encounterId === encounter.id,
    );
  }, [allOrders, encounter?.id]);

  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [orderCategoryFilter, setOrderCategoryFilter] = React.useState("All");
  const [orderSearchQuery, setOrderSearchQuery] = React.useState("");
  const [orderDraft, setOrderDraft] = React.useState<DraftOrderLine>(() =>
    buildOrderLineFromCatalog(ORDER_CATALOG[0]),
  );
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(
    null,
  );

  const filteredOrderCatalog = React.useMemo(
    () =>
      ORDER_CATALOG.filter(
        (item) =>
          (orderCategoryFilter === "All" ||
            item.category === orderCategoryFilter) &&
          (item.name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            item.category
              .toLowerCase()
              .includes(orderSearchQuery.toLowerCase())),
      ),
    [orderCategoryFilter, orderSearchQuery],
  );

  const openOrderDialog = () => {
    if (
      !guardRoleAction(
        canPlaceOrders,
        "manage encounter orders in this consultation",
      )
    )
      return;
    setEditingOrderId(null);
    setOrderDraft(buildOrderLineFromCatalog(ORDER_CATALOG[0]));
    setOrderDialogOpen(true);
  };

  const closeOrderDialog = () => {
    setOrderDialogOpen(false);
    setEditingOrderId(null);
  };

  const handleAddOrderFromCatalog = (item: OrderCatalogItem) => {
    setOrderDraft(buildOrderLineFromCatalog(item));
    setEditingOrderId(null);
  };

  const handleEditOrder = (orderId: string) => {
    if (!guardRoleAction(canPlaceOrders, "edit encounter orders")) return;
    const selected = encounterOrders.find((item) => item.id === orderId);
    if (!selected) return;
    const fromCatalog = ORDER_CATALOG.find(
      (item) => item.name === selected.orderName,
    );
    setOrderDraft({
      id: selected.id,
      catalogId: fromCatalog?.id ?? "",
      orderName: selected.orderName,
      category: selected.category,
      priority: selected.priority,
      instructions: selected.instructions || "",
    });
    setEditingOrderId(selected.id);
    setOrderDialogOpen(true);
  };

  const handleRemoveOrder = (orderId: string) => {
    if (!guardRoleAction(canPlaceOrders, "remove encounter orders")) return;
    dispatch(removeEncounterOrder(orderId));
    setSnackbar({
      open: true,
      message: "Order removed.",
      severity: "success",
    });
  };

  const handleSaveOrder = () => {
    if (!guardRoleAction(canPlaceOrders, "save encounter orders")) return;
    if (!encounter) return;
    const selectedCatalog = ORDER_CATALOG.find(
      (item) => item.id === orderDraft.catalogId,
    );
    if (!selectedCatalog) {
      setSnackbar({
        open: true,
        message: "Select an order from catalog.",
        severity: "error",
      });
      return;
    }

    const orderedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (editingOrderId) {
      dispatch(
        updateEncounterOrder({
          id: editingOrderId,
          changes: {
            orderName: selectedCatalog.name,
            category: selectedCatalog.category,
            priority: orderDraft.priority,
            instructions: orderDraft.instructions,
            orderedAt,
          },
        }),
      );
      closeOrderDialog();
      setSnackbar({
        open: true,
        message: "Order updated successfully.",
        severity: "success",
      });
      return;
    }

    dispatch(
      addEncounterOrder({
        id: `order-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        orderName: selectedCatalog.name,
        category: selectedCatalog.category,
        priority: orderDraft.priority,
        status: "Pending",
        instructions: orderDraft.instructions,
        orderedAt,
      }),
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: "IN_PROGRESS" },
      }),
    );

    closeOrderDialog();
    setSnackbar({
      open: true,
      message: "Order added successfully.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={1.2}>
      <OpdTable
        title="Orders"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScienceIcon />}
            disabled={!canPlaceOrders}
            onClick={openOrderDialog}
          >
            Manage Orders
          </Button>
        }
        rows={encounterOrders}
        emptyMessage="No orders on this encounter."
        rowKey={(row) => (row as OpdEncounterOrder).id}
        variant="card"
        columns={[
          {
            id: "name",
            label: "Order",
            render: (row) => (row as OpdEncounterOrder).orderName,
          },
          {
            id: "category",
            label: "Category",
            render: (row) => (row as OpdEncounterOrder).category,
          },
          {
            id: "priority",
            label: "Priority",
            render: (row) => (row as OpdEncounterOrder).priority,
          },
          {
            id: "status",
            label: "Status",
            render: (row) => (
              <Typography
                variant="caption"
                sx={{
                  color:
                    (row as OpdEncounterOrder).status === "Pending"
                      ? "warning.main"
                      : "success.main",
                  fontWeight: 700,
                }}
              >
                {(row as OpdEncounterOrder).status}
              </Typography>
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit order"
                  disabled={!canPlaceOrders}
                  onClick={() => handleEditOrder((row as OpdEncounterOrder).id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Remove order"
                  color="error"
                  disabled={!canPlaceOrders}
                  onClick={() =>
                    handleRemoveOrder((row as OpdEncounterOrder).id)
                  }
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <CommonDialog
        open={orderDialogOpen}
        onClose={closeOrderDialog}
        maxWidth="md"
        title={editingOrderId ? "Edit Order" : "Place New Orders"}
        icon={<ScienceIcon fontSize="small" />}
        contentDividers
        content={
          <Grid container spacing={2}>
            {!editingOrderId && (
              <Grid item xs={12} md={5}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      select
                      size="small"
                      label="Category"
                      value={orderCategoryFilter}
                      onChange={(e) => setOrderCategoryFilter(e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      {ORDER_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      placeholder="Search catalog..."
                      fullWidth
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </Stack>
                  <Stack
                    spacing={0.5}
                    sx={{
                      maxHeight: 300,
                      overflowY: "auto",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    {filteredOrderCatalog.map((item) => (
                      <Button
                        key={item.id}
                        variant={
                          orderDraft.catalogId === item.id
                            ? "contained"
                            : "text"
                        }
                        size="small"
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          py: 0.75,
                        }}
                        onClick={() => handleAddOrderFromCatalog(item)}
                      >
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="inherit"
                            sx={{ opacity: 0.8 }}
                          >
                            {item.category}
                          </Typography>
                        </Stack>
                      </Button>
                    ))}
                    {filteredOrderCatalog.length === 0 && (
                      <Typography
                        variant="caption"
                        sx={{ p: 1, textAlign: "center" }}
                      >
                        No orders match search
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} md={editingOrderId ? 12 : 7}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Order Details
                </Typography>
                <TextField
                  fullWidth
                  disabled
                  label="Selected Order"
                  value={orderDraft.orderName || "Select an order from catalog"}
                />
                <Stack direction="row" spacing={1.2}>
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    value={orderDraft.priority}
                    onChange={(e) =>
                      setOrderDraft((p: any) => ({
                        ...p,
                        priority: e.target.value as DraftOrderLine["priority"],
                      }))
                    }
                  >
                    {["Routine", "Urgent"].map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    disabled
                    label="Category"
                    value={orderDraft.category || "--"}
                  />
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Instructions / Reason"
                  value={orderDraft.instructions}
                  onChange={(e) =>
                    setOrderDraft((p: any) => ({
                      ...p,
                      instructions: e.target.value,
                    }))
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        }
        actions={
          <>
            <Button onClick={closeOrderDialog}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<ScienceIcon />}
              onClick={handleSaveOrder}
            >
              {editingOrderId ? "Update Order" : "Place Order"}
            </Button>
          </>
        }
      />
    </Stack>
  );
}
