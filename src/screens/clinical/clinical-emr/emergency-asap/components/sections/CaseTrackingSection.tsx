"use client";

import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonTabs, StatTile } from "@/src/ui/components/molecules";
import CommonDataGrid, { type CommonColumn } from "@/src/components/table/CommonDataGrid";
import { cardShadow } from "@/src/core/theme/tokens";
import {
  AccessibilityNew as AccessibilityNewIcon,
  Air as AirIcon,
  Bloodtype as BloodtypeIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MonitorHeart as MonitorHeartIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  type EmergencyPatient,
  type EmergencyOrder,
  type ObservationEntry,
  type OrderForm,
  type DischargeForm,
  type CaseTrackingTabId,
  type CaseTrackingSidebarFilter,
  type OrderStatus,
  type EmergencyPageId,
} from "../../types";
import { CASE_TRACKING_TABS, ORDER_TEMPLATES, TRIAGE_META } from "../../AsapEmergencyData";

interface CaseTrackingSectionProps {
  selectedPatient: EmergencyPatient | null;
  selectedPatientOrders: EmergencyOrder[];
  selectedPatientObservations: ObservationEntry[];
  observationColumns: CommonColumn<ObservationEntry>[];
  caseTrackingTab: CaseTrackingTabId;
  setCaseTrackingTab: (tab: CaseTrackingTabId) => void;
  caseTrackingSearch: string;
  setCaseTrackingSearch: (value: string) => void;
  caseTrackingFilter: CaseTrackingSidebarFilter;
  setCaseTrackingFilter: (value: CaseTrackingSidebarFilter) => void;
  caseTrackingRows: EmergencyPatient[];
  selectedPatientId: string;
  handleOpenPatientChart: (patientId: string) => void;
  openVitalsDialog: (patientId?: string) => void;
  clinicalNoteDraft: string;
  setClinicalNoteDraft: (value: string) => void;
  handleSaveClinicalNote: () => void;
  handleSaveVitals: () => void;
  orderForm: OrderForm;
  handleOrderField: <K extends keyof OrderForm>(field: K, value: OrderForm[K]) => void;
  handleApplyOrderTemplate: (template: string) => void;
  handleAddOrder: () => void;
  handleOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  dischargeForm: DischargeForm;
  handleDischargeField: <K extends keyof DischargeForm>(field: K, value: DischargeForm[K]) => void;
  handleDisposition: (action: "discharge" | "admit" | "transfer") => void;
  dashboardAvgWaitMinutes: number;
  setActivePage: (page: EmergencyPageId) => void;
  openRegistrationModal: () => void;
}

