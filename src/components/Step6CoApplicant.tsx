import React, { useState, useRef, useEffect } from "react";
import { FormState } from "../types";
import { validatePAN } from "../utils/validators";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

export default function Step6CoApplicant({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const {
    maritalStatus,
    coApplicantName,
    coApplicantRelationship,
    coApplicantPan,
    coApplicantIncome,
    coApplicantConsent,
    coApplicantSignature,
    coApplicantPanVerified
  } = formState;

  const [panLoading, setPanLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasCleared, setCanvasCleared] = useState(!coApplicantSignature);

  // Cross-step dependency: If Married, Spouse is the default option
  useEffect(() => {
    if (maritalStatus === "Married" && !coApplicantRelationship) {
      updateFormState({ coApplicantRelationship: "Spouse" });
    }
  }, [maritalStatus, coApplicantRelationship]);

  // PAN Verification Simulation on Blur
  const handlePanBlur = () => {
    registerBlur("coApplicantPan");
    const cleanPan = coApplicantPan.toUpperCase().trim();
    if (!cleanPan) return;

    const panCheck = validatePAN(cleanPan, "Personal"); // co-applicant is always "P" (individual)
    if (panCheck.valid) {
      if (!coApplicantPanVerified) {
        setPanLoading(true);
        setTimeout(() => {
          setPanLoading(false);
          updateFormState({ coApplicantPanVerified: true, coApplicantPan: cleanPan });
        }, 1500);
      }
    } else {
      updateFormState({ coApplicantPanVerified: false, coApplicantPan: cleanPan });
    }
  };

  // Canvas Drawing Methods
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse or touch
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e293b"; // dark slate line
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setCanvasCleared(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateFormState({ coApplicantSignature: "" });
    setCanvasCleared(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Check if canvas is blank
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      updateFormState({ coApplicantSignature: "" });
      setCanvasCleared(true);
    } else {
      const base64 = canvas.toDataURL("image/png");
      updateFormState({ coApplicantSignature: base64 });
      setCanvasCleared(false);
    }
  };

  // Restore saved signature on component load if available
  useEffect(() => {
    if (coApplicantSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = coApplicantSignature;
        setCanvasCleared(false);
      }
    }
  }, []);

  return (
    <div className="space-y-6" id="step6-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Co-Applicant &amp; Guarantor Details</h2>
        <p className="text-sm text-slate-500">Provide details for your co-borrower/guarantor as required for your application.</p>
      </div>

      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Co-Borrower Requirements Triggered</span>
        </div>
        <p className="text-xs text-blue-700 leading-normal">
          Based on your loan details, a co-applicant is mandatory to enhance credit eligibility and process your application. Both parties are equally responsible for repayment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Co-Applicant Name */}
        <div className="space-y-2">
          <label htmlFor="coApplicantName" className="block text-sm font-medium text-slate-700">
            Co-Applicant Full Name *
          </label>
          <input
            type="text"
            id="coApplicantName"
            name="coApplicantName"
            value={coApplicantName}
            onChange={(e) => updateFormState({ coApplicantName: e.target.value })}
            onBlur={() => registerBlur("coApplicantName")}
            placeholder="As per co-applicant's PAN"
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.coApplicantName ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
          />
          {errors.coApplicantName && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.coApplicantName}
            </p>
          )}
        </div>

        {/* Co-Applicant Relationship */}
        <div className="space-y-2">
          <label htmlFor="coApplicantRelationship" className="block text-sm font-medium text-slate-700">
            Relationship with Primary Applicant *
          </label>
          <select
            id="coApplicantRelationship"
            name="coApplicantRelationship"
            value={coApplicantRelationship}
            onChange={(e) => updateFormState({ coApplicantRelationship: e.target.value })}
            onBlur={() => registerBlur("coApplicantRelationship")}
            className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.coApplicantRelationship ? "border-red-500" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <option value="" disabled>Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Business Partner">Business Partner</option>
          </select>
          {errors.coApplicantRelationship && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.coApplicantRelationship}
            </p>
          )}
        </div>

        {/* Co-Applicant PAN */}
        <div className="space-y-2">
          <label htmlFor="coApplicantPan" className="block text-sm font-medium text-slate-700">
            Co-Applicant PAN Number *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <input
              type="text"
              id="coApplicantPan"
              name="coApplicantPan"
              value={coApplicantPan}
              onChange={(e) => updateFormState({ coApplicantPan: e.target.value.toUpperCase().trim(), coApplicantPanVerified: false })}
              onBlur={handlePanBlur}
              placeholder="e.g. PQRST1234F"
              maxLength={10}
              className={`block w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest ${
                errors.coApplicantPan ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
            {panLoading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
              </div>
            )}
          </div>
          {coApplicantPanVerified && !panLoading && (
            <div className="flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded border border-green-100 w-fit animate-fadeIn mt-1">
              Co-Applicant PAN Verified
            </div>
          )}
          {errors.coApplicantPan && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.coApplicantPan}
            </p>
          )}
        </div>

        {/* Co-Applicant Income */}
        <div className="space-y-2">
          <label htmlFor="coApplicantIncome" className="block text-sm font-medium text-slate-700">
            Co-Applicant Monthly Net Income (₹) *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400">₹</span>
            </div>
            <input
              type="number"
              id="coApplicantIncome"
              name="coApplicantIncome"
              value={coApplicantIncome !== undefined ? coApplicantIncome : ""}
              onChange={(e) => updateFormState({ coApplicantIncome: parseInt(e.target.value) || 0 })}
              onBlur={() => registerBlur("coApplicantIncome")}
              placeholder="e.g. 35000 (enter 0 if none)"
              className={`block w-full pl-8 pr-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.coApplicantIncome ? "border-red-500" : "border-slate-200 hover:border-slate-300"
              }`}
            />
          </div>
          {errors.coApplicantIncome && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.coApplicantIncome}
            </p>
          )}
        </div>
      </div>

      {/* Co-applicant Consent and Digital E-Signature */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Co-Borrower Legal Consent &amp; E-Signature</h3>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="coApplicantConsent"
            name="coApplicantConsent"
            checked={coApplicantConsent}
            onChange={(e) => updateFormState({ coApplicantConsent: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="coApplicantConsent" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
            I hereby confirm that I consent to be added as a co-borrower / guarantor for this digital loan application. I authorize LendSwift to pull and review my credit reports (CIBIL/Equifax) and verify my PAN details online. I declare that the details provided are true to the best of my knowledge.
          </label>
        </div>
        {errors.coApplicantConsent && (
          <p className="text-xs text-red-600 flex items-center gap-1" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.coApplicantConsent}
          </p>
        )}

        {/* Signature Drawing Canvas Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-700">Co-Applicant Digital Signature Drawing *</label>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer hover:underline"
            >
              Clear Signature
            </button>
          </div>

          <div className="relative border-2 border-dashed border-slate-300 bg-white rounded-xl overflow-hidden shadow-inner flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="touch-none cursor-crosshair max-w-full bg-slate-50/50"
            />
            {canvasCleared && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5">
                <svg className="h-6 w-6 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-xs">Draw your signature using mouse or touch</span>
              </div>
            )}
          </div>
          {errors.coApplicantSignature && (
            <p className="text-xs text-red-600 flex items-center gap-1" role="alert" aria-live="polite">
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
              {errors.coApplicantSignature}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
