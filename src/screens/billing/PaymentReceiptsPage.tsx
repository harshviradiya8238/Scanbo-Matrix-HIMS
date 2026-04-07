"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,

  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
} from "@/src/ui/components/atoms";
import { StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { palette } from "@/src/core/theme/tokens";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  AccountBalanceWallet as WalletIcon,
  ReceiptLong as ReceiptIcon,
  TrendingUp as RevenueIcon,
  Person as CashierIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface PaymentReceipt {
  id: string;
  receiptNo: string;
  date: string;
  invoiceNo: string;
  patientName: string;
  amount: number;
  mode: "Cash" | "UPI" | "Card" | "NEFT" | "Insurance";
  cashier: string;
  action: "Print";
}

const MOCK_DATA: PaymentReceipt[] = [
  {
    id: "1",
    receiptNo: "#RCT-0421",
    date: "13 Dec, 02:34 PM",
    invoiceNo: "#INV-0891",
    patientName: "Priya Sharma",
    amount: 12500,
    mode: "UPI",
    cashier: "Rahul K.",
    action: "Print",
  },
  {
    id: "2",
    receiptNo: "#RCT-0420",
    date: "13 Dec, 11:20 AM",
    invoiceNo: "#INV-0887",
    patientName: "Kavita Singh",
    amount: 7800,
    mode: "Cash",
    cashier: "Rahul K.",
    action: "Print",
  },
  {
    id: "3",
    receiptNo: "#RCT-0419",
    date: "12 Dec, 04:15 PM",
    invoiceNo: "#INV-0850",
    patientName: "Geeta Mishra",
    amount: 45000,
    mode: "Insurance",
    cashier: "Anjali S.",
    action: "Print",
  },
  {
    id: "4",
    receiptNo: "#RCT-0418",
    date: "12 Dec, 10:45 AM",
    invoiceNo: "#INV-0832",
    patientName: "Amit Verma",
    amount: 3200,
    mode: "Card",
    cashier: "Anjali S.",
    action: "Print",
  },
  {
    id: "5",
    receiptNo: "#RCT-0417",
    date: "11 Dec, 01:20 PM",
    invoiceNo: "#INV-0798",
    patientName: "Sneha Reddy",
    amount: 1500,
    mode: "UPI",
    cashier: "Rahul K.",
    action: "Print",
  },
  {
    id: "6",
    receiptNo: "#RCT-0416",
    date: "11 Dec, 09:30 AM",
    invoiceNo: "#INV-0785",
    patientName: "Vinod Sharma",
    amount: 5000,
    mode: "Cash",
    cashier: "Anjali S.",
    action: "Print",
  },
];

const HEADER_SX = {
  fontWeight: 700,
  textTransform: "uppercase" as const,
  fontSize: "0.68rem",
  letterSpacing: "0.08em",
  color: "text.secondary",
  py: 1.8,
  px: 2,
  borderBottom: "1px solid",
  borderColor: "rgba(17, 114, 186, 0.12)",
  bgcolor: alpha(palette.primary.main, 0.03),
  whiteSpace: "nowrap" as const,
};

const BILLING_MODULE_STORAGE_KEY =
  "scanbo.hims.ipd.billing-medication.module.v1";

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
  paymentsByPatient: Record<string, BillingPaymentRow[]>;
}

