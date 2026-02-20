'use client';

import { useRouter } from 'next/navigation';
import { Alert, Box, Snackbar } from '@/src/ui/components/atoms';
import PageTemplate from '@/src/ui/components/PageTemplate';

import { PatientRegistrationFormData } from '@/src/screens/patients/types/patient-registration.types';
import { useState } from 'react';
import PatientRegistrationForm from '@/src/screens/patients/PatientRegistrationForm';

export default function RegistrationPage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (values: PatientRegistrationFormData) => {
    try {
      // TODO: Implement API call to save patient registration
      console.log('Patient Registration Data:', values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'Patient registered successfully!',
        severity: 'success',
      });

      // Redirect to patient list after successful registration
      setTimeout(() => {
        router.push('/patients/list');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to register patient. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PageTemplate title="Patient Registration" currentPageTitle="Registration">
      <Box sx={{ mx: 'auto' }}>
        <PatientRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
