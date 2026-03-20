'use client';

import { useRouter } from 'next/navigation';
import { Alert, Box, Snackbar } from '@/src/ui/components/atoms';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { DoctorRegistrationFormData } from '@/src/screens/doctors/types/doctor-registration.types';
import { useState } from 'react';
import DoctorRegistrationForm from '@/src/screens/doctors/DoctorRegistrationForm';

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (values: DoctorRegistrationFormData) => {
    try {
      console.log('Doctor Registration Data:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: 'Doctor registered successfully!', severity: 'success' });
      setTimeout(() => {
        router.push('/doctors/list');
      }, 1500);
    } catch {
      setSnackbar({ open: true, message: 'Failed to register doctor. Please try again.', severity: 'error' });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PageTemplate title="Doctor Registration" currentPageTitle="Registration" fullHeight>
      <Box
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DoctorRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />
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
