export type CaseStatus = "Active" | "Monitoring" | "Closed";
export type IcStatus = "Detected" | "Isolating" | "Notified" | "In Audit" | "Closed";
export type IpdStatus = "Watch" | "Critical" | "Stable";
export type IsolationType = "Contact" | "Droplet" | "Airborne";
export type IsolationStatus = "Active" | "Review" | "Cleared" | "Pending";
export type AlertSeverity = "High" | "Medium" | "Low";
export type ActionStatus = "Open" | "In Progress" | "Done";

export interface IsolationRoom {
  id: string;
  room: string;
  unit: string;
  type: "Contact" | "Droplet" | "Airborne";
  status: IsolationStatus;
  startedAt: string;
  patientName?: string;
  mrn?: string;
}

export interface AuditRecord {
  id: string;
  ward: string;
  compliance: number;
  lead: string;
  lastAudit: string;
}

export interface AlertItem {
  id: string;
  title: string;
  details: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

export interface ActionItem {
  id: string;
  label: string;
  owner: string;
  due: string;
  status: ActionStatus;
  priority: "Urgent" | "Routine";
}

export interface CaseTimelineItem {
  id: string;
  label: string;
  time: string;
  status: "Done" | "Pending";
}

export interface UnitRiskItem {
  id: string;
  unit: string;
  risk: "High" | "Moderate" | "Low";
  activeCases: number;
  trend: "Up" | "Flat" | "Down";
}

export interface LabTriggerItem {
  id: string;
  test: string;
  patient: string;
  organism: string;
  collected: string;
  status: "New" | "Reviewed";
}

export interface LabFeedItem {
  id: string;
  title: string;
  patient: string;
  bed?: string;
  status: "pending" | "auto-flagged" | "no-pathogen" | "pending-cultures";
}

export interface DetectionSource {
  id: string;
  label: string;
  count: number;
  color: string;
}

export const FLOW_TAB_IDS = ["detect", "isolate", "notify", "audit", "close"] as const;
export const IC_STATUS_BY_TAB: Record<(typeof FLOW_TAB_IDS)[number], IcStatus> = {
  detect: "Detected",
  isolate: "Isolating",
  notify: "Notified",
  audit: "In Audit",
  close: "Closed",
};

export type RoomMapStatus = "occupied" | "free" | "cleaning" | "maintenance";

export interface RoomMapItem {
  id: string;
  label: string;
  status: RoomMapStatus;
}

export interface AvailableIsolationRoom {
  id: string;
  room: string;
  unit: string;
  type: "Contact" | "Droplet" | "Airborne" | "Standard";
  status: string;
}

export interface PpeChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  role: string;
}

export type NotificationType = "critical" | "exposure" | "acknowledged" | "lab-ready";

export interface NotificationFeedItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionLabel?: string;
  timestamp: string;
}

export interface SendToItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface AuditRecordRow {
  id: string;
  auditId: string;
  casePatient: string;
  caseDetail: string;
  type: string;
  score: number;
  status: "in_progress" | "completed";
}

export interface AuditChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  badge?: string;
}

export interface ComplianceScoreItem {
  id: string;
  label: string;
  score: number;
  color: string;
}

export interface ReadyToClosePatient {
  id: string;
  mrn: string;
  patientName: string;
  patientDetail: string;
  pathogen: string;
  days: string;
  auditScore: number;
  criteria: "resolved";
}

export interface ClosureCriterion {
  id: string;
  label: string;
  met: boolean;
}

export interface CaseTimelineEvent {
  id: string;
  title: string;
  date: string;
  source: string;
  description: string;
  iconColor: string;
}

export type CaseDetailIcon = "detect" | "isolate" | "notify" | "audit";

export interface CaseDetailEvent {
  id: string;
  title: string;
  date: string;
  source: string;
  description: string;
  icon: CaseDetailIcon;
}
