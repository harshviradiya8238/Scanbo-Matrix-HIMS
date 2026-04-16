"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useRouter } from "next/navigation";
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
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  AssignmentTurnedIn as DoneIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface IpdAdmission {
  id: string;
  admissionNo: string;
  name: string;
  himsId: string;
  room: string;
  doctor: string;
  admittedDate: string;
  days: number;
  accrued: number;
  advance: number;
  balance: number;
  status: "Insurance" | "Partial" | "Unpaid" | "Settled";
  avatarColor: string;
}

const MOCK_DATA: IpdAdmission[] = [
  {
    id: "1",
    admissionNo: "ADM-0042",
    name: "Anil Kumar",
    himsId: "HIMS-00189",
    room: "302-A",
    doctor: "Dr. Nair",
    admittedDate: "08 Dec",
    days: 5,
    accrued: 38000,
    advance: 20000,
    balance: 18000,
    status: "Insurance",
    avatarColor: "#1172BA",
  },
  {
    id: "2",
    admissionNo: "ADM-0041",
    name: "Suresh Gupta",
    himsId: "HIMS-00078",
    room: "204-B",
    doctor: "Dr. Kumar",
    admittedDate: "07 Dec",
    days: 6,
    accrued: 89500,
    advance: 50000,
    balance: 39500,
    status: "Partial",
    avatarColor: "#2E7D32",
  },
  {
    id: "3",
    admissionNo: "ADM-0035",
    name: "Ramesh Yadav",
    himsId: "HIMS-00091",
    room: "101 Deluxe",
    doctor: "Dr. Mehta",
    admittedDate: "29 Nov",
    days: 14,
    accrued: 124000,
    advance: 0,
    balance: 124000,
    status: "Unpaid",
    avatarColor: "#D32F2F",
  },
];

const BILLING_MODULE_STORAGE_KEY =
  "scanbo.hims.ipd.billing-medication.module.v1";

