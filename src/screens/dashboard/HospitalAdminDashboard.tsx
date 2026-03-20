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
  LinearProgress,
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
  AccountBalance as AccountBalanceIcon,
  ArrowForward as ArrowForwardIcon,
  AssignmentLate as AssignmentLateIcon,
  Biotech as BiotechIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  DashboardCustomize as DashboardCustomizeIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Hotel as HotelIcon,
  HowToReg as HowToRegIcon,
  Inventory2 as Inventory2Icon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MedicalInformation as MedicalInformationIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PointOfSale as PointOfSaleIcon,
  Queue as QueueIcon,
  Receipt as ReceiptIcon,
  ReceiptLong as ReceiptLongIcon,
  Science as ScienceIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Vaccines as VaccinesIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { useOpdData } from "@/src/store/opdHooks";
import {
  ADMISSION_LEADS,
  DISCHARGE_CANDIDATES,
  INITIAL_BED_BOARD,
  INPATIENT_STAYS,
} from "@/src/screens/ipd/ipd-mock-data";
import { patientData, patientMetrics } from "@/src/mocks/patientServer";
import { doctorData, doctorMetrics } from "@/src/mocks/doctorServer";

// ─── Constants ────────────────────────────────────────────────────────────────
const DASHBOARD_DATE = "2026-02-04";

// ─── Mock Financial / Operational Data ───────────────────────────────────────
const REVENUE_BREAKDOWN = [
  { label: "OPD Consultations", amount: 842000, color: "#1170b8" },
  { label: "IPD Services", amount: 2340000, color: "#7c3aed" },
  { label: "Laboratory", amount: 410000, color: "#059669" },
  { label: "Radiology", amount: 320000, color: "#c47d00" },
  { label: "Pharmacy", amount: 680000, color: "#e11d48" },
  { label: "Surgery", amount: 1100000, color: "#0891b2" },
];

const HOSPITAL_ALERTS = [
  {
    id: "ha1",
    text: "ICU occupancy at 87% — 2 beds remaining",
    severity: "error" as const,
  },
  {
    id: "ha2",
    text: "3 urgent admissions waiting for bed assignment",
    severity: "warning" as const,
  },
  {
    id: "ha3",
    text: "Lab instrument maintenance due tomorrow (COBAS 6000)",
    severity: "warning" as const,
  },
  {
    id: "ha4",
    text: "4 pending insurance pre-auths expiring today",
    severity: "error" as const,
  },
  {
    id: "ha5",
    text: "Pharmacy reorder alert: Paracetamol stock < 500 units",
    severity: "warning" as const,
  },
  {
    id: "ha6",
    text: "12 discharge-ready patients — 2 billing cleared",
    severity: "info" as const,
  },
];

const RECENT_ACTIVITIES = [
  {
    id: "ra1",
    text: "New IPD admission — Dev Malhotra (MRN-246110)",
    time: "8 min ago",
    icon: "ipd",
  },
  {
    id: "ra2",
    text: "Lab result flagged — CBC High for Amit Patel",
    time: "15 min ago",
    icon: "lab",
  },
  {
    id: "ra3",
    text: "Patient registered — Tanvi Kapoor (MRN-246113)",
    time: "22 min ago",
    icon: "reg",
  },
  {
    id: "ra4",
    text: "Surgery completed — Ira Banerjee, Dr. Kulkarni",
    time: "1 hr ago",
    icon: "surg",
  },
  {
    id: "ra5",
    text: "Insurance approved — Star Health for Suresh Gupta",
    time: "1 hr ago",
    icon: "ins",
  },
  {
    id: "ra6",
    text: "Discharge cleared — Sneha Patil (Surgical Ward)",
    time: "2 hrs ago",
    icon: "dis",
  },
];

