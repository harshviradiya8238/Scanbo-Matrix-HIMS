"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Alert,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import {
  Add as AddIcon,
  Undo as UndoIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface InvalidationLog {
  id: string;
  originalId: string;
  patient: string;
  reason: string;
  invalidatedBy: string;
  timestamp: string;
  retestId: string;
  status: "retested" | "pending";
}

const DUMMY_DATA: InvalidationLog[] = [
  {
    id: "1",
    originalId: "LAB-2025-4998",
    patient: "Suresh Kumar",
    reason: "Haemolysed sample",
    invalidatedBy: "Dr. Mehta",
    timestamp: "29 Mar 10:28 AM",
    retestId: "LAB-2025-5014",
    status: "retested",
  },
  {
    id: "2",
    originalId: "LAB-2025-4981",
    patient: "Mohan Das",
    reason: "Insufficient volume",
    invalidatedBy: "Dr. Rajesh",
    timestamp: "28 Mar 03:15 PM",
    retestId: "-",
    status: "pending",
  },
  {
    id: "3",
    originalId: "LAB-2025-4965",
    patient: "Priya Sen",
    reason: "Wrong container used",
    invalidatedBy: "A. Nair",
    timestamp: "27 Mar 11:40 AM",
    retestId: "LAB-2025-4972",
    status: "retested",
  },
];

export default function LabInvalidationsPage() {
  const theme = useTheme();

  const columns: CommonColumn<InvalidationLog>[] = [
    {
      headerName: "ORIGINAL ID",
      field: "originalId",
      width: 150,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.originalId}
        </Typography>
      ),
    },
    {
      headerName: "PATIENT",
      field: "patient",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.patient}
        </Typography>
      ),
    },
    {
      headerName: "REASON",
      field: "reason",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.reason}
        </Typography>
      ),
    },
    {
      headerName: "INVALIDATED BY",
      field: "invalidatedBy",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.invalidatedBy}
        </Typography>
      ),
    },
    {
      headerName: "TIMESTAMP",
      field: "timestamp",
      width: 180,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.timestamp}
        </Typography>
      ),
    },
    {
      headerName: "RETEST ID",
      field: "retestId",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.retestId}
        </Typography>
      ),
    },
    {
      headerName: "ACTION",
      field: "status",
      width: 150,
      renderCell: (row) =>
        row.status === "retested" ? (
          <Chip
            size="small"
            label="Retested"
            icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600, border: "none", bgcolor: "success.light" }}
          />
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            sx={{ fontWeight: 600 }}
          >
            Retest
          </Button>
        ),
    },
  ];

  return (
    <PageTemplate
      title="Invalidations"
      subtitle="Track and manage invalidated laboratory samples"
    >
      <Stack spacing={3}>
        <Alert
          severity="warning"
          icon={<UndoIcon />}
          sx={{
            fontWeight: 600,
            borderRadius: 1,
            "& .MuiAlert-icon": { color: "warning.main" },
            border: "1px solid",
            borderColor: "warning.light",
          }}
        >
          Once a sample is invalidated, results cannot be reversed. A new sample
          must be registered for retesting.
        </Alert>

        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                  p: 1,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UndoIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800,color: "primary.main"  }}>
                Invalidation Log
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 700 }}
            >
              Invalidate Sample
            </Button>
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
