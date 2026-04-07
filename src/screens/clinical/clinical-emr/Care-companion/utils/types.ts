export type PatientStatus = "stable" | "high_risk" | "watch" | "closed";

export interface EnrolledPatient {
  id: string;
  patientId: string;
  mrn?: string;
  name: string;
  program: string;
  status: PatientStatus;
  bp?: string;
  glucose?: string;
  bpAlert?: boolean;
  glucoseAlert?: boolean;
  adherence: number;
  lastCheckIn: string;
  language: string;
  platforms: string[];
  initials: string;
  avatarColor: string;
  isUrgent?: boolean;
}

export interface StatusFilterOption {
  value: PatientStatus | "all";
  label: string;
}