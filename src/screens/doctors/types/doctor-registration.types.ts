export interface DoctorRegistrationFormData {
  // Registration Context
  registrationCountry: 'india' | 'international';
  doctorId: string;
  doctorType: string;
  regDate: string;

  // India – Medical Council License
  nmcRegNumber: string;
  stateMedicalCouncil: string;
  licenseState: string;
  licenseExpiry: string;

  // International – Medical License
  medicalLicenseNumber: string;
  issuingCountry: string;
  issuingAuthority: string;
  intlLicenseExpiry: string;

  // Personal Details
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  age: string;
  bloodGroup: string;
  maritalStatus: string;

  // India Identity
  aadhaarNumber: string;
  panNumber: string;

  // International Identity
  passportNumber: string;
  passportExpiry: string;
  countryOfCitizenship: string;

  // Professional Details
  primarySpecialization: string;
  subSpecialization: string;
  designation: string;
  department: string;
  qualifications: string;
  additionalQualifications: string;
  yearsOfExperience: string;
  languagesSpoken: string;
  consultationFeeOPD: string;
  consultationDurationMins: string;
  telemedicineAvailable: boolean;
  availableDays: string;

  // Contact & Address
  countryCode: string;
  mobile: string;
  alternatePhone: string;
  email: string;
  clinicAddressLine1: string;
  clinicAddressLine2: string;
  clinicCity: string;
  clinicState: string;
  clinicCountry: string;
  clinicPinCode: string;
  permanentAddressSame: boolean;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentCity: string;
  permanentState: string;
  permanentCountry: string;
  permanentPinCode: string;

  // Documents & Consent
  idProofType: string;
  idProofNumber: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  ifscSwiftCode: string;
  consentDataAccuracy: boolean;
  consentTerms: boolean;
  consentBackgroundCheck: boolean;
  registeredBy: string;
  additionalNotes: string;
}
