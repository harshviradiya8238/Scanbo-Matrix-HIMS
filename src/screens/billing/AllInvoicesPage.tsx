"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  AccountBalanceWallet as PayIcon,
  CalendarToday as DateIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ReceiptLong as TotalIcon,
  Update as MonthlyIcon,
  CheckCircle as PaidIcon,
  PendingActions as PendingIcon,
  Shield as InsuranceIcon,
  TrendingUp as ValueIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { useUser } from "@/src/core/auth/UserContext";

// --- Theme Styles ---

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

const INVOICES = [
  {
    id: "#INV-2024-0891",
    date: "13 Dec 2024",
    patient: "Priya Sharma",
    uhid: "HIMS-00234",
    type: "OPD",
    doctor: "Dr. Mehta",
    amount: 12500,
    paid: 12500,
    balance: 0,
    status: "Paid",
  },
  {
    id: "#INV-2024-0890",
    date: "13 Dec 2024",
    patient: "Anil Kumar",
    uhid: "HIMS-00189",
    type: "IPD",
    doctor: "Dr. Nair",
    amount: 38000,
    paid: 0,
    balance: 38000,
    status: "Insurance",
  },
  {
    id: "#INV-2024-0889",
    date: "12 Dec 2024",
    patient: "Meera Patel",
    uhid: "HIMS-00412",
    type: "OPD",
    doctor: "Dr. Joshi",
    amount: 5200,
    paid: 0,
    balance: 5200,
    status: "Pending",
  },
  {
    id: "#INV-2024-0888",
    date: "12 Dec 2024",
    patient: "Suresh Gupta",
    uhid: "HIMS-00078",
    type: "IPD",
    doctor: "Dr. Kumar",
    amount: 89500,
    paid: 50000,
    balance: 39500,
    status: "Partial",
  },
  {
    id: "#INV-2024-0887",
    date: "11 Dec 2024",
    patient: "Kavita Singh",
    uhid: "HIMS-00567",
    type: "OPD",
    doctor: "Dr. Mehta",
    amount: 7800,
    paid: 7800,
    balance: 0,
    status: "Paid",
  },
  {
    id: "#INV-2024-0886",
    date: "11 Dec 2024",
    patient: "Ramesh Yadav",
    uhid: "HIMS-00091",
    type: "IPD",
    doctor: "Dr. Nair",
    amount: 124000,
    paid: 0,
    balance: 124000,
    status: "Unpaid",
  },
];

const METRICS = [
  {
    label: "Total",
    value: "1,247",
    tone: "primary",
    icon: <TotalIcon fontSize="small" />,
  },
  {
    label: "This Month",
    value: "312",
    tone: "info",
    icon: <MonthlyIcon fontSize="small" />,
  },
  {
    label: "Paid",
    value: "892",
    tone: "success",
    icon: <PaidIcon fontSize="small" />,
  },
  {
    label: "Pending",
    value: "84",
    tone: "warning",
    icon: <PendingIcon fontSize="small" />,
  },
  {
    label: "Insurance",
    value: "47",
    tone: "info",
    icon: <InsuranceIcon fontSize="small" />,
  },
  {
    label: "Total Value",
    value: "₹1.28 Cr",
    tone: "primary",
    icon: <ValueIcon fontSize="small" />,
  },
];

const BILLING_MODULE_STORAGE_KEY =
  "scanbo.hims.ipd.billing-medication.module.v1";

interface BillingInvoiceRow {
  id: string;
  date: string;
  type: string;
  amount: number;
  insuranceAmount: number;
  patientDue: number;
  status: "Pending" | "Paid";
}

interface BillingPaymentRow {
  id: string;
  dateTime: string;
  mode: string;
  amount: number;
  invoiceId: string;
  status: "Completed" | "Pending";
}

interface BillingModulePersistedState {
  version: 1;
  invoicesByPatient: Record<string, BillingInvoiceRow[]>;
  paymentsByPatient: Record<string, BillingPaymentRow[]>;
}

