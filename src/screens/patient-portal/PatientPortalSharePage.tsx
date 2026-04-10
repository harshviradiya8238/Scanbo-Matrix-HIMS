'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import CommonDialog from '@/src/ui/components/molecules/CommonDialog';
import { alpha, useTheme } from '@/src/ui/theme';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { Theme } from '@mui/material/styles';
import {
  Air as AirIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteOutlineIcon,
  DeviceThermostat as DeviceThermostatIcon,
  ArrowForwardRounded as ArrowForwardRoundedIcon,
  Favorite as FavoriteIcon,
  LocalPhone as LocalPhoneIcon,
  MailOutline as MailOutlineIcon,
  MonitorHeart as MonitorHeartIcon,
  Opacity as OpacityIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  ShieldOutlined as ShieldOutlinedIcon,
  GppGoodOutlined as GppGoodOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { FAMILY_MEMBERS, PATIENT } from './patient-portal-mock-data';
import { maskMobileNumber } from '@/src/core/utils/phone';

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
  consentPurpose: string;
  consentAt: string;
  consentBy: string;
  consentMethod: string;
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

interface ShareFormErrors {
  profile?: string;
  recipientName?: string;
  dateRange?: string;
  vitals?: string;
  channel?: string;
  recipientMobile?: string;
  recipientEmail?: string;
  consentPurpose?: string;
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
    consentPurpose: 'Cardiology follow-up and medication adjustment.',
    consentAt: '2026-03-12',
    consentBy: PATIENT.name,
    consentMethod: 'Digital Signature',
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
    consentPurpose: 'Share lab trends for diabetes care review.',
    consentAt: '2026-03-01',
    consentBy: 'Priya Patel',
    consentMethod: 'Digital Signature',
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
    consentPurpose: 'Temporary external token-based health summary.',
    consentAt: '2026-01-20',
    consentBy: PATIENT.name,
    consentMethod: 'Digital Signature',
  },
];

