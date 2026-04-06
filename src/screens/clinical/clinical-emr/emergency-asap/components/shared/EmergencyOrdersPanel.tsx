import React from 'react';
import {
  Alert,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import CommonDataGrid, { CommonColumn } from '@/src/components/table/CommonDataGrid';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { EmergencyPatient, EmergencyOrder, OrderForm, OrderType, OrderPriority, OrderStatus } from '../../types';
import { ORDER_TEMPLATES } from '../constants';
import { OrderStatusChip } from './OrderStatusChip';

interface OrdersPanelProps {
  selectedPatient: EmergencyPatient | undefined;
  orders: EmergencyOrder[];
  orderForm: OrderForm;
  onOrderFormChange: <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => void;
  onAddOrder: () => void;
  onOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  onTemplateApply: (template: string) => void;
}

export function EmergencyOrdersPanel({
  selectedPatient,
  orders,
  orderForm,
  onOrderFormChange,
  onAddOrder,
  onOrderStatusChange,
  onTemplateApply,
}: OrdersPanelProps) {
  const orderColumns = React.useMemo<CommonColumn<EmergencyOrder>[]>(
    () => [
      {
        headerName: "Time",
        field: "orderedAt",
        width: 100,
      },
      {
        headerName: "Type",
        field: "type",
        width: 120,
      },
      {
        headerName: "Order",
        field: "item",
        width: 250,
      },
      {
        headerName: "Priority",
        field: "priority",
        width: 110,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.priority}
            color={
              row.priority === "STAT"
                ? "error"
                : row.priority === "Urgent"
                  ? "warning"
                  : "default"
            }
            variant={row.priority === "Routine" ? "outlined" : "filled"}
          />
        ),
      },
      {
        headerName: "Status",
        field: "status",
        width: 130,
        renderCell: (row) => <OrderStatusChip status={row.status} />,
      },
      {
        headerName: "Action",
        field: "id",
        width: 200,
        align: "right",
        headerAlign: "right",
        renderCell: (row) => (
          <Stack direction="row" spacing={0.75} justifyContent="flex-end">
            {row.status === "Pending" ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOrderStatusChange(row.id, "In Progress");
                }}
              >
                Start
              </Button>
            ) : null}
            {row.status !== "Completed" ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOrderStatusChange(row.id, "Completed");
                }}
              >
                Complete
              </Button>
            ) : null}
          </Stack>
        ),
      },
    ],
    [onOrderStatusChange],
  );
  const rows = selectedPatient
    ? orders.filter((order) => order.patientId === selectedPatient.id)
    : [];
  const templateOptions = ORDER_TEMPLATES[orderForm.type];

  return (
    <WorkflowSectionCard
      title="Orders Panel"
      subtitle="Lab Tests, Radiology, Medication, and Procedures"
    >
      {!selectedPatient ? (
        <Alert severity="info">
          Select a patient to place emergency orders.
        </Alert>
      ) : (
        <Stack spacing={1.25}>
          <Grid container spacing={1}>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                label="Order Type"
                select
                value={orderForm.type}
                onChange={(event) =>
                  onOrderFormChange("type", event.target.value as OrderType)
                }
                fullWidth
              >
                <MenuItem value="Lab Tests">Lab Tests</MenuItem>
                <MenuItem value="Radiology">Radiology</MenuItem>
                <MenuItem value="Medication">Medication</MenuItem>
                <MenuItem value="Procedures">Procedures</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                label="Priority"
                select
                value={orderForm.priority}
                onChange={(event) =>
                  onOrderFormChange(
                    "priority",
                    event.target.value as OrderPriority,
                  )
                }
                fullWidth
              >
                <MenuItem value="STAT">STAT</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="Routine">Routine</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                size="small"
                label="Order Item"
                value={orderForm.item}
                onChange={(event) =>
                  onOrderFormChange("item", event.target.value)
                }
                fullWidth
                placeholder="Enter test / procedure / medication"
              />
            </Grid>
            <Grid xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: "100%" }}
                onClick={onAddOrder}
              >
                Add Order
              </Button>
            </Grid>
          </Grid>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75 }}
            >
              Quick templates
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {templateOptions.map((template) => (
                <Chip
                  key={template}
                  clickable
                  size="small"
                  label={template}
                  variant={orderForm.item === template ? "filled" : "outlined"}
                  color={orderForm.item === template ? "primary" : "default"}
                  onClick={() => onTemplateApply(template)}
                />
              ))}
            </Stack>
          </Box>

          <CommonDataGrid<EmergencyOrder>
            rows={rows}
            columns={orderColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search orders..."
            searchFields={["item", "type"]}
            emptyTitle="No emergency orders placed yet."
          />
        </Stack>
      )}
    </WorkflowSectionCard>
  );
}