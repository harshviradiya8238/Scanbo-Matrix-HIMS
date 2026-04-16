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

interface MedicationsTabProps {
  data: PatientProfileData;
}

export function MedicationsTab({ data }: MedicationsTabProps) {
  const { activeTab, tabHeaderSx, medicationTableRows, theme } = data;

  const columns: CommonColumn<any>[] = [
    {
      field: "name",
      headerName: "Medication",
      width: 250,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.subtitle}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "dosage",
      headerName: "Dosage & Frequency",
      width: 200,
    },
    {
      field: "prescriber",
      headerName: "Prescriber",
      width: 180,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2">{formatLongDate(row.startDate)}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor:
              row.status === "Active"
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.text.primary, 0.08),
            color:
              row.status === "Active"
                ? theme.palette.success.main
                : theme.palette.text.secondary,
          }}
        />
      ),
    },
    {
      field: "refills",
      headerName: "Refills",
      width: 130,
    },
  ];

  return (
    <TabPanel value={activeTab} tab="medications">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <LocalPharmacyIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Medications
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 400 }}>
        <CommonDataGrid
          rows={medicationTableRows}
          columns={columns}
          getRowId={(row) => row.name}
          showSerialNo
        />
      </Box>
    </TabPanel>
  );
}

