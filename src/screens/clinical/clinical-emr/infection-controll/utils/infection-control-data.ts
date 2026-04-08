import {
  AvailableIsolationRoom,
  AuditChecklistItem,
  AuditRecord,
  AuditRecordRow,
  CaseDetailEvent,
  CaseTimelineEvent,
  CaseTimelineItem,
  ClosureCriterion,
  ComplianceScoreItem,
  DetectionSource,
  IsolationRoom,
  LabFeedItem,
  NotificationFeedItem,
  PpeChecklistItem,
  ReadyToClosePatient,
  RoomMapItem,
  SendToItem,
  NotificationType,
  ActionItem,
  AlertItem,
  RoomMapStatus,
} from "./infection-control-types";
import {
  INFECTION_CONTROL_CASES,
  type InfectionCase,
} from "@/src/mocks/infection-control";

export const INITIAL_CASES: InfectionCase[] = INFECTION_CONTROL_CASES;

export const INITIAL_ISOLATIONS: IsolationRoom[] = [
  {
    id: "iso-1",
    room: "B-12",
    unit: "Ward 3A",
    type: "Contact",
    status: "Active",
    startedAt: "09:30 AM",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
  },
  {
    id: "iso-2",
    room: "ICU-03",
    unit: "ICU",
    type: "Airborne",
    status: "Review",
    startedAt: "08:10 AM",
    patientName: "Meera Joshi",
    mrn: "MRN-245799",
  },
  {
    id: "iso-3",
    room: "C-05",
    unit: "Ward 1B",
    type: "Droplet",
    status: "Active",
    startedAt: "10:00 AM",
    patientName: "Aarav Nair",
    mrn: "MRN-245781",
  },
  {
    id: "iso-4",
    room: "-",
    unit: "Ward 1B",
    type: "Droplet",
    status: "Pending",
    startedAt: "Pending",
    patientName: "Neha Sinha",
    mrn: "MRN-245993",
  },
];

export const PPE_CHECKLIST: PpeChecklistItem[] = [
  {
    id: "ppe-1",
    label: "Gloves — non-sterile examination gloves",
    checked: true,
    role: "Nurse Staff",
  },
  {
    id: "ppe-2",
    label: "Gown — disposable isolation gown",
    checked: true,
    role: "Ward Staff",
  },
  {
    id: "ppe-3",
    label: "N95 / FFP2 Respirator (airborne cases)",
    checked: false,
    role: "Nurse Staff",
  },
  {
    id: "ppe-4",
    label: "Isolation sign posted at room door",
    checked: true,
    role: "Housekeeping",
  },
  {
    id: "ppe-5",
    label: "Dedicated equipment assigned (BP, steth)",
    checked: false,
    role: "Ward Staff",
  },
  {
    id: "ppe-6",
    label: "Hand sanitizer station at room entrance",
    checked: true,
    role: "Housekeeping",
  },
];

export const PPE_CHECKLIST_BY_MRN: Record<string, PpeChecklistItem[]> = {
  "MRN-245990": [
    {
      id: "ppe-1",
      label: "Gloves — contact precautions for MRSA wound culture",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-2",
      label: "Gown — disposable isolation gown before room entry",
      checked: true,
      role: "Ward Staff",
    },
    {
      id: "ppe-3",
      label: "Dedicated wound dressing trolley assigned",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-4",
      label: "Contact isolation sign posted at B-12",
      checked: true,
      role: "Housekeeping",
    },
    {
      id: "ppe-5",
      label: "Dedicated BP cuff and stethoscope at bedside",
      checked: false,
      role: "Ward Staff",
    },
    {
      id: "ppe-6",
      label: "Alcohol hand rub station stocked at entrance",
      checked: true,
      role: "Housekeeping",
    },
  ],
  "MRN-245799": [
    {
      id: "ppe-1",
      label: "Gloves — VRE contact handling for ICU care",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-2",
      label: "Gown — ICU disposable isolation gown",
      checked: true,
      role: "Ward Staff",
    },
    {
      id: "ppe-3",
      label: "Surgical mask and eye protection for splash risk",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-4",
      label: "Droplet/contact sign posted at ICU-03",
      checked: true,
      role: "Housekeeping",
    },
    {
      id: "ppe-5",
      label: "Dedicated urine collection equipment assigned",
      checked: false,
      role: "Ward Staff",
    },
    {
      id: "ppe-6",
      label: "ICU terminal cleaning checklist started",
      checked: false,
      role: "Housekeeping",
    },
  ],
  "MRN-245781": [
    {
      id: "ppe-1",
      label: "Gloves — respiratory specimen handling",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-2",
      label: "Gown — disposable isolation gown",
      checked: true,
      role: "Ward Staff",
    },
    {
      id: "ppe-3",
      label: "N95 / FFP2 respirator for airborne precautions",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-4",
      label: "Airborne isolation sign posted at B-08",
      checked: true,
      role: "Housekeeping",
    },
    {
      id: "ppe-5",
      label: "Portable HEPA / negative-pressure review completed",
      checked: false,
      role: "Maintenance",
    },
    {
      id: "ppe-6",
      label: "Fit-check reminder briefed to visiting staff",
      checked: false,
      role: "Infection Control",
    },
  ],
};

