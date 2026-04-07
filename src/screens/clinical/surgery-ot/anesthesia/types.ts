export type ViewMode = 'select' | 'workspace';
export type WorkspaceTab = 'overview' | 'drugs' | 'flowsheet' | 'handoff';
export type WorklistFilter = 'all' | 'in-or' | 'pre-op' | 'pacu' | 'scheduled';
export type CaseStatus = 'In OR' | 'Pre-Op' | 'PACU' | 'Scheduled' | 'Completed';
export type StatusTone = 'active' | 'warning' | 'critical' | 'info' | 'pending' | 'completed' | 'neutral';
export type WaveformMode = 'ecg' | 'spo2' | 'etco2' | 'resp';

export interface EventEntry {
  time: string;
  text: string;
  tone: StatusTone;
}

export interface DrugEntry {
  name: string;
  route: string;
  rate: string;
  status: string;
  tone: StatusTone;
  time: string;
}

export interface ChecklistEntry {
  step: string;
  done: boolean;
  owner: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface WorklistCase {
  id: string;
  room: string;
  scheduledAt: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  procedure: string;
  diagnosis: string;
  surgeon: string;
  anesthetist: string;
  asaClass: string;
  status: CaseStatus;
  duration: string;
  fluidsInMl: string;
  bloodLossMl: string;
  allergyTags: string[];
  vitals: {
    hr: string;
    bp: string;
    spo2: string;
    etco2: string;
    temp: string;
    bis: string;
  };
  ventilation: {
    o2Flow: string;
    fio2: string;
    tidalVolume: string;
    rr: string;
    peep: string;
    pip: string;
  };
  checklist: ChecklistEntry[];
  events: EventEntry[];
  drugs: DrugEntry[];
  flowsheetTimes: string[];
  flowsheetRows: Array<{ label: string; values: string[] }>;
  team: TeamMember[];
  notes: string;
}
