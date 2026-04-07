"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useUser } from "@/src/core/auth/UserContext";
import { useStaffStore } from "@/src/core/staff/staffStore";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@/src/ui/components/atoms";
import {
  Card,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import { useTheme } from "@/src/ui/theme";
import { alpha } from "@mui/material";
import {
  LocalPharmacy as PharmacyIcon,
  Medication as RxIcon,
  Inventory2 as StockIcon,
  WarningAmber as WarningIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  AttachMoney as RevenueIcon,
  History as HistoryIcon,
  NotificationsActive as AlertIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  LocalFireDepartment as TrendingIcon,
  AccessTime as TimeIcon,
  Assessment as ChartIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  LocalShipping as ShippingIcon,
  Storefront as StorefrontIcon,
  AssignmentReturn as ReturnIcon,
  ReceiptLong as ReceiptIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  PlaylistAddCheck as ListCheckIcon,
  MedicalServices as MedServIcon,
} from "@mui/icons-material";

// ── TYPES ──────────────────────────────────────────────────────────
type RecentPrescription = {
  id: string;
  patient: string;
  mrn: string;
  doctor: string;
  department: string;
  time: string;
  status: "Pending" | "Completed" | "In Progress" | "Partially Dispensed";
  items: number;
  priority: "Normal" | "Urgent" | "STAT";
};

type StockAlert = {
  id: string;
  name: string;
  count: number;
  type: "Low Stock" | "Expiring Soon" | "Out of Stock";
  date?: string;
  threshold?: number;
  category: string;
};

type SupplierOrder = {
  id: string;
  vendor: string;
  status: "In Transit" | "Pending" | "Delivered" | "Delayed";
  date: string;
  items: number;
  value: string;
};

type TopProduct = {
  name: string;
  category: string;
  dispensed: number;
  demand: "High" | "Medium" | "Low";
  trend: string;
  revenue: string;
};

// ── MOCK DATA ───────────────────────────────────────────────────────
const recentRx: RecentPrescription[] = [
  {
    id: "RX-9082",
    patient: "Priya Sharma",
    mrn: "MRN-00145",
    doctor: "Dr. Mehta",
    department: "General Medicine",
    time: "10 min ago",
    status: "Pending",
    items: 3,
    priority: "Urgent",
  },
  {
    id: "RX-9081",
    patient: "John Doe",
    mrn: "MRN-00398",
    doctor: "Dr. Rao",
    department: "Cardiology",
    time: "25 min ago",
    status: "In Progress",
    items: 2,
    priority: "Normal",
  },
  {
    id: "RX-9080",
    patient: "Rahul Verma",
    mrn: "MRN-00217",
    doctor: "Dr. Singh",
    department: "Orthopedics",
    time: "45 min ago",
    status: "Completed",
    items: 5,
    priority: "Normal",
  },
  {
    id: "RX-9079",
    patient: "Anita Patel",
    mrn: "MRN-00521",
    doctor: "Dr. Joshi",
    department: "ENT",
    time: "1 hr ago",
    status: "Completed",
    items: 1,
    priority: "Normal",
  },
  {
    id: "RX-9078",
    patient: "Vikram Singh",
    mrn: "MRN-00672",
    doctor: "Dr. Gupta",
    department: "Dermatology",
    time: "1.5 hr ago",
    status: "Partially Dispensed",
    items: 4,
    priority: "STAT",
  },
  {
    id: "RX-9077",
    patient: "Meera Nair",
    mrn: "MRN-00189",
    doctor: "Dr. Kumar",
    department: "Pediatrics",
    time: "2 hr ago",
    status: "Completed",
    items: 2,
    priority: "Normal",
  },
];

const stockAlerts: StockAlert[] = [
  {
    id: "ITM-001",
    name: "Amoxicillin 500mg",
    count: 12,
    type: "Low Stock",
    threshold: 50,
    category: "Antibiotics",
  },
  {
    id: "ITM-045",
    name: "Paracetamol 650mg",
    count: 150,
    type: "Expiring Soon",
    date: "15 Apr 2026",
    category: "Analgesics",
  },
  {
    id: "ITM-022",
    name: "Metformin 500mg",
    count: 0,
    type: "Out of Stock",
    category: "Anti-Diabetic",
  },
  {
    id: "ITM-089",
    name: "Atorvastatin 20mg",
    count: 200,
    type: "Expiring Soon",
    date: "20 Apr 2026",
    category: "Cardiovascular",
  },
  {
    id: "ITM-034",
    name: "Azithromycin 250mg",
    count: 8,
    type: "Low Stock",
    threshold: 30,
    category: "Antibiotics",
  },
];

const topMovingProducts: TopProduct[] = [
  {
    name: "Paracetamol 650mg",
    category: "Analgesics",
    dispensed: 342,
    demand: "High",
    trend: "+12%",
    revenue: "₹15,200",
  },
  {
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    dispensed: 287,
    demand: "High",
    trend: "+8%",
    revenue: "₹28,700",
  },
  {
    name: "Cetirizine 10mg",
    category: "Anti-Allergic",
    dispensed: 198,
    demand: "Medium",
    trend: "+2%",
    revenue: "₹5,940",
  },
  {
    name: "Pantoprazole 40mg",
    category: "Gastrointestinal",
    dispensed: 176,
    demand: "High",
    trend: "+15%",
    revenue: "₹12,320",
  },
  {
    name: "Vitamin C 500mg",
    category: "Supplements",
    dispensed: 156,
    demand: "Medium",
    trend: "-3%",
    revenue: "₹4,680",
  },
];

const supplierOrders: SupplierOrder[] = [
  {
    id: "PO-456",
    vendor: "Healthline Pharma",
    status: "In Transit",
    date: "24 Mar",
    items: 45,
    value: "₹1,25,000",
  },
  {
    id: "PO-457",
    vendor: "Global Meds Ltd.",
    status: "Pending",
    date: "26 Mar",
    items: 32,
    value: "₹87,500",
  },
  {
    id: "PO-458",
    vendor: "MedSupply India",
    status: "Delivered",
    date: "22 Mar",
    items: 28,
    value: "₹62,000",
  },
  {
    id: "PO-459",
    vendor: "PharmaCare Dist.",
    status: "Delayed",
    date: "20 Mar",
    items: 15,
    value: "₹45,000",
  },
];

const HOURLY_DATA = [
  { hour: "8AM", count: 3 },
  { hour: "9AM", count: 8 },
  { hour: "10AM", count: 14 },
  { hour: "11AM", count: 18 },
  { hour: "12PM", count: 12 },
  { hour: "1PM", count: 6 },
  { hour: "2PM", count: 10 },
  { hour: "3PM", count: 15 },
  { hour: "4PM", count: 11 },
  { hour: "5PM", count: 7 },
];

const INVENTORY_CATS = [
  { category: "Antibiotics", count: 1250, pct: 22, color: "#3B82F6" },
  { category: "Analgesics", count: 980, pct: 17, color: "#10B981" },
  { category: "Cardiovascular", count: 850, pct: 15, color: "#F59E0B" },
  { category: "Anti-Diabetic", count: 720, pct: 13, color: "#EF4444" },
  { category: "Supplements", count: 680, pct: 12, color: "#8B5CF6" },
  { category: "Others", count: 1220, pct: 21, color: "#64748B" },
];

const REVENUE_SPLIT = [
  { label: "OPD Dispensing", value: "₹12.4L", pct: 67, color: "#1170b8" },
  { label: "IPD Dispensing", value: "₹4.8L", pct: 26, color: "#7c3aed" },
  { label: "Counter Sales", value: "₹1.4L", pct: 7, color: "#059669" },
];

const QUICK_LINKS = [
  {
    label: "New Dispense",
    icon: <AddIcon />,
    route: "/pharmacy/dispense",
    color: "#1170b8",
  },
  {
    label: "Rx Queue",
    icon: <ReceiptIcon />,
    route: "/pharmacy/prescription-queue",
    color: "#c47d00",
  },
  {
    label: "Inventory",
    icon: <StockIcon />,
    route: "/pharmacy/stock",
    color: "#059669",
  },
  {
    label: "Returns",
    icon: <ReturnIcon />,
    route: "/pharmacy/returns",
    color: "#e11d48",
  },
  {
    label: "Master Catalog",
    icon: <PharmacyIcon />,
    route: "/inventory/items",
    color: "#7c3aed",
  },
  {
    label: "Reports",
    icon: <ChartIcon />,
    route: "/pharmacy",
    color: "#475569",
  },
];

// ── HELPERS ─────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── STATUS CONFIG ────────────────────────────────────────────────────
const STATUS_CFG: Record<
  string,
  { color: string; chipColor: "warning" | "info" | "success" | "secondary" }
> = {
  Pending: { color: "#C2410C", chipColor: "warning" },
  "In Progress": { color: "#1D4ED8", chipColor: "info" },
  Completed: { color: "#166534", chipColor: "success" },
  "Partially Dispensed": { color: "#6D28D9", chipColor: "secondary" },
};

const ORDER_CFG: Record<
  string,
  { chipColor: "info" | "warning" | "success" | "error" }
> = {
  "In Transit": { chipColor: "info" },
  Pending: { chipColor: "warning" },
  Delivered: { chipColor: "success" },
  Delayed: { chipColor: "error" },
};

const ALERT_CFG: Record<
  string,
  { color: string; severity: "warning" | "error" }
> = {
  "Low Stock": { color: "#c47d00", severity: "warning" },
  "Expiring Soon": { color: "#e11d48", severity: "error" },
  "Out of Stock": { color: "#c0392e", severity: "error" },
};

const severityColor = (s: "warning" | "error") =>
  ({ warning: "#c47d00", error: "#c0392e" })[s];

// ── SECTION HEADER ──────────────────────────────────────────────────
function SH({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
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

// ── MAIN PAGE ───────────────────────────────────────────────────────
export default function PharmacyDashboardPage() {
  const router = useRouter();
  const { role } = useUser();
  const { users } = useStaffStore();
  const theme = useTheme();

  const currentUser = React.useMemo(
    () => users.find((u: { roleId: string }) => u.roleId === role),
    [users, role],
  );
  const displayName = currentUser?.name || "Pharmacist";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const maxHourly = Math.max(...HOURLY_DATA.map((d) => d.count));
  const totalRevenue = REVENUE_SPLIT.reduce((s, r) => s + r.pct, 0);

  return (
    <PageTemplate
      title="Pharmacy Dashboard"
      subtitle="Overview of prescriptions, inventory alerts, and operations."
      currentPageTitle="Pharmacy Dashboard"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {/* ══════════════════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════════════════ */}
        <WorkspaceHeaderCard sx={{ p: 2.5, borderRadius: '22px' }}>
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
                <PharmacyIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {greeting}, {displayName}
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
                  {" · "}Pharmacy Operations
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 1, mt: 0.8, flexWrap: "wrap" }}
                >
                  <Chip
                    size="small"
                    label="12 pending prescriptions"
                    color="warning"
                  />
                  <Chip
                    size="small"
                    label="3 critical stock alerts"
                    color="error"
                  />
                  <Chip
                    size="small"
                    label="₹1.2L revenue today"
                    color="success"
                  />
                  <Chip size="small" label="48 dispensed today" color="info" />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReceiptIcon />}
                onClick={() => router.push("/pharmacy/prescription-queue")}
              >
                Rx Queue
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<StockIcon />}
                onClick={() => router.push("/pharmacy/stock")}
              >
                Inventory
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/pharmacy/dispense")}
              >
                New Dispense
              </Button>
            </Box>
          </Box>
        </WorkspaceHeaderCard>

        {/* ══════════════════════════════════════════════════════════════════
            KPI STRIP
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={1.5}>
          {[
            {
              label: "Pending Prescriptions",
              value: 12,
              subtitle: "Current queue · 3 urgent",
              tone: "warning" as const,
              icon: <PendingIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Dispensed Today",
              value: 48,
              subtitle: "+15% vs yesterday · Avg 8 min/Rx",
              tone: "success" as const,
              icon: <CompletedIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Today Revenue",
              value: "₹1.2L",
              subtitle: "Avg ₹2,500 per Rx",
              tone: "info" as const,
              icon: <RevenueIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Low Stock Items",
              value: 8,
              subtitle: "Below reorder threshold",
              tone: "error" as const,
              icon: <WarningIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Expiring Soon",
              value: 14,
              subtitle: "Within next 30 days",
              tone: "warning" as const,
              icon: <TimeIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Inventory Value",
              value: "₹8.4L",
              subtitle: "5,700 items across 6 categories",
              tone: "info" as const,
              icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
            },
          ].map((kpi) => (
            <Grid key={kpi.label} item xs={6} sm={4} md={4}>
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
            QUICK NAVIGATION
        ══════════════════════════════════════════════════════════════════ */}
        <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}
          >
            <Box sx={{ color: "primary.main", display: "flex" }}>
              <SpeedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Quick Navigation
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {QUICK_LINKS.map((link) => (
              <Grid key={link.route} item xs={6} sm={4} md={2}>
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
            ROW: Prescription Queue + Alerts
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ── Prescription Queue ── */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              
              <SH
                icon={<RxIcon sx={{ fontSize: 20 }} />}
                title="Prescription Queue"
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/pharmacy/prescription-queue")}
                  >
                    Full Queue
                  </Button>
                }
              />
               <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                {[
                  { label: "Pending", count: "12", color: "warning.main" },
                  { label: "In Progress", count: "5", color: "info.main" },
                  { label: "Completed", count: "48", color: "success.main" },
                  { label: "Avg Wait", count: "8m", color: "secondary.main" },
                ].map((s) => (
                  <Stack key={s.label} alignItems="center" spacing={0.2}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}
                    >
                      {s.count}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {s.label}
                    </Typography>
                  </Stack>
                ))}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8,mt:2 }}>
                {recentRx.map((rx, idx) => (
                  <Box
                    key={rx.id}
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
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                        }}
                      >
                        {initials(rx.patient)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {rx.patient}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {rx.id} · {rx.doctor} · {rx.department} · {rx.items}{" "}
                          items
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.6,
                        flexShrink: 0,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {rx.time}
                      </Typography>
                      {rx.priority !== "Normal" && (
                        <Chip
                          size="small"
                          label={rx.priority}
                          color="error"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                        />
                      )}
                      <Chip
                        size="small"
                        label={rx.status}
                        color={STATUS_CFG[rx.status]?.chipColor || "default"}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Queue Summary */}
             
            </Card>
          </Grid>

          {/* ── Critical Alerts ── */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<NotificationsIcon sx={{ fontSize: 20 }} />}
                title="Critical Alerts"
                action={
                  <Chip
                    size="small"
                    label={`${stockAlerts.length} alerts`}
                    color="error"
                  />
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {stockAlerts.map((alert) => {
                  const cfg = ALERT_CFG[alert.type] || ALERT_CFG["Low Stock"];
                  const sColor = severityColor(cfg.severity);
                  return (
                    <Box
                      key={alert.id}
                      sx={{
                        display: "flex",
                        gap: 1.2,
                        alignItems: "flex-start",
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: alpha(sColor, 0.2),
                        bgcolor: alpha(sColor, 0.04),
                        "&:hover": {
                          bgcolor: alpha(sColor, 0.08),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: alpha(sColor, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: sColor,
                        }}
                      >
                        <WarningIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {alert.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={alert.type}
                            color={cfg.severity}
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {alert.type === "Out of Stock"
                            ? `${alert.category} · Immediate reorder required`
                            : alert.type === "Low Stock"
                              ? `${alert.category} · ${alert.count} units left (threshold: ${alert.threshold})`
                              : `${alert.category} · Expires ${alert.date} · ${alert.count} units`}
                        </Typography>
                        {alert.type !== "Out of Stock" && (
                          <LinearProgress
                            variant="determinate"
                            value={
                              alert.type === "Low Stock"
                                ? Math.min(
                                    (alert.count / (alert.threshold || 50)) *
                                      100,
                                    100,
                                  )
                                : 80
                            }
                            color={cfg.severity}
                            sx={{ mt: 0.6, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Hourly Dispensing + Inventory Health + Revenue
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ── Hourly Dispensing Chart ── */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<ChartIcon sx={{ fontSize: 20 }} />}
                title="Hourly Dispensing"
                action={
                  <Chip
                    size="small"
                    label="Live"
                    color="success"
                    variant="outlined"
                  />
                }
              />
              <Stack
                direction="row"
                spacing={0.4}
                alignItems="flex-end"
                sx={{ height: 120, mt: 1 }}
              >
                {HOURLY_DATA.map((d, i) => {
                  const h = Math.max((d.count / maxHourly) * 95, 6);
                  const isPeak = d.count === maxHourly;
                  return (
                    <Tooltip key={i} title={`${d.hour}: ${d.count} dispensed`}>
                      <Stack alignItems="center" spacing={0.3} sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: isPeak ? "primary.main" : "text.secondary",
                          }}
                        >
                          {d.count}
                        </Typography>
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: 28,
                            height: h,
                            borderRadius: "6px 6px 2px 2px",
                            bgcolor: isPeak
                              ? "primary.main"
                              : alpha(theme.palette.primary.main, 0.18),
                            transition: "all 0.3s ease",
                            "&:hover": {
                              bgcolor: isPeak
                                ? "primary.dark"
                                : alpha(theme.palette.primary.main, 0.35),
                              transform: "scaleY(1.08)",
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 8,
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {d.hour}
                        </Typography>
                      </Stack>
                    </Tooltip>
                  );
                })}
              </Stack>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Peak Hour
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    11:00 AM (18 Rx)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Avg / Hour
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    10.4 Rx
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* ── Inventory Health ── */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<StockIcon sx={{ fontSize: 20 }} />}
                title="Inventory Health"
                action={
                  <Chip
                    size="small"
                    label="5700 items"
                    color="info"
                    variant="outlined"
                  />
                }
              />
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                {/* SVG Donut */}
                <Box
                  sx={{
                    position: "relative",
                    width: 110,
                    height: 110,
                    flexShrink: 0,
                  }}
                >
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    {(() => {
                      let acc = 0;
                      return INVENTORY_CATS.map((item, i) => {
                        const circ = 2 * Math.PI * 42;
                        const dash = `${(item.pct / 100) * circ} ${circ}`;
                        const rot = (acc / 100) * 360 - 90;
                        acc += item.pct;
                        return (
                          <circle
                            key={i}
                            cx="55"
                            cy="55"
                            r="42"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="12"
                            strokeDasharray={dash}
                            transform={`rotate(${rot} 55 55)`}
                            style={{ transition: "all 0.6s ease" }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 800, lineHeight: 1 }}
                    >
                      87%
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 8,
                        color: "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      Healthy
                    </Typography>
                  </Box>
                </Box>

                {/* Legend */}
                <Stack spacing={0.6} sx={{ flex: 1 }}>
                  {INVENTORY_CATS.map((item, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="center"
                      spacing={0.8}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ flex: 1 }}
                        color="text.secondary"
                      >
                        {item.category}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {item.pct}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Needs Reorder
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    8 Items
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Value at Risk
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "warning.main" }}
                  >
                    ₹45,000
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* ── Revenue Summary ── */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<RevenueIcon sx={{ fontSize: 20 }} />}
                title="Revenue Summary"
                action={
                  <Chip
                    size="small"
                    icon={<TrendUpIcon sx={{ fontSize: 14 }} />}
                    label="+12.5%"
                    color="success"
                    variant="outlined"
                  />
                }
              />
              <Box sx={{ textAlign: "center", py: 1.5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}
                >
                  ₹18.6L
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  March 2026 Revenue
                </Typography>
              </Box>

              <Stack spacing={1.2} sx={{ mt: 1 }}>
                {REVENUE_SPLIT.map((r) => (
                  <Box key={r.label}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.4,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {r.label}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {r.value} ({r.pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={r.pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(r.color, 0.12),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          bgcolor: r.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Today
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    ₹1.2L
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    This Week
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ₹6.8L
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            ROW: Top Moving Products + Supplier Orders
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={2} alignItems="stretch">
          {/* ── Top Moving Products ── */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<TrendingIcon sx={{ fontSize: 20 }} />}
                title="Top Moving Products"
                action={
                  <Chip
                    size="small"
                    label="Live Demand"
                    color="warning"
                    variant="outlined"
                  />
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                {/* Table Header */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 1fr",
                    gap: 1,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  {["Product", "Category", "Qty", "Trend", "Revenue"].map(
                    (h) => (
                      <Typography
                        key={h}
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: 10,
                          letterSpacing: 0.5,
                        }}
                        color="text.secondary"
                      >
                        {h}
                      </Typography>
                    ),
                  )}
                </Box>

                {topMovingProducts.map((item, idx) => {
                  const isUp = item.trend.startsWith("+");
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 1fr",
                        gap: 1,
                        px: 1.2,
                        py: 0.8,
                        alignItems: "center",
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor:
                              item.demand === "High"
                                ? "error.main"
                                : item.demand === "Medium"
                                  ? "warning.main"
                                  : "success.main",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.category}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.dispensed}
                      </Typography>
                      <Chip
                        size="small"
                        icon={
                          isUp ? (
                            <TrendUpIcon sx={{ fontSize: 12 }} />
                          ) : (
                            <TrendDownIcon sx={{ fontSize: 12 }} />
                          )
                        }
                        label={item.trend}
                        color={isUp ? "success" : "error"}
                        variant="outlined"
                        sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {item.revenue}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          {/* ── Supplier / Purchase Orders ── */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <SH
                icon={<ShippingIcon sx={{ fontSize: 20 }} />}
                title="Purchase Orders"
                action={
                  <Button size="small" endIcon={<ArrowForwardIcon />}>
                    All Orders
                  </Button>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {supplierOrders.map((order) => {
                  const cfg = ORDER_CFG[order.status] || ORDER_CFG.Pending;
                  return (
                    <Box
                      key={order.id}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700, letterSpacing: 0.3 }}
                        >
                          {order.id}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mt: 0.1 }}
                          noWrap
                        >
                          {order.vendor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.items} items · {order.value}
                        </Typography>
                      </Box>
                      <Stack
                        alignItems={{ xs: "flex-start", sm: "flex-end" }}
                        spacing={0.3}
                      >
                        <Chip
                          size="small"
                          label={order.status}
                          color={cfg.chipColor}
                          sx={{ height: 22, fontWeight: 700 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ETA: {order.date}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>

      </Box>
    </PageTemplate>
  );
}
