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

interface MedicationsTabProps {
  data: PatientProfileData;
}

export function MedicationsTab({ data }: MedicationsTabProps) {
  const { activeTab, tabHeaderSx, medicationTableRows, theme, patient } = data;
  return (
    <TabPanel value={activeTab} tab="medications">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <LocalPharmacyIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Medications
        </Typography>
      </Stack>
      {medicationTableRows.length ? (
        <TableContainer
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        >
          <Table
            size="small"
            sx={{
              borderCollapse: "collapse",
              "& .MuiTableCell-root": {
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              },
              "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
                borderBottom: "none",
              },
            }}
          >
            <TableHead
              sx={{
                "& .MuiTableRow-root": {
                  boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.text.primary, 0.12)}`,
                },
                "& .MuiTableCell-root": {
                  color: "text.secondary",
                  fontWeight: 700,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                  backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontSize: "0.8rem",
                },
                "& .MuiTableCell-root:first-of-type": {
                  borderTopLeftRadius: 0,
                },
                "& .MuiTableCell-root:last-of-type": {
                  borderTopRightRadius: 0,
                },
              }}
            >
              <TableRow>
                <TableCell>Medication</TableCell>
                <TableCell>Dosage & Frequency</TableCell>
                <TableCell>Prescriber</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Refills</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicationTableRows.map((med: any) => (
                <TableRow
                  key={med.name}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.text.primary, 0.03),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {med.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {med.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {med.dosage}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{med.prescriber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatLongDate(med.startDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={med.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor:
                          med.status === "Active"
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.text.primary, 0.08),
                        color:
                          med.status === "Active"
                            ? theme.palette.success.main
                            : theme.palette.text.secondary,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {med.refills}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No medications listed for this patient yet.
        </Typography>
      )}
    </TabPanel>
  );
}
