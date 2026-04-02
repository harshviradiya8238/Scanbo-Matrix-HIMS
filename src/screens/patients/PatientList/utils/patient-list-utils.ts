import { PatientRow } from "@/src/mocks/patientServer";

export const maskPhoneNumber = (phone: string) => {
  const input = (phone || "").trim();
  if (!input) return "—";

  const allDigits = input.match(/\d/g) || [];
  const totalDigits = allDigits.length;
  if (totalDigits <= 4) return input;

  // Keep country code visible when number starts with a + prefix (e.g. +91).
  const countryMatch = input.match(/^\+(\d{1,3})/);
  const keepPrefixDigits = countryMatch ? countryMatch[1].length : 0;
  const localVisibleStart = totalDigits - 4 + 1;

  let seen = 0;
  return input.replace(/\d/g, (digit) => {
    seen += 1;
    if (seen <= keepPrefixDigits) return digit;
    return seen >= localVisibleStart ? digit : "X";
  });
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
