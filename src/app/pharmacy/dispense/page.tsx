import { redirect } from 'next/navigation';

interface LegacyDispensePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function DispensePage({ searchParams }: LegacyDispensePageProps) {
  const params = new URLSearchParams();

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => params.append(key, entry));
        return;
      }
      params.set(key, value);
    });
  }

  const query = params.toString();
  redirect(query ? `/clinical/modules/willow?${query}` : '/clinical/modules/willow');
}
