"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  MenuItem,
  Select,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import { History as AuditIcon } from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  ipAddress: string;
  action: string;
  entity: string;
  oldValue: string;
  newValue: string;
}

const DUMMY_DATA: AuditLogEntry[] = [
  {
    id: "1",
    timestamp: "2025-03-30 10:28:14",
    user: "Dr. Rajesh Kumar",
    ipAddress: "192.168.1.42",
    action: "Published",
    entity: "LAB-2025-5019",
    oldValue: "Verified",
    newValue: "Published",
  },
  {
    id: "2",
    timestamp: "2025-03-30 10:18:05",
    user: "Dr. Rajesh Kumar",
    ipAddress: "192.168.1.42",
    action: "Verified",
    entity: "LAB-2025-5019",
    oldValue: "To be Verified",
    newValue: "Verified",
  },
  {
    id: "3",
    timestamp: "2025-03-30 10:02:33",
    user: "R. Sharma",
    ipAddress: "192.168.1.55",
    action: "Result Submitted",
    entity: "LAB-2025-5019",
    oldValue: "—",
    newValue: "TSH=2.1, T3=1.2...",
  },
  {
    id: "4",
    timestamp: "2025-03-30 09:55:10",
    user: "A. Nair",
    ipAddress: "192.168.1.31",
    action: "Sample Received",
    entity: "LAB-2025-5021",
    oldValue: "Sample Due",
    newValue: "Received",
  },
  {
    id: "5",
    timestamp: "2025-03-30 09:48:02",
    user: "Dr. Mehta",
    ipAddress: "192.168.1.12",
    action: "Invalidated",
    entity: "LAB-2025-4998",
    oldValue: "To be Verified",
    newValue: "Invalidated",
  },
];

export default function AuditTrailPage() {
  const theme = useTheme();

  const columns: CommonColumn<AuditLogEntry>[] = [
    {
      headerName: "TIMESTAMP",
      field: "timestamp",
      width: 180,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {row.timestamp}
        </Typography>
      ),
    },
    {
      headerName: "USER",
      field: "user",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {row.user}
        </Typography>
      ),
    },
    {
      headerName: "IP ADDRESS",
      field: "ipAddress",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {row.ipAddress}
        </Typography>
      ),
    },
    {
      headerName: "ACTION",
      field: "action",
      width: 180,
      renderCell: (row) => {
        let color = "#4CAF50";
        if (row.action === "Verified") color = "#9C27B0";
        if (row.action === "Result Submitted") color = "#2196F3";
        if (row.action === "Sample Received") color = "#009688";
        if (row.action === "Invalidated") color = "#F44336";

        return (
          <Chip
            size="small"
            label={row.action}
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
                mr: 0.8,
              },
              display: "flex",
              alignItems: "center",
            }}
          />
        );
      },
    },
    {
      headerName: "ENTITY",
      field: "entity",
      width: 180,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.entity}
        </Typography>
      ),
    },
    {
      headerName: "OLD VALUE",
      field: "oldValue",
      width: 150,
    },
    {
      headerName: "NEW VALUE",
      field: "newValue",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {row.newValue}
        </Typography>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Audit Trail"
      subtitle="View immutable history of all laboratory actions"
    >
      <Stack spacing={3}>
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  p: 1.25,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AuditIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Audit Trail — Immutable Log
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Select
                size="small"
                defaultValue="all_users"
                sx={{
                  minWidth: 140,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="all_users">All Users</MenuItem>
                <MenuItem value="pathologist">Pathologist Only</MenuItem>
                <MenuItem value="technician">Technician Only</MenuItem>
              </Select>
              <Select
                size="small"
                defaultValue="all_actions"
                sx={{
                  minWidth: 140,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="all_actions">All Actions</MenuItem>
                <MenuItem value="publishing">Publishing</MenuItem>
                <MenuItem value="verifying">Verification</MenuItem>
                <MenuItem value="results">Result Entry</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        <Box sx={{ mt: 1 }}>
          <CommonDataGrid
            rows={DUMMY_DATA}
            columns={columns}
            getRowId={(row) => row.id}
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
