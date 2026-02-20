'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Stack } from '@/src/ui/components/atoms';
import OpdLayout from './components/OpdLayout';
import { useOpdData } from '@/src/store/opdHooks';
import {
  buildEncounterOrdersRoute,
  buildEncounterPrescriptionsRoute,
  buildEncounterRoute,
  resolveEncounterFromState,
} from './opd-encounter';

interface LegacyEncounterRedirectProps {
  target: 'visit' | 'orders' | 'prescriptions';
  tab?: string;
}

export default function LegacyEncounterRedirect({ target, tab }: LegacyEncounterRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { encounters, status } = useOpdData();
  const mrn = searchParams.get('mrn');
  const queryEncounterId = searchParams.get('encounterId');
  const queryTab = searchParams.get('tab');

  const encounter = React.useMemo(
    () =>
      resolveEncounterFromState(encounters, {
        encounterId: queryEncounterId,
        mrn,
      }),
    [encounters, mrn, queryEncounterId]
  );

  React.useEffect(() => {
    if (!encounter) return;

    const query = new URLSearchParams();
    query.set('mrn', encounter.mrn);
    const resolvedTab = target === 'visit' ? tab ?? queryTab ?? undefined : undefined;
    if (resolvedTab) {
      query.set('tab', resolvedTab);
    }

    const mrnSuffix = `?${query.toString()}`;
    const destination =
      target === 'visit'
        ? `${buildEncounterRoute(encounter.id)}${mrnSuffix}`
        : target === 'orders'
          ? `${buildEncounterOrdersRoute(encounter.id)}${mrnSuffix}`
          : `${buildEncounterPrescriptionsRoute(encounter.id)}${mrnSuffix}`;

    router.replace(destination);
  }, [encounter, queryTab, router, tab, target]);

  return (
    <OpdLayout title="Redirecting" currentPageTitle="Redirect" subtitle={mrn ?? undefined}>
      <Stack spacing={1}>
        {status === 'loading' ? <Alert severity="info">Resolving encounter context...</Alert> : null}
        {!encounter ? <Alert severity="warning">No encounter available for this request.</Alert> : null}
      </Stack>
    </OpdLayout>
  );
}
