'use client';

import * as React from 'react';
import { Tab, Tabs } from '@/src/ui/components/atoms';
import { useTheme } from '@/src/ui/theme';

export interface IpdModuleTabItem {
  id: string;
  label: string;
}

interface IpdModuleTabsProps {
  tabs: IpdModuleTabItem[];
  value: string;
  onChange: (value: string) => void;
}

export default function IpdModuleTabs({ tabs, value, onChange }: IpdModuleTabsProps) {
  const theme = useTheme();

  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: string) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 44,
        '& .MuiTabs-indicator': {
          backgroundColor: theme.palette.primary.main,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
        '& .MuiTabs-flexContainer': {
          gap: 1,
        },
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          px: 0.75,
          color: 'text.secondary',
        },
        '& .MuiTab-root.Mui-selected': {
          color: theme.palette.primary.main,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.id} value={tab.id} label={tab.label} />
      ))}
    </Tabs>
  );
}
