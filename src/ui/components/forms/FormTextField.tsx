'use client';

import { Box, InputAdornment } from '@/src/ui/components/atoms';
import Input, { InputProps } from '@/src/ui/components/atoms/Input';
import { useField } from 'formik';
import { ReactNode } from 'react';
import Field from '@/src/ui/components/molecules/Field';

interface FormTextFieldProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> {
  name: string;
  required?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export default function FormTextField({ 
  name, 
  label,
  required, 
  helperText, 
  startIcon,
  endIcon,
  placeholder,
  sx,
  ...props 
}: FormTextFieldProps) {
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
        <Input
          {...field}
          {...props}
          name={name}
          error={hasError}
          required={required}
          fullWidth
          placeholder={placeholder}
          label={undefined}
          inputProps={{
            ...props.inputProps,
            'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
          }}
          InputProps={{
            startAdornment: startIcon ? (
              <InputAdornment position="start">{startIcon}</InputAdornment>
            ) : undefined,
            endAdornment: endIcon ? (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            ) : undefined,
            ...props.InputProps,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </Field>
    </Box>
  );
}
