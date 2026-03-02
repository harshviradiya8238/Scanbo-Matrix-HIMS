import type { LabWorksheet } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_WORKSHEETS: LabWorksheet[] = [
  { id: 'WS-001', template: 'Biochemistry Panel', dept: 'Biochemistry', analyst: 'Dr. M. Kumar', samples: ['S-2025-0001', 'S-2025-0003'], status: 'open', created: '2025-02-10', notes: '' },
  { id: 'WS-002', template: 'Hematology + UA', dept: 'Hematology', analyst: 'Dr. S. Ali', samples: ['S-2025-0002', 'S-2025-0008'], status: 'to_be_verified', created: '2025-02-11', notes: '' },
  { id: 'WS-003', template: 'Microbiology', dept: 'Microbiology', analyst: 'Dr. P. Rao', samples: ['S-2025-0004'], status: 'verified', created: '2025-02-13', notes: '' },
  { id: 'WS-004', template: 'Neurology Panel', dept: 'Biochemistry', analyst: 'Dr. M. Kumar', samples: ['S-2025-0006'], status: 'open', created: '2025-02-15', notes: '' },
];
