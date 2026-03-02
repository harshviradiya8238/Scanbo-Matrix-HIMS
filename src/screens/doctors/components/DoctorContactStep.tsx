'use client';

import * as React from 'react';
import { Alert, Box, Chip, FormControlLabel, Checkbox, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';

interface DoctorContactStepProps extends FormikProps<DoctorRegistrationFormData> {}

const countryCodeOptions = [
  { value: '+91', label: '🇮🇳 +91 (India)' },
  { value: '+971', label: '🇦🇪 +971 (UAE)' },
  { value: '+1', label: '🇺🇸 +1 (USA / Canada)' },
  { value: '+44', label: '🇬🇧 +44 (UK)' },
  { value: '+61', label: '🇦🇺 +61 (Australia)' },
  { value: '+65', label: '🇸🇬 +65 (Singapore)' },
  { value: '+60', label: '🇲🇾 +60 (Malaysia)' },
  { value: '+94', label: '🇱🇰 +94 (Sri Lanka)' },
  { value: '+977', label: '🇳🇵 +977 (Nepal)' },
  { value: '+880', label: '🇧🇩 +880 (Bangladesh)' },
  { value: '+49', label: '🇩🇪 +49 (Germany)' },
  { value: '+33', label: '🇫🇷 +33 (France)' },
];

const indiaStateOptions = [
  { value: '', label: '-- Select State --' },
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'delhi', label: 'Delhi (NCT)' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
  { value: 'jammu_kashmir', label: 'Jammu & Kashmir' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'other', label: 'Other' },
];

const intlCountryOptions = [
  { value: '', label: '-- Select Country --' },
  { value: 'india', label: 'India' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'sri_lanka', label: 'Sri Lanka' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'other', label: 'Other' },
];

export default function DoctorContactStep({ values, setFieldValue }: DoctorContactStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  const handleSameAddressChange = (checked: boolean) => {
    setFieldValue('permanentAddressSame', checked);
    if (checked) {
      setFieldValue('permanentAddressLine1', values.clinicAddressLine1);
      setFieldValue('permanentAddressLine2', values.clinicAddressLine2);
      setFieldValue('permanentCity', values.clinicCity);
      setFieldValue('permanentState', values.clinicState);
      setFieldValue('permanentCountry', values.clinicCountry);
      setFieldValue('permanentPinCode', values.clinicPinCode);
    }
  };

  return (
    <Stack spacing={2}>
      {/* Contact Numbers */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Contact Information
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Phone & Email" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={2} >
              <FormSelect
                name="countryCode"
                label="Country Code"
                options={countryCodeOptions}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField
                name="mobile"
                label="Mobile Number"
                placeholder="XXXXXXXXXX"
                required
                helperText="Primary contact number"
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField
                name="alternatePhone"
                label="Alternate / Emergency Phone"
                placeholder="Optional"
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField
                name="email"
                label="Email Address"
                placeholder="doctor@hospital.com"
                required
                helperText="Official hospital email preferred"
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Clinic / Hospital Address */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Clinic / Workplace Address
            </Typography>
            <Chip size="small" label={isIndia ? 'India Address' : 'International Address'} sx={chipSx} />
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={6}>
              <FormTextField
                name="clinicAddressLine1"
                label="Address Line 1"
                placeholder="Building, Floor, Unit No."
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormTextField
                name="clinicAddressLine2"
                label="Address Line 2"
                placeholder="Street, Locality, Area"
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField name="clinicCity" label="City" placeholder="e.g. Mumbai" required />
            </Grid>

            {isIndia ? (
              <>
                <Grid xs={12} md={3}>
                  <FormSelect name="clinicState" label="State / UT" options={indiaStateOptions} required />
                </Grid>
                <Grid xs={12} md={3}>
                  <FormTextField name="clinicCountry" label="Country" placeholder="India" />
                </Grid>
                <Grid xs={12} md={3}>
                  <FormTextField
                    name="clinicPinCode"
                    label="PIN Code"
                    placeholder="6-digit PIN"
                    helperText="India postal code"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid xs={12} md={3}>
                  <FormTextField name="clinicState" label="State / Province / Emirate" placeholder="e.g. Dubai" required />
                </Grid>
                <Grid xs={12} md={3}>
                  <FormSelect name="clinicCountry" label="Country" options={intlCountryOptions} required />
                </Grid>
                <Grid xs={12} md={3}>
                  <FormTextField
                    name="clinicPinCode"
                    label="ZIP / Postal Code"
                    placeholder="e.g. 00000"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Card>

      {/* Permanent / Home Address */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Permanent / Home Address
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.permanentAddressSame}
                  onChange={(e) => handleSameAddressChange(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Same as clinic address
                </Typography>
              }
            />
          </Stack>
        </Box>

        {values.permanentAddressSame ? (
          <Box sx={{ p: 2.25 }}>
            <Alert severity="success" sx={{ borderRadius: 1.5 }}>
              Permanent address is the same as the clinic / workplace address.
            </Alert>
          </Box>
        ) : (
          <Box sx={{ p: 2.25 }}>
            <Grid container spacing={1.35}>
              <Grid xs={12} md={6}>
                <FormTextField
                  name="permanentAddressLine1"
                  label="Address Line 1"
                  placeholder="Building, Floor, Unit No."
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormTextField
                  name="permanentAddressLine2"
                  label="Address Line 2"
                  placeholder="Street, Locality, Area"
                />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="permanentCity" label="City" placeholder="e.g. Delhi" />
              </Grid>

              {isIndia ? (
                <>
                  <Grid xs={12} md={3}>
                    <FormSelect name="permanentState" label="State / UT" options={indiaStateOptions} />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <FormTextField name="permanentCountry" label="Country" placeholder="India" />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <FormTextField name="permanentPinCode" label="PIN Code" placeholder="6-digit PIN" />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid xs={12} md={3}>
                    <FormTextField name="permanentState" label="State / Province" placeholder="e.g. Abu Dhabi" />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <FormSelect name="permanentCountry" label="Country" options={intlCountryOptions} />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <FormTextField name="permanentPinCode" label="ZIP / Postal Code" placeholder="e.g. 00000" />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </Card>
    </Stack>
  );
}
