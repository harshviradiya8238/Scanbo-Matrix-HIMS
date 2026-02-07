'use client';

import { Box, Chip, Typography, Stack } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@mui/material';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormTextField, FormSelect, FormPhoneInput } from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  ContactEmergency as EmergencyIcon,
} from '@mui/icons-material';

interface NextOfKinStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddRelationship?: () => void;
  onAddPrefix?: () => void;
}

export default function NextOfKinStep({
  onAddRelationship,
  onAddPrefix,
}: NextOfKinStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const relationshipOptions = [
    { value: '', label: '-- Select --' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
  ];

  const prefixOptions = [
    { value: '', label: '-- Select --' },
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'miss', label: 'Miss' },
    { value: 'dr', label: 'Dr.' },
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
            Next Of Kin Details
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip
              size="small"
              label="Emergency Contact"
              sx={chipSx}
            />
            <Chip
              size="small"
              label="Relationship Mapping"
              sx={chipSx}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="relationship"
              label="Relationship"
              options={relationshipOptions}
              // showAddButton
              onAddClick={onAddRelationship}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="kinPrefix"
              label="Prefix"
              options={prefixOptions}
              // showAddButton
              onAddClick={onAddPrefix}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="kinFirstName" 
              label="First Name" 
              placeholder="Enter first name"
              startIcon={<PersonIcon fontSize="small" color="action" />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="kinMiddleName" 
              label="Middle Name" 
              placeholder="Enter middle name (optional)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="kinLastName" 
              label="Last Name" 
              placeholder="Enter last name"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormPhoneInput 
              name="emergencyNumber" 
              label="Emergency Contact Number" 
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}
