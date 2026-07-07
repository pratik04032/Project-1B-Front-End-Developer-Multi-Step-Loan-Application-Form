export type LoanType = "Personal" | "Home" | "Business";
export type EmploymentType = "Salaried" | "Self-Employed" | "Business Owner";
export type ResidenceType = "Owned" | "Rented" | "Company" | "Family";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number; // in bytes
  originalSize: number; // in bytes (before compression)
  compressedSize?: number; // in bytes (after compression)
  base64: string; // File contents encoded as base64
}

export interface FormState {
  // Step 1: Loan Type Selection & Basic Info
  loanType: LoanType;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  referralCode: string;

  // Step 2: Personal Information
  fullName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  email: string;
  mobileNumber: string;
  alternateMobile: string;

  // Step 3: Identity Verification (KYC)
  panNumber: string;
  aadhaarNumber: string;
  aadhaarConsent: boolean;
  voterId: string;
  passport: string;
  panVerified: boolean;
  aadhaarVerified: boolean;

  // Step 4: Address Information
  currentAddressLine1: string;
  currentAddressLine2: string;
  currentPinCode: string;
  currentCity: string;
  currentState: string;
  residenceType: ResidenceType | "";
  rentAmount: number;
  yearsAtCurrentAddress: number;
  sameAsPermanent: boolean;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentPinCode: string;
  permanentCity: string;
  permanentState: string;

  // Step 5: Employment & Income Details
  employmentType: EmploymentType | "";
  companyName: string;
  designation: string;
  monthlyNetSalary: number;
  yearsOfExperience: number;
  businessName: string;
  businessType: string;
  annualTurnover: number;
  yearsInBusiness: number;
  monthlyIncome: number;
  gstNumber: string;
  officeAddress: string;

  // Step 6: Co-Applicant & Guarantor
  coApplicantName: string;
  coApplicantRelationship: string;
  coApplicantPan: string;
  coApplicantIncome: number;
  coApplicantConsent: boolean;
  coApplicantSignature: string; // base64
  coApplicantPanVerified: boolean;

  // Step 7: Document Upload & E-Signature
  uploadedFiles: Record<string, UploadedFile[]>;
  applicantSignature: string; // base64

  // Step 8: Consents & Acknowledgements
  consentConfirmAccurate: boolean;
  consentCheckCreditScore: boolean;
  consentAgreeTerms: boolean;
  consentReceiveComms: boolean;
  highEmiRatioAcknowledge: boolean;
}

export const INITIAL_FORM_STATE: FormState = {
  loanType: "Personal",
  loanAmount: 100000,
  loanTenure: 24,
  loanPurpose: "",
  referralCode: "",

  fullName: "",
  dob: "",
  gender: "",
  maritalStatus: "",
  fathersName: "",
  mothersName: "",
  email: "",
  mobileNumber: "",
  alternateMobile: "",

  panNumber: "",
  aadhaarNumber: "",
  aadhaarConsent: false,
  voterId: "",
  passport: "",
  panVerified: false,
  aadhaarVerified: false,

  currentAddressLine1: "",
  currentAddressLine2: "",
  currentPinCode: "",
  currentCity: "",
  currentState: "",
  residenceType: "",
  rentAmount: 0,
  yearsAtCurrentAddress: 0,
  sameAsPermanent: true,
  permanentAddressLine1: "",
  permanentAddressLine2: "",
  permanentPinCode: "",
  permanentCity: "",
  permanentState: "",

  employmentType: "",
  companyName: "",
  designation: "",
  monthlyNetSalary: 0,
  yearsOfExperience: 0,
  businessName: "",
  businessType: "",
  annualTurnover: 0,
  yearsInBusiness: 0,
  monthlyIncome: 0,
  gstNumber: "",
  officeAddress: "",

  coApplicantName: "",
  coApplicantRelationship: "",
  coApplicantPan: "",
  coApplicantIncome: 0,
  coApplicantConsent: false,
  coApplicantSignature: "",
  coApplicantPanVerified: false,

  uploadedFiles: {
    panCardCopy: [],
    aadhaarCardCopy: [],
    salarySlips: [],
    bankStatements: [],
    itr: [],
    propertyDocs: [],
    businessRegistration: [],
    gstReturns: [],
    photograph: []
  },
  applicantSignature: "",

  consentConfirmAccurate: false,
  consentCheckCreditScore: false,
  consentAgreeTerms: false,
  consentReceiveComms: false,
  highEmiRatioAcknowledge: false
};
