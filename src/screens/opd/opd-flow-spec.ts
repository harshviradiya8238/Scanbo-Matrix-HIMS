import { OpdFlowStepId } from './opd-flow-config';

export type OutpatientStateId =
  | 'patient_contact'
  | 'appointment_created'
  | 'visit_created'
  | 'doctor_consultation'
  | 'billing_pending'
  | 'order_processing'
  | 'results_review'
  | 'visit_closed';

export interface OutpatientState {
  id: OutpatientStateId;
  name: string;
  description: string;
  next?: OutpatientStateId;
}

export const OUTPATIENT_STATES: Record<OutpatientStateId, OutpatientState> = {
  patient_contact: {
    id: 'patient_contact',
    name: 'Patient Contact',
    description: 'Patient initiates interaction with the hospital.',
    next: 'appointment_created',
  },
  appointment_created: {
    id: 'appointment_created',
    name: 'Appointment Created',
    description: 'Appointment created with minimal patient details.',
    next: 'visit_created',
  },
  visit_created: {
    id: 'visit_created',
    name: 'Visit Created',
    description: 'Patient is physically present; visit is active.',
    next: 'doctor_consultation',
  },
  doctor_consultation: {
    id: 'doctor_consultation',
    name: 'Doctor Consultation',
    description: 'Doctor evaluates patient and creates clinical orders.',
    next: 'billing_pending',
  },
  billing_pending: {
    id: 'billing_pending',
    name: 'Billing Pending',
    description: 'Lab and imaging orders await payment.',
    next: 'order_processing',
  },
  order_processing: {
    id: 'order_processing',
    name: 'Order Processing',
    description: 'Labs and imaging are performed.',
    next: 'results_review',
  },
  results_review: {
    id: 'results_review',
    name: 'Results Review',
    description: 'Doctor reviews lab and imaging results.',
    next: 'visit_closed',
  },
  visit_closed: {
    id: 'visit_closed',
    name: 'Visit Closed',
    description: 'Patient collects reports and exits hospital.',
  },
};

const STEP_TO_STATE: Record<OpdFlowStepId, OutpatientStateId> = {
  calendar: 'appointment_created',
  queue: 'visit_created',
  visit: 'doctor_consultation',
  orders: 'billing_pending',
  prescriptions: 'visit_closed',
};

export const getOutpatientStateForStep = (stepId: OpdFlowStepId) =>
  OUTPATIENT_STATES[STEP_TO_STATE[stepId]];

export const getOutpatientNextState = (state: OutpatientState) =>
  state.next ? OUTPATIENT_STATES[state.next] : undefined;
