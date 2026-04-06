'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { Box, Typography } from '@/src/ui/components/atoms';
import { DoctorRegistrationFormData } from './types/doctor-registration.types';
import PatientCountryToggle, { RegistrationCountry } from '@/src/screens/patients/PatientRegister/components/PatientCountryToggle';
import {
  doctorAvailabilitySchema,
  doctorDocumentsSchema,
  doctorPersonalCombinedSchema,
} from './schemas/doctor-registration.schema';
import DoctorPersonalInfoStep from './components/DoctorPersonalInfoStep';
import DoctorDocumentsStep from './components/DoctorDocumentsStep';
import DoctorAvailabilityStep from './components/DoctorAvailabilityStep';

const initialValues: DoctorRegistrationFormData = {
  // Registration Context
  registrationCountry: 'india',
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
  availableDays: '',
  weeklySchedule: [
    { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
    { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
    { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
    { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
    { on: true,  hol: false, work: [{ s: '09:00', e: '17:00' }], breaks: [] },
    { on: true,  hol: false, work: [{ s: '10:00', e: '14:00' }], breaks: [] },
    { on: false, hol: false, work: [], breaks: [] },
  ],

  // Contact & Address
  countryCode: '+91',
  mobile: '',
  alternatePhone: '',
  email: '',
  clinicAddressLine1: '',
  clinicAddressLine2: '',
  clinicCounty: '',
  clinicCity: '',
  clinicState: '',
  clinicCountry: 'India',
  clinicPinCode: '',
  permanentAddressSame: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentCounty: '',
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
      label: 'Personal Info',
      component: (props: any) => <DoctorPersonalInfoStep {...props} />,
      validationSchema: doctorPersonalCombinedSchema,
    },
    {
      label: 'Documents & Consent',
      component: (props: any) => <DoctorDocumentsStep {...props} />,
      validationSchema: doctorDocumentsSchema,
    },
    {
      label: 'Availability',
      component: (props: any) => <DoctorAvailabilityStep {...props} />,
      validationSchema: doctorAvailabilitySchema,
      isOptional: true,
      onSkip: async (formik: any) => {
        await formik.setFieldValue('availableDays', '', false);
        await formik.setFieldValue('telemedicineAvailable', false, false);
      },
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
        stickyNavigation
        fillHeight
        contentScrollable
        stickyFooter
        compactNavigation
        showHeaderDivider={false}
        navigationBottomContent={(formik, context) => {
          if (context.activeStep !== 0) return null;
          const selectedCountry: RegistrationCountry =
            formik.values.registrationCountry === 'india' ? 'india' : 'international';
          return (
            <PatientCountryToggle
              compact
              value={selectedCountry}
              onChange={(nextCountry) => {
                void formik.setFieldValue('registrationCountry', nextCountry, false);
              }}
            />
          );
        }}
        headerContent={(context) => (
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0D1B2A', lineHeight: 1.2 }}>
              Create Doctor Profile
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#9AAFBF', marginTop: '2px' }}>
              Step {context.activeStep + 1} of {context.steps.length}
            </Typography>
          </Box>
        )}
        submitButtonText="Register Doctor"
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
