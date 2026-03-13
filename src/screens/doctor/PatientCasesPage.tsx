"use client";

import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useTheme } from "@/src/ui/theme";
import { alpha } from "@mui/material";
import {
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DataTable from "@/src/ui/components/organisms/DataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";

export type CaseStatus = "Active" | "Under Review" | "Closed";

export interface PatientCaseRow {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  caseType: string;
  openedAt: string;
  status: CaseStatus;
  department: string;
}

const statusColors: Record<CaseStatus, "success" | "info" | "default"> = {
  Active: "success",
  "Under Review": "info",
  Closed: "default",
};

export const MOCK_CASES: PatientCaseRow[] = [
  {
    id: "case-1",
    patientId: "P-001",
    patientName: "Rajesh Kumar",
    mrn: "MRN-2024-001",
    caseType: "Follow-up",
    openedAt: "2025-03-01",
    status: "Active",
    department: "General Medicine",
  },
  {
    id: "case-2",
    patientId: "P-002",
    patientName: "Priya Sharma",
    mrn: "MRN-2024-002",
    caseType: "New consultation",
    openedAt: "2025-03-05",
    status: "Under Review",
    department: "Cardiology",
  },
  {
    id: "case-3",
    patientId: "P-003",
    patientName: "Amit Patel",
    mrn: "MRN-2024-003",
    caseType: "Post-op",
    openedAt: "2025-02-28",
    status: "Closed",
    department: "Orthopedics",
  },
  {
    id: "case-4",
    patientId: "P-004",
    patientName: "Sneha Reddy",
    mrn: "MRN-2024-004",
    caseType: "Routine check",
    openedAt: "2025-03-07",
    status: "Active",
    department: "Pediatrics",
  },
  {
    id: "case-5",
    patientId: "P-005",
    patientName: "Vikram Singh",
    mrn: "MRN-2024-005",
    caseType: "Referral",
    openedAt: "2025-03-06",
    status: "Under Review",
    department: "Dermatology",
  },
];

export default function PatientCasesPage() {
  const theme = useTheme();
  const [rows] = React.useState<PatientCaseRow[]>(MOCK_CASES);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);

  const totalCases = rows.length;
  const activeCases = rows.filter((r) => r.status === "Active").length;
  const closedCases = rows.filter((r) => r.status === "Closed").length;

  const columns = React.useMemo<GridColDef<PatientCaseRow>[]>(
    () => [
      {
        field: "patientName",
        headerName: "Patient",
        width: 220,
        renderCell: (params: GridRenderCellParams<PatientCaseRow>) => (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ height: "100%", width: "100%" }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: "primary.main",
              }}
            >
              {params.row.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.row.patientName}
              </Typography>
              {/* <Typography variant="caption" color="text.secondary">
                {params.row.department}
              </Typography> */}
            </Box>
          </Stack>
        ),
      },
      {
        field: "mrn",
        headerName: "MRN",
        width: 140,
      },
      {
        field: "caseType",
        headerName: "Case Type",
        width: 160,
      },
      {
        field: "openedAt",
        headerName: "Opened",
        width: 120,
        valueGetter: (_, row) =>
          row?.openedAt ? new Date(row.openedAt).toLocaleDateString() : "—",
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.row.status}
            size="small"
            color={statusColors[params.row.status]}
            variant={params.row.status === "Closed" ? "outlined" : "filled"}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        type: "actions",
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            label="View case"
            onClick={() => setSnackbar(`View case ${params.row.id} (stub)`)}
            showInMenu
          />,
          <GridActionsCellItem
            key="edit"
            label="Add note"
            onClick={() => setSnackbar(`Add note (stub)`)}
            showInMenu
          />,
        ],
      },
    ],
    [theme.palette.primary.main],
  );

  return (
    <PageTemplate
      title="Patient Cases"
      subtitle="View and manage your patient cases, add notes, and track status."
    >
      <Stack spacing={2}>
        {/* Stats */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          <StatTile
            label="Total Cases"
            value={totalCases}
            icon={<FolderOpenIcon sx={{ fontSize: 28 }} />}
            tone="primary"
          />
          <StatTile
            label="Active"
            value={activeCases}
            icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
            tone="success"
          />
          <StatTile
            label="Closed"
            value={closedCases}
            icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            tone="info"
          />
        </Box>

        {/* Cases table */}
        <Card
          sx={{
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Patient Cases
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {rows.length} cases
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ height: 420 }}>
            <DataTable
              tableId="doctor-patient-cases"
              columns={columns}
              rows={rows}
              rowHeight={64}
              tableHeight={420}
              slotProps={{
                basePopper: {
                  placement: "bottom-end",
                  modifiers: [
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["top-end", "bottom-start"],
                      },
                    },
                    { name: "preventOverflow", options: { altAxis: true } },
                  ],
                },
              }}
              toolbarConfig={{
                showQuickFilter: true,
                showColumns: true,
                showFilters: true,
                showDensity: true,
                showExport: false,
                showSavedViews: false,
                showPrint: false,
              }}
              checkboxSelection={false}
            />
          </Box>
        </Card>

        <Snackbar
          open={Boolean(snackbar)}
          autoHideDuration={3000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="info" onClose={() => setSnackbar(null)}>
            {snackbar}
          </Alert>
        </Snackbar>
      </Stack>
    </PageTemplate>
  );
}
