import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Check,
  Car,
  Bike,
  Home,
  Coffee,
  Key,
  Laptop,
  Sun,
  Moon,
  Umbrella,
  Dog,
  Heart,
  Camera,
  Leaf,
  ScanFace,
  Fingerprint,
  Smartphone
} from "lucide-react";
import { motion } from "motion/react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface LoginPortalProps {
  onLogin: (user: { email: string; role: "admin" | "applicant"; displayName?: string; uid?: string }) => void;
  language: string;
}

export default function AdminLoginPortal({ onLogin, language }: LoginPortalProps) {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Captcha State
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCaptchaVerifying, setIsCaptchaVerifying] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [captchaGrid, setCaptchaGrid] = useState<{ icon: any; category: string; id: number }[]>([]);
  const [targetCategory, setTargetCategory] = useState<string>("vehicles");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  // WebAuthn / FaceID State
  const [showWebAuthn, setShowWebAuthn] = useState(false);
  const [webAuthnStatus, setWebAuthnStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [pendingLogin, setPendingLogin] = useState<{ email: string; role: "admin" | "applicant"; displayName?: string; uid?: string } | null>(null);

  const generateCaptcha = () => {
    const pool = [
      { icon: Car, category: "vehicles" },
      { icon: Bike, category: "vehicles" },
      { icon: Home, category: "household" },
      { icon: Coffee, category: "household" },
      { icon: Key, category: "household" },
      { icon: Laptop, category: "household" },
      { icon: Sun, category: "sky" },
      { icon: Moon, category: "sky" },
      { icon: Umbrella, category: "sky" },
      { icon: Dog, category: "other" },
      { icon: Heart, category: "other" },
      { icon: Camera, category: "other" },
      { icon: Leaf, category: "other" },
    ];

    const categories = ["vehicles", "household", "sky"];
    const target = categories[Math.floor(Math.random() * categories.length)];
    setTargetCategory(target);

    const targetItems = pool.filter(p => p.category === target);
    const otherItems = pool.filter(p => p.category !== target);

    const shuffledTarget = [...targetItems].sort(() => Math.random() - 0.5);
    const targetCount = Math.floor(Math.random() * 2) + 3; // 3 or 4 targets
    const selectedTarget = shuffledTarget.slice(0, targetCount);

    const shuffledOther = [...otherItems].sort(() => Math.random() - 0.5);
    const selectedOther = shuffledOther.slice(0, 9 - targetCount);

    const finalGrid = [...selectedTarget, ...selectedOther]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        id: index
      }));

    setCaptchaGrid(finalGrid);
    setSelectedTiles([]);
    setCaptchaError(null);
  };

  const handleCaptchaClick = () => {
    if (isCaptchaVerified || isCaptchaVerifying) return;
    setIsCaptchaVerifying(true);
    setCaptchaError(null);
    setTimeout(() => {
      setIsCaptchaVerifying(false);
      generateCaptcha();
      setShowChallenge(true);
    }, 1000);
  };

  const toggleTile = (index: number) => {
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter(idx => idx !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const handleCaptchaVerify = () => {
    const targetIndices = captchaGrid
      .map((item, idx) => (item.category === targetCategory ? idx : -1))
      .filter(idx => idx !== -1);

    const isCorrect =
      targetIndices.length === selectedTiles.length &&
      targetIndices.every(idx => selectedTiles.includes(idx));

    if (isCorrect) {
      setIsCaptchaVerified(true);
      setShowChallenge(false);
      setCaptchaError(null);
    } else {
      setCaptchaError(
        language === "hi"
          ? "गलत चयन। कृपया पुनः प्रयास करें।"
          : language === "or"
          ? "ଭୁଲ୍ ଚୟନ। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।"
          : "Incorrect selection. Please try again."
      );
      setTimeout(() => {
        generateCaptcha();
      }, 1200);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "vehicles":
        return language === "hi" ? "वाहनों (Vehicles)" : language === "or" ? "ଯାନବାହନ (Vehicles)" : "vehicles";
      case "household":
        return language === "hi" ? "घरेलू उपकरणों/वस्तुओं (Household items)" : language === "or" ? "ଘରୋଇ ସାମଗ୍ରୀ (Household items)" : "household items";
      case "sky":
        return language === "hi" ? "आसमान/मौसम से संबंधित वस्तुओं (Sky/Weather items)" : language === "or" ? "ଆକାଶ/ପାଣିପାଗ ସମ୍ବନ୍ଧୀୟ (Sky/Weather items)" : "sky/weather items";
      default:
        return cat;
    }
  };

  const triggerWebAuthn = (userPayload: { email: string; role: "admin" | "applicant"; displayName?: string; uid?: string }) => {
    setPendingLogin(userPayload);
    setShowWebAuthn(true);
    setWebAuthnStatus("scanning");
    
    // Simulate WebAuthn process
    setTimeout(() => {
      setWebAuthnStatus("success");
      setTimeout(() => {
        onLogin(userPayload);
        setShowWebAuthn(false);
      }, 1000);
    }, 2500);
  };

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
        triggerWebAuthn({
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

    if (!isCaptchaVerified) {
      setError(
        language === "hi"
          ? "कृपया 'मैं रोबोट नहीं हूँ' सत्यापन पूरा करें।"
          : language === "or"
          ? "ଦୟାକରି 'ମୁଁ ରୋବର୍ଟ ନୁହେଁ' ଯାଞ୍ଚ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।"
          : "Please complete the 'I'm not a robot' verification."
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (true) {
        if (email.trim().toLowerCase() === "admin@lendswift.com" && password === "admin123") {
          triggerWebAuthn({ email: email.trim(), role: "admin" });
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
          triggerWebAuthn({ email: email.trim().toLowerCase(), role: "applicant" });
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
                "Admin Email Address"
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@lendswift.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-sans transition-all"
                />
              </div>
            </div>

            {/* Password field (Admin only) */}
            
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
          </div>

          {/* Captcha Verification */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-center justify-between shadow-2xs select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isCaptchaVerified || isCaptchaVerifying}
                onClick={handleCaptchaClick}
                className={`h-6 w-6 rounded border transition-all flex items-center justify-center cursor-pointer ${
                  isCaptchaVerified
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCaptchaVerifying
                    ? "border-zinc-300"
                    : "border-zinc-300 bg-white hover:border-zinc-400"
                }`}
                id="captcha-checkbox-btn"
              >
                {isCaptchaVerified ? (
                  <Check className="h-4 w-4 stroke-[3px]" />
                ) : isCaptchaVerifying ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-zinc-500 border-t-transparent rounded-full"></span>
                ) : null}
              </button>
              <span className="text-xs font-semibold text-zinc-700">
                {language === "hi"
                  ? "मैं रोबोट नहीं हूँ"
                  : language === "or"
                  ? "ମୁଁ ରୋବର୍ଟ ନୁହେଁ"
                  : "I'm not a robot"}
              </span>
            </div>
            
            <div className="flex flex-col items-end opacity-75">
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                <ShieldAlert className="h-3 w-3 text-zinc-500" />
                <span>reCAPTCHA</span>
              </div>
              <span className="text-[7px] text-zinc-400 font-medium">Privacy • Terms</span>
            </div>
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
                  {true
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
            </div>
        </form>
      </div>

      {/* Captcha Challenge Modal */}
      {showChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="captcha-modal-overlay">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-[340px] rounded-xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col transition-all"
            id="captcha-modal-card"
          >
            {/* Modal Header */}
            <div className="bg-blue-600 p-5 text-white space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
                {language === "hi"
                  ? "सत्यापन आवश्यक है"
                  : language === "or"
                  ? "ଯାଞ୍ଚ ଆବଶ୍ୟକ"
                  : "Verification Required"}
              </p>
              <h3 className="text-sm font-semibold leading-snug">
                {language === "hi" ? "सभी बक्से चुनें जिनमें" : language === "or" ? "ସମସ୍ତ ଚଉକି ଚୟନ କରନ୍ତୁ ଯେଉଁଥିରେ" : "Select all squares with"}
              </h3>
              <p className="text-lg font-extrabold tracking-tight underline decoration-2 underline-offset-2">
                {getCategoryLabel(targetCategory)}
              </p>
            </div>

            {/* Error Message */}
            {captchaError && (
              <div className="bg-red-50 border-y border-red-100 text-red-600 text-xs text-center py-2 px-3 font-semibold animate-pulse">
                {captchaError}
              </div>
            )}

            {/* 3x3 Grid */}
            <div className="p-3 bg-zinc-100 grid grid-cols-3 gap-1.5" id="captcha-grid-container">
              {captchaGrid.map((item, index) => {
                const IconComp = item.icon;
                const isSelected = selectedTiles.includes(index);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTile(index)}
                    className={`aspect-square bg-white border-2 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer group ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-100 scale-95"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <IconComp
                      className={`h-8 w-8 transition-all ${
                        isSelected ? "text-blue-600" : "text-zinc-600 group-hover:text-zinc-800"
                      }`}
                    />
                    
                    {/* Selected Indicator Checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm scale-110 animate-fadeIn">
                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                  title="Refresh Challenge"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => alert(language === "hi" ? "लक्ष्य श्रेणी से मेल खाने वाले सभी चित्रों का चयन करें और फिर सत्यापित करें पर क्लिक करें।" : language === "or" ? "ଲକ୍ଷ୍ୟ ଶ୍ରେଣୀ ସହ ମେଳ ଖାଉଥିବା ସମସ୍ତ ଚିତ୍ର ଚୟନ କରନ୍ତୁ ଏବଂ ଯାଞ୍ଚ କରନ୍ତୁ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ।" : "Select all images that match the specified target category, then click Verify.")}
                  className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                  title="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChallenge(false);
                    setIsCaptchaVerifying(false);
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-all cursor-pointer"
                >
                  {language === "hi" ? "रद्द करें" : language === "or" ? "ବାତିଲ୍" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleCaptchaVerify}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-md shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  {language === "hi" ? "सत्यापित करें" : language === "or" ? "ଯାଞ୍ଚ କରନ୍ତୁ" : "Verify"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* WebAuthn / FaceID Modal */}
      {showWebAuthn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 w-full max-w-[320px] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center p-8 relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#3f3f46,transparent)] opacity-30"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-6 w-full">
              {/* Animated Icon Container */}
              <div className="relative h-24 w-24 flex items-center justify-center">
                {webAuthnStatus === "scanning" && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                    />
                    <ScanFace className="h-14 w-14 text-blue-400 animate-pulse" />
                    {/* Scanning line animation */}
                    <motion.div
                      initial={{ top: "10%" }}
                      animate={{ top: "90%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute left-[20%] right-[20%] h-0.5 bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.6)] z-20"
                    />
                  </>
                )}
                {webAuthnStatus === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_5px_rgba(16,185,129,0.3)]"
                  >
                    <Check className="h-8 w-8 stroke-[3px]" />
                  </motion.div>
                )}
              </div>

              {/* Status Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {webAuthnStatus === "scanning" && (
                    language === "hi" ? "चेहरे की पहचान..." : language === "or" ? "ଚେହେରା ଚିହ୍ନଟ..." : "FaceID Verification"
                  )}
                  {webAuthnStatus === "success" && (
                    language === "hi" ? "सत्यापित!" : language === "or" ? "ଯାଞ୍ଚ ହୋଇଛି!" : "Verified!"
                  )}
                </h3>
                <p className="text-xs font-medium text-zinc-400">
                  {webAuthnStatus === "scanning" && (
                    language === "hi" ? "सुरक्षित रूप से अपनी पहचान की पुष्टि करें।" : language === "or" ? "ସୁରକ୍ଷିତ ଭାବରେ ଆପଣଙ୍କ ପରିଚୟ ଯାଞ୍ଚ କରନ୍ତୁ |" : "Confirming your identity securely."
                  )}
                  {webAuthnStatus === "success" && (
                    language === "hi" ? "लॉगिन सफल। रीडायरेक्ट कर रहा है..." : language === "or" ? "ଲଗଇନ୍ ସଫଳ ହେଲା। ରିଡାଇରେକ୍ଟ କରାଯାଉଛି..." : "Login successful. Redirecting..."
                  )}
                </p>
              </div>

              {/* Simulated Device Frame indicator */}
              <div className="mt-2 text-[10px] text-zinc-500 font-medium uppercase tracking-widest flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner">
                <Smartphone className="h-3 w-3" />
                <span>WebAuthn</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
