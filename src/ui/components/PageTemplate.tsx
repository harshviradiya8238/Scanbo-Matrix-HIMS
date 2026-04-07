'use client';

import PageLayout from '@/src/ui/components/layout/PageLayout';
import Section from '@/src/ui/components/layout/Section';
import Text from '@/src/ui/components/atoms/Text';

interface PageTemplateProps {
  title: string;
  children?: React.ReactNode;
  fullHeight?: boolean;
  header?: React.ReactNode;
  // legacy props kept for compatibility — no longer used
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  currentPageTitle?: string;
  noPadding?: boolean;
}

export default function PageTemplate({
  children,
  fullHeight,
  header,
}: PageTemplateProps) {
  return (
    <PageLayout fullHeight={fullHeight}>
      {header ?? null}
      {children || (
        <Section>
          <Text variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
            This page is under development.
          </Text>
        </Section>
      )}
    </PageLayout>
  );
}
