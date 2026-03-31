import { LabPartition } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_PARTITIONS: LabPartition[] = [
  {
    id: 'LAB-5021-P1',
    parentId: 'LAB-2025-5021',
    patient: 'Priya Mehta',
    volume: '3 mL',
    container: 'EDTA (Purple)',
    analyses: ['CBC', 'WBC Diff'],
    department: 'Haematology',
    status: 'In Analysis',
  },
  {
    id: 'LAB-5021-P2',
    parentId: 'LAB-2025-5021',
    patient: 'Priya Mehta',
    volume: '2 mL',
    container: 'SST (Yellow)',
    analyses: ['Na', 'K', 'Cl', 'HCO3'],
    department: 'Biochemistry',
    status: 'Received',
  },
  {
    id: 'LAB-5018-P1',
    parentId: 'LAB-2025-5018',
    patient: 'Ramesh Gupta',
    volume: '2 mL',
    container: 'EDTA (Purple)',
    analyses: ['HbA1c'],
    department: 'Biochemistry',
    status: 'To be Verified',
  },
  {
    id: 'LAB-5018-P2',
    parentId: 'LAB-2025-5018',
    patient: 'Ramesh Gupta',
    volume: '2 mL',
    container: 'SST (Yellow)',
    analyses: ['Lipid Profile'],
    department: 'Biochemistry',
    status: 'To be Verified',
  },
];