export const PPE_CHECKLIST_BY_ISOLATION_TYPE: Record<string, PpeChecklistItem[]> = {
  Contact: PPE_CHECKLIST,
  Droplet: [
    {
      id: "ppe-1",
      label: "Gloves — patient contact and specimen handling",
      checked: true,
      role: "Nurse Staff",
    },
    {
      id: "ppe-2",
      label: "Surgical mask before entering patient zone",
      checked: true,
      role: "All Staff",
    },
    {
      id: "ppe-3",
      label: "Eye protection / face shield for splash risk",
      checked: false,
      role: "Nurse Staff",
    },
    {
      id: "ppe-4",
      label: "Droplet precautions sign posted at room door",
      checked: true,
      role: "Housekeeping",
    },
    {
      id: "ppe-5",
      label: "Dedicated patient equipment assigned",
      checked: false,
      role: "Ward Staff",
    },
    {
      id: "ppe-6",
      label: "Hand sanitizer station at room entrance",
      checked: true,
      role: "Housekeeping",
    },
  ],
  Airborne: [
    {
      id: "ppe-1",
      label: "N95 / FFP2 respirator available before entry",
      checked: true,
      role: "All Staff",
    },
    {
      id: "ppe-2",
      label: "Fit-check completed for assigned care team",
      checked: false,
      role: "Nurse Staff",
    },
    {
      id: "ppe-3",
      label: "Gown and gloves for direct patient care",
      checked: true,
      role: "Ward Staff",
    },
    {
      id: "ppe-4",
      label: "Airborne isolation sign posted at room door",
      checked: true,
      role: "Housekeeping",
    },
    {
      id: "ppe-5",
      label: "Negative-pressure / ventilation check requested",
      checked: false,
      role: "Maintenance",
    },
    {
      id: "ppe-6",
      label: "Dedicated equipment assigned at bedside",
      checked: false,
      role: "Ward Staff",
    },
  ],
  Standard: PPE_CHECKLIST,
};

export const getPpeChecklistForPatient = (
  mrn?: string,
  isolationType?: string,
) =>
  (mrn ? PPE_CHECKLIST_BY_MRN[mrn] : undefined) ??
  (isolationType ? PPE_CHECKLIST_BY_ISOLATION_TYPE[isolationType] : undefined) ??
  PPE_CHECKLIST;

export const ROOM_MAP_ITEMS: RoomMapItem[] = [
  { id: "rm-1", label: "B MRSA CONTACT", status: "occupied" },
  { id: "rm-2", label: "ICU VRE AIRBORNE", status: "occupied" },
  { id: "rm-3", label: "C.DIFF CONTACT+", status: "occupied" },
  { id: "rm-4", label: "A FREE CONTACT", status: "free" },
  { id: "rm-5", label: "A FREE DROPLET", status: "free" },
  { id: "rm-6", label: "C FREE STANDARD", status: "free" },
  { id: "rm-7", label: "CLEAN TERMINAL", status: "cleaning" },
  { id: "rm-8", label: "ICU-05 MAINT", status: "maintenance" },
];

