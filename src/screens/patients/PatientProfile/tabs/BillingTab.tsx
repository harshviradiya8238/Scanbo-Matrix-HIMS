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
      <TableContainer
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: lightBorder,
          overflowX: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.72rem",
                letterSpacing: "0.05em",
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: "text.secondary",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billingInvoices.map((inv) => (
              <TableRow
                key={inv.id}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.text.primary, 0.02),
                  },
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {inv.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(inv.date)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{inv.description}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{inv.amount.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={inv.status}
                    sx={{
                      fontWeight: 600,
                      bgcolor:
                        inv.status === "Paid"
                          ? alpha(theme.palette.success.main, 0.12)
                          : inv.status === "Overdue"
                            ? alpha(theme.palette.error.main, 0.12)
                            : alpha(theme.palette.warning.main, 0.12),
                      color:
                        inv.status === "Paid"
                          ? "success.dark"
                          : inv.status === "Overdue"
                            ? "error.dark"
                            : "warning.dark",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </TabPanel>
  );
}
