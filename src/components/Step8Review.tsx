import React, { useState } from "react";
import { FormState } from "../types";
import { isStep6Active } from "../utils/stepValidators";
import { calculateEMI, formatINR } from "../utils/validators";
import { useLanguage } from "../context/LanguageContext";

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
  const { t, language } = useLanguage();
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === "hi" ? "समीक्षा और पूर्व-स्वीकृति सारांश" : language === "or" ? "ସମୀକ୍ଷା ଏବଂ ପୂର୍ବ-ସ୍ୱୀକୃତି ସାରାଂଶ" : "Review & Pre-Approval Summary"}
        </h2>
        <p className="text-sm text-slate-500">
          {language === "hi" ? "अंतिम सबमिशन से पहले अपने ऋण आवेदन विवरण की व्यापक जांच करें।" : language === "or" ? "ଅନ୍ତିମ ସବମିଶନ୍ ପୂର୍ବରୁ ଆପଣଙ୍କର ଋଣ ଆବେଦନ ବିବରଣୀର ଏକ ବିସ୍ତୃତ ଯାଞ୍ଚ କରନ୍ତୁ।" : "Perform a comprehensive check of your loan application details before final submission."}
        </p>
      </div>

      {/* PRE-APPROVAL FINANCIAL SUMMARY CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {language === "hi" ? "पूर्व-स्वीकृत प्रस्ताव" : language === "or" ? "ପୂର୍ବ-ସ୍ୱୀକୃତ ଅଫର୍" : "Pre-Approved Offer"}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-2">
              {loanType} {language === "hi" ? "ऋण पैकेज" : language === "or" ? "ଋଣ ପ୍ୟାକେଜ୍" : "Loan Package"}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              {language === "hi" ? "सांकेतिक ब्याज दर" : language === "or" ? "ସାଙ୍କେତିକ ସୁଧ ହାର" : "Indicative Interest Rate"}
            </span>
            <span className="text-2xl font-bold text-slate-100">
              {rate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">{language === "hi" ? "वार्षिक" : language === "or" ? "ବାର୍ଷିକ" : "p.a."}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
          <div>
            <span className="text-xs text-slate-400 block">
              {language === "hi" ? "मूल राशि" : language === "or" ? "ମୂଳ ପରିମାଣ" : "Principal Amount"}
            </span>
            <span className="text-lg font-bold text-slate-100">{formatINR(loanAmount)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">
              {language === "hi" ? "अनुरोधित अवधि" : language === "or" ? "ଅନୁରୋଧିତ ଅବଧି" : "Requested Tenure"}
            </span>
            <span className="text-lg font-bold text-slate-100">
              {loanTenure} {language === "hi" ? "महीने" : language === "or" ? "ମାସ" : "Months"}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">
              {language === "hi" ? "अनुमानित ईएमआई" : language === "or" ? "ଆନୁମାନିକ EMI" : "Estimated EMI"}
            </span>
            <span className="text-xl font-black text-emerald-400">
              {formatINR(financialResult.emi)}
              <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                {language === "hi" ? "प्रति माह" : language === "or" ? "ପ୍ରତି ମାସ" : "/ month"}
              </span>
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">
              {language === "hi" ? "कुल ब्याज" : language === "or" ? "ମୋଟ ସୁଧ" : "Total Interest"}
            </span>
            <span className="text-lg font-bold text-slate-100">{formatINR(financialResult.totalInterest)}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400">
              {language === "hi" ? "प्रसंस्करण शुल्क:" : language === "or" ? "ପ୍ରକ୍ରିୟାକରଣ ଶୁଳ୍କ:" : "Processing Fee:"}
            </span>{" "}
            <span className="font-semibold text-slate-100">{formatINR(financialResult.processingFee)}</span>{" "}
            <span className="text-[10px] text-slate-400">
              {language === "hi" ? "(ऋण राशि का 1%)" : language === "or" ? "(ଋଣ ପରିମାଣର ୧%)" : "(1% of loan amount)"}
            </span>
          </div>
          <div>
            <span className="text-slate-400">
              {language === "hi" ? "कुल ऋण लागत:" : language === "or" ? "ମୋଟ ଋଣ ଖର୍ଚ୍ଚ:" : "Total Borrowing Cost:"}
            </span>{" "}
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
              <span className="font-bold text-amber-300 block">
                {language === "hi" ? "उच्च ईएमआई-टू-आय अनुपात चेतावनी" : language === "or" ? "ଉଚ୍ଚ EMI-ରୁ-ଆୟ ଅନୁପାତ ଚେତାବନୀ" : "High EMI-to-Income Ratio Alert"} ({Math.round(emiToIncomePercentage)}%)
              </span>
              <p className="leading-relaxed">
                {language === "hi" 
                  ? `आपकी अनुमानित ईएमआई आपकी कुल शुद्ध मासिक आय (${formatINR(totalNetMonthlyIncome)}) के 50% से अधिक है। ऋण मानकों के तहत, यह एक जोखिम है। जमा करने के लिए एक अतिरिक्त स्पष्ट पावती आवश्यक है।` 
                  : language === "or" 
                  ? `ଆପଣଙ୍କର ଆନୁମାନିକ EMI ଆପଣଙ୍କର ମୋଟ ନିଟ୍ ମାସିକ ଆୟ (${formatINR(totalNetMonthlyIncome)}) ର ୫୦% ରୁ ଅଧିକ ଅଟେ। ଋଣ ମାନକ ଅନୁଯାୟୀ, ଏହା ଏକ ବିପଦ। ସବମିଟ୍ କରିବା ପାଇଁ ଏକ ଅତିରିକ୍ତ ସ୍ପଷ୍ଟ ସ୍ୱୀକୃତି ଆବଶ୍ୟକ।` 
                  : `Your estimated EMI exceeds 50% of your total net monthly income (${formatINR(totalNetMonthlyIncome)}). Under lending standards, this is a risk. An additional explicit acknowledgment is required to submit.`}
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
                  {language === "hi" 
                    ? "मैं उच्च ऋण-से-आय अनुपात को स्वीकार करता हूँ और चुकाने की अपनी क्षमता की पुष्टि करता हूँ।" 
                    : language === "or" 
                    ? "ମୁଁ ଉଚ୍ଚ ଋଣ-ରୁ-ଆୟ ଅନୁପାତକୁ ସ୍ୱୀକାର କରୁଛି ଏବଂ ପରିଶୋଧ କରିବାକୁ ମୋର କ୍ଷମତା ନିଶ୍ଚିତ କରୁଛି।" 
                    : "I acknowledge the high debt-to-income ratio and confirm my capacity to repay."}
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
              {language === "hi" ? "ऋण अनुरोध बुनियादी जानकारी" : language === "or" ? "ଋଣ ଅନୁରୋଧ ମୌଳିକ ସୂଚନା" : "Loan Request Basic Info"}
            </h4>
            <button
              type="button"
              id="edit-step-1"
              onClick={() => jumpToStep(1)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "ऋण उत्पाद" : language === "or" ? "ଋଣ ଉତ୍ପାଦ" : "Loan Product"}
              </span>
              <span className="font-semibold text-slate-800">
                {loanType} {language === "hi" ? "ऋण" : language === "or" ? "ଋଣ" : "Loan"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "अनुरोधित राशि" : language === "or" ? "ଅନୁରୋଧିତ ପରିମାଣ" : "Requested Amount"}
              </span>
              <span className="font-semibold text-slate-800">{formatINR(loanAmount)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "वांछित अवधि" : language === "or" ? "ଆବଶ୍ୟକ ଅବଧି" : "Desired Tenure"}
              </span>
              <span className="font-semibold text-slate-800">
                {loanTenure} {language === "hi" ? "महीने" : language === "or" ? "ମାସ" : "Months"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "ऋण का उद्देश्य" : language === "or" ? "ଋଣର ଉଦ୍ଦେଶ୍ୟ" : "Purpose of Loan"}
              </span>
              <span className="font-semibold text-slate-800">{loanPurpose}</span>
            </div>
            {referralCode && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "रेफ़रल/अभियान कोड" : language === "or" ? "ରେଫରାଲ୍/ଅଭିଯାନ କୋଡ୍" : "Referral/Campaign Code"}
                </span>
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
              {language === "hi" ? "व्यक्तिगत जानकारी" : language === "or" ? "ବ୍ୟଗତିଗତ ସୂଚନା" : "Personal Information"}
            </h4>
            <button
              type="button"
              id="edit-step-2"
              onClick={() => jumpToStep(2)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "पूरा नाम (पैन नाम)" : language === "or" ? "ସମ୍ପୂର୍ଣ୍ଣ ନାମ (PAN ନାମ)" : "Full Name (PAN Name)"}
              </span>
              <span className="font-semibold text-slate-800 uppercase">{fullName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "जन्म तिथि" : language === "or" ? "ଜନ୍ମ ତାରିଖ" : "Date of Birth"}
              </span>
              <span className="font-semibold text-slate-800">{dob}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "लिंग / वैवाहिक स्थिति" : language === "or" ? "ଲିଙ୍ଗ / ବୈବାହିକ ସ୍ଥିତି" : "Gender / Marital Status"}
              </span>
              <span className="font-semibold text-slate-800">{gender} / {maritalStatus}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "माता-पिता के नाम" : language === "or" ? "ପିତାମାତାଙ୍କ ନାମ" : "Parents Names"}
              </span>
              <span className="font-semibold text-slate-800">F: {fathersName} | M: {mothersName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "ईमेल पता" : language === "or" ? "ଇମେଲ୍ ଠିକଣା" : "Email Address"}
              </span>
              <span className="font-semibold text-slate-800">{email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "सत्यापित मोबाइल नंबर" : language === "or" ? "ସତ୍ୟାପିତ ମୋବାଇଲ୍ ନମ୍ବର" : "Verified Mobile Number"}
              </span>
              <span className="font-semibold text-slate-800">+91 {mobileNumber}</span>
            </div>
            {alternateMobile && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "वैकल्पिक मोबाइल" : language === "or" ? "ବୈକଳ୍ପିକ ମୋବାଇଲ୍" : "Alternate Mobile"}
                </span>
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
              {language === "hi" ? "पहचान सत्यापन (केवाईसी)" : language === "or" ? "ପରିଚୟ ସତ୍ୟାପନ (KYC)" : "Identity Verification (KYC)"}
            </h4>
            <button
              type="button"
              id="edit-step-3"
              onClick={() => jumpToStep(3)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "पैन कार्ड स्थिति" : language === "or" ? "PAN କାର୍ଡ ସ୍ଥିତି" : "PAN Card Status"}
              </span>
              <span className="font-mono font-bold text-slate-800">{panNumber.substring(0, 6)}••••</span>
              {panVerified && <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-2">{language === "hi" ? "सत्यापित" : language === "or" ? "ସତ୍ୟାପିତ" : "Verified"}</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "आधार कार्ड स्थिति" : language === "or" ? "ଆଧାର କାର୍ଡ ସ୍ଥିତି" : "Aadhaar Card Status"}
              </span>
              <span className="font-mono font-bold text-slate-800">••••••••{aadhaarNumber.substring(8)}</span>
              {aadhaarVerified && <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-2">{language === "hi" ? "सत्यापित" : language === "or" ? "ସତ୍ୟାପିତ" : "Verified"}</span>}
            </div>
            {voterId && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "मतदाता पहचान पत्र" : language === "or" ? "ଭୋଟର ID" : "Voter ID"}
                </span>
                <span className="font-mono font-semibold text-slate-800 uppercase">{voterId}</span>
              </div>
            )}
            {passport && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "पासपोर्ट" : language === "or" ? "ପାସପୋର୍ଟ" : "Passport"}
                </span>
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
              {language === "hi" ? "पते की जानकारी" : language === "or" ? "ଠିକଣା ସୂଚନା" : "Address Information"}
            </h4>
            <button
              type="button"
              id="edit-step-4"
              onClick={() => jumpToStep(4)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "वर्तमान पता" : language === "or" ? "ବର୍ତ୍ତମାନର ଠିକଣା" : "Current Address"}
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {currentAddressLine1}, {currentAddressLine2 ? `${currentAddressLine2}, ` : ""}{currentCity}, {currentState} - {currentPinCode}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {language === "hi" ? "आवास" : language === "or" ? "ବାସସ୍ଥାନ" : "Residence"}: {residenceType} {residenceType === "Rented" && `(${language === "hi" ? "किराया" : language === "or" ? "ଭଡା" : "Rent"}: ${formatINR(rentAmount)})`} | {language === "hi" ? "वहाँ वर्ष" : language === "or" ? "ସେଠାରେ ବର୍ଷ" : "Years there"}: {yearsAtCurrentAddress}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {language === "hi" ? "स्थायी पता" : language === "or" ? "ସ୍ଥାୟୀ ଠିକଣା" : "Permanent Address"}
              </span>
              {sameAsPermanent ? (
                <p className="text-slate-500 italic mt-0.5">
                  {language === "hi" ? "वर्तमान पते के समान" : language === "or" ? "ବର୍ତ୍ତମାନର ଠିକଣା ସହ ସମାନ" : "Same as Current Address"}
                </p>
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
              {language === "hi" ? "रोजगार और आय विवरण" : language === "or" ? "ନିଯୁକ୍ତି ଏବଂ ଆୟ ବିବରଣୀ" : "Employment & Income Details"}
            </h4>
            <button
              type="button"
              id="edit-step-5"
              onClick={() => jumpToStep(5)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
            </button>
          </div>
          <div className="p-5 text-sm">
            {employmentType === "Salaried" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "रोजगार का प्रकार" : language === "or" ? "ନିଯୁକ୍ତି ପ୍ରକାର" : "Employment Type"}
                  </span>
                  <span className="font-semibold text-slate-800">{employmentType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "नियोक्ता / कंपनी" : language === "or" ? "ନିଯୁକ୍ତିଦାତା / କମ୍ପାନୀ" : "Employer / Company"}
                  </span>
                  <span className="font-semibold text-slate-800">{companyName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "पद / अनुभव" : language === "or" ? "ପଦବୀ / ଅନୁଭବ" : "Designation / Experience"}
                  </span>
                  <span className="font-semibold text-slate-800">{designation} ({yearsOfExperience} {language === "hi" ? "वर्ष" : language === "or" ? "ବର୍ଷ" : "Years"})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "मासिक हाथ में शुद्ध वेतन" : language === "or" ? "ମାସିକ ହାତରେ ନିଟ୍ ଦରମା" : "Monthly In-Hand Net Salary"}
                  </span>
                  <span className="font-semibold text-emerald-600">{formatINR(monthlyNetSalary)}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "रोजगार का प्रकार" : language === "or" ? "ନିଯୁକ୍ତି ପ୍ରକାର" : "Employment Type"}
                  </span>
                  <span className="font-semibold text-slate-800">{employmentType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "व्यवसाय का नाम और इकाई" : language === "or" ? "ବ୍ୟବସାୟର ନାମ ଏବଂ ସଂସ୍ଥା" : "Business Name & Entity"}
                  </span>
                  <span className="font-semibold text-slate-800">{businessName} ({businessType})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "वार्षिक सकल कारोबार / अनुभव" : language === "or" ? "ବାର୍ଷିକ ମୋଟ କାରବାର / ଅନୁଭବ" : "Annual Gross Turnover / Experience"}
                  </span>
                  <span className="font-semibold text-slate-800">{formatINR(annualTurnover)} ({yearsInBusiness} {language === "hi" ? "व्यवसाय में वर्ष" : language === "or" ? "ବ୍ୟବସାୟରେ ବର୍ଷ" : "Years in Business"})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "औसत शुद्ध मासिक आय" : language === "or" ? "ହାରାହାରି ନିଟ୍ ମାସିକ ଆୟ" : "Average Net Monthly Income"}
                  </span>
                  <span className="font-semibold text-emerald-600">{formatINR(monthlyIncome)}</span>
                </div>
                {gstNumber && (
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      {language === "hi" ? "जीएसटी नंबर" : language === "or" ? "GST ନମ୍ବର" : "GSTIN ID"}
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{gstNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {language === "hi" ? "व्यवसाय पंजीकृत पता" : language === "or" ? "ବ୍ୟବସାୟ ପଞ୍ଜୀକୃତ ଠିକଣା" : "Business Registered Address"}
                  </span>
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
                {language === "hi" ? "सह-आवेदक और गारंटर" : language === "or" ? "ସହ-ଆବେଦନକାରୀ ଏବଂ ଗାରେଣ୍ଟର" : "Co-Applicant & Guarantor"}
              </h4>
              <button
                type="button"
                id="edit-step-6"
                onClick={() => jumpToStep(6)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "सह-आवेदक का नाम" : language === "or" ? "ସହ-ଆବେଦନକାରୀଙ୍କ ନାମ" : "Co-applicant Name"}
                </span>
                <span className="font-semibold text-slate-800">{coApplicantName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "संबंध" : language === "or" ? "ସମ୍ପର୍କ" : "Relationship"}
                </span>
                <span className="font-semibold text-slate-800">{coApplicantRelationship}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "पैन नंबर (सत्यापित)" : language === "or" ? "PAN ନମ୍ବର (ସତ୍ୟାପିତ)" : "PAN ID (Verified)"}
                </span>
                <span className="font-mono font-semibold text-slate-800">{coApplicantPan}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "मासिक आय" : language === "or" ? "ମାସିକ ଆୟ" : "Monthly Income"}
                </span>
                <span className="font-semibold text-slate-800">{formatINR(coApplicantIncome)}</span>
              </div>
              {coApplicantSignature && (
                <div className="col-span-full border-t border-slate-100 pt-4 flex gap-4 items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      {language === "hi" ? "सह-आवेदक ई-हस्ताक्षर" : language === "or" ? "ସହ-ଆବେଦନକାରୀଙ୍କ ଇ-ଦସ୍ତଖତ" : "Co-Applicant E-Signature"}
                    </span>
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
              {language === "hi" ? "अपलोड किए गए दस्तावेज़ों की जाँच सूची" : language === "or" ? "ଅପଲୋଡ୍ ହୋଇଥିବା ଦସ୍ତାବେଜ ଯାଞ୍ଚ ତାଲିକା" : "Uploaded Documents Checklist"}
            </h4>
            <button
              type="button"
              id="edit-step-7"
              onClick={() => jumpToStep(7)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === "hi" ? "अनुभाग संपादित करें" : language === "or" ? "ବିଭାଗ ସଂଶୋଧନ କରନ୍ତୁ" : "Edit Section"}
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

              // Human-friendly label translations for keys
              const keyLabel = 
                docKey === "aadhaarFront" ? (language === "hi" ? "आधार कार्ड फ्रंट" : language === "or" ? "ଆଧାର କାର୍ଡ ସମ୍ମୁଖ" : "Aadhaar Front") :
                docKey === "aadhaarBack" ? (language === "hi" ? "आधार कार्ड बैक" : language === "or" ? "ଆଧାର କାର୍ଡ ପଛ" : "Aadhaar Back") :
                docKey === "panCardCopy" ? (language === "hi" ? "पैन कार्ड कॉपी" : language === "or" ? "PAN କାର୍ଡ କପି" : "PAN Card Copy") :
                docKey === "salarySlips" ? (language === "hi" ? "वेतन पर्ची (3 महीने)" : language === "or" ? "ଦରମା ସ୍ଲିପ୍ (୩ ମାସ)" : "Salary Slips (3 Mos)") :
                docKey === "bankStatements" ? (language === "hi" ? "बैंक विवरण (6 महीने)" : language === "or" ? "ବ୍ୟାଙ୍କ ଷ୍ଟେଟମେଣ୍ଟ (୬ ମାସ)" : "Bank Statements (6 Mos)") :
                docKey === "itr" ? (language === "hi" ? "आईटीआर रसीदें" : language === "or" ? "ITR ରସିଦ" : "ITR Acknowledgements") :
                docKey === "businessRegistration" ? (language === "hi" ? "व्यवसाय पंजीकरण प्रमाण पत्र" : language === "or" ? "ବ୍ୟବସାୟ ପଞ୍ଜୀକରଣ ପ୍ରମାଣପତ୍ର" : "Business Registration Certificate") :
                docKey === "gstReturns" ? (language === "hi" ? "जीएसटी रिटर्न दाखिल करना" : language === "or" ? "GST ରିଟର୍ଣ୍ଣ ଦାଖଲ" : "GST Returns Filing") :
                docKey === "propertyDocs" ? (language === "hi" ? "संपत्ति विलेख/सेल डीड" : language === "or" ? "ସମ୍ପତ୍ତି ଦଲିଲ" : "Property Deeds / Sale Deed") :
                docKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

              return (
                <div key={docKey} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    {isAdded ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="text-red-500 font-bold">✗</span>
                    )}
                    {keyLabel}
                  </span>
                  {isAdded ? (
                    <span className="text-xs font-semibold text-slate-500 font-mono max-w-[200px] truncate text-right" title={filesList.map((f) => f.name).join(", ")}>
                      {filesList.map((f) => f.name).join(", ")}
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded">
                      {language === "hi" ? "लापता फ़ाइल" : language === "or" ? "ଫାଇଲ୍ ନାହିଁ" : "Missing File"}
                    </span>
                  )}
                </div>
              );
            })}

            {applicantSignature && (
              <div className="border-t border-slate-100 pt-4 space-y-1.5">
                <span className="text-xs text-slate-400 block font-medium">
                  {language === "hi" ? "आवेदक ई-हस्ताक्षर समीक्षा" : language === "or" ? "ଆବେଦନକାରୀଙ୍କ ଇ-ଦସ୍ତଖତ ସମୀକ୍ଷା" : "Applicant E-Signature Review"}
                </span>
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
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {language === "hi" ? "अंतिम प्राधिकरण और घोषणाएं" : language === "or" ? "ଅନ୍ତିମ ପ୍ରାଧିକରଣ ଏବଂ ଘୋଷଣାନାମା" : "Final Authorization & Declarations"}
        </h3>
        
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
              {language === "hi" 
                ? "मैं इसके द्वारा पुष्टि और घोषणा करता/करती हूँ कि इस डिजिटल आवेदन पत्र में प्रदान की गई सभी जानकारी, मूल्य, नकदी प्रवाह और व्यक्तिगत/व्यावसायिक विवरण मेरी सर्वोत्तम जानकारी के अनुसार सटीक, प्रामाणिक और पूर्ण हैं। (1)" 
                : language === "or" 
                ? "ମୁଁ ଏତଦ୍ୱାରା ନିଶ୍ଚିତ ଏବଂ ଘୋଷଣା କରୁଛି ଯେ ଏହି ଡିଜିଟାଲ୍ ଆବେଦନ ଫର୍ମରେ ପ୍ରଦାନ କରାଯାଇଥିବା ସମସ୍ତ ସୂଚନା, ମୂଲ୍ୟ, ଏବଂ ବ୍ୟକ୍ତିଗତ/ବ୍ୟବସାୟିକ ବିବରଣୀ ମୋର ଜ୍ଞାନ ଅନୁଯାୟୀ ସଠିକ୍, ପ୍ରାମାଣିକ ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ ଅଟେ। (୧)" 
                : "I hereby confirm and declare that all the information, values, cash flows, and personal/business credentials provided in this digital application form are accurate, authentic, and complete to the best of my knowledge. (1)"}
            </label>
          </div>

          {/* Consent 2 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentCheckCreditScore"
              name="consentCheckCheck"
              checked={consentCheckCreditScore}
              onChange={(e) => updateFormState({ consentCheckCreditScore: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consentCheckCreditScore" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              {language === "hi" 
                ? "मैं इसके द्वारा लेंडस्विफ्ट और उसके वित्तीय भागीदारों/एनबीएफसी को सिबिल, इक्विफैक्स, एक्सपेरियन या सीआरआईएफ हाई मार्क के साथ सीधे मेरे आधिकारिक क्रेडिट विवरण, इतिहास और रिकॉर्ड की जांच करने के लिए अधिकृत करता/करती हूँ। (2)" 
                : language === "or" 
                ? "ମୁଁ ଏତଦ୍ୱାରା ଲେଣ୍ଡସ୍ୱିଫ୍ଟ ଏବଂ ଏହାର ଆର୍ଥିକ ଭାଗିଦାରୀ/NBFC ମାନଙ୍କୁ ସିଧାସଳଖ CIBIL, Equifax, Experian କିମ୍ବା CRIF High Mark ସହିତ ମୋର ସରକାରୀ କ୍ରେଡିଟ୍ ରିପୋର୍ଟ ଏବଂ ରେକର୍ଡ ଯାଞ୍ଚ କରିବାକୁ ଅଧିକାର ଦେଉଛି। (୨)" 
                : "I hereby authorize LendSwift and its financial partners/NBFCs to check my official credit reports, history, and records directly with CIBIL, Equifax, Experian, or CRIF High Mark. (2)"}
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
              {language === "hi" 
                ? "मैं लेंडस्विफ्ट की ऋण शर्तों, गोपनीयता नीतियों, मुख्य तथ्य विवरण (KFS) शर्तों और 72 घंटे के कूलिंग-ऑफ निकास नीतियों से सहमत हूँ।" 
                : language === "or" 
                ? "ମୁଁ ଲେଣ୍ଡସ୍ୱିଫ୍ଟ ଋଣ ସର୍ତ୍ତାବଳୀ, ଗୋପନୀୟତା ନୀତି, ଏବଂ ୭୨-ଘଣ୍ଟା କୁଲିଂ-ଅଫ୍ ନୀତି ସହିତ ସହମତ ଅଟେ।" 
                : "I agree to the LendSwift lending Terms and Conditions, Privacy Policies, Key Fact Statement (KFS) terms, and the 72-hour cooling-off exit policies."}{" "}
              <a href="#" className="text-blue-600 font-bold hover:underline" onClick={(e) => { e.preventDefault(); alert(language === "hi" ? "नकली डाउनलोड: लेंडस्विफ्ट ऋण नीति पीडीएफ समझौता खोल रहा है" : language === "or" ? "ମକ୍ ଡାଉନଲୋଡ୍: ଲେଣ୍ଡସ୍ୱିଫ୍ଟ ଋଣ ନୀତି PDF ଚୁକ୍ତିନାମା ଖୋଲୁଛି" : "MOCK DOWNLOAD: Opening LendSwift Lending Policy PDF Agreement"); }}>
                {language === "hi" ? "लेंडस्विफ्ट शर्तें पीडीएफ पढ़ें" : language === "or" ? "ଲେଣ୍ଡସ୍ୱିଫ୍ଟ ସର୍ତ୍ତାବଳୀ PDF ପଢନ୍ତୁ" : "Read LendSwift Terms PDF"}
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
              {language === "hi" 
                ? "मैं व्हाट्सएप, एसएमएस और ईमेल के माध्यम से इस आवेदन के संबंध में स्वचालित स्थिति अपडेट, रसीदें, संचार नोटिस और विपणन संदेश प्राप्त करने के लिए सहमति देता/देती हूँ। (4)" 
                : language === "or" 
                ? "ମୁଁ ହ୍ୱାଟ୍ସଆପ୍, SMS ଏବଂ ଇମେଲ୍ ମାଧ୍ୟମରେ ଏହି ଆବେଦନ ସମ୍ବନ୍ଧୀୟ ସ୍ୱୟଂଚାଳିତ ସ୍ଥିତି ଅପଡେଟ୍, ରସିଦ ଏବଂ ବିଜ୍ଞପ୍ତି ପାଇବାକୁ ସମ୍ମତି ଦେଉଛି। (୪)" 
                : "I consent to receive automatic status updates, receipts, communication notices, and marketing messages regarding this application via WhatsApp, SMS, and Email. (4)"}
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
              {language === "hi" ? "कृपया आवेदन जमा करने से पहले निम्नलिखित त्रुटियों को ठीक करें:" : language === "or" ? "ଦୟาକରି ଆବେଦନ ଦାଖଲ କରିବା ପୂର୍ବରୁ ନିମ୍ନଲିଖିତ ତ୍ରୁଟିଗୁଡ଼ିକୁ ସଂଶୋଧନ କରନ୍ତୁ:" : "Please address the following errors before submitting the application:"}
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
