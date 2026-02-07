'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, Avatar, Box, Chip, InputAdornment, TextField, Typography } from '@/src/ui/components/atoms';
import { useTheme, alpha } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { GlobalPatient, searchPatients, getPatientByMrn } from '@/src/mocks/global-patients';

interface GlobalPatientSearchProps {
  placeholder?: string;
  fullWidth?: boolean;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

export default function GlobalPatientSearch({
  placeholder = 'Search by MRN, name, phone...',
  fullWidth = true,
}: GlobalPatientSearchProps) {
  const theme = useTheme();
  const router = useRouter();
  const [inputValue, setInputValue] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (inputValue.trim().length < 2) {
      return [];
    }
    return searchPatients(inputValue, 8);
  }, [inputValue]);

  const handleSelect = (patient: GlobalPatient | null) => {
    if (!patient) return;
    router.push(`/patients/profile?mrn=${patient.mrn}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const match = getPatientByMrn(inputValue) ?? searchPatients(inputValue, 1)[0];
    if (match) {
      event.preventDefault();
      router.push(`/patients/profile?mrn=${match.mrn}`);
    }
  };

  return (
    <Autocomplete
      options={filteredOptions}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => handleSelect(value)}
      filterOptions={(options) => options}
      noOptionsText={inputValue.trim().length < 2 ? 'Type at least 2 characters' : 'No matches found'}
      fullWidth={fullWidth}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.mrn}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: theme.palette.primary.main, fontSize: 12 }}>
            {getInitials(option.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {option.mrn} · {option.department}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={option.status}
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              minHeight: 50,
              borderRadius: 2.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
              },
              '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            },
          }}
        />
      )}
    />
  );
}
