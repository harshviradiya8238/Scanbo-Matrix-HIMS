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
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  AssignmentReturn as RefundIcon,
  Timer as PendingIcon,
  CheckCircle as ProcessedIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface RefundRecord {
  id: string;
  refundNo: string;
  invoiceNo: string;
  patientName: string;
  reason: string;
  amount: number;
  authBy: string;
  status: "Processed" | "Pending" | "Rejected";
  action: "Receipt" | "Approve";
}

const MOCK_DATA: RefundRecord[] = [
  {
    id: "1",
    refundNo: "#RFD-021",
    invoiceNo: "#INV-0887",
    patientName: "Kavita Singh",
    reason: "Service cancelled",
    amount: 2000,
    authBy: "Dr. Mehta",
    status: "Processed",
    action: "Receipt",
  },
  {
    id: "2",
    refundNo: "#RFD-020",
    invoiceNo: "#INV-0821",
    patientName: "Vinod Sharma",
    reason: "Advance excess",
    amount: 5000,
    authBy: "Admin",
    status: "Pending",
    action: "Approve",
  },
  {
    id: "3",
    refundNo: "#RFD-019",
    invoiceNo: "#INV-0742",
    patientName: "Amit Verma",
    reason: "Duplicate payment",
    amount: 1500,
    authBy: "Dr. Sharma",
    status: "Processed",
    action: "Receipt",
  },
  {
    id: "4",
    refundNo: "#RFD-018",
    invoiceNo: "#INV-0912",
    patientName: "Sneha Reddi",
    reason: "Order rejected",
    amount: 3200,
    authBy: "Admin",
    status: "Pending",
    action: "Approve",
  },
  {
    id: "5",
    refundNo: "#RFD-017",
    invoiceNo: "#INV-0655",
    patientName: "Priya Das",
    reason: "Overpayment",
    amount: 800,
    authBy: "Dr. Joshi",
    status: "Processed",
    action: "Receipt",
  },
  {
    id: "6",
    refundNo: "#RFD-016",
    invoiceNo: "#INV-0821",
    patientName: "Rahul Kumar",
    reason: "Admission cancelled",
    amount: 12000,
    authBy: "Admin",
    status: "Rejected",
    action: "Approve",
  },
];

const BILLING_MODULE_STORAGE_KEY =
  "scanbo.hims.ipd.billing-medication.module.v1";

interface BillingRefundRow {
  id: string;
  title: string;
  description: string;
  requestedOn: string;
  amount: number;
  status: "Under Review" | "Processed";
}

interface BillingModulePersistedState {
  version: 1;
  refundsByPatient: Record<string, BillingRefundRow[]>;
}

