'use client';

import * as React from 'react';
import { alpha } from '@/src/ui/theme';
import { Box, Button, Chip, Divider, InputAdornment, Paper, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { Card } from '@/src/ui/components/molecules';
import { Search as SearchIcon, Person as PersonIcon, History as HistoryIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { searchPatients, type GlobalPatient } from '@/src/mocks/global-patients';

type AccentTone = 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'purple';
type StatusTone = 'active' | 'warning' | 'critical' | 'info' | 'pending' | 'completed' | 'neutral';

// ─── Light-theme palette (matches Scanbo HIMS primary #1172BA) ────────────────
const ACCENT_MAP: Record<AccentTone, string> = {
  blue: '#1172BA',
  cyan: '#2C8AD3',
  green: '#2FA77A',
  orange: '#C9931E',
  red: '#C45757',
  purple: '#7C5CBF',
};

const STATUS_MAP: Record<StatusTone, { color: string; border: string; bg: string }> = {
  active:    { color: '#1E7A57', border: alpha('#2FA77A', 0.45), bg: alpha('#2FA77A', 0.12) },
  warning:   { color: '#C9931E', border: alpha('#F3C44E', 0.6),  bg: alpha('#F3C44E', 0.15) },
  critical:  { color: '#C45757', border: alpha('#E77B7B', 0.5),  bg: alpha('#E77B7B', 0.12) },
  info:      { color: '#1B6DA8', border: alpha('#2C8AD3', 0.45), bg: alpha('#2C8AD3', 0.10) },
  pending:   { color: '#7C5CBF', border: alpha('#7C5CBF', 0.45), bg: alpha('#7C5CBF', 0.10) },
  completed: { color: '#4b5563', border: alpha('#4b5563', 0.3),  bg: alpha('#4b5563', 0.07) },
  neutral:   { color: '#4b5563', border: alpha('#4b5563', 0.25), bg: alpha('#4b5563', 0.05) },
};

// Light theme tokens – closely mirrors the app's palette
export const ENTERPRISE_COLORS = {
  bgPrimary:     '#fafbfb',      // same as theme background.default
  bgSecondary:   '#f0f4f8',      // subtle tinted surface
  bgCard:        '#ffffff',      // white card
  bgHover:       '#eaf4ff',      // primary.light tint on hover
  border:        alpha('#1172BA', 0.14),
  borderLight:   alpha('#1172BA', 0.22),
  textPrimary:   '#1f2937',      // theme text.primary
  textSecondary: '#4b5563',      // theme text.secondary
  textMuted:     '#9ca3af',      // greyed out
};

// ─── Sx helpers ───────────────────────────────────────────────────────────────

export const enterpriseModuleSx = {
  backgroundColor: ENTERPRISE_COLORS.bgPrimary,
  borderRadius: 2,
  p: { xs: 1.25, md: 1.5 },
  border: '1px solid',
  borderColor: ENTERPRISE_COLORS.border,
  color: ENTERPRISE_COLORS.textPrimary,

  '& .MuiPaper-root': {
    backgroundColor: ENTERPRISE_COLORS.bgCard,
    borderColor: ENTERPRISE_COLORS.border,
    boxShadow: 'rgba(15, 23, 42, 0.06) 0px 4px 16px',
  },
  '& .MuiTypography-root': {
    color: ENTERPRISE_COLORS.textPrimary,
  },
  '& .MuiDivider-root': {
    borderColor: ENTERPRISE_COLORS.border,
  },
  '& .MuiTableCell-root': {
    borderBottomColor: ENTERPRISE_COLORS.border,
    color: ENTERPRISE_COLORS.textPrimary,
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    color: ENTERPRISE_COLORS.textSecondary,
    fontSize: '0.69rem',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    fontWeight: 700,
    backgroundColor: ENTERPRISE_COLORS.bgSecondary,
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root': {
    backgroundColor: ENTERPRISE_COLORS.bgHover,
  },
  '& .MuiInputBase-root': {
    backgroundColor: ENTERPRISE_COLORS.bgCard,
    color: ENTERPRISE_COLORS.textPrimary,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: ENTERPRISE_COLORS.borderLight,
  },
  '& .MuiInputLabel-root': {
    color: ENTERPRISE_COLORS.textSecondary,
  },
} as const;

export const enterpriseCardSx = {
  backgroundColor: ENTERPRISE_COLORS.bgCard,
  borderColor: ENTERPRISE_COLORS.border,
  border: '1px solid',
  borderRadius: 2,
  boxShadow: 'rgba(15, 23, 42, 0.05) 0px 2px 12px',
} as const;

export const enterpriseTabsCardSx = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: ENTERPRISE_COLORS.border,
  p: 0.75,
  backgroundColor: ENTERPRISE_COLORS.bgSecondary,
} as const;

export const enterpriseTabsSx = {
  '& .MuiTabs-flexContainer': { gap: 0.5 },
  '& .MuiTabs-indicator': { display: 'none' },
} as const;

export const enterpriseTabSx = {
  color: ENTERPRISE_COLORS.textSecondary,
  borderRadius: 1.5,
  fontWeight: 600,
  minHeight: 36,
  py: 0.75,
  '&.Mui-selected': {
    color: '#1172BA',
    backgroundColor: '#ffffff',
    boxShadow: 'rgba(17, 114, 186, 0.14) 0px 2px 8px',
  },
} as const;

// ─── Shared sub-components ────────────────────────────────────────────────────

export function EnterpriseStatusChip({
  label,
  tone = 'info',
}: {
  label: string;
  tone?: StatusTone;
}) {
  const style = STATUS_MAP[tone];
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        fontWeight: 700,
        borderRadius: 99,
        fontSize: '0.7rem',
        color: style.color,
        backgroundColor: style.bg,
        border: '1px solid',
        borderColor: style.border,
      }}
    />
  );
}

