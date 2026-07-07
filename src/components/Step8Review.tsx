import React, { useState } from "react";
import { FormState } from "../types";
import { isStep6Active } from "../utils/stepValidators";
import { calculateEMI, formatINR } from "../utils/validators";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
  jumpToStep: (step: number) => void;
}

export default function Step8Review({
  formState,
  updateFormState,
  errors,
  jumpToStep
}: StepProps) {
  const {
    loanType,
    loanAmount,
    loanTenure,
    loanPurpose,
    referralCode,
    fullName,
    dob,
    gender,
    maritalStatus,
    fathersName,
    mothersName,
    email,
    mobileNumber,
    alternateMobile,
    panNumber,
    aadhaarNumber,
    panVerified,
    aadhaarVerified,
    voterId,
    passport,
    currentAddressLine1,
    currentAddressLine2,
    currentPinCode,
    currentCity,
    currentState,
    residenceType,
    rentAmount,
    yearsAtCurrentAddress,
    sameAsPermanent,
    permanentAddressLine1,
    permanentAddressLine2,
    permanentPinCode,
    permanentCity,
    permanentState,
    employmentType,
    companyName,
    designation,
    monthlyNetSalary,
    yearsOfExperience,
    businessName,
    businessType,
    annualTurnover,
    yearsInBusiness,
    monthlyIncome,
    gstNumber,
    officeAddress,
    coApplicantName,
    coApplicantRelationship,
    coApplicantPan,
    coApplicantIncome,
    coApplicantSignature,
    coApplicantPanVerified,
    uploadedFiles,
    applicantSignature,
    consentConfirmAccurate,
    consentCheckCreditScore,
    consentAgreeTerms,
    consentReceiveComms,
    highEmiRatioAcknowledge
  } = formState;

  // 1. Financial Computations
  const rate = loanType === "Personal" ? 10.5 : loanType === "Home" ? 8.5 : 14.0;
  const financialResult = calculateEMI(loanAmount, rate, loanTenure);

  // 2. Income Computation for EMI Ratio Check
  const primaryIncome =
    employmentType === "Salaried" ? monthlyNetSalary : monthlyIncome || 0;
  
  const isCoAppActive = isStep6Active(loanType, loanAmount);
  const totalNetMonthlyIncome =
    primaryIncome + (isCoAppActive ? coApplicantIncome || 0 : 0);

  const emiToIncomePercentage =
    totalNetMonthlyIncome > 0
      ? (financialResult.emi / totalNetMonthlyIncome) * 100
      : 0;

  const isEmiRatioExceeded = emiToIncomePercentage > 50;

  // Helper to check which documents are completely uploaded
  const isDocumentCategoryUploaded = (key: string): boolean => {
    return uploadedFiles[key] && uploadedFiles[key].length > 0;
  };

  return (
    <div className="space-y-8" id="step8-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review &amp; Pre-Approval Summary</h2>
        <p className="text-sm text-slate-500">Perform a comprehensive check of your loan application details before final submission.</p>
      </div>

      {/* PRE-APPROVAL FINANCIAL SUMMARY CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pre-Approved Offer
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-2">{loanType} Loan Package</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Indicative Interest Rate</span>
            <span className="text-2xl font-bold text-slate-100">{rate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">p.a.</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
          <div>
            <span className="text-xs text-slate-400 block">Principal Amount</span>
            <span className="text-lg font-bold text-slate-100">{formatINR(loanAmount)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Requested Tenure</span>
            <span className="text-lg font-bold text-slate-100">{loanTenure} Months</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Estimated EMI</span>
            <span className="text-xl font-black text-emerald-400">{formatINR(financialResult.emi)}<span className="text-[10px] font-normal text-slate-400 block mt-0.5">/ month</span></span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Interest</span>
            <span className="text-lg font-bold text-slate-100">{formatINR(financialResult.totalInterest)}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400">Processing Fee:</span>{" "}
            <span className="font-semibold text-slate-100">{formatINR(financialResult.processingFee)}</span>{" "}
            <span className="text-[10px] text-slate-400">(1% of loan amount)</span>
          </div>
          <div>
            <span className="text-slate-400">Total Borrowing Cost:</span>{" "}
            <span className="font-semibold text-slate-100">{formatINR(financialResult.totalPayment)}</span>
          </div>
        </div>

        {/* EMI-to-Income Warning Check */}
        {isEmiRatioExceeded && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-200">
            <svg className="h-5 w-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 block">High EMI-to-Income Ratio Alert ({Math.round(emiToIncomePercentage)}%)</span>
              <p className="leading-relaxed">
                Your estimated EMI exceeds 50% of your total net monthly income ({formatINR(totalNetMonthlyIncome)}). Under lending standards, this is a risk. An additional explicit acknowledgment is required to submit.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="highEmiRatioAcknowledge"
                  name="highEmiRatioAcknowledge"
                  checked={highEmiRatioAcknowledge}
                  onChange={(e) => updateFormState({ highEmiRatioAcknowledge: e.target.checked })}
                  className="h-3.5 w-3.5 text-amber-600 border-amber-500 rounded focus:ring-amber-400 bg-transparent cursor-pointer"
                />
                <label htmlFor="highEmiRatioAcknowledge" className="text-[11px] text-amber-200 font-semibold cursor-pointer select-none">
                  I acknowledge the high debt-to-income ratio and confirm my capacity to repay.
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION-BY-SECTION PREVIEWS WITH EDIT BUTTONS */}
      <div className="space-y-6">
        {/* Step 1 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">1</span>
              Loan Request Basic Info
            </h4>
            <button
              type="button"
              id="edit-step-1"
              onClick={() => jumpToStep(1)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Loan Product</span>
              <span className="font-semibold text-slate-800">{loanType} Loan</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Requested Amount</span>
              <span className="font-semibold text-slate-800">{formatINR(loanAmount)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Desired Tenure</span>
              <span className="font-semibold text-slate-800">{loanTenure} Months</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Purpose of Loan</span>
              <span className="font-semibold text-slate-800">{loanPurpose}</span>
            </div>
            {referralCode && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Referral/Campaign Code</span>
                <span className="font-semibold text-slate-800">{referralCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">2</span>
              Personal Information
            </h4>
            <button
              type="button"
              id="edit-step-2"
              onClick={() => jumpToStep(2)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Full Name (PAN Name)</span>
              <span className="font-semibold text-slate-800 uppercase">{fullName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Date of Birth</span>
              <span className="font-semibold text-slate-800">{dob}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Gender / Marital Status</span>
              <span className="font-semibold text-slate-800">{gender} / {maritalStatus}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Parents Names</span>
              <span className="font-semibold text-slate-800">F: {fathersName} | M: {mothersName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Email Address</span>
              <span className="font-semibold text-slate-800">{email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Verified Mobile Number</span>
              <span className="font-semibold text-slate-800">+91 {mobileNumber}</span>
            </div>
            {alternateMobile && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Alternate Mobile</span>
                <span className="font-semibold text-slate-800">+91 {alternateMobile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">3</span>
              Identity Verification (KYC)
            </h4>
            <button
              type="button"
              id="edit-step-3"
              onClick={() => jumpToStep(3)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">PAN Card Status</span>
              <span className="font-mono font-bold text-slate-800">{panNumber.substring(0, 6)}••••</span>
              {panVerified && <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-2">Verified</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Aadhaar Card Status</span>
              <span className="font-mono font-bold text-slate-800">••••••••{aadhaarNumber.substring(8)}</span>
              {aadhaarVerified && <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-2">Verified</span>}
            </div>
            {voterId && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Voter ID</span>
                <span className="font-mono font-semibold text-slate-800 uppercase">{voterId}</span>
              </div>
            )}
            {passport && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Passport</span>
                <span className="font-mono font-semibold text-slate-800 uppercase">{passport}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">4</span>
              Address Information
            </h4>
            <button
              type="button"
              id="edit-step-4"
              onClick={() => jumpToStep(4)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Current Address</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {currentAddressLine1}, {currentAddressLine2 ? `${currentAddressLine2}, ` : ""}{currentCity}, {currentState} - {currentPinCode}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Residence: {residenceType} {residenceType === "Rented" && `(Rent: ${formatINR(rentAmount)})`} | Years there: {yearsAtCurrentAddress}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Permanent Address</span>
              {sameAsPermanent ? (
                <p className="text-slate-500 italic mt-0.5">Same as Current Address</p>
              ) : (
                <p className="font-semibold text-slate-800 mt-0.5">
                  {permanentAddressLine1}, {permanentAddressLine2 ? `${permanentAddressLine2}, ` : ""}{permanentCity}, {permanentState} - {permanentPinCode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 5 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">5</span>
              Employment &amp; Income Details
            </h4>
            <button
              type="button"
              id="edit-step-5"
              onClick={() => jumpToStep(5)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 text-sm">
            {employmentType === "Salaried" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Employment Type</span>
                  <span className="font-semibold text-slate-800">{employmentType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Employer / Company</span>
                  <span className="font-semibold text-slate-800">{companyName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Designation / Experience</span>
                  <span className="font-semibold text-slate-800">{designation} ({yearsOfExperience} Years)</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Monthly In-Hand Net Salary</span>
                  <span className="font-semibold text-emerald-600">{formatINR(monthlyNetSalary)}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Employment Type</span>
                  <span className="font-semibold text-slate-800">{employmentType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Business Name &amp; Entity</span>
                  <span className="font-semibold text-slate-800">{businessName} ({businessType})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Annual Gross Turnover / Experience</span>
                  <span className="font-semibold text-slate-800">{formatINR(annualTurnover)} ({yearsInBusiness} Years in Business)</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Average Net Monthly Income</span>
                  <span className="font-semibold text-emerald-600">{formatINR(monthlyIncome)}</span>
                </div>
                {gstNumber && (
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">GSTIN ID</span>
                    <span className="font-mono font-semibold text-slate-800">{gstNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Business Registered Address</span>
                  <p className="font-semibold text-slate-800 truncate" title={officeAddress}>{officeAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 6 Preview (Conditional Co-applicant) */}
        {isCoAppActive && (
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">6</span>
                Co-Applicant &amp; Guarantor
              </h4>
              <button
                type="button"
                id="edit-step-6"
                onClick={() => jumpToStep(6)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Edit Section
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Co-applicant Name</span>
                <span className="font-semibold text-slate-800">{coApplicantName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Relationship</span>
                <span className="font-semibold text-slate-800">{coApplicantRelationship}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">PAN ID (Verified)</span>
                <span className="font-mono font-semibold text-slate-800">{coApplicantPan}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Monthly Income</span>
                <span className="font-semibold text-slate-800">{formatINR(coApplicantIncome)}</span>
              </div>
              {coApplicantSignature && (
                <div className="col-span-full border-t border-slate-100 pt-4 flex gap-4 items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Co-Applicant E-Signature</span>
                    <img
                      src={coApplicantSignature}
                      alt="Co-Applicant Signature Preview"
                      referrerPolicy="no-referrer"
                      className="border border-slate-200 rounded bg-slate-50 max-h-16 mt-1 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 7 Preview */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">7</span>
              Uploaded Documents Checklist
            </h4>
            <button
              type="button"
              id="edit-step-7"
              onClick={() => jumpToStep(7)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Edit Section
            </button>
          </div>
          <div className="p-5 space-y-3.5 text-sm">
            {Object.keys(uploadedFiles).map((docKey) => {
              const filesList = uploadedFiles[docKey] || [];
              const isAdded = filesList.length > 0;
              
              // Skip property/business/salary folders if they are not active in state config
              const isSalaried = employmentType === "Salaried";
              const isHome = loanType === "Home";
              const isBusiness = loanType === "Business";

              if (docKey === "salarySlips" && !isSalaried) return null;
              if (docKey === "itr" && isSalaried) return null;
              if (docKey === "propertyDocs" && !isHome) return null;
              if (docKey === "businessRegistration" && !isBusiness) return null;
              if (docKey === "gstReturns" && (!isBusiness || employmentType !== "Business Owner")) return null;
              if (docKey === "panCardCopy" && panVerified) return null; // skip pan upload summary if pan is verified online

              return (
                <div key={docKey} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    {isAdded ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="text-red-500 font-bold">✗</span>
                    )}
                    {docKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </span>
                  {isAdded ? (
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {filesList.map((f) => f.name).join(", ")}
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded">
                      Missing File
                    </span>
                  )}
                </div>
              );
            })}

            {applicantSignature && (
              <div className="border-t border-slate-100 pt-4 space-y-1.5">
                <span className="text-xs text-slate-400 block font-medium">Applicant E-Signature Review</span>
                <img
                  src={applicantSignature}
                  alt="Primary Signature Preview"
                  referrerPolicy="no-referrer"
                  className="border border-slate-200 rounded-xl bg-slate-50 max-h-20 object-contain p-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FINAL FOUR CONSENTS EXPLICIT SIGN-OFF */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Final Authorization &amp; Declarations</h3>
        
        <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          {/* Consent 1 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentConfirmAccurate"
              name="consentConfirmAccurate"
              checked={consentConfirmAccurate}
              onChange={(e) => updateFormState({ consentConfirmAccurate: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consentConfirmAccurate" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              I hereby confirm and declare that all the information, values, cash flows, and personal/business credentials provided in this digital application form are accurate, authentic, and complete to the best of my knowledge. (1)
            </label>
          </div>

          {/* Consent 2 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentCheckCreditScore"
              name="consentCheckCreditScore"
              checked={consentCheckCreditScore}
              onChange={(e) => updateFormState({ consentCheckCreditScore: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consentCheckCreditScore" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              I hereby authorize LendSwift and its financial partners/NBFCs to check my official credit reports, history, and records directly with CIBIL, Equifax, Experian, or CRIF High Mark. (2)
            </label>
          </div>

          {/* Consent 3 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentAgreeTerms"
              name="consentAgreeTerms"
              checked={consentAgreeTerms}
              onChange={(e) => updateFormState({ consentAgreeTerms: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consentAgreeTerms" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              I agree to the LendSwift lending Terms and Conditions, Privacy Policies, Key Fact Statement (KFS) terms, and the 72-hour cooling-off exit policies. {" "}
              <a href="#" className="text-blue-600 font-bold hover:underline" onClick={(e) => { e.preventDefault(); alert("MOCK DOWNLOAD: Opening LendSwift Lending Policy PDF Agreement"); }}>
                Read LendSwift Terms PDF
              </a>{" "}(3)
            </label>
          </div>

          {/* Consent 4 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentReceiveComms"
              name="consentReceiveComms"
              checked={consentReceiveComms}
              onChange={(e) => updateFormState({ consentReceiveComms: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consentReceiveComms" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              I consent to receive automatic status updates, receipts, communication notices, and marketing messages regarding this application via WhatsApp, SMS, and Email. (4)
            </label>
          </div>
        </div>

        {/* Global form errors recall if there are any errors in preceding steps */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs space-y-1 border border-red-100">
            <p className="font-bold flex items-center gap-1">
              <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Please address the following errors before submitting the application:
            </p>
            <ul className="list-disc pl-5 font-semibold space-y-0.5">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
