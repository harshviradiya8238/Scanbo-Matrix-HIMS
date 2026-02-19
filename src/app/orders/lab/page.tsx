import { redirect } from 'next/navigation';

interface LegacyOrdersLabPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function LabOrdersPage({ searchParams }: LegacyOrdersLabPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/ipd/orders-tests/orders?mrn=${encodeURIComponent(mrn)}` : '/ipd/orders-tests/orders');
}