const DEPT_STATS = [
  { dept: "Cardiology", opd: 22, ipd: 8, color: "#e11d48" },
  { dept: "General Medicine", opd: 35, ipd: 12, color: "#1170b8" },
  { dept: "Orthopedics", opd: 18, ipd: 5, color: "#059669" },
  { dept: "Gynecology", opd: 14, ipd: 9, color: "#9333ea" },
  { dept: "Pediatrics", opd: 20, ipd: 4, color: "#c47d00" },
  { dept: "Neurology", opd: 11, ipd: 6, color: "#0891b2" },
];

const QUICK_LINKS = [
  {
    label: "Register Patient",
    icon: <PersonAddIcon />,
    route: "/patients/registration",
    color: "#1170b8",
  },
  {
    label: "OPD Calendar",
    icon: <CalendarMonthIcon />,
    route: "/appointments/calendar",
    color: "#7c3aed",
  },
  {
    label: "OPD Queue",
    icon: <QueueIcon />,
    route: "/appointments/queue",
    color: "#059669",
  },
  {
    label: "IPD Admissions",
    icon: <HowToRegIcon />,
    route: "/ipd/admissions",
    color: "#c47d00",
  },
  {
    label: "Bed & Census",
    icon: <HotelIcon />,
    route: "/ipd/beds",
    color: "#0369a1",
  },
  {
    label: "Discharge",
    icon: <MedicalServicesIcon />,
    route: "/ipd/discharge",
    color: "#e11d48",
  },
  {
    label: "Lab Dashboard",
    icon: <ScienceIcon />,
    route: "/lab/dashboard",
    color: "#0f766e",
  },
  {
    label: "Billing",
    icon: <ReceiptLongIcon />,
    route: "/billing/invoices",
    color: "#6d28d9",
  },
  {
    label: "OPD Billing",
    icon: <PointOfSaleIcon />,
    route: "/billing/opd",
    color: "#d97706",
  },
  {
    label: "Insurance",
    icon: <ShieldIcon />,
    route: "/billing/insurance",
    color: "#0284c7",
  },
  {
    label: "Pharmacy",
    icon: <LocalPharmacyIcon />,
    route: "/clinical/modules/willow",
    color: "#16a34a",
  },
  {
    label: "Emergency",
    icon: <VaccinesIcon />,
    route: "/clinical/modules/asap",
    color: "#dc2626",
  },
  {
    label: "Doctor List",
    icon: <MedicalInformationIcon />,
    route: "/doctors/list",
    color: "#7c2d12",
  },
  {
    label: "Patient List",
    icon: <PeopleIcon />,
    route: "/patients/list",
    color: "#475569",
  },
  {
    label: "Inventory",
    icon: <Inventory2Icon />,
    route: "/inventory/items",
    color: "#92400e",
  },
  {
    label: "Reports",
    icon: <AccountBalanceIcon />,
    route: "/reports/analytics",
    color: "#1e293b",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(1)}Cr`
    : n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${n.toLocaleString()}`;

const severityColor = (s: "info" | "warning" | "error") =>
  ({ info: "#1170b8", warning: "#c47d00", error: "#c0392e" })[s];

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  info: <MonitorHeartIcon sx={{ fontSize: 15 }} />,
  warning: <WarningAmberIcon sx={{ fontSize: 15 }} />,
  error: <WarningAmberIcon sx={{ fontSize: 15 }} />,
};

const ACTIVITY_ICON: Record<string, { icon: React.ReactNode; color: string }> =
  {
    ipd: { icon: <HotelIcon sx={{ fontSize: 16 }} />, color: "#7c3aed" },
    lab: { icon: <ScienceIcon sx={{ fontSize: 16 }} />, color: "#059669" },
    reg: { icon: <PersonAddIcon sx={{ fontSize: 16 }} />, color: "#1170b8" },
    surg: {
      icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
      color: "#e11d48",
    },
    ins: { icon: <ShieldIcon sx={{ fontSize: 16 }} />, color: "#0891b2" },
    dis: { icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, color: "#16a34a" },
  };

