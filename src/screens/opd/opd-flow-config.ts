/*
OPD FLOW:
1. Appointment created
2. Patient arrives -> encounter created
3. Doctor starts visit
4. Orders and prescriptions added
5. Visit completed
*/

export type OpdFlowStepId =
  | 'calendar'
  | 'queue'
  | 'visit'
  | 'orders'
  | 'prescriptions';

export interface OpdFlowStep {
  id: OpdFlowStepId;
  label: string;
  description: string;
  route: string;
}

export const OPD_FLOW_STEPS: OpdFlowStep[] = [
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Book slots and confirm arrivals.',
    route: '/appointments/calendar',
  },
  {
    id: 'queue',
    label: 'Queue',
    description: 'Check-in and triage waiting patients.',
    route: '/appointments/queue',
  },
  {
    id: 'visit',
    label: 'Visit',
    description: 'Run OPD encounter and SOAP documentation.',
    route: '/appointments/visit',
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Place labs, imaging, and procedures.',
    route: '/clinical/orders',
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    description: 'Issue eRx and counseling instructions.',
    route: '/clinical/prescriptions',
  },
];

export function getOpdFlowStepIndex(stepId: OpdFlowStepId): number {
  const index = OPD_FLOW_STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : 0;
}
