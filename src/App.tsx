import React, { useState, useEffect, startTransition } from "react";
import { FormState, INITIAL_FORM_STATE } from "./types";
import {
  isStep6Active,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  validateStep8,
  validateAllSteps
} from "./utils/stepValidators";
import { findLatestDraft, clearDraft, clearAllDrafts } from "./utils/drafts";
import { decryptData } from "./utils/encryption";
import { useAutoSave } from "./hooks/useAutoSave";
import SessionTimer from "./components/SessionTimer";
import { useLanguage } from "./context/LanguageContext";
import { Language } from "./utils/translations";
import { Globe } from "lucide-react";


// Import step components
import Step1LoanType from "./components/Step1LoanType";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3KYC from "./components/Step3KYC";
import Step4Address from "./components/Step4Address";
import Step5Employment from "./components/Step5Employment";
import Step6CoApplicant from "./components/Step6CoApplicant";
import Step7Documents from "./components/Step7Documents";
import Step8Review from "./components/Step8Review";

export default function App() {
  const { language, setLanguage, t, languages } = useLanguage();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [currentStep, setCurrentStep] = useState(1);
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalSuccess, setGlobalSuccess] = useState(false);
  const [successRefId, setSuccessRefId] = useState("");

  // Save/Notification states
  const [toastMessage, setToastMessage] = useState("");
  const [resumeModalData, setResumeModalData] = useState<{
    loanType: string;
    step: number;
    encryptedState: string;
  } | null>(null);

  // Initialize and check for existing drafts on load
  useEffect(() => {
    const latest = findLatestDraft();
    if (latest) {
      setResumeModalData(latest);
    }
  }, []);

  // Sync draft saved time to user notification toast
  const { saveDraft, lastSaved, isSaving } = useAutoSave(
    formState,
    currentStep,
    30000,
    (time) => {
      setToastMessage(`Draft saved securely at ${time}`);
      setTimeout(() => setToastMessage(""), 3000);
    }
  );

  // Trigger real-time validation when state updates or field loses focus
  useEffect(() => {
    const currentErrors = validateCurrentStepOnly();
    // Only show errors for fields that have been focused/blurred or submitted
    const filteredErrors: Record<string, string> = {};
    Object.keys(currentErrors).forEach((key) => {
      if (blurredFields[key]) {
        filteredErrors[key] = currentErrors[key];
      }
    });
    setErrors(filteredErrors);
  }, [formState, currentStep, blurredFields]);

  // Quick field blur registration
  const registerBlur = (field: string) => {
    setBlurredFields((prev) => ({ ...prev, [field]: true }));
  };

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  // Helper to validate current step only
  const validateCurrentStepOnly = (): Record<string, string> => {
    switch (currentStep) {
      case 1:
        return validateStep1(formState);
      case 2:
        return validateStep2(formState);
      case 3:
        return validateStep3(formState);
      case 4:
        return validateStep4(formState);
      case 5:
        return validateStep5(formState);
      case 6:
        return isStep6Active(formState.loanType, formState.loanAmount)
          ? validateStep6(formState)
          : {};
      case 7:
        return validateStep7(formState);
      case 8:
        return validateStep8(formState);
      default:
        return {};
    }
  };

  // Navigation handlers
  const handleNext = () => {
    const stepErrors = validateCurrentStepOnly();
    if (Object.keys(stepErrors).length > 0) {
      // Mark all fields of current step as blurred to trigger validation display
      const allBlurred: Record<string, boolean> = { ...blurredFields };
      Object.keys(stepErrors).forEach((key) => {
        allBlurred[key] = true;
      });
      setBlurredFields(allBlurred);
      setErrors(stepErrors);
      
      // Auto-focus first error field for screen readers and accessibility
      const firstErrorKey = Object.keys(stepErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.focus();
      }
      return;
    }

    // Go to next step, handle skip of Step 6
    let nextStep = currentStep + 1;
    if (nextStep === 6 && !isStep6Active(formState.loanType, formState.loanAmount)) {
      nextStep = 7;
    }

    if (nextStep <= 8) {
      startTransition(() => {
        setCurrentStep(nextStep);
        setBlurredFields({});
      });
      
      // Set accessibility focus to top of main wizard content container
      setTimeout(() => {
        const titleEl = document.getElementById("wizard-title");
        if (titleEl) titleEl.focus();
      }, 50);
    }
  };

  const handlePrev = () => {
    let prevStep = currentStep - 1;
    if (prevStep === 6 && !isStep6Active(formState.loanType, formState.loanAmount)) {
      prevStep = 5;
    }

    if (prevStep >= 1) {
      startTransition(() => {
        setCurrentStep(prevStep);
        setBlurredFields({});
        setErrors({});
      });

      setTimeout(() => {
        const titleEl = document.getElementById("wizard-title");
        if (titleEl) titleEl.focus();
      }, 50);
    }
  };

  const handleManualSave = async () => {
    await saveDraft();
    setToastMessage(`Draft manual save complete!`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleResume = async () => {
    if (!resumeModalData) return;
    try {
      const decrypted = await decryptData(resumeModalData.encryptedState);
      const parsed = JSON.parse(decrypted);
      
      // Re-validate loaded draft against validators to ensure integrity
      const allValidationErrors = validateAllSteps(parsed);
      const hasMajorIntegrityError = Object.values(allValidationErrors).some(
        (errObj, idx) => {
          // If previous steps have errors, fail integrity check (except current/future steps)
          return idx + 1 < resumeModalData.step && Object.keys(errObj).length > 0;
        }
      );

      if (hasMajorIntegrityError) {
        alert("Integrity check failed: Selected draft contains outdated or corrupted values. Starting fresh.");
        handleStartFresh();
        return;
      }

      setFormState(parsed);
      setCurrentStep(resumeModalData.step);
      setResumeModalData(null);
      setToastMessage("Application restored successfully!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to decrypt or restore state:", err);
      alert("Corrupted backup detected. Restoring clean profile.");
      handleStartFresh();
    }
  };

  const handleStartFresh = () => {
    if (resumeModalData) {
      clearDraft(resumeModalData.loanType);
    }
    clearAllDrafts();
    setFormState(INITIAL_FORM_STATE);
    setCurrentStep(1);
    setResumeModalData(null);
  };

  const handleSessionExpired = () => {
    clearAllDrafts();
    setFormState(INITIAL_FORM_STATE);
    setCurrentStep(1);
    setResumeModalData(null);
    setErrors({});
    setBlurredFields({});
  };

  const handleSubmitApplication = () => {
    // Perform final check of all 8 steps
    const stepErrors = validateAllSteps(formState);
    const hasAnyErrors = Object.values(stepErrors).some(
      (errs) => Object.keys(errs).length > 0
    );

    if (hasAnyErrors) {
      // Flatten error map and notify
      const flatErrors: Record<string, string> = {};
      Object.keys(stepErrors).forEach((stepNum) => {
        Object.assign(flatErrors, stepErrors[Number(stepNum)]);
      });
      setErrors(flatErrors);
      alert("Application could not be submitted. Please check your inputs across all steps.");
      return;
    }

    // Success! Generate custom reference number
    const uniqueId = "LS-" + Math.floor(100000 + Math.random() * 900000) + "-2026";
    setSuccessRefId(uniqueId);
    setGlobalSuccess(true);
    
    // Clear draft to respect data minimisation principles on final submission
    clearAllDrafts();
  };

  // Skip specifically to step from review
  const jumpToStep = (step: number) => {
    startTransition(() => {
      setCurrentStep(step);
      setBlurredFields({});
      setErrors({});
    });
  };

  // Render current step component
  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1LoanType
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 2:
        return (
          <Step2PersonalInfo
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 3:
        return (
          <Step3KYC
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 4:
        return (
          <Step4Address
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 5:
        return (
          <Step5Employment
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 6:
        return (
          <Step6CoApplicant
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 7:
        return (
          <Step7Documents
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
          />
        );
      case 8:
        return (
          <Step8Review
            formState={formState}
            updateFormState={updateFormState}
            errors={errors}
            registerBlur={registerBlur}
            jumpToStep={jumpToStep}
          />
        );
      default:
        return null;
    }
  };

  // Step headers list
  const stepsList = [
    { num: 1, label: t("step1Short") },
    { num: 2, label: t("step2Short") },
    { num: 3, label: t("step3Short") },
    { num: 4, label: t("step4Short") },
    { num: 5, label: t("step5Short") },
    { num: 6, label: t("step6Short"), conditional: true },
    { num: 7, label: t("step7Short") },
    { num: 8, label: t("step8Short") }
  ];

  // Calculate actual completion percentage for progress bar
  const activeStepCount = stepsList.filter(
    (s) => !s.conditional || isStep6Active(formState.loanType, formState.loanAmount)
  ).length;

  const currentActiveIndex = stepsList
    .filter((s) => !s.conditional || isStep6Active(formState.loanType, formState.loanAmount))
    .findIndex((s) => s.num === currentStep);

  const completionPercentage = Math.round(
    ((currentActiveIndex) / (activeStepCount - 1)) * 100
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 antialiased flex flex-col justify-between" id="app-wrapper">
      
      {/* SESSION SECURITY TIMER */}
      <SessionTimer
        onExpire={handleSessionExpired}
        formState={formState}
        currentStep={currentStep}
      />

      {/* GLOBAL NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 text-zinc-100 text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-zinc-800 animate-fadeIn" role="status">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-300"></span>
          </span>
          {toastMessage}
        </div>
      )}

      {/* HEADER RAIL */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40 px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-semibold text-base tracking-wider">
            L
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight leading-none">LendSwift</h1>
            <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider mt-1 block">{t("subtitle")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5">
            <Globe className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="border-none text-xs font-semibold text-zinc-700 bg-transparent focus:ring-0 cursor-pointer focus:outline-none"
              aria-label={t("selectLanguage")}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-zinc-900 bg-white">
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3.5 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isSaving ? t("submitting") : t("saveDraft")}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* SUBMISSION SUCCESS PORTAL SCREEN */}
        {globalSuccess ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center max-w-xl mx-auto space-y-6 my-12 animate-fadeIn" id="success-portal">
            <div className="w-12 h-12 bg-zinc-50 text-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{t("applicationSubmitted")}</h2>
              <p className="text-sm text-zinc-500">{t("submittedDesc")}</p>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 rounded p-4 inline-block font-mono text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">{t("refIdLabel")}</span>
              <p className="text-base font-medium text-zinc-950 mt-1">{successRefId}</p>
            </div>

            <div className="border-t border-zinc-100 pt-6 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === "hi"
                  ? "आरबीआई डिजिटल लेंडिंग गाइडलाइन्स (सितंबर 2022) के अनुसार, आपकी अंतिम पुनर्भुगतान संरचना, कूलिंग-ऑफ प्रावधानों और शिकायतों के विवरण से युक्त एक प्रमुख तथ्य विवरण (केएफएस) आपके सत्यापित ईमेल पर भेज दिया गया है।"
                  : language === "or"
                  ? "ଆରବିଆଇ ଡିଜିଟାଲ୍ ଋଣ ନିର୍ଦ୍ଦେଶାବଳୀ (ସେପ୍ଟେମ୍ବର ୨୦୨୨) ଅନୁଯାୟୀ, ଆପଣଙ୍କର ଚୂଡ଼ାନ୍ତ ପରିଶୋଧ ଗଠନ, କୁଲିଂ-ଅଫ୍ ବ୍ୟବସ୍ଥା ଏବଂ ଅଭିଯୋଗ ବିବରଣୀ ସମ୍ବଳିତ ଏକ କି-ଫ୍ୟାକ୍ଟ ଷ୍ଟେଟମେଣ୍ଟ (KFS) ଆପଣଙ୍କର ଯାଞ୍ଚ ହୋଇଥିବା ଇମେଲକୁ ପଠାଯାଇଛି।"
                  : "As per the **RBI Digital Lending Guidelines (September 2022)**, a Key Fact Statement (KFS) containing your final repayment structure, cooling-off provisions, and grievances details has been dispatched to your verified email."}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const dataUri = "data:application/pdf;base64,JVBERi0xLjQKJ..." // Mock download
                    const link = document.createElement("a");
                    link.href = dataUri;
                    link.download = `LendSwift_Summary_${successRefId}.pdf`;
                    link.click();
                  }}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 font-medium text-xs rounded transition-colors cursor-pointer"
                >
                  {t("downloadPDF")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSuccess(false);
                    setFormState(INITIAL_FORM_STATE);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs rounded transition-colors cursor-pointer"
                >
                  {t("applyNew")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* ACTIVE APPLICATION FLOW */
          <div className="space-y-6">
            
            {/* STEP NAVIGATION STEP-DOTS */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 space-y-4">
              
              {/* ProgressBar Indicator */}
              <div className="relative">
                <div className="absolute top-4 left-0 right-0 h-[2px] bg-zinc-100 rounded-full -z-0">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>

                <div className="relative z-10 flex justify-between items-center" role="tablist" aria-label="Progress">
                  {stepsList.map((step) => {
                    const isStep6Hidden =
                      step.num === 6 && !isStep6Active(formState.loanType, formState.loanAmount);
                    if (isStep6Hidden) return null;

                    const isCompleted = step.num < currentStep;
                    const isActive = step.num === currentStep;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => {
                          // Allow navigation back to already completed steps
                          if (step.num < currentStep) {
                            jumpToStep(step.num);
                          }
                        }}
                        disabled={step.num > currentStep}
                        className="flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Step ${step.num}: ${step.label}`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-medium text-xs transition-all border ${
                            isCompleted
                              ? "bg-zinc-900 border-zinc-900 text-white"
                              : isActive
                              ? "bg-white border-zinc-900 text-zinc-900 ring-4 ring-zinc-50"
                              : "bg-white border-zinc-200 text-zinc-400"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step.num
                          )}
                        </div>
                        <span
                          className={`hidden md:block text-[10px] font-medium mt-2 tracking-tight transition-all uppercase ${
                            isActive
                              ? "text-zinc-900 font-semibold"
                              : isCompleted
                              ? "text-zinc-700"
                              : "text-zinc-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP WORKSPACE CARD */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8">
              <div id="wizard-title" tabIndex={-1} className="focus:outline-none">
                {renderStepComponent()}
              </div>

              {/* ACTION FOOTER */}
              <div className="border-t border-zinc-100 pt-6 mt-8 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {t("previous")}
                </button>

                <div className="flex gap-2">
                  {currentStep === 8 ? (
                    <button
                      type="button"
                      onClick={handleSubmitApplication}
                      className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {t("submitApplication")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {t("continue")}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RESUME DRAFT MODAL */}
      {resumeModalData && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-8 space-y-6 border border-zinc-200/80 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="resume-title">
            <div className="w-10 h-10 bg-zinc-50 text-zinc-900 rounded-full flex items-center justify-center border border-zinc-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 id="resume-title" className="text-lg font-semibold text-zinc-900 tracking-tight">{t("savedDraftFound")}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {language === "hi"
                  ? `आपके पास एक ${t(resumeModalData.loanType as any) || resumeModalData.loanType} ऋण के लिए एक सहेजा गया, एन्क्रिप्टेड ड्राफ्ट आवेदन है जो अंतिम बार ${new Date(resumeModalData.timestamp).toLocaleString()} को सहेजा गया था।`
                  : language === "or"
                  ? `ଆପଣଙ୍କର ଏକ ${t(resumeModalData.loanType as any) || resumeModalData.loanType} ଋଣ ପାଇଁ ଏକ ସଂରକ୍ଷିତ, ଏନକ୍ରିପ୍ଟ ହୋଇଥିବା ଡ୍ରାଫ୍ଟ ଆବେଦନ ଅଛି ଯାହା ଶେଷ ଥର ପାଇଁ ${new Date(resumeModalData.timestamp).toLocaleString()} ରେ ସଂରକ୍ଷିତ ହୋଇଥିଲା।`
                  : `You have a saved, encrypted draft application for a **${resumeModalData.loanType} Loan** which was last saved on **${new Date(resumeModalData.timestamp).toLocaleString()}**.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartFresh}
                className="w-full px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium text-xs rounded transition-colors cursor-pointer"
              >
                {t("startFresh")}
              </button>
              <button
                type="button"
                onClick={handleResume}
                className="w-full px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                {t("resumeProgress")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGULATORY COMPLIANCE FOOTER CARDS */}
      <footer className="bg-white border-t border-zinc-200/80 py-8 px-6 md:px-8 mt-12 text-[11px] text-zinc-400">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[9px]">{t("coolingOffTitle")}</h4>
            <p>
              {t("coolingOffDesc")}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[9px]">{t("grievanceTitle")}</h4>
            <p>
              {t("grievanceDesc")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
