"use client";

import {
  Box,
  Typography,
} from "@/src/ui/components/atoms";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import type { CommonColumn } from "@/src/components/table/CommonDataGrid";
import type { QCSample } from "./types";
import { T } from "./tokens";

export const QC_SAMPLE_COLUMNS: CommonColumn<QCSample>[] = [
  {
    headerName: "QC ID",
    field: "id",
    width: 120,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.id}
      </Typography>
    ),
  },
  {
    headerName: "MATERIAL",
    field: "material",
    width: 150,
    renderCell: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {row.material}
      </Typography>
    ),
  },
  {
    headerName: "LEVEL",
    field: "level",
    width: 120,
    renderCell: (row) => {
      const c =
        row.level === "Level 1"
          ? { text: T.level1Text, bg: T.level1Bg, border: T.level1Border }
          : row.level === "Level 2"
            ? { text: T.level2Text, bg: T.level2Bg, border: T.level2Border }
            : { text: T.level3Text, bg: T.level3Bg, border: T.level3Border };

      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.4,
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
            {row.level}
          </Typography>
        </Box>
      );
    },
  },
  {
    headerName: "INSTRUMENT",
    field: "instrument",
    width: 130,
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
    headerName: "ANALYSIS",
    field: "analysis",
    width: 120,
    renderCell: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {row.analysis}
      </Typography>
    ),
  },
  {
    headerName: "EXPECTED",
    field: "expected",
    width: 100,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {row.expected}
      </Typography>
    ),
  },
  {
    headerName: "OBSERVED",
    field: "observed",
    width: 100,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 800,
          color: row.westgardStatus === "fail" ? "#dc2626" : "text.primary",
        }}
      >
        {row.observed}
      </Typography>
    ),
  },
  {
    headerName: "WESTGARD",
    field: "westgard",
    width: 100,
    renderCell: (row) => {
      const c =
        row.westgardStatus === "fail"
          ? {
              text: T.failText,
              bg: T.failBg,
              border: T.failBorder,
              Icon: CancelIcon,
            }
          : row.westgardStatus === "warning"
            ? {
                text: T.warningText,
                bg: T.warningBg,
                border: T.warningBorder,
                Icon: WarningIcon,
              }
            : {
                text: T.okText,
                bg: T.okBg,
                border: T.okBorder,
                Icon: CheckCircleIcon,
              };

      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1,
            py: 0.4,
            bgcolor: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: "6px",
          }}
        >
          <c.Icon sx={{ fontSize: 13 }} />
          <Typography
            sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
          >
            {row.westgard}
          </Typography>
        </Box>
      );
    },
  },
  {
    headerName: "RESULT",
    field: "result",
    width: 100,
    renderCell: (row) => {
      const c =
        row.result === "Pass"
          ? { text: T.okText, bg: T.okBg, border: T.okBorder }
          : row.result === "Fail"
            ? { text: T.failText, bg: T.failBg, border: T.failBorder }
            : {
                text: T.warningText,
                bg: T.warningBg,
                border: T.warningBorder,
              };

      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.4,
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
            {row.result}
          </Typography>
        </Box>
      );
    },
  },
];
