'use client';

import { Box } from '@/src/ui/components/atoms';
import Input, { InputProps } from '@/src/ui/components/atoms/Input';
import { useField } from 'formik';
import Field from '@/src/ui/components/molecules/Field';

interface FormPhoneInputProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> {
  name: string;
  countryCode?: string;
  required?: boolean;
}

export default function FormPhoneInput({
  name,
  label,
  countryCode = '+91',
  required,
  helperText,
  sx,
  ...props
}: FormPhoneInputProps) {
  const [field, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;
  const ariaLabel = typeof label === 'string' ? label : undefined;

  return (
    <Box sx={sx}>
      <Field
        label={ariaLabel}
        required={required}
        error={hasError}
        helperText={hasError ? meta.error : helperText}
        id={name}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Input
            value={countryCode}
            size="small"
            sx={{ width: 80, flexShrink: 0 }}
            inputProps={{ readOnly: true, 'aria-label': 'Country code' }}
            InputProps={{
              sx: { backgroundColor: 'action.disabledBackground' },
            }}
          />
          <Input
            {...field}
            {...props}
            name={name}
            id={name}
            label={undefined}
            error={hasError}
            required={required}
            fullWidth
            type="tel"
            inputProps={{
              ...props.inputProps,
              'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
            }}
          />
        </Box>
      </Field>
    </Box>
  );
}
