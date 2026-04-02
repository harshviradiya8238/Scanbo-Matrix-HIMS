import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { useUser } from "@/src/core/auth/UserContext";
import { usePermission } from "@/src/core/auth/usePermission";
import { useAppDispatch } from "@/src/store/hooks";
import { useOpdData } from "@/src/store/opdHooks";
import {
  addEncounterOrder,
  addEncounterPrescription,
  addNote,
  addVitalTrend,
  removeEncounterOrder,
  removeEncounterPrescription,
  removeNote,
  updateEncounter,
  updateEncounterOrder,
  updateEncounterPrescription,
  updateNote,
} from "@/src/store/slices/opdSlice";
import {
  OpdVisitPageProps,
  SoapNote,
  VitalsDraft,
  HistoryDraft,
  SymptomDraft,
  DiagnosisLine,
  NoteDraftLine,
  NotesTabDraft,
  DraftOrderLine,
  PrescriptionLine,
  VisitTransferDraft,
  VisitTab,
  HISTORY_TEMPLATES,
  DIAGNOSIS_CATALOG,
  DIAGNOSIS_TYPE_OPTIONS,
  DIAGNOSIS_STATUS_OPTIONS,
  formatElapsed,
  sanitizeAllergies,
  normalizeMedicationKey,
  parseAmbientConsultationTranscript,
  analyzeRxShieldComparisons,
  isVisitTab,
  buildDefaultOrderLine,
  buildDefaultPrescriptionLine,
  buildDiagnosisLineFromCatalog,
  mapProblemToDiagnosisLine,
} from "../utils/opd-visit.utils";
import { resolveEncounterFromState } from "../../opd-encounter";
import { getOpdRoleFlowProfile } from "../../opd-role-flow";
import { OrderCatalogItem, MedicationCatalogItem } from "../../opd-mock-data";
import {
  buildDefaultTransferPayload,
  upsertOpdToIpdTransferLead,
} from "@/src/screens/ipd/ipd-transfer-store";
import { OpdVisitData } from "../utils/opd-visit-types";