export function CaseTrackingSection({
  selectedPatient,
  selectedPatientOrders,
  selectedPatientObservations,
  observationColumns,
  caseTrackingTab,
  setCaseTrackingTab,
  caseTrackingSearch,
  setCaseTrackingSearch,
  caseTrackingFilter,
  setCaseTrackingFilter,
  caseTrackingRows,
  selectedPatientId,
  handleOpenPatientChart,
  openVitalsDialog,
  clinicalNoteDraft,
  setClinicalNoteDraft,
  handleSaveClinicalNote,
  handleSaveVitals,
  orderForm,
  handleOrderField,
  handleApplyOrderTemplate,
  handleAddOrder,
  handleOrderStatusChange,
  dischargeForm,
  handleDischargeField,
  handleDisposition,
  dashboardAvgWaitMinutes,
  setActivePage,
  openRegistrationModal,
}: CaseTrackingSectionProps) {
  const theme = useTheme();
  const CASE_TRACKING_PANEL_H = "calc(100vh - 260px)";

  const labOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .filter((order) => order.type === "Lab Tests")
        .slice()
        .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
    [selectedPatientOrders],
  );

  const radiologyOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .filter((order) => order.type === "Radiology")
        .slice()
        .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
    [selectedPatientOrders],
  );

  const recentOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .slice()
        .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
        .slice(0, 5),
    [selectedPatientOrders],
  );

  const latestObservation = selectedPatientObservations[0];
  const firstObservation = selectedPatientObservations[selectedPatientObservations.length - 1];

  const createMetricCard = (
    label: string,
    value: string,
    unit: string,
    tone: "success" | "warning" | "error" | "info",
    status: string,
  ) => {
    const paletteMap = {
      success: theme.palette.success,
      warning: theme.palette.warning,
      error: theme.palette.error,
      info: theme.palette.info,
    } as const;
    const palette = paletteMap[tone];
    const iconMap: Record<string, React.ReactNode> = {
      "Blood Pressure": <BloodtypeIcon sx={{ fontSize: 20, color: palette.main }} />,
      "Heart Rate": <FavoriteBorderIcon sx={{ fontSize: 20, color: palette.main }} />,
      SpO2: <AirIcon sx={{ fontSize: 20, color: palette.main }} />,
      "Pain / GCS": <AccessibilityNewIcon sx={{ fontSize: 20, color: palette.main }} />,
    };

    return (
      <StatTile
        label={label}
        value={value}
        subtitle={`${unit} · ${status}`}
        icon={
          iconMap[label] ?? (
            <MonitorHeartIcon sx={{ fontSize: 20, color: palette.main }} />
          )
        }
        sx={{ height: "100%" }}
      />
    );
  };

  const renderQueueRail = () => (
    <Box
      sx={{
        borderBottom: { xs: "1px solid", lg: "none" },
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1.25,
            mb: 1.5,
          }}
        >
          {[
            {
              label: "Active",
              value: caseTrackingRows.length,
              color: theme.palette.primary.main,
            },
            {
              label: "Critical",
              value: caseTrackingRows.filter((patient) => patient.triageLevel === "Critical").length,
              color: theme.palette.error.main,
            },
            {
              label: "Ready",
              value: caseTrackingRows.filter((patient) => patient.status === "Ready for Disposition").length,
              color: theme.palette.success.main,
            },
          ].map((item) => (
            <Card
              key={item.label}
              elevation={0}
              sx={{ boxShadow: cardShadow, border: "none", p: 1.25, borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1.1, color: item.color }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary", fontSize: 10.5 }}
              >
                {item.label}
              </Typography>
            </Card>
          ))}
        </Box>

        <TextField
          size="small"
          fullWidth
          placeholder="Search patient, MRN, ER no..."
          value={caseTrackingSearch}
          onChange={(event) => setCaseTrackingSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.25,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: 13,
            },
          }}
        />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {(["All", "Critical", "In Treatment", "Ready"] as CaseTrackingSidebarFilter[]).map((filter) => (
            <Chip
              key={filter}
              label={filter}
              size="small"
              onClick={() => setCaseTrackingFilter(filter)}
              variant={caseTrackingFilter === filter ? "filled" : "outlined"}
              color={caseTrackingFilter === filter ? "primary" : "default"}
              sx={{ fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          maxHeight: { xs: 320, lg: "none" },
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { borderRadius: 99, bgcolor: "divider" },
        }}
      >
        {caseTrackingRows.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">No emergency cases match this search.</Alert>
          </Box>
        ) : (
          <Stack spacing={0}>
            {caseTrackingRows.map((patient) => {
              const selected = selectedPatientId === patient.id;
              const highlightColor = patient.triageLevel === "Critical" ? theme.palette.error.main : theme.palette.primary.main;
              const waitProgress = Math.min(100, Math.max(10, Math.round((patient.waitingMinutes / 45) * 100)));

              return (
                <Box
                  key={patient.id}
                  onClick={() => handleOpenPatientChart(patient.id)}
                  sx={{
                    px: 2,
                    py: 1.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
                    borderLeft: selected ? `3px solid ${highlightColor}` : "3px solid transparent",
                    "&:hover": {
                      bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.primary.main, 0.03),
                    },
                    transition: "background 0.15s ease",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: highlightColor,
                        mt: 0.7,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, mr: 0.75 }}>
                          {patient.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={patient.triageLevel}
                          sx={{
                            fontWeight: 700,
                            fontSize: 10,
                            ml: 0.5,
                            flexShrink: 0,
                            bgcolor: alpha(highlightColor, 0.12),
                            color:
                              patient.triageLevel === "Critical"
                                ? "error.main"
                                : patient.triageLevel === "Emergency" || patient.triageLevel === "Urgent"
                                  ? "warning.dark"
                                  : "primary.main",
                          }}
                        />
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "text.secondary", fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {patient.id} · {patient.mrn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35 }}>
                        {patient.chiefComplaint}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={patient.assignedBed ? `Bed ${patient.assignedBed}` : "No bed"}
                          sx={{
                            fontWeight: 600,
                            fontSize: 10,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: "primary.main",
                          }}
                        />
                        <Chip
                          size="small"
                          label={patient.status}
                          sx={{
                            fontWeight: 600,
                            fontSize: 10,
                            bgcolor:
                              patient.status === "Ready for Disposition"
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.info.main, 0.08),
                            color:
                              patient.status === "Ready for Disposition"
                                ? "success.main"
                                : "info.main",
                          }}
                        />
                      </Stack>
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            Wait {patient.waitingMinutes} min
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 10, color: patient.waitingMinutes >= 30 ? "warning.main" : "text.disabled" }}>
                            {patient.arrivalMode}
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 0.5, height: 4, borderRadius: 99, bgcolor: alpha(theme.palette.warning.main, 0.18), overflow: "hidden" }}>
                          <Box
                            sx={{
                              width: `${waitProgress}%`,
                              height: "100%",
                              bgcolor: patient.waitingMinutes >= 30 ? "warning.main" : "success.main",
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );

  if (!selectedPatient) {
    return (
      <Card
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          height: { xs: "auto", lg: CASE_TRACKING_PANEL_H },
          maxHeight: { xs: "none", lg: CASE_TRACKING_PANEL_H },
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
            height: "100%",
            minHeight: 0,
          }}
        >
          {renderQueueRail()}

          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: { xs: 2, md: 4 },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                color: "common.white",
                background: "linear-gradient(135deg, #0f2850 0%, #1d4ed8 100%)",
                boxShadow: `0 18px 40px ${alpha(theme.palette.primary.dark, 0.22)}`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Case Tracking
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: alpha(theme.palette.common.white, 0.82) }}>
                This screen is only for emergency operations: case monitoring,
                vitals, safety, timeline, and disposition.
              </Typography>
            </Box>

            <Alert severity="info">
              No case selected. Choose a patient from the left queue, or
              register a new arrival before starting the emergency workflow.
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" onClick={() => setActivePage("triage")}>
                Open Arrivals & Triage
              </Button>
              <Button variant="outlined" onClick={openRegistrationModal}>
                Register New Arrival
              </Button>
              <Button variant="outlined" onClick={() => setActivePage("bed-board")}>
                Open Bed Board
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>
    );
  }

  const triageShortLabel = `T${TRIAGE_META[selectedPatient.triageLevel].rank}`;
  const systolic = Number(selectedPatient.vitals.bloodPressure.split("/")[0]);
  const diastolic = Number(selectedPatient.vitals.bloodPressure.split("/")[1]);
  const bpTone =
    Number.isFinite(systolic) && Number.isFinite(diastolic) && (systolic < 90 || diastolic < 60)
      ? "error"
      : systolic >= 140 || diastolic >= 90
        ? "warning"
        : "success";
  const hrTone =
    selectedPatient.vitals.heartRate >= 120
      ? "warning"
      : selectedPatient.vitals.heartRate >= 60 && selectedPatient.vitals.heartRate <= 100
        ? "success"
        : "info";
  const spo2Tone =
    selectedPatient.vitals.spo2 < 90
      ? "error"
      : selectedPatient.vitals.spo2 <= 94
        ? "warning"
        : "success";
  const painTone =
    selectedPatient.vitals.painScore >= 7
      ? "warning"
      : selectedPatient.vitals.painScore >= 4
        ? "info"
        : "success";

  const timelineEntries: Array<{
    id: string;
    title: string;
    actor: string;
    detail: string;
    time: string;
    tone: "critical" | "warning" | "info" | "success";
  }> = [];

  if (clinicalNoteDraft.trim()) {
    timelineEntries.push({
      id: `note-${selectedPatient.id}`,
      title: "ED note updated",
      actor: selectedPatient.assignedDoctor,
      detail: clinicalNoteDraft.trim(),
      time: selectedPatient.updatedAt,
      tone: "info",
    });
  }

  selectedPatientObservations.slice(0, 4).forEach((entry) => {
    timelineEntries.push({
      id: entry.id,
      title: "Vitals recorded",
      actor: "ER nursing team",
      detail: `${entry.bloodPressure} · HR ${entry.heartRate} · SpO2 ${entry.spo2}% · ${entry.note}`,
      time: entry.recordedAt,
      tone: entry.spo2 < 90 || entry.painScore >= 8 ? "warning" : "info",
    });
  });

  recentOrders.slice(0, 4).forEach((order) => {
    timelineEntries.push({
      id: `order-${order.id}`,
      title: `${order.type} order`,
      actor: selectedPatient.assignedDoctor,
      detail: `${order.item} · ${order.priority} · ${order.status}`,
      time: order.orderedAt,
      tone:
        order.status === "Completed"
          ? "success"
          : order.priority === "STAT"
            ? "critical"
            : "warning",
    });
  });

  timelineEntries.push({
    id: `arrival-${selectedPatient.id}`,
    title: `Arrived via ${selectedPatient.arrivalMode}`,
    actor: selectedPatient.broughtBy || "Front desk",
    detail: selectedPatient.chiefComplaint,
    time: firstObservation?.recordedAt ?? selectedPatient.updatedAt,
    tone: selectedPatient.triageLevel === "Critical" ? "critical" : "info",
  });

  const checklistColumns = [
    {
      title: "Airway",
      items: [
        {
          label: "Oxygen and saturation monitoring",
          done: selectedPatient.vitals.spo2 <= 94 || selectedPatientObservations.length > 0,
        },
        {
          label: "Respiratory reassessment",
          done: selectedPatient.vitals.respiratoryRate > 0,
        },
        {
          label: "Airway backup ready",
          done: selectedPatient.triageLevel === "Critical",
        },
        {
          label: "Portable chest support ordered",
          done: radiologyOrders.some((order) => order.item.toLowerCase().includes("chest")),
        },
      ],
    },
    {
      title: "Circulation",
      items: [
        {
          label: "BP and pulse trending",
          done: selectedPatientObservations.length >= 2,
        },
        {
          label: "IV medication / fluid order present",
          done: selectedPatientOrders.some((order) => order.type === "Medication"),
        },
        { label: "Bed assigned", done: Boolean(selectedPatient.assignedBed) },
        {
          label: "Doctor assigned",
          done: Boolean(selectedPatient.assignedDoctor),
        },
      ],
    },
    {
      title: "Investigations",
      items: [
        { label: "Lab order placed", done: labOrders.length > 0 },
        { label: "Imaging order placed", done: radiologyOrders.length > 0 },
        {
          label: "At least one result completed",
          done: selectedPatientOrders.some((order) => order.status === "Completed"),
        },
        {
          label: "Critical flag reviewed",
          done: selectedPatient.safetyFlags.length > 0,
        },
      ],
    },
    {
      title: "Disposition",
      items: [
        { label: "ED note saved", done: clinicalNoteDraft.trim().length > 0 },
        {
          label: "Diagnosis captured",
          done: dischargeForm.diagnosis.trim().length > 0,
        },
        {
          label: "Instructions drafted",
          done: dischargeForm.instructions.trim().length > 0,
        },
        {
          label: "Ready for disposition",
          done: selectedPatient.status === "Ready for Disposition",
        },
      ],
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minHeight: 0,
        height: { xs: "auto", lg: CASE_TRACKING_PANEL_H },
        maxHeight: { xs: "none", lg: CASE_TRACKING_PANEL_H },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
          height: "100%",
          minHeight: 0,
        }}
      >
        {renderQueueRail()}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.01),
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              bgcolor: "background.default",
              flexShrink: 0,
            }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.08),
                bgcolor: "background.paper",
                backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)} 0%, ${theme.palette.background.paper} 72%)`,
                overflow: "hidden",
              }}
            >
              <Stack spacing={0.9} sx={{ px: { xs: 1.5, md: 1.75 }, py: 1.15 }}>
                <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(theme.palette.primary.main, 0.14),
                      color: "primary.main",
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {selectedPatient?.name
                      .split(" ")
                      .map((part: string) => part[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Avatar>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center" sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, mr: 0.25 }}>
                      {selectedPatient?.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={selectedPatient?.id}
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={selectedPatient?.mrn}
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={`${selectedPatient?.age}y / ${selectedPatient?.gender}`}
                      sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.08), color: "text.primary", fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={`${triageShortLabel} ${selectedPatient?.triageLevel}`}
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        bgcolor:
                          selectedPatient?.triageLevel === "Critical"
                            ? alpha(theme.palette.error.main, 0.12)
                            : selectedPatient?.triageLevel === "Emergency"
                              ? alpha(theme.palette.warning.main, 0.16)
                              : alpha(theme.palette.primary.main, 0.12),
                        color:
                          selectedPatient?.triageLevel === "Critical"
                            ? "error.main"
                            : selectedPatient?.triageLevel === "Emergency"
                              ? "warning.dark"
                              : "primary.main",
                      }}
                    />
                    <Chip
                      size="small"
                      label={selectedPatient?.status}
                      sx={{
                        fontWeight: 700,
                        bgcolor:
                          selectedPatient?.status === "Ready for Disposition"
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.info.main, 0.12),
                        color:
                          selectedPatient?.status === "Ready for Disposition"
                            ? "success.main"
                            : "info.main",
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={0.75} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.35, fontWeight: 500 }}>
                    {selectedPatient?.chiefComplaint}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.15, display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                    <Box component="span">Bed {selectedPatient?.assignedBed ?? "Not assigned"}</Box>
                    <Box component="span" sx={{ color: "divider" }}>•</Box>
                    <Box component="span">{selectedPatient?.assignedDoctor}</Box>
                    <Box component="span" sx={{ color: "divider" }}>•</Box>
                    <Box component="span">{selectedPatient?.arrivalMode}</Box>
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.08) }} />

              <Box sx={{ px: 1, py: 0.45, bgcolor: alpha(theme.palette.primary.main, 0.015) }}>
                <CommonTabs
                  tabs={CASE_TRACKING_TABS.map((tab: typeof CASE_TRACKING_TABS[number]) => ({ id: tab.id, label: tab.label, icon: tab.icon }))}
                  value={caseTrackingTab}
                  onChange={setCaseTrackingTab}
                  sx={{ minHeight: 0 }}
                  tabSx={{
                    minHeight: 34,
                    px: 1.2,
                    borderRadius: 1.25,
                    fontSize: 12.5,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              </Box>
            </Card>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: { xs: "visible", lg: "auto" }, p: 2 }}>
            {caseTrackingTab === "vitals" ? (
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "text.secondary" }}>
                    Latest Vitals · Captured {selectedPatient?.vitals.capturedAt}
                  </Typography>
                  <Button size="small" variant="contained" onClick={() => openVitalsDialog(selectedPatient?.id)}>
                    Record New
                  </Button>
                </Stack>

                <Grid container spacing={1.25}>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Blood Pressure",
                      selectedPatient ? selectedPatient.vitals.bloodPressure : "--",
                      "mmHg",
                      bpTone,
                      bpTone === "error" ? "Hypotensive" : bpTone === "warning" ? "Watch" : "Stable",
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Heart Rate",
                      selectedPatient ? String(selectedPatient.vitals.heartRate) : "--",
                      "bpm",
                      hrTone,
                      hrTone === "warning" ? "Tachycardia" : hrTone === "success" ? "Normal" : "Observe",
                    )}
                  </Grid>
                  <Grid  item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "SpO2",
                      selectedPatient ? `${selectedPatient.vitals.spo2}%` : "--",
                      "oxygen sat.",
                      spo2Tone,
                      spo2Tone === "error" ? "Critical" : spo2Tone === "warning" ? "Low" : "Adequate",
                    )}
                  </Grid>
                  <Grid  item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Pain / GCS",
                      selectedPatient ? `${selectedPatient.vitals.painScore}/10` : "--",
                      `GCS ${selectedPatient?.vitals.gcs ?? "--"}`,
                      painTone,
                      painTone === "warning" ? "Severe pain" : painTone === "info" ? "Moderate" : "Controlled",
                    )}
                  </Grid>
                </Grid>

                <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Observation Log
                    </Typography>
                  </Box>
                  <CommonDataGrid<ObservationEntry>
                    rows={selectedPatientObservations.slice(0, 6)}
                    columns={observationColumns}
                    getRowId={(row) => row.id}
                    emptyTitle="No vitals log available for this case."
                  />
                </Card>
              </Stack>
            ) : null}

            {caseTrackingTab === "safety" ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} lg={5}>
                  <Card elevation={0} sx={{ height: "100%", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Allergies and ED Flags
                      </Typography>
                    </Box>
                    <Stack spacing={1.5} sx={{ p: 1.75 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "text.secondary" }}>
                          Allergies
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.9 }}>
                          {selectedPatient.allergies.map((allergy: string) => (
                            <Chip
                              key={allergy}
                              size="small"
                              label={allergy}
                              sx={{
                                bgcolor:
                                  allergy === "No known allergies"
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.error.main, 0.1),
                                color:
                                  allergy === "No known allergies"
                                    ? "success.main"
                                    : "error.main",
                                fontWeight: 700,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "text.secondary" }}>
                          ED Flags
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.9 }}>
                          {selectedPatient.safetyFlags.map((flag: string) => (
                            <Chip
                              key={flag}
                              size="small"
                              label={flag}
                              sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.12),
                                color: "warning.dark",
                                fontWeight: 700,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "text.secondary" }}>
                          Patient Notes
                        </Typography>
                        <Box sx={{ mt: 0.9, p: 1.25, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                          <Typography variant="body2" color="text.secondary">
                            {selectedPatient.clinicalNotes || "No additional ED notes captured."}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={7}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Lab Orders and Results
                      </Typography>
                    </Box>
                    <Stack spacing={1.25} sx={{ p: 1.75 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={3}>
                          <TextField
                            select
                            size="small"
                            label="Type"
                            value={orderForm.type}
                            onChange={(event) => handleOrderField("type", event.target.value as any)}
                            fullWidth
                          >
                            {(["Lab Tests", "Radiology", "Medication", "Procedures"] as const).map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            select
                            size="small"
                            label="Priority"
                            value={orderForm.priority}
                            onChange={(event) => handleOrderField("priority", event.target.value as any)}
                            fullWidth
                          >
                            {(["STAT", "Urgent", "Routine"] as const).map((priority) => (
                              <MenuItem key={priority} value={priority}>
                                {priority}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              label="Order item"
                              value={orderForm.item}
                              onChange={(event) => handleOrderField("item", event.target.value)}
                              fullWidth
                            />
                            <Button variant="contained" onClick={handleAddOrder}>
                              Add
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>

                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {ORDER_TEMPLATES[orderForm.type].map((template: string) => (
                          <Chip
                            key={template}
                            size="small"
                            label={template}
                            color={orderForm.item === template ? "primary" : "default"}
                            variant={orderForm.item === template ? "filled" : "outlined"}
                            onClick={() => handleApplyOrderTemplate(template)}
                          />
                        ))}
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        {recentOrders.length === 0 ? (
                          <Alert severity="info">No active emergency orders for this case.</Alert>
                        ) : (
                          recentOrders.map((order) => (
                            <Card
                              key={order.id}
                              elevation={0}
                              sx={{ px: 1.25, py: 1, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}
                            >
                              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {order.item}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {order.type} · {order.orderedAt} · {order.priority}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Chip label={order.status} size="small" />
                                  <TextField
                                    select
                                    size="small"
                                    value={order.status}
                                    onChange={(event) => handleOrderStatusChange(order.id, event.target.value as OrderStatus)}
                                    sx={{ minWidth: 124 }}
                                  >
                                    {(["Pending", "In Progress", "Completed"] as const).map((status) => (
                                      <MenuItem key={status} value={status}>
                                        {status}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Stack>
                              </Stack>
                            </Card>
                          ))
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {caseTrackingTab === "timeline" ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} lg={7}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Care Timeline
                      </Typography>
                    </Box>
                    <Stack spacing={1.5} sx={{ p: 1.75 }}>
                      {timelineEntries.map((entry, index) => {
                        const toneColor =
                          entry.tone === "critical"
                            ? theme.palette.error.main
                            : entry.tone === "warning"
                              ? theme.palette.warning.main
                              : entry.tone === "success"
                                ? theme.palette.success.main
                                : theme.palette.info.main;

                        return (
                          <Stack key={entry.id} direction="row" spacing={1.25}>
                            <Stack alignItems="center" sx={{ width: 28, flexShrink: 0 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  display: "grid",
                                  placeItems: "center",
                                  border: "1px solid",
                                  borderColor: alpha(toneColor, 0.35),
                                  bgcolor: alpha(toneColor, 0.1),
                                  color: toneColor,
                                  fontWeight: 800,
                                  fontSize: 12,
                                }}
                              >
                                {entry.tone === "critical"
                                  ? "!"
                                  : entry.tone === "warning"
                                    ? "•"
                                    : entry.tone === "success"
                                      ? "✓"
                                      : "i"}
                              </Box>
                              {index < timelineEntries.length - 1 ? (
                                <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.5 }} />
                              ) : null}
                            </Stack>
                            <Box sx={{ flex: 1, pb: index < timelineEntries.length - 1 ? 1 : 0 }}>
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"JetBrains Mono", monospace' }}>
                                  {entry.time}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: "text.secondary", fontFamily: '"JetBrains Mono", monospace' }}>
                                {entry.actor}
                              </Typography>
                              <Box sx={{ mt: 0.75, p: 1, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                <Typography variant="body2" color="text.secondary">
                                  {entry.detail}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        ED Note Composer
                      </Typography>
                    </Box>
                    <Stack spacing={1.25} sx={{ p: 1.75 }}>
                      <TextField
                        size="small"
                        value={clinicalNoteDraft}
                        onChange={(event) => setClinicalNoteDraft(event.target.value)}
                        multiline
                        minRows={10}
                        fullWidth
                      />
                      <Button variant="contained" onClick={handleSaveClinicalNote}>
                        Save ED Note
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            ) : null}

            {caseTrackingTab === "checklist" ? (
              <Stack spacing={1.5}>
                <Grid container spacing={0}>
                  {checklistColumns.map((column) => (
                    <Grid item xs={12} sm={6} lg={3} key={column.title}>
                      <Card elevation={0} sx={{ height: "100%", borderRadius: 0, border: "1px solid", borderColor: "divider", borderRightWidth: { lg: 0 }, "&:last-of-type": { borderRightWidth: { lg: 1 } } }}>
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "text.secondary" }}>
                            {column.title}
                          </Typography>
                          <Stack spacing={0.9}>
                            {column.items.map((item) => (
                              <Stack
                                key={item.label}
                                direction="row"
                                spacing={0.8}
                                alignItems="flex-start"
                                sx={{
                                  color: item.done ? "text.secondary" : "text.primary",
                                  textDecoration: item.done ? "line-through" : "none",
                                }}
                              >
                                <input type="checkbox" checked={item.done} readOnly />
                                <Typography variant="body2">{item.label}</Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Disposition and Handover
                    </Typography>
                  </Box>
                  <Stack spacing={1.25} sx={{ p: 1.75 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Disposition Diagnosis"
                          value={dischargeForm.diagnosis}
                          onChange={(event) => handleDischargeField("diagnosis", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Condition on Exit"
                          value={dischargeForm.condition}
                          onChange={(event) => handleDischargeField("condition", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          size="small"
                          label="Instructions"
                          value={dischargeForm.instructions}
                          onChange={(event) => handleDischargeField("instructions", event.target.value)}
                          multiline
                          minRows={3}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Follow-up"
                          value={dischargeForm.followUp}
                          onChange={(event) => handleDischargeField("followUp", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Medication Advice"
                          value={dischargeForm.medications}
                          onChange={(event) => handleDischargeField("medications", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Destination"
                          value={dischargeForm.destination}
                          onChange={(event) => handleDischargeField("destination", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" color="success" onClick={() => setActivePage("chart")}>Preview AVS</Button>
                      <Button variant="contained" onClick={() => handleDisposition("admit")}>Admit to IPD</Button>
                      <Button variant="outlined" color="success" onClick={() => handleDisposition("discharge")}>Discharge</Button>
                      <Button variant="outlined" color="warning" onClick={() => handleDisposition("transfer")}>Transfer</Button>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
