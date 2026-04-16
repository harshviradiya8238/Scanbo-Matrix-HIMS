"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Switch,
  Paper,
} from "@/src/ui/components/atoms";
import {
  DragIndicator as DragIcon,
  ViewColumn as ViewColumnIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { CommonDialog } from "@/src/ui/components/molecules";

interface ColumnManagementDialogProps {
  open: boolean;
  onClose: () => void;
  columns: { field: string; headerName: string }[];
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  onApply: (visibility: Record<string, boolean>, order: string[]) => void;
  onReset: () => void;
}

export default function ColumnManagementDialog({
  open,
  onClose,
  columns,
  columnVisibility,
  columnOrder,
  onApply,
  onReset,
}: ColumnManagementDialogProps) {
  const [internalOrder, setInternalOrder] = React.useState<string[]>(columnOrder);
  const [internalVisibility, setInternalVisibility] = React.useState<Record<string, boolean>>(columnVisibility);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (open) {
      setInternalOrder(columnOrder);
      setInternalVisibility(columnVisibility);
    }
  }, [open, columnOrder, columnVisibility]);

  const handleToggle = (field: string) => {
    setInternalVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...internalOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setInternalOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Column Chooser"
      subtitle="Toggle to show/hide columns"
      icon={<ViewColumnIcon />}
      PaperProps={{
        sx: {
          borderRadius: "24px",
        },
      }}
      onConfirm={() => onApply(internalVisibility, internalOrder)}
      confirmLabel="Apply"
      cancelLabel="Cancel"
      actions={
        <Stack direction="row" spacing={2}  sx={{ width: "100%" }}>

           <Button
          fullWidth
            variant="text"
            size="small"
            onClick={onReset}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Reset Default
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onApply(internalVisibility, internalOrder)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#007FFF",
              "&:hover": { bgcolor: "#0066CC" },
            }}
          >
            Apply
          </Button>
        </Stack>
      }
    >
    

      <Stack spacing={1.5}>
        {internalOrder.map((field, index) => {
          const col = columns.find((c) => c.field === field);
          if (!col || col.field === "actions") return null;

          const isVisible = internalVisibility[field] !== false;

          return (
            <Box
              key={field}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: draggedIndex === index ? "primary.main" : "#E1E3E5",
                bgcolor: isVisible ? "transparent" : alpha("#E1E3E5", 0.3),
                transition: "all 0.2s",
                opacity: draggedIndex !== null && draggedIndex !== index ? 0.6 : 1,
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
                boxShadow: isVisible ? "0 2px 8px rgba(37, 34, 34, 0.15)" : "none",
              }}
            >
              <DragIcon
                sx={{
                  color: "#A1A3A5",
                  mr: 2,
                  fontSize: 20,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  color: isVisible ? "#1A1C1E" : "#A1A3A5",
                }}
              >
                {col.headerName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  size="small"
                  checked={isVisible}
                  onChange={() => handleToggle(field)}
                  color="success"
                />
                <Typography
                  variant="caption"
                  sx={{
                    width: 32,
                    fontWeight: 600,
                    color: isVisible ? "success.main" : "text.secondary",
                  }}
                >
                  {isVisible ? "Show" : "Hide"}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </CommonDialog>
  );
}
