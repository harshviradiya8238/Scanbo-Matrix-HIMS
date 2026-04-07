"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import ModuleHeaderCard from "@/src/screens/clinical/components/ModuleHeaderCard";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import {
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterList as FilterListIcon,
  HourglassEmpty as HourglassEmptyIcon,
  LocalAtm as LocalAtmIcon,
  MoneyOff as MoneyOffIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Send as SendIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Undo as UndoIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimStatus = "Submitted" | "Pending" | "Approved" | "Denied" | "Partial";
type DenialStatus = "Open" | "In Appeal" | "Resolved" | "Written Off";
type CollectionStatus = "Due" | "Overdue" | "Collected" | "Sent to Agency";
type RefundStatus = "Requested" | "Approved" | "Processed" | "Rejected";
type ChargeStatus = "Draft" | "Coded" | "Posted" | "Billed";

interface ChargeEntry {
  id: string;
  patientName: string;
  mrn: string;
  service: string;
  cpt: string;
  icd10: string;
  amount: number;
  status: ChargeStatus;
  date: string;
  department: string;
}

interface ClaimEntry {
  id: string;
  claimNo: string;
  patientName: string;
  mrn: string;
  payer: string;
  amount: number;
  status: ClaimStatus;
  submitted: string;
  due: string;
}

interface DenialEntry {
  id: string;
  claimNo: string;
  patientName: string;
  mrn: string;
  payer: string;
  reason: string;
  amount: number;
  status: DenialStatus;
  receivedOn: string;
}

interface CollectionEntry {
  id: string;
  patientName: string;
  mrn: string;
  invoiceNo: string;
  amount: number;
  paid: number;
  due: number;
  status: CollectionStatus;
  dueDate: string;
}

