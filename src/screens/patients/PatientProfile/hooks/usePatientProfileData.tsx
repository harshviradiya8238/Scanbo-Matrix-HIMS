"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useAppDispatch } from "@/src/store/hooks";
import { useOpdData } from "@/src/store/opdHooks";
import { getPatientByMrn } from "@/src/mocks/global-patients";
import { getCareCompanionByMrn } from "@/src/mocks/care-companion";
import { getInfectionCasesByMrn } from "@/src/mocks/infection-control";
import { updateAppointment } from "@/src/store/slices/opdSlice";
import { buildDateTime, formatFrequency } from "../utils/utils";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HealingIcon from "@mui/icons-material/Healing";
import ScaleIcon from "@mui/icons-material/Scale";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export type PatientProfileData = ReturnType<typeof usePatientProfileData>;

export function usePatientProfileData() {
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
  const tabHeaderSx = {
    mb: 1.5,
  };

  const [cancelTarget, setCancelTarget] = React.useState<any>(null);

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
    (appointment: any) => {
      router.push(
        `/appointments/calendar?mrn=${appointment.mrn}&date=${appointment.date}&appointmentId=${appointment.id}`,
      );
    },
    [router],
  );

  const handleCancelAppointment = React.useCallback((appointment: any) => {
    if (appointment.status === "Cancelled") return;
    setCancelTarget(appointment);
  }, []);

  const confirmCancelAppointment = React.useCallback(() => {
    if (!cancelTarget) return;
    dispatch(
      updateAppointment({
        id: cancelTarget.id,
        changes: {
          status: "Cancelled",
        },
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
  const [vitalsView, setVitalsView] = React.useState("trend");
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
    [theme],
  );

  const VITAL_NOTES = [
    "Baseline reading",
    "Post-consultation initial",
    "Morning routine check",
    "Regular follow-up",
    "Evening check",
  ];

  const parseVitalNum = (s: string | undefined) => {
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
        return r.painScore;
      })
      .filter((v) => !Number.isNaN(v));
  }, [vitalHistory, selectedVitalId]);

  const chartValuesToShow =
    vitalChartValues.length >= 2
      ? vitalChartValues
      : selectedVitalId === "bp"
        ? [148, 142, 138, 145, 140, 136, 132, 128]
        : selectedVitalId === "hr"
          ? [100, 96, 88, 92, 84, 82, 78, 74]
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
        b.recordedAt.localeCompare(a.recordedAt),
      ),
    [vitalHistory],
  );

  const vitalTotalHistPages = Math.max(
    1,
    Math.ceil(vitalHistorySorted.length / vitalRowsPerPage),
  );
  const vitalPagedHistory = vitalHistorySorted.slice(
    vitalHistPage * vitalRowsPerPage,
    vitalHistPage * vitalRowsPerPage + vitalRowsPerPage,
  );

  const getVitalValue = (r: any) => {
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

  const readingStatus = (val: any) => {
    const n =
      typeof val === "string" ? parseFloat(val.replace(/[^\d.]/g, "")) : val;
    if (Number.isNaN(n)) return "normal";
    if (selectedVitalId === "bp")
      return n > 140 ? "elevated" : n > 120 ? "elevated" : "normal";
    if (selectedVitalId === "hr")
      return n > 100 ? "high" : n < 60 ? "low" : "normal";
    if (selectedVitalId === "spo2")
      return n < 95 ? "low" : n < 98 ? "elevated" : "normal";
    if (selectedVitalId === "temp")
      return n > 99 ? "high" : n < 97 ? "low" : "normal";
    if (selectedVitalId === "rr")
      return n > 20 ? "high" : n < 12 ? "low" : "normal";
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

  const payerType = latestAppointment?.payerType ?? "General";
  const insuranceLabel =
    payerType === "Insurance"
      ? "HealthSecure TPA"
      : payerType === "Corporate"
        ? "Scanbo Corporate Plan"
        : "Self Pay";
  const allergiesRaw = opdEncounter?.allergies ?? [];
  const allergies = allergiesRaw.filter(
    (item: string) => item && item.toLowerCase() !== "no known allergies",
  );
  const allergyDisplay = allergies.length ? allergies : ["No known allergies"];
  const problems = opdEncounter?.problems ?? [];

  const patientMedications = React.useMemo(() => {
    if (!medicationCatalog.length) return [];
    const selected = medicationCatalog.slice(0, 4);
    return selected.map((med, index) => ({
      name: med.genericName,
      dosage: med.strength,
      frequency: med.commonFrequency,
      status:
        index === selected.length - 1 && selected.length > 2
          ? "Discontinued"
          : "Active",
    }));
  }, [medicationCatalog]);

  const medicationTableRows = React.useMemo(() => {
    if (!medicationCatalog.length) return [];
    const selected = medicationCatalog.slice(0, 6);
    const prescriber =
      latestAppointment?.provider ?? patient?.primaryDoctor ?? "—";
    return selected.map((med, index) => {
      const fallbackStart = patient?.lastVisit ?? "2024-01-01";
      const status = index === selected.length - 1 ? "Completed" : "Active";
      return {
        name: med.genericName,
        subtitle: med.form,
        dosage: `${med.strength} · ${formatFrequency(med.commonFrequency)}`,
        prescriber,
        startDate: fallbackStart,
        status,
        refills: status === "Active" ? "3 remaining" : "N/A",
      };
    });
  }, [
    latestAppointment?.provider,
    medicationCatalog,
    patient?.primaryDoctor,
    patient?.lastVisit,
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
  ];

  const billingInvoices = [
    {
      id: "INV-2026-0042",
      date: "2026-02-10",
      description: "IPD Stay",
      amount: 24500,
      paid: 24500,
      status: "Paid",
    },
    {
      id: "INV-2026-0088",
      date: "2026-02-28",
      description: "OPD Consultation",
      amount: 1800,
      paid: 0,
      status: "Pending",
    },
  ];

  const totalBilled = billingInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = billingInvoices.reduce((s, i) => s + i.paid, 0);
  const balanceDue = totalBilled - totalPaid;

  const careCompanion = getCareCompanionByMrn(mrn);
  const infectionCases = getInfectionCasesByMrn(mrn);

  const radiologyOrders = [
    {
      id: "RAD-20260305-01",
      test: "Chest X-Ray",
      orderedBy: patient?.primaryDoctor ?? "Dr. Nisha Rao",
      orderedOn: "2026-03-05",
      status: "Pending",
      modality: "X-Ray",
      priority: "Routine",
      reportUrl: null,
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

  return {
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
    vitalChartValues: chartValuesToShow,
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
  };
}
