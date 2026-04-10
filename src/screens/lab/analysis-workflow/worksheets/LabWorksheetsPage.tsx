"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addWorksheet,
  updateWorksheetStatus,
  addSampleToWorksheet,
} from "@/src/store/slices/limsSlice";
import { useLabTheme } from "../../lab-theme";
import AddWorksheetModal from "../../modals/AddWorksheetModal";
import LabWorkspaceCard from "../../components/LabWorkspaceCard";
import { type CommonColumn } from "@/src/components/table/CommonDataGrid";
import { useSnackbar } from "@/src/ui/components/molecules/Snackbarcontext";

// Extracted Components
import WorksheetDetailView from "./components/WorksheetDetailView";
import WorksheetCard from "./components/WorksheetCard";
import { worksheetProgress } from "./utils";

export default function LabWorksheetsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { worksheets, samples, results } = useAppSelector(
    (state) => state.lims,
  );
  const { success } = useSnackbar();

  const [addModalOpen, setAddModalOpen] = React.useState(false);

  const selectedId = searchParams.get("id");
  const selectedWs = React.useMemo(
    () => worksheets.find((w) => w.id === selectedId),
    [worksheets, selectedId],
  );

  const worksheetSampleColumns = React.useMemo<CommonColumn<any>[]>(
    () => [
      {
        headerName: "Sample ID",
        field: "id",
        width: 150,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {row.id}
          </Typography>
        ),
      },
      {
        headerName: "Patient",
        field: "patient",
        width: 250,
      },
      {
        headerName: "Status",
        field: "status",
        width: 150,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.status}
            sx={lab.chipSx(theme.palette.info.main)}
          />
        ),
      },
    ],
    [theme, lab],
  );

  const samplesForDetail = React.useMemo(
    () =>
      samples.map((s) => ({
        id: s.id,
        patient: s.patient,
        status: s.status,
        worksheetId: s.worksheetId,
      })),
    [samples],
  );

  if (selectedWs) {
    return (
      <PageTemplate title="Worksheets" currentPageTitle="Worksheet Detail">
        <LabWorkspaceCard current="worksheets">
          <WorksheetDetailView
            worksheet={selectedWs}
            samples={samplesForDetail}
            progress={worksheetProgress(selectedWs, results)}
            onBack={() => router.push("/lab/worksheets")}
            worksheetSampleColumns={worksheetSampleColumns}
            onAddSample={(sampleId) => {
              dispatch(
                addSampleToWorksheet({
                  worksheetId: selectedWs.id,
                  sampleId,
                }),
              );
              success("Sample added to worksheet.");
            }}
            onSubmitForVerification={() => {
              dispatch(
                updateWorksheetStatus({
                  worksheetId: selectedWs.id,
                  status: "to_be_verified",
                }),
              );
              success("Submitted for verification.");
            }}
            onVerify={() => {
              dispatch(
                updateWorksheetStatus({
                  worksheetId: selectedWs.id,
                  status: "verified",
                }),
              );
              success("Worksheet verified.");
            }}
          />
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Worksheets"
      subtitle={`${worksheets.length} worksheets`}
      currentPageTitle="Worksheets"
    >
      <LabWorkspaceCard
        current="worksheets"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setAddModalOpen(true)}
          >
            New Worksheet
          </Button>
        }
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            }}
          >
            {worksheets.map((w) => (
              <WorksheetCard
                key={w.id}
                worksheet={w}
                progress={worksheetProgress(w, results)}
                onClick={() => router.push(`/lab/worksheets?id=${w.id}`)}
                onManage={() => router.push(`/lab/worksheets?id=${w.id}`)}
              />
            ))}
          </Box>
        </Stack>
      </LabWorkspaceCard>
      <AddWorksheetModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(form) => {
          dispatch(addWorksheet(form));
          success("Worksheet created.");
        }}
      />
    </PageTemplate>
  );
}
