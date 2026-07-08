import { FormState } from "../types";
import { validatePAN, validateAadhaar, validateGST, calculateAge } from "./validators";

export function isStep6Active(loanType: string, loanAmount: number): boolean {
  if (loanType === "Home") return true;
  if (loanType === "Personal") return loanAmount > 500000;
  if (loanType === "Business") return loanAmount > 2000000;
  return false;
}

export function validateStep1(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  // Loan Amount
  if (!state.loanAmount || state.loanAmount <= 0) {
    errors.loanAmount = "Loan Amount is required.";
  } else if (state.loanAmount < 50000) {
    errors.loanAmount = "Minimum loan amount is ₹50,000.";
  } else {
    if (state.loanType === "Personal" && state.loanAmount > 1000000) {
      errors.loanAmount = "Maximum Personal Loan amount is ₹10,00,000 (10 Lakh).";
    } else if (state.loanType === "Home" && state.loanAmount > 10000000) {
      errors.loanAmount = "Maximum Home Loan amount is ₹1,00,00,000 (1 Crore).";
    } else if (state.loanType === "Business" && state.loanAmount > 5000000) {
      errors.loanAmount = "Maximum Business Loan amount is ₹50,00,000 (50 Lakh).";
    }
  }

  // Loan Tenure
  if (!state.loanTenure) {
    errors.loanTenure = "Loan Tenure is required.";
  } else {
    if (state.loanType === "Personal" && (state.loanTenure < 12 || state.loanTenure > 60)) {
      errors.loanTenure = "Personal Loan tenure must be between 12 and 60 months.";
    } else if (state.loanType === "Home" && (state.loanTenure < 60 || state.loanTenure > 360)) {
      errors.loanTenure = "Home Loan tenure must be between 60 and 360 months.";
    } else if (state.loanType === "Business" && (state.loanTenure < 12 || state.loanTenure > 120)) {
      errors.loanTenure = "Business Loan tenure must be between 12 and 120 months.";
    }

    // Cross-step dependency: DOB affects max tenure (Age + tenure must not exceed 65 years)
    if (state.dob) {
      const age = calculateAge(state.dob);
      const tenureYears = state.loanTenure / 12;
      if (age + tenureYears > 65) {
        const maxTenureMonths = Math.max(0, Math.floor((65 - age) * 12));
        errors.loanTenure = `Based on your Date of Birth, you are ${age} years old. Your age at loan maturity cannot exceed 65 years. The maximum tenure allowed is ${maxTenureMonths} months.`;
      }
    }
  }

  // Loan Purpose
  if (!state.loanPurpose) {
    errors.loanPurpose = "Loan Purpose is required.";
  }

  // Referral Code (optional)
  if (state.referralCode) {
    if (!/^[a-zA-Z0-9]{6,10}$/.test(state.referralCode)) {
      errors.referralCode = "Referral code must be alphanumeric and between 6 and 10 characters.";
    }
  }

  return errors;
}

