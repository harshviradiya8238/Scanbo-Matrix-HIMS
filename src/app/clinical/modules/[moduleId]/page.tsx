import { notFound } from 'next/navigation';
import { getClinicalModuleBySlug } from '@/src/screens/clinical/module-registry';
import ClinicalModuleClient from './ClinicalModuleClient';

export default async function ClinicalModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleDefinition = getClinicalModuleBySlug(moduleId);

  if (!moduleDefinition) {
    notFound();
  }

  return <ClinicalModuleClient moduleDefinition={moduleDefinition} />;
}
