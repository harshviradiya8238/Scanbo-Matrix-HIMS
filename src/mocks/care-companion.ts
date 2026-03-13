/**
 * Care Companion - Shared data source for enrolled patients
 * Maps MRN (from GLOBAL_PATIENTS) to Care Companion enrollment data
 * Used by: CareCompanionPage, PatientProfilePage
 */

export type CareCompanionStatus = "stable" | "high_risk" | "watch" | "closed";

export interface CareCompanionEnrolled {
  mrn: string;
  id: string;
  name: string;
  program: string;
  status: CareCompanionStatus;
  bp?: string;
  glucose?: string;
  bpAlert?: boolean;
  glucoseAlert?: boolean;
  adherence: number;
  lastCheckIn: string;
  language: string;
  platforms: string[];
  enrolledDate?: string;
  condition?: string;
  note?: string;
  /** Vital trend for today */
  vitalTrend?: { time: string; bp: string; hr: string; spo2: string; temp: string }[];
  /** Recent check-in activity */
  recentCheckIns?: { date: string; bp: string; glucose: string; note?: string }[];
  /** Care goals */
  careGoals?: { goal: string; done: boolean }[];
  /** Nursing / care notes */
  careNotes?: { time: string; date: string; nurse: string; note: string; type: string }[];
}

const VITAL_TREND_DEFAULT = [
  { time: "06:00", bp: "118/76", hr: "82", spo2: "98%", temp: "36.8°C" },
  { time: "12:00", bp: "122/80", hr: "86", spo2: "97%", temp: "37.0°C" },
  { time: "18:00", bp: "120/78", hr: "84", spo2: "98%", temp: "36.9°C" },
];

const CARE_GOALS_DEFAULT = [
  { goal: "Oral Hygiene — twice daily", done: true },
  { goal: "Mobilization — 10 min walk", done: true },
  { goal: "Wound dressing check", done: true },
  { goal: "Physiotherapy session", done: false },
  { goal: "Dietitian consult", done: false },
];

const CARE_NOTES_DEFAULT = [
  {
    time: "08:30",
    date: "2026-03-12",
    nurse: "RN Priya Sharma",
    note: "Patient resting comfortably. Oral medications administered. No complaints.",
    type: "Routine",
  },
  {
    time: "14:00",
    date: "2026-03-12",
    nurse: "RN Anjali Patel",
    note: "Assisted with mobilization. Wound dressing changed. Site appears clean.",
    type: "Wound Care",
  },
  {
    time: "20:00",
    date: "2026-03-11",
    nurse: "RN Priya Sharma",
    note: "Evening vitals stable. Patient had full dinner. Good oral intake.",
    type: "Routine",
  },
];

