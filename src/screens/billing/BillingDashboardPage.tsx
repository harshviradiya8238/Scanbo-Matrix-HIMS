"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { StatTile } from "@/src/ui/components/molecules";
import {
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  PendingActions as PendingIcon,
  Security as SecurityIcon,
  Inventory as MonthlyIcon,
  Description as InvoiceIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as ActivityIcon,
} from "@mui/icons-material";

// --- Theme Styles ---

const PAPER_SX = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "rgba(17, 114, 186, 0.14)",
  boxShadow: "0 10px 40px rgba(17, 114, 186, 0.06)",
  backgroundColor: "#FFFFFF",
  overflow: "hidden",
};

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

// --- Mock Data ---

const METRICS = [
  {
    label: "TODAY'S COLLECTION",
    value: "₹2,84,500",
    trend: "↑ 12.4% vs yesterday",
    trendColor: "success",
    icon: <WalletIcon color="warning" sx={{ opacity: 0.15, fontSize: 40 }} />,
    topBorderColor: "#74b9ff", // Light blue
  },
  {
    label: "BILLS GENERATED",
    value: "147",
    trend: "↑ 8 more than avg",
    trendColor: "success",
    icon: <ReceiptIcon color="info" sx={{ opacity: 0.15, fontSize: 40 }} />,
    topBorderColor: "#00b894", // Green
  },
  {
    label: "PENDING PAYMENTS",
    value: "₹68,200",
    trend: "3 new pending",
    trendColor: "error",
    icon: <PendingIcon color="warning" sx={{ opacity: 0.15, fontSize: 40 }} />,
    topBorderColor: "#fdcb6e", // Yellow
  },
  {
    label: "INSURANCE PENDING",
    value: "₹1,42,000",
    trend: "3 claims awaiting",
    trendColor: "warning",
    icon: (
      <SecurityIcon color="disabled" sx={{ opacity: 0.15, fontSize: 40 }} />
    ),
    topBorderColor: "#ff7675", // Red
  },
  {
    label: "MONTHLY REVENUE",
    value: "₹42.6L",
    trend: "↑ 6.2% this month",
    trendColor: "success",
    icon: <MonthlyIcon color="disabled" sx={{ opacity: 0.15, fontSize: 40 }} />,
    topBorderColor: "#6c5ce7", // Purple
  },
];

const RECENT_INVOICES = [
  {
    id: "#INV-2024-0891",
    patient: "Priya Sharma",
    amount: 12500,
    status: "Paid",
  },
  {
    id: "#INV-2024-0890",
    patient: "Anil Kumar",
    amount: 38000,
    status: "Insurance",
  },
  {
    id: "#INV-2024-0889",
    patient: "Meera Patel",
    amount: 5200,
    status: "Pending",
  },
  {
    id: "#INV-2024-0888",
    patient: "Suresh Gupta",
    amount: 89500,
    status: "Partial",
  },
  {
    id: "#INV-2024-0887",
    patient: "Kavita Singh",
    amount: 7800,
    status: "Paid",
  },
];

const OUTSTANDING_ALERTS = [
  {
    type: "error",
    message: "Ramesh Yadav — IPD Bill ₹1,24,000 overdue 14 days",
  },
  {
    type: "warning",
    message: "Star Health TPA — Claim #TPA-0042 pending 21 days",
  },
  { type: "warning", message: "Mohan Lal — Advance ₹10,000 expires in 3 days" },
  { type: "info", message: "8 OPD Bills yet to be collected today" },
];

const TODAY_ACTIVITY = [
  {
    time: "02:34 PM",
    title: "INV-0891",
    desc: "Priya Sharma — ₹12,500 paid via UPI",
  },
  {
    time: "01:58 PM",
    title: "Insurance claim submitted",
    desc: "Star Health ₹38,000",
  },
  {
    time: "01:20 PM",
    title: "Discount approved",
    desc: "BPL Card — Suresh Gupta 20%",
  },
  { time: "11:45 AM", title: "New IPD bill", desc: "Anil Kumar — Room 302" },
  {
    time: "10:10 AM",
    title: "Refund processed",
    desc: "Kavita Singh — ₹2,000",
  },
];

const PAYMENT_MODES = [
  { label: "Cash", amount: "₹1,12,000", color: "#4caf50" },
  { label: "Online / UPI", amount: "₹98,500", color: "#212121" },
  { label: "Credit / Debit Card", amount: "₹42,000", color: "#ffb300" },
  { label: "Insurance / TPA", amount: "₹32,000", color: "#9e9e9e" },
];

// --- Subcomponents ---

const SectionHeader = ({ title, icon: Icon, action }: any) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ p: 2, borderBottom: "1px solid rgba(17, 114, 186, 0.10)" }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Icon fontSize="small" sx={{ color: "primary.main" }} />
      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
        {title}
      </Typography>
    </Stack>
    {action}
  </Stack>
);

const StatusChip = ({ status }: { status: string }) => {
  const theme = useTheme();
  let color = theme.palette.success;
  if (status === "Pending") color = theme.palette.warning;
  if (status === "Partial") color = theme.palette.secondary; // purple-ish
  if (status === "Insurance") color = theme.palette.info;

  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: alpha(color.main, 0.1),
        color: color.dark,
        border: "1px solid",
        borderColor: alpha(color.main, 0.2),
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
    >
      {status}
    </Box>
  );
};

