"use client";

import {
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha } from "@mui/material";
import type { CommonColumn } from "@/src/components/table/CommonDataGrid";
import type { ValidatedMethod } from "./types";

interface ValidatedMethodColumnHandlers {
  onEdit: (item: ValidatedMethod) => void;
  onDelete: (id: string) => void;
}

export const getValidatedMethodColumns = ({
  onEdit,
  onDelete,
}: ValidatedMethodColumnHandlers): CommonColumn<ValidatedMethod>[] => [
  {
    headerName: "METHOD NAME",
    field: "name",
    width: 220,
    renderCell: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {row.name}
      </Typography>
    ),
  },
  {
    headerName: "ANALYSIS LINKED",
    field: "linkedAnalysis",
    width: 180,
    renderCell: (row) => (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontFamily: "monospace" }}
      >
        {row.linkedAnalysis}
      </Typography>
    ),
  },
  {
    headerName: "PRINCIPLE",
    field: "principle",
    width: 180,
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.principle}
      </Typography>
    ),
  },
  {
    headerName: "INSTRUMENT",
    field: "instrument",
    width: 180,
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.instrument}
      </Typography>
    ),
  },
  {
    headerName: "STANDARD",
    field: "standard",
    width: 150,
    renderCell: (row) => {
      const color = row.department === "Biochemistry" ? "#9C27B0" : "#2196F3";
      return (
        <Chip
          size="small"
          label={row.standard}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(color, 0.1),
            color: color,
            border: "none",
            borderRadius: 1,
            "&::before": {
              content: '""',
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: color,
              mr: 1,
            },
            display: "flex",
            alignItems: "center",
          }}
        />
      );
    },
  },
  {
    headerName: "DEPARTMENT",
    field: "department",
    width: 150,
    renderCell: (row) => {
      const isBio = row.department === "Biochemistry";
      const color = isBio
        ? "#9C27B0"
        : row.department === "Microbiology"
          ? "#2E7D32"
          : "#2196F3";
      return (
        <Chip
          size="small"
          label={row.department}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(color, 0.1),
            color: color,
            border: "none",
            "&::before": {
              content: '""',
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: color,
              mr: 1,
            },
            display: "flex",
            alignItems: "center",
          }}
        />
      );
    },
  },
  {
    headerName: "VALIDATED ON",
    field: "validatedOn",
    width: 150,
  },
  {
    headerName: "STATUS",
    field: "status",
    width: 120,
    renderCell: (row) => (
      <Chip
        size="small"
        label={row.status}
        sx={{
          fontWeight: 600,
          bgcolor:
            row.status === "Active"
              ? alpha("#4CAF50", 0.1)
              : alpha("#757575", 0.1),
          color: row.status === "Active" ? "#2E7D32" : "#616161",
          border: "none",
          "&::before": {
            content: '""',
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: row.status === "Active" ? "#4CAF50" : "#757575",
            mr: 1,
          },
          display: "flex",
          alignItems: "center",
        }}
      />
    ),
  },
  {
    headerName: "ACTION",
    field: "action",
    width: 180,
    renderCell: (row) => (
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onEdit(row)}
          sx={{ minWidth: 60 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => onDelete(row.id)}
          sx={{ minWidth: 60 }}
        >
          Delete
        </Button>
      </Stack>
    ),
  },
];
