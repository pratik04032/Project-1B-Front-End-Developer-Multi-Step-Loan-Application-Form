import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, AlertCircle, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CibilCheckerProps {
  onComplete: (score: number) => void;
}

export default function CibilChecker({ onComplete }: CibilCheckerProps) {
  const { t } = useLanguage();
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pan || !mobile) {
      setError('Please enter both PAN and Mobile Number');
      return;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      setError('Invalid PAN format (e.g. ABCDE1234F)');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Invalid Mobile Number');
      return;
    }
    if (!consent) {
      setError('Please provide consent to check your CIBIL score');
      return;
    }

    setError('');
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate random score between 600 and 850
      // For demonstration, deterministically generate based on PAN characters if possible, else random
      let seed = 0;
      for (let i = 0; i < pan.length; i++) {
        seed += pan.charCodeAt(i);
      }
      // Simple hash to score
      const generatedScore = 650 + (seed % 200); 
      setScore(generatedScore);
      setIsChecking(false);
    }, 2500);
  };

  if (score !== null) {
    const isGood = score >= 700;
    const isFair = score >= 650 && score < 700;
    
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
        >
          <div className={`p-8 text-center text-white ${isGood ? 'bg-emerald-600' : isFair ? 'bg-amber-500' : 'bg-red-500'}`}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{score}</h2>
            <p className="text-white/80 mt-1 font-medium">Your CIBIL Score</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-zinc-900">
                {isGood ? 'Excellent Profile!' : isFair ? 'Fair Profile' : 'Needs Improvement'}
              </h3>
              <p className="text-sm text-zinc-600">
                {isGood 
                  ? 'You are pre-approved for our best interest rates. Proceed to application.' 
                  : isFair 
                  ? 'You meet our minimum criteria. Some additional documentation may be required.' 
                  : 'Your score is below our standard threshold, but you may still apply with a co-applicant.'}
              </p>
            </div>
            
            <button
              onClick={() => onComplete(score)}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              Continue to Application
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Check Eligibility</h1>
          <p className="text-sm text-zinc-500">Checking your CIBIL score is soft and won't affect it.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8"
        >
          {isChecking ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-zinc-600 font-medium animate-pulse">Fetching your credit profile...</p>
            </div>
          ) : (
            <form onSubmit={handleCheck} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-lg px-4 py-2.5 text-sm uppercase transition-colors"
                  maxLength={10}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-lg pl-12 pr-4 py-2.5 text-sm transition-colors"
                    maxLength={10}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <div className="w-4 h-4 border-2 border-zinc-300 rounded transition-colors peer-checked:bg-zinc-900 peer-checked:border-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-zinc-900 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-zinc-500 leading-relaxed">
                  I consent to LendSwift fetching my credit information from CIBIL/Experian to check my loan eligibility.
                </span>
              </label>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2"
              >
                Check Eligibility
                <FileText className="w-4 h-4" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
