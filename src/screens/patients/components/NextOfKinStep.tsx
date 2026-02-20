'use client';

import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormPhoneInput, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';

interface NextOfKinStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPrefix?: () => void;
}

export default function NextOfKinStep({ values }: NextOfKinStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const phoneCode = values.registrationCountry === 'india' ? '+91' : values.internationalCountryCode || '+971';

  const relationshipOptions = [
    { value: '', label: 'Select relationship...' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  const consultPermissionOptions = [
    { value: 'full_access', label: 'Full Access' },
    { value: 'emergency_only', label: 'Emergency Only' },
    { value: 'financial_only', label: 'Financial Decisions' },
    { value: 'no_access', label: 'No Access' },
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
            Next of Kin / Emergency Contact
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip size="small" label="Primary NOK" sx={chipSx} />
            <Chip size="small" label="Secondary Contact" sx={chipSx} />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
          Primary Contact
        </Typography>
        <Grid container spacing={1.35} sx={{ mt: 0.2 }}>
          <Grid xs={12} md={4}>
            <FormTextField name="nokFullName" label="NOK Full Name" required />
          </Grid>
          <Grid xs={12} md={4}>
            <FormSelect name="nokRelationship" label="Relationship" options={relationshipOptions} required />
          </Grid>
          <Grid xs={12} md={4}>
            <FormPhoneInput name="nokMobile" label="NOK Mobile" required countryCode={phoneCode} />
          </Grid>
          <Grid xs={12} md={4}>
            <FormTextField name="nokEmail" label="NOK Email" type="email" />
          </Grid>
          <Grid xs={12} md={8}>
            <FormTextField name="nokAddress" label="NOK Address" />
          </Grid>
          <Grid xs={12} md={4}>
            <FormTextField name="nokIdNumber" label="NOK Aadhaar / ID" />
          </Grid>
          <Grid xs={12} md={4}>
            <FormSelect
              name="nokConsultPermission"
              label="Consult Permission"
              options={consultPermissionOptions}
            />
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          sx={{ mt: 1.6, display: 'block', color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}
        >
          Secondary Emergency Contact
        </Typography>
        <Grid container spacing={1.35} sx={{ mt: 0.2 }}>
          <Grid xs={12} md={3}>
            <FormTextField name="secondaryContactName" label="Contact Name" />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="secondaryRelationship" label="Relationship" options={relationshipOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormPhoneInput name="secondaryPhone" label="Contact Phone" countryCode={phoneCode} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="secondaryRelationToPrimary" label="Relation to Primary NOK" />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