export const AVAILABLE_ISOLATION_ROOMS: AvailableIsolationRoom[] = [
  {
    id: "air-1",
    room: "A-06",
    unit: "Ward 1B",
    type: "Contact",
    status: "Available",
  },
  {
    id: "air-2",
    room: "A-04",
    unit: "Ward 1B",
    type: "Droplet",
    status: "Available",
  },
  {
    id: "air-3",
    room: "A-08",
    unit: "Ward 3A",
    type: "Contact",
    status: "Available",
  },
  {
    id: "air-4",
    room: "B-02",
    unit: "ICU",
    type: "Airborne",
    status: "Available",
  },
  {
    id: "air-5",
    room: "C-01",
    unit: "Ward 1B",
    type: "Standard",
    status: "Available",
  },
];

export const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: "au-1",
    ward: "Ward 3A",
    compliance: 92,
    lead: "Nurse Priya",
    lastAudit: "Today, 9:00 AM",
  },
  {
    id: "au-2",
    ward: "ICU",
    compliance: 88,
    lead: "Dr. Alia",
    lastAudit: "Yesterday, 4:30 PM",
  },
  {
    id: "au-3",
    ward: "Ward 1B",
    compliance: 95,
    lead: "Nurse Kavya",
    lastAudit: "Today, 8:15 AM",
  },
];

export const LAB_FEED_ITEMS: LabFeedItem[] = [
  {
    id: "lf-1",
    title: "MRSA - Blood culture",
    patient: "Rahul Menon",
    bed: "B-12",
    status: "pending",
  },
  {
    id: "lf-2",
    title: "C.diff toxin +ve - Stool",
    patient: "Sneha Patil",
    bed: "A-04",
    status: "auto-flagged",
  },
  {
    id: "lf-3",
    title: "Screen clear - CBC",
    patient: "MRN-245992",
    status: "no-pathogen",
  },
  {
    id: "lf-4",
    title: "4 cultures pending",
    patient: "ETA approx. 4 hours",
    status: "pending-cultures",
  },
];

export const DETECTION_SOURCES: DetectionSource[] = [
  { id: "ds-1", label: "Lab Auto-Flag", count: 11, color: "primary.main" },
  { id: "ds-2", label: "Physician Report", count: 6, color: "warning.main" },
  { id: "ds-3", label: "Nursing Flag", count: 5, color: "success.main" },
];

export const NOTIFICATION_FEED: NotificationFeedItem[] = [
  {
    id: "nf-1",
    type: "critical",
    title: "CRITICAL — Arvind Sharma (ICU-03)",
    body: "VRE culture positive. Airborne Isolation required Immediately. HOD notified.",
    actionLabel: "View",
    timestamp: "08:10 AM",
  },
  {
    id: "nf-2",
    type: "exposure",
    title: "Exposure Alert — Ward 3A staff",
    body: "2 nursing staff may have been exposed to MRSA (B-12). Screening recommended.",
    actionLabel: "Acknowledge",
    timestamp: "09:45 AM",
  },
  {
    id: "nf-3",
    type: "acknowledged",
    title: "Acknowledged — Sneha Patil (A-04)",
    body: "C.diff case acknowledged by Dr. Verma. Contact precautions in place.",
    timestamp: "10:30 AM",
  },
  {
    id: "nf-4",
    type: "lab-ready",
    title: "Lab Result Ready — MRN-245990",
    body: "MRSA sensitivity report posted. Review required before treatment update.",
    actionLabel: "Review",
    timestamp: "Yesterday",
  },
];

export const SEND_TO_OPTIONS: SendToItem[] = [
  { id: "st-1", label: "In-App Notification", checked: true },
  { id: "st-2", label: "SMS Alert", checked: true },
  { id: "st-3", label: "Email", checked: true },
  { id: "st-4", label: "HMIS Broadcast", checked: false },
  { id: "st-5", label: "Regulatory (RNTCP/IDSP)", checked: false },
];

