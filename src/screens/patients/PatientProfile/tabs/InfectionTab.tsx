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

interface InfectionTabProps {
  data: PatientProfileData;
}

export function InfectionTab({ data }: InfectionTabProps) {
  const {
    activeTab,
    tabHeaderSx,
    infectionCases,
    theme,
    lightBorder,
    router,
    patient,
  } = data;
  return (
    <TabPanel value={activeTab} tab="infection">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <BugReportIcon fontSize="small" color="error" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Infection Control
        </Typography>
      </Stack>

      {infectionCases.length > 0 ? (
        <Stack spacing={2.5}>
          {infectionCases.map((c: any) => (
            <Box
              key={c.id}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                bgcolor: alpha(theme.palette.error.main, 0.02),
                borderLeft: `6px solid ${theme.palette.error.main}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Isolation Type Banner */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "error.main",
                  color: "white",
                  px: 2,
                  py: 0.5,
                  borderBottomLeftRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SecurityIcon sx={{ fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {c.isolationType} Isolation Required
                </Typography>
              </Box>

              <Stack spacing={2}>
                {/* Main Organism Info */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: "error.main",
                    }}
                  >
                    <BugReportIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "error.dark",
                        lineHeight: 1.2,
                      }}
                    >
                      {c.organism} Detected
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Case ID: {c.id} · {c.status} Case
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderStyle: "dashed", opacity: 0.6 }} />

                {/* Details Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {c.unit} · Bed {c.bed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      IC Status
                    </Typography>
                    <Chip
                      label={c.icStatus}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: "warning.dark",
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Risk Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color:
                          c.risk === "High" ? "error.main" : "warning.dark",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {c.risk} Risk
                    </Typography>
                  </Box>
                </Box>

                {c.notes && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.text.primary, 0.03),
                      border: lightBorder,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "text.secondary",
                      }}
                    >
                      "{c.notes}"
                    </Typography>
                  </Box>
                )}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-end"
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {c.flaggedOn
                        ? `Flagged on ${c.flaggedOn} by ${c.flaggedBy ?? "System"}`
                        : `Updated ${c.lastUpdate}`}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                    onClick={() =>
                      router.push("/clinical/modules/bugsy-infection-control")
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                      color: "common.white",
                      "&:hover": {
                        // boxShadow: "none",
                        // bgcolor: "error.dark",
                      },
                    }}
                  >
                    View Analysis
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            bgcolor: alpha(theme.palette.success.main, 0.04),
            textAlign: "center",
            borderLeft: `4px solid ${theme.palette.success.main}`,
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 32, color: "success.main", mb: 1 }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "success.main" }}
          >
            No Infection Flags
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This patient has no active infection control alerts or pathogen
            flags.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={() =>
              router.push("/clinical/modules/bugsy-infection-control")
            }
          >
            Open Infection Control
          </Button>
        </Box>
      )}
    </TabPanel>
  );
}
