import * as React from "react";
import {
  MonitorHeart as MonitorHeartIcon,
  History as HistoryIcon,
  WarningAmber as WarningAmberIcon,
  Biotech as BiotechIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { MedicationCatalogItem, OrderCatalogItem } from "../../opd-mock-data";
import { OpdTabItem } from "../../common/components/OpdTabs";
import { AdmissionPriority } from "@/src/screens/ipd/ipd-mock-data";

export interface OpdVisitPageProps {
  encounterId?: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface VitalsDraft {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  ecg: string;
  weightKg: string;
  bmi: string;
}

export interface HistoryDraft {
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

export interface HistoryTemplate {
  id: string;
  name: string;
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

export interface SymptomDraft {
  symptom: string;
  duration: string;
  severity: string;
}

export interface DiagnosisCatalogItem {
  id: string;
  name: string;
  icd10: string;
}

export interface DiagnosisLine {
  id: string;
  diagnosisId: string;
  diagnosisName: string;
  icd10: string;
  type: "Primary" | "Secondary" | "Provisional" | "Differential";
  status: "Active" | "Resolved" | "Ruled Out";
  notes: string;
}

export interface NoteDraftLine {
  title: string;
  content: string;
  author: string;
}

export interface NotesTabDraft {
  progressNotes: string;
  patientInstructions: string;
  followupRequired: string;
  followupNotes: string;
}

export interface DraftOrderLine {
  id: string;
  catalogId: string;
  priority: "Routine" | "Urgent";
  instructions: string;
}

export interface PrescriptionLine {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: "Oral" | "IV" | "IM" | "Topical";
  instructions: string;
}

export interface AllergyListRow {
  id: string;
  allergyName: string;
  index: number;
}

export interface VisitTransferDraft {
  priority: AdmissionPriority;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  requestNote: string;
}

export type VisitTab =
  | "vitals"
  | "history"
  | "allergies"
  | "diagnosis"
  | "orders"
  | "prescriptions"
  | "notes";

export const VISIT_TABS: OpdTabItem[] = [
  { id: "vitals", label: "Vitals", icon: <MonitorHeartIcon /> },
  { id: "history", label: "History", icon: <HistoryIcon /> },
  { id: "allergies", label: "Allergies", icon: <WarningAmberIcon /> },
  { id: "diagnosis", label: "Diagnosis", icon: <BiotechIcon /> },
  { id: "orders", label: "Orders", icon: <ScienceIcon /> },
  { id: "prescriptions", label: "Prescription", icon: <MedicationIcon /> },
  { id: "notes", label: "Additional Notes", icon: <DescriptionIcon /> },
];

export const HISTORY_TEMPLATES: HistoryTemplate[] = [
  {
    id: "h-tpl-1",
    name: "Chest Pain Review",
    chiefComplaint:
      "Chest discomfort and shortness of breath for the past 2 days",
    hpi: "Intermittent retrosternal discomfort on exertion with mild breathlessness. No syncope or active palpitations.",
    duration: "1-3 days",
    severity: "Moderate",
  },
  {
    id: "h-tpl-2",
    name: "Diabetes Follow-up",
    chiefComplaint: "High blood sugar with fatigue",
    hpi: "Home glucose readings above target for one week with daytime fatigue and reduced appetite. No vomiting or abdominal pain.",
    duration: "4-7 days",
    severity: "Moderate",
  },
  {
    id: "h-tpl-3",
    name: "Acute Respiratory",
    chiefComplaint: "Fever and cough with breathlessness",
    hpi: "Fever with productive cough and exertional breathlessness. Symptoms worsening since onset.",
    duration: "1-3 days",
    severity: "Severe",
  },
];

export const DIAGNOSIS_CATALOG: DiagnosisCatalogItem[] = [
  { id: "dx-1", name: "Type 2 Diabetes Mellitus", icd10: "E11.9" },
  { id: "dx-2", name: "Hypertension", icd10: "I10" },
  { id: "dx-3", name: "Coronary artery disease", icd10: "I25.10" },
  { id: "dx-4", name: "Migraine", icd10: "G43.909" },
  { id: "dx-5", name: "Recurrent pharyngitis", icd10: "J02.9" },
  { id: "dx-6", name: "Acute sinusitis", icd10: "J01.90" },
];

export const DIAGNOSIS_TYPE_OPTIONS: DiagnosisLine["type"][] = [
  "Primary",
  "Secondary",
  "Provisional",
  "Differential",
];
export const DIAGNOSIS_STATUS_OPTIONS: DiagnosisLine["status"][] = [
  "Active",
  "Resolved",
  "Ruled Out",
];
export const FOLLOWUP_OPTIONS = [
  "1 week",
  "2 weeks",
  "1 month",
  "3 months",
  "6 months",
  "As needed",
] as const;
export const RX_SHIELD_INTERACTION_RULES: Array<{
  id: string;
  pair: [string, string];
  message: string;
}> = [
  {
    id: "rx-rule-paracetamol-atorvastatin",
    pair: ["paracetamol", "atorvastatin"],
    message:
      "Configured Rx Shield interaction matched. Please review this combination before prescribing.",
  },
];

export const formatElapsed = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const getPatientAge = (ageGender: string): string =>
  ageGender.split("/")[0]?.trim() ?? ageGender;
export const getPatientGender = (ageGender: string): string =>
  ageGender.split("/")[1]?.trim() ?? "--";
export const toDisplayStatusLabel = (status: string): string =>
  status
    .split(/[\s_]+/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(" ");
export const sanitizeAllergies = (allergies: string[]): string[] =>
  Array.from(
    new Set(
      allergies
        .map((item) => item.trim())
        .filter((item) => item && item.toLowerCase() !== "no known allergies"),
    ),
  );
export const normalizeMedicationKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const pickTranscriptField = (
  lines: string[],
  keys: string[],
): string => {
  const keySet = keys.map((key) => key.toLowerCase());
  for (const line of lines) {
    const normalized = line.toLowerCase();
    const key = keySet.find((candidate) =>
      normalized.startsWith(`${candidate}:`),
    );
    if (!key) continue;
    const separatorIndex = line.indexOf(":");
    return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : "";
  }
  return "";
};

export const resolveFollowupFromTranscript = (text: string): string => {
  const normalized = text.toLowerCase();
  if (normalized.includes("1 week")) return "1 week";
  if (normalized.includes("2 week")) return "2 weeks";
  if (normalized.includes("1 month")) return "1 month";
  if (normalized.includes("3 month")) return "3 months";
  if (normalized.includes("6 month")) return "6 months";
  if (normalized.includes("as needed") || normalized.includes("prn"))
    return "As needed";
  return "";
};

export const parseAmbientConsultationTranscript = (transcript: string) => {
  const clean = transcript.replace(/\r/g, "").trim();
  const lines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const chiefComplaint =
    pickTranscriptField(lines, ["chief complaint", "complaint", "cc"]) ||
    lines[0] ||
    "";
  const hpi = pickTranscriptField(lines, ["hpi", "history"]) || clean;
  const assessment = pickTranscriptField(lines, ["assessment", "impression"]);
  const plan = pickTranscriptField(lines, ["plan", "treatment plan"]);
  const patientInstructions = pickTranscriptField(lines, [
    "instructions",
    "advice",
    "counseling",
  ]);
  const followupRequired =
    pickTranscriptField(lines, ["follow-up", "followup", "next visit"]) ||
    resolveFollowupFromTranscript(clean);
  const followupNotes = pickTranscriptField(lines, [
    "follow-up notes",
    "followup notes",
  ]);
  const diagnosisNames = DIAGNOSIS_CATALOG.filter((item) =>
    clean.toLowerCase().includes(item.name.toLowerCase()),
  ).map((item) => item.name);

  return {
    chiefComplaint,
    hpi,
    assessment,
    plan,
    patientInstructions,
    followupRequired,
    followupNotes,
    diagnosisNames,
    additionalNotes: clean,
  };
};

export const extractMedicationIngredients = (value: string): string[] => {
  const normalized = normalizeMedicationKey(value);
  if (!normalized) return [];
  const [base] = normalized.split(/ \d/);
  return base
    .split("+")
    .map((segment) => segment.trim())
    .filter(Boolean);
};

export const analyzeRxShieldComparisons = (
  medicationNames: string[],
): string[] => {
  const findings = new Set<string>();

  for (let leftIndex = 0; leftIndex < medicationNames.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < medicationNames.length;
      rightIndex += 1
    ) {
      const leftMedication = medicationNames[leftIndex];
      const rightMedication = medicationNames[rightIndex];
      const leftIngredients = extractMedicationIngredients(leftMedication);
      const rightIngredients = extractMedicationIngredients(rightMedication);
      const duplicateIngredient = leftIngredients.find((ingredient) =>
        rightIngredients.includes(ingredient),
      );

      if (duplicateIngredient) {
        findings.add(
          `Duplicate ingredient "${duplicateIngredient}" found in ${leftMedication} and ${rightMedication}.`,
        );
      }

      const leftKey = normalizeMedicationKey(leftMedication);
      const rightKey = normalizeMedicationKey(rightMedication);
      for (const rule of RX_SHIELD_INTERACTION_RULES) {
        const [first, second] = rule.pair;
        const firstMatched =
          leftKey.includes(first) || rightKey.includes(first);
        const secondMatched =
          leftKey.includes(second) || rightKey.includes(second);
        if (firstMatched && secondMatched) {
          findings.add(
            `${leftMedication} + ${rightMedication}: ${rule.message}`,
          );
        }
      }
    }
  }

  return Array.from(findings);
};

export const isVisitTab = (value: string | null): value is VisitTab =>
  !!value && VISIT_TABS.some((tab) => tab.id === value);

export const buildDefaultOrderLine = (
  catalog: OrderCatalogItem[],
): DraftOrderLine => {
  const first = catalog[0];
  return {
    id: `line-${Date.now()}`,
    catalogId: first?.id ?? "",
    priority: first?.defaultPriority ?? "Routine",
    instructions: "",
  };
};

export const buildDefaultPrescriptionLine = (
  catalog: MedicationCatalogItem[],
): PrescriptionLine => {
  const first = catalog[0];
  return {
    id: `rx-${Date.now()}`,
    medicationId: first?.id ?? "",
    dose: first?.strength ?? "",
    frequency: first?.commonFrequency ?? "OD",
    durationDays: "5",
    route: "Oral",
    instructions: "",
  };
};

export const buildDiagnosisLineFromCatalog = (
  item?: DiagnosisCatalogItem,
): DiagnosisLine => ({
  id: `dx-line-${Date.now()}`,
  diagnosisId: item?.id ?? "",
  diagnosisName: item?.name ?? "",
  icd10: item?.icd10 ?? "",
  type: "Primary",
  status: "Active",
  notes: "",
});

export const mapProblemToDiagnosisLine = (
  problem: string,
  index: number,
): DiagnosisLine => {
  const fromCatalog = DIAGNOSIS_CATALOG.find(
    (item) => item.name.toLowerCase() === problem.toLowerCase(),
  );

  return {
    id: `dx-existing-${index}-${problem.toLowerCase().replace(/\s+/g, "-")}`,
    diagnosisId: fromCatalog?.id ?? "",
    diagnosisName: problem,
    icd10: fromCatalog?.icd10 ?? "",
    type: index === 0 ? "Primary" : "Secondary",
    status: "Active",
    notes: "",
  };
};
