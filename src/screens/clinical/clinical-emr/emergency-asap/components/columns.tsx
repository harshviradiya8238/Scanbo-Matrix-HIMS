import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, type Theme } from "@/src/ui/theme";
import type { CommonColumn } from "@/src/components/table/CommonDataGrid";
import type { EmergencyPatient, ObservationEntry } from "../types";
import { TriageBadge } from "./shared/TriageBadge";

export const getArrivalColumns = (
  theme: Theme,
  availableBedsLength: number,
  openAssignBedModal: (id: string) => void,
  openTriageAssessment: (id: string) => void,
  handleOpenPatientChart: (id: string) => void,
  setActivePage: (page: any) => void,
  setSelectedPatientId: (id: string) => void,
  context: "dashboard" | "triage" | string,
): CommonColumn<EmergencyPatient>[] => {
  return [
    {
      headerName: "Patient",
      field: "name",
      width: 250,
      renderCell: (row) => {
        const initials = row.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.id} · {row.mrn}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      headerName: "Triage Level",
      field: "triageLevel",
      width: 140,
      renderCell: (row) => <TriageBadge level={row.triageLevel} />,
    },
    {
      headerName: "Complaint",
      field: "chiefComplaint",
      width: 280,
    },
    {
      headerName: "Wait",
      field: "waitingMinutes",
      width: 100,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color:
              row.waitingMinutes > 45
                ? "error.main"
                : row.waitingMinutes > 25
                  ? "warning.main"
                  : "success.main",
          }}
        >
          {row.waitingMinutes}m
        </Typography>
      ),
    },
    {
      headerName: "Bed",
      field: "assignedBed",
      width: 120,
      renderCell: (row) => row.assignedBed ?? "Not Assigned",
    },
    {
      headerName: "Doctor",
      field: "assignedDoctor",
      width: 150,
    },
    {
      headerName: "Status",
      field: "status",
      width: 140,
    },
    {
      headerName: "Actions",
      field: "id",
      width: 320,
      align: "right",
      renderCell: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {context === "triage" && (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  openTriageAssessment(row.id);
                }}
              >
                Triage
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={availableBedsLength === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  openAssignBedModal(row.id);
                }}
              >
                Assign Bed
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              if (context === "dashboard") {
                setSelectedPatientId(row.id);
                setActivePage("chart");
              } else {
                handleOpenPatientChart(row.id);
              }
            }}
          >
            Open Case Tracking
          </Button>
        </Stack>
      ),
    },
  ];
};

export const getObservationColumns = (): CommonColumn<ObservationEntry>[] => [
  {
    headerName: "Recorded",
    field: "recordedAt",
    width: 120,
  },
  {
    headerName: "BP",
    field: "bloodPressure",
    width: 110,
  },
  {
    headerName: "HR",
    field: "heartRate",
    width: 80,
  },
  {
    headerName: "RR",
    field: "respiratoryRate",
    width: 80,
  },
  {
    headerName: "SpO2",
    field: "spo2",
    width: 90,
    renderCell: (row) => `${row.spo2}%`,
  },
  {
    headerName: "Pain",
    field: "painScore",
    width: 100,
    renderCell: (row) => `${row.painScore}/10`,
  },
  {
    headerName: "Note",
    field: "note",
    width: 250,
  },
];
