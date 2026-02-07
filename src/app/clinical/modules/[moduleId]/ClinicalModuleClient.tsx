'use client';

import ClinicalModulePlaceholderPage from '@/src/screens/clinical/ClinicalModulePlaceholderPage';
import EpicCareAmbulatoryPage from '@/src/screens/clinical/EpicCareAmbulatoryPage';
import InpatientClinDocPage from '@/src/screens/clinical/InpatientClinDocPage';
import WelcomeKioskPage from '@/src/screens/clinical/WelcomeKioskPage';
import CareCompanionPage from '@/src/screens/clinical/CareCompanionPage';
import InfectionControlPage from '@/src/screens/clinical/InfectionControlPage';
import { ClinicalModuleDefinition } from '@/src/screens/clinical/module-registry';

interface ClinicalModuleClientProps {
  moduleDefinition: ClinicalModuleDefinition;
}

export default function ClinicalModuleClient({ moduleDefinition }: ClinicalModuleClientProps) {
  if (moduleDefinition.slug === 'ambulatory-care-opd') {
    return <EpicCareAmbulatoryPage />;
  }

  if (moduleDefinition.slug === 'inpatient-documentation-clindoc') {
    return <InpatientClinDocPage />;
  }

  if (moduleDefinition.slug === 'welcome-kiosk') {
    return <WelcomeKioskPage />;
  }

  if (moduleDefinition.slug === 'care-companion') {
    return <CareCompanionPage />;
  }

  if (moduleDefinition.slug === 'bugsy-infection-control') {
    return <InfectionControlPage />;
  }

  return <ClinicalModulePlaceholderPage moduleDefinition={moduleDefinition} />;
}
