"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  FilterList as FilterIcon,
  ReceiptLong as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingDown as PendingIcon,
  AssignmentReturn as RefundIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface Transaction {
  id: string;
  time: string;
  type: "Receipt" | "Claim" | "Refund";
  invoiceNo: string;
  patientName: string;
  mode: string;
  dept: string;
  amount: number;
  status: "Paid" | "Submitted" | "Processed";
}

const MOCK_DATA: Transaction[] = [
  {
    id: "1",
    time: "02:34 PM",
    type: "Receipt",
    invoiceNo: "#INV-0891",
    patientName: "Priya Sharma",
    mode: "UPI",
    dept: "Cardiology",
    amount: 12500,
    status: "Paid",
  },
  {
    id: "2",
    time: "01:58 PM",
    type: "Claim",
    invoiceNo: "#INV-0890",
    patientName: "Anil Kumar",
    mode: "Insurance",
    dept: "Orthopedics",
    amount: 38000,
    status: "Submitted",
  },
  {
    id: "3",
    time: "11:20 AM",
    type: "Receipt",
    invoiceNo: "#INV-0887",
    patientName: "Kavita Singh",
    mode: "Cash",
    dept: "Cardiology",
    amount: 7800,
    status: "Paid",
  },
  {
    id: "4",
    time: "10:30 AM",
    type: "Refund",
    invoiceNo: "#RFD-021",
    patientName: "Kavita Singh",
    mode: "Cash",
    dept: "Admin",
    amount: -2000,
    status: "Processed",
  },
];

export default function DayBookPage() {
  const theme = useTheme();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid":
        return {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        };
      case "Submitted":
        return {
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.dark,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        };
      case "Processed":
        return {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        };
      default:
        return {
          bgcolor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
        };
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Receipt":
        return {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.dark,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        };
      case "Claim":
        return {
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.dark,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        };
      case "Refund":
        return {
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.dark,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        };
      default:
        return {};
    }
  };

  const daybookColumns = React.useMemo<CommonColumn<Transaction>[]>(
    () => [
      {
        field: "time",
        headerName: "TIME",
        width: 100,
        renderCell: (p) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {p.time}
          </Typography>
        ),
      },
      {
        field: "type",
        headerName: "TYPE",
        align: "center",
        width: 100,
        renderCell: (p) => (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              display: "inline-flex",
              ...getTypeStyles(p.type),
            }}
          >
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
              {p.type}
            </Typography>
          </Box>
        ),
      },
      {
        field: "invoiceNo",
        headerName: "INVOICE #",
        width: 130,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {p.invoiceNo}
          </Typography>
        ),
      },
      {
        field: "patientName",
        headerName: "PATIENT",
        width: 250,
        renderCell: (p) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {p.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {p.patientName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                HIMS-12345
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "mode",
        headerName: "MODE",
        width: 110,
        renderCell: (p) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {p.mode}
          </Typography>
        ),
      },
      {
        field: "dept",
        headerName: "DEPT.",
        width: 130,
        renderCell: (p) => (
          <Typography variant="body2" color="text.secondary">
            {p.dept}
          </Typography>
        ),
      },
      {
        field: "amount",
        headerName: "AMOUNT",
        align: "right",
        width: 130,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: p.amount > 0 ? "success.main" : "error.main",
            }}
          >
            {p.amount > 0
              ? `+₹${p.amount.toLocaleString()}`
              : `-₹${Math.abs(p.amount).toLocaleString()}`}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "STATUS",
        align: "center",
        width: 120,
        renderCell: (p) => (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              display: "inline-flex",
              ...getStatusStyles(p.status),
            }}
          >
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
              {p.status}
            </Typography>
          </Box>
        ),
      },
    ],
    [theme],
  );

  return (
    <PageTemplate
      title="Day Book"
      subtitle="Daily transaction reconciliation and settlement"
      currentPageTitle="Day Book"
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
                  Day Book
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Daily Ledger" />
                  <Chip size="small" color="info" variant="outlined" label="Settlement Tracking" />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Review daily receipts, claims, refunds, and reconciled collections together.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Export Report
            </Button>
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
          <StatTile
            label="TOTAL BILLED"
            value="₹3,02,800"
            tone="primary"
            icon={<ReceiptIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="COLLECTED"
            value="₹2,84,500"
            tone="success"
            icon={<WalletIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="PENDING"
            value="₹18,300"
            tone="warning"
            icon={<PendingIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="REFUNDS"
            value="₹2,000"
            tone="error"
            icon={<RefundIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 0 }}> */}
          <CommonDataGrid<Transaction>
            rows={MOCK_DATA}
            showSerialNo
            columns={daybookColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search transaction..."
            searchFields={["patientName", "invoiceNo"]}
            toolbarRight={
              <Button variant="text" size="small">
                Clear
              </Button>
            }
          />
        {/* </Card> */}
      </Stack>
    </PageTemplate>
  );
}