export function useOpdVisitData({
  encounterId,
}: OpdVisitPageProps): OpdVisitData {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useUser();
  const permissionGate = usePermission();
  const dispatch = useAppDispatch();
  const mrnParam = useMrnParam();
  const {
    appointments,
    encounters,
    orders,
    prescriptions,
    noteTemplates,
    notes,
    vitalTrends,
    orderCatalog,
    medicationCatalog,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const encounter = React.useMemo(
    () => resolveEncounterFromState(encounters, { encounterId, mrn: mrnParam }),
    [encounters, encounterId, mrnParam],
  );

  const [activeTab, setActiveTab] = React.useState<VisitTab>("vitals");
  const [soap, setSoap] = React.useState<SoapNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [vitalsDraft, setVitalsDraft] = React.useState<VitalsDraft>({
    bp: "",
    hr: "",
    rr: "",
    temp: "",
    spo2: "",
    ecg: "",
    weightKg: "",
    bmi: "",
  });
  const [historyDraft, setHistoryDraft] = React.useState<HistoryDraft>({
    chiefComplaint: "",
    hpi: "",
    duration: "",
    severity: "",
  });
  const [historyTemplateOpen, setHistoryTemplateOpen] = React.useState(false);
  const [historyTemplateId, setHistoryTemplateId] = React.useState(
    HISTORY_TEMPLATES[0]?.id ?? "",
  );
  const [ambientDialogOpen, setAmbientDialogOpen] = React.useState(false);
  const [ambientInputText, setAmbientInputText] = React.useState("");
  const [symptomDialogOpen, setSymptomDialogOpen] = React.useState(false);
  const [symptomDraft, setSymptomDraft] = React.useState<SymptomDraft>({
    symptom: "",
    duration: "",
    severity: "",
  });
  const [pastHistoryOpen, setPastHistoryOpen] = React.useState(false);
  const [allergyDialogOpen, setAllergyDialogOpen] = React.useState(false);
  const [allergyInput, setAllergyInput] = React.useState("");
  const [editingAllergyIndex, setEditingAllergyIndex] = React.useState<
    number | null
  >(null);
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] = React.useState(false);
  const [diagnosisLines, setDiagnosisLines] = React.useState<DiagnosisLine[]>(
    [],
  );
  const [diagnosisDraft, setDiagnosisDraft] = React.useState<DiagnosisLine>(
    () => buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]),
  );
  const [editingDiagnosisId, setEditingDiagnosisId] = React.useState<
    string | null
  >(null);
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState<NoteDraftLine>({
    title: "",
    content: "",
    author: "",
  });
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [notesTabDraft, setNotesTabDraft] = React.useState<NotesTabDraft>({
    progressNotes: "",
    patientInstructions: "",
    followupRequired: "",
    followupNotes: "",
  });
  const [selectedNoteTemplateId, setSelectedNoteTemplateId] =
    React.useState("");
  const [voiceConsentTranscript, setVoiceConsentTranscript] =
    React.useState("");
  const [voiceConsentCapturedAt, setVoiceConsentCapturedAt] =
    React.useState("");
  const [workspaceStartedAt] = React.useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [isPullingScanboVitals, setIsPullingScanboVitals] =
    React.useState(false);
  const [ordersDialogOpen, setOrdersDialogOpen] = React.useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] =
    React.useState(false);
  const [rxShieldDialogOpen, setRxShieldDialogOpen] = React.useState(false);
  const [orderCategoryFilter, setOrderCategoryFilter] = React.useState<
    "All" | OrderCatalogItem["category"]
  >("All");
  const [orderDraft, setOrderDraft] = React.useState<DraftOrderLine>(() =>
    buildDefaultOrderLine(orderCatalog),
  );
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(
    null,
  );
  const [prescriptionDraft, setPrescriptionDraft] =
    React.useState<PrescriptionLine>(() =>
      buildDefaultPrescriptionLine(medicationCatalog),
    );
  const [editingPrescriptionId, setEditingPrescriptionId] = React.useState<
    string | null
  >(null);
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferDraft, setTransferDraft] = React.useState<VisitTransferDraft>({
    priority: "Routine",
    preferredWard: "Medical Ward - 1",
    provisionalDiagnosis: "",
    admissionReason: "",
    requestNote: "",
  });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const capabilities = {
    canStartConsult: roleProfile.capabilities.canStartConsult,
    canDocumentConsultation: roleProfile.capabilities.canDocumentConsultation,
    canPlaceOrders: roleProfile.capabilities.canPlaceOrders,
    canPrescribe: roleProfile.capabilities.canPrescribe,
    canCompleteVisit: roleProfile.capabilities.canCompleteVisit,
    canTransferToIpd:
      roleProfile.capabilities.canTransferToIpd &&
      permissionGate("ipd.transfer.write"),
  };

  const guardRoleAction = React.useCallback(
    (allowed: boolean, actionLabel: string): boolean => {
      if (allowed) return true;
      setSnackbar({
        open: true,
        message: `${roleProfile.label} cannot ${actionLabel}.`,
        severity: "warning",
      });
      return false;
    },
    [roleProfile.label],
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workspaceStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [workspaceStartedAt]);

  React.useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;
    if (isVisitTab(tabParam)) {
      setActiveTab(tabParam);
      return;
    }
    if (tabParam === "currentMedication") {
      setActiveTab("prescriptions");
      return;
    }
    if (tabParam === "overview") {
      setActiveTab("history");
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!encounter) return;
    setSoap((prev) => ({
      subjective: prev.subjective || encounter.triageNote,
      objective:
        prev.objective ||
        `BP ${encounter.vitals.bp}, HR ${encounter.vitals.hr}, BR ${encounter.vitals.rr}, Temp ${encounter.vitals.temp}, SpO2 ${encounter.vitals.spo2}`,
      assessment:
        prev.assessment ||
        (encounter.problems.length ? encounter.problems.join(", ") : ""),
      plan: prev.plan,
    }));
    setVitalsDraft({
      bp: encounter.vitals.bp,
      hr: encounter.vitals.hr,
      rr: encounter.vitals.rr,
      temp: encounter.vitals.temp,
      spo2: encounter.vitals.spo2,
      ecg: encounter.vitals.ecg ?? "",
      weightKg: encounter.vitals.weightKg,
      bmi: encounter.vitals.bmi,
    });
    setHistoryDraft((prev) => ({
      chiefComplaint: prev.chiefComplaint || encounter.chiefComplaint,
      hpi: prev.hpi || encounter.triageNote,
      duration: prev.duration,
      severity: prev.severity,
    }));
    setDiagnosisLines(
      (encounter.problems ?? []).map((problem: string, index: number) =>
        mapProblemToDiagnosisLine(problem, index),
      ),
    );
    setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
    setEditingDiagnosisId(null);
    setDiagnosisDialogOpen(false);
    setNotesTabDraft({
      progressNotes: `Chief Complaint: ${encounter.chiefComplaint}\nHPI: ${encounter.triageNote}`,
      patientInstructions: "",
      followupRequired: "",
      followupNotes: "",
    });
  }, [encounter?.id]);

  const encounterOrders = React.useMemo(
    () => orders.filter((item) => item.encounterId === encounter?.id),
    [orders, encounter?.id],
  );
  const encounterPrescriptions = React.useMemo(
    () => prescriptions.filter((item) => item.encounterId === encounter?.id),
    [prescriptions, encounter?.id],
  );
  const rxShieldFindings = React.useMemo(
    () =>
      analyzeRxShieldComparisons(
        encounterPrescriptions.map((item) => item.medicationName),
      ),
    [encounterPrescriptions],
  );
  const encounterNotes = React.useMemo(
    () => notes.filter((item) => item.patientId === encounter?.id),
    [notes, encounter?.id],
  );
  const priorEncounters = React.useMemo(
    () =>
      encounters.filter(
        (item) => item.mrn === encounter?.mrn && item.id !== encounter?.id,
      ),
    [encounters, encounter?.id, encounter?.mrn],
  );
  const priorEncounterIds = React.useMemo(
    () => new Set(priorEncounters.map((item) => item.id)),
    [priorEncounters],
  );
  const priorNotes = React.useMemo(
    () => notes.filter((item) => priorEncounterIds.has(item.patientId)),
    [notes, priorEncounterIds],
  );
  const latestTrend = React.useMemo(() => {
    const trends = vitalTrends.filter(
      (item) => item.patientId === encounter?.id,
    );
    return trends.length ? trends[trends.length - 1] : undefined;
  }, [encounter?.id, vitalTrends]);
  const filteredOrderCatalog = React.useMemo(
    () =>
      orderCatalog.filter(
        (item) =>
          orderCategoryFilter === "All" ||
          item.category === orderCategoryFilter,
      ),
    [orderCatalog, orderCategoryFilter],
  );

  const persistHistoryDraft = React.useCallback(
    (nextDraft: HistoryDraft) => {
      if (!encounter) return;
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            chiefComplaint: nextDraft.chiefComplaint,
            triageNote: nextDraft.hpi,
          },
        }),
      );
    },
    [dispatch, encounter],
  );

  const persistAllergies = React.useCallback(
    (allergies: string[]) => {
      if (!encounter) return;
      const cleaned = sanitizeAllergies(allergies);
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            allergies: cleaned.length > 0 ? cleaned : ["No known allergies"],
          },
        }),
      );
    },
    [dispatch, encounter],
  );

  const persistDiagnosisProblems = React.useCallback(
    (nextLines: DiagnosisLine[]) => {
      if (!encounter) return;
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            problems: nextLines
              .map((line) => line.diagnosisName)
              .filter(Boolean),
          },
        }),
      );
    },
    [dispatch, encounter],
  );

  const handleOpenAmbientInteraction = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "capture ambient interaction",
      )
    )
      return;
    setAmbientInputText(
      [
        historyDraft.chiefComplaint
          ? `Chief Complaint: ${historyDraft.chiefComplaint}`
          : "",
        historyDraft.hpi ? `HPI: ${historyDraft.hpi}` : "",
        soap.assessment ? `Assessment: ${soap.assessment}` : "",
        soap.plan ? `Plan: ${soap.plan}` : "",
        notesTabDraft.patientInstructions
          ? `Instructions: ${notesTabDraft.patientInstructions}`
          : "",
        notesTabDraft.followupRequired
          ? `Follow-up: ${notesTabDraft.followupRequired}`
          : "",
        notesTabDraft.followupNotes
          ? `Follow-up Notes: ${notesTabDraft.followupNotes}`
          : "",
        notesTabDraft.progressNotes,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    setAmbientDialogOpen(true);
  };

  const handleApplyAmbientInteraction = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "apply ambient interaction",
      )
    )
      return;
    const transcript = ambientInputText.trim();
    if (!transcript) {
      setSnackbar({
        open: true,
        message: "Enter dictated text before applying.",
        severity: "error",
      });
      return;
    }
    const parsed = parseAmbientConsultationTranscript(transcript);
    const nextHistory = {
      ...historyDraft,
      chiefComplaint: parsed.chiefComplaint || historyDraft.chiefComplaint,
      hpi: parsed.hpi || historyDraft.hpi,
    };
    setHistoryDraft(nextHistory);
    persistHistoryDraft(nextHistory);
    setSoap((prev) => ({
      ...prev,
      subjective: parsed.hpi || transcript,
      assessment: parsed.assessment || prev.assessment,
      plan: parsed.plan || prev.plan,
    }));
    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: parsed.additionalNotes || prev.progressNotes,
      patientInstructions:
        parsed.patientInstructions || prev.patientInstructions,
      followupRequired: parsed.followupRequired || prev.followupRequired,
      followupNotes: parsed.followupNotes || prev.followupNotes,
    }));
    setVoiceConsentTranscript(transcript);
    setVoiceConsentCapturedAt(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
    if (parsed.diagnosisNames.length > 0) {
      const existing = new Set(
        diagnosisLines.map((line) => line.diagnosisName.toLowerCase()),
      );
      const additions: DiagnosisLine[] = parsed.diagnosisNames
        .filter((name) => !existing.has(name.toLowerCase()))
        .map((name, index) => {
          const fromCatalog = DIAGNOSIS_CATALOG.find(
            (item) => item.name.toLowerCase() === name.toLowerCase(),
          );
          return {
            id: `dx-ambient-${Date.now()}-${index}`,
            diagnosisId: fromCatalog?.id ?? "",
            diagnosisName: fromCatalog?.name ?? name,
            icd10: fromCatalog?.icd10 ?? "",
            type:
              diagnosisLines.length === 0 && index === 0
                ? "Primary"
                : "Secondary",
            status: "Active",
            notes: "Captured from ambient consultation",
          };
        });
      if (additions.length > 0) {
        const nextLines = [...diagnosisLines, ...additions];
        setDiagnosisLines(nextLines);
        persistDiagnosisProblems(nextLines);
      }
    }
    setSnackbar({
      open: true,
      message: "Ambient consult applied across consultation fields.",
      severity: "success",
    });
    setAmbientDialogOpen(false);
  };

  const handleInsertNotesTemplate = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "insert note templates",
      )
    )
      return;
    const template = noteTemplates.find(
      (item) => item.id === selectedNoteTemplateId,
    );
    if (!template) {
      setSnackbar({
        open: true,
        message: "Select a template first.",
        severity: "error",
      });
      return;
    }
    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: prev.progressNotes
        ? `${prev.progressNotes}\n\n${template.content}`
        : template.content,
    }));
    setSnackbar({
      open: true,
      message: `${template.name} template inserted.`,
      severity: "success",
    });
  };

  const handleInsertNotesMacro = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "insert clinical note macros",
      )
    )
      return;
    const macro = [
      "Clinical reassessment done. Red-flag symptoms explained.",
      "Medication adherence reinforced and lifestyle modifications advised.",
    ].join("\n");
    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: prev.progressNotes
        ? `${prev.progressNotes}\n\n${macro}`
        : macro,
    }));
    setSnackbar({
      open: true,
      message: "Clinical macro inserted.",
      severity: "success",
    });
  };

  const handleGenerateHandout = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "generate patient handouts",
      )
    )
      return;
    if (!encounter) return;
    if (!notesTabDraft.patientInstructions.trim()) {
      setSnackbar({
        open: true,
        message: "Add patient instructions to generate handout.",
        severity: "error",
      });
      return;
    }
    setNotesDraft({
      title: `${encounter.patientName} - Patient Instructions`,
      author: encounter.doctor,
      content: [
        "Patient Instructions",
        notesTabDraft.patientInstructions.trim(),
        notesTabDraft.followupRequired
          ? `Follow-up: ${notesTabDraft.followupRequired}`
          : "",
        notesTabDraft.followupNotes
          ? `Follow-up Notes: ${notesTabDraft.followupNotes}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
    setEditingNoteId(null);
    setNotesDialogOpen(true);
    setSnackbar({
      open: true,
      message: "Handout draft prepared in notes dialog.",
      severity: "info",
    });
  };

  const handleScheduleFollowup = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "schedule follow-up plans",
      )
    )
      return;
    if (!encounter) return;
    if (!notesTabDraft.followupRequired) {
      setSnackbar({
        open: true,
        message: "Select follow-up timeframe.",
        severity: "error",
      });
      return;
    }
    const content = [
      `Progress Notes: ${notesTabDraft.progressNotes || "--"}`,
      `Patient Instructions: ${notesTabDraft.patientInstructions || "--"}`,
      `Follow-up Required: ${notesTabDraft.followupRequired}`,
      `Follow-up Notes: ${notesTabDraft.followupNotes || "--"}`,
    ].join("\n");
    dispatch(
      addNote({
        id: `note-followup-${Date.now()}`,
        patientId: encounter.id,
        title: `${encounter.patientName} - Follow-up Plan`,
        content,
        savedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        author: encounter.doctor,
      }),
    );
    setSnackbar({
      open: true,
      message: `Follow-up scheduled for ${notesTabDraft.followupRequired}.`,
      severity: "success",
    });
  };

  const handleEditOrder = (orderId: string) => {
    if (!guardRoleAction(capabilities.canPlaceOrders, "edit encounter orders"))
      return;
    const selectedOrder = encounterOrders.find((item) => item.id === orderId);
    if (!selectedOrder) return;
    const matchingCatalog = orderCatalog.find(
      (item) =>
        item.name === selectedOrder.orderName &&
        item.category === selectedOrder.category,
    );
    setOrderCategoryFilter(selectedOrder.category);
    setOrderDraft({
      id: `order-edit-${Date.now()}`,
      catalogId: matchingCatalog?.id ?? orderCatalog[0]?.id ?? "",
      priority: selectedOrder.priority,
      instructions: selectedOrder.instructions,
    });
    setEditingOrderId(selectedOrder.id);
    setOrdersDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (
      !guardRoleAction(capabilities.canPlaceOrders, "delete encounter orders")
    )
      return;
    dispatch(removeEncounterOrder(orderId));
    setSnackbar({
      open: true,
      message: "Order removed successfully.",
      severity: "success",
    });
  };

  const handleEditPrescription = (prescriptionId: string) => {
    if (
      !guardRoleAction(
        capabilities.canPrescribe,
        "edit encounter prescriptions",
      )
    )
      return;
    const selectedPrescription = encounterPrescriptions.find(
      (item) => item.id === prescriptionId,
    );
    if (!selectedPrescription) return;
    const matchingMedication = medicationCatalog.find(
      (item) =>
        `${item.genericName} ${item.strength}` ===
        selectedPrescription.medicationName,
    );
    setPrescriptionDraft({
      id: `rx-edit-${Date.now()}`,
      medicationId: matchingMedication?.id ?? medicationCatalog[0]?.id ?? "",
      dose: selectedPrescription.dose,
      frequency: selectedPrescription.frequency,
      durationDays: selectedPrescription.durationDays,
      route: selectedPrescription.route,
      instructions: selectedPrescription.instructions,
    });
    setEditingPrescriptionId(selectedPrescription.id);
    setPrescriptionDialogOpen(true);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    if (
      !guardRoleAction(
        capabilities.canPrescribe,
        "delete encounter prescriptions",
      )
    )
      return;
    dispatch(removeEncounterPrescription(prescriptionId));
    setSnackbar({
      open: true,
      message: "Medication removed from prescription list.",
      severity: "success",
    });
  };

  const saveVitals = () => {
    if (!guardRoleAction(capabilities.canDocumentConsultation, "save vitals"))
      return;
    if (!encounter) return;
    if (
      !vitalsDraft.bp ||
      !vitalsDraft.hr ||
      !vitalsDraft.rr ||
      !vitalsDraft.temp ||
      !vitalsDraft.spo2
    ) {
      setSnackbar({
        open: true,
        message: "BP, HR, Breath Rate, Temp and SpO2 are required.",
        severity: "error",
      });
      return;
    }
    dispatch(
      updateEncounter({ id: encounter.id, changes: { vitals: vitalsDraft } }),
    );
    dispatch(
      addVitalTrend({
        id: `vt-${Date.now()}`,
        patientId: encounter.id,
        recordedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        bp: vitalsDraft.bp,
        hr: vitalsDraft.hr,
        rr: vitalsDraft.rr,
        temp: vitalsDraft.temp,
        spo2: vitalsDraft.spo2,
        ecg: vitalsDraft.ecg,
        painScore: latestTrend?.painScore ?? 0,
        nurse: "Nurse Duty",
      }),
    );
    setSnackbar({
      open: true,
      message: "Vitals saved to encounter timeline.",
      severity: "success",
    });
  };

  const handlePullVitalsFromScanbo = async () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "pull vitals from Scanbo",
      )
    )
      return;
    if (!encounter || isPullingScanboVitals) return;
    setIsPullingScanboVitals(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setVitalsDraft((prev) => ({
      ...prev,
      bp: latestTrend?.bp || prev.bp || encounter.vitals.bp || "122/80",
      hr: latestTrend?.hr || prev.hr || encounter.vitals.hr || "84 bpm",
      rr: latestTrend?.rr || prev.rr || encounter.vitals.rr || "18/min",
      temp: latestTrend?.temp || prev.temp || encounter.vitals.temp || "98.6 F",
      spo2: latestTrend?.spo2 || prev.spo2 || encounter.vitals.spo2 || "98%",
      ecg:
        latestTrend?.ecg ||
        prev.ecg ||
        encounter.vitals.ecg ||
        "Normal sinus rhythm",
      weightKg: prev.weightKg || encounter.vitals.weightKg || "72",
      bmi: prev.bmi || encounter.vitals.bmi || "24.4",
    }));
    setIsPullingScanboVitals(false);
    setSnackbar({
      open: true,
      message: "Vitals pulled from Scanbo and populated in form.",
      severity: "success",
    });
  };

  const saveClinicalNote = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "save consultation notes",
      )
    )
      return;
    if (!encounter) return;
    if (!soap.assessment.trim() || !soap.plan.trim()) {
      setSnackbar({
        open: true,
        message: "Assessment and plan are required.",
        severity: "error",
      });
      return;
    }
    const subjectiveSummary = [
      historyDraft.chiefComplaint
        ? `Chief Complaint: ${historyDraft.chiefComplaint}`
        : "",
      historyDraft.hpi ? `HPI: ${historyDraft.hpi}` : "",
      historyDraft.duration ? `Duration: ${historyDraft.duration}` : "",
      historyDraft.severity ? `Severity: ${historyDraft.severity}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    dispatch(
      addNote({
        id: `note-${Date.now()}`,
        patientId: encounter.id,
        title: `${encounter.patientName} - OPD Progress Note`,
        content: [
          `Subjective: ${subjectiveSummary || soap.subjective}`,
          `Objective: ${soap.objective}`,
          `Assessment: ${soap.assessment}`,
          `Plan: ${soap.plan}`,
        ].join("\n"),
        savedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        author: encounter.doctor,
      }),
    );
    setSnackbar({
      open: true,
      message: "Consultation note saved.",
      severity: "success",
    });
  };

  const handleApplyComplaintTemplate = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "apply history templates",
      )
    )
      return;
    const selected = HISTORY_TEMPLATES.find(
      (item) => item.id === historyTemplateId,
    );
    if (!selected) {
      setSnackbar({
        open: true,
        message: "Select a template to apply.",
        severity: "error",
      });
      return;
    }
    const nextDraft: HistoryDraft = {
      chiefComplaint: selected.chiefComplaint,
      hpi: selected.hpi,
      duration: selected.duration,
      severity: selected.severity,
    };
    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: selected.hpi }));
    persistHistoryDraft(nextDraft);
    setHistoryTemplateOpen(false);
    setSnackbar({
      open: true,
      message: `${selected.name} template applied.`,
      severity: "success",
    });
  };

  const handleSaveSymptom = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "save symptom details",
      )
    )
      return;
    const symptom = symptomDraft.symptom.trim();
    if (!symptom) {
      setSnackbar({
        open: true,
        message: "Symptom name is required.",
        severity: "error",
      });
      return;
    }
    const symptomDuration =
      symptomDraft.duration || historyDraft.duration || "Unspecified duration";
    const symptomSeverity =
      symptomDraft.severity || historyDraft.severity || "Unspecified severity";
    const symptomLine = `- ${symptom} (${symptomDuration}, ${symptomSeverity})`;
    const nextHpi = historyDraft.hpi
      ? `${historyDraft.hpi}\n${symptomLine}`
      : symptomLine;
    const nextDraft: HistoryDraft = {
      ...historyDraft,
      hpi: nextHpi,
      duration: symptomDraft.duration || historyDraft.duration,
      severity: symptomDraft.severity || historyDraft.severity,
    };
    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setSymptomDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Symptom added to HPI.",
      severity: "success",
    });
  };

  const handleInsertPastHistory = (sourceEncounterId: string) => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "insert past history details",
      )
    )
      return;
    const source = priorEncounters.find(
      (item) => item.id === sourceEncounterId,
    );
    if (!source) {
      setSnackbar({
        open: true,
        message: "Unable to find selected past encounter.",
        severity: "error",
      });
      return;
    }
    const summary = `Past history (${source.appointmentTime}): ${source.chiefComplaint}. ${source.triageNote}`;
    const nextHpi = historyDraft.hpi
      ? `${historyDraft.hpi}\n${summary}`
      : summary;
    const nextDraft = { ...historyDraft, hpi: nextHpi };
    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setPastHistoryOpen(false);
    setSnackbar({
      open: true,
      message: "Past history inserted into HPI.",
      severity: "success",
    });
  };

  const handleSaveAllergy = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "save allergy details",
      )
    )
      return;
    if (!encounter) return;
    const value = allergyInput.trim();
    if (!value) {
      setSnackbar({
        open: true,
        message: "Allergy name is required.",
        severity: "error",
      });
      return;
    }
    const current = sanitizeAllergies(encounter.allergies);
    const next =
      editingAllergyIndex === null
        ? [...current, value]
        : current.map((item, index) =>
            index === editingAllergyIndex ? value : item,
          );
    persistAllergies(next);
    setAllergyDialogOpen(false);
    setEditingAllergyIndex(null);
    setAllergyInput("");
    setSnackbar({
      open: true,
      message:
        editingAllergyIndex === null ? "Allergy added." : "Allergy updated.",
      severity: "success",
    });
  };

  const handleDeleteAllergy = (index: number) => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "delete allergy details",
      )
    )
      return;
    if (!encounter) return;
    const current = sanitizeAllergies(encounter.allergies);
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    persistAllergies(next);
    setSnackbar({
      open: true,
      message: "Allergy removed.",
      severity: "success",
    });
  };

  const handleSaveDiagnosis = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "save diagnosis details",
      )
    )
      return;
    const name = diagnosisDraft.diagnosisName.trim();
    if (!name) {
      setSnackbar({
        open: true,
        message: "Diagnosis is required.",
        severity: "error",
      });
      return;
    }
    const duplicate = diagnosisLines.some(
      (line) =>
        line.diagnosisName.trim().toLowerCase() === name.toLowerCase() &&
        line.id !== editingDiagnosisId,
    );
    if (duplicate) {
      setSnackbar({
        open: true,
        message: "Diagnosis already added.",
        severity: "error",
      });
      return;
    }
    let next: DiagnosisLine[];
    if (editingDiagnosisId) {
      next = diagnosisLines.map((line) =>
        line.id === editingDiagnosisId
          ? { ...diagnosisDraft, diagnosisName: name, id: editingDiagnosisId }
          : line,
      );
    } else {
      next = [
        { ...diagnosisDraft, diagnosisName: name, id: `dx-${Date.now()}` },
        ...diagnosisLines,
      ];
    }
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    setSoap((prev) => ({
      ...prev,
      assessment: next.map((line) => line.diagnosisName).join(", "),
    }));
    setDiagnosisDialogOpen(false);
    setEditingDiagnosisId(null);
    setSnackbar({
      open: true,
      message: editingDiagnosisId
        ? "Diagnosis updated successfully."
        : "Diagnosis added successfully.",
      severity: "success",
    });
  };

  const handleDeleteDiagnosis = (diagnosisId: string) => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "delete diagnosis entries",
      )
    )
      return;
    const next = diagnosisLines.filter((line) => line.id !== diagnosisId);
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    setSoap((prev) => ({
      ...prev,
      assessment: next.length
        ? next.map((line) => line.diagnosisName).join(", ")
        : "",
    }));
    setSnackbar({
      open: true,
      message: "Diagnosis removed successfully.",
      severity: "success",
    });
  };

  const handleSaveNotesFromDialog = () => {
    if (
      !guardRoleAction(
        capabilities.canDocumentConsultation,
        "save consultation notes",
      )
    )
      return;
    if (!encounter) return;
    if (!notesDraft.title.trim() || !notesDraft.content.trim()) {
      setSnackbar({
        open: true,
        message: "Note title and content are required.",
        severity: "error",
      });
      return;
    }
    const payload = {
      title: notesDraft.title.trim(),
      content: notesDraft.content.trim(),
      author: notesDraft.author.trim() || encounter.doctor,
      savedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if (editingNoteId) {
      dispatch(updateNote({ id: editingNoteId, changes: payload }));
    } else {
      dispatch(
        addNote({
          id: `note-${Date.now()}`,
          patientId: encounter.id,
          ...payload,
        }),
      );
    }
    setNotesDialogOpen(false);
    setSnackbar({
      open: true,
      message: editingNoteId
        ? "Note updated successfully."
        : "Note added successfully.",
      severity: "success",
    });
  };

  const handleStartVisit = () => {
    if (!guardRoleAction(capabilities.canStartConsult, "start consultation"))
      return;
    if (!encounter) return;
    dispatch(
      updateEncounter({ id: encounter.id, changes: { status: "COMPLETED" } }),
    );
    setSnackbar({
      open: true,
      message: "Consultation started.",
      severity: "success",
    });
  };

  const handleCompleteVisit = () => {
    if (
      !guardRoleAction(capabilities.canCompleteVisit, "complete consultation")
    )
      return;
    if (!encounter) return;
    if (encounter.status !== "IN_PROGRESS") {
      setSnackbar({
        open: true,
        message: "Consultation must be IN_PROGRESS before completion.",
        severity: "error",
      });
      return;
    }
    dispatch(
      updateEncounter({ id: encounter.id, changes: { status: "COMPLETED" } }),
    );
    setSnackbar({
      open: true,
      message: `Visit completed for ${encounter.patientName}.`,
      severity: "success",
    });
    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleSubmitTransferToIpd = () => {
    if (!guardRoleAction(capabilities.canTransferToIpd, "move patient to IPD"))
      return;
    if (!encounter) return;
    if (
      !transferDraft.preferredWard.trim() ||
      !transferDraft.admissionReason.trim()
    ) {
      setSnackbar({
        open: true,
        message:
          "Preferred ward and admission reason are required for IPD transfer.",
        severity: "error",
      });
      return;
    }
    const appointment = appointments.find(
      (row) => row.id === encounter.appointmentId,
    );
    const defaults = buildDefaultTransferPayload(encounter, {
      payerType: appointment?.payerType,
      phone: appointment?.phone,
      requestedBy: roleProfile.label,
      requestedByRole: role,
    });
    const result = upsertOpdToIpdTransferLead({
      ...defaults,
      priority: transferDraft.priority,
      preferredWard: transferDraft.preferredWard.trim(),
      provisionalDiagnosis:
        transferDraft.provisionalDiagnosis.trim() ||
        (defaults.provisionalDiagnosis ?? ""),
      admissionReason: transferDraft.admissionReason.trim(),
      requestNote: transferDraft.requestNote.trim(),
    });
    dispatch(
      updateEncounter({ id: encounter.id, changes: { status: "IN_PROGRESS" } }),
    );
    setTransferDialogOpen(false);
    setSnackbar({
      open: true,
      message:
        result.status === "created"
          ? `IPD transfer created for ${encounter.patientName}.`
          : `IPD transfer updated for ${encounter.patientName}.`,
      severity: "success",
    });
    router.push(`/ipd/admissions?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleSaveOrder = () => {
    if (!guardRoleAction(capabilities.canPlaceOrders, "save encounter orders"))
      return;
    if (!encounter) return;
    const selectedCatalog = orderCatalog.find(
      (item) => item.id === orderDraft.catalogId,
    );
    if (!selectedCatalog) {
      setSnackbar({
        open: true,
        message: "Select an order from catalog.",
        severity: "error",
      });
      return;
    }
    const orderedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (editingOrderId) {
      dispatch(
        updateEncounterOrder({
          id: editingOrderId,
          changes: {
            orderName: selectedCatalog.name,
            category: selectedCatalog.category,
            priority: orderDraft.priority,
            instructions: orderDraft.instructions,
            orderedAt,
          },
        }),
      );
      setOrdersDialogOpen(false);
      setOrderDraft(buildDefaultOrderLine(orderCatalog));
      setEditingOrderId(null);
      setSnackbar({
        open: true,
        message: "Order updated successfully.",
        severity: "success",
      });
      return;
    }
    dispatch(
      addEncounterOrder({
        id: `order-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        orderName: selectedCatalog.name,
        category: selectedCatalog.category,
        priority: orderDraft.priority,
        status: "Pending",
        instructions: orderDraft.instructions,
        orderedAt,
      }),
    );
    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: "IN_PROGRESS" },
      }),
    );
    setOrdersDialogOpen(false);
    setOrderDraft(buildDefaultOrderLine(orderCatalog));
    setEditingOrderId(null);
    setSnackbar({
      open: true,
      message: "Order added successfully.",
      severity: "success",
    });
  };

  const handleSavePrescription = () => {
    if (
      !guardRoleAction(
        capabilities.canPrescribe,
        "save encounter prescriptions",
      )
    )
      return;
    if (!encounter) return;
    if (
      !prescriptionDraft.medicationId ||
      !prescriptionDraft.dose ||
      !prescriptionDraft.frequency ||
      !prescriptionDraft.durationDays
    ) {
      setSnackbar({
        open: true,
        message: "Medication, dose, frequency and duration are required.",
        severity: "error",
      });
      return;
    }
    const medication = medicationCatalog.find(
      (item) => item.id === prescriptionDraft.medicationId,
    );
    if (!medication) {
      setSnackbar({
        open: true,
        message: "Select a valid medication from catalog.",
        severity: "error",
      });
      return;
    }
    const medicationName = `${medication.genericName} ${medication.strength}`;
    const issuedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (editingPrescriptionId) {
      dispatch(
        updateEncounterPrescription({
          id: editingPrescriptionId,
          changes: {
            medicationName,
            dose: prescriptionDraft.dose,
            frequency: prescriptionDraft.frequency,
            durationDays: prescriptionDraft.durationDays,
            route: prescriptionDraft.route,
            instructions: prescriptionDraft.instructions,
            issuedAt,
          },
        }),
      );
      setPrescriptionDialogOpen(false);
      setPrescriptionDraft(buildDefaultPrescriptionLine(medicationCatalog));
      setEditingPrescriptionId(null);
      setSnackbar({
        open: true,
        message: "Medication updated successfully.",
        severity: "success",
      });
      return;
    }
    dispatch(
      addEncounterPrescription({
        id: `rx-issued-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        medicationName,
        dose: prescriptionDraft.dose,
        frequency: prescriptionDraft.frequency,
        durationDays: prescriptionDraft.durationDays,
        route: prescriptionDraft.route,
        instructions: prescriptionDraft.instructions,
        issuedAt,
      }),
    );
    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: "IN_PROGRESS" },
      }),
    );
    setPrescriptionDialogOpen(false);
    setPrescriptionDraft(buildDefaultPrescriptionLine(medicationCatalog));
    setEditingPrescriptionId(null);
    setSnackbar({
      open: true,
      message: "Medication added successfully.",
      severity: "success",
    });
  };

  return {
    encounter,
    activeTab,
    setActiveTab,
    soap,
    setSoap,
    vitalsDraft,
    setVitalsDraft,
    historyDraft,
    setHistoryDraft,
    historyTemplateOpen,
    setHistoryTemplateOpen,
    historyTemplateId,
    setHistoryTemplateId,
    ambientDialogOpen,
    setAmbientDialogOpen,
    ambientInputText,
    setAmbientInputText,
    symptomDialogOpen,
    setSymptomDialogOpen,
    symptomDraft,
    setSymptomDraft,
    pastHistoryOpen,
    setPastHistoryOpen,
    allergyDialogOpen,
    setAllergyDialogOpen,
    allergyInput,
    setAllergyInput,
    editingAllergyIndex,
    setEditingAllergyIndex,
    diagnosisDialogOpen,
    setDiagnosisDialogOpen,
    diagnosisLines,
    setDiagnosisLines,
    diagnosisDraft,
    setDiagnosisDraft,
    editingDiagnosisId,
    setEditingDiagnosisId,
    notesDialogOpen,
    setNotesDialogOpen,
    notesDraft,
    setNotesDraft,
    editingNoteId,
    setEditingNoteId,
    notesTabDraft,
    setNotesTabDraft,
    selectedNoteTemplateId,
    setSelectedNoteTemplateId,
    voiceConsentTranscript,
    setVoiceConsentTranscript,
    voiceConsentCapturedAt,
    setVoiceConsentCapturedAt,
    elapsedSeconds,
    isPullingScanboVitals,
    setIsPullingScanboVitals,
    ordersDialogOpen,
    setOrdersDialogOpen,
    prescriptionDialogOpen,
    setPrescriptionDialogOpen,
    rxShieldDialogOpen,
    setRxShieldDialogOpen,
    orderCategoryFilter,
    setOrderCategoryFilter,
    orderDraft,
    setOrderDraft,
    editingOrderId,
    setEditingOrderId,
    prescriptionDraft,
    setPrescriptionDraft,
    editingPrescriptionId,
    setEditingPrescriptionId,
    transferDialogOpen,
    setTransferDialogOpen,
    transferDraft,
    setTransferDraft,
    snackbar,
    setSnackbar,
    roleProfile,
    capabilities,
    encounterOrders,
    encounterPrescriptions,
    rxShieldFindings,
    encounterNotes,
    priorEncounters,
    priorNotes,
    latestTrend,
    filteredOrderCatalog,
    handleOpenAmbientInteraction,
    handleApplyAmbientInteraction,
    handleInsertNotesTemplate,
    handleInsertNotesMacro,
    handleGenerateHandout,
    handleScheduleFollowup,
    handleDeleteOrder,
    handleEditOrder,
    handleSaveOrder,
    handleDeletePrescription,
    handleEditPrescription,
    handleSavePrescription,
    saveVitals,
    handlePullVitalsFromScanbo,
    saveClinicalNote,
    handleApplyComplaintTemplate,
    handleSaveSymptom,
    handleInsertPastHistory,
    handleSaveAllergy,
    handleDeleteAllergy,
    handleSaveDiagnosis,
    handleDeleteDiagnosis,
    handleSaveNotesFromDialog,
    handleStartVisit,
    handleCompleteVisit,
    handleSubmitTransferToIpd,
    guardRoleAction,
    handleExitVisit: () =>
      router.push(
        `/appointments/queue?mrn=${encodeURIComponent(encounter?.mrn || "")}`,
      ),
    openOrderDialog: () => {
      if (
        guardRoleAction(capabilities.canPlaceOrders, "manage encounter orders")
      ) {
        setOrderDraft(buildDefaultOrderLine(orderCatalog));
        setEditingOrderId(null);
        setOrdersDialogOpen(true);
      }
    },
    openPrescriptionDialog: () => {
      if (
        guardRoleAction(
          capabilities.canPrescribe,
          "manage encounter prescriptions",
        )
      ) {
        setPrescriptionDraft(buildDefaultPrescriptionLine(medicationCatalog));
        setEditingPrescriptionId(null);
        setPrescriptionDialogOpen(true);
      }
    },
    openDiagnosisDialog: () => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "manage diagnosis details",
        )
      ) {
        setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
        setEditingDiagnosisId(null);
        setDiagnosisDialogOpen(true);
      }
    },
    openNotesDialog: () => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "manage consultation notes",
        )
      ) {
        setNotesDraft({
          title: encounter
            ? `${encounter.patientName} - OPD Progress Note`
            : "",
          content: "",
          author: encounter?.doctor ?? "",
        });
        setEditingNoteId(null);
        setNotesDialogOpen(true);
      }
    },
    handleAddSymptom: () => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "add symptom details",
        )
      ) {
        setSymptomDraft({
          symptom: "",
          duration: historyDraft.duration,
          severity: historyDraft.severity,
        });
        setSymptomDialogOpen(true);
      }
    },
    handleUseComplaintTemplate: () => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "use history templates",
        )
      )
        setHistoryTemplateOpen(true);
    },
    handleAddAllergy: () => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "add allergy details",
        )
      ) {
        setAllergyDialogOpen(true);
        setEditingAllergyIndex(null);
        setAllergyInput("");
      }
    },
    handleViewPastHistory: () => setPastHistoryOpen(true),
    handleOpenRxShieldComparison: () => {
      if (
        !guardRoleAction(capabilities.canPrescribe, "run Rx Shield comparison")
      )
        return;
      if (encounterPrescriptions.length < 2) {
        setSnackbar({
          open: true,
          message: "Add at least 2 medicines to run Rx Shield.",
          severity: "info",
        });
        return;
      }
      setRxShieldDialogOpen(true);
    },
    handleEditDiagnosis: (id: string) => {
      if (
        !guardRoleAction(
          capabilities.canDocumentConsultation,
          "edit diagnosis details",
        )
      )
        return;
      const selected = diagnosisLines.find((line) => line.id === id);
      if (selected) {
        setDiagnosisDraft({ ...selected, id: `dx-edit-${Date.now()}` });
        setEditingDiagnosisId(selected.id);
        setDiagnosisDialogOpen(true);
      }
    },
    handleDeleteNote: (id: string) => {
      if (
        guardRoleAction(
          capabilities.canDocumentConsultation,
          "delete consultation notes",
        )
      ) {
        dispatch(removeNote(id));
        setSnackbar({
          open: true,
          message: "Note deleted successfully.",
          severity: "success",
        });
      }
    },
    handleEditNote: (id: string) => {
      if (
        !guardRoleAction(
          capabilities.canDocumentConsultation,
          "edit consultation notes",
        )
      )
        return;
      const selected = encounterNotes.find((note) => note.id === id);
      if (selected) {
        setNotesDraft({
          title: selected.title,
          content: selected.content,
          author: selected.author,
        });
        setEditingNoteId(selected.id);
        setNotesDialogOpen(true);
      }
    },
    handleOpenTransferToIpd: () => {
      if (
        !guardRoleAction(capabilities.canTransferToIpd, "move patient to IPD")
      )
        return;
      if (!encounter) return;
      const appointment = appointments.find(
        (row) => row.id === encounter.appointmentId,
      );
      const defaults = buildDefaultTransferPayload(encounter, {
        payerType: appointment?.payerType,
        phone: appointment?.phone,
        requestedBy: roleProfile.label,
        requestedByRole: role,
      });
      setTransferDraft({
        priority: defaults.priority,
        preferredWard: defaults.preferredWard,
        provisionalDiagnosis: defaults.provisionalDiagnosis ?? "",
        admissionReason: defaults.admissionReason,
        requestNote: "",
      });
      setTransferDialogOpen(true);
    },
    handleViewDifferentialDx: () => {
      const differential = diagnosisLines.filter(
        (line) => line.type === "Differential",
      );
      if (!differential.length) {
        setSnackbar({
          open: true,
          message: "No differential diagnosis added yet.",
          severity: "info",
        });
        return;
      }
      setSnackbar({
        open: true,
        message: `Differential diagnosis: ${differential.map((line) => line.diagnosisName).join(", ")}`,
        severity: "info",
      });
    },
    handleUseClinicalGuidelines: () =>
      setSnackbar({
        open: true,
        message:
          "Clinical guideline integration is not connected in this screen yet.",
        severity: "info",
      }),
  };
}
