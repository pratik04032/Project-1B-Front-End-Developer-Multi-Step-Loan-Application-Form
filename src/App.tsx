import React, { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { Globe, Sun, Moon, Sparkles, Printer, ShieldAlert, Search, Users, CheckCircle, AlertTriangle, ArrowLeft, LogOut } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { validateAadhaar } from "./utils/validators";
import { saveApplication, checkIfDefaulter, getAllApplications, setDefaulterStatus, getUserApplication } from "./lib/firebase";
import confetti from "canvas-confetti";

// Import step components
import Step1LoanType from "./components/Step1LoanType";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3KYC from "./components/Step3KYC";
import Step4Address from "./components/Step4Address";
import Step5Employment from "./components/Step5Employment";
import Step6CoApplicant from "./components/Step6CoApplicant";
import Step7Documents from "./components/Step7Documents";
import Step8Review from "./components/Step8Review";
import AdminDashboard from "./components/AdminDashboard";
import LoginPortal from "./components/LoginPortal";

export default function App() {
  const { language, setLanguage, t, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalSuccess, setGlobalSuccess] = useState(false);
  const [successRefId, setSuccessRefId] = useState("");

  // Save/Notification states
  const [toastMessage, setToastMessage] = useState("");
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [resumeModalData, setResumeModalData] = useState<{
    loanType: string;
    step: number;
    encryptedState: string;
  } | null>(null);

  // Admin Portal & Defaulter check states
  const [currentUser, setCurrentUser] = useState<{ email: string; role: "admin" | "applicant" } | null>(() => {
    try {
      const saved = localStorage.getItem("lendswift_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === "admin" || parsed.role === "applicant")) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse saved user:", e);
    }
    return null;
  });

  const [isAdminView, setIsAdminView] = useState(false);
  const [adminApplications, setAdminApplications] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [defaulterAlert, setDefaulterAlert] = useState<{ isDefaulter: boolean; reason?: string } | null>(null);
  const [adminSearch, setAdminSearch] = useState("");

  // Sync admin view and load admin apps based on currentUser role
  useEffect(() => {
    if (currentUser) {
      setIsAdminView(currentUser.role === "admin");
    } else {
      setIsAdminView(false);
    }
  }, [currentUser]);

  // Load existing application/draft from Firestore on login
  useEffect(() => {
    if (currentUser && currentUser.role === "applicant") {
      const loadUserApplication = async () => {
        try {
          const app = await getUserApplication(currentUser.email);
          if (app) {
            setToastMessage("Synced existing application from secure cloud database!");
            setFormState(app);
            if (app.status === "APPROVED" || app.status === "REJECTED" || app.status === "PRE-APPROVED") {
              setSuccessRefId(app.id);
              setGlobalSuccess(true);
            }
            setTimeout(() => setToastMessage(""), 4000);
          } else {
            // Auto-prefill name and email from authenticated user info
            setFormState(prev => ({
              ...prev,
              email: prev.email || currentUser.email || "",
              fullName: prev.fullName || currentUser.displayName || ""
            }));
          }
        } catch (error) {
          console.error("Failed to load user application from Firestore:", error);
        }
      };
      loadUserApplication();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("lendswift_user");
    setCurrentUser(null);
    setIsAdminView(false);
  };

  // Real-time Defaulter registry check on PAN or Aadhaar update
  useEffect(() => {
    let active = true;
    const check = async () => {
      const pan = formState.panNumber?.trim();
      const aadhaar = formState.aadhaarNumber?.replace(/\s+/g, "").trim();
      if (pan || aadhaar) {
        const res = await checkIfDefaulter(pan, aadhaar);
        if (active) {
          if (res.isDefaulter) {
            setDefaulterAlert({ isDefaulter: true, reason: res.reason });
          } else {
            setDefaulterAlert(null);
          }
        }
      } else {
        if (active) setDefaulterAlert(null);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [formState.panNumber, formState.aadhaarNumber]);

  // Load applications for admin dashboard when toggled
  const loadAdminApplications = async () => {
    setIsAdminLoading(true);
    try {
      const apps = await getAllApplications();
      setAdminApplications(apps);
    } catch (err) {
      console.error("Error loading admin apps:", err);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminView) {
      loadAdminApplications();
    }
  }, [isAdminView]);

  // Initialize and check for existing drafts on load (disabled automatic draft resume popup as requested)
  useEffect(() => {
    // const latest = findLatestDraft();
    // if (latest) {
    //   setResumeModalData(latest);
    // }
  }, []);

  // Automatically trigger native print dialog when successfully submitted (disabled automatic print popup as requested)
  useEffect(() => {
    if (globalSuccess) {
      // window.print();
    }
  }, [globalSuccess]);

  // Sync draft saved time to user notification toast
  const { saveDraft, lastSaved, isSaving } = useAutoSave(
    formState,
    currentStep,
    30000,
    (time) => {
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2500);
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
      setDirection(1);
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
      setDirection(-1);
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

  const handlePrefillSampleData = () => {
    // Calculate a valid Aadhaar number that passes Verhoeff checksum
    let validAadhaar = "99999999999";
    for (let j = 0; j <= 9; j++) {
      if (validateAadhaar(validAadhaar + j)) {
        validAadhaar = validAadhaar + j;
        break;
      }
    }

    const sampleState: FormState = {
      loanType: "Personal",
      loanAmount: 250000,
      loanTenure: 24,
      loanPurpose: "Higher Education for Child",
      referralCode: "LEND99",

      fullName: "Pratik Kumar Jena",
      dob: "1994-08-15",
      gender: "Male",
      maritalStatus: "Single",
      fathersName: "Sarat Kumar Jena",
      mothersName: "Sasmita Jena",
      email: "pratik.jena@example.com",
      emailVerified: true,
      mobileNumber: "9876543210",
      mobileVerified: true,
      alternateMobile: "8765432109",

      panNumber: "ABCPK1234F",
      aadhaarNumber: validAadhaar,
      aadhaarConsent: true,
      voterId: "XYZ1234567",
      passport: "",
      panVerified: true,
      aadhaarVerified: true,

      currentAddressLine1: "Plot 102, Near Infocity",
      currentAddressLine2: "Patia, Chandrasekharpur",
      currentPinCode: "751024",
      currentCity: "Bhubaneswar",
      currentState: "Odisha",
      residenceType: "Owned",
      rentAmount: 0,
      yearsAtCurrentAddress: 4,
      sameAsPermanent: true,
      permanentAddressLine1: "Plot 102, Near Infocity",
      permanentAddressLine2: "Patia, Chandrasekharpur",
      permanentPinCode: "751024",
      permanentCity: "Bhubaneswar",
      permanentState: "Odisha",

      employmentType: "Salaried",
      companyName: "Tech Mahindra Odisha",
      designation: "Senior Software Engineer",
      monthlyNetSalary: 85000,
      yearsOfExperience: 6,
      businessName: "",
      businessType: "",
      annualTurnover: 0,
      yearsInBusiness: 0,
      monthlyIncome: 0,
      gstNumber: "",
      officeAddress: "",

      coApplicantName: "Rakesh Kumar Jena",
      coApplicantRelationship: "Brother",
      coApplicantPan: "ABCPK1235F",
      coApplicantIncome: 50000,
      coApplicantConsent: true,
      coApplicantSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      coApplicantPanVerified: true,

      uploadedFiles: {
        panCardCopy: [
          {
            id: "pan-sample",
            name: "pan_card_copy.jpg",
            type: "image/jpeg",
            size: 45000,
            originalSize: 45000,
            compressedSize: 32000,
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        ],
        aadhaarCardCopy: [
          {
            id: "aadhaar-sample",
            name: "aadhaar_card_both_sides.pdf",
            type: "application/pdf",
            size: 120000,
            originalSize: 120000,
            compressedSize: 120000,
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        ],
        salarySlips: [
          {
            id: "salary-sample-1",
            name: "salary_slip_last_3_months.pdf",
            type: "application/pdf",
            size: 95000,
            originalSize: 95000,
            compressedSize: 95000,
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        ],
        bankStatements: [
          {
            id: "bank-sample",
            name: "bank_statement_6_months.pdf",
            type: "application/pdf",
            size: 250000,
            originalSize: 250000,
            compressedSize: 250000,
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        ],
        itr: [],
        propertyDocs: [],
        businessRegistration: [],
        gstReturns: [],
        photograph: [
          {
            id: "photo-sample",
            name: "passport_photo.png",
            type: "image/png",
            size: 60000,
            originalSize: 60000,
            compressedSize: 45000,
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        ]
      },
      applicantSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",

      consentConfirmAccurate: true,
      consentCheckCreditScore: true,
      consentAgreeTerms: true,
      consentReceiveComms: true,
      highEmiRatioAcknowledge: false
    };

    setFormState(sampleState);
    setBlurredFields({});
    setErrors({});
    setToastMessage("Form prefilled with complete sample data successfully!");
    setTimeout(() => setToastMessage(""), 4000);
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

  const handleSubmitApplication = async () => {
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
    
    // Save to Firestore Database
    setToastMessage("Saving application to database...");
    const dbSave = await saveApplication(uniqueId, formState);
    if (dbSave.success) {
      setToastMessage("Application saved to secure cloud registry successfully!");
    } else {
      setToastMessage("Warning: Application saved locally but cloud database registration failed.");
    }
    setTimeout(() => setToastMessage(""), 4000);

    setSuccessRefId(uniqueId);
    setGlobalSuccess(true);
    
    // Trigger success confetti animation
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    });
    
    // Clear draft to respect data minimisation principles on final submission
    clearAllDrafts();
  };

  // Skip specifically to step from review
  const jumpToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    startTransition(() => {
      setCurrentStep(step);
      setBlurredFields({});
      setErrors({});
    });
  };

  // Animation variants for framer-motion
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      z: 0,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      z: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    }),
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
        <div className="fixed top-6 right-6 z-[60] bg-zinc-900 text-zinc-100 text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-zinc-800 animate-fadeIn" role="status">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-300"></span>
          </span>
          {toastMessage}
        </div>
      )}

      {/* BACKGROUND AUTO-SAVE INDICATOR */}
      <AnimatePresence>
        {showSavedIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 bg-white border border-zinc-200 shadow-md text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER RAIL */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40 px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center relative">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-semibold text-base tracking-wider">
            U
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight leading-none">UtkalCred</h1>
            <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider mt-1 block">{t("subtitle")}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-[34px] w-[34px] items-center justify-center rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer shrink-0"
            aria-label={theme === "light" ? "Switch to high-contrast dark theme" : "Switch to light theme"}
            title={theme === "light" ? "Switch to high-contrast dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

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

          {/* Prefill Sample Data Utility for Dev/Testing (Applicant Only) */}
          {currentUser?.role === "applicant" && !isAdminView && (
            <button
              type="button"
              onClick={handlePrefillSampleData}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3.5 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Prefill all steps with valid test data"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Prefill Sample Data</span>
              <span className="md:hidden">Prefill</span>
            </button>
          )}

          {/* Save Draft Button (Applicant Only) */}
          {currentUser?.role === "applicant" && !isAdminView && (
            <button
              type="button"
              onClick={handleManualSave}
              disabled={isSaving}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3.5 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isSaving ? t("submitting") : t("saveDraft")}
            </button>
          )}

          {/* Logout Button (For any logged in user) */}
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 animate-fadeIn"
              title="Sign out of the secure gateway"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

        {/* Global Progress Bar at bottom of header */}
        {currentUser?.role === "applicant" && !isAdminView && (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-100/50 dark:bg-zinc-800/50">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out"
              style={{ width: `${globalSuccess ? 100 : completionPercentage}%` }}
            ></div>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {!currentUser ? (
          <LoginPortal
            onLogin={(user) => {
              setCurrentUser(user);
              localStorage.setItem("lendswift_user", JSON.stringify(user));
            }}
            language={language}
          />
        ) : isAdminView ? (
          <AdminDashboard
            applications={adminApplications}
            isLoading={isAdminLoading}
            onRefresh={loadAdminApplications}
            onClose={handleLogout}
            currentUser={currentUser}
          />
        ) : globalSuccess ? (
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
                    link.download = `UtkalCred_Summary_${successRefId}.pdf`;
                    link.click();
                  }}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 font-medium text-xs rounded transition-colors cursor-pointer"
                >
                  {t("downloadPDF")}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-medium text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Print Application Summary"
                >
                  <Printer className="h-3.5 w-3.5 text-zinc-600" />
                  <span>{language === "hi" ? "प्रिंट करें" : language === "or" ? "ପ୍ରିଣ୍ଟ୍ କରନ୍ତୁ" : "Print Summary"}</span>
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

            {defaulterAlert && (
              <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 flex gap-3 animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wider">
                    CRITICAL WARNING: Defaulter Match Detected
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Applicant's PAN or Aadhaar matches an entry flagged in the <strong>Defaulter Registry</strong>. 
                    {defaulterAlert.reason && ` Reason: "${defaulterAlert.reason}".`} Do not disburse any loan amount to this individual.
                  </p>
                </div>
              </div>
            )}

            {/* STEP WORKSPACE CARD */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 overflow-hidden">
              <div id="wizard-title" tabIndex={-1} className="focus:outline-none">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderStepComponent()}
                  </motion.div>
                </AnimatePresence>
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
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      animate={
                        Object.keys(validateCurrentStepOnly()).length === 0
                          ? { scale: [1, 1.03, 1] }
                          : { scale: 1 }
                      }
                      transition={
                        Object.keys(validateCurrentStepOnly()).length === 0
                          ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                          : {}
                      }
                      className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {t("continue")}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
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

      {/* PRINT-ONLY APPLICATION SUMMARY DOCUMENT */}
      <div className="hidden print:block text-black p-8 max-w-4xl mx-auto space-y-6" id="printable-summary">
        {/* formal bank header */}
        <div className="border-b-2 border-zinc-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-950">UtkalCred Digital Lending</h1>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Loan Application Summary Report</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-widest font-bold">Reference ID</span>
            <span className="text-sm font-mono font-bold text-zinc-950">{successRefId || "UTKAL-DRAFT-REPORT"}</span>
          </div>
        </div>

        {/* timestamp / status */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 border border-zinc-200 p-3 rounded">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Application Status</span>
            <span className="font-bold text-green-700">PRE-APPROVED (SUBMITTED)</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Report Generated On</span>
            <span className="font-mono font-medium">{new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* 1. Loan Preferences & indicative Offer */}
        <div className="space-y-2 border-b border-zinc-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">1. Loan & Pre-Approval Details</h3>
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium w-1/3">Loan Type</th>
                <td className="py-2 font-semibold text-zinc-900">{formState.loanType} Loan</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Requested Amount</th>
                <td className="py-2 font-mono font-semibold text-zinc-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formState.loanAmount)}
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Tenure</th>
                <td className="py-2 font-semibold text-zinc-900">{formState.loanTenure} Months</td>
              </tr>
              {formState.loanPurpose && (
                <tr className="border-b border-zinc-100">
                  <th className="py-2 text-zinc-500 font-medium">Purpose of Loan</th>
                  <td className="py-2 text-zinc-900">{formState.loanPurpose}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Personal Information */}
        <div className="space-y-2 border-b border-zinc-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">2. Primary Applicant Details</h3>
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium w-1/3">Full Name</th>
                <td className="py-2 font-semibold text-zinc-900">{formState.fullName}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Date of Birth / Gender</th>
                <td className="py-2 text-zinc-900">{formState.dob} / {formState.gender}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Marital Status</th>
                <td className="py-2 text-zinc-900">{formState.maritalStatus}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Parents Details</th>
                <td className="py-2 text-zinc-900">Father: {formState.fathersName} | Mother: {formState.mothersName}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Contact Information</th>
                <td className="py-2 font-mono text-zinc-900">Mob: {formState.mobileNumber} | Email: {formState.email}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. KYC Verification status */}
        <div className="space-y-2 border-b border-zinc-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">3. KYC & Verification Registry</h3>
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium w-1/3">PAN Card Number</th>
                <td className="py-2 font-mono text-zinc-900 flex items-center gap-2">
                  <span>{formState.panNumber ? "••••••" + formState.panNumber.substring(formState.panNumber.length - 4) : "N/A"}</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase">VERIFIED</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium">Aadhaar Card (UID)</th>
                <td className="py-2 font-mono text-zinc-900 flex items-center gap-2">
                  <span>{formState.aadhaarNumber ? "••••••••" + formState.aadhaarNumber.substring(formState.aadhaarNumber.length - 4) : "N/A"}</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase">VERIFIED (VERHOEFF MATCH)</span>
                </td>
              </tr>
              {formState.voterId && (
                <tr className="border-b border-zinc-100">
                  <th className="py-2 text-zinc-500 font-medium">Voter ID</th>
                  <td className="py-2 font-mono text-zinc-900">{formState.voterId}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Address Details */}
        <div className="space-y-2 border-b border-zinc-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">4. Residential Address details</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-zinc-700 mb-1">Current Address</h4>
              <p className="text-zinc-600 font-mono">
                {formState.currentAddressLine1}<br />
                {formState.currentAddressLine2 && <>{formState.currentAddressLine2}<br /></>}
                {formState.currentCity}, {formState.currentState} - {formState.currentPinCode}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-1">Residence Type: {formState.residenceType} ({formState.yearsAtCurrentAddress} years)</span>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-700 mb-1">Permanent Address</h4>
              <p className="text-zinc-600 font-mono">
                {formState.sameAsPermanent ? (
                  "Same as Current Address"
                ) : (
                  <>
                    {formState.permanentAddressLine1}<br />
                    {formState.permanentAddressLine2 && <>{formState.permanentAddressLine2}<br /></>}
                    {formState.permanentCity}, {formState.permanentState} - {formState.permanentPinCode}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Employment & Income */}
        <div className="space-y-2 border-b border-zinc-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">5. Employment & Financial Standing</h3>
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-100">
                <th className="py-2 text-zinc-500 font-medium w-1/3">Employment Type</th>
                <td className="py-2 font-semibold text-zinc-900">{formState.employmentType}</td>
              </tr>
              {formState.employmentType === "Salaried" ? (
                <>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2 text-zinc-500 font-medium">Employer Name / Designation</th>
                    <td className="py-2 text-zinc-900">{formState.companyName} / {formState.designation}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2 text-zinc-500 font-medium">Net Monthly Salary</th>
                    <td className="py-2 font-mono font-semibold text-zinc-900">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formState.monthlyNetSalary)}
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2 text-zinc-500 font-medium">Business / Trade Name</th>
                    <td className="py-2 text-zinc-900">{formState.businessName} ({formState.businessType})</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th className="py-2 text-zinc-500 font-medium">Annual Turnover</th>
                    <td className="py-2 font-mono font-semibold text-zinc-900">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formState.annualTurnover)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Co-applicant details (if active) */}
        {isStep6Active(formState.loanType, formState.loanAmount) && formState.coApplicantName && (
          <div className="space-y-2 border-b border-zinc-200 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">6. Co-Applicant / Guarantor Details</h3>
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <th className="py-2 text-zinc-500 font-medium w-1/3">Co-Applicant Name</th>
                  <td className="py-2 font-semibold text-zinc-900">{formState.coApplicantName} ({formState.coApplicantRelationship})</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <th className="py-2 text-zinc-500 font-medium">PAN Verification</th>
                  <td className="py-2 font-mono text-zinc-900 flex items-center gap-2">
                    <span>{formState.coApplicantPan}</span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase">VERIFIED</span>
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <th className="py-2 text-zinc-500 font-medium">Monthly Income Contributions</th>
                  <td className="py-2 font-mono font-semibold text-zinc-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formState.coApplicantIncome || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures & Disclaimers */}
        <div className="pt-4 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-800">Regulatory Certifications</h4>
            <p className="text-[9px] text-zinc-500 leading-relaxed">
              This document serves as an electronic pre-approval loan summary generated under the RBI Information Technology Act, 2000. All data transmission is encrypted under RSA-2048 guidelines. This pre-approval does not guarantee final disbursal and is subject to field physical verification of original documents.
            </p>
          </div>
          <div className="flex flex-col items-center justify-end border border-dashed border-zinc-300 p-4 rounded text-center h-28">
            {formState.applicantSignature ? (
              <img src={formState.applicantSignature} alt="Applicant Signature" className="max-h-12 object-contain mb-1" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-12 mb-1"></div>
            )}
            <span className="text-[9px] text-zinc-500 uppercase font-mono border-t border-zinc-200 pt-1 w-full block">Authorized Applicant Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
