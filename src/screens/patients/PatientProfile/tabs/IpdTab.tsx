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

interface IpdTabProps {
  data: PatientProfileData;
}

export function IpdTab({ data }: IpdTabProps) {
  const {
    activeTab,
    tabHeaderSx,
    ipdAdmissions,
    lightBorder,
    theme,
    tileShadow,
    router,
    patient,
    mrn,
    dividerSx,
  } = data;
  return (
    <TabPanel value={activeTab} tab="ipd">
      <Stack direction="row" spacing={1} alignItems="center" sx={tabHeaderSx}>
        <HotelIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          IPD / Inpatient Admissions
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {ipdAdmissions.map((adm: any) => (
          <Box
            key={adm.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: lightBorder,
              borderLeft: "4px solid",
              borderLeftColor:
                adm.status === "Active"
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.25),
              bgcolor:
                adm.status === "Active"
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.text.primary, 0.02),
              boxShadow: tileShadow,
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              sx={{ mb: 1.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HotelIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {adm.id}
                  </Typography>
                  <Chip
                    size="small"
                    label={adm.status}
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                      height: 22,
                      bgcolor:
                        adm.status === "Active"
                          ? alpha(theme.palette.success.main, 0.12)
                          : alpha(theme.palette.text.primary, 0.08),
                      color:
                        adm.status === "Active"
                          ? "success.dark"
                          : "text.secondary",
                    }}
                  />
                </Box>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                onClick={() =>
                  router.push(
                    `/ipd/admissions${patient?.mrn ? `?mrn=${encodeURIComponent(patient.mrn)}` : ""}`,
                  )
                }
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                View in IPD
              </Button>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(4, 1fr)",
                },
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {[
                { label: "Ward / Dept", value: adm.ward },
                { label: "Bed", value: adm.bed },
                {
                  label: "Admitted",
                  value: formatDate(adm.admissionDate),
                },
                {
                  label: "Discharged",
                  value: adm.dischargeDate
                    ? formatDate(adm.dischargeDate)
                    : "Still Admitted",
                },
              ].map((f: any) => (
                <Box key={f.label}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.25 }}
                  >
                    {f.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {f.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ ...dividerSx, my: 1.5 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.25 }}
                >
                  Primary Diagnosis
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {adm.primaryDiagnosis}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.25 }}
                >
                  Consultant
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {adm.consultant}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, fontStyle: "italic", lineHeight: 1.6 }}
            >
              {adm.notes}
            </Typography>
          </Box>
        ))}
      </Stack>
    </TabPanel>
  );
}
