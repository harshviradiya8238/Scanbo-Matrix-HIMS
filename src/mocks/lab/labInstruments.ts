import type { LabInstrument } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_INSTRUMENTS: LabInstrument[] = [
  { id: 'INST-001', name: 'Sysmex XN-1000', type: 'Hematology Analyzer', dept: 'Hematology', status: 'online', lastCalib: '2025-02-15', nextCalib: '2025-03-15' },
  { id: 'INST-002', name: 'Cobas c311', type: 'Biochemistry Analyzer', dept: 'Biochemistry', status: 'online', lastCalib: '2025-02-10', nextCalib: '2025-03-10' },
  { id: 'INST-003', name: 'VITROS 5600', type: 'Immunoassay', dept: 'Immunology', status: 'maintenance', lastCalib: '2025-01-20', nextCalib: '2025-02-20' },
  { id: 'INST-004', name: 'BD BACTEC 9050', type: 'Blood Culture', dept: 'Microbiology', status: 'online', lastCalib: '2025-02-01', nextCalib: '2025-03-01' },
];
