'use client';

import * as React from 'react';
import { Tab, Tabs } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';

export interface OpdTabItem {
  id: string;
  label: string;
  icon?: React.ReactElement;
}

interface OpdTabsProps {
  tabs: OpdTabItem[];
  value: string;
  onChange: (value: string) => void;
}

export default function OpdTabs({ tabs, value, onChange }: OpdTabsProps) {
  const theme = useTheme();

  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: string) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        px: 0.5,
        '& .MuiTabs-flexContainer': { gap: 0.5 },
        '& .MuiTabs-indicator': { display: 'none' },
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 40,
          px: 2,
          borderRadius: 1.5,
          color: 'text.secondary',
        },
        '& .MuiTab-root.Mui-selected': {
          color: 'common.white',
          backgroundColor: theme.palette.primary.main,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
          icon={tab.icon}
          iconPosition="start"
          sx={{
            '& .MuiTab-iconWrapper': {
              mr: 0.8,
              mb: '0 !important',
            },
            '& svg': {
              fontSize: 18,
            },
          }}
        />
      ))}
    </Tabs>
  );
}
