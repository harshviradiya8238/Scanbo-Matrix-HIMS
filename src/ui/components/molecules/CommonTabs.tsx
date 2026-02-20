'use client';

import * as React from 'react';
import { Tab, Tabs } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';

export interface CommonTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactElement;
  disabled?: boolean;
}

interface CommonTabsProps<T extends string = string> {
  tabs: CommonTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  sx?: any;
  tabSx?: any;
}

export default function CommonTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  sx,
  tabSx,
}: CommonTabsProps<T>) {
  const theme = useTheme();

  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: T) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={[
        {
          px: 0.5,
          '& .MuiTabs-flexContainer': { gap: 0.55 },
          '& .MuiTabs-indicator': { display: 'none' },
        },
        sx,
      ] as any}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
          disabled={tab.disabled}
          icon={tab.icon}
          iconPosition="start"
          sx={[
            {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 40,
              px: 2,
              borderRadius: 1.5,
              color: 'text.secondary',
              transition: 'all 0.16s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              },
              '&.Mui-selected': {
                color: 'common.white',
                backgroundColor: theme.palette.primary.main,
              },
              '& .MuiTab-iconWrapper': {
                mr: tab.icon ? 0.8 : 0,
                mb: '0 !important',
              },
              '& svg': {
                fontSize: 18,
              },
            },
            tabSx,
          ] as any}
        />
      ))}
    </Tabs>
  );
}
