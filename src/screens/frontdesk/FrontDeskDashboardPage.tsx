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
  Stack,
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
  AssignmentLate as AssignmentLateIcon,
  Bed as BedIcon,
  CalendarMonth as CalendarMonthIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Desk as DeskIcon,
  ExitToApp as ExitToAppIcon,
  Group as GroupIcon,
  Hotel as HotelIcon,
  HowToReg as HowToRegIcon,
  LocalHospital as LocalHospitalIcon,
  MeetingRoom as MeetingRoomIcon,
  MonitorHeart as MonitorHeartIcon,
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  PersonSearch as PersonSearchIcon,
  PointOfSale as PointOfSaleIcon,
  Queue as QueueIcon,
  Receipt as ReceiptIcon,
  RequestPage as RequestPageIcon,
  Shield as ShieldIcon,
  Smartphone as SmartphoneIcon,
  VerifiedUser as VerifiedUserIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { useOpdData } from "@/src/store/opdHooks";
import {
  ADMISSION_LEADS,
  DISCHARGE_CANDIDATES,
  INITIAL_BED_BOARD,
  INPATIENT_STAYS,
} from "@/src/screens/ipd/ipd-mock-data";
import { patientData } from "@/src/mocks/patientServer";

// ─── Mock data ────────────────────────────────────────────────────────────────

const DASHBOARD_DATE = "2026-02-04";

const INSURANCE_TASKS = [
  {
    id: "ins1",
    patient: "Rajesh Kumar",
    mrn: "MRN-2024-001",
    tpa: "Star Health",
    policy: "SH-2024-779201",
    status: "Pending",
    dueIn: "45 min",
  },
  {
    id: "ins2",
    patient: "Priya Sharma",
    mrn: "MRN-2024-002",
    tpa: "ICICI Lombard",
    policy: "IL-2024-334512",
    status: "Awaiting Docs",
    dueIn: "1 hr",
  },
  {
    id: "ins3",
    patient: "Suresh Gupta",
    mrn: "MRN-2024-103",
    tpa: "Bajaj Allianz",
    policy: "BA-2024-990871",
    status: "Approved",
    dueIn: null,
  },
  {
    id: "ins4",
    patient: "Ananya Joshi",
    mrn: "MRN-2024-102",
    tpa: "New India",
    policy: "NI-2024-445600",
    status: "Rejected",
    dueIn: null,
  },
];

const FD_ALERTS = [
  {
    id: "fa1",
    text: "3 patients checked-in but not yet triaged",
    severity: "warning" as const,
  },
  {
    id: "fa2",
    text: "Insurance docs missing for Suresh Gupta (MRN-2024-103)",
    severity: "error" as const,
  },
  {
    id: "fa3",
    text: "Rohan Mehta (ICU-02) is discharge-ready — billing cleared",
    severity: "info" as const,
  },
  {
    id: "fa4",
    text: "2 appointments rescheduled by patients today",
    severity: "warning" as const,
  },
];

