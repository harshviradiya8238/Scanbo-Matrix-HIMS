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

export default function LabInstrumentsPage() {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  const getStatusColor = (status: Instrument["status"]) => {
    switch (status) {
      case "online":
        return "#16a34a";
      case "warning":
        return "#ea580c";
      case "offline":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

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

  const renderInstrumentCard = (inst: Instrument) => {
    return (
      <Card
        key={inst.id}
        sx={{
          p: 0,
          borderRadius: 2.5,
          minHeight: "100%",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "text.primary", mb: 0.25 }}
              >
                {inst.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {inst.type} - {inst.department}
              </Typography>
            </Box>
            <StatusIcon
              sx={{ fontSize: 12, color: getStatusColor(inst.status) }}
            />
          </Stack>

          <Stack spacing={1.25} sx={{ mt: 2.5 }}>
            {inst.interface && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Interface
                </Typography>
                <Chip
                  label={inst.interface}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: "#0891b2",
                    borderRadius: 1,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                Calibration
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {inst.status === "online" && (
                  <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a" }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color:
                      inst.status === "online" ? "#16a34a" : "text.primary",
                  }}
                >
                  {inst.calibrationStatus}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                Last QC
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {inst.qcStatus === "pass" && (
                  <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a" }} />
                )}
                {inst.qcStatus === "fail" && (
                  <ErrorIcon sx={{ fontSize: 12, color: "#dc2626" }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: inst.qcStatus === "fail" ? "#dc2626" : "#16a34a",
                  }}
                >
                  {inst.lastQC}
                </Typography>
              </Stack>
            </Stack>

            {inst.todayCount && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Today's Count
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {inst.todayCount}
                </Typography>
              </Stack>
            )}

            {inst.bottlesLoaded && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Bottles Loaded
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {inst.bottlesLoaded}
                </Typography>
              </Stack>
            )}

            {inst.positiveFlags && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Positive Flags
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#dc2626" }}
                >
                  {inst.positiveFlags}
                </Typography>
              </Stack>
            )}

            {inst.statusText && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color:
                      inst.status === "warning" ? "#ea580c" : "text.primary",
                    fontSize: "0.65rem",
                  }}
                >
                  {inst.statusText}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          sx={{
            mt: "auto",
            p: 1,
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            fullWidth
            variant="text"
            size="small"
            sx={{
              py: 0.75,
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              color: "text.secondary",
              textTransform: "none",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            View Logs
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<UploadIcon sx={{ fontSize: 13 }} />}
            onClick={() => handleSimulateLink(inst.id)}
            sx={{
              py: 0.75,
              justifyContent: "center",
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: "0.7rem",
              fontWeight: 700,
              bgcolor: theme.palette.primary.main,
              boxShadow: "none",
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Simulate Link
          </Button>
        </Stack>
      </Card>
    );
  };

  return (
    <PageTemplate title="Laboratory Instruments" currentPageTitle="Instruments">
      <Stack spacing={2.5}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2.5,
          }}
        >
          {MOCK_INSTRUMENTS.map((inst) => renderInstrumentCard(inst))}
        </Box>
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
