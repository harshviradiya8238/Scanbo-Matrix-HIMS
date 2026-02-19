'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@/src/ui/theme';
import type { Theme } from '@/src/ui/theme';
import {
  CloseRounded as CloseRoundedIcon,
  Search as SearchIcon,
  SupervisedUserCircleRounded as SupervisedUserCircleRoundedIcon,
} from '@mui/icons-material';

type FieldTone = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface IpdPatientTopBarField {
  id: string;
  label: string;
  value: React.ReactNode;
  tone?: FieldTone;
}

export interface IpdPatientOption {
  patientId: string;
  name: string;
  mrn: string;
  ageGender?: string;
  ward?: string;
  bed?: string;
  consultant?: string;
  diagnosis?: string;
  status?: string;
  statusTone?: FieldTone;
  insurance?: string;
  totalBill?: number | string;
  dueAmount?: number | string;
  tags?: string[];
}

interface IpdPatientTopBarProps {
  moduleTitle: string;
  sectionLabel?: string;
  pageLabel?: string;
  patient: IpdPatientOption | null;
  fields: IpdPatientTopBarField[];
  patientOptions: IpdPatientOption[];
  onSelectPatient: (patientId: string) => void;
  rightActions?: React.ReactNode;
  stickyTop?: number;
}

export const IPD_PATIENT_TOP_BAR_STICKY_OFFSET = 64;

const COMPACT_FIELD_ORDER = [
  'ward-bed',
  'admitted',
  'los',
  'diagnosis',
  'consultant',
  'blood-group',
  'allergies',
  'insurance',
  'status',
  'total-bill',
] as const;
const HEADER_FIELD_LIMIT = 10;
const HIDDEN_FIELD_IDS = new Set(['age-sex', 'age']);

const INR_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'P';

function toFieldToneColor(theme: Theme, tone: FieldTone | undefined) {
  if (tone === 'success') return theme.palette.success.main;
  if (tone === 'warning') return theme.palette.warning.main;
  if (tone === 'error') return theme.palette.error.main;
  if (tone === 'info') return theme.palette.info.main;
  return theme.palette.text.primary;
}

function formatAmount(value?: number | string): string {
  if (value === undefined || value === null || value === '') return '--';
  if (typeof value === 'number') return INR_CURRENCY.format(value);
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) return INR_CURRENCY.format(asNumber);
  return String(value);
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function collectTags(option: IpdPatientOption): string[] {
  const tags = new Set<string>();
  if (option.status) tags.add(option.status);
  (option.tags ?? []).forEach((tag) => {
    if (tag.trim()) tags.add(tag.trim());
  });
  return Array.from(tags);
}

