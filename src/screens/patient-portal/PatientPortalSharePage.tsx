'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import CircularProgress from '@mui/material/CircularProgress';
import type { Theme } from '@mui/material/styles';
import {
  Air as AirIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteOutlineIcon,
  DeviceThermostat as DeviceThermostatIcon,
  ArrowForwardRounded as ArrowForwardRoundedIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Favorite as FavoriteIcon,
  LocalPhone as LocalPhoneIcon,
  MailOutline as MailOutlineIcon,
  MonitorHeart as MonitorHeartIcon,
  Opacity as OpacityIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  ShieldOutlined as ShieldOutlinedIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { FAMILY_MEMBERS, PATIENT } from './patient-portal-mock-data';

type ShareTab = 'share' | 'shared-with-me' | 'shared-by-me';
type ShareWindowMode = 'period' | 'continuous';
type ShareStatus = 'Active' | 'Paused' | 'Revoked' | 'Expired';
type VitalMetricId =
  | 'body-temperature'
  | 'spo2'
  | 'blood-pressure'
  | 'heart-rate'
  | 'blood-glucose'
  | 'ecg'
  | 'heart-rate-variability'
  | 'breath-rate';

interface VitalMetric {
  id: VitalMetricId;
  label: string;
  short: string;
  color: string;
  icon: React.ReactNode;
}

interface ShareProfile {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  initials: string;
  avatarColor: string;
}

interface SharedByMeEntry {
  id: string;
  profileId: string;
  profileName: string;
  recipientName: string;
  recipientType: string;
  recipientMobile: string;
  recipientEmail: string;
  channel: string;
  periodLabel: string;
  sharedOn: string;
  status: ShareStatus;
  vitalAccess: Record<VitalMetricId, boolean>;
}

interface SharedWithMeEntry {
  id: string;
  sharedBy: string;
  role: string;
  source: string;
  grantedOn: string;
  expiresOn: string | null;
  status: 'Active' | 'Expired';
  vitals: VitalMetricId[];
}

const VITAL_METRICS: VitalMetric[] = [
  {
    id: 'body-temperature',
    label: 'Body Temperature',
    short: 'Temp',
    color: '#0284c7',
    icon: <DeviceThermostatIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'spo2',
    label: 'SpO2',
    short: 'SpO2',
    color: '#16a34a',
    icon: <AirIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'blood-pressure',
    label: 'Blood Pressure',
    short: 'BP',
    color: '#2563eb',
    icon: <OpacityIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'heart-rate',
    label: 'Heart Rate',
    short: 'HR',
    color: '#dc2626',
    icon: <FavoriteIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'blood-glucose',
    label: 'Blood Glucose',
    short: 'Glucose',
    color: '#d97706',
    icon: <ScienceIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'ecg',
    label: 'ECG',
    short: 'ECG',
    color: '#7c3aed',
    icon: <MonitorHeartIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'heart-rate-variability',
    label: 'Heart Rate Variability',
    short: 'HRV',
    color: '#0891b2',
    icon: <TimelineIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'breath-rate',
    label: 'Breath Rate',
    short: 'Resp',
    color: '#0f766e',
    icon: <AirIcon sx={{ fontSize: 18 }} />,
  },
];

const VITAL_LABEL: Record<VitalMetricId, string> = VITAL_METRICS.reduce(
  (acc, metric) => {
    acc[metric.id] = metric.label;
    return acc;
  },
  {} as Record<VitalMetricId, string>
);

const VITAL_DESCRIPTION: Record<VitalMetricId, string> = {
  'body-temperature': 'Core body temperature trend and spikes',
  'spo2': 'Blood oxygen saturation readings',
  'blood-pressure': 'Systolic/diastolic measurements',
  'heart-rate': 'Pulse trend and resting heart rate',
  'blood-glucose': 'Sugar readings and glycemic control',
  'ecg': 'Electrocardiogram snapshots and patterns',
  'heart-rate-variability': 'Autonomic stress and recovery signal',
  'breath-rate': 'Respiration rate trend',
};

const PROFILE_OPTIONS: ShareProfile[] = [
  {
    id: PATIENT.id,
    name: PATIENT.name,
    relation: 'Self',
    phone: PATIENT.phone,
    email: PATIENT.email,
    initials: PATIENT.initials,
    avatarColor: PATIENT.avatarColor,
  },
  ...FAMILY_MEMBERS.map((member) => ({
    id: member.id,
    name: member.name,
    relation: member.relation,
    phone: member.phone || 'Not available',
    email: member.email || 'Not available',
    initials: getInitials(member.name),
    avatarColor: member.avatarColor || '#1d4ed8',
  })),
];

const SHARED_WITH_ME_INITIAL: SharedWithMeEntry[] = [
  {
    id: 'in-1',
    sharedBy: 'Dr. Priya Sharma',
    role: 'Cardiologist',
    source: 'Apollo Care Team',
    grantedOn: '2026-03-10',
    expiresOn: '2026-04-10',
    status: 'Active',
    vitals: ['blood-pressure', 'heart-rate', 'spo2'],
  },
  {
    id: 'in-2',
    sharedBy: 'Dr. Arvind Mehta',
    role: 'Endocrinologist',
    source: 'Scanbo App',
    grantedOn: '2026-02-26',
    expiresOn: null,
    status: 'Active',
    vitals: ['blood-glucose', 'body-temperature', 'heart-rate'],
  },
  {
    id: 'in-3',
    sharedBy: 'SRL Diagnostics',
    role: 'Lab Access',
    source: 'Diagnostic Link',
    grantedOn: '2025-12-15',
    expiresOn: '2026-01-15',
    status: 'Expired',
    vitals: ['ecg', 'heart-rate-variability'],
  },
];

const SHARED_BY_ME_INITIAL: SharedByMeEntry[] = [
  {
    id: 'out-1',
    profileId: PATIENT.id,
    profileName: PATIENT.name,
    recipientName: 'Dr. Priya Sharma',
    recipientType: 'Consultant',
    recipientMobile: '+91 98765 22110',
    recipientEmail: 'priya.sharma@apollo.com',
    channel: 'App + Email',
    periodLabel: 'Continuous',
    sharedOn: '2026-03-12',
    status: 'Active',
    vitalAccess: createVitalAccess(['blood-pressure', 'heart-rate', 'spo2', 'body-temperature']),
  },
  {
    id: 'out-2',
    profileId: 'fm-1',
    profileName: 'Priya Patel',
    recipientName: 'Bardoli Diagnostic Center',
    recipientType: 'Lab',
    recipientMobile: '+91 98220 87761',
    recipientEmail: 'frontdesk@bardolilab.com',
    channel: 'Email',
    periodLabel: '01 Mar 2026 - 15 Mar 2026',
    sharedOn: '2026-03-15',
    status: 'Active',
    vitalAccess: createVitalAccess(['blood-glucose', 'ecg']),
  },
  {
    id: 'out-3',
    profileId: PATIENT.id,
    profileName: PATIENT.name,
    recipientName: 'Legacy Token Share',
    recipientType: 'External',
    recipientMobile: '+91 90000 00000',
    recipientEmail: '',
    channel: 'App',
    periodLabel: '20 Jan 2026 - 31 Jan 2026',
    sharedOn: '2026-01-20',
    status: 'Revoked',
    vitalAccess: createVitalAccess(['heart-rate', 'blood-pressure']),
  },
];

const scrollbar = {
  '&::-webkit-scrollbar': { width: 3 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'divider' },
};

export default function PatientPortalSharePage() {
  const theme = useTheme();
  const pr = theme.palette.primary;

  const today = React.useMemo(() => formatDateInput(new Date()), []);
  const defaultStart = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDateInput(d);
  }, []);

  const [activeTab, setActiveTab] = React.useState<ShareTab>('share');
  const [profileSearch, setProfileSearch] = React.useState('');
  const [historySearch, setHistorySearch] = React.useState('');
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);
  const [shareWindowMode, setShareWindowMode] = React.useState<ShareWindowMode>('continuous');
  const [rangeStart, setRangeStart] = React.useState(defaultStart);
  const [rangeEnd, setRangeEnd] = React.useState(today);
  const [selectedVitals, setSelectedVitals] = React.useState<VitalMetricId[]>([
    'body-temperature',
    'spo2',
    'blood-pressure',
    'heart-rate',
  ]);
  const [recipientName, setRecipientName] = React.useState('');
  const [recipientType, setRecipientType] = React.useState('');
  const [sendViaApp, setSendViaApp] = React.useState(true);
  const [recipientMobile, setRecipientMobile] = React.useState('');
  const [sendViaEmail, setSendViaEmail] = React.useState(true);
  const [recipientEmail, setRecipientEmail] = React.useState('');
  const [note, setNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sharedByMe, setSharedByMe] = React.useState<SharedByMeEntry[]>(SHARED_BY_ME_INITIAL);
  const [sharedWithMe] = React.useState<SharedWithMeEntry[]>(SHARED_WITH_ME_INITIAL);
  const [expandedShareId, setExpandedShareId] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const selectedProfile = React.useMemo(
    () => PROFILE_OPTIONS.find((profile) => profile.id === selectedProfileId) || null,
    [selectedProfileId]
  );

  const filteredProfiles = React.useMemo(() => {
    const query = profileSearch.trim().toLowerCase();
    if (!query) return PROFILE_OPTIONS;
    return PROFILE_OPTIONS.filter(
      (profile) =>
        profile.name.toLowerCase().includes(query) ||
        profile.relation.toLowerCase().includes(query) ||
        profile.phone.toLowerCase().includes(query)
    );
  }, [profileSearch]);

  const filteredSharedByMe = React.useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    if (!query) return sharedByMe;
    return sharedByMe.filter((entry) => {
      const enabledVitals = getEnabledVitals(entry.vitalAccess)
        .map((id) => VITAL_LABEL[id].toLowerCase())
        .join(' ');
      return (
        entry.profileName.toLowerCase().includes(query) ||
        entry.recipientName.toLowerCase().includes(query) ||
        entry.channel.toLowerCase().includes(query) ||
        enabledVitals.includes(query)
      );
    });
  }, [historySearch, sharedByMe]);

  const canShare = React.useMemo(() => {
    const hasProfile = Boolean(selectedProfileId);
    const hasRecipient = recipientName.trim().length > 0;
    const hasVitals = selectedVitals.length > 0;
    const hasDateRange = shareWindowMode === 'continuous' || (Boolean(rangeStart) && Boolean(rangeEnd) && rangeStart <= rangeEnd);
    const hasChannel = (sendViaApp && recipientMobile.trim().length > 0) || (sendViaEmail && recipientEmail.trim().length > 0);
    return hasProfile && hasRecipient && hasVitals && hasDateRange && hasChannel;
  }, [
    selectedProfileId,
    recipientName,
    selectedVitals,
    shareWindowMode,
    rangeStart,
    rangeEnd,
    sendViaApp,
    sendViaEmail,
    recipientMobile,
    recipientEmail,
  ]);

  const toggleVital = (vitalId: VitalMetricId) => {
    setSelectedVitals((prev) => {
      if (prev.includes(vitalId)) return prev.filter((id) => id !== vitalId);
      return [...prev, vitalId];
    });
  };

  const toggleAllVitals = () => {
    setSelectedVitals((prev) =>
      prev.length === VITAL_METRICS.length ? [] : VITAL_METRICS.map((metric) => metric.id)
    );
  };

  const resetComposer = () => {
    setSelectedProfileId(null);
    setShareWindowMode('continuous');
    setRangeStart(defaultStart);
    setRangeEnd(today);
    setSelectedVitals(['body-temperature', 'spo2', 'blood-pressure', 'heart-rate']);
    setRecipientName('');
    setRecipientType('');
    setSendViaApp(true);
    setRecipientMobile('');
    setSendViaEmail(true);
    setRecipientEmail('');
    setNote('');
  };

  const handleShareVitals = async () => {
    if (!canShare) {
      setSnackbar({
        open: true,
        message: 'Please select profile, recipient, vitals, and at least one valid sharing channel.',
        severity: 'warning',
      });
      return;
    }

    const profile = PROFILE_OPTIONS.find((p) => p.id === selectedProfileId);
    if (!profile) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 950));

    const nextEntry: SharedByMeEntry = {
      id: `out-${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      recipientName: recipientName.trim(),
      recipientType: recipientType.trim() || 'Provider',
      recipientMobile: sendViaApp ? recipientMobile.trim() : '',
      recipientEmail: sendViaEmail ? recipientEmail.trim() : '',
      channel: getChannelLabel(sendViaApp, sendViaEmail),
      periodLabel:
        shareWindowMode === 'continuous'
          ? 'Continuous'
          : `${formatDisplayDate(rangeStart)} - ${formatDisplayDate(rangeEnd)}`,
      sharedOn: formatDateInput(new Date()),
      status: 'Active',
      vitalAccess: createVitalAccess(selectedVitals),
    };

    setSharedByMe((prev) => [nextEntry, ...prev]);
    setExpandedShareId(nextEntry.id);
    setIsSubmitting(false);
    setActiveTab('shared-by-me');
    setSnackbar({
      open: true,
      message: `Vitals shared with ${nextEntry.recipientName}.`,
      severity: 'success',
    });
  };

  const handleToggleShareStatus = (shareId: string, enabled: boolean) => {
    setSharedByMe((prev) =>
      prev.map((entry) => {
        if (entry.id !== shareId) return entry;
        if (entry.status === 'Expired' || entry.status === 'Revoked') return entry;
        return { ...entry, status: enabled ? 'Active' : 'Paused' };
      })
    );
  };

  const handleToggleShareVital = (shareId: string, vitalId: VitalMetricId) => {
    setSharedByMe((prev) =>
      prev.map((entry) => {
        if (entry.id !== shareId) return entry;
        if (entry.status === 'Revoked' || entry.status === 'Expired') return entry;
        const nextAccess = { ...entry.vitalAccess, [vitalId]: !entry.vitalAccess[vitalId] };
        return { ...entry, vitalAccess: nextAccess };
      })
    );
  };

  const handleRevoke = (shareId: string) => {
    setSharedByMe((prev) =>
      prev.map((entry) => {
        if (entry.id !== shareId) return entry;
        return { ...entry, status: 'Revoked' };
      })
    );
    setSnackbar({
      open: true,
      message: 'Sharing link revoked successfully.',
      severity: 'info',
    });
  };

  /* ── Tab config ── */
  const TABS: { value: ShareTab; label: string; count?: number }[] = [
    { value: 'share', label: 'Share Vitals' },
    { value: 'shared-with-me', label: 'Shared With Me', count: sharedWithMe.length },
    { value: 'shared-by-me', label: 'Shared By Me', count: sharedByMe.length },
  ];

  return (
    <PatientPortalWorkspaceCard current="share">
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '10px', overflow: 'hidden' }}>

        {/* ── Header card with pill tabs ── */}
        <Box sx={{
          bgcolor: 'background.paper', borderRadius: '22px',
          border: '1px solid', borderColor: 'divider',
          p: '16px 20px 14px', flexShrink: 0,
        }}>
          {/* Title row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShareIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Vital Sharing Workspace
              </Typography>
            </Stack>
            <Chip
              size="small"
              icon={<ShieldOutlinedIcon sx={{ fontSize: 13 }} />}
              label="Role-based and revocable access"
              sx={{
                height: 22, fontSize: 11, fontWeight: 700,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'success.dark',
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          </Stack>

          {/* Pill tab switcher */}
          <Box sx={{
            bgcolor: alpha(theme.palette.grey[100], 0.9),
            borderRadius: '14px', border: '1px solid', borderColor: 'divider',
            p: '5px', display: 'flex', gap: '3px',
          }}>
            {TABS.map(({ value, label, count }) => (
              <Box key={value} onClick={() => setActiveTab(value)} sx={{
                flex: 1, py: '9px', px: 1.25, borderRadius: '11px',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                bgcolor: activeTab === value ? 'primary.main' : 'transparent',
                color: activeTab === value ? '#fff' : 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: activeTab === value ? 'primary.main' : alpha(pr.main, 0.06) },
              }}>
                {label}
                {count !== undefined && (
                  <Box sx={{
                    width: 18, height: 18, borderRadius: '50%',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: activeTab === value ? 'rgba(255,255,255,0.25)' : alpha(theme.palette.text.secondary, 0.1),
                    color: activeTab === value ? '#fff' : 'text.disabled',
                  }}>
                    {count}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Tab content area ── */}
        <Box sx={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          bgcolor: 'background.paper', borderRadius: '22px',
          border: '1px solid', borderColor: 'divider',
          p: { xs: 1.5, sm: 2 },
          ...scrollbar,
        }}>

          {/* ══ Share Vitals tab ══ */}
          {activeTab === 'share' && (
            <Stack spacing={1.1}>
              <Stack direction="row" spacing={0.9} alignItems="center" flexWrap="wrap">
                <Chip
                  size="small"
                  label="1. Select Patient"
                  color={selectedProfile ? 'success' : 'primary'}
                  variant={selectedProfile ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Chip
                  size="small"
                  label="2. Configure and Share"
                  color={selectedProfile ? 'primary' : 'default'}
                  variant={selectedProfile ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.2,
                  gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
                  minHeight: 0,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.18),
                    borderRadius: 2.1,
                    p: 1.1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search profile by name, relation or mobile"
                    value={profileSearch}
                    onChange={(event) => setProfileSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack spacing={0.75} sx={{ mt: 1, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2 }}>
                    {filteredProfiles.map((profile) => {
                      const selected = profile.id === selectedProfileId;
                      return (
                        <Box
                          key={profile.id}
                          onClick={() => setSelectedProfileId(profile.id)}
                          sx={{
                            border: '1px solid',
                            borderColor: selected ? alpha(theme.palette.primary.main, 0.45) : 'divider',
                            borderRadius: 1.8,
                            p: 0.95,
                            cursor: 'pointer',
                            backgroundColor: selected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
                            transition: 'all 0.16s ease',
                            '&:hover': {
                              borderColor: alpha(theme.palette.primary.main, 0.35),
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 30, height: 30, bgcolor: profile.avatarColor, fontSize: 12 }}>
                              {profile.initials}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" spacing={0.6} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                  {profile.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={profile.relation}
                                  sx={{
                                    height: 17, fontSize: 10, fontWeight: 700,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.dark',
                                  }}
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {profile.phone}
                              </Typography>
                            </Box>
                            {selected && <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />}
                          </Stack>
                        </Box>
                      );
                    })}
                    {filteredProfiles.length === 0 && (
                      <Alert severity="info" sx={{ borderRadius: 1.6 }}>
                        No matching profile found.
                      </Alert>
                    )}
                  </Stack>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.18),
                    borderRadius: 2.1,
                    p: 1.1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    opacity: selectedProfile ? 1 : 0.55,
                    pointerEvents: selectedProfile ? 'auto' : 'none',
                  }}
                >
                  {!selectedProfile && (
                    <Alert severity="info" sx={{ borderRadius: 1.6, mb: 1 }}>
                      Select a profile first to continue.
                    </Alert>
                  )}

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.9}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Sharing Window
                      </Typography>
                      <ToggleButtonGroup
                        value={shareWindowMode}
                        exclusive
                        size="small"
                        onChange={(_e, value: ShareWindowMode | null) => value && setShareWindowMode(value)}
                      >
                        <ToggleButton value="period" sx={{ textTransform: 'none', fontWeight: 700, px: 1.1 }}>
                          Period
                        </ToggleButton>
                        <ToggleButton value="continuous" sx={{ textTransform: 'none', fontWeight: 700, px: 1.1 }}>
                          Continuous
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>

                    {shareWindowMode === 'period' ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          size="small"
                          type="date"
                          label="From"
                          value={rangeStart}
                          onChange={(event) => setRangeStart(event.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          type="date"
                          label="To"
                          value={rangeEnd}
                          onChange={(event) => setRangeEnd(event.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      </Stack>
                    ) : (
                      <Box sx={{ p: 0.9, borderRadius: 1.4, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                        <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 700 }}>
                          Continuous mode keeps sharing active until you pause or revoke.
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 0.2 }} />

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.9}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Select Vital Metrics
                      </Typography>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Chip
                          size="small"
                          label={`${selectedVitals.length}/${VITAL_METRICS.length} selected`}
                          sx={{
                            height: 19, fontSize: 10, fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.dark',
                          }}
                        />
                        <Button
                          size="small"
                          variant="text"
                          onClick={toggleAllVitals}
                          sx={{ textTransform: 'none', fontWeight: 700, px: 0.6 }}
                        >
                          {selectedVitals.length === VITAL_METRICS.length ? 'Clear All' : 'Select All'}
                        </Button>
                      </Stack>
                    </Stack>

                    <Box sx={{ display: 'grid', gap: 0.8, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                      {VITAL_METRICS.map((metric) => {
                        const selected = selectedVitals.includes(metric.id);
                        return (
                          <Box
                            key={metric.id}
                            onClick={() => toggleVital(metric.id)}
                            sx={{
                              cursor: 'pointer',
                              p: 0.8,
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: selected ? alpha(metric.color, 0.36) : alpha(theme.palette.primary.main, 0.15),
                              backgroundColor: selected ? alpha(metric.color, 0.08) : theme.palette.common.white,
                              transition: 'all 0.12s ease',
                              '&:hover': {
                                backgroundColor: selected ? alpha(metric.color, 0.12) : alpha(theme.palette.primary.main, 0.03),
                              },
                            }}
                          >
                            <Stack direction="row" spacing={0.9} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box
                                  sx={{
                                    width: 24, height: 24, borderRadius: 1,
                                    display: 'grid', placeItems: 'center',
                                    color: metric.color,
                                    backgroundColor: alpha(metric.color, 0.12),
                                    flexShrink: 0,
                                  }}
                                >
                                  {metric.icon}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }} noWrap>
                                    {metric.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {VITAL_DESCRIPTION[metric.id]}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Switch
                                size="small"
                                checked={selected}
                                onChange={() => toggleVital(metric.id)}
                                onClick={(event) => event.stopPropagation()}
                              />
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>

                    <Divider sx={{ my: 0.2 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Recipient and Channel
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        size="small"
                        label="Recipient Name"
                        placeholder="Dr. name, lab name, family member..."
                        value={recipientName}
                        onChange={(event) => setRecipientName(event.target.value)}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        label="Recipient Type"
                        placeholder="Doctor / Lab / Hospital / Family"
                        value={recipientType}
                        onChange={(event) => setRecipientType(event.target.value)}
                        fullWidth
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Box
                        sx={{
                          flex: 1, p: 0.8, borderRadius: 1.4,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.18),
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <LocalPhoneIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              Share via App / Mobile
                            </Typography>
                          </Stack>
                          <Switch checked={sendViaApp} onChange={(event) => setSendViaApp(event.target.checked)} size="small" />
                        </Stack>
                        <TextField
                          size="small"
                          placeholder="+91 98XXXXXXXX"
                          value={recipientMobile}
                          onChange={(event) => setRecipientMobile(event.target.value)}
                          disabled={!sendViaApp}
                          fullWidth
                          sx={{ mt: 0.8 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          flex: 1, p: 0.8, borderRadius: 1.4,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.18),
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <MailOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              Share via Email
                            </Typography>
                          </Stack>
                          <Switch checked={sendViaEmail} onChange={(event) => setSendViaEmail(event.target.checked)} size="small" />
                        </Stack>
                        <TextField
                          size="small"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(event) => setRecipientEmail(event.target.value)}
                          disabled={!sendViaEmail}
                          fullWidth
                          sx={{ mt: 0.8 }}
                        />
                      </Box>
                    </Stack>

                    <TextField
                      size="small"
                      label="Reason / Context (optional)"
                      placeholder="Short note for provider"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      fullWidth
                      multiline
                      minRows={1}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 0.4 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={resetComposer}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={handleShareVitals}
                        disabled={!canShare || isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <ShareIcon sx={{ fontSize: 14 }} />}
                        sx={{ textTransform: 'none', fontWeight: 700, minWidth: 130 }}
                      >
                        {isSubmitting ? 'Sharing...' : 'Share Vitals'}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Box>
            </Stack>
          )}

          {/* ══ Shared With Me tab ══ */}
          {activeTab === 'shared-with-me' && (
            <Stack spacing={1}>
              {sharedWithMe.map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    p: 1.4, borderRadius: 2,
                    border: '1px solid',
                    borderColor: entry.status === 'Active'
                      ? alpha(theme.palette.success.main, 0.26)
                      : alpha(theme.palette.warning.main, 0.3),
                    backgroundColor: entry.status === 'Active'
                      ? alpha(theme.palette.success.main, 0.03)
                      : alpha(theme.palette.warning.main, 0.06),
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {entry.sharedBy}
                        </Typography>
                        <Chip
                          size="small"
                          label={entry.role}
                          sx={{
                            height: 18, fontSize: 10, fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.dark',
                          }}
                        />
                        <Chip
                          size="small"
                          label={entry.status}
                          sx={{
                            height: 18, fontSize: 10, fontWeight: 700,
                            bgcolor: entry.status === 'Active'
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.warning.main, 0.12),
                            color: entry.status === 'Active' ? 'success.dark' : 'warning.dark',
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4 }}>
                        Source: {entry.source} - Granted: {formatDisplayDate(entry.grantedOn)} -{' '}
                        {entry.expiresOn ? `Expires: ${formatDisplayDate(entry.expiresOn)}` : 'No expiry'}
                      </Typography>
                      <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ mt: 0.8 }}>
                        {entry.vitals.map((id) => (
                          <Chip
                            key={`${entry.id}-${id}`}
                            size="small"
                            label={VITAL_LABEL[id]}
                            variant="outlined"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.8} alignItems="flex-start">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          setSnackbar({
                            open: true,
                            message: `Opening shared vitals from ${entry.sharedBy}.`,
                            severity: 'info',
                          })
                        }
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        View Data
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {/* ══ Shared By Me tab ══ */}
          {activeTab === 'shared-by-me' && (
            <Stack spacing={1.2}>
              {/* Search bar */}
              <Box sx={{
                bgcolor: 'background.paper', borderRadius: '14px',
                border: '1px solid', borderColor: 'divider',
                px: '14px', py: '8px',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <SearchIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
                <Box
                  component="input"
                  placeholder="Search by profile, recipient, channel or metric"
                  value={historySearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHistorySearch(e.target.value)}
                  sx={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontFamily: 'inherit', fontSize: '12.5px', color: 'text.primary', width: '100%',
                    '&::placeholder': { color: '#9AAFBF' },
                  }}
                />
              </Box>

              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(120px,1.1fr) minmax(120px,1.2fr) minmax(100px,1fr) minmax(80px,0.9fr) 68px',
                    gap: 0.8,
                    px: 1.2, py: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  {['', 'Profile', 'Shared To', 'Period', 'Vitals', 'Active'].map((head) => (
                    <Typography key={head || 'toggle'} variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      {head}
                    </Typography>
                  ))}
                </Box>

                {filteredSharedByMe.map((entry) => {
                  const expanded = expandedShareId === entry.id;
                  const enabledVitals = getEnabledVitals(entry.vitalAccess);
                  const canToggle = entry.status !== 'Revoked' && entry.status !== 'Expired';
                  return (
                    <React.Fragment key={entry.id}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '32px minmax(120px,1.1fr) minmax(120px,1.2fr) minmax(100px,1fr) minmax(80px,0.9fr) 68px',
                          gap: 0.8,
                          px: 1.2, py: 1,
                          alignItems: 'center',
                          borderBottom: expanded ? 'none' : '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setExpandedShareId(expanded ? null : entry.id)}
                          sx={{ minWidth: 0, p: 0.2 }}
                        >
                          {expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                        </Button>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                            {entry.profileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            {formatDisplayDate(entry.sharedOn)}
                          </Typography>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                            {entry.recipientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            {entry.channel}
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" noWrap>
                          {entry.periodLabel}
                        </Typography>

                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {enabledVitals.length}
                        </Typography>

                        <Tooltip title={entry.status}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Switch
                              size="small"
                              checked={entry.status === 'Active'}
                              disabled={!canToggle}
                              onChange={(event) => handleToggleShareStatus(entry.id, event.target.checked)}
                            />
                          </Box>
                        </Tooltip>
                      </Box>

                      {expanded && (
                        <Box
                          sx={{
                            px: 1.2, pb: 1.2,
                            borderBottom: '1px solid', borderColor: 'divider',
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                                <Chip
                                  size="small"
                                  label={entry.status}
                                  sx={{
                                    height: 20, fontSize: 10, fontWeight: 700,
                                    bgcolor: statusBackground(theme, entry.status),
                                    color: statusColor(entry.status),
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {entry.recipientType} - {entry.recipientMobile || 'No mobile'} -{' '}
                                  {entry.recipientEmail || 'No email'}
                                </Typography>
                              </Stack>
                              {entry.status !== 'Revoked' && (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => handleRevoke(entry.id)}
                                  sx={{ textTransform: 'none', fontWeight: 700 }}
                                  startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                                >
                                  Revoke
                                </Button>
                              )}
                            </Stack>

                            <Box sx={{ display: 'grid', gap: 0.7, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                              {VITAL_METRICS.map((metric) => (
                                <Box
                                  key={`${entry.id}-${metric.id}`}
                                  sx={{
                                    p: 0.8, borderRadius: 1.4,
                                    border: '1px solid',
                                    borderColor: alpha(metric.color, 0.24),
                                    backgroundColor: alpha(metric.color, 0.05),
                                  }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={0.8} alignItems="center">
                                      <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        {metric.label}
                                      </Typography>
                                    </Stack>
                                    <Switch
                                      size="small"
                                      checked={entry.vitalAccess[metric.id]}
                                      disabled={entry.status !== 'Active'}
                                      onChange={() => handleToggleShareVital(entry.id, metric.id)}
                                    />
                                  </Stack>
                                </Box>
                              ))}
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredSharedByMe.length === 0 && (
                  <Box sx={{ p: 2.2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No shared records found for this search.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}

function createVitalAccess(selected: VitalMetricId[]): Record<VitalMetricId, boolean> {
  return VITAL_METRICS.reduce((acc, metric) => {
    acc[metric.id] = selected.includes(metric.id);
    return acc;
  }, {} as Record<VitalMetricId, boolean>);
}

function getEnabledVitals(vitalAccess: Record<VitalMetricId, boolean>): VitalMetricId[] {
  return (Object.keys(vitalAccess) as VitalMetricId[]).filter((id) => vitalAccess[id]);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateInput: string): string {
  const [year, month, day] = dateInput.split('-').map((part) => Number(part));
  if (!year || !month || !day) return dateInput;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getChannelLabel(viaApp: boolean, viaEmail: boolean): string {
  if (viaApp && viaEmail) return 'App + Email';
  if (viaApp) return 'App';
  if (viaEmail) return 'Email';
  return 'Not selected';
}

function statusBackground(theme: Theme, status: ShareStatus): string {
  if (status === 'Active') return alpha(theme.palette.success.main, 0.1);
  if (status === 'Paused') return alpha(theme.palette.warning.main, 0.14);
  if (status === 'Revoked') return alpha(theme.palette.error.main, 0.1);
  return alpha(theme.palette.grey[500], 0.14);
}

function statusColor(status: ShareStatus): string {
  if (status === 'Active') return '#166534';
  if (status === 'Paused') return '#92400e';
  if (status === 'Revoked') return '#b91c1c';
  return '#475569';
}
