"use client";

import * as React from "react";
import { Button, Chip, Stack, Typography } from "@/src/ui/components/atoms";
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  SwapHoriz as SwapHorizIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { ENCOUNTER_STATUS_LABEL } from "../../opd-encounter";
import { EncounterStatus } from "../../opd-mock-data";
import { QueueItem, OpdQueueData } from "../utils/opd-queue-types";

const queueStatusColor: Record<
  EncounterStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  BOOKED: "default",
  ARRIVED: "warning",
  IN_QUEUE: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface OpdQueueTableProps {
  data: OpdQueueData;
}

export function OpdQueueTable({ data }: OpdQueueTableProps) {
  const {
    filteredQueue,
    capabilities,
    role,
    handleStartConsult,
    handleViewHistory,
    handleOpenTransferDialog,
    handleNewRegistration,
    setFilterDrawerOpen,
    resetFilters,
  } = data;

  const queueColumns = React.useMemo<CommonColumn<QueueItem>[]>(
    () => [
      {
        field: "patientName",
        headerName: "Patient",
        width: "25%",
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.mrn} · {row.ageGender}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "chiefComplaint",
        headerName: "Chief Complaint",
        width: "25%",
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.chiefComplaint || "--"}
          </Typography>
        ),
      },
      {
        field: "doctor",
        headerName: "Consultant",
        width: 170,
        renderCell: (row) => row.doctor || "--",
      },
      {
        field: "status",
        headerName: "Status",
        width: 230,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.6} flexWrap="wrap">
            <Chip
              label={row.stage}
              color={row.stage === "In Progress" ? "info" : "warning"}
              size="small"
            />
            <Chip
              label={ENCOUNTER_STATUS_LABEL[row.status as EncounterStatus]}
              color={queueStatusColor[row.status as EncounterStatus]}
              variant="outlined"
              size="small"
            />
            {row.queuePriority === "Urgent" ? (
              <Chip
                size="small"
                color="error"
                label="Emergency"
                icon={<WarningAmberIcon fontSize="small" />}
              />
            ) : null}
          </Stack>
        ),
      },
      {
        field: "waitMinutes",
        headerName: "Wait",
        width: 100,
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.stage === "Waiting" ? `${row.waitMinutes} min` : "--"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        align: "right",
        width: 380,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.7} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              disabled={!capabilities.canStartConsult}
              onClick={() => handleStartConsult(row)}
            >
              {row.stage === "In Progress" ? "Open Consult" : "Start Consult"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<HistoryIcon />}
              disabled={!capabilities.canViewHistory}
              onClick={() => handleViewHistory(row)}
            >
              View History
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              disabled={!capabilities.canTransferToIpd}
              onClick={() => handleOpenTransferDialog(row)}
            >
              Move to IPD
            </Button>
          </Stack>
        ),
      },
    ],
    [
      capabilities,
      handleStartConsult,
      handleViewHistory,
      handleOpenTransferDialog,
    ],
  );

  return (
    <CommonDataGrid<QueueItem>
      rows={filteredQueue}
      columns={queueColumns}
      getRowId={(row) => row.id}
      showSerialNo={true}
      emptyTitle="No patients in queue"
      emptyDescription="No patients in queue for the selected filter."
      searchPlaceholder="Search patient, MRN, complaint..."
      searchFields={[
        "token",
        "patientName",
        "mrn",
        "chiefComplaint",
        "doctor",
        "department",
        "queuePriority",
      ]}
      toolbarRight={
        <Stack direction="row" spacing={1}>
          {role !== "DOCTOR" && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              disabled={!capabilities.canCreateRegistration}
              onClick={handleNewRegistration}
            >
              New Patient Registration
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filters
          </Button>
          <Button variant="text" size="small" onClick={resetFilters}>
            Clear
          </Button>
        </Stack>
      }
    />
  );
}
