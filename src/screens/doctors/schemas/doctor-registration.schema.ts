import * as Yup from 'yup';

export const doctorIdentitySchema = Yup.object({
  registrationCountry: Yup.string().required('Registration country is required'),
  doctorType: Yup.string().required('Doctor type is required'),
  regDate: Yup.string().required('Registration date is required'),
  nmcRegNumber: Yup.string().when('registrationCountry', {
    is: 'india',
    then: (s) => s.required('NMC registration number is required'),
    otherwise: (s) => s.optional(),
  }),
  stateMedicalCouncil: Yup.string().when('registrationCountry', {
    is: 'india',
    then: (s) => s.required('State Medical Council is required'),
    otherwise: (s) => s.optional(),
  }),
  licenseExpiry: Yup.string().when('registrationCountry', {
    is: 'india',
    then: (s) => s.required('License expiry date is required'),
    otherwise: (s) => s.optional(),
  }),
  medicalLicenseNumber: Yup.string().when('registrationCountry', {
    is: 'international',
    then: (s) => s.required('Medical license number is required'),
    otherwise: (s) => s.optional(),
  }),
  issuingCountry: Yup.string().when('registrationCountry', {
    is: 'international',
    then: (s) => s.required('Issuing country is required'),
    otherwise: (s) => s.optional(),
  }),
  issuingAuthority: Yup.string().when('registrationCountry', {
    is: 'international',
    then: (s) => s.required('Issuing authority is required'),
    otherwise: (s) => s.optional(),
  }),
  intlLicenseExpiry: Yup.string().when('registrationCountry', {
    is: 'international',
    then: (s) => s.required('License expiry date is required'),
    otherwise: (s) => s.optional(),
  }),
});

export const doctorPersonalSchema = Yup.object({
  prefix: Yup.string().required('Prefix is required'),
  firstName: Yup.string().required('First name is required').min(2, 'Minimum 2 characters'),
  lastName: Yup.string().required('Last name is required').min(2, 'Minimum 2 characters'),
  gender: Yup.string().required('Gender is required'),
  dob: Yup.string().required('Date of birth is required'),
});

export const doctorProfessionalSchema = Yup.object({
  primarySpecialization: Yup.string().required('Primary specialization is required'),
  designation: Yup.string().required('Designation is required'),
  department: Yup.string().required('Department is required'),
  qualifications: Yup.string().required('Qualifications are required'),
  yearsOfExperience: Yup.string().required('Years of experience is required'),
});

export const doctorContactSchema = Yup.object({
  mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^\d{7,15}$/, 'Enter a valid mobile number'),
  email: Yup.string().required('Email is required').email('Enter a valid email address'),
  clinicAddressLine1: Yup.string().required('Clinic address is required'),
  clinicCity: Yup.string().required('City is required'),
  clinicState: Yup.string().required('State / Province is required'),
  clinicCountry: Yup.string().required('Country is required'),
});

export const doctorDocumentsSchema = Yup.object({
  idProofType: Yup.string().required('ID proof type is required'),
  idProofNumber: Yup.string().required('ID proof number is required'),
  consentDataAccuracy: Yup.boolean().oneOf([true], 'You must confirm data accuracy'),
  consentTerms: Yup.boolean().oneOf([true], 'You must accept terms & conditions'),
});
