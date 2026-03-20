'use client';

import * as React from 'react';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';

interface DoctorProfessionalStepProps extends FormikProps<DoctorRegistrationFormData> {}

const specializationOptions = [
  { value: '', label: '-- Select Specialization --' },
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'general_surgery', label: 'General Surgery' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'cardiac_surgery', label: 'Cardiac Surgery' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'neurosurgery', label: 'Neurosurgery' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'gynecology', label: 'Gynecology & Obstetrics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'neonatology', label: 'Neonatology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'radiation_oncology', label: 'Radiation Oncology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'hepatology', label: 'Hepatology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'urology', label: 'Urology' },
  { value: 'endocrinology', label: 'Endocrinology & Diabetology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT (Ear, Nose & Throat)' },
  { value: 'radiology', label: 'Radiology & Imaging' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'emergency_medicine', label: 'Emergency Medicine' },
  { value: 'critical_care', label: 'Critical Care / ICU' },
  { value: 'plastic_surgery', label: 'Plastic & Reconstructive Surgery' },
  { value: 'vascular_surgery', label: 'Vascular Surgery' },
  { value: 'dentistry', label: 'Dentistry & Oral Surgery' },
  { value: 'physical_medicine', label: 'Physical Medicine & Rehabilitation' },
  { value: 'family_medicine', label: 'Family Medicine' },
  { value: 'ayurveda', label: 'Ayurveda' },
  { value: 'homeopathy', label: 'Homeopathy' },
  { value: 'other', label: 'Other' },
];

const designationOptions = [
  { value: '', label: '-- Select Designation --' },
  { value: 'director_medical', label: 'Director of Medical Services' },
  { value: 'chief_medical_officer', label: 'Chief Medical Officer (CMO)' },
  { value: 'head_department', label: 'Head of Department (HOD)' },
  { value: 'professor', label: 'Professor' },
  { value: 'associate_professor', label: 'Associate Professor' },
  { value: 'assistant_professor', label: 'Assistant Professor' },
  { value: 'senior_consultant', label: 'Senior Consultant' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'junior_consultant', label: 'Junior Consultant' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'senior_resident', label: 'Senior Resident' },
  { value: 'junior_resident', label: 'Junior Resident' },
  { value: 'intern', label: 'Intern' },
  { value: 'visiting_consultant', label: 'Visiting Consultant' },
  { value: 'honorary_consultant', label: 'Honorary Consultant' },
];

const departmentOptions = [
  { value: '', label: '-- Select Department --' },
  { value: 'medicine', label: 'Internal Medicine' },
  { value: 'surgery', label: 'General Surgery' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'gynecology', label: 'Gynecology & Obstetrics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'urology', label: 'Urology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'emergency', label: 'Emergency & Critical Care' },
  { value: 'dental', label: 'Dental' },
  { value: 'rehabilitation', label: 'Physical Medicine & Rehab' },
];

const durationOptions = [
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

const experienceOptions = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '5', label: '5 years' },
  { value: '7', label: '7 years' },
  { value: '10', label: '10 years' },
  { value: '15', label: '15 years' },
  { value: '20', label: '20 years' },
  { value: '25', label: '25+ years' },
];

const languageOptions = [
  { value: '', label: '-- Select Language --' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'malayalam', label: 'Malayalam' },
];

export default function DoctorProfessionalStep(_: DoctorProfessionalStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);

  return (
    <Stack spacing={2}>
      {/* Specialization & Role */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Specialization &amp; Role
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Clinical Role" sx={chipSx} />
              <Chip size="small" label="Specialty" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormSelect
                name="primarySpecialization"
                label="Primary Specialization"
                options={specializationOptions}
                required
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField
                name="subSpecialization"
                label="Sub-Specialization"
                placeholder="e.g. Interventional Cardiology"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="designation" label="Designation" options={designationOptions} required />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="department" label="Department" options={departmentOptions} required />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect
                name="yearsOfExperience"
                label="Years of Experience"
                options={experienceOptions}
                required
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect
                name="languagesSpoken"
                label="Languages Spoken"
                options={languageOptions}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Qualifications */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, backgroundColor: softSurface }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Academic Qualifications
          </Typography>
        </Box>
        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={6}>
              <FormTextField
                name="qualifications"
                label="Primary Qualification"
                placeholder="e.g. MBBS, MD (General Medicine)"
                required
                helperText="Highest medical degree"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormTextField
                name="additionalQualifications"
                label="Additional Qualifications"
                placeholder="e.g. DNB, MRCP, FRCS, PhD"
                helperText="Comma-separated additional degrees"
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Consultation Profile */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
       

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormTextField
                name="consultationFeeOPD"
                label="OPD Consultation Fee (₹ / $)"
                placeholder="e.g. 500"
                helperText="Fee per consultation"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect
                name="consultationDurationMins"
                label="Consultation Duration"
                options={durationOptions}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Stack>
  );
}
