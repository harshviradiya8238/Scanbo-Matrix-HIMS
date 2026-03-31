import type { LabResultRow } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_RESULTS: LabResultRow[] = [
  // ── OPD / Walk-in Results ─────────────────────────────────────────────────
  { id: 'R-001', sampleId: 'S-2025-0001', test: 'CBC', analyte: 'WBC', result: '9.2', unit: '10³/µL', refLow: '4.5', refHigh: '11.0', flag: 'NORMAL', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:00', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-002', sampleId: 'S-2025-0001', test: 'CBC', analyte: 'Hemoglobin', result: '10.1', unit: 'g/dL', refLow: '13.5', refHigh: '17.5', flag: 'LOW', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:02', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-003', sampleId: 'S-2025-0001', test: 'LFT', analyte: 'ALT', result: '52', unit: 'U/L', refLow: '0', refHigh: '40', flag: 'HIGH', status: 'verified', analyst: 'Dr. M. Kumar', enteredAt: '2025-02-10 14:10', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-004', sampleId: 'S-2025-0002', test: 'UA', analyte: 'Glucose', result: 'Negative', unit: '', refLow: '', refHigh: '', flag: 'NORMAL', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2025-02-11 12:00', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-005', sampleId: 'S-2025-0002', test: 'UA', analyte: 'Protein', result: 'Trace', unit: '', refLow: '', refHigh: '', flag: 'HIGH', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2025-02-11 12:02', verifiedBy: 'Dr. Supervisor' },
  { id: 'R-006', sampleId: 'S-2025-0003', test: 'TFT', analyte: 'TSH', result: '6.8', unit: 'mIU/L', refLow: '0.4', refHigh: '4.0', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2025-02-12 15:00', verifiedBy: null },
  { id: 'R-007', sampleId: 'S-2025-0003', test: 'LP', analyte: 'Total Cholesterol', result: '210', unit: 'mg/dL', refLow: '0', refHigh: '200', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2025-02-12 15:10', verifiedBy: null },
  { id: 'R-008', sampleId: 'S-2025-0008', test: 'HBA1C', analyte: 'HbA1c', result: '7.2', unit: '%', refLow: '0', refHigh: '5.7', flag: 'HIGH', status: 'pending', analyst: 'Dr. P. Rao', enteredAt: '2025-02-17 11:00', verifiedBy: null },
  { id: 'R-009', sampleId: 'S-2025-0008', test: 'GLU', analyte: 'Fasting Glucose', result: '98', unit: 'mg/dL', refLow: '70', refHigh: '100', flag: 'NORMAL', status: 'pending', analyst: 'Dr. P. Rao', enteredAt: '2025-02-17 11:05', verifiedBy: null },

  // ── IPD Order Results — S-IPD-2026-003 (Rahul Menon, Pneumonia, ASSIGNED) ─
  { id: 'R-IPD-001', sampleId: 'S-IPD-2026-003', test: 'CRP', analyte: 'C-Reactive Protein', result: '84.3', unit: 'mg/L', refLow: '0', refHigh: '5', flag: 'HIGH', status: 'pending', analyst: 'Dr. M. Kumar', enteredAt: '2026-03-31 10:30', verifiedBy: null },
  { id: 'R-IPD-002', sampleId: 'S-IPD-2026-003', test: 'PCT', analyte: 'Procalcitonin', result: '2.1', unit: 'ng/mL', refLow: '0', refHigh: '0.5', flag: 'HIGH', status: 'pending', analyst: 'Dr. M. Kumar', enteredAt: '2026-03-31 10:35', verifiedBy: null },
  { id: 'R-IPD-003', sampleId: 'S-IPD-2026-003', test: 'LFT', analyte: 'ALT', result: '38', unit: 'U/L', refLow: '0', refHigh: '40', flag: 'NORMAL', status: 'pending', analyst: 'Dr. M. Kumar', enteredAt: '2026-03-31 10:40', verifiedBy: null },

  // ── IPD Order Results — S-IPD-2026-004 (Sneha Patil, Post-op, ANALYSED) ──
  { id: 'R-IPD-004', sampleId: 'S-IPD-2026-004', test: 'CBC', analyte: 'WBC', result: '11.8', unit: '10³/µL', refLow: '4.5', refHigh: '11.0', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2026-03-31 11:00', verifiedBy: null },
  { id: 'R-IPD-005', sampleId: 'S-IPD-2026-004', test: 'CBC', analyte: 'Hemoglobin', result: '11.2', unit: 'g/dL', refLow: '12.0', refHigh: '16.0', flag: 'LOW', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2026-03-31 11:02', verifiedBy: null },
  { id: 'R-IPD-006', sampleId: 'S-IPD-2026-004', test: 'CRP', analyte: 'C-Reactive Protein', result: '28.5', unit: 'mg/L', refLow: '0', refHigh: '5', flag: 'HIGH', status: 'pending', analyst: 'Dr. A. Singh', enteredAt: '2026-03-31 11:05', verifiedBy: null },

  // ── IPD Order Results — S-IPD-2026-005 (Tanvi Kapoor, VERIFIED) ──────────
  { id: 'R-IPD-007', sampleId: 'S-IPD-2026-005', test: 'UA', analyte: 'Glucose', result: '3+', unit: '', refLow: '', refHigh: 'Negative', flag: 'HIGH', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2026-03-30 12:00', verifiedBy: 'Dr. M. Kumar' },
  { id: 'R-IPD-008', sampleId: 'S-IPD-2026-005', test: 'UA', analyte: 'Ketones', result: '2+', unit: '', refLow: '', refHigh: 'Negative', flag: 'HIGH', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2026-03-30 12:02', verifiedBy: 'Dr. M. Kumar' },
  { id: 'R-IPD-009', sampleId: 'S-IPD-2026-005', test: 'CS', analyte: 'Culture Result', result: 'No growth after 48h', unit: '', refLow: '', refHigh: '', flag: 'NORMAL', status: 'verified', analyst: 'Dr. S. Ali', enteredAt: '2026-03-30 48:00', verifiedBy: 'Dr. M. Kumar' },

  // ── IPD Order Results — S-IPD-2026-006 (Arvind Sharma, PUBLISHED) ────────
  { id: 'R-IPD-010', sampleId: 'S-IPD-2026-006', test: 'CBC', analyte: 'WBC', result: '12.4', unit: '10³/µL', refLow: '4.5', refHigh: '11.0', flag: 'HIGH', status: 'verified', analyst: 'Dr. P. Rao', enteredAt: '2026-03-29 19:00', verifiedBy: 'Dr. M. Kumar' },
  { id: 'R-IPD-011', sampleId: 'S-IPD-2026-006', test: 'CBC', analyte: 'Hemoglobin', result: '13.8', unit: 'g/dL', refLow: '13.5', refHigh: '17.5', flag: 'NORMAL', status: 'verified', analyst: 'Dr. P. Rao', enteredAt: '2026-03-29 19:02', verifiedBy: 'Dr. M. Kumar' },
  { id: 'R-IPD-012', sampleId: 'S-IPD-2026-006', test: 'CMP', analyte: 'Sodium', result: '138', unit: 'mEq/L', refLow: '136', refHigh: '145', flag: 'NORMAL', status: 'verified', analyst: 'Dr. P. Rao', enteredAt: '2026-03-29 19:05', verifiedBy: 'Dr. M. Kumar' },
  { id: 'R-IPD-013', sampleId: 'S-IPD-2026-006', test: 'CMP', analyte: 'Potassium', result: '3.3', unit: 'mEq/L', refLow: '3.5', refHigh: '5.0', flag: 'LOW', status: 'verified', analyst: 'Dr. P. Rao', enteredAt: '2026-03-29 19:06', verifiedBy: 'Dr. M. Kumar' },
];