export default function IpdPatientTopBar({
  moduleTitle,
  sectionLabel = 'IPD',
  pageLabel,
  patient,
  fields,
  patientOptions,
  onSelectPatient,
  rightActions,
  stickyTop = 0,
}: IpdPatientTopBarProps) {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const filterOptions = React.useMemo(() => {
    const tags = new Set<string>();
    patientOptions.forEach((option) => {
      collectTags(option).forEach((tag) => tags.add(tag));
    });
    return ['All', ...Array.from(tags)];
  }, [patientOptions]);

  React.useEffect(() => {
    if (!filterOptions.includes(statusFilter)) {
      setStatusFilter('All');
    }
  }, [filterOptions, statusFilter]);

  const compactFields = React.useMemo(() => {
    const visibleFields = fields.filter((field) => !HIDDEN_FIELD_IDS.has(field.id));
    const byId = new Map(visibleFields.map((field) => [field.id, field] as const));
    const selected: IpdPatientTopBarField[] = [];

    COMPACT_FIELD_ORDER.forEach((fieldId) => {
      const match = byId.get(fieldId);
      if (match && !selected.some((entry) => entry.id === match.id)) {
        selected.push(match);
      }
    });

    visibleFields.forEach((field) => {
      if (selected.length >= HEADER_FIELD_LIMIT) return;
      if (!selected.some((entry) => entry.id === field.id)) {
        selected.push(field);
      }
    });

    return selected.slice(0, HEADER_FIELD_LIMIT);
  }, [fields]);

  const filteredPatients = React.useMemo(() => {
    const query = normalized(search);
    return patientOptions.filter((option) => {
      if (statusFilter !== 'All') {
        const tags = collectTags(option);
        if (!tags.some((tag) => normalized(tag) === normalized(statusFilter))) return false;
      }
      if (!query) return true;
      const haystack = [
        option.name,
        option.mrn,
        option.ward,
        option.bed,
        option.consultant,
        option.diagnosis,
        option.status,
        option.insurance,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [patientOptions, search, statusFilter]);

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: stickyTop,
          zIndex: 12,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.18),
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.primary.main,
          // borderRadius: { xs: 1.25, md: 1.75 },
          overflow: 'hidden',
          marginBottom: 1.5,
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            px: { xs: 1, md: 1.5 },
            py: { xs: 0.95, md: 0.98 },
            color: theme.palette.text.primary,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 0.9, md: 1 },
              alignItems: 'center',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(170px, 220px) minmax(0, 1fr) auto',
              },
            }}
          >
            <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: theme.palette.primary.contrastText,
                  fontWeight: 800,
                  fontSize: 14,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                }}
              >
                {getInitials(patient?.name ?? 'Patient')}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: theme.palette.text.primary }}
                  noWrap
                >
                  {patient?.name ?? 'No patient selected'}
                </Typography>
                <Stack direction="row" spacing={0.55} alignItems="center">
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {patient?.mrn ?? '--'}
                    {patient?.ageGender ? ` · ${patient.ageGender}` : ''}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                minWidth: 0,
                overflowX: 'auto',
                overflowY: 'hidden',
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 999,
                  backgroundColor: alpha(theme.palette.primary.main, 0.25),
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  width: 'max-content',
                  minWidth: '100%',
                }}
              >
                {compactFields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      flex: '0 0 auto',
                      px: { xs: 0.65, md: 0.82 },
                      py: 0.1,
                      borderLeft: index === 0 ? 'none' : '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.14),
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        // textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontWeight: 700,
                        // lineHeight: 1.05,
                        color: theme.palette.text.secondary,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.1,
                        fontWeight: 500,
                        lineHeight: 1.18,
                        whiteSpace: 'nowrap',
                        color: toFieldToneColor(theme, field.tone),
                      }}
                    >
                      {field.value || '--'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Stack
              direction={{ xs: 'row', lg: 'column' }}
              spacing={0.6}
              justifyContent={{ xs: 'flex-start', lg: 'center' }}
              alignItems={{ xs: 'stretch', lg: 'flex-end' }}
            >
              {rightActions ? <Box>{rightActions}</Box> : null}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setDialogOpen(true)}
                disabled={patientOptions.length === 0}
                sx={{
                  flexShrink: 0,
                  minWidth: 122,
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.34),
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.54),
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  '&.Mui-disabled': {
                    color: theme.palette.text.disabled,
                    borderColor: theme.palette.divider,
                  },
                }}
              >
                Change Patient
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ px: 2, py: 1.35, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Stack direction="row" spacing={0.7} alignItems="center">
              <SupervisedUserCircleRoundedIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Select IPD Patient
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setDialogOpen(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, MRN, bed, diagnosis..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setSearch('')}
                      sx={{ minWidth: 0, textTransform: 'none' }}
                    >
                      Clear
                    </Button>
                  </InputAdornment>
                ) : undefined,
              }}
            />

            <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
              {filterOptions.map((option) => (
                <Chip
                  key={option}
                  size="small"
                  label={option}
                  onClick={() => setStatusFilter(option)}
                  color={statusFilter === option ? 'primary' : 'default'}
                  variant={statusFilter === option ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>

            <Box sx={{ maxHeight: '55vh', overflowY: 'auto', pr: 0.5 }}>
              <Stack spacing={1}>
                {filteredPatients.map((option) => {
                  const isCurrent = option.patientId === patient?.patientId;
                  const tags = collectTags(option);
                  return (
                    <Box
                      key={option.patientId}
                      onClick={() => {
                        onSelectPatient(option.patientId);
                        setDialogOpen(false);
                      }}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isCurrent ? 'primary.main' : 'divider',
                        backgroundColor: isCurrent
                          ? alpha(theme.palette.primary.main, 0.09)
                          : alpha(theme.palette.background.default, 0.5),
                        cursor: 'pointer',
                        transition: 'border-color 120ms ease, background-color 120ms ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: isCurrent ? 'primary.main' : 'secondary.main',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {getInitials(option.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.65} alignItems="center" flexWrap="wrap">
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                                {option.name}
                              </Typography>
                              {isCurrent ? <Chip size="small" label="Current" color="primary" /> : null}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {option.mrn}
                              {option.ageGender ? ` · ${option.ageGender}` : ''}
                              {option.consultant ? ` · ${option.consultant}` : ''}
                            </Typography>
                            <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 0.45 }}>
                              <Chip
                                size="small"
                                label={`Ward ${option.ward || '--'} · Bed ${option.bed || '--'}`}
                                variant="outlined"
                              />
                              {tags.slice(0, 2).map((tag) => (
                                <Chip key={`${option.patientId}-${tag}`} size="small" label={tag} />
                              ))}
                              {option.insurance ? (
                                <Chip size="small" label={option.insurance} variant="outlined" />
                              ) : null}
                            </Stack>
                            {option.diagnosis ? (
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.45 }}>
                                Dx: {option.diagnosis}
                              </Typography>
                            ) : null}
                          </Box>
                        </Stack>

                        {option.totalBill !== undefined || option.dueAmount !== undefined ? (
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                              {formatAmount(option.totalBill)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Bill
                            </Typography>
                            {option.dueAmount !== undefined ? (
                              <Typography variant="body2" sx={{ mt: 0.2, fontWeight: 800, color: 'error.main' }}>
                                Due: {formatAmount(option.dueAmount)}
                              </Typography>
                            ) : null}
                          </Box>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Showing {filteredPatients.length} of {patientOptions.length} patients.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
