'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import CommonRegistrationForm from '@/src/screens/patients/CommonRegistrationForm';
import { PatientRegistrationFormData } from '@/src/screens/patients/types/patient-registration.types';

const buildFamilyReturnUrl = (overrides?: Record<string, string>) => {
  const params = new URLSearchParams(overrides || {});
  return params.toString() ? `/patient-portal/family?${params.toString()}` : '/patient-portal/family';
};

export default function PatientPortalFamilyRegistrationPage() {
  const router = useRouter();
  const theme = useTheme();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (values: PatientRegistrationFormData) => {
    try {
      // TODO: Replace with API call for family registration
      console.log('family Registration Data:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fullName = [values.patientName, values.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');

      setSnackbar({
        open: true,
        message: 'Family member registered successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        router.push(
          buildFamilyReturnUrl({
            source: 'registration',
            registration: 'success',
            memberName: fullName,
            relation: values.familyRelation,
          })
        );
      }, 1200);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to register family member. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    router.push(
      buildFamilyReturnUrl({
        source: 'registration',
        registration: 'cancelled',
      })
    );
  };

  return (
    <PatientPortalWorkspaceCard current="family">
      <Stack spacing={2}>
   

        <CommonRegistrationForm mode="family" onSubmit={handleSubmit} onCancel={handleCancel} />
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
