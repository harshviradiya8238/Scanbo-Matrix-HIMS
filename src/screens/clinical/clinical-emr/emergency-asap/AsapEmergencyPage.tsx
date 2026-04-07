"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  Card,
  CommonTabs,
  CommonDialog,
  StatTile,
} from "@/src/ui/components/molecules";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";
import { alpha, useTheme } from "@/src/ui/theme";
import { useUser } from "@/src/core/auth/UserContext";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import { cardShadow } from "@/src/core/theme/tokens";
import ModuleHeaderCard from "@/src/screens/clinical/components/ModuleHeaderCard";
import WorkflowSectionCard from "@/src/screens/clinical/components/WorkflowSectionCard";
import {
  AccessibilityNew as AccessibilityNewIcon,
  Air as AirIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Bloodtype as BloodtypeIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Close as CloseIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  EmergencyPageId,
  CaseTrackingTabId,
  CaseTrackingSidebarFilter,
  TriageLevel,
  Gender,
  ArrivalMode,
  PatientStatus,
  BedStatus,
  OrderType,
  OrderPriority,
  OrderStatus,
  QueueViewMode,
  BedBoardFilter,
  ToastSeverity,
  ChipColor,
  PatientVitals,
  EmergencyPatient,
  EmergencyBed,
  EmergencyOrder,
  ObservationEntry,
  RegistrationForm,
  TriageForm,
  BedAssignForm,
  BedAssignPriority,
  OrderForm,
  VitalsForm,
  DischargeForm,
  EmergencyAlertItem,
  nowLabel,
  getPatientInitials,
  normalizePhone,
  buildPatientId,
  buildMrn,
  buildDischargeDraft,
  triageRank,
  bedStatusForPatient,
  applyPatientAcuityToBeds,
  TriageBadge,
  OrderStatusChip,
  // DashboardSection,
  QueueSection,
  BedBoardSection,
  CaseTrackingSection,
  RegistrationModalContent,
  TriageModalContent,
  AssignBedModalContent,
} from "./components";
import {
  TRIAGE_META,
  TRIAGE_LEVEL_LABELS,
  TRIAGE_LEVEL_ORDER,
  TRIAGE_BUTTON_COLOR,
  BED_STATUS_META,
  EMERGENCY_PAGES,
  CASE_TRACKING_TABS,
  OPERATIONS_SNAPSHOT,
  INITIAL_PATIENTS,
  INITIAL_BEDS,
  INITIAL_ORDERS,
  INITIAL_OBSERVATION_LOG,
  DEFAULT_REGISTRATION,
  DEFAULT_TRIAGE,
  BED_ASSIGN_FLOW_STEPS,
  BED_ASSIGN_PHYSICIANS,
  BED_ASSIGN_NURSES,
  DEFAULT_ORDER_FORM,
  DEFAULT_VITALS_FORM,
  DEFAULT_DISCHARGE_FORM,
  ORDER_TEMPLATES,
} from "./AsapEmergencyData";
import { DashboardSection } from "./components/sections/DashboardSection";

const AsapEmergencyPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const { permissions } = useUser();

  const searchParams = useSearchParams();
  const activePage =
    (searchParams.get("tab") as EmergencyPageId) || "dashboard";
  const setActivePage = React.useCallback(
    (page: EmergencyPageId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", page);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const [caseTrackingTab, setCaseTrackingTab] =
    React.useState<CaseTrackingTabId>("vitals");
  const [caseTrackingFilter, setCaseTrackingFilter] =
    React.useState<CaseTrackingSidebarFilter>("All");
  const [caseTrackingSearch, setCaseTrackingSearch] = React.useState("");
  const [queueDoctorFilter, setQueueDoctorFilter] = React.useState<
    "ALL" | string
  >("ALL");
  const [bedFilter, setBedFilter] = React.useState<BedBoardFilter>("ALL");
  const [patients, setPatients] =
    React.useState<EmergencyPatient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = React.useState<EmergencyBed[]>(INITIAL_BEDS);
  const [orders, setOrders] = React.useState<EmergencyOrder[]>(INITIAL_ORDERS);
  const [observationLog, setObservationLog] = React.useState<
    ObservationEntry[]
  >(INITIAL_OBSERVATION_LOG);

  const [selectedPatientId, setSelectedPatientId] = React.useState("");
  const [queueFilter, setQueueFilter] = React.useState<"ALL" | TriageLevel>(
    "ALL",
  );
  const [queueSearch, setQueueSearch] = React.useState("");
  const [queueView, setQueueView] = React.useState<QueueViewMode>("table");
  const [queueStatusFilter, setQueueStatusFilter] = React.useState<
    "ALL" | PatientStatus
  >("ALL");
  const [queueArrivalFilter, setQueueArrivalFilter] = React.useState<
    "ALL" | ArrivalMode
  >("ALL");
  const [assignBedModalOpen, setAssignBedModalOpen] = React.useState(false);
  const [assignBedForm, setAssignBedForm] = React.useState<BedAssignForm>({
    patientId: "",
    bedId: "",
    physician: BED_ASSIGN_PHYSICIANS[0],
    nurse: BED_ASSIGN_NURSES[0],
    priority: "High",
    notes: "",
  });

  const [registrationModalOpen, setRegistrationModalOpen] =
    React.useState(false);
  const [triageModalOpen, setTriageModalOpen] = React.useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [dischargePreviewOpen, setDischargePreviewOpen] = React.useState(false);
  const [registrationSearch, setRegistrationSearch] = React.useState("");
  const [registrationForm, setRegistrationForm] =
    React.useState<RegistrationForm>(DEFAULT_REGISTRATION);

  const [triageForm, setTriageForm] =
    React.useState<TriageForm>(DEFAULT_TRIAGE);
  const [vitalsForm, setVitalsForm] =
    React.useState<VitalsForm>(DEFAULT_VITALS_FORM);

  const [orderForm, setOrderForm] =
    React.useState<OrderForm>(DEFAULT_ORDER_FORM);
  const [dischargeForm, setDischargeForm] = React.useState<DischargeForm>(
    DEFAULT_DISCHARGE_FORM,
  );
  const [clinicalNoteDraft, setClinicalNoteDraft] = React.useState("");

  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const notify = React.useCallback(
    (message: string, severity: ToastSeverity = "info") => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const selectedPatient = React.useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  React.useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }

    if (
      selectedPatientId &&
      !patients.some((patient) => patient.id === selectedPatientId)
    ) {
      setSelectedPatientId("");
    }
  }, [patients, selectedPatientId]);

  React.useEffect(() => {
    if (!selectedPatient) {
      setClinicalNoteDraft("");
      setDischargeForm(DEFAULT_DISCHARGE_FORM);
      setVitalsForm(DEFAULT_VITALS_FORM);
      return;
    }
    setClinicalNoteDraft(selectedPatient.clinicalNotes);
    setDischargeForm(buildDischargeDraft(selectedPatient));
    setVitalsForm({
      patientId: selectedPatient.id,
      heartRate: String(selectedPatient.vitals.heartRate),
      bloodPressure: selectedPatient.vitals.bloodPressure,
      temperature: String(selectedPatient.vitals.temperature),
      respiratoryRate: String(selectedPatient.vitals.respiratoryRate),
      spo2: String(selectedPatient.vitals.spo2),
      painScore: String(selectedPatient.vitals.painScore),
      gcs: String(selectedPatient.vitals.gcs),
      notes: "",
    });
  }, [selectedPatient]);

  React.useEffect(() => {
    setCaseTrackingTab("vitals");
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (!triageForm.patientId) {
      const firstPatient = patients[0];
      if (!firstPatient) return;
      setTriageForm({
        patientId: firstPatient.id,
        heartRate: String(firstPatient.vitals.heartRate),
        bloodPressure: firstPatient.vitals.bloodPressure,
        temperature: String(firstPatient.vitals.temperature),
        respiratoryRate: String(firstPatient.vitals.respiratoryRate),
        spo2: String(firstPatient.vitals.spo2),
        triageLevel: firstPatient.triageLevel,
      });
      return;
    }

    const triagePatient = patients.find(
      (entry) => entry.id === triageForm.patientId,
    );
    if (!triagePatient) return;

    setTriageForm((prev) => ({
      ...prev,
      heartRate: String(triagePatient.vitals.heartRate),
      bloodPressure: triagePatient.vitals.bloodPressure,
      temperature: String(triagePatient.vitals.temperature),
      respiratoryRate: String(triagePatient.vitals.respiratoryRate),
      spo2: String(triagePatient.vitals.spo2),
      triageLevel: triagePatient.triageLevel,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triageForm.patientId]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );

  const openRoute = React.useCallback(
    (route: string, query?: Record<string, string>) => {
      if (!canNavigate(route)) {
        notify("You do not have permission to open this module.", "warning");
        return;
      }

      const params = new URLSearchParams();
      Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `${route}?${queryString}` : route);
    },
    [canNavigate, notify, router],
  );

  const dashboardMetrics = React.useMemo(() => {
    const totalPatients = patients.length;
    const criticalPatients = patients.filter(
      (patient) => patient.triageLevel === "Critical",
    ).length;
    const waitingPatients = patients.filter(
      (patient) => patient.status === "Waiting",
    ).length;
    const availableBeds = beds.filter((bed) => bed.status === "Free").length;
    const occupiedOrCritical = beds.filter(
      (bed) => bed.status === "Occupied" || bed.status === "Critical",
    ).length;
    const bedOccupancyPercent =
      beds.length > 0
        ? Math.round((occupiedOrCritical / beds.length) * 100)
        : 0;
    const avgWaitMinutes =
      patients.length > 0
        ? Math.round(
            patients.reduce((acc, patient) => acc + patient.waitingMinutes, 0) /
              patients.length,
          )
        : 0;
    const doorToDocMinutes = Math.max(8, Math.round(avgWaitMinutes * 0.45));

    return {
      totalPatients,
      criticalPatients,
      waitingPatients,
      availableBeds,
      bedOccupancyPercent,
      avgWaitMinutes,
      doorToDocMinutes,
    };
  }, [beds, patients]);

  const bedOccupancy = React.useMemo(
    () => ({
      free: beds.filter((bed) => bed.status === "Free").length,
      occupied: beds.filter((bed) => bed.status === "Occupied").length,
      cleaning: beds.filter((bed) => bed.status === "Cleaning").length,
      critical: beds.filter((bed) => bed.status === "Critical").length,
    }),
    [beds],
  );

  const sortedQueueRows = React.useMemo(() => {
    const query = queueSearch.trim().toLowerCase();

    return [...patients]
      .filter((patient) => {
        if (queueFilter !== "ALL" && patient.triageLevel !== queueFilter)
          return false;
        if (queueStatusFilter !== "ALL" && patient.status !== queueStatusFilter)
          return false;
        if (
          queueArrivalFilter !== "ALL" &&
          patient.arrivalMode !== queueArrivalFilter
        )
          return false;
        if (
          queueDoctorFilter !== "ALL" &&
          patient.assignedDoctor !== queueDoctorFilter
        )
          return false;
        if (!query) return true;
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.mrn.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const acuityRank =
          triageRank(a.triageLevel) - triageRank(b.triageLevel);
        if (acuityRank !== 0) return acuityRank;
        return b.waitingMinutes - a.waitingMinutes;
      });
  }, [
    patients,
    queueArrivalFilter,
    queueDoctorFilter,
    queueFilter,
    queueSearch,
    queueStatusFilter,
  ]);

  const queueKanbanColumns = React.useMemo(
    () =>
      (Object.keys(TRIAGE_META) as TriageLevel[]).map((level) => ({
        level,
        rows: sortedQueueRows.filter(
          (patient) => patient.triageLevel === level,
        ),
      })),
    [sortedQueueRows],
  );

  const caseTrackingRows = React.useMemo(() => {
    const query = caseTrackingSearch.trim().toLowerCase();

    return [...patients]
      .filter((patient) => {
        if (
          caseTrackingFilter === "Critical" &&
          patient.triageLevel !== "Critical"
        ) {
          return false;
        }
        if (
          caseTrackingFilter === "In Treatment" &&
          !["In Treatment", "Observation"].includes(patient.status)
        ) {
          return false;
        }
        if (
          caseTrackingFilter === "Ready" &&
          patient.status !== "Ready for Disposition"
        ) {
          return false;
        }
        if (!query) return true;
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.mrn.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const acuityRank =
          triageRank(a.triageLevel) - triageRank(b.triageLevel);
        if (acuityRank !== 0) return acuityRank;
        return b.waitingMinutes - a.waitingMinutes;
      });
  }, [caseTrackingFilter, caseTrackingSearch, patients]);

  React.useEffect(() => {
    // Automatic patient selection when nothing is selected
    if (caseTrackingRows.length === 0) return;
    if (caseTrackingRows.some((patient) => patient.id === selectedPatientId))
      return;
    setSelectedPatientId(caseTrackingRows[0].id);
  }, [caseTrackingRows, selectedPatientId]);

  const availableBeds = React.useMemo(
    () => beds.filter((bed) => bed.status === "Free"),
    [beds],
  );

  const queueDoctorOptions = React.useMemo(
    () =>
      Array.from(
        new Set(patients.map((patient) => patient.assignedDoctor)),
      ).sort(),
    [patients],
  );

  const assignBedPatient = React.useMemo(
    () =>
      patients.find((patient) => patient.id === assignBedForm.patientId) ??
      null,
    [assignBedForm.patientId, patients],
  );

  const assignBedZones = React.useMemo(() => {
    const preferredOrder = ["Resus", "ER Bay", "Observation"];
    const grouped = beds.reduce<Record<string, EmergencyBed[]>>((acc, bed) => {
      if (!acc[bed.zone]) {
        acc[bed.zone] = [];
      }
      acc[bed.zone].push(bed);
      return acc;
    }, {});

    const known = preferredOrder
      .filter((zone) => grouped[zone]?.length)
      .map((zone) => ({
        zone,
        beds: grouped[zone].slice().sort((a, b) => a.id.localeCompare(b.id)),
      }));
    const extra = Object.keys(grouped)
      .filter((zone) => !preferredOrder.includes(zone))
      .sort((a, b) => a.localeCompare(b))
      .map((zone) => ({
        zone,
        beds: grouped[zone].slice().sort((a, b) => a.id.localeCompare(b.id)),
      }));

    return [...known, ...extra];
  }, [beds]);

  const filteredBedRows = React.useMemo(
    () =>
      beds.filter((bed) =>
        bedFilter === "ALL" ? true : bed.status === bedFilter,
      ),
    [bedFilter, beds],
  );

  const registrationMatches = React.useMemo(() => {
    const query = registrationSearch.trim().toLowerCase();
    if (!query) return [];

    return patients.filter((patient) => {
      const byMrn = patient.mrn.toLowerCase().includes(query);
      const byPhone = normalizePhone(patient.phone).includes(
        normalizePhone(query),
      );
      return byMrn || byPhone;
    });
  }, [patients, registrationSearch]);

  const selectedPatientOrders = React.useMemo(() => {
    if (!selectedPatient) return [];
    return orders.filter((order) => order.patientId === selectedPatient.id);
  }, [orders, selectedPatient]);

  const selectedPatientObservations = React.useMemo(() => {
    if (!selectedPatient) return [];
    return observationLog
      .filter((entry) => entry.patientId === selectedPatient.id)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  }, [observationLog, selectedPatient]);

  const handleRegistrationField = <K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K],
  ) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriageField = <K extends keyof TriageForm>(
    field: K,
    value: TriageForm[K],
  ) => {
    setTriageForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderField = <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsField = <K extends keyof VitalsForm>(
    field: K,
    value: VitalsForm[K],
  ) => {
    setVitalsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDischargeField = <K extends keyof DischargeForm>(
    field: K,
    value: DischargeForm[K],
  ) => {
    setDischargeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignBedField = <K extends keyof BedAssignForm>(
    field: K,
    value: BedAssignForm[K],
  ) => {
    setAssignBedForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseExistingPatient = React.useCallback((patientId: string) => {
    setRegistrationModalOpen(false);
    setSelectedPatientId(patientId);
    setActivePage("chart");
  }, []);

  const openTriageAssessment = React.useCallback(
    (patientId: string) => {
      const triagePatient = patients.find(
        (patient) => patient.id === patientId,
      );
      if (!triagePatient) return;

      setSelectedPatientId(triagePatient.id);
      setTriageForm({
        patientId: triagePatient.id,
        heartRate: String(triagePatient.vitals.heartRate),
        bloodPressure: triagePatient.vitals.bloodPressure,
        temperature: String(triagePatient.vitals.temperature),
        respiratoryRate: String(triagePatient.vitals.respiratoryRate),
        spo2: String(triagePatient.vitals.spo2),
        triageLevel: triagePatient.triageLevel,
      });
      setTriageModalOpen(true);
    },
    [patients],
  );

  const openVitalsDialog = React.useCallback(
    (patientId?: string) => {
      const targetPatient = patients.find(
        (patient) => patient.id === (patientId || selectedPatientId),
      );
      if (!targetPatient) {
        notify("Select a patient before recording vitals.", "warning");
        return;
      }

      setSelectedPatientId(targetPatient.id);
      setVitalsForm({
        patientId: targetPatient.id,
        heartRate: String(targetPatient.vitals.heartRate),
        bloodPressure: targetPatient.vitals.bloodPressure,
        temperature: String(targetPatient.vitals.temperature),
        respiratoryRate: String(targetPatient.vitals.respiratoryRate),
        spo2: String(targetPatient.vitals.spo2),
        painScore: String(targetPatient.vitals.painScore),
        gcs: String(targetPatient.vitals.gcs),
        notes: "",
      });
      setVitalsDialogOpen(true);
    },
    [notify, patients, selectedPatientId],
  );

  const openAssignBedModal = React.useCallback(
    (patientId: string, preferredBedId = "") => {
      const queuePatient = patients.find((patient) => patient.id === patientId);
      if (!queuePatient) {
        return;
      }

      const suggestedPriority: BedAssignPriority =
        queuePatient.triageLevel === "Critical"
          ? "Immediate"
          : queuePatient.triageLevel === "Emergency"
            ? "High"
            : queuePatient.triageLevel === "Urgent"
              ? "Medium"
              : "Standard";

      setSelectedPatientId(queuePatient.id);
      setAssignBedForm({
        patientId: queuePatient.id,
        bedId: preferredBedId,
        physician: queuePatient.assignedDoctor || BED_ASSIGN_PHYSICIANS[0],
        nurse: BED_ASSIGN_NURSES[0],
        priority: suggestedPriority,
        notes: "",
      });
      setAssignBedModalOpen(true);
    },
    [patients],
  );

  const handleRegisterPatient = React.useCallback(() => {
    const name = registrationForm.name.trim();
    const complaint = registrationForm.chiefComplaint.trim();
    const phone = normalizePhone(registrationForm.phone);
    const age = Number(registrationForm.age);

    if (
      !name ||
      !complaint ||
      !phone ||
      phone.length < 10 ||
      !Number.isFinite(age) ||
      age <= 0
    ) {
      notify(
        "Please enter valid registration details before saving.",
        "warning",
      );
      return;
    }

    const duplicate = patients.find(
      (patient) => normalizePhone(patient.phone) === phone,
    );
    if (duplicate) {
      notify(`Patient already exists in ER queue: ${duplicate.id}`, "info");
      setRegistrationModalOpen(false);
      setSelectedPatientId(duplicate.id);
      setActivePage("chart");
      return;
    }

    const id = buildPatientId();
    const mrn = buildMrn();

    const nextPatient: EmergencyPatient = {
      id,
      mrn,
      name,
      age,
      gender: registrationForm.gender,
      phone,
      arrivalMode: registrationForm.arrivalMode,
      broughtBy: registrationForm.broughtBy.trim() || "Not specified",
      chiefComplaint: complaint,
      triageLevel: registrationForm.triageLevel,
      waitingMinutes: 0,
      assignedBed: null,
      assignedDoctor: "ED Duty Team",
      status: "Waiting",
      vitals: {
        heartRate: 0,
        bloodPressure: "--",
        temperature: 0,
        respiratoryRate: 0,
        spo2: 0,
        painScore: 0,
        gcs: 15,
        capturedAt: nowLabel(),
      },
      allergies: ["No known allergies"],
      safetyFlags: ["Needs initial triage"],
      clinicalNotes: "Registration completed. Pending triage assessment.",
      updatedAt: nowLabel(),
    };

    setPatients((prev) => [nextPatient, ...prev]);
    setSelectedPatientId(nextPatient.id);
    setRegistrationModalOpen(false);
    setRegistrationSearch("");
    setRegistrationForm(DEFAULT_REGISTRATION);
    setActivePage("triage");
    setTriageForm({
      patientId: nextPatient.id,
      heartRate: String(nextPatient.vitals.heartRate),
      bloodPressure: nextPatient.vitals.bloodPressure,
      temperature: String(nextPatient.vitals.temperature),
      respiratoryRate: String(nextPatient.vitals.respiratoryRate),
      spo2: String(nextPatient.vitals.spo2),
      triageLevel: registrationForm.triageLevel,
    });
    setTriageModalOpen(true);
    notify(
      `Emergency registration completed for ${nextPatient.id}.`,
      "success",
    );
  }, [notify, patients, registrationForm]);

  const handleSaveTriage = React.useCallback(() => {
    const triagePatient = patients.find(
      (patient) => patient.id === triageForm.patientId,
    );
    if (!triagePatient) {
      notify("Select a patient for triage assessment.", "warning");
      return;
    }

    const heartRate = Number(triageForm.heartRate);
    const temperature = Number(triageForm.temperature);
    const respiratoryRate = Number(triageForm.respiratoryRate);
    const spo2 = Number(triageForm.spo2);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !triageForm.bloodPressure.trim()
    ) {
      notify("Capture complete vitals before submitting triage.", "warning");
      return;
    }

    const nextPatients = patients.map((patient) =>
      patient.id === triagePatient.id
        ? {
            ...patient,
            triageLevel: triageForm.triageLevel,
            status:
              patient.status === "Waiting" ? "In Treatment" : patient.status,
            vitals: {
              heartRate,
              bloodPressure: triageForm.bloodPressure.trim(),
              temperature,
              respiratoryRate,
              spo2,
              painScore: patient.vitals.painScore,
              gcs: patient.vitals.gcs,
              capturedAt: nowLabel(),
            },
            updatedAt: nowLabel(),
          }
        : patient,
    );

    setPatients(nextPatients);
    setBeds((prev) => applyPatientAcuityToBeds(nextPatients, prev));

    setObservationLog((prev) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: triagePatient.id,
        recordedAt: nowLabel(),
        heartRate,
        bloodPressure: triageForm.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore: triagePatient.vitals.painScore,
        gcs: triagePatient.vitals.gcs,
        note: `Triage assessment updated (${triageForm.triageLevel})`,
      },
      ...prev,
    ]);

    setSelectedPatientId(triagePatient.id);
    setActivePage("triage");
    setTriageModalOpen(false);
    notify(`Triage saved for ${triagePatient.id}.`, "success");
  }, [notify, patients, triageForm]);

  const assignBed = React.useCallback(
    (
      patientId: string,
      bedId: string,
      assignment?: Pick<
        BedAssignForm,
        "physician" | "nurse" | "priority" | "notes"
      >,
    ) => {
      const patient = patients.find((row) => row.id === patientId);
      const bed = beds.find((row) => row.id === bedId);
      if (!patient || !bed || bed.status !== "Free") {
        notify("Selected bed is not available.", "warning");
        return;
      }

      const assignmentMemo = assignment
        ? [
            `Bed ${bedId} assigned`,
            assignment.physician ? `Physician: ${assignment.physician}` : "",
            assignment.nurse ? `Nurse: ${assignment.nurse}` : "",
            `Priority: ${assignment.priority}`,
            assignment.notes.trim() ? `Notes: ${assignment.notes.trim()}` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        : "";

      const nextPatients = patients.map((row) =>
        row.id === patientId
          ? {
              ...row,
              assignedBed: bedId,
              assignedDoctor: assignment?.physician || row.assignedDoctor,
              status: row.status === "Waiting" ? "In Treatment" : row.status,
              clinicalNotes: assignmentMemo
                ? `${row.clinicalNotes}\n${nowLabel()} · ${assignmentMemo}`.trim()
                : row.clinicalNotes,
              updatedAt: nowLabel(),
            }
          : row,
      );

      const nextBeds = beds.map((row) => {
        if (row.id === bedId) {
          return {
            ...row,
            patientId,
            status: bedStatusForPatient(patient.triageLevel),
          };
        }

        if (row.patientId === patientId && row.id !== bedId) {
          return {
            ...row,
            patientId: null,
            status: "Cleaning" as BedStatus,
          };
        }

        return row;
      });

      setPatients(nextPatients);
      setBeds(applyPatientAcuityToBeds(nextPatients, nextBeds));
      setSelectedPatientId(patientId);
      notify(`Bed assigned: ${patientId} -> ${bedId}`, "success");
    },
    [beds, notify, patients],
  );

  const handleOpenPatientChart = React.useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePage("chart");
  }, []);

  const handleConfirmAssignBed = React.useCallback(() => {
    if (!assignBedForm.patientId || !assignBedForm.bedId) {
      notify(
        "Select an available bed before confirming assignment.",
        "warning",
      );
      return;
    }

    assignBed(assignBedForm.patientId, assignBedForm.bedId, {
      physician: assignBedForm.physician,
      nurse: assignBedForm.nurse,
      priority: assignBedForm.priority,
      notes: assignBedForm.notes,
    });
    setAssignBedModalOpen(false);
    handleOpenPatientChart(assignBedForm.patientId);
  }, [
    assignBed,
    assignBedForm.bedId,
    assignBedForm.patientId,
    handleOpenPatientChart,
    notify,
  ]);

  const handleSetBedFree = React.useCallback(
    (bedId: string) => {
      setBeds((prev) =>
        prev.map((bed) =>
          bed.id === bedId ? { ...bed, status: "Free", patientId: null } : bed,
        ),
      );

      setPatients((prev) =>
        prev.map((patient) =>
          patient.assignedBed === bedId
            ? {
                ...patient,
                assignedBed: null,
                status: "Waiting",
                updatedAt: nowLabel(),
              }
            : patient,
        ),
      );
      notify(`${bedId} is now marked Free.`, "success");
    },
    [notify],
  );

  const handleSaveClinicalNote = React.useCallback(() => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatient.id
          ? {
              ...patient,
              clinicalNotes: clinicalNoteDraft.trim(),
              updatedAt: nowLabel(),
            }
          : patient,
      ),
    );
    notify("Clinical note updated.", "success");
  }, [clinicalNoteDraft, notify, selectedPatient]);

  const handleApplyOrderTemplate = React.useCallback((template: string) => {
    setOrderForm((prev) => ({ ...prev, item: template }));
  }, []);

  const handleAddOrder = React.useCallback(() => {
    if (!selectedPatient) {
      notify("Select a patient before adding an order.", "warning");
      return;
    }

    const item = orderForm.item.trim();
    if (!item) {
      notify("Order item is required.", "warning");
      return;
    }

    setOrders((prev) => [
      {
        id: `ER-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: selectedPatient.id,
        type: orderForm.type,
        item,
        priority: orderForm.priority,
        status: "Pending",
        orderedAt: nowLabel(),
      },
      ...prev,
    ]);

    setOrderForm(DEFAULT_ORDER_FORM);
    notify("Emergency order placed.", "success");
  }, [notify, orderForm, selectedPatient]);

  const handleOrderStatusChange = React.useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order,
        ),
      );
    },
    [],
  );

  const handleSaveVitals = React.useCallback(() => {
    const targetPatient = patients.find(
      (patient) => patient.id === vitalsForm.patientId,
    );
    if (!targetPatient) {
      notify("Select a patient before recording vitals.", "warning");
      return;
    }

    const heartRate = Number(vitalsForm.heartRate);
    const temperature = Number(vitalsForm.temperature);
    const respiratoryRate = Number(vitalsForm.respiratoryRate);
    const spo2 = Number(vitalsForm.spo2);
    const painScore = Number(vitalsForm.painScore);
    const gcs = Number(vitalsForm.gcs);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !Number.isFinite(painScore) ||
      !Number.isFinite(gcs) ||
      !vitalsForm.bloodPressure.trim()
    ) {
      notify("Complete all vital parameters before saving.", "warning");
      return;
    }

    const updatedAt = nowLabel();
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === targetPatient.id
          ? {
              ...patient,
              vitals: {
                heartRate,
                bloodPressure: vitalsForm.bloodPressure.trim(),
                temperature,
                respiratoryRate,
                spo2,
                painScore,
                gcs,
                capturedAt: updatedAt,
              },
              updatedAt,
            }
          : patient,
      ),
    );

    setObservationLog((prev) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: targetPatient.id,
        recordedAt: updatedAt,
        heartRate,
        bloodPressure: vitalsForm.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore,
        gcs,
        note: vitalsForm.notes.trim() || "Bedside vital capture",
      },
      ...prev,
    ]);

    setVitalsDialogOpen(false);
    notify(`Vitals recorded for ${targetPatient.id}.`, "success");
  }, [notify, patients, vitalsForm]);

  const handleDisposition = React.useCallback(
    (action: "discharge" | "admit" | "transfer") => {
      if (!selectedPatient) {
        notify("Select a patient before disposition.", "warning");
        return;
      }

      if (
        action === "discharge" &&
        (!dischargeForm.diagnosis.trim() || !dischargeForm.instructions.trim())
      ) {
        notify(
          "Add diagnosis and discharge instructions before discharging.",
          "warning",
        );
        return;
      }

      const patientId = selectedPatient.id;
      const patientMrn = selectedPatient.mrn;

      setPatients((prev) => prev.filter((patient) => patient.id !== patientId));
      setOrders((prev) =>
        prev.filter((order) => order.patientId !== patientId),
      );
      setObservationLog((prev) =>
        prev.filter((entry) => entry.patientId !== patientId),
      );
      setBeds((prev) =>
        prev.map((bed) =>
          bed.patientId === patientId
            ? {
                ...bed,
                patientId: null,
                status: "Cleaning",
              }
            : bed,
        ),
      );

      if (action === "admit") {
        notify(`${patientId} moved to IPD admission flow.`, "success");
        openRoute("/ipd/admissions", { mrn: patientMrn, source: "ER" });
        return;
      }

      if (action === "discharge") {
        notify(`${patientId} discharged from emergency.`, "success");
        openRoute("/billing/invoices", { mrn: patientMrn });
        return;
      }

      notify(`${patientId} transferred to next care unit.`, "info");
      openRoute("/appointments/queue", { mrn: patientMrn });
    },
    [
      dischargeForm.diagnosis,
      dischargeForm.instructions,
      notify,
      openRoute,
      selectedPatient,
    ],
  );

  const arrivalColumns = React.useMemo<CommonColumn<EmergencyPatient>[]>(
    () => [
      {
        headerName: "Patient",
        field: "name",
        width: 250,
        renderCell: (row) => {
          const initials = row.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.id} · {row.mrn}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        headerName: "Triage Level",
        field: "triageLevel",
        width: 140,
        renderCell: (row) => <TriageBadge level={row.triageLevel} />,
      },
      {
        headerName: "Complaint",
        field: "chiefComplaint",
        width: 280,
      },
      {
        headerName: "Wait",
        field: "waitingMinutes",
        width: 100,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color:
                row.waitingMinutes > 45
                  ? "error.main"
                  : row.waitingMinutes > 25
                    ? "warning.main"
                    : "success.main",
            }}
          >
            {row.waitingMinutes}m
          </Typography>
        ),
      },
      {
        headerName: "Bed",
        field: "assignedBed",
        width: 120,
        renderCell: (row) => row.assignedBed ?? "Not Assigned",
      },
      {
        headerName: "Doctor",
        field: "assignedDoctor",
        width: 150,
      },
      {
        headerName: "Status",
        field: "status",
        width: 140,
      },
      {
        headerName: "Actions",
        field: "id",
        width: 320,
        align: "right",
        headerAlign: "right",
      },
    ],
    [
      availableBeds.length,
      openAssignBedModal,
      openTriageAssessment,
      handleOpenPatientChart,
    ],
  );

  const getArrivalColumnsFor = React.useCallback(
    (context: string) => {
      return arrivalColumns.map((col) => {
        if (col.field === "id") {
          return {
            ...col,
            renderCell: (row: any) => (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {context === "triage" && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTriageAssessment(row.id);
                      }}
                    >
                      Triage
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={availableBeds.length === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignBedModal(row.id);
                      }}
                    >
                      Assign Bed
                    </Button>
                  </>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (context === "dashboard") {
                      setSelectedPatientId(row.id);
                      setActivePage("chart");
                    } else {
                      handleOpenPatientChart(row.id);
                    }
                  }}
                >
                  Open Case Tracking
                </Button>
              </Stack>
            ),
          };
        }
        return col;
      });
    },
    [
      arrivalColumns,
      openAssignBedModal,
      openTriageAssessment,
      handleOpenPatientChart,
      availableBeds.length,
      setActivePage,
    ],
  );

  const observationColumns = React.useMemo<CommonColumn<ObservationEntry>[]>(
    () => [
      {
        headerName: "Recorded",
        field: "recordedAt",
        width: 120,
      },
      {
        headerName: "BP",
        field: "bloodPressure",
        width: 110,
      },
      {
        headerName: "HR",
        field: "heartRate",
        width: 80,
      },
      {
        headerName: "RR",
        field: "respiratoryRate",
        width: 80,
      },
      {
        headerName: "SpO2",
        field: "spo2",
        width: 90,
        renderCell: (row) => `${row.spo2}%`,
      },
      {
        headerName: "Pain",
        field: "painScore",
        width: 100,
        renderCell: (row) => `${row.painScore}/10`,
      },
      {
        headerName: "Note",
        field: "note",
        width: 250,
      },
    ],
    [],
  );

  const subtitle = selectedPatient
    ? `${selectedPatient.name} · ${selectedPatient.id} · ${selectedPatient.mrn}`
    : "No active emergency patient selected";

  const tabItems = EMERGENCY_PAGES.map((page) => ({
    label: page.label,
    icon: page.icon,
    child:
      page.id === "dashboard" ? (
        <DashboardSection
          dashboardMetrics={dashboardMetrics}
          bedOccupancy={bedOccupancy}
          bedsLength={beds.length}
          sortedQueueRows={sortedQueueRows}
          arrivalColumns={getArrivalColumnsFor("dashboard")}
          availableBedsLength={availableBeds.length}
          setRegistrationModalOpen={setRegistrationModalOpen}
          setActivePage={setActivePage}
          openTriageAssessment={openTriageAssessment}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          activePage={"dashboard"}
        />
      ) : page.id === "triage" ? (
        <QueueSection
          queueFilter={queueFilter}
          setQueueFilter={setQueueFilter}
          sortedQueueRows={sortedQueueRows}
          arrivalColumns={getArrivalColumnsFor("triage")}
          queueView={queueView}
          setQueueView={setQueueView}
          queueDoctorOptions={queueDoctorOptions}
          queueDoctorFilter={queueDoctorFilter}
          setQueueDoctorFilter={setQueueDoctorFilter}
          queueStatusFilter={queueStatusFilter}
          setQueueStatusFilter={setQueueStatusFilter}
          queueArrivalFilter={queueArrivalFilter}
          setQueueArrivalFilter={setQueueArrivalFilter}
          queueSearch={queueSearch}
          setQueueSearch={setQueueSearch}
          queueKanbanColumns={queueKanbanColumns}
          activePage={"triage"}
          openTriageAssessment={openTriageAssessment}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          availableBedsLength={availableBeds.length}
          openRegistrationModal={() => setRegistrationModalOpen(true)}
        />
      ) : page.id === "bed-board" ? (
        <BedBoardSection
          bedFilter={bedFilter}
          setBedFilter={setBedFilter}
          filteredBedRows={filteredBedRows}
          patients={patients}
          selectedPatient={selectedPatient}
          handleOpenPatientChart={handleOpenPatientChart}
          handleSetBedFree={handleSetBedFree}
          openAssignBedModal={openAssignBedModal}
          notify={notify}
        />
      ) : (
        <CaseTrackingSection
          selectedPatient={selectedPatient}
          selectedPatientOrders={selectedPatientOrders}
          selectedPatientObservations={selectedPatientObservations}
          observationColumns={observationColumns}
          caseTrackingTab={caseTrackingTab}
          setCaseTrackingTab={setCaseTrackingTab}
          caseTrackingSearch={caseTrackingSearch}
          setCaseTrackingSearch={setCaseTrackingSearch}
          caseTrackingFilter={caseTrackingFilter}
          setCaseTrackingFilter={setCaseTrackingFilter}
          caseTrackingRows={caseTrackingRows}
          selectedPatientId={selectedPatientId}
          handleOpenPatientChart={handleOpenPatientChart}
          openVitalsDialog={openVitalsDialog}
          clinicalNoteDraft={clinicalNoteDraft}
          setClinicalNoteDraft={setClinicalNoteDraft}
          handleSaveClinicalNote={handleSaveClinicalNote}
          handleSaveVitals={handleSaveVitals}
          orderForm={orderForm}
          handleOrderField={handleOrderField}
          handleApplyOrderTemplate={handleApplyOrderTemplate}
          handleAddOrder={handleAddOrder}
          handleOrderStatusChange={handleOrderStatusChange}
          dischargeForm={dischargeForm}
          handleDischargeField={handleDischargeField}
          handleDisposition={handleDisposition}
          dashboardAvgWaitMinutes={dashboardMetrics.avgWaitMinutes}
          setActivePage={setActivePage}
          openRegistrationModal={() => setRegistrationModalOpen(true)}
        />
      ),
  }));

  return (
    <PageTemplate
      title="ASAP Emergency"
      subtitle={subtitle}
      currentPageTitle="Emergency"
      fullHeight={activePage === "chart"}
    >
      <Stack
        spacing={1.25}
        sx={{
          minHeight: activePage === "chart" ? "100%" : "auto",
          overflowY: activePage === "chart" ? "auto" : "visible",
        }}
      >
        <ModuleHeaderCard
          title="Emergency "
          description=""
          actions={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="contained"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setRegistrationModalOpen(true)}
              >
                New Arrival
              </Button>
            </Stack>
          }
        />

        <CustomCardTabs
          scrollable={false}
          // sticky={false}
          items={tabItems}
          defaultValue={Math.max(
            EMERGENCY_PAGES.findIndex((p) => p.id === activePage),
            0,
          )}
          onChange={(index) => setActivePage(EMERGENCY_PAGES[index].id)}
          showBackground
          tabsSx={{ borderRadius: 2, p: 1 }}
        />
      </Stack>

      <CommonDialog
        open={assignBedModalOpen}
        onClose={() => setAssignBedModalOpen(false)}
        title="Assign Bed"
        subtitle="Arrivals & Triage to bed allocation workflow"
        icon={<BedIcon color="primary" fontSize="small" />}
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
        hideActions
        content={
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
              {BED_ASSIGN_FLOW_STEPS.map((step, index) => (
                <Chip
                  key={step}
                  size="small"
                  label={`${index + 1}. ${step}`}
                  color={
                    index < 1 ? "success" : index === 1 ? "primary" : "default"
                  }
                  variant={index <= 1 ? "filled" : "outlined"}
                />
              ))}
            </Stack>
            <Divider />
            <AssignBedModalContent
              assignBedPatient={assignBedPatient}
              assignBedForm={assignBedForm}
              assignBedZones={assignBedZones}
              patients={patients}
              beds={beds}
              handleAssignBedField={handleAssignBedField}
              handleConfirmAssignBed={handleConfirmAssignBed}
            />
          </Stack>
        }
      />

      <CommonDialog
        open={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        title="Triage Assessment"
        subtitle="Capture vitals and assign acuity level"
        icon={<MonitorHeartIcon color="primary" fontSize="small" />}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
        content={
          <TriageModalContent
            patients={patients}
            triageForm={triageForm}
            handleTriageField={handleTriageField}
          />
        }
        actions={
          <>
            <Button onClick={() => setTriageModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveTriage}
              startIcon={<MonitorHeartIcon />}
            >
              Save Triage Assessment
            </Button>
          </>
        }
      />

      <CommonDialog
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        title="Register Emergency Patient"
        subtitle="Walk-in, EMS, or transfer registration"
        icon={<PersonAddAlt1Icon color="primary" fontSize="small" />}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
        content={
          <RegistrationModalContent
            registrationSearch={registrationSearch}
            setRegistrationSearch={setRegistrationSearch}
            registrationMatches={registrationMatches}
            handleUseExistingPatient={handleUseExistingPatient}
            registrationForm={registrationForm}
            handleRegistrationField={handleRegistrationField}
          />
        }
        actions={
          <>
            <Button onClick={() => setRegistrationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleRegisterPatient}
              startIcon={<PersonAddAlt1Icon />}
            >
              Register & Assign MRN
            </Button>
          </>
        }
      />

      <CommonDialog
        open={vitalsDialogOpen}
        onClose={() => setVitalsDialogOpen(false)}
        title="Record Vitals"
        subtitle="Bedside capture for emergency reassessment"
        icon={<MonitorHeartIcon color="primary" fontSize="small" />}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
        content={
          <Stack spacing={1.5}>
            <TextField
              size="small"
              select
              label="Patient"
              value={vitalsForm.patientId}
              onChange={(event) =>
                handleVitalsField("patientId", event.target.value)
              }
              fullWidth
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.id} · {patient.name}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={1}>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Heart Rate"
                  value={vitalsForm.heartRate}
                  onChange={(event) =>
                    handleVitalsField("heartRate", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Blood Pressure"
                  value={vitalsForm.bloodPressure}
                  onChange={(event) =>
                    handleVitalsField("bloodPressure", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Temperature"
                  value={vitalsForm.temperature}
                  onChange={(event) =>
                    handleVitalsField("temperature", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="Respiratory Rate"
                  value={vitalsForm.respiratoryRate}
                  onChange={(event) =>
                    handleVitalsField("respiratoryRate", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                <TextField
                  size="small"
                  label="SpO2"
                  value={vitalsForm.spo2}
                  onChange={(event) =>
                    handleVitalsField("spo2", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  size="small"
                  label="Pain"
                  value={vitalsForm.painScore}
                  onChange={(event) =>
                    handleVitalsField("painScore", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  size="small"
                  label="GCS"
                  value={vitalsForm.gcs}
                  onChange={(event) =>
                    handleVitalsField("gcs", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              size="small"
              label="Observation Notes"
              value={vitalsForm.notes}
              onChange={(event) =>
                handleVitalsField("notes", event.target.value)
              }
              multiline
              minRows={3}
              placeholder="Example: Pain reduced after analgesic, patient comfortable on oxygen support."
              fullWidth
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setVitalsDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveVitals}>
              Save Vitals
            </Button>
          </>
        }
      />

      <CommonDialog
        open={dischargePreviewOpen}
        onClose={() => setDischargePreviewOpen(false)}
        title="AVS Preview"
        subtitle="Emergency discharge summary preview for patient handoff"
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
        content={
          !selectedPatient ? (
            <Alert severity="info">No patient selected for AVS preview.</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Card
                elevation={0}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedPatient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.id} · {selectedPatient.mrn} ·{" "}
                    {selectedPatient.age}y / {selectedPatient.gender}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Diagnosis:</strong>{" "}
                    {dischargeForm.diagnosis || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Condition on exit:</strong>{" "}
                    {dischargeForm.condition || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instructions:</strong>{" "}
                    {dischargeForm.instructions || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Follow-up:</strong> {dischargeForm.followUp || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Medication advice:</strong>{" "}
                    {dischargeForm.medications || "--"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Destination:</strong>{" "}
                    {dischargeForm.destination || "--"}
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          )
        }
        actions={
          <>
            <Button onClick={() => setDischargePreviewOpen(false)}>
              Close
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                selectedPatient
                  ? openRoute("/ipd/discharge", {
                      tab: "avs",
                      mrn: selectedPatient.mrn,
                    })
                  : undefined
              }
              disabled={!selectedPatient || !canNavigate("/ipd/discharge")}
            >
              Open Full AVS Workspace
            </Button>
          </>
        }
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
};

export default AsapEmergencyPage;
