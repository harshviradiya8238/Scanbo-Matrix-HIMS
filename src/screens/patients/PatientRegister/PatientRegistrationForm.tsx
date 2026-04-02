"use client";

import CommonRegistrationForm from "./CommonRegistrationForm";
import { PatientRegistrationFormData } from "./types/patient-registration.types";

interface PatientRegistrationFormProps {
  onSubmit: (values: PatientRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function PatientRegistrationForm({
  onSubmit,
  onCancel,
}: PatientRegistrationFormProps) {
  return (
    <CommonRegistrationForm
      mode="patient"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
