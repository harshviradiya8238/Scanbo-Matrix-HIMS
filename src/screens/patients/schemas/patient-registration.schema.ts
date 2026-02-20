import * as yup from 'yup';

const registrationCountrySchema = yup
  .string()
  .oneOf(['india', 'international'])
  .required('Registration country is required');

const mobileDigits = /^\d+$/;

export const patientRegistrationSchema = yup.object().shape({
  registrationCountry: registrationCountrySchema,
  patientType: yup.string().required('Patient Type is required'),
  language: yup.string().required('Preferred Language is required'),
  regDate: yup.string().required('Registration Date is required'),

  intlNationality: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Nationality is required for international patients'),
    otherwise: (schema) => schema,
  }),
  passportNumber: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Passport Number is required for international patients'),
    otherwise: (schema) => schema,
  }),
  passportExpiryDate: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Passport Expiry Date is required'),
    otherwise: (schema) => schema,
  }),

  prefix: yup.string().required('Title is required'),
  patientName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.string().required('Date of Birth is required'),

  mobile: yup
    .string()
    .required('Primary mobile number is required')
    .matches(mobileDigits, 'Phone must contain digits only'),
  email: yup.string().email('Invalid email address'),
  addressLine1: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('Address Line 1 is required'),
    otherwise: (schema) => schema,
  }),
  city: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema,
  }),
  state: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('State is required'),
    otherwise: (schema) => schema,
  }),
  pinCode: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('PIN Code is required'),
    otherwise: (schema) => schema,
  }),
  homeAddress: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Home Address is required for international patients'),
    otherwise: (schema) => schema,
  }),

  nokFullName: yup.string().required('NOK Full Name is required'),
  nokRelationship: yup.string().required('Relationship is required'),
  nokMobile: yup.string().required('NOK Mobile is required'),

  treatingConsultant: yup.string().required('Treating Consultant is required'),
  chiefComplaint: yup.string().required('Chief Complaint is required'),
  registeredBy: yup.string().required('Registered By is required'),
});

export const registrationTypeSchema = yup.object().shape({
  registrationCountry: registrationCountrySchema,
  patientType: yup.string().required('Patient Type is required'),
  language: yup.string().required('Preferred Language is required'),
  regDate: yup.string().required('Registration Date is required'),
  intlNationality: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Nationality is required for international patients'),
    otherwise: (schema) => schema,
  }),
  passportNumber: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Passport Number is required'),
    otherwise: (schema) => schema,
  }),
  passportExpiryDate: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Passport Expiry Date is required'),
    otherwise: (schema) => schema,
  }),
});

export const patientDetailsSchema = yup.object().shape({
  prefix: yup.string().required('Title is required'),
  patientName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.string().required('Date of Birth is required'),
});

export const contactDetailsSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('Primary mobile number is required')
    .matches(mobileDigits, 'Phone must contain digits only'),
  email: yup.string().email('Invalid email address'),
  addressLine1: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('Address Line 1 is required'),
    otherwise: (schema) => schema,
  }),
  city: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema,
  }),
  state: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('State is required'),
    otherwise: (schema) => schema,
  }),
  pinCode: yup.string().when('registrationCountry', {
    is: 'india',
    then: (schema) => schema.required('PIN Code is required'),
    otherwise: (schema) => schema,
  }),
  homeAddress: yup.string().when('registrationCountry', {
    is: 'international',
    then: (schema) => schema.required('Home Address is required for international patients'),
    otherwise: (schema) => schema,
  }),
});

export const nextOfKinSchema = yup.object().shape({
  nokFullName: yup.string().required('NOK Full Name is required'),
  nokRelationship: yup.string().required('Relationship is required'),
  nokMobile: yup.string().required('NOK Mobile is required'),
});

export const clinicalInfoSchema = yup.object().shape({
  treatingConsultant: yup.string().required('Treating Consultant is required'),
  chiefComplaint: yup.string().required('Chief Complaint is required'),
  registeredBy: yup.string().required('Registered By is required'),
});

