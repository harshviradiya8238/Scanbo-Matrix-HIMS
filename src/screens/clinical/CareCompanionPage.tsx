"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { IpdMetricCard } from "@/src/screens/ipd/components/ipd-ui";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import {
  CARE_COMPANION_ENROLLED,
  type CareCompanionEnrolled,
} from "@/src/mocks/care-companion";
import EnrollPatientDialog, {
  type CareProgramTemplate,
} from "./components/EnrollPatientDialog";
import PatientDetailDrawer from "./components/PatientDetailDrawer";
import { alpha, useTheme } from "@/src/ui/theme";
import type { Theme } from "@mui/material";
import { usePermission } from "@/src/core/auth/usePermission";
import {
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  Videocam as VideocamIcon,
  Visibility as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";

type PatientStatus = "stable" | "high_risk" | "watch" | "closed";

interface EnrolledPatient {
  id: string;
  patientId: string;
  mrn?: string;
  name: string;
  program: string;
  status: PatientStatus;
  bp?: string;
  glucose?: string;
  bpAlert?: boolean;
  glucoseAlert?: boolean;
  adherence: number;
  lastCheckIn: string;
  language: string;
  platforms: string[];
  initials: string;
  avatarColor: string;
  isUrgent?: boolean;
}

const STATUS_FILTER_OPTIONS: { value: PatientStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "high_risk", label: "High Risk" },
  { value: "watch", label: "Watch" },
  { value: "stable", label: "Stable" },
  { value: "closed", label: "Closed" },
];

const PROGRAM_OPTIONS = [
  "All Programs",
  "Diabetes",
  "Post-Cardiac",
  "Hypertension",
  "Post-Ortho",
];

/** Map CARE_COMPANION_ENROLLED to EnrolledPatient for table */
function mapToEnrolledPatient(p: CareCompanionEnrolled): EnrolledPatient {
  const initials = p.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id: p.id,
    patientId: p.mrn,
    mrn: p.mrn,
    name: p.name,
    program: p.program,
    status: p.status,
    bp: p.bp,
    glucose: p.glucose,
    bpAlert: p.bpAlert,
    glucoseAlert: p.glucoseAlert,
    adherence: p.adherence,
    lastCheckIn: p.lastCheckIn,
    language: p.language,
    platforms: p.platforms ?? [],
    initials,
    avatarColor: "#1172BA",
    isUrgent: p.status === "high_risk",
  };
}

const MOCK_PATIENTS: EnrolledPatient[] =
  CARE_COMPANION_ENROLLED.map(mapToEnrolledPatient);

function getStatusConfig(status: PatientStatus, theme: Theme) {
  switch (status) {
    case "high_risk":
      return {
        label: "High Risk",
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.08),
        border: alpha(theme.palette.error.main, 0.3),
      };
    case "watch":
      return {
        label: "Watch",
        color: theme.palette.warning.dark,
        bg: alpha(theme.palette.warning.main, 0.1),
        border: alpha(theme.palette.warning.main, 0.35),
      };
    case "stable":
      return {
        label: "Stable",
        color: theme.palette.success.dark,
        bg: alpha(theme.palette.success.main, 0.08),
        border: alpha(theme.palette.success.main, 0.35),
      };
    case "closed":
      return {
        label: "Closed",
        color: theme.palette.text.secondary,
        bg: alpha(theme.palette.text.secondary, 0.06),
        border: alpha(theme.palette.text.secondary, 0.2),
      };
    default:
      return {
        label: status,
        color: theme.palette.text.secondary,
        bg: "transparent",
        border: "transparent",
      };
  }
}

