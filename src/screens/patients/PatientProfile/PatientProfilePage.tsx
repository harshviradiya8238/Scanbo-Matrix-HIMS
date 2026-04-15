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
// import { ProblemsTab } from "./tabs/ProblemsTab";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  CustomCardTabs,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { maskMobileNumber } from "@/src/core/utils/phone";
import {
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonOutline as PersonOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import GlobalPatientSearch from "@/src/ui/components/molecules/GlobalPatientSearch";
import { GLOBAL_PATIENTS } from "@/src/mocks/global-patients";

export default function PatientProfilePage() {
  const data = usePatientProfileData();
  const {
    theme,
    router,
    mrn,
    appointments,
    vitalTrends,
    patient,
    tileShadow,
    lightBorder,
    dividerSx,
    cancelTarget,
    setCancelTarget,
    opdAppointments,
    handleReschedule,
    handleCancelAppointment,
    confirmCancelAppointment,
    latestAppointment,
    vitalHistory,
    latestVital,
    tabs,
    activeTab,
    setActiveTab,
    VITAL_STATUS_CFG,
    vitalChartColor,
    getVitalValue,
    getVitalUnit,
    payerType,
    insuranceLabel,
    allergies,
    allergyDisplay,
    patientMedications,
    completedVisits,
    showRate,
    vitalTiles,
  } = data;

  const tabItems = tabs.map((tab) => ({
    label: tab.label,
    child:
      tab.id === "history" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <HistoryTab data={data} />
        </Box>
      ) : tab.id === "vitals" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <VitalsTab data={data} />
        </Box>
      ) : tab.id === "appointments" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <AppointmentsTab data={data} />
        </Box>
      ) : tab.id === "medications" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <MedicationsTab data={data} />
        </Box>
      ) : tab.id === "ipd" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <IpdTab data={data} />
        </Box>
      ) : tab.id === "billing" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <BillingTab data={data} />
        </Box>
      ) : tab.id === "care" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <CareTab data={data} />
        </Box>
      ) : tab.id === "infection" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <InfectionTab data={data} />
        </Box>
      ) : tab.id === "radiology" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <RadiologyTab data={data} />
        </Box>
      ) : tab.id === "labs" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <LabsTab data={data} />
        </Box>
      ) : tab.id === "imaging" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <ImagingTab data={data} />
        </Box>
      ) : tab.id === "documents" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <DocumentsTab data={data} />
        </Box>
      ) : tab.id === "immunizations" ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <ImmunizationsTab data={data} />
        </Box>
      ) : null,
  }));

  // ─── No patient state ────────────────────────────────────────────────────────
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
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {GLOBAL_PATIENTS.slice(0, 4).map((seed) => (
                <Chip
                  key={seed.mrn}
                  label={`${seed.name} · ${seed.mrn}`}
                  variant="outlined"
                  onClick={() => router.push(`/patients/profile?mrn=${seed.mrn}`)}
                />
              ))}
            </Stack>
          </Stack>
        </Card>
      </PageTemplate>
    );
  }

  // ─── Main layout ─────────────────────────────────────────────────────────────
  return (
    <PageTemplate
      title="Patient Profile"
      currentPageTitle="Profile"
      fullHeight
    >
      {/*
       * ROOT CONTAINER
       * Takes full height of whatever PageTemplate gives us (should be 100dvh
       * minus the app-bar). We stack vertically and NEVER let this element
       * scroll — all scrolling happens in the two inner panels below.
       */}
      <Stack
        spacing={1.25}
        sx={{
          height: "100%",           // fill parent (PageTemplate sets height)
          minHeight: 0,             // critical: lets flex children shrink below content size
          overflow: "hidden",       // NO page-level scroll
        }}
      >
        {/* ── 1. HEADER CARD — fixed height, never scrolls ─────────────────── */}
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: "22px", flexShrink: 0 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.palette.primary.main,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {getInitials(patient.name)}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {patient.name}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.75 }}>
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
                    <Chip label="Has Allergies" color="error" variant="outlined" size="small" />
                  ) : null}
                  {patient.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
                </Box>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {[
                    { label: "MRN", value: patient.mrn },
                    { label: "Age", value: `${patient.age} yrs` },
                    { label: "Gender", value: patient.gender },
                    { label: "Dept", value: patient.department },
                  ].map((meta) => (
                    <Stack key={meta.label} direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{meta.label}:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{meta.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
                
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignSelf={{ xs: "stretch", lg: "center" }}
              flexShrink={0}
            >
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  router.push(`/appointments/calendar?mrn=${patient.mrn}&booking=1`)
                }
              >
                New Appointment
              </Button>
              <Button variant="outlined" size="small">Send Message</Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => typeof window !== "undefined" && window.print()}
              >
                Print Chart
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        {/* ── 2. STAT TILES ROW — fixed height, never scrolls ──────────────── */}
        {/* <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <StatTile
            label="Total Visits"
            value={opdAppointments.length}
            subtitle={latestAppointment ? `Last on ${formatDate(latestAppointment.date)}` : "No visits yet"}
            icon={<CalendarMonthIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Active Meds"
            value={patientMedications.filter((m) => m.status === "Active").length}
            subtitle={patientMedications.length ? "On profile" : "None listed"}
            icon={<LocalPharmacyIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Vitals Captured"
            value={vitalHistory.length}
            subtitle={latestVital ? `Latest ${latestVital.recordedAt}` : "No vitals recorded"}
            icon={<MonitorHeartIcon fontSize="small" />}
            variant="soft"
          />
          <StatTile
            label="Show Rate"
            value={showRate === null ? "—" : `${showRate}%`}
            subtitle={opdAppointments.length ? `${completedVisits} completed` : "No visits yet"}
            icon={<EventAvailableIcon fontSize="small" />}
            variant="soft"
          />
        </Box> */}

        {/*
         * ── 3. BODY — two-column, BOTH columns scroll independently ──────────
         *
         * This box takes all remaining space (flex: 1) and hides its own
         * overflow. The left sidebar and right tab panel each manage their
         * own internal scroll.
         */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "340px minmax(0, 1fr)" },
            gap: 1.5,
            flex: 1,         // consume remaining height
            minHeight: 0,    // allow shrinking — THIS IS THE KEY LINE
            overflow: "hidden",
          }}
        >
          {/* ── LEFT SIDEBAR: scrolls independently ─────────────────────────── */}
          <Stack
            spacing={1.5}
            sx={{
              minHeight: 0,
              height: "100%",
              overflowY: "auto",   // sidebar scrolls on its own
              overflowX: "hidden",
              pr: 0.5,
              // nice thin scrollbar
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: alpha(theme.palette.text.primary, 0.15),
                borderRadius: 4,
              },
            }}
          >
            {/* Insurance card */}
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
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>Member ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === "General" ? "—" : patient.mrn.replace("MRN-", "MEM-")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>Plan</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payerType === "Insurance" ? "PPO" : payerType === "Corporate" ? "Corporate" : "Self Pay"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Stack spacing={0}>
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
              </Stack>
            </Card>

            {/* Demographics card */}
            <Card sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Demographics & Contact
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={0}>
                <InfoRow label="Phone" value={maskMobileNumber(patient.phone)} />
                <InfoRow label="City" value={patient.city} />
                <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
                <InfoRow label="Department" value={patient.department} />
                <InfoRow label="Emergency Contact" value="—" />
              </Stack>
            </Card>

            {/* Latest vitals card */}
            <Card elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Latest Vital Signs
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {latestVital ? `Recorded ${latestVital.recordedAt}` : "No vitals yet"}
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Grid container spacing={1.5}>
                {vitalTiles.map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: lightBorder,
                        boxShadow: tileShadow,
                        display: "grid",
                        gap: 0.75,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
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
                        sx={{ fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.3, color: "text.secondary" }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* Allergies card */}
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
                        color: allergies.length ? theme.palette.error.main : "text.primary",
                      }}
                    >
                      {allergy}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>

          {/* ── RIGHT PANEL: tab bar fixed, tab content scrolls ──────────────── */}
          <Card
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              minWidth: 0,
              minHeight: 0,
              height: "100%",           // fill the grid row
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",        // clip children
            }}
          >
            <CustomCardTabs
              defaultValue={tabs.findIndex((tab) => tab.id === activeTab)}
              onChange={(index) => setActiveTab(tabs[index]?.id ?? tabs[0].id)}
              items={tabItems}
              sticky={false}
              scrollable
              sx={{
                flex: 1,
                minHeight: 0,
                "& > :last-child": {
                  pt: 0,
                },
              }}
            />

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
          </Card>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
