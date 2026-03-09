"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import { useTheme } from "@/src/ui/theme";
import { alpha } from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Biotech as BiotechIcon,
  CalendarToday as CalendarTodayIcon,
  Chat as ChatIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  FolderShared as FolderSharedIcon,
  Hotel as HotelIcon,
  HourglassTop as HourglassTopIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
  Notifications as NotificationsIcon,
  PersonSearch as PersonSearchIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useOpdData } from "@/src/store/opdHooks";
import { MOCK_CASES } from "@/src/screens/doctor/PatientCasesPage";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const DOCTOR_UPCOMING_TASKS = [
  {
    id: "t1",
    patient: "Rajesh Kumar",
    mrn: "MRN-2024-001",
    type: "Review Lab Results",
    dueIn: "30 min",
    priority: "high",
  },
  {
    id: "t2",
    patient: "Priya Sharma",
    mrn: "MRN-2024-002",
    type: "Prescription Renewal",
    dueIn: "1 hr",
    priority: "normal",
  },
  {
    id: "t3",
    patient: "Sneha Reddy",
    mrn: "MRN-2024-004",
    type: "Post-op Note",
    dueIn: "2 hrs",
    priority: "normal",
  },
  {
    id: "t4",
    patient: "Vikram Singh",
    mrn: "MRN-2024-005",
    type: "Referral Letter",
    dueIn: "3 hrs",
    priority: "normal",
  },
];

const DOCTOR_ALERTS = [
  {
    id: "a1",
    text: "Lab results ready for Amit Patel (MRN-2024-003)",
    severity: "info" as const,
  },
  {
    id: "a2",
    text: "2 appointments rescheduled by patients today",
    severity: "warning" as const,
  },
  {
    id: "a3",
    text: "Sneha Reddy overdue on 30-day follow-up",
    severity: "error" as const,
  },
  {
    id: "a4",
    text: "Critical BP reading flagged for Rajesh Kumar",
    severity: "error" as const,
  },
];

const IPD_PATIENTS = [
  {
    id: "ip1",
    name: "Rohan Mehta",
    mrn: "MRN-2024-101",
    ward: "General Ward B",
    bed: "B-04",
    diagnosis: "Pneumonia",
    daysSince: 3,
    status: "Stable",
  },
  {
    id: "ip2",
    name: "Ananya Joshi",
    mrn: "MRN-2024-102",
    ward: "ICU",
    bed: "ICU-02",
    diagnosis: "Post-CABG",
    daysSince: 1,
    status: "Critical",
  },
  {
    id: "ip3",
    name: "Suresh Gupta",
    mrn: "MRN-2024-103",
    ward: "Surgical Ward",
    bed: "S-11",
    diagnosis: "Appendectomy",
    daysSince: 2,
    status: "Recovering",
  },
];

const LAB_RESULTS = [
  {
    id: "lr1",
    patient: "Amit Patel",
    mrn: "MRN-2024-003",
    test: "CBC",
    result: "WBC: 12.4 k/µL",
    flag: "High",
    received: "1 hr ago",
  },
  {
    id: "lr2",
    patient: "Priya Sharma",
    mrn: "MRN-2024-002",
    test: "HbA1c",
    result: "7.8%",
    flag: "Normal",
    received: "3 hrs ago",
  },
  {
    id: "lr3",
    patient: "Rohan Mehta",
    mrn: "MRN-2024-101",
    test: "CXR",
    result: "Bilateral infiltrate",
    flag: "Abnormal",
    received: "5 hrs ago",
  },
];

