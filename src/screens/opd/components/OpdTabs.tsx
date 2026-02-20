'use client';

import * as React from 'react';
import CommonTabs from '@/src/ui/components/molecules/CommonTabs';

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
  return (
    <CommonTabs
      tabs={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        icon: tab.icon,
      }))}
      value={value}
      onChange={onChange}
      sx={{
        px: 0.5,
        '& .MuiTab-root': {
          minHeight: 40,
          px: 2,
        },
      }}
    />
  );
}
