'use client';

import { MenuItem, Box } from '@/src/ui/components/atoms';
import Select, { SelectProps } from '@/src/ui/components/atoms/Select';
import IconButton from '@/src/ui/components/atoms/IconButton';
import { useField } from 'formik';
import { Add as AddIcon } from '@mui/icons-material';
import Field from '@/src/ui/components/molecules/Field';

interface FormSelectProps
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'variant' | 'ref'> {
  name: string;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean;
  helperText?: React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  variant?: 'outlined';
}

export default function FormSelect({
  name,
  label,
  options,
  required,
  helperText,
  showAddButton,
  onAddClick,
  ...props
}: FormSelectProps) {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;
  const ariaLabel = typeof label === 'string' ? label : undefined;

  return (
    <Field
      label={ariaLabel}
      required={required}
      error={hasError}
      helperText={hasError ? meta.error : helperText}
      fullWidth
      id={name}
    >
      <Select
        {...field}
        {...props}
        value={field.value || ''}
        onChange={(e) => helpers.setValue(e.target.value)}
        onBlur={field.onBlur}
        inputProps={{
          ...props.inputProps,
          'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? 'error.main' : undefined,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? 'error.main' : 'primary.main',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {showAddButton && onAddClick && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <IconButton
            size="small"
            onClick={onAddClick}
            sx={{ color: 'success.main' }}
            aria-label="Add new option"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Field>
  );
}
