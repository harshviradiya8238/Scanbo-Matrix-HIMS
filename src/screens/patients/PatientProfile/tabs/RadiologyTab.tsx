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

interface RadiologyTabProps {
  data: PatientProfileData;
}

export function RadiologyTab({ data }: RadiologyTabProps) {
  const { activeTab, tabHeaderSx, radiologyOrders, theme } = data;

  const columns: CommonColumn<any>[] = [
    {
      field: "test",
      headerName: "Test",
      width: 250,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.test}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.id}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "modality",
      headerName: "Modality",
      width: 130,
    },
    {
      field: "orderedBy",
      headerName: "Ordered By",
      width: 180,
    },
    {
      field: "orderedOn",
      headerName: "Date",
      width: 130,
      renderCell: (row) => (
        <Typography variant="body2">{formatDate(row.orderedOn)}</Typography>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      align: "center",
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.priority}
          sx={{
            fontWeight: 600,
            bgcolor:
              row.priority === "Urgent"
                ? alpha(theme.palette.error.main, 0.12)
                : alpha(theme.palette.info.main, 0.1),
            color: row.priority === "Urgent" ? "error.dark" : "info.dark",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      align: "center",
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.status}
          sx={{
            fontWeight: 600,
            bgcolor:
              row.status === "Completed"
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.warning.main, 0.12),
            color: row.status === "Completed" ? "success.dark" : "warning.dark",
          }}
        />
      ),
    },
    {
      field: "reportUrl",
      headerName: "Report",
      width: 130,
      align: "center",
      renderCell: (row) =>
        row.reportUrl ? (
          <Button
            size="small"
            variant="outlined"
            href={row.reportUrl}
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              textTransform: "none",
              px: 1.5,
            }}
          >
            View
          </Button>
        ) : (
          <Chip
            size="small"
            label="Awaiting"
            variant="outlined"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        ),
    },
  ];

  return (
    <TabPanel value={activeTab} tab="radiology">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <RadioButtonCheckedIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Radiology Orders
        </Typography>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Pending Banner */}
        {radiologyOrders.filter((r: any) => r.status === "Pending").length >
          0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WarningAmberIcon sx={{ color: "warning.main", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "warning.dark" }}
              >
                {
                  radiologyOrders.filter((r: any) => r.status === "Pending")
                    .length
                }{" "}
                radiology report(s) pending. Please follow up.
              </Typography>
            </Box>
          )}

        <Box sx={{ flex: 1, minHeight: 400 }}>
          <CommonDataGrid
            rows={radiologyOrders}
            columns={columns}
            getRowId={(row) => row.id}
            showSerialNo
          />
        </Box>
      </Stack>
    </TabPanel>
  );
}