interface BillingInvoiceRow {
  id: string;
  date: string;
  type: "Final Bill" | "Interim Bill";
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

export default function IpdBillingPage() {
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
       * const response = await axios.get('/api/billing/ipd-admissions');
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

  const handleAction = (patient: any, actionLabel: string) => {
    let tab = "invoices";
    if (actionLabel === "Collect") {
      tab = "payments";
    }
    const mrn = patient.himsId || "HIMS-00189";
    router.push(`/ipd/charges?tab=${tab}&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedData = React.useMemo(() => {
    return MOCK_DATA.map((patient) => {
      const invoices = moduleState?.invoicesByPatient[patient.id] || [];
      const payments = moduleState?.paymentsByPatient[patient.id] || [];

      const totalAccrued = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalAdvance = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalDue = invoices.reduce((sum, inv) => sum + inv.patientDue, 0);

      // If we have real invoice data, use it to override mock data
      if (invoices.length > 0) {
        return {
          ...patient,
          accrued: totalAccrued,
          advance: totalAdvance,
          balance: totalDue,
          status:
            totalDue === 0
              ? "Settled"
              : invoices.some((i) => i.insuranceAmount > 0)
                ? "Insurance"
                : "Partial",
        } as IpdAdmission;
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
    return data;
  }, [mergedData, statusFilter]);

  const ipdColumns = React.useMemo<CommonColumn<IpdAdmission>[]>(
    () => [
      {
        field: "admissionNo",
        headerName: "ADMISSION #",
        width: 120,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {p.admissionNo}
          </Typography>
        ),
      },
      {
        field: "patient",
        headerName: "PATIENT",
        width: 250,
        renderCell: (p) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(p.avatarColor, 0.1),
                color: p.avatarColor,
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {p.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
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
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                {p.himsId}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "room",
        headerName: "ROOM",
        width: 100,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            {p.room}
          </Typography>
        ),
      },
      {
        field: "doctor",
        headerName: "DOCTOR",
        width: 130,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {p.doctor}
          </Typography>
        ),
      },
      {
        field: "admittedDate",
        headerName: "ADMITTED",
        align: "center",
        width: 100,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {p.admittedDate}
          </Typography>
        ),
      },
      {
        field: "days",
        headerName: "DAYS",
        align: "center",
        width: 80,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {p.days}
          </Typography>
        ),
      },
      {
        field: "accrued",
        headerName: "ACCRUED",
        align: "right",
        width: 110,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            ₹{p.accrued.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "advance",
        headerName: "ADVANCE",
        align: "right",
        width: 110,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "success.main" }}
          >
            ₹{p.advance.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "balance",
        headerName: "BALANCE",
        align: "right",
        width: 110,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: p.balance > 0 ? "warning.dark" : "text.primary",
            }}
          >
            ₹{p.balance.toLocaleString()}
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
                p.status === "Insurance"
                  ? theme.palette.info.main
                  : p.status === "Partial"
                    ? theme.palette.secondary.main
                    : p.status === "Unpaid"
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                0.1,
              ),
              color:
                p.status === "Insurance"
                  ? theme.palette.info.dark
                  : p.status === "Partial"
                    ? theme.palette.secondary.dark
                    : p.status === "Unpaid"
                      ? theme.palette.error.dark
                      : theme.palette.success.dark,
              border: "1px solid",
              borderColor: alpha(
                p.status === "Insurance"
                  ? theme.palette.info.main
                  : p.status === "Partial"
                    ? theme.palette.secondary.main
                    : p.status === "Unpaid"
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                0.2,
              ),
            }}
          >
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
              {p.status}
            </Typography>
          </Box>
        ),
      },
      {
        field: "action",
        headerName: "ACTION",
        align: "right",
        width: 130,
        renderCell: (p) => {
          if (p.status === "Unpaid") {
            return (
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(p, "Discharge");
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 1.5,
                  fontSize: "0.75rem",
                  px: 2,
                }}
              >
                Discharge
              </Button>
            );
          }
          if (p.status === "Partial") {
            return (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(p, "Collect");
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 1.5,
                  fontSize: "0.75rem",
                  px: 3,
                  bgcolor: "#1172BA",
                }}
              >
                Collect
              </Button>
            );
          }
          return (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(p, "Interim Bill");
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                fontSize: "0.75rem",
                px: 2,
                color: "text.secondary",
                borderColor: "divider",
              }}
            >
              Interim Bill
            </Button>
          );
        },
      },
    ],
    [theme, handleAction],
  );

  return (
    <PageTemplate
      title="IPD Billing"
      subtitle="Inpatient Revenue & Billing Management"
      currentPageTitle="IPD Billing"
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
                  IPD Billing
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Admission Accounts" />
                  <Chip size="small" color="info" variant="outlined" label="Discharge Clearance" />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Track inpatient billing, advances, balances, and discharge collections together.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => router.push("/ipd/charges?tab=payments")}
              sx={{ fontWeight: 700, px: 3, whiteSpace: "nowrap" }}
            >
              Open IPD Desk
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
            label="ADMITTED"
            value={mergedData.length.toString()}
            tone="primary"
            icon={<HospitalIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="DISCHARGED TODAY"
            value="6"
            tone="success"
            icon={<DoneIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="FINAL BILL PENDING"
            value={mergedData.filter((p) => p.balance > 0).length.toString()}
            tone="warning"
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="IPD REVENUE"
            value={`₹${(mergedData.reduce((sum, p) => sum + p.advance, 0) / 100000).toFixed(2)}L`}
            tone="primary"
            icon={<WalletIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 0 }}> */}
          <CommonDataGrid<IpdAdmission>
            rows={filteredData}
            columns={ipdColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search admission, patient, HIMS ID..."
            searchFields={["name", "himsId", "admissionNo"]}
            showSerialNo
            toolbarRight={
              <Button
                variant="text"
                size="small"
                onClick={() => setStatusFilter("All Status")}
              >
                Clear
              </Button>
            }
            filterDropdowns={[
              {
                id: "statusFilter",
                placeholder: "All Status",
                value: statusFilter,
                options: ["All Status", "Insurance", "Partial", "Unpaid"],
                onChange: (val) => setStatusFilter(val),
              },
            ]}
          />
        {/* </Card> */}
      </Stack>
    </PageTemplate>
  );
}
