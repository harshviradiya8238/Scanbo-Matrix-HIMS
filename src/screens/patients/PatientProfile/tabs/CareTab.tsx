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
import { StatTile } from "@/src/ui/components/molecules";

interface CareTabProps {
  data: PatientProfileData;
}

export function CareTab({ data }: CareTabProps) {
  const {
    activeTab,
    tabHeaderSx,
    careCompanion,
    theme,
    patient,
    router,
    lightBorder,
  } = data;
  return (
    <TabPanel value={activeTab} tab="care">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <FavoriteIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Care Companion
        </Typography>
      </Stack>

      {!careCompanion ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            textAlign: "center",
          }}
        >
          <FavoriteIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Not Enrolled in Care Companion
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2.5, maxWidth: 450, mx: "auto" }}
          >
            This patient is not enrolled in post-discharge care monitoring.
            Enroll from the Care Companion module to track vitals, adherence,
            and care goals.
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => router.push("/clinical/modules/care-companion")}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Open Care Companion
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Program Header Card */}
          <Card
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <VerifiedUserIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {careCompanion.program} Program
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enrolled: {careCompanion.enrolledDate || "N/A"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    careCompanion.status === "high_risk"
                      ? "High Risk"
                      : careCompanion.status === "watch"
                        ? "Watch"
                        : careCompanion.status === "closed"
                          ? "Closed"
                          : "Stable"
                  }
                  size="small"
                  sx={{
                    fontWeight: 700,
                    px: 1,
                    bgcolor:
                      careCompanion.status === "high_risk"
                        ? alpha(theme.palette.error.main, 0.12)
                        : careCompanion.status === "watch"
                          ? alpha(theme.palette.warning.main, 0.12)
                          : careCompanion.status === "closed"
                            ? alpha(theme.palette.text.secondary, 0.12)
                            : alpha(theme.palette.success.main, 0.12),
                    color:
                      careCompanion.status === "high_risk"
                        ? "error.main"
                        : careCompanion.status === "watch"
                          ? "warning.dark"
                          : careCompanion.status === "closed"
                            ? "text.secondary"
                            : "success.dark",
                  }}
                />
                {careCompanion.platforms?.length > 0 && (
                  <Chip
                    label={careCompanion.platforms[0]}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderStyle: "dashed" }}
                  />
                )}
              </Stack>
            </Stack>
          </Card>

          {/* Vitals Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {careCompanion.bp && (
              <StatTile
                label="Blood Pressure"
                value={careCompanion.bp}
                subtitle={careCompanion.bpAlert ? "Above Range" : "Stable"}
                icon={<WaterDropIcon fontSize="small" />}
                variant="soft"
                sx={{
                  bgcolor: careCompanion.bpAlert
                    ? alpha(theme.palette.error.main, 0.08)
                    : alpha(theme.palette.success.main, 0.08),
                  color: careCompanion.bpAlert ? "error.main" : "success.dark",
                }}
              />
            )}
            {careCompanion.glucose && (
              <StatTile
                label="Glucose Level"
                value={`${careCompanion.glucose} mg/dL`}
                subtitle={
                  careCompanion.glucoseAlert ? "Critical Value" : "Normal"
                }
                icon={<ScienceIcon fontSize="small" />}
                variant="soft"
                sx={{
                  bgcolor: careCompanion.glucoseAlert
                    ? alpha(theme.palette.error.main, 0.08)
                    : alpha(theme.palette.success.main, 0.08),
                  color: careCompanion.glucoseAlert
                    ? "error.main"
                    : "success.dark",
                }}
              />
            )}
            <StatTile
              label="Program Adherence"
              value={`${careCompanion.adherence}%`}
              subtitle={`Last check-in: ${careCompanion.lastCheckIn}`}
              icon={<EventAvailableIcon fontSize="small" />}
              variant="soft"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            />
          </Box>

          {/* Main Content Layout */}
          <Grid container spacing={2.5}>
            {/* Left: Vital Trends & Activities */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={2.5}>
                {/* Vitals Trend */}
                {careCompanion.vitalTrend &&
                  careCompanion.vitalTrend.length > 0 && (
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <TrendingUpIcon
                          sx={{
                            color: "primary.main",
                            fontSize: 20,
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Today's Vitals Trend
                        </Typography>
                      </Stack>
                      <TableContainer
                        sx={{
                          borderRadius: 3,
                          border: lightBorder,
                          overflow: "hidden",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.04,
                                ),
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                Time
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                BP
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                HR
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                SpO₂
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                Temp
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {careCompanion.vitalTrend.map((row) => (
                              <TableRow key={row.time} hover>
                                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                  {row.time}
                                </TableCell>
                                <TableCell>{row.bp}</TableCell>
                                <TableCell>{row.hr} bpm</TableCell>
                                <TableCell>{row.spo2}</TableCell>
                                <TableCell>{row.temp}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                {/* Recent Activity Log */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <HistoryIcon sx={{ color: "primary.main", fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Recent Care Updates
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {/* Merged Activity Stream (Check-ins + Notes) would go here, 
                                    but we'll keep them separate for now but better styled */}
                    {careCompanion.recentCheckIns?.slice(0, 3).map((c, idx) => (
                      <Box
                        key={`check-${idx}`}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          borderLeft: `4px solid ${theme.palette.info.main}`,
                          bgcolor: alpha(theme.palette.info.main, 0.02),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Check-in Captured
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.date}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          BP: {c.bp} · Glucose: {c.glucose} mg/dL
                        </Typography>
                        {c.note && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "error.main",
                              mt: 1,
                              display: "block",
                              fontStyle: "italic",
                            }}
                          >
                            Note: {c.note}
                          </Typography>
                        )}
                      </Box>
                    ))}
                    {careCompanion.careNotes?.slice(0, 2).map((note, idx) => (
                      <Box
                        key={`note-${idx}`}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          borderLeft: `4px solid ${theme.palette.warning.main}`,
                          bgcolor: alpha(theme.palette.warning.main, 0.02),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Chip
                            label={note.type}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                            }}
                            color="warning"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {note.date} {note.time}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {note.note}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          — {note.nurse}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* Right: Goals & Shortcuts */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={2.5}>
                {/* Care Goals */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: lightBorder,
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <AssignmentTurnedInIcon
                      sx={{ color: "success.main", fontSize: 20 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Active Care Goals
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {careCompanion.careGoals?.map((g, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: g.done
                            ? alpha(theme.palette.success.main, 0.05)
                            : "transparent",
                          border: `1px solid ${g.done ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.divider, 0.5)}`,
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            color: g.done ? "success.main" : "text.disabled",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {g.done ? (
                            <CheckCircleIcon fontSize="small" />
                          ) : (
                            <RadioButtonCheckedIcon fontSize="small" />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: g.done ? "text.secondary" : "text.primary",
                            textDecoration: g.done ? "line-through" : "none",
                          }}
                        >
                          {g.goal}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Quick Action Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    textAlign: "center",
                  }}
                >
                  <NoteAltIcon
                    sx={{
                      fontSize: 32,
                      color: "primary.main",
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    Need to update care plan?
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 2 }}
                  >
                    Access the full Care Companion dashboard for more detailed
                    analysis and configuration.
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    onClick={() =>
                      router.push("/clinical/modules/care-companion")
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    View Detailed Board
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      )}
    </TabPanel>
  );
}
