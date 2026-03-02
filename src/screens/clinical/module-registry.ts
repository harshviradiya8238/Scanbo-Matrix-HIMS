export type ModuleStatus = 'Implemented' | 'In Progress' | 'Planned';

export type ModuleCategory =
  | 'Clinical'
  | 'Emergency'
  | 'Surgery'
  | 'Radiology'
  | 'Laboratory'
  | 'Pharmacy'
  | 'Patient Access'
  | 'Revenue Cycle'
  | 'Patient Portal'
  | 'Interoperability'
  | 'Population Health'
  | 'Oncology'
  | 'Cardiology'
  | 'Clinical Core'
  | 'Scheduling'
  | 'Obstetrics';

export interface ClinicalModuleDefinition {
  id: string;
  slug: string;
  category: ModuleCategory;
  name: string;
  area: string;
  description: string;
  audience: string[];
  appRoute: string;
  status: ModuleStatus;
  videoUrl?: string;
  referenceUrl?: string;
  requiredPermissions?: string[];
}

const CORE_ACTIONS = ['create', 'read', 'write'] as const;

const buildPermissions = (
  group: string,
  subject: string,
  actions: readonly string[] = CORE_ACTIONS
) => actions.map((action) => `${group}.${subject}.${action}`);

export const CLINICAL_MODULES: ClinicalModuleDefinition[] = [
  {
    id: 'ambulatory-care-opd',
    slug: 'ambulatory-care-opd',
    category: 'Clinical',
    name: 'EpicCare Ambulatory (OPD)',
    area: 'OPD / Clinics',
    description:
      'Used by doctors and clinical staff in OPD/clinics to document visits, write notes, place orders, review results, and manage patient problems.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/ambulatory-care-opd',
    status: 'Implemented',
    requiredPermissions: buildPermissions('clinical', 'ambulatory'),
    videoUrl: 'https://www.youtube.com/watch?v=n8mRZhtK2YU',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'inpatient-documentation-clindoc',
    slug: 'inpatient-documentation-clindoc',
    category: 'Clinical',
    name: 'EpicCare Inpatient / ClinDoc',
    area: 'IPD / Wards',
    description:
      'Used in IPD/wards for inpatient documentation including admission notes, daily rounds, discharge summaries, and care plans.',
    audience: ['Doctors', 'Nurses', 'Allied Health Staff'],
    appRoute: '/clinical/modules/inpatient-documentation-clindoc',
    status: 'Implemented',
    requiredPermissions: buildPermissions('clinical', 'clindoc'),
    videoUrl: 'https://www.youtube.com/watch?v=HjtMtanLoRw',
    referenceUrl: 'https://www.epic.com/software/acute-and-inpatient-care/',
  },
  {
    id: 'care-companion',
    slug: 'care-companion',
    category: 'Clinical',
    name: 'Epic Care Companion',
    area: 'Patient Engagement',
    description:
      'Epic Care Companion is a patient support module that helps users manage care, reminders, and follow-ups.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/care-companion',
    status: 'Implemented',
    requiredPermissions: buildPermissions('clinical', 'care_companion'),
    videoUrl: 'https://www.youtube.com/watch?v=erMb03QNjqw',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'bugsy-infection-control',
    slug: 'bugsy-infection-control',
    category: 'Clinical',
    name: 'Bugsy (Infection Control)',
    area: 'Infection Prevention',
    description:
      'Bugsy helps hospitals manage infection prevention by tracking cases, isolations, audits, and safety actions.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/bugsy-infection-control',
    status: 'Implemented',
    requiredPermissions: buildPermissions('clinical', 'infection_control'),
    videoUrl: 'https://www.youtube.com/watch?v=wR7z7e6CxXA',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'haiku-mobile',
    slug: 'haiku-mobile',
    category: 'Clinical',
    name: 'Epic Haiku',
    area: 'Mobile Clinician App',
    description:
      'Epic Haiku provides a smooth mobile-first workflow for clinicians to access patient info and complete actions quickly.',
    audience: ['Providers (mobile)', 'Clinical Staff'],
    appRoute: '/clinical/modules/haiku-mobile',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'haiku'),
    videoUrl: 'https://www.youtube.com/watch?v=DH2n-TYqBNw',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'lumens-insights',
    slug: 'lumens-insights',
    category: 'Clinical',
    name: 'Epic Lumens',
    area: 'Analytics / Insights',
    description:
      'Epic Lumens is an intelligence and insights module that turns health data into clear, actionable information.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/lumens-insights',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'lumens'),
    videoUrl: 'https://www.youtube.com/watch?v=uW06q4QWSHM',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'care-link',
    slug: 'care-link',
    category: 'Clinical',
    name: 'Epic Care Link',
    area: 'Referrals / Shared Care',
    description:
      'Epic Care Link is an integrated care communication module that supports referrals, follow-ups, and shared care plans.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/care-link',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'care_link'),
    videoUrl: 'https://www.youtube.com/watch?v=NZKLAvrW1cQ',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'lucy-assistant',
    slug: 'lucy-assistant',
    category: 'Clinical',
    name: 'Epic Lucy (Agent)',
    area: 'Assistant / Search',
    description:
      'Epic Lucy is an intelligent assistant that helps users find information, answer questions, and complete tasks quickly.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/lucy-assistant',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'lucy'),
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'financial-assistance',
    slug: 'financial-assistance',
    category: 'Clinical',
    name: 'Epic Financial Assistance',
    area: 'Patient Financial Support',
    description:
      'Epic Financial Assistance helps patients understand costs, check eligibility, and apply for financial support programs.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/financial-assistance',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'financial_assistance'),
    videoUrl: 'https://www.youtube.com/watch?v=50kqwFDzYqk',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'reporting-workbench',
    slug: 'reporting-workbench',
    category: 'Clinical',
    name: 'Epic Reporting Workbench',
    area: 'Reporting',
    description:
      'Epic Reporting Workbench is a reporting module that helps users create, run, and manage reports from healthcare data.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/reporting-workbench',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'reporting_workbench'),
    videoUrl: 'https://www.youtube.com/watch?v=POD2QMVnB94',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'home-health-dorothy',
    slug: 'home-health-dorothy',
    category: 'Clinical',
    name: 'Epic Care Home Health (Dorothy)',
    area: 'Home Health',
    description:
      'Epic Care Home Health (Dorothy) supports home-based patient care by managing visits, care plans, and remote follow-ups.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/home-health-dorothy',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'home_health'),
    videoUrl: 'https://www.youtube.com/watch?v=M3aPrSf3l34',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'chronicles',
    slug: 'chronicles',
    category: 'Clinical',
    name: 'Epic Chronicles',
    area: 'Longitudinal Record',
    description:
      'Epic Chronicles is a longitudinal record module that maintains a complete history of a patient\'s health journey over time.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/chronicles',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical', 'chronicles'),
    videoUrl: 'https://www.youtube.com/watch?v=UtDRlaKiwd0',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'asap-emergency',
    slug: 'asap',
    category: 'Emergency',
    name: 'ASAP',
    area: 'Emergency Department',
    description:
      'Emergency Department module for triage, patient tracking, emergency documentation, urgent orders, and ED discharge.',
    audience: ['ED Doctors', 'ED Nurses', 'Emergency Staff'],
    appRoute: '/clinical/modules/asap',
    status: 'Planned',
    requiredPermissions: buildPermissions('emergency', 'asap'),
    videoUrl: 'https://www.youtube.com/watch?v=qegkEGAVcAY',
    referenceUrl: 'https://www.epic.com/software/specialties/',
  },
  {
    id: 'bones-orthopedics',
    slug: 'bones-orthopedics',
    category: 'Emergency',
    name: 'Bones (Orthopedics)',
    area: 'Orthopedics',
    description:
      'Bones is a specialized orthopedic care solution for diagnosis, treatment, and follow-up management.',
    audience: ['ED Physicians', 'ED Nurses', 'Emergency Staff'],
    appRoute: '/clinical/modules/bones-orthopedics',
    status: 'Planned',
    requiredPermissions: buildPermissions('emergency', 'bones'),
    videoUrl: 'https://www.youtube.com/watch?v=vwR8mupsdwE',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'optime-surgery',
    slug: 'optime',
    category: 'Surgery',
    name: 'OpTime',
    area: 'Operating Room',
    description:
      'Operating Room management for scheduling surgeries, documenting procedures, tracking OR utilization.',
    audience: ['Surgeons', 'OR Nurses', 'OT Coordinators'],
    appRoute: '/clinical/modules/optime',
    status: 'Planned',
    requiredPermissions: buildPermissions('surgery', 'optime'),
    videoUrl: 'https://www.youtube.com/watch?v=EJ9Dvs_gE6s',
    referenceUrl: 'https://www.epic.com/software/specialties/',
  },
  {
    id: 'anesthesia',
    slug: 'anesthesia',
    category: 'Surgery',
    name: 'Anesthesia',
    area: 'Perioperative',
    description:
      'Used by anesthesiologists to record anesthesia assessment, intraoperative vitals, medications, and recovery notes.',
    audience: ['Anesthesiologists', 'Nurse Anesthetists'],
    appRoute: '/clinical/modules/anesthesia',
    status: 'Planned',
    requiredPermissions: buildPermissions('surgery', 'anesthesia'),
    referenceUrl: 'https://www.epic.com/software/specialties/',
  },
  {
    id: 'radiant',
    slug: 'radiant',
    category: 'Radiology',
    name: 'Radiant',
    area: 'Imaging',
    description:
      'Radiology system for imaging orders, scheduling, radiologist reporting, and PACS integration.',
    audience: ['Radiologists', 'Radiology Technicians'],
    appRoute: '/clinical/modules/radiant',
    status: 'Implemented',
    requiredPermissions: ['orders.radiology.create', 'diagnostics.radiology.read', 'diagnostics.radiology.reports.read'],
    videoUrl: 'https://www.youtube.com/watch?v=NzlfHnfJlh8',
    referenceUrl: 'https://www.epic.com/software/specialties/',
  },
  {
    id: 'beaker',
    slug: 'beaker',
    category: 'Laboratory',
    name: 'Beaker',
    area: 'Laboratory',
    description:
      'Laboratory system managing lab orders, specimen collection, test processing, validation, and reporting.',
    audience: ['Lab Technicians', 'Pathologists'],
    appRoute: '/clinical/modules/beaker',
    status: 'Implemented',
    requiredPermissions: ['diagnostics.lab.read'],
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'willow',
    slug: 'willow',
    category: 'Pharmacy',
    name: 'Willow',
    area: 'Pharmacy Operations',
    description:
      'Pharmacy module for medication verification, dispensing, inventory management, and medication safety.',
    audience: ['Pharmacists', 'Pharmacy Technicians'],
    appRoute: '/clinical/modules/willow',
    status: 'Planned',
    requiredPermissions: buildPermissions('pharmacy', 'willow'),
    videoUrl: 'https://www.youtube.com/watch?v=JqmbaJ4QKlk',
    referenceUrl: 'https://www.epic.com/software/specialties/',
  },
  {
    id: 'cadence',
    slug: 'cadence',
    category: 'Patient Access',
    name: 'Calendar Scheduling',
    area: 'Scheduling',
    description:
      'Appointment scheduling used to book, reschedule, cancel visits, and manage provider calendars.',
    audience: ['Front Desk Staff', 'Scheduling Team', 'Call Center'],
    appRoute: '/appointments/calendar',
    status: 'Implemented',
    requiredPermissions: ['appointments.read'],
    videoUrl: 'https://www.youtube.com/watch?v=IqeaqRwuIjs',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'prelude-grand-central',
    slug: 'prelude-grand-central',
    category: 'Patient Access',
    name: 'Registration & ADT',
    area: 'Registration & Bed Management',
    description:
      'Capture registrations, verify coverage, coordinate admissions, discharges, and bed assignments.',
    audience: ['Front Desk Staff', 'Admission Team', 'Bed Managers'],
    appRoute: '/clinical/modules/prelude-grand-central',
    status: 'Implemented',
    requiredPermissions: buildPermissions('patient_access', 'prelude_grand_central'),
    videoUrl: 'https://www.youtube.com/watch?v=p1Fm0UTqDVA',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'resolute-billing',
    slug: 'resolute-billing',
    category: 'Revenue Cycle',
    name: 'Resolute Billing',
    area: 'Billing & Claims',
    description:
      'Billing system to generate claims, manage coding, denials, payments, and patient billing.',
    audience: ['Billing Team', 'Coders', 'Finance Staff'],
    appRoute: '/clinical/modules/resolute-billing',
    status: 'Planned',
    requiredPermissions: buildPermissions('revenue_cycle', 'resolute_billing'),
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'mychart',
    slug: 'mychart',
    category: 'Patient Portal',
    name: 'MyChart',
    area: 'Patient Portal',
    description:
      'Patient-facing portal for viewing results, appointments, messaging doctors, and online payments.',
    audience: ['Patients', 'Care Coordinators'],
    appRoute: '/clinical/modules/mychart',
    status: 'Planned',
    requiredPermissions: buildPermissions('patient_portal', 'mychart'),
    videoUrl: 'https://www.youtube.com/watch?v=5Tn-7QSTU1E',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'care-everywhere',
    slug: 'care-everywhere',
    category: 'Interoperability',
    name: 'Care Everywhere',
    area: 'Record Exchange',
    description:
      'Enables sharing patient records with external hospitals and clinics.',
    audience: ['Doctors', 'Nurses', 'HIM Staff'],
    appRoute: '/clinical/modules/care-everywhere',
    status: 'Planned',
    requiredPermissions: buildPermissions('interoperability', 'care_everywhere'),
    videoUrl: 'https://www.youtube.com/watch?v=uNAH4tB8wDg',
    referenceUrl: 'https://www.epic.com/software/interoperability/',
  },
  {
    id: 'healthy-planet',
    slug: 'healthy-planet',
    category: 'Population Health',
    name: 'Healthy Planet',
    area: 'Population Health',
    description:
      'Tracks chronic diseases, preventive care gaps, registries, and population-level outcomes.',
    audience: ['Care Managers', 'Population Health Teams'],
    appRoute: '/clinical/modules/healthy-planet',
    status: 'Planned',
    requiredPermissions: buildPermissions('population_health', 'healthy_planet'),
    videoUrl: 'https://www.youtube.com/watch?v=2GDJv8iZGlY',
    referenceUrl: 'https://www.epic.com/software/healthcare-intelligence/',
  },
  {
    id: 'beacon-oncology',
    slug: 'beacon-oncology',
    category: 'Oncology',
    name: 'Epic Beacon (Oncology)',
    area: 'Oncology',
    description:
      'Epic Beacon is an oncology module that manages cancer care workflows including treatment plans, chemotherapy, and follow-ups.',
    audience: ['Oncologists', 'Infusion Nurses', 'Pharmacists'],
    appRoute: '/clinical/modules/beacon-oncology',
    status: 'Planned',
    requiredPermissions: buildPermissions('oncology', 'beacon'),
    videoUrl: 'https://www.youtube.com/watch?v=U5HzAKEr4a4',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'cupid-cardiology',
    slug: 'cupid-cardiology',
    category: 'Cardiology',
    name: 'Epic Cupid',
    area: 'Cardiology',
    description:
      'Cardiology workflow module including cardiology documentation, imaging/hemodynamics integrations, and reporting.',
    audience: ['Cardiologists', 'Cardiac Techs', 'Nurses'],
    appRoute: '/clinical/modules/cupid-cardiology',
    status: 'Planned',
    requiredPermissions: buildPermissions('cardiology', 'cupid'),
    videoUrl: 'https://www.youtube.com/watch?v=0UCHuAB9iqg',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'hyperspace',
    slug: 'hyperspace',
    category: 'Clinical Core',
    name: 'Epic Hyperspace',
    area: 'Clinician Workspace',
    description:
      'Primary Epic clinician workstation for accessing patient chart, orders, documentation, and inbasket workflows.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/hyperspace',
    status: 'Planned',
    requiredPermissions: buildPermissions('clinical_core', 'hyperspace'),
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'open-scheduling',
    slug: 'open-scheduling',
    category: 'Scheduling',
    name: 'Open Scheduling',
    area: 'Scheduling',
    description:
      'Patient online self-booking requests managed inside the shared calendar scheduling workflow.',
    audience: ['Front Desk', 'Scheduling Staff', 'Providers'],
    appRoute: '/appointments/calendar',
    status: 'Implemented',
    requiredPermissions: ['appointments.read'],
    videoUrl: 'https://www.youtube.com/watch?v=1OJ79S1fCtg',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'stork-obstetrics',
    slug: 'stork-obstetrics',
    category: 'Obstetrics',
    name: 'Epic Stork',
    area: 'Labor & Delivery',
    description:
      'Epic Stork helps clinicians manage prenatal visits, delivery documentation, fetal monitoring, and postpartum follow-ups.',
    audience: ['OB/GYN', 'L&D Nurses', 'Midwives'],
    appRoute: '/clinical/modules/stork-obstetrics',
    status: 'Planned',
    requiredPermissions: buildPermissions('obstetrics', 'stork'),
    videoUrl: 'https://www.youtube.com/watch?v=jA-kqh8CFh4',
    referenceUrl: 'https://www.epic.com/software/',
  },
];

export function getClinicalModuleBySlug(
  slug: string
): ClinicalModuleDefinition | undefined {
  return CLINICAL_MODULES.find((moduleDefinition) => moduleDefinition.slug === slug);
}
