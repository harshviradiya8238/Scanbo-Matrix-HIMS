import * as React from 'react';
import Section from '@/src/ui/components/layout/Section';

interface SettingsPanelProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function SettingsPanel({ title, subtitle, actions, children }: SettingsPanelProps) {
  return (
    <Section title={title} subtitle={subtitle} actions={actions} variant="outlined" padding={2}>
      {children}
    </Section>
  );
}
