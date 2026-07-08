import React, { useState, useRef, useEffect } from "react";
import { FormState, UploadedFile } from "../types";
import { compressImage, fileToBase64 } from "../utils/imageCompression";
import { useLanguage } from "../context/LanguageContext";

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
  const { t, language } = useLanguage();
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
      label: language === "hi" ? "पैन कार्ड की प्रति" : language === "or" ? "PAN କାର୍ଡର କପି" : "PAN Card Copy",
      description: panVerified
        ? (language === "hi" ? "वैकल्पिक - आपका पैन पहले से ही केवाईसी के माध्यम से सत्यापित है" : language === "or" ? "ବୈକଳ୍ପିକ - ଆପଣଙ୍କର PAN ପୂର୍ବରୁ KYC ମାଧ୍ୟମରେ ସତ୍ୟାପିତ ହୋଇଛି" : "Optional - Your PAN is already verified via KYC")
        : (language === "hi" ? "आवश्यक - आधिकारिक पैन कार्ड चित्र या पीडीएफ अपलोड करें (अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - ଆଧିକାରୀକ PAN କାର୍ଡ ଚିତ୍ର କିମ୍ବା PDF ଅପଲୋଡ୍ କରନ୍ତୁ (ସର୍ବାଧିକ ୫MB)" : "Required - Upload official PAN card image or PDF (Max 5MB)"),
      required: !panVerified,
      maxSizeMB: 5
    });

    // Aadhaar Card
    configs.push({
      key: "aadhaarCardCopy",
      label: language === "hi" ? "आधार कार्ड (आगे और पीछे)" : language === "or" ? "ଆଧାର କାର୍ଡ (ଆଗ ଏବଂ ପଛ)" : "Aadhaar Card (Front & Back)",
      description: language === "hi" ? "आवश्यक - एक ही पीडीएफ या चित्र में आगे और पीछे की प्रतियां (अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - ଗୋଟିଏ PDF କିମ୍ବା ଚିତ୍ରରେ ଆଗ ଏବଂ ପଛ କପି (ସର୍ବାଧିକ ୫MB)" : "Required - Front and back copies in a single PDF or image (Max 5MB)",
      required: true,
      maxSizeMB: 5
    });

    // Income proof (Salary slips or ITR)
    if (isSalaried) {
      configs.push({
        key: "salarySlips",
        label: language === "hi" ? "वेतन पर्ची (पिछले 3 महीने)" : language === "or" ? "ଦରମା ସ୍ଲିପ୍ (ଶେଷ ୩ ମାସ)" : "Salary Slips (Last 3 Months)",
        description: language === "hi" ? "आवश्यक - आपके वर्तमान नियोक्ता से मासिक वेतन पर्ची (प्रत्येक अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - ଆପଣଙ୍କର ବର୍ତ୍ତମାନର ନିଯୁକ୍ତିଦାତାଙ୍କ ମାସିକ ଦରମା ସ୍ଲିପ୍ (ପ୍ରତ୍ୟେକ ସର୍ବାଧିକ ୫MB)" : "Required - Monthly payslips from your current employer (Max 5MB each)",
        required: true,
        maxSizeMB: 5
      });
    } else {
      configs.push({
        key: "itr",
        label: language === "hi" ? "आयकर रिटर्न (पिछले 2 वर्ष)" : language === "or" ? "ଆୟକର ରିଟର୍ଣ୍ଣ (ଶେଷ ୨ ବର୍ଷ)" : "Income Tax Returns (Last 2 Years)",
        description: language === "hi" ? "आवश्यक - पिछले दो वित्तीय वर्षों के लिए आईटीआर-वी की स्वीकृत प्रति (प्रत्येक अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - ଶେଷ ଦୁଇଟି ଆର୍ଥିକ ବର୍ଷ ପାଇଁ ITR-V ର ସ୍ୱୀକୃତ କପି (ପ୍ରତ୍ୟେକ ସର୍ବାଧିକ ୫MB)" : "Required - Acknowledged copy of ITR-V for the last two financial years (Max 5MB each)",
        required: true,
        maxSizeMB: 5
      });
    }

    // Bank Statements
    configs.push({
      key: "bankStatements",
      label: language === "hi" ? "बैंक विवरण (पिछले 6 महीने)" : language === "or" ? "ବ୍ୟାଙ୍କ ବିବରଣୀ (ଶେଷ ୬ ମାସ)" : "Bank Statements (Last 6 Months)",
      description: language === "hi" ? "आवश्यक - वेतन/प्राथमिक लेनदेन खाते का विस्तृत विवरण (अधिकतम 10MB)" : language === "or" ? "ଆବଶ୍ୟକ - ଦରମା/ପ୍ରାଥମିକ କାରବାର ଆକାଉଣ୍ଟର ବିସ୍ତୃତ ବିବରଣୀ (ସର୍ବାଧିକ ୧୦MB)" : "Required - Detailed statement of salary/primary transaction account (Max 10MB)",
      required: true,
      maxSizeMB: 10
    });

    // Property documents for Home Loans
    if (isHome) {
      configs.push({
        key: "propertyDocs",
        label: language === "hi" ? "संपत्ति और संपार्श्विक दस्तावेज" : language === "or" ? "ସମ୍ପତ୍ତି ଏବଂ ବନ୍ଧକ ଦସ୍ତାବେଜ" : "Property & Collateral Documents",
        description: language === "hi" ? "आवश्यक - बिक्री विलेख, कर रसीद, या बिल्डर खरीदार समझौता (अधिकतम 10MB)" : language === "or" ? "ଆବଶ୍ୟକ - ବିକ୍ରୟ ଦଲିଲ୍, ଟ୍ୟାକ୍ସ ରସିଦ୍, କିମ୍ବା ବିଲ୍ଡର କ୍ରେତା ଚୁକ୍ତିପତ୍ର (ସର୍ବାଧିକ ୧୦MB)" : "Required - Sale deed, tax receipt, or builder buyer agreement (Max 10MB)",
        required: true,
        maxSizeMB: 10
      });
    }

    // Business Registration for Business Loans
    if (isBusiness) {
      configs.push({
        key: "businessRegistration",
        label: language === "hi" ? "व्यवसाय पंजीकरण प्रमाणपत्र" : language === "or" ? "ବ୍ୟବସାୟ ପଞ୍ଜୀକରଣ ପ୍ରମାଣପତ୍ର" : "Business Registration Certificate",
        description: language === "hi" ? "आवश्यक - जीएसटी प्रमाणपत्र, एमएसएमई उद्यम, या साझेदारी विलेख (अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - GST ପ୍ରମାଣପତ୍ର, MSME ଉଦ୍ୟମ, କିମ୍ବା ଅଂଶୀଦାର ଦଲିଲ୍ (ସର୍ବାଧିକ ୫MB)" : "Required - GST certificate, MSME Udyam, or Partnership Deed (Max 5MB)",
        required: true,
        maxSizeMB: 5
      });

      if (employmentType === "Business Owner") {
        configs.push({
          key: "gstReturns",
          label: language === "hi" ? "जीएसटी रिटर्न (पिछले 4 तिमाहियों)" : language === "or" ? "GST ରିଟର୍ଣ୍ଣ (ଶେଷ ୪ ତ୍ରୈମାସିକ)" : "GST Returns (Last 4 Quarters)",
          description: language === "hi" ? "आवश्यक - जीएसटीआर-1 या जीएसटीआर-3बी फाइलिंग (प्रत्येक अधिकतम 5MB)" : language === "or" ? "ଆବଶ୍ୟକ - GSTR-1 କିମ୍ବା GSTR-3B ଫାଇଲିଂ (ପ୍ରତ୍ୟେକ ସର୍ବାଧିକ ୫MB)" : "Required - GSTR-1 or GSTR-3B filings (Max 5MB each)",
          required: true,
          maxSizeMB: 5
        });
      }
    }

    // Photograph
    configs.push({
      key: "photograph",
      label: language === "hi" ? "पासपोर्ट आकार का फोटो" : language === "or" ? "ପାସପୋର୍ଟ ସାଇଜ୍ ଫଟୋଗ୍ରାଫ୍" : "Passport Size Photograph",
      description: language === "hi" ? "आवश्यक - स्पष्ट पृष्ठभूमि के साथ हालिया रंगीन पासपोर्ट आकार की फोटो (अधिकतम 2MB)" : language === "or" ? "ଆବଶ୍ୟକ - ସ୍ପଷ୍ଟ ପୃଷ୍ଠଭୂମି ସହିତ ସାମ୍ପ୍ରତିକ ରଙ୍ଗୀନ ପାସପୋର୍ଟ ସାଇଜ୍ ଫଟୋ (ସର୍ବାଧିକ ୨MB)" : "Required - Recent colored passport size photo with a clear background (Max 2MB)",
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
      alert(
        language === "hi"
          ? "प्रति दस्तावेज़ श्रेणी में अधिकतम 3 फ़ाइलों की अनुमति है।"
          : language === "or"
          ? "ଦସ୍ତାବେଜ ଶ୍ରେଣୀ ପ୍ରତି ସର୍ବାଧିକ ୩ଟି ଫାଇଲ୍ ପାଇଁ ଅନୁମତି ଅଛି।"
          : "Maximum 3 files are allowed per document category."
      );
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
        alert(
          language === "hi"
            ? `फ़ाइल ${file.name} समर्थित नहीं है। केवल PDF, JPG और PNG स्वीकार किए जाते हैं।`
            : language === "or"
            ? `ଫାଇଲ୍ ${file.name} ସମର୍ଥିତ ନୁହେଁ। କେବଳ PDF, JPG ଏବଂ PNG ଗ୍ରହଣ କରାଯାଏ।`
            : `File ${file.name} is not supported. Only PDF, JPG, and PNG are accepted.`
        );
        continue;
      }

      // Validate File Size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(
          language === "hi"
            ? `फ़ाइल ${file.name} अधिकतम अनुमत आकार ${maxSizeMB}MB से अधिक है।`
            : language === "or"
            ? `ଫାଇଲ୍ ${file.name} ସର୍ବାଧିକ ଅନୁମତିତ ଆକାର ${maxSizeMB}MB ରୁ ଅଧିକ ଅଟେ।`
            : `File ${file.name} exceeds the maximum allowed size of ${maxSizeMB}MB.`
        );
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
        alert(
          language === "hi"
            ? `फ़ाइल ${file.name} को संसाधित करने में विफल`
            : language === "or"
            ? `ଫାଇଲ୍ ${file.name} ପ୍ରକ୍ରିୟାକରଣ କରିବାରେ ବିଫଳ`
            : `Failed to process ${file.name}`
        );
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === "hi" ? "दस्तावेज और ई-हस्ताक्षर" : language === "or" ? "ଦସ୍ତାବେଜ ଏବଂ ଇ-ଦସ୍ତଖତ" : "Documents & E-Signature"}
        </h2>
        <p className="text-sm text-slate-500">
          {language === "hi" ? "अपने दस्तावेजों के उच्च-रिज़ॉल्यूशन स्कैन अपलोड करें और अपना इलेक्ट्रॉनिक हस्ताक्षर दर्ज करें।" : language === "or" ? "ଆପଣଙ୍କ ଦସ୍ତାବେଜଗୁଡ଼ିକର ଉଚ୍ଚ-ରେଜୋଲ୍ୟୁସନ ସ୍କାନ ଅପଲୋଡ୍ କରନ୍ତୁ ଏବଂ ଆପଣଙ୍କର ଇଲେକ୍ଟ୍ରୋନିକ ଦସ୍ତଖତ ପ୍ରଦାନ କରନ୍ତୁ।" : "Upload high-resolution scans of your documents and capture your electronic signature."}
        </p>
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
                    {files.length} {language === "hi" ? "फ़ाइलें जोड़ी गईं" : language === "or" ? "ଫାଇଲ୍ ଯୋଡାଗଲା" : "File(s) Added"}
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
                  {language === "hi" ? "खींचें और छोड़ें या " : language === "or" ? "ଡ୍ରାଗ୍ ଏବଂ ଡ୍ରପ୍ କରନ୍ତୁ କିମ୍ବା " : "Drag & Drop or "}
                  <span className="text-blue-600 hover:underline">
                    {language === "hi" ? "फ़ाइलें ब्राउज़ करें" : language === "or" ? "ଫାଇଲ୍ ବ୍ରାଉଜ୍ କରନ୍ତୁ" : "Browse files"}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === "hi" 
                    ? `केवल PDF, JPG, PNG स्वीकार्य (अधिकतम: ${doc.maxSizeMB}MB)` 
                    : language === "or" 
                    ? `କେବଳ PDF, JPG, PNG ଗ୍ରହଣୀୟ (ସର୍ବାଧିକ: ${doc.maxSizeMB}MB)` 
                    : `Accepts PDF, JPG, PNG only (Max: ${doc.maxSizeMB}MB)`}
                </p>
              </div>

              {/* Upload Progress Bar */}
              {progress !== undefined && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between text-[10px] font-semibold text-blue-700">
                    <span>
                      {language === "hi" ? "संकुचित और अपलोड किया जा रहा है..." : language === "or" ? "ସଙ୍କୁଚିତ ଏବଂ ଅପଲୋଡ୍ ହେଉଛି..." : "Compressing & uploading..."}
                    </span>
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
                                {language === "hi" ? "संकुचित" : language === "or" ? "ସଙ୍କୁଚିତ" : "Compressed"} ({Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100)}% saved)
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
            <h3 className="text-sm font-semibold text-slate-800">
              {language === "hi" ? "मुख्य आवेदक का डिजिटल हस्ताक्षर *" : language === "or" ? "ମୁଖ୍ୟ ଆବେଦନକାରୀଙ୍କ ଡିଜିଟାଲ୍ ଦସ୍ତଖତ *" : "Primary Applicant Digital Signature *"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === "hi" 
                ? "नीचे दिए गए सुरक्षित पैड पर सीधे अपना हस्ताक्षर बनाएं। ड्राइंग आपकी पहचान से मेल खानी चाहिए।" 
                : language === "or" 
                ? "ତଳେ ଦିଆଯାଇଥିବା ସୁରକ୍ଷିତ ପ୍ୟାଡରେ ସିଧାସଳଖ ଆପଣଙ୍କ ଦସ୍ତଖତ ଆଙ୍କନ୍ତୁ। ଏହା ଆପଣଙ୍କ ପରିଚୟ ସହ ମେଳ ହେବା ଆବଶ୍ୟକ।" 
                : "Draw your signature directly onto the secure pad below. The drawing must match your identity."}
            </p>
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            {language === "hi" ? "हस्ताक्षर साफ करें" : language === "or" ? "ଦସ୍ତଖତ ସଫା କରନ୍ତୁ" : "Clear Signature"}
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
              <span className="text-xs">
                {language === "hi" ? "माउस या टच का उपयोग करके अपना हस्ताक्षर बनाएं" : language === "or" ? "ମାଉସ୍ କିମ୍ବା ସ୍ପର୍ଶ ବ୍ୟବହାର କରି ଆପଣଙ୍କ ଦସ୍ତଖତ ଆଙ୍କନ୍ତୁ" : "Draw your signature using mouse or touch"}
              </span>
            </div>
          )}

          {/* Screen Capture Security Protection Blur Overlay */}
          {!isCanvasFocused && applicantSignature && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <div className="bg-slate-900/80 text-white rounded-lg px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {language === "hi" ? "सुरक्षित हस्ताक्षर लॉक सक्रिय" : language === "or" ? "ସୁରକ୍ଷିତ ଦସ୍ତଖତ ଲକ୍ ସକ୍ରିୟ" : "Secure Signature Lock Active"}
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
