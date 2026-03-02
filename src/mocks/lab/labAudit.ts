import type { LabAuditLogEntry } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_AUDIT: LabAuditLogEntry[] = [
  { ts: '2025-02-17 16:30', event: 'Sample S-2025-0008 results entered', user: 'Dr. P. Rao', sampleId: 'S-2025-0008' },
  { ts: '2025-02-17 16:28', event: 'Sample S-2025-0008 assigned to worksheet WS-002', user: 'Dr. P. Rao', sampleId: 'S-2025-0008' },
  { ts: '2025-02-12 15:15', event: 'Sample S-2025-0003 results entered', user: 'Dr. A. Singh', sampleId: 'S-2025-0003' },
  { ts: '2025-02-11 12:05', event: 'Sample S-2025-0002 verified and published', user: 'Dr. Supervisor', sampleId: 'S-2025-0002' },
  { ts: '2025-02-10 14:30', event: 'Sample S-2025-0001 verified', user: 'Dr. Supervisor', sampleId: 'S-2025-0001' },
];
