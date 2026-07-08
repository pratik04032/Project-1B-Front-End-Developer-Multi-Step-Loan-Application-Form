import React, { useState } from "react";
import { FormState } from "../types";
import { validatePAN, validateAadhaar } from "../utils/validators";
import { useLanguage } from "../context/LanguageContext";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

export default function Step3KYC({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const { t, language } = useLanguage();
  const {
    loanType,
    loanAmount,
    panNumber,
    aadhaarNumber,
    aadhaarConsent,
    voterId,
    passport,
    panVerified,
    aadhaarVerified
  } = formState;

  // Local state for verification loaders
  const [panLoading, setPanLoading] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);

  const handlePanBlur = () => {
    registerBlur("panNumber");
    const cleanPan = panNumber.toUpperCase().trim();
    if (!cleanPan) return;

    // Validate format first
    const panCheck = validatePAN(cleanPan, loanType);
    if (panCheck.valid) {
      if (!panVerified) {
        setPanLoading(true);
        setTimeout(() => {
          setPanLoading(false);
          updateFormState({ panVerified: true, panNumber: cleanPan });
        }, 1500);
      }
    } else {
      updateFormState({ panVerified: false, panNumber: cleanPan });
    }
  };

  const handleAadhaarBlur = () => {
    registerBlur("aadhaarNumber");
    const cleanAadhaar = aadhaarNumber.replace(/\s+/g, "");
    if (!cleanAadhaar) return;

    // Validate Verhoeff format first
    const isAadhaarValid = validateAadhaar(cleanAadhaar);
    if (isAadhaarValid) {
      if (!aadhaarVerified) {
        setAadhaarLoading(true);
        setTimeout(() => {
          setAadhaarLoading(false);
          updateFormState({ aadhaarVerified: true, aadhaarNumber: cleanAadhaar });
        }, 1500);
      }
    } else {
      updateFormState({ aadhaarVerified: false, aadhaarNumber: cleanAadhaar });
    }
  };

  // Condition for passport visibility: Home Loan > 50 Lakhs
  const showPassport = loanType === "Home" && loanAmount > 5000000;

  // Mask function for PAN (show last 4 characters, e.g. ******1234)
  const maskPAN = (val: string) => {
    if (!val) return "";
    const clean = val.toUpperCase().trim();
    if (clean.length <= 4) return clean;
    return "•".repeat(clean.length - 4) + clean.substring(clean.length - 4);
  };

  // Mask function for Aadhaar (show last 4 characters, e.g. ********1234)
  const maskAadhaar = (val: string) => {
    if (!val) return "";
    const clean = val.replace(/\s+/g, "");
    if (clean.length <= 4) return clean;
    return "•".repeat(clean.length - 4) + clean.substring(clean.length - 4);
  };

  return (
    <div className="space-y-6" id="step3-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("step3Title")}</h2>
        <p className="text-sm text-slate-500">{t("step3Desc")}</p>
      </div>

      {/* PAN Card Field */}
      <div className="space-y-2">
        <label htmlFor="panNumber" className="block text-sm font-medium text-slate-700">
          {t("panNumber")} *
        </label>
        <div className="relative rounded-xl shadow-sm">
          <input
            type="text"
            id="panNumber"
            name="panNumber"
            value={panLoading || panVerified ? maskPAN(panNumber) : panNumber}
            disabled={panLoading || panVerified}
            onChange={(e) => updateFormState({ panNumber: e.target.value.toUpperCase(), panVerified: false })}
            onBlur={handlePanBlur}
            placeholder={language === "hi" ? "जैसे: ABCDE1234F" : language === "or" ? "ଉଦାହରଣ: ABCDE1234F" : "e.g. ABCDE1234F"}
            maxLength={10}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-mono tracking-widest ${
              errors.panNumber ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.panNumber ? "true" : "false"}
            aria-describedby={errors.panNumber ? "panNumber-error" : undefined}
          />
          
          {/* Status Indicator inside/next to the Input */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {panLoading && (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
              </span>
            )}
            {panVerified && !panLoading && (
              <span className="flex h-5 w-5 items-center justify-center text-green-600 font-semibold" title="Verified PAN">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Verified Banner */}
        {panVerified && !panLoading && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit animate-fadeIn">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            {language === "hi" ? "पैन सफलतापूर्वक सत्यापित किया गया" : language === "or" ? "PAN ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି" : "PAN Verified Successfully"}
            <button
              type="button"
              onClick={() => updateFormState({ panVerified: false, panNumber: "" })}
              className="text-blue-600 hover:underline text-[10px] ml-2 cursor-pointer"
            >
              {language === "hi" ? "रीसेट" : language === "or" ? "ପୁନର୍ବାର ସେଟ୍" : "Reset"}
            </button>
          </div>
        )}

        {errors.panNumber && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="panNumber-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.panNumber}
          </p>
        )}
      </div>

      {/* Aadhaar Number Field */}
      <div className="space-y-2">
        <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-slate-700">
          {t("aadhaarNumber")} *
        </label>
        <div className="relative rounded-xl shadow-sm">
          <input
            type="text"
            id="aadhaarNumber"
            name="aadhaarNumber"
            value={aadhaarLoading || aadhaarVerified ? maskAadhaar(aadhaarNumber) : aadhaarNumber}
            disabled={aadhaarLoading || aadhaarVerified}
            onChange={(e) => updateFormState({ aadhaarNumber: e.target.value.replace(/\D/g, "").substring(0, 12), aadhaarVerified: false })}
            onBlur={handleAadhaarBlur}
            placeholder={language === "hi" ? "जैसे: 5432 1098 7654" : language === "or" ? "ଉଦାହରଣ: ୫୪୩୨ ୧୦୯୮ ୭୬୫୪" : "e.g. 5432 1098 7654"}
            maxLength={12}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-mono tracking-widest ${
              errors.aadhaarNumber ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.aadhaarNumber ? "true" : "false"}
            aria-describedby={errors.aadhaarNumber ? "aadhaarNumber-error" : undefined}
          />

          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {aadhaarLoading && (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
              </span>
            )}
            {aadhaarVerified && !aadhaarLoading && (
              <span className="flex h-5 w-5 items-center justify-center text-green-600 font-semibold" title="Verified Aadhaar">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Verified Banner */}
        {aadhaarVerified && !aadhaarLoading && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit animate-fadeIn">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            {language === "hi" ? "आधार सफलतापूर्वक सत्यापित (वेरहॉफ उत्तीर्ण)" : language === "or" ? "ଆଧାର ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି (Verhoeff ଉତ୍ତୀର୍ଣ୍ଣ)" : "Aadhaar Verified Successfully (Verhoeff Passed)"}
            <button
              type="button"
              onClick={() => updateFormState({ aadhaarVerified: false, aadhaarNumber: "" })}
              className="text-blue-600 hover:underline text-[10px] ml-2 cursor-pointer"
            >
              {language === "hi" ? "रीसेट" : language === "or" ? "ପୁନର୍ବାର ସେଟ୍" : "Reset"}
            </button>
          </div>
        )}

        {errors.aadhaarNumber && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="aadhaarNumber-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.aadhaarNumber}
          </p>
        )}
      </div>

      {/* Aadhaar Explicit Consent */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="aadhaarConsent"
            name="aadhaarConsent"
            checked={aadhaarConsent}
            onChange={(e) => updateFormState({ aadhaarConsent: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="aadhaarConsent" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
            {language === "hi"
              ? "मैं इसके द्वारा प्रदान किए गए आधार नंबर का उपयोग करके यूआईडीएआई से अपनी पहचान सत्यापित करने और अपनी जनसांख्यिकीय विवरण प्राप्त करने के लिए LendSwift को अपनी स्पष्ट सहमति देता हूं। मैं समझता हूं कि इस जानकारी का उपयोग केवल डिजिटल ऋण पर आरबीआई के दिशानिर्देशों के तहत क्रेडिट मूल्यांकन और केवाईसी अनुपालन के उद्देश्य से किया जाएगा।"
              : language === "or"
              ? "ମୁଁ ଏତଦ୍ୱାରା ପ୍ରଦାନ କରାଯାଇଥିବା ଆଧାର ନମ୍ବର ବ୍ୟବହାର କରି UIDAI ରୁ ମୋର ପରିଚୟ ଯାଞ୍ଚ କରିବା ଏବଂ ମୋର ଜନସଂଖ୍ୟା ଗତ ବିବରଣୀ ହାସଲ କରିବା ପାଇଁ LendSwift କୁ ମୋର ସ୍ପଷ୍ଟ ସମ୍ମତି ପ୍ରଦାନ କରୁଛି। ମୁଁ ବୁଝିପାରୁଛି ଯେ ଏହି ସୂଚନା କେବଳ ଡିଜିଟାଲ୍ ଋଣ ଉପରେ RBI ର ମାର୍ଗଦର୍ଶିକା ଅନୁଯାୟୀ କ୍ରେଡିଟ୍ ମୂଲ୍ୟାଙ୍କନ ଏବଂ KYC ଅନୁପାଳନ ଉଦ୍ଦେଶ୍ୟରେ ବ୍ୟବହାର କରାଯିବ।"
              : "I hereby give my explicit consent to LendSwift to verify my identity and retrieve my demographic details from UIDAI using the Aadhaar number provided. I understand that this information will be used solely for the purpose of credit evaluation and KYC compliance as mandated by the RBI Guidelines on Digital Lending."}
          </label>
        </div>
        {errors.aadhaarConsent && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.aadhaarConsent}
          </p>
        )}
      </div>

      {/* Voter ID (Optional) */}
      <div className="space-y-2">
        <label htmlFor="voterId" className="block text-sm font-medium text-slate-700">
          {t("voterId")}
        </label>
        <input
          type="text"
          id="voterId"
          name="voterId"
          value={voterId}
          onChange={(e) => updateFormState({ voterId: e.target.value.toUpperCase() })}
          onBlur={() => registerBlur("voterId")}
          placeholder={language === "hi" ? "जैसे: ABC1234567" : language === "or" ? "ଉଦାହରଣ: ABC1234567" : "e.g. ABC1234567"}
          maxLength={10}
          className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider ${
            errors.voterId ? "border-red-500" : "border-slate-200 hover:border-slate-300"
          }`}
          aria-invalid={errors.voterId ? "true" : "false"}
          aria-describedby={errors.voterId ? "voterId-error" : undefined}
        />
        {errors.voterId && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="voterId-error" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.voterId}
          </p>
        )}
      </div>

      {/* Passport (Shown and Required if Home Loan > 50L) */}
      {showPassport && (
        <div className="space-y-2 animate-fadeIn">
          <label htmlFor="passport" className="block text-sm font-medium text-slate-700">
            {language === "hi" ? "पासपोर्ट नंबर * (₹50 लाख से अधिक के गृह ऋण के लिए आवश्यक)" : language === "or" ? "ପାସପୋର୍ଟ ନମ୍ବର * (₹୫୦ ଲକ୍ଷରୁ ଅଧିକ ଗୃହ ଋଣ ପାଇଁ ଆବଶ୍ୟକ)" : "Passport Number * (Required for Home Loans > ₹50L)"}
          </label>
          <input
            type="text"
            id="passport"
            name="passport"
            value={passport}
            onChange={(e) => updateFormState({ passport: e.target.value.toUpperCase() })}
            onBlur={() => registerBlur("passport")}
            placeholder={language === "hi" ? "जैसे: A1234567" : language === "or" ? "ଉଦାହରଣ: A1234567" : "e.g. A1234567"}
            maxLength={8}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider ${
              errors.passport ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.passport ? "true" : "false"}
            aria-describedby={errors.passport ? "passport-error" : undefined}
          />
          {errors.passport && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="passport-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.passport}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
