'use client';

import { Box, Typography, Button, Stack, Divider, Chip, Label } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@mui/material';
import { getPrimaryChipSx, getSoftSurface } from '@/src/core/theme/surfaces';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { FormikProps } from 'formik';
import { FormTextField, FormSelect, FormDatePicker } from '@/src/ui/components/forms';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import { 
  QrCodeScanner as ScanIcon,
  Badge as BadgeIcon,
  CreditCard as AadhaarIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

interface RegistrationTypeStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPatientType?: () => void;
  onAddReason?: () => void;
}

export default function RegistrationTypeStep({
  values,
  onAddPatientType,
  onAddReason,
}: RegistrationTypeStepProps) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const chipSx = getPrimaryChipSx(theme);
  const patientTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'staff', label: 'Staff' },
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
  ];

  const reasonForNoAadhaarOptions = [
    { value: '', label: '-- Select --' },
    { value: 'not_available', label: 'Not Available' },
    { value: 'not_applicable', label: 'Not Applicable' },
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.75, sm: 1.5 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Registration Type: {values.patientType ? values.patientType.toUpperCase() : 'GENERAL'}
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip
              size="small"
              label="Identity Capture"
              sx={chipSx}
            />
            <Chip
              size="small"
              label="Aadhaar / MRN"
              sx={chipSx}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormTextField 
              name="mrno" 
              label="MRNO" 
              placeholder="Enter Medical Record Number"
              startIcon={<BadgeIcon fontSize="small" color="action" />}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider  />
            <Label
              sx={{
                mb: 1.5,
                display: 'block',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Aadhaar ID
            </Label>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <FormTextField 
                name="aadhaarId1" 
                placeholder="XXXX"
                startIcon={<AadhaarIcon fontSize="small" color="action" />}
                sx={{ flex: 1 }} 
              />
              <FormTextField 
                name="aadhaarId2" 
                placeholder="XXXX"
                sx={{ flex: 1 }} 
              />
              <FormTextField 
                name="aadhaarId3" 
                placeholder="XXXX"
                sx={{ flex: 1 }} 
              />
              <Button
                variant="outlined"
                startIcon={<ScanIcon />}
                size="small"
                sx={{ mt: 0.5, minWidth: 100, height: 40 }}
              >
                Scan
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="patientType"
              label="Patient Type"
              options={patientTypeOptions}
              required
              // showAddButton
              onAddClick={onAddPatientType}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="language"
              label="Language"
              options={languageOptions}
              required
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormSelect
              name="reasonForNoAadhaar"
              label="Reason for no AADHAAR ID"
              options={reasonForNoAadhaarOptions}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormDatePicker 
              name="regDate" 
              label="Registration Date" 
              required 
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}
