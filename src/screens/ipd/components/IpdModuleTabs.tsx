'use client';

import * as React from 'react';
import CommonTabs from '@/src/ui/components/molecules/CommonTabs';

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
  return (
    <CommonTabs
      tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
      value={value}
      onChange={onChange}
      sx={{
       
        '& .MuiTab-root': {
          minHeight: 44,
          // px: 1,
          borderRadius: 1.25,
        },
      }}
    />
  );
}
