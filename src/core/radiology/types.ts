export type ImagingPriority = 'STAT' | 'Urgent' | 'Routine';
export type ValidationState = 'Ready' | 'Needs Authorization' | 'Needs Clinical Review' | 'Hold';
export type WorklistState = 'Queued' | 'In Progress' | 'Tech QA' | 'Sent to PACS';
export type ReportState = 'Unread' | 'Drafting' | 'Need Addendum' | 'Final Signed';
export type TransmitState = 'Ready to Send' | 'Sent' | 'Retry';
export type RiskLevel = 'Low' | 'Review';

export interface ImagingOrder {
  id: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  modality: string;
  study: string;
  priority: ImagingPriority;
  validationState: ValidationState;
  authorization: string;
  clinicalCheck: string;
  scheduledSlot: string;
}

export interface ModalityCase {
  id: string;
  patientName: string;
  mrn: string;
  modality: string;
  study: string;
  priority: ImagingPriority;
  protocol: string;
  room: string;
  prepStatus: string;
  state: WorklistState;
  transmitState: TransmitState;
}

export interface ReadingCase {
  id: string;
  patientName: string;
  mrn: string;
  subspecialty: string;
  modality: string;
  study: string;
  priority: ImagingPriority;
  turnaround: string;
  hasPrior: boolean;
  state: ReportState;
  contrastSafety?: {
    creatinine: string;
    egfr: string;
    risk: RiskLevel;
  };
}

export interface RadiologyState {
  orders: ImagingOrder[];
  worklist: ModalityCase[];
  reading: ReadingCase[];
  reportTemplates: string[];
}