// ─── Sub-components ───────────────────────────────────────────────────────────
type SHProps = {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};
function SH({ icon, title, action }: SHProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        mb: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HospitalAdminDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { appointments, encounters } = useOpdData();

  // ── Derived KPIs ────────────────────────────────────────────────────────────
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

  const availableBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((b) => b.status === "Available").length,
    [],
  );
  const occupiedBeds = React.useMemo(
    () => INITIAL_BED_BOARD.filter((b) => b.status === "Occupied").length,
    [],
  );
  const blockedBeds = React.useMemo(
    () =>
      INITIAL_BED_BOARD.filter(
        (b) => b.status === "Blocked" || b.status === "Cleaning",
      ).length,
    [],
  );
  const totalBeds = INITIAL_BED_BOARD.length;
  const bedOccupancy =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const urgentAdmissions = React.useMemo(
    () => ADMISSION_LEADS.filter((l) => l.priority !== "Routine").length,
    [],
  );

  const dischargeReady = React.useMemo(() => {
    const clearSet = new Set(
      DISCHARGE_CANDIDATES.filter(
        (d) => d.billingStatus === "Cleared" && d.pharmacyStatus === "Ready",
      ).map((d) => d.patientId),
    );
    return INPATIENT_STAYS.filter((s) => clearSet.has(s.id));
  }, []);

  const totalOutstanding = React.useMemo(
    () => patientData.reduce((s, p) => s + p.outstandingBalance, 0),
    [],
  );

  const billingHoldCount = React.useMemo(
    () => patientData.filter((p) => p.status === "Billing Hold").length,
    [],
  );

  const activeDoctors = doctorMetrics.activeToday;
  const onLeaveDoctors = doctorMetrics.onLeave;
  const totalRevenue = REVENUE_BREAKDOWN.reduce((s, r) => s + r.amount, 0);
  const maxRevenue = Math.max(...REVENUE_BREAKDOWN.map((r) => r.amount));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Ward Map for Bed Board ───────────────────────────────────────────────────
  const wardMap = React.useMemo(() => {
    const m = new Map<
      string,
      { total: number; occupied: number; available: number; blocked: number }
    >();
    INITIAL_BED_BOARD.forEach((bed) => {
      const e = m.get(bed.ward) ?? {
        total: 0,
        occupied: 0,
        available: 0,
        blocked: 0,
      };
      e.total++;
      if (bed.status === "Occupied") e.occupied++;
      if (bed.status === "Available") e.available++;
      if (bed.status === "Blocked" || bed.status === "Cleaning") e.blocked++;
      m.set(bed.ward, e);
    });
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  return (
    <PageTemplate
      title="Hospital Dashboard"
      currentPageTitle="Hospital Dashboard"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* ══════════════════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════════════════ */}
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  color: "primary.main",
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <DashboardCustomizeIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {greeting}, Hospital Admin
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
                  })}
                  {" · "}Scanbo Matrix HIMS — Hospital Operations
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
                    label={`${liveQueue.length} in live queue`}
                    color="success"
                  />
                  <Chip
                    size="small"
                    label={`${urgentAdmissions} urgent admissions`}
                    color="error"
                  />
                  <Chip
                    size="small"
                    label={`Bed occupancy ${bedOccupancy}%`}
                    color="warning"
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                startIcon={<HowToRegIcon />}
                onClick={() => router.push("/ipd/admissions")}
              >
                IPD Admissions
              </Button>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/reports/analytics")}
              >
                Reports
              </Button>
            </Box>
          </Box>
        </WorkspaceHeaderCard>

        {/* ══════════════════════════════════════════════════════════════════
            KPI STRIP — Row 1
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={1.5}>
          {[
            {
              label: "Total Patients",
              value: patientMetrics.total,
              subtitle: `${patientMetrics.admitted} admitted · ${patientMetrics.todayRegistrations} new today`,
              tone: "info" as const,
              icon: <PeopleIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Active Doctors",
              value: activeDoctors,
              subtitle: `${onLeaveDoctors} on leave · ${doctorMetrics.consultants} consultants`,
              tone: "success" as const,
              icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Bed Occupancy",
              value: `${bedOccupancy}%`,
              subtitle: `${occupiedBeds} occupied · ${availableBeds} available · ${blockedBeds} blocked`,
              tone:
                bedOccupancy >= 85 ? ("error" as const) : ("warning" as const),
              icon: <HotelIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Today OPD Queue",
              value: liveQueue.length,
              subtitle: `${completedToday} completed · ${todaysAppointments.length} scheduled`,
              tone: "success" as const,
              icon: <QueueIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Pending Bills",
              value: patientMetrics.pendingBills,
              subtitle: `${billingHoldCount} on billing hold`,
              tone: "error" as const,
              icon: <AssignmentLateIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Urgent Admissions",
              value: urgentAdmissions,
              subtitle: `${ADMISSION_LEADS.length} total pending admissions`,
              tone: "error" as const,
              icon: <LocalHospitalIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Discharge Ready",
              value: dischargeReady.length,
              subtitle: "Billing & pharmacy cleared",
              tone: "success" as const,
              icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Outstanding Dues",
              value: `₹${(totalOutstanding / 100000).toFixed(1)}L`,
              subtitle: "Across all patient accounts",
              tone: "warning" as const,
              icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
            },
          ].map((kpi) => (
            <Grid key={kpi.label} item xs={6} sm={4} md={3}>
              <StatTile
                label={kpi.label}
                value={kpi.value}
                subtitle={kpi.subtitle}
                tone={kpi.tone}
                icon={kpi.icon}
              />
            </Grid>
          ))}
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            QUICK LINKS GRID
        ══════════════════════════════════════════════════════════════════ */}
        <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}
          >
            <Box sx={{ color: "primary.main", display: "flex" }}>
              <ReceiptIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Quick Navigation
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {QUICK_LINKS.map((link) => (
              <Grid key={link.route} item xs={6} sm={4} md={3} lg={2}>
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
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: alpha(link.color, 0.15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: link.color,
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {link.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Today's Appointments + Alerts
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* Today's Appointments */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<EventIcon sx={{ fontSize: 20 }} />}
                title="Today's OPD Schedule"
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
                  No appointments today.
                </Typography>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}
                >
                  {todaysAppointments.map((appt) => (
                    <Box
                      key={appt.id}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        py: 0.9,
                        px: 1.4,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                        <Box
                          sx={{
                            minWidth: 50,
                            textAlign: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 1,
                            py: 0.4,
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
                      <Box sx={{ display: "flex", gap: 0.6, flexShrink: 0 }}>
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
                  ))}
                </Box>
              )}
            </Card>
          </Grid>

          {/* Alerts */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<NotificationsIcon sx={{ fontSize: 20 }} />}
                title="Hospital Alerts"
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {HOSPITAL_ALERTS.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      display: "flex",
                      gap: 1.2,
                      alignItems: "flex-start",
                      py: 0.8,
                      px: 1.2,
                      borderRadius: 1.5,
                      borderLeft: `3px solid ${severityColor(alert.severity)}`,
                      border: "1px solid",
                      borderColor: alpha(severityColor(alert.severity), 0.2),
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
                    <Typography variant="body2">{alert.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Bed Board + Department Load
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* Bed Board */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<HotelIcon sx={{ fontSize: 20 }} />}
                title="IPD Bed Board"
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/ipd/beds")}
                  >
                    View All
                  </Button>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Summary Bar */}
                <Box
                  sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}
                >
                  <Chip
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: "error.main",
                      fontWeight: 700,
                    }}
                    label={`${occupiedBeds} Occupied`}
                  />
                  <Chip
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.main",
                      fontWeight: 700,
                    }}
                    label={`${availableBeds} Available`}
                  />
                  <Chip
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: "warning.main",
                      fontWeight: 700,
                    }}
                    label={`${blockedBeds} Blocked`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${totalBeds} Total`}
                  />
                </Box>
                {wardMap.map(([ward, stats]) => {
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
                        py: 0.9,
                        px: 1.4,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ward}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Chip
                            size="small"
                            sx={{
                              bgcolor: alpha(barColor, 0.12),
                              color: barColor,
                              fontWeight: 700,
                              fontSize: "0.66rem",
                              height: 18,
                            }}
                            label={`${pct}%`}
                          />
                          <Chip
                            size="small"
                            color="success"
                            sx={{
                              height: 18,
                              fontSize: "0.66rem",
                              fontWeight: 600,
                            }}
                            label={`${stats.available} free`}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          height: 5,
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
                            transition: "width 0.4s",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.3, display: "block" }}
                      >
                        {stats.occupied}/{stats.total} beds
                        {stats.blocked > 0 ? ` · ${stats.blocked} blocked` : ""}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          {/* Department Load */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<GroupsIcon sx={{ fontSize: 20 }} />}
                title="Department Patient Load"
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {DEPT_STATS.map((dept) => {
                  const total = dept.opd + dept.ipd;
                  const maxTotal = Math.max(
                    ...DEPT_STATS.map((d) => d.opd + d.ipd),
                  );
                  const pct = Math.round((total / maxTotal) * 100);
                  return (
                    <Box
                      key={dept.dept}
                      sx={{
                        py: 0.9,
                        px: 1.4,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: dept.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {dept.dept}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Chip
                            size="small"
                            sx={{
                              bgcolor: alpha("#1170b8", 0.1),
                              color: "#1170b8",
                              fontSize: "0.65rem",
                              height: 18,
                              fontWeight: 700,
                            }}
                            label={`OPD ${dept.opd}`}
                          />
                          <Chip
                            size="small"
                            sx={{
                              bgcolor: alpha("#7c3aed", 0.1),
                              color: "#7c3aed",
                              fontSize: "0.65rem",
                              height: 18,
                              fontWeight: 700,
                            }}
                            label={`IPD ${dept.ipd}`}
                          />
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: alpha(dept.color, 0.15),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: dept.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Revenue Breakdown + Recent Activity + Discharge Ready
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* Revenue Breakdown */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<AccountBalanceIcon sx={{ fontSize: 20 }} />}
                title="Revenue Breakdown"
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/billing/dashboard")}
                  >
                    Billing
                  </Button>
                }
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}
              >
                {fmt(totalRevenue)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5 }}
              >
                Total revenue this period
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {REVENUE_BREAKDOWN.map((rev) => {
                  const pct = Math.round((rev.amount / maxRevenue) * 100);
                  return (
                    <Box key={rev.label}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: rev.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {rev.label}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: rev.color }}
                        >
                          {fmt(rev.amount)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: alpha(rev.color, 0.15),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: rev.color,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Outstanding Balance
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    ₹{(totalOutstanding / 100000).toFixed(1)}L
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.4,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Billing Hold Patients
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "warning.main" }}
                  >
                    {billingHoldCount}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<SpeedIcon sx={{ fontSize: 20 }} />}
                title="Recent Activity"
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {RECENT_ACTIVITIES.map((act) => {
                  const ai = ACTIVITY_ICON[act.icon];
                  return (
                    <Box
                      key={act.id}
                      sx={{
                        display: "flex",
                        gap: 1.2,
                        alignItems: "flex-start",
                        py: 0.8,
                        px: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: alpha(ai.color, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: ai.color,
                          flexShrink: 0,
                          mt: 0.1,
                        }}
                      >
                        {ai.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, lineHeight: 1.3 }}
                        >
                          {act.text}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {act.time}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          {/* Pending Admissions + Discharge Ready */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ height: "100%" }}>
              {/* Pending Admissions */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <SH
                  icon={<LocalHospitalIcon sx={{ fontSize: 20 }} />}
                  title="Pending Admissions"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/ipd/admissions")}
                    >
                      View All
                    </Button>
                  }
                />
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}
                >
                  {ADMISSION_LEADS.map((lead) => (
                    <Box
                      key={lead.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 0.8,
                        px: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderLeft: `3px solid ${lead.priority === "Emergency" ? theme.palette.error.main : lead.priority === "Urgent" ? theme.palette.warning.main : theme.palette.info.main}`,
                        borderColor: alpha(
                          lead.priority === "Emergency"
                            ? theme.palette.error.main
                            : lead.priority === "Urgent"
                              ? theme.palette.warning.main
                              : theme.palette.info.main,
                          0.2,
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
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {lead.patientName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {lead.provisionalDiagnosis}
                        </Typography>
                      </Box>
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
                          ml: 1,
                          flexShrink: 0,
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Card>

              {/* Discharge Ready */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, flexGrow: 1 }}>
                <SH
                  icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
                  title="Discharge Ready"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/ipd/discharge")}
                    >
                      Manage
                    </Button>
                  }
                />
                {dischargeReady.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No discharge-ready patients.
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}
                  >
                    {dischargeReady.map((d) => (
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
                          icon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                          label="Ready"
                          color="success"
                          sx={{ flexShrink: 0, ml: 1 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Doctor Overview + IPD Inpatients
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* Doctor Overview */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<MedicalServicesIcon sx={{ fontSize: 20 }} />}
                title="Medical Staff Overview"
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/doctors/list")}
                  >
                    All Doctors
                  </Button>
                }
              />
              {/* KPI strip */}
              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                {[
                  {
                    label: "Total Doctors",
                    value: doctorMetrics.total,
                    color: "#1170b8",
                  },
                  { label: "On Duty", value: activeDoctors, color: "#059669" },
                  {
                    label: "On Leave",
                    value: onLeaveDoctors,
                    color: "#c47d00",
                  },
                  {
                    label: "Telemedicine",
                    value: doctorMetrics.telemedicine,
                    color: "#7c3aed",
                  },
                ].map((k) => (
                  <Grid key={k.label} item xs={6}>
                    <Box
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(k.color, 0.05),
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: k.color, lineHeight: 1 }}
                      >
                        {k.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {k.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {/* Department breakdown */}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  display: "block",
                  mb: 1,
                }}
              >
                TOP ACTIVE DOCTORS TODAY
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {doctorData
                  .filter((d) => d.status === "Active")
                  .slice(0, 5)
                  .map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        display: "flex",
                        gap: 1.2,
                        alignItems: "center",
                        py: 0.7,
                        px: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        {doc.name
                          .split(" ")
                          .slice(1)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {doc.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {doc.primarySpecialization} · {doc.designation}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "primary.main" }}
                        >
                          {doc.todayAppointments}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          display="block"
                        >
                          appts
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Card>
          </Grid>

          {/* IPD Current Inpatients */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<HotelIcon sx={{ fontSize: 20 }} />}
                title="Current Inpatients"
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/ipd/admissions")}
                  >
                    IPD List
                  </Button>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {INPATIENT_STAYS.map((stay) => (
                  <Box
                    key={stay.id}
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
                          fontSize: 12,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.secondary.main, 0.14),
                          color: "secondary.main",
                          flexShrink: 0,
                        }}
                      >
                        {stay.patientName
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
                          {stay.patientName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {stay.mrn} · {stay.ward} · Bed {stay.bed}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          display="block"
                          noWrap
                        >
                          {stay.diagnosis} · {stay.consultant}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.6, flexShrink: 0 }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Adm. ${new Date(stay.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTemplate>
  );
}
