import type { LabResultRow } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_RESULTS: LabResultRow[] = [
  { id: 'R-001', sampleId: 'S-2025-0001', test: 'CBC', analyte: 'WBC', result: '9.2', unit: '10³/µL', refLow: '4.5', refHigh: '11.0', flag: 'NORMAL', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:00', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-002', sampleId: 'S-2025-0001', test: 'CBC', analyte: 'Hemoglobin', result: '10.1', unit: 'g/dL', refLow: '13.5', refHigh: '17.5', flag: 'LOW', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:02', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-003', sampleId: 'S-2025-0001', test: 'LFT', analyte: 'ALT', result: '52', unit: 'U/L', refLow: '0', refHigh: '40', flag: 'HIGH', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:10', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-004', sampleId: 'S-2025-0002', test: 'UA', analyte: 'Glucose', result: 'Negative', unit: '', refLow: '', refHigh: '', flag: 'NORMAL', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2025-02-11 12:00', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-005', sampleId: 'S-2025-0002', test: 'UA', analyte: 'Protein', result: 'Trace', unit: '', refLow: '', refHigh: '', flag: 'HIGH', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2025-02-11 12:02', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-006', sampleId: 'S-2025-0003', test: 'TFT', analyte: 'TSH', result: '6.8', unit: 'mIU/L', refLow: '0.4', refHigh: '4.0', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2025-02-12 15:00', verifiedBy: null },
  { id: 'R-007', sampleId: 'S-2025-0003', test: 'LP', analyte: 'Total Cholesterol', result: '210', unit: 'mg/dL', refLow: '0', refHigh: '200', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2025-02-12 15:10', verifiedBy: null },
  { id: 'R-008', sampleId: 'S-2025-0008', test: 'HBA1C', analyte: 'HbA1c', result: '7.2', unit: '%', refLow: '0', refHigh: '5.7', flag: 'HIGH', status: 'pending', analyst: 'Dr. P. Rao', enteredAt: '2025-02-17 11:00', verifiedBy: null },
  { id: 'R-009', sampleId: 'S-2025-0008', test: 'GLU', analyte: 'Fasting Glucose', result: '98', unit: 'mg/dL', refLow: '70', refHigh: '100', flag: 'NORMAL', status: 'pending', analyst: 'Dr. P. Rao', enteredAt: '2025-02-17 11:05', verifiedBy: null },
];
