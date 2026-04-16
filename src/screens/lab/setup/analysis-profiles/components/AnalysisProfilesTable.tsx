"use client";

import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Chip,
} from "@/src/ui/components/atoms";
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  PlayArrow as UseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import type { AnalysisProfile } from "../types";
import { T } from "../tokens";
import { DeptBadge } from "./DeptBadge";

interface AnalysisProfilesTableProps {
  profiles: AnalysisProfile[];
  onUseProfile: (profile: AnalysisProfile) => void;
}

export function AnalysisProfilesTable({
  profiles,
  onUseProfile,
}: AnalysisProfilesTableProps) {
  const columns: CommonColumn<AnalysisProfile>[] = [
    {
      field: "name",
      headerName: "Profile Name",
      width: 250,
      renderCell: (row) => (
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "primary.main" }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }} noWrap>
            {row.analytesCount} analytes: {row.analytesList}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
      renderCell: (row) => <DeptBadge dept={row.department} />,
    },
    {
      field: "sampleType",
      headerName: "Sample",
      width: 130,
    },
    {
      field: "container",
      headerName: "Container",
      width: 130,
    },
    {
      field: "tat",
      headerName: "TAT",
      width: 100,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "0.825rem", fontWeight: 600, color: "#92400E" }}>
          {row.tat}
        </Typography>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "0.825rem", fontWeight: 700, color: "primary.main" }}>
          {row.price}
        </Typography>
      ),
    },
    {
      field: "monthlyUsage",
      headerName: "Monthly Usage",
      width: 150,
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%" }}>
          <Box sx={{ flex: 1, height: 4, bgcolor: T.usageBg, borderRadius: 99, overflow: "hidden" }}>
             <Box
              sx={{
                width: `${Math.min(((row.monthlyUsage) / (row.maxUsage ?? 130)) * 100, 100)}%`,
                height: "100%", bgcolor: T.primary, borderRadius: 99,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", minWidth: 35 }}>
            {row.monthlyUsage}×
          </Typography>
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      align: "right",
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton size="small" title="Edit">
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" title="View">
            <ViewIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            title="Use Profile"
            onClick={() => onUseProfile(row)}
          >
            <UseIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" color="error" title="Delete">
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <CommonDataGrid
      rows={profiles}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo
    />
  );
}
