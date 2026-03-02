'use client';

import * as React from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme, alpha } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormDatePicker, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';
import { Badge as BadgeIcon, VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';

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

export default function DoctorIdentityStep({ values, setFieldValue }: DoctorIdentityStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  const handleCountryChange = (country: 'india' | 'international') => {
    setFieldValue('registrationCountry', country);
  };

  return (
    <Stack spacing={2}>
      {/* Country Selector Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => handleCountryChange('india')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCountryChange('india');
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
            transition: 'all .2s ease',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 19 }}>🇮🇳</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                India Registration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                NMC / State Medical Council license
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          role="button"
          tabIndex={0}
          onClick={() => handleCountryChange('international')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCountryChange('international');
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
            transition: 'all .2s ease',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 19 }}>🌍</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                International Registration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Foreign medical license & credentials
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

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

          <Grid container spacing={1.35}>
            <Grid xs={12} md={3}>
              <FormTextField
                name="doctorId"
                label="Doctor ID"
                placeholder="DOC-001"
                startIcon={<BadgeIcon fontSize="small" color="action" />}
                helperText="Auto-generated on save"
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormSelect name="doctorType" label="Doctor Type" options={doctorTypeOptions} required />
            </Grid>
            <Grid xs={12} md={3}>
              <FormDatePicker name="regDate" label="Registration Date" required />
            </Grid>

            {isIndia ? (
              <>
                <Grid xs={12} md={3}>
                  <FormTextField
                    name="nmcRegNumber"
                    label="NMC / SMC Reg. Number"
                    placeholder="MCI-2024-XXXXX"
                    required
                  />
                </Grid>
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
