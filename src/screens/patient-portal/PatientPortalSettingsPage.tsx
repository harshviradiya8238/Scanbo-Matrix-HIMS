'use client';

import * as React from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, Alert, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import type { Theme } from '@mui/material/styles';
import { Switch, Select } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {
  Add as AddIcon,
  Badge as BadgeIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoOutlinedIcon,
  HealthAndSafety as HealthIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  PhoneIphone as PhoneIphoneIcon,
  QrCode2 as QrCode2Icon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { INSURANCE_DETAILS } from './patient-portal-mock-data';
import type { InsuranceDetail } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader } from './patient-portal-styles';

interface NotificationPref { id: string; label: string; description: string; defaultOn: boolean; }
const NOTIFICATION_PREFS: NotificationPref[] = [
  { id: 'appt-reminders',  label: 'Appointment Reminders', description: 'Get notified before upcoming appointments', defaultOn: true  },
  { id: 'med-alerts',      label: 'Medication Alerts',     description: 'Reminders for medication doses',           defaultOn: true  },
  { id: 'lab-ready',       label: 'Lab Result Ready',      description: 'Notify when lab results are available',    defaultOn: true  },
  { id: 'report-shared',   label: 'Report Shared',         description: 'Notify when a doctor shares a report',     defaultOn: true  },
  { id: 'bill-reminders',  label: 'Bill Reminders',        description: 'Alerts for pending or overdue bills',      defaultOn: false },
  { id: 'doctor-messages', label: 'Doctor Messages',       description: 'Notifications for new messages from doctors', defaultOn: true },
];

const SHARE_OPTIONS = [
  { id: 'records',       label: 'Medical Records',   desc: 'Share records with authorized doctors' },
  { id: 'lab-reports',   label: 'Lab Reports',       desc: 'Share lab reports with your care team' },
  { id: 'prescriptions', label: 'Prescriptions',     desc: 'Allow pharmacy access to prescriptions' },
  { id: 'vitals',        label: 'Vitals & Wearables',desc: 'Share vitals data from smart devices' },
];

function parseCoverageValue(value: string): number {
  const raw = value.toLowerCase();
  const amount = Number((raw.match(/(\d+(\.\d+)?)/) ?? [])[1] ?? 0);
  if (raw.includes('lakh')) return amount * 100000;
  if (raw.includes('crore')) return amount * 10000000;
  return amount;
}

