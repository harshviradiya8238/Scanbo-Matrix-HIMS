import type { Shadows } from '@mui/material/styles';

export const palette = {
  mode: 'light' as const,
  primary: {
    main: '#1172BA',
    light: '#EAF4FF',
    dark: '#0A5E9D',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0B84D0',
    light: '#DCEBFF',
    dark: '#0A5E9D',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2FA77A',
    light: '#E8F6EF',
    dark: '#1E7A57',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2C8AD3',
    light: '#E6F2FD',
    dark: '#1B6DA8',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#F3C44E',
    light: '#FFF3D6',
    dark: '#C9931E',
    contrastText: '#111111',
  },
  error: {
    main: '#E77B7B',
    light: '#FDECEC',
    dark: '#C45757',
    contrastText: '#111111',
  },
  text: {
    primary: '#1f2937',
    secondary: '#4b5563',
    danger: '#C45757',
  },
  grey: {
    A100: '#ecf0f2',
    A200: '#99abb4',
    A400: '#767e89',
    A700: '#e6f4ff',
  },
  action: {
    disabledBackground: 'rgba(73,82,88,0.12)',
    hoverOpacity: 0.02,
    hover: 'rgba(0, 0, 0, 0.03)',
  },
  background: {
    default: '#fafbfb',
    paper: '#ffffff',
  },
};

/** Centralized card shadow for all cards in the app */
// export const cardShadow = '0 16px 40px rgba(43, 123, 249, 0.15)';

// export const cardShadow =  '0 4px 20px rgba(26, 47, 80, 0.11)'
export const cardShadow = "rgba(15, 23, 42, 0.06) 0px 12px 24px";

export const typography = {
  fontFamily: "nunito",
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.3,
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.57,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    textTransform: 'uppercase' as const,
  },
};

export const shadows: Shadows = [
  'none',
  '0px 2px 4px rgba(0, 0, 0, 0.1)',
  '0px 4px 8px rgba(0, 0, 0, 0.1)',
  '0px 6px 12px rgba(0, 0, 0, 0.1)',
  '0px 8px 16px rgba(0, 0, 0, 0.1)',
  '0px 10px 20px rgba(0, 0, 0, 0.1)',
  '0px 12px 24px rgba(0, 0, 0, 0.1)',
  '0px 14px 28px rgba(0, 0, 0, 0.1)',
  '0px 16px 32px rgba(0, 0, 0, 0.1)',
  '0px 18px 36px rgba(0, 0, 0, 0.1)',
  '0px 20px 40px rgba(0, 0, 0, 0.1)',
  '0px 22px 44px rgba(0, 0, 0, 0.1)',
  '0px 24px 48px rgba(0, 0, 0, 0.1)',
  '0px 26px 52px rgba(0, 0, 0, 0.1)',
  '0px 28px 56px rgba(0, 0, 0, 0.1)',
  '0px 30px 60px rgba(0, 0, 0, 0.1)',
  '0px 32px 64px rgba(0, 0, 0, 0.1)',
  '0px 34px 68px rgba(0, 0, 0, 0.1)',
  '0px 36px 72px rgba(0, 0, 0, 0.1)',
  '0px 38px 76px rgba(0, 0, 0, 0.1)',
  '0px 40px 80px rgba(0, 0, 0, 0.1)',
  '0px 42px 84px rgba(0, 0, 0, 0.1)',
  '0px 44px 88px rgba(0, 0, 0, 0.1)',
  '0px 46px 92px rgba(0, 0, 0, 0.1)',
  '0px 48px 96px rgba(0, 0, 0, 0.1)',
];

export const radii = {
  card: 8,
  control: 10,
  surface: 12,
} as const;

export const space = {
  xs: 0.5,
  sm: 1,
  md: 1.5,
  lg: 2,
  xl: 3,
  xxl: 4,
} as const;

export const elevations = {
  low: 1,
  medium: 2,
  high: 4,
  popover: 8,
} as const;
