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

interface RadiologyTabProps {
  data: PatientProfileData;
}

export function RadiologyTab({ data }: RadiologyTabProps) {
  const { activeTab, tabHeaderSx, radiologyOrders, theme, lightBorder } = data;
  return (
    <TabPanel value={activeTab} tab="radiology">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <RadioButtonCheckedIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Radiology Orders
        </Typography>
      </Stack>
      <Stack spacing={2}>
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

        <TableContainer
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: lightBorder,
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                "& .MuiTableCell-root": {
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                  letterSpacing: "0.05em",
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  color: "text.secondary",
                },
              }}
            >
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell>Modality</TableCell>
                <TableCell>Ordered By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Priority</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Report</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {radiologyOrders.map((order: any) => (
                <TableRow
                  key={order.id}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.test}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.modality}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.orderedBy}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.orderedOn)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={order.priority}
                      sx={{
                        fontWeight: 600,
                        bgcolor:
                          order.priority === "Urgent"
                            ? alpha(theme.palette.error.main, 0.12)
                            : alpha(theme.palette.info.main, 0.1),
                        color:
                          order.priority === "Urgent"
                            ? "error.dark"
                            : "info.dark",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={order.status}
                      sx={{
                        fontWeight: 600,
                        bgcolor:
                          order.status === "Completed"
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.warning.main, 0.12),
                        color:
                          order.status === "Completed"
                            ? "success.dark"
                            : "warning.dark",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {order.reportUrl ? (
                      <Button
                        size="small"
                        variant="outlined"
                        href={order.reportUrl}
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
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </TabPanel>
  );
}
