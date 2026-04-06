import React from 'react';
import { Chip } from '@mui/material';
import { OrderStatus } from '../../types';

interface OrderStatusChipProps {
  status: OrderStatus;
}

export function OrderStatusChip({ status }: OrderStatusChipProps) {
  const color: "success" | "info" | "warning" =
    status === "Completed"
      ? "success"
      : status === "In Progress"
        ? "info"
        : "warning";
  return (
    <Chip
      size="small"
      label={status}
      color={color}
      variant={status === "Completed" ? "filled" : "outlined"}
    />
  );
}