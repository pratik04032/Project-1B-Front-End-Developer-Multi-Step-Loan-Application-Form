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
    if (saved === "hi" || saved === "or" || saved === "en") {
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
    const langDict = translations[language];
    if (key in langDict) {
      return (langDict as any)[key];
    }
    // Fallback to English
    const engDict = translations["en"];
    if (key in engDict) {
      return (engDict as any)[key];
    }
    return key;
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
