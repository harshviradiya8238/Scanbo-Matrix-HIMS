import * as React from 'react';
import { Stack } from '@/src/ui/components/atoms';
import Section from '@/src/ui/components/layout/Section';

interface FiltersPanelProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function FiltersPanel({ title = 'Filters', actions, children }: FiltersPanelProps) {
  return (
    <Section title={title} actions={actions} variant="outlined" padding={2}>
      <Stack spacing={1.5}>{children}</Stack>
    </Section>
  );
}
