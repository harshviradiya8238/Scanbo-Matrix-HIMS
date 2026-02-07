'use client';

import { Box, Chip, Typography, Stack } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@mui/material';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import {
  FormTextField,
  FormSelect,
  FormDatePicker,
  FormCheckbox,
  FormPhoneInput,
} from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';

interface PatientDetailsStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPrefix?: () => void;
  onAddEmployer?: () => void;
}

export default function PatientDetailsStep({
  onAddPrefix,
  onAddEmployer,
}: PatientDetailsStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const prefixOptions = [
    { value: '', label: '-- Select --' },
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'miss', label: 'Miss' },
    { value: 'dr', label: 'Dr.' },
  ];

  const genderOptions = [
    { value: '', label: '-- Select --' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: '', label: '-- Select --' },
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  const ageUnitOptions = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
    { value: 'days', label: 'Days' },
  ];

  const occupationOptions = [
    { value: '', label: '-- Select --' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'business', label: 'Business' },
  ];

  const employerOptions = [
    { value: '', label: '-- Select --' },
    { value: 'self', label: 'Self Employed' },
    { value: 'company1', label: 'Company 1' },
    { value: 'company2', label: 'Company 2' },
  ];

  const nationalityOptions = [
    { value: '', label: '-- Select --' },
    { value: 'uae', label: 'UAE' },
    { value: 'india', label: 'India' },
    { value: 'pakistan', label: 'Pakistan' },
  ];

  const howDidYouHearOptions = [
    { value: '', label: '-- Select --' },
    { value: 'friend', label: 'Friend/Relative' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'online', label: 'Online' },
    { value: 'doctor', label: 'Doctor Referral' },
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
            Patient Details
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip
              size="small"
              label="Demographics"
              sx={chipSx}
            />
            <Chip
              size="small"
              label="Primary Contacts"
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
              name="prefix"
              label="Prefix"
              options={prefixOptions}
              required
              // showAddButton
              onAddClick={onAddPrefix}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="patientName" 
              label="Patient Name" 
              required 
              placeholder="Enter patient first name"
              startIcon={<PersonIcon fontSize="small" color="action" />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="middleName" 
              label="Middle Name" 
              placeholder="Enter middle name (optional)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="lastName" 
              label="Last Name" 
              required 
              placeholder="Enter patient last name"
            />
          </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormSelect
            name="gender"
            label="Gender"
            options={genderOptions}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormSelect
            name="maritalStatus"
            label="Marital Status"
            options={maritalStatusOptions}
          />
        </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormDatePicker 
              name="dob" 
              label="Date of Birth" 
              placeholder="Select date of birth"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                '& > *': {
                  flex: 1,
                  minWidth: 0,
                },
              }}
            >
              <FormTextField
                name="age"
                label="Age"
                required
                // type="number"
                placeholder="Enter age"
              />
              <FormSelect
                name="ageUnit"
                label="Unit"
                options={ageUnitOptions}
                required
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="occupation"
              label="Occupation"
              options={occupationOptions}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormPhoneInput 
              name="mobile" 
              label="Mobile Number" 
              required 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="aliasName" 
              label="Alias Name" 
              placeholder="Enter alias name (optional)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="employer"
              label="Employer"
              options={employerOptions}
              required
              // showAddButton
              onAddClick={onAddEmployer}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="email" 
              label="Email Address" 
              type="email" 
              required 
              placeholder="Enter email address"
              startIcon={<EmailIcon fontSize="small" color="action" />}
            />
          </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormSelect
            name="nationality"
            label="Nationality"
            options={nationalityOptions}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormCheckbox name="mlc" label="MLC" />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormCheckbox name="confidential" label="Confidential" />
        </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="externalStaffId" 
              label="External Staff ID" 
              placeholder="Enter external staff ID (optional)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="rm" 
              label="RM" 
              placeholder="Enter RM (optional)"
            />
          </Grid>

          <Grid item xs={12}>
            <FormSelect
              name="howDidYouHear"
              label="How did you hear about RMD HOSPITALS?"
              options={howDidYouHearOptions}
              required
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}
