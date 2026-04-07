'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
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

const ZIP_DIRECTORY: Record<
  string,
  { city: string; state: string; county: string; country: string }
> = {
  '400001': {
    city: 'Mumbai',
    state: 'Maharashtra',
    county: 'Mumbai',
    country: 'India',
  },
  '411001': {
    city: 'Pune',
    state: 'Maharashtra',
    county: 'Pune',
    country: 'India',
  },
  '560001': {
    city: 'Bengaluru',
    state: 'Karnataka',
    county: 'Bengaluru Urban',
    country: 'India',
  },
  '600001': {
    city: 'Chennai',
    state: 'Tamil Nadu',
    county: 'Chennai',
    country: 'India',
  },
  '110001': {
    city: 'New Delhi',
    state: 'Delhi',
    county: 'New Delhi',
    country: 'India',
  },
  '500001': {
    city: 'Hyderabad',
    state: 'Telangana',
    county: 'Hyderabad',
    country: 'India',
  },
  '700001': {
    city: 'Kolkata',
    state: 'West Bengal',
    county: 'Kolkata',
    country: 'India',
  },
  '380001': {
    city: 'Ahmedabad',
    state: 'Gujarat',
    county: 'Ahmedabad',
    country: 'India',
  },
};

export default function DoctorContactStep({ values, setFieldValue }: DoctorContactStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';
  const lastProcessedZipRef = React.useRef('');
  const [zipLookupState, setZipLookupState] = React.useState<{
    status: 'idle' | 'found' | 'not_found';
    zip: string;
  }>({ status: 'idle', zip: '' });

  const handleSameAddressChange = (checked: boolean) => {
    setFieldValue('permanentAddressSame', checked);
    if (checked) {
      setFieldValue('permanentAddressLine1', values.clinicAddressLine1);
      setFieldValue('permanentAddressLine2', values.clinicAddressLine2);
      setFieldValue('permanentCounty', values.clinicCounty);
      setFieldValue('permanentCity', values.clinicCity);
      setFieldValue('permanentState', values.clinicState);
      setFieldValue('permanentCountry', values.clinicCountry);
      setFieldValue('permanentPinCode', values.clinicPinCode);
    }
  };

  React.useEffect(() => {
    const normalizedZip = values.clinicPinCode.replace(/\s+/g, '').trim();
    if (normalizedZip.length < 5) {
      lastProcessedZipRef.current = '';
      if (zipLookupState.status !== 'idle') {
        setZipLookupState({ status: 'idle', zip: '' });
      }
      return;
    }

    if (normalizedZip === lastProcessedZipRef.current) return;
    lastProcessedZipRef.current = normalizedZip;

    const lookup = ZIP_DIRECTORY[normalizedZip];
    if (!lookup) {
      setZipLookupState({ status: 'not_found', zip: normalizedZip });
      return;
    }

    setFieldValue('clinicCity', lookup.city, false);
    setFieldValue('clinicState', lookup.state, false);
    setFieldValue('clinicCounty', lookup.county, false);
    setFieldValue('clinicCountry', lookup.country, false);

    if (values.permanentAddressSame) {
      setFieldValue('permanentCity', lookup.city, false);
      setFieldValue('permanentState', lookup.state, false);
      setFieldValue('permanentCounty', lookup.county, false);
      setFieldValue('permanentCountry', lookup.country, false);
      setFieldValue('permanentPinCode', normalizedZip, false);
    }

    setZipLookupState({ status: 'found', zip: normalizedZip });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.clinicPinCode, values.permanentAddressSame]);

  const isZipAutofilled =
    zipLookupState.status === 'found'
    && zipLookupState.zip === values.clinicPinCode.replace(/\s+/g, '').trim();

  return (
    <Stack spacing={2}>
      {/* Contact Numbers */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Contact Information
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Phone & Email" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={2}>
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
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Clinic / Workplace Address
            </Typography>
            <Chip size="small" label={isIndia ? 'India Address' : 'International Address'} sx={chipSx} />
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={3}>
              <FormTextField
                name="clinicPinCode"
                label="ZIP Code"
                placeholder={isIndia ? '6-digit ZIP' : 'ZIP / Postal Code'}
                helperText="Enter ZIP first to auto-fill city/state/county/country"
                required
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField
                name="clinicCity"
                label="City"
                placeholder="e.g. Mumbai"
                required
                disabled={isZipAutofilled}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField
                name="clinicState"
                label="State / Province"
                placeholder="e.g. Maharashtra"
                required
                disabled={isZipAutofilled}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormTextField
                name="clinicCounty"
                label="County"
                placeholder="e.g. Mumbai"
                disabled={isZipAutofilled}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormTextField
                name="clinicCountry"
                label="Country"
                placeholder={isIndia ? 'India' : 'e.g. United Arab Emirates'}
                required
                disabled={isZipAutofilled}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormTextField
                name="clinicAddressLine1"
                label="Address Line 1"
                placeholder="Building, Floor, Unit No."
                required
              />
            </Grid>
            <Grid xs={12}>
              <FormTextField
                name="clinicAddressLine2"
                label="Address Line 2"
                placeholder="Street, Locality, Area"
              />
            </Grid>
          </Grid>

          {zipLookupState.status === 'found' ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              ZIP code verified. City, state, county, and country were auto-filled.
            </Alert>
          ) : null}
          {zipLookupState.status === 'not_found' ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              ZIP code not found in directory. Please enter city/state/county/country manually.
            </Alert>
          ) : null}
        </Box>
      </Card>

      {/* Permanent / Home Address */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Permanent / Home Address
            </Typography>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={values.permanentAddressSame}
                  onChange={(e) => handleSameAddressChange(e.target.checked)}
                  size="small"
                />
              )}
              label={(
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Same as clinic address
                </Typography>
              )}
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
              <Grid xs={12} md={3}>
                <FormTextField name="permanentPinCode" label="ZIP Code" placeholder="ZIP / Postal Code" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="permanentCity" label="City" placeholder="e.g. Delhi" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="permanentState" label="State / Province" placeholder="e.g. Delhi" />
              </Grid>
              <Grid xs={12} md={3}>
                <FormTextField name="permanentCounty" label="County" placeholder="e.g. New Delhi" />
              </Grid>
              <Grid xs={12} md={6}>
                <FormTextField name="permanentCountry" label="Country" placeholder={isIndia ? 'India' : 'Country'} />
              </Grid>
              <Grid xs={12} md={6}>
                <FormTextField
                  name="permanentAddressLine1"
                  label="Address Line 1"
                  placeholder="Building, Floor, Unit No."
                />
              </Grid>
              <Grid xs={12}>
                <FormTextField
                  name="permanentAddressLine2"
                  label="Address Line 2"
                  placeholder="Street, Locality, Area"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>
    </Stack>
  );
}
