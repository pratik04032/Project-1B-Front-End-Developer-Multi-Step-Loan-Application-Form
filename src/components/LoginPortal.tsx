import React, { useState } from "react";
import { ShieldAlert, Users, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface LoginPortalProps {
  onLogin: (user: { email: string; role: "admin" | "applicant"; displayName?: string; uid?: string }) => void;
  language: string;
}

export default function LoginPortal({ onLogin, language }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<"applicant" | "admin">("applicant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user && user.email) {
        const email = user.email.toLowerCase();
        // Identify if the logged-in email is the admin bootstrapped email
        const isAdmin = email === "pratikkumarjena04@gmail.com" || email === "admin@lendswift.com";
        onLogin({
          email,
          role: isAdmin ? "admin" : "applicant",
          displayName: user.displayName || undefined,
          uid: user.uid
        });
      }
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      setError(
        err.message?.includes("popup-closed-by-user")
          ? "Sign-in popup closed before completion."
          : "Google authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (activeTab === "admin") {
        if (email.trim().toLowerCase() === "admin@lendswift.com" && password === "admin123") {
          onLogin({ email: email.trim(), role: "admin" });
        } else {
          setError(
            language === "hi"
              ? "अमान्य क्रेडेंशियल्स। कृपया admin@lendswift.com और पासवर्ड admin123 का उपयोग करें।"
              : language === "or"
              ? "ଅମାନ୍ୟ କ୍ରେଡେନ୍ସିଆଲ୍ | ଦୟାକରି admin@lendswift.com ଏବଂ ପାସୱାର୍ଡ admin123 ବ୍ୟବହାର କରନ୍ତୁ |"
              : "Invalid administrator credentials. Please use admin@lendswift.com & password admin123"
          );
        }
      } else {
        // Applicant Login
        if (!email.trim() || !email.includes("@")) {
          setError(
            language === "hi"
              ? "कृपया एक वैध ईमेल पता दर्ज करें।"
              : language === "or"
              ? "ଦୟାକରି ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ |"
              : "Please enter a valid email address."
          );
        } else {
          onLogin({ email: email.trim().toLowerCase(), role: "applicant" });
        }
      }
      setIsLoading(false);
    }, 600);
  };

  const quickFillApplicant = () => {
    setEmail("applicant@lendswift.com");
    setError(null);
  };

  const quickFillAdmin = () => {
    setEmail("admin@lendswift.com");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-8 animate-fadeIn" id="login-portal-container">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
        
        {/* Portal Header */}
        <div className="bg-zinc-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#27272a,transparent)] opacity-70"></div>
          <div className="relative z-10 space-y-2">
            <div className="h-10 w-10 rounded bg-white text-zinc-950 flex items-center justify-center font-bold text-lg tracking-wider mx-auto shadow-md">
              U
            </div>
            <h2 className="text-xl font-semibold tracking-tight">UtkalCred Secure Gateway</h2>
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-medium">
              {language === "hi"
                ? "डिजिटल ऋण और सत्यापन हब"
                : language === "or"
                ? "ଡିଜିଟାଲ୍ ଋଣ ଏବଂ ଯାଞ୍ଚ ହବ୍"
                : "Digital Lending & Verification Hub"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("applicant");
              setEmail("");
              setPassword("");
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "applicant"
                ? "bg-white text-zinc-950 shadow-2xs border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              {language === "hi" ? "ऋण आवेदक" : language === "or" ? "ଋଣ ଆବେଦନକାରୀ" : "Loan Applicant"}
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setEmail("");
              setPassword("");
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "admin"
                ? "bg-white text-zinc-950 shadow-2xs border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>
              {language === "hi" ? "प्रशासक पोर्टल" : language === "or" ? "ପ୍ରଶାସକ ପୋର୍ଟାଲ୍" : "Admin Portal"}
            </span>
          </button>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-3 rounded-lg flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium leading-normal">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                {activeTab === "admin" ? "Admin Email Address" : "Applicant Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={activeTab === "admin" ? "admin@lendswift.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-sans transition-all"
                />
              </div>
            </div>

            {/* Password field (Admin only) */}
            {activeTab === "admin" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                    Administrator Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-sans transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                <span>
                  {language === "hi" ? "सत्यापित किया जा रहा है..." : language === "or" ? "ଯାଞ୍ଚ କରାଯାଉଛି..." : "Authenticating..."}
                </span>
              </>
            ) : (
              <>
                <span>
                  {activeTab === "admin"
                    ? language === "hi"
                      ? "एडमिन के रूप में लॉग इन करें"
                      : language === "or"
                      ? "ଏଡମିନ ଭାବରେ ଲଗଇନ୍ କରନ୍ତୁ"
                      : "Access Admin Dashboard"
                    : language === "hi"
                    ? "ऋण आवेदन शुरू / जारी रखें"
                    : language === "or"
                    ? "ଋଣ ଆବେଦନ ଆରମ୍ଭ / ଜାରି ରଖନ୍ତୁ"
                    : "Start or Resume Application"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* OR separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-150"></div>
            <span className="flex-shrink mx-4 text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
              {language === "hi" ? "या सुरक्षित लॉगिन" : language === "or" ? "କିମ୍ବା ସୁରକ୍ଷିତ ଲଗଇନ୍" : "Or Secure OAuth"}
            </span>
            <div className="flex-grow border-t border-zinc-150"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-bold py-2.5 px-4 border border-zinc-300 rounded-lg shadow-2xs hover:shadow-xs transition-all text-xs flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.77,17,12,17c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.47,0,2.81,0.53,3.86,1.4l2.02-2.02C16.14,2.94,14.2,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.8,0,8.45-3.38,8.45-8.45A6.9,6.9,0,0,0,21.35,11.1Z" fill="#4285F4"/>
            </svg>
            <span>
              {language === "hi" ? "गूगल के साथ साइन इन करें" : language === "or" ? "ଗୁଗଲ୍ ସହିତ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ" : "Sign in with Google"}
            </span>
          </button>

          {/* Quick-Fill Helper Block */}
          <div className="border-t border-zinc-100 pt-5 space-y-2 text-center">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
              {language === "hi" ? "मूल्यांकन के लिए त्वरित क्रेडेंशियल्स" : language === "or" ? "ମୂଲ୍ୟାଙ୍କନ ପାଇଁ ତ୍ୱରିତ କ୍ରେଡେନ୍ସିଆଲ୍" : "Evaluation Fast-Track Controls"}
            </span>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {activeTab === "applicant" ? (
                <button
                  type="button"
                  onClick={quickFillApplicant}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-[10px] font-semibold rounded border border-zinc-200 transition-all cursor-pointer"
                >
                  Fill Applicant Credential
                </button>
              ) : (
                <button
                  type="button"
                  onClick={quickFillAdmin}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-[10px] font-semibold rounded border border-zinc-200 transition-all cursor-pointer"
                >
                  Fill Admin Credential
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