export default function RefundsPage() {
  const router = useRouter();
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [moduleState, setModuleState] =
    React.useState<BillingModulePersistedState | null>(null);

  const refreshData = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      /**
       * FUTURE API INTEGRATION:
       * TODO: Replace sessionStorage with actual backend API call.
       * Example:
       * const response = await axios.get('/api/billing/refunds');
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
    router.push(`/ipd/charges?tab=refunds&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedRefunds = React.useMemo(() => {
    const list = [...MOCK_DATA];
    if (moduleState?.refundsByPatient) {
      Object.entries(moduleState.refundsByPatient).forEach(
        ([patientId, refunds]) => {
          refunds.forEach((ref) => {
            if (!list.some((r) => r.id === ref.id)) {
              list.push({
                id: ref.id,
                refundNo: `#${ref.id.split("-").pop()?.toUpperCase() ?? ref.id}`,
                invoiceNo: "#INV-XXXX",
                patientName: `Patient (${patientId})`,
                reason: ref.title,
                amount: ref.amount,
                authBy: "Supervisor",
                status: ref.status === "Under Review" ? "Pending" : "Processed",
                action: ref.status === "Under Review" ? "Approve" : "Receipt",
              });
            }
          });
        },
      );
    }
    return list;
  }, [moduleState]);

  const dynamicMetrics = React.useMemo(() => {
    const totalRefunded = mergedRefunds
      .filter((r) => r.status === "Processed")
      .reduce((sum, r) => sum + r.amount, 0);
    const pendingCount = mergedRefunds.filter(
      (r) => r.status === "Pending",
    ).length;
    const processedToday = mergedRefunds.filter(
      (r) => r.status === "Processed",
    ).length; // Mocking today's count

    return [
      {
        label: "TOTAL REFUNDED",
        value: `₹${totalRefunded.toLocaleString()}`,
        tone: "primary",
        icon: <WalletIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "PENDING APPROVAL",
        value: pendingCount.toString(),
        tone: "warning",
        icon: <PendingIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "PROCESSED TODAY",
        value: processedToday.toString().padStart(2, "0"),
        tone: "success",
        icon: <ProcessedIcon sx={{ fontSize: 24 }} />,
      },
      {
        label: "AVG. REFUND TIME",
        value: "2.4 Days",
        tone: "primary",
        icon: <RefundIcon sx={{ fontSize: 24 }} />,
      },
    ];
  }, [mergedRefunds]);

  const filteredData = React.useMemo(() => {
    let data = mergedRefunds;
    if (statusFilter !== "All Status") {
      data = data.filter(
        (item) => item.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return data;
  }, [mergedRefunds, statusFilter]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Processed":
        return {
          bg: "#ECFDF5",
          color: "#059669",
          border: "#10B98133",
          dot: "#10B981",
        };
      case "Pending":
        return {
          bg: "#FFFBEB",
          color: "#D97706",
          border: "#F59E0B33",
          dot: "#F59E0B",
        };
      case "Rejected":
        return {
          bg: "#FEF2F2",
          color: "#DC2626",
          border: "#EF444433",
          dot: "#EF4444",
        };
      default:
        return {
          bg: "#F9FAFB",
          color: "#4B5563",
          border: "#E5E7EB",
          dot: "#9CA3AF",
        };
    }
  };

  const refundColumns = React.useMemo<CommonColumn<RefundRecord>[]>(
    () => [
      {
        field: "refundNo",
        headerName: "REFUND #",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.85rem" }}
          >
            {row.refundNo}
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
        field: "reason",
        headerName: "REASON",
        width: 180,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {row.reason}
          </Typography>
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
              color: "#E11D48",
              fontSize: "0.9rem",
              letterSpacing: "-0.01em",
            }}
          >
            ₹{row.amount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "authBy",
        headerName: "AUTH BY",
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
            {row.authBy}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "STATUS",
        width: 130,
        renderCell: (row) => {
          const statusStyle = getStatusStyles(row.status);
          return (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                px: 1.5,
                py: 0.4,
                borderRadius: "100px",
                bgcolor: statusStyle.bg,
                border: `1px solid ${statusStyle.border}`,
                color: statusStyle.color,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: statusStyle.dot,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  lineHeight: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {row.status}
              </Typography>
            </Box>
          );
        },
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
              color: row.action === "Approve" ? "primary.main" : "text.primary",
              bgcolor:
                row.action === "Approve"
                  ? alpha(theme.palette.primary.main, 0.05)
                  : "transparent",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
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
      title="Refunds"
      subtitle="Refund management and reconciliation"
      currentPageTitle="Refunds"
      fullHeight
    >
      <Stack
        spacing={1.25}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <WorkspaceHeaderCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
                >
                  Refunds
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Refund Desk" />
                  <Chip size="small" color="info" variant="outlined" label="Approval Queue" />
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Track, approve, and process patient refunds across all departments.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
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
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<RefundIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(17, 114, 186, 0.25)",
                }}
              >
                Initiate Refund
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
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

        {/* <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 0 }}> */}
          <CommonDataGrid<RefundRecord>
            rows={filteredData}
            columns={refundColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search refund #, patient, or invoice..."
            searchFields={["refundNo", "patientName", "invoiceNo"]}
            showSerialNo
            filterDropdowns={[
              {
                id: "statusFilter",
                placeholder: "All Status",
                value: statusFilter,
                options: ["All Status", "Processed", "Pending", "Rejected"],
                onChange: (val) => setStatusFilter(val),
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
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setStatusFilter("All Status")}
                >
                  Clear
                </Button>
              </Stack>
            }
          />
        {/* </Card> */}
      </Stack>
    </PageTemplate>
  );
}
