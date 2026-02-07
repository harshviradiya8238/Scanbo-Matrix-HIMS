'use client';

import { Box } from '@/src/ui/components/atoms';
import { InputProps } from '@/src/ui/components/atoms/Input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useField } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import Field from '@/src/ui/components/molecules/Field';

interface FormDatePickerProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> {
  name: string;
  required?: boolean;
}

export default function FormDatePicker({
  name,
  label,
  required,
  helperText,
  sx,
  ...props
}: FormDatePickerProps) {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;
  const ariaLabel = typeof label === 'string' ? label : undefined;

  const handleChange = (value: Dayjs | null) => {
    helpers.setValue(value ? value.format('YYYY-MM-DD') : '');
    helpers.setTouched(true);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
  };

  let dateValue: Dayjs | null = null;
  if (field.value) {
    const parsed = dayjs(field.value);
    dateValue = parsed.isValid() ? parsed : null;
  }

  return (
    <Box sx={sx}>
      <Field
        label={ariaLabel}
        required={required}
        error={hasError}
        helperText={hasError ? meta.error : helperText}
        id={name}
      >
        <DatePicker
          value={dateValue}
          onChange={handleChange}
          onClose={handleBlur}
          slotProps={{
            textField: {
              ...props,
              fullWidth: true,
              error: hasError,
              required,
              onBlur: handleBlur,
              size: 'small',
              inputProps: {
                ...props.inputProps,
                'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
              },
            } as InputProps,
          }}
        />
      </Field>
    </Box>
  );
}
