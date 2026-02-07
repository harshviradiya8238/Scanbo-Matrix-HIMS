export type ModuleStatus = 'Implemented' | 'In Progress' | 'Planned';

export interface ClinicalModuleDefinition {
  id: string;
  slug: string;
  category: 'Clinical';
  name: string;
  area: string;
  description: string;
  audience: string[];
  appRoute: string;
  status: ModuleStatus;
  videoUrl?: string;
  referenceUrl?: string;
}

export const CLINICAL_MODULES: ClinicalModuleDefinition[] = [
  {
    id: 'ambulatory-care-opd',
    slug: 'ambulatory-care-opd',
    category: 'Clinical',
    name: 'Ambulatory Care (OPD)',
    area: 'OPD / Clinics',
    description:
      'Used by doctors and clinical staff in OPD/clinics to document visits, write notes, place orders, review results, and manage patient problems.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/ambulatory-care-opd',
    status: 'Implemented',
    videoUrl: 'https://www.youtube.com/watch?v=n8mRZhtK2YU',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'inpatient-documentation-clindoc',
    slug: 'inpatient-documentation-clindoc',
    category: 'Clinical',
    name: 'Inpatient Documentation (ClinDoc)',
    area: 'IPD / Wards',
    description:
      'Used in IPD/wards for inpatient documentation including admission notes, daily rounds, discharge summaries, and care plans.',
    audience: ['Doctors', 'Nurses', 'Allied Health Staff'],
    appRoute: '/clinical/modules/inpatient-documentation-clindoc',
    status: 'Implemented',
    videoUrl: 'https://www.youtube.com/watch?v=HjtMtanLoRw',
    referenceUrl: 'https://www.epic.com/software/acute-and-inpatient-care/',
  },
  {
    id: 'welcome-kiosk',
    slug: 'welcome-kiosk',
    category: 'Clinical',
    name: 'Welcome Kiosk',
    area: 'Front Office / Self Check-in',
    description:
      'A user-friendly kiosk module that improves visitor check-in and reduces front-office workload.',
    audience: ['Front Office', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/welcome-kiosk',
    status: 'Implemented',
  },
  {
    id: 'care-companion',
    slug: 'care-companion',
    category: 'Clinical',
    name: 'Care Companion',
    area: 'Patient Engagement',
    description:
      'A patient support module that helps users manage care, reminders, and follow-ups.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/care-companion',
    status: 'Implemented',
  },
  {
    id: 'bugsy-infection-control',
    slug: 'bugsy-infection-control',
    category: 'Clinical',
    name: 'Infection Control',
    area: 'Infection Prevention',
    description:
      'Manage infection prevention by tracking cases, isolations, audits, and safety actions.',
    audience: ['Doctors', 'Nurses', 'Infection Control Team'],
    appRoute: '/clinical/modules/bugsy-infection-control',
    status: 'Implemented',
  },
  {
    id: 'haiku-mobile',
    slug: 'haiku-mobile',
    category: 'Clinical',
    name: 'Haiku (Mobile)',
    area: 'Mobile Clinician App',
    description:
      'Provides a mobile-first workflow for clinicians to access patient info and complete actions quickly.',
    audience: ['Providers (mobile)', 'Clinical Staff'],
    appRoute: '/clinical/modules/haiku-mobile',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=DH2n-TYqBNw',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'lumens-insights',
    slug: 'lumens-insights',
    category: 'Clinical',
    name: 'Lumens (Insights)',
    area: 'Analytics / Insights',
    description:
      'An intelligence and insights module that turns health data into clear, actionable information.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/lumens-insights',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=uW06q4QWSHM',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'care-link',
    slug: 'care-link',
    category: 'Clinical',
    name: 'Care Link',
    area: 'Referrals / Shared Care',
    description:
      'An integrated care communication module that supports referrals, follow-ups, and shared care plans.',
    audience: ['Doctors', 'Nurses', 'Care Coordinators'],
    appRoute: '/clinical/modules/care-link',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=NZKLAvrW1cQ',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'lucy-assistant',
    slug: 'lucy-assistant',
    category: 'Clinical',
    name: 'Lucy (Assistant)',
    area: 'Assistant / Search',
    description:
      'An intelligent assistant that helps users find information, answer questions, and complete tasks quickly.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/lucy-assistant',
    status: 'Planned',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'financial-assistance',
    slug: 'financial-assistance',
    category: 'Clinical',
    name: 'Financial Assistance',
    area: 'Patient Financial Support',
    description:
      'Helps patients understand costs, check eligibility, and apply for financial support programs.',
    audience: ['Billing Team', 'Front Office', 'Care Coordinators'],
    appRoute: '/clinical/modules/financial-assistance',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=50kqwFDzYqk',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'reporting-workbench',
    slug: 'reporting-workbench',
    category: 'Clinical',
    name: 'Reporting Workbench',
    area: 'Reporting',
    description:
      'A reporting module that helps users create, run, and manage reports from healthcare data.',
    audience: ['Doctors', 'Nurses', 'Admin', 'Clinical Staff'],
    appRoute: '/clinical/modules/reporting-workbench',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=POD2QMVnB94',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'home-health-dorothy',
    slug: 'home-health-dorothy',
    category: 'Clinical',
    name: 'Home Health (Dorothy)',
    area: 'Home Health',
    description:
      'Supports home-based patient care by managing visits, care plans, and remote follow-ups.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/home-health-dorothy',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=M3aPrSf3l34',
    referenceUrl: 'https://www.epic.com/software/',
  },
  {
    id: 'chronicles',
    slug: 'chronicles',
    category: 'Clinical',
    name: 'Chronicles',
    area: 'Longitudinal Record',
    description:
      'A longitudinal record module that maintains a complete history of a patient health journey over time.',
    audience: ['Doctors', 'Nurses', 'Clinical Staff'],
    appRoute: '/clinical/modules/chronicles',
    status: 'Planned',
    videoUrl: 'https://www.youtube.com/watch?v=UtDRlaKiwd0',
    referenceUrl: 'https://www.epic.com/software/',
  },
];

export function getClinicalModuleBySlug(
  slug: string
): ClinicalModuleDefinition | undefined {
  return CLINICAL_MODULES.find((moduleDefinition) => moduleDefinition.slug === slug);
}