const RECENT_PRESCRIPTIONS = [
  {
    id: "rx1",
    patient: "Rajesh Kumar",
    mrn: "MRN-2024-001",
    drug: "Amoxicillin 500mg",
    sig: "1 tab × 3/day × 7 days",
    issuedAt: "9:00 AM",
    type: "Antibiotic",
  },
  {
    id: "rx2",
    patient: "Priya Sharma",
    mrn: "MRN-2024-002",
    drug: "Metformin 500mg",
    sig: "1 tab × 2/day after meals",
    issuedAt: "9:45 AM",
    type: "Anti-diabetic",
  },
  {
    id: "rx3",
    patient: "Sneha Reddy",
    mrn: "MRN-2024-004",
    drug: "Paracetamol 650mg",
    sig: "SOS – max 4/day",
    issuedAt: "10:30 AM",
    type: "Analgesic",
  },
  {
    id: "rx4",
    patient: "Vikram Singh",
    mrn: "MRN-2024-005",
    drug: "Cetirizine 10mg",
    sig: "1 tab × OD at bedtime",
    issuedAt: "11:15 AM",
    type: "Antihistamine",
  },
];

const RECENT_ORDERS = [
  {
    id: "or1",
    patient: "Rohan Mehta",
    mrn: "MRN-2024-101",
    test: "Sputum Culture",
    priority: "Routine",
    status: "Pending",
    ordered: "8:30 AM",
  },
  {
    id: "or2",
    patient: "Ananya Joshi",
    mrn: "MRN-2024-102",
    test: "Echo & ECG",
    priority: "Urgent",
    status: "In Progress",
    ordered: "7:00 AM",
  },
  {
    id: "or3",
    patient: "Suresh Gupta",
    mrn: "MRN-2024-103",
    test: "Post-op CXR",
    priority: "Routine",
    status: "Completed",
    ordered: "6:00 AM",
  },
];

const DASHBOARD_DATE = "2026-02-04";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const severityColor = (s: "info" | "warning" | "error") =>
  ({ info: "#1170b8", warning: "#c47d00", error: "#c0392e" })[s];

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  info: <MonitorHeartIcon sx={{ fontSize: 16 }} />,
  warning: <WarningIcon sx={{ fontSize: 16 }} />,
  error: <WarningIcon sx={{ fontSize: 16 }} />,
};

const IPD_CHIP: Record<string, "success" | "error" | "warning"> = {
  Stable: "success",
  Critical: "error",
  Recovering: "warning",
};

const FLAG_COLOR: Record<string, "error" | "warning" | "success"> = {
  High: "error",
  Abnormal: "warning",
  Normal: "success",
};

const ORDER_STATUS_COLOR: Record<string, "warning" | "info" | "success"> = {
  Pending: "warning",
  "In Progress": "info",
  Completed: "success",
};

const STATUS_COLOR: Record<string, "success" | "info" | "default"> = {
  Active: "success",
  "Under Review": "info",
  Closed: "default",
};

