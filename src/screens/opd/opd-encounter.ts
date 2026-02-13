import {
  AppointmentStatus,
  EncounterStatus,
  OpdEncounterCase,
} from './opd-mock-data';

export const ENCOUNTER_STATUS_LABEL: Record<EncounterStatus, string> = {
  BOOKED: 'Booked',
  ARRIVED: 'Arrived',
  IN_QUEUE: 'In Queue',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const LEGACY_STATUS_MAP: Record<string, EncounterStatus> = {
  Scheduled: 'BOOKED',
  'Checked-In': 'ARRIVED',
  'In Triage': 'IN_QUEUE',
  'In Consultation': 'IN_PROGRESS',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
  'No Show': 'CANCELLED',
  BOOKED: 'BOOKED',
  ARRIVED: 'ARRIVED',
  IN_QUEUE: 'IN_QUEUE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const ALLOWED_TRANSITIONS: Record<EncounterStatus, EncounterStatus[]> = {
  BOOKED: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_QUEUE', 'IN_PROGRESS', 'CANCELLED'],
  IN_QUEUE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const normalizeEncounterStatus = (status: string): EncounterStatus =>
  LEGACY_STATUS_MAP[status] ?? 'BOOKED';

export const canTransitionEncounterStatus = (
  current: EncounterStatus,
  next: EncounterStatus
) => {
  if (current === next) return true;
  return ALLOWED_TRANSITIONS[current].includes(next);
};

export const mapEncounterStatusToAppointmentStatus = (
  status: EncounterStatus
): AppointmentStatus => {
  switch (status) {
    case 'BOOKED':
      return 'Scheduled';
    case 'ARRIVED':
      return 'Checked-In';
    case 'IN_QUEUE':
      return 'In Triage';
    case 'IN_PROGRESS':
      return 'In Consultation';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Scheduled';
  }
};

export const isQueueEncounterStatus = (status: EncounterStatus) =>
  status === 'ARRIVED' || status === 'IN_QUEUE';

export const isActiveEncounterStatus = (status: EncounterStatus) =>
  status !== 'COMPLETED' && status !== 'CANCELLED';

export const buildEncounterRoute = (encounterId: string) => `/encounters/${encounterId}`;
export const buildEncounterOrdersRoute = (encounterId: string) =>
  `/encounters/${encounterId}/orders`;
export const buildEncounterPrescriptionsRoute = (encounterId: string) =>
  `/encounters/${encounterId}/prescriptions`;

interface ResolveEncounterArgs {
  encounterId?: string | null;
  mrn?: string | null;
}

export const resolveEncounterFromState = (
  encounters: OpdEncounterCase[],
  args: ResolveEncounterArgs
) => {
  const encounterId = args.encounterId?.trim();
  if (encounterId) {
    const exact = encounters.find((encounter) => encounter.id === encounterId);
    if (exact) return exact;
  }

  const mrn = args.mrn?.trim().toUpperCase();
  if (mrn) {
    const byMrn = encounters.find((encounter) => encounter.mrn.toUpperCase() === mrn);
    if (byMrn) return byMrn;
  }

  return (
    encounters.find((encounter) => encounter.status === 'IN_PROGRESS') ??
    encounters.find((encounter) => encounter.status === 'IN_QUEUE') ??
    encounters.find((encounter) => encounter.status === 'ARRIVED') ??
    encounters[0]
  );
};

