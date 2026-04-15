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
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  AccessibilityNew as AccessibilityNewIcon,
  Air as AirIcon,
  Bloodtype as BloodtypeIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterListIcon,
  LocalHospital as LocalHospitalIcon,
  MonitorHeart as MonitorHeartIcon,
  Search as SearchIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import {
  type EmergencyPatient,
  type EmergencyOrder,
  type ObservationEntry,
  type OrderForm,
  type VitalsForm,
  type DischargeForm,
  type CaseTrackingTabId,
  type CaseTrackingSidebarFilter,
  type OrderStatus,
  type EmergencyPageId,
} from "../../types";
import {
  getCaseTrackingRows,
  getSelectedPatientData,
} from "../EmergencyCalculations";
import {
  CASE_TRACKING_TABS,
  ORDER_TEMPLATES,
  TRIAGE_META,
  DEFAULT_DISCHARGE_FORM,
  DEFAULT_ORDER_FORM,
} from "../../AsapEmergencyData";
import { buildDischargeDraft } from "../utils";

interface CaseTrackingSectionProps {
  selectedPatient: EmergencyPatient | null;
  patients: EmergencyPatient[];
  orders: EmergencyOrder[];
  observationLog: ObservationEntry[];
  observationColumns: CommonColumn<ObservationEntry>[];
  selectedPatientId: string;
  handleOpenPatientChart: (patientId: string) => void;
  openVitalsDialog: (patientId?: string) => void;
  handleSaveClinicalNote: (note: string) => void;
  handleSaveVitals: (form: VitalsForm) => void;
  handleAddOrder: (form: OrderForm) => void;
  handleOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  handleDisposition: (
    action: "discharge" | "admit" | "transfer",
    form: DischargeForm,
  ) => void;
  dashboardAvgWaitMinutes: number;
  setActivePage: (page: EmergencyPageId) => void;
  openRegistrationModal: () => void;
}

