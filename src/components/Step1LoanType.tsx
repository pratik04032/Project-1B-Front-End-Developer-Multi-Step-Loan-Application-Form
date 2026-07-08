import React, { useState } from "react";
import { FormState, LoanType } from "../types";
import { formatINR } from "../utils/validators";
import { Calculator } from "lucide-react";
import LoanCalculatorSidebar from "./LoanCalculatorSidebar";
import { useLanguage } from "../context/LanguageContext";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

export default function Step1LoanType({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const { t, language } = useLanguage();
  const { loanType, loanAmount, loanTenure, loanPurpose, referralCode } = formState;
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSyncToApp = (amount: number, tenure: number, type: LoanType) => {
    let defaultPurpose = "";
    if (type === "Home") {
      defaultPurpose = "New Home Purchase";
    } else if (type === "Personal") {
      defaultPurpose = "Medical Emergency";
    } else if (type === "Business") {
      defaultPurpose = "Working Capital";
    }

    const empUpdate = type === "Business" && formState.employmentType === "Salaried" ? { employmentType: "" as any } : {};

    updateFormState({
      loanType: type,
      loanAmount: amount,
      loanTenure: tenure,
      loanPurpose: defaultPurpose,
      ...empUpdate
    });
  };

  const handleLoanTypeChange = (type: LoanType) => {
    // Reset tenure & purpose when loan type changes to comply with constraints
    let defaultTenure = 24;
    let defaultPurpose = "";
    if (type === "Home") {
      defaultTenure = 120;
      defaultPurpose = "New Home Purchase";
    } else if (type === "Personal") {
      defaultTenure = 24;
      defaultPurpose = "Medical Emergency";
    } else if (type === "Business") {
      defaultTenure = 36;
      defaultPurpose = "Working Capital";
    }

    // Business Loan requires Business Owner or Self-Employed. Let's make sure we reset employmentType if it is Salaried
    const empUpdate = type === "Business" && formState.employmentType === "Salaried" ? { employmentType: "" as any } : {};

    updateFormState({
      loanType: type,
      loanTenure: defaultTenure,
      loanPurpose: defaultPurpose,
      ...empUpdate
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, "")) || 0;
    updateFormState({ loanAmount: val });
  };

  // Dynamic limits
  const minAmount = 50000;
  const maxAmount =
    loanType === "Personal" ? 1000000 : loanType === "Home" ? 10000000 : 5000000;

  // Dynamic tenure ranges
  const tenureOptions: number[] = [];
  if (loanType === "Personal") {
    for (let m = 12; m <= 60; m += 12) tenureOptions.push(m);
  } else if (loanType === "Home") {
    for (let m = 60; m <= 360; m += 60) tenureOptions.push(m);
  } else if (loanType === "Business") {
    for (let m = 12; m <= 120; m += 12) tenureOptions.push(m);
  }

  // Dynamic purpose options
  const purposeOptions =
    loanType === "Personal"
      ? ["Medical Emergency", "Wedding Expense", "Education", "Home Renovation", "Travel", "Debt Consolidation"]
      : loanType === "Home"
      ? ["New Home Purchase", "Plot Purchase", "Home Construction", "Home Extension"]
      : ["Working Capital", "Equipment Purchase", "Business Expansion", "Inventory Buying"];

  const formatTenureLabel = (months: number) => {
    if (language === "hi") {
      return `${months} महीने (${months / 12} ${months / 12 === 1 ? "वर्ष" : "वर्ष"})`;
    }
    if (language === "or") {
      return `${months} ମାସ (${months / 12} ${months / 12 === 1 ? "ବର୍ଷ" : "ବର୍ଷ"})`;
    }
    return `${months} months (${months / 12} ${months / 12 === 1 ? "year" : "years"})`;
  };

  const translatePurpose = (purpose: string) => {
    const map: Record<string, Record<string, string>> = {
      "Medical Emergency": { hi: "चिकित्सा आपातकाल", or: "ଡାକ୍ତରୀ ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତି" },
      "Wedding Expense": { hi: "शादी का खर्च", or: "ବିବାହ ଖର୍ଚ୍ଚ" },
      "Education": { hi: "शिक्षा", or: "ଶିକ୍ଷା" },
      "Home Renovation": { hi: "घर का नवीनीकरण", or: "ଘର ମରାମତି / ନବୀକରଣ" },
      "Travel": { hi: "यात्रा", or: "ଯାତ୍ରା" },
      "Debt Consolidation": { hi: "ऋण समेकन", or: "ଋଣ ପରିଶୋଧ / ସମନ୍ୱୟ" },
      "New Home Purchase": { hi: "नया घर खरीदना", or: "ନୂଆ ଘର କିଣିବା" },
      "Plot Purchase": { hi: "प्लॉट खरीदना", or: "ଜମି କିଣିବା" },
      "Home Construction": { hi: "घर का निर्माण", or: "ଘର ତୋଳିବା / ନିର୍ମାଣ" },
      "Home Extension": { hi: "घर का विस्तार", or: "ଘର ସମ୍ପ୍ରସାରଣ" },
      "Working Capital": { hi: "कार्यशील पूंजी", or: "କାର୍ଯ୍ୟକାରୀ ପୁଞ୍ଜି" },
      "Equipment Purchase": { hi: "उपकरण खरीद", or: "ଯନ୍ତ୍ରପାତି କିଣିବା" },
      "Business Expansion": { hi: "व्यवसाय विस्तार", or: "ବ୍ୟବସାୟ ସମ୍ପ୍ରସାରଣ" },
      "Inventory Buying": { hi: "इन्वेंटरी खरीदना", or: "ମାଲ୍ / ସାମଗ୍ରୀ କିଣିବା" }
    };
    return map[purpose]?.[language] || purpose;
  };

  return (
    <div className="space-y-6" id="step1-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("step1Title")}</h2>
          <p className="text-sm text-slate-500">{t("step1Desc")}</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
              showCalculator
                ? "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            {showCalculator ? t("calcHeader") : t("calcHeader")}
          </button>
        </div>
      </div>

      <div className={showCalculator ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "space-y-6"}>
        <div className={showCalculator ? "lg:col-span-7 space-y-6" : "space-y-6"}>
          {/* Loan Type Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">{t("loanType")} *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Select loan type">
          {(["Personal", "Home", "Business"] as LoanType[]).map((type) => {
            const isSelected = loanType === type;
            const desc =
              type === "Personal"
                ? (language === "hi" ? "₹10 लाख तक (12-60 महीने)" : language === "or" ? "₹୧୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ (୧୨-୬୦ ମାସ)" : "Up to ₹10 Lakhs (12-60 months)")
                : type === "Home"
                ? (language === "hi" ? "₹1 करोड़ तक (60-360 महीने)" : language === "or" ? "₹୧ କୋଟି ପର୍ଯ୍ୟନ୍ତ (୬୦-୩୬୦ ମାସ)" : "Up to ₹1 Crore (60-360 months)")
                : (language === "hi" ? "₹50 लाख तक (12-120 महीने)" : language === "or" ? "₹୫୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ (୧୨-୧୨୦ ମାସ)" : "Up to ₹50 Lakhs (12-120 months)");
            return (
              <button
                key={type}
                type="button"
                id={`loan-type-${type.toLowerCase()}`}
                onClick={() => handleLoanTypeChange(type)}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                role="radio"
                aria-checked={isSelected}
              >
                <span className={`text-base font-semibold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                  {t(type)}
                </span>
                <span className="text-xs text-slate-500 mt-1">{desc}</span>
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loan Amount Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="loanAmount" className="text-sm font-medium text-slate-700">
            {t("loanAmount")} *
          </label>
          <span className="text-xs text-slate-500">
            Min: {formatINR(minAmount)} | Max: {formatINR(maxAmount)}
          </span>
        </div>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-500 font-medium">₹</span>
          </div>
          <input
            type="text"
            id="loanAmount"
            name="loanAmount"
            value={loanAmount ? loanAmount.toLocaleString("en-IN") : ""}
            onChange={handleAmountChange}
            onBlur={() => registerBlur("loanAmount")}
            placeholder="e.g. 5,00,000"
            className={`block w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.loanAmount ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.loanAmount ? "true" : "false"}
            aria-describedby={errors.loanAmount ? "loanAmount-error" : undefined}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-xs text-slate-400 font-mono">INR</span>
          </div>
        </div>
        {errors.loanAmount && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="loanAmount-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.loanAmount}
          </p>
        )}
      </div>

      {/* Loan Tenure Dropdown */}
      <div className="space-y-2">
        <label htmlFor="loanTenure" className="block text-sm font-medium text-slate-700">
          {t("loanTenure")} *
        </label>
        <select
          id="loanTenure"
          name="loanTenure"
          value={loanTenure || ""}
          onChange={(e) => updateFormState({ loanTenure: parseInt(e.target.value) || 0 })}
          onBlur={() => registerBlur("loanTenure")}
          className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.loanTenure ? "border-red-500" : "border-slate-200 hover:border-slate-300"
          }`}
          aria-invalid={errors.loanTenure ? "true" : "false"}
          aria-describedby={errors.loanTenure ? "loanTenure-error" : undefined}
        >
          <option value="" disabled>{language === "hi" ? "अवधि चुनें" : language === "or" ? "ଅବଧି ଚୟନ କରନ୍ତୁ" : "Select Tenure"}</option>
          {tenureOptions.map((months) => (
            <option key={months} value={months}>
              {formatTenureLabel(months)}
            </option>
          ))}
        </select>
        {errors.loanTenure && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="loanTenure-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.loanTenure}
          </p>
        )}
      </div>

      {/* Loan Purpose Dropdown */}
      <div className="space-y-2">
        <label htmlFor="loanPurpose" className="block text-sm font-medium text-slate-700">
          {t("loanPurpose")} *
        </label>
        <select
          id="loanPurpose"
          name="loanPurpose"
          value={loanPurpose}
          onChange={(e) => updateFormState({ loanPurpose: e.target.value })}
          onBlur={() => registerBlur("loanPurpose")}
          className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.loanPurpose ? "border-red-500" : "border-slate-200 hover:border-slate-300"
          }`}
          aria-invalid={errors.loanPurpose ? "true" : "false"}
          aria-describedby={errors.loanPurpose ? "loanPurpose-error" : undefined}
        >
          <option value="" disabled>{language === "hi" ? "उद्देश्य चुनें" : language === "or" ? "ଉଦ୍ଦେଶ୍ୟ ଚୟନ କରନ୍ତୁ" : "Select Purpose"}</option>
          {purposeOptions.map((purpose) => (
            <option key={purpose} value={purpose}>
              {translatePurpose(purpose)}
            </option>
          ))}
        </select>
        {errors.loanPurpose && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="loanPurpose-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.loanPurpose}
          </p>
        )}
      </div>

      {/* Referral Code */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="referralCode" className="text-sm font-medium text-slate-700">
            {t("referralCode")}
          </label>
          <span className="text-xs text-slate-400">
            {language === "hi" ? "6-10 अल्फ़ान्यूमेरिक वर्ण" : language === "or" ? "୬-୧୦ ଅକ୍ଷର କିମ୍ବା ସଂଖ୍ୟା" : "6-10 alphanumeric characters"}
          </span>
        </div>
        <input
          type="text"
          id="referralCode"
          name="referralCode"
          value={referralCode}
          onChange={(e) => updateFormState({ referralCode: e.target.value.toUpperCase() })}
          onBlur={() => registerBlur("referralCode")}
          placeholder={language === "hi" ? "जैसे: LEND100" : language === "or" ? "ଉଦାହରଣ: LEND100" : "e.g. LEND100"}
          className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.referralCode ? "border-red-500" : "border-slate-200 hover:border-slate-300"
          }`}
          maxLength={10}
          aria-invalid={errors.referralCode ? "true" : "false"}
          aria-describedby={errors.referralCode ? "referralCode-error" : undefined}
        />
        {errors.referralCode && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="referralCode-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.referralCode}
          </p>
        )}
      </div>
      </div>

      {showCalculator && (
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <LoanCalculatorSidebar
            currentLoanType={loanType}
            appAmount={loanAmount}
            appTenure={loanTenure}
            onSyncToApp={handleSyncToApp}
          />
        </div>
      )}
      </div>
    </div>
  );
}
