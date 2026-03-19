export interface TimeSlot {
  s: string; // "09:00"
  e: string; // "17:00"
}

export interface DaySchedule {
  on: boolean;
  hol: boolean;
  work: TimeSlot[];
  breaks: TimeSlot[];
}

export type WeeklySchedule = DaySchedule[]; // index 0 = Mon … 6 = Sun

export interface DoctorRegistrationFormData {
  // Registration Context
  registrationCountry: 'india' | 'international';
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
  weeklySchedule: WeeklySchedule;

  // Contact & Address
  countryCode: string;
  mobile: string;
  alternatePhone: string;
  email: string;
  clinicAddressLine1: string;
  clinicAddressLine2: string;
  clinicCounty: string;
  clinicCity: string;
  clinicState: string;
  clinicCountry: string;
  clinicPinCode: string;
  permanentAddressSame: boolean;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentCounty: string;
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
