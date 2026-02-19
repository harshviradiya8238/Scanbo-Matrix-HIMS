export type IpdFlowStepId =
  | 'dashboard'
  | 'beds'
  | 'clinical-care'
  | 'orders-tests'
  | 'charge-drug'
  | 'discharge';

export interface IpdFlowStep {
  id: IpdFlowStepId;
  label: string;
  description: string;
  route: string;
}

export const IPD_FLOW_STEPS: IpdFlowStep[] = [
  {
    id: 'dashboard',
    label: 'IPD Dashboard',
    description: 'Monitor census, occupancy, alerts, and operational tasks.',
    route: '/ipd/dashboard',
  },
  {
    id: 'beds',
    label: 'Bed & Census',
    description: 'Allocate beds, manage transfers, and track inpatient census.',
    route: '/ipd/beds',
  },
  {
    id: 'clinical-care',
    label: 'Clinical Care',
    description: 'Doctor rounds, nursing care, vitals, orders, and medication schedule.',
    route: '/ipd/rounds',
  },
  {
    id: 'orders-tests',
    label: 'Orders & Tests',
    description: 'Manage IPD orders, labs, radiology workflow, and linked diagnostics in one place.',
    route: '/ipd/orders-tests/orders',
  },
  {
    id: 'charge-drug',
    label: 'Charge / Drug',
    description: 'Charge capture, DRG review, and pharmacy clearance before discharge.',
    route: '/ipd/charges',
  },
  {
    id: 'discharge',
    label: 'Discharge & Clearance',
    description: 'Finalize checklist, billing clearance, and discharge summary.',
    route: '/ipd/discharge',
  },
];

export function getIpdFlowStepIndex(stepId: IpdFlowStepId): number {
  const index = IPD_FLOW_STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : 0;
}
