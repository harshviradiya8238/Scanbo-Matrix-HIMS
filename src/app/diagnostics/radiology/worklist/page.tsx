import { redirect } from 'next/navigation';

interface LegacyRadiologyWorklistPageProps {
  searchParams?: {
    mrn?: string | string[];
  };
}

export default function RadiologyWorklistPage({ searchParams }: LegacyRadiologyWorklistPageProps) {
  const mrnValue = searchParams?.mrn;
  const mrn = Array.isArray(mrnValue) ? mrnValue[0] : mrnValue;
  redirect(mrn ? `/ipd/orders-tests/radiology?mrn=${encodeURIComponent(mrn)}` : '/ipd/orders-tests/radiology');
}
