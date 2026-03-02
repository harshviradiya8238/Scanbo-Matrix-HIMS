/** Lab (LIMS) module types – full functionality aligned with lims-full reference */

export type SampleStatus =
  | 'registered'
  | 'received'
  | 'assigned'
  | 'analysed'
  | 'verified'
  | 'published';

export type WorksheetStatus = 'open' | 'to_be_verified' | 'verified' | 'closed';

export type InstrumentStatus = 'online' | 'maintenance' | 'offline';

export type InventoryItemStatus = 'ok' | 'low' | 'out';

export type ResultFlag = 'NORMAL' | 'HIGH' | 'LOW';

export type ResultStatus = 'pending' | 'verified';

export interface LabSample {
  id: string;
  type: string;
  client: string;
  patient: string;
  dob?: string;
  gender?: string;
  phone?: string;
  date: string;
  received?: string;
  priority: 'STAT' | 'URGENT' | 'ROUTINE' | 'NORMAL';
  status: SampleStatus;
  tests: string[];
  analyst: string | null;
  worksheetId: string | null;
  notes?: string;
  barcode?: string;
}

export interface LabWorksheet {
  id: string;
  template: string;
  dept: string;
  analyst: string;
  samples: string[];
  status: WorksheetStatus;
  created: string;
  notes?: string;
}

export interface LabClient {
  id: string;
  name: string;
  type?: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  active: boolean;
  credit?: boolean;
  discount?: number;
  notes?: string;
}

export interface LabTestCatalogItem {
  code: string;
  name: string;
  dept: string;
  method: string;
  tat: string;
  price: number;
  analytes: string[];
}

export interface LabResultRow {
  id: string;
  sampleId: string;
  test: string;
  analyte: string;
  result: string;
  unit: string;
  refLow: string;
  refHigh: string;
  flag: ResultFlag;
  status: ResultStatus;
  analyst: string;
  enteredAt?: string;
  verifiedBy?: string | null;
}

export interface LabInstrument {
  id: string;
  name: string;
  type: string;
  dept: string;
  status: InstrumentStatus;
  lastCalib: string;
  nextCalib: string;
}

export interface LabInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  reorderLevel: number;
  expiry?: string;
  location?: string;
  vendor?: string;
}

export interface LabQCRecord {
  date: string;
  mat: string;
  test: string;
  level: string;
  mean: number;
  sd: number;
  result: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface LabAuditLogEntry {
  ts: string;
  event: string;
  user: string;
  sampleId?: string;
}

export interface LabSettings {
  labName: string;
  labId: string;
  director: string;
  accreditation: string;
  city: string;
  phone: string;
  email?: string;
  footer?: string;
}

export const ANALYSTS = ['Dr. M. Kumar', 'Dr. S. Ali', 'Dr. A. Singh', 'Dr. P. Rao', 'Dr. L. Bose'];

export const WORKFLOW_STEPS: SampleStatus[] = ['registered', 'received', 'assigned', 'analysed', 'verified', 'published'];
