import React, { useState } from "react";
import { FormState, EmploymentType } from "../types";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

// Sample companies list for Autocomplete
const MOCK_COMPANIES = [
  "Tata Consultancy Services (TCS)",
  "Infosys Limited",
  "Wipro Limited",
  "Reliance Industries",
  "HDFC Bank Limited",
  "ICICI Bank Limited",
  "State Bank of India (SBI)",
  "Larsen & Toubro (L&T)",
  "HCL Technologies",
  "Tech Mahindra",
  "Google India Private Limited",
  "Microsoft India",
  "Amazon Development Centre India",
  "Cognizant Technology Solutions",
  "Accenture Solutions Private Limited"
];

export default function Step5Employment({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const {
    loanType,
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
    panNumber
  } = formState;

  // Autocomplete local states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFormState({ companyName: val });

    if (val.trim().length > 1) {
      const filtered = MOCK_COMPANIES.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (company: string) => {
    updateFormState({ companyName: company });
    setShowSuggestions(false);
  };

  const handleEmploymentTypeChange = (type: EmploymentType) => {
    // Basic clearing of opposite fields to prevent stale PII and conform to B4.4 / E3.1
    if (type === "Salaried") {
      updateFormState({
        employmentType: type,
        businessName: "",
        businessType: "",
        annualTurnover: 0,
        yearsInBusiness: 0,
        monthlyIncome: 0,
        gstNumber: "",
        officeAddress: ""
      });
    } else {
      updateFormState({
        employmentType: type,
        companyName: "",
        designation: "",
        monthlyNetSalary: 0,
        yearsOfExperience: 0
      });
    }
  };

  return (
    <div className="space-y-6" id="step5-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employment &amp; Income Details</h2>
        <p className="text-sm text-slate-500">Provide details about your occupation, employer, and monthly cash flows.</p>
      </div>

      {/* Employment Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Employment Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Select employment type">
          {["Salaried", "Self-Employed", "Business Owner"].map((type) => {
            // Business Loan requires Business Owner or Self-Employed (Salaried is disabled or errors)
            const isBusinessLoan = loanType === "Business";
            const isDisabled = isBusinessLoan && type === "Salaried";
            const isSelected = employmentType === type;

            return (
              <button
                key={type}
                type="button"
                id={`employment-type-${type.replace(" ", "-").toLowerCase()}`}
                disabled={isDisabled}
                onClick={() => handleEmploymentTypeChange(type as EmploymentType)}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDisabled ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-200" : "cursor-pointer"
                } ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : isDisabled
                    ? "border-slate-200 text-slate-400"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                role="radio"
                aria-checked={isSelected}
              >
                <span className={`text-base font-semibold ${isSelected ? "text-blue-700" : isDisabled ? "text-slate-400" : "text-slate-800"}`}>
                  {type}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {type === "Salaried"
                    ? "Monthly fixed salary slip"
                    : type === "Self-Employed"
                    ? "Freelancers, independent professionals"
                    : "Registered firm owners, partners"}
                </span>
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.employmentType && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.employmentType}
          </p>
        )}
      </div>

      {/* SALARIED SUB-FORM */}
      {employmentType === "Salaried" && (
        <div className="space-y-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Salary Details</h3>

          {/* Company Name with Autocomplete */}
          <div className="space-y-2 relative">
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
              Employer/Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={handleCompanyChange}
              onBlur={() => {
                registerBlur("companyName");
                // Delay hiding suggestions so click event registers first
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onFocus={() => {
                if (companyName.trim().length > 1) setShowSuggestions(true);
              }}
              placeholder="Start typing your company name..."
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
              autoComplete="off"
            />
            {/* Autocomplete suggestions box */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-800 font-medium transition-all"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.companyName && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.companyName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Designation */}
            <div className="space-y-2">
              <label htmlFor="designation" className="block text-sm font-medium text-slate-700">
                Job Title / Designation *
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={designation}
                onChange={(e) => updateFormState({ designation: e.target.value })}
                onBlur={() => registerBlur("designation")}
                placeholder="e.g. Senior Software Engineer"
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.designation ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.designation && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Net Salary */}
            <div className="space-y-2">
              <label htmlFor="monthlyNetSalary" className="block text-sm font-medium text-slate-700">
                Monthly Net In-Hand Salary (₹) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">₹</span>
                </div>
                <input
                  type="number"
                  id="monthlyNetSalary"
                  name="monthlyNetSalary"
                  value={monthlyNetSalary || ""}
                  onChange={(e) => updateFormState({ monthlyNetSalary: parseInt(e.target.value) || 0 })}
                  onBlur={() => registerBlur("monthlyNetSalary")}
                  placeholder="Min: 15,000"
                  className={`block w-full pl-8 pr-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.monthlyNetSalary ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.monthlyNetSalary && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.monthlyNetSalary}
                </p>
              )}
            </div>
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700">
              Total Work Experience (Years) *
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={yearsOfExperience !== undefined ? yearsOfExperience : ""}
              onChange={(e) => updateFormState({ yearsOfExperience: parseInt(e.target.value) || 0 })}
              onBlur={() => registerBlur("yearsOfExperience")}
              placeholder="e.g. 5"
              min={0}
              max={50}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsOfExperience ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.yearsOfExperience && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.yearsOfExperience}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SELF-EMPLOYED OR BUSINESS OWNER SUB-FORM */}
      {(employmentType === "Self-Employed" || employmentType === "Business Owner") && (
        <div className="space-y-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Business Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700">
                Registered Business/Company Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessName}
                onChange={(e) => updateFormState({ businessName: e.target.value })}
                onBlur={() => registerBlur("businessName")}
                placeholder="e.g. Jena Technologies Private Limited"
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.businessName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.businessName && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <label htmlFor="businessType" className="block text-sm font-medium text-slate-700">
                Business Legal Entity Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={businessType}
                onChange={(e) => updateFormState({ businessType: e.target.value })}
                onBlur={() => registerBlur("businessType")}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.businessType ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <option value="" disabled>Select Business Type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
                <option value="Unregistered">Unregistered / Independent Professional</option>
              </select>
              {errors.businessType && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.businessType}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Annual Turnover */}
            <div className="space-y-2">
              <label htmlFor="annualTurnover" className="block text-sm font-medium text-slate-700">
                Annual Turnover (Gross ₹) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">₹</span>
                </div>
                <input
                  type="number"
                  id="annualTurnover"
                  name="annualTurnover"
                  value={annualTurnover || ""}
                  onChange={(e) => updateFormState({ annualTurnover: parseInt(e.target.value) || 0 })}
                  onBlur={() => registerBlur("annualTurnover")}
                  placeholder="Min: 3,00,000"
                  className={`block w-full pl-8 pr-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.annualTurnover ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.annualTurnover && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.annualTurnover}
                </p>
              )}
            </div>

            {/* Years in Business */}
            <div className="space-y-2">
              <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-slate-700">
                Years in Business *
              </label>
              <input
                type="number"
                id="yearsInBusiness"
                name="yearsInBusiness"
                value={yearsInBusiness || ""}
                onChange={(e) => updateFormState({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                onBlur={() => registerBlur("yearsInBusiness")}
                placeholder="Min: 2 years"
                min={0}
                className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.yearsInBusiness ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.yearsInBusiness && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.yearsInBusiness}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Net Income */}
            <div className="space-y-2">
              <label htmlFor="monthlyIncome" className="block text-sm font-medium text-slate-700">
                Average Net Monthly Income (₹) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">₹</span>
                </div>
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={monthlyIncome || ""}
                  onChange={(e) => updateFormState({ monthlyIncome: parseInt(e.target.value) || 0 })}
                  onBlur={() => registerBlur("monthlyIncome")}
                  placeholder="e.g. 50000"
                  className={`block w-full pl-8 pr-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.monthlyIncome ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.monthlyIncome && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors.monthlyIncome}
                </p>
              )}
            </div>

            {/* GST Number (Required if Business Owner and Business Loan) */}
            {employmentType === "Business Owner" && loanType === "Business" ? (
              <div className="space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-slate-700">
                    GSTIN (15-character ID) *
                  </label>
                  {panNumber && <span className="text-[10px] text-slate-400">Must include PAN: {panNumber}</span>}
                </div>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={gstNumber}
                  onChange={(e) => updateFormState({ gstNumber: e.target.value.toUpperCase().trim() })}
                  onBlur={() => registerBlur("gstNumber")}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  maxLength={15}
                  className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider ${
                    errors.gstNumber ? "border-red-500" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                {errors.gstNumber && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="gstNumber-error" role="alert" aria-live="polite">
                    <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                    {errors.gstNumber}
                  </p>
                )}
              </div>
            ) : (
              /* GST Optional Field if not mandatory */
              <div className="space-y-2">
                <label htmlFor="gstNumber" className="block text-sm font-medium text-slate-700">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={gstNumber}
                  onChange={(e) => updateFormState({ gstNumber: e.target.value.toUpperCase().trim() })}
                  onBlur={() => registerBlur("gstNumber")}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  maxLength={15}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                />
              </div>
            )}
          </div>

          {/* Office Address */}
          <div className="space-y-2">
            <label htmlFor="officeAddress" className="block text-sm font-medium text-slate-700">
              Office/Business Address *
            </label>
            <textarea
              id="officeAddress"
              name="officeAddress"
              value={officeAddress}
              onChange={(e) => updateFormState({ officeAddress: e.target.value })}
              onBlur={() => registerBlur("officeAddress")}
              placeholder="Provide complete business address including city, state and PIN code."
              rows={3}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.officeAddress ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {errors.officeAddress && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.officeAddress}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
