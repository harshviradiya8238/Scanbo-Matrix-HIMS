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
  setAssignBedModalOpen: (open: boolean) => void;
  setRegistrationModalOpen: (open: boolean) => void;
  setRegistrationSearch: (search: string) => void;
  setActivePage: (page: any) => void;
  setTriageModalOpen: (open: boolean) => void;
  setVitalsDialogOpen: (open: boolean) => void;
  openRoute: (route: string, query?: Record<string, string>) => void;
  notify: (msg: string, sev: "success" | "warning" | "info" | "error") => void;
}) => {
  const {
    patients, setPatients, beds, setBeds, orders, setOrders, observationLog, setObservationLog,
    selectedPatientId, setSelectedPatientId,
    setAssignBedModalOpen,
    setRegistrationModalOpen, setRegistrationSearch,
    setActivePage, setTriageModalOpen,
    setVitalsDialogOpen,
    openRoute, notify
  } = context;

  const handleUseExistingPatient = (patientId: string) => {
    setRegistrationModalOpen(false);
    setSelectedPatientId(patientId);
    setActivePage("chart");
  };

  const openTriageAssessment = (patientId: string) => {
    setSelectedPatientId(patientId);
    setTriageModalOpen(true);
  };

  const openVitalsDialog = (patientId?: string) => {
    if (patientId) setSelectedPatientId(patientId);
    setVitalsDialogOpen(true);
  };

  const openAssignBedModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setAssignBedModalOpen(true);
  };

  const handleRegisterPatient = (form: RegistrationForm) => {
    const name = form.name.trim();
    const complaint = form.chiefComplaint.trim();
    const phone = normalizePhone(form.phone);
    const age = Number(form.age);

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
      gender: form.gender,
      phone,
      arrivalMode: form.arrivalMode,
      broughtBy: form.broughtBy.trim() || "Not specified",
      chiefComplaint: complaint,
      triageLevel: form.triageLevel,
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

    setPatients((prev: EmergencyPatient[]) => [nextPatient, ...prev]);
    setSelectedPatientId(nextPatient.id);
    setRegistrationModalOpen(false);
    setRegistrationSearch("");
    setActivePage("triage");
    notify(`Emergency registration completed for ${nextPatient.id}.`, "success");
  };

  const handleSaveTriage = (form: TriageForm) => {
    const triagePatient = patients.find((p) => p.id === form.patientId);
    if (!triagePatient) {
      notify("Select a patient for triage assessment.", "warning");
      return;
    }

    const heartRate = Number(form.heartRate);
    const temperature = Number(form.temperature);
    const respiratoryRate = Number(form.respiratoryRate);
    const spo2 = Number(form.spo2);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !form.bloodPressure.trim()
    ) {
      notify("Capture complete vitals before submitting triage.", "warning");
      return;
    }

    const nextPatients = patients.map((patient) =>
      patient.id === triagePatient.id
        ? {
            ...patient,
            triageLevel: form.triageLevel,
            status: patient.status === "Waiting" ? "In Treatment" : patient.status,
            vitals: {
              ...patient.vitals,
              heartRate,
              bloodPressure: form.bloodPressure.trim(),
              temperature,
              respiratoryRate,
              spo2,
              capturedAt: nowLabel(),
            },
            updatedAt: nowLabel(),
          }
        : patient
    );

    setPatients(nextPatients);
    setBeds((prev: EmergencyBed[]) => applyPatientAcuityToBeds(nextPatients, prev));

    setObservationLog((prev) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: triagePatient.id,
        recordedAt: nowLabel(),
        heartRate,
        bloodPressure: form.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore: triagePatient.vitals.painScore,
        gcs: triagePatient.vitals.gcs,
        note: `Triage assessment updated (${form.triageLevel})`,
      },
      ...prev,
    ]);

    setSelectedPatientId(triagePatient.id);
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

  const handleConfirmAssignBed = (form: BedAssignForm) => {
    if (!form.patientId || !form.bedId) {
      notify("Select an available bed before confirming assignment.", "warning");
      return;
    }

    assignBed(form.patientId, form.bedId, {
      physician: form.physician,
      nurse: form.nurse,
      priority: form.priority,
      notes: form.notes,
    });
    setAssignBedModalOpen(false);
    handleOpenPatientChart(form.patientId);
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

  const handleSaveClinicalNote = (note: string) => {
    if (!selectedPatientId) return;

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatientId
          ? { ...patient, clinicalNotes: note.trim(), updatedAt: nowLabel() }
          : patient
      )
    );
    notify("Clinical note updated.", "success");
  };

  const handleAddOrder = (form: OrderForm) => {
    if (!selectedPatientId) {
      notify("Select a patient before adding an order.", "warning");
      return;
    }

    const item = form.item.trim();
    if (!item) {
      notify("Order item is required.", "warning");
      return;
    }

    setOrders((prev: EmergencyOrder[]) => [
      {
        id: `ER-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: selectedPatientId,
        type: form.type,
        item,
        priority: form.priority,
        status: "Pending",
        orderedAt: nowLabel(),
      },
      ...prev,
    ]);

    notify("Emergency order placed.", "success");
  };

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const handleSaveVitals = (form: VitalsForm) => {
    const targetPatient = patients.find((p) => p.id === form.patientId);
    if (!targetPatient) {
      notify("Select a patient before recording vitals.", "warning");
      return;
    }

    const heartRate = Number(form.heartRate);
    const temperature = Number(form.temperature);
    const respiratoryRate = Number(form.respiratoryRate);
    const spo2 = Number(form.spo2);
    const painScore = Number(form.painScore);
    const gcs = Number(form.gcs);

    if (
      !Number.isFinite(heartRate) ||
      !Number.isFinite(temperature) ||
      !Number.isFinite(respiratoryRate) ||
      !Number.isFinite(spo2) ||
      !Number.isFinite(painScore) ||
      !Number.isFinite(gcs) ||
      !form.bloodPressure.trim()
    ) {
      notify("Complete all vital parameters before saving.", "warning");
      return;
    }

    const updatedAt = nowLabel();
    setPatients((prev: EmergencyPatient[]) =>
      prev.map((patient: EmergencyPatient) =>
        patient.id === targetPatient.id
          ? {
              ...patient,
              vitals: {
                heartRate,
                bloodPressure: form.bloodPressure.trim(),
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

    setObservationLog((prev: ObservationEntry[]) => [
      {
        id: `OBS-${Date.now()}`,
        patientId: targetPatient.id,
        recordedAt: updatedAt,
        heartRate,
        bloodPressure: form.bloodPressure.trim(),
        temperature,
        respiratoryRate,
        spo2,
        painScore,
        gcs,
        note: form.notes.trim() || "Bedside vital capture",
      },
      ...prev,
    ]);

    setVitalsDialogOpen(false);
    notify(`Vitals recorded for ${targetPatient.id}.`, "success");
  };

  const handleDisposition = (
    action: "discharge" | "admit" | "transfer",
    form: DischargeForm,
  ) => {
    if (!selectedPatientId) {
      notify("Select a patient before disposition.", "warning");
      return;
    }

    if (action === "discharge" && (!form.diagnosis.trim() || !form.instructions.trim())) {
      notify("Add diagnosis and discharge instructions before discharging.", "warning");
      return;
    }

    const targetPatient = patients.find(p => p.id === selectedPatientId);
    if (!targetPatient) return;

    const patientId = targetPatient.id;
    const patientMrn = targetPatient.mrn;

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
    handleAddOrder,
    handleOrderStatusChange,
    handleSaveVitals,
    handleDisposition,
  };
};