interface RefundEntry {
  id: string;
  patientName: string;
  mrn: string;
  reason: string;
  amount: number;
  requestedOn: string;
  status: RefundStatus;
  approvedBy?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CHARGES: ChargeEntry[] = [
  {
    id: "ch-1",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
    service: "OPD Consultation",
    cpt: "99213",
    icd10: "J06.9",
    amount: 1200,
    status: "Posted",
    date: "13 Mar 2026",
    department: "General Medicine",
  },
  {
    id: "ch-2",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
    service: "Appendectomy (Laparoscopic)",
    cpt: "44950",
    icd10: "K37",
    amount: 58000,
    status: "Billed",
    date: "12 Mar 2026",
    department: "Surgery",
  },
  {
    id: "ch-3",
    patientName: "Ravi Iyer",
    mrn: "MRN-245802",
    service: "ICU Day Care",
    cpt: "99292",
    icd10: "I50.9",
    amount: 12500,
    status: "Coded",
    date: "12 Mar 2026",
    department: "ICU",
  },
  {
    id: "ch-4",
    patientName: "Sneha Patil",
    mrn: "MRN-245820",
    service: "MRI Brain w/o Contrast",
    cpt: "70553",
    icd10: "G43.9",
    amount: 7800,
    status: "Draft",
    date: "13 Mar 2026",
    department: "Radiology",
  },
  {
    id: "ch-5",
    patientName: "Karan Mehta",
    mrn: "MRN-245833",
    service: "Echocardiogram",
    cpt: "93306",
    icd10: "I25.10",
    amount: 4500,
    status: "Posted",
    date: "11 Mar 2026",
    department: "Cardiology",
  },
  {
    id: "ch-6",
    patientName: "Priya Sharma",
    mrn: "MRN-245840",
    service: "CBC + LFT Panel",
    cpt: "85025",
    icd10: "Z00.00",
    amount: 1850,
    status: "Billed",
    date: "10 Mar 2026",
    department: "Lab",
  },
];

const CLAIMS: ClaimEntry[] = [
  {
    id: "cl-1",
    claimNo: "CLM-202600341",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
    payer: "Zenith Health",
    amount: 58000,
    status: "Submitted",
    submitted: "12 Mar 2026",
    due: "27 Mar 2026",
  },
  {
    id: "cl-2",
    claimNo: "CLM-202600339",
    patientName: "Ravi Iyer",
    mrn: "MRN-245802",
    payer: "HealthSecure",
    amount: 75000,
    status: "Approved",
    submitted: "08 Mar 2026",
    due: "23 Mar 2026",
  },
  {
    id: "cl-3",
    claimNo: "CLM-202600330",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
    payer: "NovaCare",
    amount: 18500,
    status: "Pending",
    submitted: "01 Mar 2026",
    due: "16 Mar 2026",
  },
  {
    id: "cl-4",
    claimNo: "CLM-202600315",
    patientName: "Neha Sinha",
    mrn: "MRN-245993",
    payer: "Star Health",
    amount: 32000,
    status: "Denied",
    submitted: "22 Feb 2026",
    due: "09 Mar 2026",
  },
  {
    id: "cl-5",
    claimNo: "CLM-202600310",
    patientName: "Karan Mehta",
    mrn: "MRN-245833",
    payer: "HDFC Ergo",
    amount: 12800,
    status: "Partial",
    submitted: "18 Feb 2026",
    due: "05 Mar 2026",
  },
];

const DENIALS: DenialEntry[] = [
  {
    id: "dn-1",
    claimNo: "CLM-202600315",
    patientName: "Neha Sinha",
    mrn: "MRN-245993",
    payer: "Star Health",
    reason: "Pre-authorization not obtained",
    amount: 32000,
    status: "Open",
    receivedOn: "10 Mar 2026",
  },
  {
    id: "dn-2",
    claimNo: "CLM-202600290",
    patientName: "Priya Sharma",
    mrn: "MRN-245840",
    payer: "Religare",
    reason: "Duplicate claim submission",
    amount: 8500,
    status: "In Appeal",
    receivedOn: "05 Mar 2026",
  },
  {
    id: "dn-3",
    claimNo: "CLM-202600278",
    patientName: "Arvind Kumar",
    mrn: "MRN-245875",
    payer: "Bajaj Allianz",
    reason: "Incorrect ICD-10 code (J45.9 vs J45.21)",
    amount: 14200,
    status: "In Appeal",
    receivedOn: "01 Mar 2026",
  },
  {
    id: "dn-4",
    claimNo: "CLM-202600255",
    patientName: "Sunita Rao",
    mrn: "MRN-245860",
    payer: "NovaCare",
    reason: "Patient not eligible on DOS",
    amount: 5300,
    status: "Resolved",
    receivedOn: "20 Feb 2026",
  },
  {
    id: "dn-5",
    claimNo: "CLM-202600240",
    patientName: "Rohit Verma",
    mrn: "MRN-245855",
    payer: "Oriental",
    reason: "Documentation incomplete",
    amount: 9800,
    status: "Written Off",
    receivedOn: "10 Feb 2026",
  },
];

const COLLECTIONS: CollectionEntry[] = [
  {
    id: "co-1",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
    invoiceNo: "INV-20260313-001",
    amount: 18500,
    paid: 5000,
    due: 13500,
    status: "Due",
    dueDate: "20 Mar 2026",
  },
  {
    id: "co-2",
    patientName: "Karan Mehta",
    mrn: "MRN-245833",
    invoiceNo: "INV-20260312-004",
    amount: 12800,
    paid: 6000,
    due: 6800,
    status: "Overdue",
    dueDate: "05 Mar 2026",
  },
  {
    id: "co-3",
    patientName: "Ravi Iyer",
    mrn: "MRN-245802",
    invoiceNo: "INV-20260308-007",
    amount: 75000,
    paid: 75000,
    due: 0,
    status: "Collected",
    dueDate: "23 Mar 2026",
  },
  {
    id: "co-4",
    patientName: "Priya Sharma",
    mrn: "MRN-245840",
    invoiceNo: "INV-20260222-012",
    amount: 8500,
    paid: 0,
    due: 8500,
    status: "Sent to Agency",
    dueDate: "01 Feb 2026",
  },
  {
    id: "co-5",
    patientName: "Sneha Patil",
    mrn: "MRN-245820",
    invoiceNo: "INV-20260310-009",
    amount: 22000,
    paid: 10000,
    due: 12000,
    status: "Due",
    dueDate: "25 Mar 2026",
  },
];

const REFUNDS: RefundEntry[] = [
  {
    id: "rf-1",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
    reason: "Insurance overpayment received",
    amount: 4200,
    requestedOn: "11 Mar 2026",
    status: "Approved",
    approvedBy: "Sunanda (Finance)",
  },
  {
    id: "rf-2",
    patientName: "Sunita Rao",
    mrn: "MRN-245860",
    reason: "Procedure cancelled post deposit",
    amount: 8000,
    requestedOn: "09 Mar 2026",
    status: "Processed",
    approvedBy: "Ankit (Finance)",
  },
  {
    id: "rf-3",
    patientName: "Rohit Verma",
    mrn: "MRN-245855",
    reason: "Duplicate payment by patient",
    amount: 1500,
    requestedOn: "12 Mar 2026",
    status: "Requested",
  },
  {
    id: "rf-4",
    patientName: "Arvind Kumar",
    mrn: "MRN-245875",
    reason: "Denial reversal – payer paid",
    amount: 14200,
    requestedOn: "06 Mar 2026",
    status: "Rejected",
  },
];

// ─── Color helpers ────────────────────────────────────────────────────────────

const chargeStatusColor: Record<
  ChargeStatus,
  "default" | "info" | "warning" | "success"
> = {
  Draft: "default",
  Coded: "info",
  Posted: "warning",
  Billed: "success",
};

const claimStatusColor: Record<
  ClaimStatus,
  "info" | "warning" | "success" | "error" | "default"
> = {
  Submitted: "info",
  Pending: "warning",
  Approved: "success",
  Denied: "error",
  Partial: "default",
};

const denialStatusColor: Record<
  DenialStatus,
  "error" | "warning" | "success" | "default"
> = {
  Open: "error",
  "In Appeal": "warning",
  Resolved: "success",
  "Written Off": "default",
};

const collectionStatusColor: Record<
  CollectionStatus,
  "warning" | "error" | "success" | "default"
> = {
  Due: "warning",
  Overdue: "error",
  Collected: "success",
  "Sent to Agency": "default",
};

const refundStatusColor: Record<
  RefundStatus,
  "info" | "success" | "default" | "error"
> = {
  Requested: "info",
  Approved: "success",
  Processed: "default",
  Rejected: "error",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ─── Sub-tabs ────────────────────────────────────────────────────────────────

const TABS: CommonTabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "charges", label: "Charge Capture" },
  { id: "claims", label: "Claims" },
  { id: "denials", label: "Denials" },
  { id: "collections", label: "Collections" },
  { id: "refunds", label: "Refunds" },
];

