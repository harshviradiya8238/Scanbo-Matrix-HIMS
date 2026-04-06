"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import StepperForm from "@/src/ui/components/forms/StepperForm";
import { Box, Typography } from "@/src/ui/components/atoms";
import { PatientRegistrationFormData } from "./types/patient-registration.types";
import {
  familyInfoSchema,
  patientInfoSchema,
  referralSchema,
} from "./schemas/patient-registration.schema";
import PatientInfoStep from "./components/PatientInfoStep";
import ReferralStep from "./components/ReferralStep";
import PatientCountryToggle, {
  RegistrationCountry,
} from "./components/PatientCountryToggle";

export type RegistrationEntityMode = "patient" | "family";

const baseInitialValues: PatientRegistrationFormData = {
  // Registration Type
  registrationCountry: "india",
  aadhaarNumber: "",
  abhaNumber: "",
  abhaAddress: "",
  abhaVerificationStatus: "not_linked",
  panNumber: "",
  drivingLicense: "",
  patientType: "general",
  language: "english",
  reasonForNoAadhaar: "",
  schemeType: "",
  schemeCardNumber: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  policyValidity: "",
  bplStatus: "",
  intlNationality: "",
  passportNumber: "",
  passportExpiryDate: "",
  passportIssueCountry: "",
  visaNumber: "",
  visaType: "",
  visaValidityDate: "",
  arrivalInIndiaDate: "",
  intlInsuranceProvider: "",
  intlPolicyMemberId: "",
  countryOfResidence: "",
  embassyContact: "",
  internationalCountryCode: "+971",
  regDate: new Date().toISOString().split("T")[0],

  // Patient Details
  prefix: "",
  familyRelation: "",
  patientName: "",
  middleName: "",
  lastName: "",
  localScriptName: "",
  gender: "",
  maritalStatus: "",
  dob: "",
  age: "",
  ageUnit: "years",
  occupation: "",
  bloodGroup: "",
  religion: "",
  casteCategory: "",
  educationLevel: "",
  drugAllergies: "",
  foodAllergies: "",

  // Contact Details
  mobile: "",
  alternatePhone: "",
  email: "",
  addressType: "urban",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  country: "india",
  state: "",
  city: "",
  district: "",
  pinCode: "",
  areaType: "urban",
  homeAddress: "",
  localAddressIndia: "",
  indiaStayDuration: "",
  stateProvince: "",
  postalCode: "",
  correspondenceAddressSame: true,

  // Next of Kin
  nokFullName: "",
  nokRelationship: "",
  nokMobile: "",
  nokEmail: "",
  nokAddress: "",
  nokIdNumber: "",
  nokConsultPermission: "full_access",
  secondaryContactName: "",
  secondaryRelationship: "",
  secondaryPhone: "",
  secondaryRelationToPrimary: "",

  // Clinical Intake
  referringSource: "",
  treatingConsultant: "",
  department: "",
  chiefComplaint: "",
  admissionType: "opd",
  wardBedPreference: "",
  mlc: false,
  dietPreference: "no_restriction",
  pastMedicalHistory: "",

  // Consent & Admin
  consentVerbal: false,
  consentWritten: false,
  consentAbhaShare: false,
  consentBillingPolicy: false,
  consentIdAttached: false,
  registeredBy: "hospital_admin",
  registrationMode: "referral",
  additionalNotes: "",
};

interface CommonRegistrationFormProps {
  mode?: RegistrationEntityMode;
  onSubmit: (values: PatientRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function CommonRegistrationForm({
  mode = "patient",
  onSubmit,
  onCancel,
}: CommonRegistrationFormProps) {
  const isFamilyMode = mode === "family";

  const handleRegistrationCountryChange = (
    values: PatientRegistrationFormData,
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean,
    ) => Promise<void | unknown>,
    nextCountry: RegistrationCountry,
  ) => {
    void setFieldValue("registrationCountry", nextCountry, false);

    if (nextCountry === "india") {
      void setFieldValue("country", "india", false);
      void setFieldValue("internationalCountryCode", "+91", false);
      return;
    }

    if (values.country === "india") {
      void setFieldValue("country", "uae", false);
    }
    if (
      !values.internationalCountryCode ||
      values.internationalCountryCode === "+91"
    ) {
      void setFieldValue("internationalCountryCode", "+971", false);
    }
    if (!values.intlNationality) {
      void setFieldValue(
        "intlNationality",
        values.country === "india" ? "uae" : values.country,
        false,
      );
    }
  };

  const handleAddPatientType = () => {
    // TODO: Implement add patient type dialog
    console.log("Add patient type");
  };

  const handleAddPrefix = () => {
    // TODO: Implement add prefix dialog
    console.log("Add prefix");
  };

  const handleAddCountry = () => {
    // TODO: Implement add country dialog
    console.log("Add country");
  };

  const handleAddState = () => {
    // TODO: Implement add state dialog
    console.log("Add state");
  };

  const steps = [
    {
      label: isFamilyMode ? "Family Info" : "Patient Info",
      component: (props: any) => (
        <PatientInfoStep
          {...props}
          showFamilyRelation={isFamilyMode}
          familyRelationLabel="Relation to Primary Patient"
          showCountryToggle={false}
          onAddPatientType={handleAddPatientType}
          onAddPrefix={handleAddPrefix}
          onAddCountry={handleAddCountry}
          onAddState={handleAddState}
        />
      ),
      validationSchema: isFamilyMode ? familyInfoSchema : patientInfoSchema,
    },
    {
      label: "Referral",
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
        stickyNavigation
        fillHeight
        contentScrollable
        stickyFooter
        compactNavigation
        showHeaderDivider={false}
        navigationBottomContent={(formik, context) => {
          if (context.activeStep !== 0) return null;
          const selectedCountry: RegistrationCountry =
            formik.values.registrationCountry === "india"
              ? "india"
              : "international";

          return (
            <PatientCountryToggle
              compact
              value={selectedCountry}
              onChange={(nextCountry) =>
                handleRegistrationCountryChange(
                  formik.values,
                  formik.setFieldValue,
                  nextCountry,
                )
              }
            />
          );
        }}
        headerContent={(context) => (
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "#0D1B2A", lineHeight: 1.2 }}
            >
              {isFamilyMode ? "Create Family Member Profile" : "Create Patient Profile"}
            </Typography>
            <Typography
              sx={{ fontSize: "11px", color: "#9AAFBF", marginTop: "2px" }}
            >
              Step {context.activeStep + 1} of {context.steps.length}
            </Typography>
          </Box>
        )}
        submitButtonText={isFamilyMode ? "Register Family Member" : "Register"}
        cancelButtonText="Back"
      />
    </LocalizationProvider>
  );
}
