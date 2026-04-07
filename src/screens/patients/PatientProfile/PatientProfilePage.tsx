"use client";

import * as React from "react";
import { usePatientProfileData } from "./hooks/usePatientProfileData";
import {
  getInitials,
  formatDate,
  formatLongDate,
  buildDateTime,
  formatFrequency,
  appointmentStatusTone,
  InfoRow,
  Sparkline,
  TabPanel,
} from "./utils/utils";
import { HistoryTab } from "./tabs/HistoryTab";
import { VitalsTab } from "./tabs/VitalsTab";
import { MedicationsTab } from "./tabs/MedicationsTab";
import { IpdTab } from "./tabs/IpdTab";
import { BillingTab } from "./tabs/BillingTab";
import { CareTab } from "./tabs/CareTab";
import { InfectionTab } from "./tabs/InfectionTab";
import { RadiologyTab } from "./tabs/RadiologyTab";
import { LabsTab } from "./tabs/LabsTab";
import { ImagingTab } from "./tabs/ImagingTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { AppointmentsTab } from "./tabs/AppointmentsTab";
import { ImmunizationsTab } from "./tabs/ImmunizationsTab";
import { ProblemsTab } from "./tabs/ProblemsTab";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  CommonTabs,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import Tooltip from "@mui/material/Tooltip";
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
} from "@mui/icons-material";
import GlobalPatientSearch from "@/src/ui/components/molecules/GlobalPatientSearch";
import { GLOBAL_PATIENTS } from "@/src/mocks/global-patients";
import { updateAppointment } from "@/src/store/slices/opdSlice";
import { useAppDispatch } from "@/src/store/hooks";
import { OpdAppointment } from "@/src/screens/opd/opd-mock-data";

