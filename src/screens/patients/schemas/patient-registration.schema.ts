import * as yup from 'yup';

const registrationCountrySchema = yup
  .string()
  .oneOf(['india', 'international'])
  .required('Registration country is required');

const mobileDigits = /^\d+$/;
const ageDigits = /^\d+$/;
const maskedAadhaarPattern = /^XXXX XXXX \d{4}$/;

const onlyDigitsCount = (value: string | undefined) => (value || '').replace(/\D/g, '').length;

const abhaNumberSchema = yup.string().when('registrationCountry', {
  is: 'india',
  then: (schema) =>
    schema
      .required('ABHA Number is required')
      .test('abha-number', 'ABHA Number must be 14 digits', (value) => onlyDigitsCount(value) === 14),
  otherwise: (schema) => schema,
});

const aadhaarNumberSchema = yup.string().when('registrationCountry', {
  is: 'india',
  then: (schema) =>
    schema
      .required('Aadhaar Number is required')
      .test('aadhaar-number', 'Aadhaar Number must be 12 digits or masked', (value) => {
        const rawValue = (value || '').trim();
        return maskedAadhaarPattern.test(rawValue) || onlyDigitsCount(rawValue) === 12;
      }),
  otherwise: (schema) => schema,
});

export const patientInfoSchema = yup.object().shape({
  registrationCountry: registrationCountrySchema,
  patientType: yup.string().required('Patient Type is required'),
  language: yup.string().required('Preferred Language is required'),
  regDate: yup.string().required('Registration Date is required'),
  abhaNumber: abhaNumberSchema,
  aadhaarNumber: aadhaarNumberSchema,
  patientName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  dob: yup.string().required('Date of Birth is required'),
  age: yup.string().required('Age is required').matches(ageDigits, 'Age must contain digits only'),

  mobile: yup
    .string()
    .required('Primary mobile number is required')
    .matches(mobileDigits, 'Phone must contain digits only'),
});

export const familyInfoSchema = patientInfoSchema.concat(
  yup.object().shape({
    familyRelation: yup.string().required('Relation is required for family member registration'),
  }),
);

export const referralSchema = yup.object().shape({
  registrationMode: yup.string().required('Registration mode is required'),
  referringSource: yup.string().when('registrationMode', {
    is: 'referral',
    then: (schema) => schema.required('Referring source is required for referral mode'),
    otherwise: (schema) => schema,
  }),
  treatingConsultant: yup.string().required('Treating Consultant is required'),
  chiefComplaint: yup.string().required('Chief Complaint is required'),
  admissionType: yup.string().required('Admission Type is required'),
  registeredBy: yup.string().required('Registered By is required'),
  nokFullName: yup.string().when('admissionType', {
    is: 'ipd',
    then: (schema) => schema.required('NOK Full Name is required for admitted patients'),
    otherwise: (schema) => schema,
  }),
  nokRelationship: yup.string().when('admissionType', {
    is: 'ipd',
    then: (schema) => schema.required('NOK Relationship is required for admitted patients'),
    otherwise: (schema) => schema,
  }),
  nokMobile: yup.string().when('admissionType', {
    is: 'ipd',
    then: (schema) =>
      schema
        .required('NOK Mobile is required for admitted patients')
        .matches(mobileDigits, 'NOK mobile must contain digits only'),
    otherwise: (schema) => schema,
  }),
});

export const patientRegistrationSchema = patientInfoSchema.concat(referralSchema);
