"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Alert,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import {
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { updateSampleStatus, appendAudit } from "@/src/store/slices/limsSlice";

type SampleCondition =
  | "Acceptable"
  | "Haemolysed"
  | "Clotted"
  | "Insufficient Volume"
  | "Wrong Container";

interface ReceptionSample {
  id: string;
  sampleId: string;
  patient: string;
  collectedAt: string;
  elapsedMin: number;
  condition: SampleCondition;
  isStat: boolean;
  status: "pending" | "accepted" | "rejected";
}

export default function LabReceivePage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { samples: reduxSamples } = useAppSelector((state) => state.lims);

  const [localConditions, setLocalConditions] = React.useState<
    Record<string, SampleCondition>
  >({});
  const [localStatus, setLocalStatus] = React.useState<
    Record<string, "pending" | "accepted" | "rejected">
  >({});

  // Map Redux 'registered' samples to the view
  const displaySamples: ReceptionSample[] = reduxSamples
    .filter((s) => s.status === "registered" || s.status === "received")
    .map((s) => ({
      id: s.id,
      sampleId: s.id,
      patient: s.patient,
      collectedAt: s.received?.split(" ")[1] || "09:00 AM",
      elapsedMin: 25, // Mock elapsed time
      condition: localConditions[s.id] || "Acceptable",
      isStat: s.priority === "STAT" || s.priority === "URGENT",
      status:
        s.status === "received" ? "accepted" : localStatus[s.id] || "pending",
    }));

  const handleUpdateCondition = (id: string, condition: SampleCondition) => {
    setLocalConditions((prev) => ({ ...prev, [id]: condition }));
  };

  const handleAccept = (id: string) => {
    setLocalStatus((prev) => ({ ...prev, [id]: "accepted" }));
    dispatch(updateSampleStatus({ sampleId: id, status: "received" }));
    dispatch(
      appendAudit({
        ts: new Date().toISOString().slice(0, 19).replace("T", " "),
        event: `Sample ${id} accepted in reception`,
        user: "Lab Tech",
        sampleId: id,
      }),
    );
  };

  const handleReject = (id: string) => {
    setLocalStatus((prev) => ({ ...prev, [id]: "rejected" }));
    // In a real app we might update status to 'rejected'
  };

  const columns: CommonColumn<ReceptionSample>[] = [
    {
      headerName: "SAMPLE ID",
      field: "sampleId",
      width: 150,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 700 }}
        >
          {row.sampleId}
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
      headerName: "COLLECTED",
      field: "collectedAt",
      width: 150,
    },
    {
      headerName: "ELAPSED",
      field: "elapsedMin",
      width: 150,
      renderCell: (row) => {
        let color = "success.main";
        let showWarning = false;
        if (row.elapsedMin > 60) {
          color = "error.main";
          showWarning = true;
        } else if (row.elapsedMin > 45) {
          color = "warning.main";
        }

        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 700, color }}>
              {row.elapsedMin} min
            </Typography>
            {showWarning && (
              <WarningIcon sx={{ fontSize: 16, color: "error.main" }} />
            )}
          </Stack>
        );
      },
    },
    {
      headerName: "SAMPLE CONDITION",
      field: "condition",
      width: 220,
      renderCell: (row) => (
        <Select
          size="small"
          fullWidth
          value={row.condition}
          onChange={(e) =>
            handleUpdateCondition(row.id, e.target.value as SampleCondition)
          }
          sx={{
            fontSize: "0.875rem",
            bgcolor:
              row.condition === "Acceptable" ? "transparent" : "error.light",
          }}
        >
          <MenuItem value="Acceptable">Acceptable</MenuItem>
          <MenuItem value="Haemolysed">Haemolysed</MenuItem>
          <MenuItem value="Clotted">Clotted</MenuItem>
          <MenuItem value="Insufficient Volume">Insufficient Volume</MenuItem>
          <MenuItem value="Wrong Container">Wrong Container</MenuItem>
        </Select>
      ),
    },
    {
      headerName: "REJECT REASON",
      field: "rejectReason",
      width: 200,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{
            color:
              row.condition === "Acceptable" ? "text.secondary" : "error.main",
          }}
        >
          {row.condition === "Acceptable" ? "—" : row.condition}
        </Typography>
      ),
    },
    {
      headerName: "ACTION",
      field: "action",
      width: 200,
      renderCell: (row) => {
        if (row.status === "accepted") {
          return <Chip label="Accepted" color="success" size="small" />;
        }
        if (row.status === "rejected") {
          return <Chip label="Rejected" color="error" size="small" />;
        }

        return (
          <Stack direction="row" spacing={1}>
            {row.condition === "Acceptable" && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleAccept(row.id)}
                sx={{ minWidth: 80 }}
              >
                Accept
              </Button>
            )}
            <Button
              variant="outlined"
              color={row.condition === "Acceptable" ? "inherit" : "error"}
              size="small"
              onClick={() => handleReject(row.id)}
              sx={{
                minWidth: 80,
                ...(row.condition !== "Acceptable" && {
                  bgcolor: "error.main",
                  color: "white",
                  "&:hover": { bgcolor: "error.dark" },
                }),
              }}
            >
              Reject
            </Button>
          </Stack>
        );
      },
    },
  ];

  return (
    <PageTemplate
      title="Sample Reception"
      subtitle="Accept or reject samples arriving at the laboratory"
    >
      <Stack spacing={1.25}>
        <Alert
          severity="warning"
          icon={<AccessTimeIcon />}
          sx={{
            fontWeight: 600,
            borderRadius: 1,
            "& .MuiAlert-icon": { color: "warning.main" },
            border: "1px solid",
            borderColor: "warning.light",
          }}
        >
          18 samples awaiting reception. 6 are STAT priority — review sample
          conditions before acceptance.
        </Alert>

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
                <ScienceIcon sx={{ color: "primary.main" }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "primary.main" }}
                >
                  Sample Reception Queue
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage incoming samples and perform condition checks
                </Typography>
              </Box>
            </Stack>

            <Select
              size="small"
              defaultValue="all"
              sx={{
                minWidth: 140,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <MenuItem value="all">All Wards</MenuItem>
              <MenuItem value="icu">ICU</MenuItem>
              <MenuItem value="opd">OPD</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </Select>
          </Stack>
        </WorkspaceHeaderCard>

        <Box sx={{ mt: 1 }}>
          <CommonDataGrid
            rows={displaySamples}
            columns={columns}
            getRowId={(row) => row.id}
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