export function EnterpriseSectionTitle({ title }: { title: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.1 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#1172BA',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, height: 1, backgroundColor: ENTERPRISE_COLORS.border }} />
    </Stack>
  );
}

export function EnterpriseTimeline({
  items,
}: {
  items: Array<{
    time: string;
    title: string;
    subtitle?: string;
    tone?: AccentTone;
  }>;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        pl: 2.5,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 10,
          top: 10,
          bottom: 8,
          width: 1,
          backgroundColor: ENTERPRISE_COLORS.border,
        },
      }}
    >
      {items.map((item, idx) => (
        <Box key={`${item.time}-${item.title}-${idx}`} sx={{ position: 'relative', pb: idx === items.length - 1 ? 0 : 1.7 }}>
          <Box
            sx={{
              position: 'absolute',
              left: -15,
              top: 4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `2px solid ${ENTERPRISE_COLORS.bgCard}`,
              backgroundColor: ACCENT_MAP[item.tone ?? 'blue'],
            }}
          />
          <Typography variant="caption" sx={{ color: ENTERPRISE_COLORS.textMuted, fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace' }}>
            {item.time}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: ENTERPRISE_COLORS.textPrimary }}>
            {item.title}
          </Typography>
          {item.subtitle ? (
            <Typography variant="caption" sx={{ color: ENTERPRISE_COLORS.textSecondary }}>
              {item.subtitle}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

export function EnterpriseModuleHeader({
  title,
  subtitle,
  icon,
  accent = 'blue',
  badges = [],
  actions,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent?: AccentTone;
  badges?: string[];
  actions?: React.ReactNode;
}) {
  const accentColor = ACCENT_MAP[accent];

  return (
    <Card
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(accentColor, 0.25),
        background: `linear-gradient(135deg, ${alpha(accentColor, 0.06)} 0%, ${ENTERPRISE_COLORS.bgCard} 100%)`,
        boxShadow: `rgba(17, 114, 186, 0.08) 0px 4px 20px`,
      }}
    >
      <Stack spacing={1.25}>
        {badges.length ? (
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            {badges.map((badge) => (
              <Box
                key={badge}
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: 99,
                  backgroundColor: alpha(accentColor, 0.1),
                  border: '1px solid',
                  borderColor: alpha(accentColor, 0.35),
                }}
              >
                <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700 }}>
                  {badge}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                backgroundColor: alpha(accentColor, 0.12),
                color: accentColor,
                border: '1px solid',
                borderColor: alpha(accentColor, 0.3),
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ENTERPRISE_COLORS.textPrimary }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: ENTERPRISE_COLORS.textSecondary }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          {actions ? <Stack direction="row" spacing={1} flexWrap="wrap">{actions}</Stack> : null}
        </Stack>
      </Stack>
    </Card>
  );
}

export function EnterpriseStatCard({
  label,
  value,
  subtitle,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: AccentTone;
}) {
  const accentColor = ACCENT_MAP[tone];

  return (
    <Card
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(accentColor, 0.2),
        backgroundColor: ENTERPRISE_COLORS.bgCard,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'rgba(15, 23, 42, 0.05) 0px 2px 12px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 3,
          height: '100%',
          backgroundColor: accentColor,
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: ENTERPRISE_COLORS.textSecondary,
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.55,
          fontSize: '1.65rem',
          lineHeight: 1.1,
          fontWeight: 700,
          color: accentColor,
          fontFamily: '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
        }}
      >
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" sx={{ color: ENTERPRISE_COLORS.textSecondary }}>
          {subtitle}
        </Typography>
      ) : null}
    </Card>
  );
}
export function EnterpriseGlassCard({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha('#1172BA', 0.08),
        background: `rgba(255, 255, 255, 0.72)`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06)',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function EnterpriseGradientBox({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha('#1172BA', 0.08)} 0%, ${alpha('#1172BA', 0.02)} 100%)`,
        borderRadius: 3,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function EnterprisePatientSelection({ 
  onSelect, 
  title = "Select Patient", 
  subtitle = "Search or select a patient to begin" 
}: { 
  onSelect: (p: GlobalPatient) => void;
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<GlobalPatient[]>([]);

  React.useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchPatients(query, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 4 }}>
      <Stack spacing={4} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 1,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha('#1172BA', 0.16),
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 48px rgba(17, 114, 186, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, MRN, phone, or department..."
            variant="standard"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main', ml: 1.5, fontSize: 28 }} />
                </InputAdornment>
              ),
              sx: { fontSize: '1.25rem', px: 1, py: 1 }
            }}
          />
        </Paper>

        <Box sx={{ width: '100%' }}>
          {results.length > 0 ? (
            <Stack spacing={1.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', ml: 1 }}>
                Search Results ({results.length})
              </Typography>
              {results.map((p) => (
                <Paper
                  key={p.mrn}
                  onClick={() => onSelect(p)}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: alpha('#1172BA', 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(17, 114, 186, 0.08)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      backgroundColor: alpha('#1172BA', 0.1),
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {p.mrn} • {p.ageGender} • {p.department}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={p.status} variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                    <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : query.length < 2 ? (
            <Stack spacing={2}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', ml: 1 }}>
                Recent Worklist
              </Typography>
              <Grid container spacing={2}>
                {searchPatients('', 4).length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '2px dashed', borderColor: 'divider' }}>
                      <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Enter at least 2 characters to start searching the database.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Stack>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No patients found matching "{query}"
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

import { useTheme } from '@/src/ui/theme';
