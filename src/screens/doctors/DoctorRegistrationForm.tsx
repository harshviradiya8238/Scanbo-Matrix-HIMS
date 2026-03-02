'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { DoctorRegistrationFormData } from './types/doctor-registration.types';
import {
  doctorIdentitySchema,
  doctorPersonalSchema,
  doctorProfessionalSchema,
  doctorContactSchema,
  doctorDocumentsSchema,
} from './schemas/doctor-registration.schema';
import DoctorIdentityStep from './components/DoctorIdentityStep';
import DoctorPersonalStep from './components/DoctorPersonalStep';
import DoctorProfessionalStep from './components/DoctorProfessionalStep';
import DoctorContactStep from './components/DoctorContactStep';
import DoctorDocumentsStep from './components/DoctorDocumentsStep';

const initialValues: DoctorRegistrationFormData = {
  // Registration Context
  registrationCountry: 'india',
  doctorId: '',
  doctorType: '',
  regDate: new Date().toISOString().split('T')[0],

  // India License
  nmcRegNumber: '',
  stateMedicalCouncil: '',
  licenseState: '',
  licenseExpiry: '',

  // International License
  medicalLicenseNumber: '',
  issuingCountry: '',
  issuingAuthority: '',
  intlLicenseExpiry: '',

  // Personal Details
  prefix: 'Dr.',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dob: '',
  age: '',
  bloodGroup: '',
  maritalStatus: '',

  // India Identity
  aadhaarNumber: '',
  panNumber: '',

  // International Identity
  passportNumber: '',
  passportExpiry: '',
  countryOfCitizenship: '',

  // Professional Details
  primarySpecialization: '',
  subSpecialization: '',
  designation: '',
  department: '',
  qualifications: '',
  additionalQualifications: '',
  yearsOfExperience: '',
  languagesSpoken: '',
  consultationFeeOPD: '',
  consultationDurationMins: '15',
  telemedicineAvailable: false,
  availableDays: 'Mon,Tue,Wed,Thu,Fri',

  // Contact & Address
  countryCode: '+91',
  mobile: '',
  alternatePhone: '',
  email: '',
  clinicAddressLine1: '',
  clinicAddressLine2: '',
  clinicCity: '',
  clinicState: '',
  clinicCountry: 'india',
  clinicPinCode: '',
  permanentAddressSame: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentCity: '',
  permanentState: '',
  permanentCountry: '',
  permanentPinCode: '',

  // Documents & Consent
  idProofType: '',
  idProofNumber: '',
  bankAccountNumber: '',
  bankName: '',
  bankBranch: '',
  ifscSwiftCode: '',
  consentDataAccuracy: false,
  consentTerms: false,
  consentBackgroundCheck: false,
  registeredBy: 'hospital_admin',
  additionalNotes: '',
};

interface DoctorRegistrationFormProps {
  onSubmit: (values: DoctorRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function DoctorRegistrationForm({ onSubmit, onCancel }: DoctorRegistrationFormProps) {
  const steps = [
    {
      label: 'License & ID',
      component: (props: any) => <DoctorIdentityStep {...props} />,
      validationSchema: doctorIdentitySchema,
    },
    {
      label: 'Personal',
      component: (props: any) => <DoctorPersonalStep {...props} />,
      validationSchema: doctorPersonalSchema,
    },
    {
      label: 'Professional',
      component: (props: any) => <DoctorProfessionalStep {...props} />,
      validationSchema: doctorProfessionalSchema,
    },
    {
      label: 'Contact & Address',
      component: (props: any) => <DoctorContactStep {...props} />,
      validationSchema: doctorContactSchema,
    },
    {
      label: 'Documents & Consent',
      component: (props: any) => <DoctorDocumentsStep {...props} />,
      validationSchema: doctorDocumentsSchema,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StepperForm
        steps={steps}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        navigationVariant="modern"
        headerContent={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Doctor Registration &amp; Credentialing
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip size="small" color="primary" label="Doctor" />
              <Chip size="small" variant="outlined" color="primary" label="Onboarding" />
              <Chip size="small" variant="outlined" color="success" label="India &amp; International" />
            </Box>
          </Stack>
        }
        submitButtonText="Register Doctor"
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
