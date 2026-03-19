'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { PatientRegistrationFormData } from './types/patient-registration.types';
import {
  familyInfoSchema,
  patientInfoSchema,
  referralSchema,
} from './schemas/patient-registration.schema';
import PatientInfoStep from './components/PatientInfoStep';
import ReferralStep from './components/ReferralStep';

export type RegistrationEntityMode = 'patient' | 'family';

const baseInitialValues: PatientRegistrationFormData = {
  // Registration Type
  registrationCountry: 'india',
  aadhaarNumber: '',
  abhaNumber: '',
  abhaAddress: '',
  abhaVerificationStatus: 'not_linked',
  panNumber: '',
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
  familyRelation: '',
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
  bloodGroup: '',
  religion: '',
  casteCategory: '',
  educationLevel: '',
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
  registrationMode: 'referral',
  additionalNotes: '',
};

interface CommonRegistrationFormProps {
  mode?: RegistrationEntityMode;
  onSubmit: (values: PatientRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function CommonRegistrationForm({
  mode = 'patient',
  onSubmit,
  onCancel,
}: CommonRegistrationFormProps) {
  const isFamilyMode = mode === 'family';

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
      label: isFamilyMode ? 'Family Info' : 'Patient Info',
      component: (props: any) => (
        <PatientInfoStep
          {...props}
          showFamilyRelation={isFamilyMode}
          familyRelationLabel="Relation to Primary Patient"
          onAddPatientType={handleAddPatientType}
          onAddPrefix={handleAddPrefix}
          onAddCountry={handleAddCountry}
          onAddState={handleAddState}
        />
      ),
      validationSchema: isFamilyMode ? familyInfoSchema : patientInfoSchema,
    },
    {
      label: 'Referral',
      component: (props: any) => <ReferralStep {...props} />,
      validationSchema: referralSchema,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StepperForm
        steps={steps}
        initialValues={baseInitialValues}
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
              {isFamilyMode
                ? 'Create Family Member Profile (Patient Registration Flow)'
                : 'Create a Complete Patient Profile'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip size="small" color="primary" label={isFamilyMode ? 'Family Member' : 'Patient'} />
              <Chip size="small" variant="outlined" color="primary" label="Shared Registration Component" />
              <Chip size="small" variant="outlined" color="success" label="Patient Info + Referral" />
            </Box>
          </Stack>
        )}
        submitButtonText={isFamilyMode ? 'Register Family Member' : 'Register'}
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