export default function PatientProfilePage() {
  const data = usePatientProfileData();
  const {
    theme,
    router,
    searchParams,
    mrn,
    dispatch,
    appointments,
    encounters,
    vitalTrends,
    medicationCatalog,
    patient,
    tileShadow,
    lightBorder,
    dividerSx,
    tabHeaderSx,
    cancelTarget,
    setCancelTarget,
    opdAppointments,
    opdEncounter,
    timelineAppointments,
    handleReschedule,
    handleCancelAppointment,
    confirmCancelAppointment,
    latestAppointment,
    vitalHistory,
    latestVital,
    tabs,
    activeTab,
    setActiveTab,
    selectedVitalId,
    setSelectedVitalId,
    vitalsView,
    setVitalsView,
    vitalsPeriod,
    setVitalsPeriod,
    vitalHistPage,
    setVitalHistPage,
    vitalRowsPerPage,
    setVitalRowsPerPage,
    VITAL_STATUS_CFG,
    VITAL_NOTES,
    parseVitalNum,
    vitalChartValues,
    chartValuesToShow,
    vitalChartColor,
    vitalHistorySorted,
    vitalTotalHistPages,
    vitalPagedHistory,
    getVitalValue,
    getVitalUnit,
    readingStatus,
    formatVitalDate,
    payerType,
    insuranceLabel,
    allergiesRaw,
    allergies,
    allergyDisplay,
    problems,
    patientMedications,
    medicationTableRows,
    labResults,
    documents,
    immunizations,
    ipdAdmissions,
    billingInvoices,
    totalBilled,
    totalPaid,
    balanceDue,
    careCompanion,
    infectionCases,
    radiologyOrders,
    completedVisits,
    showRate,
    vitalTiles,
  } = data;
  if (!patient) {
    return (
      <PageTemplate title="Patient Profile" currentPageTitle="Profile">
        <Card elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">Find a patient</Typography>
            <Typography variant="body2" color="text.secondary">
              Search by MRN, name, or phone to open the patient profile.
            </Typography>
            <Box sx={{ width: { xs: "100%", sm: 420 } }}>
              <GlobalPatientSearch />
            </Box>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
            >
              {GLOBAL_PATIENTS.slice(0, 4).map((seed) => (
                <Chip
                  key={seed.mrn}
                  label={`${seed.name} · ${seed.mrn}`}
                  variant="outlined"
                  onClick={() =>
                    router.push(`/patients/profile?mrn=${seed.mrn}`)
                  }
                />
              ))}
            </Stack>
          </Stack>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Patient Profile" currentPageTitle="Profile">
      <Stack spacing={1.25}>
        <WorkspaceHeaderCard
          sx={{
            p: 2,
            borderRadius: '22px',
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ flex: 1 }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.primary.main,
                  fontSize: 20,
                }}
              >
                {getInitials(patient.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {patient.name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  {[
                    { label: "MRN", value: patient.mrn },
                    { label: "Age", value: `${patient.age} yrs` },
                    { label: "Gender", value: patient.gender },
                    { label: "Department", value: patient.department },
                  ].map((meta) => (
                    <Stack
                      key={meta.label}
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                    >
                      <Typography variant="caption" color="text.secondary">
                        {meta.label}:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {meta.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 1 }}
                >
                  <Chip
                    label={patient.status}
                    color={patient.status === "Active" ? "success" : "warning"}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={payerType === "General" ? "Self Pay" : payerType}
                    color={payerType === "Insurance" ? "info" : "default"}
                    variant="outlined"
                    size="small"
                  />
                  {allergies.length ? (
                    <Chip
                      label="Has Allergies"
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  ) : null}
                  {patient.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignSelf={{ xs: "stretch", lg: "center" }}
            >
              <Button
                variant="contained"
                onClick={() =>
                  router.push(
                    `/appointments/calendar?mrn=${patient.mrn}&booking=1`,
                  )
                }
              >
                New Appointment
              </Button>
              <Button variant="outlined">Send Message</Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
              >
                Print Chart
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <StatTile
            label="Total Visits"
            value={opdAppointments.length}
            subtitle={
              latestAppointment
                ? `Last on ${formatDate(latestAppointment.date)}`
                : "No visits yet"
            }
            icon={<CalendarMonthIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Active Medications"
            value={
              patientMedications.filter((med) => med.status === "Active").length
            }
            subtitle={patientMedications.length ? "On profile" : "None listed"}
            icon={<LocalPharmacyIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Vitals Captured"
            value={vitalHistory.length}
            subtitle={
              latestVital
                ? `Latest ${latestVital.recordedAt}`
                : "No vitals recorded"
            }
            icon={<MonitorHeartIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Show Rate"
            value={showRate === null ? "—" : `${showRate}%`}
            subtitle={
              opdAppointments.length
                ? `${completedVisits} completed`
                : "No visits yet"
            }
            icon={<EventAvailableIcon fontSize="small" />}
            variant="soft"
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "360px minmax(0, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              position: { xl: "sticky" },
              top: { xl: 16 },
              // maxHeight: { xl: "calc(100vh - 120px)" },
              // overflowY: { xl: "auto" },
              alignSelf: "start",
            }}
          >
            <Card elevation={6} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUserIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Insurance Information
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  color: "common.white",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {insuranceLabel}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {payerType} coverage
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Member ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === "General"
                        ? "—"
                        : `${patient.mrn.replace("MRN-", "MEM-")}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Plan
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === "Insurance"
                        ? "PPO"
                        : payerType === "Corporate"
                          ? "Corporate"
                          : "Self Pay"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Stack spacing={0}>
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
              </Stack>
            </Card>

            <Card sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Demographics & Contact
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={0}>
                <InfoRow label="Phone" value={patient.phone} />
                <InfoRow label="City" value={patient.city} />
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
                <InfoRow label="Emergency Contact" value="—" />
              </Stack>
            </Card>

            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Latest Vital Signs
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {latestVital
                    ? `Recorded ${latestVital.recordedAt}`
                    : "No vitals yet"}
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Grid container spacing={1.75}>
                {vitalTiles.map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 1.5,
                        border: lightBorder,
                        boxShadow: tileShadow,
                        display: "grid",
                        gap: 0.8,
                        minHeight: 96,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.12,
                            ),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.15rem",
                          lineHeight: 1.3,
                          color: "text.secondary",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberIcon fontSize="small" color="error" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Allergies & Alerts
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={1}>
                {allergyDisplay.map((allergy) => (
                  <Box
                    key={allergy}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: lightBorder,
                      borderLeft: "3px solid",
                      borderLeftColor: allergies.length
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                      backgroundColor: allergies.length
                        ? alpha(theme.palette.error.main, 0.08)
                        : alpha(theme.palette.success.main, 0.06),
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: allergies.length
                          ? theme.palette.error.main
                          : theme.palette.text.primary,
                      }}
                    >
                      {allergy}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Card elevation={0} sx={{ p: 0, borderRadius: 2, minWidth: 0 }}>
              <Box
                sx={{
                  px: 0.5,
                  py: 0.5,
                  borderBottom: lightBorder,
                  minWidth: 0,
                }}
              >
                <CommonTabs
                  tabs={tabs}
                  value={activeTab}
                  onChange={(value) => setActiveTab(value)}
                  variant="scrollable"
                  allowScrollButtonsMobile
                  sx={{
                    px: 0.5,
                    minWidth: 0,
                    "& .MuiTab-root": {
                      minHeight: 40,
                      px: 2,
                    },
                    "& .MuiTabs-scroller": {
                      overflow: "auto !important",
                    },
                    "& .MuiTabs-flexContainer": {
                      flexWrap: "nowrap",
                    },
                  }}
                />
              </Box>

              <Box sx={{ p: 2 }}>
                <HistoryTab data={data} />

                <VitalsTab data={data} />

                <MedicationsTab data={data} />

                {/* ══════════ IPD / INPATIENT TAB ══════════ */}
                <IpdTab data={data} />

                {/* ══════════ BILLING TAB ══════════ */}
                <BillingTab data={data} />

                {/* ══════════ CARE COMPANION TAB ══════════ */}
                <CareTab data={data} />

                {/* ══════════ INFECTION CONTROL TAB ══════════ */}
                <InfectionTab data={data} />

                {/* ══════════ RADIOLOGY TAB ══════════ */}
                <RadiologyTab data={data} />

                <LabsTab data={data} />

                <ImagingTab data={data} />

                <DocumentsTab data={data} />

                <AppointmentsTab data={data} />

                <CommonDialog
                  open={Boolean(cancelTarget)}
                  onClose={() => setCancelTarget(null)}
                  title="Cancel Appointment"
                  description={
                    <>
                      Are you sure you want to cancel the appointment on{" "}
                      <strong>{formatLongDate(cancelTarget?.date)}</strong> at{" "}
                      <strong>{cancelTarget?.time}</strong>?
                    </>
                  }
                  cancelLabel="Keep Appointment"
                  confirmLabel="Cancel Appointment"
                  confirmColor="error"
                  onConfirm={confirmCancelAppointment}
                />

                <ImmunizationsTab data={data} />

                <ProblemsTab data={data} />
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
