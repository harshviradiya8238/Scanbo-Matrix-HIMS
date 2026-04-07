"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useRouter } from "next/navigation";
import {
  Avatar,
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
  TextField,
  Typography,
  InputAdornment,
} from "@/src/ui/components/atoms";
import { StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  PendingActions as PendingIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { MenuItem, Select } from "@mui/material";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface OpdPatient {
  id: string;
  name: string;
  himsId: string;
  token: string;
  doctor: string;
  dept: string;
  time: string;
  fee: number;
  status: "Paid" | "Pending";
  avatarColor: string;
}

const MOCK_DATA: OpdPatient[] = [
  {
    id: "1",
    name: "Priya Sharma",
    himsId: "HIMS-00234",
    token: "T-001",
    doctor: "Dr. Mehta",
    dept: "Cardiology",
    time: "09:15 AM",
    fee: 800,
    status: "Paid",
    avatarColor: "#1172BA",
  },
  {
    id: "2",
    name: "Mohan Das",
    himsId: "HIMS-00891",
    token: "T-002",
    doctor: "Dr. Kumar",
    dept: "Gen. Medicine",
    time: "09:30 AM",
    fee: 500,
    status: "Paid",
    avatarColor: "#2E7D32",
  },
  {
    id: "3",
    name: "Seema Kapoor",
    himsId: "New Patient",
    token: "T-003",
    doctor: "Dr. Joshi",
    dept: "Gynecology",
    time: "10:00 AM",
    fee: 1200,
    status: "Pending",
    avatarColor: "#ED6C02",
  },
  {
    id: "4",
    name: "Rajiv Tiwari",
    himsId: "HIMS-00345",
    token: "T-004",
    doctor: "Dr. Nair",
    dept: "Orthopedics",
    time: "10:30 AM",
    fee: 800,
    status: "Pending",
    avatarColor: "#1172BA",
  },
];

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

const TABS: CommonTabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "today", label: "Today's Bills" },
  { id: "outstanding", label: "Outstanding" },
  { id: "collections", label: "Collections" },
  { id: "refunds", label: "Refunds" },
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

interface BillingModulePersistedState {
  version: 1;
  invoicesByPatient: Record<string, BillingInvoiceRow[]>;
}

export default function OpdBillingPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState("today");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [deptFilter, setDeptFilter] = React.useState("All Departments");
  const [moduleState, setModuleState] =
    React.useState<BillingModulePersistedState | null>(null);

  const refreshData = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      /**
       * FUTURE API INTEGRATION:
       * TODO: Replace sessionStorage with actual backend API call.
       * Example:
       * const response = await axios.get('/api/billing/opd-patients');
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

  const handleAction = (patient: any) => {
    const tab = patient.status === "Paid" ? "payments" : "invoices";
    const mrn = patient.himsId || "HIMS-00189";
    router.push(`/ipd/charges?tab=${tab}&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedData = React.useMemo(() => {
    return MOCK_DATA.map((patient) => {
      const invoices = moduleState?.invoicesByPatient[patient.id] || [];
      const totalDue = invoices.reduce((sum, inv) => sum + inv.patientDue, 0);
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

      if (invoices.length > 0) {
        return {
          ...patient,
          fee: totalAmount,
          status: totalDue === 0 ? "Paid" : "Pending",
        } as OpdPatient;
      }
      return patient;
    });
  }, [moduleState]);

  const filteredData = React.useMemo(() => {
    let data = mergedData;
    if (statusFilter !== "All Status") {
      data = data.filter(
        (p) => p.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (deptFilter !== "All Departments") {
      data = data.filter((p) => p.dept === deptFilter);
    }
    return data;
  }, [mergedData, statusFilter, deptFilter]);

  const opdColumns = React.useMemo<CommonColumn<OpdPatient>[]>(
    () => [
      {
        field: "patient",
        headerName: "PATIENT",
        width: 250,
        renderCell: (p) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: alpha(p.avatarColor, 0.15),
                color: p.avatarColor,
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {p.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {p.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                }}
              >
                {p.himsId}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "token",
        headerName: "TOKEN",
        align: "center",
        width: 100,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            {p.token}
          </Typography>
        ),
      },
      {
        field: "doctor",
        headerName: "DOCTOR",
        width: 150,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {p.doctor}
          </Typography>
        ),
      },
      {
        field: "dept",
        headerName: "DEPT.",
        width: 130,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {p.dept}
          </Typography>
        ),
      },
      {
        field: "time",
        headerName: "TIME",
        align: "center",
        width: 110,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {p.time}
          </Typography>
        ),
      },
      {
        field: "fee",
        headerName: "FEE",
        align: "right",
        width: 100,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            ₹{p.fee.toLocaleString()}
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
              display: "inline-flex",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha(
                p.status === "Paid"
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                0.1,
              ),
              color:
                p.status === "Paid"
                  ? theme.palette.success.dark
                  : theme.palette.warning.dark,
              border: "1px solid",
              borderColor: alpha(
                p.status === "Paid"
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                0.2,
              ),
            }}
          >
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
              {p.status}
            </Typography>
          </Box>
        ),
      },
      {
        field: "action",
        headerName: "ACTION",
        align: "right",
        width: 120,
        renderCell: (p) =>
          p.status === "Paid" ? (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(p);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                fontSize: "0.75rem",
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                px: 2,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              Receipt
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(p);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                fontSize: "0.75rem",
                px: 3,
                boxShadow: "none",
              }}
            >
              Bill
            </Button>
          ),
      },
    ],
    [theme],
  );

  return (
    <PageTemplate
      title="OPD Billing"
      subtitle="Today's OPD Revenue Management"
      currentPageTitle="OPD Billing"
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
                OPD Billing Control Tower
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Real-time tracking of outpatient billing, collections, and
                pending invoices.
              </Typography>
            </Box>
          </Stack>
        </WorkspaceHeaderCard>

        {/* Navigation Tabs */}
        {/* <CommonTabs tabs={TABS} value={activeTab} onChange={setActiveTab} /> */}

        {/* KPI Strip */}
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
            label="TODAY'S PATIENTS"
            value={mergedData.length.toString()}
            tone="primary"
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="BILLED"
            value={mergedData
              .filter((p) => p.status === "Paid")
              .length.toString()}
            tone="success"
            icon={<ReceiptIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="PENDING"
            value={mergedData
              .filter((p) => p.status === "Pending")
              .length.toString()}
            tone="warning"
            icon={<PendingIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="OPD REVENUE"
            value={`₹${mergedData
              .filter((p) => p.status === "Paid")
              .reduce((sum, p) => sum + p.fee, 0)
              .toLocaleString()}`}
            tone="primary"
            icon={<WalletIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* Patients Table Section */}
        {/* Patients Table Section */}
        <Box sx={{ mt: 2 }}>
          <CommonDataGrid<OpdPatient>
            rows={filteredData}
            columns={opdColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search patient, HIMS ID..."
            searchFields={["name", "himsId"]}
            showSerialNo
            filterDropdowns={[
              {
                id: "statusFilter",
                placeholder: "All Status",
                value: statusFilter,
                options: ["All Status", "Paid", "Pending"],
                onChange: (val) => setStatusFilter(val),
              },
              {
                id: "deptFilter",
                placeholder: "All Departments",
                value: deptFilter,
                options: [
                  "All Departments",
                  "Cardiology",
                  "Gen. Medicine",
                  "Gynecology",
                  "Orthopedics",
                ],
                onChange: (val) => setDeptFilter(val),
              },
            ]}
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
