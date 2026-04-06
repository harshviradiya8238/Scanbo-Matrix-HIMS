'use client';

import * as React from 'react';
import { Box, Stack, Typography } from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';

export type RegistrationCountry = 'india' | 'international';

interface PatientCountryToggleProps {
  value: RegistrationCountry;
  onChange: (value: RegistrationCountry) => void;
  compact?: boolean;
}

const OPTIONS: Array<{
  value: RegistrationCountry;
  emoji: string;
  title: string;
  subtitle: string;
}> = [
  {
    value: 'india',
    emoji: '🇮🇳',
    title: 'India Patient',
    subtitle: 'Aadhaar, ABHA, NHA fields included',
  },
  {
    value: 'international',
    emoji: '🌍',
    title: 'International Patient',
    subtitle: 'Passport, visa, and country-specific identity',
  },
];

export default function PatientCountryToggle({
  value,
  onChange,
  compact = false,
}: PatientCountryToggleProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={compact ? 0.55 : 0.8}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Box
            key={option.value}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChange(option.value);
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? '6px' : '8px',
              borderRadius: '999px',
              px: compact ? '10px' : '14px',
              py: compact ? '5px' : '7px',
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: selected ? theme.palette.primary.main : '#DDE8F0',
              backgroundColor: theme.palette.background.paper,
              transition: 'border-color 120ms ease-in-out',
              '&:hover': {
                borderColor: selected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.35),
              },
            }}
          >
            {/* Emoji */}
            <Typography sx={{ fontSize: compact ? 13 : 15, lineHeight: 1 }}>
              {option.emoji}
            </Typography>

            {/* Label */}
            <Typography
              sx={{
                fontWeight: 600,
                color: selected ? '#0D1B2A' : '#5A7184',
                fontSize: compact ? '12px' : '13px',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {option.title}
            </Typography>

            {/* Radio dot */}
            <Box
              sx={{
                width: compact ? 14 : 16,
                height: compact ? 14 : 16,
                borderRadius: '50%',
                border: `1.5px solid`,
                borderColor: selected ? theme.palette.primary.main : '#C8D8E4',
                backgroundColor: selected ? theme.palette.primary.main : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selected && (
                <Box
                  sx={{
                    width: compact ? 5 : 6,
                    height: compact ? 5 : 6,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
