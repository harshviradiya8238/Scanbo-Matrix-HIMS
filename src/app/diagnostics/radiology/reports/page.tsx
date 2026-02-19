import { redirect } from 'next/navigation';

interface LegacyRadiologyReportsPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function ReportsPage({ searchParams }: LegacyRadiologyReportsPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/ipd/orders-tests/radiology?mrn=${encodeURIComponent(mrn)}` : '/ipd/orders-tests/radiology');
}
