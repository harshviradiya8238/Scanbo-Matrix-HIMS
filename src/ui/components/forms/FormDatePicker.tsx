'use client';

import { Box } from '@/src/ui/components/atoms';
import { InputProps } from '@/src/ui/components/atoms/Input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { alpha } from '@/src/ui/theme';
import { FastField, FieldInputProps, FieldMetaProps, FormikProps } from 'formik';
import dayjs, { Dayjs } from 'dayjs';

interface FormDatePickerProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'> {
  name: string;
  required?: boolean;
}

const pickerSurfaceSx = {
  backgroundColor: 'background.paper !important',
  backgroundImage: 'none !important',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 8,
  overflow: 'hidden',
};

export default function FormDatePicker({
  name,
  label,
  required,
  helperText,
  sx,
  ...props
}: FormDatePickerProps) {
  const ariaLabel = typeof label === 'string' ? label : undefined;

  return (
    <FastField name={name}>
      {({
        field,
        meta,
        form,
      }: {
        field: FieldInputProps<string>;
        meta: FieldMetaProps<string>;
        form: FormikProps<any>;
      }) => {
        const hasError = meta.touched && !!meta.error;
        const resolvedHelperText = hasError ? meta.error : helperText;

        const handleChange = (value: Dayjs | null) => {
          form.setFieldValue(name, value ? value.format('YYYY-MM-DD') : '');
          form.setFieldTouched(name, true, false);
        };

        const handleBlur = () => {
          form.setFieldTouched(name, true, false);
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
                  sx: (theme) => ({
                    '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
                      borderRadius: '10px !important',
                      boxShadow: 'none',
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
                      '& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline': {
                        borderRadius: '10px !important',
                        borderWidth: 1,
                        borderColor: hasError ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.18),
                      },
                      '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline, &:hover:not(.Mui-disabled) .MuiPickersOutlinedInput-notchedOutline':
                        {
                          borderColor: hasError ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.5),
                        },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiPickersOutlinedInput-notchedOutline':
                        {
                          borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      '&.Mui-focused': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error .MuiPickersOutlinedInput-notchedOutline, &.MuiInputBase-colorError .MuiOutlinedInput-notchedOutline, &.MuiInputBase-colorError .MuiPickersOutlinedInput-notchedOutline':
                        {
                          borderColor: theme.palette.error.main,
                        },
                      '& input, & textarea, & .MuiSelect-select, & .MuiPickersInputBase-sectionsContainer': {
                        padding: theme.spacing(1, 1.75),
                      },
                    },
                  }),
                  inputProps: {
                    ...props.inputProps,
                    'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
                  },
                } as InputProps,
                desktopPaper: {
                  sx: pickerSurfaceSx,
                },
                mobilePaper: {
                  sx: pickerSurfaceSx,
                },
                popper: {
                  sx: {
                    '& .MuiPickersLayout-root': {
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiDateCalendar-root': {
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiDayCalendar-header': {
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiPaper-root': {
                      ...pickerSurfaceSx,
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
      }}
    </FastField>
  );
}
