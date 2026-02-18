import { UserRole } from '@/src/core/navigation/types';

interface OpdRoleCapabilities {
  canManageCalendar: boolean;
  canCheckInPatient: boolean;
  canStartConsult: boolean;
  canViewClinicalHistory: boolean;
  canDocumentConsultation: boolean;
  canPlaceOrders: boolean;
  canPrescribe: boolean;
  canCompleteVisit: boolean;
  canTransferToIpd: boolean;
}

export interface OpdRoleFlowProfile {
  role: UserRole;
  label: string;
  landingRoute: string;
  stage: string;
  allowedActions: string[];
  capabilities: OpdRoleCapabilities;
}

const FRONT_DESK_PROFILE: OpdRoleFlowProfile = {
  role: 'RECEPTION',
  label: 'Front Desk',
  landingRoute: '/appointments/calendar',
  stage: 'Appointment and check-in desk',
  allowedActions: [
    'Create appointment slots',
    'Reschedule bookings',
    'Create + Check-In to queue',
    'Track waiting queue',
  ],
  capabilities: {
    canManageCalendar: true,
    canCheckInPatient: true,
    canStartConsult: false,
    canViewClinicalHistory: false,
    canDocumentConsultation: false,
    canPlaceOrders: false,
    canPrescribe: false,
    canCompleteVisit: false,
    canTransferToIpd: false,
  },
};

const DOCTOR_PROFILE: OpdRoleFlowProfile = {
  role: 'DOCTOR',
  label: 'Doctor',
  landingRoute: '/appointments/queue',
  stage: 'Consultation and clinical execution',
  allowedActions: [
    'Open patient from queue',
    'Start and complete consultation',
    'Capture notes and vitals',
    'Place orders and prescriptions',
  ],
  capabilities: {
    canManageCalendar: false,
    canCheckInPatient: false,
    canStartConsult: true,
    canViewClinicalHistory: true,
    canDocumentConsultation: true,
    canPlaceOrders: true,
    canPrescribe: true,
    canCompleteVisit: true,
    canTransferToIpd: true,
  },
};

const HOSPITAL_ADMIN_PROFILE: OpdRoleFlowProfile = {
  role: 'HOSPITAL_ADMIN',
  label: 'Hospital Admin',
  landingRoute: '/appointments/queue',
  stage: 'End-to-end OPD supervision',
  allowedActions: [
    'Perform Front Desk actions',
    'Perform Doctor actions',
    'Monitor throughput and bottlenecks',
    'Intervene in any OPD step',
  ],
  capabilities: {
    canManageCalendar: true,
    canCheckInPatient: true,
    canStartConsult: true,
    canViewClinicalHistory: true,
    canDocumentConsultation: true,
    canPlaceOrders: true,
    canPrescribe: true,
    canCompleteVisit: true,
    canTransferToIpd: true,
  },
};

const SUPER_ADMIN_PROFILE: OpdRoleFlowProfile = {
  ...HOSPITAL_ADMIN_PROFILE,
  role: 'SUPER_ADMIN',
  label: 'Super Admin',
};

const DEFAULT_PROFILE: OpdRoleFlowProfile = {
  role: 'AUDITOR',
  label: 'Read-only',
  landingRoute: '/appointments/queue',
  stage: 'Observation only',
  allowedActions: ['View queue and OPD status'],
  capabilities: {
    canManageCalendar: false,
    canCheckInPatient: false,
    canStartConsult: false,
    canViewClinicalHistory: false,
    canDocumentConsultation: false,
    canPlaceOrders: false,
    canPrescribe: false,
    canCompleteVisit: false,
    canTransferToIpd: false,
  },
};

const OPD_ROLE_PROFILES: Record<string, OpdRoleFlowProfile> = {
  RECEPTION: FRONT_DESK_PROFILE,
  DOCTOR: DOCTOR_PROFILE,
  HOSPITAL_ADMIN: HOSPITAL_ADMIN_PROFILE,
  SUPER_ADMIN: SUPER_ADMIN_PROFILE,
};

export const OPD_LOGIN_ROLES: UserRole[] = ['RECEPTION', 'HOSPITAL_ADMIN', 'DOCTOR'];

export function getOpdRoleFlowProfile(role: UserRole): OpdRoleFlowProfile {
  return OPD_ROLE_PROFILES[role] ?? DEFAULT_PROFILE;
}