// ─── Section header helper ─────────────────────────────────────────────────────
type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};
function SectionHeader({ icon, title, action }: SectionHeaderProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      {action}
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DoctorDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const { appointments, encounters } = useOpdData();

  const todaysAppointments = React.useMemo(
    () =>
      appointments
        .filter((a) => a.date === DASHBOARD_DATE)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments],
  );

  const liveQueue = React.useMemo(
    () =>
      encounters.filter(
        (e) =>
          e.status === "ARRIVED" ||
          e.status === "IN_QUEUE" ||
          e.status === "IN_PROGRESS",
      ),
    [encounters],
  );

  const completedToday = React.useMemo(
    () => encounters.filter((e) => e.status === "COMPLETED").length,
    [encounters],
  );
  const urgentEncounters = React.useMemo(
    () => encounters.filter((e) => e.queuePriority === "Urgent").length,
    [encounters],
  );

  const activeCases = MOCK_CASES.filter((c) => c.status === "Active").length;
  const reviewCases = MOCK_CASES.filter(
    (c) => c.status === "Under Review",
  ).length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageTemplate title="Doctor Dashboard" currentPageTitle="Doctor Dashboard">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* ── Welcome Header ──────────────────────────────────────── */}
        <WorkspaceHeaderCard sx={{ p: 2.5, borderRadius: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  fontSize: 20,
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.18),
                  color: "primary.main",
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                Dr
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{greeting}, Doctor 👋</Typography>
                  <Chip icon={<StarIcon sx={{ fontSize: "14px !important" }} />} size="small" label="4.7 Rating" color="warning" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · General Medicine · MBBS, MD
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mt: 0.8, flexWrap: "wrap" }}>
                  <Chip size="small" label={`${liveQueue.length} in queue`} color="info" />
                  <Chip size="small" label={`${completedToday} completed today`} color="success" />
                  {urgentEncounters > 0 && <Chip size="small" label={`${urgentEncounters} urgent`} color="error" />}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarTodayIcon />}
                onClick={() => router.push("/doctors/schedule")}
              >
                My Schedule
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderSharedIcon />}
                onClick={() => router.push("/doctor/patient-cases")}
              >
                Patient Cases
              </Button>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/appointments/queue")}
              >
                OPD Queue
              </Button>
            </Box>
          </Box>
        </WorkspaceHeaderCard>

        {/* ── KPI Strip ───────────────────────────────────────────── */}
        <Grid container spacing={1.5}>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Today's Appointments"
              value={todaysAppointments.length}
              subtitle={`${liveQueue.length} in queue now`}
              tone="info"
              icon={<EventIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Active Patient Cases"
              value={activeCases}
              subtitle={`${reviewCases} under review`}
              tone="success"
              icon={<FolderSharedIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="IPD Patients"
              value={IPD_PATIENTS.length}
              subtitle={`${IPD_PATIENTS.filter((p) => p.status === "Critical").length} critical`}
              tone="error"
              icon={<HotelIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Pending Tasks"
              value={DOCTOR_UPCOMING_TASKS.length}
              subtitle="Notes, prescriptions & reviews"
              tone="warning"
              icon={<HourglassTopIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
        </Grid>

        {/* ── Main Grid ─────────────────────────────────────── */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ─ Today's Schedule  (left) ─ */}
          <Grid item xs={12} md={6} lg={7}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader
                icon={<ScheduleIcon sx={{ fontSize: 20 }} />}
                title="Today's Schedule"
                action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/appointments/calendar")}>Full Calendar</Button>}
              />
              {todaysAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No appointments today.</Typography>
              ) : (
                todaysAppointments.map((appt) => (
                  <Box
                    key={appt.id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      py: 1, px: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, alignItems: "center", minWidth: 0 }}>
                      <Box sx={{ minWidth: 52, textAlign: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, py: 0.5, flexShrink: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>{appt.time}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{appt.patientName}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {appt.mrn} · {(appt as { chiefComplaint?: string }).chiefComplaint ?? (appt as { department?: string }).department}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 0.75, flexWrap: "wrap", flexShrink: 0 }}>
                      <Chip size="small" variant="outlined" label={appt.visitType} />
                      <Chip size="small" label={appt.status} color={appt.status === "Completed" ? "success" : appt.status === "No Show" ? "error" : appt.status === "In Consultation" ? "warning" : "info"} />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
          </Grid>

          {/* ─ Pending Tasks  (right) ─ */}
          <Grid item xs={12} md={6} lg={5}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<HourglassTopIcon sx={{ fontSize: 20, color: "warning.main" }} />} title="Pending Tasks" />
              {DOCTOR_UPCOMING_TASKS.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1.5,
                    alignItems: "center",
                    py: 0.9, px: 1.2, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                    bgcolor: alpha(task.priority === "high" ? theme.palette.error.main : theme.palette.background.default, task.priority === "high" ? 0.04 : 0.5),
                  }}
                >
                  <MedicalServicesIcon sx={{ fontSize: 18, flexShrink: 0, color: task.priority === "high" ? "error.main" : "text.secondary" }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{task.type}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{task.patient} · {task.mrn}</Typography>
                  </Box>
                  <Chip size="small" label={`Due ${task.dueIn}`} color={task.priority === "high" ? "error" : "default"} variant="outlined" sx={{ flexShrink: 0 }} />
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ My IPD Patients  (left) ─ */}
          <Grid item xs={12} md={6} lg={7}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<HotelIcon sx={{ fontSize: 20 }} />} title="My IPD Patients" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/ipd/rounds")}>Clinical Care</Button>} />
              {IPD_PATIENTS.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    py: 1, px: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, alignItems: "center", minWidth: 0 }}>
                    <Avatar sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 700, bgcolor: alpha(theme.palette.secondary.main, 0.15), color: "secondary.main", flexShrink: 0 }}>
                      {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">{p.ward} · Bed {p.bed} · {p.diagnosis}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 0.75, alignItems: "center", flexShrink: 0 }}>
                    <Chip size="small" label={`Day ${p.daysSince}`} variant="outlined" />
                    <Chip size="small" label={p.status} color={IPD_CHIP[p.status] ?? "default"} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Alerts  (right) ─ */}
          <Grid item xs={12} md={6} lg={5}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<NotificationsIcon sx={{ fontSize: 20 }} />} title="Alerts" />
              {DOCTOR_ALERTS.map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1.2,
                    alignItems: "flex-start",
                    py: 0.9, px: 1.2, borderRadius: 1.5,
                    border: "1px solid",
                    borderLeft: `3px solid ${severityColor(alert.severity)}`,
                    borderColor: alpha(severityColor(alert.severity), 0.25),
                    bgcolor: alpha(severityColor(alert.severity), 0.05),
                  }}
                >
                  <Box sx={{ color: severityColor(alert.severity), mt: 0.15, flexShrink: 0 }}>{SEVERITY_ICON[alert.severity]}</Box>
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>{alert.text}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Recent Patient Cases  (left) ─ */}
          <Grid item xs={12} md={6} lg={7}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<FolderSharedIcon sx={{ fontSize: 20 }} />} title="Recent Patient Cases" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/doctor/patient-cases")}>All Cases</Button>} />
              {MOCK_CASES.slice(0, 4).map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    py: 1, px: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, alignItems: "center", minWidth: 0 }}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", flexShrink: 0 }}>
                      {c.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{c.patientName}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">{c.mrn} · {c.caseType} · {c.department}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Opened: {new Date(c.openedAt).toLocaleDateString("en-IN")}</Typography>
                    </Box>
                  </Box>
                  <Chip size="small" label={c.status} color={STATUS_COLOR[c.status]} variant={c.status === "Closed" ? "outlined" : "filled"} sx={{ flexShrink: 0 }} />
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Recent Prescriptions  (right) ─ */}
          <Grid item xs={12} md={6} lg={5}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<LocalPharmacyIcon sx={{ fontSize: 20 }} />} title="Recent Prescriptions" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/ipd/orders-tests/orders")}>All Rx</Button>} />
              {RECENT_PRESCRIPTIONS.map((rx) => (
                <Box
                  key={rx.id}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1.5,
                    alignItems: "flex-start",
                    py: 0.9, px: 1.2, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                  }}
                >
                  <LocalPharmacyIcon sx={{ fontSize: 16, color: "success.main", mt: 0.3, flexShrink: 0 }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{rx.drug}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{rx.patient} · {rx.mrn}</Typography>
                    <Typography variant="caption" color="text.disabled" noWrap display="block">{rx.sig}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <Chip size="small" label={rx.type} variant="outlined" />
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 0.4, alignItems: "center", mt: 0.4 }}>
                      <AccessTimeIcon sx={{ fontSize: 11, color: "text.disabled" }} />
                      <Typography variant="caption" color="text.disabled">{rx.issuedAt}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Pending Lab Results  (left) ─ */}
          <Grid item xs={12} md={6} lg={7}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<BiotechIcon sx={{ fontSize: 20 }} />} title="Pending Lab Results" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/ipd/orders-tests/lab")}>All Results</Button>} />
              {LAB_RESULTS.map((lr) => (
                <Box
                  key={lr.id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    py: 1, px: 1.5, borderRadius: 1.5,
                    border: "1px solid",
                    borderLeft: `3px solid ${theme.palette[FLAG_COLOR[lr.flag] ?? "info"].main}`,
                    borderColor: alpha(theme.palette[FLAG_COLOR[lr.flag] ?? "info"].main, 0.2),
                    bgcolor: alpha(theme.palette[FLAG_COLOR[lr.flag] ?? "info"].main, 0.04),
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{lr.patient}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{lr.mrn} · {lr.test}: {lr.result}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 0.75, alignItems: "center", flexShrink: 0 }}>
                    <Chip size="small" label={lr.flag} color={FLAG_COLOR[lr.flag] ?? "default"} />
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 0.4, alignItems: "center" }}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                      <Typography variant="caption" color="text.secondary">{lr.received}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Recent Orders  (right) ─ */}
          <Grid item xs={12} md={6} lg={5}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SectionHeader icon={<ReceiptIcon sx={{ fontSize: 20 }} />} title="Recent Orders" action={<Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push("/ipd/orders-tests/orders")}>All Orders</Button>} />
              {RECENT_ORDERS.map((order) => (
                <Box
                  key={order.id}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 0.9, px: 1.2, borderRadius: 1.5, border: "1px solid", borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{order.test}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{order.patient} · {order.mrn}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <Chip size="small" label={order.status} color={ORDER_STATUS_COLOR[order.status] ?? "default"} />
                    {order.priority === "Urgent" && <Chip size="small" label="Urgent" color="error" variant="outlined" sx={{ mt: 0.4 }} />}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
          </Grid>

          {/* ─ Quick Links  (full width) ─ */}
          <Grid item xs={12}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Quick Links</Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: "OPD Queue",      icon: <PersonSearchIcon />,    route: "/appointments/queue",       color: "#1170b8" },
                  { label: "My Schedule",    icon: <CalendarTodayIcon />,   route: "/doctors/schedule",         color: "#7c3aed" },
                  { label: "IPD Care",       icon: <MedicalServicesIcon />, route: "/ipd/rounds",               color: "#0891b2" },
                  { label: "Order Mgmt",     icon: <LocalHospitalIcon />,   route: "/ipd/orders-tests/orders",  color: "#c47d00" },
                  { label: "Lab Results",    icon: <BiotechIcon />,         route: "/ipd/orders-tests/lab",     color: "#059669" },
                  { label: "Chat",           icon: <ChatIcon />,            route: "/doctors/chat",             color: "#e11d48" },
                  { label: "Patient Cases",  icon: <FolderSharedIcon />,    route: "/doctor/patient-cases",     color: "#0369a1" },
                  { label: "Clin. Reports",  icon: <CheckCircleIcon />,     route: "/reports/clinical",         color: "#6d28d9" },
                ].map((link) => (
                  <Grid item xs={6} sm={4} md={3} key={link.route}>
                  <Box
                    onClick={() => router.push(link.route)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      py: 1.75,
                      px: 1,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alpha(link.color, 0.18),
                      bgcolor: alpha(link.color, 0.06),
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        bgcolor: alpha(link.color, 0.14),
                        borderColor: alpha(link.color, 0.4),
                        transform: "translateY(-3px)",
                        boxShadow: `0 6px 18px ${alpha(link.color, 0.2)}`,
                      },
                      "&:active": { transform: "translateY(0)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: "50%",
                        bgcolor: alpha(link.color, 0.15),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: link.color,
                        "& .MuiSvgIcon-root": { fontSize: 22 },
                      }}
                    >
                      {link.icon}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", textAlign: "center", lineHeight: 1.2 }}>
                      {link.label}
                    </Typography>
                  </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTemplate>
  );
}