export function validateStep2(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  // Full Name
  if (!state.fullName || state.fullName.trim() === "") {
    errors.fullName = "Full Name is required.";
  } else if (state.fullName.length < 2 || state.fullName.length > 100) {
    errors.fullName = "Full Name must be between 2 and 100 characters.";
  } else if (!/^[a-zA-Z\s.]+$/.test(state.fullName)) {
    errors.fullName = "Full Name can only contain letters, spaces, and periods.";
  }

  // Date of Birth
  if (!state.dob) {
    errors.dob = "Date of Birth is required.";
  } else {
    const age = calculateAge(state.dob);
    if (age < 21 || age > 65) {
      errors.dob = "Applicant age must be between 21 and 65 years.";
    }

    // Age + current tenure must not exceed 65
    if (age >= 21 && age <= 65) {
      const tenureYears = state.loanTenure / 12;
      if (age + tenureYears > 65) {
        errors.dob = `Age (${age} years) + tenure (${state.loanTenure} months / ${tenureYears.toFixed(1)} years) exceeds the limit of 65 years. Please choose a lower tenure in Step 1 or verify Date of Birth.`;
      }
    }
  }

  // Gender
  if (!state.gender) {
    errors.gender = "Gender is required.";
  }

  // Marital Status
  if (!state.maritalStatus) {
    errors.maritalStatus = "Marital Status is required.";
  }

  // Father's Name
  if (!state.fathersName || state.fathersName.trim() === "") {
    errors.fathersName = "Father's Name is required.";
  } else if (state.fathersName.length < 2 || state.fathersName.length > 100) {
    errors.fathersName = "Father's Name must be between 2 and 100 characters.";
  } else if (!/^[a-zA-Z\s.]+$/.test(state.fathersName)) {
    errors.fathersName = "Father's Name can only contain letters, spaces, and periods.";
  }

  // Mother's Name
  if (!state.mothersName || state.mothersName.trim() === "") {
    errors.mothersName = "Mother's Name is required.";
  } else if (state.mothersName.length < 2 || state.mothersName.length > 100) {
    errors.mothersName = "Mother's Name must be between 2 and 100 characters.";
  } else if (!/^[a-zA-Z\s.]+$/.test(state.mothersName)) {
    errors.mothersName = "Mother's Name can only contain letters, spaces, and periods.";
  }

  // Email
  if (!state.email) {
    errors.email = "Email Address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = "Please enter a valid Email Address.";
  } else if (!state.emailVerified) {
    errors.email = "Please verify your Email Address via OTP.";
  }

  // Mobile Number
  if (!state.mobileNumber) {
    errors.mobileNumber = "Mobile Number is required.";
  } else if (!/^[6-9]\d{9}$/.test(state.mobileNumber)) {
    errors.mobileNumber = "Mobile Number must be 10 digits starting with 6, 7, 8, or 9.";
  } else if (!state.mobileVerified) {
    errors.mobileNumber = "Please verify your Mobile Number via OTP.";
  }

  // Alternate Mobile
  if (state.alternateMobile) {
    if (!/^[6-9]\d{9}$/.test(state.alternateMobile)) {
      errors.alternateMobile = "Alternate Mobile must be 10 digits starting with 6, 7, 8, or 9.";
    } else if (state.alternateMobile === state.mobileNumber) {
      errors.alternateMobile = "Alternate Mobile number must be different from the primary mobile number.";
    }
  }

  return errors;
}

export function validateStep3(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  // PAN Validation
  const panRes = validatePAN(state.panNumber, state.loanType);
  if (!panRes.valid) {
    errors.panNumber = panRes.error || "Invalid PAN number.";
  } else if (!state.panVerified) {
    errors.panNumber = "PAN verification is required. Please verify.";
  }

  // Aadhaar Validation
  if (!state.aadhaarNumber) {
    errors.aadhaarNumber = "Aadhaar number is required.";
  } else if (!validateAadhaar(state.aadhaarNumber)) {
    errors.aadhaarNumber = "Invalid Aadhaar number. Must be 12 digits and pass Verhoeff checksum.";
  } else if (!state.aadhaarVerified) {
    errors.aadhaarNumber = "Aadhaar verification is required. Please verify.";
  }

  // Aadhaar Consent
  if (!state.aadhaarConsent) {
    errors.aadhaarConsent = "Explicit Aadhaar consent is required to proceed.";
  }

  // Voter ID (optional)
  if (state.voterId) {
    if (!/^[A-Z]{3}[0-9]{7}$/.test(state.voterId.toUpperCase())) {
      errors.voterId = "Voter ID must be 3 uppercase letters followed by 7 digits (e.g. ABC1234567).";
    }
  }

  // Passport (optional/required if Home Loan > 50L)
  const isPassportRequired = state.loanType === "Home" && state.loanAmount > 5000000;
  if (isPassportRequired && !state.passport) {
    errors.passport = "Passport is required for Home Loans exceeding ₹50 Lakh.";
  } else if (state.passport) {
    if (!/^[A-Z]{1}[0-9]{7}$/.test(state.passport.toUpperCase())) {
      errors.passport = "Passport must be 1 letter followed by 7 digits (e.g. A1234567).";
    }
  }

  return errors;
}

