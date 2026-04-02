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

interface VitalsTabProps {
  data: PatientProfileData;
}

export function VitalsTab({ data }: VitalsTabProps) {
  const {
    activeTab,
    theme,
    selectedVitalId,
    latestVital,
    opdEncounter,
    setSelectedVitalId,
    vitalHistory,
    vitalsPeriod,
    setVitalsPeriod,
    setVitalsView,
    vitalsView,
    vitalChartColor,
    vitalChartValues,
    chartValuesToShow,
    lightBorder,
    vitalHistorySorted,
    vitalHistPage,
    vitalRowsPerPage,
    setVitalRowsPerPage,
    setVitalHistPage,
    vitalPagedHistory,
    getVitalValue,
    readingStatus,
    VITAL_STATUS_CFG,
    VITAL_NOTES,
    formatVitalDate,
    getVitalUnit,
    vitalTotalHistPages,
  } = data;
  return (
    <TabPanel value={activeTab} tab="vitals">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          minHeight: 500,
        }}
      >
        {/* --- Sidebar --- */}
        <Box
          sx={{
            width: { xs: "100%", md: 240 },
            flexShrink: 0,
            borderRight: {
              xs: "none",
              md: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            },
            pr: { md: 2 },
          }}
        >
          <Stack spacing={1}>
            {[
              {
                id: "bp",
                label: "Blood Pressure",
                category: "Cardiovascular",
                icon: <WaterDropIcon />,
                color: theme.palette.error.main,
              },
              {
                id: "hr",
                label: "Heart Rate",
                category: "Cardiovascular",
                icon: <FavoriteIcon />,
                color: theme.palette.error.main,
              },
              {
                id: "spo2",
                label: "SpO2",
                category: "Respiratory",
                icon: <AirIcon />,
                color: theme.palette.info.main,
              },
              {
                id: "temp",
                label: "Temperature",
                category: "General",
                icon: <ThermostatIcon />,
                color: theme.palette.warning.dark,
              },
              {
                id: "BG",
                label: "Blood Glucose",
                category: "Metabolic",
                icon: <RadioButtonCheckedIcon />,
                color: theme.palette.warning.main,
              },
              {
                id: "weight",
                label: "Weight",
                category: "Anthropometric",
                icon: <ScaleIcon />,
                color: theme.palette.primary.main,
              },
              {
                id: "bmi",
                label: "BMI",
                category: "Anthropometric",
                icon: <FitnessCenterIcon />,
                color: theme.palette.warning.main,
              },
            ].map((v) => {
              const isActive = selectedVitalId === v.id;
              const latestVal =
                v.id === "bp"
                  ? latestVital?.bp
                  : v.id === "hr"
                    ? latestVital?.hr
                    : v.id === "spo2"
                      ? latestVital?.spo2
                      : v.id === "temp"
                        ? latestVital?.temp
                        : v.id === "bmi"
                          ? opdEncounter?.vitals?.bmi
                          : v.id === "weight"
                            ? opdEncounter?.vitals?.weightKg
                            : opdEncounter?.vitals?.bmi;

              return (
                <Box
                  key={v.id}
                  onClick={() => setSelectedVitalId(v.id)}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: isActive
                      ? alpha(v.color, 0.15)
                      : alpha(theme.palette.divider, 0.1),
                    bgcolor: isActive ? alpha(v.color, 0.03) : "transparent",
                    position: "relative",
                    transition: "all 0.2s",
                    height: 70,
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                      bgcolor: alpha(v.color, 0.05),
                      borderColor: alpha(v.color, 0.1),
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: v.color,
                        borderRadius: "4px 0 0 4px",
                      }}
                    />
                  )}
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ width: "100%" }}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        bgcolor: alpha(v.color, 0.1),
                        color: v.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {v.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: "0.8rem",
                          }}
                        >
                          {v.label}
                        </Typography>
                        <Chip
                          label={isActive ? "Elevated" : "Normal"}
                          size="small"
                          variant="filled"
                          sx={{
                            height: 20,
                            fontSize: "0.55rem",
                            fontWeight: 600,
                            bgcolor: alpha(
                              isActive
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                              0.08,
                            ),
                            color: isActive
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                          }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          // variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: isActive ? v.color : "text.primary",
                            fontSize: "0.7rem",
                          }}
                        >
                          {latestVal ?? "--"}
                        </Typography>
                        <TrendingUpIcon
                          sx={{
                            fontSize: 12,
                            color: alpha(theme.palette.success.main, 0.6),
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 400 }}
                        >
                          {v.category}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* --- Main Content --- */}
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={3}>
            {/* {!vitalHistory.length && (
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.info.main, 0.08),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "info.dark" }}
                            >
                              No vitals recorded yet. Showing sample trend.
                              Vitals will appear once captured during an OPD
                              encounter.
                            </Typography>
                          </Box>
                        )} */}
            {/* Header with Search/Period */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {selectedVitalId.toUpperCase().replace("_", " ")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Historical Trend & Analysis
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                {["1W", "1M", "3M", "6M", "All"].map((p) => (
                  <Button
                    key={p}
                    size="small"
                    variant={vitalsPeriod === p ? "contained" : "text"}
                    onClick={() => setVitalsPeriod(p)}
                    sx={{
                      minWidth: 40,
                      height: 32,
                      fontSize: "0.75rem",
                      borderRadius: 1.5,
                      bgcolor:
                        vitalsPeriod === p
                          ? theme.palette.primary.main
                          : "transparent",
                      color: vitalsPeriod === p ? "#fff" : "text.secondary",
                      "&:hover": {
                        bgcolor:
                          vitalsPeriod === p
                            ? theme.palette.primary.dark
                            : alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* Stats Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2,
              }}
            >
              {[
                {
                  label: "LATEST",
                  value:
                    latestVital?.[
                      selectedVitalId as keyof typeof latestVital
                    ] ?? "--",
                  sub: "Today",
                  color: theme.palette.primary.main,
                },
                {
                  label: "AVERAGE",
                  value: "135/88",
                  sub: "Last 3M",
                  color: theme.palette.info.main,
                },
                {
                  label: "MINIMUM",
                  value: "128/80",
                  sub: "Last 3M",
                  color: theme.palette.success.main,
                },
                {
                  label: "MAXIMUM",
                  value: "154/98",
                  sub: "Last 3M",
                  color: theme.palette.error.main,
                },
              ].map((stat, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(stat.color, 0.03),
                    border: `1px solid ${alpha(stat.color, 0.1)}`,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      bgcolor: alpha(stat.color, 0.05),
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: alpha(stat.color, 0.8),
                      letterSpacing: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: stat.color,
                      my: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.sub}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Control Strip */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              }}
            >
              <Button
                startIcon={<TrendingUpIcon fontSize="small" />}
                onClick={() => setVitalsView("trend")}
                sx={{
                  borderRadius: 0,
                  borderBottom: (v) =>
                    vitalsView === "trend"
                      ? `2px solid ${v.palette.primary.main}`
                      : "none",
                  color:
                    vitalsView === "trend" ? "primary.main" : "text.secondary",
                  fontWeight: vitalsView === "trend" ? 700 : 500,
                }}
              >
                Trend
              </Button>
              <Button
                startIcon={<HistoryIcon fontSize="small" />}
                onClick={() => setVitalsView("history")}
                sx={{
                  borderRadius: 0,
                  borderBottom: (v) =>
                    vitalsView === "history"
                      ? `2px solid ${v.palette.primary.main}`
                      : "none",
                  color:
                    vitalsView === "history"
                      ? "primary.main"
                      : "text.secondary",
                  fontWeight: vitalsView === "history" ? 700 : 500,
                }}
              >
                History ({vitalHistory.length})
              </Button>
            </Stack>

            {/* Content Area (Chart or Table) */}
            {vitalsView === "trend" ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.text.primary, 0.02),
                  borderRadius: 3,
                  height: 320,
                  position: "relative",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                  }}
                >
                  {vitalHistory.length} readings · Last {vitalsPeriod}
                </Typography>

                {/* Sparkline graph — always visible with real or fallback data */}
                <Box sx={{ width: "100%" }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="baseline"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: vitalChartColor,
                        lineHeight: 1,
                      }}
                    >
                      {latestVital?.[
                        selectedVitalId as keyof typeof latestVital
                      ] ??
                        (selectedVitalId === "weight"
                          ? opdEncounter?.vitals?.weightKg
                          : selectedVitalId === "bmi"
                            ? opdEncounter?.vitals?.bmi
                            : opdEncounter?.vitals?.[
                                selectedVitalId as keyof typeof opdEncounter.vitals
                              ]) ??
                        "—"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {selectedVitalId === "bp"
                        ? "mmHg"
                        : selectedVitalId === "hr" || selectedVitalId === "rr"
                          ? "bpm"
                          : selectedVitalId === "temp"
                            ? "°C"
                            : selectedVitalId === "spo2"
                              ? "%"
                              : selectedVitalId === "weight"
                                ? "kg"
                                : selectedVitalId === "bmi"
                                  ? "kg/m²"
                                  : ""}
                    </Typography>
                    {vitalChartValues.length < 2 && vitalHistory.length < 2 && (
                      <Chip
                        label="Sample trend"
                        size="small"
                        sx={{
                          ml: 1,
                          fontSize: "0.65rem",
                          height: 18,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: "info.main",
                        }}
                      />
                    )}
                  </Stack>
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 90,
                    }}
                  >
                    <Sparkline
                      values={chartValuesToShow}
                      color={vitalChartColor}
                      width={700}
                      height={90}
                      id={selectedVitalId}
                    />
                  </Box>
                  {vitalHistory.length >= 2 && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 0.5, px: 0.25 }}
                    >
                      {[...vitalHistory]
                        .sort((a, b) =>
                          a.recordedAt.localeCompare(b.recordedAt),
                        )
                        .filter(
                          (_, i, arr) =>
                            i === 0 ||
                            i === arr.length - 1 ||
                            i % Math.max(1, Math.floor(arr.length / 6)) === 0,
                        )
                        .map((r) => (
                          <Typography
                            key={r.id}
                            variant="caption"
                            sx={{
                              fontSize: "0.7rem",
                              color: "text.disabled",
                              fontWeight: 600,
                            }}
                          >
                            {r.recordedAt}
                          </Typography>
                        ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  border: lightBorder,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                {/* Toolbar: X RECORDS - SHOWING 1-10, Rows, Download */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        color: "text.secondary",
                        fontSize: 10.5,
                      }}
                    >
                      {vitalHistorySorted.length} RECORDS - SHOWING{" "}
                      {vitalHistorySorted.length
                        ? `${vitalHistPage * vitalRowsPerPage + 1}-${Math.min(
                            vitalHistPage * vitalRowsPerPage + vitalRowsPerPage,
                            vitalHistorySorted.length,
                          )}`
                        : "0-0"}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Rows:
                      </Typography>
                      {[10, 25, 50].map((n) => (
                        <Chip
                          key={n}
                          label={n}
                          size="small"
                          onClick={() => {
                            setVitalRowsPerPage(n);
                            setVitalHistPage(0);
                          }}
                          variant={
                            vitalRowsPerPage === n ? "filled" : "outlined"
                          }
                          color={vitalRowsPerPage === n ? "primary" : "default"}
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            height: 22,
                            cursor: "pointer",
                          }}
                        />
                      ))}
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 0.5 }}
                      />
                      <Tooltip title="Download history">
                        <Button
                          size="small"
                          variant="text"
                          sx={{
                            minWidth: 28,
                            p: 0.5,
                            color: "text.secondary",
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: 15 }} />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>

                {/* Table */}
                <TableContainer
                  sx={{
                    flex: 1,
                    minHeight: 120,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: alpha(theme.palette.primary.main, 0.18),
                      borderRadius: 99,
                    },
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& .MuiTableCell-root": {
                            fontWeight: 800,
                            fontSize: 10.5,
                            color: "text.disabled",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            bgcolor: alpha(theme.palette.grey[100], 0.9),
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            py: 0.9,
                          },
                        }}
                      >
                        <TableCell sx={{ width: 36 }}>#</TableCell>
                        <TableCell>DATE</TableCell>
                        <TableCell>VALUE</TableCell>
                        <TableCell>UNIT</TableCell>
                        <TableCell>STATUS</TableCell>
                        <TableCell>NOTE</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vitalHistorySorted.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            sx={{
                              py: 4,
                              textAlign: "center",
                              color: "text.secondary",
                            }}
                          >
                            No readings found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vitalPagedHistory.map((record: any, idx: number) => {
                          const globalIdx =
                            vitalHistPage * vitalRowsPerPage + idx;
                          const isLatest = globalIdx === 0;
                          const val = getVitalValue(record);
                          const rSt = readingStatus(val);
                          const rCfg = VITAL_STATUS_CFG[rSt];
                          const note =
                            VITAL_NOTES[globalIdx % VITAL_NOTES.length];
                          return (
                            <TableRow
                              key={record.id}
                              hover
                              sx={{
                                bgcolor: isLatest
                                  ? alpha(theme.palette.primary.main, 0.04)
                                  : idx % 2 === 0
                                    ? "background.paper"
                                    : alpha(theme.palette.grey[50], 0.6),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.03,
                                  ),
                                },
                                transition: "background 0.12s",
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "text.disabled",
                                  fontWeight: 700,
                                  fontSize: 11,
                                  width: 36,
                                }}
                              >
                                {globalIdx + 1}
                              </TableCell>
                              <TableCell sx={{ py: 1.1 }}>
                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: 12,
                                    }}
                                  >
                                    {formatVitalDate(record.recordedAt)}
                                  </Typography>
                                  {isLatest && (
                                    <Chip
                                      size="small"
                                      label="Latest"
                                      sx={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        height: 15,
                                        bgcolor: alpha(
                                          theme.palette.primary.main,
                                          0.1,
                                        ),
                                        color: "primary.main",
                                      }}
                                    />
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                  color: rCfg.color,
                                  py: 1.1,
                                }}
                              >
                                {val}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "info.main",
                                  fontSize: 12,
                                  py: 1.1,
                                }}
                              >
                                {getVitalUnit()}
                              </TableCell>
                              <TableCell sx={{ py: 1.1 }}>
                                <Chip
                                  size="small"
                                  label={rCfg.label}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 9.5,
                                    height: 18,
                                    bgcolor: rCfg.bg,
                                    color: rCfg.color,
                                    border: `1px solid ${rCfg.border}`,
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "text.secondary",
                                  fontSize: 11,
                                  py: 1.1,
                                }}
                              >
                                {note}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination footer */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Page {vitalHistPage + 1} of {vitalTotalHistPages}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={vitalHistPage === 0}
                        onClick={() => setVitalHistPage(0)}
                        sx={{
                          minWidth: 32,
                          px: 0.75,
                          fontSize: 11,
                          fontWeight: 700,
                          py: 0.4,
                        }}
                      >
                        «
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={vitalHistPage === 0}
                        onClick={() => setVitalHistPage((p: number) => p - 1)}
                        sx={{
                          minWidth: 32,
                          px: 0.75,
                          fontSize: 11,
                          fontWeight: 700,
                          py: 0.4,
                        }}
                      >
                        ‹
                      </Button>
                      {Array.from({ length: vitalTotalHistPages }, (_, i) => i)
                        .filter((i) => Math.abs(i - vitalHistPage) <= 2)
                        .map((i) => (
                          <Button
                            key={i}
                            size="small"
                            variant={
                              i === vitalHistPage ? "contained" : "outlined"
                            }
                            onClick={() => setVitalHistPage(i)}
                            sx={{
                              minWidth: 32,
                              px: 0.75,
                              fontSize: 11,
                              fontWeight: 700,
                              py: 0.4,
                            }}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={vitalHistPage >= vitalTotalHistPages - 1}
                        onClick={() => setVitalHistPage((p: number) => p + 1)}
                        sx={{
                          minWidth: 32,
                          px: 0.75,
                          fontSize: 11,
                          fontWeight: 700,
                          py: 0.4,
                        }}
                      >
                        ›
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={vitalHistPage >= vitalTotalHistPages - 1}
                        onClick={() =>
                          setVitalHistPage(vitalTotalHistPages - 1)
                        }
                        sx={{
                          minWidth: 32,
                          px: 0.75,
                          fontSize: 11,
                          fontWeight: 700,
                          py: 0.4,
                        }}
                      >
                        »
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </TabPanel>
  );
}
