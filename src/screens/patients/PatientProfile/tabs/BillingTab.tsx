import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  LinearProgress,
} from "@mui/material";
import {
  CalendarMonth as CalendarMonthIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  EventNote as EventNoteIcon,
  EventAvailable as EventAvailableIcon,
  Favorite as FavoriteIcon,
  FitnessCenter as FitnessCenterIcon,
  Healing as HealingIcon,
  History as HistoryIcon,
  ImageOutlined as ImageOutlinedIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonOutline as PersonOutlineIcon,
  ReportProblem as ReportProblemIcon,
  Scale as ScaleIcon,
  Science as ScienceIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  VerifiedUser as VerifiedUserIcon,
  Vaccines as VaccinesIcon,
  WarningAmber as WarningAmberIcon,
  WaterDrop as WaterDropIcon,
  EditCalendar as EditCalendarIcon,
  CancelOutlined as CancelOutlinedIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Hotel as HotelIcon,
  Receipt as ReceiptIcon,
  BugReport as BugReportIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
  AccountBalance as AccountBalanceIcon,
  MedicalServices as MedicalServicesIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  TrendingUp as TrendingUpIcon,
  NoteAlt as NoteAltIcon,
  Security as SecurityIcon,
  Bloodtype as BloodtypeIcon,
  Add as AddIcon,
  FolderCopy as FolderCopyIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  NotificationsNone as NotificationsNoneIcon,
  ArrowForward as ArrowForwardIcon,
  Opacity as OpacityIcon,
  LocalHospital,
} from "@mui/icons-material";
import { alpha } from "@/src/ui/theme";
import Tooltip from "@mui/material/Tooltip";
import {
  InfoRow,
  Sparkline,
  TabPanel,
  getInitials,
  formatDate,
  formatLongDate,
  buildDateTime,
  formatFrequency,
  appointmentStatusTone,
} from "../utils/utils";
import { PatientProfileData } from "../hooks/usePatientProfileData";

import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface BillingTabProps {
  data: PatientProfileData;
}

export function BillingTab({ data }: BillingTabProps) {
  const {
    activeTab,
    tabHeaderSx,
    totalBilled,
    theme,
    totalPaid,
    balanceDue,
    lightBorder,
    billingInvoices,
  } = data;

  const columns: CommonColumn<any>[] = [
    {
      field: "id",
      headerName: "Invoice #",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
          {row.id}
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 130,
      renderCell: (row) => (
        <Typography variant="body2">{formatDate(row.date)}</Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 130,
      align: "right",
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{row.amount.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      align: "center",
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.status}
          sx={{
            fontWeight: 600,
            bgcolor:
              row.status === "Paid"
                ? alpha(theme.palette.success.main, 0.12)
                : row.status === "Overdue"
                  ? alpha(theme.palette.error.main, 0.12)
                  : alpha(theme.palette.warning.main, 0.12),
            color:
              row.status === "Paid"
                ? "success.dark"
                : row.status === "Overdue"
                  ? "error.dark"
                  : "warning.dark",
          }}
        />
      ),
    },
  ];

  return (
    <TabPanel value={activeTab} tab="billing">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <ReceiptIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Billing & Invoices
        </Typography>
      </Stack>
      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        {[
          {
            label: "Total Billed",
            value: `₹${totalBilled.toLocaleString()}`,
            color: theme.palette.primary.main,
          },
          {
            label: "Total Paid",
            value: `₹${totalPaid.toLocaleString()}`,
            color: theme.palette.success.main,
          },
          {
            label: "Balance Due",
            value: `₹${balanceDue.toLocaleString()}`,
            color:
              balanceDue > 0
                ? theme.palette.error.main
                : theme.palette.success.main,
          },
        ].map((card) => (
          <Box
            key={card.label}
            sx={{
              p: 2,
              borderRadius: 2,
              border: lightBorder,
              background: alpha(card.color, 0.06),
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {card.label}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: card.color }}
            >
              {card.value}
            </Typography>
          </Box>
        ))}
      </Box>
      {/* Invoice Table */}
      <Box sx={{ flex: 1, minHeight: 400 }}>
        <CommonDataGrid
          rows={billingInvoices}
          columns={columns}
          getRowId={(row) => row.id}
          showSerialNo
        />
      </Box>
    </TabPanel>
  );
}

