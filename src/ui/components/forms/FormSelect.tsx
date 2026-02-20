'use client';

import { MenuItem, Box } from '@/src/ui/components/atoms';
import Input, { InputProps } from '@/src/ui/components/atoms/Input';
import IconButton from '@/src/ui/components/atoms/IconButton';
import { useField } from 'formik';
import { Add as AddIcon } from '@mui/icons-material';

interface FormSelectProps
  extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'select' | 'children'> {
  name: string;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean;
  helperText?: React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onValueChange?: (value: string | number) => void;
}

export default function FormSelect({
  name,
  label,
  options,
  required,
  helperText,
  showAddButton,
  onAddClick,
  onValueChange,
  sx,
  ...props
}: FormSelectProps) {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;
  const ariaLabel = typeof label === 'string' ? label : undefined;

  return (
    <Box>
      <Input
        {...field}
        {...props}
        select
        name={name}
        id={name}
        label={label}
        fullWidth
        error={hasError}
        helperText={hasError ? meta.error : helperText}
        required={required}
        value={field.value || ''}
        onChange={(e) => {
          const nextValue = e.target.value as string | number;
          helpers.setValue(nextValue);
          onValueChange?.(nextValue);
        }}
        onBlur={field.onBlur}
        inputProps={{
          ...props.inputProps,
          'aria-label': props.inputProps?.['aria-label'] ?? ariaLabel,
        }}
        sx={[
          {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: hasError ? 'error.main' : undefined,
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hasError ? 'error.main' : 'primary.main',
            },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Input>
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
    </Box>
  );
}