const QUICK_LINKS = [
  {
    label: "Register Patient",
    icon: <PersonAddIcon />,
    route: "/patients/registration",
    color: "#1170b8",
    badge: null,
  },
  {
    label: "Patient List",
    icon: <PersonSearchIcon />,
    route: "/patients/list",
    color: "#7c3aed",
    badge: null,
  },
  {
    label: "OPD Calendar",
    icon: <CalendarMonthIcon />,
    route: "/appointments/calendar",
    color: "#0891b2",
    badge: "Appointments",
  },
  {
    label: "OPD Queue",
    icon: <QueueIcon />,
    route: "/appointments/queue",
    color: "#059669",
    badge: "Live",
  },
  {
    label: "IPD Admissions",
    icon: <HowToRegIcon />,
    route: "/ipd/admissions",
    color: "#c47d00",
    badge: null,
  },
  {
    label: "Bed & Census",
    icon: <BedIcon />,
    route: "/ipd/beds",
    color: "#0369a1",
    badge: null,
  },
  {
    label: "Discharge",
    icon: <ExitToAppIcon />,
    route: "/ipd/discharge",
    color: "#e11d48",
    badge: null,
  },
  {
    label: "Billing",
    icon: <ReceiptIcon />,
    route: "/billing/invoices",
    color: "#6d28d9",
    badge: null,
  },
  {
    label: "Insurance",
    icon: <ShieldIcon />,
    route: "/billing/insurance",
    color: "#0f766e",
    badge: null,
  },
  {
    label: "Welcome Kiosk",
    icon: <SmartphoneIcon />,
    route: "/clinical/modules/welcome-kiosk",
    color: "#b45309",
    badge: null,
  },
  {
    label: "ADT / Registration",
    icon: <MeetingRoomIcon />,
    route: "/clinical/modules/prelude-grand-central",
    color: "#475569",
    badge: null,
  },
  {
    label: "OPD Billing",
    icon: <PointOfSaleIcon />,
    route: "/billing/opd",
    color: "#9333ea",
    badge: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityColor = (s: "info" | "warning" | "error") =>
  ({ info: "#1170b8", warning: "#c47d00", error: "#c0392e" })[s];

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  info: <MonitorHeartIcon sx={{ fontSize: 16 }} />,
  warning: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  error: <WarningAmberIcon sx={{ fontSize: 16 }} />,
};

const INS_STATUS_COLOR: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  Approved: "success",
  Pending: "warning",
  "Awaiting Docs": "info",
  Rejected: "error",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};
