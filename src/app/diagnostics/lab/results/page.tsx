import { redirect } from 'next/navigation';

interface LegacyLabResultsPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function ResultsPage({ searchParams }: LegacyLabResultsPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/ipd/orders-tests/lab?mrn=${encodeURIComponent(mrn)}` : '/ipd/orders-tests/lab');
}
