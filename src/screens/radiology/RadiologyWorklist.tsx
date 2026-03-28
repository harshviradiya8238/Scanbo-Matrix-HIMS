"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
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
import {
  Card,
  WorkspaceHeaderCard,
  StatTile,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { useAppSelector } from "@/src/store/hooks";
import {
  WorklistState,
  ImagingPriority,
  ModalityCase,
} from "@/src/core/radiology/types";
import {
  CheckCircle as CheckCircleIcon,
  TaskAlt as TaskAltIcon,
} from "@mui/icons-material";

function workflowPriorityColor(
  priority: ImagingPriority | string,
): "error" | "warning" | "info" | "default" | "success" {
  if (priority === "STAT") return "error";
  if (priority === "Urgent") return "warning";
  return "default";
}

function worklistStatusColor(
  state: WorklistState | string,
): "default" | "info" | "warning" | "success" {
  if (state === "In Progress") return "info";
  if (state === "Tech QA") return "warning";
  if (state === "Sent to PACS") return "success";
  return "default";
}

type SnackSeverity = "success" | "info" | "warning" | "error";

interface RadiologyWorklistProps {
  defaultTab?: string;
}

export default function RadiologyWorklist({}: RadiologyWorklistProps) {
  const theme = useTheme();

  const radiologyWorklist = useAppSelector((state) => state.radiology.worklist);

  const [worklistStatusOverrides, setWorklistStatusOverrides] = React.useState<
    Record<string, WorklistState>
  >({});

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: SnackSeverity;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = React.useCallback(
    (message: string, severity: SnackSeverity = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const worklistRowsWithStatus = React.useMemo(
    () =>
      radiologyWorklist.map((row) => ({
        ...row,
        displayState: worklistStatusOverrides[row.id] ?? row.state,
      })),
    [radiologyWorklist, worklistStatusOverrides],
  );

  const worklistColumns: CommonColumn<
    ModalityCase & { displayState: WorklistState }
  >[] = [
   
    {
      field: "patientName",
      headerName: "Patient Name",
      width: 220,
      renderCell: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 700,

              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              borderRadius: "50%",
            }}
          >
            {row.patientName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
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
      field: "study",
      headerName: "Study",
    },
    {
      field: "room",
      headerName: "Room",
    },
    {
      field: "prepStatus",
      headerName: "Prep",
    },
    {
      field: "priority",
      headerName: "Priority",
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.priority}
          color={workflowPriorityColor(row.priority)}
        />
      ),
    },
    {
      field: "displayState",
      headerName: "State",
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.displayState}
          color={worklistStatusColor(row.displayState)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "center",
      renderCell: (row) => (
        <Stack direction="row" spacing={0.75}>
          <Button
            size="small"
            variant="text"
            startIcon={<TaskAltIcon />}
            disabled={
              row.displayState === "In Progress" ||
              row.displayState === "Sent to PACS"
            }
            onClick={(event) => {
              event.stopPropagation();
              setWorklistStatusOverrides((prev) => ({
                ...prev,
                [row.id]: "In Progress",
              }));
              showSnack(`Started study: ${row.study}`, "success");
            }}
          >
            Start Scan
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<CheckCircleIcon />}
            disabled={row.displayState === "Sent to PACS"}
            onClick={(event) => {
              event.stopPropagation();
              setWorklistStatusOverrides((prev) => ({
                ...prev,
                [row.id]: "Sent to PACS",
              }));
              showSnack(`Completed and sent: ${row.study}`, "success");
            }}
          >
            Complete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <PageTemplate title="Technician Worklist">
      <Stack spacing={2}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Technician Worklist
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track radiology orders pending execution.
              </Typography>
            </Box>
          </Stack>
        </WorkspaceHeaderCard>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sx={{ display: "flex" }}>
            <CommonDataGrid
              showSerialNo
              columns={worklistColumns}
              rows={worklistRowsWithStatus}
              tableHeight={430}
              searchPlaceholder="Search worklist..."
            />
          </Grid>
        </Grid>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
