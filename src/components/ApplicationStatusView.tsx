import React from 'react';
import { CheckCircle2, Clock, XCircle, FileText, Printer, LifeBuoy, Mail, Phone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ApplicationStatusViewProps {
  referenceId: string;
  status: string | null;
  language: "en" | "hi" | "or";
  onPrint: () => void;
  onDownloadKFS: () => void;
}

export default function ApplicationStatusView({ referenceId, status, language, onPrint, onDownloadKFS }: ApplicationStatusViewProps) {
  const currentStatus = status || "UNDER_VERIFICATION";
  
  // Status Configuration
  const getStatusConfig = (s: string) => {
    switch(s.toUpperCase()) {
      case "APPROVED":
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
          color: "bg-emerald-50 border-emerald-200 text-emerald-800",
          title: language === "hi" ? "आवेदन स्वीकृत" : language === "or" ? "ଆବେଦନ ଅନୁମୋଦିତ" : "Application Approved",
          desc: language === "hi" ? "बधाई हो! आपका ऋण स्वीकृत हो गया है।" : language === "or" ? "ଆପଣଙ୍କର ଋଣ ଅନୁମୋଦିତ ହୋଇଛି |" : "Congratulations! Your loan has been approved.",
          progress: 100
        };
      case "REJECTED":
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: "bg-red-50 border-red-200 text-red-800",
          title: language === "hi" ? "आवेदन अस्वीकृत" : language === "or" ? "ଆବେଦନ ପ୍ରତ୍ୟାଖ୍ୟାନ" : "Application Rejected",
          desc: language === "hi" ? "क्षमा करें, आपका आवेदन हमारे मानदंडों को पूरा नहीं करता है।" : language === "or" ? "କ୍ଷମା କରିବେ, ଆପଣଙ୍କର ଆବେଦନ ଆମର ମାନଦଣ୍ଡ ପୂରଣ କରୁନାହିଁ |" : "We're sorry, your application did not meet our criteria.",
          progress: 100
        };
      case "PRE-APPROVED":
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-blue-500" />,
          color: "bg-blue-50 border-blue-200 text-blue-800",
          title: language === "hi" ? "पूर्व स्वीकृत" : language === "or" ? "ପୂର୍ବ ଅନୁମୋଦିତ" : "Pre-Approved",
          desc: language === "hi" ? "आप ऋण के लिए पूर्व-स्वीकृत हैं। अंतिम चरण लंबित।" : language === "or" ? "ଆପଣ ପୂର୍ବ-ଅନୁମୋଦିତ | ଅନ୍ତିମ ପର୍ଯ୍ୟାୟ ବାକି ଅଛି |" : "You are pre-approved. Final steps pending.",
          progress: 75
        };
      case "UNDER_VERIFICATION":
      default:
        return {
          icon: <Clock className="w-8 h-8 text-amber-500" />,
          color: "bg-amber-50 border-amber-200 text-amber-800",
          title: language === "hi" ? "सत्यापन के अधीन" : language === "or" ? "ଯାଞ୍ଚ ଅଧୀନରେ" : "Under Verification",
          desc: language === "hi" ? "हम आपके दस्तावेज़ों और विवरणों की समीक्षा कर रहे हैं।" : language === "or" ? "ଆମେ ଆପଣଙ୍କର ବିବରଣୀ ସମୀକ୍ଷା କରୁଛୁ |" : "We are currently reviewing your documents and details.",
          progress: 50
        };
    }
  };

  const config = getStatusConfig(currentStatus);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 my-8 animate-fadeIn" id="application-status-view">
      {/* Header Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `\${config.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full \${config.color.split(' ')[0].replace('bg-', 'bg-').replace('50', '500')}`}
          />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border \${config.color}`}>
            {config.icon}
          </div>
          
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{config.title}</h2>
            <p className="text-sm text-zinc-500">{config.desc}</p>
            
            <div className="mt-4 inline-flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                {language === "hi" ? "संदर्भ संख्या:" : language === "or" ? "ସନ୍ଦର୍ଭ ସଂଖ୍ୟା:" : "Ref ID:"}
              </span>
              <span className="font-mono text-sm font-semibold text-zinc-900">{referenceId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Support Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold border-b border-zinc-100 pb-3">
            <LifeBuoy className="w-4 h-4" />
            <h3>{language === "hi" ? "सहायता एवं संपर्क" : language === "or" ? "ସହାୟତା ଏବଂ ସମ୍ପର୍କ" : "Support & Contact"}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 font-medium">{language === "hi" ? "ईमेल समर्थन" : language === "or" ? "ଇମେଲ୍ ସମର୍ଥନ" : "Email Support"}</p>
                <a href="mailto:support@lendswift.com" className="text-sm text-zinc-900 hover:text-blue-600 transition-colors font-medium">support@lendswift.com</a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 font-medium">{language === "hi" ? "टोल-फ्री हेल्पडेस्क" : language === "or" ? "ଟୋଲ୍-ଫ୍ରି ହେଲ୍ପଡେସ୍କ" : "Toll-Free Helpdesk"}</p>
                <a href="tel:18001234567" className="text-sm text-zinc-900 hover:text-blue-600 transition-colors font-medium">1800-123-4567</a>
                <p className="text-[10px] text-zinc-400 mt-0.5">Mon-Sat, 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold border-b border-zinc-100 pb-3">
              <FileText className="w-4 h-4" />
              <h3>{language === "hi" ? "दस्तावेज़ एवं सारांश" : language === "or" ? "ଦଲିଲ ଏବଂ ସାରାଂଶ" : "Documents & Summary"}</h3>
            </div>
            
            <p className="text-xs text-zinc-500 leading-relaxed">
              {language === "hi"
                ? "आरबीआई डिजिटल लेंडिंग गाइडलाइन्स (सितंबर 2022) के अनुसार, आपकी अंतिम पुनर्भुगतान संरचना और शिकायतों के विवरण से युक्त एक प्रमुख तथ्य विवरण (KFS) जनरेट किया गया है।"
                : language === "or"
                ? "ଆରବିଆଇ ଡିଜିଟାଲ୍ ଋଣ ନିର୍ଦ୍ଦେଶାବଳୀ (ସେପ୍ଟେମ୍ବର ୨୦୨୨) ଅନୁଯାୟୀ ଏକ କି-ଫ୍ୟାକ୍ଟ ଷ୍ଟେଟମେଣ୍ଟ (KFS) ପ୍ରସ୍ତୁତ କରାଯାଇଛି |"
                : "As per the RBI Digital Lending Guidelines (September 2022), a Key Fact Statement (KFS) containing your repayment structure has been generated."}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onDownloadKFS}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "KFS डाउनलोड करें" : language === "or" ? "KFS ଡାଉନଲୋଡ୍ କରନ୍ତୁ" : "Download KFS (PDF)"}</span>
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-600" />
              <span>{language === "hi" ? "सारांश प्रिंट करें" : language === "or" ? "ସାରାଂଶ ପ୍ରିଣ୍ଟ୍ କରନ୍ତୁ" : "Print Application Summary"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
