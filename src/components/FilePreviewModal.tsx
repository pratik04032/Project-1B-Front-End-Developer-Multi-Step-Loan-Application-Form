import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadedFile } from "../types";

interface FilePreviewModalProps {
  file: UploadedFile | null;
  rotation: number;
  onClose: () => void;
  onRotate: () => void;
  language: "en" | "hi" | "or";
}

export default function FilePreviewModal({
  file,
  rotation,
  onClose,
  onRotate,
  language
}: FilePreviewModalProps) {
  // Helper to format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 inline-block"></span>
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === "hi" ? "आकार: " : language === "or" ? "ଆକାର: " : "Size: "}{" "}
                  {formatBytes(file.size)} | {file.type}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-all cursor-pointer"
                title="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="p-6 bg-slate-900 flex-1 overflow-auto flex items-center justify-center min-h-[40vh] relative select-none">
              {file.type === "application/pdf" ? (
                <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
                  <iframe
                    src={file.base64}
                    title="PDF Preview"
                    className="w-full h-[55vh] rounded-xl bg-white border border-slate-800"
                  />
                  <a
                    href={file.base64}
                    download={file.name}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {language === "hi"
                      ? "दस्तावेज़ डाउनलोड करें"
                      : language === "or"
                      ? "ଦସ୍ତାବେଜ ଡାଉନଲୋଡ୍ କରନ୍ତୁ"
                      : "Download Document"}
                  </a>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center">
                  <img
                    src={file.base64}
                    alt="Document Full Preview"
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-lg transition-transform duration-200"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              {file.type !== "application/pdf" ? (
                <button
                  type="button"
                  onClick={onRotate}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19"
                    />
                  </svg>
                  {language === "hi"
                    ? "दस्तावेज़ घुमाएँ"
                    : language === "or"
                    ? "ଘୂର୍ଣ୍ଣନ କରନ୍ତୁ"
                    : "Rotate 90°"}
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
              >
                {language === "hi"
                  ? "बंद करें"
                  : language === "or"
                  ? "ବନ୍ଦ କରନ୍ତୁ"
                  : "Close"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
