'use client';

import ClinicalModulePlaceholderPage from '@/src/screens/clinical/ClinicalModulePlaceholderPage';
import EpicCareAmbulatoryPage from '@/src/screens/clinical/EpicCareAmbulatoryPage';
import CareCompanionPage from '@/src/screens/clinical/CareCompanionPage';
import InfectionControlPage from '@/src/screens/clinical/InfectionControlPage';
import RegistrationAdtPage from '@/src/screens/clinical/RegistrationAdtPage';
import WelcomeKioskPage from '@/src/screens/clinical/WelcomeKioskPage';
import OpdCalendarPage from '@/src/screens/opd/OpdCalendarPage';
import RadiantImagingPage from '@/src/screens/clinical/RadiantImagingPage';
import IpdRoundsPage from '@/src/screens/ipd/IpdRoundsPage';
import LabDashboardPage from '@/src/screens/lab/dashboard/LabDashboardPage';
import PatientPortalHomePage from '@/src/screens/patient-portal/PatientPortalHomePage';
import { ClinicalModuleDefinition } from '@/src/screens/clinical/module-registry';

interface ClinicalModuleClientProps {
  moduleDefinition: ClinicalModuleDefinition;
}

export default function ClinicalModuleClient({ moduleDefinition }: ClinicalModuleClientProps) {
  if (moduleDefinition.slug === 'ambulatory-care-opd') {
    return <EpicCareAmbulatoryPage />;
  }

  if (moduleDefinition.slug === 'inpatient-documentation-clindoc') {
    return <IpdRoundsPage />;
  }

  if (moduleDefinition.slug === 'care-companion') {
    return <CareCompanionPage />;
  }

  if (moduleDefinition.slug === 'welcome-kiosk') {
    return <WelcomeKioskPage />;
  }

  if (moduleDefinition.slug === 'bugsy-infection-control') {
    return <InfectionControlPage />;
  }

  if (moduleDefinition.slug === 'prelude-grand-central') {
    return <RegistrationAdtPage />;
  }

  if (moduleDefinition.slug === 'open-scheduling') {
    return <OpdCalendarPage />;
  }

  if (moduleDefinition.slug === 'radiant') {
    return <RadiantImagingPage />;
  }

  if (moduleDefinition.slug === 'beaker') {
    return <LabDashboardPage />;
  }

  if (moduleDefinition.slug === 'mychart') {
    return <PatientPortalHomePage />;
  }

  return <ClinicalModulePlaceholderPage moduleDefinition={moduleDefinition} />;
}
