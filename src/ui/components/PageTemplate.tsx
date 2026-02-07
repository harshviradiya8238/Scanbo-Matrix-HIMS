'use client';

import PageLayout from '@/src/ui/components/layout/PageLayout';
import Section from '@/src/ui/components/layout/Section';
import Text from '@/src/ui/components/atoms/Text';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  overline?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
  currentPageTitle?: string;
}

export default function PageTemplate({
  title,
  subtitle,
  overline,
  actions,
  header,
  children,
  currentPageTitle,
}: PageTemplateProps) {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      overline={overline}
      actions={actions}
      header={header}
      currentPageTitle={currentPageTitle ?? title}
    >
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
