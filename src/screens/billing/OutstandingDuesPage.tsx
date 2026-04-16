"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
  Chip,
} from "@/src/ui/components/atoms";
import { Card, StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  ReceiptLong as InvoiceIcon,
  History as OverdueIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
  NotificationsActive as ReminderIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface OutstandingDue {
  id: string;
  invoiceNo: string;
  patientName: string;
  contact: string;
  billDate: string;
  dueAmount: number;
  overdueDays: number;
  remindersSent: number;
  avatarColor: string;
}

const MOCK_DATA: OutstandingDue[] = [
  {
    id: "1",
    invoiceNo: "#INV-0886",
    patientName: "Ramesh Yadav",
    contact: "98765-01234",
    billDate: "29 Nov",
    dueAmount: 124000,
    overdueDays: 14,
    remindersSent: 3,
    avatarColor: "#1172BA",
  },
  {
    id: "2",
    invoiceNo: "#INV-0850",
    patientName: "Geeta Mishra",
    contact: "87654-32109",
    billDate: "25 Nov",
    dueAmount: 45000,
    overdueDays: 18,
    remindersSent: 5,
    avatarColor: "#2E7D32",
  },
  {
    id: "3",
    invoiceNo: "#INV-0801",
    patientName: "Dilip Chauhan",
    contact: "99887-65432",
    billDate: "12 Nov",
    dueAmount: 89000,
    overdueDays: 31,
    remindersSent: 8,
    avatarColor: "#ED6C02",
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

interface BillingModulePersistedState {
  version: 1;
  invoicesByPatient: Record<string, BillingInvoiceRow[]>;
}

export default function OutstandingDuesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [agingFilter, setAgingFilter] = React.useState("All Time");
  const [moduleState, setModuleState] =
    React.useState<BillingModulePersistedState | null>(null);

  const refreshData = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      /**
       * FUTURE API INTEGRATION:
       * TODO: Replace sessionStorage with actual backend API call.
       * Example:
       * const response = await axios.get('/api/billing/outstanding-dues');
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

  const handlePayAction = (row: any) => {
    const mrn = row.uhid || "HIMS-00189";
    router.push(`/ipd/charges?tab=payments&mrn=${encodeURIComponent(mrn)}`);
  };

  const mergedData = React.useMemo(() => {
    const duesFromStorage: OutstandingDue[] = [];

    if (moduleState?.invoicesByPatient) {
      Object.entries(moduleState.invoicesByPatient).forEach(
        ([patientId, invoices]) => {
          invoices.forEach((inv) => {
            if (inv.patientDue > 0) {
              duesFromStorage.push({
                id: inv.id,
                invoiceNo: `#${inv.id.split("-").pop()?.toUpperCase() ?? inv.id}`,
                patientName: `Patient (${patientId})`, // We could look up the name if we had the mapping
                contact: "98765-XXXXX",
                billDate: inv.date,
                dueAmount: inv.patientDue,
                overdueDays: 0, // Calculated from date
                remindersSent: 0,
                avatarColor: "#1172BA",
              });
            }
          });
        },
      );
    }

    // Combine storage dues with mock dues, avoiding duplicates if possible
    const combined = [...MOCK_DATA];
    duesFromStorage.forEach((due) => {
      if (!combined.some((d) => d.id === due.id)) {
        combined.push(due);
      }
    });

    return combined;
  }, [moduleState]);

  const filteredData = React.useMemo(() => {
    let data = mergedData;
    if (agingFilter !== "All Time") {
      if (agingFilter === ">30") data = data.filter((d) => d.overdueDays > 30);
      else if (agingFilter === "15-30")
        data = data.filter((d) => d.overdueDays >= 15 && d.overdueDays <= 30);
      else if (agingFilter === "<15")
        data = data.filter((d) => d.overdueDays < 15);
    }
    return data;
  }, [mergedData, agingFilter]);

  const duesColumns = React.useMemo<CommonColumn<OutstandingDue>[]>(
    () => [
      {
        field: "invoiceNo",
        headerName: "INVOICE #",
        width: 140,
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
        renderCell: (p) => {
          const initials = p.patientName
            .replace("Patient (", "")
            .replace(")", "")
            .trim()
            .split(" ")
            .map((part) => part[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: alpha(
                    p.avatarColor || theme.palette.primary.main,
                    0.15,
                  ),
                  color: p.avatarColor || "primary.main",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {initials}
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
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  }}
                >
                  {p.contact}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },

      {
        field: "billDate",
        headerName: "BILL DATE",
        width: 120,
        renderCell: (p) => (
          <Typography variant="body2" color="text.secondary">
            {p.billDate}
          </Typography>
        ),
      },
      {
        field: "dueAmount",
        headerName: "DUE",
        align: "right",
        width: 130,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "error.main" }}
          >
            ₹{p.dueAmount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "overdueDays",
        headerName: "OVERDUE",
        align: "center",
        width: 140,
        renderCell: (p) => (
          <Box
            sx={{
              display: "inline-flex",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha(
                p.overdueDays > 30
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
                0.1,
              ),
              color:
                p.overdueDays > 30
                  ? theme.palette.error.dark
                  : theme.palette.warning.dark,
              border: "1px solid",
              borderColor: alpha(
                p.overdueDays > 30
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
                0.2,
              ),
            }}
          >
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
              {p.overdueDays} days
            </Typography>
          </Box>
        ),
      },
      {
        field: "remindersSent",
        headerName: "REMINDERS",
        align: "center",
        width: 110,
        renderCell: (p) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {p.remindersSent}x
          </Typography>
        ),
      },
      {
        field: "action",
        headerName: "ACTION",
        align: "right",
        width: 140,
        renderCell: (p) =>
          p.overdueDays > 30 ? (
            <Button
              size="small"
              variant="contained"
              color="error"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                fontSize: "0.75rem",
                px: 2,
              }}
            >
              Legal Notice
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handlePayAction(p);
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
          ),
      },
    ],
    [theme],
  );

  return (
    <PageTemplate
      title="Outstanding Dues"
      subtitle="Management of pending payments and aging invoices"
      currentPageTitle="Outstanding Dues"
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
                  Outstanding Dues
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="warning" label="Aging Tracker" />
                  <Chip size="small" color="info" variant="outlined" label="Collections Follow-up" />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Monitor aging invoices, reminders, and receivable collections from one table.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ReminderIcon />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Bulk Reminders
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
            label="TOTAL OUTSTANDING"
            value={`₹${(mergedData.reduce((sum, row) => sum + row.dueAmount, 0) / 100000).toFixed(1)}L`}
            tone="error"
            icon={<WalletIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="OVERDUE (>30 DAYS)"
            value={`₹${(mergedData.filter((row) => row.overdueDays > 30).reduce((sum, row) => sum + row.dueAmount, 0) / 100000).toFixed(1)}L`}
            tone="error"
            icon={<WarningIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="DUE (8-30 DAYS)"
            value={`₹${(mergedData.filter((row) => row.overdueDays >= 8 && row.overdueDays <= 30).reduce((sum, row) => sum + row.dueAmount, 0) / 100000).toFixed(1)}L`}
            tone="warning"
            icon={<OverdueIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="DUE (<7 DAYS)"
            value={`₹${(mergedData.filter((row) => row.overdueDays < 8).reduce((sum, row) => sum + row.dueAmount, 0) / 100000).toFixed(1)}L`}
            tone="warning"
            icon={<InvoiceIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 0 }}> */}
          <CommonDataGrid<OutstandingDue>
            rows={filteredData}
            columns={duesColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search invoice or patient..."
            searchFields={["patientName", "invoiceNo"]}
            showSerialNo
            toolbarRight={
              <Button
                variant="text"
                size="small"
                onClick={() => setAgingFilter("All Time")}
              >
                Clear
              </Button>
            }
            filterDropdowns={[
              {
                id: "agingFilter",
                placeholder: "All Time Aging",
                value: agingFilter,
                options: ["All Time", ">30", "15-30", "<15"],
                onChange: (val) => setAgingFilter(val),
              },
            ]}
          />
        {/* </Card> */}
      </Stack>
    </PageTemplate>
  );
}