export const AUDIT_RECORDS: AuditRecordRow[] = [
  {
    id: "ar-1",
    auditId: "AUD-031",
    casePatient: "Rahul Menon",
    caseDetail: "B-12 - Ward 3A",
    type: "Hand Hygiene",
    score: 82,
    status: "in_progress",
  },
  {
    id: "ar-2",
    auditId: "AUD-030",
    casePatient: "Arvind Sharma",
    caseDetail: "ICU-03",
    type: "PPE Compliance",
    score: 61,
    status: "in_progress",
  },
  {
    id: "ar-3",
    auditId: "AUD-029",
    casePatient: "Sneha Patil",
    caseDetail: "A-04",
    type: "Env. Cleaning",
    score: 94,
    status: "completed",
  },
];

export const AUDIT_CHECKLIST: AuditChecklistItem[] = [
  {
    id: "ac-1",
    label: "WHO 5 Moments for Hand Hygiene observed",
    checked: true,
  },
  {
    id: "ac-2",
    label: "Alcohol hand rub at point-of-care",
    checked: true,
  },
  {
    id: "ac-3",
    label: "Staff training records current",
    checked: true,
  },
  {
    id: "ac-4",
    label: "Soap & water available at sink",
    checked: false,
    badge: "A Missing",
  },
  {
    id: "ac-5",
    label: "Glove use does not replace hand hygiene",
    checked: false,
  },
  {
    id: "ac-6",
    label: "Staff performing HH before patient contact",
    checked: true,
    badge: "✓ 4/5",
  },
];

export const COMPLIANCE_SCORES: ComplianceScoreItem[] = [
  { id: "cs-1", label: "Hand Hygiene", score: 82, color: "success.main" },
  { id: "cs-2", label: "PPE Compliance", score: 61, color: "error.main" },
  { id: "cs-3", label: "Env. Cleaning", score: 94, color: "success.main" },
  { id: "cs-4", label: "Bundle Care", score: 74, color: "warning.main" },
  { id: "cs-5", label: "Isolation Prot.", score: 88, color: "primary.main" },
];

export const READY_TO_CLOSE: ReadyToClosePatient[] = [
  {
    id: "rtc-1",
    mrn: "MRN-245991",
    patientName: "Sneha Patil",
    patientDetail: "F/28 A-04",
    pathogen: "C.diff",
    days: "10d",
    auditScore: 94,
    criteria: "resolved",
  },
];

export const CLOSURE_CRITERIA: ClosureCriterion[] = [
  { id: "cc-1", label: "3 consecutive negative cultures confirmed", met: true },
  {
    id: "cc-2",
    label: "Isolation maintained ≥72h post last positive",
    met: true,
  },
  { id: "cc-3", label: "Terminal cleaning completed & documented", met: true },
  { id: "cc-4", label: "All exposed contacts screened", met: true },
  { id: "cc-5", label: "Final audit score ≥85%", met: false },
];

export const CASE_TIMELINE_EVENTS: CaseTimelineEvent[] = [
  {
    id: "ct-1",
    title: "C.diff Detected",
    date: "01 Jun · 09:00 AM",
    source: "Lab Auto-Flag",
    description: "Stool toxin positive. Physician notified. IPD bed A-04.",
    iconColor: "info.main",
  },
  {
    id: "ct-2",
    title: "Contact Isolation",
    date: "01 Jun · 10:30 AM",
    source: "Nurse Staff",
    description: "Room C-05 assigned. Contact sign posted. PPE deployed.",
    iconColor: "error.main",
  },
  {
    id: "ct-3",
    title: "Stakeholders Notified",
    date: "01 Jun · 11:00 AM",
    source: "IPC Officer",
    description: "HOD, Nursing, Lab notified via HMIS. 1 contact screened.",
    iconColor: "warning.main",
  },
  {
    id: "ct-4",
    title: "Audit Completed — 94%",
    date: "05 Jun",
    source: "Dr. Malhotra",
    description: "Env. cleaning compliant. No gaps found.",
    iconColor: "info.main",
  },
  {
    id: "ct-5",
    title: "Ready for Closure",
    date: "11 Jun · Awaiting sign-off",
    source: "",
    description: "3 negative cultures confirmed. All criteria met.",
    iconColor: "success.main",
  },
];

