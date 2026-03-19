'use client';

import { Alert, Stack } from '@/src/ui/components/atoms';
import { FormikProps } from 'formik';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import ClinicalInfoStep from './ClinicalInfoStep';
import NextOfKinStep from './NextOfKinStep';

type ReferralStepProps = FormikProps<PatientRegistrationFormData>;

export default function ReferralStep(props: ReferralStepProps) {
  const isAdmitted = props.values.admissionType === 'ipd';

  return (
    <Stack spacing={2}>
      <ClinicalInfoStep {...props} />
      {isAdmitted ? (
        <NextOfKinStep {...props} />
      ) : (
        <Alert severity="info">
          Next of kin is skipped for OPD / non-admitted visits.
        </Alert>
      )}
    </Stack>
  );
}
