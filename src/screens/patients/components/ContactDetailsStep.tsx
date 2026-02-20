'use client';

import { Alert, Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import {
  FormCheckbox,
  FormPhoneInput,
  FormSelect,
  FormTextField,
} from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';

interface ContactDetailsStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddCountry?: () => void;
  onAddState?: () => void;
}

export default function ContactDetailsStep({
  values,
  setFieldValue,
  onAddCountry,
  onAddState,
}: ContactDetailsStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';
  const phoneCode = isIndia ? '+91' : values.internationalCountryCode || '+971';

  const areaTypeOptions = [
    { value: 'urban', label: 'Urban' },
    { value: 'semi_urban', label: 'Semi-Urban' },
    { value: 'rural', label: 'Rural / Village' },
    { value: 'tribal', label: 'Tribal' },
  ];

  const indiaStateOptions = [
    { value: '', label: 'Select state...' },
    { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'telangana', label: 'Telangana' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
    { value: 'west_bengal', label: 'West Bengal' },
  ];

  const countryOptions = [
    { value: 'india', label: 'India' },
    { value: 'uae', label: 'United Arab Emirates' },
    { value: 'saudi_arabia', label: 'Saudi Arabia' },
    { value: 'united_states', label: 'United States' },
    { value: 'united_kingdom', label: 'United Kingdom' },
    { value: 'australia', label: 'Australia' },
    { value: 'canada', label: 'Canada' },
    { value: 'other', label: 'Other' },
  ];

  const countryCodeOptions = [
    { value: '+971', label: '+971 UAE' },
    { value: '+966', label: '+966 Saudi Arabia' },
    { value: '+1', label: '+1 USA / Canada' },
    { value: '+44', label: '+44 UK' },
    { value: '+61', label: '+61 Australia' },
    { value: '+49', label: '+49 Germany' },
    { value: '+33', label: '+33 France' },
  ];

  return (
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
          backgroundColor: softSurface,
          color: 'text.primary',
        }}
      >
        <Stack spacing={0.8}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Contact & Address
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip size="small" label="Communication Details" sx={chipSx} />
            <Chip size="small" label={isIndia ? 'Address (India)' : 'Address (International)'} sx={chipSx} />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Grid container spacing={1.35}>
          <Grid xs={12} md={4}>
            <FormPhoneInput name="mobile" label="Mobile / Primary Phone" required countryCode={phoneCode} />
          </Grid>
          <Grid xs={12} md={4}>
            <FormPhoneInput name="alternatePhone" label="Alternate Phone" countryCode={phoneCode} />
          </Grid>
          <Grid xs={12} md={4}>
            <FormTextField name="email" label="Email Address" type="email" />
          </Grid>
        </Grid>

        {isIndia ? (
          <Box sx={{ mt: 1.6 }}>
            <Grid container spacing={1.35}>
              <Grid xs={12}>
                <FormTextField name="addressLine1" label="Address Line 1" required />
              </Grid>
              <Grid xs={12} md={8}>
                <FormTextField name="addressLine2" label="Address Line 2 / Locality" />
              </Grid>
              <Grid xs={12} md={4}>
                <FormTextField name="landmark" label="Landmark" />
              </Grid>
              <Grid xs={12} md={4}>
                <FormTextField name="city" label="City / Town" required />
              </Grid>
              <Grid xs={12} md={4}>
                <FormTextField name="district" label="District" />
              </Grid>
              <Grid xs={12} md={4}>
                <FormSelect
                  name="state"
                  label="State"
                  options={indiaStateOptions}
                  required
                  onAddClick={onAddState}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <FormTextField name="pinCode" label="PIN Code" required />
              </Grid>
              <Grid xs={12} md={4}>
                <FormSelect name="areaType" label="Area Type" options={areaTypeOptions} />
              </Grid>
              <Grid xs={12} md={4}>
                <FormPhoneInput name="landline" label="Landline Number" countryCode="+91" />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ mt: 1.6 }}>
            <Alert severity="info" sx={{ mb: 1.2 }}>
              Capture both home country address and local stay details in India for international patients.
            </Alert>
            <Grid container spacing={1.35}>
              <Grid xs={12}>
                <FormTextField
                  name="homeAddress"
                  label="Home Address (Country of Origin)"
                  required
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid xs={12} md={8}>
                <FormTextField name="localAddressIndia" label="Local Address in India" />
              </Grid>
              <Grid xs={12} md={4}>
                <FormTextField name="indiaStayDuration" label="India Stay Duration" placeholder="e.g. 2 weeks" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormSelect
                  name="country"
                  label="Country"
                  options={countryOptions}
                  required
                  onAddClick={onAddCountry}
                  onValueChange={(value) => {
                    const selectedCountry = String(value);
                    if (selectedCountry === 'india') {
                      setFieldValue('registrationCountry', 'india');
                      setFieldValue('internationalCountryCode', '+91');
                      return;
                    }
                    setFieldValue('registrationCountry', 'international');
                    if (!values.intlNationality) {
                      setFieldValue('intlNationality', selectedCountry);
                    }
                  }}
                />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="stateProvince" label="State / Province" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="city" label="City" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="postalCode" label="ZIP / Postal Code" />
              </Grid>
              <Grid xs={12} md={4}>
                <FormSelect
                  name="internationalCountryCode"
                  label="International Country Code"
                  options={countryCodeOptions}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <FormPhoneInput name="mobile" label="International Phone" required countryCode={phoneCode} />
              </Grid>
              <Grid xs={12} md={4}>
                <FormPhoneInput name="landline" label="Additional Phone" countryCode={phoneCode} />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 1.6 }}>
          <FormCheckbox
            name="correspondenceAddressSame"
            label="Correspondence address same as permanent address"
          />
        </Box>
      </Box>
    </Card>
  );
}
