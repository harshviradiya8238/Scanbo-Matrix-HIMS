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
import { useSnackbar } from "@/src/ui/components/molecules/Snackbarcontext";

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
  const { success } = useSnackbar();
  const [data, setData] = React.useState<InvalidationLog[]>(DUMMY_DATA);

  const handleRetest = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "retested",
              retestId: `LAB-2025-${Math.floor(Math.random() * 9000) + 1000}`,
            }
          : item,
      ),
    );
    success("New sample registered for retesting.");
  };

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
        <Typography variant="body2" sx={{ fontWeight: row.retestId !== "-" ? 700 : 400, color: row.retestId !== "-" ? "primary.main" : "text.secondary" }}>
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
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: "success.main",
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.2),
            }}
          />
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => handleRetest(row.id)}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
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
      fullHeight
    >
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          p: 0.5,
        }}
      >
        <Alert
          severity="warning"
          icon={<UndoIcon />}
          sx={{
            fontWeight: 600,
            borderRadius: 3,
            "& .MuiAlert-icon": { color: "warning.main" },
            border: "1px solid",
            borderColor: alpha(theme.palette.warning.main, 0.2),
            bgcolor: alpha(theme.palette.warning.main, 0.05),
          }}
        >
          Once a sample is invalidated, results cannot be reversed. A new sample
          must be registered for retesting.
        </Alert>

        <WorkspaceHeaderCard sx={{ borderRadius: 4 }}>
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
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UndoIcon sx={{ color: "primary.main" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Invalidation Log
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.length} records found
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3,
                textTransform: "none",
              }}
            >
              Invalidate Sample
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        
          <CommonDataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id}
          />
      </Stack>
    </PageTemplate>
  );
}
