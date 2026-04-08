"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { getPatientByMrn } from "@/src/mocks/global-patients";
import { getActiveInfectionCaseByMrn } from "@/src/mocks/infection-control";
import { usePermission } from "@/src/core/auth/usePermission";
import {
  ADMISSION_LEADS,
  AdmissionLead,
  DISCHARGE_CANDIDATES,
  INPATIENT_STAYS,
} from "../../ipd-mock-data";
import {
  registerIpdAdmissionEncounter,
  useIpdEncounters,
} from "../../ipd-encounter-context";
import {
  markOpdToIpdTransferHandledByMrn,
  useOpdToIpdTransferLeads,
} from "../../ipd-transfer-store";
import {
  AdmissionDialogForm,
  AdmissionErrors,
  IpdAdmissionsData,
  PatientRow,
  AdmissionQueueRow,
} from "../utils/ipd-admissions-types";
import {
  IpdPatientOption,
  IpdPatientTopBarField,
} from "../../components/IpdPatientTopBar";

function buildFormFromLead(lead: AdmissionLead): AdmissionDialogForm {
  return {
    patientName: lead.patientName,
    mrn: lead.mrn,
    mobile: lead.mobile,
    admissionType: lead.source === "ER" ? "Emergency" : "Medical",
    admissionSource: lead.source,
    priority: lead.priority,
    department:
      lead.preferredWard === "Surgical Ward - 1"
        ? "Surgery"
        : lead.preferredWard === "ICU"
          ? "Critical Care"
          : "Internal Medicine",
    consultant: lead.consultant,
    preferredWard: lead.preferredWard,
    provisionalDiagnosis: lead.provisionalDiagnosis,
    admissionReason: lead.admissionReason,
    payerType: lead.patientType,
    insuranceProvider:
      lead.patientType === "Insurance" ? "HealthSecure TPA" : "",
    policyNumber: "",
    termsAccepted: false,
  };
}

function buildEmptyForm(): AdmissionDialogForm {
  return {
    patientName: "",
    mrn: "",
    mobile: "",
    admissionType: "Medical",
    admissionSource: "OPD",
    priority: "Routine",
    department: "",
    consultant: "",
    preferredWard: "",
    provisionalDiagnosis: "",
    admissionReason: "",
    payerType: "General",
    insuranceProvider: "",
    policyNumber: "",
    termsAccepted: false,
  };
}

function formatDateTimeForRow(date: Date): string {
  const datePart = date.toLocaleDateString();
  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}

function normalizeMrn(value: string): string {
  return value.trim().toUpperCase();
}

const TOTAL_BILL_BY_PATIENT_ID: Record<string, number> = {
  "ipd-1": 67000,
  "ipd-2": 52000,
  "ipd-3": 182000,
  "ipd-4": 48000,
};

const INSURANCE_BY_PATIENT_ID: Record<string, string> = {
  "ipd-1": "Star Health",
  "ipd-2": "HDFC Ergo",
  "ipd-3": "New India Assurance",
  "ipd-4": "No Insurance",
};

