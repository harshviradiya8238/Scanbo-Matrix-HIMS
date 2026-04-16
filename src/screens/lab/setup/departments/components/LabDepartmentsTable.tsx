"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Edit as EditIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import type { Department } from "../types";
import { T } from "../tokens";
import { getIconEl } from "./DepartmentIcon";
import { DEPT_CONFIG } from "../data";
import { TatBar } from "./TatBar";

interface LabDepartmentsTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

export function LabDepartmentsTable({
  departments,
  onEdit,
}: LabDepartmentsTableProps) {
  const columns: CommonColumn<Department>[] = [
    {
      field: "name",
      headerName: "Department Name",
      width: 250,
      renderCell: (row) => {
        const cfg = DEPT_CONFIG[row.iconType] ?? DEPT_CONFIG.bio;
        return (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                flexShrink: 0,
                bgcolor: cfg.iconBg,
                border: `1px solid ${cfg.iconBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.iconColor,
              }}
            >
              {getIconEl(row.iconType)}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "primary.main" }}>
                {row.name}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "text.secondary", fontFamily: "monospace" }}>
                {row.shortCode}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "head",
      headerName: "Department Head",
      width: 180,
    },
    {
      field: "analysts",
      headerName: "Analysts",
      width: 150,
    },
    {
      field: "instruments",
      headerName: "Instruments",
      width: 140,
    },
    {
      field: "tatTarget",
      headerName: "TAT Target",
      width: 130,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: row.tatTarget !== "—" ? "#92400E" : "text.secondary" }}>
          {row.tatTarget}
        </Typography>
      ),
    },
    {
      field: "tatCompliance",
      headerName: "TAT Compliance",
      width: 180,
      renderCell: (row) => (
        <Box sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
             <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "text.secondary" }}>
              {row.testsToday} tests today
            </Typography>
          </Stack>
          <TatBar value={row.tatCompliance} />
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (row) => {
        const isActive = row.status === "Active";
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.3,
              bgcolor: isActive ? T.activeBg : T.inactiveBg,
              border: `1px solid ${isActive ? T.activeBdr : T.inactiveBdr}`,
              borderRadius: "6px",
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: isActive ? T.activeTxt : T.inactiveTxt,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.63rem",
                fontWeight: 700,
                color: isActive ? T.activeTxt : T.inactiveTxt,
                lineHeight: 1,
              }}
            >
              {row.status}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "right",
      renderCell: (row) => (
        <IconButton
          size="small"
          onClick={() => onEdit(row)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            border: `1px solid ${T.border}`,
            color: T.textMuted,
            "&:hover": {
              bgcolor: "primary.light",
              borderColor: "primary.main",
              color: "primary.main",
            },
          }}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <CommonDataGrid
      rows={departments}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo
    />
  );
}
