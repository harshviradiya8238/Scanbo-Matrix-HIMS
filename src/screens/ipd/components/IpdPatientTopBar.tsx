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
import {
  CloseRounded as CloseRoundedIcon,
  Search as SearchIcon,
  SupervisedUserCircleRounded as SupervisedUserCircleRoundedIcon,
} from '@mui/icons-material';
import { getPatientByMrn } from '@/src/mocks/global-patients';

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
  phone?: string;
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

const SUMMARY_FIELD_ORDER = [
  'ward-bed',
  'admitted',
  'los',
  'consultant',
  'status',
  'total-bill',
  'diagnosis',
] as const;
const SUMMARY_FIELD_LIMIT = 5;

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

function parseAgeGender(ageGender?: string): { age: string; gender: string } {
  const value = String(ageGender ?? '').trim();
  if (!value) return { age: '', gender: '' };

  const slashParts = value.split('/').map((part) => part.trim()).filter(Boolean);
  if (slashParts.length >= 2) {
    return {
      age: slashParts[0].replace(/\s*yrs?$/i, '').trim(),
      gender: slashParts[1],
    };
  }

  const dotParts = value.split('·').map((part) => part.trim()).filter(Boolean);
  if (dotParts.length >= 2) {
    return {
      age: dotParts[0].replace(/\s*yrs?$/i, '').trim(),
      gender: dotParts[1],
    };
  }

  return {
    age: value.replace(/\s*yrs?$/i, '').trim(),
    gender: '',
  };
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

  const patientPhone = React.useMemo(() => {
    if (patient?.phone?.trim()) return patient.phone.trim();
    return getPatientByMrn(patient?.mrn)?.phone ?? '';
  }, [patient?.mrn, patient?.phone]);

  const demographicItems = React.useMemo(() => {
    const { age, gender } = parseAgeGender(patient?.ageGender);
    const parts: string[] = [];
    if (age) parts.push(`${age} yrs`);
    if (gender) parts.push(gender);
    if (patientPhone) parts.push(patientPhone);
    return parts;
  }, [patient?.ageGender, patientPhone]);

  const summaryFields = React.useMemo(() => {
    const byId = new Map(fields.map((field) => [field.id, field] as const));
    const selected: IpdPatientTopBarField[] = [];

    SUMMARY_FIELD_ORDER.forEach((fieldId) => {
      if (selected.length >= SUMMARY_FIELD_LIMIT) return;
      const match = byId.get(fieldId);
      if (match) selected.push(match);
    });

    if (selected.length < SUMMARY_FIELD_LIMIT) {
      fields.forEach((field) => {
        if (selected.length >= SUMMARY_FIELD_LIMIT) return;
        if (!selected.some((item) => item.id === field.id)) {
          selected.push(field);
        }
      });
    }

    return selected.slice(0, SUMMARY_FIELD_LIMIT);
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
          border: 0,
          borderBottom: '1px solid',
          borderBottomColor: alpha(theme.palette.primary.main, 0.28),
          overflow: 'hidden',
          marginBottom: 1.5,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            px: { xs: 1, md: 1.5 },
            py: { xs: 1, md: 1.15 },
            color: theme.palette.text.primary,
          }}
        >
          <Stack spacing={0}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: 'primary.main',
                    color: theme.palette.primary.contrastText,
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {getInitials(patient?.name ?? 'Patient')}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.15, color: theme.palette.text.primary }}
                      noWrap
                    >
                      {patient?.name ?? 'No patient selected'}
                    </Typography>
                    <Chip
                      size="small"
                      label={patient?.mrn ?? '--'}
                      sx={{
                        height: 21,
                        border: 0,
                        borderRadius: 1.2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                        '& .MuiChip-label': {
                          px: 0.85,
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.6}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 0.25 }}
                  >
                    {demographicItems.map((item, index) => (
                      <Stack key={`${item}-${index}`} direction="row" spacing={0.45} alignItems="center">
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                          •
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                        >
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              {summaryFields.length > 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    mr: { md: 1.25 },
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: 4 },
                    '&::-webkit-scrollbar-thumb': {
                      borderRadius: 999,
                      backgroundColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.6}
                    sx={{ minWidth: 'max-content', pr: 0.4, ml: { md: 'auto' } }}
                  >
                    {summaryFields.map((field) => (
                      <Chip
                        key={field.id}
                        size="small"
                        variant="outlined"
                        label={
                          <Box component="span">
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {field.label}:
                            </Box>{' '}
                            <Box
                              component="span"
                              sx={{ color: 'primary.main', fontWeight: 700 }}
                            >
                              {String(field.value ?? '--')}
                            </Box>
                          </Box>
                        }
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.24),
                          backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          maxWidth: 260,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ) : null}

              <Stack
                direction="row"
                spacing={0.6}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                alignItems="center"
                sx={{ flexShrink: 0 }}
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
            </Stack>
          </Stack>
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
