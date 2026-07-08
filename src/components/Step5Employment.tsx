import React, { useState } from "react";
import { FormState, EmploymentType } from "../types";
import { useLanguage } from "../context/LanguageContext";

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
  const { t, language } = useLanguage();
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("step5Title")}</h2>
        <p className="text-sm text-slate-500">{t("step5Desc")}</p>
      </div>

      {/* Employment Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">{t("employmentType")} *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Select employment type">
          {["Salaried", "Self-Employed", "Business Owner"].map((type) => {
            // Business Loan requires Business Owner or Self-Employed (Salaried is disabled or errors)
            const isBusinessLoan = loanType === "Business";
            const isDisabled = isBusinessLoan && type === "Salaried";
            const isSelected = employmentType === type;

            const localizedTypeLabel = type === "Salaried" 
              ? t("Salaried") 
              : type === "Self-Employed" 
              ? t("Self-Employed") 
              : language === "hi" 
              ? "व्यवसाय स्वामी" 
              : language === "or" 
              ? "ବ୍ୟବସାୟ ମାଲିକ" 
              : "Business Owner";

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
                  {localizedTypeLabel}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {type === "Salaried"
                    ? (language === "hi" ? "मासिक निश्चित वेतन पर्ची" : language === "or" ? "ମାସିକ ନିର୍ଦ୍ଦିଷ୍ଟ ଦରମା ସ୍ଲିପ୍" : "Monthly fixed salary slip")
                    : type === "Self-Employed"
                    ? (language === "hi" ? "फ्रीलांसर, स्वतंत्र पेशेवर" : language === "or" ? "ଫ୍ରିଲାନ୍ସର, ସ୍ୱାଧୀନ ପେସାଦାର" : "Freelancers, independent professionals")
                    : (language === "hi" ? "पंजीकृत फर्म के मालिक, भागीदार" : language === "or" ? "ପଞ୍ଜୀକୃତ ଫର୍ମ ମାଲିକ, ଅଂଶୀଦାର" : "Registered firm owners, partners")}
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
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            {language === "hi" ? "वेतन विवरण" : language === "or" ? "ଦରମା ବିବରଣୀ" : "Salary Details"}
          </h3>

          {/* Company Name with Autocomplete */}
          <div className="space-y-2 relative">
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
              {language === "hi" ? "नियोक्ता / कंपनी का नाम *" : language === "or" ? "ନିଯୁକ୍ତିଦାତା / କମ୍ପାନୀ ନାମ *" : "Employer/Company Name *"}
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
              placeholder={language === "hi" ? "अपनी कंपनी का नाम टाइप करना शुरू करें..." : language === "or" ? "ଆପଣଙ୍କ କମ୍ପାନୀ ନାମ ଟାଇପ୍ କରିବା ଆରମ୍ଭ କରନ୍ତୁ..." : "Start typing your company name..."}
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
                {language === "hi" ? "पद / पदनाम *" : language === "or" ? "ପଦବୀ / ପଦନାମ *" : "Job Title / Designation *"}
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={designation}
                onChange={(e) => updateFormState({ designation: e.target.value })}
                onBlur={() => registerBlur("designation")}
                placeholder={language === "hi" ? "जैसे: वरिष्ठ सॉफ्टवेयर इंजीनियर" : language === "or" ? "ଉଦାହରଣ: ବରିଷ୍ଠ ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟର୍" : "e.g. Senior Software Engineer"}
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
                {language === "hi" ? "मासिक शुद्ध इन-हैंड वेतन (₹) *" : language === "or" ? "ମାସିକ ନିଟ୍ ହାତ ଦରମା (₹) *" : "Monthly Net In-Hand Salary (₹) *"}
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
                  placeholder={language === "hi" ? "न्यूनतम: 15,000" : language === "or" ? "ସର୍ବନିମ୍ନ: ୧୫,୦୦୦" : "Min: 15,000"}
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
              {language === "hi" ? "कुल कार्य अनुभव (वर्ष) *" : language === "or" ? "ମୋଟ କାର୍ଯ୍ୟ ଅନୁଭବ (ବର୍ଷ) *" : "Total Work Experience (Years) *"}
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={yearsOfExperience !== undefined ? yearsOfExperience : ""}
              onChange={(e) => updateFormState({ yearsOfExperience: parseInt(e.target.value) || 0 })}
              onBlur={() => registerBlur("yearsOfExperience")}
              placeholder={language === "hi" ? "जैसे: 5" : language === "or" ? "ଉଦାହରଣ: ୫" : "e.g. 5"}
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
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            {language === "hi" ? "व्यवसाय विवरण" : language === "or" ? "ବ୍ୟବସାୟ ବିବରଣୀ" : "Business Details"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700">
                {language === "hi" ? "पंजीकृत व्यवसाय / कंपनी का नाम *" : language === "or" ? "ପଞ୍ଜୀକୃତ ବ୍ୟବସାୟ / କମ୍ପାନୀ ନାମ *" : "Registered Business/Company Name *"}
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessName}
                onChange={(e) => updateFormState({ businessName: e.target.value })}
                onBlur={() => registerBlur("businessName")}
                placeholder={language === "hi" ? "जैसे: जेना टेक्नोलॉजीज प्राइवेट लिमिटेड" : language === "or" ? "ଉଦାହରଣ: ଜେନା ଟେକ୍ନୋଲୋଜି ପ୍ରାଇଭେଟ୍ ଲିମିଟେଡ୍" : "e.g. Jena Technologies Private Limited"}
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
                {language === "hi" ? "व्यावसायिक कानूनी इकाई प्रकार *" : language === "or" ? "ବ୍ୟବସାୟିକ ଆଇନଗତ ସଂସ୍ଥା ପ୍ରକାର *" : "Business Legal Entity Type *"}
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
                <option value="" disabled>{language === "hi" ? "व्यवसाय प्रकार चुनें" : language === "or" ? "ବ୍ୟବସାୟ ପ୍ରକାର ଚୟନ କରନ୍ତୁ" : "Select Business Type"}</option>
                <option value="Sole Proprietorship">{language === "hi" ? "एकल स्वामित्व" : language === "or" ? "ଏକକ ମାଲିକାନା" : "Sole Proprietorship"}</option>
                <option value="Partnership">{language === "hi" ? "साझेदारी" : language === "or" ? "ଭାଗିଦାରୀ" : "Partnership"}</option>
                <option value="LLP">{language === "hi" ? "सीमित देयता भागीदारी (LLP)" : language === "or" ? "ସୀମିତ ଦାୟିତ୍ୱ ଭାଗିଦାରୀ (LLP)" : "Limited Liability Partnership (LLP)"}</option>
                <option value="Private Limited">{language === "hi" ? "प्राइवेट लिमिटेड कंपनी (Pvt Ltd)" : language === "or" ? "ପ୍ରାଇଭେଟ୍ ଲିମିଟେଡ୍ କମ୍ପାନୀ (Pvt Ltd)" : "Private Limited Company (Pvt Ltd)"}</option>
                <option value="Unregistered">{language === "hi" ? "अregistered / स्वतंत्र पेशेवर" : language === "or" ? "ଅପଞ୍ଜୀକୃତ / ସ୍ୱାଧୀନ ପେସାଦାର" : "Unregistered / Independent Professional"}</option>
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
                {language === "hi" ? "वार्षिक कारोबार (सकल ₹) *" : language === "or" ? "ବାର୍ଷିକ କାରବାର (ମୋଟ ₹) *" : "Annual Turnover (Gross ₹) *"}
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
                  placeholder={language === "hi" ? "न्यूनतम: 3,00,000" : language === "or" ? "ସର୍ବନିମ୍ନ: ୩,୦୦,୦୦୦" : "Min: 3,00,000"}
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
                {language === "hi" ? "व्यवसाय में वर्ष *" : language === "or" ? "ବ୍ୟବସାୟରେ ବର୍ଷ *" : "Years in Business *"}
              </label>
              <input
                type="number"
                id="yearsInBusiness"
                name="yearsInBusiness"
                value={yearsInBusiness || ""}
                onChange={(e) => updateFormState({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                onBlur={() => registerBlur("yearsInBusiness")}
                placeholder={language === "hi" ? "न्यूनतम: 2 वर्ष" : language === "or" ? "ସର୍ବନିମ୍ନ: ୨ ବର୍ଷ" : "Min: 2 years"}
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
                {language === "hi" ? "औसत शुद्ध मासिक आय (₹) *" : language === "or" ? "ହାରାହାରି ନିଟ୍ ମାସିକ ଆୟ (₹) *" : "Average Net Monthly Income (₹) *"}
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
                  placeholder={language === "hi" ? "जैसे: 50000" : language === "or" ? "ଉଦାହରଣ: ୫୦୦୦୦" : "e.g. 50000"}
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
                    {language === "hi" ? "जीएसटीआईएन (15-वर्ण आईडी) *" : language === "or" ? "GSTIN (୧୫-ବିଶିଷ୍ଟ ଆଇଡି) *" : "GSTIN (15-character ID) *"}
                  </label>
                  {panNumber && (
                    <span className="text-[10px] text-slate-400">
                      {language === "hi" ? `पैन शामिल होना चाहिए: ${panNumber}` : language === "or" ? `PAN ଅନ୍ତର୍ଭୁକ୍ତ ହେବା ଆବଶ୍ୟକ: ${panNumber}` : `Must include PAN: ${panNumber}`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={gstNumber}
                  onChange={(e) => updateFormState({ gstNumber: e.target.value.toUpperCase().trim() })}
                  onBlur={() => registerBlur("gstNumber")}
                  placeholder={language === "hi" ? "जैसे: 27ABCDE1234F1Z5" : language === "or" ? "ଉଦାହରଣ: ୨୭ABCDE୧୨୩୪F୧Z୫" : "e.g. 27ABCDE1234F1Z5"}
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
                  {language === "hi" ? "जीएसटीआईएन (वैकल्पिक)" : language === "or" ? "GSTIN (ବୈକଳ୍ପିକ)" : "GSTIN (Optional)"}
                </label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={gstNumber}
                  onChange={(e) => updateFormState({ gstNumber: e.target.value.toUpperCase().trim() })}
                  onBlur={() => registerBlur("gstNumber")}
                  placeholder={language === "hi" ? "जैसे: 27ABCDE1234F1Z5" : language === "or" ? "ଉଦାହରଣ: ୨୭ABCDE୧୨୩୪F୧Z୫" : "e.g. 27ABCDE1234F1Z5"}
                  maxLength={15}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                />
              </div>
            )}
          </div>

          {/* Office Address */}
          <div className="space-y-2">
            <label htmlFor="officeAddress" className="block text-sm font-medium text-slate-700">
              {language === "hi" ? "कार्यालय / व्यवसाय का पता *" : language === "or" ? "କାର୍ଯ୍ୟାଳୟ / ବ୍ୟବସାୟ ଠିକଣା *" : "Office/Business Address *"}
            </label>
            <textarea
              id="officeAddress"
              name="officeAddress"
              value={officeAddress}
              onChange={(e) => updateFormState({ officeAddress: e.target.value })}
              onBlur={() => registerBlur("officeAddress")}
              placeholder={language === "hi" ? "शहर, राज्य और पिन कोड सहित पूरा व्यावसायिक पता प्रदान करें।" : language === "or" ? "ସହର, ରାଜ୍ୟ ଏବଂ ପିନ୍ କୋଡ୍ ସହିତ ସମ୍ପୂର୍ଣ୍ଣ ବ୍ୟବସାୟ ଠିକଣା ପ୍ରଦାନ କରନ୍ତୁ।" : "Provide complete business address including city, state and PIN code."}
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
