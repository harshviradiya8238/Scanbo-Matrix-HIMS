"use client";

import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";
import { alpha } from "@/src/ui/theme";
import { PatientListData } from "../hooks/usePatientListData";
import { CommonColumn } from "@/src/components/table/CommonDataGrid";
import { PatientRow } from "@/src/mocks/patientServer";

export function ColumnVisibilityDialog({
  data,
  columns,
}: {
  data: PatientListData;
  columns: CommonColumn<PatientRow>[];
}) {
  const {
    columnsDialogOpen,
    setColumnsDialogOpen,
    columnOrder,
    setColumnOrder,
    draggedIndex,
    setDraggedIndex,
    columnVisModel,
    toggleColumn,
    applyColumnVisModel,
  } = data;

  const resetColumnVisibility = () => {
    const allVisible = columns.reduce(
      (acc, column) => ({ ...acc, [column.field]: true }),
      {} as Record<string, boolean>,
    );
    const defaultOrder = columns.map((column) => column.field);
    applyColumnVisModel(allVisible, defaultOrder);
  };

  return (
    <Dialog
      open={columnsDialogOpen}
      onClose={() => setColumnsDialogOpen(false)}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Choose columns</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {columnOrder.map((field: any, index: number) => {
            const column = columns.find((item) => item.field === field);
            if (!column) return null;

            return (
              <Box
                key={field}
                draggable
                onDragStart={(event) => {
                  setDraggedIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggedIndex === null || draggedIndex === index) return;
                  const newOrder = [...columnOrder];
                  const [removed] = newOrder.splice(draggedIndex, 1);
                  newOrder.splice(index, 0, removed);
                  setColumnOrder(newOrder);
                  setDraggedIndex(index);
                }}
                onDragEnd={() => setDraggedIndex(null)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor:
                    draggedIndex === index ? "primary.main" : "divider",
                  bgcolor:
                    draggedIndex === index
                      ? alpha("#1976d2", 0.05)
                      : "transparent",
                  cursor: "grab",
                  "&:active": { cursor: "grabbing" },
                  gap: 1,
                }}
              >
                <DragHandleIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                <FormControlLabel
                  sx={{ flex: 1, m: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={columnVisModel?.[field] !== false}
                      onChange={() => toggleColumn(field)}
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {column.headerName ?? field}
                    </Typography>
                  }
                />
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => resetColumnVisibility()}>Reset</Button>
        <Button
          onClick={() => {
            applyColumnVisModel(columnVisModel ?? {}, columnOrder);
            setColumnsDialogOpen(false);
          }}
          variant="contained"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
