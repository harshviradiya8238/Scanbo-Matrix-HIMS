import { triageRank, normalizePhone } from "./utils";
import type {
  EmergencyPatient,
  EmergencyBed,
  TriageLevel,
  PatientStatus,
  ArrivalMode,
  ObservationEntry,
  EmergencyOrder,
} from "../types";

export const calculateDashboardMetrics = (
  patients: EmergencyPatient[],
  beds: EmergencyBed[]
) => {
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(
    (patient) => patient.triageLevel === "Critical"
  ).length;
  const waitingPatients = patients.filter(
    (patient) => patient.status === "Waiting"
  ).length;
  const availableBeds = beds.filter((bed) => bed.status === "Free").length;
  const occupiedOrCritical = beds.filter(
    (bed) => bed.status === "Occupied" || bed.status === "Critical"
  ).length;
  const bedOccupancyPercent =
    beds.length > 0
      ? Math.round((occupiedOrCritical / beds.length) * 100)
      : 0;
  const avgWaitMinutes =
    patients.length > 0
      ? Math.round(
          patients.reduce((acc, patient) => acc + patient.waitingMinutes, 0) /
            patients.length
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
};

export const calculateBedOccupancy = (beds: EmergencyBed[]) => ({
  free: beds.filter((bed) => bed.status === "Free").length,
  occupied: beds.filter((bed) => bed.status === "Occupied").length,
  cleaning: beds.filter((bed) => bed.status === "Cleaning").length,
  critical: beds.filter((bed) => bed.status === "Critical").length,
});

export const getSortedQueueRows = (
  patients: EmergencyPatient[],
  queueSearch: string,
  queueFilter: "ALL" | TriageLevel,
  queueStatusFilter: "ALL" | PatientStatus,
  queueArrivalFilter: "ALL" | ArrivalMode,
  queueDoctorFilter: "ALL" | string
) => {
  const query = queueSearch.trim().toLowerCase();

  return [...patients]
    .filter((patient) => {
      if (queueFilter !== "ALL" && patient.triageLevel !== queueFilter) return false;
      if (queueStatusFilter !== "ALL" && patient.status !== queueStatusFilter) return false;
      if (queueArrivalFilter !== "ALL" && patient.arrivalMode !== queueArrivalFilter) return false;
      if (queueDoctorFilter !== "ALL" && patient.assignedDoctor !== queueDoctorFilter) return false;
      if (!query) return true;
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const acuityRank = triageRank(a.triageLevel) - triageRank(b.triageLevel);
      if (acuityRank !== 0) return acuityRank;
      return b.waitingMinutes - a.waitingMinutes;
    });
};

export const getCaseTrackingRows = (
  patients: EmergencyPatient[],
  caseTrackingSearch: string,
  caseTrackingFilter: string
) => {
  const query = caseTrackingSearch.trim().toLowerCase();

  return [...patients]
    .filter((patient) => {
      if (caseTrackingFilter === "Critical" && patient.triageLevel !== "Critical") return false;
      if (caseTrackingFilter === "In Treatment" && !["In Treatment", "Observation"].includes(patient.status)) return false;
      if (caseTrackingFilter === "Ready" && patient.status !== "Ready for Disposition") return false;
      if (!query) return true;
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const acuityRank = triageRank(a.triageLevel) - triageRank(b.triageLevel);
      if (acuityRank !== 0) return acuityRank;
      return b.waitingMinutes - a.waitingMinutes;
    });
};

export const getAssignBedZones = (beds: EmergencyBed[]) => {
  const preferredOrder = ["Resus", "ER Bay", "Observation"];
  const grouped = beds.reduce<Record<string, EmergencyBed[]>>((acc, bed) => {
    if (!acc[bed.zone]) acc[bed.zone] = [];
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
};

export const getRegistrationMatches = (patients: EmergencyPatient[], registrationSearch: string) => {
  const query = registrationSearch.trim().toLowerCase();
  if (!query) return [];

  return patients.filter((patient) => {
    const byMrn = patient.mrn.toLowerCase().includes(query);
    const byPhone = normalizePhone(patient.phone).includes(normalizePhone(query));
    return byMrn || byPhone;
  });
};

export const getSelectedPatientData = (
  selectedPatientId: string | undefined, 
  patients: EmergencyPatient[],
  orders: EmergencyOrder[],
  observationLog: ObservationEntry[]
) => {
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;
  const selectedPatientOrders = selectedPatient ? orders.filter((o) => o.patientId === selectedPatient.id) : [];
  const selectedPatientObservations = selectedPatient ? observationLog
    .filter((entry) => entry.patientId === selectedPatient.id)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)) : [];
    
  return { selectedPatient, selectedPatientOrders, selectedPatientObservations };
};
