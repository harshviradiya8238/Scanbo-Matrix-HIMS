'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, Avatar, Box, Chip, InputAdornment, TextField, Typography } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DoctorRow, getDoctorById, searchDoctors } from '@/src/mocks/doctorServer';

interface GlobalDoctorSearchProps {
  placeholder?: string;
  fullWidth?: boolean;
}

const AVATAR_COLORS = [
  '#1172BA', '#0B84D0', '#2FA77A', '#2C8AD3',
  '#7C3AED', '#059669', '#DC2626', '#9333EA',
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const statusColors: Record<string, string> = {
  Active: 'success',
  'On Leave': 'warning',
  Inactive: 'default',
  Suspended: 'error',
  'Pending Verification': 'info',
};

export default function GlobalDoctorSearch({
  placeholder = 'Search by Doctor ID, name, specialization...',
  fullWidth = true,
}: GlobalDoctorSearchProps) {
  const theme = useTheme();
  const router = useRouter();
  const [inputValue, setInputValue] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (inputValue.trim().length < 2) return [];
    return searchDoctors(inputValue, 8);
  }, [inputValue]);

  const handleSelect = (doctor: DoctorRow | null) => {
    if (!doctor) return;
    router.push(`/doctors/profile?doctorId=${doctor.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const match = getDoctorById(inputValue) ?? searchDoctors(inputValue, 1)[0];
    if (match) {
      event.preventDefault();
      router.push(`/doctors/profile?doctorId=${match.id}`);
    }
  };

  return (
    <Autocomplete
      options={filteredOptions}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : `${option.name} · ${option.doctorId}`
      }
      popupIcon={null}
      forcePopupIcon={false}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => handleSelect(value as DoctorRow | null)}
      filterOptions={(options) => options}
      noOptionsText={inputValue.trim().length < 2 ? 'Type at least 2 characters' : 'No matches found'}
      fullWidth={fullWidth}
      renderOption={(props, option) => {
        const doctor = option as DoctorRow;
        return (
          <Box
            component="li"
            {...props}
            key={doctor.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: getAvatarColor(doctor.firstName),
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {doctor.firstName[0]}{doctor.lastName[0]}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {doctor.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {doctor.doctorId} · {doctor.primarySpecialization} · {doctor.department}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={doctor.status}
              color={(statusColors[doctor.status] ?? 'default') as any}
              variant="outlined"
            />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ pl: 0.75 }}>
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
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
                backgroundColor: 'background.paper',
                '& fieldset': {
                  borderColor: 'primary.main',
                },
              },
            },
          }}
        />
      )}
    />
  );
}
