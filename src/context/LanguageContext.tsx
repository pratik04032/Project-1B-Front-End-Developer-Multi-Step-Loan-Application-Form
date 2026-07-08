import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, LANGUAGES, LanguageConfig } from "../utils/translations";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Load initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("preferred_language");
    if (["en", "hi", "or", "bn", "te", "ta", "mr"].includes(saved || "")) {
      return saved as Language;
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  // Translation function with fallback
  const t = (key: string): string => {
    const langDict = (translations as any)[language];
    if (langDict && key in langDict) {
      return langDict[key];
    }
    // Fallback to English
    const engDict = (translations as any)["en"];
    let englishText = key;
    if (engDict && key in engDict) {
      englishText = engDict[key];
    }
    
    // If not English and we don't have a translation, show placeholder prefix
    if (language !== "en") {
      // For testing/placeholder purposes, prefix the string with language code
      return `[${language.toUpperCase()}] ${englishText}`;
    }
    return englishText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