// ─── KPI cards meta ──────────────────────────────────────────────────────────
const KPI_ITEMS = [
  {
    label: "Revenue This Month",
    value: "₹48.2L",
    subtitle: "↑ 12% vs last month",
    icon: <TrendingUpIcon fontSize="small" />,
    color: "success.main",
  },
  {
    label: "Pending Claims",
    value: "₹12.6L",
    subtitle: "18 claims outstanding",
    icon: <HourglassEmptyIcon fontSize="small" />,
    color: "warning.main",
  },
  {
    label: "Denial Rate",
    value: "8.3%",
    subtitle: "↓ 2.1% from last month",
    icon: <TrendingDownIcon fontSize="small" />,
    color: "error.main",
  },
  {
    label: "Collections Due",
    value: "₹5.4L",
    subtitle: "3 accounts overdue",
    icon: <LocalAtmIcon fontSize="small" />,
    color: "info.main",
  },
  {
    label: "Refunds Pending",
    value: "₹1.5L",
    subtitle: "3 requests open",
    icon: <UndoIcon fontSize="small" />,
    color: "secondary.main",
  },
  {
    label: "Net Collection Rate",
    value: "94.2%",
    subtitle: "Target: 95%",
    icon: <AttachMoneyIcon fontSize="small" />,
    color: "primary.main",
  },
];

