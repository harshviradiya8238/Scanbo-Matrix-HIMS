import * as React from "react";
import {
  Science as ScienceIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";
import OpdTable from "../../common/components/OpdTable";

export const OrdersTab = ({ data }: { data: OpdVisitData }) => {
  const {
    encounterOrders,
    capabilities,
    openOrderDialog,
    handleEditOrder,
    handleDeleteOrder,
  } = data;

  return (
    <Stack spacing={1}>
      <OpdTable
        title="Orders"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScienceIcon />}
            disabled={!capabilities.canPlaceOrders}
            onClick={openOrderDialog}
          >
            Manage Orders
          </Button>
        }
        rows={encounterOrders}
        emptyMessage="No orders on this encounter."
        rowKey={(row: any) => row.id}
        variant="card"
        columns={[
          { id: "name", label: "Order", render: (row: any) => row.orderName },
          {
            id: "category",
            label: "Category",
            render: (row: any) => row.category,
          },
          {
            id: "priority",
            label: "Priority",
            render: (row: any) => row.priority,
          },
          { id: "status", label: "Status", render: (row: any) => row.status },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row: any) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit order"
                  disabled={!capabilities.canPlaceOrders}
                  onClick={() => handleEditOrder(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete order"
                  color="error"
                  disabled={!capabilities.canPlaceOrders}
                  onClick={() => handleDeleteOrder(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />
    </Stack>
  );
};
