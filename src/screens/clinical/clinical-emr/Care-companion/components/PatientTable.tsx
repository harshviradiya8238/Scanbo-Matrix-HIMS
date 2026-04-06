import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useTheme } from "@/src/ui/theme";
import { alpha } from "@mui/material/styles";
import { getStatusConfig, getAdherenceColor } from "../utils/mockDataUtils";
import type { EnrolledPatient, PatientStatus } from "../utils/types";

interface PatientTableProps {
  patients: EnrolledPatient[];
  onEditPatient: (patient: EnrolledPatient) => void;
  onViewPatient: (patient: EnrolledPatient) => void;
  onClosePlan: (patient: EnrolledPatient) => void;
  toolbarRight?: React.ReactNode;
}

export default function PatientTable({
  patients,
  onEditPatient,
  onViewPatient,
  onClosePlan,
  toolbarRight,
}: PatientTableProps) {
  const theme = useTheme();

  const columns = React.useMemo<CommonColumn<EnrolledPatient>[]>(
    () => [
      {
        field: "name",
        headerName: "Patient",
        width: "25%",
        renderCell: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: row.avatarColor,
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {row.initials}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "text.primary", lineHeight: 1.3 }}
              >
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.mrn} · {row.language}
              </Typography>
              {row.platforms.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: "0.67rem" }}
                >
                  {row.platforms.join(" · ")}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        field: "program",
        headerName: "Program",
        width: 150,
        renderCell: (row) => (
          <Box
            sx={{
              display: "inline-flex",
              px: 1.25,
              py: 0.3,
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "rgba(17, 114, 186, 0.2)",
              bgcolor: "rgba(17, 114, 186, 0.04)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              {row.program}
            </Typography>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (row) => {
          const statusCfg = getStatusConfig(row.status, theme);
          return (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.35,
                borderRadius: "20px",
                bgcolor: statusCfg.bg,
                border: "1px solid",
                borderColor: statusCfg.border,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: statusCfg.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: statusCfg.color,
                  lineHeight: 1,
                }}
              >
                {statusCfg.label}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "vitals",
        headerName: "Vitals",
        width: 150,
        renderCell: (row) =>
          row.bp || row.glucose ? (
            <Box>
              {row.bp && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    color: row.bpAlert ? "error.main" : "text.primary",
                  }}
                >
                  BP: {row.bp}
                </Typography>
              )}
              {row.glucose && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    color: row.glucoseAlert ? "error.main" : "text.secondary",
                  }}
                >
                  Glucose: {row.glucose}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        field: "adherence",
        headerName: "Adherence",
        width: 180,
        renderCell: (row) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <LinearProgress
              variant="determinate"
              value={row.adherence}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 4,
                bgcolor: alpha(getAdherenceColor(row.adherence, theme), 0.12),
                "& .MuiLinearProgress-bar": {
                  bgcolor: getAdherenceColor(row.adherence, theme),
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                minWidth: 30,
                color: getAdherenceColor(row.adherence, theme),
              }}
            >
              {row.adherence}%
            </Typography>
          </Stack>
        ),
      },
      {
        field: "lastCheckIn",
        headerName: "Last Check-In",
        width: 150,
        align: "center",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        align: "center",
        renderCell: (row) => (
          <Stack
            direction="row"
            spacing={0.25}
            justifyContent="center"
            alignItems="center"
          >
            {row.status !== "closed" && row.isUrgent ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  py: 0.3,
                  px: 1.25,
                  minWidth: 0,
                }}
              >
                Urgent
              </Button>
            ) : row.status !== "closed" ? (
              <Button
                size="small"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  py: 0.3,
                  px: 1.25,
                  minWidth: 0,
                  borderColor: "rgba(17, 114, 186, 0.3)",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "rgba(17, 114, 186, 0.05)",
                  },
                }}
              >
                Call
              </Button>
            ) : null}
            {row.status !== "closed" && (
              <IconButton
                size="small"
                onClick={() => onEditPatient(row)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "rgba(17, 114, 186, 0.06)",
                    color: "primary.main",
                  },
                }}
              >
                <EditIcon sx={{ fontSize: "0.95rem" }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onViewPatient(row)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "rgba(17, 114, 186, 0.06)",
                  color: "primary.main",
                },
              }}
            >
              <VisibilityIcon sx={{ fontSize: "0.95rem" }} />
            </IconButton>
            {row.status !== "closed" && (
              <IconButton
                onClick={() => onClosePlan(row)}
                size="small"
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "rgba(17, 114, 186, 0.06)",
                    color: "warning.dark",
                  },
                }}
              >
                <LockIcon sx={{ fontSize: "0.95rem" }} />
              </IconButton>
            )}
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return (
    <CommonDataGrid<EnrolledPatient>
      rows={patients}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo={true}
      searchPlaceholder="Search patient, ID, program..."
      searchFields={["name", "mrn", "program"]}
      toolbarRight={toolbarRight}
    />
  );
}
