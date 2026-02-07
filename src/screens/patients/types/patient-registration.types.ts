export interface PatientRegistrationFormData {
  // Registration Type
  mrno: string;
  aadhaarId1: string;
  aadhaarId2: string;
  aadhaarId3: string;
  patientType: string;
  language: string;
  reasonForNoAadhaar: string;
  regDate: string;

  // Patient Details
  prefix: string;
  patientName: string;
  middleName: string;
  lastName: string;
  gender: string;
  maritalStatus: string;
  dob: string;
  age: string;
  ageUnit: string;
  occupation: string;
  mobile: string;
  aliasName: string;
  employer: string;
  email: string;
  nationality: string;
  mlc: boolean;
  externalStaffId: string;
  rm: string;
  confidential: boolean;
  howDidYouHear: string;

  // Contact Details
  addressType: 'urban' | 'rural';
  houseNumber: string;
  street: string;
  locality: string;
  country: string;
  state: string;
  city: string;
  poBox: string;
  pinCode: string;
  landline: string;
  correspondenceAddressSame: boolean;

  // Next of Kin
  relationship: string;
  kinPrefix: string;
  kinFirstName: string;
  kinMiddleName: string;
  kinLastName: string;
  emergencyNumber: string;
}

