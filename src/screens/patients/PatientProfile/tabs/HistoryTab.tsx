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

interface HistoryTabProps {
  data: PatientProfileData;
}

export function HistoryTab({ data }: HistoryTabProps) {
  const {
    activeTab,
    tabHeaderSx,
    timelineAppointments,
    theme,
    lightBorder,
    encounters,
    patient,
  } = data;
  return (
    <TabPanel value={activeTab} tab="history">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <HistoryIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Encounter Timeline
        </Typography>
      </Stack>
      {timelineAppointments.length ? (
        <Box
          sx={{
            position: "relative",
            pl: 4,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 16,
              top: 6,
              bottom: 6,
              width: 2,
              backgroundColor: alpha(theme.palette.text.primary, 0.08),
            },
          }}
        >
          <Stack spacing={2}>
            {timelineAppointments.map((appointment) => (
              <Box key={appointment.id} sx={{ position: "relative", pl: 1 }}>
                <Box
                  sx={{
                    position: "absolute",
                    left: -24,
                    top: 20,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "background.paper",
                    border: "3px solid",
                    borderColor: theme.palette.primary.main,
                  }}
                />
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.text.primary, 0.02),
                    border: lightBorder,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {appointment.visitType} · {appointment.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatLongDate(appointment.date)}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {appointment.chiefComplaint || "Clinical encounter logged."}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary">
                      Provider: {appointment.provider}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Department: {appointment.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {appointment.visitType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {appointment.status}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No encounters recorded for this patient yet.
        </Typography>
      )}
    </TabPanel>
  );
}
