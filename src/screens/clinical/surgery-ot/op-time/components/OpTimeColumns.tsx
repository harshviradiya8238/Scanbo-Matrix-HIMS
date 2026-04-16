import React from "react";
import { Theme, alpha } from "@mui/material/styles";
import {
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonColumn } from "@/src/components/table/CommonDataGrid";
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
): CommonColumn<OtCase>[] => [
  {
    field: "time",
    headerName: "Time",
    width: 96,
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
    field: "case",
    headerName: "Case",
    width: 220,
    flex: 1,
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
    field: "procedure",
    headerName: "Procedure",
    width: 230,
    flex: 1,
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
    field: "team",
    headerName: "Surgical Team",
    width: 190,
    flex: 1,
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
    field: "room",
    headerName: "Room",
    width: 100,
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
    field: "priority",
    headerName: "Priority",
    width: 95,
    renderCell: (row) => (
      <Chip
        size="small"
        label={row.priority}
        color={PRIORITY_COLOR[row.priority]}
      />
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    renderCell: (row) => (
      <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />
    ),
  },
  {
    field: "prep",
    headerName: "Prep",
    width: 130,
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
    field: "action",
    headerName: "Action",
    width: 140,
    renderCell: (row) => (
      <Button
        size="small"
        variant={selectedCaseId === row.id ? "contained" : "outlined"}
        onClick={() => openWorkspace(row)}
        sx={{ textTransform: "none" }}
      >
        Open Workspace
      </Button>
    ),
  },
];

export const getCountColumns = (): CommonColumn<InstrumentCountRow>[] => [
  {
    field: "item",
    headerName: "Item",
    width: 120,
    flex: 1,
    renderCell: (row) => <Typography variant="body2">{row.item}</Typography>,
  },
  {
    field: "initial",
    headerName: "Initial",
    width: 80,
    renderCell: (row) => (
      <Typography variant="caption">{row.initial}</Typography>
    ),
  },
  {
    field: "final",
    headerName: "Final",
    width: 80,
    renderCell: (row) => <Typography variant="caption">{row.final}</Typography>,
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    renderCell: (row) => (
      <EnterpriseStatusChip
        label={row.status}
        tone={toStatusTone(row.status)}
      />
    ),
  },
];

export const getMedicationColumns = (): CommonColumn<MedicationRow>[] => [
  {
    field: "drug",
    headerName: "Drug",
    width: 130,
    flex: 1,
    renderCell: (row) => <Typography variant="body2">{row.drug}</Typography>,
  },
  {
    field: "dose",
    headerName: "Dose",
    width: 80,
    renderCell: (row) => <Typography variant="caption">{row.dose}</Typography>,
  },
  {
    field: "route",
    headerName: "Route",
    width: 90,
    renderCell: (row) => <Typography variant="caption">{row.route}</Typography>,
  },
  {
    field: "time",
    headerName: "Time",
    width: 85,
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
  (): CommonColumn<DischargeMedicationRow>[] => [
    {
      field: "drug",
      headerName: "Drug",
      width: 130,
      flex: 1,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.drug}
        </Typography>
      ),
    },
    {
      field: "dose",
      headerName: "Dose",
      width: 80,
      renderCell: (row) => (
        <Typography variant="caption">{row.dose}</Typography>
      ),
    },
    {
      field: "frequency",
      headerName: "Freq",
      width: 70,
      renderCell: (row) => (
        <Typography variant="caption">{row.frequency}</Typography>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 95,
      renderCell: (row) => (
        <Typography variant="caption">{row.duration}</Typography>
      ),
    },
    {
      field: "instructions",
      headerName: "Instructions",
      width: 130,
      flex: 1,
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.instructions}
        </Typography>
      ),
    },
  ];
