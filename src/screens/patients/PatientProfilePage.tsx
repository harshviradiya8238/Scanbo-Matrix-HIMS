"use client";

import * as React from "react";
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
import { GLOBAL_PATIENTS, getPatientByMrn } from "@/src/mocks/global-patients";
import { getCareCompanionByMrn } from "@/src/mocks/care-companion";
import { getInfectionCasesByMrn } from "@/src/mocks/infection-control";
import { useOpdData } from "@/src/store/opdHooks";
import {
  AppointmentStatus,
  OpdAppointment,
} from "@/src/screens/opd/opd-mock-data";
import { useAppDispatch } from "@/src/store/hooks";
import { updateAppointment } from "@/src/store/slices/opdSlice";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

const formatLongDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const buildDateTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00`);

const appointmentStatusTone: Record<
  AppointmentStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  Scheduled: "info",
  "Checked-In": "success",
  "In Triage": "warning",
  "In Consultation": "warning",
  Completed: "success",
  "No Show": "error",
  Cancelled: "error",
};

const formatFrequency = (value: string) => {
  switch (value) {
    case "BD":
      return "Twice daily";
    case "OD":
      return "Once daily";
    case "HS":
      return "At bedtime";
    case "SOS":
      return "As needed";
    default:
      return value;
  }
};

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      py: 1,
      borderBottom: "1px solid",
      borderColor: "rgba(15, 23, 42, 0.06)",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value ?? "—"}
    </Typography>
  </Stack>
);

interface TabPanelProps {
  value: string;
  tab: string;
  children: React.ReactNode;
}

const TabPanel = ({ value, tab, children }: TabPanelProps) =>
  value === tab ? <Box sx={{ mt: 0 }}>{children}</Box> : null;

/* Sparkline chart — same as patient-portal lab reports */
function Sparkline({
  values,
  color,
  width = 700,
  height = 90,
  id = "vital",
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  id?: string;
}) {
  if (values.length < 2) return null;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fillPts = [
    ...pts,
    [pts[pts.length - 1][0], height],
    [pts[0][0], height],
  ];
  const fill =
    fillPts
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ") + "Z";
  const gradId = `vital-spark-grad-${id}`;
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", overflow: "visible", minWidth: 200 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? color : "#fff"}
          stroke={color}
          strokeWidth={i === pts.length - 1 ? 0 : 2}
        />
      ))}
    </svg>
  );
}

export default function PatientProfilePage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mrn = searchParams.get("mrn")?.toUpperCase() ?? "";
  const dispatch = useAppDispatch();
  const { appointments, encounters, vitalTrends, medicationCatalog } =
    useOpdData();
  const patient = getPatientByMrn(mrn);
  const tileShadow = "0 8px 18px rgba(15, 23, 42, 0.05)";
  const lightBorder = `1px solid ${alpha(theme.palette.text.primary, 0.04)}`;
  const dividerSx = {
    my: 1.5,
    borderColor: alpha(theme.palette.text.primary, 0.08),
  };
  const tabHeaderSx = { mb: 1.5 };
  const [cancelTarget, setCancelTarget] = React.useState<OpdAppointment | null>(
    null,
  );

  const opdAppointments = React.useMemo(
    () =>
      appointments.filter((appointment) => appointment.mrn === patient?.mrn),
    [appointments, patient?.mrn],
  );

  const opdEncounter = React.useMemo(
    () => encounters.find((encounter) => encounter.mrn === patient?.mrn),
    [encounters, patient?.mrn],
  );

  const timelineAppointments = React.useMemo(
    () =>
      [...opdAppointments].sort(
        (a, b) =>
          buildDateTime(b.date, b.time).getTime() -
          buildDateTime(a.date, a.time).getTime(),
      ),
    [opdAppointments],
  );

  const handleReschedule = React.useCallback(
    (appointment: OpdAppointment) => {
      router.push(
        `/appointments/calendar?mrn=${appointment.mrn}&date=${appointment.date}&appointmentId=${appointment.id}`,
      );
    },
    [router],
  );

  const handleCancelAppointment = React.useCallback(
    (appointment: OpdAppointment) => {
      if (appointment.status === "Cancelled") return;
      setCancelTarget(appointment);
    },
    [],
  );

  const confirmCancelAppointment = React.useCallback(() => {
    if (!cancelTarget) return;
    dispatch(
      updateAppointment({
        id: cancelTarget.id,
        changes: { status: "Cancelled" },
      }),
    );
    setCancelTarget(null);
  }, [cancelTarget, dispatch]);

  const latestAppointment = timelineAppointments[0];

  const vitalHistory = React.useMemo(
    () =>
      opdEncounter
        ? vitalTrends.filter((record) => record.patientId === opdEncounter.id)
        : [],
    [opdEncounter, vitalTrends],
  );

  const latestVital = vitalHistory.length
    ? vitalHistory[vitalHistory.length - 1]
    : undefined;

  const tabs = [
    { id: "history", label: "Medical History" },
    { id: "vitals", label: "Vitals Reports" },
    { id: "medications", label: "Medications" },
    { id: "ipd", label: "IPD / Inpatient" },
    { id: "billing", label: "Billing" },
    { id: "care", label: "Care Companion" },
    { id: "infection", label: "Infection Control" },
    { id: "radiology", label: "Radiology" },
    { id: "labs", label: "Lab Results" },
    { id: "immunizations", label: "Immunizations" },
    { id: "documents", label: "Documents" },
    { id: "appointments", label: "Appointments" },
    { id: "problems", label: "Problem List" },
  ];

  const [activeTab, setActiveTab] = React.useState(tabs[0].id);
  const [selectedVitalId, setSelectedVitalId] = React.useState("bp");
  const [vitalsView, setVitalsView] = React.useState<"trend" | "history">(
    "trend",
  );
  const [vitalsPeriod, setVitalsPeriod] = React.useState("3M");
  const [vitalHistPage, setVitalHistPage] = React.useState(0);
  const [vitalRowsPerPage, setVitalRowsPerPage] = React.useState(10);

  const VITAL_STATUS_CFG = React.useMemo(
    () => ({
      normal: {
        color: theme.palette.success.main,
        bg: alpha(theme.palette.success.main, 0.08),
        label: "Normal",
        border: alpha(theme.palette.success.main, 0.2),
      },
      elevated: {
        color: theme.palette.warning.dark,
        bg: alpha(theme.palette.warning.main, 0.08),
        label: "Elevated",
        border: alpha(theme.palette.warning.main, 0.2),
      },
      high: {
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.08),
        label: "High",
        border: alpha(theme.palette.error.main, 0.2),
      },
      low: {
        color: theme.palette.info.main,
        bg: alpha(theme.palette.info.main, 0.08),
        label: "Low",
        border: alpha(theme.palette.info.main, 0.2),
      },
    }),
    [theme]
  );

  const VITAL_NOTES = [
    "Resting",
    "After activity",
    "Morning",
    "Evening",
    "Clinic visit",
    "Post-walk",
    "Night reading",
    "Pre-sleep",
  ];

  /* Extract numeric values for Sparkline from vitalHistory */
  const parseVitalNum = (s: string | undefined): number => {
    if (!s) return NaN;
    const m = s.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : NaN;
  };

  const vitalChartValues = React.useMemo(() => {
    if (!vitalHistory.length) return [];
    const sorted = [...vitalHistory].sort((a, b) =>
      a.recordedAt.localeCompare(b.recordedAt),
    );
    return sorted
      .map((r) => {
        if (selectedVitalId === "bp") return parseVitalNum(r.bp?.split("/")[0]);
        if (selectedVitalId === "hr") return parseVitalNum(r.hr);
        if (selectedVitalId === "rr") return parseVitalNum(r.rr);
        if (selectedVitalId === "temp") return parseVitalNum(r.temp);
        if (selectedVitalId === "spo2") return parseVitalNum(r.spo2);
        if (selectedVitalId === "weight" || selectedVitalId === "bmi")
          return NaN;
        return r.painScore;
      })
      .filter((v) => !Number.isNaN(v));
  }, [vitalHistory, selectedVitalId]);

  /* Fallback dummy data when no real vitals — graph always visible */
  const chartValuesToShow =
    vitalChartValues.length >= 2
      ? vitalChartValues
      : selectedVitalId === "bp"
        ? [148, 142, 138, 145, 140, 136, 132, 128]
        : selectedVitalId === "hr"
          ? [100, 96, 88, 92, 84, 82, 78, 74]
          : selectedVitalId === "rr"
            ? [20, 18, 17, 18, 16, 16, 15, 14]
            : selectedVitalId === "temp"
              ? [98.7, 98.6, 98.4, 98.6, 98.2, 98.3, 98.1, 98.2]
              : selectedVitalId === "spo2"
                ? [97, 98, 99, 98, 99, 98, 99, 99]
                : selectedVitalId === "weight"
                  ? [82, 81.5, 81, 80.5, 80, 79.5, 79, 78.5]
                  : selectedVitalId === "bmi"
                    ? [28.5, 28.2, 27.9, 27.6, 27.3, 27.0, 26.7, 26.4]
                    : [2, 1, 1, 0, 0, 0, 0, 0];

  const vitalChartColor = React.useMemo(() => {
    const map: Record<string, string> = {
      bp: theme.palette.primary.main,
      hr: theme.palette.error.main,
      spo2: theme.palette.info.main,
      temp: theme.palette.warning.dark,
      rr: theme.palette.success.dark,
      weight: theme.palette.text.secondary,
      bmi: theme.palette.warning.main,
    };
    return map[selectedVitalId] ?? theme.palette.primary.main;
  }, [selectedVitalId, theme]);

  const vitalHistorySorted = React.useMemo(
    () =>
      [...vitalHistory].sort((a, b) =>
        b.recordedAt.localeCompare(a.recordedAt)
      ),
    [vitalHistory]
  );

  const vitalTotalHistPages = Math.max(
    1,
    Math.ceil(vitalHistorySorted.length / vitalRowsPerPage)
  );
  const vitalPagedHistory = vitalHistorySorted.slice(
    vitalHistPage * vitalRowsPerPage,
    vitalHistPage * vitalRowsPerPage + vitalRowsPerPage
  );

  const getVitalValue = (r: (typeof vitalHistory)[0]) => {
    const v =
      selectedVitalId === "bp"
        ? r.bp
        : selectedVitalId === "hr"
          ? r.hr
          : selectedVitalId === "rr"
            ? r.rr
            : selectedVitalId === "temp"
              ? r.temp
              : selectedVitalId === "spo2"
                ? r.spo2
                : selectedVitalId === "weight"
                  ? opdEncounter?.vitals?.weightKg
                  : selectedVitalId === "bmi"
                    ? opdEncounter?.vitals?.bmi
                    : String(r.painScore);
    return v ?? "—";
  };

  const getVitalUnit = () =>
    selectedVitalId === "bp"
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
                : "";

  const readingStatus = (val: string | number): "normal" | "elevated" | "high" | "low" => {
    const n = typeof val === "string" ? parseFloat(val.replace(/[^\d.]/g, "")) : val;
    if (Number.isNaN(n)) return "normal";
    if (selectedVitalId === "bp") return n > 140 ? "elevated" : n > 120 ? "elevated" : "normal";
    if (selectedVitalId === "hr") return n > 100 ? "high" : n < 60 ? "low" : "normal";
    if (selectedVitalId === "spo2") return n < 95 ? "low" : n < 98 ? "elevated" : "normal";
    if (selectedVitalId === "temp") return n > 99 ? "high" : n < 97 ? "low" : "normal";
    if (selectedVitalId === "rr") return n > 20 ? "high" : n < 12 ? "low" : "normal";
    return "normal";
  };

  const formatVitalDate = (recordedAt: string) => {
    const parts = recordedAt.split(" ");
    const datePart = parts[0];
    if (!datePart) return recordedAt;
    const [y, m, d] = datePart.split("-").map(Number);
    const date = new Date(y, (m ?? 1) - 1, d);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  React.useEffect(() => {
    setVitalHistPage(0);
  }, [selectedVitalId, vitalRowsPerPage]);

  const payerType = latestAppointment?.payerType ?? "General";
  const insuranceLabel =
    payerType === "Insurance"
      ? "HealthSecure TPA"
      : payerType === "Corporate"
        ? "Scanbo Corporate Plan"
        : "Self Pay";

  const allergiesRaw = opdEncounter?.allergies ?? [];
  const allergies = allergiesRaw.filter(
    (item) => item && item.toLowerCase() !== "no known allergies",
  );
  const allergyDisplay = allergies.length ? allergies : ["No known allergies"];

  const problems = opdEncounter?.problems ?? [];

  const patientMedications = React.useMemo(() => {
    if (!medicationCatalog.length) return [];

    const preferredNames = new Set<string>();
    if (patient?.tags.includes("Diabetic")) preferredNames.add("Metformin");
    if (patient?.tags.includes("Hypertension"))
      preferredNames.add("Telmisartan");
    if (patient?.tags.includes("Cardiac")) preferredNames.add("Atorvastatin");

    const prioritized = medicationCatalog.filter((med) =>
      preferredNames.has(med.genericName),
    );
    const fallback = medicationCatalog.filter(
      (med) => !preferredNames.has(med.genericName),
    );
    const selected = [...prioritized, ...fallback].slice(0, 4);

    return selected.map((med, index) => ({
      name: med.genericName,
      dosage: med.strength,
      frequency: med.commonFrequency,
      status:
        index === selected.length - 1 && selected.length > 2
          ? "Discontinued"
          : "Active",
    }));
  }, [medicationCatalog, patient?.tags]);

  const medicationTableRows = React.useMemo(() => {
    if (!medicationCatalog.length) return [];

    const metaMap: Record<
      string,
      {
        subtitle: string;
        startDate: string;
        refills: string;
        status?: "Active" | "Completed";
      }
    > = {
      Metformin: {
        subtitle: "Antihyperglycemic – Biguanide",
        startDate: "2024-01-15",
        refills: "3 remaining",
      },
      Telmisartan: {
        subtitle: "Antihypertensive – ARB",
        startDate: "2023-11-02",
        refills: "2 remaining",
      },
      Pantoprazole: {
        subtitle: "Proton Pump Inhibitor",
        startDate: "2024-02-01",
        refills: "2 remaining",
      },
      Paracetamol: {
        subtitle: "Analgesic / Antipyretic",
        startDate: "2024-03-10",
        refills: "PRN",
      },
      Atorvastatin: {
        subtitle: "Cholesterol Management – Statin",
        startDate: "2024-08-05",
        refills: "4 remaining",
      },
      "Amoxicillin + Clavulanate": {
        subtitle: "Antibiotic",
        startDate: "2025-06-22",
        refills: "N/A",
        status: "Completed",
      },
    };

    const preferredNames = new Set<string>();
    if (patient?.tags.includes("Diabetic")) preferredNames.add("Metformin");
    if (patient?.tags.includes("Hypertension"))
      preferredNames.add("Telmisartan");
    if (patient?.tags.includes("Cardiac")) preferredNames.add("Atorvastatin");

    const prioritized = medicationCatalog.filter((med) =>
      preferredNames.has(med.genericName),
    );
    const fallback = medicationCatalog.filter(
      (med) => !preferredNames.has(med.genericName),
    );
    const selected = [...prioritized, ...fallback].slice(0, 6);

    const prescriber =
      latestAppointment?.provider ?? patient?.primaryDoctor ?? "—";

    return selected.map((med, index) => {
      const meta = metaMap[med.genericName];
      const fallbackStart = patient?.lastVisit ?? "2024-01-01";
      const status =
        meta?.status ??
        (index === selected.length - 1 ? "Completed" : "Active");

      return {
        name: med.genericName,
        subtitle: meta?.subtitle ?? med.form,
        dosage: `${med.strength} · ${formatFrequency(med.commonFrequency)}`,
        prescriber,
        startDate: meta?.startDate ?? fallbackStart,
        status,
        refills: meta?.refills ?? (status === "Active" ? "3 remaining" : "N/A"),
      };
    });
  }, [
    latestAppointment?.provider,
    medicationCatalog,
    patient?.primaryDoctor,
    patient?.lastVisit,
    patient?.tags,
  ]);

  const labResults = [
    {
      category: "Metabolic Panel",
      results: [
        {
          test: "Glucose (Fasting)",
          value: "98 mg/dL",
          range: "70-100",
          status: "Normal",
        },
        {
          test: "Creatinine",
          value: "0.9 mg/dL",
          range: "0.6-1.3",
          status: "Normal",
        },
      ],
    },
    {
      category: "Lipid Profile",
      results: [
        {
          test: "LDL Cholesterol",
          value: "102 mg/dL",
          range: "<100",
          status: "Borderline",
        },
        {
          test: "HDL Cholesterol",
          value: "52 mg/dL",
          range: ">40",
          status: "Normal",
        },
      ],
    },
  ];

  const documents = [
    { name: "Annual Physical Summary", type: "PDF", date: "2026-02-04" },
    { name: "Lab Report - Lipid Profile", type: "PDF", date: "2026-02-01" },
    { name: "Imaging Order - Chest X-Ray", type: "Order", date: "2025-12-18" },
  ];

  const immunizations = [
    { name: "Influenza", date: "2025-10-01", status: "Completed" },
    { name: "COVID-19 Booster", date: "2025-08-15", status: "Completed" },
    { name: "Tetanus (Tdap)", date: "2023-03-12", status: "Completed" },
  ];

  // ─── IPD / Inpatient Mock ─────────────────────
  const ipdAdmissions = [
    {
      id: "IPD-" + (patient?.mrn ?? "XXX").replace("MRN-", ""),
      admissionDate: "2026-02-01",
      dischargeDate: patient?.status === "Admitted" ? null : "2026-02-10",
      ward: patient?.department ?? "General Ward",
      bed: "B-204",
      primaryDiagnosis: patient?.tags?.[0] ?? "General Observation",
      consultant: patient?.primaryDoctor ?? "Dr. Nisha Rao",
      status: patient?.status === "Admitted" ? "Active" : "Discharged",
      notes:
        "Patient admitted with chief complaint. Vitals stable. Monitoring in progress.",
    },
    {
      id: "IPD-" + (patient?.mrn ?? "XXX").replace("MRN-", "") + "-PREV",
      admissionDate: "2025-09-12",
      dischargeDate: "2025-09-19",
      ward: "General Medicine",
      bed: "A-110",
      primaryDiagnosis: "Acute Respiratory Infection",
      consultant: patient?.primaryDoctor ?? "Dr. Nisha Rao",
      status: "Discharged",
      notes:
        "7-day admission. Responded well to IV antibiotics. Discharged with oral medication.",
    },
  ];

  // ─── Billing Mock ────────────────────────────
  const billingInvoices = [
    {
      id: "INV-2026-0042",
      date: "2026-02-10",
      description: "IPD Stay · 9 days (Ward B)",
      amount: 24500,
      paid: 24500,
      status: "Paid",
    },
    {
      id: "INV-2026-0061",
      date: "2026-02-12",
      description: "Lab Panel: CBC, Metabolic, Lipids",
      amount: 3200,
      paid: 3200,
      status: "Paid",
    },
    {
      id: "INV-2026-0088",
      date: "2026-02-28",
      description: "OPD Consultation + Medications",
      amount: 1800,
      paid: 0,
      status: "Pending",
    },
    {
      id: "INV-2026-0094",
      date: "2026-03-05",
      description: "Chest X-Ray + Radiologist Fee",
      amount: 2200,
      paid: 0,
      status: "Pending",
    },
  ];
  const totalBilled = billingInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = billingInvoices.reduce((s, i) => s + i.paid, 0);
  const balanceDue = totalBilled - totalPaid;

  // ─── Care Companion (from shared mock, MRN-based) ──
  const careCompanion = getCareCompanionByMrn(mrn);

  // ─── Infection Control (from shared mock, MRN-based) ──
  const infectionCases = getInfectionCasesByMrn(mrn);

  // ─── Radiology Mock ──────────────────────────
  const radiologyOrders = [
    {
      id: "RAD-20260305-01",
      test: "Chest X-Ray (PA View)",
      orderedBy: patient?.primaryDoctor ?? "Dr. Nisha Rao",
      orderedOn: "2026-03-05",
      status: "Pending",
      modality: "X-Ray",
      priority: "Routine",
      reportUrl: null,
    },
    {
      id: "RAD-20260210-01",
      test: "CT Thorax (without contrast)",
      orderedBy: patient?.primaryDoctor ?? "Dr. Nisha Rao",
      orderedOn: "2026-02-10",
      status: "Completed",
      modality: "CT Scan",
      priority: "Urgent",
      reportUrl: "#",
    },
    {
      id: "RAD-20260115-01",
      test: "Ultrasound Abdomen",
      orderedBy: "Dr. Sameer Kulkarni",
      orderedOn: "2026-01-15",
      status: "Completed",
      modality: "Ultrasound",
      priority: "Routine",
      reportUrl: "#",
    },
  ];

  const completedVisits = opdAppointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;
  const showRate = opdAppointments.length
    ? Math.round((completedVisits / opdAppointments.length) * 100)
    : null;

  const vitalTiles = [
    {
      label: "Blood Pressure",
      value: latestVital?.bp ?? opdEncounter?.vitals.bp ?? "—",
      icon: <MonitorHeartIcon fontSize="small" />,
    },
    {
      label: "Heart Rate",
      value: latestVital?.hr ?? opdEncounter?.vitals.hr ?? "—",
      icon: <FavoriteIcon fontSize="small" />,
    },
    {
      label: "Temperature",
      value: latestVital?.temp ?? opdEncounter?.vitals.temp ?? "—",
      icon: <ThermostatIcon fontSize="small" />,
    },
    {
      label: "Blood Glucose",
      value: latestVital?.rr ?? opdEncounter?.vitals.rr ?? "—",
      icon: <AirIcon fontSize="small" />,
    },
    {
      label: "SpO2",
      value: latestVital?.spo2 ?? opdEncounter?.vitals.spo2 ?? "—",
      icon: <WaterDropIcon fontSize="small" />,
    },
    {
      label: "Pain Level",
      value:
        latestVital?.painScore !== undefined
          ? `${latestVital.painScore}/10`
          : "—",
      icon: <HealingIcon fontSize="small" />,
    },
    {
      label: "Weight",
      value: opdEncounter?.vitals.weightKg
        ? `${opdEncounter.vitals.weightKg} kg`
        : "—",
      icon: <ScaleIcon fontSize="small" />,
    },
    {
      label: "BMI",
      value: opdEncounter?.vitals.bmi ?? "—",
      icon: <FitnessCenterIcon fontSize="small" />,
    },
  ];

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
      <Stack spacing={2.5}>
        <WorkspaceHeaderCard
          sx={{
            p: 2,
            borderRadius: 2,
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

            <Card  sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
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
                <TabPanel value={activeTab} tab="history">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <HistoryIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Encounter Timeline
                    </Typography>
                  </Stack>
                  {timelineAppointments.length ? (
                    <Box
                      sx={{
                        position: "relative",
                        pl: 4,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 16,
                          top: 6,
                          bottom: 6,
                          width: 2,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.08,
                          ),
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {timelineAppointments.map((appointment) => (
                          <Box
                            key={appointment.id}
                            sx={{ position: "relative", pl: 1 }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: -24,
                                top: 20,
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: "background.paper",
                                border: "3px solid",
                                borderColor: theme.palette.primary.main,
                              }}
                            />
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(
                                  theme.palette.text.primary,
                                  0.02,
                                ),
                                border: lightBorder,
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {appointment.visitType} ·{" "}
                                  {appointment.department}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatLongDate(appointment.date)}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {appointment.chiefComplaint ||
                                  "Clinical encounter logged."}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={2}
                                flexWrap="wrap"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Provider: {appointment.provider}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Department: {appointment.department}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Type: {appointment.visitType}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Status: {appointment.status}
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No encounters recorded for this patient yet.
                    </Typography>
                  )}
                </TabPanel>

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
                                bgcolor: isActive
                                  ? alpha(v.color, 0.03)
                                  : "transparent",
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
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Typography
                                      // variant="h4"
                                      sx={{
                                        fontWeight: 800,
                                        color: isActive
                                          ? v.color
                                          : "text.primary",
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      {latestVal ?? "--"}
                                    </Typography>
                                    <TrendingUpIcon
                                      sx={{
                                        fontSize: 12,
                                        color: alpha(
                                          theme.palette.success.main,
                                          0.6,
                                        ),
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
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
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
                                {selectedVitalId
                                  .toUpperCase()
                                  .replace("_", " ")}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Historical Trend & Analysis
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1}>
                            {["1W", "1M", "3M", "6M", "All"].map((p) => (
                              <Button
                                key={p}
                                size="small"
                                variant={
                                  vitalsPeriod === p ? "contained" : "text"
                                }
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
                                  color:
                                    vitalsPeriod === p
                                      ? "#fff"
                                      : "text.secondary",
                                  "&:hover": {
                                    bgcolor:
                                      vitalsPeriod === p
                                        ? theme.palette.primary.dark
                                        : alpha(
                                            theme.palette.primary.main,
                                            0.08,
                                          ),
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                                vitalsView === "trend"
                                  ? "primary.main"
                                  : "text.secondary",
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
                              {vitalHistory.length} readings · Last{" "}
                              {vitalsPeriod}
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
                                    : selectedVitalId === "hr" ||
                                        selectedVitalId === "rr"
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
                                {vitalChartValues.length < 2 &&
                                  vitalHistory.length < 2 && (
                                    <Chip
                                      label="Sample trend"
                                      size="small"
                                      sx={{
                                        ml: 1,
                                        fontSize: "0.65rem",
                                        height: 18,
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.1,
                                        ),
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
                                        i %
                                          Math.max(
                                            1,
                                            Math.floor(arr.length / 6),
                                          ) ===
                                          0,
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
                                        vitalHistPage * vitalRowsPerPage +
                                          vitalRowsPerPage,
                                        vitalHistorySorted.length
                                      )}`
                                    : "0-0"}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
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
                                        vitalRowsPerPage === n
                                          ? "filled"
                                          : "outlined"
                                      }
                                      color={
                                        vitalRowsPerPage === n
                                          ? "primary"
                                          : "default"
                                      }
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
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.18,
                                  ),
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
                                        bgcolor: alpha(
                                          theme.palette.grey[100],
                                          0.9,
                                        ),
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
                                    vitalPagedHistory.map((record, idx) => {
                                      const globalIdx =
                                        vitalHistPage * vitalRowsPerPage + idx;
                                      const isLatest = globalIdx === 0;
                                      const val = getVitalValue(record);
                                      const rSt = readingStatus(val);
                                      const rCfg = VITAL_STATUS_CFG[rSt];
                                      const note =
                                        VITAL_NOTES[
                                          globalIdx % VITAL_NOTES.length
                                        ];
                                      return (
                                        <TableRow
                                          key={record.id}
                                          hover
                                          sx={{
                                            bgcolor: isLatest
                                              ? alpha(
                                                  theme.palette.primary.main,
                                                  0.04,
                                                )
                                              : idx % 2 === 0
                                                ? "background.paper"
                                                : alpha(
                                                    theme.palette.grey[50],
                                                    0.6,
                                                  ),
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
                                                {formatVitalDate(
                                                  record.recordedAt
                                                )}
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
                                                      theme.palette.primary
                                                        .main,
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
                                  Page {vitalHistPage + 1} of{" "}
                                  {vitalTotalHistPages}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                >
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
                                    onClick={() =>
                                      setVitalHistPage((p) => p - 1)
                                    }
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
                                  {Array.from(
                                    { length: vitalTotalHistPages },
                                    (_, i) => i
                                  )
                                    .filter(
                                      (i) =>
                                        Math.abs(i - vitalHistPage) <= 2
                                    )
                                    .map((i) => (
                                      <Button
                                        key={i}
                                        size="small"
                                        variant={
                                          i === vitalHistPage
                                            ? "contained"
                                            : "outlined"
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
                                    disabled={
                                      vitalHistPage >= vitalTotalHistPages - 1
                                    }
                                    onClick={() =>
                                      setVitalHistPage((p) => p + 1)
                                    }
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
                                    disabled={
                                      vitalHistPage >= vitalTotalHistPages - 1
                                    }
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

                <TabPanel value={activeTab} tab="medications">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
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
                          "& .MuiTableRow-root:last-of-type .MuiTableCell-root":
                            {
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
                              backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.05,
                              ),
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
                          {medicationTableRows.map((med) => (
                            <TableRow
                              key={med.name}
                              sx={{
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.text.primary,
                                    0.03,
                                  ),
                                },
                              }}
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {med.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {med.subtitle}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {med.dosage}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {med.prescriber}
                                </Typography>
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
                                        ? alpha(
                                            theme.palette.success.main,
                                            0.12,
                                          )
                                        : alpha(
                                            theme.palette.text.primary,
                                            0.08,
                                          ),
                                    color:
                                      med.status === "Active"
                                        ? theme.palette.success.main
                                        : theme.palette.text.secondary,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
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

                {/* ══════════ IPD / INPATIENT TAB ══════════ */}
                <TabPanel value={activeTab} tab="ipd">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <HotelIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      IPD / Inpatient Admissions
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {ipdAdmissions.map((adm) => (
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
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
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
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
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
                          ].map((f) => (
                            <Box key={f.label}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mb: 0.25 }}
                              >
                                {f.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
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

                {/* ══════════ BILLING TAB ══════════ */}
                <TabPanel value={activeTab} tab="billing">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <ReceiptIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Billing & Invoices
                    </Typography>
                  </Stack>
                  {/* Summary Cards */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    {[
                      {
                        label: "Total Billed",
                        value: `₹${totalBilled.toLocaleString()}`,
                        color: theme.palette.primary.main,
                      },
                      {
                        label: "Total Paid",
                        value: `₹${totalPaid.toLocaleString()}`,
                        color: theme.palette.success.main,
                      },
                      {
                        label: "Balance Due",
                        value: `₹${balanceDue.toLocaleString()}`,
                        color:
                          balanceDue > 0
                            ? theme.palette.error.main
                            : theme.palette.success.main,
                      },
                    ].map((card) => (
                      <Box
                        key={card.label}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          background: alpha(card.color, 0.06),
                          borderLeft: `4px solid ${card.color}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {card.label}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: card.color }}
                        >
                          {card.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {/* Invoice Table */}
                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: lightBorder,
                      overflowX: "auto",
                    }}
                  >
                    <Table size="small" sx={{ minWidth: 650 }}>
                      <TableHead
                        sx={{
                          "& .MuiTableCell-root": {
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.72rem",
                            letterSpacing: "0.05em",
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            color: "text.secondary",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {billingInvoices.map((inv) => (
                          <TableRow
                            key={inv.id}
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.text.primary,
                                  0.02,
                                ),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "primary.main" }}
                              >
                                {inv.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(inv.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {inv.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                ₹{inv.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={inv.status}
                                sx={{
                                  fontWeight: 600,
                                  bgcolor:
                                    inv.status === "Paid"
                                      ? alpha(theme.palette.success.main, 0.12)
                                      : inv.status === "Overdue"
                                        ? alpha(theme.palette.error.main, 0.12)
                                        : alpha(
                                            theme.palette.warning.main,
                                            0.12,
                                          ),
                                  color:
                                    inv.status === "Paid"
                                      ? "success.dark"
                                      : inv.status === "Overdue"
                                        ? "error.dark"
                                        : "warning.dark",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                {/* ══════════ CARE COMPANION TAB ══════════ */}
                <TabPanel value={activeTab} tab="care">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
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
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        Not Enrolled in Care Companion
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2.5, maxWidth: 450, mx: "auto" }}
                      >
                        This patient is not enrolled in post-discharge care
                        monitoring. Enroll from the Care Companion module to
                        track vitals, adherence, and care goals.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<OpenInNewIcon />}
                        onClick={() =>
                          router.push("/clinical/modules/care-companion")
                        }
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
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
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
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                              >
                                {careCompanion.program} Program
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Enrolled: {careCompanion.enrolledDate || "N/A"}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
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
                                        ? alpha(
                                            theme.palette.text.secondary,
                                            0.12,
                                          )
                                        : alpha(
                                            theme.palette.success.main,
                                            0.12,
                                          ),
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
                            subtitle={
                              careCompanion.bpAlert ? "Above Range" : "Stable"
                            }
                            icon={<WaterDropIcon fontSize="small" />}
                            variant="soft"
                            sx={{
                              bgcolor: careCompanion.bpAlert
                                ? alpha(theme.palette.error.main, 0.08)
                                : alpha(theme.palette.success.main, 0.08),
                              color: careCompanion.bpAlert
                                ? "error.main"
                                : "success.dark",
                            }}
                          />
                        )}
                        {careCompanion.glucose && (
                          <StatTile
                            label="Glucose Level"
                            value={`${careCompanion.glucose} mg/dL`}
                            subtitle={
                              careCompanion.glucoseAlert
                                ? "Critical Value"
                                : "Normal"
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
                                            <TableCell
                                              sx={{ py: 1.5, fontWeight: 600 }}
                                            >
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
                                <HistoryIcon
                                  sx={{ color: "primary.main", fontSize: 20 }}
                                />
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Recent Care Updates
                                </Typography>
                              </Stack>
                              <Stack spacing={1.5}>
                                {/* Merged Activity Stream (Check-ins + Notes) would go here, 
                                    but we'll keep them separate for now but better styled */}
                                {careCompanion.recentCheckIns
                                  ?.slice(0, 3)
                                  .map((c, idx) => (
                                    <Box
                                      key={`check-${idx}`}
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: lightBorder,
                                        borderLeft: `4px solid ${theme.palette.info.main}`,
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.02,
                                        ),
                                      }}
                                    >
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ mb: 0.5 }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 700 }}
                                        >
                                          Check-in Captured
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {c.date}
                                        </Typography>
                                      </Stack>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
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
                                {careCompanion.careNotes
                                  ?.slice(0, 2)
                                  .map((note, idx) => (
                                    <Box
                                      key={`note-${idx}`}
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: lightBorder,
                                        borderLeft: `4px solid ${theme.palette.warning.main}`,
                                        bgcolor: alpha(
                                          theme.palette.warning.main,
                                          0.02,
                                        ),
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
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {note.date} {note.time}
                                        </Typography>
                                      </Stack>
                                      <Typography
                                        variant="body2"
                                        sx={{ mt: 0.5 }}
                                      >
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
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700 }}
                                >
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
                                        ? alpha(
                                            theme.palette.success.main,
                                            0.05,
                                          )
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
                                        color: g.done
                                          ? "success.main"
                                          : "text.disabled",
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
                                        color: g.done
                                          ? "text.secondary"
                                          : "text.primary",
                                        textDecoration: g.done
                                          ? "line-through"
                                          : "none",
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
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05,
                                ),
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
                                Access the full Care Companion dashboard for
                                more detailed analysis and configuration.
                              </Typography>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<OpenInNewIcon />}
                                onClick={() =>
                                  router.push(
                                    "/clinical/modules/care-companion",
                                  )
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

                {/* ══════════ INFECTION CONTROL TAB ══════════ */}
                <TabPanel value={activeTab} tab="infection">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <BugReportIcon fontSize="small" color="error" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Infection Control
                    </Typography>
                  </Stack>

                  {infectionCases.length > 0 ? (
                    <Stack spacing={2.5}>
                      {infectionCases.map((c) => (
                        <Box
                          key={c.id}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            bgcolor: alpha(theme.palette.error.main, 0.02),
                            borderLeft: `6px solid ${theme.palette.error.main}`,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Isolation Type Banner */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              bgcolor: "error.main",
                              color: "white",
                              px: 2,
                              py: 0.5,
                              borderBottomLeftRadius: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <SecurityIcon sx={{ fontSize: 16 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {c.isolationType} Isolation Required
                            </Typography>
                          </Box>

                          <Stack spacing={2}>
                            {/* Main Organism Info */}
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="flex-start"
                            >
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  color: "error.main",
                                }}
                              >
                                <BugReportIcon sx={{ fontSize: 28 }} />
                              </Box>
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 800,
                                    color: "error.dark",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {c.organism} Detected
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Case ID: {c.id} · {c.status} Case
                                </Typography>
                              </Box>
                            </Stack>

                            <Divider
                              sx={{ borderStyle: "dashed", opacity: 0.6 }}
                            />

                            {/* Details Grid */}
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  sm: "repeat(3, 1fr)",
                                },
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Location
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {c.unit} · Bed {c.bed}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  IC Status
                                </Typography>
                                <Chip
                                  label={c.icStatus}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                    bgcolor: alpha(
                                      theme.palette.warning.main,
                                      0.1,
                                    ),
                                    color: "warning.dark",
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Risk Level
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      c.risk === "High"
                                        ? "error.main"
                                        : "warning.dark",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  {c.risk} Risk
                                </Typography>
                              </Box>
                            </Box>

                            {c.notes && (
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(
                                    theme.palette.text.primary,
                                    0.03,
                                  ),
                                  border: lightBorder,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontStyle: "italic",
                                    color: "text.secondary",
                                  }}
                                >
                                  "{c.notes}"
                                </Typography>
                              </Box>
                            )}

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-end"
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {c.flaggedOn
                                    ? `Flagged on ${c.flaggedOn} by ${c.flaggedBy ?? "System"}`
                                    : `Updated ${c.lastUpdate}`}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                endIcon={
                                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                                }
                                onClick={() =>
                                  router.push(
                                    "/clinical/modules/bugsy-infection-control",
                                  )
                                }
                                sx={{
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 700,
                                  boxShadow: "none",
                                  color: "common.white",
                                  "&:hover": {
                                    // boxShadow: "none",
                                    // bgcolor: "error.dark",
                                  },
                                }}
                              >
                                View Analysis
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        p: 4,
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                        textAlign: "center",
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 32, color: "success.main", mb: 1 }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "success.main" }}
                      >
                        No Infection Flags
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        This patient has no active infection control alerts or
                        pathogen flags.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() =>
                          router.push(
                            "/clinical/modules/bugsy-infection-control",
                          )
                        }
                      >
                        Open Infection Control
                      </Button>
                    </Box>
                  )}
                </TabPanel>

                {/* ══════════ RADIOLOGY TAB ══════════ */}
                <TabPanel value={activeTab} tab="radiology">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <RadioButtonCheckedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Radiology Orders
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {/* Pending Banner */}
                    {radiologyOrders.filter((r) => r.status === "Pending")
                      .length > 0 && (
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
                        <WarningAmberIcon
                          sx={{ color: "warning.main", fontSize: 20 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "warning.dark" }}
                        >
                          {
                            radiologyOrders.filter(
                              (r) => r.status === "Pending",
                            ).length
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
                          {radiologyOrders.map((order) => (
                            <TableRow
                              key={order.id}
                              sx={{
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.text.primary,
                                    0.02,
                                  ),
                                },
                              }}
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {order.test}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {order.id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {order.modality}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {order.orderedBy}
                                </Typography>
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
                                        ? alpha(
                                            theme.palette.success.main,
                                            0.12,
                                          )
                                        : alpha(
                                            theme.palette.warning.main,
                                            0.12,
                                          ),
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
                                    endIcon={
                                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                                    }
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

                <TabPanel value={activeTab} tab="labs">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <ScienceIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Lab Results
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {labResults.map((category) => (
                      <Box
                        key={category.category}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.02,
                          ),
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <ScienceIcon fontSize="small" color="primary" />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            {category.category}
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5}>
                          {category.results.map((result) => (
                            <Box
                              key={result.test}
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  sm: "2fr 1fr 1fr auto",
                                },
                                gap: 1,
                                alignItems: "center",
                                p: 1.2,
                                borderRadius: 1.5,
                                border: lightBorder,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {result.test}
                              </Typography>
                              <Typography variant="body2">
                                {result.value}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Range {result.range}
                              </Typography>
                              <Chip
                                label={result.status}
                                size="small"
                                color={
                                  result.status === "Normal"
                                    ? "success"
                                    : "warning"
                                }
                                variant="outlined"
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} tab="imaging">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <ImageOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Imaging Studies
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    No imaging studies available.
                  </Typography>
                </TabPanel>

                <TabPanel value={activeTab} tab="documents">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <DescriptionIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Documents
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {documents.map((doc) => (
                      <Grid item xs={12} sm={6} md={4} key={doc.name}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: lightBorder,
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.02,
                            ),
                            height: "100%",
                          }}
                        >
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1.5,
                                display: "grid",
                                placeItems: "center",
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.12,
                                ),
                                color: theme.palette.primary.main,
                              }}
                            >
                              <DescriptionIcon fontSize="small" />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {doc.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {doc.type} · {formatDate(doc.date)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} tab="appointments">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <EventNoteIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Appointments
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {timelineAppointments.length ? (
                      timelineAppointments.map((appointment) => (
                        <Box
                          key={appointment.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "96px 1fr",
                              md: "96px 1fr 220px",
                            },
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            border: lightBorder,
                            position: "relative",
                            "&:before": {
                              content: '""',
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: 4,
                              height: "100%",
                              borderTopLeftRadius: 8,
                              borderBottomLeftRadius: 8,
                              backgroundColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.08,
                              ),
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 700,
                                fontSize: 30,
                                color: theme.palette.primary.main,
                              }}
                            >
                              {new Date(appointment.date).getDate()}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                              }}
                            >
                              {new Date(appointment.date).toLocaleDateString(
                                "en-US",
                                { month: "short" },
                              )}
                            </Typography>
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 700 }}
                            >
                              {appointment.chiefComplaint?.trim() ||
                                appointment.department}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                              sx={{ mt: 0.5 }}
                            >
                              <AccessTimeIcon
                                fontSize="small"
                                color="primary"
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {appointment.time}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                              sx={{ mt: 0.5 }}
                            >
                              <LocationOnIcon
                                fontSize="small"
                                color="primary"
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {appointment.department} ·{" "}
                                {appointment.provider}
                              </Typography>
                              <Chip
                                label={appointment.status}
                                size="small"
                                variant="outlined"
                                color={
                                  appointmentStatusTone[appointment.status]
                                }
                              />
                            </Stack>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent={{
                              xs: "flex-start",
                              md: "flex-end",
                            }}
                            sx={{
                              minWidth: 0,
                              flexWrap: { xs: "wrap", md: "nowrap" },
                            }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<EditCalendarIcon fontSize="small" />}
                              onClick={() => handleReschedule(appointment)}
                              disabled={appointment.status === "Cancelled"}
                              sx={{
                                minWidth: 130,
                                height: 36,
                                borderRadius: 999,
                                fontWeight: 600,
                                px: 2.4,
                                boxShadow: "none",
                              }}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={
                                <CancelOutlinedIcon fontSize="small" />
                              }
                              onClick={() =>
                                handleCancelAppointment(appointment)
                              }
                              disabled={appointment.status === "Cancelled"}
                              sx={{
                                minWidth: 110,
                                height: 36,
                                borderRadius: 999,
                                borderColor: alpha(
                                  theme.palette.error.main,
                                  0.45,
                                ),
                                color: theme.palette.error.main,
                                fontWeight: 600,
                                px: 2.2,
                                "&:hover": {
                                  borderColor: theme.palette.error.main,
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.08,
                                  ),
                                },
                              }}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No appointments scheduled yet.
                      </Typography>
                    )}
                  </Stack>
                </TabPanel>

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

                <TabPanel value={activeTab} tab="immunizations">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <VaccinesIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Immunizations
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {immunizations.map((shot) => (
                      <Box
                        key={shot.name}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "2fr 1fr auto",
                          },
                          gap: 1,
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.02,
                          ),
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {shot.name}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(shot.date)}
                        </Typography>
                        <Chip
                          label={shot.status}
                          size="small"
                          color={
                            shot.status === "Completed" ? "success" : "warning"
                          }
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} tab="problems">
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={tabHeaderSx}
                  >
                    <ReportProblemIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Problem List
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {problems.length ? (
                      problems.map((problem) => (
                        <Chip
                          key={problem}
                          label={problem}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No problems recorded for this patient.
                      </Typography>
                    )}
                  </Stack>
                </TabPanel>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
