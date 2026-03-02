'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Input,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme, alpha } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormDatePicker, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import { Badge as BadgeIcon, CheckCircle as CheckCircleIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';

interface RegistrationTypeStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPatientType?: () => void;
}

type AbhaMode = 'link' | 'create' | 'verify';
type AbhaMethod = 'abha-number' | 'mobile' | 'aadhaar' | 'qr' | 'driving';
type AadhaarMethod = 'otp' | 'bio';
type ToastSeverity = 'success' | 'warning' | 'error' | 'info';

interface AbhaProfile {
  number: string;
  address: string;
  name: string;
  verifiedVia: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

const OTP_DURATION_SECONDS = 45;
const OTP_LENGTH = 6;
const STATIC_ABHA_NUMBER = '23-4521-7831-4562';
const STATIC_ABHA_ADDRESS = 'rajeshkumar@abdm';

const toDigits = (value: string) => value.replace(/\D/g, '');

const formatAbhaNumber = (value: string) => {
  const digits = toDigits(value).slice(0, 14);
  const parts = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10), digits.slice(10, 14)].filter(Boolean);
  return parts.join('-');
};

const formatAadhaarNumber = (value: string) => {
  const digits = toDigits(value).slice(0, 12);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const isValidAbhaNumber = (value: string) => toDigits(value).length === 14;
const isValidAadhaar = (value: string) => toDigits(value).length === 12;
const isValidMobile = (value: string) => toDigits(value).length === 10;
const isValidOtp = (value: string) => toDigits(value).length === OTP_LENGTH;

const sanitizeAbhaAddress = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/@abdm$/, '')
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, 18);

const isValidAbhaAddress = (value: string) => /^[a-z0-9._]{3,18}$/.test(value);

const generateAbhaNumber = () => {
  const segment = (length: number) => Math.floor(Math.random() * 10 ** length).toString().padStart(length, '0');
  return `${segment(2)}-${segment(4)}-${segment(4)}-${segment(4)}`;
};

const maskAadhaar = (value: string) => {
  const digits = toDigits(value);
  if (digits.length !== 12) {
    return value;
  }
  return `XXXX XXXX ${digits.slice(-4)}`;
};

const humanizeAbhaStatus = (status: string) => {
  if (status === 'otp_verified') {
    return 'OTP Verified';
  }
  if (status === 'biometric_verified') {
    return 'Biometric Verified';
  }
  if (status === 'manual') {
    return 'Manual Verification';
  }
  return 'Not Linked';
};