/** Enrolled patients keyed by MRN - matches GLOBAL_PATIENTS */
export const CARE_COMPANION_ENROLLED: CareCompanionEnrolled[] = [
  {
    mrn: "MRN-245781",
    id: "CC-1",
    name: "Aarav Nair",
    program: "Diabetes",
    status: "stable",
    bp: "118/76",
    glucose: "108",
    adherence: 72,
    lastCheckIn: "2h ago",
    language: "Hindi",
    platforms: ["Google Fit"],
    enrolledDate: "Jan 15, 2026",
    condition: "Type 2 Diabetes",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 8:42 AM", bp: "118/76", glucose: "108" },
      { date: "Yesterday", bp: "122/78", glucose: "112" },
      { date: "Mar 8", bp: "120/76", glucose: "105" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245802",
    id: "CC-2",
    name: "Ravi Iyer",
    program: "Hypertension",
    status: "watch",
    bp: "142/88",
    glucose: "115",
    bpAlert: true,
    adherence: 71,
    lastCheckIn: "4h ago",
    language: "English",
    platforms: ["Fitbit"],
    enrolledDate: "Feb 2, 2026",
    condition: "Hypertension Stage 2",
    vitalTrend: [
      { time: "06:00", bp: "142/88", hr: "82", spo2: "98%", temp: "36.8°C" },
      { time: "12:00", bp: "138/86", hr: "84", spo2: "97%", temp: "37.0°C" },
      { time: "18:00", bp: "140/87", hr: "83", spo2: "98%", temp: "36.9°C" },
    ],
    recentCheckIns: [
      { date: "Today 8:42 AM", bp: "142/88", glucose: "115", note: "Chest discomfort reported" },
      { date: "Yesterday", bp: "138/86", glucose: "110" },
      { date: "Mar 8", bp: "140/85", glucose: "108" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245990",
    id: "CC-3",
    name: "Rahul Menon",
    program: "Post-Cardiac",
    status: "high_risk",
    bp: "158/94",
    glucose: "108",
    bpAlert: true,
    adherence: 48,
    lastCheckIn: "2h ago",
    language: "Tamil",
    platforms: ["Apple Health"],
    enrolledDate: "Jan 12, 2026",
    condition: "Post-MI (Heart Attack)",
    note: "Patient allergic to Penicillin. Low activity. Needs daily BP check.",
    vitalTrend: [
      { time: "06:00", bp: "158/94", hr: "92", spo2: "96%", temp: "36.9°C" },
      { time: "12:00", bp: "155/92", hr: "90", spo2: "97%", temp: "37.0°C" },
      { time: "18:00", bp: "152/90", hr: "88", spo2: "97%", temp: "36.8°C" },
    ],
    recentCheckIns: [
      { date: "Today 8:42 AM", bp: "158/94", glucose: "108", note: "Chest discomfort reported" },
      { date: "Yesterday", bp: "155/92", glucose: "110" },
      { date: "Mar 8", bp: "152/90", glucose: "105" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245994",
    id: "CC-4",
    name: "Arvind Sharma",
    program: "Post-Cardiac",
    status: "stable",
    bp: "118/76",
    glucose: "92",
    adherence: 96,
    lastCheckIn: "3h ago",
    language: "Hindi",
    platforms: ["Apple Health"],
    enrolledDate: "Jan 20, 2026",
    condition: "Post-MI",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 8:00 AM", bp: "118/76", glucose: "92" },
      { date: "Yesterday", bp: "120/78", glucose: "95" },
      { date: "Mar 8", bp: "122/80", glucose: "98" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245998",
    id: "CC-5",
    name: "Neha Sinha",
    program: "Diabetes",
    status: "watch",
    bp: "124/80",
    glucose: "145",
    glucoseAlert: true,
    adherence: 67,
    lastCheckIn: "1h ago",
    language: "Hindi",
    platforms: ["Google Fit"],
    enrolledDate: "Feb 5, 2026",
    condition: "Type 2 Diabetes",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 9:00 AM", bp: "124/80", glucose: "145" },
      { date: "Yesterday", bp: "122/78", glucose: "138" },
      { date: "Mar 8", bp: "126/82", glucose: "152" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245799",
    id: "CC-6",
    name: "Meera Joshi",
    program: "Hypertension",
    status: "stable",
    bp: "122/78",
    glucose: "95",
    adherence: 89,
    lastCheckIn: "5h ago",
    language: "English",
    platforms: ["Apple Health"],
    enrolledDate: "Jan 28, 2026",
    condition: "Hypertension Stage 1",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 7:30 AM", bp: "122/78", glucose: "95" },
      { date: "Yesterday", bp: "124/80", glucose: "98" },
      { date: "Mar 8", bp: "120/76", glucose: "92" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245811",
    id: "CC-7",
    name: "Fatima Khan",
    program: "Post-Ortho",
    status: "stable",
    bp: "118/74",
    glucose: "102",
    adherence: 94,
    lastCheckIn: "Just now",
    language: "Hindi",
    platforms: ["Google Fit", "Fitbit"],
    enrolledDate: "Feb 10, 2026",
    condition: "Post Knee Replacement",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 10:15 AM", bp: "118/74", glucose: "102" },
      { date: "Yesterday", bp: "120/76", glucose: "105" },
      { date: "Mar 8", bp: "119/75", glucose: "100" },
    ],
    careGoals: [
      { goal: "Physiotherapy — 15 min daily", done: true },
      { goal: "Knee exercises — 3x/day", done: true },
      { goal: "Pain assessment", done: true },
      { goal: "Follow-up X-ray", done: false },
    ],
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245991",
    id: "CC-8",
    name: "Sneha Patil",
    program: "Post-Ortho",
    status: "watch",
    bp: "126/82",
    glucose: "98",
    adherence: 62,
    lastCheckIn: "3h ago",
    language: "Marathi",
    platforms: ["Samsung Health"],
    enrolledDate: "Mar 3, 2026",
    condition: "Post-op Recovery",
    note: "Wound dressing required. Monitor for infection signs.",
    vitalTrend: [
      { time: "06:00", bp: "126/82", hr: "78", spo2: "98%", temp: "36.8°C" },
      { time: "12:00", bp: "128/84", hr: "80", spo2: "97%", temp: "37.0°C" },
      { time: "18:00", bp: "124/80", hr: "76", spo2: "98%", temp: "36.9°C" },
    ],
    recentCheckIns: [
      { date: "Today 8:00 AM", bp: "126/82", glucose: "98" },
      { date: "Yesterday", bp: "130/85", glucose: "102", note: "Mild pain reported" },
      { date: "Mar 8", bp: "128/84", glucose: "100" },
    ],
    careGoals: [
      { goal: "Wound care — daily", done: true },
      { goal: "Mobilization — 5 min walk", done: true },
      { goal: "Pain assessment", done: true },
      { goal: "Stitch removal", done: false },
    ],
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-246002",
    id: "CC-9",
    name: "Pooja Menon",
    program: "Diabetes",
    status: "stable",
    bp: "116/74",
    glucose: "112",
    adherence: 82,
    lastCheckIn: "6h ago",
    language: "Malayalam",
    platforms: ["Apple Health"],
    enrolledDate: "Feb 15, 2026",
    condition: "Type 2 Diabetes",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Today 6:45 AM", bp: "116/74", glucose: "112" },
      { date: "Yesterday", bp: "118/76", glucose: "118" },
      { date: "Mar 8", bp: "120/78", glucose: "115" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
  {
    mrn: "MRN-245804",
    id: "CC-10",
    name: "Vikram Sethi",
    program: "Post-Cardiac",
    status: "closed",
    bp: "120/78",
    glucose: "105",
    adherence: 79,
    lastCheckIn: "2d ago",
    language: "Hindi",
    platforms: [],
    enrolledDate: "Dec 1, 2025",
    condition: "Post-MI — Completed",
    vitalTrend: VITAL_TREND_DEFAULT,
    recentCheckIns: [
      { date: "Mar 8", bp: "120/78", glucose: "105" },
      { date: "Mar 8", bp: "122/80", glucose: "108" },
      { date: "Mar 7", bp: "118/76", glucose: "102" },
    ],
    careGoals: CARE_GOALS_DEFAULT,
    careNotes: CARE_NOTES_DEFAULT,
  },
];

/** Get Care Companion enrollment by MRN */
export function getCareCompanionByMrn(mrn: string): CareCompanionEnrolled | null {
  const normalized = mrn?.toUpperCase?.() ?? "";
  return CARE_COMPANION_ENROLLED.find((p) => p.mrn.toUpperCase() === normalized) ?? null;
}

/** Check if patient is enrolled in Care Companion */
export function isCareCompanionEnrolled(mrn: string): boolean {
  return getCareCompanionByMrn(mrn) != null;
}
