"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useLabStatusConfig } from "../../../lab-status-config";
import { useLabTheme } from "../../../lab-theme";
import type { LabWorksheet } from "../../../lab-types";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface WorksheetDetailViewProps {
  worksheet: LabWorksheet;
  samples: {
    id: string;
    patient: string;
    status: string;
    worksheetId?: string | null;
  }[];
  progress: number;
  onBack: () => void;
  onAddSample: (sampleId: string) => void;
  onSubmitForVerification: () => void;
  onVerify: () => void;
  worksheetSampleColumns: CommonColumn<any>[];
}

export default function WorksheetDetailView({
  worksheet,
  samples,
  progress,
  onBack,
  onAddSample,
  onSubmitForVerification,
  onVerify,
  worksheetSampleColumns,
}: WorksheetDetailViewProps) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { worksheetStatus } = useLabStatusConfig();
  const cfg = worksheetStatus[worksheet.status];

  const unassigned = samples.filter(
    (s) =>
      !s.worksheetId && (s.status === "received" || s.status === "assigned"),
  );
  const [addSampleId, setAddSampleId] = React.useState("");

  const worksheetSamples = samples.filter((s) =>
    worksheet.samples.includes(s.id),
  );

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          size="small"
          variant="outlined"
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {worksheet.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {worksheet.template} · {worksheet.dept}
          </Typography>
        </Box>
        <Chip label={cfg.label} sx={lab.chipSx(cfg.color)} />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 1, mb: 2 }}
        color={progress === 100 ? "success" : "primary"}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="add-sample-label">Add unassigned sample</InputLabel>
          <Select
            labelId="add-sample-label"
            value={addSampleId}
            label="Add unassigned sample"
            onChange={(e) => setAddSampleId(e.target.value as string)}
          >
            <MenuItem value="">Select sample</MenuItem>
            {unassigned.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.id} — {s.patient}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (addSampleId) {
              onAddSample(addSampleId);
              setAddSampleId("");
            }
          }}
          disabled={!addSampleId}
        >
          Add
        </Button>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={onSubmitForVerification}
          disabled={worksheet.status !== "open"}
        >
          Submit for Verification
        </Button>
        <Button
          variant="outlined"
          color="success"
          size="small"
          onClick={onVerify}
          disabled={worksheet.status !== "to_be_verified"}
        >
          Verify Worksheet
        </Button>
      </Stack>

      {/* Table card — fills remaining height */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          p: 0,
        }}
      >
        <CommonDataGrid
          rows={worksheetSamples}
          columns={worksheetSampleColumns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search samples..."
          searchFields={["id", "patient", "status"]}
        />
      </Box>
    </Box>
  );
}