const scrollbar = {
  '&::-webkit-scrollbar': { width: 3 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'divider' },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PatientPortalSharePage() {
  const theme = useTheme();

  const today = React.useMemo(() => formatDateInput(new Date()), []);
  const defaultStart = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDateInput(d);
  }, []);

  const [activeTab, setActiveTab] = React.useState<ShareTab>('share');
  const [profileSearch, setProfileSearch] = React.useState('');
  const [historySearch, setHistorySearch] = React.useState('');
  const [sharedWithMeSearch, setSharedWithMeSearch] = React.useState('');
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
  const [selectedSharedWithMeId, setSelectedSharedWithMeId] = React.useState<string | null>(
    SHARED_WITH_ME_INITIAL[0]?.id ?? null
  );
  const [selectedSharedByMeId, setSelectedSharedByMeId] = React.useState<string | null>(
    SHARED_BY_ME_INITIAL[0]?.id ?? null
  );
  const [consentOpen, setConsentOpen] = React.useState(false);
  const [consentConfirmDataUse, setConsentConfirmDataUse] = React.useState(false);
  const [consentConfirmRevokeRights, setConsentConfirmRevokeRights] = React.useState(false);
  const [consentConfirmScope, setConsentConfirmScope] = React.useState(false);
  const [consentSignature, setConsentSignature] = React.useState('');
  const [consentError, setConsentError] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<ShareFormErrors>({});
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const selectedProfile = React.useMemo(
    () => PROFILE_OPTIONS.find((profile) => profile.id === selectedProfileId) || null,
    [selectedProfileId]
  );
  const expectedConsentSigner = React.useMemo(
    () => selectedProfile?.name.trim().toLowerCase() ?? '',
    [selectedProfile]
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
  const filteredSharedWithMe = React.useMemo(() => {
    const query = sharedWithMeSearch.trim().toLowerCase();
    if (!query) return sharedWithMe;
    return sharedWithMe.filter((entry) => {
      const vitalsText = entry.vitals.map((id) => VITAL_LABEL[id].toLowerCase()).join(' ');
      return (
        entry.sharedBy.toLowerCase().includes(query) ||
        entry.role.toLowerCase().includes(query) ||
        entry.source.toLowerCase().includes(query) ||
        vitalsText.includes(query)
      );
    });
  }, [sharedWithMe, sharedWithMeSearch]);
  const selectedSharedWithMe = React.useMemo(() => {
    if (filteredSharedWithMe.length === 0) return null;
    return (
      filteredSharedWithMe.find((entry) => entry.id === selectedSharedWithMeId) ??
      filteredSharedWithMe[0]
    );
  }, [filteredSharedWithMe, selectedSharedWithMeId]);
  const selectedSharedByMe = React.useMemo(() => {
    if (filteredSharedByMe.length === 0) return null;
    return (
      filteredSharedByMe.find((entry) => entry.id === selectedSharedByMeId) ??
      filteredSharedByMe[0]
    );
  }, [filteredSharedByMe, selectedSharedByMeId]);

  const selectedVitalLabels = React.useMemo(
    () => selectedVitals.map((id) => VITAL_LABEL[id]),
    [selectedVitals]
  );
  const selectedChannelsLabel = React.useMemo(
    () => getChannelLabel(sendViaApp, sendViaEmail),
    [sendViaApp, sendViaEmail]
  );
  const consentPurposeText = React.useMemo(() => note.trim(), [note]);
  const consentStepReady = React.useMemo(
    () =>
      Boolean(selectedProfileId) &&
      recipientName.trim().length > 0 &&
      selectedVitals.length > 0 &&
      consentPurposeText.length > 0,
    [selectedProfileId, recipientName, selectedVitals, consentPurposeText]
  );
  const hasConsentSignatureMismatch = React.useMemo(() => {
    if (!consentSignature.trim()) return false;
    return consentSignature.trim().toLowerCase() !== expectedConsentSigner;
  }, [consentSignature, expectedConsentSigner]);
  const isConsentReady = React.useMemo(() => {
    const signedName = consentSignature.trim().toLowerCase();
    return (
      consentConfirmDataUse &&
      consentConfirmRevokeRights &&
      consentConfirmScope &&
      Boolean(expectedConsentSigner) &&
      signedName === expectedConsentSigner
    );
  }, [
    consentConfirmDataUse,
    consentConfirmRevokeRights,
    consentConfirmScope,
    consentSignature,
    expectedConsentSigner,
  ]);
  React.useEffect(() => {
    if (filteredSharedWithMe.length === 0) return;
    if (!filteredSharedWithMe.some((entry) => entry.id === selectedSharedWithMeId)) {
      setSelectedSharedWithMeId(filteredSharedWithMe[0].id);
    }
  }, [filteredSharedWithMe, selectedSharedWithMeId]);
  React.useEffect(() => {
    if (filteredSharedByMe.length === 0) return;
    if (!filteredSharedByMe.some((entry) => entry.id === selectedSharedByMeId)) {
      setSelectedSharedByMeId(filteredSharedByMe[0].id);
    }
  }, [filteredSharedByMe, selectedSharedByMeId]);

  const clearFormErrors = React.useCallback((keys: (keyof ShareFormErrors)[]) => {
    if (keys.length === 0) return;
    setFormErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  const validateShareForm = React.useCallback((): ShareFormErrors => {
    const errors: ShareFormErrors = {};
    const trimmedName = recipientName.trim();
    const trimmedEmail = recipientEmail.trim();
    const digitsOnlyMobile = recipientMobile.replace(/\D/g, '');

    if (!selectedProfileId) {
      errors.profile = 'Please select a patient profile first.';
    }
    if (!trimmedName) {
      errors.recipientName = 'Recipient name is required.';
    }
    if (selectedVitals.length === 0) {
      errors.vitals = 'Select at least one vital metric.';
    }
    if (shareWindowMode === 'period') {
      if (!rangeStart || !rangeEnd) {
        errors.dateRange = 'Start and end dates are required.';
      } else if (rangeStart > rangeEnd) {
        errors.dateRange = 'End date must be on or after start date.';
      }
    }
    if (!sendViaApp && !sendViaEmail) {
      errors.channel = 'Choose at least one sharing channel.';
    }
    if (sendViaApp) {
      if (!recipientMobile.trim()) {
        errors.recipientMobile = 'Mobile number is required for app sharing.';
      } else if (digitsOnlyMobile.length < 10 || digitsOnlyMobile.length > 15) {
        errors.recipientMobile = 'Enter a valid mobile number.';
      }
    }
    if (sendViaEmail) {
      if (!trimmedEmail) {
        errors.recipientEmail = 'Email is required for email sharing.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        errors.recipientEmail = 'Enter a valid email address.';
      }
    }
    if (!consentPurposeText) {
      errors.consentPurpose = 'Please capture why this data is being shared.';
    } else if (consentPurposeText.length < 12) {
      errors.consentPurpose = 'Purpose should be at least 12 characters for audit clarity.';
    }

    return errors;
  }, [
    consentPurposeText,
    rangeEnd,
    rangeStart,
    recipientEmail,
    recipientMobile,
    recipientName,
    selectedProfileId,
    selectedVitals,
    sendViaApp,
    sendViaEmail,
    shareWindowMode,
  ]);

  const toggleVital = (vitalId: VitalMetricId) => {
    setSelectedVitals((prev) => {
      if (prev.includes(vitalId)) return prev.filter((id) => id !== vitalId);
      return [...prev, vitalId];
    });
    clearFormErrors(['vitals']);
  };

  const toggleAllVitals = () => {
    setSelectedVitals((prev) =>
      prev.length === VITAL_METRICS.length ? [] : VITAL_METRICS.map((metric) => metric.id)
    );
    clearFormErrors(['vitals']);
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
    setFormErrors({});
    setConsentOpen(false);
    setConsentConfirmDataUse(false);
    setConsentConfirmRevokeRights(false);
    setConsentConfirmScope(false);
    setConsentSignature('');
    setConsentError(null);
  };

  const handleRequestShare = () => {
    const validationErrors = validateShareForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSnackbar({
        open: true,
        message: 'Please fix the highlighted fields before sharing.',
        severity: 'warning',
      });
      return;
    }
    setFormErrors({});
    setConsentError(null);
    setConsentConfirmDataUse(false);
    setConsentConfirmRevokeRights(false);
    setConsentConfirmScope(false);
    setConsentSignature('');
    setConsentOpen(true);
  };

  const handleConfirmConsentAndShare = async () => {
    if (!selectedProfile) {
      setConsentError('Please select a patient profile first.');
      return;
    }
    if (!isConsentReady) {
      setConsentError(
        'Please accept all consent statements and sign with the exact patient name.'
      );
      return;
    }
    setConsentError(null);
    setConsentOpen(false);

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
      consentPurpose: consentPurposeText,
      consentAt: formatDateInput(new Date()),
      consentBy: profile.name,
      consentMethod: 'Digital Signature',
    };

    setSharedByMe((prev) => [nextEntry, ...prev]);
    setSelectedSharedByMeId(nextEntry.id);
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

  return (
    <PatientPortalWorkspaceCard current="share">
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '10px', overflow: 'hidden' }}>

        {/* ── Header card with tab strip ── */}
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

          {/* Tab strip — same curved style as other patient-portal tabs */}
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mx: { xs: -2.5, sm: -2.5 }, px: { xs: 1.5, sm: 2.5 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, value: ShareTab) => setActiveTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  minHeight: 44,
                  px: 1.5,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab value="share" label="Share Vitals" icon={<ShareIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
              <Tab value="shared-with-me" label={`Shared With Me (${sharedWithMe.length})`} icon={<ShieldOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
              <Tab value="shared-by-me" label={`Shared By Me (${sharedByMe.length})`} icon={<GppGoodOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            </Tabs>
          </Box>
        </Box>

        {/* ── Tab content area ── */}
        <Box sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: '22px',
          border: '1px solid',
          borderColor: 'divider',
          p: { xs: 1.25, sm: 1.5 },
        }}>

          {/* ══ Share Vitals tab ══ */}
          {activeTab === 'share' && (
            <Box
              sx={{
                display: 'grid',
                gap: '10px',
                gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
                minHeight: 0,
                height: '100%',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.6} flexWrap="wrap" sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label="1. Select Patient"
                    sx={{
                      height: 28,
                      borderRadius: 999,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.24),
                      color: 'primary.main',
                      fontWeight: 800,
                    }}
                  />
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Chip
                    size="small"
                    label="2. Configure and Share"
                    sx={{
                      height: 28,
                      borderRadius: 999,
                      bgcolor: selectedProfile
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.grey[500], 0.07),
                      border: '1px solid',
                      borderColor: selectedProfile
                        ? alpha(theme.palette.primary.main, 0.22)
                        : alpha(theme.palette.grey[500], 0.22),
                      color: selectedProfile ? 'primary.main' : 'text.secondary',
                      fontWeight: 800,
                    }}
                  />
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Chip
                    size="small"
                    label="3. Patient Consent"
                    sx={{
                      height: 28,
                      borderRadius: 999,
                      bgcolor: consentStepReady
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.grey[500], 0.07),
                      border: '1px solid',
                      borderColor: consentStepReady
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.grey[500], 0.22),
                      color: consentStepReady ? 'success.dark' : 'text.secondary',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    },
                  }}
                />

                  <Stack spacing={0.75} sx={{ mt: 1, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}>
                  {filteredProfiles.map((profile) => {
                    const selected = profile.id === selectedProfileId;
                    return (
                      <Box
                        key={profile.id}
                          onClick={() => {
                            setSelectedProfileId(profile.id);
                            clearFormErrors(['profile']);
                          }}
                        sx={{
                          border: '1px solid',
                          borderColor: selected ? alpha(theme.palette.primary.main, 0.45) : 'divider',
                          borderRadius: 1.8,
                          p: 0.95,
                          cursor: 'pointer',
                          backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
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
                                  height: 17,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.dark',
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {maskMobileNumber(profile.phone)}
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
                  {formErrors.profile && (
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, mt: 0.6 }}>
                      {formErrors.profile}
                    </Typography>
                  )}
                </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                {!selectedProfile && (
                  <Alert severity="info" sx={{ borderRadius: 1.4, mb: 1 }}>
                    Select a profile first to continue.
                  </Alert>
                )}

                <Box
                  sx={{
                    opacity: selectedProfile ? 1 : 0.56,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    flex: 1,
                  }}
                >
                  <Stack spacing={1} sx={{ minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}>
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
                          onChange={(event) => {
                            setRangeStart(event.target.value);
                            clearFormErrors(['dateRange']);
                          }}
                          error={Boolean(formErrors.dateRange)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          type="date"
                          label="To"
                          value={rangeEnd}
                          onChange={(event) => {
                            setRangeEnd(event.target.value);
                            clearFormErrors(['dateRange']);
                          }}
                          error={Boolean(formErrors.dateRange)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.4,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.info.main, 0.28),
                          bgcolor: alpha(theme.palette.info.main, 0.07),
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 700 }}>
                          Continuous mode keeps sharing active until you pause or revoke.
                        </Typography>
                      </Box>
                    )}
                    {formErrors.dateRange && (
                      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, mt: -0.2 }}>
                        {formErrors.dateRange}
                      </Typography>
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
                            height: 19,
                            fontSize: 10,
                            fontWeight: 700,
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
                              borderRadius: 1.3,
                              border: '1px solid',
                              borderColor: selected ? alpha(metric.color, 0.34) : alpha(theme.palette.primary.main, 0.14),
                              backgroundColor: selected ? alpha(metric.color, 0.08) : alpha(theme.palette.grey[100], 0.35),
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
                                    width: 24,
                                    height: 24,
                                    borderRadius: 1,
                                    display: 'grid',
                                    placeItems: 'center',
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
                    {formErrors.vitals && (
                      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, mt: -0.2 }}>
                        {formErrors.vitals}
                      </Typography>
                    )}

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
                        onChange={(event) => {
                          setRecipientName(event.target.value);
                          clearFormErrors(['recipientName']);
                        }}
                        error={Boolean(formErrors.recipientName)}
                        helperText={formErrors.recipientName}
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
                          flex: 1,
                          p: 0.8,
                          borderRadius: 1.4,
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
                          <Switch
                            checked={sendViaApp}
                            onChange={(event) => {
                              setSendViaApp(event.target.checked);
                              clearFormErrors(['channel', 'recipientMobile']);
                            }}
                            size="small"
                          />
                        </Stack>
                        <TextField
                          size="small"
                          placeholder="+91 98XXXXXXXX"
                          value={recipientMobile}
                          onChange={(event) => {
                            setRecipientMobile(event.target.value);
                            clearFormErrors(['recipientMobile', 'channel']);
                          }}
                          disabled={!sendViaApp}
                          error={Boolean(sendViaApp && formErrors.recipientMobile)}
                          helperText={sendViaApp ? formErrors.recipientMobile : ''}
                          fullWidth
                          sx={{ mt: 0.8 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          p: 0.8,
                          borderRadius: 1.4,
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
                          <Switch
                            checked={sendViaEmail}
                            onChange={(event) => {
                              setSendViaEmail(event.target.checked);
                              clearFormErrors(['channel', 'recipientEmail']);
                            }}
                            size="small"
                          />
                        </Stack>
                        <TextField
                          size="small"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(event) => {
                            setRecipientEmail(event.target.value);
                            clearFormErrors(['recipientEmail', 'channel']);
                          }}
                          disabled={!sendViaEmail}
                          error={Boolean(sendViaEmail && formErrors.recipientEmail)}
                          helperText={sendViaEmail ? formErrors.recipientEmail : ''}
                          fullWidth
                          sx={{ mt: 0.8 }}
                        />
                      </Box>
                    </Stack>
                    {formErrors.channel && (
                      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, mt: -0.2 }}>
                        {formErrors.channel}
                      </Typography>
                    )}
                    <TextField
                      size="small"
                      label="Purpose of Sharing (for consent log)"
                      placeholder="Describe why this recipient needs access to these vitals"
                      value={note}
                      onChange={(event) => {
                        setNote(event.target.value);
                        clearFormErrors(['consentPurpose']);
                      }}
                      error={Boolean(formErrors.consentPurpose)}
                      helperText={
                        formErrors.consentPurpose ||
                        'This reason is shown in the patient consent summary and audit trail.'
                      }
                      multiline
                      minRows={2}
                      fullWidth
                    />
                    <Alert severity="info" icon={<GppGoodOutlinedIcon fontSize="small" />} sx={{ borderRadius: 1.4 }}>
                      Final sharing happens only after patient consent in the next step.
                    </Alert>
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
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
                      onClick={handleRequestShare}
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <ShareIcon sx={{ fontSize: 14 }} />}
                      sx={{ textTransform: 'none', fontWeight: 700, minWidth: 130 }}
                    >
                      {isSubmitting ? 'Sharing...' : 'Review Consent & Share'}
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          )}

          {/* ══ Shared With Me tab ══ */}
          {activeTab === 'shared-with-me' && (
            <Box
              sx={{
                display: 'grid',
                gap: '10px',
                gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
                minHeight: 0,
                height: '100%',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Incoming Shares
                  </Typography>
                  <Chip
                    size="small"
                    label={`${filteredSharedWithMe.length}`}
                    sx={{
                      height: 19,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.dark',
                    }}
                  />
                </Stack>

                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search by doctor, source, role or vital"
                  value={sharedWithMeSearch}
                  onChange={(event) => setSharedWithMeSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack
                  spacing={0.75}
                  sx={{ mt: 1, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}
                >
                  {filteredSharedWithMe.map((entry) => {
                    const selected = selectedSharedWithMe?.id === entry.id;
                    return (
                      <Box
                        key={entry.id}
                        onClick={() => setSelectedSharedWithMeId(entry.id)}
                        sx={{
                          border: '1px solid',
                          borderColor: selected
                            ? alpha(theme.palette.primary.main, 0.45)
                            : 'divider',
                          borderRadius: 1.8,
                          p: 0.95,
                          cursor: 'pointer',
                          backgroundColor: selected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'background.paper',
                          transition: 'all 0.16s ease',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.35),
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="space-between">
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {entry.sharedBy}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {entry.source}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={entry.status}
                            sx={{
                              height: 17,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor:
                                entry.status === 'Active'
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.warning.main, 0.12),
                              color:
                                entry.status === 'Active'
                                  ? 'success.dark'
                                  : 'warning.dark',
                            }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                  {filteredSharedWithMe.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: 1.6 }}>
                      No incoming shares found.
                    </Alert>
                  )}
                </Stack>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                {!selectedSharedWithMe && (
                  <Alert severity="info" sx={{ borderRadius: 1.4 }}>
                    Select a shared record from the left panel.
                  </Alert>
                )}

                {selectedSharedWithMe && (
                  <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.9}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ pb: 0.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                          {selectedSharedWithMe.sharedBy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {selectedSharedWithMe.role} • {selectedSharedWithMe.source}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          size="small"
                          label={selectedSharedWithMe.status}
                          sx={{
                            height: 19,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor:
                              selectedSharedWithMe.status === 'Active'
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.12),
                            color:
                              selectedSharedWithMe.status === 'Active'
                                ? 'success.dark'
                                : 'warning.dark',
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setSnackbar({
                              open: true,
                              message: `Opening shared vitals from ${selectedSharedWithMe.sharedBy}.`,
                              severity: 'info',
                            })
                          }
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          View Data
                        </Button>
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Granted: {formatDisplayDate(selectedSharedWithMe.grantedOn)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires:{' '}
                          {selectedSharedWithMe.expiresOn
                            ? formatDisplayDate(selectedSharedWithMe.expiresOn)
                            : 'No expiry'}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                        Shared Vitals
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 0.7,
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        }}
                      >
                        {selectedSharedWithMe.vitals.map((id) => {
                          const metric = VITAL_METRICS.find((item) => item.id === id);
                          if (!metric) return null;
                          return (
                            <Box
                              key={`${selectedSharedWithMe.id}-${id}`}
                              sx={{
                                p: 0.8,
                                borderRadius: 1.4,
                                border: '1px solid',
                                borderColor: alpha(metric.color, 0.24),
                                backgroundColor: alpha(metric.color, 0.05),
                              }}
                            >
                              <Stack direction="row" spacing={0.8} alignItems="center">
                                <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                                    {metric.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {VITAL_DESCRIPTION[id]}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Stack>
                )}
              </Card>
            </Box>
          )}

          {/* ══ Shared By Me tab ══ */}
          {activeTab === 'shared-by-me' && (
            <Box
              sx={{
                display: 'grid',
                gap: '10px',
                gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
                minHeight: 0,
                height: '100%',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Outgoing Shares
                  </Typography>
                  <Chip
                    size="small"
                    label={`${filteredSharedByMe.length}`}
                    sx={{
                      height: 19,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.dark',
                    }}
                  />
                </Stack>

                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search by profile, recipient, channel or metric"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack
                  spacing={0.75}
                  sx={{ mt: 1, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}
                >
                  {filteredSharedByMe.map((entry) => {
                    const selected = selectedSharedByMe?.id === entry.id;
                    return (
                      <Box
                        key={entry.id}
                        onClick={() => setSelectedSharedByMeId(entry.id)}
                        sx={{
                          border: '1px solid',
                          borderColor: selected
                            ? alpha(theme.palette.primary.main, 0.45)
                            : 'divider',
                          borderRadius: 1.8,
                          p: 0.95,
                          cursor: 'pointer',
                          backgroundColor: selected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'background.paper',
                          transition: 'all 0.16s ease',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.35),
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="space-between">
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }} noWrap>
                              {entry.profileName} → {entry.recipientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {entry.channel} • {formatDisplayDate(entry.sharedOn)}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={entry.status}
                            sx={{
                              height: 17,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: statusBackground(theme, entry.status),
                              color: statusColor(entry.status),
                            }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                  {filteredSharedByMe.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: 1.6 }}>
                      No shared records found for this search.
                    </Alert>
                  )}
                </Stack>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  borderRadius: '16px',
                  p: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'none',
                }}
              >
                {!selectedSharedByMe && (
                  <Alert severity="info" sx={{ borderRadius: 1.4 }}>
                    Select a shared record from the left panel.
                  </Alert>
                )}

                {selectedSharedByMe && (
                  <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.9}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ pb: 0.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                          {selectedSharedByMe.recipientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {selectedSharedByMe.profileName} • {selectedSharedByMe.channel}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          size="small"
                          label={selectedSharedByMe.status}
                          sx={{
                            height: 19,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: statusBackground(theme, selectedSharedByMe.status),
                            color: statusColor(selectedSharedByMe.status),
                          }}
                        />
                        <Switch
                          size="small"
                          checked={selectedSharedByMe.status === 'Active'}
                          disabled={
                            selectedSharedByMe.status === 'Revoked' ||
                            selectedSharedByMe.status === 'Expired'
                          }
                          onChange={(event) =>
                            handleToggleShareStatus(
                              selectedSharedByMe.id,
                              event.target.checked
                            )
                          }
                        />
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Period: {selectedSharedByMe.periodLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        Recipient: {selectedSharedByMe.recipientType} •{' '}
                        {selectedSharedByMe.recipientMobile ? maskMobileNumber(selectedSharedByMe.recipientMobile) : 'No mobile'} •{' '}
                        {selectedSharedByMe.recipientEmail || 'No email'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        Consent: {selectedSharedByMe.consentMethod} by {selectedSharedByMe.consentBy} on{' '}
                        {formatDisplayDate(selectedSharedByMe.consentAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        Purpose: {selectedSharedByMe.consentPurpose}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.2, ...scrollbar }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                        Vital Access
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 0.7,
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        }}
                      >
                        {VITAL_METRICS.map((metric) => (
                          <Box
                            key={`${selectedSharedByMe.id}-${metric.id}`}
                            sx={{
                              p: 0.8,
                              borderRadius: 1.4,
                              border: '1px solid',
                              borderColor: alpha(metric.color, 0.24),
                              backgroundColor: alpha(metric.color, 0.05),
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                                <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                                  {metric.label}
                                </Typography>
                              </Stack>
                              <Switch
                                size="small"
                                checked={selectedSharedByMe.vitalAccess[metric.id]}
                                disabled={selectedSharedByMe.status !== 'Active'}
                                onChange={() =>
                                  handleToggleShareVital(selectedSharedByMe.id, metric.id)
                                }
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" sx={{ pt: 0.8 }}>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={selectedSharedByMe.status === 'Revoked'}
                        onClick={() => handleRevoke(selectedSharedByMe.id)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                        startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                      >
                        {selectedSharedByMe.status === 'Revoked' ? 'Revoked' : 'Revoke Access'}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      <CommonDialog
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        maxWidth="sm"
        title="Patient Consent Required"
        subtitle="Review and confirm before sharing vitals."
        icon={<GppGoodOutlinedIcon sx={{ fontSize: 18 }} />}
        onConfirm={handleConfirmConsentAndShare}
        confirmLabel={isSubmitting ? 'Sharing...' : 'Confirm and Share'}
        confirmButtonProps={{ disabled: !isConsentReady || isSubmitting }}
        cancelLabel="Cancel"
        contentDividers
      >
        <Stack spacing={1.25}>
          <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ borderRadius: 1.4 }}>
            Consent is mandatory. Patient can revoke this access anytime from Shared By Me.
          </Alert>

          <Box
            sx={{
              p: 1.1,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              CONSENT SUMMARY
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.6 }}>
              Patient: {selectedProfile?.name || 'Not selected'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Recipient: {recipientName.trim() || '—'} ({recipientType.trim() || 'Provider'})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Window:{' '}
              {shareWindowMode === 'continuous'
                ? 'Continuous'
                : `${formatDisplayDate(rangeStart)} - ${formatDisplayDate(rangeEnd)}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Channels: {selectedChannelsLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Purpose: {consentPurposeText || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Vitals: {selectedVitalLabels.join(', ') || 'None'}
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={consentConfirmDataUse}
                onChange={(event) => {
                  setConsentConfirmDataUse(event.target.checked);
                  if (consentError) setConsentError(null);
                }}
              />
            }
            label={
              <Typography variant="body2">
                I authorize sharing of selected vitals with the specified recipient.
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={consentConfirmRevokeRights}
                onChange={(event) => {
                  setConsentConfirmRevokeRights(event.target.checked);
                  if (consentError) setConsentError(null);
                }}
              />
            }
            label={
              <Typography variant="body2">
                I understand this access can be paused/revoked later by the patient.
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={consentConfirmScope}
                onChange={(event) => {
                  setConsentConfirmScope(event.target.checked);
                  if (consentError) setConsentError(null);
                }}
              />
            }
            label={
              <Typography variant="body2">
                I confirm patient reviewed recipient, channels, duration, and purpose before signing.
              </Typography>
            }
          />

          <TextField
            size="small"
            label="Patient Signature"
            placeholder={selectedProfile ? `Type "${selectedProfile.name}"` : 'Select patient first'}
            value={consentSignature}
            onChange={(event) => {
              setConsentSignature(event.target.value);
              if (consentError) setConsentError(null);
            }}
            disabled={!selectedProfile}
            error={hasConsentSignatureMismatch}
            helperText={
              selectedProfile
                ? `For consent, type exact name: ${selectedProfile.name}`
                : 'Please select a patient profile first.'
            }
            fullWidth
          />

          {consentError && (
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
              {consentError}
            </Typography>
          )}
        </Stack>
      </CommonDialog>

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
