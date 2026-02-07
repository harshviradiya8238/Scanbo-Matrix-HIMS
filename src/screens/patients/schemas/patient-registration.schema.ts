import * as yup from 'yup';

export const patientRegistrationSchema = yup.object().shape({
  // Registration Type
  mrno: yup.string(),
  aadhaarId1: yup.string(),
  aadhaarId2: yup.string(),
  aadhaarId3: yup.string(),
  patientType: yup.string().required('Patient Type is required'),
  language: yup.string().required('Language is required'),
  reasonForNoAadhaar: yup.string(),
  regDate: yup.string().required('Registration Date is required'),

  // Patient Details
  prefix: yup.string().required('Prefix is required'),
  patientName: yup.string().required('Patient Name is required'),
  middleName: yup.string(),
  lastName: yup.string().required('Last Name is required'),
  gender: yup.string().required('Gender is required'),
  maritalStatus: yup.string(),
  dob: yup.string(),
  age: yup.string().required('Age is required'),
  ageUnit: yup.string().required('Age Unit is required'),
  occupation: yup.string(),
  mobile: yup.string().required('Mobile is required').matches(/^\d+$/, 'Mobile must be numeric'),
  aliasName: yup.string(),
  employer: yup.string().required('Employer is required'),
  email: yup.string().required('Email is required').email('Invalid email address'),
  nationality: yup.string(),
  mlc: yup.boolean(),
  externalStaffId: yup.string(),
  rm: yup.string(),
  confidential: yup.boolean(),
  howDidYouHear: yup.string().required('How did you hear about us is required'),

  // Contact Details
  addressType: yup.string().oneOf(['urban', 'rural']).required('Address Type is required'),
  houseNumber: yup.string(),
  street: yup.string(),
  locality: yup.string(),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  poBox: yup.string(),
  pinCode: yup.string(),
  landline: yup.string(),
  correspondenceAddressSame: yup.boolean(),

  // Next of Kin
  relationship: yup.string(),
  kinPrefix: yup.string(),
  kinFirstName: yup.string(),
  kinMiddleName: yup.string(),
  kinLastName: yup.string(),
  emergencyNumber: yup.string(),
});

// Step-specific schemas
export const registrationTypeSchema = yup.object().shape({
  patientType: yup.string().required('Patient Type is required'),
  language: yup.string().required('Language is required'),
  regDate: yup.string().required('Registration Date is required'),
});

export const patientDetailsSchema = yup.object().shape({
  prefix: yup.string().required('Prefix is required'),
  patientName: yup.string().required('Patient Name is required'),
  lastName: yup.string().required('Last Name is required'),
  gender: yup.string().required('Gender is required'),
  age: yup.string().required('Age is required'),
  ageUnit: yup.string().required('Age Unit is required'),
  mobile: yup.string().required('Mobile is required').matches(/^\d+$/, 'Mobile must be numeric'),
  employer: yup.string().required('Employer is required'),
  email: yup.string().required('Email is required').email('Invalid email address'),
  howDidYouHear: yup.string().required('How did you hear about us is required'),
});

export const contactDetailsSchema = yup.object().shape({
  addressType: yup.string().oneOf(['urban', 'rural']).required('Address Type is required'),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
});

