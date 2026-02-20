export interface PatientRegistrationFormData {
  // Registration Type
  registrationCountry: 'india' | 'international';
  mrno: string;
  patientType: string;
  language: string;
  regDate: string;
  reasonForNoAadhaar: string;

  // India Identity
  abhaNumber: string;
  abhaAddress: string;
  abhaVerificationStatus: string;
  aadhaarNumber: string;
  panNumber: string;
  voterId: string;
  rationCardNo: string;
  drivingLicense: string;
  schemeType: string;
  schemeCardNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  policyValidity: string;
  bplStatus: string;

  // International Identity
  intlNationality: string;
  passportNumber: string;
  passportExpiryDate: string;
  passportIssueCountry: string;
  visaNumber: string;
  visaType: string;
  visaValidityDate: string;
  arrivalInIndiaDate: string;
  intlInsuranceProvider: string;
  intlPolicyMemberId: string;
  countryOfResidence: string;
  embassyContact: string;
  internationalCountryCode: string;

  // Patient Details
  prefix: string;
  patientName: string;
  middleName: string;
  lastName: string;
  localScriptName: string;
  gender: string;
  maritalStatus: string;
  dob: string;
  age: string;
  ageUnit: string;
  occupation: string;
  aliasName: string;
  bloodGroup: string;
  religion: string;
  casteCategory: string;
  educationLevel: string;
  annualIncomeRange: string;
  drugAllergies: string;
  foodAllergies: string;

  // Contact Details
  mobile: string;
  alternatePhone: string;
  email: string;
  addressType: 'urban' | 'rural';
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  country: string;
  state: string;
  city: string;
  district: string;
  pinCode: string;
  areaType: string;
  landline: string;
  homeAddress: string;
  localAddressIndia: string;
  indiaStayDuration: string;
  stateProvince: string;
  postalCode: string;
  correspondenceAddressSame: boolean;

  // Next of Kin
  nokFullName: string;
  nokRelationship: string;
  nokMobile: string;
  nokEmail: string;
  nokAddress: string;
  nokIdNumber: string;
  nokConsultPermission: string;
  secondaryContactName: string;
  secondaryRelationship: string;
  secondaryPhone: string;
  secondaryRelationToPrimary: string;

  // Clinical Intake
  referringSource: string;
  treatingConsultant: string;
  department: string;
  chiefComplaint: string;
  admissionType: string;
  wardBedPreference: string;
  mlc: boolean;
  dietPreference: string;
  pastMedicalHistory: string;

  // Consent & Admin
  consentVerbal: boolean;
  consentWritten: boolean;
  consentAbhaShare: boolean;
  consentBillingPolicy: boolean;
  consentIdAttached: boolean;
  registeredBy: string;
  registrationMode: string;
  additionalNotes: string;
}
