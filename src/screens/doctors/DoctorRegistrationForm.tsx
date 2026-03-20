'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StepperForm from '@/src/ui/components/forms/StepperForm';
import { Box, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { DoctorRegistrationFormData } from './types/doctor-registration.types';
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
        headerContent={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0.65}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Doctor Registration
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                color="primary"
                label="Doctor"
                sx={{ height: 22, '& .MuiChip-label': { px: 0.95, fontSize: 11.5, fontWeight: 600 } }}
              />
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label="3-Step Flow"
                sx={{ height: 22, '& .MuiChip-label': { px: 0.95, fontSize: 11.5, fontWeight: 600 } }}
              />
              <Chip
                size="small"
                variant="outlined"
                color="success"
                label="Personal + Documents + Availability"
                sx={{ height: 22, '& .MuiChip-label': { px: 0.95, fontSize: 11.5, fontWeight: 600 } }}
              />
            </Box>
          </Stack>
        }
        submitButtonText="Register Doctor"
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
