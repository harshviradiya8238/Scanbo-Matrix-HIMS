"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@/src/ui/components/atoms";
import { StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CalendarToday as DateIcon,
  Payment as CashIcon,
  PhoneIphone as UpiIcon,
  CreditCard as CardIcon,
  ShieldOutlined as InsuranceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  PendingActions as PendingIcon,
  Security as SecurityIcon,
  Inventory as MonthlyIcon,
} from "@mui/icons-material";

// ── Tokens ────────────────────────────────────────────────────────────────────
const PRIMARY = "#1172BA";
const SUCCESS = "#059669";
const WARNING = "#D97706";
const INFO = "#0284C7";
const SURFACE = "#F8FAFF";
const BORDER = "rgba(17, 114, 186, 0.12)";

const PAPER_SX = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "rgba(17, 114, 186, 0.14)",
  //   boxShadow: "0 10px 40px rgba(17, 114, 186, 0.06)",
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

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const pill = (color: string) => ({
  px: 1.4,
  py: 0.3,
  borderRadius: "20px",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.4,
  bgcolor: alpha(color, 0.1),
  color: color,
});

// ── Metric Card ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  accent: string;
  icon: React.ReactNode;
}

function MetricCard({
  label,
  value,
  sub,
  trend,
  trendUp,
  accent,
  icon,
}: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: alpha(accent, 0.1),
        boxShadow: "none",
        backgroundColor: alpha(accent, 0.06),
        position: "relative",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mt: 0.5,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "text.primary",
            }}
          >
            {value}
          </Typography>
          {(trend || sub) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              {trend && (
                <Box
                  sx={{
                    ...pill(trendUp !== false ? SUCCESS : WARNING),
                    fontSize: "0.65rem",
                    py: 0.2,
                  }}
                >
                  {trendUp !== false ? (
                    <ArrowUpward sx={{ fontSize: 10 }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 10 }} />
                  )}
                  {trend}
                </Box>
              )}
              {sub && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {sub}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {icon ? (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: accent,
              backgroundColor: alpha(accent, 0.12),
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: 24 },
            })}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BillingReportsPage() {
  const [reportType, setReportType] = React.useState("Monthly");
  const [startDate, setStartDate] = React.useState("01/12/2024");
  const [endDate, setEndDate] = React.useState("13/12/2024");

  const deptData = [
    {
      name: "Cardiology",
      bills: 98,
      revenue: "₹9,82,000",
      raw: 982000,
      share: 85,
      color: "#3B82F6",
    },
    {
      name: "Orthopedics",
      bills: 72,
      revenue: "₹7,21,500",
      raw: 721500,
      share: 65,
      color: "#10B981",
    },
    {
      name: "Gynecology",
      bills: 54,
      revenue: "₹5,40,000",
      raw: 540000,
      share: 45,
      color: "#F59E0B",
    },
    {
      name: "Lab & Diagnostics",
      bills: 312,
      revenue: "₹4,68,000",
      raw: 468000,
      share: 30,
      color: "#8B5CF6",
    },
  ];

  const paymentData = [
    {
      mode: "Cash",
      icon: <CashIcon sx={{ fontSize: 15 }} />,
      iconColor: SUCCESS,
      transactions: 489,
      amount: "₹14,67,000",
      pct: 36,
    },
    {
      mode: "UPI / Online",
      icon: <UpiIcon sx={{ fontSize: 15 }} />,
      iconColor: "#1a1a1a",
      transactions: 312,
      amount: "₹11,24,000",
      pct: 28,
    },
    {
      mode: "Card",
      icon: <CardIcon sx={{ fontSize: 15 }} />,
      iconColor: WARNING,
      transactions: 98,
      amount: "₹5,82,000",
      pct: 14,
    },
    {
      mode: "Insurance / TPA",
      icon: <InsuranceIcon sx={{ fontSize: 15 }} />,
      iconColor: PRIMARY,
      transactions: 47,
      amount: "₹8,71,000",
      pct: 22,
    },
  ];

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      height: 40,
      bgcolor: "#fff",
      fontSize: "0.85rem",
      fontWeight: 600,
      "& fieldset": { borderColor: BORDER },
      "&:hover fieldset": { borderColor: alpha(PRIMARY, 0.4) },
      "&.Mui-focused fieldset": { borderColor: PRIMARY },
    },
  };

  return (
    <PageTemplate
      title="Billing Reports"
      subtitle="Financial analytics and revenue tracking · Dec 2024"
      currentPageTitle="Reports"
    >
      <Stack spacing={1.25}>
        {/* ── Page Header Card ── */}
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
              >
                Billing & Revenue Reports
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Comprehensive financial insights and department-wise revenue
                breakdown.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Refresh data">
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: BORDER,
                    borderRadius: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<ExportIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  height: 40,
                  px: 2,
                  borderColor: BORDER,
                  color: "text.primary",
                  bgcolor: "background.paper",
                  "&:hover": {
                    borderColor: PRIMARY,
                    bgcolor: alpha(PRIMARY, 0.04),
                  },
                }}
              >
                Export PDF/Excel
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>
        {/* ── Filters ── */}
        <Paper
          elevation={0}
          sx={{
            ...PAPER_SX,
            p: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "text.secondary",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Filter by
            </Typography>

            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as string)}
              size="small"
              sx={{
                minWidth: 130,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(PRIMARY, 0.4),
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: PRIMARY,
                },
              }}
            >
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Custom">Custom</MenuItem>
            </Select>

            <TextField
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
              sx={{ width: 170, ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.disabled",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              →
            </Box>

            <TextField
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
              sx={{ width: 170, ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              disableElevation
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                height: 40,
                px: 3,
                fontSize: "0.85rem",
                bgcolor: PRIMARY,
                boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.28)}`,
                "&:hover": {
                  bgcolor: alpha(PRIMARY, 0.9),
                  boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.36)}`,
                },
                ml: { sm: "auto !important" },
              }}
            >
              Generate Report
            </Button>
          </Stack>
        </Paper>

        {/* ── KPI Cards ── */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <StatTile
            label="Gross Revenue"
            value="₹42.6L"
            subtitle="6.2% vs Nov"
            tone="primary"
            icon={<WalletIcon />}
          />
          <StatTile
            label="Collected"
            value="₹38.4L"
            subtitle="90.1% rate"
            tone="success"
            icon={<ReceiptIcon />}
          />
          <StatTile
            label="Outstanding"
            value="₹4.2L"
            subtitle="Pending"
            tone="warning"
            icon={<PendingIcon />}
          />
          <StatTile
            label="Insurance Billed"
            value="₹8.7L"
            subtitle="TPA claims"
            tone="info"
            icon={<SecurityIcon />}
          />
        </Box>

        {/* ── Tables Row ── */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1.3fr 0.7fr" },
          }}
        >
          {/* Revenue by Department */}
          <Paper
            elevation={0}
            sx={{
              ...PAPER_SX,
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  Revenue by Department
                </Typography>
                <Typography
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.2 }}
                >
                  4 departments · Dec 1–13
                </Typography>
              </Box>
              <Chip
                label="Live"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  bgcolor: alpha(SUCCESS, 0.1),
                  color: SUCCESS,
                  "& .MuiChip-label": { px: 1.2 },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: BORDER }} />

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Department", "Bills", "Revenue", "Share"].map((h) => (
                      <TableCell key={h} sx={HEADER_SX}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deptData.map((row, i) => (
                    <TableRow
                      key={row.name}
                      sx={{
                        "&:last-child td": { border: 0 },
                        "&:hover": { bgcolor: alpha(row.color, 0.03) },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell sx={{ py: 2, px: 2.5 }}>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: row.color,
                              flexShrink: 0,
                              boxShadow: `0 0 0 3px ${alpha(row.color, 0.15)}`,
                            }}
                          />
                          <Typography
                            sx={{ fontWeight: 700, fontSize: "0.855rem" }}
                          >
                            {row.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {row.bills}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.875rem",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {row.revenue}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 160, pr: 2.5 }}>
                        <Stack spacing={0.6}>
                          <LinearProgress
                            variant="determinate"
                            value={row.share}
                            sx={{
                              height: 5,
                              borderRadius: 99,
                              bgcolor: alpha(row.color, 0.1),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: row.color,
                                borderRadius: 99,
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              color: "text.disabled",
                              fontWeight: 600,
                            }}
                          >
                            {row.share}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Payment Mode Split */}
          <Paper
            elevation={0}
            sx={{
              ...PAPER_SX,
            }}
          >
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                Payment Mode Split
              </Typography>
              <Typography
                sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.2 }}
              >
                946 total transactions
              </Typography>
            </Box>
            <Divider sx={{ borderColor: BORDER }} />

            <Stack
              spacing={0}
              divider={<Divider sx={{ borderColor: BORDER }} />}
            >
              {paymentData.map((row) => (
                <Box
                  key={row.mode}
                  sx={{
                    px: 2.5,
                    py: 2,
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: alpha(row.iconColor, 0.03) },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.2}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: alpha(row.iconColor, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: row.iconColor,
                          flexShrink: 0,
                        }}
                      >
                        {row.icon}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.84rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {row.mode}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.7rem", color: "text.disabled" }}
                        >
                          {row.transactions} txns
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: SUCCESS,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {row.amount}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={row.pct}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 99,
                        bgcolor: alpha(row.iconColor, 0.08),
                        "& .MuiLinearProgress-bar": {
                          bgcolor: row.iconColor,
                          borderRadius: 99,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "text.disabled",
                        width: 28,
                        textAlign: "right",
                      }}
                    >
                      {row.pct}%
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