function SectionHeader({ icon, title, action }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box
          sx={{ color: "primary.main", display: "flex", alignItems: "center" }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function FrontDeskDashboardPage() {
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

  const checkedInCount = React.useMemo(
    () =>
      encounters.filter(
        (e) =>
          e.status === "ARRIVED" ||
          e.status === "IN_QUEUE" ||
          e.status === "IN_PROGRESS",
      ).length,
    [encounters],
  );

  const pendingCheckIn = React.useMemo(
    () =>
      todaysAppointments.filter((a) =>
        ["Scheduled", "Confirmed", "Rescheduled"].includes((a as any).status),
      ).length,
    [todaysAppointments],
  );

  const availableBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((b) => b.status === "Available").length,
    [],
  );
  const occupiedBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((b) => b.status === "Occupied").length,
    [],
  );

  const pendingInsurance = React.useMemo(
    () =>
      INSURANCE_TASKS.filter(
        (t) => t.status === "Pending" || t.status === "Awaiting Docs",
      ).length,
    [],
  );

  const dischargeReady = React.useMemo(() => {
    const clearedIds = new Set(
      DISCHARGE_CANDIDATES.filter(
        (d) => d.billingStatus === "Cleared" && d.pharmacyStatus === "Ready",
      ).map((d) => d.patientId),
    );
    return INPATIENT_STAYS.filter((s) => clearedIds.has(s.id));
  }, []);

  const urgentAdmissions = React.useMemo(
    () => ADMISSION_LEADS.filter((l) => l.priority !== "Routine").length,
    [],
  );

  const billingHoldCount = React.useMemo(
    () => patientData.filter((p) => p.status === "Billing Hold").length,
    [],
  );

  const activeQueue = React.useMemo(() => {
    return encounters
      .filter((e) => ["ARRIVED", "IN_QUEUE", "IN_PROGRESS"].includes(e.status))
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
      .slice(0, 6);
  }, [encounters]);

  const recentRegistrations = React.useMemo(() => {
    return [...patientData]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageTemplate title="Front Desk Dashboard" currentPageTitle="Front Desk">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* ── Welcome Header ────────────────────────────────────── */}
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  fontSize: 22,
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: "primary.main",
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <DeskIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {greeting}, Front Desk
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.3 }}
                >
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · Reception &amp; Patient Access
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 1, mt: 0.8, flexWrap: "wrap" }}
                >
                  <Chip
                    size="small"
                    label={`${todaysAppointments.length} appointments today`}
                    color="info"
                  />
                  <Chip
                    size="small"
                    label={`${checkedInCount} checked-in`}
                    color="success"
                  />
                  {pendingInsurance > 0 && (
                    <Chip
                      size="small"
                      label={`${pendingInsurance} insurance pending`}
                      color="warning"
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => router.push("/patients/registration")}
              >
                Register Patient
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarTodayIcon />}
                onClick={() => router.push("/appointments/calendar")}
              >
                OPD Calendar
              </Button>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/appointments/queue")}
              >
                Live Queue
              </Button>
            </Box>
          </Box>
        </WorkspaceHeaderCard>

        {/* ── KPI Tiles ─────────────────────────────────────────── */}
        <Grid container spacing={1.5}>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Today's Appointments"
              value={todaysAppointments.length}
              subtitle={`${pendingCheckIn} still pending check-in`}
              tone="info"
              icon={<CalendarMonthIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="OPD Queue (Live)"
              value={checkedInCount}
              subtitle="In waiting / consultation"
              tone="success"
              icon={<GroupIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Beds Available"
              value={availableBeds}
              subtitle={`${occupiedBeds} occupied of ${INITIAL_BED_BOARD.length} total`}
              tone="warning"
              icon={<HotelIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              label="Insurance Pending"
              value={pendingInsurance}
              subtitle={`${INSURANCE_TASKS.length} total verifications`}
              tone="error"
              icon={<AssignmentLateIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
        </Grid>

        {/* ── Main Dashboard Content ─────────────────────────── */}
        <Grid container spacing={2.5}>
          {/* Recent Registrations (Left) */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SectionHeader
                  icon={<HowToRegIcon sx={{ fontSize: 20 }} />}
                  title="Recent Registrations"
                  action={
                    <Button
                      size="small"
                      onClick={() => router.push("/patients/list")}
                    >
                      View List
                    </Button>
                  }
                />
                <Stack spacing={1}>
                  {recentRegistrations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No recent registrations.
                    </Typography>
                  ) : (
                    recentRegistrations.map((patient) => (
                      <Box
                        key={patient.id}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: alpha(theme.palette.background.default, 0.4),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.mrn} · {patient.gender} · {patient.age}y
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={new Date(patient.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short" },
                          )}
                          variant="outlined"
                          sx={{ fontSize: "0.65rem", height: 20 }}
                        />
                      </Box>
                    ))
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* OPD Queue (Middle/Right) */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SectionHeader
                  icon={<QueueIcon sx={{ fontSize: 20 }} />}
                  title="OPD Queue (Live)"
                  action={
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => router.push("/appointments/queue")}
                    >
                      Full Queue
                    </Button>
                  }
                />
                <Grid container spacing={1.5}>
                  {activeQueue.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No patients currently in live queue.
                      </Typography>
                    </Grid>
                  ) : (
                    activeQueue.map((item) => (
                      <Grid item xs={12} sm={6} key={item.id}>
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.15s ease",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              transform: "translateY(-2px)",
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                            },
                          }}
                        >
                          {item.queuePriority === "Urgent" && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: 3,
                                height: "100%",
                                bgcolor: "error.main",
                              }}
                            />
                          )}
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: 13,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              }}
                            >
                              {item.patientName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                                noWrap
                              >
                                {item.patientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                display="block"
                              >
                                {item.mrn} · {item.doctor}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={item.status}
                              sx={{ height: 20, fontSize: "0.65rem" }}
                            />
                          </Stack>
                        </Box>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ── Main Grid: Appointments + Queue ───────────────────── */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ─ Today's Appointments (left) ─ */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SectionHeader
                  icon={<CalendarTodayIcon sx={{ fontSize: 20 }} />}
                  title="Today's Appointment Schedule"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/appointments/calendar")}
                    >
                      Full Calendar
                    </Button>
                  }
                />
                {todaysAppointments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No appointments scheduled today.
                  </Typography>
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
                        py: 1,
                        px: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "background 0.15s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 1.5,
                          alignItems: "center",
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 52,
                            textAlign: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 1,
                            py: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: "primary.main" }}
                          >
                            {appt.time}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {appt.patientName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            display="block"
                          >
                            {appt.mrn} · {appt.provider} ·{" "}
                            {(appt as { department?: string }).department}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 0.75,
                          flexWrap: "wrap",
                          flexShrink: 0,
                        }}
                      >
                        <Chip
                          size="small"
                          variant="outlined"
                          label={appt.visitType}
                        />
                        <Chip
                          size="small"
                          label={appt.status}
                          color={
                            appt.status === "Completed"
                              ? "success"
                              : appt.status === "No Show"
                                ? "error"
                                : appt.status === "In Consultation"
                                  ? "warning"
                                  : "info"
                          }
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          </Grid>

          {/* ─ Alerts / Notifications (right) ─ */}
          <Grid item xs={12} md={5}>
            <Stack spacing={2} sx={{ height: "100%" }}>
              {/* Alerts */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <SectionHeader
                    icon={<NotificationsIcon sx={{ fontSize: 20 }} />}
                    title="Operational Alerts"
                  />
                  {FD_ALERTS.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1.2,
                        alignItems: "flex-start",
                        py: 0.9,
                        px: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderLeft: `3px solid ${severityColor(alert.severity)}`,
                        borderColor: alpha(severityColor(alert.severity), 0.25),
                        bgcolor: alpha(severityColor(alert.severity), 0.05),
                      }}
                    >
                      <Box
                        sx={{
                          color: severityColor(alert.severity),
                          mt: 0.15,
                          flexShrink: 0,
                        }}
                      >
                        {SEVERITY_ICON[alert.severity]}
                      </Box>
                      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                        {alert.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>

              {/* Discharge-Ready */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  <SectionHeader
                    icon={<ExitToAppIcon sx={{ fontSize: 20 }} />}
                    title="Discharge-Ready Patients"
                    action={
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => router.push("/ipd/discharge")}
                      >
                        View All
                      </Button>
                    }
                  />
                  {dischargeReady.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No discharge-ready patients.
                    </Typography>
                  ) : (
                    dischargeReady.slice(0, 3).map((d) => (
                      <Box
                        key={d.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.8,
                          px: 1.2,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: alpha(theme.palette.success.main, 0.04),
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {d.patientName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            noWrap
                          >
                            {d.mrn} · {d.ward}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                          label="Ready"
                          color="success"
                          sx={{ flexShrink: 0, ml: 1 }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* ── Bed Board + Insurance Tasks ───────────────────────── */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ─ Bed Availability ─ */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SectionHeader
                  icon={<HotelIcon sx={{ fontSize: 20 }} />}
                  title="Bed Availability Snapshot"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/ipd/beds")}
                    >
                      Full Bed Board
                    </Button>
                  }
                />
                {/* Ward summary */}
                {(() => {
                  const wardMap = new Map<
                    string,
                    {
                      total: number;
                      occupied: number;
                      available: number;
                      blocked: number;
                    }
                  >();
                  INITIAL_BED_BOARD.forEach((bed) => {
                    const existing = wardMap.get(bed.ward) ?? {
                      total: 0,
                      occupied: 0,
                      available: 0,
                      blocked: 0,
                    };
                    existing.total += 1;
                    if (bed.status === "Occupied") existing.occupied += 1;
                    if (bed.status === "Available") existing.available += 1;
                    if (bed.status === "Blocked" || bed.status === "Cleaning")
                      existing.blocked += 1;
                    wardMap.set(bed.ward, existing);
                  });
                  return Array.from(wardMap.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([ward, stats]) => {
                      const pct =
                        stats.total > 0
                          ? Math.round((stats.occupied / stats.total) * 100)
                          : 0;
                      const barColor =
                        pct >= 90
                          ? theme.palette.error.main
                          : pct >= 70
                            ? theme.palette.warning.main
                            : theme.palette.success.main;
                      return (
                        <Box
                          key={ward}
                          sx={{
                            py: 1,
                            px: 1.5,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: alpha(
                              theme.palette.background.default,
                              0.5,
                            ),
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.6,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {ward}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.6,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                size="small"
                                sx={{
                                  bgcolor: alpha(barColor, 0.12),
                                  color: barColor,
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  height: 20,
                                }}
                                label={`${pct}% occupied`}
                              />
                              <Chip
                                size="small"
                                color="success"
                                label={`${stats.available} free`}
                                sx={{
                                  fontWeight: 600,
                                  height: 20,
                                  fontSize: "0.68rem",
                                }}
                              />
                            </Box>
                          </Box>
                          {/* progress bar */}
                          <Box
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(barColor, 0.15),
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${pct}%`,
                                bgcolor: barColor,
                                borderRadius: 3,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.4, display: "block" }}
                          >
                            {stats.occupied}/{stats.total} occupied
                            {stats.blocked > 0
                              ? ` · ${stats.blocked} blocked`
                              : ""}
                          </Typography>
                        </Box>
                      );
                    });
                })()}
              </Box>
            </Card>
          </Grid>

          {/* ─ Insurance Verification Tasks ─ */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SectionHeader
                  icon={<ShieldIcon sx={{ fontSize: 20 }} />}
                  title="Insurance Verification Tasks"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/billing/insurance")}
                    >
                      All Claims
                    </Button>
                  }
                />
                {INSURANCE_TASKS.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      py: 1,
                      px: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        {task.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {task.patient}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {task.mrn} · {task.tpa} · {task.policy}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.4,
                        flexShrink: 0,
                      }}
                    >
                      <Chip
                        size="small"
                        label={task.status}
                        color={INS_STATUS_COLOR[task.status] ?? "default"}
                        icon={
                          task.status === "Approved" ? (
                            <VerifiedUserIcon sx={{ fontSize: 14 }} />
                          ) : undefined
                        }
                      />
                      {task.dueIn && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.4,
                            alignItems: "center",
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 12, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.disabled">
                            Due in {task.dueIn}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ── Admission Leads ───────────────────────────────────── */}
        <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <SectionHeader
              icon={<LocalHospitalIcon sx={{ fontSize: 20 }} />}
              title="Pending Admissions"
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/ipd/admissions")}
                >
                  IPD Admissions
                </Button>
              }
            />
            <Grid container spacing={1}>
              {ADMISSION_LEADS.slice(0, 6).map((lead) => (
                <Grid item xs={12} sm={6} md={4} key={lead.id}>
                  <Box
                    sx={{
                      py: 1,
                      px: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderLeft: `3px solid ${
                        lead.priority === "Emergency"
                          ? theme.palette.error.main
                          : lead.priority === "Urgent"
                            ? theme.palette.warning.main
                            : theme.palette.info.main
                      }`,
                      borderColor: alpha(
                        lead.priority === "Emergency"
                          ? theme.palette.error.main
                          : lead.priority === "Urgent"
                            ? theme.palette.warning.main
                            : theme.palette.info.main,
                        0.25,
                      ),
                      bgcolor: alpha(
                        lead.priority === "Emergency"
                          ? theme.palette.error.main
                          : lead.priority === "Urgent"
                            ? theme.palette.warning.main
                            : theme.palette.info.main,
                        0.04,
                      ),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {lead.patientName}
                      </Typography>
                      <Chip
                        size="small"
                        label={lead.priority}
                        color={
                          lead.priority === "Emergency"
                            ? "error"
                            : lead.priority === "Urgent"
                              ? "warning"
                              : "info"
                        }
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      noWrap
                    >
                      {lead.mrn} · {lead.provisionalDiagnosis} ·{" "}
                      {lead.consultant}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      display="block"
                    >
                      Status: {(lead as any).status}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                pt: 0.5,
                flexWrap: "wrap",
              }}
            >
              <Chip
                size="small"
                color="error"
                label={`${ADMISSION_LEADS.filter((l) => l.priority === "Emergency").length} Emergency`}
              />
              <Chip
                size="small"
                color="warning"
                label={`${ADMISSION_LEADS.filter((l) => l.priority === "Urgent").length} Urgent`}
              />
              <Chip
                size="small"
                color="info"
                label={`${ADMISSION_LEADS.filter((l) => l.priority === "Routine").length} Routine`}
              />
              <Chip
                size="small"
                color="default"
                variant="outlined"
                label={`${billingHoldCount} on Billing Hold`}
              />
            </Box>
          </Box>
        </Card>
      </Box>
    </PageTemplate>
  );
}
