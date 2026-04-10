/**
 * Infection Control - Shared data source for infection cases
 * Maps MRN to infection cases for Patient Profile & InfectionControlPage
 */

export type IsolationType = "Contact" | "Droplet" | "Airborne" | "Standard";
export type IcStatus = "Detected" | "Isolating" | "Notified" | "In Audit" | "Closed";
export type CaseStatus = "Active" | "Monitoring" | "Closed" | "Archived";
export type IpdStatus = "Watch" | "Critical" | "Stable";

export interface InfectionCase {
  id: string;
  patientName: string;
  mrn: string;
  organism: string;
  unit: string;
  bed: string;
  isolationType: IsolationType;
  ipdStatus: IpdStatus;
  icStatus: IcStatus;
  status: CaseStatus;
  risk: "High" | "Moderate" | "Low";
  lastUpdate: string;
  flaggedOn?: string;
  flaggedBy?: string;
  notes?: string;
}

export const INFECTION_CONTROL_CASES: InfectionCase[] = [
  {
    id: "ic-1",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    organism: "MRSA",
    unit: "Ward 3A",
    bed: "B-12",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "High",
    lastUpdate: "30 min ago",
    flaggedOn: "2026-02-02",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA detected in wound culture. Contact isolation initiated.",
  },
  {
    id: "ic-2",
    patientName: "Sneha Patil",
    mrn: "MRN-245991",
    organism: "C. diff",
    unit: "Ward 1B",
    bed: "A-04",
    isolationType: "Contact",
    ipdStatus: "Critical",
    icStatus: "Detected",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "1 hr ago",
    flaggedOn: "2026-03-05",
    flaggedBy: "Dr. Sameer Kulkarni",
    notes: "C. diff detected in stool. Contact precautions. Hand hygiene critical.",
  },
  {
    id: "ic-3",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
    organism: "MRSA",
    unit: "Ward 3A",
    bed: "B-08",
    isolationType: "Airborne",
    ipdStatus: "Stable",
    icStatus: "Notified",
    status: "Active",
    risk: "High",
    lastUpdate: "2 hrs ago",
    flaggedOn: "2026-02-01",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA in sputum. Airborne precautions. N95 required.",
  },
  {
    id: "ic-4",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
    organism: "VRE",
    unit: "ICU",
    bed: "ICU-03",
    isolationType: "Droplet",
    ipdStatus: "Watch",
    icStatus: "In Audit",
    status: "Monitoring",
    risk: "Moderate",
    lastUpdate: "3 hrs ago",
    flaggedOn: "2026-02-28",
    flaggedBy: "Dr. Rohan Mehta",
    notes: "VRE in urine culture. Droplet precautions. Audit ongoing.",
  },
  {
    id: "ic-5",
    patientName: "Ravi Iyer",
    mrn: "MRN-245802",
    organism: "COVID-19",
    unit: "Isolation Ward",
    bed: "C-05",
    isolationType: "Airborne",
    ipdStatus: "Stable",
    icStatus: "Closed",
    status: "Closed",
    risk: "Low",
    lastUpdate: "Yesterday",
    flaggedOn: "2026-02-10",
    flaggedBy: "Dr. Rohan Mehta",
    notes: "COVID-19 cleared. Case closed.",
  },
  {
    id: "ic-6",
    patientName: "Ananya Desai",
    mrn: "MRN-245803",
    organism: "K. pneumoniae",
    unit: "Ward 2B",
    bed: "B-22",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "10 min ago",
    flaggedOn: "2026-02-04",
    flaggedBy: "Dr. Nisha Rao",
    notes: "K. pneumoniae ESBL in blood culture. Contact isolation.",
  },
  {
    id: "ic-7",
    patientName: "Vikram Sethi",
    mrn: "MRN-245804",
    organism: "MRSA",
    unit: "Ward 3B",
    bed: "D-15",
    isolationType: "Contact",
    ipdStatus: "Critical",
    icStatus: "Detected",
    status: "Active",
    risk: "High",
    lastUpdate: "15 min ago",
    flaggedOn: "2026-02-03",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA in nasal swab. Contact isolation initiated.",
  },
  {
    id: "ic-8",
    patientName: "Priya Rajan",
    mrn: "MRN-245805",
    organism: "E. coli (ESBL)",
    unit: "Ward 1A",
    bed: "A-12",
    isolationType: "Standard",
    ipdStatus: "Stable",
    icStatus: "Notified",
    status: "Active",
    risk: "Low",
    lastUpdate: "45 min ago",
    flaggedOn: "2026-02-15",
    flaggedBy: "Dr. Nisha Rao",
    notes: "ESBL E. coli in UTI. Standard precautions. Notified.",
  },
  {
    id: "ic-9",
    patientName: "Arjun Kapoor",
    mrn: "MRN-245806",
    organism: "VRE",
    unit: "Ward 4C",
    bed: "C-02",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "1 hr ago",
    flaggedOn: "2026-02-20",
    flaggedBy: "Dr. Nisha Rao",
    notes: "VRE in wound. Contact isolation.",
  },
  {
    id: "ic-10",
    patientName: "Sanya Gupta",
    mrn: "MRN-245807",
    organism: "A. baumannii",
    unit: "ICU",
    bed: "ICU-05",
    isolationType: "Contact",
    ipdStatus: "Critical",
    icStatus: "Detected",
    status: "Active",
    risk: "High",
    lastUpdate: "2 hrs ago",
    flaggedOn: "2026-03-01",
    flaggedBy: "Dr. Nisha Rao",
    notes: "A. baumannii in tracheal aspirate. Contact isolation. MDR.",
  },
  {
    id: "ic-11",
    patientName: "Karan Malhotra",
    mrn: "MRN-245808",
    organism: "C. diff",
    unit: "Ward 2A",
    bed: "A-20",
    isolationType: "Contact",
    ipdStatus: "Stable",
    icStatus: "In Audit",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "3 hrs ago",
    flaggedOn: "2026-02-25",
    flaggedBy: "Dr. Nisha Rao",
    notes: "C. diff recurrence. Contact precautions. Audit ongoing.",
  },
  {
    id: "ic-12",
    patientName: "Ishani Bose",
    mrn: "MRN-245809",
    organism: "MRSA",
    unit: "Ward 3C",
    bed: "E-10",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Notified",
    status: "Active",
    risk: "High",
    lastUpdate: "4 hrs ago",
    flaggedOn: "2026-02-18",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA in skin lesion. Contact isolation.",
  },
  {
    id: "ic-13",
    patientName: "Aditya Verma",
    mrn: "MRN-245810",
    organism: "P. aeruginosa",
    unit: "Ward 1B",
    bed: "B-05",
    isolationType: "Standard",
    ipdStatus: "Stable",
    icStatus: "Closed",
    status: "Active",
    risk: "Low",
    lastUpdate: "5 hrs ago",
    flaggedOn: "2026-02-12",
    flaggedBy: "Dr. Nisha Rao",
    notes: "P. aeruginosa in wound. Cleared. Monitoring.",
  },
  {
    id: "ic-14",
    patientName: "Fatima Khan",
    mrn: "MRN-245811",
    organism: "VRE",
    unit: "Ward 2C",
    bed: "C-12",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "6 hrs ago",
    flaggedOn: "2026-03-08",
    flaggedBy: "Dr. Sana Khan",
    notes: "VRE in urine. Contact isolation.",
  },
  {
    id: "ic-15",
    patientName: "Zoya Khan",
    mrn: "MRN-245812",
    organism: "MRSA",
    unit: "Ward 3B",
    bed: "D-02",
    isolationType: "Contact",
    ipdStatus: "Critical",
    icStatus: "Detected",
    status: "Active",
    risk: "High",
    lastUpdate: "7 hrs ago",
    flaggedOn: "2026-03-06",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA in blood culture. Contact isolation.",
  },
  {
    id: "ic-16",
    patientName: "Deepak Rawat",
    mrn: "MRN-245813",
    organism: "C. diff",
    unit: "Ward 1A",
    bed: "A-15",
    isolationType: "Contact",
    ipdStatus: "Stable",
    icStatus: "Notified",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "8 hrs ago",
    flaggedOn: "2026-02-22",
    flaggedBy: "Dr. Nisha Rao",
    notes: "C. diff in stool. Contact precautions.",
  },
  {
    id: "ic-17",
    patientName: "Ritu Singhania",
    mrn: "MRN-245814",
    organism: "K. pneumoniae",
    unit: "Ward 4B",
    bed: "B-10",
    isolationType: "Standard",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "9 hrs ago",
    flaggedOn: "2026-02-28",
    flaggedBy: "Dr. Nisha Rao",
    notes: "K. pneumoniae in sputum. Contact isolation.",
  },
  {
    id: "ic-18",
    patientName: "Varun Dhawan",
    mrn: "MRN-245815",
    organism: "VRE",
    unit: "Ward 2A",
    bed: "A-05",
    isolationType: "Contact",
    ipdStatus: "Critical",
    icStatus: "Detected",
    status: "Active",
    risk: "High",
    lastUpdate: "10 hrs ago",
    flaggedOn: "2026-03-02",
    flaggedBy: "Dr. Nisha Rao",
    notes: "VRE in wound. Contact isolation.",
  },
  {
    id: "ic-19",
    patientName: "Kiara Advani",
    mrn: "MRN-245816",
    organism: "MRSA",
    unit: "Ward 3C",
    bed: "E-05",
    isolationType: "Contact",
    ipdStatus: "Stable",
    icStatus: "In Audit",
    status: "Active",
    risk: "Low",
    lastUpdate: "11 hrs ago",
    flaggedOn: "2026-02-20",
    flaggedBy: "Dr. Nisha Rao",
    notes: "MRSA nasal. In audit. May clear soon.",
  },
  {
    id: "ic-20",
    patientName: "Siddharth Roy",
    mrn: "MRN-245817",
    organism: "A. baumannii",
    unit: "ICU",
    bed: "ICU-08",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Detected",
    status: "Active",
    risk: "High",
    lastUpdate: "12 hrs ago",
    flaggedOn: "2026-02-04",
    flaggedBy: "Dr. Nisha Rao",
    notes: "A. baumannii in tracheal aspirate. MDR. Contact isolation.",
  },
  {
    id: "ic-21",
    patientName: "Arvind Sharma",
    mrn: "MRN-245994",
    organism: "MRSA",
    unit: "Ward 3A",
    bed: "B-18",
    isolationType: "Contact",
    ipdStatus: "Stable",
    icStatus: "Notified",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "20 min ago",
    flaggedOn: "2026-02-01",
    flaggedBy: "Dr. K. Anand",
    notes: "MRSA in surgical site. Contact isolation.",
  },
  {
    id: "ic-22",
    patientName: "Neha Sinha",
    mrn: "MRN-245998",
    organism: "C. diff",
    unit: "Ward 2B",
    bed: "B-07",
    isolationType: "Contact",
    ipdStatus: "Watch",
    icStatus: "Isolating",
    status: "Active",
    risk: "Moderate",
    lastUpdate: "25 min ago",
    flaggedOn: "2026-03-04",
    flaggedBy: "Dr. Vidya Iyer",
    notes: "C. diff post-antibiotics. Contact precautions.",
  },
];

