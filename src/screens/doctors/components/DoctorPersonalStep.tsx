'use client';

import * as React from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormDatePicker, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';

interface DoctorPersonalStepProps extends FormikProps<DoctorRegistrationFormData> {}

const prefixOptions = [
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof. Dr.', label: 'Prof. Dr.' },
  { value: 'Assoc. Prof. Dr.', label: 'Assoc. Prof. Dr.' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Mrs.', label: 'Mrs.' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const bloodGroupOptions = [
  { value: '', label: '-- Select --' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const maritalStatusOptions = [
  { value: '', label: '-- Select --' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function DoctorPersonalStep({ values, setFieldValue }: DoctorPersonalStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  React.useEffect(() => {
    if (values.dob) {
      const birthDate = new Date(values.dob);
      const today = new Date();
      const years = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      const age = m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? years - 1 : years;
      setFieldValue('age', age > 0 ? String(age) : '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.dob]);

  return (
    <Stack spacing={2}>
      {/* Personal Details Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Personal Details
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Personal Info" sx={chipSx} />
              <Chip size="small" label="Demographics" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={2}>
              <FormSelect name="prefix" label="Prefix" options={prefixOptions} required />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField name="firstName" label="First Name" placeholder="e.g. Rajesh" required />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField name="middleName" label="Middle Name" placeholder="Optional" />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField name="lastName" label="Last Name / Surname" placeholder="e.g. Kumar" required />
            </Grid>

            <Grid xs={12} md={3}>
              <FormSelect name="gender" label="Gender" options={genderOptions} required />
            </Grid>
            <Grid xs={12} md={3}>
              <FormDatePicker
                name="dob"
                label="Date of Birth"
                required
              />
            </Grid>
            <Grid xs={12} md={2}>
              <FormTextField name="age" label="Age (Years)" placeholder="Auto" />
            </Grid>
            <Grid xs={12} md={2}>
              <FormSelect name="bloodGroup" label="Blood Group" options={bloodGroupOptions} />
            </Grid>
            <Grid xs={12} md={2}>
              <FormSelect name="maritalStatus" label="Marital Status" options={maritalStatusOptions} />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Identity Documents Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {isIndia ? 'Government Identity (India)' : 'International Identity'}
            </Typography>
            <Chip
              size="small"
              label={isIndia ? 'Aadhaar / PAN' : 'Passport'}
              sx={chipSx}
            />
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          {isIndia ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Aadhaar and PAN are used for background verification and tax compliance. Aadhaar is stored in masked
                form only (last 4 digits).
              </Alert>
              <Grid container spacing={1.35}>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    placeholder="XXXX XXXX XXXX"
                    helperText="Stored masked — last 4 digits only"
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="panNumber"
                    label="PAN Number"
                    placeholder="ABCDE1234F"
                    helperText="Required for salary / payments"
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Passport is the primary identity document for international doctors. Ensure the passport is valid for
                the entire employment period.
              </Alert>
              <Grid container spacing={1.35}>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="passportNumber"
                    label="Passport Number"
                    placeholder="A1234567"
                    required
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormDatePicker name="passportExpiry" label="Passport Expiry Date" required />
                </Grid>
                <Grid xs={12} md={4}>
                  <FormTextField
                    name="countryOfCitizenship"
                    label="Country of Citizenship"
                    placeholder="e.g. United Arab Emirates"
                    required
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Card>
    </Stack>
  );
}