const PAYER_MIX = [
  { payer: "Zenith Health", claims: 52, recovered: "₹18.4L", denialRate: "6%" },
  { payer: "HealthSecure", claims: 44, recovered: "₹14.2L", denialRate: "9%" },
  { payer: "Star Health", claims: 38, recovered: "₹11.6L", denialRate: "11%" },
  { payer: "NovaCare", claims: 30, recovered: "₹8.2L", denialRate: "7%" },
  { payer: "Self Pay", claims: 28, recovered: "₹4.8L", denialRate: "-" },
];

const AGING_BUCKETS = [
  { label: "0–30 days", amount: 1240000, color: "success.main" },
  { label: "31–60 days", amount: 680000, color: "warning.main" },
  { label: "61–90 days", amount: 320000, color: "error.light" },
  { label: ">90 days", amount: 180000, color: "error.dark" },
];
const MAX_AGING = 1240000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResoluteBillingPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [search, setSearch] = React.useState("");

  return (
    <PageTemplate title="Resolute Billing" currentPageTitle="Resolute Billing">
      <Stack spacing={1.25}>
        {/* Header */}
        <ModuleHeaderCard
          title="Resolute Billing"
          description="Revenue cycle command center — charge capture, coding, claims, denials, collections, and refunds in one workspace."
          chips={[
            { label: "Revenue Cycle", color: "primary" },
            { label: "Billing & Claims", variant: "outlined" },
            { label: "Implemented", color: "success", variant: "filled" },
          ]}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                size="small"
              >
                Export Report
              </Button>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                size="small"
              >
                New Invoice
              </Button>
            </>
          }
        />

        {/* Tabs */}
        <CommonTabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <Stack spacing={2}>
            {/* KPI Strip */}
            <Grid container spacing={2}>
              {KPI_ITEMS.map((kpi) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.label}>
                  <Card
                    elevation={0}
                    sx={{ p: 2, borderRadius: 2.5, height: "100%" }}
                  >
                    <Stack spacing={0.5}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {kpi.label}
                        </Typography>
                        <Box sx={{ color: kpi.color, display: "flex" }}>
                          {kpi.icon}
                        </Box>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {kpi.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {kpi.subtitle}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2}>
              {/* A/R Aging */}
              <Grid item xs={12} md={5}>
                <Card
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2.5, height: "100%" }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccountBalanceIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        A/R Aging Buckets
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {AGING_BUCKETS.map((b) => (
                        <Box key={b.label}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{ mb: 0.5 }}
                          >
                            <Typography variant="body2">{b.label}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {fmt(b.amount)}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 99,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: `${Math.round((b.amount / MAX_AGING) * 100)}%`,
                                borderRadius: 99,
                                bgcolor: b.color,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Total Outstanding
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        ₹24,20,000
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>

              {/* Payer Mix */}
              <Grid item xs={12} md={7}>
                <Card
                  elevation={0}
                  sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ px: 2, pt: 2, pb: 1.5 }}
                  >
                    <CreditCardIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Payer Mix & Recovery
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Payer</TableCell>
                          <TableCell align="center">Claims</TableCell>
                          <TableCell align="right">Recovered</TableCell>
                          <TableCell align="right">Denial Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {PAYER_MIX.map((row) => (
                          <TableRow key={row.payer} hover>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {row.payer}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={row.claims}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "success.main" }}
                              >
                                {row.recovered}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    row.denialRate === "-"
                                      ? "text.secondary"
                                      : parseFloat(row.denialRate) > 9
                                        ? "error.main"
                                        : "warning.main",
                                }}
                              >
                                {row.denialRate}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Action Cards */}
            <Grid container spacing={2}>
              {[
                {
                  label: "Charges Pending Coding",
                  value: "7",
                  color: "info.main",
                  icon: <DescriptionIcon />,
                  tab: "charges",
                },
                {
                  label: "Claims Awaiting Submission",
                  value: "4",
                  color: "warning.main",
                  icon: <SendIcon />,
                  tab: "claims",
                },
                {
                  label: "Open Denials",
                  value: "2",
                  color: "error.main",
                  icon: <BlockIcon />,
                  tab: "denials",
                },
                {
                  label: "Overdue Collections",
                  value: "3",
                  color: "error.light",
                  icon: <MoneyOffIcon />,
                  tab: "collections",
                },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.label}>
                  <Card
                    elevation={0}
                    onClick={() => setActiveTab(item.tab)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      cursor: "pointer",
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ color: item.color, display: "flex" }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {item.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {item.label}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}

        {/* ═══ CHARGE CAPTURE TAB ═══ */}
        {activeTab === "charges" && (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <TextField
                placeholder="Search by patient, CPT, ICD..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                >
                  Filter
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AssignmentIcon />}
                >
                  Post Charge
                </Button>
              </Stack>
            </Stack>

            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>CPT</TableCell>
                      <TableCell>ICD-10</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CHARGES.filter(
                      (c) =>
                        !search ||
                        c.patientName
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        c.cpt.includes(search) ||
                        c.icd10.includes(search),
                    ).map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: 12,
                                bgcolor: "primary.main",
                              }}
                            >
                              {getInitials(c.patientName)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {c.patientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {c.mrn}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{c.service}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={c.cpt} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.icd10}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {c.department}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {c.date}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {fmt(c.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={c.status}
                            size="small"
                            color={chargeStatusColor[c.status]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        )}

        {/* ═══ CLAIMS TAB ═══ */}
        {activeTab === "claims" && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {[
                {
                  label: "Total Submitted",
                  value: `${CLAIMS.length}`,
                  icon: <SendIcon fontSize="small" />,
                  color: "info.main",
                },
                {
                  label: "Approved",
                  value: `${CLAIMS.filter((c) => c.status === "Approved").length}`,
                  icon: <CheckCircleIcon fontSize="small" />,
                  color: "success.main",
                },
                {
                  label: "Denied",
                  value: `${CLAIMS.filter((c) => c.status === "Denied").length}`,
                  icon: <ErrorOutlineIcon fontSize="small" />,
                  color: "error.main",
                },
                {
                  label: "Pending",
                  value: `${CLAIMS.filter((c) => c.status === "Pending").length}`,
                  icon: <PendingIcon fontSize="small" />,
                  color: "warning.main",
                },
              ].map((s) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Card elevation={0} sx={{ p: 2, borderRadius: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ color: s.color }}>{s.icon}</Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {s.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <TextField
                placeholder="Search claims..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                >
                  Refresh EDI
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                >
                  Submit Claim
                </Button>
              </Stack>
            </Stack>

            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Claim No.</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Payer</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CLAIMS.filter(
                      (c) =>
                        !search ||
                        c.patientName
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        c.claimNo.includes(search),
                    ).map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontFamily: "monospace" }}
                          >
                            {c.claimNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                bgcolor: "secondary.main",
                              }}
                            >
                              {getInitials(c.patientName)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {c.patientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {c.mrn}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{c.payer}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {c.submitted}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={
                              c.status === "Denied"
                                ? "error.main"
                                : "text.secondary"
                            }
                          >
                            {c.due}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {fmt(c.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={c.status}
                            size="small"
                            color={claimStatusColor[c.status]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        )}

        {/* ═══ DENIALS TAB ═══ */}
        {activeTab === "denials" && (
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
            >
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Denial Management
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track, appeal, and resolve claim denials. Denial rate this
                  month:{" "}
                  <strong style={{ color: theme.palette.error.main }}>
                    8.3%
                  </strong>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="warning"
                  startIcon={<WarningAmberIcon />}
                >
                  File Appeal
                </Button>
              </Stack>
            </Stack>

            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Claim No.</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Payer</TableCell>
                      <TableCell>Denial Reason</TableCell>
                      <TableCell>Received</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DENIALS.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontFamily: "monospace" }}
                          >
                            {d.claimNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                bgcolor: "error.main",
                              }}
                            >
                              {getInitials(d.patientName)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {d.patientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {d.mrn}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{d.payer}</Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={d.reason}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {d.reason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {d.receivedOn}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "error.main" }}
                          >
                            {fmt(d.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={d.status}
                            size="small"
                            color={denialStatusColor[d.status]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        )}

        {/* ═══ COLLECTIONS TAB ═══ */}
        {activeTab === "collections" && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {[
                {
                  label: "Total Receivable",
                  value: "₹1,36,800",
                  color: "primary.main",
                },
                { label: "Collected", value: "₹91,000", color: "success.main" },
                { label: "Overdue", value: "₹6,800", color: "error.main" },
                { label: "Sent to Agency", value: "₹8,500", color: "default" },
              ].map((s) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Card elevation={0} sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", fontWeight: 600 }}
                    >
                      {s.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: s.color, mt: 0.5 }}
                    >
                      {s.value}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <TextField
                placeholder="Search patient or invoice..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SendIcon />}
                >
                  Send Reminder
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AttachMoneyIcon />}
                >
                  Record Payment
                </Button>
              </Stack>
            </Stack>

            <Card
              elevation={0}
              sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Invoice No.</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Paid</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                      <TableCell align="center">Recovery</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {COLLECTIONS.filter(
                      (c) =>
                        !search ||
                        c.patientName
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        c.invoiceNo.includes(search),
                    ).map((c) => {
                      const pct = Math.round((c.paid / c.amount) * 100);
                      return (
                        <TableRow key={c.id} hover>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  fontSize: 11,
                                  bgcolor:
                                    c.status === "Overdue"
                                      ? "error.main"
                                      : "primary.main",
                                }}
                              >
                                {getInitials(c.patientName)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {c.patientName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {c.mrn}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: 12 }}
                            >
                              {c.invoiceNo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  c.status === "Overdue"
                                    ? "error.main"
                                    : "text.primary",
                                fontWeight: c.status === "Overdue" ? 700 : 400,
                              }}
                            >
                              {c.dueDate}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {fmt(c.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color="success.main"
                              sx={{ fontWeight: 600 }}
                            >
                              {fmt(c.paid)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={
                                c.due > 0 ? "error.main" : "text.secondary"
                              }
                              sx={{ fontWeight: 600 }}
                            >
                              {c.due > 0 ? fmt(c.due) : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 100 }}>
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700 }}
                              >
                                {pct}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={pct}
                                sx={{
                                  width: 80,
                                  height: 6,
                                  borderRadius: 99,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      pct === 100
                                        ? "success.main"
                                        : pct < 40
                                          ? "error.main"
                                          : "warning.main",
                                  },
                                }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={c.status}
                              size="small"
                              color={collectionStatusColor[c.status]}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        )}

        {/* ═══ REFUNDS TAB ═══ */}
        {activeTab === "refunds" && (
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
            >
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Refund Requests
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage overpayments, cancellations, and reversal refunds.
                </Typography>
              </Stack>
              <Button variant="contained" size="small" startIcon={<UndoIcon />}>
                New Refund Request
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {REFUNDS.map((r) => (
                <Grid item xs={12} md={6} key={r.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor:
                                r.status === "Rejected"
                                  ? "error.main"
                                  : r.status === "Processed"
                                    ? "success.main"
                                    : "primary.main",
                              fontSize: 13,
                            }}
                          >
                            {getInitials(r.patientName)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {r.patientName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {r.mrn}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={r.status}
                          size="small"
                          color={refundStatusColor[r.status]}
                        />
                      </Stack>
                      <Divider />
                      <Stack spacing={0.75}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Reason
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              maxWidth: 220,
                              textAlign: "right",
                            }}
                          >
                            {r.reason}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Refund Amount
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "error.main" }}
                          >
                            {fmt(r.amount)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Requested On
                          </Typography>
                          <Typography variant="body2">
                            {r.requestedOn}
                          </Typography>
                        </Stack>
                        {r.approvedBy && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Approved By
                            </Typography>
                            <Typography
                              variant="body2"
                              color="success.main"
                              sx={{ fontWeight: 600 }}
                            >
                              {r.approvedBy}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                      {r.status === "Requested" && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            fullWidth
                          >
                            Reject
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            fullWidth
                          >
                            Approve
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </PageTemplate>
  );
}
