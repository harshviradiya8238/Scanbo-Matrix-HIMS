'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Snackbar } from '@/src/ui/components/atoms';
import PageTemplate from '@/src/ui/components/PageTemplate';

import { PatientRegistrationFormData } from '@/src/screens/patients/types/patient-registration.types';
import { useState } from 'react';
import CommonRegistrationForm, { RegistrationEntityMode } from '@/src/screens/patients/CommonRegistrationForm';
import { useUser } from '@/src/core/auth/UserContext';

export default function RegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useUser();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const source = searchParams.get('source');
  const returnTo = searchParams.get('returnTo');
  const returnDate = searchParams.get('date') || '';
  const returnTime = searchParams.get('time') || '';
  const returnProvider = searchParams.get('provider') || '';
  const returnDepartment = searchParams.get('department') || '';
  const isPatientPortalRole = String(role).toUpperCase() === 'PATIENT_PORTAL';
  const isCalendarFlow = source === 'opd-calendar' && Boolean(returnTo);
  const isFamilyFlow = source === 'family-portal' || isPatientPortalRole;
  const registrationMode: RegistrationEntityMode = isFamilyFlow ? 'family' : 'patient';

  const buildReturnUrl = (overrides: Record<string, string>, fallbackRoute: string) => {
    const target = returnTo || fallbackRoute;
    const params = new URLSearchParams();
    const payload: Record<string, string> = {
      date: returnDate,
      time: returnTime,
      provider: returnProvider,
      department: returnDepartment,
      ...overrides,
    };

    Object.entries(payload).forEach(([key, value]) => {
      const normalized = value?.trim();
      if (normalized) {
        params.set(key, normalized);
      }
    });

    return params.toString() ? `${target}?${params.toString()}` : target;
  };

  const handleSubmit = async (values: PatientRegistrationFormData) => {
    try {
      // TODO: Implement API call to save patient registration
      console.log(`${registrationMode} Registration Data:`, values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fullName = [values.patientName, values.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');
      
      setSnackbar({
        open: true,
        message: isFamilyFlow ? 'Family member registered successfully!' : 'Patient registered successfully!',
        severity: 'success',
      });

      // Redirect based on source flow after successful registration
      setTimeout(() => {
        if (isCalendarFlow) {
          router.push(
            buildReturnUrl({
              source: 'registration',
              registration: 'success',
              patientName: fullName,
              phone: values.mobile,
              age: values.age,
              gender: values.gender,
              department: values.department || returnDepartment,
            }, '/appointments/calendar')
          );
          return;
        }

        if (isFamilyFlow) {
          router.push(
            buildReturnUrl({
              source: 'registration',
              registration: 'success',
              memberName: fullName,
              relation: values.familyRelation,
              patientName: fullName,
              phone: values.mobile,
              age: values.age,
              gender: values.gender,
            }, '/patient-portal/family')
          );
          return;
        }

        router.push('/patients/list');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: isFamilyFlow
          ? 'Failed to register family member. Please try again.'
          : 'Failed to register patient. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    if (isCalendarFlow) {
      router.push(
        buildReturnUrl({
          source: 'registration',
          registration: 'cancelled',
        }, '/appointments/calendar')
      );
      return;
    }

    if (isFamilyFlow) {
      router.push(
        buildReturnUrl({
          source: 'registration',
          registration: 'cancelled',
        }, '/patient-portal/family')
      );
      return;
    }

    router.back();
  };

  return (
    <PageTemplate
      title={isFamilyFlow ? 'Family Member Registration' : 'Patient Registration'}
      currentPageTitle="Registration"
      fullHeight
    >
      <Box
        sx={{
          mx: 'auto',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CommonRegistrationForm
          mode={registrationMode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
