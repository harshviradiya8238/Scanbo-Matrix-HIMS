'use client';

import * as React from 'react';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormDatePicker, FormSelect, FormTextField } from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';

interface PatientDetailsStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPrefix?: () => void;
}

function calculateAgeFromDate(dateValue: string): string {
  if (!dateValue) return '';
  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : '';
}

export default function PatientDetailsStep({
  values,
  setFieldValue,
  onAddPrefix,
}: PatientDetailsStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);

  React.useEffect(() => {
    const nextAge = calculateAgeFromDate(values.dob);
    if (values.dob && nextAge && values.age !== nextAge) {
      setFieldValue('age', nextAge, false);
    }
  }, [setFieldValue, values.age, values.dob]);

  const titleOptions = [
    { value: '', label: 'Select title...' },
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'ms', label: 'Ms.' },
    { value: 'dr', label: 'Dr.' },
    { value: 'master', label: 'Master' },
    { value: 'baby', label: 'Baby' },
  ];

  const genderOptions = [
    { value: '', label: 'Select gender...' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'transgender', label: 'Transgender' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
  ];

  const maritalStatusOptions = [
    { value: '', label: 'Select marital status...' },
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
  ];

  const ageUnitOptions = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
    { value: 'days', label: 'Days' },
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Unknown' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
  ];

  const religionOptions = [
    { value: '', label: 'Not Specified' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'christian', label: 'Christian' },
    { value: 'sikh', label: 'Sikh' },
    { value: 'buddhist', label: 'Buddhist' },
    { value: 'jain', label: 'Jain' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
  ];

  const casteCategoryOptions = [
    { value: '', label: 'Not Specified' },
    { value: 'general', label: 'General / Unreserved' },
    { value: 'obc', label: 'OBC' },
    { value: 'sc', label: 'SC' },
    { value: 'st', label: 'ST' },
    { value: 'ews', label: 'EWS' },
  ];

  const educationLevelOptions = [
    { value: '', label: 'Not Specified' },
    { value: 'illiterate', label: 'Illiterate' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'higher_secondary', label: 'Higher Secondary' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'post_graduate', label: 'Post Graduate' },
  ];

  const annualIncomeOptions = [
    { value: '', label: 'Not Disclosed' },
    { value: 'below_1_lakh', label: 'Below ₹1 Lakh' },
    { value: '1_to_3_lakh', label: '₹1-3 Lakh' },
    { value: '3_to_6_lakh', label: '₹3-6 Lakh' },
    { value: '6_to_10_lakh', label: '₹6-10 Lakh' },
    { value: 'above_10_lakh', label: 'Above ₹10 Lakh' },
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
            Personal Details
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip size="small" label="Demographics" sx={chipSx} />
            <Chip size="small" label="Medical Basics" sx={chipSx} />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Grid container spacing={1.35}>
          <Grid xs={12} md={3}>
            <FormSelect name="prefix" label="Title" options={titleOptions} required onAddClick={onAddPrefix} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="patientName" label="First Name" required />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="middleName" label="Middle Name" />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="lastName" label="Last Name" required />
          </Grid>

          <Grid xs={12} md={3}>
            <FormTextField name="localScriptName" label="Name in Local Script" placeholder="हिन्दी / தமிழ் / etc." />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="gender" label="Gender" options={genderOptions} required />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="maritalStatus" label="Marital Status" options={maritalStatusOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="occupation" label="Occupation" />
          </Grid>

          <Grid xs={12} md={3}>
            <FormDatePicker name="dob" label="Date of Birth" required />
          </Grid>
          <Grid xs={12} md={2}>
            <FormTextField name="age" label="Age" />
          </Grid>
          <Grid xs={12} md={2}>
            <FormSelect name="ageUnit" label="Age Unit" options={ageUnitOptions} />
          </Grid>
          <Grid xs={12} md={2}>
            <FormSelect name="bloodGroup" label="Blood Group" options={bloodGroupOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormTextField name="aliasName" label="Alias Name" />
          </Grid>

          <Grid xs={12} md={3}>
            <FormSelect name="religion" label="Religion" options={religionOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="casteCategory" label="Caste Category" options={casteCategoryOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="educationLevel" label="Education Level" options={educationLevelOptions} />
          </Grid>
          <Grid xs={12} md={3}>
            <FormSelect name="annualIncomeRange" label="Annual Income Range" options={annualIncomeOptions} />
          </Grid>

          <Grid xs={12} md={6}>
            <FormTextField name="drugAllergies" label="Drug Allergies" placeholder="Penicillin, NSAIDs" />
          </Grid>
          <Grid xs={12} md={6}>
            <FormTextField name="foodAllergies" label="Food / Other Allergies" placeholder="Peanuts, Latex" />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

