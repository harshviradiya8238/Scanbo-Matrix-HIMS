import OpdVisitPage from '@/src/screens/opd/OpdVisitPage';

interface EncounterPageProps {
  params: Promise<{ encounterId: string }>;
}

export default async function EncounterPage({ params }: EncounterPageProps) {
  const { encounterId } = await params;
  return <OpdVisitPage encounterId={encounterId} />;
}
