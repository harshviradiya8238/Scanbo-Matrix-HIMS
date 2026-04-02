"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@/src/ui/components/atoms";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  PlayArrow as StartIcon,
  Hotel as AdmitIcon,
  Receipt as InvoiceIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@/src/ui/theme";
import { PatientRow } from "@/src/mocks/patientServer";
import { CommonColumn } from "@/src/components/table/CommonDataGrid";
import { maskPhoneNumber, statusColors } from "../utils/patient-list-utils";
import { PatientListData } from "../hooks/usePatientListData";
import { MenuItem } from "@mui/material";

export const getPatientListColumns = (
  theme: any,
  handleMenuOpen: (e: React.MouseEvent<HTMLElement>, row: PatientRow) => void,
): CommonColumn<PatientRow>[] => [
  {
    field: "name",
    headerName: "Patient Name",
    renderCell: (row: PatientRow) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: 13,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          {row.firstName[0]}
          {row.lastName[0]}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}
          >
            {row.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.68rem",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {row.mrn}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.68rem", display: "block", lineHeight: 1.2 }}
          >
            {row.department}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    field: "ageGender",
    headerName: "Age / Gender",
    valueGetter: (row: PatientRow) =>
      `${row?.age ?? "—"} / ${row?.gender ?? "—"}`,
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 140,
    renderCell: (row: PatientRow) => (
      <Stack
        direction="row"
        alignItems="center"
        sx={{ height: "100%", width: "100%" }}
      >
        <Typography variant="body2">{maskPhoneNumber(row.phone)}</Typography>
      </Stack>
    ),
  },
  {
    field: "city",
    headerName: "City",
    width: 120,
  },
  {
    field: "lastVisit",
    headerName: "Last Visit",
    width: 150,
    valueGetter: (row: PatientRow) =>
      row?.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : "—",
  },
  {
    field: "nextAppointment",
    headerName: "Next Appointment",
    valueGetter: (row: PatientRow) =>
      row?.nextAppointment
        ? new Date(row.nextAppointment).toLocaleDateString()
        : "—",
  },
  {
    field: "status",
    headerName: "Status",
    renderCell: (row: PatientRow) => (
      <Chip
        label={row.status}
        size="small"
        color={statusColors[row.status] as any}
        variant={row.status === "Inactive" ? "outlined" : "filled"}
      />
    ),
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 200,
    renderCell: (row: PatientRow) => (
      <Stack direction="row" spacing={0.5} flexWrap="wrap">
        {row.tags.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
        {row.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>
    ),
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 140,
    valueGetter: (row: PatientRow) =>
      row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    align: "center",
    renderCell: (row: PatientRow) => (
      <IconButton
        size="small"
        onClick={(e) => handleMenuOpen(e, row)}
        sx={{
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>
    ),
  },
];

export function ActionMenuItems({
  data,
  handleMenuNavigate,
}: {
  data: PatientListData;
  handleMenuNavigate: (route: string, extras?: Record<string, string>) => void;
}) {
  const theme = useTheme();
  const { setConfirmAction, setSnackbar, handleMenuClose, actionMenu } = data;

  return (
    <>
      <MenuItem onClick={() => handleMenuNavigate("/patients/profile")}>
        <ListItemIcon sx={{ minWidth: 24 }}>
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </MenuItem>
      <MenuItem
        onClick={() =>
          handleMenuNavigate("/patients/registration", {
            mode: "edit",
            source: "patient-list",
          })
        }
      >
        <ListItemIcon sx={{ minWidth: 24 }}>
          <EditIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Edit Demographics" />
      </MenuItem>
      <Divider sx={{ my: 1, opacity: 0.6 }} />
      <MenuItem
        onClick={() =>
          handleMenuNavigate("/appointments/calendar", {
            booking: "1",
            source: "patient-list",
          })
        }
      >
        <ListItemIcon sx={{ minWidth: 24 }}>
          <CalendarMonthIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="New Appointment" />
      </MenuItem>
      <MenuItem
        onClick={() =>
          handleMenuNavigate("/appointments/visit", {
            source: "patient-list",
          })
        }
      >
        <ListItemIcon sx={{ minWidth: 24 }}>
          <StartIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Start Encounter" />
      </MenuItem>
      <MenuItem onClick={() => handleMenuNavigate("/ipd/admissions")}>
        <ListItemIcon sx={{ minWidth: 24 }}>
          <AdmitIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Admit Patient" />
      </MenuItem>
      <Divider sx={{ my: 1, opacity: 0.6 }} />
      <MenuItem onClick={() => handleMenuNavigate("/billing/invoices")}>
        <ListItemIcon sx={{ minWidth: 24 }}>
          <InvoiceIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Billing / Invoices" />
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          const row = actionMenu?.row;
          if (row) {
            setConfirmAction({
              title: "Archive Patient?",
              description: `Are you sure you want to archive ${row.name}? They will no longer appear in the active registry.`,
              onConfirm: () =>
                setSnackbar(`Patient ${row.name} archived successfully.`),
            });
          }
          handleMenuClose();
        }}
        sx={{ color: "error.main" }}
      >
        <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
          <ArchiveIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Archive" />
      </MenuItem>
    </>
  );
}