export default function AllInvoicesPage() {
  const router = useRouter();
  const theme = useTheme();
  const { role } = useUser();
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [typeFilter, setTypeFilter] = React.useState("All Types");
  const [moduleState, setModuleState] =
    React.useState<BillingModulePersistedState | null>(null);

  const refreshData = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      /**
       * FUTURE API INTEGRATION:
       * TODO: Replace sessionStorage with actual backend API call.
       * Example:
       * const response = await axios.get('/api/billing/all-invoices');
       * setModuleState(response.data);
       */
      const raw = window.sessionStorage.getItem(BILLING_MODULE_STORAGE_KEY);
      if (raw) {
        setModuleState(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to parse billing state", e);
    }
  }, []);

  React.useEffect(() => {
    refreshData();
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);
    const interval = setInterval(refreshData, 5000);
    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
      clearInterval(interval);
    };
  }, [refreshData]);

  const handleAction = (row: any, actionLabel: string) => {
    let tab = "invoices";
    if (actionLabel === "Pay" || actionLabel === "Overdue") {
      tab = "payments";
    }

    // Construct route to Patient Billing Desk
    const mrn = row.uhid || "HIMS-00189"; // Fallback to a mock MRN
    router.push(`/ipd/charges?tab=${tab}&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedInvoices = React.useMemo(() => {
    const list = [...INVOICES];
    if (moduleState?.invoicesByPatient) {
      Object.entries(moduleState.invoicesByPatient).forEach(
        ([patientId, invoices]) => {
          invoices.forEach((inv) => {
            if (!list.some((i) => i.id === inv.id)) {
              list.push({
                id: inv.id,
                date: inv.date,
                patient: `Patient (${patientId})`,
                uhid: patientId,
                type: inv.type === "Interim Bill" ? "IPD" : "OPD",
                doctor: "Dr. Medical",
                amount: inv.amount,
                paid: inv.amount - inv.patientDue,
                balance: inv.patientDue,
                status:
                  inv.status === "Paid"
                    ? "Paid"
                    : inv.insuranceAmount > 0
                      ? "Insurance"
                      : "Pending",
              });
            }
          });
        },
      );
    }
    return list;
  }, [moduleState]);

  const dynamicMetrics = React.useMemo(() => {
    const totalCount = mergedInvoices.length;
    const paidCount = mergedInvoices.filter((i) => i.status === "Paid").length;
    const pendingCount = mergedInvoices.filter(
      (i) => i.status === "Pending" || i.status === "Partial",
    ).length;
    const insuranceCount = mergedInvoices.filter(
      (i) => i.status === "Insurance",
    ).length;
    const totalValue = mergedInvoices.reduce((sum, i) => sum + i.amount, 0);

    return [
      {
        label: "Total",
        value: totalCount.toLocaleString(),
        tone: "primary",
        icon: <TotalIcon fontSize="small" />,
      },
      {
        label: "This Month",
        value: mergedInvoices
          .filter((i) => i.date.includes("2024") || i.date.includes("2026"))
          .length.toString(),
        tone: "info",
        icon: <MonthlyIcon fontSize="small" />,
      },
      {
        label: "Paid",
        value: paidCount.toString(),
        tone: "success",
        icon: <PaidIcon fontSize="small" />,
      },
      {
        label: "Pending",
        value: pendingCount.toString(),
        tone: "warning",
        icon: <PendingIcon fontSize="small" />,
      },
      {
        label: "Insurance",
        value: insuranceCount.toString(),
        tone: "info",
        icon: <InsuranceIcon fontSize="small" />,
      },
      {
        label: "Total Value",
        value: `₹${(totalValue / 10000000).toFixed(2)} Cr`,
        tone: "primary",
        icon: <ValueIcon fontSize="small" />,
      },
    ];
  }, [mergedInvoices]);

  const filteredInvoices = React.useMemo(() => {
    let data = mergedInvoices;
    if (statusFilter !== "All Status") {
      data = data.filter(
        (p) => p.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (typeFilter !== "All Types") {
      data = data.filter(
        (p) => p.type.toLowerCase() === typeFilter.toLowerCase(),
      );
    }
    return data;
  }, [mergedInvoices, statusFilter, typeFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Paid":
        return {
          label: "Paid",
          color: theme.palette.success.dark,
          bg: alpha(theme.palette.success.main, 0.08),
          border: alpha(theme.palette.success.main, 0.35),
        };
      case "Insurance":
        return {
          label: "Insurance",
          color: theme.palette.info.dark,
          bg: alpha(theme.palette.info.main, 0.08),
          border: alpha(theme.palette.info.main, 0.35),
        };
      case "Pending":
        return {
          label: "Pending",
          color: theme.palette.warning.dark,
          bg: alpha(theme.palette.warning.main, 0.1),
          border: alpha(theme.palette.warning.main, 0.35),
        };
      case "Partial":
        return {
          label: "Partial",
          color: theme.palette.secondary.dark,
          bg: alpha(theme.palette.secondary.main, 0.08),
          border: alpha(theme.palette.secondary.main, 0.35),
        };
      case "Unpaid":
        return {
          label: "Unpaid",
          color: theme.palette.error.main,
          bg: alpha(theme.palette.error.main, 0.08),
          border: alpha(theme.palette.error.main, 0.3),
        };
      default:
        return {
          label: status,
          color: theme.palette.text.secondary,
          bg: alpha(theme.palette.text.secondary, 0.06),
          border: alpha(theme.palette.text.secondary, 0.2),
        };
    }
  };

  const getActionConfig = (status: string) => {
    if (status === "Paid" || status === "Insurance") {
      return {
        label: "View",
        icon: <ViewIcon fontSize="small" />,
        color: "inherit" as const,
      };
    }
    if (status === "Unpaid") {
      return { label: "Overdue", icon: null, color: "error" as const };
    }
    return {
      label: "Pay",
      icon: <PayIcon fontSize="small" />,
      color: "primary" as const,
    };
  };

  const invoiceColumns = React.useMemo<CommonColumn<any>[]>(
    () => [
      {
        field: "id",
        headerName: "Invoice #",
        width: 140,
        renderCell: (row) => (
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: "primary.main", fontSize: "0.8rem" }}
            >
              {row.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.uhid}
            </Typography>
          </Box>
        ),
      },
      {
        field: "patient",
        headerName: "Patient",
        width: 250,
        renderCell: (row) => {
          const initials = row.patient
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: "text.primary", lineHeight: 1.2 }}
                >
                  {row.patient}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gen · 28Y
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: "dateType",
        headerName: "Date & Type",
        width: 150,
        renderCell: (row) => (
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ color: "text.primary" }}
            >
              {row.date}
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                px: 1,
                py: 0.1,
                mt: 0.4,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: alpha(
                  (theme.palette as any)[
                    row.type === "OPD" ? "success" : "info"
                  ].main,
                  0.2,
                ),
                bgcolor: alpha(
                  (theme.palette as any)[
                    row.type === "OPD" ? "success" : "info"
                  ].main,
                  0.05,
                ),
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: (theme.palette as any)[
                    row.type === "OPD" ? "success" : "info"
                  ].dark,
                  textTransform: "uppercase",
                }}
              >
                {row.type}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "doctor",
        headerName: "Doctor",
        width: 150,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {row.doctor}
          </Typography>
        ),
      },
      {
        field: "amount",
        headerName: "Amount",
        align: "right",
        width: 130,
        renderCell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={700}>
              ₹{row.amount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="success.main" fontWeight={600}>
              Paid: ₹{row.paid.toLocaleString()}
            </Typography>
          </Box>
        ),
      },
      {
        field: "balance",
        headerName: "Balance",
        align: "right",
        width: 110,
        renderCell: (row) => (
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: row.balance > 0 ? "error.main" : "text.secondary" }}
          >
            ₹{row.balance.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        align: "center",
        width: 130,
        renderCell: (row) => {
          const statusCfg = getStatusConfig(row.status);
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
        field: "action",
        headerName: "Actions",
        align: "center",
        width: 150,
        renderCell: (row) => {
          const actionCfg = getActionConfig(row.status);
          return (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="center"
              alignItems="center"
            >
              {role !== "RECEPTION" && (
                <Button
                  size="small"
                  variant={
                    actionCfg.color === "primary" ? "contained" : "outlined"
                  }
                  color={actionCfg.color}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(row, actionCfg.label);
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    py: 0.2,
                    px: 1.25,
                    minWidth: 0,
                    boxShadow: "none",
                    ...(actionCfg.color === "inherit" && {
                      borderColor: "divider",
                      color: "text.secondary",
                    }),
                  }}
                >
                  {actionCfg.label}
                </Button>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    color: "primary.main",
                  },
                }}
              >
                <PrintIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Stack>
          );
        },
      },
    ],
    [theme, handleAction, role],
  );

  return (
    <PageTemplate
      title="All Invoices"
      subtitle="Comprehensive view of all hospital invoices and billing history"
      currentPageTitle="All Invoices"
    >
      <Stack spacing={1.25}>
        {/* Header Card */}
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
                sx={{
                  fontWeight: 900,
                  color: "primary.main",
                  letterSpacing: "-0.02em",
                }}
              >
                All Invoices
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
              >
                Manage all patient invoices, track payments, and review billing
                history.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<TotalIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(17, 114, 186, 0.25)",
                }}
              >
                Generate Bill
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>
        {/* Metric Cards Row */}
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            },
          }}
        >
          {dynamicMetrics.map((m, i) => (
            <StatTile
              key={i}
              label={m.label}
              value={m.value}
              tone={m.tone as any}
              icon={m.icon}
            />
          ))}
        </Box>

        {/* Patient Table Paper */}
        <Box sx={{ mt: 2 }}>
          <CommonDataGrid<any>
            rows={filteredInvoices}
            columns={invoiceColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search patient, invoice #..."
            searchFields={["patient", "id", "uhid"]}
            filterDropdowns={[
              {
                id: "statusFilter",
                placeholder: "All Status",
                value: statusFilter,
                options: [
                  "All Status",
                  "Paid",
                  "Pending",
                  "Partial",
                  "Insurance",
                  "Unpaid",
                ],
                onChange: (val) => setStatusFilter(val),
              },
              {
                id: "typeFilter",
                placeholder: "All Types",
                value: typeFilter,
                options: ["All Types", "OPD", "IPD"],
                onChange: (val) => setTypeFilter(val),
              },
            ]}
            toolbarRight={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExportIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "warning.dark",
                    borderColor: alpha(theme.palette.warning.main, 0.3),
                    px: 1.5,
                    height: 36,
                  }}
                >
                  Export
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    borderColor: "divider",
                    px: 1.5,
                    height: 36,
                  }}
                >
                  Print
                </Button>
              </Stack>
            }
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
