'use client';

import { FormControlLabel } from '@/src/ui/components/atoms';
import Checkbox, { CheckboxProps } from '@/src/ui/components/atoms/Checkbox';
import HelperText from '@/src/ui/components/atoms/HelperText';
import { useField } from 'formik';

interface FormCheckboxProps extends Omit<CheckboxProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string;
  label: string;
}

export default function FormCheckbox({ name, label, ...props }: FormCheckboxProps) {
  const [field, meta] = useField({ name, type: 'checkbox' });
  const hasError = meta.touched && !!meta.error;

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            {...props}
            checked={field.value || false}
            name={name}
          />
        }
        label={label}
      />
      {hasError && <HelperText error>{meta.error}</HelperText>}
    </>
  );
}
