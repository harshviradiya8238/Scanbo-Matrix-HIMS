import { PatientRow } from "@/src/mocks/patientServer";
import { maskMobileNumber } from "@/src/core/utils/phone";

export const maskPhoneNumber = (phone: string) => {
  return maskMobileNumber(phone);
};

export const statusColors: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  Active: "success",
  Admitted: "info",
  "Billing Hold": "warning",
  Inactive: "default",
  Discharged: "default",
};

export const tagOptions = [
  "VIP",
  "High Risk",
  "Diabetic",
  "Hypertension",
  "Pregnancy",
  "Allergy",
];

export interface PatientListFilters {
  status: string;
  gender: string;
  department: string;
  doctor: string;
  ageRange: number[];
  regDateFrom: string;
  regDateTo: string;
  lastVisitFrom: string;
  lastVisitTo: string;
  tags: string[];
}
