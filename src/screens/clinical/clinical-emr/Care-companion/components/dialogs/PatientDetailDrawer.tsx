"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import CommonTabs from "@/src/ui/components/molecules/CommonTabs";
import { alpha, useTheme } from "@/src/ui/theme";
import type { Theme } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Favorite as FavoriteIcon,
  Lock as LockIcon,
  Medication as MedicationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Videocam as VideocamIcon,
  Watch as WatchIcon,
  MonitorHeart as MonitorHeartIcon,
  BloodtypeOutlined as BloodtypeIcon,
  AirOutlined as AirIcon,
  FavoriteBorder as HeartOutlineIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { maskMobileNumber } from "@/src/core/utils/phone";

export interface PatientDetailPatient {
  id: string;
  patientId: string;
  name: string;
  program: string;
  status: string;
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
  age?: number;
  gender?: string;
  phone?: string;
  enrolledDate?: string;
  condition?: string;
  note?: string;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "monitoring", label: "Monitoring" },
  { id: "schedule", label: "Schedule" },
  { id: "checkin", label: "Check-in" },
  { id: "careplan", label: "Care Plan" },
];

interface PatientDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  patient: PatientDetailPatient | null;
  editMode?: boolean;
  onClosePlanClick?: (patient: PatientDetailPatient) => void;
}

function getStatusConfig(status: string, theme: Theme) {
  switch (status) {
    case "high_risk":
      return {
        label: "High Risk",
        color: theme.palette.error.main,
        bg: theme.palette.error.main,
        lightBg: alpha(theme.palette.error.main, 0.1),
      };
    case "watch":
      return {
        label: "Watch",
        color: theme.palette.warning.dark,
        bg: theme.palette.warning.main,
        lightBg: alpha(theme.palette.warning.main, 0.1),
      };
    case "stable":
      return {
        label: "Stable",
        color: theme.palette.success.dark,
        bg: theme.palette.success.main,
        lightBg: alpha(theme.palette.success.main, 0.1),
      };
    case "closed":
      return {
        label: "Closed",
        color: theme.palette.text.secondary,
        bg: theme.palette.text.secondary,
        lightBg: alpha(theme.palette.text.secondary, 0.1),
      };
    default:
      return {
        label: status,
        color: theme.palette.text.secondary,
        bg: theme.palette.text.secondary,
        lightBg: alpha(theme.palette.text.secondary, 0.1),
      };
  }
}

// Reusable section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
        color: "text.disabled",
        display: "block",
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}

