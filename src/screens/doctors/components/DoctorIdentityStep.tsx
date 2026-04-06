'use client';

import * as React from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme, alpha } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormDatePicker, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';
import { Sync as SyncIcon, VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';

interface DoctorIdentityStepProps extends FormikProps<DoctorRegistrationFormData> {}

const doctorTypeOptions = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'visiting', label: 'Visiting Doctor' },
  { value: 'resident', label: 'Resident' },
  { value: 'intern', label: 'Intern / House Officer' },
  { value: 'telemedicine', label: 'Telemedicine Doctor' },
  { value: 'honorary', label: 'Honorary Consultant' },
];

const stateMedicalCouncilOptions = [
  { value: '', label: '-- Select Council --' },
  { value: 'mci', label: 'National Medical Commission (NMC)' },
  { value: 'delhi', label: 'Delhi Medical Council' },
  { value: 'maharashtra', label: 'Maharashtra Medical Council' },
  { value: 'karnataka', label: 'Karnataka Medical Council' },
  { value: 'tamil_nadu', label: 'Tamil Nadu Medical Council' },
  { value: 'kerala', label: 'Kerala Medical Council' },
  { value: 'gujarat', label: 'Gujarat Medical Council' },
  { value: 'rajasthan', label: 'Rajasthan Medical Council' },
  { value: 'up', label: 'Uttar Pradesh Medical Council' },
  { value: 'west_bengal', label: 'West Bengal Medical Council' },
  { value: 'telangana', label: 'Telangana State Medical Council' },
  { value: 'andhra', label: 'Andhra Pradesh Medical Council' },
  { value: 'punjab', label: 'Punjab Medical Council' },
  { value: 'haryana', label: 'Haryana Medical Council' },
  { value: 'other', label: 'Other State Council' },
];

const issuingCountryOptions = [
  { value: '', label: 'Select country...' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'sri_lanka', label: 'Sri Lanka' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'other', label: 'Other' },
];

const MCI_MOCK_DIRECTORY = [
  {
    regNumber: 'MCI-2024-12873',
    firstName: 'Arjun',
    lastName: 'Rao',
    gender: 'male',
    primarySpecialization: 'cardiology',
    designation: 'consultant',
    department: 'cardiology',
    yearsOfExperience: '10',
    qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
    stateMedicalCouncil: 'maharashtra',
    licenseState: 'Maharashtra',
  },
  {
    regNumber: 'MCI-2024-44218',
    firstName: 'Nivedita',
    lastName: 'Sharma',
    gender: 'female',
    primarySpecialization: 'pediatrics',
    designation: 'senior_consultant',
    department: 'pediatrics',
    yearsOfExperience: '15',
    qualifications: 'MBBS, MD (Pediatrics)',
    stateMedicalCouncil: 'delhi',
    licenseState: 'Delhi',
  },
] as const;

export default function DoctorIdentityStep({ values, setFieldValue }: DoctorIdentityStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';
  const [isPullingFromMci, setIsPullingFromMci] = React.useState(false);
  const [mciSyncMessage, setMciSyncMessage] = React.useState<{
    severity: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Reset MCI sync message when country toggles from the header
  React.useEffect(() => {
    setMciSyncMessage(null);
  }, [values.registrationCountry]);

  const handlePullFromMci = async () => {
    const normalizedReg = values.nmcRegNumber.trim().toUpperCase();
    if (!normalizedReg) {
      setMciSyncMessage({
        severity: 'error',
        text: 'Enter NMC / SMC registration number first to pull doctor details.',
      });
      return;
    }

    setIsPullingFromMci(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const profile = MCI_MOCK_DIRECTORY.find((item) => item.regNumber === normalizedReg);
    if (!profile) {
      setMciSyncMessage({
        severity: 'error',
        text: 'No matching record found on MCI directory for this registration number.',
      });
      setIsPullingFromMci(false);
      return;
    }

    setFieldValue('firstName', profile.firstName);
    setFieldValue('lastName', profile.lastName);
    setFieldValue('gender', profile.gender);
    setFieldValue('primarySpecialization', profile.primarySpecialization);
    setFieldValue('designation', profile.designation);
    setFieldValue('department', profile.department);
    setFieldValue('yearsOfExperience', profile.yearsOfExperience);
    setFieldValue('qualifications', profile.qualifications);
    setFieldValue('stateMedicalCouncil', profile.stateMedicalCouncil);
    setFieldValue('licenseState', profile.licenseState);

    setMciSyncMessage({
      severity: 'success',
      text: 'Doctor details pulled from MCI and prefilled in Personal Info.',
    });
    setIsPullingFromMci(false);
  };

  return (
    <Stack spacing={2}>
      {/* Registration Details Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Registration &amp; License Details
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Doctor Onboarding" sx={chipSx} />
              <Chip size="small" label={isIndia ? 'NMC / SMC' : 'Foreign License'} sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          {isIndia ? (
            <Alert severity="info" icon={<VerifiedUserIcon fontSize="small" />} sx={{ mb: 2 }}>
              Provide your National Medical Commission (NMC) or State Medical Council (SMC) registration details. All
              license numbers are verified against official registries before activation.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Provide a valid medical license from the issuing country authority. A credential evaluation letter may
              be required for countries outside the recognized list.
            </Alert>
          )}

          {isIndia ? (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1.35} alignItems="center">
                <Grid xs={12} md={5}>
                  <FormTextField
                    name="nmcRegNumber"
                    label="NMC / SMC Reg. Number"
                    placeholder="MCI-2024-XXXXX"
                    required
                  />
                </Grid>
                <Grid xs={12} md={5}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: { md: 0.5 } }}>
                    Enter NMC / SMC number first, then pull details.
                  </Typography>
                </Grid>
                <Grid xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={<SyncIcon />}
                    onClick={() => void handlePullFromMci()}
                    disabled={isPullingFromMci}
                    size="small"
                    sx={{
                      minHeight: 34,
                      px: 1.6,
                      boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.28)}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isPullingFromMci ? 'Pulling...' : 'Pull from MCI'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : null}

          {mciSyncMessage ? (
            <Alert severity={mciSyncMessage.severity} sx={{ mb: 2 }}>
              {mciSyncMessage.text}
            </Alert>
          ) : null}

          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormSelect name="doctorType" label="Doctor Type" options={doctorTypeOptions} required />
            </Grid>
            <Grid xs={12} md={4}>
              <FormDatePicker name="regDate" label="Registration Date" required />
            </Grid>

            {isIndia ? (
              <>
                <Grid xs={12} md={4}>
                  <FormSelect
                    name="stateMedicalCouncil"
                    label="State / National Medical Council"
                    options={stateMedicalCouncilOptions}
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="licenseState"
                    label="License State / UT"
                    placeholder="e.g. Maharashtra"
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="licenseExpiry" label="License Expiry Date" required />
                </Grid>
              </>
            ) : (
              <>
                <Grid xs={12} md={3}>
                  <FormTextField
                    name="medicalLicenseNumber"
                    label="Medical License Number"
                    placeholder="LIC-XXXXXXXX"
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormSelect
                    name="issuingCountry"
                    label="Country of Issuance"
                    options={issuingCountryOptions}
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="issuingAuthority"
                    label="Issuing Authority / Board"
                    placeholder="e.g. Dubai Health Authority"
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="intlLicenseExpiry" label="License Expiry Date" required />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Card>
    </Stack>
  );
}
