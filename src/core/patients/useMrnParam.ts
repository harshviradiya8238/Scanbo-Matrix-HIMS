'use client';

import { useSearchParams } from 'next/navigation';

export const useMrnParam = () => {
  const params = useSearchParams();
  const mrn = params.get('mrn');
  return mrn ? mrn.toUpperCase() : '';
};
