"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Divider,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FiberManualRecord as StatusIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "@/src/store/hooks";
import { addResults } from "@/src/store/slices/limsSlice";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@/src/ui/components/molecules/Card";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface Instrument {
  id: string;
  name: string;
  type: string;
  department: string;
  interface: string;
  status: "online" | "warning" | "offline";
  calibrationStatus: string;
  lastQC: string;
  qcStatus: "pass" | "fail" | "pending";
  todayCount?: string;
  bottlesLoaded?: string;
  positiveFlags?: string;
  statusText?: string;
}

const MOCK_INSTRUMENTS: Instrument[] = [
  {
    id: "inst-1",
    name: "Sysmex XN-1000",
    type: "Haematology Analyser",
    department: "Haematology Dept",
    interface: "ASTM / HL7",
    status: "online",
    calibrationStatus: "Today 08:00 AM",
    lastQC: "Pass",
    qcStatus: "pass",
    todayCount: "82 samples",
  },
  {
    id: "inst-2",
    name: "Roche Cobas 6000",
    type: "Biochemistry Analyser",
    department: "Biochemistry Dept",
    interface: "ASTM",
    status: "warning",
    calibrationStatus: "Yesterday",
    lastQC: "Fail (1m)",
    qcStatus: "fail",
    statusText: "Idle – Awaiting QC rerun",
  },
  {
    id: "inst-3",
    name: "BD BACTEC FX",
    type: "Blood Culture System",
    department: "Microbiology Dept",
    interface: "TCP/IP",
    status: "online",
    calibrationStatus: "Today",
    lastQC: "Pass",
    qcStatus: "pass",
    bottlesLoaded: "12/40",
    positiveFlags: "2 flagged",
  },
];

import { LabInstrumentsTable } from "./components/LabInstrumentsTable";

export default function LabInstrumentsPage() {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  const handleSimulateLink = (instId: string) => {
    // Simulate parsing a CSV: SID, Test, Analyte, Result, Flag
    // SID-101, CBC, H1, 10.5, Low
    const mockCsvData = [
      {
        sampleId: "SAM-001",
        test: "CBC",
        analyte: "HGB",
        result: "10.2",
        flag: "Low",
        unit: "g/dL",
        status: "analysed",
      },
      {
        sampleId: "SAM-001",
        test: "CBC",
        analyte: "WBC",
        result: "12.4",
        flag: "High",
        unit: "x10^3/uL",
        status: "analysed",
      },
      {
        sampleId: "SAM-002",
        test: "TFT",
        analyte: "TSH",
        result: "14.5",
        flag: "High",
        unit: "mIU/L",
        status: "analysed",
      },
    ];
    // @ts-ignore
    dispatch(addResults(mockCsvData));
    alert(
      `CSV Processed: Data for ${mockCsvData.length} analyses imported from ${instId}`,
    );
  };

  return (
    <PageTemplate
      title="Laboratory Instruments"
      currentPageTitle="Instruments"
      fullHeight
    >
      <Stack
        spacing={1.25}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: "22px" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
              >
                Laboratory Instruments
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Manage analyser connections, QC status and instrument
                lifecycles.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{ borderRadius: 1.5, px: 2, fontWeight: 700 }}
            >
              Add Instrument
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        <LabInstrumentsTable
          instruments={MOCK_INSTRUMENTS}
          onSimulateLink={handleSimulateLink}
        />
      </Stack>

      <CommonDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Instrument"
        maxWidth="sm"
        content={
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                label="Instrument Name"
                size="small"
                placeholder="e.g. Roche Cobas 6000"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Type"
                  size="small"
                  placeholder="Haematology Analyser"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Interface Protocol"
                  fullWidth
                  size="small"
                  placeholder="ASTM"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>

            <Box>
              <TextField
                fullWidth
                label="Department"
                size="small"
                placeholder="Haematology"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>
        }
        actions={
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsModalOpen(false)}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Add Instrument
            </Button>
          </Stack>
        }
      />
    </PageTemplate>
  );
}