export const CASE_DETAIL_EVENTS: Record<string, CaseDetailEvent[]> = {
  "ic-1": [
    {
      id: "cd-1",
      title: "MRSA Detected",
      date: "09 Jun · 08:30 AM",
      source: "LIS Auto-Flag",
      description:
        "Blood culture positive. Vancomycin susceptible. Physician Dr. Verma notified immediately.",
      icon: "detect",
    },
    {
      id: "cd-2",
      title: "Contact Isolation — B-12",
      date: "09 Jun · 09:30 AM",
      source: "Nurse Staff",
      description:
        "Isolation in place. Contact sign posted. Dedicated BP cuff and stethoscope assigned.",
      icon: "isolate",
    },
    {
      id: "cd-3",
      title: "HOD, IPC, Nursing Notified",
      date: "09 Jun · 09:45 AM",
      source: "IPC Officer",
      description:
        "All stakeholders notified via HMIS + SMS. 2 nearby patients screened.",
      icon: "notify",
    },
    {
      id: "cd-4",
      title: "Hand Hygiene Audit — 82%",
      date: "11 Jun",
      source: "Dr. Malhotra",
      description:
        "Audit in progress. Gap found: soap dispenser empty. Corrective action triggered.",
      icon: "audit",
    },
  ],
  "ic-2": [
    {
      id: "cd-5",
      title: "C.diff Detected",
      date: "08 Jun · 07:45 AM",
      source: "Lab Auto-Flag",
      description:
        "Stool toxin positive. Physician notified. Contact precautions initiated.",
      icon: "detect",
    },
    {
      id: "cd-6",
      title: "Contact Isolation — A-04",
      date: "08 Jun · 10:00 AM",
      source: "Nurse Staff",
      description: "Room assigned. Dedicated equipment in place.",
      icon: "isolate",
    },
    {
      id: "cd-7",
      title: "Stakeholders Notified",
      date: "08 Jun · 11:30 AM",
      source: "IPC Officer",
      description: "HOD and nursing notified via HMIS.",
      icon: "notify",
    },
  ],
  "ic-3": [
    {
      id: "cd-8",
      title: "MRSA Detected",
      date: "07 Jun · 09:00 AM",
      source: "LIS Auto-Flag",
      description: "Blood culture positive. Isolation initiated.",
      icon: "detect",
    },
    {
      id: "cd-9",
      title: "Airborne Isolation — B-08",
      date: "07 Jun · 02:00 PM",
      source: "Nurse Staff",
      description: "N95 required. Negative pressure room assigned.",
      icon: "isolate",
    },
    {
      id: "cd-10",
      title: "COVID-19 retest negative",
      date: "08 Jun · 02:10 PM",
      source: "Lab",
      description: "Isolation cleared. Standard precautions resumed.",
      icon: "audit",
    },
  ],
  "ic-4": [
    {
      id: "cd-11",
      title: "VRE Detected",
      date: "06 Jun · 08:00 AM",
      source: "Lab Auto-Flag",
      description: "Urine culture positive. Droplet precautions.",
      icon: "detect",
    },
    {
      id: "cd-12",
      title: "Droplet Isolation — ICU-03",
      date: "06 Jun · 10:30 AM",
      source: "ICU Staff",
      description: "Surgical mask required. Dedicated equipment assigned.",
      icon: "isolate",
    },
  ],
  "ic-5": [
    {
      id: "cd-13",
      title: "COVID-19 Detected",
      date: "01 Jun · 09:00 AM",
      source: "PCR",
      description: "Positive PCR. Airborne isolation initiated.",
      icon: "detect",
    },
    {
      id: "cd-14",
      title: "Case Closed",
      date: "05 Jun · 04:00 PM",
      source: "Dr. Anand",
      description: "3 negative tests. All criteria met. Isolation cleared.",
      icon: "audit",
    },
  ],
};