export default function PaymentReceiptsPage() {
  const router = useRouter();
  const theme = useTheme();
  const [modeFilter, setModeFilter] = React.useState("All Payment Modes");
  const [moduleState, setModuleState] =
    React.useState<BillingModulePersistedState | null>(null);

  const refreshData = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      /**
       * FUTURE API INTEGRATION:
       * TODO: Replace sessionStorage with actual backend API call.
       * Example:
       * const response = await axios.get('/api/billing/payment-receipts');
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

  const handleAction = (row: any) => {
    const match = row.patientName.match(/\(([^)]+)\)/);
    const mrn = match ? match[1] : "HIMS-00189";
    router.push(`/ipd/charges?tab=payments&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedPayments = React.useMemo(() => {
    const list = [...MOCK_DATA];
    if (moduleState?.paymentsByPatient) {
      Object.entries(moduleState.paymentsByPatient).forEach(
        ([patientId, payments]) => {
          payments.forEach((pay) => {
            if (!list.some((p) => p.id === pay.id)) {
              list.push({
                id: pay.id,
                receiptNo: `#RCT-${pay.id.split("-").pop()?.toUpperCase() ?? pay.id}`,
                date: pay.dateTime,
                invoiceNo: pay.invoiceId,
                patientName: `Patient (${patientId})`,
                amount: pay.amount,
                mode: pay.mode as any,
                cashier: "Front Desk",
                action: "Print",
              });
            }
          });
        },
      );
    }
    return list;
  }, [moduleState]);

  const dynamicMetrics = React.useMemo(() => {
    const totalCollection = mergedPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const upiCollection = mergedPayments
      .filter((p) => p.mode === "UPI")
      .reduce((sum, p) => sum + p.amount, 0);

    return [
      {
        label: "TODAY'S COLLECTION",
        value: `₹${totalCollection.toLocaleString()}`,
        tone: "success",
        icon: <RevenueIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "RECEIPTS GENERATED",
        value: mergedPayments.length.toString(),
        tone: "primary",
        icon: <ReceiptIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "UPI PAYMENTS",
        value: `₹${upiCollection.toLocaleString()}`,
        tone: "primary",
        icon: <WalletIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "CASHIER ON DUTY",
        value: "3",
        tone: "primary",
        icon: <CashierIcon sx={{ fontSize: 24 }} />,
      },
    ];
  }, [mergedPayments]);

  const filteredData = React.useMemo(() => {
    let data = mergedPayments;
    if (modeFilter !== "All Payment Modes") {
      data = data.filter(
        (item) => item.mode.toLowerCase() === modeFilter.toLowerCase(),
      );
    }
    return data;
  }, [mergedPayments, modeFilter]);

  const receiptColumns = React.useMemo<CommonColumn<PaymentReceipt>[]>(
    () => [
      {
        field: "receiptNo",
        headerName: "RECEIPT #",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.85rem" }}
          >
            {row.receiptNo}
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: "DATE",
        width: 150,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {row.date}
          </Typography>
        ),
      },
      {
        field: "invoiceNo",
        headerName: "INVOICE #",
        width: 130,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {row.invoiceNo}
          </Typography>
        ),
      },
      {
        field: "patientName",
        headerName: "PATIENT",
        width: 250,
        renderCell: (row) => (
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              {row.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {row.patientName}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "amount",
        headerName: "AMOUNT",
        width: 120,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: "success.main",
              fontSize: "0.9rem",
              letterSpacing: "-0.01em",
            }}
          >
            ₹{row.amount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "mode",
        headerName: "MODE",
        width: 120,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            {row.mode}
          </Typography>
        ),
      },
      {
        field: "cashier",
        headerName: "CASHIER",
        width: 150,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {row.cashier}
          </Typography>
        ),
      },
      {
        field: "action",
        headerName: "ACTION",
        align: "center",
        width: 130,
        renderCell: (row) => (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon sx={{ fontSize: "14px !important" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(row);
            }}
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 2,
              py: 0.5,
              minWidth: 80,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            {row.action}
          </Button>
        ),
      },
    ],
    [theme, handleAction],
  );

  return (
    <PageTemplate
      title="Payment Receipts"
      subtitle="Track and manage all payment transactions"
      currentPageTitle="Payment Receipts"
    >
      <Stack spacing={1.25}>
        {/* Header Card */}
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
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
                Receipt Control Tower
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
              >
                Access all generated payment receipts, track collections and
                manage cashier records.
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
                  border: "1.5px solid",
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                Full Report
              </Button>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(17, 114, 186, 0.25)",
                }}
              >
                New Receipt
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        {/* Stats Strip */}
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

        {/* Table Section */}
        <Box sx={{ mt: 2 }}>
          <CommonDataGrid<PaymentReceipt>
            rows={filteredData}
            columns={receiptColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search receipt #, patient, or invoice..."
            searchFields={["receiptNo", "patientName", "invoiceNo"]}
            filterDropdowns={[
              {
                id: "modeFilter",
                placeholder: "All Payment Modes",
                value: modeFilter,
                options: [
                  "All Payment Modes",
                  "Cash",
                  "UPI",
                  "Card",
                  "Insurance",
                ],
                onChange: (val) => setModeFilter(val),
              },
            ]}
            toolbarRight={
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <FilterIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <PrintIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </IconButton>
              </Stack>
            }
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
