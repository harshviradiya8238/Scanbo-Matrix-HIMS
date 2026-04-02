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
      direction={{ xs: 'column', sm: 'row' }}
      spacing={compact ? 0.55 : 0.8}
      sx={{
        p: compact ? 0 : 0,
      }}
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
              flex: 1,
              minWidth: 0,
              borderRadius: compact ? 1 : 1.2,
              px: compact ? 0.8 : 1.05,
              py: compact ? 0.5 : 0.72,
              cursor: 'pointer',
              border: selected ? '1.5px solid' : '1px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              backgroundColor: selected ? alpha(theme.palette.primary.main, 0.11) : theme.palette.background.paper,
              boxShadow: selected ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.16)}` : 'none',
              transition: 'all 120ms ease-in-out',
              '&:hover': {
                borderColor: selected ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                backgroundColor: selected ? alpha(theme.palette.primary.main, 0.13) : alpha(theme.palette.primary.main, 0.035),
              },
            }}
          >
            <Stack direction="row" spacing={compact ? 0.45 : 0.75} alignItems="center">
              <Typography sx={{ fontSize: compact ? 13.5 : 15.5, lineHeight: 1 }}>
                {option.emoji}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: selected ? 'primary.main' : 'text.primary',
                    fontSize: compact ? 12.5 : 13.5,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: selected ? 'primary.main' : 'text.secondary',
                    fontSize: compact ? 11 : 11,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {option.subtitle}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
