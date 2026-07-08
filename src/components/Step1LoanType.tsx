import React, { useState } from "react";
import { FormState, LoanType } from "../types";
import { formatINR } from "../utils/validators";
import { Calculator } from "lucide-react";
import LoanCalculatorSidebar from "./LoanCalculatorSidebar";

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

  return (
    <div className="space-y-6" id="step1-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Loan Product &amp; Amount</h2>
          <p className="text-sm text-slate-500">Select your loan type, requested amount, and desired tenure.</p>
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
            {showCalculator ? "Hide Calculator Sandbox" : "Show Calculator Sandbox"}
          </button>
        </div>
      </div>

      <div className={showCalculator ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "space-y-6"}>
        <div className={showCalculator ? "lg:col-span-7 space-y-6" : "space-y-6"}>
          {/* Loan Type Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Loan Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Select loan type">
          {(["Personal", "Home", "Business"] as LoanType[]).map((type) => {
            const isSelected = loanType === type;
            const desc =
              type === "Personal"
                ? "Up to ₹10 Lakhs (12-60 months)"
                : type === "Home"
                ? "Up to ₹1 Crore (60-360 months)"
                : "Up to ₹50 Lakhs (12-120 months)";
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
                  {type} Loan
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
            Requested Loan Amount *
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
          Loan Tenure (Months) *
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
          <option value="" disabled>Select Tenure</option>
          {tenureOptions.map((months) => (
            <option key={months} value={months}>
              {months} months ({months / 12} {months / 12 === 1 ? "year" : "years"})
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
          Purpose of Loan *
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
          <option value="" disabled>Select Purpose</option>
          {purposeOptions.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose}
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
            Referral Code (Optional)
          </label>
          <span className="text-xs text-slate-400">6-10 alphanumeric characters</span>
        </div>
        <input
          type="text"
          id="referralCode"
          name="referralCode"
          value={referralCode}
          onChange={(e) => updateFormState({ referralCode: e.target.value.toUpperCase() })}
          onBlur={() => registerBlur("referralCode")}
          placeholder="e.g. LEND100"
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
