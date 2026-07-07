import React, { useState } from "react";
import { FormState } from "../types";

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
      alert("Please enter a valid 10-digit mobile number before requesting an OTP.");
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
      setOtpError("Incorrect OTP. For simulation, please enter '777777'.");
    }
  };

  return (
    <div className="space-y-6" id="step2-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Information</h2>
        <p className="text-sm text-slate-500">Provide your official details as recorded on your documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full Name (As per PAN) *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => updateFormState({ fullName: e.target.value })}
            onBlur={() => registerBlur("fullName")}
            placeholder="e.g. PRATIK KUMAR JENA"
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
            Date of Birth *
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
            <p className="text-xs text-slate-400">Must be between 21 and 65 years old</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Gender *</label>
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
                  {item}
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
            Marital Status *
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
            <option value="" disabled>Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
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
            Father&apos;s Full Name *
          </label>
          <input
            type="text"
            id="fathersName"
            name="fathersName"
            value={fathersName}
            onChange={(e) => updateFormState({ fathersName: e.target.value })}
            onBlur={() => registerBlur("fathersName")}
            placeholder="As recorded on legal ID"
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
            Mother&apos;s Full Name *
          </label>
          <input
            type="text"
            id="mothersName"
            name="mothersName"
            value={mothersName}
            onChange={(e) => updateFormState({ mothersName: e.target.value })}
            onBlur={() => registerBlur("mothersName")}
            placeholder="As recorded on legal ID"
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
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => updateFormState({ email: e.target.value })}
            onBlur={() => registerBlur("email")}
            placeholder="name@example.com"
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
            Mobile Number *
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
              placeholder="10-digit mobile number"
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
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {otpSending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : null}
                Send OTP
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
                <span className="text-xs font-semibold text-blue-800">Simulated SMS Received:</span>
                <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-mono">
                  OTP Code: {mockOtp}
                </span>
              </div>
              <p className="text-xs text-blue-700">We&apos;ve sent a simulated verification OTP code to +91 {mobileNumber}.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={enteredOtp.length !== 6}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Verify
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
              <span>Mobile number verified successfully via OTP.</span>
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
                Change Number
              </button>
            </div>
          )}
        </div>

        {/* Alternate Mobile */}
        <div className="space-y-2">
          <label htmlFor="alternateMobile" className="block text-sm font-medium text-slate-700">
            Alternate Mobile Number (Optional)
          </label>
          <input
            type="tel"
            id="alternateMobile"
            name="alternateMobile"
            value={alternateMobile}
            onChange={(e) => updateFormState({ alternateMobile: e.target.value.replace(/\D/g, "").substring(0, 10) })}
            onBlur={() => registerBlur("alternateMobile")}
            placeholder="Alternate contact number"
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
