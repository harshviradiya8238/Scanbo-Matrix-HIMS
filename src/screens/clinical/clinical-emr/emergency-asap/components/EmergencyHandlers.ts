import {
  DEFAULT_REGISTRATION,
  DEFAULT_ORDER_FORM,
  BED_ASSIGN_PHYSICIANS,
  BED_ASSIGN_NURSES,
} from "../AsapEmergencyData";
import { 
  normalizePhone,
  buildPatientId,
  buildMrn,
  nowLabel,
  bedStatusForPatient,
  applyPatientAcuityToBeds
} from "./utils";
import type {
  EmergencyPatient,
  EmergencyBed,
  EmergencyOrder,
  ObservationEntry,
  BedAssignForm,
  RegistrationForm,
  TriageForm,
  VitalsForm,
  DischargeForm,
  BedAssignPriority,
  OrderStatus,
  OrderForm,
} from "../types";

export const createEmergencyHandlers = (context: {
  patients: EmergencyPatient[];
  setPatients: React.Dispatch<React.SetStateAction<EmergencyPatient[]>>;
  beds: EmergencyBed[];
  setBeds: React.Dispatch<React.SetStateAction<EmergencyBed[]>>;
  orders: EmergencyOrder[];
  setOrders: React.Dispatch<React.SetStateAction<EmergencyOrder[]>>;
  observationLog: ObservationEntry[];
  setObservationLog: React.Dispatch<React.SetStateAction<ObservationEntry[]>>;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  selectedPatient: EmergencyPatient | null;
  assignBedForm: BedAssignForm;
  setAssignBedForm: React.Dispatch<React.SetStateAction<BedAssignForm>>;
  setAssignBedModalOpen: (open: boolean) => void;
  registrationForm: RegistrationForm;
  setRegistrationForm: React.Dispatch<React.SetStateAction<RegistrationForm>>;
  setRegistrationModalOpen: (open: boolean) => void;
  setRegistrationSearch: (search: string) => void;
  setActivePage: (page: any) => void;
  triageForm: TriageForm;
  setTriageForm: React.Dispatch<React.SetStateAction<TriageForm>>;
  setTriageModalOpen: (open: boolean) => void;
  vitalsForm: VitalsForm;
  setVitalsForm: React.Dispatch<React.SetStateAction<VitalsForm>>;
  setVitalsDialogOpen: (open: boolean) => void;
  clinicalNoteDraft: string;
  openRoute: (route: string, query?: Record<string, string>) => void;
  notify: (msg: string, sev: "success" | "warning" | "info" | "error") => void;
  dischargeForm: DischargeForm;
  orderForm: OrderForm;
  setOrderForm: React.Dispatch<React.SetStateAction<OrderForm>>;
}) => {
  const {
    patients, setPatients, beds, setBeds, orders, setOrders, observationLog, setObservationLog,
    selectedPatientId, setSelectedPatientId, selectedPatient,
    assignBedForm, setAssignBedForm, setAssignBedModalOpen,
    registrationForm, setRegistrationForm, setRegistrationModalOpen, setRegistrationSearch,
    setActivePage, triageForm, setTriageForm, setTriageModalOpen,
    vitalsForm, setVitalsForm, setVitalsDialogOpen,
    clinicalNoteDraft, openRoute, notify, dischargeForm, orderForm, setOrderForm
  } = context;

  const handleUseExistingPatient = (patientId: string) => {
    setRegistrationModalOpen(false);
    setSelectedPatientId(patientId);
    setActivePage("chart");
  };

  const openTriageAssessment = (patientId: string) => {
    const triagePatient = patients.find((p) => p.id === patientId);
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
  };

  const openVitalsDialog = (patientId?: string) => {
    const targetPatient = patients.find((p) => p.id === (patientId || selectedPatientId));
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
  };

  const openAssignBedModal = (patientId: string, preferredBedId = "") => {
    const queuePatient = patients.find((p) => p.id === patientId);
    if (!queuePatient) return;

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
  };

  const handleRegisterPatient = () => {
    const name = registrationForm.name.trim();
    const complaint = registrationForm.chiefComplaint.trim();
    const phone = normalizePhone(registrationForm.phone);
    const age = Number(registrationForm.age);

    if (!name || !complaint || !phone || phone.length < 10 || !Number.isFinite(age) || age <= 0) {
      notify("Please enter valid registration details before saving.", "warning");
      return;
    }

    const duplicate = patients.find((p) => normalizePhone(p.phone) === phone);
    if (duplicate) {
      notify(`Patient already exists in ER queue: ${duplicate.id}`, "info");
      setRegistrationModalOpen(false);
      setSelectedPatientId(duplicate.id);
      setActivePage("chart");
      return;
    }

    const id = buildPatientId();
    const nextPatient: EmergencyPatient = {
      id,
      mrn: buildMrn(),
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
    notify(`Emergency registration completed for ${nextPatient.id}.`, "success");
  };

  const handleSaveTriage = () => {
    const triagePatient = patients.find((p) => p.id === triageForm.patientId);
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
            status: patient.status === "Waiting" ? "In Treatment" : patient.status,
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
        : patient
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
  };

  const assignBed = (
    patientId: string,
    bedId: string,
    assignment?: Pick<BedAssignForm, "physician" | "nurse" | "priority" | "notes">
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
        : row
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
          status: "Cleaning" as any,
        };
      }
      return row;
    });

    setPatients(nextPatients);
    setBeds(applyPatientAcuityToBeds(nextPatients, nextBeds));
    setSelectedPatientId(patientId);
    notify(`Bed assigned: ${patientId} -> ${bedId}`, "success");
  };

  const handleOpenPatientChart = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePage("chart");
  };

  const handleConfirmAssignBed = () => {
    if (!assignBedForm.patientId || !assignBedForm.bedId) {
      notify("Select an available bed before confirming assignment.", "warning");
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
  };

  const handleSetBedFree = (bedId: string) => {
    setBeds((prev) =>
      prev.map((bed) => (bed.id === bedId ? { ...bed, status: "Free", patientId: null } : bed))
    );

    setPatients((prev) =>
      prev.map((patient) =>
        patient.assignedBed === bedId
          ? { ...patient, assignedBed: null, status: "Waiting", updatedAt: nowLabel() }
          : patient
      )
    );
    notify(`${bedId} is now marked Free.`, "success");
  };

  const handleSaveClinicalNote = () => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatient.id
          ? { ...patient, clinicalNotes: clinicalNoteDraft.trim(), updatedAt: nowLabel() }
          : patient
      )
    );
    notify("Clinical note updated.", "success");
  };

  const handleApplyOrderTemplate = (template: string) => {
    setOrderForm((prev) => ({ ...prev, item: template }));
  };

  const handleAddOrder = () => {
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
  };

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const handleSaveVitals = () => {
    const targetPatient = patients.find((p) => p.id === vitalsForm.patientId);
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
          : patient
      )
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
  };

  const handleDisposition = (action: "discharge" | "admit" | "transfer") => {
    if (!selectedPatient) {
      notify("Select a patient before disposition.", "warning");
      return;
    }

    if (action === "discharge" && (!dischargeForm.diagnosis.trim() || !dischargeForm.instructions.trim())) {
      notify("Add diagnosis and discharge instructions before discharging.", "warning");
      return;
    }

    const patientId = selectedPatient.id;
    const patientMrn = selectedPatient.mrn;

    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setOrders((prev) => prev.filter((o) => o.patientId !== patientId));
    setObservationLog((prev) => prev.filter((entry) => entry.patientId !== patientId));
    setBeds((prev) =>
      prev.map((bed) => (bed.patientId === patientId ? { ...bed, patientId: null, status: "Cleaning" } : bed))
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
  };

  return {
    handleUseExistingPatient,
    openTriageAssessment,
    openVitalsDialog,
    openAssignBedModal,
    handleRegisterPatient,
    handleSaveTriage,
    assignBed,
    handleOpenPatientChart,
    handleConfirmAssignBed,
    handleSetBedFree,
    handleSaveClinicalNote,
    handleApplyOrderTemplate,
    handleAddOrder,
    handleOrderStatusChange,
    handleSaveVitals,
    handleDisposition,
  };
};
