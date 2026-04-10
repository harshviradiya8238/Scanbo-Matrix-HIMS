"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  Visibility as VisibilityIcon,
  EditNote as EditNoteIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";

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
    patientId: "MRN-245781",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
    caseType: "Follow-up",
    openedAt: "2025-03-01",
    status: "Active",
    department: "General Medicine",
  },
  {
    id: "case-2",
    patientId: "MRN-245799",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
    caseType: "New consultation",
    openedAt: "2025-03-05",
    status: "Under Review",
    department: "General Medicine",
  },
  {
    id: "case-3",
    patientId: "MRN-245802",
    patientName: "Ravi Iyer",
    mrn: "MRN-245802",
    caseType: "Post-op",
    openedAt: "2025-02-28",
    status: "Closed",
    department: "Cardiology",
  },
  {
    id: "case-4",
    patientId: "MRN-245811",
    patientName: "Fatima Khan",
    mrn: "MRN-245811",
    caseType: "Routine check",
    openedAt: "2025-03-07",
    status: "Active",
    department: "ENT",
  },
  {
    id: "case-5",
    patientId: "MRN-245990",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    caseType: "Referral",
    openedAt: "2025-03-06",
    status: "Under Review",
    department: "Internal Medicine",
  },
];

export default function PatientCasesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [rows] = React.useState<PatientCaseRow[]>(MOCK_CASES);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);

  const totalCases = rows.length;
  const activeCases = rows.filter((r) => r.status === "Active").length;
  const closedCases = rows.filter((r) => r.status === "Closed").length;

  const columns = React.useMemo<CommonColumn<PatientCaseRow>[]>(
    () => [
      {
        field: "patientName",
        headerName: "Patient",
        width: 250,
        renderCell: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: "primary.main",
              }}
            >
              {row.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.mrn}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "caseType",
        headerName: "Case Type",
        width: 180,
      },
      {
        field: "openedAt",
        headerName: "Opened",
        width: 140,
        valueGetter: (row) =>
          row?.openedAt ? new Date(row.openedAt).toLocaleDateString() : "—",
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (row) => (
          <Chip
            label={row.status}
            size="small"
            color={statusColors[row.status]}
            variant={row.status === "Closed" ? "outlined" : "filled"}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        align: "center",
        renderCell: (row) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/patients/profile?mrn=${row.mrn}`);
              }}
              sx={{ minWidth: "auto", p: 0.5, borderRadius: 1.5 }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setSnackbar(`Add note (stub)`);
              }}
              sx={{ minWidth: "auto", p: 0.5, borderRadius: 1.5 }}
            >
              <EditNoteIcon sx={{ fontSize: 18 }} />
            </Button>
          </Stack>
        ),
      },
    ],
    [theme.palette.primary.main],
  );

  return (
    <PageTemplate
      title="Patient Cases"
      subtitle="View and manage your patient cases, add notes, and track status."
    >
      <Stack spacing={1.25}>
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
       
          <CommonDataGrid<PatientCaseRow>
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search patient cases, MRN or name..."
            searchFields={["patientName", "mrn", "id"]}
          />

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
