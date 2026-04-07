'use client';

import * as React from 'react';
import { Alert, Box, Chip, Checkbox, FormControlLabel, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme, alpha } from '@/src/ui/theme';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormSelect, FormTextField } from '@/src/ui/components/forms';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface DoctorDocumentsStepProps extends FormikProps<DoctorRegistrationFormData> {}

const idProofTypeOptions = [
  { value: '', label: '-- Select ID Type --' },
  { value: 'aadhaar', label: 'Aadhaar Card (India)' },
  { value: 'pan', label: 'PAN Card (India)' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: "Driving License" },
  { value: 'voter_id', label: 'Voter ID (India)' },
  { value: 'emirates_id', label: 'Emirates ID (UAE)' },
  { value: 'national_id', label: 'National ID (International)' },
];

const registeredByOptions = [
  { value: 'hospital_admin', label: 'Hospital Admin' },
  { value: 'hr_department', label: 'HR Department' },
  { value: 'medical_director', label: 'Medical Director' },
  { value: 'self_registered', label: 'Self Registered' },
];

const uploadBoxStyle = {
  border: '1.5px dashed',
  borderColor: 'divider',
  borderRadius: 2,
  p: 2,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  cursor: 'pointer',
  minHeight: 90,
  transition: 'all .18s ease',
  '&:hover': {
    borderColor: 'primary.main',
    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
  },
};

function UploadBox({ label, hint }: { label: string; hint?: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ ...uploadBoxStyle, borderColor: alpha(theme.palette.primary.main, 0.3) }}>
      <CloudUploadIcon sx={{ fontSize: 28, color: 'primary.main', opacity: 0.7 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {hint}
        </Typography>
      )}
      <Typography variant="caption" color="text.disabled">
        PDF, JPG, PNG — max 5 MB
      </Typography>
    </Box>
  );
}

export default function DoctorDocumentsStep({ values, setFieldValue, errors, touched }: DoctorDocumentsStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const isIndia = values.registrationCountry === 'india';

  return (
    <Stack spacing={2}>
      {/* ID Proof */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Identity Proof
            </Typography>
            <Chip size="small" label="Required" color="warning" sx={{ fontWeight: 700 }} />
          </Stack>
        </Box>
        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormSelect name="idProofType" label="ID Proof Type" options={idProofTypeOptions} required />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField name="idProofNumber" label="ID Proof Number" placeholder="Enter ID number" required />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Document Uploads */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Document Uploads
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Chip size="small" label="Upload Center" sx={chipSx} />
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ p: 2.25 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload scanned copies of all required documents. Files are stored securely and used only for credentialing
            and background verification.
          </Alert>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <UploadBox
                label={isIndia ? 'NMC / SMC Certificate' : 'Medical License Certificate'}
                hint="Proof of medical council registration"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <UploadBox
                label="Degree Certificate (MBBS / Primary)"
                hint="Highest medical degree"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <UploadBox
                label="Additional Qualifications"
                hint="MD, MS, DNB, MRCP etc."
              />
            </Grid>
            <Grid xs={12} md={4}>
              <UploadBox
                label="ID Proof Document"
                hint={isIndia ? 'Aadhaar / PAN / Passport' : 'Passport / National ID'}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <UploadBox
                label="Passport Size Photo"
                hint="Recent white-background photo"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <UploadBox
                label="Signature"
                hint="Scanned signature on white paper"
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Bank Details */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Bank Account Details
            </Typography>
            <Chip size="small" label="For Payments" sx={chipSx} />
          </Stack>
        </Box>
        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={4}>
              <FormTextField
                name="bankAccountNumber"
                label="Account Number"
                placeholder="XXXXXXXXXXXX"
                helperText="Salary / consultation fee account"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField
                name="bankName"
                label="Bank Name"
                placeholder="e.g. HDFC Bank / Emirates NBD"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField
                name="bankBranch"
                label="Branch Name"
                placeholder="e.g. Andheri West, Mumbai"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormTextField
                name="ifscSwiftCode"
                label={isIndia ? 'IFSC Code' : 'SWIFT / BIC Code'}
                placeholder={isIndia ? 'HDFC0001234' : 'EBILAEAD'}
                helperText={isIndia ? '11-character IFSC code' : 'International bank identifier'}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Admin & Consent */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.6, color: 'text.primary' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
              Consent &amp; Administration
            </Typography>
            <Chip size="small" label="Required" color="error" sx={{ fontWeight: 700 }} />
          </Stack>
        </Box>
        <Box sx={{ p: 2.25 }}>
          <Grid container spacing={1.35}>
            <Grid xs={12} md={6}>
              <FormSelect name="registeredBy" label="Registered By" options={registeredByOptions} />
            </Grid>
            <Grid xs={12}>
              <FormTextField
                name="additionalNotes"
                label="Additional Notes"
                placeholder="Any special notes about this doctor's onboarding..."
                helperText="Optional — internal use only"
              />
            </Grid>

            <Grid xs={12}>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: touched.consentDataAccuracy && errors.consentDataAccuracy
                      ? 'error.main'
                      : alpha(theme.palette.primary.main, 0.2),
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.consentDataAccuracy}
                        onChange={(e) => setFieldValue('consentDataAccuracy', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I confirm that all information provided is accurate, complete, and true to the best of my
                        knowledge. I understand that false information may result in termination of registration.
                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                      </Typography>
                    }
                  />
                  {touched.consentDataAccuracy && errors.consentDataAccuracy && (
                    <Typography variant="caption" color="error" sx={{ ml: 4.5, display: 'block' }}>
                      {errors.consentDataAccuracy}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: touched.consentTerms && errors.consentTerms
                      ? 'error.main'
                      : alpha(theme.palette.primary.main, 0.2),
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.consentTerms}
                        onChange={(e) => setFieldValue('consentTerms', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I accept the hospital's terms &amp; conditions, code of conduct, and data privacy policy
                        as outlined in the onboarding agreement.
                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                      </Typography>
                    }
                  />
                  {touched.consentTerms && errors.consentTerms && (
                    <Typography variant="caption" color="error" sx={{ ml: 4.5, display: 'block' }}>
                      {errors.consentTerms}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.consentBackgroundCheck}
                        onChange={(e) => setFieldValue('consentBackgroundCheck', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I consent to a background verification and credential check as required by hospital
                        credentialing policy.
                      </Typography>
                    }
                  />
                </Box>
              </Stack>
            </Grid>

            {values.consentDataAccuracy && values.consentTerms && (
              <Grid xs={12}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'success.main',
                    backgroundColor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                    All required consents accepted. Ready to register.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Card>
    </Stack>
  );
}
