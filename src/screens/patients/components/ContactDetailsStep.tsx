'use client';

import { Box, Chip, Typography, Divider, Stack } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import {
  FormTextField,
  FormSelect,
  FormCheckbox,
  FormPhoneInput,
  FormRadioGroup,
} from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import {
  Home as HomeIcon,
  LocationCity as CityIcon,
  Pin as PinIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

interface ContactDetailsStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddCountry?: () => void;
  onAddState?: () => void;
  onAddCity?: () => void;
}

export default function ContactDetailsStep({
  values,
  onAddCountry,
  onAddState,
  onAddCity,
}: ContactDetailsStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const countryOptions = [
    { value: 'uae', label: 'United Arab Emirate' },
    { value: 'india', label: 'India' },
    { value: 'pakistan', label: 'Pakistan' },
  ];

  const stateOptions = [
    { value: 'dubai', label: 'Dubai' },
    { value: 'abu_dhabi', label: 'Abu Dhabi' },
    { value: 'sharjah', label: 'Sharjah' },
  ];

  const cityOptions = [
    { value: 'dubai', label: 'DUBAI' },
    { value: 'abu_dhabi', label: 'Abu Dhabi' },
    { value: 'sharjah', label: 'Sharjah' },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
            Contact Details
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip
              size="small"
              label="Address Verification"
              sx={chipSx}
            />
            <Chip
              size="small"
              label="Communication Details"
              sx={chipSx}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography 
              variant="caption" 
              sx={{ 
                mb: 1.5, 
                display: 'block', 
                fontWeight: 600, 
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Address (Permanent)
            </Typography>
            <FormRadioGroup
              name="addressType"
              options={[
                { value: 'urban', label: 'Urban' },
                { value: 'rural', label: 'Rural' },
              ]}
              row
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="houseNumber" 
              label="House Number" 
              placeholder="Enter house/building number"
              startIcon={<HomeIcon fontSize="small" color="action" />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="street" 
              label="Street" 
              placeholder="Enter street name"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="locality" 
              label="Locality" 
              placeholder="Enter locality/area"
            />
          </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormSelect
                name="country"
                label="Country"
                options={countryOptions}
                required
                // showAddButton
                onAddClick={onAddCountry}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormSelect
                name="state"
                label="State"
                options={stateOptions}
                required
                // showAddButton
                onAddClick={onAddState}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormSelect
                name="city"
                label="City"
                options={cityOptions}
                required
                // showAddButton
                onAddClick={onAddCity}
              />
            </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="poBox" 
              label="PO Box Number" 
              placeholder="Enter PO Box number (optional)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="pinCode" 
              label="Pin Code" 
              placeholder="Enter pin/postal code"
              startIcon={<PinIcon fontSize="small" color="action" />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormPhoneInput 
              name="landline" 
              label="Landline Number" 
            />
          </Grid>

          <Grid item xs={12}>
            <FormCheckbox
              name="correspondenceAddressSame"
              label="Correspondence address same as above"
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}
