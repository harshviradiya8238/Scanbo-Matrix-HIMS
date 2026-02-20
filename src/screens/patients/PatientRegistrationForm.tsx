'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { PatientRegistrationFormData } from './types/patient-registration.types';
import {
  registrationTypeSchema,
  patientDetailsSchema,
  contactDetailsSchema,
  nextOfKinSchema,
  clinicalInfoSchema,
} from './schemas/patient-registration.schema';
import RegistrationTypeStep from './components/RegistrationTypeStep';
import PatientDetailsStep from './components/PatientDetailsStep';
import ContactDetailsStep from './components/ContactDetailsStep';
import NextOfKinStep from './components/NextOfKinStep';
import ClinicalInfoStep from './components/ClinicalInfoStep';

const initialValues: PatientRegistrationFormData = {
  // Registration Type
  registrationCountry: 'india',
  mrno: '',
  aadhaarNumber: '',
  abhaNumber: '',
  abhaAddress: '',
  abhaVerificationStatus: 'not_linked',
  panNumber: '',
  voterId: '',
  rationCardNo: '',
  drivingLicense: '',
  patientType: 'general',
  language: 'english',
  reasonForNoAadhaar: '',
  schemeType: '',
  schemeCardNumber: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  policyValidity: '',
  bplStatus: '',
  intlNationality: '',
  passportNumber: '',
  passportExpiryDate: '',
  passportIssueCountry: '',
  visaNumber: '',
  visaType: '',
  visaValidityDate: '',
  arrivalInIndiaDate: '',
  intlInsuranceProvider: '',
  intlPolicyMemberId: '',
  countryOfResidence: '',
  embassyContact: '',
  internationalCountryCode: '+971',
  regDate: new Date().toISOString().split('T')[0],

  // Patient Details
  prefix: '',
  patientName: '',
  middleName: '',
  lastName: '',
  localScriptName: '',
  gender: '',
  maritalStatus: '',
  dob: '',
  age: '',
  ageUnit: 'years',
  occupation: '',
  aliasName: '',
  bloodGroup: '',
  religion: '',
  casteCategory: '',
  educationLevel: '',
  annualIncomeRange: '',
  drugAllergies: '',
  foodAllergies: '',

  // Contact Details
  mobile: '',
  alternatePhone: '',
  email: '',
  addressType: 'urban',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  country: 'india',
  state: '',
  city: '',
  district: '',
  pinCode: '',
  areaType: 'urban',
  landline: '',
  homeAddress: '',
  localAddressIndia: '',
  indiaStayDuration: '',
  stateProvince: '',
  postalCode: '',
  correspondenceAddressSame: true,

  // Next of Kin
  nokFullName: '',
  nokRelationship: '',
  nokMobile: '',
  nokEmail: '',
  nokAddress: '',
  nokIdNumber: '',
  nokConsultPermission: 'full_access',
  secondaryContactName: '',
  secondaryRelationship: '',
  secondaryPhone: '',
  secondaryRelationToPrimary: '',

  // Clinical Intake
  referringSource: '',
  treatingConsultant: '',
  department: '',
  chiefComplaint: '',
  admissionType: 'opd',
  wardBedPreference: '',
  mlc: false,
  dietPreference: 'no_restriction',
  pastMedicalHistory: '',

  // Consent & Admin
  consentVerbal: false,
  consentWritten: false,
  consentAbhaShare: false,
  consentBillingPolicy: false,
  consentIdAttached: false,
  registeredBy: 'hospital_admin',
  registrationMode: 'walk_in',
  additionalNotes: '',
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

  const steps = [
    {
      label: 'Identity & Type',
      component: (props: any) => (
        <RegistrationTypeStep
          {...props}
          onAddPatientType={handleAddPatientType}
        />
      ),
      validationSchema: registrationTypeSchema,
    },
    {
      label: 'Personal Details',
      component: (props: any) => (
        <PatientDetailsStep
          {...props}
          onAddPrefix={handleAddPrefix}
        />
      ),
      validationSchema: patientDetailsSchema,
    },
    {
      label: 'Contact & Address',
      component: (props: any) => (
        <ContactDetailsStep
          {...props}
          onAddCountry={handleAddCountry}
          onAddState={handleAddState}
        />
      ),
      validationSchema: contactDetailsSchema,
    },
    {
      label: 'Next of Kin',
      component: (props: any) => (
        <NextOfKinStep
          {...props}
          onAddPrefix={handleAddPrefix}
        />
      ),
      validationSchema: nextOfKinSchema,
    },
    {
      label: 'Clinical Info',
      component: (props: any) => <ClinicalInfoStep {...props} />,
      validationSchema: clinicalInfoSchema,
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
        headerContent={(
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Create a Complete Patient Profile
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip size="small" color="primary" label="Patient" />
              <Chip size="small" variant="outlined" color="primary" label="Onboarding" />
              <Chip size="small" variant="outlined" color="success" label="Registration + Contact + NOK" />
            </Box>
          </Stack>
        )}
        submitButtonText="Register"
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
