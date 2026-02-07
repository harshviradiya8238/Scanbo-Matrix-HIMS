import * as React from 'react';
import { Card, CardBody, CardFooter, CardHeader } from '@/src/ui/components/molecules/Card';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AuthForm({ title, subtitle, children, actions }: AuthFormProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} divider />
      <CardBody>{children}</CardBody>
      {actions ? <CardFooter divider>{actions}</CardFooter> : null}
    </Card>
  );
}
