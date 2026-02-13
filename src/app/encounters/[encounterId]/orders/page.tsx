import OpdOrdersPage from '@/src/screens/opd/OpdOrdersPage';

interface EncounterOrdersPageProps {
  params: Promise<{ encounterId: string }>;
}

export default async function EncounterOrdersPage({ params }: EncounterOrdersPageProps) {
  const { encounterId } = await params;
  return <OpdOrdersPage encounterId={encounterId} />;
}
