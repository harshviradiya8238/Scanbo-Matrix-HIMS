"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  NotificationsActive as NotificationsActiveIcon,
  Science as ScienceIcon,
  Visibility as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import CommonDataGrid, { CommonColumn } from "@/src/components/table/CommonDataGrid";
import { INITIAL_BED_BOARD, INPATIENT_STAYS } from "./ipd-mock-data";
import { useUser } from "@/src/core/auth/UserContext";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import { useIpdEncounters } from "./ipd-encounter-context";

type DashboardStatus = "critical" | "watch" | "stable";
type AlertTone = "error" | "warning" | "info" | "success";

interface DashboardPatient {
  id: string;
  mrn: string;
  patientName: string;
  diagnosis: string;
  bed: string;
  dayOfStay: number;
  status: DashboardStatus;
}

interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  tone: AlertTone;
  actionLabel: string;
  route: string;
  tab?: string;
  mrn?: string;
}

const DEFAULT_STATUS_BY_PATIENT_ID: Record<string, DashboardStatus> = {
  "ipd-1": "watch",
  "ipd-2": "stable",
  "ipd-3": "critical",
  "ipd-4": "stable",
};

const DAY_OF_STAY_BY_PATIENT_ID: Record<string, number> = {
  "ipd-1": 3,
  "ipd-2": 2,
  "ipd-3": 4,
  "ipd-4": 1,
};

const AVATAR_COLOR_BY_ID: Record<string, string> = {
  "ipd-1": "#1172BA",
  "ipd-2": "#7C3AED",
  "ipd-3": "#0D9488",
  "ipd-4": "#16A34A",
};

const STATUS_CONFIG: Record<
  DashboardStatus,
  { label: string; bg: string; border: string; color: string; dot: string }
> = {
  critical: { label: "Critical", bg: "#FEE2E2", border: "#FCA5A5", color: "#991B1B", dot: "#E53E3E" },
  watch:    { label: "Watch",    bg: "#FEF3C7", border: "#FDE68A", color: "#92400E", dot: "#D97706" },
  stable:   { label: "Stable",  bg: "#DCFCE7", border: "#86EFAC", color: "#166534", dot: "#16A34A" },
};

const ALERT_TONE: Record<
  AlertTone,
  { iconBg: string; iconColor: string; btnColor: string; btnBorder: string; btnHoverBg: string }
> = {
  error:   { iconBg: "#FEE2E2", iconColor: "#DC2626", btnColor: "#DC2626", btnBorder: "#FCA5A5", btnHoverBg: "#FEE2E2" },
  warning: { iconBg: "#FEF3C7", iconColor: "#D97706", btnColor: "#D97706", btnBorder: "#FDE68A", btnHoverBg: "#FEF3C7" },
  info:    { iconBg: "#E8F3FB", iconColor: "#1172BA", btnColor: "#1172BA", btnBorder: "#5BA4D4", btnHoverBg: "#E8F3FB" },
  success: { iconBg: "#DCFCE7", iconColor: "#16A34A", btnColor: "#16A34A", btnBorder: "#86EFAC", btnHoverBg: "#DCFCE7" },
};

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
}