export const CASE_EXTRA: Record<
  string,
  { admissionDate: string; diagnosis: string; genderAge: string }
> = {
  "ic-1": {
    admissionDate: "08 Jun 2024",
    diagnosis: "Community Acquired Pneumonia",
    genderAge: "M/34",
  },
  "ic-2": {
    admissionDate: "07 Jun 2024",
    diagnosis: "C.diff Colitis",
    genderAge: "F/28",
  },
  "ic-3": {
    admissionDate: "05 Jun 2024",
    diagnosis: "MRSA Bacteremia",
    genderAge: "M/45",
  },
  "ic-4": {
    admissionDate: "06 Jun 2024",
    diagnosis: "VRE UTI",
    genderAge: "F/52",
  },
  "ic-5": {
    admissionDate: "01 Jun 2024",
    diagnosis: "COVID-19 Pneumonia",
    genderAge: "M/38",
  },
};

export const IPD_PATIENTS = [
  {
    id: "ipd-1",
    mrn: "MRN-245990",
    name: "Rahul Menon",
    wardBed: "Ward 3A / B-12",
  },
  {
    id: "ipd-2",
    mrn: "MRN-245991",
    name: "Sneha Patil",
    wardBed: "Ward 1B / A-04",
  },
  {
    id: "ipd-3",
    mrn: "MRN-245781",
    name: "Aarav Nair",
    wardBed: "Ward 3A / B-08",
  },
  {
    id: "ipd-4",
    mrn: "MRN-245799",
    name: "Meera Joshi",
    wardBed: "ICU / ICU-03",
  },
  {
    id: "ipd-5",
    mrn: "MRN-245802",
    name: "Ravi Iyer",
    wardBed: "Isolation Ward / C-05",
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "al-1",
    title: "Cluster detected in Ward 3A",
    details: "Two patients screened positive for MRSA within 24 hours.",
    severity: "High",
    acknowledged: false,
  },
  {
    id: "al-2",
    title: "Isolation review pending",
    details: "Airborne isolation in ICU-03 requires consultant review.",
    severity: "Medium",
    acknowledged: false,
  },
  {
    id: "al-3",
    title: "Hand hygiene dip",
    details: "Compliance dropped to 84% in Ward 1B.",
    severity: "Low",
    acknowledged: true,
  },
];

export const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: "ac-1",
    label: "Escalate cluster review for Ward 3A",
    owner: "Dr. Nisha Rao",
    due: "Today 2:00 PM",
    status: "In Progress",
    priority: "Urgent",
  },
  {
    id: "ac-2",
    label: "Send isolation checklist to Ward 1B",
    owner: "Nurse Priya",
    due: "Today 4:00 PM",
    status: "Open",
    priority: "Routine",
  },
  {
    id: "ac-3",
    label: "Close resolved COVID-19 case",
    owner: "Dr. Anand",
    due: "Tomorrow 9:00 AM",
    status: "Open",
    priority: "Routine",
  },
];

export const CASE_TIMELINES: Record<string, CaseTimelineItem[]> = {
  "ic-1": [
    {
      id: "tl-1",
      label: "MRSA positive culture",
      time: "Today, 08:20 AM",
      status: "Done",
    },
    {
      id: "tl-2",
      label: "Isolation initiated",
      time: "Today, 09:30 AM",
      status: "Done",
    },
    {
      id: "tl-3",
      label: "Contact tracing scheduled",
      time: "Today, 12:00 PM",
      status: "Pending",
    },
  ],
  "ic-2": [
    {
      id: "tl-4",
      label: "C. diff confirmation",
      time: "Today, 07:45 AM",
      status: "Done",
    },
    {
      id: "tl-5",
      label: "Environmental cleaning audit",
      time: "Today, 03:30 PM",
      status: "Pending",
    },
  ],
  "ic-3": [
    {
      id: "tl-6",
      label: "COVID-19 retest negative",
      time: "Yesterday, 02:10 PM",
      status: "Done",
    },
    {
      id: "tl-7",
      label: "Isolation cleared",
      time: "Yesterday, 04:00 PM",
      status: "Done",
    },
  ],
};
