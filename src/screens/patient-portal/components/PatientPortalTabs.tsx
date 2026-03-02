'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';
import type { PatientPortalTabId } from '../patient-portal-types';

interface TabDef {
  id: PatientPortalTabId;
  label: string;
  route: string;
}

const TABS: TabDef[] = [
  { id: 'home', label: 'Dashboard', route: '/patient-portal/home' },
  { id: 'profile', label: 'My Profile', route: '/patient-portal/profile' },
  { id: 'appointments', label: 'Calendar', route: '/patient-portal/appointments' },
  { id: 'my-appointments', label: 'My Appointments', route: '/patient-portal/my-appointments' },
  { id: 'medications', label: 'Medications', route: '/patient-portal/medications' },
  { id: 'lab-reports', label: 'Lab Reports', route: '/patient-portal/lab-reports' },
  { id: 'prescriptions', label: 'Prescriptions', route: '/patient-portal/prescriptions' },
  { id: 'medical-records', label: 'Records', route: '/patient-portal/medical-records' },
  { id: 'bills', label: 'Bills', route: '/patient-portal/bills' },
  { id: 'chat', label: 'Chat', route: '/patient-portal/chat' },
];

export default function PatientPortalTabs({ current, embedded }: { current: PatientPortalTabId; embedded?: boolean }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {TABS.map((tab) => {
        const active = tab.id === current;
        return (
          <Button
            key={tab.id}
            size="small"
            variant={active ? 'contained' : 'text'}
            disableElevation
            onClick={() => router.push(tab.route)}
            sx={{
              minHeight: 30,
              px: 1.4,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: active ? 700 : 500,
              fontSize: 12.5,
              color: active ? '#fff' : 'text.secondary',
              backgroundColor: active ? theme.palette.primary.main : 'transparent',
              '&:hover': {
                backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
}
