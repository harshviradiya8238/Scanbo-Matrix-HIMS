import * as React from 'react';
import { FormControl } from '@/src/ui/components/atoms';
import Label from '@/src/ui/components/atoms/Label';
import HelperText from '@/src/ui/components/atoms/HelperText';

interface FieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  labelProps?: React.ComponentProps<typeof Label>;
  helperTextProps?: React.ComponentProps<typeof HelperText>;
  children: React.ReactNode;
}

export default function Field({
  id,
  label,
  required,
  helperText,
  errorText,
  error,
  fullWidth = true,
  labelProps,
  helperTextProps,
  children,
}: FieldProps) {
  const helper = error ? errorText ?? helperText : helperText;
  const helperId = id && helper ? `${id}-helper` : undefined;

  const control = React.isValidElement(children) && id
    ? React.cloneElement(children, {
        id: (children.props as any).id ?? id,
        'aria-describedby': helperId ?? (children.props as any)['aria-describedby'],
        'aria-invalid': error ? true : undefined,
      })
    : children;

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required}>
      {label ? (
        <Label {...labelProps} htmlFor={id}>
          {label}
        </Label>
      ) : null}
      {control}
      {helper ? (
        <HelperText {...helperTextProps} id={helperId}>
          {helper}
        </HelperText>
      ) : null}
    </FormControl>
  );
}
