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

interface LabsTabProps {
  data: PatientProfileData;
}

export function LabsTab({ data }: LabsTabProps) {
  const { activeTab, tabHeaderSx, labResults, lightBorder, theme } = data;
  return (
    <TabPanel value={activeTab} tab="labs">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <ScienceIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Lab Results
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {labResults.map((category: any) => (
          <Box
            key={category.category}
            sx={{
              p: 2,
              borderRadius: 2,
              border: lightBorder,
              backgroundColor: alpha(theme.palette.text.primary, 0.02),
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <ScienceIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {category.category}
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {category.results.map((result: any) => (
                <Box
                  key={result.test}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "2fr 1fr 1fr auto",
                    },
                    gap: 1,
                    alignItems: "center",
                    p: 1.2,
                    borderRadius: 1.5,
                    border: lightBorder,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {result.test}
                  </Typography>
                  <Typography variant="body2">{result.value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Range {result.range}
                  </Typography>
                  <Chip
                    label={result.status}
                    size="small"
                    color={result.status === "Normal" ? "success" : "warning"}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </TabPanel>
  );
}

