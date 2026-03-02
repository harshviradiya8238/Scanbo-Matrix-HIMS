'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Inventory2 as CatalogIcon,
  Description as ReportsIcon,
  Settings as SettingsIcon,
  Science as ScienceIcon,
  AssignmentTurnedIn as WorksheetsIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  List as ListIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Inventory as InventoryIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { cardShadow } from '@/src/core/theme/tokens';
import { LAB_CARD_BORDER_RADIUS } from '../lab-theme';

export type LabModuleTabId =
  | 'dashboard'
  | 'samples'
  | 'worksheets'
  | 'results'
  | 'clients'
  | 'tests'
  | 'instruments'
  | 'inventory'
  | 'reports'
  | 'quality-control'
  | 'settings';

export type LabMainSectionId = 'dashboard' | 'workflow' | 'catalog' | 'reports-qc' | 'settings';

const MAIN_SECTIONS: Array<{ id: LabMainSectionId; label: string; route: string; icon: React.ReactElement }> = [
  { id: 'dashboard', label: 'Dashboard', route: '/lab/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { id: 'workflow', label: 'Workflow', route: '/lab/samples', icon: <AssignmentIcon fontSize="small" /> },
  { id: 'catalog', label: 'Catalog & Setup', route: '/lab/clients', icon: <CatalogIcon fontSize="small" /> },
  { id: 'reports-qc', label: 'Reports & QC', route: '/lab/reports', icon: <ReportsIcon fontSize="small" /> },
  { id: 'settings', label: 'Settings', route: '/lab/settings', icon: <SettingsIcon fontSize="small" /> },
];

const TAB_TO_SECTION: Record<LabModuleTabId, LabMainSectionId> = {
  dashboard: 'dashboard',
  samples: 'workflow',
  worksheets: 'workflow',
  results: 'workflow',
  clients: 'catalog',
  tests: 'catalog',
  instruments: 'catalog',
  inventory: 'catalog',
  reports: 'reports-qc',
  'quality-control': 'reports-qc',
  settings: 'settings',
};

const SUB_TABS: Record<LabMainSectionId, Array<{ id: LabModuleTabId; label: string; route: string; icon: React.ReactElement }> | null> = {
  dashboard: null,
  workflow: [
    { id: 'samples', label: 'Samples', route: '/lab/samples', icon: <ScienceIcon fontSize="small" /> },
    { id: 'worksheets', label: 'Worksheets', route: '/lab/worksheets', icon: <WorksheetsIcon fontSize="small" /> },
    { id: 'results', label: 'Results', route: '/lab/results', icon: <EditIcon fontSize="small" /> },
  ],
  catalog: [
    { id: 'clients', label: 'Clients', route: '/lab/clients', icon: <BusinessIcon fontSize="small" /> },
    { id: 'tests', label: 'Test Catalog', route: '/lab/tests', icon: <ListIcon fontSize="small" /> },
    { id: 'instruments', label: 'Instruments', route: '/lab/instruments', icon: <PrecisionManufacturingIcon fontSize="small" /> },
    { id: 'inventory', label: 'Inventory', route: '/lab/inventory', icon: <InventoryIcon fontSize="small" /> },
  ],
  'reports-qc': [
    { id: 'reports', label: 'Reports', route: '/lab/reports', icon: <ReportsIcon fontSize="small" /> },
    { id: 'quality-control', label: 'QC', route: '/lab/quality-control', icon: <VerifiedIcon fontSize="small" /> },
  ],
  settings: null,
};

function tabStyle(
  active: boolean,
  theme: Theme,
  soft: string,
  embedded: boolean
) {
  const base = {
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: 0.75,
    px: embedded ? 2 : 1.5,
    py: embedded ? 0.9 : 0.75,
    borderRadius: embedded ? 1.5 : 1,
    cursor: 'pointer' as const,
    fontWeight: 600,
    fontSize: '0.8125rem',
    transition: 'background-color 0.2s, color 0.2s',
  };
  if (embedded) {
    return {
      ...base,
      bgcolor: active ? 'primary.main' : 'transparent',
      color: active ? 'primary.contrastText' : 'text.secondary',
      '&:hover': {
        bgcolor: active ? 'primary.main' : alpha(theme.palette.primary.main, 0.08),
        color: active ? 'primary.contrastText' : 'primary.main',
      },
    };
  }
  return {
    ...base,
    bgcolor: active ? soft : 'transparent',
    color: active ? 'primary.main' : 'text.secondary',
    fontWeight: active ? 600 : 500,
    '&:hover': {
      bgcolor: active ? soft : alpha(theme.palette.primary.main, 0.04),
      color: 'primary.main',
    },
  };
}

export default function LabModuleTabs({
  current,
  embedded = false,
}: {
  current: LabModuleTabId;
  embedded?: boolean;
}) {
  const router = useRouter();
  const theme = useTheme();
  const soft = getSoftSurface(theme);

  const activeSection: LabMainSectionId = TAB_TO_SECTION[current];
  const subTabs = SUB_TABS[activeSection];

  const mainTabs = (
    <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
      {MAIN_SECTIONS.map((section) => {
        const active = activeSection === section.id;
        return (
          <Box
            key={section.id}
            onClick={() => router.push(section.route)}
            sx={tabStyle(active, theme, soft, embedded)}
          >
            {section.icon}
            {section.label}
          </Box>
        );
      })}
    </Stack>
  );

  const subTabsRow =
    subTabs && subTabs.length > 0 ? (
      <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap sx={{ mt: embedded ? 0.5 : 0 }}>
        {subTabs.map((tab) => {
          const active = current === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => router.push(tab.route)}
              sx={tabStyle(active, theme, soft, embedded)}
            >
              {tab.icon}
              {tab.label}
            </Box>
          );
        })}
      </Stack>
    ) : null;

  if (embedded) {
    return (
      <Stack spacing={0}>
        {mainTabs}
        {subTabsRow}
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          borderRadius: LAB_CARD_BORDER_RADIUS,
          border: 'none',
          boxShadow: cardShadow,
          p: 0.75,
        }}
      >
        {mainTabs}
      </Box>
      {subTabsRow && (
        <Box
          sx={{
            borderRadius: LAB_CARD_BORDER_RADIUS,
            border: 'none',
            boxShadow: cardShadow,
            p: 0.5,
            borderLeft: '3px solid',
            borderLeftColor: 'primary.main',
          }}
        >
          {subTabsRow}
        </Box>
      )}
    </Stack>
  );
}