export function validateStep4(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  // Current Address Line 1
  if (!state.currentAddressLine1 || state.currentAddressLine1.trim() === "") {
    errors.currentAddressLine1 = "Current Address Line 1 is required.";
  } else if (state.currentAddressLine1.length < 5 || state.currentAddressLine1.length > 200) {
    errors.currentAddressLine1 = "Address must be between 5 and 200 characters.";
  }

  // PIN Code
  if (!state.currentPinCode) {
    errors.currentPinCode = "PIN Code is required.";
  } else if (!/^\d{6}$/.test(state.currentPinCode)) {
    errors.currentPinCode = "PIN Code must be exactly 6 digits.";
  }

  // City
  if (!state.currentCity || state.currentCity.trim() === "") {
    errors.currentCity = "City is required.";
  }

  // State
  if (!state.currentState || state.currentState.trim() === "") {
    errors.currentState = "State is required.";
  }

  // Residence Type
  if (!state.residenceType) {
    errors.residenceType = "Residence Type is required.";
  } else if (state.residenceType === "Rented") {
    if (!state.rentAmount || state.rentAmount <= 0) {
      errors.rentAmount = "Monthly Rent amount is required for Rented residence.";
    }
  }

  // Years at current address
  if (state.yearsAtCurrentAddress === undefined || state.yearsAtCurrentAddress < 0) {
    errors.yearsAtCurrentAddress = "Years at current address is required.";
  }

  // Permanent Address check if not same
  if (!state.sameAsPermanent) {
    if (!state.permanentAddressLine1 || state.permanentAddressLine1.trim() === "") {
      errors.permanentAddressLine1 = "Permanent Address Line 1 is required.";
    } else if (state.permanentAddressLine1.length < 5 || state.permanentAddressLine1.length > 200) {
      errors.permanentAddressLine1 = "Permanent Address must be between 5 and 200 characters.";
    }

    if (!state.permanentPinCode) {
      errors.permanentPinCode = "Permanent PIN Code is required.";
    } else if (!/^\d{6}$/.test(state.permanentPinCode)) {
      errors.permanentPinCode = "Permanent PIN Code must be exactly 6 digits.";
    }

    if (!state.permanentCity || state.permanentCity.trim() === "") {
      errors.permanentCity = "Permanent City is required.";
    }

    if (!state.permanentState || state.permanentState.trim() === "") {
      errors.permanentState = "Permanent State is required.";
    }
  }

  return errors;
}

export function validateStep5(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!state.employmentType) {
    errors.employmentType = "Employment Type is required.";
    return errors;
  }

  // Cross-step validation: If Business Loan, employment must be Self-Employed or Business Owner (not Salaried)
  if (state.loanType === "Business" && state.employmentType === "Salaried") {
    errors.employmentType = "For Business Loans, the employment type must be either Self-Employed or Business Owner.";
    return errors;
  }

  if (state.employmentType === "Salaried") {
    if (!state.companyName || state.companyName.trim() === "") {
      errors.companyName = "Company Name is required.";
    }
    if (!state.designation || state.designation.trim() === "") {
      errors.designation = "Designation is required.";
    }
    if (!state.monthlyNetSalary || state.monthlyNetSalary < 15000) {
      errors.monthlyNetSalary = "Monthly net salary is required and must be at least ₹15,000.";
    }
    if (state.yearsOfExperience === undefined || state.yearsOfExperience < 0) {
      errors.yearsOfExperience = "Years of experience is required.";
    }
  } else {
    // Self-Employed or Business Owner
    if (!state.businessName || state.businessName.trim() === "") {
      errors.businessName = "Business/Company Name is required.";
    }
    if (!state.businessType) {
      errors.businessType = "Business Type is required.";
    }
    if (!state.annualTurnover || state.annualTurnover < 300000) {
      errors.annualTurnover = "Annual Turnover is required and must be at least ₹3,00,000 (3 Lakh).";
    }
    if (!state.yearsInBusiness || state.yearsInBusiness < 2) {
      errors.yearsInBusiness = "Years in Business is required and must be at least 2 years.";
    }
    if (!state.monthlyIncome || state.monthlyIncome <= 0) {
      errors.monthlyIncome = "Monthly Net Income is required.";
    }
    if (!state.officeAddress || state.officeAddress.trim() === "") {
      errors.officeAddress = "Office/Business Address is required.";
    }

    // Business Owner - Business Loan only: require GST validation (15 chars)
    if (state.employmentType === "Business Owner" && state.loanType === "Business") {
      const gstRes = validateGST(state.gstNumber, state.panNumber);
      if (!gstRes.valid) {
        errors.gstNumber = gstRes.error || "Invalid GST number.";
      }
    }
  }

  return errors;
}

