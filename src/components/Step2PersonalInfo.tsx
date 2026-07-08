import React, { useState } from "react";
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
    mobileNumber,
    alternateMobile
  } = formState;

  // Local state for OTP Simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(
    mobileNumber ? localStorage.getItem(`otp_verified_${mobileNumber}`) === "true" : false
  );
  const [otpError, setOtpError] = useState("");
  const mockOtp = "777777";

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
    }, 1200);
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
          ? "ଭୁଲ୍ OTP। ଅନୁକରଣ ପାଇଁ, ଦୟାକରି '777777' ପ୍ରବେଶ କରନ୍ତୁ।"
          : "Incorrect OTP. For simulation, please enter '777777'."
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

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t("email")} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => updateFormState({ email: e.target.value })}
            onBlur={() => registerBlur("email")}
            placeholder={language === "hi" ? "नाम@उदाहरण.com" : language === "or" ? "ନାମ@ଉଦାହରଣ.com" : "name@example.com"}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id="email-error" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.email}
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
              onChange={(e) => updateFormState({ mobileNumber: e.target.value.replace(/\D/g, "").substring(0, 10) })}
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
                <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-mono">
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
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2 mt-2 animate-fadeIn">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                {language === "hi" ? "मोबाइल नंबर ओटीपी के माध्यम से सफलतापूर्वक सत्यापित किया गया।" : language === "or" ? "ମୋବାଇଲ୍ ନମ୍ବର OTP ମାଧ୍ୟମରେ ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି।" : "Mobile number verified successfully via OTP."}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtpVerified(false);
                  setOtpSent(false);
                  setEnteredOtp("");
                  localStorage.removeItem(`otp_verified_${mobileNumber}`);
                }}
                className="ml-auto text-blue-600 hover:underline text-[10px]"
              >
                {language === "hi" ? "नंबर बदलें" : language === "or" ? "ନମ୍ବର ପରିବର୍ତ୍ତନ କରନ୍ତୁ" : "Change Number"}
              </button>
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
      </div>
    </div>
  );
}
