import React from "react";
import { Theme, alpha } from "@mui/material/styles";
import {
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  CommonTableColumn,
  CommonTableFilter,
} from "@/src/ui/components/molecules/CommonTable";
import { EnterpriseStatusChip } from "../../../components/EnterpriseUi";
import {
  OtCase,
  InstrumentCountRow,
  MedicationRow,
  DischargeMedicationRow,
  PRIORITY_COLOR,
  STATUS_COLOR,
  ROOM_OPTIONS,
  formatTime,
  toStatusTone,
} from "../OpTimeData";

export const getCaseBoardColumns = (
  theme: Theme,
  roomLabelById: Map<string, string>,
  selectedCaseId: string,
  openWorkspace: (row: OtCase) => void,
): CommonTableColumn<OtCase>[] => [
  {
    id: "time",
    label: "Time",
    minWidth: 96,
    renderCell: (row) => (
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
          fontSize: "0.78rem",
          fontWeight: 700,
        }}
      >
        {formatTime(row.scheduledAt)}
      </Typography>
    ),
  },
  {
    id: "case",
    label: "Case",
    minWidth: 220,
    renderCell: (row) => (
      <Stack spacing={0.2}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
          }}
        >
          {row.caseNo}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.patientName} • {row.mrn} • {row.ageGender}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "procedure",
    label: "Procedure",
    minWidth: 230,
    renderCell: (row) => (
      <Stack spacing={0.2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.procedure}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.department}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "team",
    label: "Surgical Team",
    minWidth: 190,
    renderCell: (row) => (
      <Stack spacing={0.2}>
        <Typography variant="caption">{row.surgeon}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.anesthetist}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "room",
    label: "Room",
    minWidth: 96,
    renderCell: (row) => (
      <Chip
        size="small"
        label={roomLabelById.get(row.roomId) ?? row.roomId}
        variant="outlined"
        sx={{
          borderColor: alpha(theme.palette.primary.main, 0.34),
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          fontWeight: 700,
          fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
        }}
      />
    ),
  },
  {
    id: "priority",
    label: "Priority",
    minWidth: 95,
    renderCell: (row) => (
      <Chip
        size="small"
        label={row.priority}
        color={PRIORITY_COLOR[row.priority]}
      />
    ),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 110,
    renderCell: (row) => (
      <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />
    ),
  },
  {
    id: "prep",
    label: "Prep",
    minWidth: 130,
    renderCell: (row) => (
      <Stack spacing={0.45} sx={{ minWidth: 95 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
          }}
        >
          {row.prepPercent}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={row.prepPercent}
          sx={{ height: 5, borderRadius: 99 }}
        />
      </Stack>
    ),
  },
  {
    id: "action",
    label: "Action",
    minWidth: 132,
    renderCell: (row) => (
      <Button
        size="small"
        variant={selectedCaseId === row.id ? "contained" : "outlined"}
        onClick={() => openWorkspace(row)}
      >
        Open Workspace
      </Button>
    ),
  },
];

export const getBoardFilters = (): CommonTableFilter<OtCase>[] => [
  {
    id: "status",
    label: "Status",
    allValue: "all",
    defaultValue: "all",
    options: [
      { label: "All Statuses", value: "all" },
      { label: "Scheduled", value: "Scheduled" },
      { label: "Pre-Op", value: "Pre-Op" },
      { label: "In OR", value: "In OR" },
      { label: "Closing", value: "Closing" },
      { label: "PACU", value: "PACU" },
      { label: "Completed", value: "Completed" },
      { label: "Cancelled", value: "Cancelled" },
    ],
    getValue: (row) => row.status,
  },
  {
    id: "room",
    label: "Room",
    allValue: "all",
    defaultValue: "all",
    options: [{ label: "All Rooms", value: "all" } as any].concat(
      ROOM_OPTIONS.map((room) => ({ label: room.label, value: room.id })),
    ),
    getValue: (row) => row.roomId,
  },
  {
    id: "priority",
    label: "Priority",
    allValue: "all",
    defaultValue: "all",
    options: [
      { label: "All Priorities", value: "all" },
      { label: "STAT", value: "STAT" },
      { label: "Urgent", value: "Urgent" },
      { label: "Elective", value: "Elective" },
    ],
    getValue: (row) => row.priority,
  },
];

export const getCountColumns = (): CommonTableColumn<InstrumentCountRow>[] => [
  {
    id: "item",
    label: "Item",
    minWidth: 120,
    renderCell: (row) => <Typography variant="body2">{row.item}</Typography>,
  },
  {
    id: "initial",
    label: "Initial",
    minWidth: 80,
    renderCell: (row) => (
      <Typography variant="caption">{row.initial}</Typography>
    ),
  },
  {
    id: "final",
    label: "Final",
    minWidth: 80,
    renderCell: (row) => <Typography variant="caption">{row.final}</Typography>,
  },
  {
    id: "status",
    label: "Status",
    minWidth: 100,
    renderCell: (row) => (
      <EnterpriseStatusChip
        label={row.status}
        tone={toStatusTone(row.status)}
      />
    ),
  },
];

export const getMedicationColumns = (): CommonTableColumn<MedicationRow>[] => [
  {
    id: "drug",
    label: "Drug",
    minWidth: 130,
    renderCell: (row) => <Typography variant="body2">{row.drug}</Typography>,
  },
  {
    id: "dose",
    label: "Dose",
    minWidth: 80,
    renderCell: (row) => <Typography variant="caption">{row.dose}</Typography>,
  },
  {
    id: "route",
    label: "Route",
    minWidth: 90,
    renderCell: (row) => <Typography variant="caption">{row.route}</Typography>,
  },
  {
    id: "time",
    label: "Time",
    minWidth: 85,
    renderCell: (row) => (
      <Typography
        variant="caption"
        sx={{
          fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
        }}
      >
        {row.time}
      </Typography>
    ),
  },
];

export const getDischargeMedicationColumns =
  (): CommonTableColumn<DischargeMedicationRow>[] => [
    {
      id: "drug",
      label: "Drug",
      minWidth: 130,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.drug}
        </Typography>
      ),
    },
    {
      id: "dose",
      label: "Dose",
      minWidth: 80,
      renderCell: (row) => (
        <Typography variant="caption">{row.dose}</Typography>
      ),
    },
    {
      id: "frequency",
      label: "Freq",
      minWidth: 70,
      renderCell: (row) => (
        <Typography variant="caption">{row.frequency}</Typography>
      ),
    },
    {
      id: "duration",
      label: "Duration",
      minWidth: 95,
      renderCell: (row) => (
        <Typography variant="caption">{row.duration}</Typography>
      ),
    },
    {
      id: "instructions",
      label: "Instructions",
      minWidth: 130,
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.instructions}
        </Typography>
      ),
    },
  ];
