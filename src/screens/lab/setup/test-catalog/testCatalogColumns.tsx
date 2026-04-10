"use client";

import {
  Box,
  Typography,
} from "@/src/ui/components/atoms";
import type { CommonColumn } from "@/src/components/table/CommonDataGrid";
import type { AnalysisService } from "./types";
import { getCategoryTheme } from "./utils";

export const TEST_CATALOG_COLUMNS: CommonColumn<AnalysisService>[] = [
  {
    headerName: "KEYWORD",
    field: "keyword",
    width: 120,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem" }}
      >
        {row.keyword}
      </Typography>
    ),
  },
  {
    headerName: "ANALYSIS SERVICE",
    field: "service",
    width: 250,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 800, color: "text.primary" }}
      >
        {row.service}
      </Typography>
    ),
  },
  {
    headerName: "CATEGORY",
    field: "category",
    width: 150,
    renderCell: (row) => {
      const c = getCategoryTheme(row.category);
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.45,
            bgcolor: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: "6px",
          }}
        >
          <Box
            sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.text }}
          />
          <Typography
            sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
          >
            {row.category}
          </Typography>
        </Box>
      );
    },
  },
  {
    headerName: "METHOD",
    field: "method",
    width: 180,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.method}
      </Typography>
    ),
  },
  {
    headerName: "INSTRUMENT",
    field: "instrument",
    width: 150,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.instrument}
      </Typography>
    ),
  },
  {
    headerName: "UNIT",
    field: "unit",
    width: 100,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.unit}
      </Typography>
    ),
  },
  {
    headerName: "NORMAL RANGE (M)",
    field: "normalRangeM",
    width: 180,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 600 }}
      >
        {row.normalRangeM}
      </Typography>
    ),
  },
  {
    headerName: "NORMAL RANGE (F)",
    field: "normalRangeF",
    width: 180,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 600 }}
      >
        {row.normalRangeF}
      </Typography>
    ),
  },
  {
    headerName: "TAT",
    field: "tat",
    width: 80,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.tat}
      </Typography>
    ),
  },
  {
    headerName: "PRICE",
    field: "price",
    width: 100,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 700 }}
      >
        {row.price}
      </Typography>
    ),
  },
];