function getAdherenceColor(adherence: number, theme: Theme) {
  if (adherence >= 70) return theme.palette.success.main;
  if (adherence >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
}

const HEADER_SX = {
  fontWeight: 700,
  textTransform: "uppercase" as const,
  fontSize: "0.7rem",
  letterSpacing: "0.06em",
  color: "text.secondary",
  py: 1.25,
  borderBottom: "1px solid",
  borderColor: "rgba(17, 114, 186, 0.12)",
  bgcolor: "rgba(17, 114, 186, 0.03)",
  whiteSpace: "nowrap" as const,
};

export default function CareCompanionPage() {
  const theme = useTheme();
  const canWrite = usePermission()("clinical.care_companion.write");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [patients, setPatients] = React.useState<EnrolledPatient[]>(MOCK_PATIENTS);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = React.useState(false);
  const [customProgramTemplates, setCustomProgramTemplates] = React.useState<
    CareProgramTemplate[]
  >([]);
  const [enrollDialogLaunchMode, setEnrollDialogLaunchMode] = React.useState<
    "enroll" | "create-template"
  >("enroll");
  const [drawerPatient, setDrawerPatient] = React.useState<EnrolledPatient | null>(null);
  const [drawerEditMode, setDrawerEditMode] = React.useState(false);
  const [closePlanDialogOpen, setClosePlanDialogOpen] = React.useState(false);
  const [closePlanPatient, setClosePlanPatient] = React.useState<EnrolledPatient | null>(null);
  const [closeReason, setCloseReason] = React.useState("completed");
  const [closingNotes, setClosingNotes] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PatientStatus | "all">("all");
  const [programFilter, setProgramFilter] = React.useState("All Programs");

  const activePatients = patients.filter((p) => p.status !== "closed");

  const filteredPatients = React.useMemo(() => {
    let list = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.program.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((p) => p.status === statusFilter);
    if (programFilter !== "All Programs")
      list = list.filter((p) => p.program === programFilter);
    return list;
  }, [patients, search, statusFilter, programFilter]);

  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const highRiskCount = patients.filter((p) => p.status === "high_risk").length;
  const adherenceAvg = Math.round(
    activePatients.reduce((a, p) => a + p.adherence, 0) /
      Math.max(1, activePatients.length),
  );

  return (
    <PageTemplate
      title="Care Companion"
      subtitle="Post-Discharge Patient Management"
      currentPageTitle="Care Companion"
    >
      <Stack spacing={2}>
        {/* Header Card */}
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1.5}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
              >
                Care Companion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Post-discharge patient monitoring, adherence tracking, and
                remote health management.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!canWrite}
                onClick={() => {
                  setEnrollDialogLaunchMode("create-template");
                  setIsEnrollDialogOpen(true);
                }}
                sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
              >
                Add New Care Plan
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                disabled={!canWrite}
                onClick={() => {
                    setEnrollDialogLaunchMode("enroll");
                  setIsEnrollDialogOpen(true);
                }}
                sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
              >
                Enroll Patient
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        {/* Stat Cards */}
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <IpdMetricCard
            label="Total Enrolled"
            value={patients.length.toString()}
            trend="Active care plans · +12%"
            tone="primary"
            icon={<GroupIcon sx={{ fontSize: 22 }} />}
          />
          <IpdMetricCard
            label="High-Risk Alerts"
            value={highRiskCount}
            trend="BP / Sugar out of range"
            tone="danger"
            icon={<WarningAmberIcon sx={{ fontSize: 22 }} />}
          />
          <IpdMetricCard
            label="Adherence Rate"
            value={`${adherenceAvg}%`}
            trend="Medicines + check-ins · +4%"
            tone="success"
            icon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
          />
          <IpdMetricCard
            label="Upcoming Reviews"
            value="9"
            trend="Scheduled for today"
            tone="warning"
            icon={<CalendarTodayIcon sx={{ fontSize: 22 }} />}
          />
        </Box>

        {/* Patient Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(17, 114, 186, 0.14)",
            overflow: "hidden",
            boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
          }}
        >
          {/* Toolbar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1.5}
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: "1px solid rgba(17, 114, 186, 0.10)",
              bgcolor: "background.paper",
            }}
          >
            {/* Search + Filters */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                placeholder="Search patient, ID, condition..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value as string)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 0.75 }}>
                      <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 44,
                    borderRadius: 2.5,
                    fontSize: "0.875rem",
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    },
                    "&.Mui-focused": {
                      backgroundColor: "background.paper",
                      "& fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                }}
              />
              </Box>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as PatientStatus | "all")
                }
                size="small"
                sx={{
                  minWidth: 130,
                  fontSize: "0.875rem",
                  borderRadius: 2,
                  bgcolor: "background.default",
                }}
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value as string)}
                size="small"
                sx={{
                  minWidth: 140,
                  fontSize: "0.875rem",
                  borderRadius: 2,
                  bgcolor: "background.default",
                }}
              >
                {PROGRAM_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: "0.875rem" }}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>

          {/* Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={HEADER_SX}>Patient</TableCell>
                  <TableCell sx={HEADER_SX}>Program</TableCell>
                  <TableCell sx={HEADER_SX}>Status</TableCell>
                  <TableCell sx={HEADER_SX}>Vitals</TableCell>
                  <TableCell sx={{ ...HEADER_SX, minWidth: 140 }}>
                    Adherence
                  </TableCell>
                  <TableCell align="center" sx={HEADER_SX}>Last Check-In</TableCell>
                  <TableCell sx={{ ...HEADER_SX }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPatients.map((p) => {
                  const statusCfg = getStatusConfig(p.status, theme);
                  return (
                    <TableRow
                      key={p.id}
                      sx={{
                        "&:hover": { bgcolor: "rgba(17, 114, 186, 0.03)" },
                        "&:not(:last-child) td": {
                          borderBottom: "1px solid rgba(17, 114, 186, 0.07)",
                        },
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Patient */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: p.avatarColor,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {p.initials}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: "text.primary", lineHeight: 1.3 }}
                            >
                              {p.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {p.patientId} · {p.language}
                            </Typography>
                            {p.platforms.length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", fontSize: "0.67rem" }}
                              >
                                {p.platforms.join(" · ")}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Program */}
                      <TableCell sx={{ py: 1.5 }}>
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
                            {p.program}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell sx={{ py: 1.5 }}>
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
                      </TableCell>

                      {/* Vitals */}
                      <TableCell sx={{ py: 1.5 }}>
                        {p.bp || p.glucose ? (
                          <Box>
                            {p.bp && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  color: p.bpAlert
                                    ? "error.main"
                                    : "text.primary",
                                }}
                              >
                                BP: {p.bp}
                              </Typography>
                            )}
                            {p.glucose && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  color: p.glucoseAlert
                                    ? "error.main"
                                    : "text.secondary",
                                }}
                              >
                                Glucose: {p.glucose}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Adherence */}
                      <TableCell sx={{ py: 1.5, minWidth: 140 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            variant="determinate"
                            value={p.adherence}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 4,
                              bgcolor: alpha(
                                getAdherenceColor(p.adherence, theme),
                                0.12,
                              ),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: getAdherenceColor(p.adherence, theme),
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              minWidth: 30,
                              color: getAdherenceColor(p.adherence, theme),
                            }}
                          >
                            {p.adherence}%
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Last Check-In */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {p.lastCheckIn}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 1.5 }} align="center">
                        <Stack
                          direction="row"
                          spacing={0.25}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {p.status !== "closed" && p.isUrgent ? (
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
                          ) : p.status !== "closed" ? (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PhoneIcon sx={{ fontSize: 14 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  borderRadius: "20px",
                                  fontSize: "0.72rem",
                                  py: 0.3,
                                  px: 1,
                                  minWidth: 0,
                                  borderColor: "rgba(17, 114, 186, 0.3)",
                                  color: "primary.main",
                                  "& .MuiButton-startIcon": { mr: 0.5 },
                                  "&:hover": {
                                    bgcolor: "rgba(17, 114, 186, 0.05)",
                                  },
                                }}
                              >
                                Audio
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VideocamIcon sx={{ fontSize: 14 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  borderRadius: "20px",
                                  fontSize: "0.72rem",
                                  py: 0.3,
                                  px: 1,
                                  minWidth: 0,
                                  borderColor: "rgba(17, 114, 186, 0.3)",
                                  color: "primary.main",
                                  "& .MuiButton-startIcon": { mr: 0.5 },
                                  "&:hover": {
                                    bgcolor: "rgba(17, 114, 186, 0.05)",
                                  },
                                }}
                              >
                                Video
                              </Button>
                            </>
                          ) : null}
                          {p.status !== "closed" && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDrawerPatient(p);
                                setDrawerEditMode(true);
                              }}
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
                            onClick={() => {
                              setDrawerPatient(p);
                              setDrawerEditMode(false);
                            }}
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
                          {p.status !== "closed" && (
                            <IconButton
                              onClick={() => {
                                setClosePlanPatient(p);
                                setClosePlanDialogOpen(true);
                              }}
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
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No patients match your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={2}
            sx={{
              px: 2,
              py: 1.25,
              borderTop: "1px solid rgba(17, 114, 186, 0.10)",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Rows per page:
              </Typography>
              <Select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "text.primary",
                  "& .MuiSelect-select": { py: 0 },
                }}
              >
                {[5, 10, 25, 50].map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: "0.8rem" }}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {filteredPatients.length === 0
                ? "0"
                : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, filteredPatients.length)}`}{" "}
              of {filteredPatients.length}
            </Typography>
            <Stack direction="row" spacing={0.25}>
              <IconButton
                size="small"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                sx={{
                  color: page === 0 ? "action.disabled" : "text.secondary",
                }}
              >
                <PrevIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
              <IconButton
                size="small"
                disabled={(page + 1) * rowsPerPage >= filteredPatients.length}
                onClick={() => setPage((p) => p + 1)}
                sx={{
                  color:
                    (page + 1) * rowsPerPage >= filteredPatients.length
                      ? "action.disabled"
                      : "text.secondary",
                }}
              >
                <NextIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <EnrollPatientDialog
        open={isEnrollDialogOpen}
        onClose={() => setIsEnrollDialogOpen(false)}
        customProgramTemplates={customProgramTemplates}
        onCreateProgramTemplate={(template) =>
          setCustomProgramTemplates((prev) => [template, ...prev])
        }
        launchMode={enrollDialogLaunchMode}
      />

      <PatientDetailDrawer
        open={!!drawerPatient}
        onClose={() => {
          setDrawerPatient(null);
          setDrawerEditMode(false);
        }}
        patient={drawerPatient}
        editMode={drawerEditMode}
        onClosePlanClick={(p) => {
          setClosePlanPatient(p as EnrolledPatient);
          setClosePlanDialogOpen(true);
        }}
      />

      {/* Close Care Plan Dialog */}
      <Dialog
        open={closePlanDialogOpen}
        onClose={() => {
          setClosePlanDialogOpen(false);
          setClosePlanPatient(null);
          setCloseReason("completed");
          setClosingNotes("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        {/* ── HEADER ── */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.4}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.25,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LockIcon sx={{ fontSize: 15, color: "error.main" }} />
              </Box>
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.01em">
                Close Care Plan
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {closePlanPatient
                ? `${closePlanPatient.name} — ${closePlanPatient.program}`
                : ""}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setClosePlanDialogOpen(false);
              setClosePlanPatient(null);
            }}
            sx={{
              bgcolor: alpha(theme.palette.text.primary, 0.05),
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.1) },
              flexShrink: 0,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── CONTENT ── */}
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {closePlanPatient && (
            <Stack spacing={2.5}>
              {/* Warning Banner */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.error.main, 0.2),
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.25,
                    bgcolor: alpha(theme.palette.error.main, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <WarningAmberIcon sx={{ color: "error.main", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="error.main" mb={0.4}>
                    This will archive the patient's care plan.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.6}>
                    Automated reminders and check-in requests will stop. All data will be archived
                    and accessible for future reference. Re-enroll to restart.
                  </Typography>
                </Box>
              </Box>

              {/* Program Summary */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "text.disabled",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Program Summary
                </Typography>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { k: "Patient", v: `${closePlanPatient.name}, 58 yrs` },
                    { k: "Program", v: closePlanPatient.program },
                    { k: "Enrolled", v: "Jan 12, 2025" },
                    { k: "Closing On", v: "10 Mar 2026" },
                    { k: "Total Check-ins", v: "3 logged" },
                    { k: "Overall Adherence", v: `${closePlanPatient.adherence}%`, alert: true },
                  ].map(({ k, v, alert }, i, arr) => (
                    <Stack
                      key={k}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 1.1,
                        borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                        bgcolor: alert ? alpha(theme.palette.error.main, 0.03) : "transparent",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {k}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={alert ? "error.main" : "text.primary"}
                      >
                        {v}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </Box>

              {/* Reason for Closing */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "text.disabled",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Reason for Closing
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                >
                  <MenuItem value="completed">Program completed successfully</MenuItem>
                  <MenuItem value="transferred">Patient transferred</MenuItem>
                  <MenuItem value="withdrawn">Patient withdrew</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Box>

              {/* Closing Notes */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "text.disabled",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Closing Notes{" "}
                  <Box component="span" sx={{ textTransform: "none", fontSize: "0.68rem", fontWeight: 400 }}>
                    (Optional)
                  </Box>
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  placeholder="e.g. Patient recovered well. Follow-up in 6 months..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            bgcolor: alpha(theme.palette.background.default, 0.6),
          }}
        >
          <Button
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
            onClick={() => {
              setClosePlanDialogOpen(false);
              setClosePlanPatient(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"

            disableElevation
            startIcon={<LockIcon sx={{ fontSize: 16 , color: "common.white"}} />}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5,color: "common.white" }}
            onClick={() => {
              if (closePlanPatient) {
                setPatients((prev) =>
                  prev.map((pt) =>
                    pt.id === closePlanPatient.id ? { ...pt, status: "closed" as PatientStatus } : pt,
                  ),
                );
              }
              setClosePlanDialogOpen(false);
              setClosePlanPatient(null);
              setCloseReason("completed");
              setClosingNotes("");
            }}
          >
            Close Care Plan
          </Button>
        </Box>
      </Dialog>
    </PageTemplate>
  );
}
