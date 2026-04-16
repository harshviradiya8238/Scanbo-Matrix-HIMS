"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  IconButton,
} from "@/src/ui/components/atoms";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FiberManualRecord as StatusIcon,
  UploadFile as UploadIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface Instrument {
  id: string;
  name: string;
  type: string;
  department: string;
  interface: string;
  status: "online" | "warning" | "offline";
  calibrationStatus: string;
  lastQC: string;
  qcStatus: "pass" | "fail" | "pending";
  todayCount?: string;
  bottlesLoaded?: string;
  positiveFlags?: string;
  statusText?: string;
}

interface LabInstrumentsTableProps {
  instruments: Instrument[];
  onSimulateLink: (id: string) => void;
}

export function LabInstrumentsTable({
  instruments,
  onSimulateLink,
}: LabInstrumentsTableProps) {
  const theme = useTheme();

  const getStatusColor = (status: Instrument["status"]) => {
    switch (status) {
      case "online":
        return "#16a34a";
      case "warning":
        return "#ea580c";
      case "offline":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  const columns: CommonColumn<Instrument>[] = [
    {
      field: "name",
      headerName: "Instrument Name",
      width: 280,
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <StatusIcon
            sx={{ fontSize: 10, color: getStatusColor(row.status) }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.type}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 180,
    },
    {
      field: "interface",
      headerName: "Interface",
      width: 130,
      renderCell: (row) => (
        <Chip
          label={row.interface}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: "#0891b2",
            borderRadius: 1,
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      ),
    },
    {
      field: "calibrationStatus",
      headerName: "Calibration",
      width: 160,
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {row.status === "online" && (
            <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a" }} />
          )}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: row.status === "online" ? "#16a34a" : "text.primary",
            }}
          >
            {row.calibrationStatus}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "lastQC",
      headerName: "Last QC",
      width: 140,
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {row.qcStatus === "pass" && (
            <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a" }} />
          )}
          {row.qcStatus === "fail" && (
            <ErrorIcon sx={{ fontSize: 12, color: "#dc2626" }} />
          )}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: row.qcStatus === "fail" ? "#dc2626" : "#16a34a",
            }}
          >
            {row.lastQC}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "todayCount",
      headerName: "Count",
      width: 100,
      renderCell: (row) => (
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {row.todayCount || row.bottlesLoaded || "—"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      align: "right",
      renderCell: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="soft"
            color="primary"
            startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
            onClick={() => onSimulateLink(row.id)}
            sx={{
              height: 28,
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Simulate
          </Button>
          <IconButton size="small">
            <SettingsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <CommonDataGrid
      rows={instruments}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo
    />
  );
}