export default function IpdDashboardPage() {
  const router = useRouter();
  const encounterRows = useIpdEncounters();
  const { permissions, role } = useUser();
  const isDoctor = role === "DOCTOR";

  const activeEncounterRows = React.useMemo(
    () => encounterRows.filter((r) => r.workflowStatus !== "discharged"),
    [encounterRows],
  );

  const inpatientRows = React.useMemo<DashboardPatient[]>(() => {
    if (activeEncounterRows.length > 0) {
      return activeEncounterRows.map((r) => ({
        id: r.patientId,
        mrn: r.mrn,
        patientName: r.patientName,
        diagnosis: r.diagnosis,
        bed: r.bed || "--",
        dayOfStay: DAY_OF_STAY_BY_PATIENT_ID[r.patientId] ?? 1,
        status: r.clinicalStatus,
      }));
    }
    return INPATIENT_STAYS.map((stay) => ({
      id: stay.id,
      mrn: stay.mrn,
      patientName: stay.patientName,
      diagnosis: stay.diagnosis,
      bed: stay.bed,
      dayOfStay: DAY_OF_STAY_BY_PATIENT_ID[stay.id] ?? 1,
      status: DEFAULT_STATUS_BY_PATIENT_ID[stay.id] ?? "stable",
    }));
  }, [activeEncounterRows]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );

  const openRoute = React.useCallback(
    (route: string, tab?: string, mrn?: string) => {
      if (!canNavigate(route)) return;
      const params = new URLSearchParams();
      if (tab) params.set("tab", tab);
      if (mrn) params.set("mrn", mrn);
      const q = params.toString();
      router.push(q ? `${route}?${q}` : route);
    },
    [canNavigate, router],
  );

  const criticalCount = inpatientRows.filter((r) => r.status === "critical").length;
  const watchCount    = inpatientRows.filter((r) => r.status === "watch").length;
  const stableCount   = inpatientRows.filter((r) => r.status === "stable").length;
  const availableBeds = INITIAL_BED_BOARD.filter((b) => b.status === "Available").length;
  const occupiedBeds  = INITIAL_BED_BOARD.filter((b) => b.status === "Occupied").length;
  const blockedBeds   = INITIAL_BED_BOARD.filter((b) => b.status === "Cleaning" || b.status === "Blocked").length;

  const clinicalStatusByPatientId = React.useMemo(() => {
    if (activeEncounterRows.length > 0) {
      const map: Record<string, DashboardStatus> = {};
      activeEncounterRows.forEach((r) => { map[r.patientId] = r.clinicalStatus; });
      return map;
    }
    return DEFAULT_STATUS_BY_PATIENT_ID;
  }, [activeEncounterRows]);

  const criticalBeds = INITIAL_BED_BOARD.filter(
    (b) => b.patientId && (clinicalStatusByPatientId[b.patientId] ?? "stable") === "critical",
  ).length;

  const criticalPatient = inpatientRows.find((r) => r.status === "critical") ?? inpatientRows[0];
  const watchPatient    = inpatientRows.find((r) => r.status === "watch")    ?? inpatientRows[0];
  const dischargeReady  = activeEncounterRows.find((r) => r.dischargeReady);
  const dischargePatient = dischargeReady
    ? inpatientRows.find((r) => r.id === dischargeReady.patientId)
    : null;

  const alerts: DashboardAlert[] = [
    {
      id: "spo2-critical",
      title: `SpO2 critical – ${criticalPatient?.patientName ?? "Patient"}`,
      detail: `Needs immediate review at Bed ${criticalPatient?.bed ?? "--"}`,
      tone: "error",
      actionLabel: "View",
      route: "/ipd/rounds",
      tab: "vitals",
      mrn: criticalPatient?.mrn,
    },
    {
      id: "medication-due",
      title: "Medication due this round",
      detail: `${watchPatient?.patientName ?? "Patient"} has active medication tasks`,
      tone: "warning",
      actionLabel: "Give",
      route: "/ipd/rounds",
      tab: "medications",
      mrn: watchPatient?.mrn,
    },
    {
      id: "lab-ready",
      title: "Lab result available",
      detail: `CBC report posted for ${watchPatient?.patientName ?? "patient"}`,
      tone: "info",
      actionLabel: "Review",
      route: "/ipd/rounds",
      tab: "orders",
      mrn: watchPatient?.mrn,
    },
    {
      id: "discharge-ready",
      title: dischargePatient
        ? `${dischargePatient.patientName} ready for discharge`
        : "Discharge checklist updates pending",
      detail: dischargePatient
        ? "Checklist and billing are complete"
        : "Complete pending items in discharge workflow",
      tone: dischargePatient ? "success" : "warning",
      actionLabel: "Process",
      route: "/ipd/discharge",
      tab: "pending",
      mrn: dischargePatient?.mrn,
    },
    {
      id: "drug-interaction",
      title: "Drug interaction alert",
      detail: `${criticalPatient?.patientName ?? "Patient"} needs medication reconciliation`,
      tone: "warning",
      actionLabel: "Review",
      route: "/ipd/charges",
      tab: "drug",
      mrn: criticalPatient?.mrn,
    },
  ];

  const ALERT_ICON: Record<string, React.ElementType> = {
    "medication-due":   MedicationIcon,
    "lab-ready":        ScienceIcon,
    "discharge-ready":  AssignmentTurnedInIcon,
  };

  const statCards = [
    { label: "Total Inpatients", value: inpatientRows.length, sub: "Current admitted census",    iconBg: "#DBEAFE", iconColor: "#1172BA", Icon: LocalHospitalIcon, valueColor: "#0D1B2A" },
    { label: "Critical",         value: criticalCount,        sub: "Requires immediate review",  iconBg: "#FEE2E2", iconColor: "#DC2626", Icon: WarningAmberIcon,  valueColor: "#DC2626" },
    { label: "Under Watch",      value: watchCount,           sub: "Close monitoring needed",     iconBg: "#FEF3C7", iconColor: "#D97706", Icon: VisibilityIcon,    valueColor: "#D97706" },
    { label: "Stable",           value: stableCount,          sub: "Clinically stable patients",  iconBg: "#DCFCE7", iconColor: "#16A34A", Icon: CheckCircleIcon,  valueColor: "#16A34A" },
    ...(!isDoctor
      ? [{ label: "Beds Available", value: availableBeds, sub: `of ${INITIAL_BED_BOARD.length} total beds`, iconBg: "#EDE9FE", iconColor: "#7C3AED", Icon: BedIcon, valueColor: "#0D1B2A" }]
      : []),
  ];

  const bedSummaryItems = [
    { id: "occupied", label: "Occupied",          value: occupiedBeds,  numColor: "#1172BA", iconColor: "#5BA4D4", bg: "#EFF6FF", Icon: BedIcon               },
    { id: "free",     label: "Free",              value: availableBeds, numColor: "#16A34A", iconColor: "#16A34A", bg: "#F0FFF4", Icon: CheckCircleIcon        },
    { id: "critical", label: "Critical",          value: criticalBeds,  numColor: "#DC2626", iconColor: "#E53E3E", bg: "#FFF5F5", Icon: WarningAmberIcon       },
    { id: "cleaning", label: "Cleaning / Blocked", value: blockedBeds,  numColor: "#D97706", iconColor: "#D97706", bg: "#FFFBEB", Icon: AssignmentTurnedInIcon },
  ];

  /* ── Table columns ── */
  const inpatientColumns: CommonColumn<DashboardPatient>[] = [
    {
      field: "patientName",
      headerName: "Patient",
      flex: 2,
      renderCell: (row) => {
        const avatarColor = AVATAR_COLOR_BY_ID[row.id] ?? "#1172BA";
        return (
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 34, height: 34, borderRadius: "50%",
                bgcolor: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}
            >
              {getInitials(row.patientName)}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0D1B2A", lineHeight: 1.2 }}>
                {row.patientName}
              </Typography>
              <Typography sx={{ fontSize: "10.5px", color: "#9AAFBF", fontFamily: "monospace", mt: 0.125 }}>
                {row.mrn}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "bed",
      headerName: "Bed",
      width: 90,
      renderCell: (row) => {
        const isIcu = row.bed.toLowerCase().includes("icu");
        return (
          <Box
            sx={{
              display: "inline-block", px: 1.25, py: 0.375, borderRadius: "7px",
              bgcolor: isIcu ? "#FEE2E2" : "#E8F3FB",
              color: isIcu ? "#991B1B" : "#1172BA",
              fontSize: 12, fontWeight: 700,
            }}
          >
            {row.bed}
          </Box>
        );
      },
    },
    {
      field: "diagnosis",
      headerName: "Diagnosis",
      flex: 3,
    },
    {
      field: "dayOfStay",
      headerName: "Day",
      width: 65,
      align: "center",
      renderCell: (row) => (
        <Box
          sx={{
            width: 30, height: 30, borderRadius: "50%",
            bgcolor: "#F5F8FB", border: "1.5px solid #DDE8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#5A7184",
          }}
        >
          D{row.dayOfStay}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      valueGetter: (row) => STATUS_CONFIG[row.status].label,
      renderCell: (row) => {
        const sc = STATUS_CONFIG[row.status];
        return (
          <Box
            sx={{
              display: "inline-flex", alignItems: "center", gap: 0.625,
              px: 1.5, py: 0.5, borderRadius: "20px",
              bgcolor: sc.bg, border: "1.5px solid", borderColor: sc.border,
              color: sc.color, fontSize: "11.5px", fontWeight: 700,
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.dot, flexShrink: 0 }} />
            {sc.label}
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 90,
      renderCell: (row) => (
        <Box
          onClick={(e) => { e.stopPropagation(); openRoute("/ipd/rounds", "rounds", row.mrn); }}
          sx={{
            display: "inline-block", px: "18px", py: "7px", borderRadius: "9px",
            border: "1.5px solid #DDE8F0", bgcolor: "#fff",
            fontSize: 12, fontWeight: 700, color: "#5A7184",
            cursor: canNavigate("/ipd/rounds") ? "pointer" : "default",
            opacity: canNavigate("/ipd/rounds") ? 1 : 0.5,
            "&:hover": canNavigate("/ipd/rounds")
              ? { bgcolor: "#E8F3FB", borderColor: "#5BA4D4", color: "#1172BA" }
              : {},
          }}
        >
          Open
        </Box>
      ),
    },
  ];

  return (
    <PageTemplate title="IPD Dashboard" currentPageTitle="IPD Dashboard" fullHeight>
      {/* Outer flex column — fills the PageTemplate height, no page scroll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* ── Page Header ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            border: "1px solid #DDE8F0",
            p: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: "12px",
                bgcolor: "#E8F3FB", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}
            >
              <LocalHospitalIcon sx={{ fontSize: 20, color: "#1172BA" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0D1B2A", lineHeight: 1.2 }}>
                IPD Dashboard
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9AAFBF", mt: 0.25 }}>
                {isDoctor
                  ? "Overview of your inpatients and clinical alerts."
                  : "Overview of all inpatients, bed status, and alerts."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ── Stats Row ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2,1fr)",
              sm: "repeat(3,1fr)",
              md: `repeat(${statCards.length}, minmax(0,1fr))`,
            },
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {statCards.map((s) => (
            <Box
              key={s.label}
              sx={{
                bgcolor: "#fff", borderRadius: "16px",
                border: "1px solid #DDE8F0", p: "16px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "11.5px", color: "#9AAFBF", mb: 0.625, fontWeight: 500 }}>
                  {s.label}
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: s.valueColor }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#9AAFBF", mt: 0.5 }}>
                  {s.sub}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 46, height: 46, borderRadius: "13px", bgcolor: s.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <s.Icon sx={{ fontSize: 22, color: s.iconColor }} />
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Body Row ── flex: 1 so it fills remaining height; children scroll internally */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* LEFT: Inpatients table — takes all remaining width */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: "#fff",
              borderRadius: "20px",
              border: "1px solid #DDE8F0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <Box
              sx={{
                px: "22px", py: "16px",
                borderBottom: "1px solid #DDE8F0",
                display: "flex", alignItems: "center", gap: 1.25,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: "10px", bgcolor: "#E8F3FB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 17, color: "#1172BA" }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                Current Inpatients
              </Typography>
              <Box
                sx={{
                  px: 1.25, py: 0.375, borderRadius: "20px",
                  bgcolor: "#E8F3FB", border: "1.5px solid #5BA4D4",
                  color: "#1172BA", fontSize: "11.5px", fontWeight: 700,
                }}
              >
                {inpatientRows.length}
              </Box>
            </Box>

            {/* CommonDataGrid fills the remaining card height; has its own pagination */}
            <CommonDataGrid<DashboardPatient>
              rows={inpatientRows}
              columns={inpatientColumns}
              getRowId={(row) => row.id}
              hideToolbar
              rowsPerPageOptions={[5, 10, 25]}
              defaultRowsPerPage={10}
              onRowClick={(row) => openRoute("/ipd/rounds", "rounds", row.mrn)}
              emptyTitle="No active inpatients"
              emptyDescription="Admitted patients will appear here."
              paperSx={{
                border: "none",
                borderRadius: 0,
                boxShadow: "none",
                flex: 1,
                minHeight: 0,
              }}
            />
          </Box>

          {/* RIGHT: Live Alerts + Bed Summary — hidden for doctor view */}
          {!isDoctor && (
            <Box
              sx={{
                width: 310,
                minWidth: 310,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                overflow: "hidden",   // ← no outer scroll; each card manages its own
              }}
            >
              {/* ── Live Alerts — flex:1, internal scroll ── */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  bgcolor: "#fff",
                  borderRadius: "20px",
                  border: "1px solid #DDE8F0",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: "18px", py: "14px",
                    borderBottom: "1px solid #DDE8F0",
                    flexShrink: 0,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <NotificationsActiveIcon sx={{ fontSize: 16, color: "#E53E3E" }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                      Live Alerts
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.625,
                      fontSize: "10.5px", fontWeight: 700, color: "#E53E3E",
                    }}
                  >
                    <Box
                      sx={{
                        width: 7, height: 7, borderRadius: "50%", bgcolor: "#E53E3E",
                        "@keyframes blink": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.2 },
                        },
                        animation: "blink 1.5s infinite",
                      }}
                    />
                    Live
                  </Box>
                </Box>

                {/* Scrollable alerts list */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 3 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "#DDE8F0", borderRadius: 3 },
                  }}
                >
                  {alerts.map((alert) => {
                    const t = ALERT_TONE[alert.tone];
                    const AlertIcon = ALERT_ICON[alert.id] ?? WarningAmberIcon;
                    return (
                      <Box
                        key={alert.id}
                        sx={{
                          display: "flex", alignItems: "flex-start", gap: 1.5,
                          px: "18px", py: "13px",
                          borderBottom: "1px solid #F3F7FB",
                          cursor: "pointer",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": { bgcolor: "#F8FBFF" },
                          transition: "background .12s",
                        }}
                      >
                        <Box
                          sx={{
                            width: 34, height: 34, borderRadius: "10px",
                            bgcolor: t.iconBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <AlertIcon sx={{ fontSize: 16, color: t.iconColor }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0D1B2A", lineHeight: 1.3 }}>
                            {alert.title}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#9AAFBF", mt: 0.25, lineHeight: 1.4 }}>
                            {alert.detail}
                          </Typography>
                        </Box>
                        <Box
                          onClick={() => openRoute(alert.route, alert.tab, alert.mrn)}
                          sx={{
                            flexShrink: 0, px: "13px", py: "5px", borderRadius: "8px",
                            border: "1.5px solid", borderColor: t.btnBorder,
                            color: t.btnColor, fontSize: "11.5px", fontWeight: 700,
                            cursor: "pointer", bgcolor: "transparent",
                            "&:hover": { bgcolor: t.btnHoverBg },
                            transition: "background .12s",
                          }}
                        >
                          {alert.actionLabel}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* ── Bed Summary — fixed height (2×2 grid, no inner scroll needed) ── */}
              <Box
                sx={{
                  flexShrink: 0,
                  bgcolor: "#fff",
                  borderRadius: "20px",
                  border: "1px solid #DDE8F0",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: "18px", py: "14px",
                    borderBottom: "1px solid #DDE8F0",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BedIcon sx={{ fontSize: 16, color: "#1172BA" }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                      Bed Summary
                    </Typography>
                  </Stack>
                  <Box
                    onClick={() => openRoute("/ipd/beds")}
                    sx={{
                      px: "14px", py: "6px", borderRadius: "20px",
                      border: "1.5px solid #DDE8F0", bgcolor: "#F5F8FB",
                      fontSize: "11.5px", fontWeight: 700, color: "#5A7184",
                      cursor: canNavigate("/ipd/beds") ? "pointer" : "default",
                      "&:hover": canNavigate("/ipd/beds")
                        ? { borderColor: "#5BA4D4", color: "#1172BA" }
                        : {},
                      transition: "all .15s",
                    }}
                  >
                    Bed Map
                  </Box>
                </Box>

                {/* 2×2 grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  {bedSummaryItems.map((item, i) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: "16px 18px",
                        bgcolor: item.bg,
                        borderBottom: i < 2 ? "1px solid #F3F7FB" : "none",
                        borderRight: i % 2 === 0 ? "1px solid #F3F7FB" : "none",
                      }}
                    >
                      <Box sx={{ float: "right", mt: "-2px" }}>
                        <item.Icon sx={{ fontSize: 18, color: item.iconColor }} />
                      </Box>
                      <Typography
                        sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1, mb: 0.5, color: item.numColor }}
                      >
                        {item.value}
                      </Typography>
                      <Typography sx={{ fontSize: "11.5px", color: "#9AAFBF", fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </PageTemplate>
  );
}
