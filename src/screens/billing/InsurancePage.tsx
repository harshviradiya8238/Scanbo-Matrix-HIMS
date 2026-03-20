"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
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
import { palette } from "@/src/core/theme/tokens";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Shield as InsuranceIcon,
  AccountBalance as SettlementIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApprovedIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface InsuranceClaim {
  id: string;
  claimNo: string;
  patientName: string;
  uhid: string;
  tpa: string;
  billAmount: number;
  approvedAmount: number;
  status: "Approved" | "Processing" | "Denied" | "Settled";
  admissionDate: string;
}

const MOCK_DATA: InsuranceClaim[] = [
  {
    id: "1",
    claimNo: "#CLM-7701",
    patientName: "Dr. Ananya Iyer",
    uhid: "HIMS-00891",
    tpa: "Star Health",
    billAmount: 125000,
    approvedAmount: 110000,
    status: "Approved",
    admissionDate: "12 Dec, 2024",
  },
  {
    id: "2",
    claimNo: "#CLM-7692",
    patientName: "Vikram Malhotra",
    uhid: "HIMS-00442",
    tpa: "HDFC ERGO",
    billAmount: 45000,
    approvedAmount: 0,
    status: "Processing",
    admissionDate: "13 Dec, 2024",
  },
  {
    id: "3",
    claimNo: "#CLM-7685",
    patientName: "Sonia Gandhi",
    uhid: "HIMS-00129",
    tpa: "Star Health",
    billAmount: 89000,
    approvedAmount: 89000,
    status: "Settled",
    admissionDate: "10 Dec, 2024",
  },
  {
    id: "4",
    claimNo: "#CLM-7670",
    patientName: "Zoya Akhtar",
    uhid: "HIMS-00998",
    tpa: "Niva Bupa",
    billAmount: 12000,
    approvedAmount: 0,
    status: "Denied",
    admissionDate: "08 Dec, 2024",
  },
  {
    id: "5",
    claimNo: "#CLM-7663",
    patientName: "Arjun Rampal",
    uhid: "HIMS-00765",
    tpa: "Star Health",
    billAmount: 215000,
    approvedAmount: 180000,
    status: "Approved",
    admissionDate: "11 Dec, 2024",
  },
  {
    id: "6",
    claimNo: "#CLM-7651",
    patientName: "Meera Das",
    uhid: "HIMS-00211",
    tpa: "Care Health",
    billAmount: 67000,
    approvedAmount: 0,
    status: "Processing",
    admissionDate: "12 Dec, 2024",
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

export default function InsurancePage() {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = React.useState("All Status");

  const filteredData = React.useMemo(() => {
    let data = MOCK_DATA;
    if (statusFilter !== "All Status") {
      data = data.filter(
        (item) => item.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return data;
  }, [statusFilter]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Settled":
        return {
          bg: "#ECFDF5",
          color: "#059669",
          border: "#10B98133",
          dot: "#10B981",
        };
      case "Approved":
        return {
          bg: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          border: alpha(theme.palette.primary.main, 0.2),
          dot: theme.palette.primary.main,
        };
      case "Processing":
        return {
          bg: "#FFFBEB",
          color: "#D97706",
          border: "#F59E0B33",
          dot: "#F59E0B",
        };
      case "Denied":
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

  const columns = React.useMemo<CommonColumn<InsuranceClaim>[]>(
    () => [
      {
        field: "claimNo",
        headerName: "CLAIM #",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.85rem" }}
          >
            {row.claimNo}
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
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {row.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.uhid}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "tpa",
        headerName: "TPA / INSURANCE",
        width: 160,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            {row.tpa}
          </Typography>
        ),
      },
      {
        field: "billAmount",
        headerName: "BILL AMOUNT",
        width: 130,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.85rem" }}
          >
            ₹{row.billAmount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "approvedAmount",
        headerName: "APPROVED",
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
            ₹{row.approvedAmount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "admissionDate",
        headerName: "DATE",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {row.admissionDate}
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
            Details
          </Button>
        ),
      },
    ],
    [theme],
  );

  return (
    <PageTemplate
      title="Insurance Claims"
      subtitle="Management and tracking of insurance settlements"
      currentPageTitle="Insurance"
    >
      <Stack spacing={2}>
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
                Insurance Control Tower
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
              >
                Monitor TPA approvals, track pre-auth statuses and manage claim
                settlements.
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
                TPA Report
              </Button>
              <Button
                variant="contained"
                startIcon={<InsuranceIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(17, 114, 186, 0.25)",
                }}
              >
                New Claim
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
          <StatTile
            label="OUTSTANDING CLAIMS"
            value="₹45.2L"
            tone="primary"
            icon={<InsuranceIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="PENDING PRE-AUTH"
            value="18"
            tone="warning"
            icon={<PendingIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="SETTLED THIS MONTH"
            value="₹28.4L"
            tone="success"
            icon={<ApprovedIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="AVG. SETTLEMENT"
            value="14 Days"
            tone="primary"
            icon={<SettlementIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* Table Section */}
        <Box sx={{ mt: 2 }}>
          <CommonDataGrid<InsuranceClaim>
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search claim #, patient, or TPA..."
            searchFields={["claimNo", "patientName", "tpa", "uhid"]}
            filterDropdowns={[
              {
                id: "statusFilter",
                placeholder: "All Status",
                value: statusFilter,
                options: [
                  "All Status",
                  "Approved",
                  "Processing",
                  "Settled",
                  "Denied",
                ],
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
              </Stack>
            }
          />
        </Box>
      </Stack>
    </PageTemplate>
  );
}
