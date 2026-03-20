'use client';

import { Stack } from '@/src/ui/components/atoms';
import { FormikProps } from 'formik';
import { PatientRegistrationFormData } from '../types/patient-registration.types';
import RegistrationTypeStep from './RegistrationTypeStep';
import PatientDetailsStep from './PatientDetailsStep';
import ContactDetailsStep from './ContactDetailsStep';

interface PatientInfoStepProps extends FormikProps<PatientRegistrationFormData> {
  onAddPatientType?: () => void;
  onAddPrefix?: () => void;
  onAddCountry?: () => void;
  onAddState?: () => void;
  showFamilyRelation?: boolean;
  familyRelationLabel?: string;
  stickyCountryToggle?: boolean;
  showCountryToggle?: boolean;
}

export default function PatientInfoStep({
  onAddPatientType,
  onAddPrefix,
  onAddCountry,
  onAddState,
  showFamilyRelation = false,
  familyRelationLabel = 'Relation',
  stickyCountryToggle = false,
  showCountryToggle = true,
  ...formik
}: PatientInfoStepProps) {
  return (
    <Stack spacing={2}>
      <RegistrationTypeStep
        {...formik}
        onAddPatientType={onAddPatientType}
        stickyCountryToggle={stickyCountryToggle}
        showCountryToggle={showCountryToggle}
      />
      <PatientDetailsStep
        {...formik}
        onAddPrefix={onAddPrefix}
        showFamilyRelation={showFamilyRelation}
        familyRelationLabel={familyRelationLabel}
      />
      <ContactDetailsStep {...formik} onAddCountry={onAddCountry} onAddState={onAddState} />
    </Stack>
  );
}
