import { CARE_COMPANION_ENROLLED, type CareCompanionEnrolled } from "@/src/mocks/care-companion";
import type { EnrolledPatient, PatientStatus, StatusFilterOption } from "./types";
import type { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "all", label: "All Status" },
  { value: "high_risk", label: "High Risk" },
  { value: "watch", label: "Watch" },
  { value: "stable", label: "Stable" },
  { value: "closed", label: "Closed" },
];

export const PROGRAM_OPTIONS = [
  "All Programs",
  "Diabetes",
  "Post-Cardiac",
  "Hypertension",
  "Post-Ortho",
];

/** Map CARE_COMPANION_ENROLLED to EnrolledPatient for table */
export function mapToEnrolledPatient(p: CareCompanionEnrolled): EnrolledPatient {
  const initials = p.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id: p.id,
    patientId: p.mrn,
    mrn: p.mrn,
    name: p.name,
    program: p.program,
    status: p.status,
    bp: p.bp,
    glucose: p.glucose,
    bpAlert: p.bpAlert,
    glucoseAlert: p.glucoseAlert,
    adherence: p.adherence,
    lastCheckIn: p.lastCheckIn,
    language: p.language,
    platforms: p.platforms ?? [],
    initials,
    avatarColor: "#1172BA",
    isUrgent: p.status === "high_risk",
  };
}

export const MOCK_PATIENTS: EnrolledPatient[] =
  CARE_COMPANION_ENROLLED.map(mapToEnrolledPatient);

export function getStatusConfig(status: PatientStatus, theme: Theme) {
  switch (status) {
    case "high_risk":
      return {
        label: "High Risk",
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.08),
        border: alpha(theme.palette.error.main, 0.3),
      };
    case "watch":
      return {
        label: "Watch",
        color: theme.palette.warning.dark,
        bg: alpha(theme.palette.warning.main, 0.1),
        border: alpha(theme.palette.warning.main, 0.35),
      };
    case "stable":
      return {
        label: "Stable",
        color: theme.palette.success.dark,
        bg: alpha(theme.palette.success.main, 0.08),
        border: alpha(theme.palette.success.main, 0.35),
      };
    case "closed":
      return {
        label: "Closed",
        color: theme.palette.text.secondary,
        bg: alpha(theme.palette.text.secondary, 0.06),
        border: alpha(theme.palette.text.secondary, 0.2),
      };
    default:
      return {
        label: status,
        color: theme.palette.text.secondary,
        bg: "transparent",
        border: "transparent",
      };
  }
}

export function getAdherenceColor(adherence: number, theme: Theme) {
  if (adherence >= 70) return theme.palette.success.main;
  if (adherence >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
}