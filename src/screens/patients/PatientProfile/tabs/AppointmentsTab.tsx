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

interface AppointmentsTabProps {
  data: PatientProfileData;
}

export function AppointmentsTab({ data }: AppointmentsTabProps) {
  const {
    activeTab,
    appointments,
    tabHeaderSx,
    timelineAppointments,
    lightBorder,
    theme,
    handleReschedule,
    handleCancelAppointment,
  } = data;
  return (
    <TabPanel value={activeTab} tab="appointments">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <EventNoteIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Appointments
        </Typography>
      </Stack>
      <Stack spacing={1.5}>
        {timelineAppointments.length ? (
          timelineAppointments.map((appointment) => (
            <Box
              key={appointment.id}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "96px 1fr",
                  md: "96px 1fr 220px",
                },
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: lightBorder,
                position: "relative",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 4,
                  height: "100%",
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: 30,
                    color: theme.palette.primary.main,
                  }}
                >
                  {new Date(appointment.date).getDate()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {appointment.chiefComplaint?.trim() || appointment.department}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {appointment.time}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <LocationOnIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.department} · {appointment.provider}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    size="small"
                    variant="outlined"
                    color={appointmentStatusTone[appointment.status]}
                  />
                </Stack>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{
                  xs: "flex-start",
                  md: "flex-end",
                }}
                sx={{
                  minWidth: 0,
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<EditCalendarIcon fontSize="small" />}
                  onClick={() => handleReschedule(appointment)}
                  disabled={appointment.status === "Cancelled"}
                  sx={{
                    minWidth: 130,
                    height: 36,
                    borderRadius: 999,
                    fontWeight: 600,
                    px: 2.4,
                    boxShadow: "none",
                  }}
                >
                  Reschedule
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelOutlinedIcon fontSize="small" />}
                  onClick={() => handleCancelAppointment(appointment)}
                  disabled={appointment.status === "Cancelled"}
                  sx={{
                    minWidth: 110,
                    height: 36,
                    borderRadius: 999,
                    borderColor: alpha(theme.palette.error.main, 0.45),
                    color: theme.palette.error.main,
                    fontWeight: 600,
                    px: 2.2,
                    "&:hover": {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No appointments scheduled yet.
          </Typography>
        )}
      </Stack>
    </TabPanel>
  );
}
