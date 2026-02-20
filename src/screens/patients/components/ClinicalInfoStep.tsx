'use client';

import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import {
  FormCheckbox,
  FormSelect,
  FormTextField,
} from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';

type ClinicalInfoStepProps = FormikProps<PatientRegistrationFormData>;

export default function ClinicalInfoStep({ values }: ClinicalInfoStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  const consultantOptions = [
    { value: '', label: 'Assign consultant...' },
    { value: 'dr_k_anand', label: 'Dr. K. Anand - Cardiology' },
    { value: 'dr_s_mehta', label: 'Dr. S. Mehta - General Surgery' },
    { value: 'dr_p_rao', label: 'Dr. P. Rao - Internal Medicine' },
    { value: 'dr_r_joshi', label: 'Dr. R. Joshi - Orthopedics' },
    { value: 'dr_a_nair', label: 'Dr. A. Nair - Neurology' },
  ];

  const departmentOptions = [
    { value: '', label: 'Select department...' },
    { value: 'general_medicine', label: 'General Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'obg', label: 'Gynecology & Obstetrics' },
    { value: 'icu', label: 'ICU / Critical Care' },
  ];

  const admissionTypeOptions = [
    { value: 'opd', label: 'OPD - Outpatient' },
    { value: 'ipd', label: 'IPD - Inpatient' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'daycare', label: 'Daycare' },
    { value: 'icu', label: 'ICU' },
  ];

  const wardPreferenceOptions = [
    { value: '', label: 'No Preference' },
    { value: 'general_ward', label: 'General Ward' },
    { value: 'semi_private', label: 'Semi-Private' },
    { value: 'private_room', label: 'Private Room' },
    { value: 'deluxe', label: 'Deluxe / Suite' },
    { value: 'icu', label: 'ICU' },
  ];

  const dietOptions = [
    { value: 'no_restriction', label: 'No Restriction' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'jain', label: 'Jain' },
    { value: 'halal', label: 'Halal' },
    { value: 'diabetic', label: 'Diabetic Diet' },
    { value: 'low_sodium', label: 'Low Sodium' },
    { value: 'npo', label: 'NPO (Nothing by Mouth)' },
  ];

  const registeredByOptions = [
    { value: 'hospital_admin', label: 'Hospital Admin' },
    { value: 'front_desk_reena', label: 'Front Desk - Reena' },
    { value: 'front_desk_vivek', label: 'Front Desk - Vivek' },
  ];

  const registrationModeOptions = [
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'referral', label: 'Referral' },
    { value: 'emergency_triage', label: 'Emergency Triage' },
    { value: 'online', label: 'Online / Telemedicine' },
  ];

  return (
    <Stack spacing={2}>
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
              Clinical Information (Intake)
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Triage Context" sx={chipSx} />
              <Chip size="small" label="Admission Planning" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormTextField name="referringSource" label="Referring Doctor / Source" />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect
                name="treatingConsultant"
                label="Treating Consultant"
                options={consultantOptions}
                required
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="department" label="Department / Specialty" options={departmentOptions} />
            </Grid>
            <Grid xs={12}>
              <FormTextField
                name="chiefComplaint"
                label="Chief Complaint / Presenting Symptoms"
                required
                multiline
                minRows={3}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="admissionType" label="Admission Type" options={admissionTypeOptions} />
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="wardBedPreference" label="Ward / Bed Preference" options={wardPreferenceOptions} />
            </Grid>
            <Grid xs={12} md={4}>
              <Box sx={{ pt: 1 }}>
                <FormCheckbox name="mlc" label="Medico-Legal Case (MLC)" />
              </Box>
            </Grid>
            <Grid xs={12} md={4}>
              <FormSelect name="dietPreference" label="Diet Preference" options={dietOptions} />
            </Grid>
            <Grid xs={12} md={8}>
              <FormTextField name="pastMedicalHistory" label="Past Medical History" multiline minRows={2} />
            </Grid>
          </Grid>
        </Box>
      </Card>

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
              Consent & Administrative Notes
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Compliance" sx={chipSx} />
              <Chip size="small" label="Administrative Capture" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2.25 }}>
          <Stack spacing={0.4}>
            <FormCheckbox name="consentVerbal" label="Patient / Guardian has given verbal consent for treatment" />
            <FormCheckbox name="consentWritten" label="Written General Consent Form received and filed" />
            {isIndia ? (
              <FormCheckbox
                name="consentAbhaShare"
                label="Patient consents to sharing health data via ABHA / ABDM"
              />
            ) : null}
            <FormCheckbox
              name="consentBillingPolicy"
              label="Patient informed of hospital billing and payment policy"
            />
            <FormCheckbox name="consentIdAttached" label="Photo ID copies scanned and attached" />
          </Stack>

          <Grid container spacing={1.35} sx={{ mt: 1 }}>
            <Grid xs={12} md={6}>
              <FormSelect
                name="registeredBy"
                label="Registered By (Staff)"
                options={registeredByOptions}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormSelect name="registrationMode" label="Registration Mode" options={registrationModeOptions} />
            </Grid>
            <Grid xs={12}>
              <FormTextField name="additionalNotes" label="Additional Notes / Instructions" multiline minRows={3} />
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Stack>
  );
}