export function BillingDashboardPage() {
  const theme = useTheme();

  return (
    <PageTemplate
      title="Billing & Revenue Cycle"
      subtitle="Comprehensive view of hospital revenue, collections, and outstanding dues"
      currentPageTitle="Dashboard"
    >
      <Stack spacing={1.25}>
        {/* Header Section */}
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
              >
                Revenue Cycle Dashboard
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Comprehensive view of hospital revenue, collections, and
                outstanding dues.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Generate Report
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        {/* Top KPIs */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          {METRICS.map((metric, i) => (
            <StatTile
              key={i}
              label={metric.label}
              value={metric.value}
              subtitle={metric.trend}
              tone={metric.trendColor as any}
              icon={metric.icon}
            />
          ))}
        </Box>

        {/* Middle Section: Recent Invoices & Payment Modes */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Recent Invoices */}
          <Paper elevation={0} sx={PAPER_SX}>
            <SectionHeader
              title="Recent Invoices"
              icon={InvoiceIcon}
              action={
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  View All
                </Button>
              }
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={HEADER_SX}>Invoice #</TableCell>
                    <TableCell sx={HEADER_SX}>Patient</TableCell>
                    <TableCell sx={HEADER_SX}>Amount</TableCell>
                    <TableCell sx={HEADER_SX}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RECENT_INVOICES.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: "0.8rem",
                        }}
                      >
                        {row.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "text.primary",
                        }}
                      >
                        {row.patient}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        ₹{row.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Payment Modes */}
          <Paper elevation={0} sx={PAPER_SX}>
            <SectionHeader
              title="Payment Modes — Today"
              icon={WalletIcon}
              action={
                <Chip
                  label="Live"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                />
              }
            />
            <Stack spacing={2.5} sx={{ p: 3 }}>
              {PAYMENT_MODES.map((mode, i) => (
                <Stack
                  key={i}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 0.5,
                        bgcolor: mode.color,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {mode.label}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    {mode.amount}
                  </Typography>
                </Stack>
              ))}

              <Box
                sx={{ my: 1, borderTop: "1px dashed rgba(17, 114, 186, 0.2)" }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Total Collected
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="primary.main"
                >
                  ₹2,84,500
                </Typography>
              </Stack>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Collection vs Target (₹3,00,000)
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="primary.main"
                  >
                    94.8%
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: "100%",
                    height: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "94.8%",
                      height: "100%",
                      bgcolor: "primary.main",
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Bills Cleared vs Generated
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="success.main"
                  >
                    78.2%
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: "100%",
                    height: 6,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "78.2%",
                      height: "100%",
                      bgcolor: "success.main",
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Bottom Section: Alerts & Activity */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Outstanding Alerts */}
          <Paper elevation={0} sx={PAPER_SX}>
            <SectionHeader
              title="Outstanding Alerts"
              icon={WarningIcon}
              action={
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  View All
                </Button>
              }
            />
            <Stack spacing={2} sx={{ p: 2 }}>
              {OUTSTANDING_ALERTS.map((alert, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(
                      theme.palette[alert.type as "error" | "warning" | "info"]
                        .main,
                      0.05,
                    ),
                    border: "1px solid",
                    borderColor: alpha(
                      theme.palette[alert.type as "error" | "warning" | "info"]
                        .main,
                      0.3,
                    ),
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {alert.type === "error" && (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: "error.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ width: 8, height: 2, bgcolor: "white" }} />
                    </Box>
                  )}
                  {alert.type === "warning" && (
                    <WarningIcon sx={{ fontSize: 18, color: "warning.main" }} />
                  )}
                  {alert.type === "info" && (
                    <InfoIcon sx={{ fontSize: 18, color: "info.main" }} />
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        theme.palette[
                          alert.type as "error" | "warning" | "info"
                        ].dark,
                      "& strong": { fontWeight: 800 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: alert.message.replace(
                        /(\d+ days|\d+ OPD Bills)/g,
                        "<strong>$1</strong>",
                      ),
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Today's Activity */}
          <Paper elevation={0} sx={PAPER_SX}>
            <SectionHeader title="Today's Activity" icon={ActivityIcon} />
            <Box sx={{ p: 3 }}>
              {TODAY_ACTIVITY.map((activity, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={2}
                  sx={{
                    position: "relative",
                    pb: i === TODAY_ACTIVITY.length - 1 ? 0 : 3,
                  }}
                >
                  {/* Timeline Line */}
                  {i !== TODAY_ACTIVITY.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 9,
                        top: 20,
                        bottom: 0,
                        width: "2px",
                        bgcolor: "rgba(17, 114, 186, 0.15)",
                      }}
                    />
                  )}

                  {/* Timeline Dot */}
                  <Box sx={{ position: "relative", zIndex: 1, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "3px solid",
                        borderColor: "primary.main",
                        bgcolor: "background.paper",
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, mt: -0.5 }}>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      fontWeight={800}
                    >
                      {activity.time}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        "& strong": { fontWeight: 700, color: "text.primary" },
                        color: "text.secondary",
                        mt: 0.25,
                      }}
                    >
                      <strong>{activity.title}</strong> — {activity.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Paper>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