export function CaseTrackingSection({
  selectedPatient,
  patients,
  orders,
  observationLog,
  observationColumns,
  selectedPatientId,
  handleOpenPatientChart,
  openVitalsDialog,
  handleSaveClinicalNote,
  handleSaveVitals,
  handleAddOrder,
  handleOrderStatusChange,
  handleDisposition,
  dashboardAvgWaitMinutes,
  setActivePage,
  openRegistrationModal,
}: CaseTrackingSectionProps) {
  const theme = useTheme();

  const handleApplyOrderTemplate = (template: string) => {
    setOrderForm((prev) => ({ ...prev, item: template }));
  };

  const [caseTrackingTab, setCaseTrackingTab] =
    React.useState<CaseTrackingTabId>("vitals");
  const [caseTrackingFilter, setCaseTrackingFilter] =
    React.useState<CaseTrackingSidebarFilter>("All");
  const [caseTrackingSearch, setCaseTrackingSearch] = React.useState("");
  const [clinicalNoteDraft, setClinicalNoteDraft] = React.useState("");
  const [orderForm, setOrderForm] =
    React.useState<OrderForm>(DEFAULT_ORDER_FORM);
  const [dischargeForm, setDischargeForm] = React.useState<DischargeForm>(
    DEFAULT_DISCHARGE_FORM,
  );

  React.useEffect(() => {
    if (!selectedPatient) {
      setClinicalNoteDraft("");
      setDischargeForm(DEFAULT_DISCHARGE_FORM);
      setOrderForm(DEFAULT_ORDER_FORM);
      return;
    }
    setClinicalNoteDraft(selectedPatient.clinicalNotes);
    setDischargeForm(buildDischargeDraft(selectedPatient));
    setOrderForm(DEFAULT_ORDER_FORM);
  }, [selectedPatient]);

  const caseTrackingRows: EmergencyPatient[] = React.useMemo(
    () => getCaseTrackingRows(patients, caseTrackingSearch, caseTrackingFilter),
    [caseTrackingFilter, caseTrackingSearch, patients],
  );

  const {
    selectedPatientOrders,
    selectedPatientObservations,
  }: {
    selectedPatientOrders: EmergencyOrder[];
    selectedPatientObservations: ObservationEntry[];
  } = React.useMemo(
    () =>
      getSelectedPatientData(
        selectedPatient?.id,
        patients,
        orders,
        observationLog,
      ),
    [selectedPatient?.id, patients, orders, observationLog],
  );

  const handleOrderField = <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDischargeField = <K extends keyof DischargeForm>(
    field: K,
    value: DischargeForm[K],
  ) => {
    setDischargeForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSaveNote = () => {
    handleSaveClinicalNote(clinicalNoteDraft);
  };

  const onAddOrder = () => {
    handleAddOrder(orderForm);
  };

  const onHandleDisposition = (action: "discharge" | "admit" | "transfer") => {
    handleDisposition(action, dischargeForm);
  };

  const CASE_TRACKING_PANEL_H = "calc(100vh - 260px)";

  const labOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .filter((order: EmergencyOrder) => order.type === "Lab Tests")
        .slice()
        .sort((a: EmergencyOrder, b: EmergencyOrder) =>
          b.orderedAt.localeCompare(a.orderedAt),
        ),
    [selectedPatientOrders],
  );

  const radiologyOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .filter((order: EmergencyOrder) => order.type === "Radiology")
        .slice()
        .sort((a: EmergencyOrder, b: EmergencyOrder) =>
          b.orderedAt.localeCompare(a.orderedAt),
        ),
    [selectedPatientOrders],
  );

  const recentOrders = React.useMemo(
    () =>
      selectedPatientOrders
        .slice()
        .sort((a: EmergencyOrder, b: EmergencyOrder) =>
          b.orderedAt.localeCompare(a.orderedAt),
        )
        .slice(0, 5),
    [selectedPatientOrders],
  );

  const latestObservation = selectedPatientObservations[0];
  const firstObservation =
    selectedPatientObservations[selectedPatientObservations.length - 1];

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
      "Blood Pressure": (
        <BloodtypeIcon sx={{ fontSize: 20, color: palette.main }} />
      ),
      "Heart Rate": (
        <FavoriteBorderIcon sx={{ fontSize: 20, color: palette.main }} />
      ),
      SpO2: <AirIcon sx={{ fontSize: 20, color: palette.main }} />,
      "Pain / GCS": (
        <AccessibilityNewIcon sx={{ fontSize: 20, color: palette.main }} />
      ),
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

  // ── Sidebar stat counts ─────────────────────────────────
  const statCounts = [
    {
      label: "Active",
      value: patients.length,
      color: theme.palette.primary.main,
    },
    {
      label: "Critical",
      value: patients.filter(
        (p: EmergencyPatient) => p.triageLevel === "Critical",
      ).length,
      color: theme.palette.error.main,
    },
    {
      label: "Treating",
      value: patients.filter(
        (p: EmergencyPatient) => p.status === "In Treatment",
      ).length,
      color: theme.palette.warning.main,
    },
    {
      label: "Ready",
      value: patients.filter(
        (p: EmergencyPatient) => p.status === "Ready for Disposition",
      ).length,
      color: theme.palette.success.main,
    },
  ];

  const SIDEBAR_COLORS = {
    border: "#DDE8F0",
    borderStrong: "#CBD5E1",
    textMuted: "#94A3B8",
    textSecondary: "#64748B",
    textPrimary: "#0F172A",
    accent: theme.palette.primary.main,
  };

  const renderQueueRail = () => (
    <Box
      sx={{
        width: { xs: "100%", lg: 320 },
        height: "100%",
        flexShrink: 0,
        // borderRight: { xs: "none", lg: "1px solid" },
        borderBottom: { xs: "1px solid", lg: "none" },
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar header ─────────────────────── */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: theme.palette.error.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalHospitalIcon sx={{ color: "#fff", fontSize: 17 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 16,
                color: SIDEBAR_COLORS.textPrimary,
                lineHeight: 1,
              }}
            >
              Case Tracking
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: SIDEBAR_COLORS.textSecondary,
                fontWeight: 500,
                mt: 0.5,
              }}
            >
              Emergency Department
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Box
              sx={{
                position: "relative",
                width: 28,
                height: 28,
                borderRadius: 1.5,
                border: `1px solid ${SIDEBAR_COLORS.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterListIcon sx={{ fontSize: 14, color: SIDEBAR_COLORS.textSecondary }} />
              {patients.filter((p: EmergencyPatient) => p.triageLevel === "Critical").length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>
                    {patients.filter((p: EmergencyPatient) => p.triageLevel === "Critical").length}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search patient, MRN, ER no…"
          size="small"
          value={caseTrackingSearch}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setCaseTrackingSearch(event.target.value)
          }
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: SIDEBAR_COLORS.textMuted }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2.5,
              bgcolor: "#F8FAFC",
              fontSize: 13,
              "& fieldset": { borderColor: SIDEBAR_COLORS.border },
              "&:hover fieldset": { borderColor: SIDEBAR_COLORS.borderStrong },
            },
          }}
        />

        {/* Status filter pills – box-style matching pharmacy queue */}
        <Stack direction="row" spacing={0.65} sx={{ mb: 0.5 }} flexWrap="wrap">
          {(["All", "Critical", "In Treatment", "Ready"] as CaseTrackingSidebarFilter[]).map(
            (filter) => {
              const active = caseTrackingFilter === filter;
              const filterColors: Record<string, { bg: string; text: string; border: string }> = {
                Critical: { bg: alpha(theme.palette.error.main, 0.06), text: theme.palette.error.main, border: alpha(theme.palette.error.main, 0.35) },
                "In Treatment": { bg: alpha(theme.palette.warning.main, 0.06), text: theme.palette.warning.dark, border: alpha(theme.palette.warning.main, 0.35) },
                Ready: { bg: alpha(theme.palette.success.main, 0.06), text: theme.palette.success.dark, border: alpha(theme.palette.success.main, 0.35) },
                All: { bg: alpha(theme.palette.primary.main, 0.06), text: theme.palette.primary.main, border: alpha(theme.palette.primary.main, 0.35) },
              };
              const fc = filterColors[filter] ?? filterColors.All;
              return (
                <Box
                  key={filter}
                  onClick={() => setCaseTrackingFilter(filter)}
                  sx={{
                    px: 1.3,
                    py: 0.4,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: `1.5px solid ${active ? fc.border : SIDEBAR_COLORS.border}`,
                    bgcolor: active ? fc.bg : "transparent",
                    transition: "all 0.12s",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: active ? fc.text : SIDEBAR_COLORS.textSecondary,
                    }}
                  >
                    {filter}
                  </Typography>
                </Box>
              );
            },
          )}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: SIDEBAR_COLORS.border }} />

      {/* Result count + sort */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2.5, py: 1.25 }}
      >
        <Typography sx={{ fontSize: 11, color: SIDEBAR_COLORS.textMuted, fontWeight: 600 }}>
          {caseTrackingRows.length} results
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ cursor: "pointer" }}>
          <Typography sx={{ fontSize: 11, color: SIDEBAR_COLORS.textSecondary, fontWeight: 600 }}>
            Newest
          </Typography>
          <ArrowDownIcon sx={{ fontSize: 14, color: SIDEBAR_COLORS.textSecondary }} />
        </Stack>
      </Stack>

      {/* Patient list */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          pb: 2,
          maxHeight: { xs: 320, lg: "100%" },
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { borderRadius: 99, bgcolor: "divider" },
        }}
      >
        {caseTrackingRows.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ color: SIDEBAR_COLORS.textMuted, fontSize: 13 }}>
              No emergency cases match this filter.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {caseTrackingRows.map((patient: EmergencyPatient) => {
              const selected = selectedPatientId === patient.id;
              const highlightColor =
                patient.triageLevel === "Critical"
                  ? theme.palette.error.main
                  : patient.triageLevel === "Emergency" || patient.triageLevel === "Urgent"
                    ? theme.palette.warning.main
                    : theme.palette.primary.main;
              const waitProgress = Math.min(
                100,
                Math.max(10, Math.round((patient.waitingMinutes / 45) * 100)),
              );

              return (
                <Box
                  key={patient.id}
                  onClick={() => handleOpenPatientChart(patient.id)}
                  sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: `1.5px solid ${selected ? highlightColor : SIDEBAR_COLORS.border}`,
                    bgcolor: selected ? alpha(highlightColor, 0.03) : "background.paper",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: highlightColor,
                      bgcolor: alpha(highlightColor, 0.02),
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.75 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 11,
                          fontWeight: 800,
                          bgcolor: selected ? highlightColor : "#E2E8F0",
                          color: selected ? "#fff" : SIDEBAR_COLORS.textSecondary,
                          letterSpacing: 0.5,
                        }}
                      >
                        {patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: SIDEBAR_COLORS.textPrimary,
                            lineHeight: 1.1,
                          }}
                        >
                          {patient.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: SIDEBAR_COLORS.textSecondary,
                            fontWeight: 600,
                            fontFamily: "monospace",
                            lineHeight: 1.3,
                          }}
                        >
                          {patient.mrn}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: alpha(highlightColor, 0.08),
                        border: `1px solid ${alpha(highlightColor, 0.25)}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 8,
                          fontWeight: 800,
                          color: highlightColor,
                          letterSpacing: 0.5,
                        }}
                      >
                        {patient.triageLevel.toUpperCase()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.25} sx={{ pl: "42px" }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: SIDEBAR_COLORS.textSecondary,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <LocalHospitalIcon sx={{ fontSize: 12, color: SIDEBAR_COLORS.textMuted }} />
                      <Box component="span" sx={{ fontWeight: 700, color: SIDEBAR_COLORS.textPrimary }}>
                        {patient.assignedDoctor || "Unassigned"}
                      </Box>
                      {" · "}{patient.arrivalMode}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.25, flexWrap: "wrap", gap: 0.5 }}>
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.15,
                          borderRadius: 0.75,
                          bgcolor: "#F8FAFC",
                          border: `1px solid ${SIDEBAR_COLORS.border}`,
                        }}
                      >
                        <Typography sx={{ fontSize: 9, fontWeight: 700, color: SIDEBAR_COLORS.textSecondary }}>
                          {patient.assignedBed ? `Bed ${patient.assignedBed}` : "No bed"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.15,
                          borderRadius: 0.75,
                          bgcolor:
                            patient.status === "Ready for Disposition"
                              ? alpha(theme.palette.success.main, 0.08)
                              : alpha(theme.palette.info.main, 0.08),
                          border: `1px solid ${
                            patient.status === "Ready for Disposition"
                              ? alpha(theme.palette.success.main, 0.25)
                              : alpha(theme.palette.info.main, 0.2)
                          }`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 9,
                            fontWeight: 700,
                            color:
                              patient.status === "Ready for Disposition"
                                ? "success.main"
                                : "info.main",
                          }}
                        >
                          {patient.status}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 0.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                          Wait {patient.waitingMinutes} min
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: 9, color: patient.waitingMinutes >= 30 ? "warning.main" : "text.disabled" }}
                        >
                          {patient.chiefComplaint}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          mt: 0.25,
                          height: 3,
                          borderRadius: 99,
                          bgcolor: alpha(theme.palette.warning.main, 0.15),
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${waitProgress}%`,
                            height: "100%",
                            bgcolor: patient.waitingMinutes >= 30 ? "warning.main" : "success.main",
                          }}
                        />
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
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: { xs: "auto", lg: CASE_TRACKING_PANEL_H },
          maxHeight: { xs: "none", lg: CASE_TRACKING_PANEL_H },
          display: "flex",
          gap: 1.25,
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            flexShrink: 0,
            borderRadius: "16px",
            border: "1px solid #DDE8F0",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {renderQueueRail()}
        </Box>

        {/* Right panel — empty state */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          {/* Stat row */}
          <Box sx={{ display: "flex", gap: 1.25, flexShrink: 0 }}>
            {statCounts.map((s) => (
              <Box key={s.label} sx={{ flex: 1 }}>
                <StatTile label={s.label} value={s.value} />
              </Box>
            ))}
          </Box>

          {/* Empty state detail */}
          <Box
            sx={{
              flex: 1,
              borderRadius: "16px",
              border: "1px solid #DDE8F0",
              bgcolor: alpha(theme.palette.primary.main, 0.02),
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
              <Typography
                variant="body2"
                sx={{ mt: 1, color: alpha(theme.palette.common.white, 0.82) }}
              >
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
      </Box>
    );
  }

  const triageShortLabel = `T${TRIAGE_META[selectedPatient.triageLevel].rank}`;
  const systolic = Number(selectedPatient.vitals.bloodPressure.split("/")[0]);
  const diastolic = Number(selectedPatient.vitals.bloodPressure.split("/")[1]);
  const bpTone =
    Number.isFinite(systolic) &&
    Number.isFinite(diastolic) &&
    (systolic < 90 || diastolic < 60)
      ? "error"
      : systolic >= 140 || diastolic >= 90
        ? "warning"
        : "success";
  const hrTone =
    selectedPatient.vitals.heartRate >= 120
      ? "warning"
      : selectedPatient.vitals.heartRate >= 60 &&
          selectedPatient.vitals.heartRate <= 100
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

  selectedPatientObservations.slice(0, 4).forEach((entry: ObservationEntry) => {
    timelineEntries.push({
      id: entry.id,
      title: "Vitals recorded",
      actor: "ER nursing team",
      detail: `${entry.bloodPressure} · HR ${entry.heartRate} · SpO2 ${entry.spo2}% · ${entry.note}`,
      time: entry.recordedAt,
      tone: entry.spo2 < 90 || entry.painScore >= 8 ? "warning" : "info",
    });
  });

  recentOrders.slice(0, 4).forEach((order: EmergencyOrder) => {
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
          done:
            selectedPatient.vitals.spo2 <= 94 ||
            selectedPatientObservations.length > 0,
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
          done: radiologyOrders.some((order: EmergencyOrder) =>
            order.item.toLowerCase().includes("chest"),
          ),
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
          done: selectedPatientOrders.some(
            (order: EmergencyOrder) => order.type === "Medication",
          ),
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
          done: selectedPatientOrders.some(
            (order: EmergencyOrder) => order.status === "Completed",
          ),
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
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        display: "flex",
        gap: 1.25,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          height: "100%",
          flexShrink: 0,
          borderRadius: "16px",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {renderQueueRail()}
      </Box>

      {/* Right panel */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          overflow: "hidden",
        }}
      >
        {/* Stat row */}
        <Box sx={{ display: "flex", gap: 1.25, flexShrink: 0 }}>
          {statCounts.map((s) => (
            <Box key={s.label} sx={{ flex: 1 }}>
              <StatTile label={s.label} value={s.value} />
            </Box>
          ))}
        </Box>

        {/* Detail panel */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
            bgcolor: "background.paper",
            overflow: "hidden",
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
            {/* <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                // border: "1px solid",
                // borderColor: alpha(theme.palette.primary.main, 0.08),
                // bgcolor: "background.paper",
                // backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)} 0%, ${theme.palette.background.paper} 72%)`,
                // overflow: "hidden",
              }}
            > */}
              <Stack spacing={0.9} sx={{ px: { xs: 1.5, md: 1.75 }, py: 1.15 }}>
                <Stack
                  direction="row"
                  spacing={1.1}
                  alignItems="center"
                  sx={{ minWidth: 0 }}
                >
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
                  <Stack
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        lineHeight: 1.2,
                        mr: 0.25,
                      }}
                    >
                      {selectedPatient?.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={selectedPatient?.id}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      size="small"
                      label={selectedPatient?.mrn}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      size="small"
                      label={`${selectedPatient?.age}y / ${selectedPatient?.gender}`}
                      sx={{
                        bgcolor: alpha(theme.palette.text.secondary, 0.08),
                        color: "text.primary",
                        fontWeight: 700,
                      }}
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

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={0.75}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.35,
                      fontWeight: 500,
                    }}
                  >
                    {selectedPatient?.chiefComplaint}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      letterSpacing: 0.15,
                      display: "flex",
                      gap: 0.75,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Box component="span">
                      Bed {selectedPatient?.assignedBed ?? "Not assigned"}
                    </Box>
                    <Box component="span" sx={{ color: "divider" }}>
                      •
                    </Box>
                    <Box component="span">
                      {selectedPatient?.assignedDoctor}
                    </Box>
                    <Box component="span" sx={{ color: "divider" }}>
                      •
                    </Box>
                    <Box component="span">{selectedPatient?.arrivalMode}</Box>
                  </Typography>
                </Stack>
              </Stack>

              <Divider
                sx={{ borderColor: alpha(theme.palette.primary.main, 0.08) }}
              />

              <Box
                sx={{
                  px: 1,
                  py: 0.45,
                  borderBottom: "1px solid #e3edf3ff",
                  bgcolor: alpha(theme.palette.primary.main, 0.015),
                }}
              >
                <CommonTabs
                  tabs={CASE_TRACKING_TABS.map((tab) => ({
                    id: tab.id,
                    label: tab.label,
                    icon: tab.icon,
                  }))}
                  value={caseTrackingTab}
                  onChange={setCaseTrackingTab}
                  sx={{ minHeight: 0 }}
                  // tabSx={{
                  //   minHeight: 34,
                  //   px: 1.2,
                  //   borderRadius: 1.25,
                  //   fontSize: 12.5,
                  //   "&.Mui-selected": {
                  //     bgcolor: alpha(theme.palette.primary.main, 0.12),
                  //     color: theme.palette.primary.main,
                  //   },
                  // }}
                />
              </Box>
            {/* </Card> */}
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: { xs: "visible", lg: "auto" },
              p: 2,
            }}
          >
            {caseTrackingTab === "vitals" ? (
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    Latest Vitals · Captured{" "}
                    {selectedPatient?.vitals.capturedAt}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openVitalsDialog(selectedPatient?.id)}
                  >
                    Record New
                  </Button>
                </Stack>

                <Grid container spacing={1.25}>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Blood Pressure",
                      selectedPatient
                        ? selectedPatient.vitals.bloodPressure
                        : "--",
                      "mmHg",
                      bpTone,
                      bpTone === "error"
                        ? "Hypotensive"
                        : bpTone === "warning"
                          ? "Watch"
                          : "Stable",
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Heart Rate",
                      selectedPatient
                        ? String(selectedPatient.vitals.heartRate)
                        : "--",
                      "bpm",
                      hrTone,
                      hrTone === "warning"
                        ? "Tachycardia"
                        : hrTone === "success"
                          ? "Normal"
                          : "Observe",
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "SpO2",
                      selectedPatient
                        ? `${selectedPatient.vitals.spo2}%`
                        : "--",
                      "oxygen sat.",
                      spo2Tone,
                      spo2Tone === "error"
                        ? "Critical"
                        : spo2Tone === "warning"
                          ? "Low"
                          : "Adequate",
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    {createMetricCard(
                      "Pain / GCS",
                      selectedPatient
                        ? `${selectedPatient.vitals.painScore}/10`
                        : "--",
                      `GCS ${selectedPatient?.vitals.gcs ?? "--"}`,
                      painTone,
                      painTone === "warning"
                        ? "Severe pain"
                        : painTone === "info"
                          ? "Moderate"
                          : "Controlled",
                    )}
                  </Grid>
                </Grid>

               
                  <Box
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderBottom: "1px solid",
                      borderColor: "#d9e8f7ff",
                    }}
                  >
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
              </Stack>
            ) : null}

            {caseTrackingTab === "safety" ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} lg={5}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Allergies and ED Flags
                      </Typography>
                    </Box>
                    <Stack spacing={1.5} sx={{ p: 1.75 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            color: "text.secondary",
                          }}
                        >
                          Allergies
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 0.9 }}
                        >
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
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            color: "text.secondary",
                          }}
                        >
                          ED Flags
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 0.9 }}
                        >
                          {selectedPatient.safetyFlags.map((flag: string) => (
                            <Chip
                              key={flag}
                              size="small"
                              label={flag}
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.warning.main,
                                  0.12,
                                ),
                                color: "warning.dark",
                                fontWeight: 700,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            color: "text.secondary",
                          }}
                        >
                          Patient Notes
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.9,
                            p: 1.25,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {selectedPatient.clinicalNotes ||
                              "No additional ED notes captured."}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={7}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
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
                            onChange={(event) =>
                              handleOrderField(
                                "type",
                                event.target.value as any,
                              )
                            }
                            fullWidth
                          >
                            {(
                              [
                                "Lab Tests",
                                "Radiology",
                                "Medication",
                                "Procedures",
                              ] as const
                            ).map((type) => (
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
                            onChange={(event) =>
                              handleOrderField(
                                "priority",
                                event.target.value as any,
                              )
                            }
                            fullWidth
                          >
                            {(["STAT", "Urgent", "Routine"] as const).map(
                              (priority) => (
                                <MenuItem key={priority} value={priority}>
                                  {priority}
                                </MenuItem>
                              ),
                            )}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              label="Order item"
                              value={orderForm.item}
                              onChange={(event) =>
                                handleOrderField("item", event.target.value)
                              }
                              fullWidth
                            />
                            <Button variant="contained" onClick={onAddOrder}>
                              Add
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {ORDER_TEMPLATES[orderForm.type].map(
                          (template: string) => (
                            <Chip
                              key={template}
                              size="small"
                              label={template}
                              color={
                                orderForm.item === template
                                  ? "primary"
                                  : "default"
                              }
                              variant={
                                orderForm.item === template
                                  ? "filled"
                                  : "outlined"
                              }
                              onClick={() => handleApplyOrderTemplate(template)}
                            />
                          ),
                        )}
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        {recentOrders.length === 0 ? (
                          <Alert severity="info">
                            No active emergency orders for this case.
                          </Alert>
                        ) : (
                          recentOrders.map((order: EmergencyOrder) => (
                            <Card
                              key={order.id}
                              elevation={0}
                              sx={{
                                px: 1.25,
                                py: 1,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {order.item}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {order.type} · {order.orderedAt} ·{" "}
                                    {order.priority}
                                  </Typography>
                                </Box>
                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Chip label={order.status} size="small" />
                                  <TextField
                                    select
                                    size="small"
                                    value={order.status}
                                    onChange={(
                                      event: React.ChangeEvent<HTMLInputElement>,
                                    ) =>
                                      handleOrderStatusChange(
                                        order.id,
                                        event.target.value as OrderStatus,
                                      )
                                    }
                                    sx={{ minWidth: 124 }}
                                  >
                                    {(
                                      [
                                        "Pending",
                                        "In Progress",
                                        "Completed",
                                      ] as const
                                    ).map((status) => (
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
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
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
                            <Stack
                              alignItems="center"
                              sx={{ width: 28, flexShrink: 0 }}
                            >
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
                                <Box
                                  sx={{
                                    width: 2,
                                    flex: 1,
                                    bgcolor: "divider",
                                    my: 0.5,
                                  }}
                                />
                              ) : null}
                            </Stack>
                            <Box
                              sx={{
                                flex: 1,
                                pb: index < timelineEntries.length - 1 ? 1 : 0,
                              }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {entry.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontFamily: '"JetBrains Mono", monospace',
                                  }}
                                >
                                  {entry.time}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: 0.25,
                                  color: "text.secondary",
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {entry.actor}
                              </Typography>
                              <Box
                                sx={{
                                  mt: 0.75,
                                  p: 1,
                                  borderRadius: 1.5,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.02,
                                  ),
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
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
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        ED Note Composer
                      </Typography>
                    </Box>
                    <Stack spacing={1.25} sx={{ p: 1.75 }}>
                      <TextField
                        size="small"
                        value={clinicalNoteDraft}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setClinicalNoteDraft(event.target.value)}
                        multiline
                        minRows={10}
                        fullWidth
                      />
                      <Button variant="contained" onClick={onSaveNote}>
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
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          borderRadius: 0,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRightWidth: { lg: 0 },
                          "&:last-of-type": { borderRightWidth: { lg: 1 } },
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 1,
                              fontWeight: 800,
                              letterSpacing: 0.6,
                              textTransform: "uppercase",
                              color: "text.secondary",
                            }}
                          >
                            {column.title}
                          </Typography>
                          <Stack spacing={0.9}>
                            {column.items.map(
                              (item: { label: string; done: boolean }) => (
                                <Stack
                                  key={item.label}
                                  direction="row"
                                  spacing={0.8}
                                  alignItems="flex-start"
                                  sx={{
                                    color: item.done
                                      ? "text.secondary"
                                      : "text.primary",
                                    textDecoration: item.done
                                      ? "line-through"
                                      : "none",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    readOnly
                                  />
                                  <Typography variant="body2">
                                    {item.label}
                                  </Typography>
                                </Stack>
                              ),
                            )}
                          </Stack>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
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
                          onChange={(event) =>
                            handleDischargeField(
                              "diagnosis",
                              event.target.value,
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Condition on Exit"
                          value={dischargeForm.condition}
                          onChange={(event) =>
                            handleDischargeField(
                              "condition",
                              event.target.value,
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          size="small"
                          label="Instructions"
                          value={dischargeForm.instructions}
                          onChange={(event) =>
                            handleDischargeField(
                              "instructions",
                              event.target.value,
                            )
                          }
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
                          onChange={(event) =>
                            handleDischargeField("followUp", event.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Medication Advice"
                          value={dischargeForm.medications}
                          onChange={(event) =>
                            handleDischargeField(
                              "medications",
                              event.target.value,
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Destination"
                          value={dischargeForm.destination}
                          onChange={(event) =>
                            handleDischargeField(
                              "destination",
                              event.target.value,
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => setActivePage("chart")}
                      >
                        Preview AVS
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => onHandleDisposition("admit")}
                      >
                        Admit to IPD
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => onHandleDisposition("discharge")}
                      >
                        Discharge
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => onHandleDisposition("transfer")}
                      >
                        Transfer
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
