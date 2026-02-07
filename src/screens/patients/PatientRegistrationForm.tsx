'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { PatientRegistrationFormData } from './types/patient-registration.types';
import {
  registrationTypeSchema,
  patientDetailsSchema,
  contactDetailsSchema,
} from './schemas/patient-registration.schema';
import RegistrationTypeStep from './components/RegistrationTypeStep';
import PatientDetailsStep from './components/PatientDetailsStep';
import ContactDetailsStep from './components/ContactDetailsStep';
import NextOfKinStep from './components/NextOfKinStep';

const initialValues: PatientRegistrationFormData = {
  // Registration Type
  mrno: '',
  aadhaarId1: '',
  aadhaarId2: '',
  aadhaarId3: '',
  patientType: 'general',
  language: 'english',
  reasonForNoAadhaar: '',
  regDate: new Date().toISOString().split('T')[0],

  // Patient Details
  prefix: '',
  patientName: '',
  middleName: '',
  lastName: '',
  gender: '',
  maritalStatus: '',
  dob: '',
  age: '',
  ageUnit: 'years',
  occupation: '',
  mobile: '',
  aliasName: '',
  employer: '',
  email: '',
  nationality: '',
  mlc: false,
  externalStaffId: '',
  rm: '',
  confidential: false,
  howDidYouHear: '',

  // Contact Details
  addressType: 'urban',
  houseNumber: '',
  street: '',
  locality: '',
  country: 'uae',
  state: 'dubai',
  city: 'dubai',
  poBox: '',
  pinCode: '',
  landline: '',
  correspondenceAddressSame: true,

  // Next of Kin
  relationship: '',
  kinPrefix: '',
  kinFirstName: '',
  kinMiddleName: '',
  kinLastName: '',
  emergencyNumber: '',
};

interface PatientRegistrationFormProps {
  onSubmit: (values: PatientRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function PatientRegistrationForm({
  onSubmit,
  onCancel,
}: PatientRegistrationFormProps) {
  const handleAddPatientType = () => {
    // TODO: Implement add patient type dialog
    console.log('Add patient type');
  };

  const handleAddEmployer = () => {
    // TODO: Implement add employer dialog
    console.log('Add employer');
  };

  const handleAddPrefix = () => {
    // TODO: Implement add prefix dialog
    console.log('Add prefix');
  };

  const handleAddCountry = () => {
    // TODO: Implement add country dialog
    console.log('Add country');
  };

  const handleAddState = () => {
    // TODO: Implement add state dialog
    console.log('Add state');
  };

  const handleAddCity = () => {
    // TODO: Implement add city dialog
    console.log('Add city');
  };

  const handleAddRelationship = () => {
    // TODO: Implement add relationship dialog
    console.log('Add relationship');
  };

  const handleAddReason = () => {
    // TODO: Implement add reason dialog
    console.log('Add reason');
  };

  const steps = [
    {
      label: 'Registration Type',
      component: (props: any) => (
        <RegistrationTypeStep
          {...props}
          onAddPatientType={handleAddPatientType}
          onAddReason={handleAddReason}
        />
      ),
      validationSchema: registrationTypeSchema,
    },
    {
      label: 'Patient Details',
      component: (props: any) => (
        <PatientDetailsStep
          {...props}
          onAddPrefix={handleAddPrefix}
          onAddEmployer={handleAddEmployer}
        />
      ),
      validationSchema: patientDetailsSchema,
    },
    {
      label: 'Contact Details',
      component: (props: any) => (
        <ContactDetailsStep
          {...props}
          onAddCountry={handleAddCountry}
          onAddState={handleAddState}
          onAddCity={handleAddCity}
        />
      ),
      validationSchema: contactDetailsSchema,
    },
    {
      label: 'Next of Kin',
      component: (props: any) => (
        <NextOfKinStep
          {...props}
          onAddRelationship={handleAddRelationship}
          onAddPrefix={handleAddPrefix}
        />
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StepperForm
        steps={steps}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitButtonText="Register"
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
