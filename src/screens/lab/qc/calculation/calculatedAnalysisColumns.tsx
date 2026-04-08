"use client";

import {
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha } from "@mui/material";
import type { CommonColumn } from "@/src/components/table/CommonDataGrid";
import type { CalculatedAnalysis } from "./types";

interface CalculatedAnalysisColumnHandlers {
  onEdit: (item: CalculatedAnalysis) => void;
  onDelete: (id: string) => void;
}

export const getCalculatedAnalysisColumns = ({
  onEdit,
  onDelete,
}: CalculatedAnalysisColumnHandlers): CommonColumn<CalculatedAnalysis>[] => [
  {
    headerName: "KEYWORD",
    field: "keyword",
    width: 120,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.keyword}
      </Typography>
    ),
  },
  {
    headerName: "NAME",
    field: "name",
    width: 250,
    renderCell: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {row.name}
      </Typography>
    ),
  },
  {
    headerName: "FORMULA / EXPRESSION",
    field: "formula",
    width: 250,
    renderCell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.formula}
      </Typography>
    ),
  },
  {
    headerName: "UNIT",
    field: "unit",
    width: 120,
  },
  {
    headerName: "REF RANGE",
    field: "refRange",
    width: 150,
  },
  {
    headerName: "DEPARTMENT",
    field: "department",
    width: 180,
    renderCell: (row) => {
      const isBio = row.department === "Biochemistry";
      return (
        <Chip
          size="small"
          label={row.department}
          sx={{
            fontWeight: 600,
            bgcolor: isBio ? alpha("#9C27B0", 0.1) : alpha("#2196F3", 0.1),
            color: isBio ? "#9C27B0" : "#2196F3",
            border: "none",
            "& .MuiChip-label": { px: 1.5, py: 0.5 },
            "&::before": {
              content: '""',
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: isBio ? "#9C27B0" : "#2196F3",
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
            width: 6,
            height: 6,
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
