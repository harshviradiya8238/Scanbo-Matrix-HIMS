import type { LabQCRecord } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_QC: LabQCRecord[] = [
  { date: '2025-02-18', mat: 'Bio-Rad Lyphochek', test: 'Glucose', level: 'L1', mean: 95, sd: 3.2, result: 93.5, status: 'pass' },
  { date: '2025-02-18', mat: 'Bio-Rad Lyphochek', test: 'Cholesterol', level: 'L2', mean: 240, sd: 8.1, result: 261.4, status: 'warn' },
  { date: '2025-02-17', mat: 'Seracheck', test: 'TSH', level: 'L1', mean: 2.0, sd: 0.2, result: 1.98, status: 'pass' },
  { date: '2025-02-17', mat: 'Seracheck', test: 'T4', level: 'L2', mean: 12.0, sd: 0.8, result: 14.1, status: 'warn' },
  { date: '2025-02-16', mat: 'Bio-Rad Lyphochek', test: 'ALT', level: 'L1', mean: 40, sd: 4.0, result: 54.3, status: 'fail' },
];
