import React, { useState, useRef, useEffect } from "react";
import { FormState, UploadedFile } from "../types";
import { compressImage, fileToBase64 } from "../utils/imageCompression";

interface StepProps {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  errors: Record<string, string>;
  registerBlur: (field: string) => void;
}

interface DocConfig {
  key: string;
  label: string;
  description: string;
  required: boolean;
  maxSizeMB: number;
}

export default function Step7Documents({
  formState,
  updateFormState,
  errors,
  registerBlur
}: StepProps) {
  const {
    loanType,
    loanAmount,
    employmentType,
    panVerified,
    uploadedFiles,
    applicantSignature
  } = formState;

  // Local state for simulated uploads
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);

  // E-Signature Drawing states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasCleared, setCanvasCleared] = useState(!applicantSignature);
  const [isCanvasFocused, setIsCanvasFocused] = useState(true); // Track screen-capture blur protection

  // Get dynamic documents list based on loan/employment type
  const getDocumentConfigs = (): DocConfig[] => {
    const isSalaried = employmentType === "Salaried";
    const isBusiness = loanType === "Business";
    const isHome = loanType === "Home";

    const configs: DocConfig[] = [];

    // PAN Card Copy
    configs.push({
      key: "panCardCopy",
      label: "PAN Card Copy",
      description: panVerified
        ? "Optional - Your PAN is already verified via KYC"
        : "Required - Upload official PAN card image or PDF (Max 5MB)",
      required: !panVerified,
      maxSizeMB: 5
    });

    // Aadhaar Card
    configs.push({
      key: "aadhaarCardCopy",
      label: "Aadhaar Card (Front & Back)",
      description: "Required - Front and back copies in a single PDF or image (Max 5MB)",
      required: true,
      maxSizeMB: 5
    });

    // Income proof (Salary slips or ITR)
    if (isSalaried) {
      configs.push({
        key: "salarySlips",
        label: "Salary Slips (Last 3 Months)",
        description: "Required - Monthly payslips from your current employer (Max 5MB each)",
        required: true,
        maxSizeMB: 5
      });
    } else {
      configs.push({
        key: "itr",
        label: "Income Tax Returns (Last 2 Years)",
        description: "Required - Acknowledged copy of ITR-V for the last two financial years (Max 5MB each)",
        required: true,
        maxSizeMB: 5
      });
    }

    // Bank Statements
    configs.push({
      key: "bankStatements",
      label: "Bank Statements (Last 6 Months)",
      description: "Required - Detailed statement of salary/primary transaction account (Max 10MB)",
      required: true,
      maxSizeMB: 10
    });

    // Property documents for Home Loans
    if (isHome) {
      configs.push({
        key: "propertyDocs",
        label: "Property & Collateral Documents",
        description: "Required - Sale deed, tax receipt, or builder buyer agreement (Max 10MB)",
        required: true,
        maxSizeMB: 10
      });
    }

    // Business Registration for Business Loans
    if (isBusiness) {
      configs.push({
        key: "businessRegistration",
        label: "Business Registration Certificate",
        description: "Required - GST certificate, MSME Udyam, or Partnership Deed (Max 5MB)",
        required: true,
        maxSizeMB: 5
      });

      if (employmentType === "Business Owner") {
        configs.push({
          key: "gstReturns",
          label: "GST Returns (Last 4 Quarters)",
          description: "Required - GSTR-1 or GSTR-3B filings (Max 5MB each)",
          required: true,
          maxSizeMB: 5
        });
      }
    }

    // Photograph
    configs.push({
      key: "photograph",
      label: "Passport Size Photograph",
      description: "Required - Recent colored passport size photo with a clear background (Max 2MB)",
      required: true,
      maxSizeMB: 2
    });

    return configs;
  };

  const configs = getDocumentConfigs();

  // Handlers for File Selection & Upload Simulation
  const handleFileChange = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
    maxSizeMB: number
  ) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Check count constraint: max 3 files per type
    const currentFiles = uploadedFiles[key] || [];
    if (currentFiles.length + selectedFiles.length > 3) {
      alert("Maximum 3 files are allowed per document category.");
      return;
    }

    // Reset input value so same file can be uploaded again if deleted
    e.target.value = "";

    const newlyProcessedFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate Format (PDF, JPG, PNG)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Only PDF, JPG, and PNG are accepted.`);
        continue;
      }

      // Validate File Size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} exceeds the maximum allowed size of ${maxSizeMB}MB.`);
        continue;
      }

      // Simulate Uploading with progress bar
      setActiveUpload(key, file.name);

      let processedFile: UploadedFile;
      const isImage = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);

      try {
        if (isImage) {
          // Perform image compression (as specified in C4)
          const compResult = await compressImage(file);
          const base64Data = await fileToBase64(compResult.blob);

          processedFile = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            size: compResult.compressedSize,
            originalSize: compResult.originalSize,
            compressedSize: compResult.compressedSize,
            base64: base64Data
          };
        } else {
          // No compression for PDFs
          const base64Data = await fileToBase64(file);
          processedFile = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            size: file.size,
            originalSize: file.size,
            base64: base64Data
          };
        }

        newlyProcessedFiles.push(processedFile);
      } catch (err) {
        console.error("File processing failed:", err);
        alert(`Failed to process ${file.name}`);
      }
    }

    if (newlyProcessedFiles.length > 0) {
      // Complete simulated progress bar
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        setUploadProgress((prev) => ({ ...prev, [key]: currentProgress }));

        if (currentProgress >= 100) {
          clearInterval(interval);
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          setActiveUploadKey(null);

          // Update actual form state
          const existingList = uploadedFiles[key] || [];
          updateFormState({
            uploadedFiles: {
              ...uploadedFiles,
              [key]: [...existingList, ...newlyProcessedFiles]
            }
          });
        }
      }, 200);
    }
  };

  const setActiveUpload = (key: string, name: string) => {
    setActiveUploadKey(key);
    setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
  };

  const deleteFile = (key: string, id: string) => {
    const list = uploadedFiles[key] || [];
    const filtered = list.filter((f) => f.id !== id);
    updateFormState({
      uploadedFiles: {
        ...uploadedFiles,
        [key]: filtered
      }
    });
  };

  // Helper to format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (key: string, e: React.DragEvent, maxSizeMB: number) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    // Simulate standard change handler
    const mockEvent = {
      target: {
        files: droppedFiles,
        value: ""
      }
    } as any;

    handleFileChange(key, mockEvent, maxSizeMB);
  };

  // E-Signature Drawing Helpers
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

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
    setIsCanvasFocused(true); // focus canvas on interaction
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
    ctx.strokeStyle = "#0f172a"; // deep charcoal line
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
    updateFormState({ applicantSignature: "" });
    setCanvasCleared(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      updateFormState({ applicantSignature: "" });
      setCanvasCleared(true);
    } else {
      const base64 = canvas.toDataURL("image/png");
      updateFormState({ applicantSignature: base64 });
      setCanvasCleared(false);
    }
  };

  // Restore signature drawing on load
  useEffect(() => {
    if (applicantSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = applicantSignature;
        setCanvasCleared(false);
      }
    }
  }, []);

  return (
    <div className="space-y-6" id="step7-container">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Documents &amp; E-Signature</h2>
        <p className="text-sm text-slate-500">Upload high-resolution scans of your documents and capture your electronic signature.</p>
      </div>

      {/* Dynamic Documents List */}
      <div className="space-y-5">
        {configs.map((doc) => {
          const files = uploadedFiles[doc.key] || [];
          const progress = uploadProgress[doc.key];
          const hasFiles = files.length > 0;

          return (
            <div
              key={doc.key}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{doc.description}</p>
                </div>
                {hasFiles && (
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 rounded px-2 py-0.5">
                    {files.length} File(s) Added
                  </span>
                )}
              </div>

              {/* Drag and drop zone / Upload Button */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(doc.key, e, doc.maxSizeMB)}
                className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-xl p-5 flex flex-col items-center justify-center text-center relative group"
              >
                <input
                  type="file"
                  id={`file-input-${doc.key}`}
                  multiple
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => handleFileChange(doc.key, e, doc.maxSizeMB)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <svg className="h-6 w-6 text-slate-400 group-hover:text-slate-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-slate-600 font-semibold mt-2">
                  Drag &amp; Drop or <span className="text-blue-600 hover:underline">Browse files</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Accepts PDF, JPG, PNG only (Max: {doc.maxSizeMB}MB)</p>
              </div>

              {/* Upload Progress Bar */}
              {progress !== undefined && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between text-[10px] font-semibold text-blue-700">
                    <span>Compressing &amp; uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Uploaded Files Previews & Thumbnails */}
              {hasFiles && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {files.map((file) => {
                    const isPDF = file.type === "application/pdf";
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2.5 p-2.5 border border-slate-100 bg-slate-50/50 rounded-xl relative group hover:bg-slate-50 transition-all overflow-hidden"
                      >
                        {/* Preview icon/thumbnail */}
                        {isPDF ? (
                          <div className="flex h-10 w-10 items-center justify-center bg-red-50 text-red-600 rounded-lg shrink-0">
                            <span className="text-[10px] font-bold">PDF</span>
                          </div>
                        ) : (
                          <img
                            src={file.base64}
                            alt="thumbnail"
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 object-cover rounded-lg shrink-0 border border-slate-200 bg-white"
                          />
                        )}

                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              Size: {formatBytes(file.size)}
                            </span>
                            {/* Display compression gains if available */}
                            {file.compressedSize && file.originalSize > file.compressedSize && (
                              <span className="text-[9px] text-green-700 font-semibold bg-green-50 px-1 py-0.5 rounded w-fit">
                                Compressed ({Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100)}% saved)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => deleteFile(doc.key, file.id)}
                          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-600 bg-white rounded-full shadow border border-slate-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete File"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Error boundary for this file list */}
              {errors[doc.key] && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1 animate-fadeIn" role="alert" aria-live="polite">
                  <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                  {errors[doc.key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Applicant E-Signature Drawing Box */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Primary Applicant Digital Signature *</h3>
            <p className="text-xs text-slate-500 mt-1">Draw your signature directly onto the secure pad below. The drawing must match your identity.</p>
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            Clear Signature
          </button>
        </div>

        {/* Screen-Capture Blurring and Focus Handler Wrapper */}
        <div
          className="relative border-2 border-dashed border-slate-300 bg-white rounded-xl overflow-hidden shadow-inner flex flex-col items-center"
          onMouseEnter={() => setIsCanvasFocused(true)}
          onMouseLeave={() => setIsCanvasFocused(false)}
        >
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
            className={`touch-none cursor-crosshair max-w-full bg-slate-50/50 transition-all ${
              !isCanvasFocused && applicantSignature ? "blur-[5px]" : ""
            }`}
          />

          {canvasCleared && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5">
              <svg className="h-6 w-6 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-xs">Draw your signature using mouse or touch</span>
            </div>
          )}

          {/* Screen Capture Security Protection Blur Overlay */}
          {!isCanvasFocused && applicantSignature && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <div className="bg-slate-900/80 text-white rounded-lg px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Signature Lock Active
              </div>
            </div>
          )}
        </div>

        {errors.applicantSignature && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1 animate-fadeIn" role="alert" aria-live="polite">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {errors.applicantSignature}
          </p>
        )}
      </div>
    </div>
  );
}
