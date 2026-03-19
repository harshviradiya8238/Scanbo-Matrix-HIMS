'use client';

import * as React from 'react';
import { Stack } from '@/src/ui/components/atoms';
import { FormikProps } from 'formik';
import { DoctorRegistrationFormData } from '../types/doctor-registration.types';
import DoctorIdentityStep from './DoctorIdentityStep';
import DoctorPersonalStep from './DoctorPersonalStep';
import DoctorProfessionalStep from './DoctorProfessionalStep';
import DoctorContactStep from './DoctorContactStep';

interface DoctorPersonalInfoStepProps extends FormikProps<DoctorRegistrationFormData> {}

export default function DoctorPersonalInfoStep(props: DoctorPersonalInfoStepProps) {
  return (
    <Stack spacing={2}>
      <DoctorIdentityStep {...props} />
      <DoctorPersonalStep {...props} />
      <DoctorProfessionalStep {...props} />
      <DoctorContactStep {...props} />
    </Stack>
  );
}
