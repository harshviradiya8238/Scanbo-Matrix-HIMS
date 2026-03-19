"use client";

import React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { verifyResult, refFromLowHigh } from "@/src/store/slices/limsSlice";
import { getFlagColor } from "../lab-status-config";
import { useLabTheme } from "../lab-theme";
import LabWorkspaceCard from "../components/LabWorkspaceCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import type { LabResultRow } from "../lab-types";

export default function LabResultsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { results } = useAppSelector((state) => state.lims);
  const [tab, setTab] = React.useState(0);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pending = results.filter((r) => r.status === "pending");
  const verified = results.filter((r) => r.status === "verified");
  const flagged = results.filter((r) => r.flag !== "NORMAL");

  const handleVerify = (resultId: string) => {
    dispatch(verifyResult({ resultId, verifiedBy: "Supervisor" }));
    setSnackbar({
      open: true,
      message: "Result verified.",
      severity: "success",
    });
  };

  const handleVerifyAllPending = () => {
    pending.forEach((r) =>
      dispatch(verifyResult({ resultId: r.id, verifiedBy: "Supervisor" })),
    );
    setSnackbar({
      open: true,
      message: `Verified ${pending.length} result(s).`,
      severity: "success",
    });
  };

  const rows = tab === 0 ? pending : tab === 1 ? verified : flagged;

  const resultColumns = React.useMemo<CommonColumn<LabResultRow>[]>(
    () => [
      {
        headerName: "Sample ID",
        field: "sampleId",
        width: 120,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {row.sampleId}
          </Typography>
        ),
      },
      {
        headerName: "Test",
        field: "test",
        width: 150,
      },
      {
        headerName: "Analyte",
        field: "analyte",
        width: 150,
      },
      {
        headerName: "Result",
        field: "result",
        width: 100,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: row.flag !== "NORMAL" ? "error.main" : "success.main",
            }}
          >
            {row.result}
          </Typography>
        ),
      },
      {
        headerName: "Unit",
        field: "unit",
        width: 80,
        renderCell: (row) => row.unit || "—",
      },
      {
        headerName: "Ref Range",
        field: "id",
        width: 120,
        renderCell: (row) => refFromLowHigh(row.refLow, row.refHigh),
      },
      {
        headerName: "Flag",
        field: "flag",
        width: 100,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.flag}
            sx={lab.chipSx(getFlagColor(row.flag, theme))}
          />
        ),
      },
      {
        headerName: "Analyst",
        field: "analyst",
        width: 150,
      },
      {
        headerName: "Actions",
        field: "id",
        width: 110,
        align: "right",
        headerAlign: "right",
        renderCell: (row) =>
          row.status === "pending" && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleVerify(row.id);
              }}
            >
              Verify
            </Button>
          ),
      },
    ],
    [theme, lab, handleVerify],
  );

  return (
    <PageTemplate
      title="Results Entry"
      subtitle="Manage and verify test results"
      currentPageTitle="Results"
    >
      <LabWorkspaceCard
        current="results"
        actions={
          tab === 0 && pending.length > 0 ? (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handleVerifyAllPending}
            >
              Verify All Pending
            </Button>
          ) : undefined
        }
      >
        <Stack spacing={2}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}
          >
            <Tab label={`Pending (${pending.length})`} />
            <Tab label={`Verified (${verified.length})`} />
            <Tab label={`Flagged (${flagged.length})`} />
          </Tabs>
          <CommonDataGrid<LabResultRow>
            rows={rows}
            columns={resultColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search results..."
          />
        </Stack>
      </LabWorkspaceCard>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