export default function RegistrationTypeStep({
  values,
  setFieldValue,
  onAddPatientType,
}: RegistrationTypeStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  const [abhaModalMode, setAbhaModalMode] = React.useState<AbhaMode | null>(null);
  const [abhaModalStep, setAbhaModalStep] = React.useState(1);
  const [abhaMethod, setAbhaMethod] = React.useState<AbhaMethod | ''>('');
  const [abhaOtp, setAbhaOtp] = React.useState('');
  const [abhaOtpTimer, setAbhaOtpTimer] = React.useState(0);
  const [abhaResult, setAbhaResult] = React.useState<AbhaProfile | null>(null);

  const [linkAbhaNumber, setLinkAbhaNumber] = React.useState('');
  const [linkMobile, setLinkMobile] = React.useState('');
  const [linkAadhaar, setLinkAadhaar] = React.useState('');

  const [createAadhaar, setCreateAadhaar] = React.useState('');
  const [createDrivingLicense, setCreateDrivingLicense] = React.useState('');
  const [createDob, setCreateDob] = React.useState('');
  const [createAddress, setCreateAddress] = React.useState('');
  const [createConsents, setCreateConsents] = React.useState({
    create: false,
    terms: false,
    share: false,
  });

  const [verifyAbhaNumber, setVerifyAbhaNumber] = React.useState('');

  const [aadhaarDialogOpen, setAadhaarDialogOpen] = React.useState(false);
  const [aadhaarDialogStep, setAadhaarDialogStep] = React.useState<1 | 2>(1);
  const [aadhaarMethod, setAadhaarMethod] = React.useState<AadhaarMethod>('otp');
  const [aadhaarInput, setAadhaarInput] = React.useState('');
  const [aadhaarOtp, setAadhaarOtp] = React.useState('');
  const [aadhaarOtpTimer, setAadhaarOtpTimer] = React.useState(0);

  const [abhaLinkedStatus, setAbhaLinkedStatus] = React.useState<AbhaProfile | null>(null);
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const patientTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'opd', label: 'OPD' },
    { value: 'ipd', label: 'IPD / Inpatient' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'daycare', label: 'Daycare' },
    { value: 'referred', label: 'Referred' },
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
  ];

  const reasonForNoAadhaarOptions = [
    { value: '', label: '-- Select Reason --' },
    { value: 'not_enrolled', label: 'Not Enrolled' },
    { value: 'lost_misplaced', label: 'Lost / Misplaced' },
    { value: 'refused_to_share', label: 'Refused to Share' },
    { value: 'child_under_5', label: 'Child Under 5' },
  ];

  const abhaVerificationStatusOptions = [
    { value: 'not_linked', label: 'Not Linked' },
    { value: 'otp_verified', label: 'Verified via OTP' },
    { value: 'biometric_verified', label: 'Verified via Biometric' },
    { value: 'manual', label: 'Manually Entered' },
  ];

  const schemeTypeOptions = [
    { value: '', label: 'None / Self-Pay' },
    { value: 'pmjay', label: 'Ayushman Bharat - PM-JAY' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'echs', label: 'ECHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'state_scheme', label: 'State Health Scheme' },
    { value: 'private_insurance', label: 'Private Insurance' },
    { value: 'corporate_tpa', label: 'Corporate TPA' },
  ];

  const bplStatusOptions = [
    { value: '', label: 'Not Specified' },
    { value: 'apl', label: 'APL - Above Poverty Line' },
    { value: 'bpl', label: 'BPL - Below Poverty Line' },
  ];

  const intlNationalityOptions = [
    { value: '', label: 'Select nationality...' },
    { value: 'uae', label: 'United Arab Emirates' },
    { value: 'saudi_arabia', label: 'Saudi Arabia' },
    { value: 'united_states', label: 'United States' },
    { value: 'united_kingdom', label: 'United Kingdom' },
    { value: 'australia', label: 'Australia' },
    { value: 'canada', label: 'Canada' },
    { value: 'germany', label: 'Germany' },
    { value: 'france', label: 'France' },
    { value: 'japan', label: 'Japan' },
    { value: 'china', label: 'China' },
    { value: 'bangladesh', label: 'Bangladesh' },
    { value: 'nepal', label: 'Nepal' },
    { value: 'other', label: 'Other' },
  ];

  const visaTypeOptions = [
    { value: '', label: 'Select visa type...' },
    { value: 'medical', label: 'Medical Visa' },
    { value: 'medical_attendant', label: 'Medical Attendant Visa' },
    { value: 'tourist', label: 'Tourist Visa' },
    { value: 'business', label: 'Business Visa' },
    { value: 'employment', label: 'Employment Visa' },
    { value: 'oci', label: 'OCI Card' },
    { value: 'diplomatic', label: 'Diplomatic Visa' },
  ];

  const patientDisplayName = React.useMemo(() => {
    const nameParts = [values.patientName, values.middleName, values.lastName]
      .map((item) => item.trim())
      .filter(Boolean);
    return nameParts.join(' ') || 'Patient';
  }, [values.lastName, values.middleName, values.patientName]);

  const abhaBaseAddress = React.useMemo(() => {
    const preferred = sanitizeAbhaAddress(values.abhaAddress || values.patientName || 'patient');
    return preferred || 'patient';
  }, [values.abhaAddress, values.patientName]);

  React.useEffect(() => {
    if (abhaOtpTimer <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setAbhaOtpTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [abhaOtpTimer]);

  React.useEffect(() => {
    if (aadhaarOtpTimer <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setAadhaarOtpTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [aadhaarOtpTimer]);

  React.useEffect(() => {
    if (!values.abhaNumber || values.abhaVerificationStatus === 'not_linked') {
      setAbhaLinkedStatus(null);
      return;
    }

    setAbhaLinkedStatus((prev) => ({
      number: values.abhaNumber,
      address: values.abhaAddress || prev?.address || STATIC_ABHA_ADDRESS,
      name: patientDisplayName,
      verifiedVia: humanizeAbhaStatus(values.abhaVerificationStatus),
    }));
  }, [patientDisplayName, values.abhaAddress, values.abhaNumber, values.abhaVerificationStatus]);

  const openToast = (message: string, severity: ToastSeverity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const buildProfile = (overrides?: Partial<AbhaProfile>): AbhaProfile => ({
    number: overrides?.number || values.abhaNumber || STATIC_ABHA_NUMBER,
    address: overrides?.address || values.abhaAddress || `${abhaBaseAddress}@abdm` || STATIC_ABHA_ADDRESS,
    name: overrides?.name || patientDisplayName,
    verifiedVia: overrides?.verifiedVia || 'OTP Verified',
  });

  const applyAbhaToForm = (
    profile: AbhaProfile,
    verificationStatus: 'not_linked' | 'otp_verified' | 'biometric_verified' | 'manual',
    successMessage: string,
    aadhaarRaw?: string,
  ) => {
    setFieldValue('abhaNumber', profile.number);
    setFieldValue('abhaAddress', profile.address);
    setFieldValue('abhaVerificationStatus', verificationStatus);
    setFieldValue('consentAbhaShare', true);
    if (aadhaarRaw && isValidAadhaar(aadhaarRaw)) {
      setFieldValue('aadhaarNumber', maskAadhaar(aadhaarRaw));
    }
    setAbhaLinkedStatus(profile);
    setAbhaModalMode(null);
    setAbhaModalStep(1);
    setAbhaOtp('');
    setAbhaOtpTimer(0);
    openToast(successMessage, 'success');
  };

  const resetAbhaFlow = () => {
    setAbhaOtp('');
    setAbhaOtpTimer(0);
    setAbhaResult(null);
    setCreateConsents({ create: false, terms: false, share: false });
  };

  const openAbhaFlow = (mode: AbhaMode) => {
    setAbhaModalMode(mode);
    setAbhaModalStep(1);
    setAbhaMethod(mode === 'verify' ? 'mobile' : '');
    setLinkAbhaNumber(formatAbhaNumber(values.abhaNumber || STATIC_ABHA_NUMBER));
    setLinkMobile(toDigits(values.mobile).slice(0, 10));
    setLinkAadhaar(formatAadhaarNumber(values.aadhaarNumber));
    setCreateAadhaar(formatAadhaarNumber(values.aadhaarNumber));
    setCreateDrivingLicense(values.drivingLicense || '');
    setCreateDob(values.dob || '');
    setCreateAddress(abhaBaseAddress);
    setVerifyAbhaNumber(formatAbhaNumber(values.abhaNumber || ''));
    resetAbhaFlow();
  };

  const closeAbhaFlow = () => {
    setAbhaModalMode(null);
    setAbhaModalStep(1);
    resetAbhaFlow();
  };

  const openAadhaarDialog = () => {
    setAadhaarDialogOpen(true);
    setAadhaarDialogStep(1);
    setAadhaarMethod('otp');
    setAadhaarInput(formatAadhaarNumber(values.aadhaarNumber));
    setAadhaarOtp('');
    setAadhaarOtpTimer(0);
  };

  const closeAadhaarDialog = () => {
    setAadhaarDialogOpen(false);
    setAadhaarDialogStep(1);
    setAadhaarOtp('');
    setAadhaarOtpTimer(0);
  };

  const handleRegistrationCountryChange = (nextCountry: 'india' | 'international') => {
    setFieldValue('registrationCountry', nextCountry);

    if (nextCountry === 'india') {
      setFieldValue('country', 'india');
      setFieldValue('internationalCountryCode', '+91');
      return;
    }

    if (values.country === 'india') {
      setFieldValue('country', 'uae');
    }
    if (!values.internationalCountryCode || values.internationalCountryCode === '+91') {
      setFieldValue('internationalCountryCode', '+971');
    }
    if (!values.intlNationality) {
      setFieldValue('intlNationality', values.country === 'india' ? 'uae' : values.country);
    }
  };

  const linkStepOneValid = (() => {
    if (abhaMethod === 'abha-number') {
      return isValidAbhaNumber(linkAbhaNumber);
    }
    if (abhaMethod === 'mobile') {
      return isValidMobile(linkMobile);
    }
    if (abhaMethod === 'aadhaar') {
      return isValidAadhaar(linkAadhaar);
    }
    if (abhaMethod === 'qr') {
      return true;
    }
    return false;
  })();

  const createStepOneValid = (() => {
    if (abhaMethod === 'aadhaar') {
      return isValidAadhaar(createAadhaar);
    }
    if (abhaMethod === 'driving') {
      return createDrivingLicense.trim().length >= 6 && Boolean(createDob);
    }
    return false;
  })();

  const normalizedCreateAddress = sanitizeAbhaAddress(createAddress);
  const allCreateConsentsAccepted = Object.values(createConsents).every(Boolean);

  const handleLinkStepOneNext = () => {
    if (!linkStepOneValid) {
      openToast('Select a method and enter valid details to continue.', 'warning');
      return;
    }

    if (abhaMethod === 'qr') {
      setAbhaResult(
        buildProfile({
          verifiedVia: 'QR Scan',
        }),
      );
      setAbhaModalStep(3);
      return;
    }

    setAbhaOtp('');
    setAbhaOtpTimer(OTP_DURATION_SECONDS);
    setAbhaModalStep(2);
  };

  const handleLinkOtpVerify = () => {
    if (!isValidOtp(abhaOtp)) {
      openToast('Enter a valid 6-digit OTP.', 'warning');
      return;
    }

    const linkNumber =
      abhaMethod === 'abha-number'
        ? formatAbhaNumber(linkAbhaNumber)
        : values.abhaNumber
        ? formatAbhaNumber(values.abhaNumber)
        : STATIC_ABHA_NUMBER;

    setAbhaResult(
      buildProfile({
        number: linkNumber,
        verifiedVia: abhaMethod === 'aadhaar' ? 'Aadhaar OTP' : 'Mobile OTP',
      }),
    );
    setAbhaModalStep(3);
  };

  const handleLinkFinalize = () => {
    setAbhaModalStep(4);
  };

  const handleApplyLinkedAbha = () => {
    const profile = abhaResult || buildProfile();
    applyAbhaToForm(
      profile,
      'otp_verified',
      'ABHA linked and applied to registration form.',
      abhaMethod === 'aadhaar' ? linkAadhaar : undefined,
    );
  };

  const handleCreateStepOneNext = () => {
    if (!createStepOneValid) {
      openToast('Enter valid details for the selected ABHA creation method.', 'warning');
      return;
    }

    setAbhaOtp('');
    setAbhaOtpTimer(OTP_DURATION_SECONDS);
    setAbhaModalStep(2);
  };

  const handleCreateOtpVerify = () => {
    if (!isValidOtp(abhaOtp)) {
      openToast('Enter a valid 6-digit OTP.', 'warning');
      return;
    }
    setAbhaModalStep(3);
  };

  const handleCreateAddressNext = () => {
    if (!isValidAbhaAddress(normalizedCreateAddress)) {
      openToast('ABHA address must be 3-18 characters with letters, numbers, dot, or underscore.', 'warning');
      return;
    }
    setAbhaModalStep(4);
  };

  const handleCreateFinalize = () => {
    if (!allCreateConsentsAccepted) {
      openToast('Please accept all consent checkboxes to create ABHA.', 'warning');
      return;
    }

    const createdProfile = buildProfile({
      number: generateAbhaNumber(),
      address: `${normalizedCreateAddress}@abdm`,
      verifiedVia: abhaMethod === 'driving' ? 'Driving Licence' : 'Aadhaar OTP',
    });

    setAbhaResult(createdProfile);
    setAbhaModalStep(5);
  };

  const handleApplyCreatedAbha = () => {
    if (!abhaResult) {
      return;
    }

    applyAbhaToForm(
      abhaResult,
      abhaMethod === 'driving' ? 'manual' : 'otp_verified',
      'ABHA created and applied to registration form.',
      abhaMethod === 'aadhaar' ? createAadhaar : undefined,
    );
  };

  const handleVerifySendOtp = () => {
    if (!isValidAbhaNumber(verifyAbhaNumber)) {
      openToast('Enter a valid 14-digit ABHA number before verification.', 'warning');
      return;
    }

    setAbhaOtp('');
    setAbhaOtpTimer(OTP_DURATION_SECONDS);
    setAbhaModalStep(2);
  };

  const handleVerifyOtp = () => {
    if (!isValidOtp(abhaOtp)) {
      openToast('Enter a valid 6-digit OTP.', 'warning');
      return;
    }

    setAbhaResult(
      buildProfile({
        number: formatAbhaNumber(verifyAbhaNumber),
        verifiedVia: abhaMethod === 'aadhaar' ? 'Aadhaar OTP' : 'Mobile OTP',
      }),
    );
    setAbhaModalStep(3);
  };

  const handleApplyVerifiedAbha = () => {
    const profile =
      abhaResult ||
      buildProfile({
        number: formatAbhaNumber(verifyAbhaNumber),
      });
    applyAbhaToForm(profile, 'otp_verified', 'ABHA verification status updated.');
  };

  const handleAadhaarContinue = () => {
    if (!isValidAadhaar(aadhaarInput)) {
      openToast('Enter a valid 12-digit Aadhaar number.', 'warning');
      return;
    }

    if (aadhaarMethod === 'bio') {
      setFieldValue('aadhaarNumber', maskAadhaar(aadhaarInput));
      closeAadhaarDialog();
      openToast('Aadhaar verified via biometric.', 'success');
      return;
    }

    setAadhaarDialogStep(2);
    setAadhaarOtp('');
    setAadhaarOtpTimer(OTP_DURATION_SECONDS);
  };

  const handleAadhaarOtpVerify = () => {
    if (!isValidOtp(aadhaarOtp)) {
      openToast('Enter a valid 6-digit Aadhaar OTP.', 'warning');
      return;
    }

    setFieldValue('aadhaarNumber', maskAadhaar(aadhaarInput));
    closeAadhaarDialog();
    openToast('Aadhaar verified and masked in form.', 'success');
  };

  const abhaTotalSteps = abhaModalMode === 'create' ? 5 : abhaModalMode === 'link' ? 4 : 3;
  const abhaProgress = Math.round((abhaModalStep / abhaTotalSteps) * 100);

  const abhaTitle =
    abhaModalMode === 'link'
      ? 'Link Existing ABHA'
      : abhaModalMode === 'create'
      ? 'Create New ABHA'
      : 'Verify ABHA Number';

  const abhaSubtitle =
    abhaModalMode === 'link'
      ? 'Connect ABHA to this patient registration'
      : abhaModalMode === 'create'
      ? 'Create and link a new ABHA account'
      : 'Confirm ABHA ownership with OTP';

  const renderMethodCard = (
    id: string,
    selected: boolean,
    icon: string,
    title: string,
    description: string,
    onClick: () => void,
  ) => (
    <Box
      key={id}
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        border: '1.5px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
        p: 1.4,
        cursor: 'pointer',
        transition: 'all .2s ease',
      }}
    >
      <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{icon}</Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.7, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, mt: 0.35, display: 'block' }}>
        {description}
      </Typography>
    </Box>
  );

  const renderAbhaDialogBody = () => {
    if (!abhaModalMode) {
      return null;
    }

    if (abhaModalMode === 'link') {
      if (abhaModalStep === 1) {
        return (
          <Stack spacing={1.5}>
            <Alert severity="info">Choose a method to link an existing ABHA account.</Alert>
            <Grid container spacing={1}>
              <Grid xs={12} sm={6}>
                {renderMethodCard(
                  'abha-number',
                  abhaMethod === 'abha-number',
                  '🔢',
                  'ABHA Number',
                  '14-digit ABHA number with OTP',
                  () => setAbhaMethod('abha-number'),
                )}
              </Grid>
              <Grid xs={12} sm={6}>
                {renderMethodCard(
                  'mobile',
                  abhaMethod === 'mobile',
                  '📱',
                  'Mobile OTP',
                  'OTP to ABHA-linked mobile',
                  () => setAbhaMethod('mobile'),
                )}
              </Grid>
              <Grid xs={12} sm={6}>
                {renderMethodCard(
                  'aadhaar',
                  abhaMethod === 'aadhaar',
                  '🪪',
                  'Aadhaar OTP',
                  'OTP to Aadhaar-linked mobile',
                  () => setAbhaMethod('aadhaar'),
                )}
              </Grid>
              <Grid xs={12} sm={6}>
                {renderMethodCard('qr', abhaMethod === 'qr', '📷', 'Scan ABHA QR', 'Scan card/app QR code', () =>
                  setAbhaMethod('qr'),
                )}
              </Grid>
            </Grid>

            {abhaMethod === 'abha-number' ? (
              <Input
                label="ABHA Number"
                placeholder="XX-XXXX-XXXX-XXXX"
                value={linkAbhaNumber}
                fullWidth
                size="small"
                inputProps={{ maxLength: 17 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setLinkAbhaNumber(formatAbhaNumber(event.target.value))
                }
              />
            ) : null}

            {abhaMethod === 'mobile' ? (
              <Input
                label="Mobile Number"
                placeholder="10-digit mobile"
                value={linkMobile}
                fullWidth
                size="small"
                inputProps={{ maxLength: 10 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setLinkMobile(toDigits(event.target.value).slice(0, 10))
                }
              />
            ) : null}

            {abhaMethod === 'aadhaar' ? (
              <Input
                label="Aadhaar Number"
                placeholder="XXXX XXXX XXXX"
                value={linkAadhaar}
                fullWidth
                size="small"
                inputProps={{ maxLength: 14 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setLinkAadhaar(formatAadhaarNumber(event.target.value))
                }
              />
            ) : null}

            {abhaMethod === 'qr' ? (
              <Alert severity="success">QR scan simulated. Next will move directly to profile confirmation.</Alert>
            ) : null}
          </Stack>
        );
      }

      if (abhaModalStep === 2) {
        return (
          <Stack spacing={1.4}>
            <Alert severity="success">OTP sent. Enter the 6-digit OTP to continue linking ABHA.</Alert>
            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={abhaOtp}
              fullWidth
              size="small"
              inputProps={{ maxLength: OTP_LENGTH }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setAbhaOtp(toDigits(event.target.value).slice(0, OTP_LENGTH))
              }
            />
            <Typography variant="caption" color="text.secondary">
              {abhaOtpTimer > 0 ? `Resend in ${abhaOtpTimer}s` : 'OTP expired. You can resend now.'}
            </Typography>
          </Stack>
        );
      }

      if (abhaModalStep === 3) {
        const profile = abhaResult || buildProfile();
        return (
          <Stack spacing={1.2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                color: '#fff',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                ABHA Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.2 }}>
                {profile.number}
              </Typography>
              <Typography variant="body2">{profile.address}</Typography>
              <Typography variant="body2" sx={{ mt: 0.6, fontWeight: 700 }}>
                {profile.name}
              </Typography>
            </Box>
            <Alert severity="info">Confirm to link this ABHA with current patient registration.</Alert>
          </Stack>
        );
      }

      return (
        <Stack spacing={1.2} alignItems="center" sx={{ py: 1 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 44 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            ABHA Linked Successfully
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Click apply to auto-fill ABHA details in this form.
          </Typography>
        </Stack>
      );
    }

    if (abhaModalMode === 'create') {
      if (abhaModalStep === 1) {
        return (
          <Stack spacing={1.5}>
            <Alert severity="info">Select ABHA creation method.</Alert>
            <Grid container spacing={1}>
              <Grid xs={12} sm={6}>
                {renderMethodCard(
                  'aadhaar',
                  abhaMethod === 'aadhaar',
                  '🪪',
                  'Aadhaar OTP',
                  'Recommended and instant',
                  () => setAbhaMethod('aadhaar'),
                )}
              </Grid>
              <Grid xs={12} sm={6}>
                {renderMethodCard(
                  'driving',
                  abhaMethod === 'driving',
                  '🚗',
                  'Driving Licence',
                  'For patients without Aadhaar',
                  () => setAbhaMethod('driving'),
                )}
              </Grid>
            </Grid>

            {abhaMethod === 'aadhaar' ? (
              <Input
                label="Aadhaar Number"
                placeholder="XXXX XXXX XXXX"
                value={createAadhaar}
                fullWidth
                size="small"
                inputProps={{ maxLength: 14 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateAadhaar(formatAadhaarNumber(event.target.value))
                }
              />
            ) : null}

            {abhaMethod === 'driving' ? (
              <>
                <Input
                  label="Driving Licence Number"
                  placeholder="DL-XXXXXXXXXXXXXXX"
                  value={createDrivingLicense}
                  fullWidth
                  size="small"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateDrivingLicense(event.target.value.toUpperCase())
                  }
                />
                <Input
                  type="date"
                  label="Date of Birth"
                  value={createDob}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCreateDob(event.target.value)}
                />
              </>
            ) : null}

            <Alert severity="warning">Patient consent is mandatory for ABHA creation and linking.</Alert>
          </Stack>
        );
      }

      if (abhaModalStep === 2) {
        return (
          <Stack spacing={1.4}>
            <Alert severity="success">OTP sent. Enter the 6-digit OTP to verify identity.</Alert>
            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={abhaOtp}
              fullWidth
              size="small"
              inputProps={{ maxLength: OTP_LENGTH }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setAbhaOtp(toDigits(event.target.value).slice(0, OTP_LENGTH))
              }
            />
            <Typography variant="caption" color="text.secondary">
              {abhaOtpTimer > 0 ? `Resend in ${abhaOtpTimer}s` : 'OTP expired. You can resend now.'}
            </Typography>
          </Stack>
        );
      }

      if (abhaModalStep === 3) {
        return (
          <Stack spacing={1.2}>
            <Alert severity="info">Set a unique ABHA address for this patient.</Alert>
            <Input
              label="Preferred ABHA Address"
              placeholder="yourname"
              value={createAddress}
              fullWidth
              size="small"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setCreateAddress(sanitizeAbhaAddress(event.target.value))
              }
            />
            <Stack direction="row" spacing={0.8} flexWrap="wrap">
              {[
                `${abhaBaseAddress}@abdm`,
                `${abhaBaseAddress}01@abdm`,
                `${abhaBaseAddress}.health@abdm`,
              ].map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  size="small"
                  onClick={() => setCreateAddress(suggestion.replace('@abdm', ''))}
                  sx={{ mt: 0.5 }}
                />
              ))}
            </Stack>
            {createAddress ? (
              <Alert severity={isValidAbhaAddress(normalizedCreateAddress) ? 'success' : 'warning'}>
                {isValidAbhaAddress(normalizedCreateAddress)
                  ? `${normalizedCreateAddress}@abdm is available.`
                  : 'Use 3-18 chars (letters, numbers, dot, underscore).'}
              </Alert>
            ) : null}
          </Stack>
        );
      }

      if (abhaModalStep === 4) {
        return (
          <Stack spacing={1.2}>
            <Alert severity="info">Review and accept all consents to create ABHA.</Alert>
            <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: alpha(theme.palette.primary.main, 0.06) }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {normalizedCreateAddress}@abdm
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {abhaMethod === 'aadhaar' ? 'Aadhaar OTP verified' : 'Driving Licence + DOB verified'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={createConsents.create}
                  onChange={(event) => setCreateConsents((prev) => ({ ...prev, create: event.target.checked }))}
                />
              }
              label="I consent to creating an ABHA account for this patient."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={createConsents.terms}
                  onChange={(event) => setCreateConsents((prev) => ({ ...prev, terms: event.target.checked }))}
                />
              }
              label="I accept ABDM terms and privacy policy."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={createConsents.share}
                  onChange={(event) => setCreateConsents((prev) => ({ ...prev, share: event.target.checked }))}
                />
              }
              label="I consent to ABDM health data sharing for care delivery."
            />
          </Stack>
        );
      }

      return (
        <Stack spacing={1.2} alignItems="center" sx={{ py: 1 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 44 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            ABHA Created
          </Typography>
          <Box
            sx={{
              width: '100%',
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
              color: '#fff',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              New ABHA Number
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.2 }}>
              {abhaResult?.number}
            </Typography>
            <Typography variant="body2">{abhaResult?.address}</Typography>
          </Box>
        </Stack>
      );
    }

    if (abhaModalStep === 1) {
      return (
        <Stack spacing={1.5}>
          <Alert severity="info">Enter ABHA number and choose OTP verification method.</Alert>
          <Input
            label="ABHA Number"
            placeholder="XX-XXXX-XXXX-XXXX"
            value={verifyAbhaNumber}
            fullWidth
            size="small"
            inputProps={{ maxLength: 17 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setVerifyAbhaNumber(formatAbhaNumber(event.target.value))
            }
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {renderMethodCard('verify-mobile', abhaMethod === 'mobile', '📱', 'Mobile OTP', 'ABHA linked mobile', () =>
              setAbhaMethod('mobile'),
            )}
            {renderMethodCard(
              'verify-aadhaar',
              abhaMethod === 'aadhaar',
              '🪪',
              'Aadhaar OTP',
              'Aadhaar linked mobile',
              () => setAbhaMethod('aadhaar'),
            )}
          </Stack>
        </Stack>
      );
    }

    if (abhaModalStep === 2) {
      return (
        <Stack spacing={1.4}>
          <Alert severity="success">OTP sent. Enter the OTP to complete ABHA verification.</Alert>
          <Input
            label="OTP"
            placeholder="Enter 6-digit OTP"
            value={abhaOtp}
            fullWidth
            size="small"
            inputProps={{ maxLength: OTP_LENGTH }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAbhaOtp(toDigits(event.target.value).slice(0, OTP_LENGTH))
            }
          />
          <Typography variant="caption" color="text.secondary">
            {abhaOtpTimer > 0 ? `Resend in ${abhaOtpTimer}s` : 'OTP expired. You can resend now.'}
          </Typography>
        </Stack>
      );
    }

    const profile = abhaResult || buildProfile({ number: verifyAbhaNumber || STATIC_ABHA_NUMBER });

    return (
      <Stack spacing={1.2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            color: '#fff',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Verified ABHA
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.2 }}>
            {profile.number}
          </Typography>
          <Typography variant="body2">{profile.address}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.82 }}>
            Verified via {profile.verifiedVia}
          </Typography>
        </Box>
        <Alert severity="success">Verification will update ABHA status to Verified via OTP.</Alert>
      </Stack>
    );
  };

  const renderAbhaDialogActions = () => {
    if (!abhaModalMode) {
      return null;
    }

    if (abhaModalMode === 'link') {
      if (abhaModalStep === 1) {
        return (
          <>
            <Button type="button" onClick={closeAbhaFlow} variant="outlined">
              Cancel
            </Button>
            <Button type="button" onClick={handleLinkStepOneNext} variant="contained" disabled={!linkStepOneValid}>
              Next
            </Button>
          </>
        );
      }
      if (abhaModalStep === 2) {
        return (
          <>
            <Button type="button" onClick={() => setAbhaModalStep(1)} variant="outlined">
              Back
            </Button>
            <Button type="button" onClick={() => setAbhaOtpTimer(OTP_DURATION_SECONDS)} variant="text" disabled={abhaOtpTimer > 0}>
              Resend OTP
            </Button>
            <Button type="button" onClick={handleLinkOtpVerify} variant="contained" disabled={!isValidOtp(abhaOtp)}>
              Verify OTP
            </Button>
          </>
        );
      }
      if (abhaModalStep === 3) {
        return (
          <>
            <Button
              type="button"
              onClick={() => setAbhaModalStep(abhaMethod === 'qr' ? 1 : 2)}
              variant="outlined"
            >
              Back
            </Button>
            <Button type="button" onClick={handleLinkFinalize} variant="contained" color="success">
              Confirm & Link
            </Button>
          </>
        );
      }
      return (
        <Button type="button" onClick={handleApplyLinkedAbha} variant="contained" fullWidth>
          Apply to Form
        </Button>
      );
    }

    if (abhaModalMode === 'create') {
      if (abhaModalStep === 1) {
        return (
          <>
            <Button type="button" onClick={closeAbhaFlow} variant="outlined">
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateStepOneNext} variant="contained" disabled={!createStepOneValid}>
              Next
            </Button>
          </>
        );
      }

      if (abhaModalStep === 2) {
        return (
          <>
            <Button type="button" onClick={() => setAbhaModalStep(1)} variant="outlined">
              Back
            </Button>
            <Button type="button" onClick={() => setAbhaOtpTimer(OTP_DURATION_SECONDS)} variant="text" disabled={abhaOtpTimer > 0}>
              Resend OTP
            </Button>
            <Button type="button" onClick={handleCreateOtpVerify} variant="contained" disabled={!isValidOtp(abhaOtp)}>
              Verify OTP
            </Button>
          </>
        );
      }

      if (abhaModalStep === 3) {
        return (
          <>
            <Button type="button" onClick={() => setAbhaModalStep(2)} variant="outlined">
              Back
            </Button>
            <Button
              type="button"
              onClick={handleCreateAddressNext}
              variant="contained"
              disabled={!isValidAbhaAddress(normalizedCreateAddress)}
            >
              Continue
            </Button>
          </>
        );
      }

      if (abhaModalStep === 4) {
        return (
          <>
            <Button type="button" onClick={() => setAbhaModalStep(3)} variant="outlined">
              Back
            </Button>
            <Button
              type="button"
              onClick={handleCreateFinalize}
              variant="contained"
              color="success"
              disabled={!allCreateConsentsAccepted}
            >
              Create ABHA
            </Button>
          </>
        );
      }

      return (
        <>
          <Button
            type="button"
            onClick={() => openToast('ABHA card print queued (demo).', 'info')}
            variant="outlined"
            color="inherit"
          >
            Print Card
          </Button>
          <Button type="button" onClick={handleApplyCreatedAbha} variant="contained">
            Apply to Form
          </Button>
        </>
      );
    }

    if (abhaModalStep === 1) {
      return (
        <>
          <Button type="button" onClick={closeAbhaFlow} variant="outlined">
            Cancel
          </Button>
          <Button type="button" onClick={handleVerifySendOtp} variant="contained">
            Send OTP
          </Button>
        </>
      );
    }

    if (abhaModalStep === 2) {
      return (
        <>
          <Button type="button" onClick={() => setAbhaModalStep(1)} variant="outlined">
            Back
          </Button>
          <Button type="button" onClick={() => setAbhaOtpTimer(OTP_DURATION_SECONDS)} variant="text" disabled={abhaOtpTimer > 0}>
            Resend OTP
          </Button>
          <Button type="button" onClick={handleVerifyOtp} variant="contained" disabled={!isValidOtp(abhaOtp)}>
            Verify
          </Button>
        </>
      );
    }

    return (
      <Button type="button" onClick={handleApplyVerifiedAbha} variant="contained" fullWidth>
        Apply to Form
      </Button>
    );
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => handleRegistrationCountryChange('india')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRegistrationCountryChange('india');
            }
          }}
          sx={{
            flex: 1,
            borderRadius: 2,
            px: 1.4,
            py: 1.15,
            cursor: 'pointer',
            border: '1.5px solid',
            borderColor: isIndia ? 'primary.main' : 'divider',
            backgroundColor: isIndia ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 19 }}>🇮🇳</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                India Patient
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aadhaar, ABHA, NHA fields included
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => handleRegistrationCountryChange('international')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRegistrationCountryChange('international');
            }
          }}
          sx={{
            flex: 1,
            borderRadius: 2,
            px: 1.4,
            py: 1.15,
            cursor: 'pointer',
            border: '1.5px solid',
            borderColor: !isIndia ? 'info.main' : 'divider',
            backgroundColor: !isIndia ? alpha(theme.palette.info.main, 0.08) : 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 19 }}>🌍</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                International Patient
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Passport, visa, and country-specific identity
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.6,
            color: 'text.primary',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Registration Identity
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Identity Capture" sx={chipSx} />
              <Chip size="small" label={isIndia ? 'ABHA / Aadhaar' : 'Passport / Visa'} sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          {isIndia ? (
            <Box
              sx={{
                mb: 2,
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: alpha('#7c3aed', 0.28),
                backgroundColor: alpha('#7c3aed', 0.06),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#5b21b6', fontWeight: 700 }}>
                    ABHA - Ayushman Bharat Health Account
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6d28d9' }}>
                    Link, verify, or create ABHA for ABDM-ready registration.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75}>
                  <Button size="small" variant="contained" type="button" onClick={() => openAbhaFlow('link')}>
                    Link ABHA
                  </Button>
                  <Button size="small" variant="outlined" type="button" onClick={() => openAbhaFlow('create')}>
                    Create ABHA
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Passport is the primary identity for international registration. Capture visa and country-of-residence
              details before submission.
            </Alert>
          )}

          <Grid container spacing={1.35}>
            <Grid xs={12} md={3}>
              <FormTextField
                name="mrno"
                label="MR Number"
                placeholder="MRN-246001"
                startIcon={<BadgeIcon fontSize="small" color="action" />}
                helperText="Auto-generated on save"
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormSelect
                name="patientType"
                label="Patient Type"
                options={patientTypeOptions}
                required
                onAddClick={onAddPatientType}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormSelect
                name="language"
                label="Preferred Language"
                options={languageOptions}
                required
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormDatePicker name="regDate" label="Registration Date" required />
            </Grid>

            {isIndia ? (
              <>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="abhaNumber"
                    label="ABHA Number"
                    placeholder="XX-XXXX-XXXX-XXXX"
                    endIcon={
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={() => openAbhaFlow('verify')}
                        sx={{ minWidth: 'auto', px: 0.75, fontSize: 11, textTransform: 'none' }}
                      >
                        Verify
                      </Button>
                    }
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="abhaAddress" label="ABHA Address / PHR" placeholder="name@abdm" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect
                    name="abhaVerificationStatus"
                    label="ABHA Verification Status"
                    options={abhaVerificationStatusOptions}
                  />
                </Grid>

                {abhaLinkedStatus ? (
                  <Grid xs={12}>
                    <Box
                      sx={{
                        mt: 0.2,
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                          theme.palette.info.main,
                          0.07,
                        )})`,
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        >
                          🏛️
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            ABHA Linked & Verified
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {abhaLinkedStatus.number} · {abhaLinkedStatus.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {abhaLinkedStatus.name} · {abhaLinkedStatus.verifiedVia}
                          </Typography>
                        </Box>
                        <Button type="button" variant="text" size="small" onClick={() => openAbhaFlow('link')}>
                          Edit
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                ) : null}

                <Grid xs={12} md={4}>
                  <FormTextField
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    placeholder="XXXX XXXX XXXX"
                    endIcon={
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={openAadhaarDialog}
                        sx={{ minWidth: 'auto', px: 0.75, fontSize: 11, textTransform: 'none' }}
                        startIcon={<QrCodeScannerIcon sx={{ fontSize: 15 }} />}
                      >
                        Scan
                      </Button>
                    }
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect
                    name="reasonForNoAadhaar"
                    label="Reason if no Aadhaar"
                    options={reasonForNoAadhaarOptions}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="panNumber" label="PAN Number" placeholder="ABCDE1234F" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="voterId" label="Voter ID (EPIC)" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="rationCardNo" label="Ration Card No." />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="drivingLicense" label="Driving Licence" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect name="schemeType" label="Scheme Type" options={schemeTypeOptions} />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="schemeCardNumber" label="Scheme Card Number" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="insuranceProvider" label="Insurance / TPA Provider" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="insurancePolicyNumber" label="Insurance Policy No." />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="policyValidity" label="Policy Validity" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect name="bplStatus" label="BPL / APL Status" options={bplStatusOptions} />
                </Grid>
              </>
            ) : (
              <>
                <Grid xs={12} md={4}>
                  <FormSelect
                    name="intlNationality"
                    label="Nationality"
                    options={intlNationalityOptions}
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="passportNumber" label="Passport Number" required />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="passportExpiryDate" label="Passport Expiry Date" required />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="passportIssueCountry" label="Passport Issue Country" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="visaNumber" label="Visa Number" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect name="visaType" label="Visa Type" options={visaTypeOptions} />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="visaValidityDate" label="Visa Validity Date" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="arrivalInIndiaDate" label="Date of Arrival in India" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="intlInsuranceProvider" label="International Insurance / TPA" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="intlPolicyMemberId" label="Policy / Member ID" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="countryOfResidence" label="Country of Residence" />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField name="embassyContact" label="Embassy / Consulate Contact" />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Card>

      <Dialog open={Boolean(abhaModalMode)} onClose={closeAbhaFlow} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            color: '#fff',
            pb: 1.25,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {abhaTitle}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {abhaSubtitle}
          </Typography>
        </DialogTitle>
        <Box sx={{ px: 3, py: 1.1, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
          <LinearProgress
            variant="determinate"
            value={abhaProgress}
            sx={{
              borderRadius: 999,
              height: 6,
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.45, display: 'block' }}>
            Step {abhaModalStep} of {abhaTotalSteps}
          </Typography>
        </Box>
        <DialogContent dividers>{renderAbhaDialogBody()}</DialogContent>
        <DialogActions sx={{ px: 2.2, py: 1.3 }}>{renderAbhaDialogActions()}</DialogActions>
      </Dialog>

      <Dialog open={aadhaarDialogOpen} onClose={closeAadhaarDialog} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            color: '#fff',
            pb: 1.2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Aadhaar Verification
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            UIDAI guided flow with masked storage
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {aadhaarDialogStep === 1 ? (
            <Stack spacing={1.35} sx={{ mt: 0.4 }}>
              <Alert severity="info">Full Aadhaar is never stored. Only masked value is retained in form.</Alert>
              <Input
                label="Aadhaar Number"
                placeholder="XXXX XXXX XXXX"
                value={aadhaarInput}
                fullWidth
                size="small"
                inputProps={{ maxLength: 14 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAadhaarInput(formatAadhaarNumber(event.target.value))
                }
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {renderMethodCard('aadhaar-otp', aadhaarMethod === 'otp', '📱', 'OTP', 'Mobile OTP', () =>
                  setAadhaarMethod('otp'),
                )}
                {renderMethodCard('aadhaar-bio', aadhaarMethod === 'bio', '👆', 'Biometric', 'Device based verify', () =>
                  setAadhaarMethod('bio'),
                )}
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.35} sx={{ mt: 0.4 }}>
              <Alert severity="success">OTP sent to Aadhaar-linked mobile. Enter OTP to verify.</Alert>
              <Input
                label="OTP"
                placeholder="Enter 6-digit OTP"
                value={aadhaarOtp}
                fullWidth
                size="small"
                inputProps={{ maxLength: OTP_LENGTH }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAadhaarOtp(toDigits(event.target.value).slice(0, OTP_LENGTH))
                }
              />
              <Typography variant="caption" color="text.secondary">
                {aadhaarOtpTimer > 0 ? `Resend in ${aadhaarOtpTimer}s` : 'OTP expired. You can resend now.'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.2, py: 1.3 }}>
          {aadhaarDialogStep === 1 ? (
            <>
              <Button type="button" onClick={closeAadhaarDialog} variant="outlined">
                Cancel
              </Button>
              <Button type="button" onClick={handleAadhaarContinue} variant="contained">
                {aadhaarMethod === 'otp' ? 'Send OTP' : 'Verify Biometric'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" onClick={() => setAadhaarDialogStep(1)} variant="outlined">
                Back
              </Button>
              <Button
                type="button"
                variant="text"
                onClick={() => setAadhaarOtpTimer(OTP_DURATION_SECONDS)}
                disabled={aadhaarOtpTimer > 0}
              >
                Resend OTP
              </Button>
              <Button type="button" onClick={handleAadhaarOtpVerify} variant="contained" disabled={!isValidOtp(aadhaarOtp)}>
                Verify
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
