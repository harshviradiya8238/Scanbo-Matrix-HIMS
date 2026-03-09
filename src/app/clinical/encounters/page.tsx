import { redirect } from 'next/navigation';

interface EncountersPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function EncountersPage({ searchParams }: EncountersPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/appointments/queue?mrn=${encodeURIComponent(mrn)}` : '/appointments/queue');
}
