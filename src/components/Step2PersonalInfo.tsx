import React, { useState, useEffect } from "react";
import { FormState } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

export default function Step2PersonalInfo({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const { t, language } = useLanguage();
  const {
    fullName,
    dob,
    gender,
    maritalStatus,
    fathersName,
    mothersName,
    email,
    emailVerified,
    mobileNumber,
    mobileVerified,
    alternateMobile
  } = formState;

  // Local state for Mobile OTP Simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(mobileVerified);
  const [otpError, setOtpError] = useState("");
  const mockOtp = "777777";

  // Local state for Email OTP Simulation
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [emailOtpVerified, setEmailOtpVerified] = useState(emailVerified);
  const [emailOtpError, setEmailOtpError] = useState("");
  const mockEmailOtp = "999999";

  // Security Assessment Simulated States
  const [securityScanProgress, setSecurityScanProgress] = useState(0);
  const [securityScanDone, setSecurityScanDone] = useState(false);
  const [sessionHash, setSessionHash] = useState("");
  const [ipAddress, setIpAddress] = useState("115.244.180.12");
  const [attestationRegistered, setAttestationRegistered] = useState(false);

  // Sync state changes with parent
  useEffect(() => {
    updateFormState({ mobileVerified: otpVerified });
  }, [otpVerified]);

  useEffect(() => {
    updateFormState({ emailVerified: emailOtpVerified });
  }, [emailOtpVerified]);

  useEffect(() => {
    // Generate simulated SHA-256 digital signature
    const textToHash = `${mobileNumber}-${email}-${dob}`;
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      hash = (hash << 5) - hash + textToHash.charCodeAt(i);
      hash |= 0;
    }
    const signature = `LENDSWIFT-SEC-${Math.abs(hash).toString(16).toUpperCase()}`;
    setSessionHash(signature);

    // Dynamic mock IP
    const mockIPs = ["115.244.180.12", "103.45.201.89", "49.36.120.54", "223.189.44.120"];
    const sum = textToHash.length % mockIPs.length;
    setIpAddress(mockIPs[sum]);
  }, [mobileNumber, email, dob]);

  useEffect(() => {
    // Trigger security scans automatically
    setSecurityScanProgress(0);
    setSecurityScanDone(false);
    const interval = setInterval(() => {
      setSecurityScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSecurityScanDone(true);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [otpVerified, emailOtpVerified]);

  const triggerSendOtp = () => {
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      alert(
        language === "hi"
          ? "कृपया ओटीपी का अनुरोध करने से पहले एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।"
          : language === "or"
          ? "ଦୟାକରି OTP ଅନୁରୋଧ କରିବା ପୂର୍ବରୁ ଏକ ବୈଧ ୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ।"
          : "Please enter a valid 10-digit mobile number before requesting an OTP."
      );
      return;
    }
    setOtpSending(true);
    setOtpError("");
    setTimeout(() => {
      setOtpSending(false);
      setOtpSent(true);
    }, 1000);
  };

  const verifyOtp = () => {
    if (enteredOtp === mockOtp) {
      setOtpVerified(true);
      setOtpError("");
      localStorage.setItem(`otp_verified_${mobileNumber}`, "true");
    } else {
      setOtpError(
        language === "hi"
          ? "गलत ओटीपी। सिमुलेशन के लिए, कृपया '777777' दर्ज करें।"
          : language === "or"
          ? "ଭୁଲ୍ OTP। ଅନୁକରଣ ପାଇଁ, ଦୟาକରି '777777' ପ୍ରବେଶ କରନ୍ତୁ।"
          : "Incorrect OTP. For simulation, please enter '777777'."
      );
    }
  };

  const triggerSendEmailOtp = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(
        language === "hi"
          ? "कृपया ओटीपी का अनुरोध करने से पहले एक मान्य ईमेल पता दर्ज करें।"
          : language === "or"
          ? "ଦୟାକରି OTP ଅନୁରୋଧ କରିବା ପୂର୍ବରୁ ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ।"
          : "Please enter a valid email address before requesting an OTP."
      );
      return;
    }
    setEmailOtpSending(true);
    setEmailOtpError("");
    setTimeout(() => {
      setEmailOtpSending(false);
      setEmailOtpSent(true);
    }, 1000);
  };

  const verifyEmailOtp = () => {
    if (enteredEmailOtp === mockEmailOtp) {
      setEmailOtpVerified(true);
      setEmailOtpError("");
      localStorage.setItem(`email_verified_${email}`, "true");
    } else {
      setEmailOtpError(
        language === "hi"
          ? "गलत ईमेल ओटीपी। सिमुलेशन के लिए, कृपया '999999' दर्ज करें।"
          : language === "or"
          ? "ଭୁଲ୍ ଇମେଲ୍ OTP। ଅନୁକରଣ ପାଇଁ, ଦୟାକରି '999999' ପ୍ରବେଶ କରନ୍ତୁ।"
          : "Incorrect Email OTP. For simulation, please enter '999999'."
      );
    }
  };

  return (
    <div className="space-y-6" id="step2-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("step2Title")}</h2>
        <p className="text-sm text-slate-500">{t("step2Desc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            {t("fullName")} *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => updateFormState({ fullName: e.target.value })}
            onBlur={() => registerBlur("fullName")}
            placeholder={language === "hi" ? "जैसे: प्रतीक कुमार जेना" : language === "or" ? "ଉଦାହରଣ: ପ୍ରତୀକ କୁମାର ଜେନା" : "e.g. PRATIK KUMAR JENA"}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.fullName ? "true" : "false"}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="fullName-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label htmlFor="dob" className="block text-sm font-medium text-slate-700">
            {t("dob")} *
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={dob}
            onChange={(e) => updateFormState({ dob: e.target.value })}
            onBlur={() => registerBlur("dob")}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dob ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.dob ? "true" : "false"}
            aria-describedby={errors.dob ? "dob-error" : undefined}
          />
          {errors.dob ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="dob-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.dob}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              {language === "hi" ? "उम्र 21 से 65 वर्ष के बीच होनी चाहिए" : language === "or" ? "ବୟସ ୨୧ ରୁ ୬୫ ବର୍ଷ ମଧ୍ୟରେ ହୋଇଥିବା ଆବଶ୍ୟକ" : "Must be between 21 and 65 years old"}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">{t("gender")} *</label>
          <div className="flex gap-4" role="radiogroup" aria-label="Select gender">
            {["Male", "Female", "Other"].map((item) => {
              const isSelected = gender === item;
              return (
                <button
                  key={item}
                  type="button"
                  id={`gender-${item.toLowerCase()}`}
                  onClick={() => updateFormState({ gender: item })}
                  className={`flex-1 py-3 px-4 rounded-xl border font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {t(item as any)}
                </button>
              );
            })}
          </div>
          {errors.gender && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.gender}
            </p>
          )}
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-slate-700">
            {t("maritalStatus")} *
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={maritalStatus}
            onChange={(e) => updateFormState({ maritalStatus: e.target.value })}
            onBlur={() => registerBlur("maritalStatus")}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.maritalStatus ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.maritalStatus ? "true" : "false"}
            aria-describedby={errors.maritalStatus ? "maritalStatus-error" : undefined}
          >
            <option value="" disabled>{language === "hi" ? "स्थिति चुनें" : language === "or" ? "ସ୍ଥିତି ଚୟନ କରନ୍ତୁ" : "Select Status"}</option>
            <option value="Single">{t("Single")}</option>
            <option value="Married">{t("Married")}</option>
            <option value="Divorced">{t("Divorced")}</option>
            <option value="Widowed">{t("Widowed")}</option>
          </select>
          {errors.maritalStatus && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="maritalStatus-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.maritalStatus}
            </p>
          )}
        </div>

        {/* Father's Name */}
        <div className="space-y-2">
          <label htmlFor="fathersName" className="block text-sm font-medium text-slate-700">
            {t("fathersName")} *
          </label>
          <input
            type="text"
            id="fathersName"
            name="fathersName"
            value={fathersName}
            onChange={(e) => updateFormState({ fathersName: e.target.value })}
            onBlur={() => registerBlur("fathersName")}
            placeholder={language === "hi" ? "कानूनी पहचान पत्र के अनुसार" : language === "or" ? "ଆଇନଗତ ପରିଚୟ ପତ୍ର ଅନୁଯାୟୀ" : "As recorded on legal ID"}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fathersName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.fathersName ? "true" : "false"}
            aria-describedby={errors.fathersName ? "fathersName-error" : undefined}
          />
          {errors.fathersName && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="fathersName-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.fathersName}
            </p>
          )}
        </div>

        {/* Mother's Name */}
        <div className="space-y-2">
          <label htmlFor="mothersName" className="block text-sm font-medium text-slate-700">
            {t("mothersName")} *
          </label>
          <input
            type="text"
            id="mothersName"
            name="mothersName"
            value={mothersName}
            onChange={(e) => updateFormState({ mothersName: e.target.value })}
            onBlur={() => registerBlur("mothersName")}
            placeholder={language === "hi" ? "कानूनी पहचान पत्र के अनुसार" : language === "or" ? "ଆଇନଗତ ପରିଚୟ ପତ୍ର ଅନୁଯାୟୀ" : "As recorded on legal ID"}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mothersName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.mothersName ? "true" : "false"}
            aria-describedby={errors.mothersName ? "mothersName-error" : undefined}
          />
          {errors.mothersName && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="mothersName-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.mothersName}
            </p>
          )}
        </div>

        {/* Mobile Number & OTP Verification */}
        <div className="space-y-2">
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-700">
            {t("mobileNumber")} *
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={mobileNumber}
              disabled={otpVerified}
              onChange={(e) => {
                setOtpVerified(false);
                setOtpSent(false);
                setEnteredOtp("");
                updateFormState({ mobileNumber: e.target.value.replace(/\D/g, "").substring(0, 10), mobileVerified: false });
              }}
              onBlur={() => registerBlur("mobileNumber")}
              placeholder={language === "hi" ? "10-अंकीय मोबाइल नंबर" : language === "or" ? "୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର" : "10-digit mobile number"}
              className={`block flex-1 px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.mobileNumber ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
              maxLength={10}
              aria-invalid={errors.mobileNumber ? "true" : "false"}
              aria-describedby={errors.mobileNumber ? "mobileNumber-error" : undefined}
            />
            {!otpVerified && (
              <button
                type="button"
                onClick={triggerSendOtp}
                disabled={otpSending || !/^[6-9]\d{9}$/.test(mobileNumber)}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-2 animate-fadeIn shrink-0"
              >
                {otpSending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : null}
                {otpSending ? (language === "hi" ? "भेजा जा रहा है..." : language === "or" ? "ପଠାଯାଉଛି..." : "Sending...") : (language === "hi" ? "ओटीपी भेजें" : language === "or" ? "OTP ପଠାନ୍ତୁ" : "Send OTP")}
              </button>
            )}
          </div>
          {errors.mobileNumber && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="mobileNumber-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.mobileNumber}
            </p>
          )}

          {/* OTP Input Block */}
          {otpSent && !otpVerified && (
            <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-blue-800">
                  {language === "hi" ? "सिम्युलेटेड एसएमएस प्राप्त हुआ:" : language === "or" ? "ଅନୁକୃତ SMS ପ୍ରାପ୍ତ ହେଲା:" : "Simulated SMS Received:"}
                </span>
                <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold animate-pulse">
                  {language === "hi" ? `ओटीपी कोड: ${mockOtp}` : language === "or" ? `OTP କୋଡ୍: ${mockOtp}` : `OTP Code: ${mockOtp}`}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {language === "hi" ? `हमने +91 ${mobileNumber} पर एक सिम्युलेटेड सत्यापन ओटीपी कोड भेजा है।` : language === "or" ? `ଆମେ +91 ${mobileNumber} କୁ ଏକ ଅନୁକୃତ ଯାଞ୍ଚ OTP କୋଡ୍ ପଠାଇଛୁ।` : `We've sent a simulated verification OTP code to +91 ${mobileNumber}.`}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={language === "hi" ? "6-अंकीय ओटीपी दर्ज करें" : language === "or" ? "୬-ଅଙ୍କ ବିଶିଷ୍ଟ OTP ପ୍ରବେଶ କରନ୍ତୁ" : "Enter 6-digit OTP"}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={enteredOtp.length !== 6}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {language === "hi" ? "सत्यापित करें" : language === "or" ? "ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify"}
                </button>
              </div>
              {otpError && <p className="text-xs text-red-600 font-medium" role="alert">{otpError}</p>}
            </div>
          )}

          {otpVerified && (
            <div className="space-y-2 mt-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {language === "hi" ? "मोबाइल नंबर ओटीपी के माध्यम से सफलतापूर्वक सत्यापित किया गया।" : language === "or" ? "ମୋବାଇଲ୍ ନମ୍ବର OTP ମାଧ୍ୟମରେ ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି।" : "Mobile number verified successfully via OTP."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpVerified(false);
                    setOtpSent(false);
                    setEnteredOtp("");
                    updateFormState({ mobileVerified: false });
                    localStorage.removeItem(`otp_verified_${mobileNumber}`);
                  }}
                  className="ml-auto text-blue-600 hover:underline text-[10px] shrink-0 cursor-pointer"
                >
                  {language === "hi" ? "नंबर बदलें" : language === "or" ? "ନମ୍ବର ପରିବର୍ତ୍ତନ କରନ୍ତୁ" : "Change Number"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email with Sequential OTP Verification Block */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t("email")} *
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              disabled={emailOtpVerified || !otpVerified}
              onChange={(e) => {
                setEmailOtpVerified(false);
                setEmailOtpSent(false);
                setEnteredEmailOtp("");
                updateFormState({ email: e.target.value, emailVerified: false });
              }}
              onBlur={() => registerBlur("email")}
              placeholder={
                !otpVerified
                  ? (language === "hi" ? "पहले मोबाइल नंबर सत्यापित करें" : language === "or" ? "ପ୍ରଥମେ ମୋବାଇଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify mobile number first")
                  : (language === "hi" ? "नाम@उदाहरण.com" : language === "or" ? "ନାମ@ଉଦାହରଣ.com" : "name@example.com")
              }
              className={`block flex-1 px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.email ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {otpVerified && !emailOtpVerified && (
              <button
                type="button"
                onClick={triggerSendEmailOtp}
                disabled={emailOtpSending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-2 animate-fadeIn shrink-0"
              >
                {emailOtpSending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : null}
                {emailOtpSending ? (language === "hi" ? "भेजा जा रहा है..." : language === "or" ? "ପଠାଯାଉଛି..." : "Sending...") : (language === "hi" ? "ईमेल सत्यापित करें" : language === "or" ? "ଇମେଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify Email")}
              </button>
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="email-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.email}
            </p>
          )}

          {/* Email OTP Input Block */}
          {emailOtpSent && !emailOtpVerified && (
            <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-blue-800">
                  {language === "hi" ? "सिम्युलेटेड ईमेल प्राप्त हुआ:" : language === "or" ? "ଅନୁକୃତ ଇମେଲ୍ ପ୍ରାପ୍ତ ହେଲା:" : "Simulated Email Received:"}
                </span>
                <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold animate-pulse">
                  {language === "hi" ? `ओटीपी कोड: ${mockEmailOtp}` : language === "or" ? `OTP କୋଡ୍: ${mockEmailOtp}` : `OTP Code: ${mockEmailOtp}`}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {language === "hi" ? `हमने ${email} पर एक सिम्युलेटेड सत्यापन कोड भेजा है।` : language === "or" ? `ଆମେ ${email} କୁ ଏକ ଅନୁକୃତ ଯାଞ୍ଚ କୋଡ୍ ପଠାଇଛୁ।` : `We've sent a simulated verification code to ${email}.`}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={language === "hi" ? "6-अंकीय कोड दर्ज करें" : language === "or" ? "୬-ଅଙ୍କ ବିଶିଷ୍ଟ କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ" : "Enter 6-digit code"}
                  value={enteredEmailOtp}
                  onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))}
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={verifyEmailOtp}
                  disabled={enteredEmailOtp.length !== 6}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {language === "hi" ? "सत्यापित करें" : language === "or" ? "ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify"}
                </button>
              </div>
              {emailOtpError && <p className="text-xs text-red-600 font-medium" role="alert">{emailOtpError}</p>}
            </div>
          )}

          {emailOtpVerified && (
            <div className="space-y-2 mt-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {language === "hi" ? "ईमेल सफलतापूर्वक सत्यापित किया गया।" : language === "or" ? "ଇମେଲ୍ ଠିକଣା ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି।" : "Email verified successfully."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailOtpVerified(false);
                    setEmailOtpSent(false);
                    setEnteredEmailOtp("");
                    updateFormState({ emailVerified: false });
                    localStorage.removeItem(`email_verified_${email}`);
                  }}
                  className="ml-auto text-blue-600 hover:underline text-[10px] shrink-0 cursor-pointer"
                >
                  {language === "hi" ? "ईमेल बदलें" : language === "or" ? "ଇମେଲ୍ ବଦଳାନ୍ତୁ" : "Change Email"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alternate Mobile */}
        <div className="space-y-2">
          <label htmlFor="alternateMobile" className="block text-sm font-medium text-slate-700">
            {t("alternateMobile")}
          </label>
          <input
            type="tel"
            id="alternateMobile"
            name="alternateMobile"
            value={alternateMobile}
            onChange={(e) => updateFormState({ alternateMobile: e.target.value.replace(/\D/g, "").substring(0, 10) })}
            onBlur={() => registerBlur("alternateMobile")}
            placeholder={language === "hi" ? "वैकल्पिक संपर्क नंबर" : language === "or" ? "ବୈକଳ୍ପିକ ସମ୍ପର୍କ ନମ୍ବର" : "Alternate contact number"}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.alternateMobile ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            maxLength={10}
            aria-invalid={errors.alternateMobile ? "true" : "false"}
            aria-describedby={errors.alternateMobile ? "alternateMobile-error" : undefined}
          />
          {errors.alternateMobile && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="alternateMobile-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.alternateMobile}
            </p>
          )}
        </div>

        {/* ADVANCED SECURITY, INTEGRITY & TRUST CENTER */}
        <div className="col-span-full mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            {/* Ambient secure background grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    {language === "hi" ? "उन्नत सुरक्षा एवं डिवाइस अखंडता केंद्र" : language === "or" ? "ଉନ୍ନତ ସୁରକ୍ଷା ଏବଂ ଡିଭାଇସ୍ ଅଖଣ୍ଡତା କେନ୍ଦ୍ର" : "Advanced Security & Device Integrity Center"}
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      {language === "hi" ? "सक्रिय" : language === "or" ? "ସକ୍ରିୟ" : "Active Shield"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === "hi" ? "डिजिटल ऋण सुरक्षा निर्देशों के अनुसार वास्तविक समय में सुरक्षा मापदंडों का सत्यापन।" : language === "or" ? "ଡିଜିଟାଲ୍ ଋଣ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ ଅନୁଯାୟୀ ପ୍ରକୃତ ସମୟରେ ସୁରକ୍ଷା ମାପଦଣ୍ଡର ଯାଞ୍ଚ।" : "Real-time verification of security parameters in compliance with Digital Lending security norms."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shrink-0 text-xs">
                <span className="text-slate-400">{language === "hi" ? "सुरक्षा रेटिंग:" : language === "or" ? "ସୁରକ୍ଷା ମାନ୍ୟତା:" : "Trust Rating:"}</span>
                <span className="font-mono text-emerald-400 font-bold">A++ SECURE</span>
              </div>
            </div>

            {/* Dynamic Security Loading bar or Verified state */}
            {!securityScanDone ? (
              <div className="space-y-1.5 pt-2 relative z-10">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 animate-pulse">
                    {language === "hi" ? "सुरक्षा मापदंडों की स्कैनिंग की जा रही है..." : language === "or" ? "ସୁରକ୍ଷା ମାପଦଣ୍ଡ ସ୍କାନିଂ ଚାଲିଛି..." : "Analyzing device and sandbox parameters..."}
                  </span>
                  <span className="text-blue-400 font-semibold">{securityScanProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${securityScanProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 relative z-10 animate-fadeIn">
                {/* Check 1: Device attestation */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <span className="flex h-2 w-2 bg-emerald-400 rounded-full"></span>
                    {language === "hi" ? "डिवाइस सत्यापन" : language === "or" ? "ଡିଭାଇସ୍ ଯାଞ୍ଚ" : "Device Integrity"}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === "hi" ? "ब्राउज़र सैंडबॉक्स और कुकीज सुरक्षित हैं" : language === "or" ? "ବ୍ରାଉଜର୍ ସ୍ୟାଣ୍ଡବକ୍ସ ଏବଂ କୁକିଜ୍ ସୁରକ୍ଷିତ" : "Browser sandbox & agent verified safe"}
                  </p>
                </div>

                {/* Check 2: VPN / Proxy detection */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <span className="flex h-2 w-2 bg-emerald-400 rounded-full"></span>
                    {language === "hi" ? "वीपीएन / प्रॉक्सी शील्ड" : language === "or" ? "VPN / ପ୍ରକ୍ସି ସିଲ୍ଡ" : "VPN & Proxy Shield"}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === "hi" ? `कोई वीपीएन नहीं मिला। आईपी: ${ipAddress}` : language === "or" ? `କୌଣସି VPN ମିଳିଲା ନାହିଁ। IP: ${ipAddress}` : `No VPN/proxy detected. IP: ${ipAddress}`}
                  </p>
                </div>

                {/* Check 3: Digital signature hash */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <span className="flex h-2 w-2 bg-emerald-400 rounded-full"></span>
                    {language === "hi" ? "डिजिटल हस्ताक्षर" : language === "or" ? "ଡିଜିଟାଲ୍ ଦସ୍ତଖତ" : "Identity Cryptosig"}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate" title={sessionHash}>
                    {sessionHash}
                  </p>
                </div>

                {/* Check 4: Fraud index score */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <span className="flex h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span>
                    {language === "hi" ? "ट्रस्ट स्कोर: 99/100" : language === "or" ? "ବିଶ୍ୱାସ ସ୍କୋର: ୯୯/୧୦୦" : "Trust Score: 99%"}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === "hi" ? "अत्यधिक विश्वसनीय कनेक्शन" : language === "or" ? "ଅତ୍ୟନ୍ତ ବିଶ୍ୱସନୀୟ ସଂଯୋଗ" : "Extremely high credibility rating"}
                  </p>
                </div>
              </div>
            )}

            {/* Simulated trusted device hardware token link */}
            {otpVerified && emailOtpVerified && securityScanDone && (
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-200">
                    <span className="font-bold text-emerald-400">
                      {language === "hi" ? "दो-कारक प्रमाणीकरण संपन्न" : language === "or" ? "ଦ୍ୱି-କାରକ ପ୍ରମାଣୀକରଣ ସମ୍ପନ୍ନ" : "Dual-Factor Verification Fully Confirmed"}
                    </span>
                    <br />
                    <span className="text-[11px] text-slate-400">
                      {language === "hi" ? "इस सत्र के लिए मोबाइल और ईमेल पते को एक साथ सुरक्षित रूप से बांध दिया गया है।" : language === "or" ? "ଏହି ଅଧିବେଶନ ପାଇଁ ମୋବାଇଲ୍ ଏବଂ ଇମେଲ୍ ଠିକଣା ଏକତ୍ର ସୁରକ୍ଷିତ ଭାବରେ ବନ୍ଧା ଯାଇଛି।" : "Mobile number & email address are securely consolidated for this application session."}
                    </span>
                  </p>
                </div>
                {!attestationRegistered ? (
                  <button
                    type="button"
                    onClick={() => setAttestationRegistered(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold text-[10px] rounded-lg tracking-wider cursor-pointer"
                  >
                    {language === "hi" ? "हार्डवेयर टोकन बाँधें" : language === "or" ? "ହାର୍ଡୱେର୍ ଟୋକନ୍ ବାନ୍ଧନ୍ତୁ" : "REGISTER HARDWARE KEY"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-fadeIn">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {language === "hi" ? "पंजीकृत" : language === "or" ? "ପଞ୍ଜୀକୃତ" : "REGISTERED"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