/** Get infection cases by MRN */
export function getInfectionCasesByMrn(mrn: string): InfectionCase[] {
  const normalized = mrn?.toUpperCase?.() ?? "";
  return INFECTION_CONTROL_CASES.filter(
    (c) => c.mrn.toUpperCase() === normalized
  );
}

/** Get active infection cases by MRN */
export function getActiveInfectionCasesByMrn(mrn: string): InfectionCase[] {
  return getInfectionCasesByMrn(mrn).filter((c) => c.status === "Active");
}

/** Get the highest priority active infection case by MRN */
export function getActiveInfectionCaseByMrn(
  mrn: string,
): InfectionCase | undefined {
  const riskRank: Record<InfectionCase["risk"], number> = {
    High: 3,
    Moderate: 2,
    Low: 1,
  };

  return getActiveInfectionCasesByMrn(mrn).sort(
    (left, right) => riskRank[right.risk] - riskRank[left.risk],
  )[0];
}

/** Check if patient has any infection cases */
export function hasInfectionCases(mrn: string): boolean {
  return getInfectionCasesByMrn(mrn).length > 0;
}

/** Check if patient has any active infection cases */
export function hasActiveInfectionCase(mrn: string): boolean {
  return getActiveInfectionCasesByMrn(mrn).length > 0;
}

export const INFECTION_CONTROL_SUMMARY = {
  activeCaseCount: INFECTION_CONTROL_CASES.filter((c) => c.status === "Active")
    .length,
  isolationOccupancy: INFECTION_CONTROL_CASES.filter(
    (c) => c.status === "Active" && c.icStatus === "Isolating",
  ).length,
  auditOpenCount: INFECTION_CONTROL_CASES.filter(
    (c) => c.status === "Active" && c.icStatus === "In Audit",
  ).length,
};
