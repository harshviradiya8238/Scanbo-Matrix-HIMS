export type LabPriority = 'STAT' | 'Urgent' | 'Routine';
export type LabOrderStatus = 'Pending Collection' | 'Collected' | 'In Lab' | 'Resulted';
export type SampleStatus = 'Pending' | 'Collected' | 'In Transit' | 'Received' | 'Rejected';
export type ResultFlag = 'Normal' | 'Abnormal' | 'Critical';
export type ResultState = 'Pending Review' | 'Verified' | 'Released';

export interface LabOrder {
  id: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  testPanel: string;
  specimenType: string;
  priority: LabPriority;
  status: LabOrderStatus;
  requestedAt: string;
  collectionWindow: string;
  orderingPhysician: string;
  department: string;
}

export interface LabSample {
  id: string;
  patientName: string;
  mrn: string;
  testPanel: string;
  specimenType: string;
  container: string;
  collectionSite: string;
  collectedBy: string;
  collectionTime: string;
  accessionNumber: string;
  status: SampleStatus;
  transport: string;
}

export interface LabResult {
  id: string;
  patientName: string;
  mrn: string;
  testName: string;
  specimenType: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  flag: ResultFlag;
  state: ResultState;
  reportedAt: string;
  verifiedBy: string;
}

export interface LaboratoryState {
  orders: LabOrder[];
  samples: LabSample[];
  results: LabResult[];
  resultTemplates: string[];
}
