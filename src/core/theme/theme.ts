import { alpha, createTheme } from '@mui/material/styles';
import { palette, shadows, typography } from './tokens';

const baseTheme = createTheme({
  palette,
  typography,
  shadows,
  mixins: {
    toolbar: {
      color: palette.text.secondary,
      '@media(min-width:1280px)': {
        minHeight: '64px',
        padding: '0 30px',
      },
      '@media(max-width:1280px)': {
        minHeight: '64px',
      },
    },
  },
});

const outlinedBorderColor = alpha(baseTheme.palette.primary.main, 0.18);

const theme = createTheme(baseTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontFamily: baseTheme.typography.fontFamily,
          fontSize: '17px',
        },
        body: {
          fontFamily: baseTheme.typography.fontFamily,
          fontSize: '1rem',
        },
        '*, *::before, *::after': {
          fontFamily: 'inherit',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 8,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: baseTheme.palette.background.default,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          flex: 1,
          paddingLeft: 8,
          paddingRight: 8,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          borderRadius: '8px',
          textTransform: 'none',
          color: baseTheme.palette.text.primary,
          '&.Mui-selected': {
            backgroundColor: baseTheme.palette.primary.main,
            color: baseTheme.palette.primary.contrastText,
          },
          '&.Mui-selected:hover': {
            backgroundColor: baseTheme.palette.primary.main,
            color: baseTheme.palette.primary.contrastText,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          backgroundColor: alpha(baseTheme.palette.primary.main, 0.04),
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: outlinedBorderColor,
          },
          '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(baseTheme.palette.primary.main, 0.5),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: baseTheme.palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-focused': {
            backgroundColor: alpha(baseTheme.palette.primary.main, 0.08),
            boxShadow: `0 0 0 3px ${alpha(baseTheme.palette.primary.main, 0.12)}`,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline, &.MuiInputBase-colorError .MuiOutlinedInput-notchedOutline':
            {
              borderColor: baseTheme.palette.error.main,
            },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: baseTheme.palette.action.disabledBackground,
          },
          '& input, & textarea, & .MuiSelect-select': {
            padding: baseTheme.spacing(1, 1.75),
          },
          '& input::placeholder, & textarea::placeholder': {
            color: baseTheme.palette.text.secondary,
            opacity: 1,
          },
          '&.Mui-disabled': {
            cursor: 'not-allowed',
            '& input': {
              color: baseTheme.palette.text.disabled,
              cursor: 'not-allowed',
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: baseTheme.palette.text.secondary,
        },
        shrink: {
          color: baseTheme.palette.primary.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          padding: baseTheme.spacing(1.25, 3),
          boxShadow: 'none',
          '&:hover': {
            boxShadow: baseTheme.shadows[2],
          },
          '&:focus-visible': {
            outline: `2px solid ${baseTheme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: baseTheme.shadows[4],
          },
        },
      },
    },
    MuiChip: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        outlinedPrimary: {
          backgroundColor: alpha(baseTheme.palette.primary.main, 0.12),
          borderColor: alpha(baseTheme.palette.primary.main, 0.4),
          color: baseTheme.palette.primary.main,
        },
        outlinedSecondary: {
          backgroundColor: alpha(baseTheme.palette.secondary.main, 0.12),
          borderColor: alpha(baseTheme.palette.secondary.main, 0.4),
          color: baseTheme.palette.secondary.main,
        },
        outlinedInfo: {
          backgroundColor: alpha(baseTheme.palette.info.main, 0.12),
          borderColor: alpha(baseTheme.palette.info.main, 0.4),
          color: baseTheme.palette.info.dark,
        },
        outlinedSuccess: {
          backgroundColor: alpha(baseTheme.palette.success.main, 0.12),
          borderColor: alpha(baseTheme.palette.success.main, 0.4),
          color: baseTheme.palette.success.dark,
        },
        outlinedWarning: {
          backgroundColor: alpha(baseTheme.palette.warning.main, 0.2),
          borderColor: alpha(baseTheme.palette.warning.main, 0.5),
          color: baseTheme.palette.warning.dark,
        },
        outlinedError: {
          backgroundColor: alpha(baseTheme.palette.error.main, 0.12),
          borderColor: alpha(baseTheme.palette.error.main, 0.4),
          color: baseTheme.palette.error.dark,
        },
        filledInfo: {
          color: baseTheme.palette.info.contrastText,
        },
        filledWarning: {
          color: baseTheme.palette.warning.contrastText,
        },
        filledSuccess: {
          color: baseTheme.palette.success.contrastText,
        },
        filledError: {
          color: baseTheme.palette.error.contrastText,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: baseTheme.shadows[1],
        },
        elevation1: {
          boxShadow: baseTheme.shadows[1],
        },
        elevation2: {
          boxShadow: baseTheme.shadows[2],
        },
        elevation3: {
          boxShadow: baseTheme.shadows[3],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: baseTheme.shadows[1],
          borderRadius: 0,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${baseTheme.palette.divider}`,
          borderRadius: 12,
          backgroundColor: baseTheme.palette.background.paper,
        },
        columnHeaders: {
          backgroundColor: baseTheme.palette.background.default,
          borderBottom: `1px solid ${baseTheme.palette.divider}`,
          fontWeight: 600,
        },
        cell: {
          borderBottom: `1px solid ${baseTheme.palette.divider}`,
        },
        row: {
          '&:hover': {
            backgroundColor: alpha(baseTheme.palette.primary.main, 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(baseTheme.palette.primary.main, 0.12),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(baseTheme.palette.primary.main, 0.18),
          },
        },
        toolbarContainer: {
          padding: baseTheme.spacing(1, 2),
          gap: baseTheme.spacing(1),
        },
        footerContainer: {
          borderTop: `1px solid ${baseTheme.palette.divider}`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: baseTheme.palette.primary.dark,
          },
          '&:focus-visible': {
            outline: `2px solid ${baseTheme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '2px',
          },
        },
      },
    },
  },
});

export default theme;
