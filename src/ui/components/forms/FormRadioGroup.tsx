'use client';

import { FormControl, FormLabel, RadioGroup, FormControlLabel } from '@/src/ui/components/atoms';
import Radio from '@/src/ui/components/atoms/Radio';
import HelperText from '@/src/ui/components/atoms/HelperText';
import { useField } from 'formik';

interface FormRadioGroupProps {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  row?: boolean;
  required?: boolean;
}

export default function FormRadioGroup({ name, label, options, row, required }: FormRadioGroupProps) {
  const [field, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;

  return (
    <FormControl component="fieldset" error={hasError} required={required} fullWidth>
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        {...field}
        row={row}
        value={field.value || ''}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {hasError && <HelperText>{meta.error}</HelperText>}
    </FormControl>
  );
}
