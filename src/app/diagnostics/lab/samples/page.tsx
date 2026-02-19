import { redirect } from 'next/navigation';

interface LegacyLabSamplesPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function SamplesPage({ searchParams }: LegacyLabSamplesPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/ipd/orders-tests/lab?mrn=${encodeURIComponent(mrn)}` : '/ipd/orders-tests/lab');
}