const INR_CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function useIpdAdmissionsData(): IpdAdmissionsData {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mrnParam = useMrnParam();
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const transferLeads = useOpdToIpdTransferLeads();

  const canManageAdmissions = permissionGate("ipd.admissions.write");
  const canOpenBedBoard = permissionGate([
    "ipd.beds.read",
    "ipd.beds.write",
    "ipd.read",
  ]);

  const [allSearch, setAllSearch] = React.useState("");
  const [allStatusFilter, setAllStatusFilter] = React.useState("all");
  const [allWardFilter, setAllWardFilter] = React.useState("all");
  const [queueSearch, setQueueSearch] = React.useState("");
  const [queuePriorityFilter, setQueuePriorityFilter] = React.useState("all");
  const [queueSourceFilter, setQueueSourceFilter] = React.useState("all");
  const [historyTab, setHistoryTab] = React.useState<"all" | "queue">("all");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>("");
  const [form, setForm] = React.useState<AdmissionDialogForm>(buildEmptyForm());
  const [errors, setErrors] = React.useState<AdmissionErrors>({});
  const appliedMrnRef = React.useRef<string>("");

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const queueRowsAll = React.useMemo(() => {
    const merged = new Map<string, AdmissionLead>();
    ADMISSION_LEADS.forEach((lead) => merged.set(normalizeMrn(lead.mrn), lead));
    transferLeads.forEach((lead) => merged.set(normalizeMrn(lead.mrn), lead));
    return Array.from(merged.values());
  }, [transferLeads]);

  const selectedLead = React.useMemo(
    () => queueRowsAll.find((lead) => lead.id === selectedLeadId),
    [queueRowsAll, selectedLeadId],
  );

  const activeIpdPatients = React.useMemo(() => {
    const seedByMrn = new Map(
      INPATIENT_STAYS.map((stay) => [normalizeMrn(stay.mrn), stay] as const),
    );

    const activeEncounters = ipdEncounters
      .filter((record) => record.workflowStatus !== "discharged")
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      );

    const merged = new Map<string, PatientRow>();
    activeEncounters.forEach((record) => {
      const mrnKey = normalizeMrn(record.mrn);
      if (!mrnKey || merged.has(mrnKey)) return;

      const seed = seedByMrn.get(mrnKey);
      const globalPatient = getPatientByMrn(record.mrn);
      const encounterTimestamp = new Date(record.updatedAt).getTime();
      const admissionTimestamp = seed
        ? new Date(seed.admissionDate).getTime()
        : Number.isFinite(encounterTimestamp)
          ? encounterTimestamp
          : Date.now();
      const bed = record.bed?.trim() ?? "";

      merged.set(mrnKey, {
        id: record.patientId,
        mrn: record.mrn,
        patientName: record.patientName,
        ageGender: seed?.ageGender ?? globalPatient?.ageGender ?? "--",
        admissionDate: formatDateTimeForRow(new Date(admissionTimestamp)),
        admissionTimestamp,
        consultant: record.consultant || seed?.consultant || "--",
        diagnosis: record.diagnosis || seed?.diagnosis || "--",
        ward: record.ward || seed?.ward || "--",
        bed,
        status: bed ? "Admitted" : "Observation",
        entryType: seed ? "Existing" : "Created Now",
      });
    });

    return Array.from(merged.values()).sort(
      (left, right) => right.admissionTimestamp - left.admissionTimestamp,
    );
  }, [ipdEncounters]);

  const buildFormFromActivePatient = React.useCallback(
    (patient: PatientRow): AdmissionDialogForm => {
      const diagnosis = patient.diagnosis === "--" ? "" : patient.diagnosis;
      return {
        ...buildEmptyForm(),
        patientName: patient.patientName,
        mrn: patient.mrn,
        admissionSource: "Transfer",
        consultant: patient.consultant === "--" ? "" : patient.consultant,
        preferredWard: patient.ward === "--" ? "" : patient.ward,
        provisionalDiagnosis: diagnosis,
        admissionReason: diagnosis,
      };
    },
    [],
  );

  React.useEffect(() => {
    if (!mrnParam) return;
    const normalizedMrn = normalizeMrn(mrnParam);
    if (!normalizedMrn || appliedMrnRef.current === normalizedMrn) return;

    // Check in Queue first
    const lead = queueRowsAll.find(
      (item) => normalizeMrn(item.mrn) === normalizedMrn,
    );
    if (lead) {
      setSelectedLeadId(lead.id);
      setForm(buildFormFromLead(lead));
      appliedMrnRef.current = normalizedMrn;
      return;
    }

    // Check in Admitted
    const patient = activeIpdPatients.find(
      (row) => normalizeMrn(row.mrn) === normalizedMrn,
    );
    if (patient) {
      setSelectedLeadId("");
      setForm(buildFormFromActivePatient(patient));
      appliedMrnRef.current = normalizedMrn;
    }
  }, [mrnParam, queueRowsAll, activeIpdPatients, buildFormFromActivePatient]);

  const allPatientsList = React.useMemo(
    () => activeIpdPatients.filter((patient) => Boolean(patient.bed)),
    [activeIpdPatients],
  );

  const activeIpdMrnSet = React.useMemo(
    () => new Set(activeIpdPatients.map((row) => normalizeMrn(row.mrn))),
    [activeIpdPatients],
  );

  const queueRows = React.useMemo<AdmissionQueueRow[]>(() => {
    const pendingAdmissionRows: AdmissionQueueRow[] = queueRowsAll
      .filter((lead) => !activeIpdMrnSet.has(normalizeMrn(lead.mrn)))
      .map((lead) => ({
        id: `lead-${lead.id}`,
        mrn: lead.mrn,
        patientName: lead.patientName,
        source: lead.source,
        priority: lead.priority,
        preferredWard: lead.preferredWard,
        consultant: lead.consultant,
        provisionalDiagnosis: lead.provisionalDiagnosis,
        stage: "Pending Admission",
      }));

    const leadByMrn = new Map(
      queueRowsAll.map((lead) => [normalizeMrn(lead.mrn), lead] as const),
    );

    const bedPendingRows: AdmissionQueueRow[] = activeIpdPatients
      .filter((patient) => !patient.bed)
      .map((patient) => {
        const lead = leadByMrn.get(normalizeMrn(patient.mrn));
        return {
          id: `bed-pending-${patient.id}`,
          mrn: patient.mrn,
          patientName: patient.patientName,
          source: lead?.source ?? "Transfer",
          priority: lead?.priority ?? "Routine",
          preferredWard: patient.ward,
          consultant: patient.consultant,
          provisionalDiagnosis: lead?.provisionalDiagnosis ?? "",
          stage: "Bed Pending",
        };
      });

    const merged = new Map<string, AdmissionQueueRow>();
    pendingAdmissionRows.forEach((row) =>
      merged.set(normalizeMrn(row.mrn), row),
    );
    bedPendingRows.forEach((row) => merged.set(normalizeMrn(row.mrn), row));
    return Array.from(merged.values());
  }, [activeIpdMrnSet, activeIpdPatients, queueRowsAll]);

  const topBarPatientOptions = React.useMemo<IpdPatientOption[]>(() => {
    const leadByMrn = new Map(
      queueRowsAll.map((lead) => [normalizeMrn(lead.mrn), lead] as const),
    );
    const merged = new Map<string, IpdPatientOption>();

    activeIpdPatients.forEach((patient) => {
      const mrnKey = normalizeMrn(patient.mrn);
      if (!mrnKey) return;

      const lead = leadByMrn.get(mrnKey);
      const dischargeCandidate = DISCHARGE_CANDIDATES.find(
        (row) => row.patientId === patient.id,
      );
      const status = !patient.bed
        ? "Bed Pending"
        : dischargeCandidate
          ? "Discharge Due"
          : "Admitted";
      const insurance =
        INSURANCE_BY_PATIENT_ID[patient.id] ??
        (lead
          ? lead.patientType === "Insurance"
            ? "HealthSecure TPA"
            : lead.patientType
          : "--");
      const tags = ["Admitted"];
      if (!patient.bed) tags.push("Bed Pending");
      if (dischargeCandidate) tags.push("Discharge Due");
      const infectionCase = getActiveInfectionCaseByMrn(patient.mrn);
      if (infectionCase) tags.push("Infection Control");
      if (
        patient.ward.toLowerCase().includes("icu") ||
        patient.bed.toLowerCase().includes("icu")
      ) {
        tags.push("ICU");
      }

      merged.set(mrnKey, {
        patientId: patient.id,
        name: patient.patientName,
        mrn: patient.mrn,
        ageGender: patient.ageGender,
        ward: patient.ward,
        bed: patient.bed || "--",
        consultant: patient.consultant,
        diagnosis: patient.diagnosis,
        status: infectionCase ? "Infection Alert" : status,
        statusTone:
          infectionCase
            ? "error"
            : status === "Discharge Due"
            ? "warning"
            : status === "Bed Pending"
              ? "warning"
              : "success",
        insurance,
        totalBill: TOTAL_BILL_BY_PATIENT_ID[patient.id] ?? 0,
        tags,
      });
    });

    queueRowsAll.forEach((lead) => {
      const mrnKey = normalizeMrn(lead.mrn);
      if (!mrnKey || merged.has(mrnKey)) return;

      const insurance =
        lead.patientType === "Insurance"
          ? "HealthSecure TPA"
          : lead.patientType;
      merged.set(mrnKey, {
        patientId: `lead-${lead.id}`,
        name: lead.patientName,
        mrn: lead.mrn,
        ageGender: `${lead.age} / ${lead.gender}`,
        ward: lead.preferredWard,
        bed: "--",
        consultant: lead.consultant,
        diagnosis: lead.provisionalDiagnosis,
        status: "Pending Admission",
        statusTone: "warning",
        insurance,
        totalBill: 0,
        tags: ["Pending Admission", lead.priority, lead.source],
      });
    });

    return Array.from(merged.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [activeIpdPatients, queueRowsAll]);

  const selectedTopBarPatient = React.useMemo<IpdPatientOption | null>(() => {
    const currentMrn = normalizeMrn(
      form.mrn || selectedLead?.mrn || mrnParam || "",
    );
    if (!currentMrn) return topBarPatientOptions[0] ?? null;
    return (
      topBarPatientOptions.find(
        (row) => normalizeMrn(row.mrn) === currentMrn,
      ) ??
      topBarPatientOptions[0] ??
      null
    );
  }, [form.mrn, mrnParam, selectedLead?.mrn, topBarPatientOptions]);

  const topBarFields = React.useMemo<IpdPatientTopBarField[]>(() => {
    if (!selectedTopBarPatient) return [];

    const mrnKey = normalizeMrn(selectedTopBarPatient.mrn);
    const lead = queueRowsAll.find((row) => normalizeMrn(row.mrn) === mrnKey);
    const activePatient = activeIpdPatients.find(
      (row) => normalizeMrn(row.mrn) === mrnKey,
    );
    const stay = INPATIENT_STAYS.find(
      (row) => normalizeMrn(row.mrn) === mrnKey,
    );
    const dischargeCandidate = activePatient
      ? DISCHARGE_CANDIDATES.find((row) => row.patientId === activePatient.id)
      : undefined;
    const globalPatient = getPatientByMrn(selectedTopBarPatient.mrn);
    const allergies =
      lead?.knownAllergies || globalPatient?.tags?.join(", ") || "No known";
    const infectionCase = getActiveInfectionCaseByMrn(
      selectedTopBarPatient.mrn,
    );
    const status =
      selectedTopBarPatient.status ||
      (activePatient?.bed ? "Admitted" : "Pending Admission");
    const totalBillValueRaw = selectedTopBarPatient.totalBill;
    const totalBillValue =
      typeof totalBillValueRaw === "number"
        ? totalBillValueRaw
        : Number(totalBillValueRaw);
    const totalBill = Number.isFinite(totalBillValue)
      ? INR_CURRENCY.format(totalBillValue)
      : "--";

    return [
      ...(infectionCase
        ? [
            {
              id: "infection",
              label: "Infection",
              value: `${infectionCase.organism} · ${infectionCase.icStatus}`,
              tone: "error" as const,
            },
          ]
        : []),
      {
        id: "age-sex",
        label: "Age / Sex",
        value:
          selectedTopBarPatient.ageGender ??
          stay?.ageGender ??
          (lead ? `${lead.age} / ${lead.gender}` : "--"),
      },
      {
        id: "ward-bed",
        label: "Ward / Bed",
        value: `${selectedTopBarPatient.ward || "--"} · ${
          selectedTopBarPatient.bed || "--"
        }`,
      },
      { id: "admitted", label: "Admitted", value: stay?.admissionDate ?? "--" },
      {
        id: "los",
        label: "LOS",
        value: dischargeCandidate ? `Day ${dischargeCandidate.losDays}` : "--",
      },
      {
        id: "diagnosis",
        label: "Diagnosis",
        value:
          selectedTopBarPatient.diagnosis || lead?.provisionalDiagnosis || "--",
      },
      {
        id: "consultant",
        label: "Consultant",
        value: selectedTopBarPatient.consultant || lead?.consultant || "--",
      },
      { id: "blood-group", label: "Blood Group", value: "--" },
      {
        id: "allergies",
        label: "Allergies",
        value: allergies,
        tone: allergies === "No known" ? "success" : "warning",
      },
      {
        id: "insurance",
        label: "Insurance",
        value: selectedTopBarPatient.insurance || "--",
        tone: "info",
      },
      {
        id: "status",
        label: "Status",
        value: status,
        tone:
          status === "Admitted"
            ? "success"
            : status === "Discharge Due"
              ? "warning"
              : "info",
      },
      { id: "total-bill", label: "Total Bill", value: totalBill, tone: "info" },
    ];
  }, [activeIpdPatients, queueRowsAll, selectedTopBarPatient]);

  const onSelectTopBarPatient = React.useCallback(
    (targetId: string) => {
      // Target can be a MRN or patientId depending on context, handled by topbar select
      const selectedPatient = topBarPatientOptions.find(
        (row) => row.patientId === targetId || row.mrn === targetId,
      );
      if (!selectedPatient) return;

      const mrnKey = normalizeMrn(selectedPatient.mrn);
      const lead = queueRowsAll.find((row) => normalizeMrn(row.mrn) === mrnKey);
      const activePatient = activeIpdPatients.find(
        (row) => normalizeMrn(row.mrn) === mrnKey,
      );

      if (lead) {
        setSelectedLeadId(lead.id);
        setForm(buildFormFromLead(lead));
      } else if (activePatient) {
        setSelectedLeadId("");
        setForm(buildFormFromActivePatient(activePatient));
      } else {
        setSelectedLeadId("");
        setForm((prev) => ({
          ...prev,
          patientName: selectedPatient.name,
          mrn: selectedPatient.mrn,
        }));
      }

      appliedMrnRef.current = mrnKey;
      const params = new URLSearchParams(searchParams.toString());
      params.set("mrn", selectedPatient.mrn);
      if (activePatient?.id) {
        params.set("patientId", activePatient.id);
      } else {
        params.delete("patientId");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [
      activeIpdPatients,
      buildFormFromActivePatient,
      pathname,
      queueRowsAll,
      router,
      searchParams,
      topBarPatientOptions,
    ],
  );

  const handleOpenAdmissionDialog = (rowId?: string) => {
    if (rowId) {
      const realId = rowId.startsWith("lead-")
        ? rowId.replace("lead-", "")
        : rowId;
      const lead = queueRowsAll.find((l) => l.id === realId);
      if (lead) {
        setSelectedLeadId(lead.id);
        setForm(buildFormFromLead(lead));
      } else {
        const patient = activeIpdPatients.find(
          (p) => p.id === rowId || `bed-pending-${p.id}` === rowId,
        );
        if (patient) {
          setSelectedLeadId("");
          setForm(buildFormFromActivePatient(patient));
        }
      }
    } else {
      setSelectedLeadId("");
      setForm(buildEmptyForm());
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveAdmission = () => {
    const newErrors: AdmissionErrors = {};
    if (!form.patientName.trim())
      newErrors.patientName = "Patient name is required";
    if (!form.mrn.trim()) newErrors.mrn = "MRN is required";
    if (!form.preferredWard.trim())
      newErrors.preferredWard = "Ward preference is required";
    if (!form.admissionReason.trim())
      newErrors.admissionReason = "Admission reason is required";
    if (!form.termsAccepted) newErrors.termsAccepted = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbar({
        open: true,
        message: "Please complete required fields.",
        severity: "error",
      });
      return;
    }

    const payload = {
      mrn: form.mrn,
      patientId: `ipd-new-${Date.now()}`,
      patientName: form.patientName,
      ageGender: "Age / Sex",
      consultant: form.consultant,
      ward: form.preferredWard,
      diagnosis: form.provisionalDiagnosis,
      bed: "",
      workflowStatus: "admitted" as const,
      updatedAt: new Date().toISOString(),
    };

    registerIpdAdmissionEncounter(payload);
    markOpdToIpdTransferHandledByMrn(form.mrn);

    setSnackbar({
      open: true,
      message: `${form.patientName} successfully admitted.`,
      severity: "success",
    });
    setDialogOpen(false);

    router.replace(
      `/ipd/beds?tab=bed-board&mrn=${form.mrn}&patientId=${payload.patientId}`,
    );
  };

  const handleOpenBedBoard = (row: any) => {
    const hasBed = Boolean(row.bed);
    const route = hasBed
      ? `/ipd/beds?mrn=${encodeURIComponent(row.mrn)}&patientId=${encodeURIComponent(row.id)}`
      : `/ipd/beds?tab=bed-board&mrn=${encodeURIComponent(row.mrn)}&patientId=${encodeURIComponent(row.id)}`;
    router.push(route);
  };

  const handleOpenInfectionCase = (row: PatientRow | AdmissionQueueRow) => {
    router.push(
      `/clinical/modules/bugsy-infection-control?mrn=${encodeURIComponent(row.mrn)}`,
    );
  };

  const filterRow = (rowValue: string, query: string) => {
    return String(rowValue ?? "")
      .toLowerCase()
      .includes(query.toLowerCase());
  };

  const filteredAllPatients = React.useMemo(() => {
    const query = allSearch.trim();
    return allPatientsList.filter((p) => {
      if (allStatusFilter !== "all" && p.status !== allStatusFilter)
        return false;
      if (allWardFilter !== "all" && p.ward !== allWardFilter) return false;
      if (!query) return true;
      return (
        filterRow(p.mrn, query) ||
        filterRow(p.patientName, query) ||
        filterRow(p.ward, query) ||
        filterRow(p.consultant, query)
      );
    });
  }, [allPatientsList, allSearch, allStatusFilter, allWardFilter]);

  const filteredQueueRows = React.useMemo(() => {
    const query = queueSearch.trim();
    return queueRows.filter((r) => {
      if (queuePriorityFilter !== "all" && r.priority !== queuePriorityFilter)
        return false;
      if (queueSourceFilter !== "all" && r.source !== queueSourceFilter)
        return false;
      if (!query) return true;
      return (
        filterRow(r.mrn, query) ||
        filterRow(r.patientName, query) ||
        filterRow(r.consultant, query) ||
        filterRow(r.provisionalDiagnosis, query)
      );
    });
  }, [queueRows, queueSearch, queuePriorityFilter, queueSourceFilter]);

  const visibleAllPatients = filteredAllPatients;
  const visibleQueueRows = filteredQueueRows;

  return {
    allSearch,
    setAllSearch,
    allStatusFilter,
    setAllStatusFilter,
    allWardFilter,
    setAllWardFilter,
    queueSearch,
    setQueueSearch,
    queuePriorityFilter,
    setQueuePriorityFilter,
    queueSourceFilter,
    setQueueSourceFilter,
    historyTab,
    setHistoryTab,
    dialogOpen,
    setDialogOpen,
    selectedLeadId,
    setSelectedLeadId,
    form,
    setForm,
    errors,
    setErrors,
    allPatients: allPatientsList,
    queueRows,
    visibleAllPatients,
    visibleQueueRows,
    topBarPatientOptions,
    selectedTopBarPatient,
    topBarFields,
    onSelectTopBarPatient,
    handleOpenAdmissionDialog,
    handleSaveAdmission,
    handleOpenBedBoard,
    handleOpenInfectionCase,
    canManageAdmissions,
    canOpenBedBoard,
    snackbar,
    setSnackbar,
  };
}