export function validateStep6(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  // Check if active
  if (!isStep6Active(state.loanType, state.loanAmount)) {
    return errors;
  }

  // Co-applicant Name
  if (!state.coApplicantName || state.coApplicantName.trim() === "") {
    errors.coApplicantName = "Co-applicant Full Name is required.";
  }

  // Relationship
  if (!state.coApplicantRelationship) {
    errors.coApplicantRelationship = "Co-applicant Relationship is required.";
  }

  // PAN
  const panRes = validatePAN(state.coApplicantPan, "Personal"); // validate against default "Personal" rules (only P accepted)
  if (!panRes.valid) {
    errors.coApplicantPan = panRes.error || "Invalid co-applicant PAN.";
  } else if (!state.coApplicantPanVerified) {
    errors.coApplicantPan = "Co-applicant PAN verification is required.";
  }

  // Co-applicant Income
  if (state.coApplicantIncome === undefined || state.coApplicantIncome < 0) {
    errors.coApplicantIncome = "Co-applicant Monthly Income is required (enter 0 if none).";
  }

  // Consent
  if (!state.coApplicantConsent) {
    errors.coApplicantConsent = "Co-applicant explicit consent is required.";
  }

  // Signature
  if (!state.coApplicantSignature) {
    errors.coApplicantSignature = "Co-applicant electronic signature drawing is required.";
  }

  return errors;
}

export function validateStep7(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const files = state.uploadedFiles;
  const isSalaried = state.employmentType === "Salaried";
  const isBusiness = state.loanType === "Business";
  const isHome = state.loanType === "Home";

  // PAN Card copy is required UNLESS PAN was successfully verified in Step 3
  if (!state.panVerified) {
    if (!files.panCardCopy || files.panCardCopy.length === 0) {
      errors.panCardCopy = "PAN Card Copy upload is required (since PAN verification was skipped/unverified).";
    }
  }

  // Aadhaar Card (Front + Back) copy is ALWAYS required
  if (!files.aadhaarCardCopy || files.aadhaarCardCopy.length === 0) {
    errors.aadhaarCardCopy = "Aadhaar Card Copy upload is required.";
  }

  // Salary Slips are required for Salaried applicants
  if (isSalaried) {
    if (!files.salarySlips || files.salarySlips.length === 0) {
      errors.salarySlips = "Salary Slips (last 3 months) upload is required.";
    }
  } else {
    // Self-Employed or Business Owner need ITR (Last 2 years)
    if (!files.itr || files.itr.length === 0) {
      errors.itr = "ITR Documents (last 2 years) upload is required.";
    }
  }

  // Bank Statements are ALWAYS required
  if (!files.bankStatements || files.bankStatements.length === 0) {
    errors.bankStatements = "Bank Statements (last 6 months) upload is required.";
  }

  // Property Documents for Home Loan only
  if (isHome) {
    if (!files.propertyDocs || files.propertyDocs.length === 0) {
      errors.propertyDocs = "Property Documents upload is required for Home Loans.";
    }
  }

  // Business Registration Certificate for Business Loan only
  if (isBusiness) {
    if (!files.businessRegistration || files.businessRegistration.length === 0) {
      errors.businessRegistration = "Business Registration Certificate upload is required.";
    }
    if (state.employmentType === "Business Owner") {
      if (!files.gstReturns || files.gstReturns.length === 0) {
        errors.gstReturns = "GST Returns (last 4 quarters) upload is required.";
      }
    }
  }

  // Photograph (Passport size) is ALWAYS required
  if (!files.photograph || files.photograph.length === 0) {
    errors.photograph = "Passport size Photograph upload is required.";
  }

  // Electronic Signature
  if (!state.applicantSignature) {
    errors.applicantSignature = "Applicant electronic signature drawing is required.";
  }

  return errors;
}

export function validateStep8(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!state.consentConfirmAccurate) {
    errors.consentConfirmAccurate = "You must confirm that all provided information is accurate.";
  }
  if (!state.consentCheckCreditScore) {
    errors.consentCheckCreditScore = "You must authorize LendSwift to pull your credit score.";
  }
  if (!state.consentAgreeTerms) {
    errors.consentAgreeTerms = "You must agree to the Terms and Conditions.";
  }
  if (!state.consentReceiveComms) {
    errors.consentReceiveComms = "You must consent to receive communications regarding this application.";
  }

  return errors;
}

export function validateAllSteps(state: FormState): Record<number, Record<string, string>> {
  const stepErrors: Record<number, Record<string, string>> = {};

  stepErrors[1] = validateStep1(state);
  stepErrors[2] = validateStep2(state);
  stepErrors[3] = validateStep3(state);
  stepErrors[4] = validateStep4(state);
  stepErrors[5] = validateStep5(state);
  
  if (isStep6Active(state.loanType, state.loanAmount)) {
    stepErrors[6] = validateStep6(state);
  } else {
    stepErrors[6] = {};
  }

  stepErrors[7] = validateStep7(state);
  stepErrors[8] = validateStep8(state);

  return stepErrors;
}
