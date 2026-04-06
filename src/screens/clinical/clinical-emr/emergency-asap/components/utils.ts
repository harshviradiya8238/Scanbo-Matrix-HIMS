import { EmergencyPatient, EmergencyBed, TriageLevel, DischargeForm } from '../types';
import { TRIAGE_META, DEFAULT_DISCHARGE_FORM } from './constants';

export function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPatientInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function buildPatientId() {
  return `ER-${Math.floor(5200 + Math.random() * 6000)}`;
}

export function buildMrn() {
  return `MRN-${Math.floor(250000 + Math.random() * 650000)}`;
}

export function buildDischargeDraft(
  patient: EmergencyPatient | undefined,
): DischargeForm {
  if (!patient) {
    return DEFAULT_DISCHARGE_FORM;
  }

  return {
    diagnosis: patient.chiefComplaint,
    condition:
      patient.triageLevel === "Critical" || patient.triageLevel === "Emergency"
        ? "Improved after emergency stabilization"
        : "Stable for discharge",
    instructions:
      patient.triageLevel === "Critical" || patient.triageLevel === "Emergency"
        ? "Return immediately for chest pain, breathing difficulty, syncope, or worsening symptoms."
        : "Continue oral fluids, observe symptoms, and return for worsening complaints.",
    followUp: "Review in OPD / specialty clinic within 48-72 hours.",
    medications: "Continue discharge medications as prescribed in ED orders.",
    destination: "Home",
  };
}

export function triageRank(level: TriageLevel) {
  return TRIAGE_META[level].rank;
}

export function bedStatusForPatient(level: TriageLevel): "Critical" | "Occupied" {
  return level === "Critical" ? "Critical" : "Occupied";
}

export function applyPatientAcuityToBeds(
  nextPatients: EmergencyPatient[],
  nextBeds: EmergencyBed[],
): EmergencyBed[] {
  return nextBeds.map((bed) => {
    if (!bed.patientId) {
      if (bed.status === "Cleaning") return bed;
      return { ...bed, status: "Free" };
    }

    const patient = nextPatients.find((entry) => entry.id === bed.patientId);
    if (!patient) {
      return { ...bed, patientId: null, status: "Free" };
    }

    return { ...bed, status: bedStatusForPatient(patient.triageLevel) };
  });
}