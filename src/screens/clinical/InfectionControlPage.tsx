"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { SelectChangeEvent } from "@mui/material";
import {
  Card,
  CommonDialog,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { formatPatientLabel } from "@/src/core/patients/patientDisplay";
import { useUser } from "@/src/core/auth/UserContext";
import { usePermission } from "@/src/core/auth/usePermission";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import {
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Biotech as BiotechIcon,
  Block as BlockIcon,
  Bolt as BoltIcon,
  BugReport as BugReportIcon,
  CalendarMonth as CalendarMonthIcon,
  Campaign as CampaignIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  History as HistoryIcon,
  Hotel as HotelIcon,
  LocalHospital as LocalHospitalIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  PushPin as PushPinIcon,
  ReportProblem as ReportProblemIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Send as SendIcon,
  ShowChart as ShowChartIcon,
  WarningAmber as WarningAmberIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { IconButton, Menu, TablePagination, Tooltip } from "@mui/material";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import {
  INFECTION_CONTROL_CASES,
  type InfectionCase,
} from "@/src/mocks/infection-control";

type CaseStatus = "Active" | "Monitoring" | "Closed";
type IcStatus = "Detected" | "Isolating" | "Notified" | "In Audit" | "Closed";
type IpdStatus = "Watch" | "Critical" | "Stable";
type IsolationType = "Contact" | "Droplet" | "Airborne";
type IsolationStatus = "Active" | "Review" | "Cleared" | "Pending";
type AlertSeverity = "High" | "Medium" | "Low";
type ActionStatus = "Open" | "In Progress" | "Done";

interface IsolationRoom {
  id: string;
  room: string;
  unit: string;
  type: "Contact" | "Droplet" | "Airborne";
  status: IsolationStatus;
  startedAt: string;
  patientName?: string;
  mrn?: string;
}

interface AuditRecord {
  id: string;
  ward: string;
  compliance: number;
  lead: string;
  lastAudit: string;
}

interface AlertItem {
  id: string;
  title: string;
  details: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

interface ActionItem {
  id: string;
  label: string;
  owner: string;
  due: string;
  status: ActionStatus;
  priority: "Urgent" | "Routine";
}

interface CaseTimelineItem {
  id: string;
  label: string;
  time: string;
  status: "Done" | "Pending";
}

interface UnitRiskItem {
  id: string;
  unit: string;
  risk: "High" | "Moderate" | "Low";
  activeCases: number;
  trend: "Up" | "Flat" | "Down";
}

interface LabTriggerItem {
  id: string;
  test: string;
  patient: string;
  organism: string;
  collected: string;
  status: "New" | "Reviewed";
}

const FLOW_TAB_IDS = ["detect", "isolate", "notify", "audit", "close"] as const;
const IC_STATUS_BY_TAB: Record<(typeof FLOW_TAB_IDS)[number], IcStatus> = {
  detect: "Detected",
  isolate: "Isolating",
  notify: "Notified",
  audit: "In Audit",
  close: "Closed",
};

const INITIAL_CASES: InfectionCase[] = INFECTION_CONTROL_CASES;

const INITIAL_ISOLATIONS: IsolationRoom[] = [
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

interface PpeChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  role: string;
}

const PPE_CHECKLIST: PpeChecklistItem[] = [
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

type RoomMapStatus = "occupied" | "free" | "cleaning" | "maintenance";

interface RoomMapItem {
  id: string;
  label: string;
  status: RoomMapStatus;
}

const ROOM_MAP_ITEMS: RoomMapItem[] = [
  { id: "rm-1", label: "B MRSA CONTACT", status: "occupied" },
  { id: "rm-2", label: "ICU VRE AIRBORNE", status: "occupied" },
  { id: "rm-3", label: "C.DIFF CONTACT+", status: "occupied" },
  { id: "rm-4", label: "A FREE CONTACT", status: "free" },
  { id: "rm-5", label: "A FREE DROPLET", status: "free" },
  { id: "rm-6", label: "C FREE STANDARD", status: "free" },
  { id: "rm-7", label: "CLEAN TERMINAL", status: "cleaning" },
  { id: "rm-8", label: "ICU-05 MAINT", status: "maintenance" },
];

interface AvailableIsolationRoom {
  id: string;
  room: string;
  unit: string;
  type: "Contact" | "Droplet" | "Airborne" | "Standard";
  status: string;
}

const AVAILABLE_ISOLATION_ROOMS: AvailableIsolationRoom[] = [
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

const INITIAL_AUDITS: AuditRecord[] = [
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

interface LabFeedItem {
  id: string;
  title: string;
  patient: string;
  bed?: string;
  status: "pending" | "auto-flagged" | "no-pathogen" | "pending-cultures";
}

const LAB_FEED_ITEMS: LabFeedItem[] = [
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

interface DetectionSource {
  id: string;
  label: string;
  count: number;
  color: string;
}

const DETECTION_SOURCES: DetectionSource[] = [
  { id: "ds-1", label: "Lab Auto-Flag", count: 11, color: "primary.main" },
  { id: "ds-2", label: "Physician Report", count: 6, color: "warning.main" },
  { id: "ds-3", label: "Nursing Flag", count: 5, color: "success.main" },
];

type NotificationType = "critical" | "exposure" | "acknowledged" | "lab-ready";

interface NotificationFeedItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionLabel?: string;
  timestamp: string;
}

const NOTIFICATION_FEED: NotificationFeedItem[] = [
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

interface SendToItem {
  id: string;
  label: string;
  checked: boolean;
}

const SEND_TO_OPTIONS: SendToItem[] = [
  { id: "st-1", label: "In-App Notification", checked: true },
  { id: "st-2", label: "SMS Alert", checked: true },
  { id: "st-3", label: "Email", checked: true },
  { id: "st-4", label: "HMIS Broadcast", checked: false },
  { id: "st-5", label: "Regulatory (RNTCP/IDSP)", checked: false },
];

interface AuditRecordRow {
  id: string;
  auditId: string;
  casePatient: string;
  caseDetail: string;
  type: string;
  score: number;
  status: "in_progress" | "completed";
}

const AUDIT_RECORDS: AuditRecordRow[] = [
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

interface AuditChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  badge?: string;
}

const AUDIT_CHECKLIST: AuditChecklistItem[] = [
  {
    id: "ac-1",
    label: "WHO 5 Moments for Hand Hygiene observed",
    checked: true,
  },
  { id: "ac-2", label: "Alcohol hand rub at point-of-care", checked: true },
  { id: "ac-3", label: "Staff training records current", checked: true },
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

interface ComplianceScoreItem {
  id: string;
  label: string;
  score: number;
  color: string;
}

const COMPLIANCE_SCORES: ComplianceScoreItem[] = [
  { id: "cs-1", label: "Hand Hygiene", score: 82, color: "success.main" },
  { id: "cs-2", label: "PPE Compliance", score: 61, color: "error.main" },
  { id: "cs-3", label: "Env. Cleaning", score: 94, color: "success.main" },
  { id: "cs-4", label: "Bundle Care", score: 74, color: "warning.main" },
  { id: "cs-5", label: "Isolation Prot.", score: 88, color: "primary.main" },
];

interface ReadyToClosePatient {
  id: string;
  mrn: string;
  patientName: string;
  patientDetail: string;
  pathogen: string;
  days: string;
  auditScore: number;
  criteria: "resolved";
}

const READY_TO_CLOSE: ReadyToClosePatient[] = [
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

interface ClosureCriterion {
  id: string;
  label: string;
  met: boolean;
}

const CLOSURE_CRITERIA: ClosureCriterion[] = [
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

interface CaseTimelineEvent {
  id: string;
  title: string;
  date: string;
  source: string;
  description: string;
  iconColor: string;
}

interface CaseDetailEvent {
  id: string;
  title: string;
  date: string;
  source: string;
  description: string;
  icon: "detect" | "isolate" | "notify" | "audit";
}

const CASE_TIMELINE_EVENTS: CaseTimelineEvent[] = [
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

const CASE_DETAIL_EVENTS: Record<string, CaseDetailEvent[]> = {
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

const CASE_EXTRA: Record<
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

const IPD_PATIENTS = [
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

const INITIAL_ALERTS: AlertItem[] = [
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

const INITIAL_ACTIONS: ActionItem[] = [
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

const CASE_TIMELINES: Record<string, CaseTimelineItem[]> = {
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

const UNIT_RISK_OVERVIEW: UnitRiskItem[] = [
  { id: "ur-1", unit: "Ward 3A", risk: "High", activeCases: 3, trend: "Up" },
  { id: "ur-2", unit: "ICU", risk: "Moderate", activeCases: 2, trend: "Flat" },
  { id: "ur-3", unit: "Ward 1B", risk: "Low", activeCases: 1, trend: "Down" },
];

const LAB_TRIGGERS: LabTriggerItem[] = [
  {
    id: "lb-1",
    test: "Blood Culture",
    patient: "Aarav Nair",
    organism: "MRSA",
    collected: "08:10 AM",
    status: "New",
  },
  {
    id: "lb-2",
    test: "Stool Toxin",
    patient: "Meera Joshi",
    organism: "C. diff",
    collected: "07:30 AM",
    status: "Reviewed",
  },
  {
    id: "lb-3",
    test: "PCR Panel",
    patient: "Ravi Iyer",
    organism: "COVID-19",
    collected: "Yesterday",
    status: "Reviewed",
  },
];

export default function InfectionControlPage() {
  const router = useRouter();
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const can = usePermission();
  const canWrite = can("clinical.infection_control.write");
  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );
  const [cases, setCases] = React.useState<InfectionCase[]>(INITIAL_CASES);
  const [isolations, setIsolations] =
    React.useState<IsolationRoom[]>(INITIAL_ISOLATIONS);
  const [ppeChecklist, setPpeChecklist] = React.useState<
    Record<string, boolean>
  >(
    PPE_CHECKLIST.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.checked }),
      {},
    ),
  );
  const [selectedIsolationRoomId, setSelectedIsolationRoomId] = React.useState<
    string | null
  >("iso-1");
  const [sendToChannels, setSendToChannels] = React.useState<
    Record<string, boolean>
  >(
    SEND_TO_OPTIONS.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.checked }),
      {},
    ),
  );
  const [selectedAuditId, setSelectedAuditId] = React.useState<string | null>(
    "ar-1",
  );
  const [auditChecklist, setAuditChecklist] = React.useState<
    Record<string, boolean>
  >(
    AUDIT_CHECKLIST.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.checked }),
      {},
    ),
  );
  const [audits, setAudits] = React.useState<AuditRecord[]>(INITIAL_AUDITS);
  const [alerts, setAlerts] = React.useState<AlertItem[]>(INITIAL_ALERTS);
  const [actions, setActions] = React.useState<ActionItem[]>(INITIAL_ACTIONS);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(
    INITIAL_CASES[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] =
    React.useState<(typeof FLOW_TAB_IDS)[number]>("detect");
  const [caseDialogOpen, setCaseDialogOpen] = React.useState(false);
  const [caseDetailOpen, setCaseDetailOpen] = React.useState(false);
  const [isolateDialogOpen, setIsolateDialogOpen] = React.useState(false);
  const [isolateCaseId, setIsolateCaseId] = React.useState<string | null>(null);
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [closeCaseDialogOpen, setCloseCaseDialogOpen] = React.useState(false);
  const [closeCaseId, setCloseCaseId] = React.useState<string | null>(null);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [menuMrn, setMenuMrn] = React.useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    mrn: string,
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuMrn(mrn);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMrn(null);
  };

  const menuOpen = Boolean(menuAnchorEl);

  const [search, setSearch] = React.useState("");

  const [caseForm, setCaseForm] = React.useState<{
    patientSelect: string | null;
    wardBed: string;
    suspectedPathogen: string;
    isolationLevel: string;
    detectionSource: string;
    priority: string;
    reportingPhysician: string;
    dateDetected: string;
    clinicalNotes: string;
    patientName: string;
    mrn: string;
    organism: string;
    unit: string;
    bed: string;
    isolationType: string;
    ipdStatus: string;
    risk: string;
  }>({
    patientSelect: null,
    wardBed: "",
    suspectedPathogen: "",
    isolationLevel: "Standard",
    detectionSource: "Lab Auto-Flag (LIS)",
    priority: "Critical",
    reportingPhysician: "",
    dateDetected: "",
    clinicalNotes: "",
    patientName: "",
    mrn: "",
    organism: "",
    unit: "",
    bed: "",
    isolationType: "Contact",
    ipdStatus: "Watch",
    risk: "Moderate",
  });

  const [isolateForm, setIsolateForm] = React.useState({
    roomId: "",
    isolationType: "Droplet Precautions",
    gloves: true,
    gown: true,
    surgicalMask: true,
    n95: false,
    faceShield: false,
    notes: "",
  });

  const [autoTriggers, setAutoTriggers] = React.useState({
    assignIsolation: true,
    notifyIpc: true,
    notifyHod: true,
    scheduleAudit: false,
    outbreakFlag: false,
  });

  const [auditForm, setAuditForm] = React.useState({
    linkedPatient: "",
    wardArea: "",
    score: "",
    observations: "",
    correctiveActions: "",
    auditType: "Hand Hygiene",
    leadAuditor: "",
    auditDate: "",
  });

  const [closeCaseForm, setCloseCaseForm] = React.useState({
    closingPhysician: "",
    closureDate: "11/06/2024",
    finalSummary: "",
    confirmCriteria: true,
  });

  const selectedCase =
    cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const caseTimeline = CASE_TIMELINES[selectedCase?.id ?? ""] ?? [];
  const closedCases = cases.filter((item) => item.status === "Closed");
  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedCase?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn],
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = cases.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, cases]);

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "Closed",
              icStatus: "Closed" as IcStatus,
              lastUpdate: "Just now",
            }
          : item,
      ),
    );
    setSnackbar({
      open: true,
      message: "Case marked as closed.",
      severity: "success",
    });
  };

  const openCloseCaseDialog = (targetCase: InfectionCase) => {
    setCloseCaseId(targetCase.id);
    setCloseCaseForm({
      closingPhysician: "",
      closureDate: "11/06/2024",
      finalSummary: "",
      confirmCriteria: true,
    });
    setCloseCaseDialogOpen(true);
  };

  const handleConfirmCloseCase = () => {
    if (!closeCaseId) return;
    if (!closeCaseForm.closingPhysician) {
      setSnackbar({
        open: true,
        message: "Please enter Closing Physician.",
        severity: "info",
      });
      return;
    }
    if (!closeCaseForm.confirmCriteria) {
      setSnackbar({
        open: true,
        message: "Please confirm closure criteria.",
        severity: "info",
      });
      return;
    }
    handleResolveCase(closeCaseId);
    setCloseCaseDialogOpen(false);
    setCloseCaseId(null);
    setCaseDetailOpen(false);
  };

  const handleToggleIsolation = (roomId: string) => {
    setIsolations((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: room.status === "Cleared" ? "Active" : "Cleared",
            }
          : room,
      ),
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      ),
    );
    setSnackbar({
      open: true,
      message: "Alert acknowledged.",
      severity: "info",
    });
  };

  const handleCompleteAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, status: "Done" } : action,
      ),
    );
    setSnackbar({
      open: true,
      message: "Action completed.",
      severity: "success",
    });
  };

  const handleCreateCase = () => {
    const sel = caseForm.patientSelect
      ? IPD_PATIENTS.find(
          (p) =>
            p.mrn === caseForm.patientSelect ||
            p.name === caseForm.patientSelect,
        )
      : null;
    const [unit, bed] = sel?.wardBed
      ? sel.wardBed.split(" / ")
      : ["General Ward", "-"];
    const newCase: InfectionCase = {
      id: `ic-${Date.now()}`,
      patientName: sel?.name || caseForm.patientName || "New Patient",
      mrn: sel?.mrn || caseForm.mrn || "MRN-NEW",
      organism:
        caseForm.suspectedPathogen || caseForm.organism || "Unknown organism",
      unit: unit || caseForm.unit || "General Ward",
      bed: bed || caseForm.bed || "-",
      isolationType: (caseForm.isolationType as IsolationType) || "Contact",
      ipdStatus: (caseForm.ipdStatus as IpdStatus) || "Watch",
      icStatus: "Detected",
      status: "Active",
      risk: (caseForm.priority === "Critical"
        ? "High"
        : caseForm.priority === "High"
          ? "High"
          : "Moderate") as InfectionCase["risk"],
      lastUpdate: "Just now",
    };
    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCaseDialogOpen(false);
    setCaseForm({
      patientSelect: null,
      wardBed: "",
      suspectedPathogen: "",
      isolationLevel: "Standard",
      detectionSource: "Lab Auto-Flag (LIS)",
      priority: "Critical",
      reportingPhysician: "",
      dateDetected: "",
      clinicalNotes: "",
      patientName: "",
      mrn: "",
      organism: "",
      unit: "",
      bed: "",
      isolationType: "Contact",
      ipdStatus: "Watch",
      risk: "Moderate",
    });
    setAutoTriggers({
      assignIsolation: true,
      notifyIpc: true,
      notifyHod: true,
      scheduleAudit: false,
      outbreakFlag: false,
    });
    setSnackbar({
      open: true,
      message: "New case created.",
      severity: "success",
    });
  };

  const openIsolateDialog = (targetCase: InfectionCase) => {
    setIsolateCaseId(targetCase.id);
    setIsolateForm((prev) => ({
      ...prev,
      roomId: "",
      isolationType:
        targetCase.isolationType === "Contact"
          ? "Contact Precautions"
          : targetCase.isolationType === "Droplet"
            ? "Droplet Precautions"
            : targetCase.isolationType === "Airborne"
              ? "Airborne Precautions"
              : "Standard Precautions",
      gloves: true,
      gown: true,
      surgicalMask:
        targetCase.isolationType === "Droplet" ||
        targetCase.isolationType === "Airborne",
      n95: targetCase.isolationType === "Airborne",
      faceShield: false,
      notes: "",
    }));
    setIsolateDialogOpen(true);
  };

  const handleConfirmIsolation = () => {
    if (!isolateCaseId || !isolateForm.roomId) {
      setSnackbar({
        open: true,
        message: "Please select an isolation room.",
        severity: "info",
      });
      return;
    }
    const room = AVAILABLE_ISOLATION_ROOMS.find(
      (r) => r.id === isolateForm.roomId,
    );
    if (room) {
      const isoType =
        isolateForm.isolationType === "Contact Precautions"
          ? "Contact"
          : isolateForm.isolationType === "Droplet Precautions"
            ? "Droplet"
            : isolateForm.isolationType === "Airborne Precautions"
              ? "Airborne"
              : "Contact"; // Standard Precautions → Contact for IC status
      setCases((prev) =>
        prev.map((c) =>
          c.id === isolateCaseId
            ? {
                ...c,
                icStatus: "Isolating" as IcStatus,
                unit: room.unit,
                bed: room.room,
                isolationType: isoType as IsolationType,
              }
            : c,
        ),
      );
      setSnackbar({
        open: true,
        message: "Isolation initiated. Room assigned.",
        severity: "success",
      });
      setActiveTab("isolate");
    }
    setIsolateDialogOpen(false);
    setIsolateCaseId(null);
  };

  const handleLogAudit = () => {
    const newAudit: AuditRecord = {
      id: `au-${Date.now()}`,
      ward: auditForm.wardArea || "General Ward",
      compliance: Number(auditForm.score) || 90,
      lead: auditForm.leadAuditor || "Team Lead",
      lastAudit: auditForm.auditDate || "Just now",
    };
    setAudits((prev) => [newAudit, ...prev]);
    setAuditDialogOpen(false);
    setAuditForm({
      linkedPatient: "",
      wardArea: "",
      score: "",
      observations: "",
      correctiveActions: "",
      auditType: "Hand Hygiene",
      leadAuditor: "",
      auditDate: "",
    });
    setSnackbar({
      open: true,
      message: "Audit logged successfully.",
      severity: "success",
    });
  };

  const columns = React.useMemo<CommonColumn<InfectionCase>[]>(
    () => [
      {
        field: "patientName",
        headerName: "Patient",
        width: 250,
        renderCell: (row) => {
          const initials = row.patientName
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {initials}
              </Avatar>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  component="button"
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    p: 0,
                    textAlign: "left",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/patients/profile?mrn=${row.mrn}`);
                  }}
                >
                  {row.patientName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.mrn} · {row.unit}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      { field: "bed", headerName: "Bed" },
      {
        field: "organism",
        headerName: "Pathogen",
        renderCell: (row) => (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  row.organism === "MRSA" || row.organism === "VRE"
                    ? "error.main"
                    : row.organism === "C. diff"
                      ? "warning.main"
                      : "info.main",
              }}
            />
            {row.organism}
          </Stack>
        ),
      },
      {
        field: "isolationType",
        headerName: "Isolation",
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.isolationType.toUpperCase()}
            sx={{
              fontWeight: 600,
              bgcolor:
                row.isolationType === "Airborne"
                  ? alpha(theme.palette.error.main, 0.12)
                  : row.isolationType === "Contact"
                    ? alpha(theme.palette.warning.main, 0.12)
                    : alpha(theme.palette.info.main, 0.12),
              color:
                row.isolationType === "Airborne"
                  ? "error.dark"
                  : row.isolationType === "Contact"
                    ? "warning.dark"
                    : "info.dark",
            }}
          />
        ),
      },
      {
        field: "ipdStatus",
        headerName: "IPD Status",
        renderCell: (row) => (
          <Chip
            size="small"
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor:
                    row.ipdStatus === "Critical"
                      ? "error.main"
                      : row.ipdStatus === "Watch"
                        ? "warning.main"
                        : "success.main",
                }}
              />
            }
            label={row.ipdStatus}
            sx={{
              fontWeight: 600,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        ),
      },
      {
        field: "icStatus",
        headerName: "IC Status",
        renderCell: (row) => (
          <Chip
            size="small"
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor:
                    row.icStatus === "Isolating"
                      ? "error.main"
                      : row.icStatus === "Notified" ||
                          row.icStatus === "Detected"
                        ? "warning.main"
                        : row.icStatus === "In Audit"
                          ? "secondary.main"
                          : "success.main",
                }}
              />
            }
            label={row.icStatus}
            sx={{
              fontWeight: 600,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        ),
      },
      {
        field: "clinicalLinks",
        headerName: "Clinical Links",
        align: "center",
        renderCell: (row) => (
          <Tooltip title="Related Clinical Links">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, row.mrn);
              }}
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <OpenInNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        align: "center",
        renderCell: (row) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCaseId(row.id);
                setCaseDetailOpen(true);
              }}
              sx={{ px: 2 }}
            >
              View
            </Button>
            {row.icStatus === "Detected" && (
              <Button
                size="small"
                variant="contained"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  openIsolateDialog(row);
                }}
                sx={{ px: 2 }}
              >
                Isolate
              </Button>
            )}
            {row.icStatus === "Isolating" && (
              <Button
                size="small"
                variant="contained"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  setCases((prev) =>
                    prev.map((c) =>
                      c.id === row.id
                        ? {
                            ...c,
                            icStatus: "Notified" as IcStatus,
                          }
                        : c,
                    ),
                  );
                }}
                sx={{ px: 2 }}
              >
                Notify
              </Button>
            )}
            {row.icStatus === "Notified" && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  setCases((prev) =>
                    prev.map((c) =>
                      c.id === row.id
                        ? {
                            ...c,
                            icStatus: "In Audit" as IcStatus,
                          }
                        : c,
                    ),
                  );
                }}
                sx={{ borderRadius: "20px", px: 2 }}
              >
                Audit
              </Button>
            )}
            {row.icStatus === "In Audit" && (
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  openCloseCaseDialog(row);
                }}
                sx={{ px: 2 }}
              >
                Close?
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, router, handleMenuOpen, canWrite],
  );

  const tabCounts = React.useMemo(() => {
    const counts: Record<(typeof FLOW_TAB_IDS)[number], number> = {
      detect: cases.filter((c) => c.icStatus === "Detected").length,
      isolate: cases.filter((c) => c.icStatus === "Isolating").length,
      notify: cases.filter((c) => c.icStatus === "Notified").length,
      audit: cases.filter((c) => c.icStatus === "In Audit").length,
      close: cases.filter((c) => c.icStatus === "Closed").length,
    };
    return counts;
  }, [cases]);

  const flowTabs: CommonTabItem<(typeof FLOW_TAB_IDS)[number]>[] = [
    {
      id: "detect",
      label: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Detect
          </Typography>
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              borderRadius: "6px",
              bgcolor:
                activeTab === "detect"
                  ? alpha("#fff", 0.2)
                  : alpha(theme.palette.primary.main, 0.08),
              color:
                activeTab === "detect" ? "inherit" : theme.palette.primary.main,
              fontSize: "0.7rem",
              fontWeight: 800,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {tabCounts.detect}
          </Box>
        </Stack>
      ),
      icon: <SearchIcon />,
    },
    {
      id: "isolate",
      label: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Isolate
          </Typography>
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              borderRadius: "6px",
              bgcolor:
                activeTab === "isolate"
                  ? alpha("#fff", 0.2)
                  : alpha(theme.palette.primary.main, 0.08),
              color:
                activeTab === "isolate"
                  ? "inherit"
                  : theme.palette.primary.main,
              fontSize: "0.7rem",
              fontWeight: 800,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {tabCounts.isolate}
          </Box>
        </Stack>
      ),
      icon: <HealthAndSafetyIcon />,
    },
    {
      id: "notify",
      label: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Notify
          </Typography>
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              borderRadius: "6px",
              bgcolor:
                activeTab === "notify"
                  ? alpha("#fff", 0.2)
                  : alpha(theme.palette.primary.main, 0.08),
              color:
                activeTab === "notify" ? "inherit" : theme.palette.primary.main,
              fontSize: "0.7rem",
              fontWeight: 800,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {tabCounts.notify}
          </Box>
        </Stack>
      ),
      icon: <NotificationsIcon />,
    },
    {
      id: "audit",
      label: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Audit
          </Typography>
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              borderRadius: "6px",
              bgcolor:
                activeTab === "audit"
                  ? alpha("#fff", 0.2)
                  : alpha(theme.palette.primary.main, 0.08),
              color:
                activeTab === "audit" ? "inherit" : theme.palette.primary.main,
              fontSize: "0.7rem",
              fontWeight: 800,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {tabCounts.audit}
          </Box>
        </Stack>
      ),
      icon: <AssignmentTurnedInIcon />,
    },
    {
      id: "close",
      label: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Close
          </Typography>
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              borderRadius: "6px",
              bgcolor:
                activeTab === "close"
                  ? alpha("#fff", 0.2)
                  : alpha(theme.palette.primary.main, 0.08),
              color:
                activeTab === "close" ? "inherit" : theme.palette.primary.main,
              fontSize: "0.7rem",
              fontWeight: 800,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {tabCounts.close}
          </Box>
        </Stack>
      ),
      icon: <CheckCircleIcon />,
    },
  ];

  // const TABLE_HEADER_SX = {
  //   fontWeight: 700,
  //   textTransform: "uppercase" as const,
  //   fontSize: "0.7rem",
  //   letterSpacing: "0.06em",
  //   color: "text.secondary",
  //   py: 1.25,
  //   borderBottom: "1px solid",
  //   borderColor: alpha(theme.palette.primary.main, 0.12),
  //   bgcolor: alpha(theme.palette.primary.main, 0.03),
  //   whiteSpace: "nowrap" as const,
  // };

  // const casesTableTitle =
  //   activeTab === "isolate"
  //     ? "Isolation Cases"
  //     : activeTab === "audit"
  //       ? "Audit Cases"
  //       : activeTab === "close"
  //         ? "Closed Cases"
  //         : "Active Infection Cases";

  const casesTableBlock = (
    // <Paper
    //   elevation={0}
    //   sx={{
    //     borderRadius: 2,
    //     border: "1px solid",
    //     borderColor: alpha(theme.palette.primary.main, 0.14),
    //     overflow: "hidden",
    //     boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
    //   }}
    // >
    <CommonDataGrid<InfectionCase>
      rows={cases.filter((c) => c.icStatus === IC_STATUS_BY_TAB[activeTab])}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo={true}
      searchPlaceholder="Search patient, MRN, organism..."
      searchFields={["patientName", "mrn", "organism"]}
      toolbarRight={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleIcon />}
          disabled={!canWrite}
          onClick={() => setCaseDialogOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
        >
          New Case
        </Button>
      }
    />
  );

  return (
    <PageTemplate
      title="Infection Control"
      subtitle={pageSubtitle}
      currentPageTitle="Infection Control"
    >
      <Stack spacing={1.25}>
        <WorkspaceHeaderCard>
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    lineHeight: 1.1,
                  }}
                >
                  Infection Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track cases, manage isolation, run audits, and coordinate
                  safety actions.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentTurnedInIcon />}
                  disabled={!canWrite}
                  onClick={() => setAuditDialogOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Log Audit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  disabled={!canWrite}
                  onClick={() => setCaseDialogOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  New Case
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <StatTile
            label="Active Cases"
            value={cases.filter((item) => item.status === "Active").length}
            subtitle="Under investigation"
            icon={<BugReportIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Isolation Rooms"
            value={isolations.filter((room) => room.status === "Active").length}
            subtitle="Currently active"
            icon={<HealthAndSafetyIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Alerts"
            value={alerts.filter((alert) => !alert.acknowledged).length}
            subtitle="Need attention"
            icon={<WarningAmberIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Compliance"
            value="92%"
            subtitle="Last 7 days"
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
        </Box>

        <CommonTabs
          tabs={flowTabs}
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
          variant="scrollable"
          sx={{
            "& .MuiTabs-flexContainer": { gap: 1 },
            "& .MuiTab-root": {
              borderRadius: 2,
              minWidth: "auto",
              minHeight: 44,
              px: 2.5,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            },
          }}
        />

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              lg:
                activeTab === "isolate"
                  ? "1fr 300px"
                  : activeTab === "notify"
                    ? "1fr 280px"
                    : activeTab === "audit" || activeTab === "close"
                      ? "1fr 300px"
                      : "1fr 320px",
            },
            alignItems: "start",
          }}
        >
          {activeTab === "isolate" ? (
            <>
              <Stack spacing={1.5}>
                {casesTableBlock}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    overflow: "hidden",
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25} sx={{ p: 1.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      PPE Checklist —{" "}
                      {(() => {
                        const sel = isolations.find(
                          (i) => i.id === selectedIsolationRoomId,
                        );
                        return sel
                          ? `${sel.room} (${sel.patientName ?? "—"})`
                          : "Select a room";
                      })()}
                    </Typography>
                    {PPE_CHECKLIST.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: ppeChecklist[item.id]
                            ? alpha(theme.palette.success.main, 0.08)
                            : "transparent",
                        }}
                      >
                        <Checkbox
                          checked={ppeChecklist[item.id] ?? item.checked}
                          onChange={(_, checked) =>
                            setPpeChecklist((prev) => ({
                              ...prev,
                              [item.id]: checked,
                            }))
                          }
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={
                            <CheckBoxIcon sx={{ color: "success.main" }} />
                          }
                          sx={{ p: 0.25 }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.role}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Stack>

              <Stack spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={0.75}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <HotelIcon
                          sx={{ fontSize: 18, color: "primary.main" }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Room Map
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!canWrite}
                        onClick={() => {
                          const targetCase =
                            cases.find((c) => c.icStatus === "Detected") ??
                            cases[0];
                          if (targetCase) openIsolateDialog(targetCase);
                        }}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Assign Room
                      </Button>
                    </Stack>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1,
                      }}
                    >
                      {ROOM_MAP_ITEMS.map((rm) => (
                        <Box
                          key={rm.id}
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor:
                              rm.status === "occupied"
                                ? alpha(theme.palette.error.main, 0.12)
                                : rm.status === "free"
                                  ? alpha(theme.palette.success.main, 0.12)
                                  : rm.status === "cleaning"
                                    ? alpha(theme.palette.warning.main, 0.12)
                                    : alpha(theme.palette.grey[500], 0.12),
                            color:
                              rm.status === "occupied"
                                ? "error.dark"
                                : rm.status === "free"
                                  ? "success.dark"
                                  : rm.status === "cleaning"
                                    ? "warning.dark"
                                    : "grey.700",
                          }}
                        >
                          {rm.label}
                        </Box>
                      ))}
                    </Box>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      sx={{ pt: 0.5 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(theme.palette.error.main, 0.3),
                          }}
                        />
                        <Typography variant="caption">
                          Occupied (
                          {
                            ROOM_MAP_ITEMS.filter(
                              (r) => r.status === "occupied",
                            ).length
                          }
                          )
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(theme.palette.success.main, 0.3),
                          }}
                        />
                        <Typography variant="caption">
                          Free (
                          {
                            ROOM_MAP_ITEMS.filter((r) => r.status === "free")
                              .length
                          }
                          )
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(theme.palette.warning.main, 0.3),
                          }}
                        />
                        <Typography variant="caption">
                          Cleaning (
                          {
                            ROOM_MAP_ITEMS.filter(
                              (r) => r.status === "cleaning",
                            ).length
                          }
                          )
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(theme.palette.grey[500], 0.3),
                          }}
                        />
                        <Typography variant="caption">
                          Maintenance (
                          {
                            ROOM_MAP_ITEMS.filter(
                              (r) => r.status === "maintenance",
                            ).length
                          }
                          )
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </>
          ) : activeTab === "notify" ? (
            <>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.14),
                  overflow: "hidden",
                  boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                }}
              >
                <Stack spacing={1.25} sx={{ p: 1.75 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Notification Feed
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendIcon />}
                      disabled={!canWrite}
                      onClick={() => {}}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: "warning.main",
                        "&:hover": { bgcolor: "warning.dark" },
                      }}
                    >
                      Send Notification
                    </Button>
                  </Stack>
                  <Stack divider={<Divider />} spacing={0}>
                    {NOTIFICATION_FEED.map((item) => (
                      <Stack
                        key={item.id}
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ py: 1.25 }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              bgcolor:
                                item.type === "critical"
                                  ? alpha(theme.palette.error.main, 0.12)
                                  : item.type === "exposure" ||
                                      item.type === "lab-ready"
                                    ? alpha(theme.palette.warning.main, 0.12)
                                    : item.type === "acknowledged"
                                      ? alpha(theme.palette.grey[500], 0.12)
                                      : "transparent",
                            }}
                          >
                            {item.type === "critical" && (
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "error.main",
                                }}
                              />
                            )}
                            {item.type === "exposure" && (
                              <WarningAmberIcon
                                sx={{ fontSize: 18, color: "warning.main" }}
                              />
                            )}
                            {item.type === "acknowledged" && (
                              <CheckCircleIcon
                                sx={{ fontSize: 18, color: "success.main" }}
                              />
                            )}
                            {item.type === "lab-ready" && (
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: 0.5,
                                  bgcolor: alpha(
                                    theme.palette.warning.main,
                                    0.5,
                                  ),
                                }}
                              />
                            )}
                          </Box>
                          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.body}
                            </Typography>
                            {item.actionLabel && (
                              <Typography
                                component="button"
                                variant="body2"
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 600,
                                  textDecoration: "underline",
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  p: 0,
                                  alignSelf: "flex-start",
                                }}
                                onClick={() => {}}
                              >
                                {item.actionLabel}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexShrink: 0 }}
                        >
                          {item.timestamp}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Stack spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <SendIcon sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Send To
                      </Typography>
                    </Stack>
                    {SEND_TO_OPTIONS.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ py: 0.25 }}
                      >
                        <Checkbox
                          checked={sendToChannels[item.id] ?? item.checked}
                          onChange={(_, checked) =>
                            setSendToChannels((prev) => ({
                              ...prev,
                              [item.id]: checked,
                            }))
                          }
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={
                            <CheckBoxIcon sx={{ color: "primary.main" }} />
                          }
                          sx={{ p: 0.25 }}
                        />
                        <Typography variant="body2">{item.label}</Typography>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<SendIcon />}
                      disabled={!canWrite}
                      onClick={() => {}}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        mt: 0.5,
                        bgcolor: "warning.main",
                        "&:hover": { bgcolor: "warning.dark" },
                      }}
                    >
                      Configure & Send
                    </Button>
                  </Stack>
                </Card>

              </Stack>
            </>
          ) : activeTab === "audit" ? (
            <>
              <Stack spacing={1.5}>
                {casesTableBlock}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    overflow: "hidden",
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25} sx={{ p: 1.75 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <CheckBoxIcon
                          sx={{ fontSize: 18, color: "primary.main" }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          Audit Checklist — AUD-031
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Hand Hygiene B-12
                      </Typography>
                    </Stack>
                    {AUDIT_CHECKLIST.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: auditChecklist[item.id]
                            ? alpha(theme.palette.success.main, 0.08)
                            : "transparent",
                        }}
                      >
                        <Checkbox
                          checked={auditChecklist[item.id] ?? item.checked}
                          onChange={(_, checked) =>
                            setAuditChecklist((prev) => ({
                              ...prev,
                              [item.id]: checked,
                            }))
                          }
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={
                            <CheckBoxIcon sx={{ color: "success.main" }} />
                          }
                          sx={{ p: 0.25 }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {item.label}
                        </Typography>
                        {item.badge && (
                          <Chip
                            size="small"
                            label={item.badge}
                            sx={{
                              fontSize: "0.65rem",
                              height: 20,
                              bgcolor: item.badge.includes("Missing")
                                ? alpha(theme.palette.warning.main, 0.12)
                                : alpha(theme.palette.success.main, 0.12),
                              color: item.badge.includes("Missing")
                                ? "warning.dark"
                                : "success.dark",
                            }}
                          />
                        )}
                      </Stack>
                    ))}
                    <TextField
                      multiline
                      rows={2}
                      placeholder="Observations / corrective actions..."
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Stack>
                </Paper>
              </Stack>

              <Stack spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <ShowChartIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Compliance Scores
                      </Typography>
                    </Stack>
                    {COMPLIANCE_SCORES.map((item) => (
                      <Box key={item.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color:
                                item.score >= 85
                                  ? "success.main"
                                  : item.score < 70
                                    ? "error.main"
                                    : "warning.main",
                            }}
                          >
                            {item.score}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.score}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            "& .MuiLinearProgress-bar": { bgcolor: item.color },
                          }}
                        />
                      </Box>
                    ))}
                    <Box
                      sx={{
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "success.main" }}
                      >
                        92%
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main" }}
                      >
                        Last 7 days — On target
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: 600, mt: 1 }}
                    >
                      Download Report
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </>
          ) : activeTab === "close" ? (
            <>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                {casesTableBlock}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    overflow: "hidden",
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25} sx={{ p: 1.75 }}>
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        CLOSURE CRITERIA — SNEHA PATIL
                      </Typography>
                      <Stack spacing={0.75}>
                        {CLOSURE_CRITERIA.map((item) =>
                          item.met ? (
                            <Stack
                              key={item.id}
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{
                                py: 0.75,
                                px: 1.25,
                                borderRadius: 1.5,
                                bgcolor: alpha(
                                  theme.palette.success.main,
                                  0.08,
                                ),
                                border: "1px solid",
                                borderColor: alpha(
                                  theme.palette.success.main,
                                  0.25,
                                ),
                              }}
                            >
                              <CheckCircleIcon
                                sx={{ fontSize: 18, color: "success.main" }}
                              />
                              <Typography variant="body2">
                                {item.label}
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack
                              key={item.id}
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{ py: 0.75, px: 1 }}
                            >
                              <Checkbox
                                checked={false}
                                onChange={(_, checked) => {}}
                                icon={<CheckBoxOutlineBlankIcon />}
                                checkedIcon={
                                  <CheckBoxIcon
                                    sx={{ color: "success.main" }}
                                  />
                                }
                                sx={{ p: 0.25 }}
                              />
                              <Typography variant="body2">
                                {item.label}
                              </Typography>
                            </Stack>
                          ),
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>

              <Stack spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <PushPinIcon sx={{ fontSize: 18, color: "error.main" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Case Timeline — Sneha Patil
                      </Typography>
                    </Stack>
                    {CASE_TIMELINE_EVENTS.map((evt) => (
                      <Stack
                        key={evt.id}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        sx={{
                          py: 1,
                          px: 1,
                          borderRadius: 1.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            flexShrink: 0,
                          }}
                        >
                          {evt.iconColor === "success.main" ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: "success.main" }}
                            />
                          ) : evt.iconColor === "error.main" ? (
                            <HealthAndSafetyIcon
                              sx={{ fontSize: 18, color: "error.main" }}
                            />
                          ) : evt.iconColor === "warning.main" ? (
                            <NotificationsIcon
                              sx={{ fontSize: 18, color: "warning.main" }}
                            />
                          ) : (
                            <SearchIcon
                              sx={{ fontSize: 18, color: "info.main" }}
                            />
                          )}
                        </Box>
                        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {evt.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evt.date}
                            {evt.source ? ` · ${evt.source}` : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {evt.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </>
          ) : (
            <>
              {casesTableBlock}

              <Stack spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <NotificationsIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Lab Feed (Auto-Flag)
                      </Typography>
                    </Stack>
                    {LAB_FEED_ITEMS.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          border: "2px solid",
                          borderColor:
                            item.status === "pending"
                              ? "error.main"
                              : item.status === "auto-flagged"
                                ? "warning.main"
                                : item.status === "no-pathogen"
                                  ? "success.main"
                                  : "grey.400",
                          bgcolor:
                            item.status === "pending"
                              ? alpha(theme.palette.error.main, 0.04)
                              : item.status === "auto-flagged"
                                ? alpha(theme.palette.warning.main, 0.04)
                                : item.status === "no-pathogen"
                                  ? alpha(theme.palette.success.main, 0.04)
                                  : alpha(theme.palette.grey[500], 0.04),
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.patient}
                          {item.bed ? ` - ${item.bed}` : ""}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            color:
                              item.status === "pending"
                                ? "error.main"
                                : item.status === "auto-flagged"
                                  ? "warning.dark"
                                  : "text.secondary",
                          }}
                        >
                          {item.status === "pending"
                            ? "Pending action"
                            : item.status === "auto-flagged"
                              ? "Auto-flagged."
                              : item.status === "no-pathogen"
                                ? "No pathogen."
                                : item.patient}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <AssignmentTurnedInIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Detection Sources
                      </Typography>
                    </Stack>
                    {DETECTION_SOURCES.map((src) => (
                      <Box key={src.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {src.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {src.count}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={
                            src.id === "ds-1" ? 50 : src.id === "ds-2" ? 27 : 23
                          }
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: src.color,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </>
          )}
        </Box>

        {/* Main view: Active Infection Cases table + Lab Feed sidebar */}
      </Stack>

      <CommonDialog
        open={caseDialogOpen}
        onClose={() => setCaseDialogOpen(false)}
        title="New Infection Case"
        subtitle="Link patient from IPD and start infection control workflow"
        icon={
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          >
            <AddIcon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
        }
        maxWidth="md"
        content={
          <Box sx={{ mt: 1 }}>
            {/* ── SECTION 1: Patient ── */}
            <Box
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 2,
                border: "1.5px solid",
                borderColor: alpha(theme.palette.primary.main, 0.14),
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon sx={{ fontSize: 14, color: "primary.main" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Patient — Select from IPD
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <Autocomplete
                    options={IPD_PATIENTS}
                    getOptionLabel={(opt) =>
                      typeof opt === "string" ? opt : `${opt.name} (${opt.mrn})`
                    }
                    value={
                      IPD_PATIENTS.find(
                        (p) => p.mrn === caseForm.patientSelect,
                      ) ?? null
                    }
                    onChange={(_, val) => {
                      const p = val as (typeof IPD_PATIENTS)[0] | null;
                      setCaseForm((prev) => ({
                        ...prev,
                        patientSelect: p?.mrn ?? null,
                        wardBed: p?.wardBed ?? "",
                        patientName: p?.name ?? "",
                        mrn: p?.mrn ?? "",
                      }));
                    }}
                    componentsProps={{
                      popper: {
                        sx: { zIndex: 1600 },
                      },
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.mrn} · {option.wardBed}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Patient (MRN / Name) *"
                        placeholder="— Select IPD Patient —"
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    )}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Ward / Bed"
                    value={caseForm.wardBed}
                    placeholder="Auto-filled from IPD"
                    size="small"
                    disabled
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BedIcon
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                      "& .MuiInputBase-input": {
                        bgcolor: alpha(theme.palette.grey[500], 0.05),
                        fontWeight: caseForm.wardBed ? 600 : 400,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ── SECTION 2: Infection Details ── */}
            <Box
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 2,
                border: "1.5px solid",
                borderColor: alpha(theme.palette.primary.main, 0.14),
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BiotechIcon sx={{ fontSize: 14, color: "error.main" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Infection Details
                </Typography>
              </Stack>

              <Grid container spacing={2} sx={{ width: "100%" }}>
                {/* Row 1: 4 dropdowns */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    label="Suspected Pathogen *"
                    value={caseForm.suspectedPathogen}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        suspectedPathogen: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  >
                    <MenuItem value="">— Select —</MenuItem>
                    {["MRSA", "VRE", "C.diff", "COVID-19", "ESBL", "Other"].map(
                      (p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    label="Isolation Level *"
                    value={caseForm.isolationLevel}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        isolationLevel: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  >
                    {[
                      { value: "Standard", color: "#16a34a" },
                      { value: "Contact", color: "#d97706" },
                      { value: "Droplet", color: "#2563eb" },
                      { value: "Airborne", color: "#dc2626" },
                    ].map(({ value, color }) => (
                      <MenuItem key={value} value={value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: color,
                              flexShrink: 0,
                            }}
                          />
                          <span>{value}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    label="Detection Source"
                    value={caseForm.detectionSource}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        detectionSource: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  >
                    <MenuItem value="Lab Auto-Flag (LIS)">
                      Lab Auto-Flag (LIS)
                    </MenuItem>
                    <MenuItem value="Physician Report">
                      Physician Report
                    </MenuItem>
                    <MenuItem value="Nursing Flag">Nursing Flag</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    label="Priority"
                    value={caseForm.priority}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    SelectProps={{
                      renderValue: (val) => (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                val === "Critical"
                                  ? "error.main"
                                  : val === "High"
                                    ? "warning.main"
                                    : "success.main",
                            }}
                          />
                          <span>{val as string}</span>
                        </Stack>
                      ),
                    }}
                  >
                    {[
                      { label: "Critical", color: "error.main" },
                      { label: "High", color: "warning.main" },
                      { label: "Routine", color: "success.main" },
                    ].map(({ label, color }) => (
                      <MenuItem key={label} value={label}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: color,
                            }}
                          />
                          <span>{label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Row 2: Physician + Date */}
                <Grid item xs={12} md={8} lg={4}>
                  <TextField
                    label="Reporting Physician"
                    value={caseForm.reportingPhysician}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        reportingPhysician: e.target.value,
                      }))
                    }
                    placeholder="Name / Employee ID"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalHospitalIcon
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <TextField
                    label="Date Detected"
                    value={caseForm.dateDetected}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        dateDetected: e.target.value,
                      }))
                    }
                    placeholder="dd / mm / yyyy"
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthIcon
                            sx={{ fontSize: 18, color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  />
                </Grid>

                {/* Row 3: Clinical Notes */}
                <Grid item xs={12} md={12} lg={12} xl={12}>
                  <TextField
                    label="Clinical Notes"
                    value={caseForm.clinicalNotes}
                    onChange={(e) =>
                      setCaseForm((prev) => ({
                        ...prev,
                        clinicalNotes: e.target.value,
                      }))
                    }
                    placeholder="Symptoms, lab findings, observations..."
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        alignItems: "flex-start",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ── SECTION 3: Auto-Trigger Actions ── */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: "1.5px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BoltIcon sx={{ fontSize: 14, color: "primary.main" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Auto-Trigger Actions
                </Typography>
                <Chip
                  label={`${Object.values(autoTriggers).filter(Boolean).length} active`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: "primary.main",
                    ml: "auto !important",
                  }}
                  variant="outlined"
                />
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    {[
                      {
                        key: "assignIsolation",
                        label: "Assign Isolation Room",
                      },
                      { key: "notifyHod", label: "Notify HOD" },
                      { key: "outbreakFlag", label: "Outbreak Flag" },
                    ].map(({ key, label }) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={
                              autoTriggers[key as keyof typeof autoTriggers]
                            }
                            onChange={(_, v) =>
                              setAutoTriggers((p) => ({ ...p, [key]: v }))
                            }
                            size="small"
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {label}
                          </Typography>
                        }
                        sx={{ py: 0.25, m: 0 }}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    {[
                      { key: "notifyIpc", label: "Notify IPC Officer" },
                      { key: "scheduleAudit", label: "Schedule Audit" },
                    ].map(({ key, label }) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={
                              autoTriggers[key as keyof typeof autoTriggers]
                            }
                            onChange={(_, v) =>
                              setAutoTriggers((p) => ({ ...p, [key]: v }))
                            }
                            size="small"
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {label}
                          </Typography>
                        }
                        sx={{ py: 0.25, m: 0 }}
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setCaseDialogOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2.5,
                borderColor: alpha(theme.palette.primary.main, 0.4),
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!canWrite}
              onClick={handleCreateCase}
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                px: 3,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(theme.palette.grey[500], 0.12),
                  boxShadow: "none",
                },
              }}
            >
              Create Case & Start Workflow
            </Button>
          </Stack>
        }
      />

      <CommonDialog
        open={caseDetailOpen}
        onClose={() => setCaseDetailOpen(false)}
        title={`Case Detail — ${selectedCase?.patientName ?? "—"}`}
        subtitle={
          selectedCase
            ? `${selectedCase.mrn} • ${selectedCase.organism} • ${selectedCase.unit} • Bed ${selectedCase.bed}`
            : undefined
        }
        icon={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: "success.main",
            }}
          >
            <BiotechIcon sx={{ fontSize: 22 }} />
          </Box>
        }
        maxWidth="md"
        fullWidth
        content={
          selectedCase ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Patient card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  flexWrap="wrap"
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "primary.main",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {selectedCase.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </Avatar>
                  <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedCase.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {CASE_EXTRA[selectedCase.id]?.genderAge ?? "—"} •{" "}
                      {selectedCase.mrn} • {selectedCase.unit} • Bed{" "}
                      {selectedCase.bed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Admitted:{" "}
                      {CASE_EXTRA[selectedCase.id]?.admissionDate ?? "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Diagnosis: {CASE_EXTRA[selectedCase.id]?.diagnosis ?? "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      size="small"
                      icon={
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                          }}
                        />
                      }
                      label="Isolated"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.warning.main, 0.15),
                        borderColor: alpha(theme.palette.warning.main, 0.5),
                        "& .MuiChip-icon": { ml: 0.5 },
                      }}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={selectedCase.isolationType}
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.warning.main, 0.15),
                        borderColor: alpha(theme.palette.warning.main, 0.5),
                      }}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Timeline */}
              <Box
                sx={{
                  position: "relative",
                  pl: 1,
                  borderLeft: "2px solid",
                  borderColor: alpha(theme.palette.grey[500], 0.25),
                  ml: 1.5,
                }}
              >
                <Stack spacing={2}>
                  {(CASE_DETAIL_EVENTS[selectedCase.id] ?? []).map((evt) => {
                    const IconComponent =
                      evt.icon === "detect"
                        ? SearchIcon
                        : evt.icon === "isolate"
                          ? BlockIcon
                          : evt.icon === "notify"
                            ? NotificationsIcon
                            : AssignmentTurnedInIcon;
                    const iconColor =
                      evt.icon === "detect"
                        ? "primary.main"
                        : evt.icon === "isolate"
                          ? "error.main"
                          : evt.icon === "notify"
                            ? "warning.main"
                            : "info.main";
                    return (
                      <Stack
                        key={evt.id}
                        direction="row"
                        spacing={1.5}
                        sx={{ position: "relative", ml: -2.5 }}
                      >
                        <Stack
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor:
                              evt.icon === "detect"
                                ? alpha(theme.palette.primary.main, 0.12)
                                : evt.icon === "isolate"
                                  ? alpha(theme.palette.error.main, 0.12)
                                  : evt.icon === "notify"
                                    ? alpha(theme.palette.warning.main, 0.12)
                                    : alpha(theme.palette.info.main, 0.12),
                            color: iconColor,
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: "2px solid",
                            borderColor: "background.paper",
                            boxShadow:
                              "0 0 0 1px " +
                              alpha(theme.palette.grey[500], 0.2),
                          }}
                        >
                          <IconComponent sx={{ fontSize: 16 }} />
                        </Stack>
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {evt.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evt.date}
                            {evt.source ? ` • ${evt.source}` : ""}
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.25,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.grey[500], 0.06),
                              border: "1px solid",
                              borderColor: alpha(theme.palette.grey[500], 0.12),
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {evt.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          ) : null
        }
        actions={
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            width="100%"
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setCaseDetailOpen(false)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="warning"
              disabled={!canWrite}
              onClick={() => {
                setCaseDetailOpen(false);
                setActiveTab("notify");
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Send Notification
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!canWrite}
              onClick={() => {
                setCaseDetailOpen(false);
                setAuditDialogOpen(true);
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Log Audit
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={!canWrite}
              onClick={() => {
                if (selectedCase) {
                  setCaseDetailOpen(false);
                  openCloseCaseDialog(selectedCase);
                }
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Close Case
            </Button>
          </Stack>
        }
      />

      <CommonDialog
        open={isolateDialogOpen}
        onClose={() => {
          setIsolateDialogOpen(false);
          setIsolateCaseId(null);
        }}
        title="Initiate Isolation"
        subtitle={
          isolateCaseId
            ? (() => {
                const c = cases.find((x) => x.id === isolateCaseId);
                return c
                  ? `${c.patientName} · ${c.mrn} · ${c.organism} · ${c.bed}`
                  : undefined;
              })()
            : undefined
        }
        icon={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: "error.main",
            }}
          >
            <BlockIcon sx={{ fontSize: 22 }} />
          </Box>
        }
        maxWidth="sm"
        fullWidth
        content={
          isolateCaseId
            ? (() => {
                const isolateCase = cases.find((c) => c.id === isolateCaseId);
                if (!isolateCase) return null;
                return (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    {/* Patient card */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.15),
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "primary.main",
                            fontWeight: 700,
                            fontSize: "1rem",
                          }}
                        >
                          {isolateCase.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </Avatar>
                        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {isolateCase.patientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {CASE_EXTRA[isolateCase.id]?.genderAge ?? "—"} ·{" "}
                            {isolateCase.mrn} · {isolateCase.unit} · Bed{" "}
                            {isolateCase.bed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pathogen: {isolateCase.organism} Current: Detected —
                            Isolation Pending
                          </Typography>
                        </Stack>
                        <Chip
                          size="small"
                          label={isolateCase.isolationType}
                          sx={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            bgcolor: alpha(theme.palette.info.main, 0.12),
                            borderColor: alpha(theme.palette.info.main, 0.4),
                          }}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>

                    {/* Form fields */}
                    <TextField
                      select
                      label="Assign Isolation Room *"
                      value={isolateForm.roomId}
                      onChange={(e) =>
                        setIsolateForm((prev) => ({
                          ...prev,
                          roomId: e.target.value,
                        }))
                      }
                      size="small"
                      fullWidth
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    >
                      <MenuItem value="">— Select Room —</MenuItem>
                      {AVAILABLE_ISOLATION_ROOMS.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.room} · {r.type} ({r.status})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Isolation Type"
                      value={isolateForm.isolationType}
                      onChange={(e) =>
                        setIsolateForm((prev) => ({
                          ...prev,
                          isolationType: e.target.value,
                        }))
                      }
                      size="small"
                      fullWidth
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    >
                      <MenuItem value="Contact Precautions">
                        Contact Precautions
                      </MenuItem>
                      <MenuItem value="Droplet Precautions">
                        Droplet Precautions
                      </MenuItem>
                      <MenuItem value="Airborne Precautions">
                        Airborne Precautions
                      </MenuItem>
                      <MenuItem value="Standard Precautions">
                        Standard Precautions
                      </MenuItem>
                    </TextField>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        PPE Requirements
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isolateForm.gloves}
                              onChange={(e) =>
                                setIsolateForm((prev) => ({
                                  ...prev,
                                  gloves: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="Gloves"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isolateForm.gown}
                              onChange={(e) =>
                                setIsolateForm((prev) => ({
                                  ...prev,
                                  gown: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="Gown"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isolateForm.surgicalMask}
                              onChange={(e) =>
                                setIsolateForm((prev) => ({
                                  ...prev,
                                  surgicalMask: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="Surgical Mask"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isolateForm.n95}
                              onChange={(e) =>
                                setIsolateForm((prev) => ({
                                  ...prev,
                                  n95: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="N95"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isolateForm.faceShield}
                              onChange={(e) =>
                                setIsolateForm((prev) => ({
                                  ...prev,
                                  faceShield: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="Face Shield"
                        />
                      </Stack>
                    </Box>

                    <TextField
                      label="Notes"
                      value={isolateForm.notes}
                      onChange={(e) =>
                        setIsolateForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Special instructions, transfer notes..."
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    />
                  </Stack>
                );
              })()
            : null
        }
        actions={
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setIsolateDialogOpen(false);
                setIsolateCaseId(null);
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!canWrite}
              onClick={handleConfirmIsolation}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Confirm Isolation
            </Button>
          </Stack>
        }
      />

      <CommonDialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        title="Log Audit"
        subtitle="Create or update an IPC compliance audit"
        icon={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
            }}
          >
            <SearchIcon sx={{ fontSize: 22 }} />
          </Box>
        }
        maxWidth="md"
        fullWidth
        content={
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Linked Patient (IPD)"
                  value={auditForm.linkedPatient}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      linkedPatient: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                >
                  <MenuItem value="">— Select —</MenuItem>
                  {auditForm.linkedPatient &&
                    !cases.some(
                      (c) =>
                        `${c.patientName} · ${c.bed}` ===
                        auditForm.linkedPatient,
                    ) && (
                      <MenuItem value={auditForm.linkedPatient}>
                        {auditForm.linkedPatient}
                      </MenuItem>
                    )}
                  {cases
                    .filter(
                      (c) => c.status === "Active" || c.icStatus === "In Audit",
                    )
                    .map((c) => (
                      <MenuItem
                        key={c.id}
                        value={`${c.patientName} · ${c.bed}`}
                      >
                        {c.patientName} · {c.bed}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ward / Area"
                  value={auditForm.wardArea}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      wardArea: e.target.value,
                    }))
                  }
                  placeholder="e.g. Ward 3A · Bed B-12"
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Score (%)"
                  type="number"
                  value={auditForm.score}
                  onChange={(e) =>
                    setAuditForm((prev) => ({ ...prev, score: e.target.value }))
                  }
                  placeholder="e.g. 85"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Audit Type"
                  value={auditForm.auditType}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      auditType: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                >
                  <MenuItem value="Hand Hygiene">Hand Hygiene</MenuItem>
                  <MenuItem value="PPE Compliance">PPE Compliance</MenuItem>
                  <MenuItem value="Env. Cleaning">Env. Cleaning</MenuItem>
                  <MenuItem value="Isolation Compliance">
                    Isolation Compliance
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lead Auditor"
                  value={auditForm.leadAuditor}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      leadAuditor: e.target.value,
                    }))
                  }
                  placeholder="Name / Employee ID"
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Audit Date"
                  value={auditForm.auditDate}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      auditDate: e.target.value,
                    }))
                  }
                  placeholder="dd / mm / yyyy"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon
                          sx={{ fontSize: 18, color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Observations"
                  value={auditForm.observations}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      observations: e.target.value,
                    }))
                  }
                  placeholder="What was observed during the audit..."
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Corrective Actions Required"
                  value={auditForm.correctiveActions}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      correctiveActions: e.target.value,
                    }))
                  }
                  placeholder="Actions to be taken..."
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
            </Grid>
          </Box>
        }
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setAuditDialogOpen(false)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!canWrite}
              onClick={handleLogAudit}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Save Audit
            </Button>
          </>
        }
      />

      <CommonDialog
        open={closeCaseDialogOpen}
        onClose={() => {
          setCloseCaseDialogOpen(false);
          setCloseCaseId(null);
        }}
        title="Close Case"
        subtitle={
          closeCaseId
            ? (() => {
                const c = cases.find((x) => x.id === closeCaseId);
                return c
                  ? `${c.patientName} · ${c.mrn} · ${c.organism} · ${c.bed}`
                  : undefined;
              })()
            : undefined
        }
        icon={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: "success.main",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 22 }} />
          </Box>
        }
        maxWidth="sm"
        fullWidth
        content={
          closeCaseId ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Closure status banner */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.success.main, 0.25),
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "success.dark", fontWeight: 500 }}
                >
                  All closure criteria met. 3 negative cultures · Isolation ≥72h
                  · Terminal cleaning done · Audit: 94%.
                </Typography>
              </Box>

              <TextField
                label="Closing Physician *"
                value={closeCaseForm.closingPhysician}
                onChange={(e) =>
                  setCloseCaseForm((prev) => ({
                    ...prev,
                    closingPhysician: e.target.value,
                  }))
                }
                placeholder="Name / Employee ID"
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Closure Date"
                value={closeCaseForm.closureDate}
                onChange={(e) =>
                  setCloseCaseForm((prev) => ({
                    ...prev,
                    closureDate: e.target.value,
                  }))
                }
                placeholder="dd / mm / yyyy"
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarMonthIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Final Clinical Summary"
                value={closeCaseForm.finalSummary}
                onChange={(e) =>
                  setCloseCaseForm((prev) => ({
                    ...prev,
                    finalSummary: e.target.value,
                  }))
                }
                placeholder="Outcome, follow-up required, lessons learned..."
                size="small"
                fullWidth
                multiline
                rows={4}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={closeCaseForm.confirmCriteria}
                    onChange={(e) =>
                      setCloseCaseForm((prev) => ({
                        ...prev,
                        confirmCriteria: e.target.checked,
                      }))
                    }
                    color="primary"
                  />
                }
                label="I confirm all closure criteria are verified and this case is safe to close."
                sx={{
                  alignItems: "flex-start",
                  "& .MuiFormControlLabel-label": { fontWeight: 500 },
                }}
              />
            </Stack>
          ) : null
        }
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setCloseCaseDialogOpen(false);
                setCloseCaseId(null);
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={!canWrite}
              onClick={handleConfirmCloseCase}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Confirm Case Closure
            </Button>
          </Stack>
        }
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            mt: 1,
            "& .MuiMenuItem-root": {
              px: 1.5,
              py: 1,
              gap: 1.5,
              borderRadius: 1,
              mx: 0.5,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              },
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: "block",
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.65rem",
          }}
        >
          Patient Workflows
        </Typography>
        {[
          {
            icon: <PersonIcon sx={{ fontSize: 18 }} />,
            label: "Patient Profile",
            path: "/patients/profile",
          },
          {
            icon: <ScienceIcon sx={{ fontSize: 18 }} />,
            label: "Lab Results",
            path: "/diagnostics/lab/results",
          },
          {
            icon: <HealthAndSafetyIcon sx={{ fontSize: 18 }} />,
            label: "IPD Bed Board",
            path: "/ipd/beds",
          },
          {
            icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />,
            label: "IPD Rounds",
            path: "/ipd/rounds",
          },
          {
            icon: <BugReportIcon sx={{ fontSize: 18 }} />,
            label: "Microbiology",
            path: "/ipd/orders-tests/lab",
          },
        ].map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              if (menuMrn) {
                router.push(`${item.path}?mrn=${menuMrn}`);
              }
              handleMenuClose();
            }}
            disabled={!canNavigate(item.path)}
          >
            {item.icon}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
