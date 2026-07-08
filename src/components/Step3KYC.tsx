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

  // Local state for Aadhaar OTP Simulation
  const [aadhaarValidFormat, setAadhaarValidFormat] = useState(
    aadhaarNumber ? validateAadhaar(aadhaarNumber.replace(/\s+/g, "")) : false
  );
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtpSending, setAadhaarOtpSending] = useState(false);
  const [aadhaarOtpEntered, setAadhaarOtpEntered] = useState("");
  const [aadhaarOtpError, setAadhaarOtpError] = useState("");
  const mockAadhaarOtp = "888888";

  React.useEffect(() => {
    if (aadhaarVerified && aadhaarNumber) {
      setAadhaarValidFormat(true);
    }
  }, [aadhaarVerified, aadhaarNumber]);

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
      setAadhaarValidFormat(true);
      setAadhaarOtpError("");
      if (!aadhaarVerified) {
        setAadhaarLoading(true);
        setTimeout(() => {
          setAadhaarLoading(false);
        }, 1000);
      }
    } else {
      setAadhaarValidFormat(false);
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
            onChange={(e) => updateFormState({ aadhaarNumber: e.target.value.replace(/\D/g, ""), aadhaarVerified: false })}
            onBlur={handleAadhaarBlur}
            placeholder="12-digit UID Number"
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

        {/* Verified Banner with detailed mobile linking info */}
        {aadhaarVerified && !aadhaarLoading && (
          <div className="flex flex-col gap-1.5 p-3.5 bg-green-50 rounded-xl border border-green-100 animate-fadeIn mt-2">
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              <span className="font-bold">
                {language === "hi" ? "आधार सफलतापूर्वक सत्यापित एवं मोबाइल + ईमेल से लिंक" : language === "or" ? "ଆଧାର ସଫଳତାର ସହ ଯାଞ୍ଚ ଏବଂ ମୋବାଇଲ୍ + ଇମେଲ୍ ସହିତ ସଂଯୁକ୍ତ" : "Aadhaar Verified & Linked with Mobile & Email"}
              </span>
              <button
                type="button"
                onClick={() => {
                  updateFormState({ aadhaarVerified: false, aadhaarNumber: "" });
                  setAadhaarValidFormat(false);
                  setAadhaarOtpSent(false);
                  setAadhaarOtpEntered("");
                }}
                className="text-blue-600 hover:underline text-[10px] ml-auto cursor-pointer font-semibold"
              >
                {language === "hi" ? "रीसेट" : language === "or" ? "ପୁନର୍ବାର ସେଟ୍" : "Reset"}
              </button>
            </div>
            <p className="text-[11px] text-green-600 font-normal leading-normal">
              {language === "hi"
                ? `यह आधार नंबर (${maskAadhaar(aadhaarNumber)}) सफलतापूर्वक सत्यापित हो गया है और आपके प्राथमिक मोबाइल नंबर (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) और सत्यापित ईमेल आईडी (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}) दोनों से सक्रिय रूप से जुड़ा हुआ पाया गया है।`
                : language === "or"
                ? `ଏହି ଆଧାର ନମ୍ବର (${maskAadhaar(aadhaarNumber)}) ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି ଏବଂ ଆପଣଙ୍କର ପ୍ରାଥମିକ ମୋବାଇଲ୍ ନମ୍ବର (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) ଏବଂ ଯାଞ୍ଚ ହୋଇଥିବା ଇମେଲ୍ ID (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}) ସହିତ ସକ୍ରିୟ ଭାବରେ ସଂଯୁକ୍ତ ଥିବା ଜଣାପଡିଛି।`
                : `This Aadhaar number (${maskAadhaar(aadhaarNumber)}) has been successfully verified and found to be actively connected with both your primary mobile number (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) and verified email ID (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}).`}
            </p>
          </div>
        )}

        {/* Aadhaar Link Status Check OTP Block */}
        {!aadhaarVerified && aadhaarValidFormat && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3 animate-fadeIn mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-blue-800">
                {language === "hi" ? "आधार-मोबाइल-ईमेल लिंक स्थिति जांच" : language === "or" ? "ଆଧାର-ମୋବାଇଲ୍-ଇମେଲ୍ ସଂଯୋଗ ଯାଞ୍ଚ" : "Aadhaar Link Verification Hub"}
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                {language === "hi" ? "यूआईडीएआई रजिस्ट्री" : language === "or" ? "UIDAI ରଜିଷ୍ଟ୍ରି" : "UIDAI Registry"}
              </span>
            </div>

            {(!formState.mobileVerified || !formState.emailVerified) ? (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg space-y-2">
                <p className="text-xs text-red-700 font-medium">
                  {language === "hi"
                    ? "चेतावनी: आपके आधार से जुड़े मोबाइल नंबर और ईमेल को पहले चरण 2 में सत्यापित किया जाना चाहिए ताकि सुरक्षित लिंकिंग की जांच की जा सके।"
                    : language === "or"
                    ? "ଚେତାବନୀ: ସୁରକ୍ଷିତ ସଂଯୋଗ ଯାଞ୍ଚ କରିବା ପାଇଁ ଆପଣଙ୍କର ଆଧାର ସହିତ ସଂଯୁକ୍ତ ମୋବାଇଲ୍ ନମ୍ବର ଏବଂ ଇମେଲ୍ ପ୍ରଥମେ ସୋପାନ ୨ ରେ ଯାଞ୍ଚ ହେବା ଆବଶ୍ୟକ।"
                    : "Warning: Your connected mobile number and email must be verified in Step 2 to validate secure registry linkage status."}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-blue-700">
                  {language === "hi"
                    ? `यह आधार संख्या सक्रिय रूप से आपके सत्यापित प्राथमिक मोबाइल नंबर (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) और सत्यापित ईमेल आईडी (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}) दोनों से जुड़ी हुई है। लिंकिंग की पुष्टि करने के लिए, कृपया सुरक्षित आधार ओटीपी कोड का अनुरोध करें।`
                    : language === "or"
                    ? `ଏହି ଆଧାର ନମ୍ବର ଆପଣଙ୍କର ଯାଞ୍ଚ ହୋଇଥିବା ପ୍ରାଥମିକ ମୋବାଇଲ୍ ନମ୍ବର (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) ଏବଂ ଯାଞ୍ଚ ହୋଇଥିବା ଇମେଲ୍ ID (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}) ସହିତ ସକ୍ରିୟ ଭାବରେ ସଂଯୁକ୍ତ ଅଛି। ସଂଯୋଗୀକରଣ ନିଶ୍ଚିତ କରିବାକୁ, ଦୟାକରି ଏକ ସୁରକ୍ଷିତ ଆଧାର OTP କୋଡ୍ ଅନୁରୋଧ କରନ୍ତୁ।`
                    : `This Aadhaar number is actively registered to both your verified mobile number (+91 ${formState.mobileNumber ? formState.mobileNumber.substring(0, 2) + "••••" + formState.mobileNumber.substring(8) : "••••"}) and verified email ID (${formState.email ? formState.email.substring(0, 3) + "••••" + formState.email.substring(formState.email.indexOf("@")) : "••••"}). To complete identity verification and confirm linking, request a secure Aadhaar OTP.`}
                </p>

                {!aadhaarOtpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setAadhaarOtpSending(true);
                      setTimeout(() => {
                        setAadhaarOtpSending(false);
                        setAadhaarOtpSent(true);
                      }, 1200);
                    }}
                    disabled={aadhaarOtpSending}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {aadhaarOtpSending ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : null}
                    {aadhaarOtpSending ? (language === "hi" ? "ओटीपी भेजा जा रहा है..." : language === "or" ? "OTP ପଠାଯାଉଛି..." : "Sending OTP...") : (language === "hi" ? "आधार ओटीपी प्राप्त करें" : language === "or" ? "ଆଧାର OTP ହାସଲ କରନ୍ତୁ" : "Get Aadhaar OTP")}
                  </button>
                )}

                {aadhaarOtpSent && (
                  <div className="space-y-2 pt-2 border-t border-blue-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-blue-800">
                        {language === "hi" ? "सिम्युलेटेड आधार ओटीपी प्राप्त हुआ:" : language === "or" ? "ଅନୁକୃତ ଆଧାର OTP ପ୍ରାପ୍ତ ହେଲା:" : "Simulated Aadhaar OTP Received:"}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold animate-pulse">
                        {language === "hi" ? `ओटीपी कोड: ${mockAadhaarOtp}` : language === "or" ? `OTP କୋଡ୍: ${mockAadhaarOtp}` : `OTP Code: ${mockAadhaarOtp}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder={language === "hi" ? "6-अंकीय आधार ओटीपी" : language === "or" ? "୬-ଅଙ୍କ ବିଶିଷ୍ଟ ଆଧାର OTP" : "6-digit Aadhaar OTP"}
                        value={aadhaarOtpEntered}
                        onChange={(e) => setAadhaarOtpEntered(e.target.value.replace(/\D/g, ""))}
                        className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (aadhaarOtpEntered === mockAadhaarOtp) {
                            updateFormState({ aadhaarVerified: true });
                            setAadhaarOtpError("");
                          } else {
                            setAadhaarOtpError(
                              language === "hi"
                                ? "गलत आधार ओटीपी। कृपया '888888' दर्ज करें।"
                                : language === "or"
                                ? "ଭୁଲ୍ ଆଧାର OTP। ଦୟାକରି '888888' ପ୍ରବେଶ କରନ୍ତୁ।"
                                : "Incorrect Aadhaar OTP. Please enter '888888' for simulation."
                            );
                          }
                        }}
                        disabled={aadhaarOtpEntered.length !== 6}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {language === "hi" ? "सत्यापित करें" : language === "or" ? "ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify"}
                      </button>
                    </div>
                    {aadhaarOtpError && <p className="text-xs text-red-600 font-medium">{aadhaarOtpError}</p>}
                  </div>
                )}
              </>
            )}
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
            checked={!!aadhaarConsent}
            onChange={(e) => updateFormState({ aadhaarConsent: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
          />
          <label htmlFor="aadhaarConsent" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
            {language === "hi"
              ? "मैं इसके द्वारा प्रदान किए गए आधार नंबर का उपयोग करके यूआईडीएआई से अपनी पहचान सत्यापित करने और अपनी जनसांख्यिकीय विवरण प्राप्त करने के लिए उत्कल क्रेड (UtkalCred) को अपनी स्पष्ट सहमति देता हूं। मैं समझता हूं कि इस जानकारी का उपयोग केवल डिजिटल ऋण पर आरबीआई के दिशानिर्देशों के तहत क्रेडिट मूल्यांकन और केवाईसी अनुपालन के उद्देश्य से किया जाएगा।"
              : language === "or"
              ? "ମୁଁ ଏତଦ୍ୱାରା ପ୍ରଦାନ କରାଯାଇଥିବା ଆଧାର ନମ୍ବର ବ୍ୟବହାର କରି UIDAI ରୁ ମୋର ପରିଚୟ ଯାଞ୍ଚ କରିବା ଏବଂ ମୋର ଜନସଂଖ୍ୟା ଗତ ବିବରଣୀ ହାସଲ କରିବା ପାଇଁ ଉତ୍କଳ କ୍ରେଡ୍ (UtkalCred) କୁ ମୋର ସ୍ପଷ୍ଟ ସମ୍ମତି ପ୍ରଦାନ କରୁଛି। ମୋର ବୁଝିପାରୁଛି ଯେ ଏହି ସୂଚନା କେବଳ ଡିଜିଟାଲ୍ ଋଣ ଉପରେ RBI ର ମାର୍ଗଦର୍ଶିକା ଅନୁଯାୟୀ କ୍ରେଡିଟ୍ ମୂଲ୍ୟାଙ୍କନ ଏବଂ KYC ଅନୁପାଳନ ଉଦ୍ଦେଶ୍ୟରେ ବ୍ୟବହାର କରାଯିବ।"
              : "I hereby give my explicit consent to UtkalCred to verify my identity and retrieve my demographic details from UIDAI using the Aadhaar number provided. I understand that this information will be used solely for the purpose of credit evaluation and KYC compliance as mandated by the RBI Guidelines on Digital Lending."}
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
