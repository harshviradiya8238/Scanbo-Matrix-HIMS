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
import { OpdEncounterCase, OpdEncounterOrder } from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

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
  frequency: "Once",
  duration: "",
});

import {
  CommonOrderDialog,
  DraftOrderLine,
  OrderCatalogItem,
} from "../../../../../clinical/components/CommonOrderDialog";

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
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(
    null,
  );
  const [orderInitialData, setOrderInitialData] =
    React.useState<DraftOrderLine | null>(null);

  const openOrderDialog = () => {
    if (
      !guardRoleAction(
        canPlaceOrders,
        "manage encounter orders in this consultation",
      )
    )
      return;
    setEditingOrderId(null);
    setOrderInitialData(null);
    setOrderDialogOpen(true);
  };

  const closeOrderDialog = () => {
    setOrderDialogOpen(false);
    setEditingOrderId(null);
    setOrderInitialData(null);
  };

  const handleEditOrder = (orderId: string) => {
    if (!guardRoleAction(canPlaceOrders, "edit encounter orders")) return;
    const selected = encounterOrders.find((item) => item.id === orderId);
    if (!selected) return;
    const fromCatalog = ORDER_CATALOG.find(
      (item) => item.name === selected.orderName,
    );
    setOrderInitialData({
      id: selected.id,
      catalogId: fromCatalog?.id ?? "",
      orderName: selected.orderName,
      category: selected.category,
      priority: selected.priority,
      instructions: selected.instructions || "",
      frequency: "Once",
      duration: "",
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

  const handleSaveOrder = (draft: DraftOrderLine) => {
    if (!guardRoleAction(canPlaceOrders, "save encounter orders")) return;
    if (!encounter) return;

    const orderedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (editingOrderId) {
      dispatch(
        updateEncounterOrder({
          id: editingOrderId,
          changes: {
            orderName: draft.orderName,
            category: draft.category as any,
            priority: draft.priority as any,
            instructions: draft.instructions,
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
        orderName: draft.orderName,
        category: draft.category as any,
        priority: draft.priority as any,
        status: "Pending",
        instructions: draft.instructions,
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

      <CommonOrderDialog
        open={orderDialogOpen}
        onClose={closeOrderDialog}
        onSave={handleSaveOrder}
        catalog={ORDER_CATALOG}
        categories={ORDER_CATEGORIES}
        initialData={orderInitialData}
      />
    </Stack>
  );
}
