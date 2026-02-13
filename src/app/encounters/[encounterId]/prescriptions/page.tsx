import OpdPrescriptionsPage from '@/src/screens/opd/OpdPrescriptionsPage';

interface EncounterPrescriptionsPageProps {
  params: Promise<{ encounterId: string }>;
}

export default async function EncounterPrescriptionsPage({ params }: EncounterPrescriptionsPageProps) {
  const { encounterId } = await params;
  return <OpdPrescriptionsPage encounterId={encounterId} />;
}