// Vital card
function VitalCard({
  label,
  value,
  unit,
  status,
  isAlert,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  status: string;
  isAlert?: boolean;
  icon: React.ElementType;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        // flex: "1 1 130px",
        p: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isAlert
          ? alpha(theme.palette.error.main, 0.25)
          : alpha(theme.palette.success.main, 0.2),
        bgcolor: isAlert
          ? alpha(theme.palette.error.main, 0.04)
          : alpha(theme.palette.success.main, 0.04),
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Grid container direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <Grid item>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: 1,
            bgcolor: isAlert
              ? alpha(theme.palette.error.main, 0.12)
              : alpha(theme.palette.success.main, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            sx={{
              fontSize: 14,
              color: isAlert ? "error.main" : "success.main",
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        </Grid>
      </Grid>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: isAlert ? "error.main" : "text.primary",
          lineHeight: 1,
          mb: 0.5,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {unit}
      </Typography>
      <Chip
        size="small"
        label={status}
        sx={{
          mt: 1,
          height: 18,
          fontSize: "0.6rem",
          fontWeight: 700,
          bgcolor: isAlert
            ? alpha(theme.palette.error.main, 0.12)
            : alpha(theme.palette.success.main, 0.12),
          color: isAlert ? "error.main" : "success.main",
          "& .MuiChip-label": { px: 0.75 },
        }}
      />
    </Box>
  );
}

// Activity row
function ActivityRow({
  date,
  bp,
  glucose,
  note,
  dotColor,
  last,
}: {
  date: string;
  bp: string;
  glucose: string;
  note?: string;
  dotColor: string;
  last?: boolean;
}) {
  return (
    <Grid
      container
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        py: 1.25,
        borderBottom: last ? "none" : "1px dashed",
        borderColor: "divider",
      }}
    >
      <Grid item>
      <Box sx={{ pt: 0.25 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: dotColor,
            mt: 0.5,
          }}
        />
      </Box>
      </Grid>
      <Grid item xs>
      <Box sx={{ flex: 1 }}>
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" fontWeight={600}>
              BP {bp} · Glucose {glucose}
            </Typography>
            {note && (
              <Typography variant="caption" color="error.main" fontWeight={500}>
                {note}
              </Typography>
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ whiteSpace: "nowrap", ml: 1 }}
          >
            {date}
          </Typography>
        </Grid>
      </Box>
      </Grid>
    </Grid>
  );
}

export default function PatientDetailDrawer({
  open,
  onClose,
  patient,
  editMode = false,
  onClosePlanClick,
}: PatientDetailDrawerProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [painLevel, setPainLevel] = React.useState<number | null>(null);
  const [mood, setMood] = React.useState<string | null>(null);
  const [medications, setMedications] = React.useState<
    { id: string; value: string }[]
  >([
    { id: "1", value: "Tab. Aspirin 75mg — Once daily" },
    { id: "2", value: "Tab. Atorvastatin 40mg — Night" },
    { id: "3", value: "Tab. Metoprolol 25mg — Twice daily" },
  ]);

  const [scheduleStatus, setScheduleStatus] = React.useState<
    Record<string, "pending" | "done" | "missed">
  >({
    "today-8am": "missed",
    "today-10am": "done",
    "today-2pm": "done",
    "today-4pm": "pending",
    "tomorrow-8am": "pending",
    "tomorrow-11am": "pending",
  });

  React.useEffect(() => {
    if (open) {
      setActiveTab(editMode ? "careplan" : "overview");
      setPainLevel(null);
      setMood(null);
      setMedications([
        { id: "1", value: "Tab. Aspirin 75mg — Once daily" },
        { id: "2", value: "Tab. Atorvastatin 40mg — Night" },
        { id: "3", value: "Tab. Metoprolol 25mg — Twice daily" },
      ]);
      setScheduleStatus({
        "today-8am": "missed",
        "today-10am": "done",
        "today-2pm": "done",
        "today-4pm": "pending",
        "tomorrow-8am": "pending",
        "tomorrow-11am": "pending",
      });
    }
  }, [open, editMode]);

  if (!patient) return null;

  const statusCfg = getStatusConfig(patient.status, theme);
  const gender = patient.gender ?? "Male";
  const age = patient.age ?? 58;
  const enrolledDate = patient.enrolledDate ?? "Jan 12, 2025";
  const condition = patient.condition ?? patient.program;
  const phone = patient.phone ?? "+91 98110 44221";
  const note =
    patient.note ??
    "Patient allergic to Penicillin. Low activity. Needs daily BP check.";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560 },
          // width: "26%",
          // maxWidth: "100%",
          boxShadow: "-4px 0 40px rgba(0,0,0,0.1)",
          bgcolor: "background.default",
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 2,
            background: `linear-gradient(135deg, ${alpha(patient.avatarColor, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0)} 60%)`,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Grid container direction="row" alignItems="flex-start" justifyContent="space-between">
            <Grid container direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Grid item>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: patient.avatarColor,
                  fontWeight: 800,
                  fontSize: "1.35rem",
                  boxShadow: `0 4px 14px ${alpha(patient.avatarColor, 0.45)}`,
                  border: "3px solid",
                  borderColor: "background.paper",
                  flexShrink: 0,
                }}
              >
                {patient.initials}
              </Avatar>
              </Grid>
              <Grid item xs>
              <Box minWidth={0}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, letterSpacing: "-0.01em", mb: 0.15 }}
                >
                  {patient.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {gender}, {age} yrs &middot; {patient.program} &middot; Since {enrolledDate}
                </Typography>
                <Grid container direction="row" spacing={0.75} wrap="wrap" sx={{ mt: 0.9 }}>
                  <Grid item>
                  <Chip
                    size="small"
                    label={statusCfg.label}
                    sx={{
                      height: 22,
                      bgcolor: statusCfg.bg,
                      color: "common.white",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      borderRadius: 1,
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  </Grid>
                  {patient.bpAlert && (
                    <Grid item>
                    <Chip
                      size="small"
                      label="⚠ BP Alert"
                      sx={{
                        height: 22,
                        bgcolor: alpha(theme.palette.error.main, 0.12),
                        color: "error.main",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.error.main, 0.25),
                        borderRadius: 1,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    </Grid>
                  )}
                  {patient.platforms[0] && (
                    <Grid item>
                    <Chip
                      size="small"
                      icon={<WatchIcon sx={{ fontSize: 12, color: "primary.main" }} />}
                      label={patient.platforms[0]}
                      sx={{
                        height: 22,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        borderRadius: 1,
                        "& .MuiChip-icon": { ml: 0.5 },
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                    </Grid>
                  )}
                </Grid>
              </Box>
              </Grid>
            </Grid>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                flexShrink: 0,
                bgcolor: alpha(theme.palette.text.primary, 0.06),
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.12) },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Box>

        {/* ── TABS ───────────────────────────────────────────── */}
        <Box
          sx={{
            // px: 2.5,
            pt: 1.3,
            pb: 1.1,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            bgcolor: "background.paper",
          }}
        >
          <CommonTabs
            tabs={TABS}
            value={activeTab}
            onChange={(v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{ minHeight: 44, "& .MuiTab-root": { minWidth: 0, px: 1, fontSize: "0.8rem" } }}
          />
        </Box>

        {/* ── CONTENT ────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2.5, pt: 3 }}>
          {/* ──── OVERVIEW ──── */}
          {activeTab === "overview" && (
            <Grid container direction="column" spacing={3}>
              <Grid item  >
              <Box>
                <SectionLabel>Current Vitals</SectionLabel>
                <Grid container direction="row" spacing={1.25} sx={{ mt: 1 }} wrap="wrap">
                  <Grid item xs={12} lg={6}><VitalCard
                    label="Blood Pressure"
                    value={patient.bp ?? "—"}
                    unit="mmHg"
                    status={patient.bpAlert ? "↑ Above target" : "✓ Normal"}
                    isAlert={patient.bpAlert}
                    icon={MonitorHeartIcon}
                  /></Grid>
                  <Grid item xs={12} lg={6}><VitalCard
                    label="Blood Glucose"
                    value={patient.glucose ?? "—"}
                    unit="mg/dL"
                    status="✓ Normal"
                    icon={BloodtypeIcon}
                  /></Grid>
                  <Grid item xs={12} lg={6}><VitalCard
                    label="Heart Rate"
                    value="82"
                    unit="bpm"
                    status="✓ Normal"
                    icon={FavoriteIcon}
                  /></Grid>
                  <Grid item xs={12} lg={6}> <VitalCard
                    label="SpO₂"
                    value="97%"
                    unit="Oxygen Sat."
                    status="✓ Normal"
                    icon={AirIcon}
                  /></Grid>
                </Grid>
              </Box>
              </Grid>

              <Grid item>
              {/* AI Insight */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.18),
                }}
              >
                <Grid container direction="row" spacing={1.25} alignItems="flex-start">
                  <Grid item>
                  <Box
                    sx={{
                      px: 0.9,
                      py: 0.3,
                      borderRadius: 0.75,
                      bgcolor: "primary.main",
                      color: "white",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      mt: 0.1,
                    }}
                  >
                    AI
                  </Box>
                  </Grid>
                  <Grid item xs>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    <strong style={{ color: theme.palette.text.primary }}>
                      {patient.name}
                    </strong>{" "}
                    needs attention — BP{" "}
                    <strong style={{ color: theme.palette.error.main }}>
                      {patient.bp ?? "—"}
                    </strong>{" "}
                    is above target. Consider scheduling an urgent review.
                  </Typography>
                  </Grid>
                </Grid>
              </Box>
              </Grid>

              <Grid item>
              {/* Recent Activity */}
              <Box>
                <SectionLabel>Recent Check-ins</SectionLabel>
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    px: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <ActivityRow
                    date="Today 8:42 AM"
                    bp={patient.bp ?? "—"}
                    glucose={patient.glucose ?? "—"}
                    note="Chest discomfort reported"
                    dotColor={theme.palette.error.main}
                  />
                  <ActivityRow
                    date="Yesterday"
                    bp={patient.bp ?? "—"}
                    glucose={patient.glucose ?? "—"}
                    dotColor={theme.palette.success.main}
                  />
                  <ActivityRow
                    date="Mar 8"
                    bp={patient.bp ?? "—"}
                    glucose={patient.glucose ?? "—"}
                    dotColor={theme.palette.success.main}
                    last
                  />
                </Box>
              </Box>
              </Grid>

              <Grid item>
              {/* Patient Info */}
              <Box>
                <SectionLabel>Patient Info</SectionLabel>
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { k: "Condition", v: condition },
                    { k: "Phone", v: maskMobileNumber(phone) },
                    { k: "Language", v: patient.language },
                    { k: "Wearable", v: patient.platforms[0] ?? "—" },
                    { k: "Adherence", v: `${patient.adherence}%` },
                  ].map(({ k, v }, i, arr) => (
                    <Grid
                      key={k}
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 1.1,
                        borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Grid item><Typography variant="body2" color="text.secondary">
                        {k}
                      </Typography></Grid>
                      <Grid item><Typography variant="body2" fontWeight={600}>
                        {v}
                      </Typography></Grid>
                    </Grid>
                  ))}
                </Box>
              </Box>
              </Grid>

              <Grid item>
              {/* Alert note */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.warning.main, 0.25),
                  display: "flex",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "1rem", lineHeight: 1 }}>⚠️</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {note}
                </Typography>
              </Box>
              </Grid>
            </Grid>
          )}

          {/* ──── MONITORING ──── */}
          {activeTab === "monitoring" && (
            <Grid container direction="column" spacing={3}>
              <Grid item>
              <Box>
                <SectionLabel>Vital Signs History</SectionLabel>
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    bgcolor: "background.paper",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        {["Date", "BP", "Glucose", "HR", "SpO₂", "Meds", "Mood"].map((h) => (
                          <TableCell
                            key={h}
                            sx={{ fontWeight: 700, fontSize: "0.68rem", color: "text.secondary", py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(["Today 8:42 AM", "Yesterday", "Mar 8"] as const).map((d, i) => (
                        <TableRow
                          key={d}
                          sx={{ "&:last-child td": { border: 0 }, "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                        >
                          <TableCell>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              {d}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main" fontWeight={700}>
                              {patient.bp ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main" fontWeight={700}>
                              {patient.glucose ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>{[82, 79, 81][i]}</TableCell>
                          <TableCell>{[97, 98, 97][i]}%</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={i === 0 ? "Missed" : "Taken"}
                              sx={{
                                height: 20,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                bgcolor: i === 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                color: i === 0 ? "error.main" : "success.main",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {["Anxious", "Okay", "Good"][i]}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Adherence Breakdown</SectionLabel>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container direction="column" spacing={2}>
                    {[
                      { label: "Medication", icon: MedicationIcon, value: patient.adherence, color: theme.palette.primary.main },
                      { label: "Check-ins", icon: ScheduleIcon, value: 58, color: theme.palette.warning.main },
                      { label: "PROMs", icon: AssignmentIcon, value: 33, color: theme.palette.error.main },
                    ].map(({ label, icon: Icon, value, color }) => (
                      <Grid item key={label}>
                        <Grid container direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                          <Grid item>
                            <Grid container direction="row" alignItems="center" spacing={1}>
                              <Grid item><Icon sx={{ fontSize: 16, color: "text.secondary" }} /></Grid>
                              <Grid item><Typography variant="body2" fontWeight={500}>{label}</Typography></Grid>
                            </Grid>
                          </Grid>
                          <Grid item>
                            <Typography variant="body2" fontWeight={800} color={color}>
                              {value}%
                            </Typography>
                          </Grid>
                        </Grid>
                        <LinearProgress
                          variant="determinate"
                          value={value}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(color, 0.12),
                            "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
              </Grid>
            </Grid>
          )}

          {/* ──── SCHEDULE ──── */}
          {activeTab === "schedule" && (
            <Grid container direction="column" spacing={3}>
              {[
                {
                  heading: "Today",
                  items: [
                    { id: "today-8am", time: "8:00 AM", title: "Morning Medications", sub: "Aspirin + Metoprolol", icon: MedicationIcon },
                    { id: "today-10am", time: "10:00 AM", title: "BP Check", sub: "Target <130/85", icon: HeartOutlineIcon },
                    { id: "today-2pm", time: "2:00 PM", title: "PROM Survey", sub: "Weekly outcomes form", icon: AssignmentIcon },
                    { id: "today-4pm", time: "4:00 PM", title: "Evening Medication", sub: "Metoprolol 25mg", icon: MedicationIcon },
                  ],
                },
                {
                  heading: "Tomorrow",
                  items: [
                    { id: "tomorrow-8am", time: "8:00 AM", title: "Morning Medications", sub: "Aspirin + Metoprolol", icon: MedicationIcon },
                    { id: "tomorrow-11am", time: "11:00 AM", title: "Tele-Consultation", sub: "Weekly review call", icon: PhoneIcon },
                  ],
                },
              ].map((section) => (
                <Grid item key={section.heading}>
                <Box>
                  <SectionLabel>{section.heading}</SectionLabel>
                  <Grid container direction="column" spacing={1} sx={{ mt: 1 }}>
                    {section.items.map((s) => {
                      const status = scheduleStatus[s.id] ?? "pending";
                      const isMissed = status === "missed";
                      const isDone = status === "done";
                      const isPending = status === "pending";
                      return (
                      <Grid item key={s.id}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isMissed ? alpha(theme.palette.error.main, 0.25) : isPending ? alpha(theme.palette.primary.main, 0.25) : "divider",
                          bgcolor: isMissed ? alpha(theme.palette.error.main, 0.04) : isPending ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Grid container direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                          <Grid item>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ minWidth: 68, color: isMissed ? "error.main" : "text.secondary" }}
                          >
                            {s.time}
                          </Typography>
                          </Grid>
                          <Grid item>
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 1.25,
                              bgcolor: isMissed ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.08),
                              display: "flex",
                              flexShrink: 0,
                            }}
                          >
                            <s.icon sx={{ fontSize: 16, color: isMissed ? "error.main" : "primary.main" }} />
                          </Box>
                          </Grid>
                          <Grid item xs>
                          <Box minWidth={0}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {s.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {s.sub}
                            </Typography>
                          </Box>
                          </Grid>
                        </Grid>
                        {isDone ? (
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            label="Done"
                            sx={{
                              height: 22,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              color: "success.dark",
                              flexShrink: 0,
                              "& .MuiChip-icon": { color: "inherit" },
                            }}
                          />
                        ) : isMissed ? (
                          <IconButton
                            size="small"
                            sx={{
                              color: "error.main",
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        ) : (
                          <Stack direction="row" spacing={0.5}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setScheduleStatus((prev) => ({ ...prev, [s.id]: "done" }))}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.68rem",
                                py: 0.3,
                                px: 1,
                                minHeight: 22,
                                borderRadius: 1.5,
                                bgcolor: "primary.main",
                              }}
                            >
                              Done ✓
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => setScheduleStatus((prev) => ({ ...prev, [s.id]: "missed" }))}
                              sx={{
                                color: "error.main",
                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.15) },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Stack>
                        )}
                      </Box>
                      </Grid>
                    );})}
                  </Grid>
                </Box>
                </Grid>
              ))}

              <Grid item>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <SectionLabel>Add Schedule Item</SectionLabel>
                <Grid container direction="column" spacing={1.5} sx={{ mt: 1 }}>
                  <Grid item>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                      <TextField
                        size="small"
                        label="Time"
                        type="time"
                        defaultValue="08:00"
                        sx={{ minWidth: 120, flex: "1 1 100px" }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        size="small"
                        select
                        label="Day"
                        defaultValue="Today"
                        sx={{ minWidth: 120, flex: "1 1 100px" }}
                      >
                        <MenuItem value="Today">Today</MenuItem>
                        <MenuItem value="Tomorrow">Tomorrow</MenuItem>
                      </TextField>
                      <TextField
                        size="small"
                        select
                        label="Type"
                        defaultValue="Medication"
                        sx={{ minWidth: 140, flex: "1 1 120px" }}
                      >
                        <MenuItem value="Medication">Medication</MenuItem>
                        <MenuItem value="BP Check">BP Check</MenuItem>
                        <MenuItem value="Call">Call</MenuItem>
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid item>
                    <TextField
                      size="small"
                      label="Title"
                      placeholder="e.g. Morning Medication"
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      size="small"
                      disableElevation
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      + Add Item
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              </Grid>
            </Grid>
          )}

          {/* ──── CHECK-IN ──── */}
          {activeTab === "checkin" && (
            <Grid container direction="column" spacing={3}>
              <Grid item>
              <Box>
                <SectionLabel>Log Today's Check-in</SectionLabel>
                <Grid container direction="column" spacing={1.25} sx={{ mt: 1 }}>
                  {[
                    "Systolic BP",
                    "Diastolic BP",
                    "Blood Glucose (mg/dL)",
                    "Heart Rate (bpm)",
                    "SpO₂ (%)",
                    "Weight (kg)",
                  ].map((l) => (
                    <Grid item key={l}><TextField size="small" label={l} placeholder="Enter value" fullWidth /></Grid>
                  ))}
                </Grid>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Medication Taken?</SectionLabel>
                <TextField
                  select
                  size="small"
                  fullWidth
                  defaultValue="all"
                  sx={{ mt: 1 }}
                  SelectProps={{
                    renderValue: (value) => {
                      const opts = [
                        { value: "all", label: "Yes — All doses taken", icon: CheckCircleIcon, color: "success.main" },
                        { value: "missed1", label: "Missed 1 dose", icon: WarningIcon, color: "warning.main" },
                        { value: "missedall", label: "No — Missed all doses", icon: ErrorIcon, color: "error.main" },
                      ];
                      const opt = opts.find((o) => o.value === value) ?? opts[0];
                      const Icon = opt.icon;
                      return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Icon sx={{ fontSize: 18, color: opt.color }} />
                          {opt.label}
                        </Box>
                      );
                    },
                  }}
                >
                  <MenuItem value="all">
                    <CheckCircleIcon sx={{ fontSize: 18, color: "success.main", mr: 1, verticalAlign: "middle" }} />
                    Yes — All doses taken
                  </MenuItem>
                  <MenuItem value="missed1">
                    <WarningIcon sx={{ fontSize: 18, color: "warning.main", mr: 1, verticalAlign: "middle" }} />
                    Missed 1 dose
                  </MenuItem>
                  <MenuItem value="missedall">
                    <ErrorIcon sx={{ fontSize: 18, color: "error.main", mr: 1, verticalAlign: "middle" }} />
                    No — Missed all doses
                  </MenuItem>
                </TextField>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Pain Level (0 = None, 10 = Severe)</SectionLabel>
                <Grid container direction="row" spacing={0.6} wrap="wrap" sx={{ mt: 1 }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <Grid item key={n}>
                      <Chip
                        label={String(n)}
                        size="small"
                        variant={painLevel === n ? "filled" : "outlined"}
                        color={painLevel === n ? "primary" : "default"}
                        onClick={() => setPainLevel(n)}
                        sx={{
                          minWidth: 34,
                          height: 30,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Mood</SectionLabel>
                <Grid container direction="row" spacing={0.75} wrap="wrap" sx={{ mt: 1 }}>
                  {[
                    { label: "😊 Good", val: "good" },
                    { label: "😐 Okay", val: "okay" },
                    { label: "😢 Sad", val: "sad" },
                    { label: "😰 Anxious", val: "anxious" },
                    { label: "😴 Tired", val: "tired" },
                    { label: "😤 Frustrated", val: "frustrated" },
                  ].map((m) => (
                    <Grid item key={m.val}>
                      <Chip
                        label={m.label}
                        size="small"
                        variant={mood === m.val ? "filled" : "outlined"}
                        color={mood === m.val ? "primary" : "default"}
                        onClick={() => setMood(m.val)}
                        sx={{
                          fontWeight: 500,
                          height: 28,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Doctor's Note</SectionLabel>
                <TextField
                  multiline
                  rows={3}
                  placeholder="e.g. Patient reported dizziness, recommended rest..."
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                />
              </Box>
              </Grid>

              <Grid item>
              <Button
                variant="contained"
                size="medium"
                disableElevation
                fullWidth
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, py: 1.1 }}
              >
                Submit Check-in
              </Button>
              </Grid>
            </Grid>
          )}

          {/* ──── CARE PLAN ──── */}
          {activeTab === "careplan" && (
            <Grid container direction="column" spacing={3}>
              <Grid item>
              <Box>
                <SectionLabel>Plan Details</SectionLabel>
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { k: "Program", v: patient.program },
                    { k: "Status", v: "Active" },
                    { k: "Enrolled", v: enrolledDate },
                    { k: "Reminders", v: "WhatsApp + SMS" },
                    { k: "Language", v: patient.language },
                    { k: "Wearable", v: patient.platforms[0] ?? "—" },
                  ].map(({ k, v }, i, arr) => (
                    <Grid
                      key={k}
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 1.1,
                        borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Grid item><Typography variant="body2" color="text.secondary">
                        {k}
                      </Typography></Grid>
                      <Grid item><Typography variant="body2" fontWeight={600}>
                        {v}
                      </Typography></Grid>
                    </Grid>
                  ))}
                </Box>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Medications</SectionLabel>
                <Grid container direction="column" spacing={0.75} sx={{ mt: 1 }}>
                  {medications.map((m) => (
                    <Grid item key={m.id}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        <MedicationIcon
                          sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }}
                        />
                        <TextField
                          size="small"
                          value={m.value}
                          onChange={(e) =>
                            setMedications((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, value: e.target.value } : x,
                              ),
                            )
                          }
                          placeholder="e.g. Tab. Aspirin 75mg — Once daily"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "transparent",
                              "& fieldset": { border: "none" },
                            },
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{ color: "error.main", p: 0.5, flexShrink: 0 }}
                          onClick={() =>
                            setMedications((prev) => prev.filter((x) => x.id !== m.id))
                          }
                        >
                          <CloseIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setMedications((prev) => [
                      ...prev,
                      {
                        id: `med-${Date.now()}`,
                        value: "",
                      },
                    ])
                  }
                  sx={{ mt: 1.25, textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                >
                  + Add Medication
                </Button>
              </Box>
              </Grid>

              <Grid item>
              <Box>
                <SectionLabel>Doctor Notes</SectionLabel>
                <TextField
                  multiline
                  rows={4}
                  defaultValue={note}
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                />
              </Box>
              </Grid>

              <Grid item>
              <Button
                variant="contained"
                size="medium"
                disableElevation
                fullWidth
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, py: 1.1 }}
              >
                Save Care Plan
              </Button>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        {patient.status !== "closed" && (
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              flexShrink: 0,
              bgcolor: "background.paper",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhoneIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: "1 1 calc(50% - 4px)",
                minWidth: 0,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                py: 0.75,
                fontSize: "0.8rem",
              }}
            >
              Audio Call
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<VideocamIcon sx={{ fontSize: 18 }} />}
              disableElevation
              sx={{
                flex: "1 1 calc(50% - 4px)",
                minWidth: 0,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                py: 0.75,
                fontSize: "0.8rem",
              }}
            >
              Video Call
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssignmentIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: "1 1 calc(50% - 4px)",
                minWidth: 0,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                py: 0.75,
                fontSize: "0.8rem",
              }}
            >
              Log Check-in
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disableElevation
              startIcon={<LockIcon sx={{ fontSize: 18 }} />}
              onClick={() => patient && onClosePlanClick?.(patient)}
              sx={{
                flex: "1 1 calc(50% - 4px)",
                minWidth: 0,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                py: 0.75,
                fontSize: "0.8rem",
              }}
            >
              Close Plan
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
