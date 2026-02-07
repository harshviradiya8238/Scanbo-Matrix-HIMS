export type IpdFlowStepId = 'admissions' | 'beds' | 'rounds' | 'discharge';

export interface IpdFlowStep {
  id: IpdFlowStepId;
  label: string;
  description: string;
  route: string;
}

export const IPD_FLOW_STEPS: IpdFlowStep[] = [
  {
    id: 'admissions',
    label: 'Admissions',
    description: 'Capture inpatient intake and admission order.',
    route: '/ipd/admissions',
  },
  {
    id: 'beds',
    label: 'Bed / Ward',
    description: 'Allocate, transfer, and track bed utilization.',
    route: '/ipd/beds',
  },
  {
    id: 'rounds',
    label: 'Rounds',
    description: 'Document daily rounds, orders, and progress notes.',
    route: '/ipd/rounds',
  },
  {
    id: 'discharge',
    label: 'Discharge',
    description: 'Finalize discharge checklist and summary.',
    route: '/ipd/discharge',
  },
];

export function getIpdFlowStepIndex(stepId: IpdFlowStepId): number {
  const index = IPD_FLOW_STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : 0;
}
