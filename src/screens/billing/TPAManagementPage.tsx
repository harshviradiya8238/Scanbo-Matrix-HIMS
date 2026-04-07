"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
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
  Business as TpaIcon,
  AddBusiness as AddIcon,
  ContactPhone as ContactIcon,
  CreditCard as LimitIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface TPARecord {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  activeClaims: number;
  settledAmount: string;
  status: "Active" | "Inactive";
}

const MOCK_DATA: TPARecord[] = [
  {
    id: "1",
    name: "Star Health & Allied Insurance",
    code: "STAR-IND-01",
    contactPerson: "Rajesh Khanna",
    phone: "+91 98765 43210",
    activeClaims: 42,
    settledAmount: "₹1.2 Cr",
    status: "Active",
  },
  {
    id: "2",
    name: "HDFC ERGO General Insurance",
    code: "HDFC-IND-02",
    contactPerson: "Meena Gupta",
    phone: "+91 87654 32109",
    activeClaims: 28,
    settledAmount: "₹85.4L",
    status: "Active",
  },
  {
    id: "3",
    name: "Niva Bupa Health Insurance",
    code: "NIVA-IND-03",
    contactPerson: "Suresh Prabhu",
    phone: "+91 99887 76655",
    activeClaims: 15,
    settledAmount: "₹42.1L",
    status: "Active",
  },
  {
    id: "4",
    name: "Care Health Insurance",
    code: "CARE-IND-04",
    contactPerson: "Anjali Saxena",
    phone: "+91 77665 54433",
    activeClaims: 22,
    settledAmount: "₹68.9L",
    status: "Active",
  },
  {
    id: "5",
    name: "ICICI Lombard",
    code: "ICICI-IND-05",
    contactPerson: "Amitabh Shah",
    phone: "+91 66554 43322",
    activeClaims: 0,
    settledAmount: "₹12.5L",
    status: "Inactive",
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

export default function TPAManagementPage() {
  const theme = useTheme();

  const columns = React.useMemo<CommonColumn<TPARecord>[]>(
    () => [
      {
        field: "name",
        headerName: "PARTNER NAME",
        width: 280,
        renderCell: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TpaIcon sx={{ color: "primary.main", fontSize: 20 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "0.85rem",
              }}
            >
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "code",
        headerName: "CODE",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              color: "text.secondary",
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              px: 1,
              py: 0.3,
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            {row.code}
          </Typography>
        ),
      },
      {
        field: "contactPerson",
        headerName: "CONTACT PERSON",
        width: 180,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontSize: "0.85rem", color: "text.primary", fontWeight: 500 }}
          >
            {row.contactPerson}
          </Typography>
        ),
      },
      {
        field: "phone",
        headerName: "PHONE",
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
            {row.phone}
          </Typography>
        ),
      },
      {
        field: "activeClaims",
        headerName: "ACTIVE CLAIMS",
        align: "center",
        width: 130,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.85rem" }}
          >
            {row.activeClaims}
          </Typography>
        ),
      },
      {
        field: "settledAmount",
        headerName: "TOTAL SETTLED",
        width: 140,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.85rem" }}
          >
            {row.settledAmount}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "STATUS",
        width: 120,
        renderCell: (row) => (
          <Chip
            label={row.status}
            size="small"
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 22,
              bgcolor: row.status === "Active" ? "#ECFDF5" : "#F3F4F6",
              color: row.status === "Active" ? "#059669" : "#4B5563",
              border: "1px solid",
              borderColor: row.status === "Active" ? "#10B98133" : "#E5E7EB",
            }}
          />
        ),
      },
      {
        field: "action",
        headerName: "ACTION",
        align: "center",
        width: 110,
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
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Manage
          </Button>
        ),
      },
    ],
    [theme],
  );

  return (
    <PageTemplate
      title="TPA Management"
      subtitle="Corporate and TPA partner profile management"
      currentPageTitle="TPAs"
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
                TPA Explorer
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
              >
                Configure insurance partners, manage TPA contracts, and track
                settlement performance.
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
                Partnership List
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(17, 114, 186, 0.25)",
                }}
              >
                Add Partner
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
            label="ASSOCIATED TPAs"
            value="12"
            tone="primary"
            icon={<TpaIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="ACTIVE CONTRACTS"
            value="08"
            tone="success"
            icon={<AddIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="AVG. CREDIT LIMIT"
            value="₹2.5L"
            tone="info"
            icon={<LimitIcon sx={{ fontSize: 24 }} />}
          />
          <StatTile
            label="HELPDESK TICKETS"
            value="05"
            tone="warning"
            icon={<ContactIcon sx={{ fontSize: 24 }} />}
          />
        </Box>

        {/* Table Section */}
        <Box sx={{ mt: 2 }}>
          <CommonDataGrid<TPARecord>
            rows={MOCK_DATA}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search by TPA name, code, or contact..."
            searchFields={["name", "code", "contactPerson"]}
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