function parseValidTillDate(value: string): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(`01 ${value.trim()}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatCoverageTotal(amount: number): string {
  if (amount >= 100000) {
    return `Rs ${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} L`;
  }
  return `Rs ${amount.toLocaleString('en-IN')}`;
}

function insuranceStatusTone(
  status: InsuranceDetail['status'],
  theme: Theme
) {
  if (status === 'Active') {
    return {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.3),
    };
  }
  if (status === 'Pending') {
    return {
      bg: alpha(theme.palette.warning.main, 0.14),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.35),
    };
  }
  return {
    bg: alpha(theme.palette.error.main, 0.12),
    color: theme.palette.error.dark,
    border: alpha(theme.palette.error.main, 0.3),
  };
}

function formatAadhaarNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function maskAadhaarNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'XXXX XXXX 4521';
  const suffix = digits.slice(-4);
  return `XXXX XXXX ${suffix.padStart(4, 'X')}`;
}

export default function PatientPortalSettingsPage() {
  const theme = useTheme();
  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);

  const [settingsTab, setSettingsTab] = React.useState(0);
  const [notifToggles, setNotifToggles] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, p.defaultOn]))
  );
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [loginAlerts, setLoginAlerts] = React.useState(true);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [language, setLanguage] = React.useState('en');
  const [dateFormat, setDateFormat] = React.useState('dd/mm/yyyy');
  const [shareToggles, setShareToggles] = React.useState<Record<string, boolean>>({ records: true, 'lab-reports': true, prescriptions: false, vitals: true });
  const [abhaLinkMode, setAbhaLinkMode] = React.useState<'aadhaar-otp' | 'mobile' | 'existing-abha'>('aadhaar-otp');
  const [aadhaarForm, setAadhaarForm] = React.useState({ aadhaar: '', fullName: 'Ravi Patel', dob: '1990-03-15', gender: 'Male' });
  const [mobileLinkForm, setMobileLinkForm] = React.useState({ mobile: '', fullName: 'Ravi Patel' });
  const [existingAbhaNumber, setExistingAbhaNumber] = React.useState('');
  const [insurance, setInsurance] = React.useState<InsuranceDetail[]>(INSURANCE_DETAILS.map(i => ({ ...i })));
  const [insuranceFilter, setInsuranceFilter] = React.useState<'all' | 'active' | 'expired'>('all');
  const [selectedInsuranceId, setSelectedInsuranceId] = React.useState<string | null>(INSURANCE_DETAILS[0]?.id ?? null);
  const [addInsuranceOpen, setAddInsuranceOpen] = React.useState(false);
  const [newInsurance, setNewInsurance] = React.useState<Partial<InsuranceDetail>>({});
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const toggleNotif = (id: string) => setNotifToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleShare = (id: string) => setShareToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const insuranceStats = React.useMemo(() => {
    const total = insurance.length;
    const active = insurance.filter((ins) => ins.status === 'Active').length;
    const coverage = insurance.reduce((sum, ins) => sum + parseCoverageValue(ins.coverage), 0);
    const renewalCandidates = insurance
      .map((ins) => ({ ins, date: parseValidTillDate(ins.validTill) }))
      .filter((item): item is { ins: InsuranceDetail; date: Date } => !!item.date)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      total,
      active,
      coverageLabel: formatCoverageTotal(coverage),
      nextRenewal: renewalCandidates[0]?.ins.validTill ?? 'NA',
    };
  }, [insurance]);

  const filteredInsurance = React.useMemo(() => {
    if (insuranceFilter === 'active') return insurance.filter((ins) => ins.status === 'Active');
    if (insuranceFilter === 'expired') return insurance.filter((ins) => ins.status === 'Expired');
    return insurance;
  }, [insurance, insuranceFilter]);

  React.useEffect(() => {
    if (filteredInsurance.length === 0) {
      setSelectedInsuranceId(null);
      return;
    }
    if (!selectedInsuranceId || !filteredInsurance.some((ins) => ins.id === selectedInsuranceId)) {
      setSelectedInsuranceId(filteredInsurance[0].id);
    }
  }, [filteredInsurance, selectedInsuranceId]);

  const selectedInsurance = React.useMemo(
    () => filteredInsurance.find((ins) => ins.id === selectedInsuranceId) ?? null,
    [filteredInsurance, selectedInsuranceId]
  );
  const aadhaarMaskedNumber = React.useMemo(() => maskAadhaarNumber(aadhaarForm.aadhaar), [aadhaarForm.aadhaar]);
  const abhaDisplayNumber = React.useMemo(() => {
    const raw = existingAbhaNumber.trim();
    if (!raw) return '91-XXXX-XXXX-XXXX';
    return raw;
  }, [existingAbhaNumber]);

  const handleAddInsurance = () => {
    if (!newInsurance.provider || !newInsurance.policyNo) return;
    const ins: InsuranceDetail = { id: `ins-${Date.now()}`, provider: newInsurance.provider ?? '', policyNo: newInsurance.policyNo ?? '', validTill: newInsurance.validTill ?? '', coverage: newInsurance.coverage ?? '', status: 'Active' };
    setInsurance(prev => [...prev, ins]);
    setAddInsuranceOpen(false);
    setNewInsurance({});
    setSnackbar({ open: true, message: `Insurance policy added` });
  };

  const removeInsurance = (id: string) => setInsurance(prev => prev.filter(i => i.id !== id));

  const TABS = [
    { label: 'Notifications', icon: <NotificationsIcon sx={{ fontSize: 16 }} /> },
    { label: 'Security',      icon: <SecurityIcon sx={{ fontSize: 16 }} /> },
    { label: 'Share',         icon: <ShareIcon sx={{ fontSize: 16 }} /> },
    { label: 'Insurance',     icon: <HealthIcon sx={{ fontSize: 16 }} /> },
    { label: 'Aadhaar / ABHA',icon: <BadgeIcon sx={{ fontSize: 16 }} /> },
    { label: 'Preferences',   icon: <SettingsIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <PatientPortalWorkspaceCard current="settings">
      {/* ── Vertical tab layout ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px minmax(0,1fr)' }, gap: 2, alignItems: 'start' }}>

        {/* Left tab bar */}
        <Card elevation={0} sx={{ ...sectionCard, p: 0 }}>
          <Tabs value={settingsTab} onChange={(_, v) => setSettingsTab(v)} orientation="vertical"
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 44, justifyContent: 'flex-start', alignItems: 'center', gap: 1, px: 2 }, '& .MuiTabs-indicator': { left: 0, right: 'auto', width: 3, borderRadius: '0 3px 3px 0' } }}>
            {TABS.map((t) => (
              <Tab key={t.label} icon={t.icon} iconPosition="start" label={
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <span>{t.label}</span>
                  {t.label === 'Aadhaar / ABHA' && <Chip label="Pending" size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.15), color: 'warning.dark', '& .MuiChip-label': { px: 0.75 } }} />}
                </Stack>
              } sx={{ minHeight: 44 }} />
            ))}
          </Tabs>
        </Card>

        {/* Right content */}
        <Stack spacing={2}>

          {/* ── Notifications ── */}
          {settingsTab === 0 && (
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <NotificationsIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notification Preferences</Typography>
                </Stack>
              </Box>
              {NOTIFICATION_PREFS.map((pref, idx) => (
                <Box key={pref.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: idx < NOTIFICATION_PREFS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{pref.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{pref.description}</Typography>
                  </Box>
                  <Switch checked={notifToggles[pref.id] ?? false} onChange={() => toggleNotif(pref.id)} color="primary" />
                </Box>
              ))}
            </Card>
          )}

          {/* ── Security ── */}
          {settingsTab === 1 && (
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SecurityIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Security</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Two-Factor Authentication</Typography>
                    <Typography variant="caption" color="text.secondary">Add an extra layer of security</Typography>
                  </Box>
                  <Switch checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Login Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">Get notified when account is accessed from a new device</Typography>
                  </Box>
                  <Switch checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} color="primary" />
                </Box>
                <Box sx={{ pt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>Change Password</Typography>
                  <Stack spacing={1.5}>
                    <TextField size="small" type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth />
                    <TextField size="small" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
                    <TextField size="small" type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
                    <Button variant="contained" disableElevation size="small" sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }} onClick={() => setSnackbar({ open: true, message: 'Password updated successfully' })}>
                      Update Password
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Card>
          )}

          {/* ── Share ── */}
          {settingsTab === 2 && (
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShareIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Data Sharing Preferences</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.6 }}>
                  Control which health data is shared with your care team, labs, and authorized providers.
                </Typography>
                <Stack spacing={0}>
                  {SHARE_OPTIONS.map((opt, idx) => (
                    <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: idx < SHARE_OPTIONS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                      </Box>
                      <Switch checked={shareToggles[opt.id] ?? false} onChange={() => toggleShare(opt.id)} color="primary" />
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.07), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.2) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.dark' }}>
                    Your data is shared only with providers you have authorized. You can revoke access at any time.
                  </Typography>
                </Box>
              </Box>
            </Card>
          )}

          {/* ── Insurance ── */}
          {settingsTab === 3 && (
            <Card elevation={0} sx={{ ...sectionCard, overflow: 'hidden' }}>
              <Box
                sx={{
                  ...sectionHeader,
                  py: 1.35,
                  bgcolor: alpha(theme.palette.primary.main, 0.035),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                  <Stack direction="row" spacing={1.1} alignItems="center">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <HealthIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Insurance Details
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Manage linked policies and coverage
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setAddInsuranceOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 99,
                      fontSize: 12.5,
                      minHeight: 38,
                      px: 2,
                    }}
                  >
                    Add Policy
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  {[
                    {
                      label: 'Total Policies',
                      value: insuranceStats.total,
                      sub: 'all plans',
                      color: theme.palette.primary.main,
                      bg: alpha(theme.palette.primary.main, 0.06),
                    },
                    {
                      label: 'Active',
                      value: insuranceStats.active,
                      sub: 'currently valid',
                      color: theme.palette.success.main,
                      bg: alpha(theme.palette.success.main, 0.08),
                    },
                    {
                      label: 'Total Coverage',
                      value: insuranceStats.coverageLabel,
                      sub: 'sum insured',
                      color: theme.palette.info.main,
                      bg: alpha(theme.palette.info.main, 0.08),
                    },
                    {
                      label: 'Next Renewal',
                      value: insuranceStats.nextRenewal,
                      sub: 'earliest expiry',
                      color: theme.palette.warning.main,
                      bg: alpha(theme.palette.warning.main, 0.08),
                    },
                  ].map((card) => (
                    <Box
                      key={card.label}
                      sx={{
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.14),
                        borderRadius: 2,
                        p: 1.1,
                        bgcolor: card.bg,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        {card.label}
                      </Typography>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 800, lineHeight: 1.15 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.sub}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 340px' },
                    gap: 1.5,
                    alignItems: 'start',
                  }}
                >
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Your Plans
                      </Typography>
                      <Stack direction="row" spacing={0.6}>
                        {([
                          { id: 'all', label: 'All' },
                          { id: 'active', label: 'Active' },
                          { id: 'expired', label: 'Expired' },
                        ] as const).map((filter) => (
                          <Chip
                            key={filter.id}
                            size="small"
                            label={filter.label}
                            clickable
                            onClick={() => setInsuranceFilter(filter.id)}
                            color={insuranceFilter === filter.id ? 'primary' : 'default'}
                            variant={insuranceFilter === filter.id ? 'filled' : 'outlined'}
                            sx={{
                              fontSize: 11,
                              height: 26,
                              fontWeight: 700,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>

                    {filteredInsurance.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.16),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.4 }}>
                          No policies found
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Change filter or add a new policy.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1}>
                        {filteredInsurance.map((ins, idx) => {
                          const tone = insuranceStatusTone(ins.status, theme);
                          const selected = ins.id === selectedInsuranceId;
                          const initials = ins.provider
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')
                            .toUpperCase();
                          const usage = Math.min(92, 18 + idx * 16);
                          const coverageAmount = parseCoverageValue(ins.coverage);
                          const claimedAmount = Math.round((coverageAmount * usage) / 100);

                          return (
                            <Box
                              key={ins.id}
                              onClick={() => setSelectedInsuranceId(ins.id)}
                              sx={{
                                border: '1px solid',
                                borderColor: selected
                                  ? alpha(theme.palette.primary.main, 0.55)
                                  : alpha(theme.palette.primary.main, 0.16),
                                borderRadius: 2,
                                p: 1.2,
                                cursor: 'pointer',
                                bgcolor: selected
                                  ? alpha(theme.palette.primary.main, 0.05)
                                  : 'background.paper',
                                transition: 'all 0.16s ease',
                                '&:hover': {
                                  borderColor: alpha(theme.palette.primary.main, 0.35),
                                  boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.08)}`,
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                                    color: 'primary.main',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {initials}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                      {ins.provider}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={ins.status}
                                      sx={{
                                        height: 18,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        bgcolor: tone.bg,
                                        color: tone.color,
                                        border: `1px solid ${tone.border}`,
                                        '& .MuiChip-label': { px: 0.8 },
                                      }}
                                    />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    {ins.policyNo} · Valid till {ins.validTill}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Coverage: {ins.coverage}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    minWidth: 0,
                                    width: 28,
                                    height: 28,
                                    p: 0,
                                    borderRadius: '50%',
                                    borderColor: alpha(theme.palette.error.main, 0.3),
                                    bgcolor: alpha(theme.palette.error.main, 0.03),
                                    '&:hover': {
                                      borderColor: alpha(theme.palette.error.main, 0.45),
                                      bgcolor: alpha(theme.palette.error.main, 0.08),
                                    },
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeInsurance(ins.id);
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 14, color: 'error.main' }} />
                                </Button>
                              </Stack>

                              <Box sx={{ mt: 0.9 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.45 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Claimed: Rs {claimedAmount.toLocaleString('en-IN')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {usage}% used
                                  </Typography>
                                </Stack>
                                <Box sx={{ height: 6, borderRadius: 99, bgcolor: alpha(theme.palette.primary.main, 0.1), overflow: 'hidden' }}>
                                  <Box
                                    sx={{
                                      width: `${usage}%`,
                                      height: '100%',
                                      borderRadius: 99,
                                      background:
                                        ins.status === 'Expired'
                                          ? `linear-gradient(90deg, ${alpha(theme.palette.warning.main, 0.75)}, ${alpha(theme.palette.warning.dark, 0.85)})`
                                          : `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.95)})`,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: { lg: 'sticky' },
                      top: { lg: 12 },
                    }}
                  >
                    {!selectedInsurance ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <HealthIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.disabled, 0.6), mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Policy Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click any policy to view full details.
                        </Typography>
                      </Box>
                    ) : (
                      (() => {
                        const tone = insuranceStatusTone(selectedInsurance.status, theme);
                        const usageBaseIndex = Math.max(
                          0,
                          insurance.findIndex((item) => item.id === selectedInsurance.id)
                        );
                        const usage = Math.min(92, 18 + usageBaseIndex * 16);
                        const coverageAmount = parseCoverageValue(selectedInsurance.coverage);
                        const usedAmount = Math.round((coverageAmount * usage) / 100);
                        const policyType = selectedInsurance.provider.toLowerCase().includes('pmjay')
                          ? 'Government Scheme'
                          : 'Private Insurance';
                        const initials = selectedInsurance.provider
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')
                          .toUpperCase();

                        return (
                          <>
                            <Box
                              sx={{
                                p: 2,
                                textAlign: 'center',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                background: `linear-gradient(170deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.paper} 68%)`,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  mx: 'auto',
                                  mb: 1,
                                  bgcolor: theme.palette.primary.main,
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: 22,
                                  display: 'grid',
                                  placeItems: 'center',
                                }}
                              >
                                {initials}
                              </Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                {selectedInsurance.provider}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {selectedInsurance.policyNo}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  size="small"
                                  label={selectedInsurance.status}
                                  sx={{
                                    height: 20,
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    bgcolor: tone.bg,
                                    color: tone.color,
                                    border: `1px solid ${tone.border}`,
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box sx={{ p: 1.6 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.8,
                                  mb: 0.9,
                                  display: 'block',
                                }}
                              >
                                Coverage Summary
                              </Typography>
                              <Stack spacing={0.8}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.secondary">Coverage</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {selectedInsurance.coverage}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.secondary">Used</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    Rs {usedAmount.toLocaleString('en-IN')}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.secondary">Policy Type</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {policyType}
                                  </Typography>
                                </Stack>
                              </Stack>
                              <Box sx={{ mt: 1 }}>
                                <Box sx={{ height: 8, borderRadius: 99, bgcolor: alpha(theme.palette.primary.main, 0.1), overflow: 'hidden' }}>
                                  <Box
                                    sx={{
                                      width: `${usage}%`,
                                      height: '100%',
                                      borderRadius: 99,
                                      background:
                                        selectedInsurance.status === 'Expired'
                                          ? `linear-gradient(90deg, ${alpha(theme.palette.warning.main, 0.75)}, ${alpha(theme.palette.warning.dark, 0.85)})`
                                          : `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.95)})`,
                                    }}
                                  />
                                </Box>
                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.45 }}>
                                  <Typography variant="caption" color="text.secondary">{usage}% used</Typography>
                                  <Typography variant="caption" color="text.secondary">Valid till {selectedInsurance.validTill}</Typography>
                                </Stack>
                              </Box>
                            </Box>

                            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                              <Stack spacing={0.8}>
                                <Button
                                  variant="contained"
                                  disableElevation
                                  size="small"
                                  sx={{ textTransform: 'none', fontWeight: 700 }}
                                  onClick={() => setSnackbar({ open: true, message: 'Insurance card download started' })}
                                >
                                  Download Card
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{ textTransform: 'none', fontWeight: 700 }}
                                  onClick={() => removeInsurance(selectedInsurance.id)}
                                >
                                  Remove Policy
                                </Button>
                              </Stack>
                            </Box>
                          </>
                        );
                      })()
                    )}
                  </Card>
                </Box>
              </Box>
            </Card>
          )}

          {/* ── Aadhaar / ABHA ── */}
          {settingsTab === 4 && (
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BadgeIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Aadhaar / ABHA</Typography>
                    <Chip label="Pending" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.15), color: 'warning.dark' }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600 }}>
                    National health identity verification
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ p: { xs: 1.25, md: 1.5 }, pt: { xs: 1, md: 1.25 } }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(310px, 0.95fr) minmax(0, 1.05fr)' },
                    gap: 1.5,
                    minHeight: { lg: 'min(590px, calc(100vh - 255px))' },
                    maxHeight: { lg: 'min(590px, calc(100vh - 255px))' },
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      p: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                      overflowY: 'auto',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 1.6,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.warning.main, 0.32),
                        bgcolor: alpha(theme.palette.warning.main, 0.09),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 18, color: 'warning.dark' }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.dark', display: 'block' }}>
                          OTP verification pending
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Step 2 complete karke Aadhaar/ABHA activate karein.
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        borderRadius: 2.5,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #1a237e 0%, #283593 42%, #1565c0 100%)',
                        px: 1.6,
                        py: 1.4,
                        boxShadow: theme.shadows[3],
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Box sx={{ position: 'absolute', right: -18, top: -22, width: 94, height: 94, borderRadius: '50%', border: '18px solid rgba(255,255,255,0.08)' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.35)', bgcolor: 'rgba(255,255,255,0.17)', display: 'grid', placeItems: 'center', fontSize: 16 }}>
                          🇮🇳
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, lineHeight: 1.2 }}>Government of India</Typography>
                          <Typography sx={{ fontSize: 9, opacity: 0.8, letterSpacing: 0.4 }}>Aadhaar</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 50, height: 62, borderRadius: 1.2, border: '1px solid rgba(255,255,255,0.35)', bgcolor: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 26 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{aadhaarForm.fullName || 'Ravi Patel'}</Typography>
                          <Typography sx={{ fontSize: 11, opacity: 0.82 }}>DOB: 15/03/1990 · Male</Typography>
                          <Typography sx={{ fontSize: 11, opacity: 0.82 }}>Gujarat, India</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.35, p: 0.9, borderRadius: 1.4, bgcolor: 'rgba(0,0,0,0.26)' }}>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 800, letterSpacing: 2 }}>{aadhaarMaskedNumber}</Typography>
                        <Chip label="Pending" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: '#fbbf24', color: '#78350f' }} />
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        borderRadius: 2.5,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #065f46 0%, #047857 52%, #0f766e 100%)',
                        px: 1.6,
                        py: 1.4,
                        boxShadow: theme.shadows[3],
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                            <VerifiedUserIcon sx={{ fontSize: 17 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, lineHeight: 1.1 }}>ABHA</Typography>
                            <Typography sx={{ fontSize: 9, opacity: 0.75, letterSpacing: 0.5 }}>Ayushman Bharat</Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ opacity: 0.55 }}>
                          <QrCode2Icon sx={{ fontSize: 28 }} />
                        </Box>
                      </Stack>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>{aadhaarForm.fullName || 'Ravi Patel'}</Typography>
                      <Typography sx={{ fontSize: 9, opacity: 0.75, letterSpacing: 0.7, textTransform: 'uppercase', mt: 0.45 }}>ABHA Number</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.1, fontFamily: 'monospace' }}>{abhaDisplayNumber}</Typography>
                      <Box sx={{ mt: 1.2, p: 0.9, borderRadius: 1.2, bgcolor: 'rgba(0,0,0,0.23)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.8 }}>
                        <Box>
                          <Typography sx={{ fontSize: 8, opacity: 0.7, letterSpacing: 0.4, textTransform: 'uppercase' }}>DOB</Typography>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>15/03/1990</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 8, opacity: 0.7, letterSpacing: 0.4, textTransform: 'uppercase' }}>Gender</Typography>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>Male</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 8, opacity: 0.7, letterSpacing: 0.4, textTransform: 'uppercase' }}>State</Typography>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>Gujarat</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
                      {[
                        { id: 'records', title: 'Digital Records', desc: 'Share instantly', color: alpha(theme.palette.primary.main, 0.1), icon: <ShareIcon sx={{ fontSize: 16 }} /> },
                        { id: 'pmjay', title: 'PMJAY Access', desc: 'Govt schemes', color: alpha(theme.palette.success.main, 0.1), icon: <VerifiedUserIcon sx={{ fontSize: 16 }} /> },
                        { id: 'claims', title: 'Cashless Claims', desc: 'Faster approvals', color: alpha(theme.palette.info.main, 0.11), icon: <HealthIcon sx={{ fontSize: 16 }} /> },
                      ].map((item) => (
                        <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1, textAlign: 'center' }}>
                          <Box sx={{ width: 27, height: 27, borderRadius: 1, display: 'grid', placeItems: 'center', mx: 'auto', mb: 0.65, bgcolor: item.color, color: 'primary.main' }}>
                            {item.icon}
                          </Box>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }}>{item.title}</Typography>
                          <Typography sx={{ fontSize: 9.5, color: 'text.secondary', mt: 0.3 }}>{item.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 0.5,
                      pl: { lg: 1.75 },
                      borderLeft: { lg: '1px solid' },
                      borderColor: { lg: 'divider' },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                      overflowY: 'auto',
                    }}
                  >
                    <Box sx={{ p: 0.2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.55, textTransform: 'uppercase' }}>
                        Verification Progress
                      </Typography>
                      <Stack direction="row" alignItems="center" sx={{ mt: 1, minWidth: 0 }}>
                        {[
                          { key: 'details', label: 'Details', state: 'done' as const },
                          { key: 'otp', label: 'OTP Verify', state: abhaLinkMode === 'existing-abha' ? ('done' as const) : ('active' as const) },
                          { key: 'abha', label: 'ABHA Card', state: abhaLinkMode === 'existing-abha' ? ('active' as const) : ('idle' as const) },
                        ].map((step, idx, arr) => (
                          <React.Fragment key={step.key}>
                            <Stack alignItems="center" spacing={0.45} sx={{ minWidth: 78 }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  border: '2px solid',
                                  borderColor:
                                    step.state === 'done'
                                      ? theme.palette.success.main
                                      : step.state === 'active'
                                        ? theme.palette.primary.main
                                        : alpha(theme.palette.text.primary, 0.2),
                                  bgcolor:
                                    step.state === 'done'
                                      ? theme.palette.success.main
                                      : step.state === 'active'
                                        ? theme.palette.primary.main
                                        : 'background.paper',
                                  color: step.state === 'idle' ? 'text.secondary' : '#fff',
                                }}
                              >
                                {step.state === 'done' ? '✓' : idx + 1}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: step.state === 'idle' ? 600 : 800,
                                  color: step.state === 'done' ? 'success.dark' : step.state === 'active' ? 'primary.main' : 'text.secondary',
                                }}
                              >
                                {step.label}
                              </Typography>
                            </Stack>
                            {idx < arr.length - 1 && (
                              <Box
                                sx={{
                                  flex: 1,
                                  height: 2,
                                  mt: -2.4,
                                  bgcolor: step.state === 'done' ? theme.palette.success.main : alpha(theme.palette.text.primary, 0.15),
                                  minWidth: 22,
                                }}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ p: 0.2, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.1 }}>Link Your Aadhaar</Typography>

                      <Stack direction="row" spacing={0.75} sx={{ mb: 1.2, flexWrap: 'wrap' }}>
                        {[
                          { id: 'aadhaar-otp' as const, label: 'Aadhaar OTP' },
                          { id: 'mobile' as const, label: 'Mobile' },
                          { id: 'existing-abha' as const, label: 'Existing ABHA' },
                        ].map((tab) => (
                          <Button
                            key={tab.id}
                            variant={abhaLinkMode === tab.id ? 'contained' : 'outlined'}
                            disableElevation
                            size="small"
                            onClick={() => setAbhaLinkMode(tab.id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: 99,
                              minHeight: 30,
                              px: 1.4,
                              fontSize: 12,
                            }}
                          >
                            {tab.label}
                          </Button>
                        ))}
                      </Stack>

                      {abhaLinkMode === 'aadhaar-otp' && (
                        <Stack spacing={1}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                            <TextField
                              size="small"
                              label="Aadhaar Number *"
                              placeholder="XXXX XXXX XXXX"
                              value={aadhaarForm.aadhaar}
                              onChange={(e) => setAadhaarForm((prev) => ({ ...prev, aadhaar: formatAadhaarNumber(e.target.value) }))}
                            />
                            <TextField
                              size="small"
                              label="Full Name *"
                              value={aadhaarForm.fullName}
                              onChange={(e) => setAadhaarForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            />
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                            <TextField
                              size="small"
                              label="Date of Birth"
                              type="date"
                              value={aadhaarForm.dob}
                              onChange={(e) => setAadhaarForm((prev) => ({ ...prev, dob: e.target.value }))}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              select
                              size="small"
                              label="Gender"
                              value={aadhaarForm.gender}
                              onChange={(e) => setAadhaarForm((prev) => ({ ...prev, gender: e.target.value }))}
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                          </Box>

                          <Box sx={{ p: 1, borderRadius: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', gap: 0.75 }}>
                            <InfoOutlinedIcon sx={{ fontSize: 15, color: 'primary.main', mt: 0.05 }} />
                            <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 600 }}>
                              OTP Aadhaar-registered mobile par bheja jayega. Data encrypted rahega.
                            </Typography>
                          </Box>
                          <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, minHeight: 30, px: 1.4 }}
                              onClick={() => setSnackbar({ open: true, message: 'Aadhaar details saved as draft' })}
                            >
                              Save Draft
                            </Button>
                            <Button
                              variant="contained"
                              disableElevation
                              size="small"
                              startIcon={<PhoneIphoneIcon sx={{ fontSize: 16 }} />}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, minHeight: 30, px: 1.5 }}
                              onClick={() => setSnackbar({ open: true, message: 'OTP sent to your registered mobile' })}
                            >
                              Send OTP & Verify
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      {abhaLinkMode === 'mobile' && (
                        <Stack spacing={1}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                            <TextField
                              size="small"
                              label="Mobile Number *"
                              placeholder="+91 98765 43210"
                              value={mobileLinkForm.mobile}
                              onChange={(e) => setMobileLinkForm((prev) => ({ ...prev, mobile: e.target.value }))}
                            />
                            <TextField
                              size="small"
                              label="Full Name *"
                              value={mobileLinkForm.fullName}
                              onChange={(e) => setMobileLinkForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            />
                          </Box>
                          <Stack direction="row" justifyContent="flex-end">
                            <Button
                              variant="contained"
                              disableElevation
                              size="small"
                              startIcon={<PhoneIphoneIcon sx={{ fontSize: 16 }} />}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, minHeight: 30, px: 1.5 }}
                              onClick={() => setSnackbar({ open: true, message: 'Mobile OTP sent successfully' })}
                            >
                              Send OTP
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      {abhaLinkMode === 'existing-abha' && (
                        <Stack spacing={1}>
                          <TextField
                            size="small"
                            label="Existing ABHA Number *"
                            placeholder="91-XXXX-XXXX-XXXX"
                            value={existingAbhaNumber}
                            onChange={(e) => setExistingAbhaNumber(e.target.value)}
                            fullWidth
                          />
                          <Stack direction="row" justifyContent="flex-end">
                            <Button
                              variant="contained"
                              disableElevation
                              size="small"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, minHeight: 30, px: 1.5 }}
                              onClick={() => setSnackbar({ open: true, message: 'ABHA linked successfully' })}
                            >
                              Link ABHA
                            </Button>
                          </Stack>
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          )}

          {/* ── Preferences ── */}
          {settingsTab === 5 && (
            <Card elevation={0} sx={sectionCard}>
              <Box sx={sectionHeader}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SettingsIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>App Preferences</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Language</Typography>
                    <Select size="small" fullWidth value={language} onChange={(e) => setLanguage(e.target.value as string)}>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                      <MenuItem value="gu">Gujarati</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Date Format</Typography>
                    <Select size="small" fullWidth value={dateFormat} onChange={(e) => setDateFormat(e.target.value as string)}>
                      <MenuItem value="dd/mm/yyyy">DD/MM/YYYY</MenuItem>
                      <MenuItem value="mm/dd/yyyy">MM/DD/YYYY</MenuItem>
                      <MenuItem value="yyyy-mm-dd">YYYY-MM-DD</MenuItem>
                    </Select>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" disableElevation size="small" sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => setSnackbar({ open: true, message: 'Preferences saved' })}>
                    Save Preferences
                  </Button>
                </Box>
              </Box>
            </Card>
          )}

        </Stack>
      </Box>

      {/* ── Add Insurance Dialog ── */}
      <Dialog open={addInsuranceOpen} onClose={() => setAddInsuranceOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Add Insurance Policy</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={1.5}>
            <TextField size="small" fullWidth label="Insurance Provider *" placeholder="e.g. Star Health" value={newInsurance.provider ?? ''} onChange={e => setNewInsurance(p => ({ ...p, provider: e.target.value }))} />
            <TextField size="small" fullWidth label="Policy Number *" value={newInsurance.policyNo ?? ''} onChange={e => setNewInsurance(p => ({ ...p, policyNo: e.target.value }))} />
            <TextField size="small" fullWidth label="Valid Till" placeholder="e.g. Mar 2027" value={newInsurance.validTill ?? ''} onChange={e => setNewInsurance(p => ({ ...p, validTill: e.target.value }))} />
            <TextField size="small" fullWidth label="Coverage Amount" placeholder="e.g. ₹5 Lakh" value={newInsurance.coverage ?? ''} onChange={e => setNewInsurance(p => ({ ...p, coverage: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setAddInsuranceOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleAddInsurance} sx={{ textTransform: 'none', fontWeight: 700 }}>Add Policy</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2600} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackbar(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
