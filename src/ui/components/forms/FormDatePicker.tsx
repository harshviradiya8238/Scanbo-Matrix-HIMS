'use client';

import { Box } from '@/src/ui/components/atoms';
import { InputProps } from '@/src/ui/components/atoms/Input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useField } from 'formik';
import dayjs, { Dayjs } from 'dayjs';

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
  const resolvedHelperText = hasError ? meta.error : helperText;

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
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        onClose={handleBlur}
        slotProps={{
          textField: {
            ...props,
            id: name,
            label,
            helperText: resolvedHelperText,
            fullWidth: true,
            error: hasError,
            required,
            onBlur: handleBlur,
            size: 'small',
            sx: {
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError ? 'error.main' : 'primary.main',
              },
            },
            inputProps: {
              ...props.inputProps,
              'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
            },
          } as InputProps,
          popper: {
            sx: {
              '& .MuiPaper-root': {
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 4,
              },
              '& .MuiPickersCalendarHeader-label': {
                fontWeight: 700,
                color: 'text.primary',
              },
              '& .MuiPickersArrowSwitcher-button': {
                color: 'text.primary',
              },
              '& .MuiDayCalendar-weekDayLabel': {
                color: 'text.secondary',
                fontWeight: 600,
              },
              '& .MuiPickersDay-root': {
                borderRadius: 1.5,
                fontWeight: 500,
              },
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
              '& .MuiPickersDay-root.Mui-selected:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiPickersDay-root.MuiPickersDay-today:not(.Mui-selected)': {
                borderColor: 'primary.main',
                borderWidth: 1,
              },
              '& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            },
          },
        }}
      />
    </Box>
  );
}
