'use client';

import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import { SxProps, Theme } from '@mui/material';

interface ScanboLogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  sx?: SxProps<Theme>;
}

/**
 * Scanbo Logo Component
 * Based on the brand: S-shaped blue ribbon with yellow ECG waveform
 */
export default function ScanboLogo({ size = 32, variant = 'full', sx }: ScanboLogoProps) {
  const iconSize = variant === 'icon' ? size : size * 0.6;

  if (variant === 'icon') {
    // Just the icon (S-shape + waveform)
    return (
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* S-shaped blue ribbon */}
          <path
            d="M8 6C8 6 10 4 16 4C22 4 24 6 24 8C24 10 22 12 18 14C14 16 12 18 12 20C12 22 14 24 20 24C26 24 28 26 28 28"
            stroke="#1172BA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner shadow/teal */}
          <path
            d="M10 8C10 8 11.5 6.5 16 6.5C20.5 6.5 22 8 22 9.5C22 11 20.5 12.5 17.5 13.5C14.5 14.5 13 16 13 17.5C13 19 14.5 20.5 19 20.5C23.5 20.5 25 22 25 23.5"
            stroke="#1F7EA4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
          {/* Yellow ECG waveform */}
          <path
            d="M4 16 L10 16 L12 12 L14 20 L16 16 L28 16"
            stroke="#B7D63A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    );
  }

  // Full logo with text
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* S-shaped blue ribbon */}
          <path
            d="M8 6C8 6 10 4 16 4C22 4 24 6 24 8C24 10 22 12 18 14C14 16 12 18 12 20C12 22 14 24 20 24C26 24 28 26 28 28"
            stroke="#1172BA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner shadow/teal */}
          <path
            d="M10 8C10 8 11.5 6.5 16 6.5C20.5 6.5 22 8 22 9.5C22 11 20.5 12.5 17.5 13.5C14.5 14.5 13 16 13 17.5C13 19 14.5 20.5 19 20.5C23.5 20.5 25 22 25 23.5"
            stroke="#1F7EA4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
          {/* Yellow ECG waveform */}
          <path
            d="M4 16 L10 16 L12 12 L14 20 L16 16 L28 16"
            stroke="#B7D63A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </Box>
  );
}
