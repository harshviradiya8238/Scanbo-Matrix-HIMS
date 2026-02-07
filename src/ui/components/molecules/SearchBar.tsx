import * as React from 'react';
import { Box, InputAdornment } from '@/src/ui/components/atoms';
import Input, { InputProps } from '@/src/ui/components/atoms/Input';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps extends Omit<InputProps, 'type' | 'onSubmit'> {
  onSubmit?: (value: string) => void;
  icon?: React.ReactNode;
}

export default function SearchBar({ onSubmit, value, InputProps, icon, ...props }: SearchBarProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(String(value ?? ''));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Input
        {...props}
        type="search"
        value={value}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {icon ?? <SearchIcon fontSize="small" />}
            </InputAdornment>
          ),
          ...InputProps,
        }}
      />
    </Box>
  );
}
